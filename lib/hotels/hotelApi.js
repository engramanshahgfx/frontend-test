// lib/hotels/hotelApi.js — hotel calls for the website (search → hotel → hold → pay → status).
//
// Prices from the backend are already what the customer pays (SAR, markup and service fee
// included). Nothing here computes or sends an amount: the hold is priced on the server and the
// payment is checked against that hold's own total.

import { getAuthToken } from '@/lib/akbarBookingApi';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('tilalr.com') || window.location.hostname.includes('vercel.app')) {
      return 'https://backend-test-til.tilalr.com/api';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://backend-test-til.tilalr.com/api';
};

export class HotelApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const token = typeof window !== 'undefined' ? getAuthToken() : null;
  let res;
  try {
    res = await fetch(`${getBaseUrl()}/v2/akbar/hotels${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new HotelApiError('We could not reach the booking service. Check your connection and try again.', 'NETWORK', 0);
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok || json?.status === 'error') {
    const validation = json?.errors ? Object.values(json.errors).flat()[0] : null;
    throw new HotelApiError(validation || json?.message || 'Something went wrong. Please try again.', json?.code || (validation ? 'VALIDATION' : 'HTTP_' + res.status), res.status);
  }
  return json;
}

export const hotelApi = {
  autosuggest: (term, signal) => request(`/autosuggest?term=${encodeURIComponent(term)}`, { signal }),

  initSearch: (payload) => request('/search/init', { method: 'POST', body: payload }),

  results: (searchId, tracingKey, signal) =>
    request(`/search/${encodeURIComponent(searchId)}/hotels`, { headers: { 'search-tracing-key': tracingKey || '' }, signal }),

  details: (searchId, hotelId, tracingKey, signal) =>
    request(`/search/${encodeURIComponent(searchId)}/hotels/${encodeURIComponent(hotelId)}`, {
      headers: { 'search-tracing-key': tracingKey || '' },
      signal,
    }),

  hold: (payload) => request('/checkout/hold', { method: 'POST', body: payload }),

  pay: (transactionId, token, paymentId) =>
    request('/checkout/pay', { method: 'POST', body: { transaction_id: transactionId, token, payment_id: paymentId } }),

  booking: (transactionId, token) =>
    request(`/checkout/${encodeURIComponent(transactionId)}`, { headers: { 'X-Booking-Token': token || '' } }),
};

export default hotelApi;
