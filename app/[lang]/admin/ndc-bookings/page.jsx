'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminNDCBookingsPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params?.lang || 'en';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    totalRevenue: 0
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  // Mock booking data for testing
  const mockBookings = [
    {
      id: 'BK001',
      pnr: 'PNRABC123',
      status: 'CONFIRMED',
      createdAt: '2026-02-20T10:30:00',
      passenger: { firstName: 'Ahmed', lastName: 'Ali', email: 'ahmed@example.com', phone: '+966501234567' },
      flight: { airline: 'Saudia', flightNumber: 'SV553', origin: 'JED', destination: 'DXB', departureTime: '12:00', date: '2026-03-15' },
      totalPrice: 1250,
      currency: 'SAR',
      paymentStatus: 'PAID',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'BK002',
      pnr: 'PNRDEF456',
      status: 'PENDING',
      createdAt: '2026-02-21T14:15:00',
      passenger: { firstName: 'Sara', lastName: 'Mohammed', email: 'sara@example.com', phone: '+966509876543' },
      flight: { airline: 'Emirates', flightNumber: 'EK101', origin: 'RUH', destination: 'DXB', departureTime: '08:30', date: '2026-03-18' },
      totalPrice: 1800,
      currency: 'SAR',
      paymentStatus: 'PENDING',
      paymentMethod: 'Pending'
    },
    {
      id: 'BK003',
      pnr: 'PNRGHI789',
      status: 'CONFIRMED',
      createdAt: '2026-02-22T09:45:00',
      passenger: { firstName: 'Khalid', lastName: 'Hassan', email: 'khalid@example.com', phone: '+966507654321' },
      flight: { airline: 'Turkish Airlines', flightNumber: 'TK147', origin: 'JED', destination: 'IST', departureTime: '14:00', date: '2026-03-20' },
      totalPrice: 2400,
      currency: 'SAR',
      paymentStatus: 'PAID',
      paymentMethod: 'Tamara'
    },
    {
      id: 'BK004',
      pnr: 'PNRJKL012',
      status: 'CANCELLED',
      createdAt: '2026-02-19T16:20:00',
      passenger: { firstName: 'Fatima', lastName: 'Omar', email: 'fatima@example.com', phone: '+966503334444' },
      flight: { airline: 'Qatar Airways', flightNumber: 'QR456', origin: 'DMM', destination: 'DOH', departureTime: '18:30', date: '2026-03-12' },
      totalPrice: 950,
      currency: 'SAR',
      paymentStatus: 'REFUNDED',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'BK005',
      pnr: 'PNRMNO345',
      status: 'TICKETED',
      createdAt: '2026-02-23T11:00:00',
      passenger: { firstName: 'Omar', lastName: 'Youssef', email: 'omar@example.com', phone: '+966508889999' },
      flight: { airline: 'Saudia', flightNumber: 'SV789', origin: 'RUH', destination: 'CAI', departureTime: '06:00', date: '2026-03-25' },
      totalPrice: 1650,
      currency: 'SAR',
      paymentStatus: 'PAID',
      paymentMethod: 'Mada'
    }
  ];

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // For testing, use mock data
      // In production, replace with actual API call:
      // const response = await fetch(`${API_URL}/ndc/admin/bookings`);
      // const data = await response.json();
      
      setTimeout(() => {
        setBookings(mockBookings);
        calculateStats(mockBookings);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings(mockBookings);
      calculateStats(mockBookings);
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      confirmed: data.filter(b => b.status === 'CONFIRMED' || b.status === 'TICKETED').length,
      pending: data.filter(b => b.status === 'PENDING').length,
      cancelled: data.filter(b => b.status === 'CANCELLED').length,
      totalRevenue: data.filter(b => b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.totalPrice, 0)
    };
    setStats(stats);
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = searchTerm === '' || 
      booking.pnr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passenger.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passenger.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passenger.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    const colors = {
      'CONFIRMED': '#22c55e',
      'TICKETED': '#3b82f6',
      'PENDING': '#f59e0b',
      'CANCELLED': '#ef4444',
      'REFUNDED': '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'PAID': '#22c55e',
      'PENDING': '#f59e0b',
      'REFUNDED': '#8b5cf6',
      'FAILED': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewBooking = (bookingId) => {
    router.push(`/${lang}/admin/ndc-bookings/${bookingId}`);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    // Mock cancellation - replace with actual API call
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'CANCELLED', paymentStatus: 'REFUNDED' } : b
    ));
    calculateStats(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'CANCELLED', paymentStatus: 'REFUNDED' } : b
    ));
  };

  const handleIssueTicket = async (bookingId) => {
    // Mock ticket issuance - replace with actual API call
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'TICKETED' } : b
    ));
    calculateStats(bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'TICKETED' } : b
    ));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#e2e8f0',
      padding: '24px',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        
        .booking-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .booking-table th {
          background: linear-gradient(135deg, #1e293b, #334155);
          color: white;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .booking-table th:first-child { border-radius: 12px 0 0 0; }
        .booking-table th:last-child { border-radius: 0 12px 0 0; }
        
        .booking-table td {
          padding: 16px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.9rem;
        }
        .booking-table tr:hover td {
          background: #f8fafc;
        }
        .booking-table tr:last-child td:first-child { border-radius: 0 0 0 12px; }
        .booking-table tr:last-child td:last-child { border-radius: 0 0 12px 0; }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        
        .action-btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .action-btn:hover {
          transform: translateY(-1px);
        }
        
        .filter-btn {
          padding: 10px 20px;
          border-radius: 10px;
          border: 2px solid #e2e8f0;
          background: white;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .filter-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }
        .filter-btn.active {
          background:  #3b82f6;
          color: white;
          border-color: transparent;
        }
        
        .search-input {
          padding: 12px 16px 12px 44px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          font-size: 0.95rem;
          width: 300px;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            ✈️ NDC Flight Bookings
          </h1>
          <Link 
            href={`/${lang}/ndc-flights`}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: 'white',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            + New Booking
          </Link>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          Manage and monitor all NDC flight bookings
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📋</div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>{stats.total}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>Total Bookings</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #22c55e, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>✓</div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#22c55e' }}>{stats.confirmed}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>Confirmed</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>⏳</div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>Pending</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>💰</div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#8b5cf6' }}>{stats.totalRevenue.toLocaleString()}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>Revenue (SAR)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '20px 24px', 
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['all', 'CONFIRMED', 'TICKETED', 'PENDING', 'CANCELLED'].map(status => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? 'All Bookings' : status}
            </button>
          ))}
        </div>
        
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search PNR, passenger name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        {loading ? (
          <div style={{ padding: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="loading-spinner" />
            <div style={{ color: '#64748b', fontSize: '0.95rem' }}>Loading bookings...</div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
            <div style={{ color: '#64748b', fontSize: '1rem' }}>No bookings found</div>
          </div>
        ) : (
          <table className="booking-table">
            <thead>
              <tr>
                <th>PNR / Booking</th>
                <th>Passenger</th>
                <th>Flight</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                      {booking.pnr}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>
                      {formatDate(booking.createdAt)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                      {booking.passenger.firstName} {booking.passenger.lastName}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                      {booking.passenger.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>
                        {booking.flight.origin} → {booking.flight.destination}
                      </div>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
                      {booking.flight.airline} {booking.flight.flightNumber} • {booking.flight.date}
                    </div>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ 
                        background: `${getStatusColor(booking.status)}18`,
                        color: getStatusColor(booking.status),
                        border: `1px solid ${getStatusColor(booking.status)}40`
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: getStatusColor(booking.status) }} />
                      {booking.status}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ 
                        background: `${getPaymentStatusColor(booking.paymentStatus)}18`,
                        color: getPaymentStatusColor(booking.paymentStatus),
                        border: `1px solid ${getPaymentStatusColor(booking.paymentStatus)}40`
                      }}
                    >
                      {booking.paymentStatus}
                    </span>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px' }}>
                      {booking.paymentMethod}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>
                      {booking.totalPrice.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{booking.currency}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="action-btn"
                        onClick={() => handleViewBooking(booking.id)}
                        style={{ background: '#e0f2fe', color: '#0284c7' }}
                      >
                        View
                      </button>
                      {booking.status === 'CONFIRMED' && (
                        <button
                          className="action-btn"
                          onClick={() => handleIssueTicket(booking.id)}
                          style={{ background: '#dcfce7', color: '#16a34a' }}
                        >
                          Issue Ticket
                        </button>
                      )}
                      {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                        <button
                          className="action-btn"
                          onClick={() => handleCancelBooking(booking.id)}
                          style={{ background: '#fee2e2', color: '#dc2626' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* NDC Flow Documentation */}
      <div style={{ 
        marginTop: '32px',
        background: ' #334155)',
        borderRadius: '16px',
        padding: '28px',
        color: 'white'
      }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: 700 }}>📚 NDC Booking Flow (Testing Mode)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {[
            { step: 1, title: 'Search Flights', desc: 'AirShopping', status: '✅' },
            { step: 2, title: 'Select Offer', desc: 'OfferPrice', status: '✅' },
            { step: 3, title: 'Confirm Fare', desc: 'OrderCreate', status: '✅' },
            { step: 4, title: 'Add Passengers', desc: 'PassengerDetails', status: '✅' },
            { step: 5, title: 'Select Bundle', desc: 'ServiceList', status: '✅' },
            { step: 6, title: 'Payment', desc: 'OrderCreate', status: '✅' },
            { step: 7, title: 'Issue Ticket', desc: 'OrderRetrieve', status: '✅' }
          ].map(item => (
            <div key={item.step} style={{ 
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ 
                  background: 'rgba(59,130,246,0.3)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>Step {item.step}</span>
                <span>{item.status}</span>
              </div>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
