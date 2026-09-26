'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ─── Shared Styles (Gold Theme) ─────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --gold: #c9a84c;
    --gold-light: #e2c97e;
    --gold-dim: rgba(201,168,76,0.15);
    --ink: #0e0c0a;
    --parchment: #faf8f4;
    --muted: #7a7469;
    --border: rgba(201,168,76,0.2);
    --card-bg: rgba(255,253,248,0.96);
    --shadow: 0 4px 40px rgba(14,12,10,0.08);
  }

  .confirm-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--parchment);
    min-height: 100vh;
    color: var(--ink);
  }

  .confirm-root::before {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background:
      radial-gradient(ellipse 80% 50% at 20% -10%, rgba(201,168,76,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 110%, rgba(201,168,76,0.05) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  .confirm-header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(250,248,244,0.92);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    padding: 0 40px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 0.08em;
    color: var(--ink);
  }

  .header-logo span { color: var(--gold); }

  .confirm-body {
    position: relative;
    z-index: 1;
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 24px 80px;
  }

  .card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 2px;
    box-shadow: var(--shadow);
    overflow: hidden;
    margin-bottom: 20px;
  }

  .success-hero {
    text-align: center;
    padding: 48px 28px 36px;
    background: linear-gradient(160deg, rgba(201,168,76,0.07) 0%, transparent 60%);
    border-bottom: 1px solid var(--border);
  }

  .success-icon {
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

  .success-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 34px;
    font-weight: 500;
    letter-spacing: 0.02em;
    color: var(--ink);
    margin-bottom: 8px;
  }

  .success-subtitle {
    font-size: 14px;
    color: var(--muted);
    letter-spacing: 0.03em;
  }

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
    margin-top: 16px;
  }

  .card-body { padding: 24px 28px; }

  .ref-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    margin: 24px 0;
  }

  @media (max-width: 600px) { 
    .ref-grid { grid-template-columns: 1fr; } 
  }

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

  .card-subtitle {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    font-weight: 500;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border);
    margin-top: 20px;
  }

  .flight-seg {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--border);
  }

  .flight-seg:last-child { border-bottom: none; }

  .flight-route {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .flight-route-sep { color: var(--gold); margin: 0 8px; }

  .flight-meta {
    font-size: 12px;
    color: var(--muted);
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

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 28px;
    border-radius: 2px;
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

  .btn-primary:hover {
    background: #b8953e;
    box-shadow: 0 6px 28px rgba(201,168,76,0.45);
  }

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

  .nav-btns .btn { flex: 1; }

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
`;

export default function ConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params?.lang || 'en';

  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  // Load booking data
  useEffect(() => {
    const orderRef = searchParams.get('order_ref');
    const paymentId = searchParams.get('payment_id');
    const pending = searchParams.get('pending') === 'true';

    // Try to load confirmation from localStorage
    const savedConfirmation = localStorage.getItem('bookingConfirmation');
    
    if (savedConfirmation) {
      const confirmation = JSON.parse(savedConfirmation);
      setBookingData({
        ...confirmation,
        orderReference: orderRef || confirmation.pnr,
        paymentId: paymentId || confirmation.paymentId,
      });
      setLoading(false);

      // If pending, poll for ticket status
      if (pending || confirmation.status === 'PENDING_TICKETING') {
        setPolling(true);
        pollForTicket(orderRef || confirmation.pnr);
      }
    } else if (orderRef) {
      // Try to fetch from backend
      fetchBookingDetails(orderRef);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  // Fetch booking details from backend
  const fetchBookingDetails = async (orderRef) => {
    try {
      const response = await fetch(`${API_BASE}/v2/ndc/bookings/${orderRef}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setBookingData({
          orderReference: data.data.order_reference,
          pnr: data.data.airline_pnr,
          status: data.data.booking_status,
          ticketNumbers: data.data.ticket_numbers,
          flight: data.data.flight_data,
          passengers: data.data.passengers,
          totalAmount: data.data.total_amount,
          currency: data.data.currency,
        });
      }
    } catch (err) {
      console.error('Failed to fetch booking:', err);
    }
    setLoading(false);
  };

  // Poll for ticket status (webhook confirmation)
  const pollForTicket = async (orderRef, attempts = 0) => {
    if (attempts >= 30) {
      setPolling(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/v2/ndc/bookings/${orderRef}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const status = data.data.booking_status;
        
        if (status === 'TICKETED') {
          setBookingData(prev => ({
            ...prev,
            status: 'TICKETED',
            ticketNumbers: data.data.ticket_numbers,
            pnr: data.data.airline_pnr || prev.pnr,
            passengers: data.data.passengers?.map((p, i) => ({
              ...prev?.passengers?.[i],
              ...p,
            })) || prev.passengers,
          }));
          setPolling(false);
          return;
        }

        if (status === 'NDC_FAILED' || status === 'PAYMENT_FAILED') {
          setBookingData(prev => ({ ...prev, status }));
          setPolling(false);
          return;
        }
      }

      // Continue polling
      setTimeout(() => pollForTicket(orderRef, attempts + 1), 2000);
    } catch (err) {
      console.error('Polling error:', err);
      setTimeout(() => pollForTicket(orderRef, attempts + 1), 2000);
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="confirm-root">
          <div className="loading-screen">
            <div className="spinner" />
            <p className="loading-text">Loading confirmation…</p>
          </div>
        </div>
      </>
    );
  }

  // No data state
  if (!bookingData) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="confirm-root">
          <div className="loading-screen">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, marginBottom: 12 }}>
                Booking not found
              </div>
              <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 14 }}>
                Please check your booking reference.
              </p>
              <button className="btn btn-ghost" style={{ display: 'inline-flex' }} onClick={() => router.push(`/${lang}/ndc-flights`)}>
                Search Flights
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const isTicketed = bookingData.status === 'TICKETED';
  const isPending = polling || bookingData.status === 'PENDING_TICKETING' || bookingData.status === 'PAID';
  const isFailed = bookingData.status === 'NDC_FAILED' || bookingData.status === 'PAYMENT_FAILED';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="confirm-root">
        {/* Header */}
        <header className="confirm-header">
          <div className="header-logo">Tilal<span>Rimal</span></div>
        </header>

        <div className="confirm-body">
          <div className="card">
            {/* Success Hero */}
            <div className="success-hero">
              <div className="success-icon">
                {isFailed ? (
                  <svg width="28" height="28" fill="none" stroke="#b94040" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : isPending ? (
                  <div className="spinner" style={{ width: 28, height: 28, borderWidth: 2 }} />
                ) : (
                  <svg width="28" height="28" fill="none" stroke="var(--gold)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="success-title">
                {isFailed ? 'Booking Failed' : isPending ? 'Processing Booking' : 'Booking Confirmed'}
              </div>
              <div className="success-subtitle">
                {isFailed 
                  ? 'Please contact support for assistance.'
                  : isPending 
                    ? 'Your ticket is being issued. This may take a moment.'
                    : 'Your ticket has been issued. Safe travels.'}
              </div>
              <span className="status-badge" style={isFailed ? { background: 'rgba(220,80,80,0.1)', color: '#b94040', borderColor: 'rgba(220,80,80,0.25)' } : {}}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isFailed ? '#b94040' : isPending ? 'var(--gold)' : '#2a9950', display: 'inline-block' }} />
                {bookingData.status || (isTicketed ? 'TICKETED' : 'CONFIRMED')}
              </span>
            </div>

            <div className="card-body">
              {/* Reference Grid */}
              <div className="ref-grid">
                <div className="ref-cell">
                  <div className="ref-cell-label">Booking Reference</div>
                  <div className="ref-cell-value">{bookingData.orderReference || '—'}</div>
                </div>
                <div className="ref-cell">
                  <div className="ref-cell-label">PNR</div>
                  <div className="ref-cell-value">{bookingData.pnr || 'Pending'}</div>
                </div>
                <div className="ref-cell">
                  <div className="ref-cell-label">Ticket Number</div>
                  <div className="ref-cell-value gold">
                    {bookingData.ticketNumbers?.[0] || (isPending ? 'Issuing...' : 'Pending')}
                  </div>
                </div>
              </div>

              {/* Flight Details */}
              {bookingData.flight && (
                <>
                  <div className="card-subtitle">Flight Details</div>
                  {(bookingData.flight.legs || [bookingData.flight]).map((leg, i) => (
                    <div key={i} className="flight-seg">
                      <div>
                        <div className="flight-route">
                          {leg.from || leg.origin || '—'}
                          <span className="flight-route-sep">→</span>
                          {leg.to || leg.destination || '—'}
                        </div>
                        <div className="flight-meta">
                          {leg.airline || bookingData.flight.airline || ''} · {leg.flightNo || leg.flight_number || ''}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 500 }}>{leg.dep || ''} – {leg.arr || ''}</div>
                        <div className="flight-meta">{leg.date || bookingData.flight.departure_date || ''}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Passengers */}
              {bookingData.passengers?.length > 0 && (
                <>
                  <div className="card-subtitle">Passengers</div>
                  {bookingData.passengers.map((p, i) => (
                    <div key={i} className="pax-row">
                      <div>
                        <div className="pax-name">
                          {p.title || ''} {p.firstName || p.first_name || ''} {p.lastName || p.last_name || ''}
                        </div>
                        <div className="pax-email">{p.email || ''}</div>
                      </div>
                      {(p.ticketNumber || p.ticket_number || bookingData.ticketNumbers?.[i]) && (
                        <div className="pax-ticket">
                          Ticket: {p.ticketNumber || p.ticket_number || bookingData.ticketNumbers?.[i]}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* Price */}
              {bookingData.totalAmount && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '2px solid var(--gold-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600 }}>Total Paid</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 600, color: 'var(--gold)' }}>
                    {bookingData.totalAmount} <span style={{ fontSize: 14, fontWeight: 400 }}>{bookingData.currency || 'SAR'}</span>
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="nav-btns">
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Ticket
                </button>
                <button className="btn btn-ghost" onClick={() => router.push(`/${lang}`)}>
                  Return Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
