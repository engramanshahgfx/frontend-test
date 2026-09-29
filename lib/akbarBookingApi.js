/**
 * akbar Booking API Client
 * 
 * Single source of truth for all akbar booking API calls.
 * This connects frontend to backend unified booking flow.
 * 
 * Flow: Search → Select → Passengers → Payment → Confirm → Ticket
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Store auth token (get from login)
let authToken = null;

/** The one canonical storage key for the Sanctum / guest token. */
export const AUTH_TOKEN_KEY = 'auth_token';

/**
 * Companion key recording WHAT KIND of session the token represents.
 *
 * Without it a token is just an opaque string and every caller has to guess. That guess was wrong
 * and cost a booking: see `isAuthenticated()` below.
 */
export const AUTH_SCOPE_KEY = 'auth_token_scope';

/**
 * Diagnostic logging, opt-in via NEXT_PUBLIC_DEBUG_AUTH=1.
 *
 * Rationale: this incident was diagnosed three times from symptoms alone because nothing recorded
 * what the browser actually sent. With the flag on, every token write, every scope read and every
 * outgoing Authorization header is printed, so the next report contains the sent pair (token +
 * order_reference) instead of needing another round trip.
 *
 * Only a token TAIL is printed, never the whole credential, and the flag must be absent in
 * production.
 */
export const DEBUG_AUTH = typeof process !== 'undefined'
  && !!process.env
  && process.env.NEXT_PUBLIC_DEBUG_AUTH === '1';

/** Tail of a token, safe to log and sufficient to tell two tokens apart. */
export const tokenTail = (token) => (typeof token === 'string' && token ? token.slice(-8) : null);

const authDebug = (event, details = {}) => {
  if (!DEBUG_AUTH || typeof console === 'undefined') return;
  console.log(`[auth] ${event}`, details);
};

/** A real signed-in customer's session. */
export const SCOPE_ACCOUNT = 'account';

/** A token minted by start-guest, valid for exactly ONE booking reference. */
export const SCOPE_GUEST = 'guest';

/**
 * Persist a session token.
 *
 * @param {string} token
 * @param {'account'|'guest'} [scope] Omit to infer: re-setting the SAME token preserves its
 *   existing scope (a boot-time rehydrate must not relabel a guest session as an account one),
 *   while a NEW token defaults to an account session — which is correct for login/register, the
 *   only places that introduce an account token.
 */
export const setAuthToken = (token, scope) => {
  authToken = token;

  if (typeof window === 'undefined') return;

  const previousToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const resolved = scope || (previousToken === token ? getTokenScope() : SCOPE_ACCOUNT);

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_SCOPE_KEY, resolved === SCOPE_GUEST ? SCOPE_GUEST : SCOPE_ACCOUNT);

  authDebug('setAuthToken', {
    tokenTail: tokenTail(token),
    requestedScope: scope || null,
    resolvedScope: resolved === SCOPE_GUEST ? SCOPE_GUEST : SCOPE_ACCOUNT,
    previousTokenReplaced: previousToken !== null && previousToken !== token,
  });
};

/** Drop the session token and its scope (logout). */
export const clearAuthToken = () => {
  authToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_SCOPE_KEY);
  }
};

/**
 * Get authentication token.
 *
 * `auth_token` is the ONLY canonical key. Older builds wrote `authToken` and `token`; those are
 * migrated on read so an in-flight session is not silently logged out.
 */
export const getAuthToken = () => {
  if (authToken) return authToken;
  if (typeof window === 'undefined') return null;

  const canonical = localStorage.getItem(AUTH_TOKEN_KEY);
  if (canonical) return canonical;

  for (const legacyKey of ['authToken', 'token']) {
    const value = localStorage.getItem(legacyKey);
    if (value) {
      localStorage.setItem(AUTH_TOKEN_KEY, value);
      localStorage.removeItem(legacyKey);
      return value;
    }
  }

  return null;
};

