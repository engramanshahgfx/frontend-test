// lib/hotels/hotelModel.js — hotel search state, URL format, filters and sorting.
//
// The URL is the source of truth for a search so a results page can be shared and reloaded:
//   /{lang}/hotels?q=Riyadh&lid=214178&lat=24.71&lng=46.67&cc=SA&in=2026-12-15&out=2026-12-17&rooms=2_1-5&nat=SA
// rooms: one entry per room separated by "_": adults, then each child's age, joined by "-".

import { addDays, todayISO, parseISODate } from '@/lib/flights/offerModel';

export const MAX_ROOMS = 4;
export const MAX_ADULTS = 6;
export const MAX_CHILDREN = 4;

export const defaultRooms = () => [{ adults: 2, childAges: [] }];

export function encodeRooms(rooms) {
  return rooms.map((r) => [r.adults, ...r.childAges].join('-')).join('_');
}

export function decodeRooms(text) {
  const rooms = String(text || '')
    .split('_')
    .map((part) => part.split('-').map((n) => parseInt(n, 10)))
    .filter((nums) => nums.length && Number.isFinite(nums[0]) && nums[0] >= 1)
    .slice(0, MAX_ROOMS)
    .map(([adults, ...ages]) => ({
      adults: Math.min(adults, MAX_ADULTS),
      childAges: ages.filter((a) => Number.isFinite(a) && a >= 0 && a <= 17).slice(0, MAX_CHILDREN),
    }));
  return rooms.length ? rooms : defaultRooms();
}

export const guestCount = (rooms) => rooms.reduce((n, r) => n + r.adults + r.childAges.length, 0);

export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.round((parseISODate(checkOut) - parseISODate(checkIn)) / 86400000));
}

export function defaultDates() {
  const checkIn = addDays(todayISO(), 14);
  return { checkIn, checkOut: addDays(checkIn, 2) };
}

/** Search state from URLSearchParams (or a plain object), or null when there is no destination. */
export function parseSearch(params) {
  const get = (k) => (typeof params?.get === 'function' ? params.get(k) : params?.[k]) || '';
  const lat = parseFloat(get('lat'));
  const lng = parseFloat(get('lng'));
  if (!get('q') || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const today = todayISO();
  let checkIn = get('in');
  let checkOut = get('out');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || checkIn < today) checkIn = defaultDates().checkIn;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkOut) || checkOut <= checkIn) checkOut = addDays(checkIn, 1);
  return {
    destination: {
      name: get('q'),
      id: get('lid') || null,
      lat,
      lng,
      country: (get('cc') || '').toUpperCase(),
    },
    checkIn,
    checkOut,
    rooms: decodeRooms(get('rooms')),
    nationality: (get('nat') || 'SA').toUpperCase(),
  };
}

export function searchQuery(s) {
  const q = new URLSearchParams({
    q: s.destination.name,
    lat: String(s.destination.lat),
    lng: String(s.destination.lng),
    cc: s.destination.country || '',
    in: s.checkIn,
    out: s.checkOut,
    rooms: encodeRooms(s.rooms),
    nat: s.nationality || 'SA',
  });
  if (s.destination.id) q.set('lid', s.destination.id);
  return q.toString();
}

export const searchUrl = (lang, s) => `/${lang}/hotels?${searchQuery(s)}`;

/** Backend /search/init payload. */
export function initPayload(s) {
  return {
    geoCode: { lat: s.destination.lat, long: s.destination.lng },
    locationId: s.destination.id || null,
    currency: 'SAR',
    culture: 'en-US',
    checkIn: s.checkIn,
    checkOut: s.checkOut,
    rooms: s.rooms.map((r) => ({ adults: r.adults, children: r.childAges.length, childAges: r.childAges })),
    nationality: s.nationality || 'SA',
    countryOfResidence: s.nationality || 'SA',
    destinationCountryCode: s.destination.country || undefined,
  };
}

// ── Filters and sorting ───────────────────────────────────────────

export const EMPTY_FILTERS = {
  name: '',
  stars: [],
  minRating: 0,
  maxPrice: null,
  freeCancellation: false,
  breakfast: false,
  types: [],
};

export function applyFilters(hotels, f, nights) {
  const name = f.name.trim().toLowerCase();
  return hotels.filter((h) => {
    if (name && !h.name.toLowerCase().includes(name)) return false;
    if (f.stars.length && !f.stars.includes(Math.round(h.star_rating || 0))) return false;
    if (f.minRating && !(h.rating >= f.minRating)) return false;
    if (f.maxPrice != null && h.price_per_night_sar > f.maxPrice) return false;
    if (f.freeCancellation && !h.free_cancellation) return false;
    if (f.breakfast && !h.free_breakfast) return false;
    if (f.types.length && !f.types.includes(h.property_type || 'Other')) return false;
    return true;
  });
}

export const activeFilterCount = (f) =>
  (f.name.trim() ? 1 : 0) + f.stars.length + (f.minRating ? 1 : 0) + (f.maxPrice != null ? 1 : 0) +
  (f.freeCancellation ? 1 : 0) + (f.breakfast ? 1 : 0) + f.types.length;

export const SORTS = ['recommended', 'price', 'priceDesc', 'stars', 'rating', 'distance'];

export function sortHotels(hotels, by) {
  const list = [...hotels];
  const num = (v, d) => (Number.isFinite(v) ? v : d);
  switch (by) {
    case 'price':
      return list.sort((a, b) => a.price_sar - b.price_sar);
    case 'priceDesc':
      return list.sort((a, b) => b.price_sar - a.price_sar);
    case 'stars':
      return list.sort((a, b) => num(b.star_rating, 0) - num(a.star_rating, 0) || a.price_sar - b.price_sar);
    case 'rating':
      return list.sort((a, b) => num(b.rating, 0) - num(a.rating, 0) || num(b.review_count, 0) - num(a.review_count, 0));
    case 'distance':
      return list.sort((a, b) => num(a.distance_km, 1e9) - num(b.distance_km, 1e9));
    default:
      // Recommended: hotels with a picture and reviews first, then by price within the same star level.
      return list.sort((a, b) => score(b) - score(a) || a.price_sar - b.price_sar);
  }
}

function score(h) {
  return (h.image ? 2 : 0) + (h.rating ? Math.min(h.rating, 5) / 2 : 0) + (h.star_rating ? h.star_rating / 5 : 0) + (h.free_cancellation ? 0.5 : 0);
}

// ── Session storage (selection and booking token survive the 3-D Secure redirect) ──

const safe = (fn, fallback = null) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const storage = {
  get: (key) => safe(() => JSON.parse(window.sessionStorage.getItem(key) || 'null')),
  set: (key, value) => safe(() => window.sessionStorage.setItem(key, JSON.stringify(value))),
  remove: (key) => safe(() => window.sessionStorage.removeItem(key)),
};

export const SELECTION_KEY = 'hotel_selection';
export const searchKey = (query) => `hotel_search:${query}`;
export const bookingKey = (txn) => `hotel_booking:${txn}`;

/** Stars as a string of filled glyphs, for compact display. */
export const starCount = (n) => Math.max(0, Math.min(5, Math.round(Number(n) || 0)));

export function ratingWord(rating, L) {
  if (!rating) return '';
  if (rating >= 4.5) return L.ratingExceptional;
  if (rating >= 4) return L.ratingExcellent;
  if (rating >= 3.5) return L.ratingVeryGood;
  if (rating >= 3) return L.ratingGood;
  return L.ratingFair;
}
