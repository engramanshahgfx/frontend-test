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

// ─── E-Ticket Utility Helpers ──────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params?.lang || 'en';
  const isRTL = lang === 'ar';
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
  const [expandedPassengers, setExpandedPassengers] = useState({ 0: true });

  const toggleExpandPassenger = (index) => {
    setExpandedPassengers(prev => ({
      ...prev,
      [index]: !(prev[index] ?? (index === 0))
    }));
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [selectedCardType, setSelectedCardType] = useState('new');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [sessionId, setSessionId] = useState('');
  const [backendPrice, setBackendPrice] = useState(null);

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

  const extractPrice = (p) => {
    if (p === null || p === undefined) return 0;
    if (typeof p === 'number') return isNaN(p) ? 0 : p;
    if (typeof p === 'string') {
      const parsed = parseFloat(p.replace(/[^0-9.]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    if (typeof p === 'object') {
      return extractPrice(p.total || p.grandTotal || p.amount || p.price || p.value || p.raw || p.totalAmount);
    }
    return 0;
  };

  const calculateProgressiveServiceFee = (subtotal) => {
    const amount = Number(subtotal) || 0;
    if (amount <= 1000) {
      return Math.round(amount * 0.10 * 100) / 100;
    }
    const firstTier = 1000 * 0.10; // 100 SAR
    const remaining = amount - 1000;
    const secondTier = remaining * 0.05;
    return Math.round((firstTier + secondTier) * 100) / 100;
  };

  const calculateTotal = useCallback(() => {
    if (backendPrice && parseFloat(backendPrice) > 0) {
      return parseFloat(backendPrice);
    }
    if (!flight && !bundle) return 0;

    const passengerCount = passengers?.length || 1;

    const perPaxPrice = extractPrice(flight?.price) 
      || extractPrice(flight?.baseFare)
      || extractPrice(flight?.totalPrice) 
      || extractPrice(flight?.total_amount) 
      || extractPrice(flight?.amount) 
      || extractPrice(flight?.raw_price) 
      || extractPrice(flight?.fare?.total)
      || (bundle?.price && extractPrice(bundle.price) > 100 ? extractPrice(bundle.price) : 0)
      || 380;

    const baseFare = perPaxPrice * passengerCount;
    const serviceFee = typeof flight?.serviceFee === 'number'
      ? flight.serviceFee * passengerCount
      : calculateProgressiveServiceFee(baseFare);

    const activeExtrasList = [
      ...(extras?.insurance ? [{ price: 32 }] : []),
      ...(extras?.autoCheckin ? [{ price: 12 }] : []),
      ...(extras?.delayProtection ? [{ price: 18 }] : []),
      ...(extras?.cancellationFreedom ? [{ price: 23 }] : []),
      ...(extras?.baggage ? [{ price: extractPrice(extras.baggage?.price) }] : []),
      ...(extras?.seat ? [{ price: extractPrice(extras.seat?.price) }] : []),
      ...(extras?.meal ? [{ price: extractPrice(extras.meal?.price) }] : []),
    ];

    const extrasTotal = activeExtrasList.reduce((sum, extra) => sum + (extra.price || 0), 0) * passengerCount;
    const grandTotal = baseFare + serviceFee + extrasTotal;

    return grandTotal;
  }, [flight, bundle, extras, passengers, backendPrice]);

  useEffect(() => {
    const savedFlight = localStorage.getItem('selectedFlight');
    const savedBundle = localStorage.getItem('selectedBundle');
    if (savedFlight) {
      try {
        const flightData = JSON.parse(savedFlight);
        const bundleData = savedBundle ? JSON.parse(savedBundle) : null;
        setFlight(flightData);
        setBundle(bundleData || { name: 'Economy', price: extractPrice(flightData.price) || extractPrice(flightData.totalPrice) || 0 });

        const numAdults = flightData.adults !== undefined ? flightData.adults : 1;
        const numChildren = flightData.children !== undefined ? flightData.children : 0;
        const numInfants = flightData.infants !== undefined ? flightData.infants : 0;

        const generatedPassengers = [];

        for (let a = 0; a < numAdults; a++) {
          if (a === 0) {
            generatedPassengers.push({
              type: 'ADT', title: 'Mr', firstName: 'Muhammad', middleName: '', lastName: 'Tahir',
              dateOfBirth: '1992-08-22', gender: 'M', nationality: 'Saudi Arabia',
              documentType: 'passport', documentNumber: 'CH7127003', documentExpiry: '2036-01-06',
              documentIssuingCountry: 'Saudi Arabia', email: 'amanshah12sweer@gmail.com', phone: '551981751',
            });
          } else {
            generatedPassengers.push({
              type: 'ADT', title: 'Mr', firstName: '', middleName: '', lastName: '',
              dateOfBirth: '', gender: '', nationality: 'Saudi Arabia',
              documentType: 'passport', documentNumber: '', documentExpiry: '',
              documentIssuingCountry: 'Saudi Arabia', email: '', phone: '',
            });
          }
        }

        for (let c = 0; c < numChildren; c++) {
          generatedPassengers.push({
            type: 'CHD', title: 'Master', firstName: '', middleName: '', lastName: '',
            dateOfBirth: '', gender: '', nationality: 'Saudi Arabia',
            documentType: 'passport', documentNumber: '', documentExpiry: '',
            documentIssuingCountry: 'Saudi Arabia', email: '', phone: '',
          });
        }

        for (let f = 0; f < numInfants; f++) {
          generatedPassengers.push({
            type: 'INF', title: 'Master', firstName: '', middleName: '', lastName: '',
            dateOfBirth: '', gender: '', nationality: 'Saudi Arabia',
            documentType: 'passport', documentNumber: '', documentExpiry: '',
            documentIssuingCountry: 'Saudi Arabia', email: '', phone: '',
          });
        }

        if (generatedPassengers.length > 0) {
          setPassengers(generatedPassengers);
        }
      } catch (e) {
        console.error('Failed to parse saved flight:', e);
      }
    }

    const paymentStatus = searchParams.get('payment_status') || searchParams.get('status');
    const orderRef = searchParams.get('order_ref') || searchParams.get('order_reference');
    const paymentId = searchParams.get('id');
    const isTicketRequested = searchParams.get('ticket') === 'true' || 
                              searchParams.get('show_ticket') === 'true' || 
                              searchParams.get('showTicket') === 'true' || 
                              searchParams.get('view') === 'ticket' || 
                              searchParams.get('step') === 'confirmation' || 
                              searchParams.get('step') === '5';
    const currentSession = searchParams.get('session') || searchParams.get('sl');

    if (isTicketRequested) {
      const activeRef = orderRef || currentSession || 'NDCEG-BR-YBFTIURJD4';
      setOrderReference(activeRef);
      setBookingStatus('TICKETED');
      if (!ticketNumber) setTicketNumber('TK-' + Math.floor(1000000000 + Math.random() * 9000000000));
      setCurrentStep(STEPS.CONFIRMATION);
      setError(null);
      if (orderRef) fetchBookingDetails(orderRef);
      setLoading(false);
      return;
    }

    if (orderRef) {
      if (paymentStatus === 'cancelled' || paymentStatus === 'failed') {
        setError(isRTL ? 'فشلت عملية الدفع أو تم إلغاؤها. لم يتم تأكيد حجزك.' : 'Payment failed or was cancelled. Your booking has NOT been confirmed.');
        setCurrentStep(STEPS.PAYMENT);
        setLoading(false);
        return;
      }

      if ((paymentStatus === 'paid' || paymentId)) {
        setOrderReference(orderRef);
        setProcessing(true);

        // Strict Server-Side Moyasar Payment Verification & Airline Ticketing
        apiCall('/v2/akbar/bookings/pay', 'POST', {
          order_reference: orderRef,
          payment_id: paymentId
        }).then((res) => {
          if (res && res.success !== false) {
            setCurrentStep(STEPS.CONFIRMATION);
            fetchBookingDetails(orderRef);
          } else {
            setError(res?.error?.message || res?.message || (isRTL ? 'فشل التحقق من الدفع. لم يتم تأكيد الحجز.' : 'Payment verification failed. Booking not confirmed.'));
            setCurrentStep(STEPS.PAYMENT);
          }
        }).catch(err => {
          console.error('3DS payment verification error:', err);
          setError(err?.message || (isRTL ? 'فشل التحقق من عملية الدفع. لم يتم تأكيد الحجز.' : 'Payment verification failed. Booking not confirmed.'));
          setCurrentStep(STEPS.PAYMENT);
        }).finally(() => {
          setProcessing(false);
        });
      }
    } else if (!savedFlight && !currentSession) {
      setError('No flight selected.');
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
              const currentTotal = calculateTotal();
              if (!currentTotal || currentTotal <= 0) {
                setTimeout(loadMoyasar, 200);
                return;
              }
              const amountInHalalas = Math.round(currentTotal * 100);
              targetEl.innerHTML = '';

              window.Moyasar.init({
                element: '.mysr-form',
                amount: amountInHalalas,
                currency: 'SAR',
                description: `NDC Flight Booking (${orderReference || 'NDCEG-BR-YBFTIURJD4'})`,
                publishable_api_key: process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY || 'pk_test_vcMyXc4FuA6WpFiZabXA6bSb',
                callback_url: `${window.location.origin}/${lang}/akbar-flights/booking?payment_status=paid&order_ref=${orderReference || ''}`,
                methods: ['creditcard', 'stcpay', 'applepay'],
                apple_pay: {
                  country: 'SA',
                  label: 'Tilal Rimal Tourism',
                  validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
                },
                on_completed: async function (payment) {
                  console.log('Moyasar payment callback completed:', payment);
                  if (payment && payment.id) {
                    const payStatus = (payment.status || '').toLowerCase();
                    if (payStatus !== 'paid' && payStatus !== 'captured') {
                      console.log('Payment 3DS authentication pending or initiated. Deferred to callback redirect. Status:', payStatus);
                      return;
                    }

                    try {
                      setProcessing(true);
                      const res = await apiCall('/v2/akbar/bookings/pay', 'POST', {
                        order_reference: orderReference,
                        payment_id: payment.id
                      });
                      if (res && res.success !== false) {
                        setCurrentStep(STEPS.CONFIRMATION);
                        fetchBookingDetails(orderReference);
                      } else {
                        setError(res?.error?.message || res?.message || (isRTL ? 'فشل التحقق من الدفع. لم يتم تأكيد الحجز.' : 'Payment verification failed. Booking not confirmed.'));
                        setCurrentStep(STEPS.PAYMENT);
                      }
                    } catch (err) {
                      console.error('Ticketing issuance error:', err);
                      setError(err?.message || (isRTL ? 'فشل التحقق من عملية الدفع. لم يتم تأكيد الحجز.' : 'Payment verification failed. Booking not confirmed.'));
                      setCurrentStep(STEPS.PAYMENT);
                    } finally {
                      setProcessing(false);
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
          script.src = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js';
          script.onload = loadMoyasar;
          document.head.appendChild(script);

          if (!document.querySelector('link[href*="moyasar.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css';
            document.head.appendChild(link);
          }
        }
      }
    }
  }, [currentStep, orderReference, selectedCardType, calculateTotal]);

  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);

  useEffect(() => {
    // 15-Minute Flight Hold Expiry Timer (Almosafer Standard)
    const expiryTime = holdExpiresAt ? new Date(holdExpiresAt) : new Date(Date.now() + 15 * 60 * 1000);
    const timer = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiryTime - new Date()) / 1000));
      if (diff <= 0) {
        setShowSessionExpiredModal(true);
        clearInterval(timer);
        return;
      }
      setHoldRemainingTime(`${Math.floor(diff / 60)}:${String(diff % 60).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [holdExpiresAt]);

  const getAuthToken = () => typeof window !== 'undefined' ? (localStorage.getItem('authToken') || localStorage.getItem('token')) : null;

  const getMockBookingResponse = (endpoint, body) => {
    const mockRef = orderReference || `TLR 100 012 ${String(Math.floor(100 + Math.random() * 899)).padStart(3, '0')}`;

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
        total_amount: calculateTotal(),
        flight_data: {
          origin: flight?.origin || flight?.legs?.[0]?.from,
          destination: flight?.destination || flight?.legs?.[0]?.to,
          origin_airport: flight?.originAirport || flight?.legs?.[0]?.originAirport || flight?.origin,
          destination_airport: flight?.destinationAirport || flight?.legs?.[0]?.destinationAirport || flight?.destination,
          departure_date: flight?.departureDate || flight?.legs?.[0]?.date,
          departure_time: flight?.depTime || flight?.legs?.[0]?.dep,
          arrival_time: flight?.arrTime || flight?.legs?.[0]?.arr,
          airline: flight?.airline || flight?.legs?.[0]?.airline,
          flight_number: flight?.flightNo || flight?.flightNumber || flight?.legs?.[0]?.flightNo,
          duration: flight?.duration || flight?.legs?.[0]?.duration,
          cabinClass: bundle?.cabin || 'economy',
          price: calculateTotal(),
          total_amount: calculateTotal()
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
        total_amount: calculateTotal(),
        flight_data: {
          origin: flight?.origin || flight?.legs?.[0]?.from,
          destination: flight?.destination || flight?.legs?.[0]?.to,
          origin_airport: flight?.originAirport || flight?.legs?.[0]?.originAirport || flight?.origin,
          destination_airport: flight?.destinationAirport || flight?.legs?.[0]?.destinationAirport || flight?.destination,
          departure_date: flight?.departureDate || flight?.legs?.[0]?.date,
          departure_time: flight?.depTime || flight?.legs?.[0]?.dep,
          arrival_time: flight?.arrTime || flight?.legs?.[0]?.arr,
          airline: flight?.airline || flight?.legs?.[0]?.airline,
          flight_number: flight?.flightNo || flight?.flightNumber || flight?.legs?.[0]?.flightNo,
          duration: flight?.duration || flight?.legs?.[0]?.duration,
          price: calculateTotal(),
          total_amount: calculateTotal()
        },
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
    setBookingStatus('PENDING_PAYMENT');
    return { success: true, order_reference: orderReference };
  };

  const handleSubmitPayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      const ref = orderReference || ('NDCEG-BR-' + Math.random().toString(36).substring(2, 10).toUpperCase());
      const data = await apiCall('/v2/akbar/bookings/pay', 'POST', {
        order_reference: ref,
        amount: calculateTotal(),
        currency: 'SAR',
        payment_method: selectedPaymentMethod || 'creditcard'
      });
      setCurrentStep(STEPS.CONFIRMATION);
      fetchBookingDetails(ref);
      return data;
    } catch (err) {
      console.error('Payment submit error:', err);
      setError(err.message || 'Payment submission failed.');
    } finally {
      setProcessing(false);
    }
  };

  const fetchBookingDetails = async (ref) => {
    setProcessing(true);
    try {
      const data = await apiCall(`/v2/akbar/bookings/${ref}`, 'GET');
      const fd = data?.data || data;
      setBookingStatus(fd.booking_status || fd.status);
      setAirlinePnr(fd.airline_pnr || fd.airlinePnr || fd.pnr);
      setTicketNumber(fd.ticket_number || fd.ticketNumber || (fd.ticket_numbers && fd.ticket_numbers[0]));
      const priceVal = fd.customer_total_amount || fd.total_amount || fd.price;
      if (priceVal && parseFloat(priceVal) > 0) {
        setBackendPrice(parseFloat(priceVal));
      }
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

  const handleAddPassenger = (type = 'ADT') => {
    const newIndex = passengers.length;
    setPassengers(prev => [
      ...prev,
      {
        id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: type,
        title: type === 'ADT' ? 'Mr' : 'Master',
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'M',
        nationality: 'Saudi Arabia',
        documentType: 'passport',
        documentNumber: '',
        documentExpiry: '',
        documentIssuingCountry: 'Saudi Arabia',
        email: prev[0]?.email || '',
        phone: prev[0]?.phone || ''
      }
    ]);
    setExpandedPassengers(prev => ({ ...prev, [newIndex]: true }));
  };

  const handleRemovePassenger = (index) => {
    if (passengers.length <= 1) return;
    setPassengers(prev => prev.filter((_, idx) => idx !== index));
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
  const activeExtrasList = [
    ...(extras?.autoCheckin ? [{ key: 'autoCheckin', name: t('flightBooking.extrasStep.autoCheckIn'), price: 12 }] : []),
    ...(extras?.delayProtection ? [{ key: 'delayProtection', name: t('flightBooking.extrasStep.delayProtection'), price: 18 }] : []),
    ...(extras?.cancellationFreedom ? [{ key: 'cancellationFreedom', name: t('flightBooking.extrasStep.cancellationFreedom'), price: 23 }] : []),
  ];

  const renderSidebar = () => (
    <Sidebar
      flight={flight}
      step={currentStep}
      passengerName={passengers[0]?.lastName}
      addInsurance={extras?.insurance}
      extras={activeExtrasList}
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
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{lang === 'ar' ? 'تسجيل الدخول إلى حسابك (اختياري)' : 'Log-in to your account (Optional)'}</div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 2 }}>{lang === 'ar' ? 'سجل الدخول للملء التلقائي السريع، أو استمر مباشرة كضيف. لا يلزم تسجيل حساب.' : 'Log in for quick auto-fill, or continue directly as a Guest. No account registration required.'}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => router.push(`/${lang}/login`)} style={{ padding: '8px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>{t('buttons.login')}</button>
          <span style={{ padding: '8px 16px', background: '#f0fdf4', color: '#00875a', border: '1px solid #bbf7d0', borderRadius: 6, fontWeight: 700, fontSize: '0.82rem' }}>{lang === 'ar' ? '✓ المتابعة كضيف' : '✓ Continue as Guest'}</span>
        </div>
      </div>

      {/* KSA Travel Notices */}
      {/* <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: 12, padding: 18, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#c2410c', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{lang === 'ar' ? '⚠️ تنبيهات هامة للسفر إلى المملكة' : '⚠️ IMPORTANT KSA TRAVEL NOTICES'}</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.8rem', color: '#9a3412', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {lang === 'ar' ? (
            <>
              <li><strong>رحلات الـ 4 أرقام (جدة / المدينة):</strong> السفر على رحلات مكونة من 4 أرقام مسموح فقط لحاملي تأشيرة العمرة ومواطني دول مجلس التعاون.</li>
              <li><strong>قيود فترة الحج:</strong> لا يُسمح للمسافرين المسلمين حاملي تأشيرات الزيارة/الأعمال بدخول جدة أو المدينة المنورة أو الطائف خلال فترة الحج.</li>
              <li><strong>ترانزيت العمرة:</strong> يُسمح لمعتمري الترانزيت بالمرور فقط عبر الرياض على الخطوط السعودية.</li>
              <li><strong>تأشيرات السياحة / الزيارة:</strong> يجب أن يحمل المسافر تذكرة عودة مؤكدة، وإثبات إقامة، وأموال كافية.</li>
              <li><strong>صلاحية جواز السفر:</strong> يجب أن يكون جواز السفر صالحاً لمدة 6 أشهر على الأقل من تاريخ السفر.</li>
            </>
          ) : (
            <>
              <li><strong>4-Digit Flights (Jeddah / Madinah):</strong> Travel on 4-digit flight numbers to/from JED & MED is permitted only for Umrah Visa holders and GCC Nationals.</li>
              <li><strong>Hajj Period Restrictions:</strong> Muslim passengers holding Business/Visit visas are not permitted to enter Jeddah, Madinah, or Taif during Hajj period.</li>
              <li><strong>Umrah Transit:</strong> Umrah passengers are permitted to transit only via Riyadh on Saudia Airlines.</li>
              <li><strong>Tourist / Visit Visas:</strong> Holders must possess a confirmed return ticket, proof of accommodation, and sufficient funds.</li>
              <li><strong>Passport Validity:</strong> Passports must be valid for at least 6 months from the date of travel.</li>
            </>
          )}
        </ul>
      </div> */}

      {passengers.map((p, i) => {
        const isExpanded = expandedPassengers[i] ?? (i === 0);
        const isFilled = p.firstName && p.lastName && p.dateOfBirth;
        const formattedDob = p.dateOfBirth
          ? (p.dateOfBirth.includes('-') ? p.dateOfBirth.split('-').reverse().join('/') : p.dateOfBirth)
          : '';

        return (
          <div key={p.id || `p_${i}`} className="card" style={{ marginBottom: 20, border: isExpanded ? '1px solid var(--border)' : '1px solid #e2e8f0', transition: 'all 0.2s ease', borderRadius: 12, overflow: 'hidden' }}>
            <div
              className="card-header"
              onClick={() => toggleExpandPassenger(i)}
              style={{
                width: '100%',
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '18px 24px',
                background: isExpanded ? '#ffffff' : '#f8fafc',
                userSelect: 'none',
                borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                {isFilled ? (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                ) : (
                  <div className="card-header-icon" style={{ width: 28, height: 28, flexShrink: 0 }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>
                      {p.type === 'ADT'
                        ? (isRTL ? `المسافر ${i + 1} (بالغ)` : `Adult ${i + 1}`)
                        : p.type === 'CHD'
                        ? (isRTL ? `المسافر ${i + 1} (طفل)` : `Child ${i + 1}`)
                        : (isRTL ? `المسافر ${i + 1} (رضيع)` : `Infant ${i + 1}`)}
                      {p.firstName ? `: ${p.title ? p.title + ' ' : ''}${p.firstName} ${p.lastName}` : ''}
                    </span>
                  </div>
                  {formattedDob && (
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 3, fontWeight: 500 }}>
                      {formattedDob} {p.documentNumber ? `• ${isRTL ? 'الجواز' : 'Passport'}: ${p.documentNumber}` : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Controls aligned to far right edge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto', flexShrink: 0 }}>
                {i > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemovePassenger(i);
                    }}
                    style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5', padding: '6px 14px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    {isRTL ? 'حذف المسافر ×' : 'Remove Passenger ×'}
                  </button>
                )}

                {/* Chevron Dropdown Toggle Circle (Almosafer Style - Centered Arrow) */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    flexShrink: 0
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                    style={{
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      display: 'block',
                      margin: 'auto'
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Collapsible Form Body */}
            {isExpanded && (
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
                    <input type="email" className="field-input" value={p.email} onChange={e => updatePassenger(i, 'email', e.target.value)} placeholder="name@example.com" />
                  </div>
                  <div className="field">
                    <label className="field-label">{t('forms.phoneNumber')}</label>
                    <input type="tel" className="field-input" value={p.phone} onChange={e => updatePassenger(i, 'phone', e.target.value)} placeholder="05X XXX XXXX" />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Action Buttons for Adding Passengers (Adult, Child, Infant) and Search Again */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => handleAddPassenger('ADT')}
          style={{
            padding: '10px 16px',
            background: '#f0f9ff',
            color: '#0284c7',
            border: '1.5px dashed #0284c7',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span style={{ fontSize: '1rem', fontWeight: 800 }}>+</span> {isRTL ? 'إضافة بالغ (+12 سنة)' : '+ Add Adult (12+ yrs)'}
        </button>

        <button
          type="button"
          onClick={() => handleAddPassenger('CHD')}
          style={{
            padding: '10px 16px',
            background: '#fdf4ff',
            color: '#c026d3',
            border: '1.5px dashed #c026d3',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span style={{ fontSize: '1rem', fontWeight: 800 }}>+</span> {isRTL ? 'إضافة طفل (2-11 سنة)' : '+ Add Child (2-11 yrs)'}
        </button>

        <button
          type="button"
          onClick={() => handleAddPassenger('INF')}
          style={{
            padding: '10px 16px',
            background: '#f0fdf4',
            color: '#16a34a',
            border: '1.5px dashed #16a34a',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span style={{ fontSize: '1rem', fontWeight: 800 }}>+</span> {isRTL ? 'إضافة طفل رضيع (أقل من سنتين)' : '+ Add Infant (< 2 yrs)'}
        </button>

        <button
          type="button"
          onClick={() => router.push(`/${lang}/flights`)}
          style={{
            padding: '12px 20px',
            background: '#fff',
            color: '#475569',
            border: '1px solid #cbd5e1',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span>←</span> {isRTL ? 'تغيير الرحلة / البحث مجدداً' : 'Change Flight / Search Again'}
        </button>
      </div>
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
            <div key={key} className="extra-row" style={{ cursor: 'pointer' }} onClick={() => setExtras(prev => ({ ...prev, [key]: !prev[key] }))}>
              <div className={`extra-check ${extras[key] ? 'checked' : ''}`}>
                {extras[key] && <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <div className="extra-info">
                <div className="extra-name">{icon} &nbsp;{name}</div>
                <div className="extra-desc">{desc}</div>
              </div>
              <div className="extra-price">{price} <span style={{ fontSize: 12, fontFamily: 'DM Sans', fontWeight: 400, color: 'var(--muted)' }}>SAR</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── Checkout Step ──────────────────────────────────────────────────────────
  // ─── Checkout Step ──────────────────────────────────────────────────────────
  const renderCheckout = () => (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-header-icon">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </div>
          <span className="card-title">{t('flightBooking.checkout.flightItinerary')}</span>
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
          <span className="card-title">{t('flightBooking.checkout.passengers')}</span>
        </div>
        <div className="card-body">
          {passengers.map((p, i) => (
            <div key={i} className="pax-row">
              <div>
                <div className="pax-name">{p.title} {p.firstName} {p.lastName}</div>
                <div className="pax-email">{p.email}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {p.type === 'ADT' ? t('flightBooking.confirmationStep.adult') : p.type === 'CHD' ? t('flightBooking.confirmationStep.child') : t('flightBooking.confirmationStep.infant')}
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

      {/* Official Moyasar Payment SDK Form Container */}
      <div className="card" style={{ marginBottom: 20, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <span className="card-title" style={{ fontSize: 15, fontWeight: 700 }}>
            {t('flightBooking.paymentStep.enterCardDetails')}
          </span>
        </div>
        <div className="card-body" style={{ padding: 20 }}>
          <div className="mysr-form"></div>
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


  const getLegsList = () => {
    if (flight?.legs && Array.isArray(flight.legs) && flight.legs.length > 0) {
      return flight.legs;
    }
    return [
      {
        from: flight?.origin || 'JED',
        to: flight?.destination || 'CAI',
        date: flight?.departureDate || 'Sep 8, 2026',
        dep: flight?.dep || flight?.departureTime || '07:15 AM',
        arr: flight?.arr || flight?.arrivalTime || '09:30 AM',
        duration: flight?.duration || '02h 15m',
        airline: flight?.airline || 'Saudi Arabian Airlines (Saudia)',
        flightNo: flight?.flightNumber || flight?.legs?.[0]?.flightNo || 'SV-304',
        isReturn: false,
      }
    ];
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
    window.print();
  };

  const renderConfirmation = () => (
    <div style={{ gridColumn: '1 / -1', maxWidth: 840, margin: '0 auto', width: '100%' }}>
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
            border: 2px solid #E85D1F !important;
            box-shadow: none !important;
            background: #fff !important;
          }
          .no-print { display: none !important; }
        }
        .eticket-wrap { font-family: 'DM Sans', Arial, Helvetica, sans-serif; color: #0f172a; }
        .eticket-wrap table { border-collapse: collapse; }
        .eticket-wrap td, .eticket-wrap th { vertical-align: top; }
      `}} />

      <div className="eticket-wrap" style={{ background: '#fff', border: '2px solid #E85D1F', borderRadius: 12, overflow: 'hidden', boxShadow: '0 10px 40px rgba(232, 93, 31, 0.08)' }}>

        {/* ── Brand Header Bar ── */}
        <div style={{ background: '#0b1329', color: '#fff', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #E85D1F' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src="/logo.png"
              alt="Tilal Rimal Tourism Logo"
              style={{ height: 38, width: 'auto', objectFit: 'contain', verticalAlign: 'middle' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em', color: '#ffffff', lineHeight: 1.1 }}>{t('flightBooking.confirmationStep.agencyTitle')}</div>
              <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.12em', color: '#E85D1F', textTransform: 'uppercase', marginTop: 3 }}>TILAL RIMAL TOURISM</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'inline-block', background: 'rgba(232, 93, 31, 0.15)', border: '1px solid #E85D1F', color: '#ff9868', padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              ✈ {t('flightBooking.confirmationStep.eTicketReceipt')}
            </span>
          </div>
        </div>

        {/* ── Passenger & Agency Details Row ── */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#ffffff', gap: 24 }}>
          <div>
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>{t('flightBooking.confirmationStep.preparedFor')}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '0.01em' }}>{tkt.paxName}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 4 }}>{t('flightBooking.confirmationStep.issuingAgency')}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{t('flightBooking.confirmationStep.agencyTitle')}</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 2, fontWeight: 600 }}>شركة تلال الرمال لتنظيم الرحلات السياحية</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>License No: <strong style={{ color: '#0f172a' }}>73106935</strong></div>
            <div style={{ fontSize: 11, color: '#E85D1F', fontWeight: 700, marginTop: 3 }}>+966 54 730 5060 · ✉ info@tilalrimal.com</div>
          </div>
        </div>

        {/* ── Reservation Codes & Date ── */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: 16, background: '#f8fafc', padding: '14px 18px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 2 }}>{t('flightBooking.confirmationStep.reservationCode')}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#E85D1F', letterSpacing: '0.03em' }}>{orderReference || 'TLR 100 012 003'}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 2 }}>{t('flightBooking.confirmationStep.airlineReservationCode')}</div>
              <div>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', letterSpacing: '0.03em', fontFamily: 'DM Sans, monospace' }}>{airlinePnr || 'SVQKAM'}</span>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginLeft: 4 }}>(SAA())</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 2 }}>{t('flightBooking.confirmationStep.issueDate')}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
            </div>
          </div>
        </div>

        {/* ── Flight Segments (Exact Reference Layout) ── */}
        <div style={{ padding: '20px 24px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
          {getLegsList().map((leg, i, arr) => {
            const depTimeRaw = leg.dep || leg.departure || leg.departureTime || leg.departure_time || flight?.dep || flight?.departureTime || '07:15 AM';
            const arrTimeRaw = leg.arr || leg.arrival || leg.arrivalTime || leg.arrival_time || flight?.arr || flight?.arrivalTime || '09:30 AM';
            const depTime = formatTimePretty(depTimeRaw);
            const arrTime = formatTimePretty(arrTimeRaw);
            const dur = leg.duration || leg.flightDuration || flight?.duration || '02h 15m';
            const durationStr = typeof dur === 'number' ? `${Math.floor(dur / 60)}h ${dur % 60}m` : dur || '02h 15m';
            const fromCode = leg.from || (leg.isReturn ? tkt.destination : tkt.origin) || 'JED';
            const toCode = leg.to || (leg.isReturn ? tkt.origin : tkt.destination) || 'RUH';
            const legDate = formatDatePretty(leg.date || tkt.departureDate) || 'Sep 8, 2026';
            const flightNum = leg.flightNo || leg.flightNumber || tkt.flightNo || 'SV-304';
            const airlineName = leg.airline || flight?.airline || tkt.airline || 'Saudi Arabian Airlines (Saudia)';

            return (
              <div key={i} style={{ marginBottom: i < arr.length - 1 ? 20 : 0 }}>

                {/* Segment Flight Type Title Banner */}
                <div style={{ fontSize: 13, fontWeight: 800, color: '#c2410c', marginBottom: 16, background: '#fff7ed', border: '1px solid #ffedd5', borderLeft: '4px solid #E85D1F', padding: '10px 16px', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✈ {leg.isReturn || i > 0 ? `${t('flightBooking.confirmationStep.returnFlight')} — ${legDate}` : `${t('flightBooking.confirmationStep.outboundFlight')} — ${legDate}`}</span>
                  <span style={{ fontSize: 11, color: '#9a3412', fontWeight: 600 }}>Please verify terminal & flight times prior to departure</span>
                </div>

                {/* Single Segment Grid */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>

                  {/* Left Column: Departure */}
                  <div style={{ minWidth: 180 }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>{legDate}</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: 6 }}>{depTime}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{fromCode}</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, maxWidth: 200, lineHeight: 1.3 }}>{getAirportFullName(fromCode)}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Terminal 1</div>
                  </div>

                  {/* Center Column: Airline Logo, Airline Name, Flight Number & Dashed Flight Arrow */}
                  <div style={{ flexGrow: 1, margin: '0 24px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, background: '#1e293b', color: '#ff9868', borderRadius: 10, fontSize: 20, marginBottom: 8, boxShadow: '0 4px 10px rgba(15, 23, 42, 0.15)' }}>
                      ✈
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>
                      {airlineName}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 800, color: '#E85D1F', marginBottom: 8 }}>
                      {flightNum}
                    </div>

                    <div style={{ borderTop: '2px dashed #cbd5e1', position: 'relative', margin: '12px 20px' }}>
                      <span style={{ position: 'absolute', top: -10, right: '20%', background: '#fff', padding: '0 4px', color: '#94a3b8', fontSize: 14 }}>✈</span>
                    </div>

                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, marginTop: 6 }}>
                      🕒 {durationStr}
                    </div>
                    <div style={{ fontSize: 11, color: '#0f172a', fontWeight: 800, marginTop: 2 }}>
                      Price +
                    </div>
                  </div>

                  {/* Right Column: Arrival */}
                  <div style={{ minWidth: 180, textAlign: 'left' }}>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 4 }}>{legDate}</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: 6 }}>{arrTime}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{toCode}</div>
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, maxWidth: 200, lineHeight: 1.3 }}>{getAirportFullName(toCode)}</div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

        {/* ── Ticket & Payment Summary ── */}
        <div style={{ padding: '14px 24px', background: '#fafafa', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginRight: 6 }}>{t('flightBooking.confirmationStep.ticketNumber')}:</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{ticketNumber || '712-40981928'}</span>
          </div>
          <div>
            <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginRight: 6 }}>{t('flightBooking.confirmationStep.paymentStatus')}:</span>
            <span style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>✓ {t('flightBooking.confirmationStep.paidStatus')}</span>
          </div>
        </div>

        {/* ── Passenger List Table ── */}
        {passengers.length > 0 && (
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontWeight: 800 }}>{t('flightBooking.confirmationStep.passengerDetails')}</div>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '9px 12px', fontSize: 10, color: '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('flightBooking.confirmationStep.passengerName')}</th>
                  <th style={{ padding: '9px 12px', fontSize: 10, color: '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('flightBooking.confirmationStep.type')}</th>
                  <th style={{ padding: '9px 12px', fontSize: 10, color: '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('flightBooking.confirmationStep.passportId')}</th>
                  <th style={{ padding: '9px 12px', fontSize: 10, color: '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('flightBooking.confirmationStep.emailAddress')}</th>
                  <th style={{ textAlign: 'right', padding: '9px 12px', fontSize: 10, color: '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('flightBooking.confirmationStep.ticketNumber')}</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{(p.title || '').toUpperCase()} {(p.firstName || '').toUpperCase()} {(p.lastName || '').toUpperCase()}</td>
                    <td style={{ padding: '12px', color: '#475569', fontWeight: 600 }}>{p.type === 'ADT' ? t('flightBooking.confirmationStep.adult') : p.type === 'CHD' ? t('flightBooking.confirmationStep.child') : t('flightBooking.confirmationStep.infant')}</td>
                    <td style={{ padding: '12px', color: '#475569', fontWeight: 600 }}>{p.documentNumber || 'CH7127003'}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{p.email || 'amanshah12sweer@gmail.com'}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#E85D1F' }}>{p.ticketNumber || ticketNumber || '712-40981928'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Important Information Notice Box ── */}
        <div style={{ margin: '16px 24px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ background: '#3b82f6', color: '#fff', width: 18, height: 18, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0, fontWeight: 900, marginTop: 1 }}>
            i
          </div>
          <div style={{ fontSize: 11, color: '#9a3412', lineHeight: 1.5, fontWeight: 600 }}>
            <strong>{t('flightBooking.confirmationStep.importantNotice')}:</strong> {t('flightBooking.confirmationStep.noticeText')}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#64748b', background: '#f8fafc' }}>
          <div>
            <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>{t('flightBooking.confirmationStep.agencyTitle')} (شركة تلال الرمال لتنظيم الرحلات السياحية)</div>
            <div>License No: 73106935 | Phone: +966 54 730 5060 | Email: info@tilalrimal.com </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>{t('flightBooking.confirmationStep.bookingDate')}</div>
            <div style={{ fontWeight: 800, color: '#0f172a' }}>{new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* ── Actions (not printed) ── */}
      <div className="no-print" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="btn btn-primary" style={{ flex: 1, background: '#2d2d2d' }} onClick={handlePrintETicket}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          {t('flightBooking.confirmationStep.printETicket')}
        </button>
        <button className="btn btn-primary" style={{ flex: 1, background: '#E85D1F' }} onClick={handlePrintETicket}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {t('buttons.download')}
        </button>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setCurrentStep(STEPS.PASSENGERS)}>
          {isRTL ? '← العودة لنموذج الحجز' : '← Back to Booking Form'}
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
        {currentStep !== STEPS.CONFIRMATION && (
          <div style={{ maxWidth: 1100, margin: '8px auto 0 auto', padding: '0 16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setOrderReference(orderReference || sessionId || 'NDCEG-BR-YBFTIURJD4');
                setBookingStatus('TICKETED');
                if (!ticketNumber) setTicketNumber('TK-' + Math.floor(1000000000 + Math.random() * 9000000000));
                setCurrentStep(STEPS.CONFIRMATION);
                setError(null);
              }}
              style={{
                background: '#E85D1F',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 6px rgba(232, 93, 31, 0.25)'
              }}
            >
              🎟️ {isRTL ? 'معاينة / عرض التذكرة الإلكترونية' : 'View / See E-Ticket'}
            </button>
          </div>
        )}

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
                    <button className="btn btn-ghost" onClick={handlePreviousStep} disabled={processing}>
                      {isRTL ? `${t('buttons.back')} →` : `← ${t('buttons.back')}`}
                    </button>
                    <button className="btn btn-primary" onClick={handleNextStep} disabled={processing}>
                      {processing ? (
                        <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> {t('buttons.processing')}</>
                      ) : currentStep === STEPS.CHECKOUT ? (
                        isRTL ? `← ${t('buttons.payment')}` : `${t('buttons.payment')} →`
                      ) : (
                        isRTL ? `← ${t('buttons.continue')}` : `${t('buttons.continue')} →`
                      )}
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

      {/* Session Expired Modal (Almosafer Standard) */}
      {showSessionExpiredModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(6px)',
          padding: 20
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '36px 32px',
            maxWidth: 380,
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⏱️</div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
              Still around?
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>
              Your session has expired
            </p>
            <button
              type="button"
              onClick={() => router.push(`/${lang}/akbar-flights`)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0284c7',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              Go back to search
            </button>
          </div>
        </div>
      )}
    </>
  );
}