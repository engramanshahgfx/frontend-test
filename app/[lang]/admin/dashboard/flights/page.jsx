'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FaPlane, FaUsers, FaCalendarAlt, FaDollarSign, FaMapMarkerAlt,
  FaClock, FaTicketAlt, FaDownload, FaSearch, FaFilter, FaPhone, FaEnvelope,
  FaPrint, FaEye, FaSync, FaMapPin, FaSuitcase, FaStar, FaLock,
  FaBarcode, FaChair, FaUser, FaCreditCard, FaCheckCircle, FaHourglassEnd,
  FaTimesCircle, FaMoneyBillWave, FaFileInvoice, FaExchangeAlt
} from 'react-icons/fa';

export default function AdminFlightsPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params?.lang || 'en';

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    ticketedBookings: 0,
    cancelledBookings: 0
  });

  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    searchTerm: '',
    dateFrom: '',
    dateTo: ''
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  // Mock NDC flight bookings
  const mockBookings = [
    {
      id: 'NDC001',
      pnr: 'SV553001',
      ticketNumber: 'SV0012345678',
      bookingDate: '2026-02-20',
      status: 'TICKETED',
      passenger: {
        name: 'Ahmed Ali',
        email: 'ahmed@example.com',
        phone: '+966501234567'
      },
      flight: {
        airline: 'Saudia Airlines',
        flightNumber: 'SV 553',
        route: 'JED → DXB',
        date: '2026-03-15',
        time: '12:00 - 15:30'
      },
      booking: {
        passengers: 1,
        cabinClass: 'Economy',
        totalPrice: 1250,
        currency: 'SAR'
      },
      payment: {
        status: 'PAID',
        method: 'Moyasar - Credit Card',
        amount: 1250,
        paidDate: '2026-02-20',
        transactionId: 'TXN_123456'
      },
      ndc: {
        orderCode: 'SV001',
        validatingCarrier: 'SV',
        bookingToken: 'NDC-SV-2026-001A'
      }
    },
    {
      id: 'NDC002',
      pnr: 'EK101002',
      ticketNumber: '',
      bookingDate: '2026-02-21',
      status: 'CONFIRMED',
      passenger: {
        name: 'Sara Mohammed',
        email: 'sara@example.com',
        phone: '+966509876543'
      },
      flight: {
        airline: 'Emirates',
        flightNumber: 'EK 101',
        route: 'RUH → DXB',
        date: '2026-03-18',
        time: '08:30 - 11:00'
      },
      booking: {
        passengers: 2,
        cabinClass: 'Business',
        totalPrice: 2850,
        currency: 'SAR'
      },
      payment: {
        status: 'PENDING',
        method: 'Tamara - Installment',
        amount: 2850,
        paidDate: null,
        transactionId: null
      },
      ndc: {
        orderCode: 'EK002',
        validatingCarrier: 'EK',
        bookingToken: 'NDC-EK-2026-002B'
      }
    },
    {
      id: 'NDC003',
      pnr: 'TK147003',
      ticketNumber: 'TK0087654321',
      bookingDate: '2026-02-22',
      status: 'TICKETED',
      passenger: {
        name: 'Khalid Hassan',
        email: 'khalid@example.com',
        phone: '+966507654321'
      },
      flight: {
        airline: 'Turkish Airlines',
        flightNumber: 'TK 147',
        route: 'JED → IST',
        date: '2026-03-20',
        time: '14:00 - 18:30'
      },
      booking: {
        passengers: 1,
        cabinClass: 'Business',
        totalPrice: 2400,
        currency: 'SAR'
      },
      payment: {
        status: 'PAID',
        method: 'Moyasar - Debit Card',
        amount: 2400,
        paidDate: '2026-02-22',
        transactionId: 'TXN_345678'
      },
      ndc: {
        orderCode: 'TK003',
        validatingCarrier: 'TK',
        bookingToken: 'NDC-TK-2026-003C'
      }
    },
    {
      id: 'NDC004',
      pnr: 'QR456004',
      ticketNumber: '',
      bookingDate: '2026-02-23',
      status: 'CANCELLED',
      passenger: {
        name: 'Fatima Omar',
        email: 'fatima@example.com',
        phone: '+966503334444'
      },
      flight: {
        airline: 'Qatar Airways',
        flightNumber: 'QR 456',
        route: 'DMM → DOH',
        date: '2026-03-25',
        time: '18:30 - 19:45'
      },
      booking: {
        passengers: 1,
        cabinClass: 'Economy',
        totalPrice: 950,
        currency: 'SAR'
      },
      payment: {
        status: 'REFUNDED',
        method: 'Moyasar - Credit Card',
        amount: 950,
        paidDate: '2026-02-23',
        transactionId: 'TXN_567890'
      },
      ndc: {
        orderCode: 'QR004',
        validatingCarrier: 'QR',
        bookingToken: 'NDC-QR-2026-004D'
      }
    },
    {
      id: 'NDC005',
      pnr: 'SV789005',
      ticketNumber: 'SV0054321098',
      bookingDate: '2026-02-23',
      status: 'TICKETED',
      passenger: {
        name: 'Omar Youssef',
        email: 'omar@example.com',
        phone: '+966508889999'
      },
      flight: {
        airline: 'Saudia Airlines',
        flightNumber: 'SV 789',
        route: 'RUH → CAI',
        date: '2026-03-25',
        time: '06:00 - 07:30'
      },
      booking: {
        passengers: 3,
        cabinClass: 'Economy',
        totalPrice: 1650,
        currency: 'SAR'
      },
      payment: {
        status: 'PAID',
        method: 'Moyasar - Mada Card',
        amount: 1650,
        paidDate: '2026-02-23',
        transactionId: 'TXN_789012'
      },
      ndc: {
        orderCode: 'SV005',
        validatingCarrier: 'SV',
        bookingToken: 'NDC-SV-2026-005E'
      }
    }
  ];

  useEffect(() => {
    loadFlightBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, filters]);

  const loadFlightBookings = () => {
    setLoading(true);
    try {
      setBookings(mockBookings);
      calculateStats(mockBookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      totalBookings: data.length,
      confirmedBookings: data.filter(b => b.status === 'CONFIRMED' || b.status === 'TICKETED').length,
      pendingPayments: data.filter(b => b.payment.status === 'PENDING').length,
      totalRevenue: data.reduce((sum, b) => sum + (b.payment.status === 'PAID' || b.payment.status === 'REFUNDED' ? b.payment.amount : 0), 0),
      ticketedBookings: data.filter(b => b.status === 'TICKETED').length,
      cancelledBookings: data.filter(b => b.status === 'CANCELLED').length
    });
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (filters.status !== 'all') {
      filtered = filtered.filter(b => b.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.paymentStatus !== 'all') {
      filtered = filtered.filter(b => b.payment.status.toLowerCase() === filters.paymentStatus.toLowerCase());
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.pnr.toLowerCase().includes(term) ||
        b.passenger.name.toLowerCase().includes(term) ||
        b.flight.flightNumber.toLowerCase().includes(term)
      );
    }

    setFilteredBookings(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      TICKETED: { bg: '#d1fae5', color: '#065f46', icon: FaCheckCircle },
      CONFIRMED: { bg: '#dbeafe', color: '#0c3b72', icon: FaCheckCircle },
      PENDING: { bg: '#fef3c7', color: '#92400e', icon: FaHourglassEnd },
      CANCELLED: { bg: '#fee2e2', color: '#991b1b', icon: FaTimesCircle },
      HELD: { bg: '#f3e8ff', color: '#6b21a8', icon: FaClock }
    };
    return colors[status] || colors.PENDING;
  };

  const getPaymentColor = (status) => {
    const colors = {
      PAID: { bg: '#d1fae5', color: '#065f46', text: '✓ PAID' },
      PENDING: { bg: '#fef3c7', color: '#92400e', text: '⏳ PENDING' },
      REFUNDED: { bg: '#e0e7ff', color: '#3730a3', text: '↩ REFUNDED' }
    };
    return colors[status] || colors.PENDING;
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        background: color + '15',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        fontSize: '24px'
      }}>
        <Icon />
      </div>
      <div>
        <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, margin: 0 }}>{label}</p>
        <p style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', margin: '4px 0 0' }}>
          {typeof value === 'string' && value.includes('SAR') ? value : value}
        </p>
      </div>
    </div>
  );

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      background: '#f9fafb',
      minHeight: '100vh',
      padding: '24px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        table { width: 100%; border-collapse: collapse; }
        tbody tr:hover { background: #f9fafb; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#1f2937',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FaPlane style={{ color: '#3b82f6' }} />
              NDC Flight Booking & Payments
            </h1>
            <p style={{ color: '#6b7280', margin: '8px 0 0', fontSize: '14px' }}>
              Manage all NDC flight bookings with integrated payment system
            </p>
          </div>
          <button
            onClick={loadFlightBookings}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaSync /> Refresh Data
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <StatCard icon={FaPlane} label="Total Bookings" value={stats.totalBookings} color="#3b82f6" />
          <StatCard icon={FaCheckCircle} label="Confirmed & Ticketed" value={stats.confirmedBookings} color="#10b981" />
          <StatCard icon={FaMoneyBillWave} label="Total Revenue" value={`${stats.totalRevenue} SAR`} color="#8b5cf6" />
          <StatCard icon={FaHourglassEnd} label="Pending Payments" value={stats.pendingPayments} color="#f59e0b" />
        </div>

        {/* Filters */}
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaFilter /> Search & Filter
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            <input
              type="text"
              placeholder="Search by PNR, name, or flight..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              style={{
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            >
              <option value="all">All Status</option>
              <option value="ticketed">Ticketed</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
              style={{
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            >
              <option value="all">All Payment Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151' }}>PNR / Ticket</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Passenger</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Flight Info</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Amount</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Payment</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>Loading...</td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No bookings found</td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const statusConfig = getStatusColor(booking.status);
                    const paymentConfig = getPaymentColor(booking.payment.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr key={booking.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>
                          <div>{booking.pnr}</div>
                          {booking.ticketNumber && (
                            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
                              ✓ {booking.ticketNumber}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#1f2937' }}>
                          <div style={{ fontWeight: 600 }}>{booking.passenger.name}</div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                            {booking.passenger.email}
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', color: '#1f2937' }}>
                          <div style={{ fontWeight: 600 }}>{booking.flight.flightNumber}</div>
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                            {booking.flight.route}
                          </div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {booking.flight.date}
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: '#3b82f6' }}>
                          {booking.payment.amount} SAR
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: statusConfig.bg,
                            color: statusConfig.color,
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}>
                            <StatusIcon size={12} />
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{
                            background: paymentConfig.bg,
                            color: paymentConfig.color,
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textAlign: 'center'
                          }}>
                            {paymentConfig.text}
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                            {booking.payment.method}
                          </div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowModal(true);
                              }}
                              title="View Details"
                              style={{
                                padding: '6px 10px',
                                background: '#3b82f6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              <FaEye size={12} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowPaymentModal(true);
                              }}
                              title="Payment Details"
                              style={{
                                padding: '6px 10px',
                                background: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              <FaMoneyBillWave size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Booking Details</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Passenger */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, marginBottom: '12px' }}>Passenger</h3>
                <p style={{ margin: 0, color: '#1f2937', fontWeight: 600 }}>{selectedBooking.passenger.name}</p>
                <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>
                  ✉ {selectedBooking.passenger.email}
                </p>
                <p style={{ margin: '2px 0 0', color: '#6b7280', fontSize: '13px' }}>
                  ☎ {selectedBooking.passenger.phone}
                </p>
              </div>

              {/* Flight */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, marginBottom: '12px' }}>Flight Information</h3>
                <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Flight:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>{selectedBooking.flight.flightNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Route:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>{selectedBooking.flight.route}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Date & Time:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>{selectedBooking.flight.date} {selectedBooking.flight.time}</span>
                  </div>
                </div>
              </div>

              {/* NDC */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, marginBottom: '12px' }}>NDC Information</h3>
                <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Order Code:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>{selectedBooking.ndc.orderCode}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Validating Carrier:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>{selectedBooking.ndc.validatingCarrier}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Booking Token:</span>
                    <span style={{ color: '#1f2937', fontFamily: 'monospace', fontSize: '11px' }}>{selectedBooking.ndc.bookingToken}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '24px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaMoneyBillWave style={{ color: '#10b981' }} /> Payment Details
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{
              background: getPaymentColor(selectedBooking.payment.status).bg,
              color: getPaymentColor(selectedBooking.payment.status).color,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <p style={{ fontWeight: 700, fontSize: '16px', margin: 0 }}>
                {getPaymentColor(selectedBooking.payment.status).text}
              </p>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, margin: 0, marginBottom: '4px' }}>AMOUNT</p>
                <p style={{ fontSize: '32px', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                  {selectedBooking.payment.amount} <span style={{ fontSize: '16px' }}>SAR</span>
                </p>
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, marginBottom: '12px' }}>Payment Method</h3>
                <p style={{ margin: 0, color: '#1f2937', fontWeight: 600 }}>{selectedBooking.payment.method}</p>
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, marginBottom: '12px' }}>Transaction Information</h3>
                <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Transaction ID:</span>
                    <span style={{ color: '#1f2937', fontFamily: 'monospace' }}>{selectedBooking.payment.transactionId || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Date:</span>
                    <span style={{ color: '#1f2937' }}>{selectedBooking.payment.paidDate || 'Pending'}</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, marginBottom: '12px' }}>Booking Summary</h3>
                <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>PNR:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>{selectedBooking.pnr}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Passengers:</span>
                    <span style={{ color: '#1f2937' }}>{selectedBooking.booking.passengers}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Class:</span>
                    <span style={{ color: '#1f2937' }}>{selectedBooking.booking.cabinClass}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '24px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
