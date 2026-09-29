import { test, expect } from '@playwright/test';

/**
 * B5 — THE FRONT-END MUST NEVER FABRICATE A BOOKING.
 *
 * The Laravel backend was hardened to fail closed: no invented PNRs, no invented ticket
 * numbers, no success-on-exception. The Next.js flight checkout still manufactures all
 * three on the client, which is a legal and financial risk — a customer can be shown a
 * confirmed, ticketed booking that does not exist at the airline.
 *
 * These tests assert the CORRECT behaviour, so a failure documents a real defect.
 *
 * Two distinct failure modes are covered:
 *   1. The backend is unreachable  -> `apiCall()` falls back to `getMockBookingResponse()`.
 *   2. The backend returns 500     -> must surface an error.
 * plus the two purely client-side fabrication paths (a deep-link parameter and an
 * on-screen button that both set TICKETED without contacting anybody).
 */

const BOOKING_PATH = '/en/akbar-flights/booking';

/**
 * The checkout reads the chosen flight from localStorage (written by the search page).
 * A customer returning from the payment gateway always has this, so the tests must too —
 * without it the page early-returns to its "No Flight Selected" empty state and the
 * error banner never renders.
 */
const SEEDED_FLIGHT = {
  offerId: 'E2E-OFFER-B5',
  airline: 'Saudia',
  airlineCode: 'SV',
  flightNumber: 'SV-101',
  origin: 'DEL',
  destination: 'BOM',
  originAirport: 'DEL',
  destinationAirport: 'BOM',
  departureDate: '2026-09-30',
  depTime: '07:15',
  arrTime: '09:30',
  duration: '2h 15m',
  cabinClass: 'Economy',
  price: 1401,
  refundable: true,
  legs: [
    {
      from: 'DEL',
      to: 'BOM',
      date: '2026-09-30',
      dep: '07:15',
      arr: '09:30',
      airline: 'Saudia',
      flightNo: 'SV-101',
      originAirport: 'DEL',
      destinationAirport: 'BOM',
      duration: '2h 15m',
    },
  ],
};

async function seedSelectedFlight(page: import('@playwright/test').Page) {
  await page.addInitScript((flight) => {
    window.localStorage.setItem('selectedFlight', JSON.stringify(flight));
    window.localStorage.setItem(
      'selectedBundle',
      JSON.stringify({ bundleId: 'E2E-BUNDLE-B5', cabin: 'Economy', priceAddition: 0 })
    );
  }, SEEDED_FLIGHT);
}

/** Anything the UI could invent when it does not have a real booking. */
const FABRICATED_MARKERS = [
  /TK-\d{9,}/, // getMockBookingResponse() ticket
  /PNR\d{6}/, // getMockBookingResponse() airline PNR
  '712-81709422', // hardcoded ticket fallback in the confirmation view
];

async function assertNoFabricatedBooking(page: import('@playwright/test').Page) {
  const body = (await page.locator('body').innerText()).trim();

  for (const marker of FABRICATED_MARKERS) {
    if (typeof marker === 'string') {
      expect(body, `Fabricated ticket number "${marker}" was shown to the customer.`).not.toContain(marker);
    } else {
      expect(body, `Fabricated booking data matching ${marker} was shown to the customer.`).not.toMatch(marker);
    }
  }
}

test.describe('B5 — no fabricated bookings', () => {
  test('backend unreachable: shows an error, never a fabricated PNR or ticket', async ({ page }) => {
    // Simulate the backend being down (DNS failure / server stopped / CORS).
    // This is the exact condition that triggers getMockBookingResponse().
    await page.route('**/api/v2/akbar/**', (route) => route.abort('failed'));
    await page.route('**/api/**', (route) => route.abort('failed'));
    await seedSelectedFlight(page);

    await page.goto(`${BOOKING_PATH}?order_ref=TLR-TEST-B5&id=pay_b5_probe`, {
      waitUntil: 'domcontentloaded',
    });

    // Give the page time to run its payment-verification effect and any mock fallback.
    await page.waitForTimeout(4_000);

    await assertNoFabricatedBooking(page);

    // The customer must be told the truth, not shown a success screen.
    await expect(
      page.locator('.error-banner'),
      'With the backend unreachable the customer must see an error banner.'
    ).toBeVisible({ timeout: 15_000 });
  });

  test('backend returns 500: shows an error, never a fabricated PNR or ticket', async ({ page }) => {
    await page.route('**/api/v2/akbar/**', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { code: 'TICKETING_FAILED', message: 'The booking could not be ticketed.' },
        }),
      })
    );
    await seedSelectedFlight(page);

    await page.goto(`${BOOKING_PATH}?order_ref=TLR-TEST-B5-500&id=pay_b5_500`, {
      waitUntil: 'domcontentloaded',
    });

    await page.waitForTimeout(4_000);

    await assertNoFabricatedBooking(page);
    await expect(page.locator('.error-banner')).toBeVisible({ timeout: 15_000 });
  });

  test('deep link claiming a completed ticket must not invent one', async ({ page }) => {
    // ?step=5 (also ?ticket=true, ?show_ticket=true, ?view=ticket) used to set
    // bookingStatus to TICKETED and mint a ticket number locally, with no API call at all.
    await page.route('**/api/**', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"success":false}' })
    );
    await seedSelectedFlight(page);

    await page.goto(`${BOOKING_PATH}?step=5`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3_000);

    await assertNoFabricatedBooking(page);
  });

  test('confirmation view must not fall back to a hardcoded ticket number', async ({ page }) => {
    await page.route('**/api/**', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"success":false}' })
    );
    await seedSelectedFlight(page);

    await page.goto(`${BOOKING_PATH}?step=confirmation`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3_000);

    const body = await page.locator('body').innerText();
    expect(
      body,
      'The confirmation view fell back to the hardcoded ticket number 712-81709422.'
    ).not.toContain('712-81709422');
  });
});
