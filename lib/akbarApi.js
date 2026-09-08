// lib/akbarApi.js — Akbar Travels B2B API Client

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

class AkbarApiClient {
  constructor() {
    this.baseUrl = getBaseUrl() + '/v2/akbar';
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
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: err.message || 'Failed to connect to backend API server.'
          }
        }
      };
    }
  }

  search(criteria) {
    return this.request('/search', 'POST', criteria);
  }

  fareConfirm(searchId, supplierOfferId) {
    return this.request('/fare-confirm', 'POST', {
      search_id: searchId,
      supplier_offer_id: supplierOfferId
    });
  }

  addPassengers(orderId, passengers) {
    return this.request('/add-passengers', 'POST', {
      order_id: orderId,
      passengers
    });
  }

  hold(orderId) {
    return this.request('/hold', 'POST', { order_id: orderId });
  }

  bookAndPay(orderId) {
    return this.request('/book-and-pay', 'POST', { order_id: orderId });
  }

  fareConfirmAfterHold(orderId) {
    return this.request('/fare-confirm-hold', 'POST', { order_id: orderId });
  }

  bookAfterHold(orderId) {
    return this.request('/book-after-hold', 'POST', { order_id: orderId });
  }

  retrieve(orderId) {
    return this.request(`/retrieve/${orderId}`, 'GET');
  }

  getBundles(offerId) {
    return this.request(`/bundles/${offerId}`, 'GET');
  }

  getAgencyBalance() {
    return this.request('/agency-balance', 'GET');
  }

  getAirports(query = '') {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return this.request(`/airports${q}`, 'GET');
  }
}

export const akbarApi = new AkbarApiClient();
export default akbarApi;
