/**
 * One-shot URL parameters for the booking page.
 *
 * These arrive from Moyasar's callback (and from our own callback_url) to complete a payment, and
 * they must be consumed exactly once. They used to be left in the address bar, so every refresh
 * re-entered the payment return flow and re-attempted the SAME booking with whatever token happened
 * to be in localStorage. A booking left open in a tab therefore produced
 * BOOKING_SCOPE_FORBIDDEN on every reload — even after clearing storage, because the reference was
 * coming back from the URL.
 *
 * `session` is deliberately NOT in this list: it carries the search context and must survive.
 */

export const ONE_SHOT_PAYMENT_PARAMS = [
  'order_ref',
  'order_reference',
  'id',
  'status',
  'payment_status',
  'message',
];

/**
 * Remove the one-shot payment parameters from a URL.
 *
 * @param {string} href           The current absolute URL.
 * @param {string} [session]      Session id to keep (or set). `sl` is folded into `session`.
 * @returns {string} The cleaned absolute URL.
 */
export function stripOneShotPaymentParams(href, session) {
  const url = new URL(href);

  for (const key of ONE_SHOT_PAYMENT_PARAMS) {
    url.searchParams.delete(key);
  }

  if (session) {
    url.searchParams.delete('sl');
    url.searchParams.set('session', session);
  }

  return url.toString();
}

/**
 * True when the URL still carries parameters that must be stripped.
 */
export function hasOneShotPaymentParams(href) {
  const url = new URL(href);
  return ONE_SHOT_PAYMENT_PARAMS.some((key) => url.searchParams.has(key));
}
