'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FaCheckCircle, FaPlane, FaUsers, FaCalendarAlt, FaDollarSign, FaMapMarkerAlt,
  FaClock, FaTicketAlt, FaDownload, FaSearch, FaFilter, FaPhone, FaEnvelope,
  FaPrint, FaEye, FaSync, FaMapPin, FaSuitcase, FaStar, FaLock,
  FaBarcode, FaChair, FaUser, FaCreditCard
} from 'react-icons/fa';

export default function CompletedBookingsPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params?.lang || 'en';
  const isRTL = lang === 'ar';

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalRevenue: 0,
    totalPassengers: 0,
    averageBookingValue: 0
  });

  const [filters, setFilters] = useState({
    searchTerm: '',
    airline: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  // Mock completed bookings with full NDC data
  const mockCompletedBookings = [
    {
      id: 'CB001',
      pnr: 'SV553001',
      ticketNumber: 'SV0012345678',
      ndcBookingToken: 'NDC-SV-2026-001A',
      status: 'TICKETED',
      completedAt: '2026-02-20T11:30:00',
      bookingCreatedAt: '2026-02-20T10:30:00',
      passenger: {
        firstName: 'Ahmed',
        lastName: 'Ali',
        email: 'ahmed@example.com',
        phone: '+966501234567',
        passport: 'A12345678',
        nationality: 'SA',
        dateOfBirth: '1990-05-15'
      },
      flight: {
        airline: 'Saudia Airlines',
        airlineCode: 'SV',
        flightNumber: 'SV 553',
        origin: 'JED',
        originCity: 'Jeddah',
        destination: 'DXB',
        destinationCity: 'Dubai',
        departureTime: '12:00',
        arrivalTime: '15:30',
        date: '2026-03-15',
        duration: '3h 30m',
        aircraft: 'Boeing 787',
        gate: '12A',
        seat: '12A',
        seatClass: 'Economy',
        luggage: {
          checkedBags: 2,
          carry: 1,
          maxWeight: 50
        }
      },
      booking: {
        totalPrice: 1250,
        currency: 'SAR',
        passengers: 1,
        cabinClass: 'Economy',
        bookingReference: 'NDCSVV553001'
      },
      payment: {
        status: 'PAID',
        method: 'Moyasar - Credit Card',
        transactionId: 'TXN_123456',
        paidAt: '2026-02-20T10:35:00',
        amount: 1250,
        currency: 'SAR',
        cardLast4: '4242'
      },
      ndc: {
        orderId: 'NDC-ORD-2026-001',
        orderCode: 'SV001',
        validatingCarrier: 'SV',
        createdAt: '2026-02-20T10:30:00',
        expiresAt: '2026-03-15T12:00:00',
        ticketIssuedAt: '2026-02-20T11:30:00'
      },
      services: {
        seatSelection: true,
        baggage: true,
        mealPreference: 'Standard',
        specialRequests: ['Vegetarian Meal']
      }
    },
    {
      id: 'CB002',
      pnr: 'EK101002',
      ticketNumber: 'EK0087654321',
      ndcBookingToken: 'NDC-EK-2026-002B',
      status: 'TICKETED',
      completedAt: '2026-02-21T15:45:00',
      bookingCreatedAt: '2026-02-21T14:15:00',
      passenger: {
        firstName: 'Sara',
        lastName: 'Mohammed',
        email: 'sara@example.com',
        phone: '+966509876543',
        passport: 'B87654321',
        nationality: 'SA',
        dateOfBirth: '1992-08-22'
      },
      flight: {
        airline: 'Emirates',
        airlineCode: 'EK',
        flightNumber: 'EK 101',
        origin: 'RUH',
        originCity: 'Riyadh',
        destination: 'DXB',
        destinationCity: 'Dubai',
        departureTime: '08:30',
        arrivalTime: '11:00',
        date: '2026-03-18',
        duration: '2h 30m',
        aircraft: 'Airbus A380',
        gate: '5B',
        seat: '2A',
        seatClass: 'Business',
        luggage: {
          checkedBags: 2,
          carry: 2,
          maxWeight: 40
        }
      },
      booking: {
        totalPrice: 2850,
        currency: 'SAR',
        passengers: 2,
        cabinClass: 'Business',
        bookingReference: 'NDCEKEK101002'
      },
      payment: {
        status: 'PAID',
        method: 'Moyasar - Bank Transfer',
        transactionId: 'TXN_789012',
        paidAt: '2026-02-21T14:20:00',
        amount: 2850,
        currency: 'SAR',
        cardLast4: 'Transfer'
      },
      ndc: {
        orderId: 'NDC-ORD-2026-002',
        orderCode: 'EK002',
        validatingCarrier: 'EK',
        createdAt: '2026-02-21T14:15:00',
        expiresAt: '2026-03-18T08:30:00',
        ticketIssuedAt: '2026-02-21T15:45:00'
      },
      services: {
        seatSelection: true,
        baggage: true,
        mealPreference: 'Business',
        specialRequests: ['Wheelchair Assistance']
      }
    },
    {
      id: 'CB003',
      pnr: 'TK147003',
      ticketNumber: 'TK0054321098',
      ndcBookingToken: 'NDC-TK-2026-003C',
      status: 'TICKETED',
      completedAt: '2026-02-22T10:15:00',
      bookingCreatedAt: '2026-02-22T09:45:00',
      passenger: {
        firstName: 'Khalid',
        lastName: 'Hassan',
        email: 'khalid@example.com',
        phone: '+966507654321',
        passport: 'C11223344',
        nationality: 'SA',
        dateOfBirth: '1988-03-10'
      },
      flight: {
        airline: 'Turkish Airlines',
        airlineCode: 'TK',
        flightNumber: 'TK 147',
        origin: 'JED',
        originCity: 'Jeddah',
        destination: 'IST',
        destinationCity: 'Istanbul',
        departureTime: '14:00',
        arrivalTime: '18:30',
        date: '2026-03-20',
        duration: '4h 30m',
        aircraft: 'Boeing 777',
        gate: '8C',
        seat: '1A',
        seatClass: 'Business',
        luggage: {
          checkedBags: 2,
          carry: 2,
          maxWeight: 40
        }
      },
      booking: {
        totalPrice: 2400,
        currency: 'SAR',
        passengers: 1,
        cabinClass: 'Business',
        bookingReference: 'NDCTKTK147003'
      },
      payment: {
        status: 'PAID',
        method: 'Moyasar - Credit Card',
        transactionId: 'TXN_345678',
        paidAt: '2026-02-22T09:50:00',
        amount: 2400,
        currency: 'SAR',
        cardLast4: '5555'
      },
      ndc: {
        orderId: 'NDC-ORD-2026-003',
        orderCode: 'TK003',
        validatingCarrier: 'TK',
        createdAt: '2026-02-22T09:45:00',
        expiresAt: '2026-03-20T14:00:00',
        ticketIssuedAt: '2026-02-22T10:15:00'
      },
      services: {
        seatSelection: true,
        baggage: true,
        mealPreference: 'Business',
        specialRequests: []
      }
    },
    {
      id: 'CB004',
      pnr: 'QR456004',
      ticketNumber: 'QR0099887766',
      ndcBookingToken: 'NDC-QR-2026-004D',
      status: 'TICKETED',
      completedAt: '2026-02-23T12:30:00',
      bookingCreatedAt: '2026-02-23T11:00:00',
      passenger: {
        firstName: 'Fatima',
        lastName: 'Omar',
        email: 'fatima@example.com',
        phone: '+966503334444',
        passport: 'D55667788',
        nationality: 'SA',
        dateOfBirth: '1995-11-18'
      },
      flight: {
        airline: 'Qatar Airways',
        airlineCode: 'QR',
        flightNumber: 'QR 456',
        origin: 'DMM',
        originCity: 'Dammam',
        destination: 'DOH',
        destinationCity: 'Doha',
        departureTime: '18:30',
        arrivalTime: '19:45',
        date: '2026-03-25',
        duration: '1h 15m',
        aircraft: 'Airbus A350',
        gate: '3A',
        seat: '5F',
        seatClass: 'Economy',
        luggage: {
          checkedBags: 1,
          carry: 1,
          maxWeight: 50
        }
      },
      booking: {
        totalPrice: 950,
        currency: 'SAR',
        passengers: 1,
        cabinClass: 'Economy',
        bookingReference: 'NDCQRQR456004'
      },
      payment: {
        status: 'PAID',
        method: 'Moyasar - Card',
        transactionId: 'TXN_567890',
        paidAt: '2026-02-23T11:05:00',
        amount: 950,
        currency: 'SAR',
        cardLast4: '3333'
      },
      ndc: {
        orderId: 'NDC-ORD-2026-004',
        orderCode: 'QR004',
        validatingCarrier: 'QR',
        createdAt: '2026-02-23T11:00:00',
        expiresAt: '2026-03-25T18:30:00',
        ticketIssuedAt: '2026-02-23T12:30:00'
      },
      services: {
        seatSelection: true,
        baggage: false,
        mealPreference: 'Standard',
        specialRequests: []
      }
    }
  ];

  useEffect(() => {
    loadCompletedBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, filters]);

  const loadCompletedBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/ndc/admin/bookings?status=TICKETED`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const bookingsArray = Array.isArray(data) ? data : (data.data || data.bookings || []);
      
      // Map API response to component's expected data structure
      const mappedBookings = bookingsArray.map(booking => ({
        id: booking.id || booking.booking_id,
        pnr: booking.pnr || booking.booking_reference,
        ticketNumber: booking.ticket_number || '',
        ndcBookingToken: booking.ndc_booking_token || booking.booking_token || '',
        status: booking.status || 'TICKETED',
        completedAt: booking.completed_at || booking.ticketed_at || new Date().toISOString(),
        bookingCreatedAt: booking.created_at || booking.booking_created_at || new Date().toISOString(),
        passenger: {
          firstName: booking.passenger?.first_name || booking.first_name || 'N/A',
          lastName: booking.passenger?.last_name || booking.last_name || 'N/A',
          email: booking.passenger?.email || booking.email || '',
          phone: booking.passenger?.phone || booking.phone || '',
          passport: booking.passenger?.passport || booking.passport_number || '',
          nationality: booking.passenger?.nationality || booking.nationality || '',
          dateOfBirth: booking.passenger?.date_of_birth || booking.dob || ''
        },
        flight: {
          airline: booking.flight?.airline || booking.airline_name || 'N/A',
          airlineCode: booking.flight?.airline_code || booking.airline_code || '',
          flightNumber: booking.flight?.flight_number || booking.flight_no || '',
          origin: booking.flight?.origin || booking.origin_code || '',
          originCity: booking.flight?.origin_city || '',
          destination: booking.flight?.destination || booking.destination_code || '',
          destinationCity: booking.flight?.destination_city || '',
          departureTime: booking.flight?.departure_time || booking.departure_time || '',
          arrivalTime: booking.flight?.arrival_time || booking.arrival_time || '',
          date: booking.flight?.date || booking.flight_date || '',
          duration: booking.flight?.duration || '',
          aircraft: booking.flight?.aircraft || booking.aircraft_type || '',
          gate: booking.flight?.gate || 'TBA',
          seat: booking.seat || booking.flight?.seat || '',
          seatClass: booking.cabin_class || booking.flight?.cabin_class || 'Economy',
          luggage: {
            checkedBags: booking.luggage?.checked_bags || booking.checked_bags || 1,
            carry: booking.luggage?.carry || 1,
            maxWeight: booking.luggage?.max_weight || 50
          }
        },
        booking: {
          totalPrice: booking.total_price || booking.amount || 0,
          currency: booking.currency || 'SAR',
          passengers: booking.passengers_count || booking.passenger_count || 1,
          cabinClass: booking.cabin_class || 'Economy',
          bookingReference: booking.booking_reference || booking.pnr || ''
        },
        payment: {
          status: booking.payment?.status || booking.payment_status || 'PAID',
          method: booking.payment?.method || booking.payment_method || 'Credit Card',
          transactionId: booking.payment?.transaction_id || booking.transaction_id || '',
          paidAt: booking.payment?.paid_at || booking.paid_at || new Date().toISOString(),
          amount: booking.payment?.amount || booking.total_price || 0,
          currency: booking.payment?.currency || booking.currency || 'SAR',
          cardLast4: booking.payment?.card_last4 || booking.card_last4 || 'N/A'
        },
        ndc: {
          orderId: booking.ndc?.order_id || booking.order_id || '',
          orderCode: booking.ndc?.order_code || booking.order_code || '',
          validatingCarrier: booking.ndc?.validating_carrier || booking.airline_code || '',
          createdAt: booking.ndc?.created_at || booking.created_at || new Date().toISOString(),
          expiresAt: booking.ndc?.expires_at || booking.expires_at || '',
          ticketIssuedAt: booking.ndc?.ticket_issued_at || booking.ticketed_at || new Date().toISOString()
        },
        services: {
          seatSelection: booking.services?.seat_selection ?? true,
          baggage: booking.services?.baggage ?? true,
          mealPreference: booking.services?.meal_preference || booking.meal_preference || 'Standard',
          specialRequests: booking.services?.special_requests || booking.special_requests || []
        }
      }));

      setBookings(mappedBookings);
      calculateStats(mappedBookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      // Fallback to mock data if API fails
      setBookings(mockCompletedBookings);
      calculateStats(mockCompletedBookings);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalCompleted = data.length;
    const totalRevenue = data.reduce((sum, b) => sum + b.booking.totalPrice, 0);
    const totalPassengers = data.reduce((sum, b) => sum + b.booking.passengers, 0);
    const averageBookingValue = totalCompleted > 0 ? Math.round(totalRevenue / totalCompleted) : 0;

    setStats({
      totalCompleted,
      totalRevenue,
      totalPassengers,
      averageBookingValue
    });
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (filters.airline !== 'all') {
      filtered = filtered.filter(b => b.flight.airlineCode === filters.airline);
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.pnr.toLowerCase().includes(term) ||
        b.passenger.firstName.toLowerCase().includes(term) ||
        b.passenger.lastName.toLowerCase().includes(term) ||
        b.flight.flightNumber.toLowerCase().includes(term)
      );
    }

    setFilteredBookings(filtered);
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
              <FaCheckCircle style={{ color: '#10b981' }} />
              Completed NDC Flight Bookings
            </h1>
            <p style={{ color: '#6b7280', margin: '8px 0 0', fontSize: '14px' }}>
              Confirmed and ticketed bookings with full NDC data
            </p>
          </div>
          <button
            onClick={loadCompletedBookings}
            style={{
              padding: '10px 20px',
              background: '#10b981',
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
            <FaSync /> Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <StatCard icon={FaCheckCircle} label="Completed Bookings" value={stats.totalCompleted} color="#10b981" />
          <StatCard icon={FaDollarSign} label="Total Revenue" value={`${stats.totalRevenue} SAR`} color="#3b82f6" />
          <StatCard icon={FaUsers} label="Total Passengers" value={stats.totalPassengers} color="#8b5cf6" />
          <StatCard icon={FaTicketAlt} label="Avg Booking Value" value={`${stats.averageBookingValue} SAR`} color="#f59e0b" />
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
            <FaFilter /> Quick Search
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            <input
              type="text"
              placeholder="Search PNR, passenger name, ticket..."
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
              value={filters.airline}
              onChange={(e) => setFilters({ ...filters, airline: e.target.value })}
              style={{
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            >
              <option value="all">All Airlines</option>
              <option value="SV">Saudia Airlines</option>
              <option value="EK">Emirates</option>
              <option value="TK">Turkish Airlines</option>
              <option value="QR">Qatar Airways</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        <div style={{ display: 'grid', gap: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading...</div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No completed bookings found</div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking.id} style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                {/* Header */}
                <div style={{
                  padding: '20px',
                  borderBottom: '1px solid #e5e7eb',
                  background: '#f9fafb'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '24px',
                    alignItems: 'center'
                  }}>
                    {/* Left: PNR & Status */}
                    <div>
                      <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, margin: 0 }}>PNR / TICKET</p>
                      <p style={{ fontSize: '20px', fontWeight: 800, color: '#1f2937', margin: '4px 0' }}>
                        {booking.pnr}
                      </p>
                      <p style={{ fontSize: '12px', color: '#10b981', margin: 0, fontWeight: 600 }}>
                        ✓ {booking.ticketNumber}
                      </p>
                    </div>

                    {/* Center: Flight & Date */}
                    <div>
                      <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, margin: 0 }}>FLIGHT</p>
                      <p style={{ fontSize: '18px', fontWeight: 700, color: '#1f2937', margin: '4px 0' }}>
                        {booking.flight.flightNumber}
                      </p>
                      <p style={{ fontSize: '12px', color: '#1f2937', margin: 0 }}>
                        {booking.flight.origin} → {booking.flight.destination} • {booking.flight.date}
                      </p>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, margin: 0 }}>TOTAL AMOUNT</p>
                      <p style={{ fontSize: '24px', fontWeight: 800, color: '#3b82f6', margin: '4px 0' }}>
                        {booking.booking.totalPrice}
                      </p>
                      <p style={{ fontSize: '12px', color: '#10b981', margin: 0, fontWeight: 600 }}>
                        ✓ PAID - {booking.payment.method}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '24px',
                    marginBottom: '20px'
                  }}>
                    {/* Passenger Info */}
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', margin: 0, marginBottom: '12px', textTransform: 'uppercase' }}>
                        <FaUsers size={12} style={{ marginRight: '6px' }} />Passenger
                      </h4>
                      <div style={{ display: 'grid', gap: '6px', fontSize: '13px' }}>
                        <div style={{ color: '#1f2937', fontWeight: 600 }}>
                          {booking.passenger.firstName} {booking.passenger.lastName}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                          <FaUser size={11} style={{ marginRight: '4px' }} />
                          {booking.passenger.passport}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                          <FaPhone size={11} style={{ marginRight: '4px' }} />
                          {booking.passenger.phone}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                          <FaEnvelope size={11} style={{ marginRight: '4px' }} />
                          {booking.passenger.email}
                        </div>
                      </div>
                    </div>

                    {/* Flight Details */}
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', margin: 0, marginBottom: '12px', textTransform: 'uppercase' }}>
                        <FaPlane size={12} style={{ marginRight: '6px' }} />Flight Details
                      </h4>
                      <div style={{ display: 'grid', gap: '6px', fontSize: '13px' }}>
                        <div style={{ color: '#1f2937', fontWeight: 600 }}>
                          {booking.flight.airline} • {booking.flight.aircraft}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                          <FaMapMarkerAlt size={11} style={{ marginRight: '4px' }} />
                          {booking.flight.origin} ({booking.flight.originCity}) → {booking.flight.destination} ({booking.flight.destinationCity})
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                          <FaClock size={11} style={{ marginRight: '4px' }} />
                          {booking.flight.departureTime} - {booking.flight.arrivalTime} ({booking.flight.duration})
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                          <FaChair size={11} style={{ marginRight: '4px' }} />
                          Seat {booking.flight.seat} • {booking.flight.seatClass}
                        </div>
                      </div>
                    </div>

                    {/* NDC Data */}
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', margin: 0, marginBottom: '12px', textTransform: 'uppercase' }}>
                        <FaLock size={12} style={{ marginRight: '6px' }} />NDC Information
                      </h4>
                      <div style={{ display: 'grid', gap: '6px', fontSize: '13px' }}>
                        <div style={{ color: '#1f2937', fontWeight: 600 }}>
                          {booking.ndc.orderCode}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                          <FaBarcode size={11} style={{ marginRight: '4px' }} />
                          Booking Token: {booking.ndcBookingToken}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                          Carrier: {booking.ndc.validatingCarrier}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                          Valid until: {new Date(booking.ndc.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Payment */}
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', margin: 0, marginBottom: '12px', textTransform: 'uppercase' }}>
                        <FaCreditCard size={12} style={{ marginRight: '6px' }} />Payment
                      </h4>
                      <div style={{ display: 'grid', gap: '6px', fontSize: '13px' }}>
                        <div style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} />
                          {booking.payment.status}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                          {booking.payment.method}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                          TXN: {booking.payment.transactionId}
                        </div>
                        <div style={{ color: '#1f2937', fontWeight: 600, fontSize: '14px' }}>
                          {booking.payment.amount} {booking.payment.currency}
                        </div>
                      </div>
                    </div>

                    {/* Services */}
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', margin: 0, marginBottom: '12px', textTransform: 'uppercase' }}>
                        <FaSuitcase size={12} style={{ marginRight: '6px' }} />Services
                      </h4>
                      <div style={{ display: 'grid', gap: '6px', fontSize: '13px' }}>
                        <div style={{ color: booking.services.seatSelection ? '#10b981' : '#9ca3af' }}>
                          ✓ Seat Selection
                        </div>
                        <div style={{ color: booking.services.baggage ? '#10b981' : '#9ca3af' }}>
                          {booking.services.baggage ? '✓' : '✗'} Baggage Included
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                          Luggage: {booking.flight.luggage.checkedBags} checked
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#374151', margin: 0, marginBottom: '12px', textTransform: 'uppercase' }}>
                        <FaClock size={12} style={{ marginRight: '6px' }} />Timeline
                      </h4>
                      <div style={{ display: 'grid', gap: '6px', fontSize: '12px' }}>
                        <div style={{ color: '#6b7280' }}>
                          Booked: {new Date(booking.bookingCreatedAt).toLocaleDateString()}
                        </div>
                        <div style={{ color: '#10b981', fontWeight: 600 }}>
                          Completed: {new Date(booking.completedAt).toLocaleDateString()}
                        </div>
                        <div style={{ color: '#6b7280' }}>
                          Depart: {booking.flight.date}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '8px',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '16px'
                  }}>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowModal(true);
                      }}
                      style={{
                        padding: '10px',
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FaEye size={12} /> View Details
                    </button>
                    <button
                      style={{
                        padding: '10px',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FaDownload size={12} /> Receipt
                    </button>
                    <button
                      style={{
                        padding: '10px',
                        background: '#8b5cf6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FaPrint size={12} /> Print Ticket
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
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
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Booking Confirmation</h2>
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

            {/* Booking Status */}
            <div style={{
              background: '#d1fae5',
              border: '1px solid #6ee7b7',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <p style={{ color: '#065f46', fontWeight: 700, fontSize: '16px', margin: 0 }}>
                ✓ Booking Confirmed & Ticketed
              </p>
              <p style={{ color: '#10b981', margin: '8px 0 0', fontSize: '13px' }}>
                Ticket: {selectedBooking.ticketNumber}
              </p>
            </div>

            {/* Full Details Grid */}
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Passenger */}
              <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, marginBottom: '12px' }}>Passenger</h3>
                <p style={{ margin: 0, color: '#1f2937', fontWeight: 600 }}>
                  {selectedBooking.passenger.firstName} {selectedBooking.passenger.lastName}
                </p>
                <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>
                  Passport: {selectedBooking.passenger.passport}
                </p>
              </div>

              {/* Flight */}
              <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, marginBottom: '12px' }}>Flight Information</h3>
                <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Flight:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>{selectedBooking.flight.flightNumber}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Date:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>{selectedBooking.flight.date}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Time:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>
                      {selectedBooking.flight.departureTime} - {selectedBooking.flight.arrivalTime}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Seat:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>{selectedBooking.flight.seat}</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, marginBottom: '12px' }}>Payment Details</h3>
                <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Amount:</span>
                    <span style={{ color: '#1f2937', fontWeight: 700, fontSize: '16px' }}>
                      {selectedBooking.payment.amount} {selectedBooking.payment.currency}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Method:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>✓ {selectedBooking.payment.method}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Transaction:</span>
                    <span style={{ color: '#1f2937', fontFamily: 'monospace', fontSize: '11px' }}>
                      {selectedBooking.payment.transactionId}
                    </span>
                  </div>
                </div>
              </div>

              {/* NDC */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, marginBottom: '12px' }}>NDC Booking Reference</h3>
                <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Order ID:</span>
                    <span style={{ color: '#1f2937', fontWeight: 600 }}>{selectedBooking.ndc.orderId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Token:</span>
                    <span style={{ color: '#1f2937', fontFamily: 'monospace', fontSize: '11px' }}>
                      {selectedBooking.ndcBookingToken}
                    </span>
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
    </div>
  );
}
