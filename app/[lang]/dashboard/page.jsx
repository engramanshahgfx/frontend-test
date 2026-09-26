'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { bookingsAPI, paymentsAPI, reservationsAPI } from '../../../lib/api';
import { formatCurrency, amountWithVAT } from '@/lib/localization';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useUI } from '../../../providers/UIProvider';

export default function DashboardPage() {
  const params = useParams();
  const { user, isAuthenticated, loading, logout, updateProfile } = useAuth();
  const { openAuthModal, dashboardRefreshKey } = useUI();
  const [bookings, setBookings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Profile phone edit state
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [savingPhone, setSavingPhone] = useState(false);

  useEffect(() => {
    setPhoneInput(user?.phone || '');
  }, [user]);
  const searchParams = useSearchParams();
  const lang = params?.lang || 'en';
  const isRTL = lang === 'ar';
  const [activeTab, setActiveTab] = useState(() => searchParams?.get('tab') || 'reservations');
  const router = useRouter();

  // Translations
  const t = useMemo(() => ({
    welcome: isRTL ? 'مرحباً،' : 'Welcome,',
    logout: isRTL ? 'تسجيل الخروج' : 'Logout',
    myReservations: isRTL ? 'طلبات الحجز الخاصة بي' : 'My Reservations',
    myBookings: isRTL ? 'حجوزاتي' : 'My Bookings',
    paymentHistory: isRTL ? 'سجل المدفوعات' : 'Payment History',
    profileSettings: isRTL ? 'إعدادات الحساب' : 'Profile Settings',
    phoneLabel: isRTL ? 'الجوال' : 'Phone',
    loading: isRTL ? 'جاري التحميل...' : 'Loading...',
    noBookings: isRTL ? 'لا توجد حجوزات بعد' : 'No bookings yet',
    noReservations: isRTL ? 'لا توجد طلبات حجز بعد' : 'No reservations yet',
    browseTrips: isRTL ? 'تصفح الرحلات' : 'Browse Trips',
    reservation: isRTL ? 'طلب حجز' : 'Reservation',
    booking: isRTL ? 'حجز' : 'Booking',
    date: isRTL ? 'التاريخ' : 'Date',
    guests: isRTL ? 'عدد الأشخاص' : 'Guests',
    paymentStatus: isRTL ? 'حالة الدفع' : 'Payment Status',
    amount: isRTL ? 'المبلغ' : 'Amount',
    trip: isRTL ? 'الرحلة' : 'Trip',
    tripType: isRTL ? 'نوع الرحلة' : 'Trip Type',
    payNow: isRTL ? 'ادفع الآن' : 'Pay Now',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    noPayments: isRTL ? 'لا توجد مدفوعات' : 'No payment history',
    id: isRTL ? 'الرقم' : 'ID',
    method: isRTL ? 'الطريقة' : 'Method',
    status: isRTL ? 'الحالة' : 'Status',
    confirmCancel: isRTL ? 'هل أنت متأكد من إلغاء هذا الحجز؟' : 'Are you sure you want to cancel this booking?',
    cancelFailed: isRTL ? 'فشل إلغاء الحجز' : 'Failed to cancel booking',
    // Status translations
    pending: isRTL ? 'قيد الانتظار' : 'Pending',
    contacted: isRTL ? 'تم التواصل' : 'Contacted',
    confirmed: isRTL ? 'مؤكد' : 'Confirmed',
    converted: isRTL ? 'تم التحويل إلى حجز' : 'Converted to Booking',
    cancelled: isRTL ? 'ملغي' : 'Cancelled',
    completed: isRTL ? 'مكتمل' : 'Completed',
    paid: isRTL ? 'مدفوع' : 'Paid',
    unpaid: isRTL ? 'غير مدفوع' : 'Unpaid',
    failed: isRTL ? 'فشل' : 'Failed',
    adminContacted: isRTL ? 'تم التواصل من الإدارة' : 'Admin Contacted',    // Human-readable status messages
    waitingForReview: isRTL ? 'في انتظار مراجعة الإدارة...' : 'Waiting for admin review...',
    adminContactedMessage: isRTL ? 'تواصلت الإدارة معك. في انتظار التأكيد.' : 'Admin has contacted you. Awaiting confirmation.',
    reservationConfirmed: isRTL ? 'تم تأكيد الطلب من قبل الإدارة.' : 'Reservation confirmed by admin.',
    convertedToBooking: isRTL ? "تم التحويل إلى حجز! تحقق من تبويب 'حجوزاتي' لإكمال الدفع." : "Converted to booking! Check My Bookings tab to complete payment.",  }), [isRTL]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      openAuthModal('login');
      router.replace(`/${lang}`);
    }
  }, [isAuthenticated, loading, router, openAuthModal, lang]);

  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, dashboardRefreshKey]);

  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      const results = await Promise.allSettled([
        reservationsAPI.getMyReservations(),
        bookingsAPI.getAll(),
        paymentsAPI.getAll(),
      ]);

      const reservationsResult = results[0];
      const bookingsResult = results[1];
      const paymentsResult = results[2];

      if (reservationsResult.status === 'fulfilled') {
        console.debug('[dashboard] reservations API response', reservationsResult.value);
        setReservations(reservationsResult.value.reservations || []);
      } else {
        console.error('Failed to load reservations:', reservationsResult.reason);
        setReservations([]);
        toast.error(`Failed to load reservations: ${reservationsResult.reason?.message || 'Please try again'}`);
      }

      if (bookingsResult.status === 'fulfilled') {
        setBookings(bookingsResult.value.bookings || []);
      } else {
        console.error('Failed to load bookings:', bookingsResult.reason);
        setBookings([]);
        toast.error(`Failed to load bookings: ${bookingsResult.reason?.message || 'Please try again'}`);
      }

      if (paymentsResult.status === 'fulfilled') {
        setPayments(paymentsResult.value.payments || []);
      } else {
        console.error('Failed to load payments:', paymentsResult.reason);
        setPayments([]);
        toast.error(`Failed to load payments: ${paymentsResult.reason?.message || 'Please try again'}`);
      }
    } catch (error) {
      console.error('Failed to load dashboard data (unexpected):', error);
      toast.error(`Failed to load dashboard data: ${error?.message || 'Please try again'}`);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push(`/${lang}`);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm(t.confirmCancel)) return;

    try {
      await bookingsAPI.cancel(bookingId);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      alert(t.cancelFailed);
    }
  };

  const savePhone = async () => {
    setSavingPhone(true);
    try {
      const res = await updateProfile({ phone: phoneInput });
      if (res?.success) {
        setEditingPhone(false);
      }
    } catch (err) {
      console.error('Save phone failed', err);
      toast.error(err?.message || 'Failed to update phone');
    } finally {
      setSavingPhone(false);
    }
  };

  const translateStatus = (status) => {
    const map = {
      pending: t.pending,
      confirmed: t.confirmed,
      cancelled: t.cancelled,
      completed: t.completed,
      paid: t.paid,
      unpaid: t.unpaid,
      failed: t.failed,
    };
    return map[status] || status;
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#28a745',
      cancelled: '#dc3545',
      completed: '#007bff',
      paid: '#28a745',
      unpaid: '#ffc107',
      failed: '#dc3545',
    };
    
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: 'white',
        backgroundColor: colors[status] || '#6c757d',
      }}>
        {translateStatus(status)}
      </span>
    );
  };

  if (loading || !isAuthenticated) {
    return <div className="loading" dir={isRTL ? 'rtl' : 'ltr'}>{t.loading}</div>;
  }

  return (
    <div className="dashboard-wrapper" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Banner Section */}
      <div className="dashboard-banner">
        <div className="banner-content">
          <h1 className="banner-title">{t.welcome} {user?.name}!</h1>
          <p className="banner-subtitle">{user?.email}</p>
          <button onClick={handleLogout} className="btn-logout-banner">
            {t.logout}
          </button>
        </div>
      </div>

      <div className="dashboard-container" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="dashboard-tabs">
          <button
            className={activeTab === 'reservations' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('reservations')}
          >
            {t.myReservations} ({reservations.length})
          </button>
          <button
            className={activeTab === 'bookings' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('bookings')}
          >
            {t.myBookings} ({bookings.length})
          </button>
          <button
            className={activeTab === 'payments' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('payments')}
          >
            {t.paymentHistory} ({payments.length})
          </button>
          <button
            className={activeTab === 'profile' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('profile')}
          >
            {t.profileSettings}
          </button>
        </div>

        <div className="dashboard-content">
        {isLoadingData ? (
          <div className="loading">{t.loading}</div>
        ) : (
          <>
            {activeTab === 'reservations' && (
              <div className="reservations-list">
                <h2>{t.myReservations}</h2>
                {reservations.length === 0 ? (
                  <div className="empty-state">
                    <p>{t.noReservations}</p>
                    <Link href={`/${lang}`} className="btn-primary">
                      {t.browseTrips}
                    </Link>
                  </div>
                ) : (
                  <div className="bookings-grid">
                    {reservations.map((reservation) => (
                      <div key={reservation.id} className="booking-card">
                        <div className="booking-header">
                          <h3>{t.reservation} #{reservation.id}</h3>
                          {getStatusBadge(reservation.status)}
                        </div>
                        <div className="booking-details">
                          <p><strong>{t.date}:</strong> {new Date(reservation.preferred_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
                          <p><strong>{t.guests}:</strong> {reservation.guests}</p>
                          <p><strong>{t.tripType}:</strong> {reservation.trip_type || 'Activity'}</p>
                          {reservation.trip_title && (
                            <p><strong>{t.trip}:</strong> {reservation.trip_title}</p>
                          )}
                          <p><strong>{t.adminContacted}:</strong> {reservation.admin_contacted ? '✓ Yes' : '✗ No'}</p>
                          <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '10px' }}>
                            {reservation.status === 'pending' && t.waitingForReview}
                            {reservation.status === 'contacted' && t.adminContactedMessage}
                            {reservation.status === 'confirmed' && t.reservationConfirmed}
                            {reservation.status === 'converted' && t.convertedToBooking}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="bookings-list">
                <h2>{t.myBookings}</h2>
                {bookings.length === 0 ? (
                  <div className="empty-state">
                    <p>{t.noBookings}</p>
                    <Link href={`/${lang}`} className="btn-primary">
                      {t.browseTrips}
                    </Link>
                  </div>
                ) : (
                  <div className="bookings-grid">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="booking-card">
                        <div className="booking-header">
                          <h3>{t.booking} #{booking.id + 1000}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="booking-details">
                          <p><strong>{t.date}:</strong> {new Date(booking.date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
                          <p><strong>{t.guests}:</strong> {booking.guests}</p>
                          <p><strong>{t.paymentStatus}:</strong> {getStatusBadge(booking.payment_status)}</p>
                          {booking.details?.amount && (
                            <p><strong>{t.amount}:</strong> {formatCurrency(amountWithVAT(booking.details.amount), 'SAR', lang)}</p>
                          )}
                          {booking.details?.trip_title && (
                            <p><strong>{t.trip}:</strong> {booking.details.trip_title}</p>
                          )}
                        </div>
                        <div className="booking-actions">
                          {booking.status === 'pending' && booking.payment_status !== 'paid' && (
                            <>
                              <Link
                                href={`/${lang}/payment?booking_id=${booking.id}`}
                                className="btn-pay"
                              >
                                {t.payNow}
                              </Link>
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="btn-cancel"
                              >
                                {t.cancel}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="payments-list">
                <h2>{t.paymentHistory}</h2>
                {payments.length === 0 ? (
                  <div className="empty-state">
                    <p>{t.noPayments}</p>
                  </div>
                ) : (
                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>{isRTL ? 'رقم الدفع' : 'Payment ID'}</th>
                        <th>{isRTL ? 'رقم الحجز' : 'Booking ID'}</th>
                        <th>{t.method}</th>
                        <th>{t.amount}</th>
                        <th>{t.status}</th>
                        <th>{t.date}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>#{payment.id}</td>
                          <td>#{payment.booking_id}</td>
                          <td>{payment.method}</td>
                          <td>{payment.meta?.amount || 'N/A'} SAR</td>
                          <td>{getStatusBadge(payment.status)}</td>
                          <td>{new Date(payment.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="profile-section">
                <h2>{t.profileSettings}</h2>
                <div className="profile-info">
                  <div className="info-item">
                    <label>{isRTL ? 'الاسم:' : 'Name:'}</label>
                    <p>{user?.name}</p>
                  </div>
                  <div className="info-item">
                    <label>{isRTL ? 'البريد الإلكتروني:' : 'Email:'}</label>
                    <p>{user?.email}</p>
                  </div>
                  <div className="info-item">
                    <label>{t.phoneLabel}:</label>
                    {editingPhone ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input type="tel" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }} />
                        <button className="btn-primary" onClick={savePhone} disabled={savingPhone} style={{ padding: '0.45rem 0.75rem' }}>{savingPhone ? 'Saving...' : 'Save'}</button>
                        <button className="btn-secondary" onClick={() => { setEditingPhone(false); setPhoneInput(user?.phone || '') }} disabled={savingPhone} style={{ padding: '0.45rem 0.75rem' }}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <p style={{ margin: 0 }}>{user?.phone || '-'}</p>
                        <button className="btn-link" onClick={() => setEditingPhone(true)} style={{ marginLeft: '8px' }}>Edit</button>
                      </div>
                    )}
                  </div>
                  <div className="info-item">
                    <label>{isRTL ? 'تاريخ الانضمام:' : 'Member Since:'}</label>
                    <p>{new Date(user?.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        /* ensure dashboard content clears the fixed header */
        .dashboard-wrapper {
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          min-height: 100vh;
          padding-top: 80px; /* space for fixed navbar */
        }

        @media (max-width: 768px) {
          .dashboard-wrapper {
            padding-top: 70px;
          }
        }

        .dashboard-banner {
          background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);
          color: white;
          padding: 3rem 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          border-bottom: 3px solid #dfa528;
        }

        .banner-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .banner-title {
          margin: 0;
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff, #EFC8AE, #dfa528);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .banner-subtitle {
          margin: 0.5rem 0 0 0;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 300;
        }

        .btn-logout-banner {
          padding: 0.75rem 2rem;
          background-color: #dfa528;
          color: #000;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(223, 165, 40, 0.3);
        }

        .btn-logout-banner:hover {
          background-color: #efc8ae;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(223, 165, 40, 0.4);
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        h1 {
          margin: 0;
          color: white;
        }

        .user-email {
          color: rgba(255, 255, 255, 0.7);
          margin-top: 0.5rem;
        }

        .btn-logout {
          padding: 0.75rem 1.5rem;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        }

        .btn-logout:hover {
          background-color: #c82333;
        }

        .dashboard-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
          overflow-x: auto;
        }

        .tab {
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
          transition: all 0.3s;
          white-space: nowrap;
          font-weight: 500;
        }

        .tab:hover {
          color: #dfa528;
        }

        .tab.active {
          color: #dfa528;
          border-bottom-color: #dfa528;
        }

        .dashboard-content {
          min-height: 400px;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.1rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .empty-state p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }

        .bookings-list h2,
        .payments-list h2 {
          color: white;
          margin-bottom: 1.5rem;
          font-size: 1.8rem;
        }

        .bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }

        .booking-card {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }

        .booking-card:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(223, 165, 40, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(223, 165, 40, 0.2);
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .booking-header h3 {
          margin: 0;
          color: #dfa528;
          font-size: 1.2rem;
        }

        .booking-details p {
          margin: 0.8rem 0;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.6;
        }

        .booking-details p strong {
          color: #dfa528;
        }

        .booking-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn-pay, .btn-primary {
          padding: 0.7rem 1.5rem;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          text-align: center;
          font-weight: 600;
          transition: all 0.3s ease;
          flex: 1;
        }

        .btn-pay:hover, .btn-primary:hover {
          background-color: #218838;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }

        .btn-cancel {
          padding: 0.7rem 1.5rem;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          flex: 1;
        }

        .btn-cancel:hover {
          background-color: #c82333;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
        }

        .payments-list h2 {
          color: white;
          margin-bottom: 1.5rem;
        }

        .payments-table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .payments-table th,
        .payments-table td {
          padding: 1.2rem;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .payments-table th {
          background-color: rgba(223, 165, 40, 0.15);
          font-weight: 600;
          color: #dfa528;
        }

        .payments-table td {
          color: rgba(255, 255, 255, 0.85);
        }

        .payments-table tbody tr:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .profile-section {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 2.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .profile-section h2 {
          color: white;
          margin-top: 0;
        }

        .profile-info {
          max-width: 600px;
        }

        .info-item {
          margin-bottom: 1.5rem;
        }

        .info-item label {
          display: block;
          font-weight: 600;
          color: #dfa528;
          margin-bottom: 0.5rem;
        }

        .info-item p {
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
