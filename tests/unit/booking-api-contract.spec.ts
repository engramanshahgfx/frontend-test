import { test, expect } from '@playwright/test';
import path from 'node:path';

/**
 * Contract tests for the booking API client (`lib/akbarBookingApi.js`).
 *
 * These run in Node and stub `fetch`, so they assert the exact URL, method, headers and body the
 * client produces. That is the layer that caused the reported production faults:
 *
 *   - POST /bookings/start answered 401 for guests (no Authorization header, wrong endpoint)
 *   - every mutation answered 428 (no Idempotency-Key)
 *   - the client posted to two routes that do not exist (404)
 *   - the session token was read from the wrong localStorage key
 */

const ROOT = path.resolve(__dirname, '..', '..');
const API_MODULE = path.join(ROOT, 'lib', 'akbarBookingApi.js');

/** Minimal browser shim so the client's `typeof window` branches execute under Node. */
function installBrowserShim(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));

  const localStorage = {
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    setItem: (key: string, value: string) => void store.set(key, String(value)),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };

  (globalThis as any).window = { localStorage };
  (globalThis as any).localStorage = localStorage;

  return store;
}

type CapturedCall = { url: string; method: string; headers: Record<string, string>; body: any };

/** Replace fetch with a recorder. */
function stubFetch(response: { status?: number; body?: unknown } = {}) {
  const calls: CapturedCall[] = [];

  (globalThis as any).fetch = async (url: string, init: any = {}) => {
    const status = response.status ?? 200;

    calls.push({
      url: String(url),
      method: String(init.method || 'GET').toUpperCase(),
      headers: (init.headers || {}) as Record<string, string>,
      body: init.body ? JSON.parse(init.body) : null,
    });

    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => response.body ?? {},
    };
  };

  return calls;
}

/** Load a fresh copy of the client so module-level state cannot leak between tests. */
function loadApiClient() {
  delete require.cache[require.resolve(API_MODULE)];
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(API_MODULE);
}

const GUEST_START_RESPONSE = {
  success: true,
  data: {
    order_reference: 'TLR 100 012 500',
    booking_status: 'OFFER_SELECTED',
    token: 'guest-token-abc123',
    token_abilities: ['booking:TLR 100 012 500'],
  },
  order_reference: 'TLR 100 012 500',
  token: 'guest-token-abc123',
};