/**
 * The scope of the stored token, defaulting to `account`.
 *
 * Backwards compatibility: a token written before scope tagging existed has no companion key. Those
 * are treated as account sessions so an already signed-in customer is never logged out. Development
 * logs a warning so the situation is visible rather than silent.
 */
export const getTokenScope = () => {
  if (typeof window === 'undefined') return SCOPE_ACCOUNT;

  const scope = localStorage.getItem(AUTH_SCOPE_KEY);
  if (scope === SCOPE_GUEST) return SCOPE_GUEST;
  if (scope === SCOPE_ACCOUNT) return SCOPE_ACCOUNT;

  authDebug('getTokenScope:fallback', {
    tokenTail: tokenTail(localStorage.getItem(AUTH_TOKEN_KEY)),
    rawScope: scope,
  });

  if (localStorage.getItem(AUTH_TOKEN_KEY) && process.env.NODE_ENV !== 'production') {
    console.warn(
      '[auth] Found auth_token without auth_token_scope. Assuming an account session. ' +
      'This is a legacy token from a build that predates scope tagging; a guest token in this ' +
      'state will route the next booking to /bookings/start (which issues no token) and can ' +
      'produce 403 BOOKING_SCOPE_FORBIDDEN. Starting a new guest booking re-tags it correctly.'
    );
  }

  return SCOPE_ACCOUNT;
};

/** True when the stored token is scoped to a single booking rather than to an account. */
export const isGuestBookingToken = () => getTokenScope() === SCOPE_GUEST;

/**
 * The session as a single atomic value, so callers can never read a token and its scope at
 * different moments and disagree about what they mean.
 *
 * @returns {{token: string, scope: string, isGuest: boolean}|null}
 */
export const getAuthSession = () => {
  const token = getAuthToken();
  return token ? { token, scope: getTokenScope(), isGuest: isGuestBookingToken() } : null;
};

/**
 * True only for a REAL ACCOUNT SESSION — never for a booking-scoped guest token.
 *
 * WHY THIS MATTERS (the "016/019" incident):
 *
 * start-guest mints a token whose abilities are exactly ['booking:<ref>'] — it can complete and pay
 * for one booking and nothing else. Because this function previously tested only "is a token
 * present", that guest token satisfied it. The next booking therefore took the authenticated
 * branch and POSTed /bookings/start, an endpoint that creates a booking but issues NO token. The
 * previous booking's token stayed in localStorage, and the following add-passengers sent it with
 * the new reference:
 *
 *   403 BOOKING_SCOPE_FORBIDDEN
 *   token_abilities:           ["booking:TLR 100 012 016"]
 *   requested_order_reference: "TLR 100 012 019"
 *
 * Both belonged to the same user and the reference existed, which is why it was a 403 and not a
 * 404. A guest is not an account; this predicate now says so, and every endpoint choice inherits
 * the fix.
 */
export const isAuthenticated = () => {
  if (!getAuthToken()) return false;

  return !isGuestBookingToken();
};

/**
 * Generate an idempotency key for a state-changing request.
 *
 * The API rejects mutations that arrive without one, and reusing a key returns the original
 * response instead of performing the action twice. Generate once per user action and reuse it
 * across retries.
 */
export const newIdempotencyKey = (prefix = 'idem') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const idempotencyKey = newIdempotencyKey;

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Make an API request.
 *
 * Mutating requests ALWAYS carry an Idempotency-Key. Pass `idempotencyKey` explicitly to make a
 * retry safe: the same key returns the first response rather than repeating the action.
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const method = (options.method || 'GET').toUpperCase();

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(MUTATING_METHODS.includes(method) && {
      'Idempotency-Key': options.idempotencyKey || idempotencyKey('idem'),
    }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    method,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    // The API answers { success:false, error:{ code, message } }. Surface the human message
    // instead of stringifying the error object.
    const apiError = data?.error;
    const message =
      (apiError && typeof apiError === 'object' && apiError.message) ||
      (typeof apiError === 'string' && apiError) ||
      data?.message ||
      `Request failed (${response.status})`;

    const error = new Error(message);
    error.status = response.status;
    error.code = (apiError && typeof apiError === 'object' && apiError.code) || null;

    // A booking-scoped token the server rejects can never succeed on retry: the reference in play
    // is not the one the token was minted for. Drop it so the next attempt starts a clean guest
    // booking instead of repeating the same 403 forever.
    if (error.code === 'BOOKING_SCOPE_FORBIDDEN' || response.status === 403) {
      clearAuthToken();
    }

    throw error;
  }

  return data;
};

