'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { bookingsAPI, paymentsAPI, reservationsAPI } from '../../../lib/api';
import { formatCurrency } from '@/lib/localization';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useUI } from '../../../providers/UIProvider';

export default function DashboardPage() {
  const params = useParams();
  const { user, isAuthenticated, loading, logout, updateProfile } = useAuth();
  const { openAuthModal, dashboardRefreshKey } = useUI();

  // Active Tab in Sidebar: 'profile', 'bookings', 'reservations', 'payments', 'travellers', 'preferences', 'loyalty', 'security'
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathLang = typeof window !== 'undefined' ? (window.location.pathname.startsWith('/ar') ? 'ar' : 'en') : 'en';
  const lang = params?.lang || pathLang || 'en';
  const isRTL = lang === 'ar';

  const formatStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (['confirmed', 'completed', 'paid', 'captured'].includes(s)) return isRTL ? 'مؤكد' : 'Confirmed';
    if (['pending', 'initiated'].includes(s)) return isRTL ? 'قيد الانتظار' : 'Pending';
    if (s === 'unpaid') return isRTL ? 'غير مدفوع' : 'Unpaid';
    if (['failed', 'declined'].includes(s)) return isRTL ? 'فاشل' : 'Failed';
    if (s === 'cancelled') return isRTL ? 'ملغي' : 'Cancelled';
    return status || (isRTL ? 'معلق' : 'Pending');
  };

  const [activeTab, setActiveTab] = useState('profile');
  const [paymentFilter, setPaymentFilter] = useState('paid'); // 'paid', 'unpaid', 'failed', 'all'

  // Data states
  const [bookings, setBookings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Profile Form State
  const [title, setTitle] = useState('Mr'); // 'Mr', 'Ms', 'Mrs'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneCode, setPhoneCode] = useState('+966');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('male');
  const [nationality, setNationality] = useState('Saudi Arabia');
  const [residence, setResidence] = useState('Saudi Arabia');
  const [familyStatus, setFamilyStatus] = useState('Single');
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
    const tabParam = searchParams?.get('tab');
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmailInput(isDummyEmail(user.email) ? '' : (user.email || ''));

      let p = user.phone || '';
      if (p.startsWith('+966')) {
        setPhoneCode('+966');
        setPhoneNumber(p.replace('+966', ''));
      } else if (p.startsWith('+971')) {
        setPhoneCode('+971');
        setPhoneNumber(p.replace('+971', ''));
      } else if (p.startsWith('+965')) {
        setPhoneCode('+965');
        setPhoneNumber(p.replace('+965', ''));
      } else {
        setPhoneNumber(p);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      openAuthModal('login');
      router.replace(`/${lang}`);
    }
  }, [isAuthenticated, loading, router, openAuthModal, lang]);

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
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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

  const getTilalItemRef = (item) => {
    if (!item) return referenceId;
    if (item.tilal_ref_id) return item.tilal_ref_id;
    if (typeof item.booking_number === 'string' && item.booking_number.startsWith('TLR')) return item.booking_number;
    const strId = String(item.id || item.booking_id || 1);
    const num = (parseInt(strId.replace(/\D/g, '') || '1') * 739 + (user?.id || 1) * 137 + 100000000) % 900000000 + 100000000;
    const s = String(num);
    return `TLR ${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6, 9)}`;
  };

  const handleLogout = async () => {
    await logout();
    router.push(`/${lang}`);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const fullPhone = phoneNumber ? `${phoneCode}${phoneNumber.replace(/^0+/, '')}` : user?.phone;
      const res = await updateProfile({
        name: fullName,
        phone: fullPhone,
        email: emailInput,
      });
      if (res?.success || res?.user) {
        toast.success(isRTL ? 'تم حفظ التغييرات بنجاح' : 'Profile changes saved successfully');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من إلغاء هذا الحجز؟' : 'Are you sure you want to cancel this booking?')) return;
    try {
      await bookingsAPI.cancel(bookingId);
      toast.success(isRTL ? 'تم إلغاء الحجز' : 'Booking cancelled');
      loadDashboardData();
    } catch (error) {
      toast.error(error?.message || 'Failed to cancel booking');
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
    accountDetails: isRTL ? 'بيانات الحساب' : 'Account Details',
    personalInfo: isRTL ? 'المعلومات الشخصية' : 'Personal Information',
    email: isRTL ? 'البريد الإلكتروني' : 'Email',
    verified: isRTL ? 'مؤكد' : 'Verified',
    mobileNumber: isRTL ? 'رقم الجوال' : 'Mobile number',
    code: isRTL ? 'الرمز' : 'Code',
    useThisNumberTo: isRTL ? 'استخدم هذا الرقم لـ:' : 'Use this number to:',
    useNote1: isRTL ? 'التعريف بحجزك بسهولة عند التواصل مع خدمة العملاء' : 'Easily identify your booking when contacting support',
    useNote2: isRTL ? 'التقديم على بطاقة BSF التلال الائتمانية وربط حساب الأعمال' : 'Apply for your BSF Tilal Credit Card and connect business accounts',
    firstName: isRTL ? 'الاسم الأول' : 'First name',
    lastName: isRTL ? 'اسم العائلة' : 'Last name',
    dob: isRTL ? 'تاريخ الميلاد' : 'Date of birth',
    gender: isRTL ? 'الجنس' : 'Gender',
    male: isRTL ? 'ذكر' : 'Male',
    female: isRTL ? 'أنثى' : 'Female',
    nationality: isRTL ? 'الجنسية' : 'Nationality',
    residence: isRTL ? 'بلد الإقامة' : 'Country of residence',
    familyStatus: isRTL ? 'الحالة الاجتماعية' : 'Family Status',
    single: isRTL ? 'أعزب' : 'Single',
    married: isRTL ? 'متزوج' : 'Married',
    saveChanges: isRTL ? 'حفظ التغييرات' : 'Save Changes',
    loading: isRTL ? 'جاري التحميل...' : 'Loading...',
    browseTrips: isRTL ? 'تصفح الرحلات' : 'Browse Trips',
    noBookings: isRTL ? 'لا توجد حجوزات رحلات سياحية بعد' : 'No tourism bookings yet',
    noFlightBookings: isRTL ? 'لا توجد حجوزات طيران بعد' : 'No flight bookings yet',
    noReservations: isRTL ? 'لا توجد طلبات حجز خاصة بعد' : 'No custom requests yet',
    noPayments: isRTL ? 'لا توجد مدفوعات' : 'No payment history',
    payNow: isRTL ? 'ادفع الآن' : 'Pay Now',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
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

  if (loading || !isAuthenticated) {
    return <div className="page-loading">{t.loading}</div>;
  }

  return (
    <div className="almosafer-dashboard-fullpage" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="dashboard-layout-grid">

        {/* LEFT COLUMN: ALMOSAFER SIDEBAR */}
        <aside className="dashboard-sidebar">

          {/* PROFILE HEADER BOX */}
          <div className="sidebar-profile-box">
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

            <button className="edit-profile-btn" onClick={() => setActiveTab('profile')}>
              {t.editProfile}
            </button>
          </div>


          {/* MY TRIPS QUICK LINK */}
          <div
            className={`sidebar-link-row ${activeTab === 'bookings' || activeTab === 'reservations' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <div className="link-left">
              <span className="icon">📅</span>
              <span className="text">{t.myTrips}</span>
            </div>
            <div className="link-right">
              <span className="count-badge">{bookings.length + reservations.length}</span>
              <span className="chevron">{isRTL ? '‹' : '›'}</span>
            </div>
          </div>

          {/* MY WALLET */}
          <div className="wallet-section">



          </div>

          {/* MY ACCOUNT NAVIGATION MENU */}
          <div className="account-section">
            <h3 className="section-heading">{t.myAccount}</h3>
            <div className="account-menu-list">

              <div className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                <div className="menu-item-left">
                  <span className="menu-icon">👤</span>
                  <span className="menu-text">{t.profile}</span>
                </div>
                <span className="chevron">{isRTL ? '‹' : '›'}</span>
              </div>

              <div className={`menu-item ${activeTab === 'travellers' ? 'active' : ''}`} onClick={() => setActiveTab('travellers')}>
                <div className="menu-item-left">
                  <span className="menu-icon">👥</span>
                  <span className="menu-text">{t.travellers}</span>
                </div>
                <span className="chevron">{isRTL ? '‹' : '›'}</span>
              </div>

              <div className={`menu-item ${activeTab === 'preferences' ? 'active' : ''}`} onClick={() => setActiveTab('preferences')}>
                <div className="menu-item-left">
                  <span className="menu-icon">⚙️</span>
                  <span className="menu-text">{t.travelPreferences}</span>
                </div>
                <div className="menu-item-right">
                  <span className="pill-badge">{t.addPreferences}</span>
                  <span className="chevron">{isRTL ? '‹' : '›'}</span>
                </div>
              </div>

              {/* <div className={`menu-item ${activeTab === 'loyalty' ? 'active' : ''}`} onClick={() => setActiveTab('loyalty')}>
                <div className="menu-item-left">
                  <span className="menu-icon">⭐</span>
                  <div className="loyalty-texts">
                    <span className="menu-text">{t.loyaltyPrograms}</span>
                    <span className="menu-subtext">{t.loyaltyDesc}</span>
                  </div>
                </div>
                <span className="chevron">{isRTL ? '‹' : '›'}</span>
              </div> */}

              {/* <div className={`menu-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
                <div className="menu-item-left">
                  <span className="menu-icon">💳</span>
                  <span className="menu-text">{t.paymentPreferences}</span>
                </div>
                <span className="chevron">{isRTL ? '‹' : '›'}</span>
              </div> */}

              {/* <div className={`menu-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                <div className="menu-item-left">
                  <span className="menu-icon">🔒</span>
                  <span className="menu-text">{t.security}</span>
                </div>
                <span className="chevron">{isRTL ? '‹' : '›'}</span>
              </div> */}

            </div>

            <div className="logout-row">
              <button className="logout-btn" onClick={handleLogout}>
                {t.logout}
              </button>
            </div>
          </div>

        </aside>

        {/* RIGHT COLUMN: MAIN CONTENT PANEL */}
        <main className="dashboard-main-content">

          {/* TOP TAB STRIP FOR FAST TOGGLING */}
          <div className="top-tab-strip">
            <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
              {t.profile}
            </button>
            <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
              {t.tourismBookings} ({bookings.length})
            </button>
            <button className={activeTab === 'travellers' ? 'active' : ''} onClick={() => setActiveTab('travellers')}>
              {t.flightBookings} ({bookings.filter(b => b.type === 'flight' || b.trip_type === 'flight' || b.booking_number?.startsWith('NDCEG')).length})
            </button>
            <button className={activeTab === 'reservations' ? 'active' : ''} onClick={() => setActiveTab('reservations')}>
              {t.customRequests} ({reservations.length})
            </button>
            <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>
              {t.paymentHistory} ({payments.length})
            </button>
          </div>

          {/* TAB 1: PROFILE FULL PAGE PANEL */}
          {activeTab === 'profile' && (
            <div className="content-panel-box">
              <h1 className="panel-main-title">{t.profile}</h1>

              {/* ACCOUNT DETAILS */}
              <section className="form-section-block">
                <h3 className="section-title">{t.accountDetails}</h3>

                <div className="input-field-group">
                  <div className="field-label-row">
                    <label>{t.email}</label>
                    {user?.email && !isDummyEmail(user.email) ? (
                      <span className="verified-badge">✓ {t.verified}</span>
                    ) : (
                      <span className="add-email-badge" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
                        {isRTL ? '+ أضف إيميلك' : '+ Add Email'}
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={isRTL ? 'أدخل بريدك الإلكتروني الشخصي (مثال: name@gmail.com)' : 'Enter your email address (e.g. name@example.com)'}
                    className="styled-input"
                  />
                  {isDummyEmail(user?.email) && (
                    <p style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: '4px', margin: '4px 0 0 0' }}>
                      {isRTL ? 'يرجى إدخال بريدك الإلكتروني الشخصي لاستلام التذاكر والتنبيهات.' : 'Please enter your personal email address to receive tickets and notifications.'}
                    </p>
                  )}
                </div>

                <div className="input-field-group">
                  <label>{t.mobileNumber}</label>
                  <div className="mobile-code-input-row">
                    <select
                      value={phoneCode}
                      onChange={(e) => setPhoneCode(e.target.value)}
                      className="styled-select code-select"
                    >
                      <option value="+966">{isRTL ? 'السعودية (+966)' : 'Saudi Arabia (+966)'}</option>
                      <option value="+971">{isRTL ? 'الإمارات (+971)' : 'UAE (+971)'}</option>
                      <option value="+965">{isRTL ? 'الكويت (+965)' : 'Kuwait (+965)'}</option>
                      <option value="+968">{isRTL ? 'عُمان (+968)' : 'Oman (+968)'}</option>
                      <option value="+974">{isRTL ? 'قطر (+974)' : 'Qatar (+974)'}</option>
                      <option value="+973">{isRTL ? 'البحرين (+973)' : 'Bahrain (+973)'}</option>
                      <option value="+962">{isRTL ? 'الأردن (+962)' : 'Jordan (+962)'}</option>
                      <option value="+20">{isRTL ? 'مصر (+20)' : 'Egypt (+20)'}</option>
                    </select>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="5X XXX XXXX"
                      className="styled-input flex-1"
                    />
                  </div>
                </div>

                <div className="input-field-group">
                  <label>{t.refIdLabel}</label>
                  <div className="ref-code-box-full" onClick={handleCopyRef}>
                    <span className="ref-text">{referenceId}</span>
                    <button className="copy-icon-btn">{copiedRef ? '✓' : '📋'}</button>
                  </div>
                  <div className="ref-bullet-notes">
                    <p>{t.useThisNumberTo}</p>
                    <ul>
                      <li>{t.useNote1}</li>
                      <li>{t.useNote2}</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* PERSONAL INFORMATION */}
              <section className="form-section-block">
                <h3 className="section-title">{t.personalInfo}</h3>

                <div className="title-pills-row">
                  <button
                    type="button"
                    className={`title-pill ${title === 'Mr' ? 'selected' : ''}`}
                    onClick={() => setTitle('Mr')}
                  >
                    {isRTL ? 'السيد' : 'Mr'}
                  </button>
                  <button
                    type="button"
                    className={`title-pill ${title === 'Ms' ? 'selected' : ''}`}
                    onClick={() => setTitle('Ms')}
                  >
                    {isRTL ? 'الآنسة' : 'Ms'}
                  </button>
                  <button
                    type="button"
                    className={`title-pill ${title === 'Mrs' ? 'selected' : ''}`}
                    onClick={() => setTitle('Mrs')}
                  >
                    {isRTL ? 'السيدة' : 'Mrs'}
                  </button>
                </div>

                <div className="input-field-group">
                  <label>{t.firstName}</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={isRTL ? 'الاسم الأول' : 'First name'}
                    className="styled-input"
                  />
                </div>

                <div className="input-field-group">
                  <label>{t.lastName}</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={isRTL ? 'اسم العائلة' : 'Last name'}
                    className="styled-input"
                  />
                </div>

                <div className="input-field-group">
                  <label>{t.dob}</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="styled-input"
                  />
                </div>

                <div className="input-field-group">
                  <label>{t.gender}</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="styled-select"
                  >
                    <option value="male">{t.male}</option>
                    <option value="female">{t.female}</option>
                  </select>
                </div>

                <div className="input-field-group">
                  <label>{t.nationality}</label>
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="styled-select"
                  >
                    <option value="Saudi Arabia">{isRTL ? 'المملكة العربية السعودية' : 'Saudi Arabia'}</option>
                    <option value="United Arab Emirates">{isRTL ? 'الإمارات العربية المتحدة' : 'United Arab Emirates'}</option>
                    <option value="Kuwait">{isRTL ? 'الكويت' : 'Kuwait'}</option>
                    <option value="Qatar">{isRTL ? 'قطر' : 'Qatar'}</option>
                    <option value="Bahrain">{isRTL ? 'البحرين' : 'Bahrain'}</option>
                    <option value="Oman">{isRTL ? 'عُمان' : 'Oman'}</option>
                    <option value="Jordan">{isRTL ? 'الأردن' : 'Jordan'}</option>
                    <option value="Egypt">{isRTL ? 'مصر' : 'Egypt'}</option>
                  </select>
                </div>

                <div className="input-field-group">
                  <label>{t.residence}</label>
                  <select
                    value={residence}
                    onChange={(e) => setResidence(e.target.value)}
                    className="styled-select"
                  >
                    <option value="Saudi Arabia">{isRTL ? 'المملكة العربية السعودية' : 'Saudi Arabia'}</option>
                    <option value="United Arab Emirates">{isRTL ? 'الإمارات العربية المتحدة' : 'United Arab Emirates'}</option>
                    <option value="Kuwait">{isRTL ? 'الكويت' : 'Kuwait'}</option>
                    <option value="Qatar">{isRTL ? 'قطر' : 'Qatar'}</option>
                    <option value="Oman">{isRTL ? 'عُمان' : 'Oman'}</option>
                  </select>
                </div>

                <div className="input-field-group">
                  <label>{t.familyStatus}</label>
                  <select
                    value={familyStatus}
                    onChange={(e) => setFamilyStatus(e.target.value)}
                    className="styled-select"
                  >
                    <option value="Single">{t.single}</option>
                    <option value="Married">{t.married}</option>
                  </select>
                </div>

                <div className="form-submit-row">
                  <button className="btn-primary-save" onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? t.loading : t.saveChanges}
                  </button>
                </div>
              </section>

            </div>
          )}

          {/* TAB 2: TOURISM BOOKINGS PANEL */}
          {activeTab === 'bookings' && (
            <div className="content-panel-box">
              <h1 className="panel-main-title">{t.tourismBookings}</h1>
              {isLoadingData ? (
                <div className="loading-state">{t.loading}</div>
              ) : bookings.length === 0 ? (
                <div className="empty-state-card">
                  <p>{t.noBookings}</p>
                  <Link href={`/${lang}`} className="btn-primary-action">
                    {t.browseTrips}
                  </Link>
                </div>
              ) : (
                <div className="grid-cards-container">
                  {bookings.map((b) => {
                    const itemRef = getTilalItemRef(b);
                    return (
                      <div key={b.id} className="full-data-card">
                        <div className="card-top-header">
                          <span className="ref-number"> #{b.booking_number || b.id}</span>
                          <span className={`status-badge ${b.status}`}>{formatStatus(b.status)}</span>
                        </div>

                        {/* TILAL REFERENCE ID BLOCK */}
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(28, 0, 82, 0.05) 0%, rgba(232, 93, 31, 0.05) 100%)',
                          border: '1px solid rgba(28, 0, 82, 0.15)',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          margin: '10px 0',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: '600' }}>
                              {isRTL ? 'رقم مرجع التلال:' : 'Tilal Reference ID:'}
                            </span>
                            <div
                              onClick={() => {
                                navigator.clipboard.writeText(itemRef);
                                toast.success(isRTL ? 'تم نسخ رقم مرجع التلال!' : 'Copied Tilal Reference ID!');
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#ffffff',
                                border: '1px solid #d1d5db',
                                padding: '3px 10px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                              }}
                            >
                              <span style={{ fontWeight: '800', color: 'var(--primary-color)', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                                {itemRef}
                              </span>
                              <span style={{ fontSize: '0.9rem' }}></span>
                            </div>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#4b5563' }}>
                            {isRTL
                              ? 'استخدم هذا الرقم لمتابعة حجزك بسهولة عند التواصل مع خدمة العملاء'
                              : 'Use this number to easily identify your booking when contacting support'}
                          </p>
                        </div>

                        <div className="card-details-grid">
                          <p><strong>{isRTL ? 'التاريخ:' : 'Date:'}</strong> {new Date(b.created_at || b.date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
                          <p><strong>{isRTL ? 'عدد الأشخاص:' : 'Guests:'}</strong> {b.guests || 1}</p>
                          <p><strong>{isRTL ? 'المبلغ:' : 'Amount:'}</strong> {formatCurrency(b.total_amount || b.price || 0, 'SAR', lang)}</p>
                          {b.details?.trip_title && <p><strong>{isRTL ? 'الرحلة:' : 'Trip:'}</strong> {b.details.trip_title}</p>}
                        </div>
                        {b.status === 'pending' && b.payment_status !== 'paid' && (
                          <div className="card-actions-bar">
                            <Link href={`/${lang}/payment?booking_id=${b.id}`} className="btn-pay">
                              {t.payNow}
                            </Link>
                            <button onClick={() => handleCancelBooking(b.id)} className="btn-cancel">
                              {t.cancel}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOM REQUESTS PANEL */}
          {activeTab === 'reservations' && (
            <div className="content-panel-box">
              <h1 className="panel-main-title">{t.customRequests}</h1>
              {isLoadingData ? (
                <div className="loading-state">{t.loading}</div>
              ) : reservations.length === 0 ? (
                <div className="empty-state-card">
                  <p>{t.noReservations}</p>
                  <Link href={`/${lang}`} className="btn-primary-action">
                    {t.browseTrips}
                  </Link>
                </div>
              ) : (
                <div className="grid-cards-container">
                  {reservations.map((r) => {
                    const itemRef = getTilalItemRef(r);
                    return (
                      <div key={r.id} className="full-data-card">
                        <div className="card-top-header">
                          <span className="ref-number"> #{r.id}</span>
                          <span className={`status-badge ${r.status}`}>{formatStatus(r.status)}</span>
                        </div>

                        {/* TILAL REFERENCE ID BLOCK */}
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(28, 0, 82, 0.05) 0%, rgba(232, 93, 31, 0.05) 100%)',
                          border: '1px solid rgba(28, 0, 82, 0.15)',
                          borderRadius: '10px',
                          padding: '10px 14px',
                          margin: '10px 0',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: '600' }}>
                              {isRTL ? 'رقم مرجع التلال:' : 'Tilal Reference ID:'}
                            </span>
                            <div
                              onClick={() => {
                                navigator.clipboard.writeText(itemRef);
                                toast.success(isRTL ? 'تم نسخ رقم مرجع التلال!' : 'Copied Tilal Reference ID!');
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#ffffff',
                                border: '1px solid #d1d5db',
                                padding: '3px 10px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                              }}
                            >
                              <span style={{ fontWeight: '800', color: 'var(--primary-color)', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                                {itemRef}
                              </span>
                              <span style={{ fontSize: '0.9rem' }}></span>
                            </div>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#4b5563' }}>
                            {isRTL
                              ? 'استخدم هذا الرقم لمتابعة حجزك بسهولة عند التواصل مع خدمة العملاء'
                              : 'Use this number to easily identify your booking when contacting support'}
                          </p>
                        </div>

                        <div className="card-details-grid">
                          <p><strong>{isRTL ? 'تاريخ الحجز:' : 'Date:'}</strong> {new Date(r.preferred_date || r.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
                          <p><strong>{isRTL ? 'عدد الأشخاص:' : 'Guests:'}</strong> {r.guests || 1}</p>
                          <p><strong>{isRTL ? 'نوع الرحلة:' : 'Trip Type:'}</strong> {r.trip_type || 'Custom Request'}</p>
                          {r.trip_title && <p><strong>{isRTL ? 'اسم الرحلة:' : 'Trip:'}</strong> {r.trip_title}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PAYMENT HISTORY PANEL */}
          {activeTab === 'payments' && (
            <div className="content-panel-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <h1 className="panel-main-title" style={{ margin: 0 }}>{t.paymentHistory}</h1>

                {/* SUB-TABS FILTER FOR PAYMENT HISTORY */}
                <div style={{ display: 'flex', gap: '6px', background: '#f3f4f6', padding: '4px', borderRadius: '12px' }}>
                  <button
                    onClick={() => setPaymentFilter('paid')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      background: paymentFilter === 'paid' ? '#16a34a' : 'transparent',
                      color: paymentFilter === 'paid' ? '#ffffff' : '#4b5563',
                    }}
                  >
                    {isRTL ? 'العمليات الناجحة (مدفوع)' : 'Successful (Paid)'}
                  </button>
                  <button
                    onClick={() => setPaymentFilter('unpaid')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      background: paymentFilter === 'unpaid' ? '#eab308' : 'transparent',
                      color: paymentFilter === 'unpaid' ? '#ffffff' : '#4b5563',
                    }}
                  >
                    {isRTL ? 'غير مدفوع / معلق' : 'Unpaid / Pending'}
                  </button>
                  <button
                    onClick={() => setPaymentFilter('failed')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      background: paymentFilter === 'failed' ? '#ef4444' : 'transparent',
                      color: paymentFilter === 'failed' ? '#ffffff' : '#4b5563',
                    }}
                  >
                    {isRTL ? 'فاشلة' : 'Failed'}
                  </button>
                  <button
                    onClick={() => setPaymentFilter('all')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      border: 'none',
                      cursor: 'pointer',
                      background: paymentFilter === 'all' ? '#00b4d8' : 'transparent',
                      color: paymentFilter === 'all' ? '#ffffff' : '#4b5563',
                    }}
                  >
                    {isRTL ? 'الكل' : 'All'}
                  </button>
                </div>
              </div>

              {isLoadingData ? (
                <div className="loading-state">{t.loading}</div>
              ) : (() => {
                const filteredPayments = payments.filter((p) => {
                  const s = (p.payment_status || p.status || '').toLowerCase();
                  if (paymentFilter === 'paid') return ['paid', 'captured', 'completed', 'confirmed'].includes(s);
                  if (paymentFilter === 'unpaid') return ['unpaid', 'pending', 'initiated'].includes(s);
                  if (paymentFilter === 'failed') return ['failed', 'declined', 'cancelled'].includes(s);
                  return true;
                });

                if (filteredPayments.length === 0) {
                  return (
                    <div className="empty-state-card">
                      <p>{isRTL ? 'لا توجد عمليات دفع مطابقة في هذا الفلتر' : 'No payments found for this filter.'}</p>
                    </div>
                  );
                }

                return (
                  <div className="table-responsive-box">
                    <table className="full-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>{isRTL ? 'رقم مرجع التلال' : 'Tilal Ref ID'}</th>
                          <th>{isRTL ? 'رقم الحجز' : 'Booking Ref'}</th>
                          <th>{isRTL ? 'المبلغ' : 'Amount'}</th>
                          <th>{isRTL ? 'حالة الدفع' : 'Status'}</th>
                          <th>{isRTL ? 'التاريخ' : 'Date'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map((p) => {
                          const s = (p.payment_status || p.status || '').toLowerCase();
                          const isPaid = ['paid', 'captured', 'completed', 'confirmed'].includes(s);
                          const isFailed = ['failed', 'declined', 'cancelled'].includes(s);
                          const badgeBg = isPaid ? '#e6f4ea' : isFailed ? '#fce8e6' : '#feefc3';
                          const badgeColor = isPaid ? '#137333' : isFailed ? '#c5221f' : '#b06000';
                          const itemRef = getTilalItemRef(p);

                          return (
                            <tr key={p.id}>
                              <td>#{p.id}</td>
                              <td>
                                <span
                                  onClick={() => {
                                    navigator.clipboard.writeText(itemRef);
                                    toast.success(isRTL ? 'تم نسخ رقم مرجع التلال!' : 'Copied Tilal Ref!');
                                  }}
                                  style={{
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    color: 'var(--primary-color)',
                                    fontSize: '0.82rem',
                                  }}
                                  title="Click to copy"
                                >
                                  {itemRef}
                                </span>
                              </td>
                              <td>#{p.booking_id || p.booking_number || 'N/A'}</td>
                              <td>{p.total_amount || p.amount || 0} SAR</td>
                              <td>
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '0.78rem',
                                  fontWeight: '700',
                                  backgroundColor: badgeBg,
                                  color: badgeColor,
                                  textTransform: 'uppercase',
                                }}>
                                  {formatStatus(p.payment_status || p.status)}
                                </span>
                              </td>
                              <td>{new Date(p.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 5: FLIGHT BOOKINGS & OTHER PANELS */}
          {activeTab === 'travellers' && (
            <div className="content-panel-box">
              <h1 className="panel-main-title">{t.flightBookings}</h1>
              {isLoadingData ? (
                <div className="loading-state">{t.loading}</div>
              ) : (() => {
                const flightBookingsList = bookings.filter((b) => b.type === 'flight' || b.trip_type === 'flight' || b.booking_number?.startsWith('NDCEG') || b.details?.airline);
                if (flightBookingsList.length === 0) {
                  return (
                    <div className="empty-state-card">
                      <p>{t.noFlightBookings}</p>
                      <Link href={`/${lang}/akbar-flights`} className="btn-primary-action">
                        {isRTL ? 'حجز رحلة طيران جديدة' : 'Book a New Flight'}
                      </Link>
                    </div>
                  );
                }

                return (
                  <div className="grid-cards-container">
                    {flightBookingsList.map((f) => {
                      const itemRef = getTilalItemRef(f);
                      return (
                        <div key={f.id} className="full-data-card">
                          <div className="card-top-header">
                            <span className="ref-number"> #{f.booking_number || f.id}</span>
                            <span className={`status-badge ${f.status}`}>{formatStatus(f.status)}</span>
                          </div>

                          {/* TILAL REFERENCE ID BLOCK */}
                          <div style={{
                            background: 'linear-gradient(135deg, rgba(28, 0, 82, 0.05) 0%, rgba(232, 93, 31, 0.05) 100%)',
                            border: '1px solid rgba(28, 0, 82, 0.15)',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            margin: '10px 0',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: '600' }}>
                                {isRTL ? 'رقم مرجع التلال:' : 'Tilal Reference ID:'}
                              </span>
                              <div
                                onClick={() => {
                                  navigator.clipboard.writeText(itemRef);
                                  toast.success(isRTL ? 'تم نسخ رقم مرجع التلال!' : 'Copied Tilal Reference ID!');
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  background: '#ffffff',
                                  border: '1px solid #d1d5db',
                                  padding: '3px 10px',
                                  borderRadius: '12px',
                                  cursor: 'pointer',
                                }}
                              >
                                <span style={{ fontWeight: '800', color: 'var(--primary-color)', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                                  {itemRef}
                                </span>
                                <span style={{ fontSize: '0.9rem' }}></span>
                              </div>
                            </div>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.72rem', color: '#4b5563' }}>
                              {isRTL
                                ? 'استخدم هذا الرقم لمتابعة حجزك بسهولة عند التواصل مع خدمة العملاء'
                                : 'Use this number to easily identify your booking when contacting support'}
                            </p>
                          </div>

                          <div className="card-details-grid">
                            <p><strong>{isRTL ? 'تاريخ الحجز:' : 'Date:'}</strong> {new Date(f.created_at || f.date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
                            <p><strong>{isRTL ? 'الخطوط الجوية:' : 'Airline:'}</strong> {f.details?.airline || 'Saudi Airlines'}</p>
                            <p><strong>{isRTL ? 'المبلغ:' : 'Amount:'}</strong> {formatCurrency(f.total_amount || f.price || 0, 'SAR', lang)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {(activeTab === 'preferences' || activeTab === 'loyalty' || activeTab === 'security') && (
            <div className="content-panel-box">
              <h1 className="panel-main-title">
                {activeTab === 'preferences' && t.travelPreferences}
                {activeTab === 'loyalty' && t.loyaltyPrograms}
                {activeTab === 'security' && t.security}
              </h1>
              <div className="empty-state-card">
                <p>{isRTL ? 'إدارة الإعدادات والتفضيلات متاحة فوراً' : 'Manage your saved preferences and account security.'}</p>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* WALLET MODAL */}
      {showWalletModal && (
        <div className="modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.myWallet}</h3>
              <button className="close-modal-btn" onClick={() => setShowWalletModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>{isRTL ? 'رصيد المحفظة الحالي:' : 'Current Balance:'} <strong>{walletPoints} {t.pointsCount}</strong></p>
              <input
                type="text"
                placeholder={isRTL ? 'أدخل الرمز أو البريد' : 'Enter Code or Email'}
                className="styled-input w-full"
                style={{ marginTop: '1rem' }}
              />
              <button
                className="btn-primary-save w-full"
                style={{ marginTop: '1.5rem', width: '100%' }}
                onClick={() => { toast.success(isRTL ? 'تمت العملية' : 'Action completed'); setShowWalletModal(false); }}
              >
                {isRTL ? 'تأكيد' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .almosafer-dashboard-fullpage {
          min-height: 100vh;
          background-color: #f7f9fb;
          padding-top: 120px;
          padding-bottom: 60px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .dashboard-layout-grid {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          align-items: start;
          width: 100%;
          box-sizing: border-box;
        }

        /* SIDEBAR STYLING */
        .dashboard-sidebar {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 2px 16px rgba(0, 0, 0, 0.05);
          border: 1px solid #eef1f4;
          width: 100%;
          box-sizing: border-box;
        }

        .sidebar-profile-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f3f6;
          width: 100%;
          box-sizing: border-box;
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
          font-size: 0.88rem;
          color: #4b5563;
          margin: 0 0 12px 0;
          word-break: break-all;
          overflow-wrap: anywhere;
          max-width: 100%;
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
          max-width: 180px;
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

        /* LINK ROW */
        .sidebar-link-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid #f0f3f6;
          cursor: pointer;
          margin-top: 10px;
        }

        .link-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .text {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1f2937;
        }

        .count-badge {
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
        .section-heading {
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
          margin: 20px 0 10px 0;
        }

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

        .mokafaa-promo-card {
          margin-top: 12px;
          background: #e0f2fe;
          border-radius: 12px;
          padding: 14px;
        }

        .mokafaa-badge {
          background: #0284c7;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 6px;
        }

        .mokafaa-promo-card h4 {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0369a1;
          margin: 0 0 4px 0;
        }

        .mokafaa-promo-card p {
          font-size: 0.72rem;
          color: #0284c7;
          margin: 0 0 10px 0;
          line-height: 1.3;
        }

        .btn-link-mokafaa {
          background: none;
          border: none;
          color: #0284c7;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
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

        .menu-item.active {
          background-color: #f0fdfa;
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
          background-color: #e0f2fe;
          color: #0284c7;
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

        /* MAIN CONTENT PANEL */
        .dashboard-main-content {
          background: #ffffff;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 2px 16px rgba(0, 0, 0, 0.05);
          border: 1px solid #eef1f4;
          min-height: 600px;
        }

        .top-tab-strip {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 12px;
          margin-bottom: 24px;
          overflow-x: auto;
        }

        .top-tab-strip button {
          background: #f3f4f6;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #4b5563;
          cursor: pointer;
          white-space: nowrap;
        }

        .top-tab-strip button.active {
          background: var(--primary-color);
          color: #ffffff;
        }

        .panel-main-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin-top: 0;
          margin-bottom: 24px;
        }

        /* FORM SECTION BLOCKS */
        .form-section-block {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #f0f3f6;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 16px;
        }

        .input-field-group {
          margin-bottom: 20px;
          max-width: 480px;
        }

        .field-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .input-field-group label {
          font-size: 0.88rem;
          font-weight: 600;
          color: #374151;
          display: block;
          margin-bottom: 6px;
        }

        .verified-badge {
          background-color: #e6f4ea;
          color: #137333;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .styled-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .styled-input:focus {
          border-color: var(--primary-color);
        }

        .styled-select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.95rem;
          background: #fff;
          outline: none;
        }

        .mobile-code-input-row {
          display: flex;
          gap: 10px;
        }

        .code-select {
          width: 195px;
          min-width: 195px;
          font-weight: 600;
        }

        .flex-1 {
          flex: 1;
        }

        .ref-code-box-full {
          background: #f3f4f6;
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .ref-text {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #1f2937;
        }

        .copy-icon-btn {
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
        }

        .ref-bullet-notes {
          font-size: 0.78rem;
          color: #6b7280;
          margin-top: 8px;
        }

        .ref-bullet-notes p {
          margin: 0 0 4px 0;
          font-weight: 600;
        }

        .ref-bullet-notes ul {
          margin: 0;
          padding-inline-start: 16px;
        }

        .title-pills-row {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .title-pill {
          min-width: 72px;
          padding: 8px 18px;
          border-radius: 20px;
          border: 1px solid #d1d5db;
          background: #ffffff;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .title-pill.selected {
          border-color: var(--primary-color);
          color: #ffffff;
          background: var(--primary-color);
          box-shadow: 0 2px 8px rgba(28, 0, 82, 0.2);
        }

        .btn-primary-save {
          background-color: var(--accent-color);
          color: #ffffff;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
          width: 100%;
          max-width: 240px;
        }
        .btn-primary-save:hover {
          background-color: var(--accent-hover-color);
        }

        .form-submit-row {
          margin-top: 24px;
        }

        /* GRID CARDS & TABLES */
        .empty-state-card {
          text-align: center;
          padding: 50px 20px;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px dashed #d1d5db;
        }

        .btn-primary-action {
          display: inline-block;
          background: var(--accent-yellow);
          color: #000;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
        }

        .grid-cards-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .full-data-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          background: #ffffff;
        }

        .card-top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ref-number {
          font-weight: 700;
          color: var(--primary-color);
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.78rem;
          font-weight: 700;
          background: #e8f0fe;
          color: #1a73e8;
        }

        .card-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }

        .card-details-grid p {
          margin: 0;
          font-size: 0.88rem;
          color: #374151;
        }

        .card-actions-bar {
          display: flex;
          gap: 10px;
          margin-top: 14px;
        }

        .btn-pay {
          background: #16a34a;
          color: #fff;
          padding: 8px 16px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 700;
        }

        .btn-cancel {
          background: #ef4444;
          color: #fff;
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          font-weight: 700;
          cursor: pointer;
        }

        .table-responsive-box {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .full-table {
          width: 100%;
          min-width: 600px;
          border-collapse: collapse;
        }

        .full-table th, .full-table td {
          padding: 14px;
          border-bottom: 1px solid #e5e7eb;
          text-align: start;
        }

        .full-table th {
          background: #f9fafb;
          font-weight: 700;
        }

        .page-loading {
          text-align: center;
          padding: 80px;
          font-size: 1.1rem;
          color: #6b7280;
        }

        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 16px;
        }

        .modal-content-box {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          max-width: 400px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* MEDIA QUERIES FOR TABLET & MOBILE */
        @media (max-width: 992px) {
          .almosafer-dashboard-fullpage {
            padding-top: 90px;
            padding-bottom: 40px;
          }
          .dashboard-layout-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 0 12px;
            width: 100%;
            box-sizing: border-box;
          }
          .dashboard-sidebar {
            width: 100%;
            box-sizing: border-box;
            padding: 14px;
          }
          .dashboard-sidebar .account-section,
          .dashboard-sidebar .wallet-section,
          .dashboard-sidebar .promo-banner-card {
            display: none;
          }
          .dashboard-main-content {
            width: 100%;
            box-sizing: border-box;
            padding: 16px 12px;
            border-radius: 12px;
          }
          .input-field-group {
            max-width: 100%;
          }
          .top-tab-strip {
            gap: 6px;
            padding-bottom: 8px;
            margin-bottom: 16px;
          }
          .top-tab-strip button {
            padding: 8px 14px;
            font-size: 0.82rem;
          }
        }

        @media (max-width: 480px) {
          .almosafer-dashboard-fullpage {
            padding-top: 110px;
          }
          .dashboard-layout-grid {
            padding: 0 8px;
          }
          .dashboard-main-content {
            padding: 14px 10px;
          }
          .mobile-code-input-row {
            flex-direction: column;
            gap: 8px;
          }
          .code-select {
            width: 100%;
          }
          .btn-primary-save {
            max-width: 100%;
          }
        }
          .top-tab-strip button {
            padding: 8px 14px;
            font-size: 0.8rem;
          }
        }

        .close-modal-btn {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