test.describe('Booking API contract', () => {
  // ---------------------------------------------------------------------
  // 2d — guest flow
  // ---------------------------------------------------------------------

  test('test_guest_calls_start_guest_not_start', async () => {
    installBrowserShim(); // no token => anonymous customer
    const calls = stubFetch({ status: 200, body: GUEST_START_RESPONSE });
    const api = loadApiClient();

    await api.startBookingForCustomer('OFFER-1', { origin: 'DEL' }, { email: 'guest@example.com' });

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain('/v2/akbar/bookings/start-guest');
    expect(calls[0].url).not.toContain('/bookings/start"');
    expect(calls[0].method).toBe('POST');
    expect(calls[0].body.offer_id).toBe('OFFER-1');
    expect(calls[0].body.email).toBe('guest@example.com');
    // A guest must never be sent to the authenticated endpoint.
    expect(calls.some((call) => /\/bookings\/start$/.test(call.url))).toBe(false);
  });

  test('test_guest_token_is_stored_after_start_guest', async () => {
    const store = installBrowserShim();
    stubFetch({ status: 200, body: GUEST_START_RESPONSE });
    const api = loadApiClient();

    expect(store.get('auth_token')).toBeUndefined();

    await api.startBookingForCustomer('OFFER-1');

    expect(store.get('auth_token')).toBe('guest-token-abc123');

    // The token is stored AND tagged as guest-scoped.
    expect(api.getTokenScope()).toBe('guest');
    expect(api.isGuestBookingToken()).toBe(true);
    expect(api.getAuthSession()).toEqual({ token: 'guest-token-abc123', scope: 'guest', isGuest: true });

    // ...but it is NOT an account session. This assertion previously expected `true`, and that
    // expectation is exactly what produced the "016/019" incident: a guest token satisfying
    // isAuthenticated() sent the next booking to /bookings/start (which issues no token), leaving
    // the previous booking's token in place for the following add-passengers -> 403.
    expect(api.isAuthenticated()).toBe(false);
  });

  test('test_guest_token_is_sent_as_bearer_on_subsequent_calls', async () => {
    installBrowserShim();
    const api = loadApiClient();

    stubFetch({ status: 200, body: GUEST_START_RESPONSE });
    await api.startBookingForCustomer('OFFER-1');

    const calls = stubFetch({ status: 200, body: { success: true } });
    await api.addPassengers('TLR 100 012 500', [{ first_name: 'Aman' }]);

    expect(calls[0].headers.Authorization).toBe('Bearer guest-token-abc123');
  });

  // ---------------------------------------------------------------------
  // 2c — authenticated flow + token key
  // ---------------------------------------------------------------------

  test('test_authenticated_user_calls_start_with_bearer', async () => {
    installBrowserShim({ auth_token: 'sanctum-token-xyz' });
    const calls = stubFetch({ status: 200, body: { data: { order_reference: 'TLR-1' } } });
    const api = loadApiClient();

    await api.startBookingForCustomer('OFFER-1', { origin: 'DEL' });

    expect(calls[0].url).toContain('/v2/akbar/bookings/start');
    expect(calls[0].url).not.toContain('start-guest');
    expect(calls[0].headers.Authorization).toBe('Bearer sanctum-token-xyz');
  });

  test('legacy token keys are migrated to auth_token', async () => {
    const store = installBrowserShim({ authToken: 'legacy-key-value' });
    stubFetch({ status: 200, body: {} });
    const api = loadApiClient();

    expect(api.getAuthToken()).toBe('legacy-key-value');
    expect(store.get('auth_token')).toBe('legacy-key-value');
    expect(store.has('authToken')).toBe(false);
  });

  test('an authenticated request always uses the auth_token key', async () => {
    const store = installBrowserShim({ auth_token: 'canonical', token: 'stale' });
    const calls = stubFetch({ status: 200, body: {} });
    const api = loadApiClient();

    await api.addPassengers('TLR-1', []);

    expect(store.get('auth_token')).toBe('canonical');
    expect(calls[0].headers.Authorization).toBe('Bearer canonical');
  });

  // ---------------------------------------------------------------------
  // 2a — idempotency on every mutation
  // ---------------------------------------------------------------------

  test('test_all_mutations_send_idempotency_key', async () => {
    installBrowserShim({ auth_token: 'tok' });
    const api = loadApiClient();

    const mutations: Array<[string, (calls: CapturedCall[]) => Promise<unknown>]> = [
      ['startBooking', () => api.startBooking('OFFER-1', {})],
      ['startGuestBooking', () => api.startGuestBooking('OFFER-1', {})],
      ['addPassengers', () => api.addPassengers('TLR-1', [])],
      ['holdFlight', () => api.holdFlight('TLR-1')],
      ['ticketing', () => api.ticketing('TLR-1', 'pay_1')],
      ['confirmBooking', () => api.confirmBooking('TLR-1', 'pay_1')],
      ['issueTicket', () => api.issueTicket('TLR-1', 'pay_1')],
      ['processPayment', () => api.processPayment('TLR-1', { paymentId: 'pay_1' })],
      ['requestCancellation', () => api.requestCancellation('TLR-1', 'reason text')],
    ];

    for (const [name, invoke] of mutations) {
      const calls = stubFetch({ status: 200, body: GUEST_START_RESPONSE });
      await invoke([] as any);

      expect(calls[0].method, `${name} should be a POST`).toBe('POST');
      expect(
        calls[0].headers['Idempotency-Key'],
        `${name} must send an Idempotency-Key or the API answers 428`
      ).toBeTruthy();
    }
  });

  test('a reused idempotency key is sent unchanged (safe retry)', async () => {
    installBrowserShim({ auth_token: 'tok' });
    const api = loadApiClient();
    const key = 'idem-fixed-key-for-retry';

    const first = stubFetch({ status: 200, body: {} });
    await api.addPassengers('TLR-1', [], { idempotencyKey: key });

    const second = stubFetch({ status: 200, body: {} });
    await api.addPassengers('TLR-1', [], { idempotencyKey: key });

    expect(first[0].headers['Idempotency-Key']).toBe(key);
    expect(second[0].headers['Idempotency-Key']).toBe(key);
  });

  test('read-only requests carry no Idempotency-Key', async () => {
    installBrowserShim({ auth_token: 'tok' });
    const calls = stubFetch({ status: 200, body: {} });
    const api = loadApiClient();

    await api.getBookingDetails('TLR-1');

    expect(calls[0].method).toBe('GET');
    expect(calls[0].headers['Idempotency-Key']).toBeUndefined();
  });

  // ---------------------------------------------------------------------
  // B10 / B11 — dead endpoints
  // ---------------------------------------------------------------------

  test('B10/B11: no call targets a route that does not exist', async () => {
    installBrowserShim({ auth_token: 'tok' });
    const api = loadApiClient();

    const dead = ['/v2/akbar/bookings/confirm', '/v2/akbar/bookings/issue-ticket'];

    for (const [name, invoke] of [
      ['confirmBooking', () => api.confirmBooking('TLR-1', 'pay_1')],
      ['issueTicket', () => api.issueTicket('TLR-1', 'pay_1')],
    ] as Array<[string, () => Promise<unknown>]>) {
      const calls = stubFetch({ status: 200, body: {} });
      await invoke();

      for (const route of dead) {
        expect(calls[0].url, `${name} must not call the non-existent ${route}`).not.toBe(route);
      }

      // Must be a real route: /bookings/{ref}/confirm or /bookings/{ref}/pay
      expect(calls[0].url).toMatch(/\/v2\/akbar\/bookings\/.+\/(confirm|pay)$/);
      expect(calls[0].body.payment_id).toBe('pay_1');
    }
  });

  // ---------------------------------------------------------------------
  // B5 — never fake success on an error response
  // ---------------------------------------------------------------------

  test('test_no_mock_success_when_backend_returns_401', async () => {
    installBrowserShim();
    stubFetch({
      status: 401,
      body: { success: false, error: { code: 'UNAUTHENTICATED', message: 'Unauthenticated.' } },
    });
    const api = loadApiClient();

    let thrown: any = null;
    try {
      await api.startBooking('OFFER-1', {});
    } catch (error) {
      thrown = error;
    }

    expect(thrown, 'A 401 must throw, never resolve with a fabricated booking.').not.toBeNull();
    expect(thrown.status).toBe(401);
    expect(thrown.message).toBe('Unauthenticated.');
    expect(JSON.stringify(thrown)).not.toMatch(/PNR|TK-|\d{3}-\d{8}/);
  });

  test('test_no_mock_success_when_backend_returns_500', async () => {
    installBrowserShim();
    stubFetch({
      status: 500,
      body: { success: false, error: { code: 'TICKETING_FAILED', message: 'The booking could not be ticketed.' } },
    });
    const api = loadApiClient();

    let thrown: any = null;
    try {
      await api.startBooking('OFFER-1', {});
    } catch (error) {
      thrown = error;
    }

    expect(thrown).not.toBeNull();
    expect(thrown.status).toBe(500);
    // The human message from error.message must surface, not "[object Object]".
    expect(thrown.message).toBe('The booking could not be ticketed.');
    expect(thrown.message).not.toContain('[object Object]');
    expect(thrown.code).toBe('TICKETING_FAILED');
  });

  test('processPayment refuses to ticket without a verified payment id', async () => {
    installBrowserShim({ auth_token: 'tok' });
    const calls = stubFetch({ status: 200, body: {} });
    const api = loadApiClient();

    await expect(api.processPayment('TLR-1', { amount: 100 })).rejects.toThrow(
      /verified payment id is required/i
    );

    // It must not have hit the network with an unverifiable body.
    expect(calls).toHaveLength(0);
  });
});
