'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaPlane, FaUsers, FaCalendarAlt, FaDollarSign, FaMapMarkerAlt,
  FaClock, FaCheckCircle, FaHourglassEnd, FaTimesCircle, FaTicketAlt,
  FaSearch, FaFilter, FaDownload, FaSync, FaChevronDown, FaEye,
  FaEdit, FaTrash, FaPhone, FaEnvelope, FaBarChart
} from 'react-icons/fa';

export default function AdminFlightsPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params?.lang || 'en';
  const isRTL = lang === 'ar';

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmed: 0,
    pending: 0,
    ticketed: 0,
    cancelled: 0,
    totalRevenue: 0,
    averagePrice: 0
  });

  const [filters, setFilters] = useState({
    status: 'all',
    airline: 'all',
    origin: 'all',
    searchTerm: '',
    dateFrom: '',
    dateTo: ''
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  // Mock flight bookings
  const mockBookings = [
    {
      id: 'FLT001',
      pnr: 'SV553001',
      airlinePnr: 'SV553001',
      status: 'TICKETED',
      ticketNumber: 'SV0012345678',
      createdAt: '2026-02-20T10:30:00',
      passenger: {
        firstName: 'Ahmed',
        lastName: 'Ali',
        email: 'ahmed@example.com',
        phone: '+966501234567',
        passport: 'A12345678',
        nationality: 'SA'
      },
      flight: {
        airline: 'Saudia Airlines',
        airlineCode: 'SV',
        flightNumber: 'SV 553',
        origin: 'JED',
        destination: 'DXB',
        departureTime: '12:00',
        arrivalTime: '15:30',
        date: '2026-03-15',
        duration: '3h 30m',
        aircraft: 'Boeing 787'
      },
      booking: {
        totalPrice: 1250,
        currency: 'SAR',
        passengers: 1,
        cabinClass: 'Economy'
      },
      payment: {
        status: 'PAID',
        method: 'Moyasar - Credit Card',
        transactionId: 'TXN_123456',
        paidAt: '2026-02-20T10:35:00'
      }
    },
    {
      id: 'FLT002',
      pnr: 'EK101002',
      airlinePnr: 'EK101002',
      status: 'CONFIRMED',
      createdAt: '2026-02-21T14:15:00',
      passenger: {
        firstName: 'Sara',
        lastName: 'Mohammed',
        email: 'sara@example.com',
        phone: '+966509876543',
        passport: 'B87654321',
        nationality: 'SA'
      },
      flight: {
        airline: 'Emirates',
        airlineCode: 'EK',
        flightNumber: 'EK 101',
        origin: 'RUH',
        destination: 'DXB',
        departureTime: '08:30',
        arrivalTime: '11:00',
        date: '2026-03-18',
        duration: '2h 30m',
        aircraft: 'Airbus A380'
      },
      booking: {
        totalPrice: 1800,
        currency: 'SAR',
        passengers: 2,
        cabinClass: 'Economy'
      },
      payment: {
        status: 'PENDING',
        method: 'Tamara',
        transactionId: 'TXN_789012',
        paidAt: null
      }
    },
    {
      id: 'FLT003',
      pnr: 'TK147003',
      airlinePnr: 'TK147003',
      status: 'TICKETED',
      ticketNumber: 'TK0087654321',
      createdAt: '2026-02-22T09:45:00',
      passenger: {
        firstName: 'Khalid',
        lastName: 'Hassan',
        email: 'khalid@example.com',
        phone: '+966507654321',
        passport: 'C11223344',
        nationality: 'SA'
      },
      flight: {
        airline: 'Turkish Airlines',
        airlineCode: 'TK',
        flightNumber: 'TK 147',
        origin: 'JED',
        destination: 'IST',
        departureTime: '14:00',
        arrivalTime: '18:30',
        date: '2026-03-20',
        duration: '4h 30m',
        aircraft: 'Boeing 777'
      },
      booking: {
        totalPrice: 2400,
        currency: 'SAR',
        passengers: 1,
        cabinClass: 'Business'
      },
      payment: {
        status: 'PAID',
        method: 'Moyasar - Debit Card',
        transactionId: 'TXN_345678',
        paidAt: '2026-02-22T10:00:00'
      }
    },
    {
      id: 'FLT004',
      pnr: 'QR456004',
      airlinePnr: 'QR456004',
      status: 'CANCELLED',
      createdAt: '2026-02-19T16:20:00',
      passenger: {
        firstName: 'Fatima',
        lastName: 'Omar',
        email: 'fatima@example.com',
        phone: '+966503334444',
        passport: 'D55667788',
        nationality: 'SA'
      },
      flight: {
        airline: 'Qatar Airways',
        airlineCode: 'QR',
        flightNumber: 'QR 456',
        origin: 'DMM',
        destination: 'DOH',
        departureTime: '18:30',
        arrivalTime: '19:45',
        date: '2026-03-12',
        duration: '1h 15m',
        aircraft: 'Airbus A350'
      },
      booking: {
        totalPrice: 950,
        currency: 'SAR',
        passengers: 1,
        cabinClass: 'Economy'
      },
      payment: {
        status: 'REFUNDED',
        method: 'Moyasar - Credit Card',
        transactionId: 'TXN_901234',
        paidAt: '2026-02-19T16:25:00'
      }
    },
    {
      id: 'FLT005',
      pnr: 'SV789005',
      airlinePnr: 'SV789005',
      status: 'TICKETED',
      ticketNumber: 'SV0054321098',
      createdAt: '2026-02-23T11:00:00',
      passenger: {
        firstName: 'Omar',
        lastName: 'Youssef',
        email: 'omar@example.com',
        phone: '+966508889999',
        passport: 'E99887766',
        nationality: 'SA'
      },
      flight: {
        airline: 'Saudia Airlines',
        airlineCode: 'SV',
        flightNumber: 'SV 789',
        origin: 'RUH',
        destination: 'CAI',
        departureTime: '06:00',
        arrivalTime: '07:30',
        date: '2026-03-25',
        duration: '1h 30m',
        aircraft: 'Airbus A320'
      },
      booking: {
        totalPrice: 1650,
        currency: 'SAR',
        passengers: 3,
        cabinClass: 'Economy'
      },
      payment: {
        status: 'PAID',
        method: 'Moyasar - Mada Card',
        transactionId: 'TXN_567890',
        paidAt: '2026-02-23T11:10:00'
      }
    }
  ];

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, filters]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // Use mock data for now
      setBookings(mockBookings);
      calculateStats(mockBookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const confirmed = data.filter(b => b.status === 'CONFIRMED').length;
    const pending = data.filter(b => b.payment.status === 'PENDING').length;
    const ticketed = data.filter(b => b.status === 'TICKETED').length;
    const cancelled = data.filter(b => b.status === 'CANCELLED').length;
    const totalRevenue = data.reduce((sum, b) => sum + b.booking.totalPrice, 0);
    const averagePrice = total > 0 ? Math.round(totalRevenue / total) : 0;

    setStats({
      totalBookings: total,
      confirmed,
      pending,
      ticketed,
      cancelled,
      totalRevenue,
      averagePrice
    });
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (filters.status !== 'all') {
      filtered = filtered.filter(b => b.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.airline !== 'all') {
      filtered = filtered.filter(b => b.flight.airline.toLowerCase().includes(filters.airline.toLowerCase()));
    }

    if (filters.origin !== 'all') {
      filtered = filtered.filter(b => b.flight.origin === filters.origin);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.pnr.toLowerCase().includes(term) ||
        b.passenger.firstName.toLowerCase().includes(term) ||
        b.passenger.lastName.toLowerCase().includes(term) ||
        b.passenger.email.toLowerCase().includes(term) ||
        b.flight.flightNumber.toLowerCase().includes(term)
      );
    }

    setFilteredBookings(filtered);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      TICKETED: { bg: '#d1fae5', color: '#065f46', icon: FaCheckCircle },
      CONFIRMED: { bg: '#dbeafe', color: '#0c3b72', icon: FaCheckCircle },
      PENDING: { bg: '#fef3c7', color: '#92400e', icon: FaHourglassEnd },
      CANCELLED: { bg: '#fee2e2', color: '#991b1b', icon: FaTimesCircle },
      HELD: { bg: '#f3e8ff', color: '#6b21a8', icon: FaClock }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: config.bg,
        color: config.color,
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase'
      }}>
        <config.icon size={12} />
        {status}
      </span>
    );
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
        <p style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', margin: '4px 0 0' }}>{value}</p>
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
              Flight Bookings System
            </h1>
            <p style={{ color: '#6b7280', margin: '8px 0 0', fontSize: '14px' }}>
              Complete NDC flights management dashboard
            </p>
          </div>
          <button
            onClick={loadBookings}
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
            <FaRefresh /> Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <StatCard icon={FaTicketAlt} label="Total Bookings" value={stats.totalBookings} color="#3b82f6" />
          <StatCard icon={FaCheckCircle} label="Ticketed" value={stats.ticketed} color="#10b981" />
          <StatCard icon={FaHourglassEnd} label="Pending Payment" value={stats.pending} color="#f59e0b" />
          <StatCard icon={FaDollarSign} label="Total Revenue" value={`${stats.totalRevenue} SAR`} color="#8b5cf6" />
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
            <FaFilter /> Filters
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            <input
              type="text"
              placeholder="Search by PNR, name, email, flight..."
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
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
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
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#374151' }}>PNR / Ticket</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#374151' }}>Passenger</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#374151' }}>Flight</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#374151' }}>Date</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#374151' }}>Amount</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#374151' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#374151' }}>Payment</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: '#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>Loading...</td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>No bookings found</td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} style={{ borderBottom: '1px solid #e5e7eb', hover: { background: '#f9fafb' } }}>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
                        <div>{booking.pnr}</div>
                        {booking.ticketNumber && (
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                            Ticket: {booking.ticketNumber}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937' }}>
                        <div style={{ fontWeight: 600 }}>
                          {booking.passenger.firstName} {booking.passenger.lastName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                          {booking.passenger.email}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {booking.passenger.phone}
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937', fontWeight: 600 }}>
                        <div>{booking.flight.airline}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                          {booking.flight.flightNumber} • {booking.flight.origin} → {booking.flight.destination}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {booking.flight.departureTime}
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937' }}>
                        {booking.flight.date}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>
                        {booking.booking.totalPrice} {booking.booking.currency}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {getStatusBadge(booking.status)}
                      </td>
                      <td style={{ padding: '16px', fontSize: '12px' }}>
                        <div style={{ fontWeight: 600, color: booking.payment.status === 'PAID' ? '#10b981' : '#f59e0b' }}>
                          {booking.payment.status}
                        </div>
                        <div style={{ color: '#6b7280', marginTop: '4px', fontSize: '11px' }}>
                          {booking.payment.method}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowModal(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FaEye size={11} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for booking details */}
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
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* PNR and Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, margin: 0, marginBottom: '4px' }}>PNR</p>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: 0 }}>{selectedBooking.pnr}</p>
                </div>
                <div>
                  {getStatusBadge(selectedBooking.status)}
                </div>
              </div>

              {/* Passenger Info */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Passenger Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, margin: 0, marginBottom: '4px' }}>Name</p>
                    <p style={{ fontSize: '14px', color: '#1f2937', margin: 0 }}>
                      {selectedBooking.passenger.firstName} {selectedBooking.passenger.lastName}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, margin: 0, marginBottom: '4px' }}>Passport</p>
                    <p style={{ fontSize: '14px', color: '#1f2937', margin: 0 }}>{selectedBooking.passenger.passport}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, margin: 0, marginBottom: '4px' }}>Email</p>
                    <p style={{ fontSize: '14px', color: '#1f2937', margin: 0 }}>{selectedBooking.passenger.email}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, margin: 0, marginBottom: '4px' }}>Phone</p>
                    <p style={{ fontSize: '14px', color: '#1f2937', margin: 0 }}>{selectedBooking.passenger.phone}</p>
                  </div>
                </div>
              </div>

              {/* Flight Info */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Flight Information</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Airline:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>{selectedBooking.flight.airline} ({selectedBooking.flight.flightNumber})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Route:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>
                      {selectedBooking.flight.origin} → {selectedBooking.flight.destination}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Date & Time:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>
                      {selectedBooking.flight.date} {selectedBooking.flight.departureTime}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Duration:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>{selectedBooking.flight.duration}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Aircraft:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>{selectedBooking.flight.aircraft}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Payment Information</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Total Price:</span>
                    <span style={{ color: '#1f2937', fontWeight: 700, fontSize: '16px' }}>
                      {selectedBooking.booking.totalPrice} {selectedBooking.booking.currency}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Payment Status:</span>
                    <span style={{ 
                      color: selectedBooking.payment.status === 'PAID' ? '#10b981' : '#f59e0b',
                      fontWeight: 600
                    }}>
                      {selectedBooking.payment.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Payment Method:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>{selectedBooking.payment.method}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Transaction ID:</span>
                    <span style={{ color: '#1f2937', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>
                      {selectedBooking.payment.transactionId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
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
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '16px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
