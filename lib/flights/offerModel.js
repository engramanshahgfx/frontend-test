// lib/flights/offerModel.js — turns Akbar search offers into what the flight results UI shows.
//
// Akbar sells each fare family (ECO SAVER, ECO FLEX ...) of a flight as a separate offer, so a
// search for one route returns the same flight several times. The UI shows one card per flight
// (journey) and lets the customer pick the fare family afterwards from /bundles.
//
// Nothing here invents data: a value the supplier did not send stays null and the UI says so.

import ALL_AIRPORTS from '@/lib/akbarAirports';

const AIRPORT_BY_CODE = new Map(ALL_AIRPORTS.map((a) => [a.Code.toUpperCase(), a]));

export const CABINS = ['Economy', 'PremiumEconomy', 'Business', 'First'];
export const MAX_PASSENGERS = 9;

export const POPULAR_AIRPORTS = ['RUH', 'JED', 'DMM', 'MED', 'AHB', 'TIF', 'TUU', 'DXB', 'CAI', 'IST', 'BOM', 'LHR'];

// Airports missing from the bundled list, learned from the "Name|City" pairs offers carry.
const LEARNED = new Map();

function learnAirport(code, nameCity) {
  if (!code || AIRPORT_BY_CODE.has(code.toUpperCase()) || typeof nameCity !== 'string') return;
  const [name, city] = nameCity.split('|').map((x) => x.trim());
  if (city || name) LEARNED.set(code.toUpperCase(), { code, city: city || name, name: name || '', country: '' });
}

export function airportInfo(code) {
  const key = code ? code.toUpperCase() : '';
  const ap = AIRPORT_BY_CODE.get(key);
  if (ap) return { code: ap.Code, city: ap.CityName, name: ap.Name, country: ap.Country };
  return LEARNED.get(key) || { code, city: code || '', name: '', country: '' };
}

// ── Dates & times ──────────────────────────────────────────────────────────

export function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function parseISODate(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : new Date();
}

export function addDays(iso, days) {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export const todayISO = () => toISODate(new Date());

// 'ar-SA' alone formats in the Hijri calendar; flights run on Gregorian dates.
export const dateLocale = (lang) => (lang === 'ar' ? 'ar-u-ca-gregory-nu-latn' : 'en-GB');

export function formatDate(iso, lang, opts = { weekday: 'short', day: 'numeric', month: 'short' }) {
  if (!iso) return '';
  return parseISODate(iso.slice(0, 10)).toLocaleDateString(dateLocale(lang), opts);
}

// Supplier times are local to each airport ("2026-11-20T05:55:00"). They are read as text and never
// pushed through Date(), which would shift them into the browser's timezone.
export const clock = (stamp) => (typeof stamp === 'string' && stamp.length >= 16 ? stamp.slice(11, 16) : '');

// "14:15" → "02:15 PM" (or "02:15 م"); 24-hour stays as is.
export function clockAs(stamp, ampm, lang) {
  const t = clock(stamp);
  if (!ampm || !t) return t;
  const h = Number(t.slice(0, 2));
  const suffix = lang === 'ar' ? (h < 12 ? 'ص' : 'م') : h < 12 ? 'AM' : 'PM';
  return `${String(h % 12 || 12).padStart(2, '0')}:${t.slice(3, 5)} ${suffix}`;
}
export const datePart = (stamp) => (typeof stamp === 'string' ? stamp.slice(0, 10) : '');
const minutesOfDay = (stamp) => {
  const t = clock(stamp);
  return t ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)) : null;
};
const daysBetween = (a, b) => Math.round((parseISODate(b) - parseISODate(a)) / 86400000);

