/**
 * The Moyasar publishable key the browser may use for card forms.
 *
 * WHY THIS IS A FUNCTION AND NOT A FALLBACK CHAIN
 * -----------------------------------------------
 * The flight and hotel booking pages ended their `publishable_api_key` chain with a literal
 * `pk_test_…` key committed to the repository. On a deployment where
 * `NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY` was missing, the card form therefore created payments in
 * Moyasar's TEST account while the backend verified them with a secret key from a different account.
 * Every lookup answered 404, which the backend could only report as an unverifiable payment — and
 * no card could ever be ticketed, with nothing in the UI saying why.
 *
 * A test key is only legitimate on a developer's machine. Anywhere else, a missing publishable key
 * has to be visible, so this returns an empty string and the caller refuses to render a card form
 * instead of silently transacting in the wrong environment.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so a change requires a rebuild/restart of the
 * front end, not just a restart.
 */

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '::1'];

/** True when this bundle is being served from a developer machine. */
export function isLocalOrigin() {
  if (typeof window === 'undefined') {
    return false;
  }

  return LOCAL_HOSTNAMES.includes(window.location.hostname);
}

/**
 * @returns {string} The configured publishable key, or '' when none is configured for this origin.
 */
export function getMoyasarPublishableKey() {
  const configured = (
    process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_MOYASAR_PUBLIC_KEY ||
    ''
  ).trim();

  if (configured) {
    return configured;
  }

  if (isLocalOrigin()) {
    return (process.env.NEXT_PUBLIC_MOYASAR_TEST_PUBLISHABLE_KEY || '').trim();
  }

  return '';
}
