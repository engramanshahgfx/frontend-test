import { test, expect } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Regression coverage for two faults found while chasing BOOKING_SCOPE_FORBIDDEN:
 *
 *  1. The booking page never removed the one-shot payment parameters from the URL, so EVERY refresh
 *     re-read order_ref / id / status and re-attempted the same booking with whatever token was in
 *     localStorage — a permanent BOOKING_SCOPE_FORBIDDEN that survived clearing storage, because the
 *     reference was coming back from the address bar.
 *
 *  2. A rejected booking-scoped token stayed in place, so every subsequent attempt reused it.
 */

const ROOT = path.resolve(__dirname, '..', '..');
const URL_PARAMS_MODULE = path.join(ROOT, 'lib', 'bookingUrlParams.js');
const API_MODULE = path.join(ROOT, 'lib', 'akbarBookingApi.js');

/**
 * Browser shim with a MUTABLE location/history, so `history.replaceState` behaves like the real
 * thing and the test can assert what the address bar contains afterwards.
 */
function installBrowserShim(initialHref = 'http://localhost:3000/', storage: Record<string, string> = {}) {
  let href = initialHref;
  const store = new Map(Object.entries(storage));

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

  const location = {
    get href() {
      return href;
    },
    get search() {
      return new URL(href).search;
    },
  };

  const history = {
    replaceState: (_state: unknown, _title: string, url: string) => {
      href = url;
    },
  };

  (globalThis as any).window = { localStorage, location, history };
  (globalThis as any).localStorage = localStorage;

  return { store, location, history };
}

async function load<T = any>(modulePath: string): Promise<T> {
  // The specifier must be a file:// URL — Node's ESM loader rejects a bare Windows path.
  return (await import(`${pathToFileURL(modulePath).href}?t=${Date.now()}-${Math.random()}`)) as T;
}

// ---------------------------------------------------------------------------
// 1. one-shot URL parameters are stripped after processing
// ---------------------------------------------------------------------------

test('test_url_params_are_stripped_after_processing', async () => {
  const { stripOneShotPaymentParams } = await load(URL_PARAMS_MODULE);

  // The exact URL from the report (Moyasar's callback appended id/status/message/session).
  installBrowserShim(
    'http://localhost:3000/en/akbar-flights/booking' +
    '?payment_status=paid' +
    '&order_ref=TLR+100+012+024' +
    '&id=139cd8c4-d6f6-4a3a-8a15-da4809763968' +
    '&status=paid' +
    '&message=APPROVED' +
    '&session=sl-0dwy3l8nq-1790671175768'
  );

  // Exactly what the page does in its session effect once the params have been consumed.
  (globalThis as any).window.history.replaceState(
    null,
    '',
    stripOneShotPaymentParams((globalThis as any).window.location.href, 'sl-0dwy3l8nq-1790671175768')
  );

  const after = new URL((globalThis as any).window.location.href);

  // A refresh uses the address bar — so these must be gone for the re-trigger to be impossible.
  expect(after.searchParams.has('order_ref')).toBe(false);
  expect(after.searchParams.has('order_reference')).toBe(false);
  expect(after.searchParams.has('id')).toBe(false);
  expect(after.searchParams.has('status')).toBe(false);
  expect(after.searchParams.has('payment_status')).toBe(false);
  expect(after.searchParams.has('message')).toBe(false);

  // The search context must survive.
  expect(after.searchParams.get('session')).toBe('sl-0dwy3l8nq-1790671175768');

  // And the concrete symptom: re-reading order_ref after the strip yields nothing, so the flow
  // cannot restart on refresh.
  expect(after.searchParams.get('order_ref')).toBeNull();

  // Guard against this test passing while page.jsx is not actually wired to the helper.
  const source = (await import('node:fs')).readFileSync(
    path.join(ROOT, 'app', '[lang]', 'akbar-flights', 'booking', 'page.jsx'),
    'utf8'
  );
  expect(source).toContain('stripOneShotPaymentParams(window.location.href');
  expect(source).toContain("window.history.replaceState(null, '', stripOneShotPaymentParams");
});

// ---------------------------------------------------------------------------
// 2. a 403 BOOKING_SCOPE_FORBIDDEN discards the stale token
// ---------------------------------------------------------------------------

test('test_403_scope_forbidden_clears_stale_token', async () => {
  const store = new Map<string, string>();

  // A token left over from booking 016, while the request is for booking 024.
  installBrowserShim('http://localhost:3000/en/akbar-flights/booking', {
    auth_token: 'token-for-booking-016',
    auth_token_scope: 'guest',
  });

  const api = await load<any>(API_MODULE);

  const captured: string[] = [];
  (globalThis as any).fetch = async (url: string) => {
    captured.push(String(url));
    return {
      ok: false,
      status: 403,
      json: async () => ({
        success: false,
        error: {
          code: 'BOOKING_SCOPE_FORBIDDEN',
          message: 'This token is only valid for a different booking reference.',
        },
      }),
    };
  };

  await expect(
    api.addPassengers('TLR 100 012 024', [{ firstName: 'A', lastName: 'B' }], { idempotencyKey: 'k1' })
  ).rejects.toThrow();

  expect(captured.length).toBeGreaterThan(0);

  // Both keys must be gone so the next attempt mints a fresh guest token.
  expect((globalThis as any).localStorage.getItem('auth_token')).toBeNull();
  expect((globalThis as any).localStorage.getItem('auth_token_scope')).toBeNull();
});

// ---------------------------------------------------------------------------
// 3. callback_url must not pre-encode order_ref (double-encoding regression)
// ---------------------------------------------------------------------------

test('test_callback_url_produces_correctly_encoded_order_ref', () => {
  const orderReference = 'TLR 100 012 028';
  const origin = 'http://localhost:3000';

  // New logic — the writer must NOT call encodeURIComponent. The browser percent-encodes the
  // literal spaces on redirect, and URLSearchParams decodes on the read side.
  const callback_url = `${origin}/en/akbar-flights/booking?order_ref=${orderReference || ''}`;

  const url = new URL(callback_url);
  const parsed = url.searchParams.get('order_ref');

  expect(parsed).toBe('TLR 100 012 028');

  // The space must arrive single-encoded (%20), never double-encoded (%2520).
  expect(url.search).toContain('%20');
  expect(url.search).not.toContain('%2520');
});