// ============================================================================
// STEP 1: SEARCH FLIGHTS (Public - no auth needed)
// ============================================================================

/**
 * Search for available flights
 * 
 * @param {Object} params - Search parameters
 * @param {string} params.origin - Origin airport code (e.g., "RUH")
 * @param {string} params.destination - Destination airport code (e.g., "JED")
 * @param {string} params.departureDate - Departure date (YYYY-MM-DD)
 * @param {string} [params.returnDate] - Return date for round trip
 * @param {number} [params.adults=1] - Number of adult passengers
 * @param {number} [params.children=0] - Number of child passengers
 * @param {number} [params.infants=0] - Number of infant passengers
 * @param {string} [params.cabinClass='economy'] - Cabin class
 * @returns {Promise<Object>} - Flight offers
 */
export const searchFlights = async (params) => {
  // Use test endpoint for local development
  const isTestMode = process.env.NEXT_PUBLIC_akbar_TEST_MODE === 'true';
  const endpoint = isTestMode
    ? '/local-test/akbar/search'  // Mock API for testing
    : '/akbar/flights/available-offers';  // Real akbar API

  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      origin: params.origin,
      destination: params.destination,
      departure_date: params.departureDate,
      return_date: params.returnDate,
      adults: params.adults || 1,
      children: params.children || 0,
      infants: params.infants || 0,
      cabin_class: params.cabinClass || 'economy',
    }),
  });
};

// ============================================================================
// STEP 2: GET BUNDLES/FARE OPTIONS (Public)
// ============================================================================

/**
 * Get available bundles/fares for a flight offer
 * 
 * @param {string} offerId - The offer ID from search results
 * @returns {Promise<Object>} - Available bundles
 */
export const getFlightBundles = async (offerId) => {
  const isTestMode = process.env.NEXT_PUBLIC_akbar_TEST_MODE === 'true';
  const endpoint = isTestMode
    ? `/local-test/akbar/bundles/${offerId}`
    : `/akbar/flights/bundle-options`;

  if (isTestMode) {
    return apiRequest(endpoint, { method: 'GET' });
  }

  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify({ offer_id: offerId }),
  });
};

// ============================================================================
// STEP 3: START BOOKING
// ============================================================================

/**
 * Start a booking as an AUTHENTICATED customer (requires a Bearer token).
 *
 * Guests cannot use this: the route is behind auth:sanctum and answers 401. Use
 * {@link startGuestBooking} or {@link startBookingForCustomer} instead.
 *
 * @param {string} offerId - Selected offer ID
 * @param {Object} flightData - Flight details to store
 * @param {Object} [options] - { idempotencyKey }
 * @returns {Promise<Object>} - Booking reference and details
 */
export const startBooking = async (offerId, flightData, options = {}) => {
  return apiRequest('/v2/akbar/bookings/start', {
    method: 'POST',
    idempotencyKey: options.idempotencyKey,
    body: JSON.stringify({
      offer_id: offerId,
      flight_data: flightData,
    }),
  });
};

/**
 * Start a booking for an ANONYMOUS customer.
 *
 * Creates a guest account, opens a booking against it and returns a token scoped to that one
 * booking. The token is stored as the session token so the rest of the flow is authorised.
 *
 * @param {string} offerId - Selected offer ID
 * @param {Object} contact - { email, firstName, lastName, mobile }
 * @param {Object} [options] - { idempotencyKey }
 * @returns {Promise<Object>} - order_reference, booking_status, token, expires_at
 */