export function formatDuration(mins, lang) {
  if (!Number.isFinite(mins) || mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return lang === 'ar' ? `${h}س ${m}د` : `${h}h ${String(m).padStart(2, '0')}m`;
}

// ── Offer normalisation ────────────────────────────────────────────────────

// JourneyKey: one segment per "~", each "carrier,flightNo,from,to,departure,arrival,...".
function parseSegments(offer) {
  const key = String(offer.JourneyKey || '');
  const stampRe = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
  const segments = key
    .split('~')
    .map((raw) => raw.split(',').map((s) => s.trim()))
    .filter((f) => f.length >= 6 && stampRe.test(f[4]) && stampRe.test(f[5]))
    .map((f) => ({ carrier: f[0], flightNo: f[1], from: f[2], to: f[3], departure: f[4], arrival: f[5] }));

  if (segments.length) return segments;
  return [{
    carrier: offer.VAC || offer.MAC || '',
    flightNo: String(offer.FlightNo || ''),
    from: offer.From,
    to: offer.To,
    departure: offer.DepartureTime,
    arrival: offer.ArrivalTime,
  }];
}

const minutesBetween = (a, b) => {
  const ma = minutesOfDay(a);
  const mb = minutesOfDay(b);
  if (ma === null || mb === null) return null;
  return daysBetween(datePart(a), datePart(b)) * 1440 + (mb - ma);
};

// Wrapped in a left-to-right isolate so "30 kg" does not render as "kg 30" in Arabic text.
export const ltr = (text) => (text ? `⁦${text}⁩` : text);
const bagText = (kg, pieces) => (kg ? ltr(`${kg} kg`) : pieces ? ltr(`${pieces} pc`) : null);

export function normalizeOffer(offer) {
  learnAirport(offer.From, offer.FromName);
  learnAirport(offer.To, offer.ToName);
  const segments = parseSegments(offer);
  const layovers = segments.slice(1).map((seg, i) => ({
    airport: seg.from,
    minutes: minutesBetween(segments[i].arrival, seg.departure),
  }));
  const inc = offer.Inclusions || {};
  const carrier = offer.VAC || offer.MAC || segments[0].carrier || '';
  const seats = Number(offer.Seats);

  return {
    id: offer.Index,
    legIndex: Number(offer.LegIndex ?? offer.ReturnIdentifier ?? 0),
    journeyKey: offer.JourneyKey || `${carrier}|${offer.FlightNo}|${offer.DepartureTime}`,
    airline: String(offer.AirlineName || '').split('|')[0] || carrier,
    airlineCode: carrier,
    operatedBy: offer.operated_by || null,
    flightNumbers: segments.map((s) => `${s.carrier} ${s.flightNo}`),
    from: offer.From,
    to: offer.To,
    requestedFrom: offer.RequestedFrom,
    requestedTo: offer.RequestedTo,
    nearbyAirport: Boolean(offer.NearbyAirport),
    departure: offer.DepartureTime,
    arrival: offer.ArrivalTime,
    dayOffset: daysBetween(datePart(offer.DepartureTime), datePart(offer.ArrivalTime)),
    duration: Number(offer.Duration) || null,
    durationText: offer.DurationText || '',
    stops: Number(offer.Stops) || 0,
    segments,
    layovers,
    price: Number(offer.CustomerTotalSAR) || 0,
    taxesIncluded: offer.TaxesIncluded !== false,
    // Supplier seat counts above 9 are aircraft capacity, not a scarcity signal.
    seatsLeft: Number.isFinite(seats) && seats > 0 && seats <= 9 ? seats : null,
    checkedBag: bagText(inc.checkin_kg, inc.checkin_pieces),
    cabinBag: bagText(inc.cabin_kg, inc.cabin_pieces),
    fareClass: offer.FareClass || null,
    fareGroup: offer.FCGroup || null,
    cabin: offer.Cabin || 'E',
  };
}

// One card per flight: the cheapest fare family represents it, the rest are counted.
export function groupByJourney(offers) {
  const groups = new Map();
  for (const o of offers) {
    const g = groups.get(o.journeyKey);
    if (!g) {
      groups.set(o.journeyKey, { ...o, fares: [o] });
    } else {
      g.fares.push(o);
      if (o.price < g.price) Object.assign(g, o, { fares: g.fares });
    }
  }
  return [...groups.values()];
}

// ── Filtering & sorting ────────────────────────────────────────────────────

export const TIME_BUCKETS = [
  { id: 'early', from: 0, to: 360 },
  { id: 'morning', from: 360, to: 720 },
  { id: 'afternoon', from: 720, to: 1080 },
  { id: 'evening', from: 1080, to: 1440 },
];

// maxStops: null = any, 0 = direct only, 1 = one stop or less, 2 = two stops or less.
export const EMPTY_FILTERS = { maxStops: null, airlines: [], depTimes: [], arrTimes: [], fromAirports: [], toAirports: [], baggageOnly: false, maxPrice: null };

const inBuckets = (stamp, ids) => {
  const m = minutesOfDay(stamp);
  return TIME_BUCKETS.some((b) => ids.includes(b.id) && m >= b.from && m < b.to);
};

export function applyFilters(flights, f) {
  return flights.filter((fl) => {
    if (f.maxStops !== null && fl.stops > f.maxStops) return false;
    if (f.airlines.length && !f.airlines.includes(fl.airlineCode)) return false;
    if (f.depTimes.length && !inBuckets(fl.departure, f.depTimes)) return false;
    if (f.arrTimes.length && !inBuckets(fl.arrival, f.arrTimes)) return false;
    if (f.fromAirports.length && !f.fromAirports.includes(fl.from)) return false;
    if (f.toAirports.length && !f.toAirports.includes(fl.to)) return false;
    if (f.baggageOnly && !fl.fares.some((x) => x.checkedBag)) return false;
    if (f.maxPrice !== null && fl.price > f.maxPrice) return false;
    return true;
  });
}

export const activeFilterCount = (f) =>
  (f.maxStops !== null) + f.airlines.length + f.depTimes.length + f.arrTimes.length + f.fromAirports.length + f.toAirports.length + f.baggageOnly + (f.maxPrice !== null);

// "Best" weighs price against travel time and connections, the way travellers trade them off.
function bestScore(fl, minPrice, minDur) {
  const p = minPrice > 0 ? fl.price / minPrice : 1;
  const d = minDur > 0 && fl.duration ? fl.duration / minDur : 1;
  return p * 0.6 + d * 0.3 + fl.stops * 0.1;
}

// Base-fare-only prices rise at fare-confirm; the results page lists them in their own section.
export function sortFlights(flights, sortBy) {
  const list = [...flights];
  const full = list.filter((f) => f.taxesIncluded);
  const minPrice = Math.min(...(full.length ? full : list).map((f) => f.price));
  const minDur = Math.min(...list.map((f) => f.duration || Infinity));
  const cmp = {
    cheapest: (a, b) => a.price - b.price || (a.duration || 0) - (b.duration || 0),
    fastest: (a, b) => (a.duration || Infinity) - (b.duration || Infinity) || a.price - b.price,
    best: (a, b) => bestScore(a, minPrice, minDur) - bestScore(b, minPrice, minDur),
    earliest: (a, b) => String(a.departure).localeCompare(String(b.departure)),
    latest: (a, b) => String(b.departure).localeCompare(String(a.departure)),
    arrEarliest: (a, b) => String(a.arrival).localeCompare(String(b.arrival)),
    arrLatest: (a, b) => String(b.arrival).localeCompare(String(a.arrival)),
  }[sortBy] || ((a, b) => a.price - b.price);
  return list.sort(cmp);
}

// ── Search URL ─────────────────────────────────────────────────────────────
// /{lang}/flights/RUH-JED/2026-10-29/2026-10-30/Economy/1Adult-0Child-0Infant

export function buildSearchUrl(lang, s) {
  const pax = `${s.adults}Adult-${s.children}Child-${s.infants}Infant`;
  const parts = [`${s.origin}-${s.destination}`, s.departDate, s.returnDate, s.cabin, pax].filter(Boolean);
  const query = [s.directOnly && 'direct=1', s.bagsOnly && 'bags=1'].filter(Boolean).join('&');
  return `/${lang}/flights/${parts.join('/')}${query ? `?${query}` : ''}`;
}

// The filters a search opens with: the landing form's "Direct flights" / "Included baggage" boxes.
export const startFilters = (s) => ({
  ...EMPTY_FILTERS,
  ...(s?.directOnly ? { maxStops: 0 } : {}),
  ...(s?.bagsOnly ? { baggageOnly: true } : {}),
});

export function parseSearchSlug(slug = []) {
  const [origin = '', destination = ''] = (slug[0] || '').toUpperCase().split('-');
  const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '');
  const pax = slug.find((s) => /\d+Adult/i.test(s)) || '';
  const count = (re, fallback) => {
    const m = pax.match(re);
    return m ? Number(m[1]) : fallback;
  };
  return {
    origin,
    destination,
    departDate: isDate(slug[1]) ? slug[1] : '',
    returnDate: isDate(slug[2]) ? slug[2] : '',
    cabin: slug.find((s) => CABINS.includes(s)) || 'Economy',
    adults: count(/(\d+)Adult/i, 1),
    children: count(/(\d+)Child/i, 0),
    infants: count(/(\d+)Infant/i, 0),
  };
}
