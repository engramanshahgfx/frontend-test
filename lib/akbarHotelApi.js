// lib/akbarHotelApi.js — Benzy WRC / Akbar Hotel API v2 Frontend Client

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('tilalr.com') || window.location.hostname.includes('vercel.app')) {
      return 'https://backend-test-til.tilalr.com/api';
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://backend-test-til.tilalr.com/api';
};

const getLang = () => {
  if (typeof window !== 'undefined') {
    const parts = window.location.pathname.split('/');
    if (parts[1] === 'ar' || parts[1] === 'en') return parts[1];
    return document.documentElement.lang || 'en';
  }
  return 'en';
};

class AkbarHotelApiClient {
  constructor() {
    this.baseUrl = getBaseUrl() + '/v2/akbar/hotels';
  }

  async request(endpoint, method = 'GET', data = null, headers = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const lang = getLang();

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': lang,
        ...headers,
      },
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const json = await response.json();
      return {
        status: response.status,
        ok: response.ok,
        data: json,
      };
    } catch (err) {
      return {
        status: 500,
        ok: false,
        data: {
          status: 'error',
          message: err.message || 'Failed to connect to backend API server.'
        }
      };
    }
  }

  // 1. AutoSuggest Cities & Locations
  autosuggest(term) {
    return this.request(`/autosuggest?term=${encodeURIComponent(term)}`);
  }

  // 2. Init Hotel Search
  initSearch(payload) {
    return this.request('/search/init', 'POST', payload);
  }

  // 3. Get Hotel Result Content
  getResultContent(searchId, tracingKey, limit = 50, offset = -1) {
    return this.request(`/search/result/${searchId}/content?limit=${limit}&offset=${offset}`, 'GET', null, {
      'search-tracing-key': tracingKey
    });
  }

  // 4. Get Hotel Result Rates
  getResultRates(searchId, tracingKey) {
    return this.request(`/search/result/${searchId}/rate`, 'GET', null, {
      'search-tracing-key': tracingKey
    });
  }

  // 5. Filter Hotel Results
  filterResults(searchId, tracingKey, filters, limit = 50, offset = 0) {
    return this.request(`/search/result/${searchId}?limit=${limit}&offset=${offset}`, 'POST', { filters }, {
      'search-tracing-key': tracingKey
    });
  }

  // 6. Get Available Rooms for Hotel
  getRooms(searchId, tracingKey, hotelId) {
    return this.request(`/search/result/${searchId}/hotels/${hotelId}/rooms`, 'GET', null, {
      'search-tracing-key': tracingKey
    });
  }

  // 7. SmartPricer - Revalidate Rate
  revalidateRate(searchId, tracingKey, hotelId, provider, recommendationId) {
    return this.request(`/search/result/${searchId}/hotels/${hotelId}/rooms/${provider}/price/${recommendationId}`, 'GET', null, {
      'search-tracing-key': tracingKey
    });
  }

  // 8. Create Itinerary (Issue Hold Booking BO0)
  createItinerary(payload, tracingKey) {
    return this.request('/itinerary/create', 'POST', payload, {
      'search-tracing-key': tracingKey
    });
  }

  // 9. Book & Pay Hotel Reservation (State TO1 / CONFIRMED)
  bookAndPay(transactionId, idempotencyKey = null) {
    const headers = {};
    if (idempotencyKey) {
      headers['X-Idempotency-Key'] = idempotencyKey;
    }
    return this.request('/book-and-pay', 'POST', {
      transaction_id: transactionId,
      idempotency_key: idempotencyKey
    }, headers);
  }

  // 10. Retrieve Booking Voucher
  retrieveBooking(transactionId) {
    return this.request(`/booking/retrieve/${encodeURIComponent(transactionId)}`);
  }

  // 11. Cancel Hotel Booking
  cancelBooking(transactionId, reason = '') {
    return this.request('/booking/cancel', 'POST', {
      transaction_id: transactionId,
      reason
    });
  }
}

export const akbarHotelApi = new AkbarHotelApiClient();
