// lib/flights/checkoutFlow.js — the flight checkout calls, in the order the backend requires them:
// start → passengers → hold → (customer pays at Moyasar) → pay → ticket.
//
// The amount charged is never computed here. After the hold the airline has confirmed the fare and
// the order's total_amount is the only figure the backend will accept for payment (it refuses any
// other amount with AMOUNT_MISMATCH).

import { apiRequest, setAuthToken, isAuthenticated, newIdempotencyKey } from '@/lib/akbarBookingApi';
import { resolveCountryCode } from '@/lib/countries';

const post = (path, body, prefix) =>
  apiRequest(path, { method: 'POST', body: JSON.stringify(body), idempotencyKey: newIdempotencyKey(prefix) });

const data = (res) => res?.data || res || {};

/** Creates the order. A guest gets a token scoped to this one booking. */
export async function startBooking(selection, contact) {
  const base = {
    offer_id: selection.offerId,
    search_id: selection.searchId || undefined,
    selected_offer_ids: selection.selectedOfferIds?.length ? selection.selectedOfferIds : undefined,
  };
  const account = isAuthenticated();
  const res = account
    ? await post('/v2/akbar/bookings/start', base, 'idem-start')
    : await post('/v2/akbar/bookings/start-guest', {
        ...base,
        email: contact.email,
        first_name: contact.firstName,
        last_name: contact.lastName,
        mobile: contact.phone,
      }, 'idem-start-guest');

  const d = data(res);
  if (d.token) setAuthToken(d.token, 'guest');
  if (!d.order_reference) throw Object.assign(new Error('No booking reference was returned.'), { code: 'NO_REFERENCE' });
  return d;
}

export function addPassengers(ref, travellers, contact) {
  return post('/v2/akbar/bookings/passengers', {
    order_reference: ref,
    passengers: travellers.map((p) => ({
      passenger_type: p.type,
      title: p.title,
      first_name: p.firstName.trim(),
      last_name: p.lastName.trim(),
      date_of_birth: p.dateOfBirth,
      gender: p.gender,
      nationality: resolveCountryCode(p.nationality),
      document_type: 'passport',
      passport_number: p.passportNumber.trim().toUpperCase(),
      passport_expiry: p.passportExpiry,
      document_issuing_country: resolveCountryCode(p.issuingCountry),
      // Only sent when chosen; some airlines require it (the hold says which passenger).
      ...(p.visaType ? { visa_type: p.visaType } : {}),
      email: contact.email,
      phone: contact.phone,
    })),
  }, 'idem-passengers').then(data);
}

/** Asks the airline to hold the seats and confirm the fare. */
export const holdBooking = (ref) => post('/v2/akbar/bookings/hold', { order_reference: ref, hold_duration: 30 }, 'idem-hold').then(data);

export const retrieveBooking = (ref) => apiRequest(`/v2/akbar/bookings/${encodeURIComponent(ref)}`).then(data);

/** Hands the Moyasar payment to the backend, which verifies it and issues the ticket. */
export const payBooking = (ref, paymentId) => post('/v2/akbar/bookings/pay', { order_reference: ref, payment_id: paymentId }, 'idem-pay').then(data);

export const bookingTotal = (b) => Number(b?.total_amount ?? b?.customer_total_amount ?? 0);

export const isTicketed = (b) => String(b?.booking_status || '').toUpperCase() === 'TICKETED'
  || String(b?.ticket_status || '').toUpperCase() === 'TICKETED'
  || (Array.isArray(b?.tickets) && b.tickets.length > 0);

const MESSAGES = {
  en: {
    OFFER_NOT_FOUND: 'This fare is no longer available. Please search again for the latest prices.',
    OFFER_EXPIRED: 'This fare is no longer available. Please search again for the latest prices.',
    INVALID_SELECTION: 'Your flight selection has expired. Please search again.',
    AMOUNT_MISMATCH: 'Your payment did not match the booking total, so no ticket was issued. Please contact support with your booking reference to have it refunded or completed.',
    PAYMENT_NOT_COMPLETED: 'Your bank has not confirmed the payment yet. Please complete the verification step and try again.',
    PAYMENT_VERIFICATION_UNAVAILABLE: 'We could not reach the payment provider to confirm your payment. No ticket was issued yet — please try again in a moment.',
    SANDBOX_TICKETING_NOT_CONFIGURED: 'Payment received, but ticketing is disabled in this test environment (AKBAR_SANDBOX_TICKETING is off on the server).',
    TICKETING_FAILED: 'Your payment was received, but the airline has not issued the ticket yet. Our team has been alerted and will issue it or refund you — keep your booking reference.',
    BOOKING_LOCKED: 'Traveller details can no longer be changed on this booking.',
    BOOKING_SCOPE_FORBIDDEN: 'Your session expired. Please refresh the page and try again.',
    NETWORK: 'We could not reach the booking service. Check your connection and try again.',
  },
  ar: {
    OFFER_NOT_FOUND: 'لم يعد هذا السعر متاحاً. يرجى البحث مجدداً للحصول على أحدث الأسعار.',
    OFFER_EXPIRED: 'لم يعد هذا السعر متاحاً. يرجى البحث مجدداً للحصول على أحدث الأسعار.',
    INVALID_SELECTION: 'انتهت صلاحية اختيارك للرحلة. يرجى البحث مجدداً.',
    AMOUNT_MISMATCH: 'مبلغ الدفع لا يطابق إجمالي الحجز، لذلك لم تُصدر التذكرة. يرجى التواصل مع الدعم مع رقم الحجز.',
    PAYMENT_NOT_COMPLETED: 'لم يؤكد البنك عملية الدفع بعد. يرجى إكمال خطوة التحقق والمحاولة مرة أخرى.',
    PAYMENT_VERIFICATION_UNAVAILABLE: 'تعذر الوصول إلى مزود الدفع لتأكيد العملية. لم تُصدر التذكرة بعد، حاول مرة أخرى بعد قليل.',
    SANDBOX_TICKETING_NOT_CONFIGURED: 'تم استلام الدفع، لكن إصدار التذاكر معطل في بيئة الاختبار.',
    TICKETING_FAILED: 'تم استلام الدفع، لكن شركة الطيران لم تُصدر التذكرة بعد. تم إبلاغ فريقنا وسيقوم بإصدارها أو استرداد المبلغ — احتفظ برقم الحجز.',
    BOOKING_LOCKED: 'لا يمكن تعديل بيانات المسافرين في هذا الحجز.',
    BOOKING_SCOPE_FORBIDDEN: 'انتهت الجلسة. يرجى تحديث الصفحة والمحاولة مرة أخرى.',
    NETWORK: 'تعذر الوصول إلى خدمة الحجز. تحقق من الاتصال وحاول مرة أخرى.',
  },
};

/** A message the customer can act on. Validation messages from the server are already specific. */
export function friendlyError(err, lang) {
  const m = MESSAGES[lang === 'ar' ? 'ar' : 'en'];
  if (err?.name === 'TypeError') return m.NETWORK;
  return m[err?.code] || err?.message || m.NETWORK;
}

export const isExpiredSelection = (err) => ['OFFER_NOT_FOUND', 'OFFER_EXPIRED', 'SEARCH_EXPIRED', 'QUOTE_EXPIRED', 'INVALID_SELECTION'].includes(err?.code);
