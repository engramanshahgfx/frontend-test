'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useUI } from '../providers/UIProvider';
import { bookingsAPI, paymentsAPI, reservationsAPI } from '../lib/api';
import { formatCurrency } from '@/lib/localization';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useParams, useRouter } from 'next/navigation';

export default function UserDrawer() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const { isUserDrawerOpen, closeUserDrawer, dashboardRefreshKey } = useUI();
  const lang = params?.lang || 'en';
  const isRTL = lang === 'ar';

  const handleOpenDashboard = (tab = 'profile') => {
    closeUserDrawer();
    router.push(`/${lang}/dashboard?tab=${tab}`);
  };

  const [activeView, setActiveView] = useState('main'); // 'main', 'reservations', 'bookings', 'payments', 'profile', 'travellers', 'preferences', 'loyalty', 'security'
  const [bookings, setBookings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Profile Edit Inputs
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Wallet
  const [walletPoints] = useState(0);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletModalType, setWalletModalType] = useState('');

  const isDummyEmail = (email) => {
    if (!email) return true;
    return email.includes('@tilalr.com') || email.startsWith('user_');
  };

  useEffect(() => {
    if (user) {
      setNameInput(user?.name || '');
      setPhoneInput(user?.phone || '');
      setEmailInput(isDummyEmail(user?.email) ? '' : (user?.email || ''));
    }
  }, [user]);

  useEffect(() => {
    if (isUserDrawerOpen && isAuthenticated) {
      loadDrawerData();
    }
  }, [isUserDrawerOpen, isAuthenticated, dashboardRefreshKey]);

  const loadDrawerData = async () => {
    setIsLoadingData(true);
    try {
      const results = await Promise.allSettled([
        reservationsAPI.getMyReservations(),
        bookingsAPI.getAll(),
        paymentsAPI.getAll(),
      ]);

      if (results[0].status === 'fulfilled') {
        setReservations(results[0].value.reservations || []);
      }
      if (results[1].status === 'fulfilled') {
        setBookings(results[1].value.bookings || []);
      }
      if (results[2].status === 'fulfilled') {
        const rawPayments = results[2].value.data || results[2].value.payments || [];
        setPayments(Array.isArray(rawPayments) ? rawPayments : []);
      }
    } catch (err) {
      console.error('Drawer data fetch error:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const referenceId = useMemo(() => {
    if (!user?.id) return 'TLR 422 140 028';
    const num = user.id * 137 + 100000000;
    const str = String(num).padStart(9, '0');
    return `TLR ${str.slice(0, 3)} ${str.slice(3, 6)} ${str.slice(6, 9)}`;
  }, [user?.id]);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(referenceId);
    setCopiedRef(true);
    toast.success(isRTL ? 'تم النسخ!' : 'Copied!');
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleLogout = async () => {
    closeUserDrawer();
    await logout();
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateProfile({
        name: nameInput,
        phone: phoneInput,
        email: emailInput,
      });
      if (res?.success || res?.user) {
        toast.success(isRTL ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');
        setIsEditingProfile(false);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const t = useMemo(() => ({
    hi: isRTL ? 'مرحباً' : 'Hi',
    refIdLabel: isRTL ? 'رقم المرجع الخاص بالتلال' : 'Tilal Reference ID',
    editProfile: isRTL ? 'تعديل الملف الشخصي' : 'Edit Profile',
    applyNow: isRTL ? 'اطلبها الحين' : 'Apply Now',
    creditCardTitle: isRTL ? 'بطاقة BSF التلال الائتمانية!' : 'The BSF Tilal Credit Card!',
    creditCardDesc: isRTL
      ? 'مرّر، اكسب، واجعل كل عملية شراء محصورة في مكافآت - قدّم على بطاقتك اليوم!'
      : 'Swipe, earn, and make every purchase count - Apply for your card today!',
    myTrips: isRTL ? 'رحلاتي' : 'My Trips',
    myWallet: isRTL ? 'محفظتي' : 'My Wallet',
    pointsCount: isRTL ? 'نقاط التلال' : 'Tilal points',
    addPoints: isRTL ? 'أضف نقاط لمحفظتك' : 'Add points to your Wallet',
    transferPoints: isRTL ? 'تحويل النقاط' : 'Transfer points',
    buyGiftCard: isRTL ? 'اشترِ قسيمة شراء' : 'Buy a gift card',
    myAccount: isRTL ? 'حسابي' : 'My account',
    profile: isRTL ? 'الملف الشخصي' : 'Profile',
    travellers: isRTL ? 'حجوزات الطيران' : 'Flight Bookings',
    flightBookings: isRTL ? 'حجوزات الطيران' : 'Flight Bookings',
    travelPreferences: isRTL ? 'تفضيلات السفر' : 'Travel preferences',
    loyaltyPrograms: isRTL ? 'برامج الولاء' : 'Loyalty programs',
    loyaltyDesc: isRTL
      ? 'أضف تفاصيل حسابك في قطاف، مكافأة، الفرسان، شكراً، وحصاد'
      : 'Add your Qitaf, mokafaa, Alfursan, Shukran, and Hassad account details',
    paymentPreferences: isRTL ? 'طرق الدفع المفضلة' : 'Payment preferences',
    security: isRTL ? 'إعدادات الأمان' : 'Security',
    logout: isRTL ? 'تسجيل الخروج' : 'Logout',
    addPreferences: isRTL ? 'إضافة التفضيلات' : 'Add Preferences',
    myReservations: isRTL ? 'طلبات الحجز الخاصة' : 'Custom Requests',
    customRequests: isRTL ? 'طلبات الحجز الخاصة (المدارس والشركات)' : 'Custom Requests',
    myBookings: isRTL ? 'حجوزات الرحلات السياحية' : 'Tourism Bookings',
    tourismBookings: isRTL ? 'حجوزات الرحلات السياحية' : 'Tourism Bookings',
    paymentHistory: isRTL ? 'سجل المدفوعات' : 'Payment History',
    noBookings: isRTL ? 'لا توجد حجوزات بعد' : 'No bookings yet',
    noReservations: isRTL ? 'لا توجد طلبات حجز بعد' : 'No reservations yet',
    noPayments: isRTL ? 'لا توجد مدفوعات' : 'No payment history',
    browseTrips: isRTL ? 'تصفح الرحلات' : 'Browse Trips',
    back: isRTL ? 'رجوع' : 'Back',
    loading: isRTL ? 'جاري التحميل...' : 'Loading...',
    saveChanges: isRTL ? 'حفظ التغييرات' : 'Save Changes',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    name: isRTL ? 'الاسم الكامل' : 'Full Name',
    email: isRTL ? 'البريد الإلكتروني' : 'Email Address',
    phone: isRTL ? 'رقم الجوال' : 'Mobile Number',
  }), [isRTL]);

  const userContactDisplay = useMemo(() => {
    if (user?.email && !isDummyEmail(user.email)) {
      return user.email;
    }
    if (user?.phone) {
      return user.phone;
    }
    return user?.name || '';
  }, [user]);

  if (!isUserDrawerOpen) return null;

  return (
    <div className="drawer-overlay" onClick={closeUserDrawer}>
      <div
        className={`drawer-panel ${isRTL ? 'rtl-panel' : 'ltr-panel'}`}
        onClick={(e) => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* HEADER CONTROLS */}
        <div className="drawer-top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeView !== 'main' && (
              <button className="drawer-back-btn" onClick={() => setActiveView('main')}>
                {isRTL ? '➔ ' : '← '} {t.back}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="drawer-expand-btn"
              onClick={() => handleOpenDashboard(activeView === 'main' ? 'profile' : activeView)}
              title={isRTL ? 'عرض ملء الشاشة' : 'Full Page Dashboard'}
            >
              ⤢
            </button>
            <button className="drawer-close-btn" onClick={closeUserDrawer}>
              ✕
            </button>
          </div>
        </div>

        <div className="drawer-scroll-content">
          {activeView === 'main' && (
            <>
              {/* USER PROFILE HEADER */}
              <div className="user-profile-header">
                <div className="avatar-circle">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h2 className="user-greeting">{t.hi}</h2>
                <p className="user-email-phone">{userContactDisplay}</p>

                <div className="ref-id-row">
                  <span className="ref-id-title">{t.refIdLabel}</span>
                  <button className="info-icon" title="Unique Account ID">ⓘ</button>
                </div>
                <div className="ref-id-code-row" onClick={handleCopyRef}>
                  <span className="ref-code">{referenceId}</span>
                  <button className="copy-btn">
                    {copiedRef ? '✓' : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    )}
                  </button>
                </div>

                <button className="edit-profile-btn" onClick={() => handleOpenDashboard('profile')}>
                  {t.editProfile}
                </button>
              </div>

              {/* BSF CREDIT CARD PROMO */}


              {/* MY TRIPS QUICK ACCESS */}
              <div className="dashboard-section-link" onClick={() => handleOpenDashboard('bookings')}>
                <div className="section-link-left">
                  <span className="section-icon">📅</span>
                  <span className="section-title">{t.myTrips}</span>
                </div>
                <div className="section-link-right">
                  <span className="trips-count-badge">
                    {bookings.length + reservations.length}
                  </span>
                  <span className="chevron">{isRTL ? '‹' : '›'}</span>
                </div>
              </div>



              {/* MY ACCOUNT MENU ITEMS */}
              <div className="account-section">
                <h3 className="section-heading">{t.myAccount}</h3>
                <div className="account-menu-list">
                  <div className="menu-item" onClick={() => handleOpenDashboard('profile')}>
                    <div className="menu-item-left">
                      <span className="menu-icon"></span>
                      <span className="menu-text">{t.profile}</span>
                    </div>
                    <span className="chevron">{isRTL ? '‹' : '›'}</span>
                  </div>

                  <div className="menu-item" onClick={() => handleOpenDashboard('travellers')}>
                    <div className="menu-item-left">
                      <span className="menu-icon"></span>
                      <span className="menu-text">{t.travellers}</span>
                    </div>
                    <span className="chevron">{isRTL ? '‹' : '›'}</span>
                  </div>

                  <div className="menu-item" onClick={() => handleOpenDashboard('preferences')}>
                    <div className="menu-item-left">
                      <span className="menu-icon"></span>
                      <span className="menu-text">{t.travelPreferences}</span>
                    </div>
                    <div className="menu-item-right">
                      <span className="pill-badge">{t.addPreferences}</span>
                      <span className="chevron">{isRTL ? '‹' : '›'}</span>
                    </div>
                  </div>



                  <div className="menu-item" onClick={() => handleOpenDashboard('payments')}>
                    <div className="menu-item-left">
                      <span className="menu-icon"></span>
                      <span className="menu-text">{t.paymentPreferences}</span>
                    </div>
                    <span className="chevron">{isRTL ? '‹' : '›'}</span>
                  </div>
                </div>

                <div className="logout-row">
                  <button className="logout-btn" onClick={handleLogout}>
                    {t.logout}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* SUBVIEWS INSIDE DRAWER */}
          {activeView === 'bookings' && (
            <div className="drawer-subview">
              <h3>{t.myBookings}</h3>
              {isLoadingData ? (
                <div className="drawer-loading">{t.loading}</div>
              ) : bookings.length === 0 ? (
                <div className="empty-box">
                  <p>{t.noBookings}</p>
                  <Link href={`/${lang}`} onClick={closeUserDrawer} className="drawer-btn-primary">
                    {t.browseTrips}
                  </Link>
                </div>
              ) : (
                <div className="drawer-cards-list">
                  {bookings.map((b) => (
                    <div key={b.id} className="drawer-card">
                      <div className="card-header-row">
                        <strong>#{b.booking_number || b.id}</strong>
                        <span className="status-tag">{b.status}</span>
                      </div>
                      <p className="card-line">Date: {new Date(b.created_at || b.date).toLocaleDateString()}</p>
                      <p className="card-line">Guests: {b.guests || 1}</p>
                      {b.total_amount && <p className="card-line">Total: {formatCurrency(b.total_amount, 'SAR', lang)}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'reservations' && (
            <div className="drawer-subview">
              <h3>{t.myReservations}</h3>
              {isLoadingData ? (
                <div className="drawer-loading">{t.loading}</div>
              ) : reservations.length === 0 ? (
                <div className="empty-box">
                  <p>{t.noReservations}</p>
                  <Link href={`/${lang}`} onClick={closeUserDrawer} className="drawer-btn-primary">
                    {t.browseTrips}
                  </Link>
                </div>
              ) : (
                <div className="drawer-cards-list">
                  {reservations.map((r) => (
                    <div key={r.id} className="drawer-card">
                      <div className="card-header-row">
                        <strong>#{r.id}</strong>
                        <span className="status-tag">{r.status}</span>
                      </div>
                      <p className="card-line">Date: {new Date(r.preferred_date || r.created_at).toLocaleDateString()}</p>
                      <p className="card-line">Trip: {r.trip_title || r.trip_type}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'payments' && (
            <div className="drawer-subview">
              <h3>{t.paymentHistory}</h3>
              {isLoadingData ? (
                <div className="drawer-loading">{t.loading}</div>
              ) : payments.length === 0 ? (
                <div className="empty-box">
                  <p>{t.noPayments}</p>
                </div>
              ) : (
                <div className="drawer-cards-list">
                  {payments.map((p) => (
                    <div key={p.id} className="drawer-card">
                      <div className="card-header-row">
                        <strong>#{p.id}</strong>
                        <span className="status-tag">{p.payment_status || p.status}</span>
                      </div>
                      <p className="card-line">Amount: {p.total_amount || p.amount || 0} SAR</p>
                      <p className="card-line">Date: {new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'profile' && (
            <div className="drawer-subview">
              <h3>{t.profile}</h3>
              <form onSubmit={handleSaveProfile} className="drawer-form">
                <div className="form-item">
                  <label>{t.name}</label>
                  <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} required />
                </div>
                <div className="form-item">
                  <label>{t.email}</label>
                  <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required />
                </div>
                <div className="form-item">
                  <label>{t.phone}</label>
                  <input type="tel" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
                </div>
                <button type="submit" className="drawer-btn-save" disabled={isSaving}>
                  {isSaving ? t.loading : t.saveChanges}
                </button>
              </form>
            </div>
          )}

          {(activeView === 'travellers' || activeView === 'preferences' || activeView === 'loyalty' || activeView === 'security') && (
            <div className="drawer-subview">
              <h3>
                {activeView === 'travellers' && t.travellers}
                {activeView === 'preferences' && t.travelPreferences}
                {activeView === 'loyalty' && t.loyaltyPrograms}
                {activeView === 'security' && t.security}
              </h3>
              <div className="empty-box">
                <p>{isRTL ? 'إدارة الإعدادات متوفرة فوراً' : 'Manage your preferences seamlessly.'}</p>
              </div>
            </div>
          )}
        </div>

        {/* EDIT PROFILE MODAL */}
        {isEditingProfile && (
          <div className="modal-sub-overlay" onClick={() => setIsEditingProfile(false)}>
            <div className="modal-sub-box" onClick={(e) => e.stopPropagation()}>
              <h4>{t.editProfile}</h4>
              <form onSubmit={handleSaveProfile} className="drawer-form">
                <div className="form-item">
                  <label>{t.name}</label>
                  <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} required />
                </div>
                <div className="form-item">
                  <label>{t.email}</label>
                  <input type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required />
                </div>
                <div className="form-item">
                  <label>{t.phone}</label>
                  <input type="tel" value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="btn-sec">{t.cancel}</button>
                  <button type="submit" className="drawer-btn-save" disabled={isSaving}>{isSaving ? t.loading : t.saveChanges}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* WALLET MODAL */}
        {showWalletModal && (
          <div className="modal-sub-overlay" onClick={() => setShowWalletModal(false)}>
            <div className="modal-sub-box" onClick={(e) => e.stopPropagation()}>
              <h4>{t.myWallet}</h4>
              <p style={{ fontSize: '0.85rem', color: '#555' }}>
                {isRTL ? 'رصيد المحفظة الحالي: ' : 'Current Wallet Balance: '} <strong>{walletPoints} {t.pointsCount}</strong>
              </p>
              <input type="text" placeholder={isRTL ? 'أدخل الرمز / البريد' : 'Enter Code or Email'} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', margin: '10px 0' }} />
              <button className="drawer-btn-save" style={{ width: '100%' }} onClick={() => { toast.success(isRTL ? 'تمت العملية' : 'Action finished'); setShowWalletModal(false); }}>
                {isRTL ? 'تأكيد' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(4px);
          z-index: 10000;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.25s ease-out;
        }

        .drawer-panel {
          width: 100%;
          max-width: 440px;
          height: 100%;
          background: #ffffff;
          box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ltr-panel {
          margin-left: auto;
        }

        .rtl-panel {
          margin-right: auto;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .rtl-panel {
          animation: slideInRtl 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideInRtl {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        .drawer-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f3f6;
        }

        .drawer-back-btn {
          background: none;
          border: none;
          color: var(--accent-color);
          font-weight: 700;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .drawer-close-btn, .drawer-expand-btn {
          background: #f3f4f6;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 1rem;
          cursor: pointer;
          color: #4b5563;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .drawer-close-btn:hover, .drawer-expand-btn:hover {
          background: #e5e7eb;
        }

        .drawer-scroll-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        /* ALMOSAFER STYLES INSIDE DRAWER */
        .user-profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #f0f3f6;
        }

        .avatar-circle {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: var(--secondary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          border: 2px solid var(--secondary-hover-color);
        }

        .user-greeting {
          font-size: 1.3rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 2px 0;
        }

        .user-email-phone {
          font-size: 0.9rem;
          color: #4b5563;
          margin: 0 0 12px 0;
        }

        .ref-id-row {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 0.78rem;
        }

        .info-icon {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .ref-id-code-row {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f3f4f6;
          padding: 4px 12px;
          border-radius: 16px;
          cursor: pointer;
          margin: 4px 0 12px 0;
        }

        .ref-code {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1f2937;
        }

        .copy-btn {
          background: none;
          border: none;
          color: #4b5563;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .edit-profile-btn {
          background: none;
          border: none;
          color: var(--accent-color);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s;
        }
        .edit-profile-btn:hover {
          color: var(--accent-hover-color);
        }

        /* PROMO */
        .promo-banner-card {
          margin-top: 16px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }

        .badge-apply {
          background-color: #16a34a;
          color: #ffffff;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 4px;
        }

        .promo-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 2px 0;
        }

        .promo-desc {
          font-size: 0.74rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.3;
          max-width: 220px;
        }

        .card-graphic {
          width: 48px;
          height: 30px;
          background: linear-gradient(135deg, #1e3a8a, #0d9488);
          border-radius: 5px;
          padding: 3px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .card-chip {
          width: 8px;
          height: 6px;
          background: #f59e0b;
          border-radius: 1px;
        }

        .card-logo {
          color: #fff;
          font-size: 0.5rem;
          font-weight: 900;
          align-self: flex-end;
        }

        .banner-chevron {
          font-size: 1.1rem;
          color: var(--accent-color);
          font-weight: 700;
        }

        /* SECTION HEADINGS */
        .section-heading {
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
          margin: 20px 0 10px 0;
        }

        .dashboard-section-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid #f0f3f6;
          cursor: pointer;
        }

        .section-link-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1f2937;
        }

        .trips-count-badge {
          background-color: #f3f4f6;
          color: #4b5563;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .chevron {
          color: var(--accent-color);
          font-size: 1rem;
          font-weight: 600;
        }

        /* WALLET */
        .wallet-points-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }

        .points-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .points-amount {
          font-size: 0.9rem;
          font-weight: 700;
          color: #111827;
        }

        .points-label {
          font-size: 0.82rem;
          color: #4b5563;
        }

        .wallet-actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 10px;
        }

        .wallet-action-box {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
        }

        .action-icon {
          font-size: 1.1rem;
          color: #4b5563;
          margin-bottom: 4px;
        }

        .action-text {
          font-size: 0.7rem;
          font-weight: 600;
          color: #374151;
        }

        /* ACCOUNT MENU */
        .menu-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid #f0f3f6;
          cursor: pointer;
        }

        .menu-item-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .menu-text {
          font-size: 0.88rem;
          font-weight: 500;
          color: #1f2937;
        }

        .menu-subtext {
          font-size: 0.7rem;
          color: #9ca3af;
        }

        .loyalty-texts {
          display: flex;
          flex-direction: column;
        }

        .pill-badge {
          background-color: var(--secondary-color);
          color: var(--primary-color);
          font-size: 0.7rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .logout-row {
          margin-top: 24px;
          text-align: center;
        }

        .logout-btn {
          background: none;
          border: none;
          color: #e11d48;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
        }

        /* SUBVIEWS */
        .drawer-subview h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .empty-box {
          text-align: center;
          padding: 30px 16px;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px dashed #d1d5db;
        }

        .drawer-btn-primary {
          display: inline-block;
          background: var(--accent-yellow);
          color: #000;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 700;
          text-decoration: none;
        }

        .drawer-cards-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .drawer-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px;
        }

        .card-header-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .status-tag {
          font-size: 0.75rem;
          background: #e8f0fe;
          color: #1a73e8;
          padding: 2px 6px;
          border-radius: 8px;
        }

        .card-line {
          margin: 2px 0;
          font-size: 0.82rem;
          color: #4b5563;
        }

        .drawer-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-item label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
        }

        .form-item input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .drawer-btn-save {
          background: #00b4d8;
          color: #fff;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }

        .modal-sub-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          z-index: 100;
        }

        .modal-sub-box {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          width: 100%;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 14px;
        }

        .btn-sec {
          background: #f3f4f6;
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