export const startGuestBooking = async (offerId, contact = {}, options = {}) => {
  const data = await apiRequest('/v2/akbar/bookings/start-guest', {
    method: 'POST',
    idempotencyKey: options.idempotencyKey,
    body: JSON.stringify({
      offer_id: offerId,
      email: contact.email,
      first_name: contact.firstName || contact.first_name,
      last_name: contact.lastName || contact.last_name,
      mobile: contact.mobile || contact.phone,
    }),
  });

  const token = data?.data?.token || data?.token;

  if (token) {
    // Scoped to this one booking: it must never be mistaken for an account session.
    setAuthToken(token, SCOPE_GUEST);
  }

  return data;
};

/**
 * Start a booking for whoever is using the site.
 *
 * Authenticated customers use /bookings/start with their Bearer token; everyone else uses
 * /bookings/start-guest and continues with the booking-scoped token that returns.
 */
export const startBookingForCustomer = async (offerId, flightData, contact = {}, options = {}) => {
  if (isAuthenticated()) {
    return startBooking(offerId, flightData, options);
  }

  return startGuestBooking(offerId, contact, options);
};

// ============================================================================
// STEP 4: ADD PASSENGERS (Protected)
// ============================================================================

/**
 * Add passengers to booking
 * Handles deduplication - same passenger won't be added twice
 * 
 * @param {string} orderReference - Booking reference from startBooking
 * @param {Array} passengers - Array of passenger objects
 * @returns {Promise<Object>} - Updated booking with passengers
 * 
 * Passenger object structure:
 * {
 *   type: 'ADT' | 'CHD' | 'INF',
 *   title: 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Master',
 *   first_name: string,
 *   middle_name?: string,
 *   last_name: string,
 *   birth_date: 'YYYY-MM-DD',
 *   nationality: string (country code),
 *   email?: string,
 *   phone?: string,
 *   document_type: 'passport' | 'national_id',
 *   document_number: string,
 *   document_expiry: 'YYYY-MM-DD',
 *   document_country: string (country code),
 * }
 */
export const addPassengers = async (orderReference, passengers, options = {}) => {
  return apiRequest('/v2/akbar/bookings/passengers', {
    method: 'POST',
    idempotencyKey: options.idempotencyKey,
    body: JSON.stringify({
      order_reference: orderReference,
      passengers: passengers,
    }),
  });
};

// ============================================================================
// STEP 5: HOLD FLIGHT (Optional - Protected)
// ============================================================================

/**
 * Hold the flight (optional step before payment)
 * Reserves the flight for a limited time
 * 
 * @param {string} orderReference - Booking reference
 * @returns {Promise<Object>} - Hold confirmation with expiry time
 */
export const holdFlight = async (orderReference, options = {}) => {
  return apiRequest('/v2/akbar/bookings/hold', {
    method: 'POST',
    idempotencyKey: options.idempotencyKey,
    body: JSON.stringify({
      order_reference: orderReference,
    }),
  });
};

// ============================================================================
// STEP 6: PAY + TICKET
// ============================================================================
//
// The backend has ONE ticketing operation: POST /v2/akbar/bookings/{ref}/pay
// (aliased as POST /v2/akbar/bookings/{ref}/confirm). It verifies the payment with the gateway
// and issues the ticket. A `payment_id` that the gateway can confirm is REQUIRED — client-supplied
// `status`, `card_token` or `card_last_4` are ignored, and there is no separate issue-ticket route.

/**
 * Ticketing entry point. Verifies payment and issues the e-ticket.
 *
 * @param {string} orderReference - Booking reference
 * @param {string} paymentId - Gateway payment id (Moyasar). Required.
 * @param {Object} [options] - { idempotencyKey }
 * @returns {Promise<Object>} - Ticketing result (booking_status, airline_pnr, ticket_numbers)
 */
