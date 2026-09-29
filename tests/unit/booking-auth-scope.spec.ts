import { test, expect } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Session-scope contract for the booking API client.
 *
 * Regression suite for the "016/019" incident: a booking-scoped guest token was mistaken for an
 * account session, so the next booking took the authenticated branch and POSTed /bookings/start —
 * an endpoint that creates a booking but issues NO token. The previous booking's token stayed in
 * localStorage and the following add-passengers sent it with the new reference, which the backend
 * correctly answered with 403 BOOKING_SCOPE_FORBIDDEN.
 *
 * These run in Node with a stubbed fetch, so they assert the exact endpoint chosen and the exact
 * token sent — the two things that were both wrong.
 */

const ROOT = path.resolve(__dirname, '..', '..');
const API_MODULE = path.join(ROOT, 'lib', 'akbarBookingApi.js');

const TOKEN_KEY = 'auth_token';
const SCOPE_KEY = 'auth_token_scope';

/** Minimal browser shim so the client's `typeof window` branches execute under Node. */
function installBrowserShim() {
  const store = new Map<string, string>();

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

function stubFetch(responses: Array<{ status?: number; body?: unknown }> = [{}]) {
  const calls: CapturedCall[] = [];
  let index = 0;

  (globalThis as any).fetch = async (url: string, init: any = {}) => {
    const response = responses[Math.min(index, responses.length - 1)];
    index++;

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

/**
 * Fresh imports each time so the module's in-memory token cache cannot leak between tests.
 *
 * The specifier must be a file:// URL — Node's ESM loader rejects a bare Windows path ("c:\\...").
 */
async function loadModule() {
  const mod = await import(`${pathToFileURL(API_MODULE).href}?t=${Date.now()}-${Math.random()}`);
  return mod as any;
}

let store: Map<string, string>;

test.beforeEach(() => {
  store = installBrowserShim();
});

// ---------------------------------------------------------------------------
// 1. a guest token is never an account session
// ---------------------------------------------------------------------------

test('test_guest_token_never_satisfies_isauthenticated', async () => {
  const api = await loadModule();
  api.clearAuthToken();

  store.set(TOKEN_KEY, 'guest-token-A');
  store.set(SCOPE_KEY, 'guest');

  expect(api.isAuthenticated()).toBe(false);
  expect(api.isGuestBookingToken()).toBe(true);
  expect(api.getAuthSession()).toEqual({ token: 'guest-token-A', scope: 'guest', isGuest: true });

  // ...and the next booking must therefore take the guest path.
  const calls = stubFetch([{ body: { success: true, data: { order_reference: 'REF-B', token: 'guest-token-B' } } }]);

  await api.startBookingForCustomer('OFFER-1', { price: 100 }, { email: 'a@b.com' });

  expect(calls).toHaveLength(1);
  expect(calls[0].url).toContain('/v2/akbar/bookings/start-guest');
  expect(calls[0].url).not.toContain('/bookings/start"');
});

test('an account token still satisfies isauthenticated and uses /start', async () => {
  const api = await loadModule();
  api.clearAuthToken();

  store.set(TOKEN_KEY, 'account-token');
  store.set(SCOPE_KEY, 'account');

  expect(api.isAuthenticated()).toBe(true);

  const calls = stubFetch([{ body: { success: true, data: { order_reference: 'REF-A' } } }]);

  await api.startBookingForCustomer('OFFER-1', { price: 100 }, {});

  expect(calls[0].url).toContain('/v2/akbar/bookings/start');
  expect(calls[0].url).not.toContain('start-guest');
});

// ---------------------------------------------------------------------------
// 2. each guest booking mints and adopts a fresh token
// ---------------------------------------------------------------------------

test('test_second_booking_mints_fresh_guest_token', async () => {
  const api = await loadModule();

  api.clearAuthToken();
  expect(api.getAuthToken()).toBeNull();

  const first = stubFetch([{ body: { success: true, data: { order_reference: 'REF-1', token: 'T1' } } }]);
  await api.startGuestBooking('OFFER-1', { email: 'a@b.com' });

  expect(api.getAuthToken()).toBe('T1');
  expect(api.getTokenScope()).toBe('guest');

  const second = stubFetch([{ body: { success: true, data: { order_reference: 'REF-2', token: 'T2' } } }]);
  await api.startGuestBooking('OFFER-2', { email: 'a@b.com' });

  expect(api.getAuthToken()).toBe('T2');
  expect(api.getAuthToken()).not.toBe('T1');
  expect(api.getTokenScope()).toBe('guest', 'A fresh guest token must stay guest-scoped.');

  // Both went to the guest endpoint.
  expect(first[0].url).toContain('start-guest');
  expect(second[0].url).toContain('start-guest');
});

// ---------------------------------------------------------------------------
// 3. a stale guest token must not break the NEXT booking
// ---------------------------------------------------------------------------

test('test_stale_guest_token_does_not_break_new_booking', async () => {
  // The exact production state: a guest token left over from booking 016.
  const api = await loadModule();
  api.clearAuthToken();

  store.set(TOKEN_KEY, 'token-for-booking-016');
  store.set(SCOPE_KEY, 'guest');

  const startCalls = stubFetch([{ body: { success: true, data: { order_reference: 'REF-019', token: 'token-for-booking-019' } } }]);
  await api.startBookingForCustomer('OFFER-019', { price: 100 }, { email: 'a@b.com' });

  // It must NOT take the authenticated branch.
  expect(startCalls[0].url).toContain('start-guest');
  expect(startCalls[0].url).not.toContain('/bookings/start"');

  // The new token replaced the stale one.
  expect(api.getAuthToken()).toBe('token-for-booking-019');

  // add-passengers must therefore carry booking 019's token, not 016's.
  const addCalls = stubFetch([{ body: { success: true, data: {} } }]);
  await api.addPassengers('REF-019', [{ firstName: 'A', lastName: 'B' }], { idempotencyKey: 'k1' });

  expect(addCalls[0].url).toContain('/v2/akbar/bookings/passengers');
  expect(addCalls[0].headers['Authorization']).toBe('Bearer token-for-booking-019');
  expect(addCalls[0].headers['Authorization']).not.toContain('016');
});

// ---------------------------------------------------------------------------
// 4. an account token is never clobbered by the guest flow
// ---------------------------------------------------------------------------

test('test_guest_token_never_overwrites_account_token', async () => {
  const api = await loadModule();
  api.clearAuthToken();

  store.set(TOKEN_KEY, 'T_account');
  store.set(SCOPE_KEY, 'account');

  // A signed-in customer starts a booking: the authenticated branch, which issues no token.
  const calls = stubFetch([{ body: { success: true, data: { order_reference: 'REF-X' } } }]);
  await api.startBookingForCustomer('OFFER-X', { price: 100 }, {});

  expect(calls[0].url).toContain('/bookings/start');
  expect(api.getAuthToken()).toBe('T_account');
  expect(api.getTokenScope()).toBe('account');
  expect(api.isAuthenticated()).toBe(true);
});

// ---------------------------------------------------------------------------
// 5. only an explicit login may move a session to account scope
// ---------------------------------------------------------------------------

test('test_account_token_never_overwrites_guest_token_unexpectedly', async () => {
  const api = await loadModule();
  api.clearAuthToken();

  store.set(TOKEN_KEY, 'guest-token');
  store.set(SCOPE_KEY, 'guest');

  // A boot-time rehydrate re-sets the SAME token (this is what BookingContext does).
  api.setAuthToken('guest-token');

  expect(api.getTokenScope()).toBe('guest');
  expect(api.isAuthenticated()).toBe(false);
  expect(api.getAuthToken()).toBe('guest-token');

  // Only an explicit login promotes the session to an account.
  const calls = stubFetch([{ body: { token: 'T_account_new', user: { id: 1 } } }]);
  await api.login('a@b.com', 'secret');

  expect(calls[0].url).toContain('/login');
  expect(api.getAuthToken()).toBe('T_account_new');
  expect(api.getTokenScope()).toBe('account');
  expect(api.isAuthenticated()).toBe(true);
});

// ---------------------------------------------------------------------------
// backwards compatibility
// ---------------------------------------------------------------------------

test('a legacy token with no scope is treated as an account session and warns in dev', async () => {
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (...args: any[]) => void warnings.push(args.join(' '));

  let api: any;
  try {
    api = await loadModule();
    api.clearAuthToken();

    // The legacy state: a token written before scope tagging existed.
    store.set(TOKEN_KEY, 'legacy-token');

    expect(api.getTokenScope()).toBe('account');
    expect(api.isAuthenticated()).toBe(true);
  } finally {
    console.warn = original;
  }

  expect(warnings.join('\n')).toContain('auth_token_scope');
  expect(api.getAuthToken()).toBe('legacy-token');
});

test('clearing the session removes both the token and its scope', async () => {
  const api = await loadModule();
  api.clearAuthToken();

  store.set(TOKEN_KEY, 'guest-token');
  store.set(SCOPE_KEY, 'guest');

  api.clearAuthToken();

  expect(store.get(TOKEN_KEY)).toBeUndefined();
  expect(store.get(SCOPE_KEY)).toBeUndefined();
  expect(api.getAuthToken()).toBeNull();
  expect(api.isAuthenticated()).toBe(false);
});
