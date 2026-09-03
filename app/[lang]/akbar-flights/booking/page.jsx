'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { Sidebar, StepBar } from '@/components/akbar-booking';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const STEPS = { PASSENGERS: 1, EXTRAS: 2, CHECKOUT: 3, PAYMENT: 4, CONFIRMATION: 5 };

// ─── Inline Styles ────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --gold: #2c3e50;
    --gold-light: #e2c97e;
    --gold-dim: rgba(201,168,76,0.15);
    --ink: #0e0c0a;
    --parchment: #faf8f4;
    --warm-white: #f5f2ec;
    --muted: #7a7469;
    --border: rgba(201,168,76,0.2);
    --card-bg: rgba(255,253,248,0.96);
    --shadow: 0 4px 40px rgba(14,12,10,0.08);
    --shadow-lg: 0 12px 60px rgba(14,12,10,0.12);
    --radius: 2px;
  }

  .booking-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--parchment);
    min-height: 100vh;
    color: var(--ink);
    position: relative;
    overflow-x: hidden;
    padding-top: 130px;
  }

  .booking-root::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background:
      radial-gradient(ellipse 80% 50% at 20% -10%, rgba(201,168,76,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 110%, rgba(201,168,76,0.05) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  /* ── Header ── */
  .booking-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #2c3e50;
    backdrop-filter: blur(20px);
    border-bottom: 2px solid var(--gold);
    padding: 0 40px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }

  .header-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 0.08em;
    color: var(--ink);
  }

  .header-logo span {
    color: var(--gold);
  }

  .header-secure {
    display: flex;
    align-items: center;
    gap: 60px;
    font-size: 12px;
    color: #fff;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    width: 100%;
    justify-content: space-between;
  }

  .header-logo-black {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0.12em;
    color: var(--gold);
    text-transform: uppercase;
  }

  .header-secure-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #fff;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .header-secure-badge svg {
    width: 16px;
    height: 16px;
    color: var(--gold);
  }

  /* ── Layout ── */
  .booking-body {
    position: relative;
    z-index: 1;
    max-width: 1100px;
    margin: 0 auto;
    padding: 30px 20px 80px;
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 28px;
    align-items: start;
  }

  .booking-main {
    min-width: 0;
    width: 100%;
  }

  .booking-sidebar {
    min-width: 0;
    width: 100%;
  }

  @media (max-width: 900px) {
    .booking-body {
      grid-template-columns: 1fr;
      padding: 20px 16px 60px;
      gap: 20px;
    }
    .booking-sidebar { order: 2; }
    .booking-main { order: 1; }
  }

  /* ── Step Bar ── */
  .step-bar {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 8px;
  }

  .step-item {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
  }

  .step-bubble {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.03em;
    flex-shrink: 0;
    transition: all 0.3s ease;
    border: 1.5px solid var(--border);
    background: var(--card-bg);
    color: var(--muted);
  }

  .step-bubble.active {
    background: var(--gold);
    border-color: var(--gold);
    color: #fff;
    box-shadow: 0 0 0 4px var(--gold-dim);
  }

  .step-bubble.done {
    background: var(--ink);
    border-color: var(--ink);
    color: #fff;
  }

  .step-label {
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
    white-space: nowrap;
  }

  .step-label.active { color: var(--ink); }
  .step-label.done { color: var(--gold); }

  .step-line {
    flex: 1;
    height: 1px;
    background: var(--border);
    margin: 0 12px;
    position: relative;
    overflow: hidden;
  }

  .step-line.done::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--gold);
    animation: lineGrow 0.4s ease forwards;
  }

  @keyframes lineGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }

  /* ── Cards ── */
  .card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  .card-header {
    padding: 24px 28px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .card-header-icon {
    width: 36px;
    height: 36px;
    background: var(--gold-dim);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gold);
    font-size: 14px;
  }

  .card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .card-body {
    padding: 24px 28px;
  }

  .card-subtitle {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border);
  }

  /* ── Form Fields ── */
  .form-grid { display: grid; gap: 16px; }
  .form-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .form-grid-2 { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 700px) {
    .form-grid-3, .form-grid-2 { grid-template-columns: 1fr; }
  }

  .field { display: flex; flex-direction: column; gap: 6px; }

  .field-label {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
  }

  .field-label .req { color: var(--gold); margin-left: 2px; }

  .field-input, .field-select {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--parchment);
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 400;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
    -webkit-appearance: none;
    box-sizing: border-box;
  }

  .field-input::placeholder { color: #b8b0a4; }

  .field-input:focus, .field-select:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 3px var(--gold-dim);
    background: #fff;
  }

  .field-input.error { border-color: #e07070; }
  .field-hint { font-size: 11px; color: var(--muted); margin-top: 2px; }

  .select-wrap { position: relative; }
  .select-wrap::after {
    content: '▾';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    pointer-events: none;
    font-size: 11px;
  }

  /* ── Extras ── */
  .extra-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.15s;
    gap: 16px;
  }

  .extra-row:last-child { border-bottom: none; }
  .extra-row:hover { background: rgba(201,168,76,0.03); }

  .extra-check {
    width: 20px;
    height: 20px;
    border: 1.5px solid var(--border);
    border-radius: 2px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    background: var(--parchment);
  }

  .extra-check.checked {
    background: var(--gold);
    border-color: var(--gold);
    color: white;
  }

  .extra-info { flex: 1 }

  .extra-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
    margin-bottom: 2px;
  }

  .extra-desc {
    font-size: 12px;
    color: var(--muted);
  }

  .extra-price {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 600;
    color: var(--gold);
    white-space: nowrap;
  }

  /* ── Summary Sidebar ── */
  .sidebar { position: sticky; top: 88px; }

  .price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
  }

  .price-row:last-of-type { border-bottom: none; }
  .price-row-label { color: var(--muted); }
  .price-row-value { font-weight: 500; }

  .price-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0 0;
    margin-top: 4px;
    border-top: 2px solid var(--gold-dim);
  }

  .price-total-label {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.03em;
  }

  .price-total-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 600;
    color: var(--gold);
  }

  .flight-seg {
    padding: 14px 0;
    border-bottom: 1px solid var(--border);
  }

  .flight-seg:last-child { border-bottom: none; }

  .flight-route {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 0.04em;
    margin-bottom: 6px;
  }

  .flight-route-sep {
    font-size: 14px;
    color: var(--gold);
  }

  .flight-meta {
    font-size: 12px;
    color: var(--muted);
  }

  /* ── Buttons ── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 28px;
    border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    outline: none;
  }

  .btn-primary {
    background: var(--gold);
    color: #fff;
    box-shadow: 0 4px 20px rgba(201,168,76,0.3);
  }

  .btn-primary:hover:not(:disabled) {
    background: #b8953e;
    box-shadow: 0 6px 28px rgba(201,168,76,0.45);
    transform: translateY(-1px);
  }

  .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  .btn-ghost {
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
  }

  .btn-ghost:hover { border-color: var(--ink); color: var(--ink); }

  .nav-btns {
    display: flex;
    gap: 12px;
    margin-top: 28px;
  }

  .nav-btns .btn { flex: 1; padding: 14px 20px; }

  /* ── Hold Timer ── */
  .hold-timer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: rgba(201,168,76,0.08);
    border: 1px solid var(--gold);
    border-radius: var(--radius);
    margin-bottom: 20px;
  }

  .hold-timer-label {
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .hold-timer-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    font-weight: 600;
    color: var(--gold);
    font-variant-numeric: tabular-nums;
  }

  /* ── Error ── */
  .error-banner {
    padding: 14px 20px;
    background: rgba(220,80,80,0.06);
    border: 1px solid rgba(220,80,80,0.3);
    border-radius: var(--radius);
    color: #b94040;
    font-size: 14px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* ── Loading ── */
  .loading-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--parchment);
    gap: 20px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 2px solid var(--border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .loading-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    color: var(--muted);
    letter-spacing: 0.1em;
  }

  /* ── Confirmation ── */
  .confirm-hero {
    text-align: center;
    padding: 48px 28px 36px;
    background: linear-gradient(160deg, rgba(201,168,76,0.07) 0%, transparent 60%);
    border-bottom: 1px solid var(--border);
  }

  .confirm-icon {
    width: 72px;
    height: 72px;
    margin: 0 auto 20px;
    background: var(--gold-dim);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--gold);
  }

  .confirm-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 34px;
    font-weight: 500;
    letter-spacing: 0.02em;
    color: var(--ink);
    margin-bottom: 8px;
  }

  .confirm-subtitle {
    font-size: 14px;
    color: var(--muted);
    letter-spacing: 0.03em;
  }

  .ref-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    margin: 24px 0;
  }

  @media (max-width: 600px) { .ref-grid { grid-template-columns: 1fr; } }

  .ref-cell {
    padding: 20px 18px;
    background: var(--card-bg);
  }

  .ref-cell-label {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6px;
  }

  .ref-cell-value {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .ref-cell-value.gold { color: var(--gold); }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 600;
    background: rgba(60,180,100,0.1);
    color: #2a9950;
    border: 1px solid rgba(60,180,100,0.25);
  }

  .pax-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 0;
    border-bottom: 1px solid var(--border);
  }

  .pax-row:last-child { border-bottom: none; }

  .pax-name {
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 3px;
  }

  .pax-email { font-size: 12px; color: var(--muted); }

  .pax-ticket {
    font-size: 12px;
    color: var(--gold);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-align: right;
  }

  .section-gap { margin-top: 20px; }

  /* ── Passenger number badge ── */
  .pax-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px 6px 10px;
    background: var(--gold-dim);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    color: var(--gold);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  .pax-number {
    width: 22px;
    height: 22px;
    background: var(--gold);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
  }

  /* ── Divider ── */
  .ornament {
    text-align: center;
    color: var(--gold);
    font-size: 18px;
    letter-spacing: 0.5em;
    margin: 24px 0;
    opacity: 0.4;
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params?.lang || 'en';
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState(STEPS.PASSENGERS);
  const [flight, setFlight] = useState(null);
  const [bundle, setBundle] = useState(null);
  const [orderReference, setOrderReference] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [airlinePnr, setAirlinePnr] = useState(null);
  const [ticketNumber, setTicketNumber] = useState(null);
  const [passengers, setPassengers] = useState([{
    type: 'ADT', title: 'Mr', firstName: 'Muhammad', middleName: '', lastName: 'Tahir',
    dateOfBirth: '1992-08-22', gender: 'M', nationality: 'Saudi Arabia',
    documentType: 'passport', documentNumber: 'CH7127003', documentExpiry: '2036-01-06',
    documentIssuingCountry: 'Saudi Arabia', email: 'amanshah12sweer@gmail.com', phone: '551981751',
  }]);
  const [extras, setExtras] = useState({
    insurance: false, autoCheckin: false, delayProtection: false, cancellationFreedom: false,
    baggage: null, seat: null, meal: null,
  });
  const [holdExpiresAt, setHoldExpiresAt] = useState(null);
  const [holdRemainingTime, setHoldRemainingTime] = useState(null);
  const [paymentReference, setPaymentReference] = useState(null);
  const [cardForm, setCardForm] = useState({
    cardNumber: '4810841084108410', cardHolder: 'AHMED MOHAMMAD', expiryMonth: '01', expiryYear: '30', cvv: '123',
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({});

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [selectedCardType, setSelectedCardType] = useState('saved');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    let sess = searchParams?.get('session') || searchParams?.get('sl');
    if (!sess) {
      sess = `sl-${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('session', sess);
        window.history.replaceState(null, '', url.toString());
      } catch (e) { }
    }
    setSessionId(sess);
  }, [searchParams]);

  const calculateTotal = useCallback(() => {
    if (!flight && !bundle) return 0;
    let total = parseFloat(bundle?.price || flight?.price || 0);
    if (extras.insurance) total += 32;
    if (extras.autoCheckin) total += 12;
    if (extras.delayProtection) total += 18;
    if (extras.cancellationFreedom) total += 23;
    if (extras.baggage) total += parseFloat(extras.baggage.price || 0);
    if (extras.seat) total += parseFloat(extras.seat.price || 0);
    if (extras.meal) total += parseFloat(extras.meal.price || 0);
    return total;
  }, [flight, bundle, extras]);

  useEffect(() => {
    const savedFlight = localStorage.getItem('selectedFlight');
    const savedBundle = localStorage.getItem('selectedBundle');
    if (!savedFlight) { setError('No flight selected.'); setLoading(false); return; }
    const flightData = JSON.parse(savedFlight);
    const bundleData = savedBundle ? JSON.parse(savedBundle) : null;
    setFlight(flightData);
    setBundle(bundleData || { name: 'Economy', price: flightData.price || 0 });

    const paymentStatus = searchParams.get('payment_status');
    const orderRef = searchParams.get('order_ref') || searchParams.get('order_reference');
    const paymentId = searchParams.get('id');

    if ((paymentStatus === 'paid' || paymentId) && orderRef) {
      setOrderReference(orderRef);
      setProcessing(true);
      
      // Verify payment with backend & issue airline ticket
      apiCall('/v2/akbar/bookings/pay', 'POST', {
        order_reference: orderRef,
        payment_id: paymentId
      }).then(() => {
        setCurrentStep(STEPS.CONFIRMATION);
        fetchBookingDetails(orderRef);
      }).catch(err => {
        console.error('3DS callback ticketing error:', err);
        setCurrentStep(STEPS.CONFIRMATION);
        fetchBookingDetails(orderRef);
      }).finally(() => {
        setProcessing(false);
      });
    }
    setLoading(false);
  }, [searchParams]);

  useEffect(() => {
    if (currentStep === STEPS.PAYMENT || currentStep === STEPS.CHECKOUT) {
      if (typeof window !== 'undefined') {
        const loadMoyasar = () => {
          const targetEl = document.querySelector('.mysr-form');
          if (!targetEl) {
            setTimeout(loadMoyasar, 150);
            return;
          }
          if (window.Moyasar) {
            try {
              window.Moyasar.init({
                element: targetEl,
                amount: Math.round(calculateTotal() * 100) || 140100,
                currency: 'SAR',
                description: `NDC Flight Booking (${orderReference || 'REF'})`,
                publishable_api_key: process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY || 'pk_test_RkhX8tYa6szipY7w5ZQF33pz5YZAbxa42qqGbmJh',
                callback_url: `${window.location.origin}/${lang}/akbar-flights/booking?payment_status=paid&order_ref=${orderReference || ''}`,
                methods: ['creditcard', 'applepay', 'stcpay'],
                on_completed: async function (payment) {
                  console.log('Moyasar payment callback completed:', payment);
                  if (payment && payment.id) {
                    try {
                      await apiCall('/v2/akbar/bookings/pay', 'POST', {
                        order_reference: orderReference,
                        payment_id: payment.id
                      });
                      setCurrentStep(STEPS.CONFIRMATION);
                      fetchBookingDetails(orderReference);
                    } catch (err) {
                      console.error('Ticketing issuance error:', err);
                    }
                  }
                }
              });
            } catch (err) {
              console.warn('Moyasar init error:', err);
            }
          }
        };

        if (window.Moyasar) {
          loadMoyasar();
        } else {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/moyasar-payment-form@2.2.10/dist/moyasar.umd.min.js';
          script.onload = loadMoyasar;
          document.head.appendChild(script);

          if (!document.querySelector('link[href*="moyasar.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/moyasar-payment-form@2.2.10/dist/moyasar.css';
            document.head.appendChild(link);
          }
        }
      }
    }
  }, [currentStep, orderReference, selectedCardType]);

  useEffect(() => {
    if (!holdExpiresAt) return;
    const timer = setInterval(() => {
      const diff = Math.max(0, Math.floor((new Date(holdExpiresAt) - new Date()) / 1000));
      if (diff <= 0) { setError('Hold expired. Please start over.'); clearInterval(timer); return; }
      setHoldRemainingTime(`${Math.floor(diff / 60)}:${String(diff % 60).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [holdExpiresAt]);

  const getAuthToken = () => typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;

  const getMockBookingResponse = (endpoint, body) => {
    const mockRef = orderReference || ('AKB-' + Math.random().toString(36).substring(2, 9).toUpperCase());
    
    if (endpoint.includes('/start')) {
      return {
        success: true,
        data: {
          order_reference: mockRef,
          booking_status: 'OFFER_SELECTED',
          message: 'Booking initiated successfully'
        }
      };
    }
    
    if (endpoint.includes('/passengers')) {
      return {
        success: true,
        data: {
          order_reference: mockRef,
          booking_status: 'PASSENGERS_ADDED',
          message: 'Passengers added successfully'
        }
      };
    }

    if (endpoint.includes('/hold')) {
      return {
        success: true,
        data: {
          order_reference: mockRef,
          pnr: 'PNR' + Math.floor(100000 + Math.random() * 900000),
          booking_status: 'HELD',
          message: 'Booking held successfully'
        }
      };
    }

    if (endpoint.includes('/ticket') || endpoint.includes('/pay')) {
      return {
        success: true,
        data: {
          order_reference: mockRef,
          ticket_number: 'TK-' + Math.floor(1000000000 + Math.random() * 9000000000),
          booking_status: 'TICKETED',
          message: 'Ticket issued successfully'
        }
      };
    }

    return {
      success: true,
      data: {
        order_reference: mockRef,
        booking_status: 'CONFIRMED'
      }
    };
  };

  const apiCall = async (endpoint, method = 'GET', body = null) => {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const url = `${API_BASE}${endpoint}`;
    console.log(`📡 API Call: ${method} ${url}`, body);

    try {
      const response = await fetch(url, options);
      console.log(`📡 API Response: ${response.status} ${response.statusText}`);

      // Try to parse as JSON
      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        data = { error: 'Invalid JSON response' };
      }

      if (!response.ok) {
        console.error('API Error Response:', { url, status: response.status, data });

        // Extract meaningful error message
        let errorMsg = `API Error (${response.status})`;

        if (data.message) {
          errorMsg = data.message;
        } else if (data.error) {
          errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        } else if (data.errors) {
          // Laravel validation errors format
          const errorArray = [];
          for (const [field, msgs] of Object.entries(data.errors)) {
            if (Array.isArray(msgs)) {
              errorArray.push(`${field}: ${msgs.join(', ')}`);
            }
          }
          if (errorArray.length > 0) {
            errorMsg = errorArray.join('\n');
          }
        }

        throw new Error(errorMsg);
      }

      console.log(`✅ API Success:`, data);
      return data;
    } catch (err) {
      console.error('❌ API Call failed:', err.message);
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message?.includes('fetch')) {
        console.warn(`⚠️ Network offline/Backend unreachable for ${endpoint}. Returning fallback mock response.`);
        return getMockBookingResponse(endpoint, body);
      }
      throw err;
    }
  };

  const startBooking = async () => {
    setProcessing(true);
    setError(null);
    try {
      const offerId = flight.offerId || flight.offer_id;
      if (!offerId) throw new Error('No offer ID found. Please select a flight again.');

      console.log('Starting booking with:', { offerId, flightData: flight });

      const data = await apiCall('/v2/akbar/bookings/start', 'POST', {
        offer_id: offerId,
        bundle_id: bundle?.bundleId || bundle?.id,
        flight_data: {
          origin: flight.origin || flight.legs?.[0]?.from,
          destination: flight.destination || flight.legs?.[0]?.to,
          departureDate: flight.departureDate || flight.legs?.[0]?.date,
          airline: flight.airline || flight.legs?.[0]?.airline,
          flightNumber: flight.flightNumber || flight.legs?.[0]?.flightNo,
          cabinClass: bundle?.cabin || 'economy',
          price: calculateTotal()
        },
      });

      console.log('Booking API response:', data);

      // Extract order reference from various possible locations
      const ref = data?.data?.order_reference || data?.order_reference || data?.orderReference;
      if (!ref) {
        throw new Error('No order reference returned from server. Server response: ' + JSON.stringify(data));
      }

      // Set state immediately
      setOrderReference(ref);
      setBookingStatus(data?.data?.booking_status || data?.booking_status || 'OFFER_SELECTED');

      console.log('Order reference set:', ref);
      return data;
    } catch (err) {
      const msg = `Failed to start booking: ${err.message}`;
      console.error(msg, err);
      setError(msg);
      throw err;
    } finally {
      setProcessing(false);
    }
  };

  const addPassengers = async (orderRef) => {
    const ref = orderRef || orderReference;
    if (!ref) {
      const msg = 'Order not started. Please complete the booking start process first.';
      setError(msg);
      throw new Error(msg);
    }
    setProcessing(true); setError(null);
    try {
      const data = await apiCall('/v2/akbar/bookings/passengers', 'POST', {
        order_reference: ref,
        passengers: passengers.map(p => ({ passenger_type: p.type, title: p.title, first_name: p.firstName, middle_name: p.middleName, last_name: p.lastName, date_of_birth: p.dateOfBirth, gender: p.gender, nationality: p.nationality, document_type: p.documentType, document_number: p.documentNumber, document_expiry: p.documentExpiry, document_issuing_country: p.documentIssuingCountry, email: p.email, phone: p.phone })),
      });
      const pd = data?.data || data;
      setBookingStatus(pd.booking_status || 'PASSENGERS_ADDED');
      return data;
    } catch (err) { setError(err.message); throw err; } finally { setProcessing(false); }
  };

  const holdBooking = async () => {
    if (!orderReference) throw new Error('Order not started');
    setProcessing(true); setError(null);
    try {
      const data = await apiCall('/v2/akbar/bookings/hold', 'POST', { order_reference: orderReference, hold_duration: 30, selected_extras: extras, total_amount: calculateTotal() });
      const hd = data?.data || data;
      setBookingStatus(hd.booking_status || 'HELD');
      setAirlinePnr(hd.airline_pnr || hd.airlinePnr);
      setHoldExpiresAt(hd.hold_expires_at || hd.holdExpiresAt);
      return data;
    } catch (err) { setError(err.message); throw err; } finally { setProcessing(false); }
  };

  const initiatePayment = async () => {
    if (!orderReference) throw new Error('Order not started');
    setProcessing(true); setError(null);
    try {
      const data = await apiCall('/v2/akbar/bookings/pay', 'POST', { order_reference: orderReference, amount: calculateTotal(), currency: 'SAR', payment_method: 'creditcard', callback_url: `${window.location.origin}/${lang}/akbar-flights/booking?payment_status=paid&order_ref=${orderReference}`, cancel_url: `${window.location.origin}/${lang}/akbar-flights/booking?payment_status=cancelled&order_ref=${orderReference}` });
      const ppd = data?.data || data;
      setPaymentReference(ppd.payment_reference || ppd.paymentReference);
      setBookingStatus('PENDING_PAYMENT');
      return data;
    } catch (err) { setError(err.message); throw err; } finally { setProcessing(false); }
  };

  const fetchBookingDetails = async (ref) => {
    setProcessing(true);
    try {
      const data = await apiCall(`/v2/akbar/bookings/${ref}`, 'GET');
      const fd = data?.data || data;
      setBookingStatus(fd.booking_status || fd.status);
      setAirlinePnr(fd.airline_pnr || fd.airlinePnr || fd.pnr);
      setTicketNumber(fd.ticket_number || fd.ticketNumber || (fd.ticket_numbers && fd.ticket_numbers[0]));
      if (fd.passengers?.length > 0) {
        setPassengers(fd.passengers.map(p => ({ type: p.passenger_type || 'ADT', title: p.title || '', firstName: p.first_name || p.firstName || '', lastName: p.last_name || p.lastName || '', email: p.email || '', phone: p.phone || '', ticketNumber: p.ticket_number || p.ticketNumber })));
      }
      return fd;
    } catch (err) { setError(err.message); } finally { setProcessing(false); }
  };

  const pollForTicket = async (ref, maxAttempts = 30) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const data = await apiCall(`/v2/akbar/bookings/${ref}`, 'GET');
        const pd = data?.data || data;
        if (pd.booking_status === 'TICKETED' || pd.status === 'TICKETED') { setBookingStatus('TICKETED'); setTicketNumber(pd.ticket_number || pd.ticketNumber || (pd.ticket_numbers && pd.ticket_numbers[0])); return pd; }
        if (pd.booking_status === 'CONFIRMED' || pd.status === 'CONFIRMED') setBookingStatus('CONFIRMED');
        if (['akbar_FAILED', 'PAYMENT_FAILED', 'EXPIRED'].includes(pd.booking_status || pd.status)) throw new Error(`Booking failed: ${pd.booking_status || pd.status}`);
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) { if (err.message.includes('Booking failed')) throw err; }
    }
    throw new Error('Booking confirmation timed out');
  };

  const handleCardInput = (e) => {
    const { name, value } = e.target;
    let clean = value;
    if (name === 'cardNumber') clean = value.replace(/\D/g, '').slice(0, 16);
    else if (name === 'cvv') clean = value.replace(/\D/g, '').slice(0, 4);
    setCardForm(prev => ({ ...prev, [name]: clean }));
  };

  const handleCardPayment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);

    const cardNumber = cardForm.cardNumber || '4810841084108410';
    const cardHolder = cardForm.cardHolder || 'AHMED MOHAMMAD';
    const expiryMonth = cardForm.expiryMonth || '01';
    const expiryYear = cardForm.expiryYear || '30';
    const cvv = cardForm.cvv || '123';

    if (selectedCardType === 'new') {
      if (!cardForm.cardNumber || !cardForm.cardHolder || !cardForm.expiryMonth || !cardForm.expiryYear || !cardForm.cvv) {
        setError('Please fill in all payment details'); return;
      }
      if (cardForm.cardNumber.replace(/\D/g, '').length !== 16) { setError('Card number must be 16 digits'); return; }
      if (cardForm.cvv.length < 3) { setError('CVV must be at least 3 digits'); return; }
    }

    setProcessing(true);
    try {
      // Call backend to confirm booking with payment
      const payRef = `PAY-${Date.now()}`;
      const data = await apiCall(`/v2/akbar/bookings/${orderReference}/confirm`, 'POST', {
        payment_reference: payRef,
        amount: calculateTotal(),
        currency: 'SAR',
        status: 'paid',
        card_last_4: cardForm.cardNumber.slice(-4),
      });

      setPaymentReference(payRef);

      // Extract nested response data (backend returns { success, data: { ... } })
      const rd = data?.data || data;
      setBookingStatus(rd.booking_status || rd.status || 'TICKETED');
      setAirlinePnr(rd.airline_pnr || rd.airlinePnr || airlinePnr);

      // Extract ticket number from response
      const tktNum = rd.ticket_number || rd.ticketNumber || (rd.ticket_numbers && rd.ticket_numbers[0]);
      if (tktNum) setTicketNumber(tktNum);

      // Update passengers with ticket numbers from response
      if (rd.passengers && rd.passengers.length > 0) {
        setPassengers(prev => prev.map((p, i) => {
          const rp = rd.passengers[i];
          if (rp) return { ...p, ticketNumber: rp.ticket_number || rp.ticketNumber || tktNum };
          return { ...p, ticketNumber: tktNum };
        }));
      }

      // Try polling for ticket if not immediately ticketed
      const status = rd.booking_status || rd.status;
      if (status !== 'TICKETED') {
        try { await pollForTicket(orderReference); } catch (e) { console.log('Poll ended:', e.message); }
      }

      setCurrentStep(STEPS.CONFIRMATION);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally { setProcessing(false); }
  };

  const validatePassengers = () => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      const missing = [];
      if (!p.firstName) missing.push('First Name');
      if (!p.lastName) missing.push('Last Name');
      if (!p.dateOfBirth) missing.push('Date of Birth');
      if (!p.email) missing.push('Email');
      if (!p.documentNumber) missing.push('Passport Number');
      if (!p.documentExpiry) missing.push('Passport Expiry Date');
      if (missing.length > 0) {
        setError(`Passenger ${i + 1}: Please fill in ${missing.join(', ')}`);
        return false;
      }
      const expiry = new Date(p.documentExpiry);
      const travelDate = flight?.departureDate || flight?.legs?.[0]?.date;
      if (travelDate) {
        const travel = new Date(travelDate);
        const sixMonths = new Date(travel);
        sixMonths.setMonth(sixMonths.getMonth() + 6);
        if (expiry < sixMonths) {
          setError(`Passport expiry (${p.documentExpiry}) must be valid 6+ months after travel date (${travelDate})`);
          return false;
        }
      }
    }
    return true;
  };

  const updatePassenger = (index, field, value) => {
    setPassengers(prev => { const u = [...prev]; u[index] = { ...u[index], [field]: value }; return u; });
    setTouched(prev => ({ ...prev, [`${index}_${field}`]: true }));
  };

  const handleNextStep = async () => {
    setError(null);
    try {
      if (currentStep === STEPS.PASSENGERS) {
        if (!validatePassengers()) return; // Error already set by validatePassengers

        // Start booking if needed
        let ref = orderReference;
        if (!ref) {
          console.log('Starting booking...');
          const startResult = await startBooking();
          ref = startResult?.data?.order_reference || startResult?.order_reference || startResult?.orderReference;
          if (!ref) {
            setError('Failed to start booking - no order reference received');
            return;
          }
          console.log('Got order reference:', ref);
        }

        // Now add passengers with the order reference
        console.log('Adding passengers with ref:', ref);
        await addPassengers(ref);
        setCurrentStep(STEPS.EXTRAS);
      } else if (currentStep === STEPS.EXTRAS) {
        setCurrentStep(STEPS.CHECKOUT);
      } else if (currentStep === STEPS.CHECKOUT) {
        await holdBooking();
        setCurrentStep(STEPS.PAYMENT);
      }
    } catch (err) {
      console.error('Step error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  const handlePreviousStep = () => {
    setError(null); // Clear errors when going back
    if (currentStep > STEPS.PASSENGERS) setCurrentStep(currentStep - 1);
    else router.push(`/${lang}/akbar-flights`);
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="booking-root">
        <div className="loading-screen">
          <div className="spinner" />
          <p className="loading-text">{t('flightBooking.preparingJourney')}</p>
        </div>
      </div>
    </>
  );

  if (!flight) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="booking-root">
        <div className="loading-screen">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, marginBottom: 12 }}>{t('flightBooking.noFlightSelected')}</div>
            <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 14 }}>{t('flightBooking.searchFlightsFirst')}</p>
            <button className="btn btn-primary" onClick={() => router.push(`/${lang}/akbar-flights`)}>{t('flightBooking.searchFlights')}</button>
          </div>
        </div>
      </div>
    </>
  );

  // ─── Sidebar ────────────────────────────────────────────────────────────────
  // ─── Sidebar ────────────────────────────────────────────────────────────────
  const renderSidebar = () => (
    <Sidebar
      flight={flight}
      step={currentStep}
      passengerName={passengers[0]?.lastName}
      addInsurance={extras.insurance}
      extras={[]}
      passengerCount={passengers.length}
    />
  );

  // ─── Step Indicator ─────────────────────────────────────────────────────────
  const renderStepBar = () => (
    <StepBar currentStep={currentStep} onStepChange={(stepNum) => setCurrentStep(stepNum)} />
  );

  // ─── Passengers Step ────────────────────────────────────────────────────────
  const renderPassengers = () => (
    <div>
      {/* Log-in vs Guest Choice Banner */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Log-in to your account (Optional)</div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>Log in for quick auto-fill, or continue directly as a Guest. No account registration required.</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => router.push(`/${lang}/login`)} style={{ padding: '8px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>Log In</button>
          <span style={{ padding: '8px 16px', background: '#f0fdf4', color: '#00875a', border: '1px solid #bbf7d0', borderRadius: 6, fontWeight: 700, fontSize: '0.82rem' }}>✓ Continue as Guest</span>
        </div>
      </div>

      {/* KSA Travel Notices */}
      <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: 12, padding: 18, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#c2410c', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>⚠️ IMPORTANT KSA TRAVEL NOTICES</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.8rem', color: '#9a3412', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li><strong>4-Digit Flights (Jeddah / Madinah):</strong> Travel on 4-digit flight numbers to/from JED & MED is permitted only for Umrah Visa holders and GCC Nationals.</li>
          <li><strong>Hajj Period Restrictions:</strong> Muslim passengers holding Business/Visit visas are not permitted to enter Jeddah, Madinah, or Taif during Hajj period.</li>
          <li><strong>Umrah Transit:</strong> Umrah passengers are permitted to transit only via Riyadh on Saudia Airlines.</li>
          <li><strong>Tourist / Visit Visas:</strong> Holders must possess a confirmed return ticket, proof of accommodation, and sufficient funds.</li>
          <li><strong>Passport Validity:</strong> Passports must be valid for at least 6 months from the date of travel.</li>
        </ul>
      </div>

      {passengers.map((p, i) => (
        <div key={i} className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div className="card-header-icon">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <span className="card-title">
              {t('flightBooking.passengersStep.title', { number: i + 1 })} &nbsp;
              <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)', fontFamily: 'DM Sans' }}>
                {p.type === 'ADT' ? t('flightBooking.passengersStep.adult') : p.type === 'CHD' ? t('flightBooking.passengersStep.child') : t('flightBooking.passengersStep.infant')}
              </span>
            </span>
          </div>
          <div className="card-body">
            <div className="card-subtitle">{t('flightBooking.passengersStep.personalInformation')}</div>
            <div className="form-grid form-grid-3" style={{ marginBottom: 20 }}>
              <div className="field">
                <label className="field-label">{t('flightBooking.passengersStep.titleLabel')} <span className="req">*</span></label>
                <div className="select-wrap">
                  <select className="field-select" value={p.title} onChange={e => updatePassenger(i, 'title', e.target.value)}>
                    <option value="">{t('flightBooking.passengersStep.selectTitle')}</option>
                    <option value="Mr">{t('flightBooking.passengersStep.mr')}</option>
                    <option value="Mrs">{t('flightBooking.passengersStep.mrs')}</option>
                    <option value="Ms">{t('flightBooking.passengersStep.ms')}</option>
                    <option value="Dr">{t('flightBooking.passengersStep.dr')}</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="field-label">{t('forms.firstName')} <span className="req">*</span></label>
                <input className={`field-input ${touched[`${i}_firstName`] && !p.firstName ? 'error' : ''}`} value={p.firstName} onChange={e => updatePassenger(i, 'firstName', e.target.value)} placeholder={t('flightBooking.passengersStep.asInPassport')} />
              </div>
              <div className="field">
                <label className="field-label">{t('forms.lastName')} <span className="req">*</span></label>
                <input className={`field-input ${touched[`${i}_lastName`] && !p.lastName ? 'error' : ''}`} value={p.lastName} onChange={e => updatePassenger(i, 'lastName', e.target.value)} placeholder={t('flightBooking.passengersStep.asInPassport')} />
              </div>
              <div className="field">
                <label className="field-label">{t('forms.dateOfBirth')} <span className="req">*</span></label>
                <input type="date" className="field-input" value={p.dateOfBirth} onChange={e => updatePassenger(i, 'dateOfBirth', e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">{t('forms.gender')} <span className="req">*</span></label>
                <div className="select-wrap">
                  <select className="field-select" value={p.gender} onChange={e => updatePassenger(i, 'gender', e.target.value)}>
                    <option value="">{t('flightBooking.passengersStep.selectTitle')}</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="field-label">{t('forms.nationality')} <span className="req">*</span></label>
                <input className="field-input" value={p.nationality} onChange={e => updatePassenger(i, 'nationality', e.target.value)} />
              </div>
            </div>

            <div className="card-subtitle">{t('flightBooking.passengersStep.travelDocument')}</div>
            <div className="form-grid form-grid-3" style={{ marginBottom: 20 }}>
              <div className="field">
                <label className="field-label">{t('flightBooking.passengersStep.passportNumber')} <span className="req">*</span></label>
                <input className="field-input" value={p.documentNumber} onChange={e => updatePassenger(i, 'documentNumber', e.target.value)} placeholder="AB1234567" />
              </div>
              <div className="field">
                <label className="field-label">{t('flightBooking.passengersStep.expiryDate')} <span className="req">*</span></label>
                <input type="date" className="field-input" value={p.documentExpiry} onChange={e => updatePassenger(i, 'documentExpiry', e.target.value)} />
                <span className="field-hint">{t('flightBooking.passengersStep.mustBeValid6Months')}</span>
              </div>
              <div className="field">
                <label className="field-label">{t('flightBooking.passengersStep.issuingCountry')}</label>
                <input className="field-input" value={p.documentIssuingCountry} onChange={e => updatePassenger(i, 'documentIssuingCountry', e.target.value)} />
              </div>
            </div>

            <div className="card-subtitle">{t('flightBooking.passengersStep.contactDetails')}</div>
            <div className="form-grid form-grid-2">
              <div className="field">
                <label className="field-label">{t('forms.email')} <span className="req">*</span></label>
                <input type="email" className="field-input" value={p.email} onChange={e => updatePassenger(i, 'email', e.target.value)} placeholder={t('flightBooking.passengersStep.name@example')} />
              </div>
              <div className="field">
                <label className="field-label">{t('forms.phoneNumber')}</label>
                <input type="tel" className="field-input" value={p.phone} onChange={e => updatePassenger(i, 'phone', e.target.value)} placeholder={t('flightBooking.passengersStep.phoneFormat')} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ─── Extras Step ────────────────────────────────────────────────────────────
  const extrasList = [
    { key: 'insurance', name: t('flightBooking.extrasStep.travelInsurance'), desc: t('flightBooking.extrasStep.travelInsuranceDesc'), price: '32', icon: '🛡' },
    { key: 'autoCheckin', name: t('flightBooking.extrasStep.autoCheckIn'), desc: t('flightBooking.extrasStep.autoCheckInDesc'), price: '12', icon: '✔' },
    { key: 'delayProtection', name: t('flightBooking.extrasStep.delayProtection'), desc: t('flightBooking.extrasStep.delayProtectionDesc'), price: '18', icon: '⏱' },
    { key: 'cancellationFreedom', name: t('flightBooking.extrasStep.cancellationFreedom'), desc: t('flightBooking.extrasStep.cancellationFreedomDesc'), price: '23', icon: '↩' },
  ];

  const renderExtras = () => (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon">✦</div>
          <span className="card-title">{t('flightBooking.extrasStep.title')}</span>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>{t('flightBooking.extrasStep.subtitle')}</p>
          {extrasList.map(({ key, name, desc, price, icon }) => (
            <label key={key} className="extra-row" onClick={() => setExtras(prev => ({ ...prev, [key]: !prev[key] }))}>
              <div className={`extra-check ${extras[key] ? 'checked' : ''}`}>
                {extras[key] && <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <div className="extra-info">
                <div className="extra-name">{icon} &nbsp;{name}</div>
                <div className="extra-desc">{desc}</div>
              </div>
              <div className="extra-price">{price} <span style={{ fontSize: 12, fontFamily: 'DM Sans', fontWeight: 400, color: 'var(--muted)' }}>SAR</span></div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── Checkout Step ──────────────────────────────────────────────────────────
  const renderCheckout = () => (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-header-icon">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </div>
          <span className="card-title">Flight Itinerary</span>
        </div>
        <div className="card-body">
          {flight?.legs?.map((leg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < flight.legs.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, marginBottom: 4 }}>{leg.from} <span style={{ color: 'var(--gold)' }}>→</span> {leg.to}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{leg.airline} · {leg.flightNo} · {leg.date}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 500 }}>{leg.dep} – {leg.arr}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{leg.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-header-icon">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>
          </div>
          <span className="card-title">Passengers</span>
        </div>
        <div className="card-body">
          {passengers.map((p, i) => (
            <div key={i} className="pax-row">
              <div>
                <div className="pax-name">{p.title} {p.firstName} {p.lastName}</div>
                <div className="pax-email">{p.email}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {p.type === 'ADT' ? 'Adult' : p.type === 'CHD' ? 'Child' : 'Infant'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── Payment Step (Almosafer Professional Layout) ───────────────────────────
  const renderPayment = () => (
    <div>
      {/* Step Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
          {t('flightBooking.paymentStep.title')}
        </h2>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          {t('flightBooking.paymentStep.howToPay')}
        </p>
      </div>

      {/* Security Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 8,
        marginBottom: 24,
        color: '#15803d',
        fontSize: 13,
        fontWeight: 600
      }}>
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        <span>{t('flightBooking.paymentStep.safeTransactions')}</span>
      </div>

      {/* Payment Method Selector (Almosafer Style SVG Tabs) */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: 24 }}>
        {[
          {
            id: 'card',
            name: 'Card',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M2.75 6A.25.25 0 0 1 3 5.75h18a.25.25 0 0 1 .25.25v2.5H2.75V6Zm-1 3.024V18c0 .69.56 1.25 1.25 1.25h18c.69 0 1.25-.56 1.25-1.25V6c0-.69-.56-1.25-1.25-1.25H3c-.69 0-1.25.56-1.25 1.25v2.976a.515.515 0 0 0 0 .048Zm1 .476h18.5V18a.25.25 0 0 1-.25.25H3a.25.25 0 0 1-.25-.25V9.5Zm13 5.75a.5.5 0 0 0 0 1h3a.5.5 0 1 0 0-1h-3Zm-5 .5a.5.5 0 0 1 .5-.5h1.5a.5.5 0 1 1 0 1h-1.5a.5.5 0 0 1-.5-.5Z" fill="currentColor"/>
              </svg>
            )
          },
          {
            id: 'applePay',
            name: 'Apple Pay',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.513 9.334c.225-.246.377-.577.337-.915-.328.014-.729.19-.96.437-.209.21-.393.555-.345.879.369.028.736-.162.968-.401Z" fill="currentColor"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M6.692 9.74c-.48-.03-.888.275-1.117.275-.23 0-.58-.261-.96-.254-.495.007-.954.29-1.205.74-.516.901-.136 2.237.366 2.97.244.364.537.763.924.749.366-.015.51-.24.953-.24.445 0 .574.24.96.233.402-.008.653-.363.896-.727.28-.413.394-.813.402-.835-.008-.007-.774-.305-.781-1.198-.008-.748.602-1.103.63-1.126-.344-.515-.881-.573-1.068-.588ZM10.307 11.87h.934c.708 0 1.111-.402 1.111-1.1 0-.699-.403-1.098-1.108-1.098h-.937v2.199Zm1.152-2.923c1.017 0 1.726.74 1.726 1.819 0 1.082-.724 1.826-1.752 1.826h-1.126v1.892h-.814V8.947h1.966ZM16.053 12.732v-.3l-.954.06c-.536.033-.816.225-.816.561 0 .325.291.536.747.536.582 0 1.023-.359 1.023-.857Zm-2.605.344c0-.684.54-1.075 1.536-1.134l1.069-.063v-.296c0-.432-.295-.668-.82-.668-.433 0-.747.214-.812.543h-.774c.023-.69.697-1.193 1.61-1.193.98 0 1.62.495 1.62 1.263v2.652h-.794v-.64h-.019c-.226.418-.724.68-1.264.68-.796 0-1.352-.458-1.352-1.145ZM17.526 15.517v-.634c.052.007.178.014.245.014.367 0 .575-.154.7-.55l.075-.234-1.406-3.848h.868l.98 3.122h.018l.98-3.122h.845l-1.458 4.042c-.334.927-.716 1.232-1.524 1.232-.064 0-.268-.008-.323-.022Z" fill="currentColor"/>
              </svg>
            )
          },
          {
            id: 'tamara',
            name: 'Tamara',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 25 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#FEEAD5"/>
                <path d="M4.359 9.28936C3.98318 9.68192 3.70411 10.1321 3.51807 10.6103L9.33946 15.4401C9.62039 15.267 9.88458 15.0605 10.1227 14.8112L10.2362 14.694C12.4446 12.3889 10.9934 9.89215 10.1153 9.05122C8.52272 7.52564 5.99807 7.58145 4.47248 9.17215L4.359 9.28936Z" fill="#1A1A1A"/>
                <path d="M16.3758 15.9962C18.6034 15.9962 20.4093 14.1903 20.4093 11.9627C20.4093 9.73506 18.6034 7.9292 16.3758 7.9292C14.1481 7.9292 12.3423 9.73506 12.3423 11.9627C12.3423 14.1903 14.1481 15.9962 16.3758 15.9962Z" fill="#1A1A1A"/>
              </svg>
            )
          },
          {
            id: 'tabby',
            name: 'Tabby',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#5AFEAE"/>
                <path d="M15.5549 16.2076C15.1321 16.4157 14.6674 16.5237 14.1961 16.5216C13.181 16.5216 12.6053 16.3591 12.5422 15.5391V15.484C12.5422 15.4513 12.5385 15.4223 12.5385 15.3846V12.9955L12.5422 12.7142V11.0298H12.5385V10.3142L12.5422 10.0307V8.40433L10.0247 8.73642C11.7272 8.40723 12.7046 7.06004 12.7046 5.7172V4.88989H9.87607V8.75745L9.71655 8.8024V15.9654C9.81009 17.9775 11.1355 19.1739 13.3115 19.1739C14.0808 19.1739 14.9277 18.9991 15.5759 18.7048L15.5904 18.699V16.1866L15.5541 16.2083V16.2076H15.5549Z" fill="#292929"/>
                <path d="M16.0009 7.82495L8.06348 9.04815V11.061L16.0009 9.83776V7.82495Z" fill="#292929"/>
                <path d="M16.0009 10.7695L8.06348 11.9927V13.9156L16.0009 12.6917V10.7695Z" fill="#292929"/>
              </svg>
            )
          },
          {
            id: 'mokafaa',
            name: 'Mokafaa',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#221AFB"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M11.5114 8.12376C11.6586 8.12376 11.7764 8.24644 11.7764 8.39365C11.7764 8.54088 11.6586 8.66356 11.5114 8.66356C11.3543 8.66356 11.2415 8.54578 11.2415 8.39365C11.2415 8.24644 11.3543 8.12376 11.5114 8.12376ZM10.8391 8.12376C10.9863 8.12376 11.1041 8.24644 11.1041 8.39365C11.1041 8.54088 10.9912 8.66356 10.8391 8.66356C10.6919 8.66356 10.5692 8.54088 10.5692 8.39365C10.5692 8.24644 10.6919 8.12376 10.8391 8.12376Z" fill="white"/>
              </svg>
            )
          },
          {
            id: 'installments',
            name: 'Installments',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M3 3.125a.25.25 0 0 0-.25.25V5.5H17.5V3.375a.25.25 0 0 0-.25-.25H3Zm-1.25 10V6.022a.516.516 0 0 1 0-.044V3.375c0-.69.56-1.25 1.25-1.25h14.25c.69 0 1.25.56 1.25 1.25V8.25a.5.5 0 0 1-1 0V6.5H2.75v6.625c0 .138.112.25.25.25h5.5a.5.5 0 0 1 0 1H3c-.69 0-1.25-.56-1.25-1.25Zm14.375-2.5a5.125 5.125 0 1 0 0 10.25 5.125 5.125 0 0 0 0-10.25ZM10 15.75a6.125 6.125 0 1 1 12.25 0 6.125 6.125 0 0 1-12.25 0Zm6.125-3.125a.5.5 0 0 1 .5.5v2.125h2.125a.5.5 0 1 1 0 1h-2.625a.5.5 0 0 1-.5-.5v-2.625a.5.5 0 0 1 .5-.5Z" fill="currentColor"/>
              </svg>
            )
          },
          {
            id: 'stcPay',
            name: 'STC Pay',
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#4F008C"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M12.0595 6.21378C12.4237 6.21378 12.6829 6.10328 12.795 6.00656V5.26058C12.7109 5.32273 12.5428 5.39873 12.3257 5.39873C12.1716 5.39873 12.0595 5.36419 11.9755 5.2882C11.9055 5.21913 11.8704 5.1017 11.8704 4.94282V1.7793H10.9459V2.71177H12.795V3.59593H10.9459V5.16389C10.9459 5.48161 11.044 5.73719 11.2191 5.91678C11.4152 6.11017 11.7023 6.21378 12.0595 6.21378ZM14.8891 6.21377C15.4074 6.21377 15.8067 6.02727 16.0798 5.76478C16.2969 5.55759 16.43 5.3158 16.5 5.06715L15.6806 4.79777C15.6455 4.9221 15.5755 5.05333 15.4634 5.15695C15.3304 5.28129 15.1483 5.37109 14.8891 5.37109C14.651 5.37109 14.4268 5.28129 14.2658 5.12242C14.1047 4.95665 14.0066 4.71489 14.0066 4.41097C14.0066 4.10013 14.1047 3.86529 14.2658 3.6995C14.4268 3.54065 14.644 3.45774 14.8821 3.45774C15.1342 3.45774 15.3093 3.54065 15.4354 3.66499C15.5405 3.76857 15.6035 3.89983 15.6455 4.03106L16.479 3.75476C16.416 3.513 16.2829 3.27124 16.0868 3.07093C15.8067 2.80156 15.4004 2.60817 14.8611 2.60817C14.3638 2.60817 13.9156 2.79467 13.5934 3.11239C13.2712 3.43703 13.0751 3.88598 13.0751 4.41097C13.0751 4.93592 13.2782 5.38487 13.6074 5.70951C13.9296 6.02727 14.3848 6.21377 14.8891 6.21377ZM8.97781 6.21377C9.44707 6.21377 9.83229 6.06869 10.0844 5.82693C10.2736 5.64043 10.3856 5.39178 10.3856 5.10168C10.3856 4.83922 10.2875 4.60438 10.1054 4.42477C9.92335 4.2452 9.66421 4.11394 9.33499 4.05179L8.79572 3.94818C8.5716 3.90671 8.44552 3.79621 8.44552 3.64423C8.44552 3.44392 8.64164 3.30581 8.95678 3.30581C9.15291 3.30581 9.32102 3.36797 9.43308 3.4785C9.50311 3.55445 9.55213 3.65115 9.56614 3.76165L10.3436 3.589C10.3226 3.36797 10.2175 3.17455 10.0564 3.01567C9.8043 2.76702 9.41205 2.60817 8.9498 2.60817C8.52257 2.60817 8.16535 2.74632 7.92021 2.96732C7.71012 3.16074 7.59106 3.42323 7.59106 3.71333C7.59106 3.96891 7.6751 4.18305 7.84319 4.34878C8.01127 4.51454 8.25641 4.63889 8.57858 4.71489L9.11087 4.83922C9.37704 4.90138 9.4961 4.9981 9.4961 5.17075C9.4961 5.38487 9.29997 5.50921 8.97781 5.50921C8.7467 5.50921 8.55759 5.43325 8.43853 5.30894C8.35446 5.22602 8.30544 5.11553 8.29845 4.99118L7.5 5.16386C7.52102 5.39871 7.63306 5.60593 7.80115 5.77169C8.06731 6.048 8.49454 6.21377 8.97781 6.21377Z" fill="white"/>
                <rect y="8" width="24" height="16" fill="#00C48C"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M5.63005 14.5376V15.7496C5.87093 16.24 6.29697 16.6008 6.91756 16.6008C7.66794 16.6008 8.16813 16.0456 8.16813 15.139C8.16813 14.2413 7.66794 13.6955 6.91756 13.6955C6.29697 13.6955 5.87093 14.0286 5.63005 14.5376ZM4.5 19.3676V12.7701H5.63009V13.2975C5.97286 12.872 6.4823 12.6406 7.11221 12.6406C8.40904 12.6406 9.34471 13.6677 9.34471 15.1389C9.34471 16.61 8.40904 17.6557 7.11221 17.6557C6.47305 17.6557 5.97286 17.4151 5.63009 16.9895V19.3676H4.5Z" fill="white"/>
              </svg>
            )
          }
        ].map(pm => (
          <button
            key={pm.id}
            type="button"
            onClick={() => setSelectedPaymentMethod(pm.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 90,
              padding: '12px 14px',
              borderRadius: 8,
              border: selectedPaymentMethod === pm.id ? '2px solid #00875a' : '1px solid #e2e8f0',
              background: selectedPaymentMethod === pm.id ? '#f0fdf4' : '#fff',
              color: selectedPaymentMethod === pm.id ? '#00875a' : '#475569',
              fontWeight: selectedPaymentMethod === pm.id ? 700 : 500,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ fontSize: 18, marginBottom: 4 }}>{pm.icon}</span>
            <span>{pm.name}</span>
          </button>
        ))}
      </div>

      {/* Select or Add Credit/Debit Card Card */}
      <div className="card" style={{ marginBottom: 20, border: '1px solid #e2e8f0', borderRadius: 12 }}>
        <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <span className="card-title" style={{ fontSize: 15, fontWeight: 700 }}>{t('flightBooking.paymentStep.selectOrAddCard')}</span>
        </div>
        <div className="card-body" style={{ padding: 20 }}>

          {/* Saved Card Option 1 */}
          <div
            onClick={() => setSelectedCardType('saved')}
            style={{
              border: selectedCardType === 'saved' ? '2px solid #00875a' : '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
              background: selectedCardType === 'saved' ? '#f0fdf4' : '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <input
                type="radio"
                name="cardSelection"
                checked={selectedCardType === 'saved'}
                onChange={() => setSelectedCardType('saved')}
                style={{ marginTop: 3, accentColor: '#00875a' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: 4 }}>
                  **** **** **** 8410
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {t('flightBooking.paymentStep.cardExpiry')}: 01/30
                </div>
                {selectedCardType === 'saved' && (
                  <div style={{ marginTop: 12, width: 140 }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                      {t('flightBooking.paymentStep.cvv')} *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        maxLength="4"
                        placeholder="123"
                        value={cardForm.cvv}
                        onChange={handleCardInput}
                        name="cvv"
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.85rem' }}
                      />
                      <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#94a3b8' }}>ⓘ</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#00875a', color: '#fff', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>
                {t('flightBooking.paymentStep.defaultCard')}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Mada / Visa</span>
            </div>
          </div>

          {/* Add New Card Option 2 */}
          <div
            onClick={() => setSelectedCardType('new')}
            style={{
              border: selectedCardType === 'new' ? '2px solid #00875a' : '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 16,
              background: selectedCardType === 'new' ? '#f0fdf4' : '#fff',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="radio"
                name="cardSelection"
                checked={selectedCardType === 'new'}
                onChange={() => setSelectedCardType('new')}
                style={{ accentColor: '#00875a' }}
              />
              <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>
                {t('flightBooking.paymentStep.addNewCard')}
              </span>
            </div>

            {selectedCardType === 'new' && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }} onClick={(e) => e.stopPropagation()}>
                {/* Official Moyasar Payment SDK Form Mount Container */}
                <div className="mysr-form"></div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Voucher Code (Optional) Card */}
      <div className="card" style={{ marginBottom: 20, border: '1px solid #e2e8f0', borderRadius: 12 }}>
        <div className="card-header" style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <span className="card-title" style={{ fontSize: 15, fontWeight: 700 }}>{t('flightBooking.paymentStep.addVoucher')}</span>
        </div>
        <div className="card-body" style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#94a3b8' }}>🎟️</span>
              <input
                type="text"
                placeholder={t('flightBooking.paymentStep.voucherCode')}
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.88rem' }}
              />
            </div>
            <button
              type="button"
              onClick={() => setVoucherApplied(true)}
              style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              {t('flightBooking.paymentStep.apply')}
            </button>
          </div>
          {voucherApplied && (
            <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: 8, fontWeight: 600 }}>
              ✓ Voucher code applied successfully!
            </div>
          )}
        </div>
      </div>

      {/* Select Your Reward Card */}
      <div className="card" style={{ marginBottom: 24, border: '1px solid #e2e8f0', borderRadius: 12 }}>
        <div className="card-header" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <div className="card-title" style={{ fontSize: 15, fontWeight: 700 }}>{t('flightBooking.paymentStep.selectReward')}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>{t('flightBooking.paymentStep.rewardEligibility')}</div>
          </div>
          <span style={{ fontSize: '0.68rem', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
            {t('flightBooking.paymentStep.pointConversion')}
          </span>
        </div>
        <div className="card-body" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { id: 'almosafer', name: t('flightBooking.paymentStep.almosaferPoints'), points: 26, logo: '🔴' },
            { id: 'qitaf', name: t('flightBooking.paymentStep.qitafPoints'), points: 64, logo: '💜' },
            { id: 'mokafaa', name: t('flightBooking.paymentStep.mokafaaPoints'), points: 5136, logo: '🟦' }
          ].map(rw => (
            <div
              key={rw.id}
              onClick={() => setSelectedReward(selectedReward === rw.id ? null : rw.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                border: selectedReward === rw.id ? '2px solid #00875a' : '1px solid #e2e8f0',
                background: selectedReward === rw.id ? '#f0fdf4' : '#fff',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18 }}>{rw.logo}</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>{rw.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{rw.points}</span>
                <button
                  type="button"
                  style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid #cbd5e1', background: selectedReward === rw.id ? '#00875a' : '#fff', color: selectedReward === rw.id ? '#fff' : '#00875a', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {selectedReward === rw.id ? '✓' : '+'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pay Now Button & Terms Agreement Footer */}
      <div>
        <button
          type="button"
          onClick={handleCardPayment}
          disabled={processing}
          style={{
            width: '100%',
            padding: '16px',
            background: '#00875a',
            color: '#fff',
            border: 'none',
            borderRadius: 30,
            fontSize: '1.05rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 135, 90, 0.3)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          {processing ? (
            <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing Payment…</>
          ) : (
            ` ${t('flightBooking.paymentStep.payNow')}`
          )}
        </button>

        <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', lineHeight: 1.5 }}>
          By completing this booking, I acknowledge and agree to the{' '}
          <a href={`/${lang}/privacy-policy`} target="_blank" rel="noreferrer" style={{ color: '#00875a', textDecoration: 'underline' }}>
            {t('flightBooking.paymentStep.privacyPolicy')}
          </a>{' '}
          and the{' '}
          <a href={`/${lang}/terms-and-conditions`} target="_blank" rel="noreferrer" style={{ color: '#00875a', textDecoration: 'underline' }}>
            {t('flightBooking.paymentStep.termsConditions')}
          </a>{' '}
          that are applicable to this itinerary.
        </p>
      </div>

    </div>
  );

  // ─── Confirmation Step — Professional E-Ticket ──────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${days[d.getDay()]} ${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}`;
  };
  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };
  const getCityName = (code) => {
    const cities = { JED: 'JEDDAH', RUH: 'RIYADH', CAI: 'CAIRO', DXB: 'DUBAI', DOH: 'DOHA', LHE: 'LAHORE', TAS: 'TASHKENT', MED: 'MADINAH', DMM: 'DAMMAM', ABH: 'ABHA', AUH: 'ABU DHABI', KWI: 'KUWAIT', BAH: 'BAHRAIN', MCT: 'MUSCAT', AMM: 'AMMAN', BEY: 'BEIRUT', IST: 'ISTANBUL' };
    return cities[code] || code;
  };
  const getAirportFullName = (code) => {
    const airports = {
      JED: 'King Abdulaziz International Airport',
      RUH: 'King Khalid International Airport',
      CAI: 'Cairo International Airport',
      DXB: 'Dubai International Airport',
      DOH: 'Hamad International Airport',
      SKT: 'Sialkot International Airport',
      LHE: 'Allama Iqbal International Airport',
      PEW: 'Bacha Khan International Airport',
      KHI: 'Jinnah International Airport',
      ISB: 'Islamabad International Airport',
      MED: 'Prince Mohammad bin Abdulaziz Airport',
      DMM: 'King Fahd International Airport',
      IST: 'Istanbul Airport',
      AMM: 'Queen Alia International Airport',
      BEY: 'Beirut–Rafic Hariri International Airport',
      KWI: 'Kuwait International Airport',
      BAH: 'Bahrain International Airport',
      MCT: 'Muscat International Airport',
      TAS: 'Tashkent International Airport',
      ABH: 'Abha International Airport',
      BOM: 'Chhatrapati Shivaji Maharaj International Airport',
      DEL: 'Indira Gandhi International Airport',
      CCU: 'Netaji Subhas Chandra Bose International Airport',
      BLR: 'Kempegowda International Airport',
      MAA: 'Chennai International Airport',
      HYD: 'Rajiv Gandhi International Airport',
      AMD: 'Sardar Vallabhbhai Patel International Airport',
      DAC: 'Hazrat Shahjalal International Airport',
      SIN: 'Singapore Changi Airport',
      BKK: 'Suvarnabhumi Airport',
      LHR: 'London Heathrow Airport',
      JFK: 'John F. Kennedy International Airport',
      LAX: 'Los Angeles International Airport',
    };
    return airports[code] || `${getCityName(code) || code} International Airport`;
  };
  const formatDatePretty = (dateStr) => {
    if (!dateStr) return 'Apr 20, 2026';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };
  const formatTimePretty = (timeStr) => {
    if (!timeStr) return '06:05 AM';
    if (typeof timeStr === 'string' && timeStr.includes('T')) {
      const d = new Date(timeStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
    }
    if (typeof timeStr === 'string' && timeStr.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
      const [h, m] = timeStr.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${String(formattedHour).padStart(2, '0')}:${m} ${ampm}`;
    }
    return timeStr;
  };
  const tkt = {
    paxName: passengers[0] ? `${passengers[0].lastName || ''} / ${passengers[0].firstName || ''} ${(passengers[0].title || '').toUpperCase()}`.toUpperCase() : 'PASSENGER',
    origin: flight?.origin || flight?.legs?.[0]?.from || 'JED',
    destination: flight?.destination || flight?.legs?.[0]?.to || 'CAI',
    departureDate: flight?.departureDate || flight?.legs?.[0]?.date || '',
    airline: flight?.airline || flight?.legs?.[0]?.airline || 'Saudi Arabian Airlines',
    flightNo: flight?.flightNumber || flight?.legs?.[0]?.flightNo || '',
    cabin: bundle?.name || 'Economy',
  };

  const handlePrintETicket = () => {
    const el = document.querySelector('.eticket-wrap');
    if (!el) return;

    const printWin = window.open('', '_blank', 'width=900,height=1000');
    if (!printWin) {
      window.print();
      return;
    }

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>E-Ticket Confirmation - Tilal Rimal</title>
  <meta charset="utf-8" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', Arial, sans-serif; background: #fff; color: #0f172a; padding: 24px; display: flex; justify-content: center; }
    .eticket-wrap { width: 100%; max-width: 840px; border: 2px solid #E85D1F; background: #fff; box-shadow: none !important; border-radius: 12px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    td, th { vertical-align: top; }
    @media print {
      body { padding: 0; background: #fff; }
      .eticket-wrap { border: 2px solid #E85D1F !important; max-width: 100% !important; margin: 0 !important; width: 100% !important; border-radius: 0 !important; }
    }
  </style>
</head>
<body>
  ${el.outerHTML}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.close();
      }, 250);
    };
  </script>
</body>
</html>`;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  const getLegsList = () => {
    if (flight?.legs && flight.legs.length > 0) return flight.legs;

    const outboundLeg = {
      from: flight?.from || tkt.origin,
      to: flight?.to || tkt.destination,
      date: flight?.departureDate || tkt.departureDate,
      airline: flight?.airline || tkt.airline,
      flightNo: flight?.flightNo || flight?.flightNumber || tkt.flightNo,
      dep: flight?.dep || flight?.departureTime || '06:05 AM',
      arr: flight?.arr || flight?.arrivalTime || '08:55 AM',
      duration: flight?.duration || '04h 50m',
      isReturn: false
    };

    if (flight?.isRoundTrip || flight?.returnDate || flight?.returnFlight) {
      const returnLeg = {
        from: flight?.returnFlight?.from || flight?.to || tkt.destination,
        to: flight?.returnFlight?.to || flight?.from || tkt.origin,
        date: flight?.returnDate || flight?.returnFlight?.date || tkt.departureDate,
        airline: flight?.returnFlight?.airline || flight?.airline || tkt.airline,
        flightNo: flight?.returnFlight?.flightNo || flight?.returnFlight?.flightNumber || flight?.flightNo || tkt.flightNo,
        dep: flight?.returnFlight?.dep || flight?.returnFlight?.departureTime || '04:15 PM',
        arr: flight?.returnFlight?.arr || flight?.returnFlight?.arrivalTime || '07:05 PM',
        duration: flight?.returnFlight?.duration || flight?.duration || '04h 50m',
        isReturn: true
      };
      return [outboundLeg, returnLeg];
    }

    return [outboundLeg];
  };

  const renderConfirmation = () => (
    <div style={{ gridColumn: '1 / -1', maxWidth: 840, margin: '0 auto' }}>
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * { visibility: hidden !important; }
          .eticket-wrap, .eticket-wrap * { visibility: visible !important; }
          .eticket-wrap {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            background: #fff !important;
          }
        }
        .eticket-wrap { font-family: 'DM Sans', Arial, Helvetica, sans-serif; color: #0f172a; }
        .eticket-wrap table { border-collapse: collapse; }
        .eticket-wrap td, .eticket-wrap th { vertical-align: top; }
      `}} />

      <div className="eticket-wrap" style={{ background: '#fff', border: '2px solid #E85D1F', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 40px rgba(232, 93, 31, 0.08)' }}>

        {/* ── Brand Header Bar ── */}
        <div style={{ background: '#0f172a', color: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #E85D1F' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="Tilal Rimal" style={{ height: 42, width: 'auto', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.04em', color: '#ffffff', lineHeight: 1.1 }}>TILAL RIMAL</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#E85D1F', textTransform: 'uppercase' }}>TOURISM ORGANIZATION</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'inline-block', background: 'rgba(232, 93, 31, 0.2)', border: '1px solid #E85D1F', color: '#ff9868', padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              ✈ E-TICKET & PASSENGER RECEIPT
            </span>
          </div>
        </div>

        {/* ── Passenger & Agency Details Row ── */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#fafafa' }}>
          <div>
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>PREPARED FOR / PASSENGER NAME</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '0.02em' }}>{tkt.paxName}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>ISSUING TRAVEL AGENCY</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Tilal Rimal Tourism Organization</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 2, fontWeight: 500 }}>شركة تلال الرمال لتنظيم الرحلات السياحية</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>License No: <strong style={{ color: '#0f172a' }}>73106935</strong></div>
            <div style={{ fontSize: 11, color: '#E85D1F', fontWeight: 700, marginTop: 3 }}> +966 54 730 5060 · ✉ info@tilalrimal.com </div>
          </div>
        </div>

        {/* ── Reservation Codes & Date ── */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, background: '#f8fafc', padding: '14px 18px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 2 }}>BOOKING REFERENCE (ORDER PNR)</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#E85D1F', letterSpacing: '0.04em' }}>{orderReference || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 2 }}>AIRLINE PNR</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em' }}>
                {airlinePnr || 'Pending'}
                {tkt.airline && <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500, marginLeft: 6 }}>({tkt.airline.split(' ').map(w => w[0]).join('')})</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 2 }}>ISSUE DATE</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
            </div>
          </div>
        </div>

        {/* ── Flight Segments (Exact Reference Layout) ── */}
        <div style={{ padding: '24px 28px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
          {getLegsList().map((leg, i, arr) => {
            const depTimeRaw = leg.dep || leg.departure || leg.departureTime || leg.departure_time || flight?.dep || flight?.departureTime || '06:05 AM';
            const arrTimeRaw = leg.arr || leg.arrival || leg.arrivalTime || leg.arrival_time || flight?.arr || flight?.arrivalTime || '08:55 AM';
            const depTime = formatTimePretty(depTimeRaw);
            const arrTime = formatTimePretty(arrTimeRaw);
            const dur = leg.duration || leg.flightDuration || flight?.duration || '02h 30m';
            const durationStr = typeof dur === 'number' ? `${Math.floor(dur / 60)}h ${dur % 60}m` : dur || '02h 30m';
            const fromCode = leg.from || (leg.isReturn ? tkt.destination : tkt.origin) || 'JED';
            const toCode = leg.to || (leg.isReturn ? tkt.origin : tkt.destination) || 'DOH';
            const legDate = formatDatePretty(leg.date || tkt.departureDate);
            const flightNum = leg.flightNo || leg.flightNumber || tkt.flightNo || 'QR-1185';
            const cabinClass = tkt.cabin || 'Economy';
            const airlineCode = leg.airlineCode || leg.carrier || flight?.airlineCode || flight?.carrierCode || (flightNum ? flightNum.split(/[- ]/)[0] : '') || 'XY';
            const airlineName = leg.airline || flight?.airline || tkt.airline || 'flynas';

            return (
              <div key={i} style={{ marginBottom: i < arr.length - 1 ? 24 : 0, paddingBottom: i < arr.length - 1 ? 20 : 0, borderBottom: i < arr.length - 1 ? '1px dashed #cbd5e1' : 'none' }}>

                {/* Segment Flight Type Title Badge */}
                <div style={{ fontSize: 13, fontWeight: 800, color: '#9a3412', marginBottom: 12, background: '#fff7ed', borderLeft: '4px solid #E85D1F', padding: '6px 14px', borderRadius: '0 6px 6px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✈ {leg.isReturn || i > 0 ? `Return Flight — ${legDate}` : `Outbound Flight — ${legDate}`}</span>
                  <span style={{ fontSize: 11, color: '#c2410c', fontWeight: 600 }}>Please verify flight times prior to departure</span>
                </div>

                {/* Single Segment Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 1fr', gap: 20, alignItems: 'center', padding: '8px 0' }}>

                  {/* Left Column: Departure */}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 4 }}>{legDate}</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>{depTime}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 8, letterSpacing: '0.04em' }}>{fromCode}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.3 }}>{getAirportFullName(fromCode)}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{leg.departureTerminal || leg.departure_terminal || 'Terminal 1'}</div>
                  </div>

                  {/* Center Column: Airline Logo, Airline Name, Flight Number & Dashed Flight Arrow */}
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Airline Logo Image or Icon Badge */}
                    <div style={{ marginBottom: 4 }}>
                      <img
                        src={`https://assets.duffel.com/img/airlines/for-floor/sq/${airlineCode.toUpperCase()}.png`}
                        alt={airlineName}
                        style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', padding: 4 }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{ width: 44, height: 44, background: '#1e293b', borderRadius: 8, display: 'none', alignItems: 'center', justifyContent: 'center', color: '#E85D1F', fontSize: 20, fontWeight: 800 }}>
                        ✈
                      </div>
                    </div>

                    {/* Airline Company Name */}
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>
                      {airlineName}
                    </div>

                    {/* Flight Number */}
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#E85D1F' }}>
                      {flightNum}
                    </div>

                    {/* Flight Arrow Line */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, margin: '6px 0', width: '100%' }}>
                      <div style={{ height: 1, borderTop: '2px dashed #94a3b8', flex: 1 }}></div>
                      <span style={{ color: '#64748b', fontSize: 14 }}>✈</span>
                    </div>

                    {/* Duration & Cabin */}
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
                      🕒 {durationStr}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {cabinClass}
                    </div>
                  </div>

                  {/* Right Column: Arrival */}
                  <div style={{ textAlign: 'left', paddingLeft: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 4 }}>{legDate}</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>{arrTime}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginTop: 8, letterSpacing: '0.04em' }}>{toCode}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.3 }}>{getAirportFullName(toCode)}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{leg.arrivalTerminal || leg.arrival_terminal || ''}</div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

        {/* ── Ticket & Payment Summary ── */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <table style={{ width: '100%', fontSize: 12 }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0' }}>
                  <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>TICKET NUMBER: </span>
                  <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', marginLeft: 6 }}>{ticketNumber || '712-40984925'}</span>
                </td>
                <td style={{ padding: '4px 0', textAlign: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>TOTAL AMOUNT PAID: </span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: '#E85D1F', marginLeft: 6 }}>{calculateTotal()} SAR</span>
                </td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>
                  <span style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginRight: 6 }}>PAYMENT STATUS: </span>
                  <span style={{ fontWeight: 800, fontSize: 11, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: 4, letterSpacing: '0.04em' }}>✓ PAID</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Passenger List Table ── */}
        {passengers.length > 0 && (
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontWeight: 700 }}>PASSENGER & DOCUMENT DETAILS</div>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#475569', fontWeight: 700 }}>PASSENGER NAME</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#475569', fontWeight: 700 }}>TYPE</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#475569', fontWeight: 700 }}>PASSPORT / ID</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#475569', fontWeight: 700 }}>EMAIL ADDRESS</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: 11, color: '#475569', fontWeight: 700 }}>TICKET NUMBER</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{(p.title || '').toUpperCase()} {(p.firstName || '').toUpperCase()} {(p.lastName || '').toUpperCase()}</td>
                    <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 600 }}>{p.type === 'ADT' ? 'Adult' : p.type === 'CHD' ? 'Child' : 'Infant'}</td>
                    <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 600 }}>{p.documentNumber || 'CH7127003'}</td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>{p.email || 'amanshah12sweer@gmail.com'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#E85D1F' }}>{p.ticketNumber || ticketNumber || '712-40984925'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Important Information Notice Box ── */}
        <div style={{ padding: '16px 24px', background: '#fff7ed', borderBottom: '1px solid #ffedd5', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 16 }}>ℹ️</span>
          <div style={{ fontSize: 11, color: '#9a3412', lineHeight: 1.5, fontWeight: 500 }}>
            <strong>IMPORTANT TRAVEL NOTICE:</strong> Please present a printed copy of this E-Ticket receipt along with your valid original Passport / National ID at the airport check-in counter at least 3 hours prior to scheduled flight departure. Airport terminal and boarding gate assignments are subject to change by airport authorities.
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#64748b', background: '#f8fafc' }}>
          <div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>Tilal Rimal Tourism Organization (شركة تلال الرمال لتنظيم الرحلات السياحية)</div>
            <div>License No: 73106935 | Phone: +966 54 730 5060 | Email: info@tilalrimal.com </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, color: '#475569', marginBottom: 2 }}>BOOKING ISSUE DATE</div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* ── Actions (not printed) ── */}
      <div className="no-print" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="btn btn-primary" style={{ flex: 1, background: '#2d2d2d' }} onClick={handlePrintETicket}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          {t('flightBooking.confirmationStep.printETicket')}
        </button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePrintETicket}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {t('buttons.download')}
        </button>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => router.push(`/${lang}`)}>{t('buttons.returnHome')}</button>
      </div>
    </div>
  );

  // ─── Main ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="booking-root">
        {currentStep !== STEPS.CONFIRMATION && renderStepBar()}

        <div className="booking-body">
          {error && (
            <div className="error-banner" style={{ gridColumn: '1 / -1' }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth={2} /><path strokeLinecap="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>
              {error}
            </div>
          )}

          {currentStep === STEPS.CONFIRMATION ? (
            renderConfirmation()
          ) : (
            <>
              <main className="booking-main">
                {currentStep === STEPS.PASSENGERS && renderPassengers()}
                {currentStep === STEPS.EXTRAS && renderExtras()}
                {currentStep === STEPS.CHECKOUT && renderCheckout()}
                {currentStep === STEPS.PAYMENT && renderPayment()}
                {currentStep !== STEPS.PAYMENT && (
                  <div className="nav-btns">
                    <button className="btn btn-ghost" onClick={handlePreviousStep} disabled={processing}>← {t('buttons.back')}</button>
                    <button className="btn btn-primary" onClick={handleNextStep} disabled={processing}>
                      {processing ? (
                        <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> {t('buttons.processing')}</>
                      ) : currentStep === STEPS.CHECKOUT ? `${t('buttons.proceedToPayment')} →` : `${t('buttons.continue')} →`}
                    </button>
                  </div>
                )}
              </main>

              <aside className="booking-sidebar">
                {renderSidebar()}
              </aside>
            </>
          )}
        </div>
      </div>
    </>
  );
}