export const ticketing = async (orderReference, paymentId, options = {}) => {
  return apiRequest(`/v2/akbar/bookings/${encodeURIComponent(orderReference)}/pay`, {
    method: 'POST',
    idempotencyKey: options.idempotencyKey,
    body: JSON.stringify({
      order_reference: orderReference,
      payment_id: paymentId,
    }),
  });
};

/**
 * Confirm the booking after payment.
 *
 * Same server-side handler as {@link ticketing}; kept because existing call sites use this name.
 * Previously posted to `/bookings/confirm`, which is NOT a route (404).
 */
export const confirmBooking = async (orderReference, paymentId, options = {}) => {
  return apiRequest(`/v2/akbar/bookings/${encodeURIComponent(orderReference)}/confirm`, {
    method: 'POST',
    idempotencyKey: options.idempotencyKey,
    body: JSON.stringify({
      order_reference: orderReference,
      payment_id: paymentId,
    }),
  });
};

/**
 * Issue the e-ticket.
 *
 * Alias of {@link ticketing}. Previously posted to `/bookings/issue-ticket`, which is NOT a
 * route (404) — ticketing happens inside the pay/confirm handler.
 */
export const issueTicket = async (orderReference, paymentId, options = {}) => {
  return ticketing(orderReference, paymentId, options);
};

/**
 * Record a payment and ticket the booking.
 *
 * The legacy shape sent `payment_method` / `card_token` / `amount`, all of which the backend
 * ignores; only a gateway-verifiable `payment_id` is accepted.
 */
export const processPayment = async (orderReference, paymentData = {}, options = {}) => {
  const paymentId = paymentData.paymentId || paymentData.payment_id || paymentData.id;

  if (!paymentId) {
    // Fail loudly rather than sending a body the backend will reject as unverifiable.
    const error = new Error('A verified payment id is required before a booking can be ticketed.');
    error.status = 422;
    error.code = 'PAYMENT_ID_REQUIRED';
    throw error;
  }

  return ticketing(orderReference, paymentId, options);
};

// ============================================================================
// UTILITY: GET BOOKING DETAILS (Protected)
// ============================================================================

/**
 * Get booking details by reference
 * 
 * @param {string} orderReference - Booking reference
 * @returns {Promise<Object>} - Full booking details
 */
export const getBookingDetails = async (orderReference) => {
  return apiRequest(`/v2/akbar/bookings/${orderReference}`, {
    method: 'GET',
  });
};

// ============================================================================
// UTILITY: LIST USER BOOKINGS (Protected)
// ============================================================================

/**
 * Get all bookings for current user
 * 
 * @param {Object} [params] - Filter parameters
 * @returns {Promise<Object>} - List of bookings
 */
