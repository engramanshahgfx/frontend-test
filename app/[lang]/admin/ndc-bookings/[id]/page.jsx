'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params?.lang || 'en';
  const bookingId = params?.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  // Mock booking data for testing
  const mockBookingsData = {
    'BK001': {
      id: 'BK001',
      pnr: 'PNRABC123',
      status: 'CONFIRMED',
      createdAt: '2026-02-20T10:30:00',
      updatedAt: '2026-02-20T10:35:00',
      passengers: [
        { 
          type: 'ADT', 
          firstName: 'Ahmed', 
          lastName: 'Ali', 
          email: 'ahmed@example.com', 
          phone: '+966501234567',
          gender: 'male',
          dateOfBirth: '1990-05-15',
          nationality: 'SA',
          passportNumber: 'A12345678',
          passportExpiry: '2028-05-15'
        }
      ],
      flight: {
        outbound: {
          airline: 'Saudia',
          airlineCode: 'SV',
          flightNumber: 'SV553',
          aircraft: 'Boeing 787-9',
          origin: { code: 'JED', city: 'Jeddah', name: 'King Abdulaziz International Airport' },
          destination: { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport' },
          departureTime: '12:00',
          arrivalTime: '15:30',
          date: '2026-03-15',
          duration: '3h 30m',
          class: 'Economy',
          cabin: 'Y'
        }
      },
      bundle: {
        name: 'Flex Plus',
        code: 'FLEXPLUS',
        services: [
          { name: 'Checked Baggage', description: '2 x 23kg bags', included: true },
          { name: 'Seat Selection', description: 'Standard seat selection', included: true },
          { name: 'Changes/Cancellation', description: 'Free changes, partial refund', included: true },
          { name: 'Priority Boarding', description: 'Priority boarding access', included: true },
          { name: 'Lounge Access', description: 'Business lounge access', included: false }
        ]
      },
      pricing: {
        baseFare: 950,
        taxes: 180,
        bundlePrice: 120,
        totalPrice: 1250,
        currency: 'SAR'
      },
      payment: {
        status: 'PAID',
        method: 'Credit Card',
        cardLast4: '4242',
        brand: 'Visa',
        transactionId: 'TXN_ABC123456',
        paidAt: '2026-02-20T10:32:00',
        refundable: true,
        refundedAmount: 0
      },
      ticketing: {
        status: 'PENDING',
        ticketNumber: null,
        issuedAt: null
      },
      timeline: [
        { event: 'Booking Created', date: '2026-02-20T10:30:00', status: 'completed' },
        { event: 'Payment Received', date: '2026-02-20T10:32:00', status: 'completed' },
        { event: 'Booking Confirmed', date: '2026-02-20T10:35:00', status: 'completed' },
        { event: 'Ticket Pending', date: null, status: 'pending' }
      ]
    },
    'BK002': {
      id: 'BK002',
      pnr: 'PNRDEF456',
      status: 'PENDING',
      createdAt: '2026-02-21T14:15:00',
      updatedAt: '2026-02-21T14:15:00',
      passengers: [
        { 
          type: 'ADT', 
          firstName: 'Sara', 
          lastName: 'Mohammed', 
          email: 'sara@example.com', 
          phone: '+966509876543',
          gender: 'female',
          dateOfBirth: '1985-08-22',
          nationality: 'SA',
          passportNumber: 'B87654321',
          passportExpiry: '2029-08-22'
        }
      ],
      flight: {
        outbound: {
          airline: 'Emirates',
          airlineCode: 'EK',
          flightNumber: 'EK101',
          aircraft: 'Airbus A380',
          origin: { code: 'RUH', city: 'Riyadh', name: 'King Khalid International Airport' },
          destination: { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport' },
          departureTime: '08:30',
          arrivalTime: '11:00',
          date: '2026-03-18',
          duration: '2h 30m',
          class: 'Business',
          cabin: 'C'
        }
      },
      bundle: {
        name: 'Business Flex',
        code: 'BIZFLEX',
        services: [
          { name: 'Checked Baggage', description: '3 x 32kg bags', included: true },
          { name: 'Seat Selection', description: 'Premium seat selection', included: true },
          { name: 'Changes/Cancellation', description: 'Free changes and full refund', included: true },
          { name: 'Priority Boarding', description: 'Priority boarding access', included: true },
          { name: 'Lounge Access', description: 'Business lounge access', included: true }
        ]
      },
      pricing: {
        baseFare: 1400,
        taxes: 250,
        bundlePrice: 150,
        totalPrice: 1800,
        currency: 'SAR'
      },
      payment: {
        status: 'PENDING',
        method: 'Pending',
        cardLast4: null,
        brand: null,
        transactionId: null,
        paidAt: null,
        refundable: false,
        refundedAmount: 0
      },
      ticketing: {
        status: 'PENDING',
        ticketNumber: null,
        issuedAt: null
      },
      timeline: [
        { event: 'Booking Created', date: '2026-02-21T14:15:00', status: 'completed' },
        { event: 'Awaiting Payment', date: null, status: 'pending' }
      ]
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      // For testing, use mock data
      // In production, replace with actual API call:
      // const response = await fetch(`${API_URL}/ndc/admin/bookings/${bookingId}`);
      // const data = await response.json();
      
      setTimeout(() => {
        const mockBooking = mockBookingsData[bookingId] || generateMockBooking(bookingId);
        setBooking(mockBooking);
        setLoading(false);
      }, 600);
    } catch (error) {
      console.error('Error fetching booking:', error);
      setLoading(false);
    }
  };

  const generateMockBooking = (id) => ({
    id: id,
    pnr: `PNR${id.replace('BK', '')}`,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    passengers: [{ type: 'ADT', firstName: 'Guest', lastName: 'User', email: 'guest@example.com', phone: '+966500000000' }],
    flight: {
      outbound: {
        airline: 'Saudia',
        airlineCode: 'SV',
        flightNumber: 'SV000',
        aircraft: 'Boeing 777',
        origin: { code: 'JED', city: 'Jeddah' },
        destination: { code: 'DXB', city: 'Dubai' },
        departureTime: '10:00',
        arrivalTime: '13:00',
        date: '2026-04-01',
        duration: '3h 00m',
        class: 'Economy',
        cabin: 'Y'
      }
    },
    bundle: { name: 'Standard', services: [] },
    pricing: { baseFare: 800, taxes: 150, bundlePrice: 0, totalPrice: 950, currency: 'SAR' },
    payment: { status: 'PAID', method: 'Card', transactionId: 'TXN_XXX' },
    ticketing: { status: 'PENDING' },
    timeline: []
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleIssueTicket = async () => {
    setActionLoading(true);
    // Mock API call - replace with actual NDC OrderRetrieve/Ticketing
    setTimeout(() => {
      setBooking(prev => ({
        ...prev,
        status: 'TICKETED',
        ticketing: {
          status: 'ISSUED',
          ticketNumber: `${booking.flight.outbound.airlineCode}${Math.random().toString().slice(2, 15)}`,
          issuedAt: new Date().toISOString()
        },
        timeline: [
          ...prev.timeline.filter(t => t.status === 'completed'),
          { event: 'Ticket Issued', date: new Date().toISOString(), status: 'completed' }
        ]
      }));
      setActionLoading(false);
    }, 1500);
  };

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking? This action may trigger a refund.')) return;
    
    setActionLoading(true);
    // Mock API call - replace with actual NDC OrderCancel
    setTimeout(() => {
      setBooking(prev => ({
        ...prev,
        status: 'CANCELLED',
        payment: {
          ...prev.payment,
          status: 'REFUNDED',
          refundedAmount: prev.pricing.totalPrice
        },
        timeline: [
          ...prev.timeline.filter(t => t.status === 'completed'),
          { event: 'Booking Cancelled', date: new Date().toISOString(), status: 'completed' },
          { event: 'Refund Processed', date: new Date().toISOString(), status: 'completed' }
        ]
      }));
      setActionLoading(false);
    }, 1500);
  };

  const handleResendConfirmation = async () => {
    alert('Confirmation email resent to ' + booking.passengers[0].email);
  };

  const getStatusColor = (status) => {
    const colors = {
      'CONFIRMED': '#22c55e',
      'TICKETED': '#3b82f6',
      'PENDING': '#f59e0b',
      'CANCELLED': '#ef4444',
      'ISSUED': '#22c55e',
      'PAID': '#22c55e',
      'REFUNDED': '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{
          width: 48,
          height: 48,
          border: '3px solid #e2e8f0',
          borderTopColor: '#3b82f6',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{
        minHeight: '100vh',
        background: ' #e2e8f0',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>😕</div>
          <h2 style={{ color: '#1e293b', marginBottom: '8px' }}>Booking Not Found</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>The booking you're looking for doesn't exist.</p>
          <Link href={`/${lang}/admin/ndc-bookings`} style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            color: 'white',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 600
          }}>
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '24px',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        
        .detail-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.05);
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          color: #64748b;
          font-size: 0.9rem;
        }
        .info-value {
          color: #1e293b;
          font-weight: 600;
          text-align: right;
        }
        
        .action-btn {
          padding: 12px 24px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s ease;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }
        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .status-badge-lg {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        
        .timeline-item {
          display: flex;
          gap: 16px;
          padding: 16px 0;
          position: relative;
        }
        .timeline-item:not(:last-child)::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 48px;
          bottom: 0;
          width: 2px;
          background: #e2e8f0;
        }
        .timeline-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          flex-shrink: 0;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner-sm {
          width: 18px;
          height: 18px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link 
          href={`/${lang}/admin/ndc-bookings`}
          style={{ 
            color: '#64748b', 
            textDecoration: 'none', 
            fontSize: '0.9rem', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px',
            marginBottom: '12px'
          }}
        >
          ← Back to Bookings
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0' }}>
              ✈️ Booking {booking.pnr}
            </h1>
            <p style={{ color: '#64748b', margin: 0 }}>
              Created on {formatDate(booking.createdAt)}
            </p>
          </div>
          
          <span 
            className="status-badge-lg"
            style={{ 
              background: `${getStatusColor(booking.status)}18`,
              color: getStatusColor(booking.status),
              border: `2px solid ${getStatusColor(booking.status)}40`
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: getStatusColor(booking.status) }} />
            {booking.status}
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Flight Details */}
          <div className="detail-card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🛫 Flight Details
            </h2>
            
            <div style={{ 
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem' }}>
                    {booking.flight.outbound.airline}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {booking.flight.outbound.flightNumber} • {booking.flight.outbound.aircraft}
                  </div>
                </div>
                <div style={{ 
                  background: 'white',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: '#3b82f6'
                }}>
                  {booking.flight.outbound.class}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                    {booking.flight.outbound.origin.code}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {booking.flight.outbound.origin.city}
                  </div>
                  <div style={{ color: '#1e293b', fontWeight: 600, marginTop: '4px' }}>
                    {booking.flight.outbound.departureTime}
                  </div>
                </div>
                
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '4px' }}>
                    {booking.flight.outbound.duration}
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '2px', 
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '8px solid #8b5cf6',
                      borderTop: '4px solid transparent',
                      borderBottom: '4px solid transparent'
                    }} />
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>
                    {booking.flight.outbound.date}
                  </div>
                </div>
                
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
                    {booking.flight.outbound.destination.code}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {booking.flight.outbound.destination.city}
                  </div>
                  <div style={{ color: '#1e293b', fontWeight: 600, marginTop: '4px' }}>
                    {booking.flight.outbound.arrivalTime}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="detail-card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              👤 Passenger Information
            </h2>
            
            {booking.passengers.map((pax, index) => (
              <div key={index} style={{ 
                background: '#f8fafc', 
                borderRadius: '12px', 
                padding: '16px',
                marginBottom: index < booking.passengers.length - 1 ? '12px' : 0
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>
                    {pax.firstName} {pax.lastName}
                  </div>
                  <span style={{ 
                    background: '#e0f2fe', 
                    color: '#0284c7', 
                    padding: '4px 10px', 
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {pax.type === 'ADT' ? 'Adult' : pax.type === 'CHD' ? 'Child' : 'Infant'}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Email:</span>
                    <div style={{ color: '#1e293b', fontWeight: 500 }}>{pax.email}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Phone:</span>
                    <div style={{ color: '#1e293b', fontWeight: 500 }}>{pax.phone}</div>
                  </div>
                  {pax.passportNumber && (
                    <>
                      <div>
                        <span style={{ color: '#64748b' }}>Passport:</span>
                        <div style={{ color: '#1e293b', fontWeight: 500 }}>{pax.passportNumber}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Expiry:</span>
                        <div style={{ color: '#1e293b', fontWeight: 500 }}>{pax.passportExpiry}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bundle / Services */}
          {booking.bundle && (
            <div className="detail-card">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                📦 Bundle: {booking.bundle.name}
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {booking.bundle.services?.map((service, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    padding: '10px',
                    background: service.included ? '#f0fdf4' : '#f8fafc',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '1rem' }}>
                      {service.included ? '✅' : '❌'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                        {service.name}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        {service.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Actions */}
          <div className="detail-card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 16px 0' }}>
              ⚡ Quick Actions
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {booking.status === 'CONFIRMED' && booking.payment.status === 'PAID' && (
                <button
                  className="action-btn"
                  onClick={handleIssueTicket}
                  disabled={actionLoading}
                  style={{ background: ' #16a34a', color: 'white', width: '100%', justifyContent: 'center' }}
                >
                  {actionLoading ? <span className="spinner-sm" /> : '🎫'} Issue Ticket
                </button>
              )}
              
              {booking.ticketing?.status === 'ISSUED' && (
                <button
                  className="action-btn"
                  style={{ background: '#e0f2fe', color: '#0284c7', width: '100%', justifyContent: 'center' }}
                >
                  📄 Download E-Ticket
                </button>
              )}
              
              <button
                className="action-btn"
                onClick={handleResendConfirmation}
                style={{ background: '#f1f5f9', color: '#475569', width: '100%', justifyContent: 'center' }}
              >
                📧 Resend Confirmation
              </button>
              
              {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                <button
                  className="action-btn"
                  onClick={handleCancelBooking}
                  disabled={actionLoading}
                  style={{ background: '#fee2e2', color: '#dc2626', width: '100%', justifyContent: 'center' }}
                >
                  {actionLoading ? <span className="spinner-sm" /> : '❌'} Cancel Booking
                </button>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="detail-card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              💳 Payment
            </h2>
            
            <span 
              className="status-badge-lg"
              style={{ 
                background: `${getStatusColor(booking.payment.status)}18`,
                color: getStatusColor(booking.payment.status),
                border: `1px solid ${getStatusColor(booking.payment.status)}40`,
                marginBottom: '16px',
                display: 'inline-flex'
              }}
            >
              {booking.payment.status}
            </span>
            
            <div className="info-row">
              <span className="info-label">Method</span>
              <span className="info-value">{booking.payment.method}</span>
            </div>
            {booking.payment.cardLast4 && (
              <div className="info-row">
                <span className="info-label">Card</span>
                <span className="info-value">{booking.payment.brand} •••• {booking.payment.cardLast4}</span>
              </div>
            )}
            {booking.payment.transactionId && (
              <div className="info-row">
                <span className="info-label">Transaction</span>
                <span className="info-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {booking.payment.transactionId}
                </span>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="detail-card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 16px 0' }}>
              💰 Pricing
            </h2>
            
            <div className="info-row">
              <span className="info-label">Base Fare</span>
              <span className="info-value">{booking.pricing.baseFare} {booking.pricing.currency}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Taxes & Fees</span>
              <span className="info-value">{booking.pricing.taxes} {booking.pricing.currency}</span>
            </div>
            {booking.pricing.bundlePrice > 0 && (
              <div className="info-row">
                <span className="info-label">Bundle</span>
                <span className="info-value">{booking.pricing.bundlePrice} {booking.pricing.currency}</span>
              </div>
            )}
            <div className="info-row" style={{ borderTop: '2px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
              <span className="info-label" style={{ fontWeight: 700, color: '#1e293b' }}>Total</span>
              <span className="info-value" style={{ fontSize: '1.3rem', color: '#3b82f6' }}>
                {booking.pricing.totalPrice} {booking.pricing.currency}
              </span>
            </div>
            
            {booking.payment.refundedAmount > 0 && (
              <div className="info-row" style={{ background: '#fef3c7', margin: '12px -24px -24px', padding: '16px 24px', borderRadius: '0 0 16px 16px' }}>
                <span className="info-label" style={{ color: '#92400e' }}>Refunded</span>
                <span className="info-value" style={{ color: '#92400e' }}>
                  {booking.payment.refundedAmount} {booking.pricing.currency}
                </span>
              </div>
            )}
          </div>

          {/* Ticketing */}
          {booking.ticketing && (
            <div className="detail-card">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 16px 0' }}>
                🎫 Ticketing
              </h2>
              
              <div className="info-row">
                <span className="info-label">Status</span>
                <span 
                  style={{ 
                    background: `${getStatusColor(booking.ticketing.status)}18`,
                    color: getStatusColor(booking.ticketing.status),
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  {booking.ticketing.status}
                </span>
              </div>
              {booking.ticketing.ticketNumber && (
                <div className="info-row">
                  <span className="info-label">Ticket Number</span>
                  <span className="info-value" style={{ fontFamily: 'monospace' }}>
                    {booking.ticketing.ticketNumber}
                  </span>
                </div>
              )}
              {booking.ticketing.issuedAt && (
                <div className="info-row">
                  <span className="info-label">Issued At</span>
                  <span className="info-value">{formatDate(booking.ticketing.issuedAt)}</span>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          {booking.timeline && booking.timeline.length > 0 && (
            <div className="detail-card">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: '0 0 16px 0' }}>
                📅 Timeline
              </h2>
              
              <div>
                {booking.timeline.map((item, index) => (
                  <div key={index} className="timeline-item">
                    <div 
                      className="timeline-dot"
                      style={{ 
                        background: item.status === 'completed' ? '#dcfce7' : '#f1f5f9',
                        color: item.status === 'completed' ? '#16a34a' : '#9ca3af'
                      }}
                    >
                      {item.status === 'completed' ? '✓' : '○'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                        {item.event}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        {item.date ? formatDate(item.date) : 'Pending...'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
