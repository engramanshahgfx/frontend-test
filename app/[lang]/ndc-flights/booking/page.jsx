'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

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
    padding: 40px 24px 80px;
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 28px;
    align-items: start;
  }

  @media (max-width: 900px) {
    .booking-body { grid-template-columns: 1fr; }
    .sidebar { order: -1; }
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
    type: 'ADT', title: '', firstName: '', middleName: '', lastName: '',
    dateOfBirth: '', gender: '', nationality: 'Saudi Arabia',
    documentType: 'passport', documentNumber: '', documentExpiry: '',
    documentIssuingCountry: 'Saudi Arabia', email: '', phone: '',
  }]);
  const [extras, setExtras] = useState({
    insurance: false, autoCheckin: false, delayProtection: false, cancellationFreedom: false,
    baggage: null, seat: null, meal: null,
  });
  const [holdExpiresAt, setHoldExpiresAt] = useState(null);
  const [holdRemainingTime, setHoldRemainingTime] = useState(null);
  const [paymentReference, setPaymentReference] = useState(null);
  const [cardForm, setCardForm] = useState({
    cardNumber: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvv: '',
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({});

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
    const orderRef = searchParams.get('order_ref');
    if (paymentStatus === 'paid' && orderRef) {
      setOrderReference(orderRef);
      setCurrentStep(STEPS.CONFIRMATION);
      fetchBookingDetails(orderRef);
    }
    setLoading(false);
  }, [searchParams]);

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

      const data = await apiCall('/v2/ndc/bookings/start', 'POST', {
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
      const data = await apiCall('/v2/ndc/bookings/passengers', 'POST', {
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
      const data = await apiCall('/v2/ndc/bookings/hold', 'POST', { order_reference: orderReference, hold_duration: 30, selected_extras: extras, total_amount: calculateTotal() });
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
      const data = await apiCall('/v2/ndc/bookings/pay', 'POST', { order_reference: orderReference, amount: calculateTotal(), currency: 'SAR', payment_method: 'creditcard', callback_url: `${window.location.origin}/${lang}/ndc-flights/booking?payment_status=paid&order_ref=${orderReference}`, cancel_url: `${window.location.origin}/${lang}/ndc-flights/booking?payment_status=cancelled&order_ref=${orderReference}` });
      const ppd = data?.data || data;
      setPaymentReference(ppd.payment_reference || ppd.paymentReference);
      setBookingStatus('PENDING_PAYMENT');
      return data;
    } catch (err) { setError(err.message); throw err; } finally { setProcessing(false); }
  };

  const fetchBookingDetails = async (ref) => {
    setProcessing(true);
    try {
      const data = await apiCall(`/v2/ndc/bookings/${ref}`, 'GET');
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
        const data = await apiCall(`/v2/ndc/bookings/${ref}`, 'GET');
        const pd = data?.data || data;
        if (pd.booking_status === 'TICKETED' || pd.status === 'TICKETED') { setBookingStatus('TICKETED'); setTicketNumber(pd.ticket_number || pd.ticketNumber || (pd.ticket_numbers && pd.ticket_numbers[0])); return pd; }
        if (pd.booking_status === 'CONFIRMED' || pd.status === 'CONFIRMED') setBookingStatus('CONFIRMED');
        if (['NDC_FAILED', 'PAYMENT_FAILED', 'EXPIRED'].includes(pd.booking_status || pd.status)) throw new Error(`Booking failed: ${pd.booking_status || pd.status}`);
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
    e.preventDefault();
    setError(null);
    if (!cardForm.cardNumber || !cardForm.cardHolder || !cardForm.expiryMonth || !cardForm.expiryYear || !cardForm.cvv) {
      setError('Please fill in all payment details'); return;
    }
    if (cardForm.cardNumber.length !== 16) { setError('Card number must be 16 digits'); return; }
    if (cardForm.cvv.length < 3) { setError('CVV must be at least 3 digits'); return; }

    setProcessing(true);
    try {
      // Call backend to confirm booking with payment
      const payRef = `PAY-${Date.now()}`;
      const data = await apiCall(`/v2/ndc/bookings/${orderReference}/confirm`, 'POST', {
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
    else router.push(`/${lang}/ndc-flights`);
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
            <button className="btn btn-primary" onClick={() => router.push(`/${lang}/ndc-flights`)}>{t('flightBooking.searchFlights')}</button>
          </div>
        </div>
      </div>
    </>
  );

  // ─── Sidebar ────────────────────────────────────────────────────────────────
  const renderSidebar = () => (
    <div className="sidebar">
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon">✦</div>
          <span className="card-title">{t('flightBooking.yourJourney')}</span>
        </div>
        <div className="card-body">
          {flight?.legs?.length > 0 ? (
            flight.legs.map((leg, i) => (
              <div key={i} className="flight-seg">
                <div className="flight-route">
                  <span>{leg.from}</span>
                  <span className="flight-route-sep">→</span>
                  <span>{leg.to}</span>
                </div>
                <div className="flight-meta">{leg.airline} · {leg.flightNo} · {leg.date}</div>
                <div className="flight-meta" style={{ marginTop: 4 }}>{leg.dep} – {leg.arr} · {leg.duration}</div>
              </div>
            ))
          ) : (
            <div className="flight-seg">
              <div className="flight-route">
                <span>{flight.origin || '—'}</span>
                <span className="flight-route-sep">→</span>
                <span>{flight.destination || '—'}</span>
              </div>
              <div className="flight-meta">{flight.departureDate || ''}</div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <div className="card-subtitle">{t('flightBooking.priceBreakdown')}</div>
            <div className="price-row">
              <span className="price-row-label">{bundle?.name || 'Economy'}</span>
              <span className="price-row-value">{bundle?.price || flight?.price || 0} SAR</span>
            </div>
            {extras.insurance && <div className="price-row"><span className="price-row-label">Travel Insurance</span><span className="price-row-value">32 SAR</span></div>}
            {extras.autoCheckin && <div className="price-row"><span className="price-row-label">Auto Check-in</span><span className="price-row-value">12 SAR</span></div>}
            {extras.delayProtection && <div className="price-row"><span className="price-row-label">Delay Protection</span><span className="price-row-value">18 SAR</span></div>}
            {extras.cancellationFreedom && <div className="price-row"><span className="price-row-label">Cancellation Freedom</span><span className="price-row-value">23 SAR</span></div>}
            <div className="price-total">
              <span className="price-total-label">Total</span>
              <span className="price-total-value">{calculateTotal()} SAR</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, padding: '14px 18px', background: 'var(--gold-dim)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--muted)' }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        <span>{t('flightBooking.secureBooking')}</span>
      </div>
    </div>
  );

  // ─── Step Indicator ─────────────────────────────────────────────────────────
  const STEP_LABELS = {
    1: t('flightBooking.steps.passengers'),
    2: t('flightBooking.steps.extras'),
    3: t('flightBooking.steps.review'),
    4: t('flightBooking.steps.payment'),
    5: t('flightBooking.steps.confirmed')
  };

  const renderStepBar = () => (
    <div className="step-bar">
      {Object.entries(STEP_LABELS).map(([step, label], idx) => {
        const n = parseInt(step);
        const isDone = n < currentStep;
        const isActive = n === currentStep;
        return (
          <div key={step} className="step-item">
            <div className={`step-bubble ${isActive ? 'active' : isDone ? 'done' : ''}`}>
              {isDone ? '✓' : n}
            </div>
            <span className={`step-label ${isActive ? 'active' : isDone ? 'done' : ''}`}>{label}</span>
            {idx < Object.keys(STEP_LABELS).length - 1 && (
              <div className={`step-line ${isDone ? 'done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  // ─── Passengers Step ────────────────────────────────────────────────────────
  const renderPassengers = () => (
    <div>
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
                <label className="field-label">{t('flightBooking.passengersStep.title')} <span className="req">*</span></label>
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

  // ─── Payment Step ───────────────────────────────────────────────────────────
  const renderPayment = () => (
    <div>
      {holdRemainingTime && (
        <div className="hold-timer">
          <span className="hold-timer-label">Hold expires in</span>
          <span className="hold-timer-value">{holdRemainingTime}</span>
        </div>
      )}
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <span className="card-title">Secure Payment</span>
        </div>
        <div className="card-body">
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--gold-dim)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <div>
              {orderReference && <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Reference: {orderReference}</div>}
              {airlinePnr && <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>PNR: {airlinePnr}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Total Due</div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, fontWeight: 600, color: 'var(--gold)' }}>{calculateTotal()} <span style={{ fontSize: 14, fontFamily: 'DM Sans', fontWeight: 400 }}>SAR</span></div>
            </div>
          </div>

          {/* Custom Card Form */}
          <form onSubmit={handleCardPayment}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Cardholder Name</label>
              <input type="text" name="cardHolder" value={cardForm.cardHolder} onChange={handleCardInput} placeholder="John Doe" disabled={processing}
                style={{ width: '100%', padding: '11px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Card Number</label>
              <input type="text" name="cardNumber" value={cardForm.cardNumber.replace(/(.{4})/g, '$1 ').trim()} onChange={handleCardInput} placeholder="4111 1111 1111 1111" disabled={processing} maxLength="19"
                style={{ width: '100%', padding: '11px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'DM Sans, sans-serif', fontSize: 14, letterSpacing: '0.05em' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Month</label>
                <select name="expiryMonth" value={cardForm.expiryMonth} onChange={handleCardInput} disabled={processing}
                  style={{ width: '100%', padding: '11px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{String(i + 1).padStart(2, '0')}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Year</label>
                <select name="expiryYear" value={cardForm.expiryYear} onChange={handleCardInput} disabled={processing}
                  style={{ width: '100%', padding: '11px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
                  <option value="">YY</option>
                  {Array.from({ length: 10 }, (_, i) => { const y = new Date().getFullYear() + i; return <option key={y} value={String(y).slice(-2)}>{String(y).slice(-2)}</option>; })}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>CVV</label>
                <input type="text" name="cvv" value={cardForm.cvv} onChange={handleCardInput} placeholder="123" disabled={processing} maxLength="4"
                  style={{ width: '100%', padding: '11px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={processing} style={{ width: '100%', marginTop: 8 }}>
              {processing ? (<><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Processing Payment…</>) : `Pay ${calculateTotal()} SAR`}
            </button>
          </form>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            256-bit Secure Encryption · Secure booking
          </div>
        </div>
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
    const cities = { JED: 'JEDDAH', RUH: 'RIYADH', CAI: 'CAIRO', DXB: 'DUBAI', DOH: 'DOHA', LHE: 'LAHORE', TAS: 'TASHKENT', MED: 'MADINAH', DMM: 'DAMMAM', ABH: 'albahah', AUH: 'ABU DHABI', KWI: 'KUWAIT', BAH: 'BAHRAIN', MCT: 'MUSCAT', AMM: 'AMMAN', BEY: 'BEIRUT', IST: 'ISTANBUL' };
    return cities[code] || code;
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

  const renderConfirmation = () => (
    <div style={{ gridColumn: '1 / -1', maxWidth: 820, margin: '0 auto' }}>
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          .booking-header, .no-print { display: none !important; }
          .booking-body { padding: 0 !important; max-width: 100% !important; }
          .booking-root::before { display: none !important; }
          .eticket-wrap { box-shadow: none !important; }
        }
        .eticket-wrap { font-family: 'DM Sans', Arial, Helvetica, sans-serif; color: #1a1a1a; }
        .eticket-wrap table { border-collapse: collapse; }
        .eticket-wrap td, .eticket-wrap th { vertical-align: top; }
      `}} />

      <div className="eticket-wrap" style={{ background: '#fff', border: '1px solid #d4d4d4', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>

        {/* ── Header Bar ── */}
        <div style={{ background: '#2d2d2d', color: '#fff', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 600, letterSpacing: '0.03em' }}>
          <span>{formatDateShort(tkt.departureDate)} {flight?.legs?.length > 1 ? `▸ ${formatDateShort(flight.legs[flight.legs.length - 1]?.date || tkt.departureDate)}` : ''} {t('flightBooking.confirmationStep.tripTo')} {getCityName(tkt.destination)}</span>
          <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.7 }}>{t('flightBooking.confirmationStep.eTicketConfirmation')}</span>
        </div>

        {/* ── Passenger & Consultant Row ── */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{t('flightBooking.confirmationStep.preparedFor')}</div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.02em' }}>{tkt.paxName}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{t('flightBooking.confirmationStep.travelConsultant')}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Tilal Rimal</div>
          </div>
        </div>

        {/* ── Reservation Codes ── */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #e5e5e5', display: 'flex', gap: 32 }}>
          <div>
            <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('flightBooking.confirmationStep.reservationCode')} &nbsp;</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{orderReference || '—'}</span>
          </div>
          <div>
            <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('flightBooking.confirmationStep.airlineReservationCode')} &nbsp;</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{airlinePnr || 'Pending'}</span>
            {tkt.airline && <span style={{ fontSize: 11, color: '#888', marginLeft: 6 }}>({tkt.airline.split(' ').map(w => w[0]).join('')})</span>}
          </div>
        </div>

        {/* ── Flight Segments ── */}
        {(flight?.legs?.length > 0 ? flight.legs : [{ from: tkt.origin, to: tkt.destination, date: tkt.departureDate, airline: tkt.airline, flightNo: tkt.flightNo, dep: '', arr: '', duration: '' }]).map((leg, i) => {
          // Handle various possible field names for times and duration
          const depTime = leg.dep || leg.departure || leg.departureTime || leg.departure_time || leg.departing_at || '—';
          const arrTime = leg.arr || leg.arrival || leg.arrivalTime || leg.arrival_time || leg.arriving_at || '—';
          const dur = leg.duration || leg.flightDuration || leg.flight_duration || leg.flightTimeInMinutes || '—';
          const durationStr = typeof dur === 'number' ? `${Math.floor(dur / 60)}hr(s) ${dur % 60}min(s)` : dur || '—';

          return (
            <div key={i} style={{ borderBottom: '1px solid #e5e5e5' }}>
              {/* Segment Header */}
              <div style={{ padding: '12px 24px', background: '#f7f7f7', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#666" style={{ flexShrink: 0 }}><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0011.5 2 1.5 1.5 0 0010 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{t('flightBooking.confirmationStep.departure', { date: formatDate(leg.date) })}</span>
                <span style={{ fontSize: 11, color: '#888', fontWeight: 400, marginLeft: 4 }}>{t('flightBooking.confirmationStep.verifyFlightTimes')}</span>
              </div>

              {/* Segment Details Table */}
              <div style={{ padding: '16px 24px' }}>
                <table style={{ width: '100%', fontSize: 13 }}>
                  <tbody>
                    <tr>
                      <td style={{ width: '28%', paddingBottom: 16 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{leg.airline || tkt.airline}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#2c3e50' }}>{leg.flightNo || tkt.flightNo}</div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>Duration:</div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{durationStr}</div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>Cabin:</div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{tkt.cabin}</div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>Status:</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#2a9950' }}>Confirmed</div>
                      </td>
                      <td style={{ width: '24%', paddingBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{leg.from || tkt.origin}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>{getCityName(leg.from || tkt.origin)}</div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 10 }}>Departing At:</div>
                        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.02em' }}>{depTime}</div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>Terminal:</div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{leg.departureTerminal || leg.departure_terminal || 'Main Terminal'}</div>
                      </td>
                      <td style={{ width: '4%', textAlign: 'center', paddingTop: 28 }}>
                        <span style={{ fontSize: 16, color: '#2c3e50' }}>▸</span>
                      </td>
                      <td style={{ width: '24%', paddingBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{leg.to || tkt.destination}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>{getCityName(leg.to || tkt.destination)}</div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 10 }}>Arriving At:</div>
                        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.02em' }}>{arrTime}</div>
                        <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>Terminal:</div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{leg.arrivalTerminal || leg.arrival_terminal || 'Not Available'}</div>
                      </td>
                      <td style={{ width: '20%', paddingLeft: 12, paddingBottom: 16, borderLeft: '1px solid #eee' }}>
                        <div style={{ fontSize: 11, color: '#888' }}>Aircraft:</div>
                        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>{leg.aircraft || leg.equipment || 'BOEING 777-300ER'}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>Meals:</div>
                        <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 8 }}>{leg.meals || 'Included'}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>Baggage:</div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{leg.baggage || '1 Piece(s)'}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Passenger line under this segment */}
                <div style={{ borderTop: '1px solid #eee', marginTop: 4, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <div>
                    <span style={{ color: '#888', fontSize: 11 }}>Passenger Name: </span>
                    <span style={{ fontWeight: 700 }}>{tkt.paxName}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    <div><span style={{ color: '#888', fontSize: 11 }}>Seats: </span><span style={{ fontWeight: 500 }}>—</span></div>
                    <div style={{ fontWeight: 500, color: '#2c3e50' }}>Check-In Required</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ── Ticket Details ── */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e5e5', background: '#fafafa' }}>
          <table style={{ width: '100%', fontSize: 12 }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0' }}>
                  <span style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ticket Number: </span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#2c3e50' }}>{ticketNumber || 'Pending Issuance'}</span>
                </td>
                <td style={{ padding: '8px 0', textAlign: 'center' }}>
                  <span style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Amount: </span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{calculateTotal()} SAR</span>
                </td>
                <td style={{ padding: '8px 0', textAlign: 'right' }}>
                  <span style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payment Status: </span>
                  <span style={{ fontWeight: 700, fontSize: 12, color: '#2a9950', background: 'rgba(42,153,80,0.1)', padding: '3px 10px', borderRadius: 3 }}>PAID</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── All Passengers List ── */}
        {passengers.length > 0 && (
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e5e5' }}>
            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 600 }}>PASSENGER DETAILS</div>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <th style={{ textAlign: 'left', padding: '6px 0', fontSize: 11, color: '#888', fontWeight: 500 }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '6px 0', fontSize: 11, color: '#888', fontWeight: 500 }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '6px 0', fontSize: 11, color: '#888', fontWeight: 500 }}>Document</th>
                  <th style={{ textAlign: 'left', padding: '6px 0', fontSize: 11, color: '#888', fontWeight: 500 }}>Email</th>
                  <th style={{ textAlign: 'right', padding: '6px 0', fontSize: 11, color: '#888', fontWeight: 500 }}>Ticket</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '8px 0', fontWeight: 600 }}>{(p.title || '').toUpperCase()} {(p.firstName || '').toUpperCase()} {(p.lastName || '').toUpperCase()}</td>
                    <td style={{ padding: '8px 0', color: '#666' }}>{p.type === 'ADT' ? 'Adult' : p.type === 'CHD' ? 'Child' : 'Infant'}</td>
                    <td style={{ padding: '8px 0', color: '#666' }}>{p.documentNumber || '—'}</td>
                    <td style={{ padding: '8px 0', color: '#666' }}>{p.email || '—'}</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600, color: '#2c3e50' }}>{p.ticketNumber || ticketNumber || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#aaa' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#666', marginBottom: 2 }}>{t('flightBooking.confirmationStep.travelConsultant')}</div>
            <div>Tilal Rimal — tilalrimal.com</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, color: '#666', marginBottom: 2 }}>{t('flightBooking.confirmationStep.bookingDate')}</div>
            <div>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* ── Actions (not printed) ── */}
      <div className="no-print" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="btn btn-primary" style={{ flex: 1, background: '#2d2d2d' }} onClick={() => window.print()}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          {t('flightBooking.confirmationStep.printETicket')}
        </button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
          const el = document.querySelector('.eticket-wrap');
          if (el) { const w = window.open('', '_blank'); w.document.write('<html><head><title>E-Ticket</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"><style>body{margin:20px;font-family:"DM Sans",sans-serif}table{border-collapse:collapse}td,th{vertical-align:top}</style></head><body>' + el.outerHTML + '</body></html>'); w.document.close(); w.print(); }
        }}>
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
        <header className="booking-header">
          <div className="header-secure">
            <div className="header-logo-black"></div>
            <div className="header-secure-badge">
              {/* <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 5a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> */}
            </div>
          </div>
        </header>

        <div className="booking-body">
          {currentStep !== STEPS.CONFIRMATION && renderStepBar()}

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
              <main>
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

              {renderSidebar()}
            </>
          )}
        </div>
      </div>
    </>
  );
}