export const listBookings = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/v2/akbar/bookings${queryString ? '?' + queryString : ''}`, {
    method: 'GET',
  });
};

// ============================================================================
// CANCELLATION
// ============================================================================
//
// Cancellation is NOT a customer-facing capability. It releases the seat with the airline and
// moves money, so the API only accepts it from an authenticated administrator: guests receive
// 401 and signed-in customers (including guest booking tokens) receive 403.
//
// Customers may only REQUEST a cancellation. Use `requestCancellation()` for that.

/**
 * Ask support to cancel a booking.
 *
 * Records a cancellation request and emails the support team. It does NOT cancel the booking,
 * cancel with the airline, change the booking/payment status or issue a refund — support
 * decides and performs the cancellation.
 *
 * @param {string} orderReference - Booking reference
 * @param {string} reason - Why the customer wants to cancel (required)
 * @returns {Promise<Object>} - e.g. { success: true, data: { status: 'SUBMITTED' }, cancelled: false }
 */
export const requestCancellation = async (orderReference, reason) => {
  return apiRequest(`/v2/akbar/bookings/${encodeURIComponent(orderReference)}/cancellation-request`, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey('idem-cancel-request') },
    body: JSON.stringify({ reason }),
  });
};

/**
 * Cancel a booking and refund it. ADMIN / SUPPORT ONLY.
 *
 * Do not wire this to a customer screen. A non-admin token is rejected with 403.
 *
 * @param {string} orderReference - Booking reference
 * @param {string} [reason] - Cancellation reason recorded against the refund
 * @param {string} [paymentId] - Payment to refund; required when a refund is due
 * @returns {Promise<Object>} - Cancellation and refund decision
 */
export const cancelBooking = async (orderReference, reason, paymentId) => {
  return apiRequest('/v2/akbar/cancel', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey('idem-admin-cancel') },
    body: JSON.stringify({
      order_reference: orderReference,
      reason: reason,
      ...(paymentId ? { payment_id: paymentId } : {}),
    }),
  });
};

// ============================================================================
// COMPLETE BOOKING FLOW (Convenience function)
// ============================================================================

/**
 * Complete booking flow in one call
 * Useful for testing or simplified checkout
 * 
 * @param {Object} bookingData - All booking data
 * @returns {Promise<Object>} - Final booking with ticket
 */
export const completeBookingFlow = async (bookingData) => {
  const {
    offerId,
    flightData,
    passengers,
    paymentData,
    skipHold = true,
  } = bookingData;

  // Step 1: Start booking
  console.log('📝 Starting booking...');
  const startResult = await startBooking(offerId, flightData);
  const orderReference = startResult.data.order_reference;
  console.log('✅ Booking started:', orderReference);

  // Step 2: Add passengers
  console.log('👥 Adding passengers...');
  await addPassengers(orderReference, passengers);
  console.log('✅ Passengers added');

  // Step 3: Hold (optional)
  if (!skipHold) {
    console.log('⏸️ Holding flight...');
    await holdFlight(orderReference);
    console.log('✅ Flight held');
  }

  // Step 4: Process payment
  console.log('💳 Processing payment...');
  await processPayment(orderReference, paymentData);
  console.log('✅ Payment processed');

  // Step 5: Confirm booking
  console.log('✈️ Confirming booking...');
  await confirmBooking(orderReference);
  console.log('✅ Booking confirmed');

  // Step 6: Issue ticket
  console.log('🎫 Issuing ticket...');
  const ticketResult = await issueTicket(orderReference);
  console.log('✅ Ticket issued');

  // Get final booking details
  const finalBooking = await getBookingDetails(orderReference);

  return {
    success: true,
    orderReference,
    booking: finalBooking.data,
    tickets: ticketResult.data,
  };
};

// ============================================================================
// AUTH HELPERS
// ============================================================================

/**
 * Login user and get auth token
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} - User with token
 */
export const login = async (email, password) => {
  const result = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (result.token) {
    // An explicit login is the only transition INTO an account session.
    setAuthToken(result.token, SCOPE_ACCOUNT);
  }

  return result;
};

/**
 * Register new user
 * 
 * @param {Object} userData 
 * @returns {Promise<Object>} - User with token
 */
export const register = async (userData) => {
  const result = await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (result.token) {
    setAuthToken(result.token, SCOPE_ACCOUNT);
  }

  return result;
};

/**
 * Logout user
 */
export const logout = () => {
  clearAuthToken();
};

// ============================================================================
// EXPORT DEFAULT OBJECT
// ============================================================================

const akbarBookingApi = {
  // Auth
  login,
  register,
  logout,
  setAuthToken,
  clearAuthToken,
  getAuthToken,
  isAuthenticated,
  newIdempotencyKey,

  // Booking flow
  searchFlights,
  getFlightBundles,
  startBooking,
  startGuestBooking,
  startBookingForCustomer,
  addPassengers,
  holdFlight,
  processPayment,
  ticketing,
  confirmBooking,
  issueTicket,

  // Utilities
  getBookingDetails,
  listBookings,
  requestCancellation,
  // Admin / support only — not for customer screens.
  cancelBooking,
  completeBookingFlow,
};

export default akbarBookingApi;
