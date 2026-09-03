'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import akbarApi from '@/lib/akbarApi';

const content = {
  en: {
    badgeDirect: "akbar Direct API v2.0",
    badgeActive: "● Production Engine Active",
    portalTitle: "Wonder Travel akbar Flight Booking Portal",
    portalSubtitle: "Direct Airline Integration • Instant E-Ticketing • 24h Reservation Hold Engine",
    agencyWallet: "💳 Agency Wallet",
    developerLogs: "🔍 Developer API Logs",
    resetFlow: "🔄 Reset Flow",
    walletBalance: "💰 Agency Wallet:",
    topupBalance: "⚡ Credit Limit Topup:",
    accountStatus: "Account Status:",
    activeVerified: "ACTIVE & VERIFIED",
    blocked: "BLOCKED",
    step1Title: "1. Flight Search",
    step1Desc: "Origins & Passenger Counts",
    step2Title: "2. Select Offer",
    step2Desc: "Fare Revalidation & Class",
    step3Title: "3. Passenger Data",
    step3Desc: "Passports & Contact Details",
    step4Title: "4. Hold or Issue",
    step4Desc: "Instant Book vs 24h Hold",
    step5Title: "5. E-Tickets & PNR",
    step5Desc: "PNR Confirmation & Status",

    // Step 1
    s1Header: "Step 1: Search Available akbar Flights",
    s1Presets: "Quick Test Presets:",
    presetCaiRuh: "CAI ➔ RUH (Cairo to Riyadh)",
    presetCaiDxb: "CAI ➔ DXB (Cairo to Dubai)",
    presetFamily: "Family (2 ADT + 1 CHD)",
    originLabel: "Origin Airport Code (IATA)",
    destLabel: "Destination Airport Code (IATA)",
    depDateLabel: "Departure Date",
    adultsLabel: "Adults (12+ yrs)",
    childrenLabel: "Children (2-11 yrs)",
    infantsLabel: "Infants (<2 yrs)",
    cabinLabel: "Cabin Class",
    economyClass: "Economy Class",
    businessClass: "Business Class",
    firstClass: "First Class",
    searchBtn: "✈️ Search Available Flights",
    searchingBtn: "🔍 Fetching Real-time akbar Offers...",

    // Step 2
    s2Header: "Step 2: Select Flight Offer & Revalidate Fare",
    offersFound: "Offers Found",
    noOffers: "No flight offers currently loaded.",
    goToSearch: "Go to Flight Search",
    holdAllowed: "Hold Allowed:",
    includedLuggage: "Included Luggage:",
    checkedBaggage: "Checked Baggage",
    standardLuggage: "Standard",
    taxesIncluded: "Taxes & Fees Included",
    selectConfirmFare: "Select & Confirm Fare ➔",
    revalidating: "Revalidating...",

    // Step 3
    s3Header: "Step 3: Passenger Information & Documentation",
    paxDetails: "Passenger",
    titleLabel: "Title",
    titleMr: "MR",
    titleMrs: "MRS",
    titleMs: "MS",
    firstNameLabel: "First Name",
    lastNameLabel: "Last Name",
    passportNoLabel: "Passport Number",
    passportExpiryLabel: "Passport Expiry Date",
    emailLabel: "Email Address",
    submitPax: "Submit Passenger Details ➔",
    submittingPax: "Attaching Passenger Payload...",

    // Step 4
    s4Header: "Step 4: Finalize Booking Method",
    orderRef: "Order Reference:",
    optionA: "OPTION A",
    holdTitle: "Hold Booking (24h Price Lock)",
    holdDesc: "Reserve flight seat temporarily with Wonder Travel akbar without immediate payment capture. Ensures price stability.",
    holdBtn: " Place Booking On Hold",
    holdingBtn: "Processing Hold Request...",
    optionB: "OPTION B",
    bookTitle: "Instant Book & Issue E-Tickets",
    bookDesc: "Finalize purchase directly, debit agency balance, and issue passenger e-tickets immediately.",
    bookBtn: "💳 Book & Issue E-Tickets",
    bookingBtn: "Issuing E-Tickets...",

    // Step 5
    s5Header: "Step 5: Reservation & PNR Confirmation Status",
    bookingStatusLabel: "Booking Status:",
    airlinePnrLabel: "Airline PNR:",
    akbarRefLabel: "akbar Reference:",
    holdExpLabel: "Hold Expiration:",
    issuedEtickets: "Issued E-Ticket Numbers:",
    retrieveLivePnr: "🔍 Retrieve Live PNR Status",
    payAfterHold: "💳 Pay & Issue E-Tickets (BookAfterHold)",

    // Fault Simulation & Diagnostics
    faultHeader: "⚠️ Supplier Fault Injection & Error Resilience Suite",
    faultDesc: "Simulate realistic airline/akbar API failures to test system fallback & recovery handling.",
    sim409: "409 Offer Expired",
    sim429: "429 Rate Limit",
    sim500: "500 Supplier Down",
    sim504: "504 Gateway Timeout",
    simDupWebhook: "Duplicate Webhook",
    logsHeader: "🔍 Live API Correlation Log",
    clearLogs: "Clear Logs",
    noLogs: "No API requests logged yet. Execute actions on the left to view payload JSON."
  },
  ar: {
    badgeDirect: "واجهة akbar المباشرة v2.0",
    badgeActive: "● المحرك الإنتاجي نشط",
    portalTitle: "بوابة وندر ترافيل لحجوزات الطيران akbar",
    portalSubtitle: "ربط مباشر مع شركات الطيران • إصدار فوري للتذاكر الإلكترونية • خيار تثبيت الحجز لمدة 24 ساعة",
    agencyWallet: "💳 محفظة الوكالة",
    developerLogs: "🔍 سجلات API للمطورين",
    resetFlow: "🔄 إعادة ضبط العملية",
    walletBalance: "💰 رصيد محفظة الوكالة:",
    topupBalance: "⚡ رصيد الحد الائتماني:",
    accountStatus: "حالة الحساب:",
    activeVerified: "نشط ومفعل",
    blocked: "موقوف",
    step1Title: "1. بحث عن رحلة",
    step1Desc: "وجهات السفر وعدد المسافرين",
    step2Title: "2. اختيار العرض",
    step2Desc: "تأكيد السعر والدرجة",
    step3Title: "3. بيانات المسافرين",
    step3Desc: "جوازات السفر ومعلومات التواصل",
    step4Title: "4. التثبيت أو الإصدار",
    step4Desc: "حجز معلق أو إصدار فوري",
    step5Title: "5. التذاكر و PNR",
    step5Desc: "حالة الحجز وتأكيد PNR",

    // Step 1
    s1Header: "الخطوة 1: البحث عن الرحلات المتاحة عبر akbar",
    s1Presets: "نماذج اختبار سريعة:",
    presetCaiRuh: "القاهرة ➔ الرياض (CAI ➔ RUH)",
    presetCaiDxb: "القاهرة ➔ دبي (CAI ➔ DXB)",
    presetFamily: "عائلة (بالغين 2 + طفل 1)",
    originLabel: "رمز مطار المغادرة (IATA)",
    destLabel: "رمز مطار الوصول (IATA)",
    depDateLabel: "تاريخ المغادرة",
    adultsLabel: "بالغون (12+ سنة)",
    childrenLabel: "أطفال (2-11 سنة)",
    infantsLabel: "رضع (أقل من سنتين)",
    cabinLabel: "درجة السفر",
    economyClass: "الدرجة السياحية",
    businessClass: "درجة رجال الأعمال",
    firstClass: "الدرجة الأولى",
    searchBtn: "✈️ البحث عن الرحلات المتاحة",
    searchingBtn: "🔍 جاري البحث في عروض akbar المباشرة...",

    // Step 2
    s2Header: "الخطوة 2: اختيار عرض الطيران وتأكيد السعر",
    offersFound: "عروض متاحة",
    noOffers: "لا توجد عروض رحلات محملة حالياً.",
    goToSearch: "الذهاب إلى البحث عن رحلة",
    holdAllowed: "إمكانية التثبيت:",
    includedLuggage: "الأمتعة المشمولة:",
    checkedBaggage: "حقائب مسجلة",
    standardLuggage: "قياسي",
    taxesIncluded: "شامل الضرائب والرسوم",
    selectConfirmFare: "اختيار وتأكيد السعر ➔",
    revalidating: "جاري التحقق من السعر...",

    // Step 3
    s3Header: "الخطوة 3: بيانات وثائق المسافرين",
    paxDetails: "المسافر",
    titleLabel: "اللقب",
    titleMr: "السيد (MR)",
    titleMrs: "السيدة (MRS)",
    titleMs: "الآنسة (MS)",
    firstNameLabel: "الاسم الأول",
    lastNameLabel: "اسم العائلة",
    passportNoLabel: "رقم جواز السفر",
    passportExpiryLabel: "تاريخ انتهاء الجواز",
    emailLabel: "البريد الإلكتروني",
    submitPax: "إرسال بيانات المسافرين ➔",
    submittingPax: "جاري إرفاق بيانات المسافرين...",

    // Step 4
    s4Header: "الخطوة 4: تحديد طريقة تأكيد الحجز",
    orderRef: "مرجع الطلب:",
    optionA: "الخيار أ",
    holdTitle: "تثبيت الحجز (ضمان السعر 24 ساعة)",
    holdDesc: "حجز مقعد الرحلة مؤقتاً عبر akbar بدون دفع فوري مع ضمان عدم تغير السعر.",
    holdBtn: "تثبيت الحجز على الانتظار",
    holdingBtn: "جاري تنفيذ طلب التثبيت...",
    optionB: "الخيار ب",
    bookTitle: "الحجز الفوري وإصدار التذاكر",
    bookDesc: "إتمام الشراء مباشرة والخصم من محفظة الوكالة وإصدار التذاكر الإلكترونية للمسافرين فوراً.",
    bookBtn: "💳 الدفع وإصدار التذاكر فوراً",
    bookingBtn: "جاري إصدار التذاكر الإلكترونية...",

    // Step 5
    s5Header: "الخطوة 5: حالة الحجز وتأكيد PNR",
    bookingStatusLabel: "حالة الحجز:",
    airlinePnrLabel: "رمز PNR لدى شركة الطيران:",
    akbarRefLabel: "مرجع akbar:",
    holdExpLabel: "تاريخ انتهاء التثبيت:",
    issuedEtickets: "أرقام التذاكر الإلكترونية المصدرة:",
    retrieveLivePnr: "🔍 استعلام عن حالة PNR المباشرة",
    payAfterHold: "💳 الدفع وإصدار التذاكر (BookAfterHold)",

    // Fault Simulation & Diagnostics
    faultHeader: "⚠️ محاكاة أعطال المورد واختبار مرونة النظام",
    faultDesc: "اختبار سيناريوهات انقطاع أو استجابة خطأ من شركات الطيران لضمان استقرار النظام.",
    sim409: "409 انتهاء صلاحية العرض",
    sim429: "429 تجاوز حد الطلبات",
    sim500: "500 توقف المورد",
    sim504: "504 مهلة الانتظار",
    simDupWebhook: "تكرار الويب هوك",
    logsHeader: "🔍 سجل استجابات وطلبات API الحية",
    clearLogs: "مسح السجلات",
    noLogs: "لا توجد سجلات API حالياً. قم ببدء عملية للحصول على بيانات JSON الحية."
  }
};

export default function akbarTestSuitePage() {
  const params = useParams();
  const lang = params?.lang || 'en';
  const isRTL = lang === 'ar';
  const t = content[lang] || content.en;

  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);

  // Active session tracking state
  const [session, setSession] = useState({
    searchId: null,
    offers: [],
    selectedOffer: null,
    orderId: null,
    orderReference: null,
    updatedOfferId: null,
    airlinePnr: null,
    gdsPnr: null,
    akbarBookingReference: null,
    holdExpirationDate: null,
    bookingStatus: 'IDLE',
    ticketNumbers: [],
    balanceInfo: null
  });

  // Search Form State
  const [searchForm, setSearchForm] = useState({
    origin: 'CAI',
    destination: 'RUH',
    departureDate: '2026-10-15',
    adtCount: 1,
    chdCount: 0,
    infCount: 0,
    cabinClass: 'ECONOMY',
    directOnly: false
  });

  // Passengers Form State
  const [passengersForm, setPassengersForm] = useState([
    {
      type: 'ADT',
      title: 'MR',
      first_name: 'Ahmed',
      last_name: 'Nabil',
      gender: 'male',
      birth_date: '1992-06-15',
      nationality: 'EG',
      passport_number: 'A98765432',
      passport_expiry: '2030-05-20',
      email: 'ahmed.nabil@example.com',
      phone_number: '1001234567',
      phone_country_code: '+20'
    }
  ]);

  const appendLog = (endpoint, method, status, requestPayload, responseData) => {
    setLogs(prev => [
      {
        id: Date.now() + Math.random(),
        time: new Date().toLocaleTimeString(),
        endpoint,
        method,
        status,
        requestPayload,
        responseData
      },
      ...prev
    ]);
  };

  const handleSearch = async () => {
    setLoading(true);
    const payload = {
      origin: searchForm.origin,
      destination: searchForm.destination,
      departure_date: searchForm.departureDate,
      passengers: {
        ADT: parseInt(searchForm.adtCount) || 1,
        CHD: parseInt(searchForm.chdCount) || 0,
        INF: parseInt(searchForm.infCount) || 0
      },
      cabin_class: searchForm.cabinClass,
      direct_only: searchForm.directOnly
    };

    const res = await akbarApi.search(payload);
    appendLog('/v2/akbar/search', 'POST', res.status, payload, res.data);
    setLoading(false);

    if (res.ok && res.data?.offers) {
      setSession(prev => ({
        ...prev,
        searchId: res.data.search_id,
        offers: res.data.offers,
        bookingStatus: 'OFFERS_RECEIVED'
      }));
      setActiveStep(2);
    }
  };

  const handleFareConfirm = async (offer) => {
    setLoading(true);
    const res = await akbarApi.fareConfirm(session.searchId, offer.supplier_offer_id);
    appendLog('/v2/akbar/fare-confirm', 'POST', { search_id: session.searchId, supplier_offer_id: offer.supplier_offer_id }, res.data);
    setLoading(false);

    if (res.ok && res.data?.order_id) {
      setSession(prev => ({
        ...prev,
        selectedOffer: offer,
        orderId: res.data.order_id,
        orderReference: res.data.order_reference,
        updatedOfferId: res.data.latest_offer_id,
        bookingStatus: 'FARE_CONFIRMED'
      }));
      setActiveStep(3);
    }
  };

  const handleAddPassengers = async () => {
    setLoading(true);
    const res = await akbarApi.addPassengers(session.orderId, passengersForm);
    appendLog('/v2/akbar/add-passengers', 'POST', { order_id: session.orderId, passengers: passengersForm }, res.data);
    setLoading(false);

    if (res.ok) {
      setSession(prev => ({
        ...prev,
        updatedOfferId: res.data.updated_offer_id,
        bookingStatus: 'PASSENGERS_ADDED'
      }));
      setActiveStep(4);
    }
  };

  const handleHold = async () => {
    setLoading(true);
    const res = await akbarApi.hold(session.orderId);
    appendLog('/v2/akbar/hold', 'POST', { order_id: session.orderId }, res.data);
    setLoading(false);

    if (res.ok && res.data) {
      setSession(prev => ({
        ...prev,
        airlinePnr: res.data.airline_pnr,
        gdsPnr: res.data.gds_pnr,
        akbarBookingReference: res.data.akbar_booking_reference,
        holdExpirationDate: res.data.hold_expiration_date,
        bookingStatus: 'ON_HOLD'
      }));
      setActiveStep(5);
    }
  };

  const handleBookAndPay = async () => {
    setLoading(true);
    const res = await akbarApi.bookAndPay(session.orderId);
    appendLog('/v2/akbar/book-and-pay', 'POST', { order_id: session.orderId }, res.data);
    setLoading(false);

    if (res.ok && res.data) {
      setSession(prev => ({
        ...prev,
        airlinePnr: res.data.airline_pnr,
        akbarBookingReference: res.data.akbar_booking_reference,
        ticketNumbers: res.data.ticket_numbers || [],
        bookingStatus: 'TICKETED'
      }));
      setActiveStep(5);
    }
  };

  const handleBookAfterHold = async () => {
    setLoading(true);
    const res = await akbarApi.bookAfterHold(session.orderId);
    appendLog('/v2/akbar/book-after-hold', 'POST', { order_id: session.orderId }, res.data);
    setLoading(false);

    if (res.ok && res.data) {
      setSession(prev => ({
        ...prev,
        ticketNumbers: res.data.ticket_numbers || [],
        bookingStatus: 'TICKETED'
      }));
    }
  };

  const handleRetrieve = async () => {
    if (!session.orderId) return;
    setLoading(true);
    const res = await akbarApi.retrieve(session.orderId);
    appendLog(`/v2/akbar/retrieve/${session.orderId}`, 'GET', null, res.data);
    setLoading(false);
  };

  const handleCheckBalance = async () => {
    setLoading(true);
    const res = await akbarApi.getAgencyBalance();
    appendLog('/v2/akbar/agency-balance', 'GET', null, res.data);
    setLoading(false);

    if (res.ok) {
      setSession(prev => ({
        ...prev,
        balanceInfo: res.data
      }));
    }
  };

  const handleSimulate = async (scenario) => {
    setLoading(true);
    const res = await akbarApi.simulateFault(scenario);
    appendLog(`/v2/akbar/mock-simulate?scenario=${scenario}`, 'POST', { scenario }, res.data);
    setLoading(false);
  };

  const resetAll = () => {
    setSession({
      searchId: null,
      offers: [],
      selectedOffer: null,
      orderId: null,
      orderReference: null,
      updatedOfferId: null,
      airlinePnr: null,
      gdsPnr: null,
      akbarBookingReference: null,
      holdExpirationDate: null,
      bookingStatus: 'IDLE',
      ticketNumbers: [],
      balanceInfo: null
    });
    setActiveStep(1);
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        minHeight: '100vh',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
        paddingTop: '130px',
        paddingBottom: '90px',
        paddingLeft: '24px',
        paddingRight: '24px',
        position: 'relative'
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>

        {/* Executive Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '16px',
          padding: '24px 32px',
          marginBottom: '28px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {t.badgeDirect}
              </span>
              <span style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                {t.badgeActive}
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
              {t.portalTitle}
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#94a3b8' }}>
              {t.portalSubtitle}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleCheckBalance}
              style={{
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                transition: 'transform 0.15s ease'
              }}
            >
              {t.agencyWallet}
            </button>

            <button
              onClick={() => setShowLogsDrawer(!showLogsDrawer)}
              style={{
                background: showLogsDrawer ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '10px 18px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {t.developerLogs} ({logs.length})
            </button>

            <button
              onClick={resetAll}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              {t.resetFlow}
            </button>
          </div>
        </div>

        {/* Agency Balance Alert Bar */}
        {session.balanceInfo && (
          <div style={{
            background: 'linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%)',
            border: '1px solid #6366f1',
            borderRadius: '12px',
            padding: '14px 24px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.2)'
          }}>
            <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
              <div>{t.walletBalance} <strong style={{ color: '#38bdf8', fontSize: '16px' }}>{session.balanceInfo.wallet_amount?.amount ?? '0.00'} {session.balanceInfo.wallet_amount?.currency ?? 'EGP'}</strong></div>
              <div>{t.topupBalance} <strong>{session.balanceInfo.topup_balance?.amount ?? '0.00'} {session.balanceInfo.topup_balance?.currency ?? 'EGP'}</strong></div>
            </div>
            <div>
              {t.accountStatus} <span style={{ background: session.balanceInfo.is_blocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(74, 222, 128, 0.2)', color: session.balanceInfo.is_blocked ? '#ef4444' : '#4ade80', padding: '4px 12px', borderRadius: '20px', fontWeight: '800', fontSize: '12px' }}>
                {session.balanceInfo.is_blocked ? t.blocked : t.activeVerified}
              </span>
            </div>
          </div>
        )}

        {/* Modern Stepper Progress Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          marginBottom: '32px'
        }}>
          {[
            { step: 1, title: t.step1Title, desc: t.step1Desc },
            { step: 2, title: t.step2Title, desc: t.step2Desc },
            { step: 3, title: t.step3Title, desc: t.step3Desc },
            { step: 4, title: t.step4Title, desc: t.step4Desc },
            { step: 5, title: t.step5Title, desc: t.step5Desc }
          ].map(s => {
            const isActive = activeStep === s.step;
            const isCompleted = activeStep > s.step;
            return (
              <div
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : isCompleted ? '#0f172a' : 'rgba(15, 23, 42, 0.6)',
                  border: isActive ? '1px solid #60a5fa' : isCompleted ? '1px solid #334155' : '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 10px 25px rgba(37, 99, 235, 0.35)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: isActive ? '#ffffff' : isCompleted ? '#38bdf8' : '#94a3b8' }}>
                    {s.title}
                  </div>
                  {isCompleted && <span style={{ color: '#4ade80', fontSize: '12px' }}>✓</span>}
                </div>
                <div style={{ fontSize: '11px', color: isActive ? '#dbeafe' : '#64748b', marginTop: '4px' }}>
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* MAIN STEPPER CONTENT AREA */}
        <div style={{ display: 'grid', gridTemplateColumns: showLogsDrawer ? '62% 38%' : '1fr', gap: '24px', transition: 'all 0.3s ease' }}>

          <div style={{ width: '100%' }}>

            {/* STEP 1: FLIGHT SEARCH */}
            {activeStep === 1 && (
              <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '32px', boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)' }}>
                <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', color: '#38bdf8', fontWeight: '700' }}>{t.s1Header}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>Endpoint: <code>POST /api/v2/akbar/search</code></p>
                </div>

                {/* Quick Presets */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', background: 'rgba(30, 41, 59, 0.6)', padding: '12px 18px', borderRadius: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '600' }}>{t.s1Presets}</span>
                  <button onClick={() => setSearchForm(f => ({ ...f, origin: 'CAI', destination: 'RUH' }))} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t.presetCaiRuh}</button>
                  <button onClick={() => setSearchForm(f => ({ ...f, origin: 'CAI', destination: 'DXB' }))} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t.presetCaiDxb}</button>
                  <button onClick={() => setSearchForm(f => ({ ...f, adtCount: 2, chdCount: 1 }))} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t.presetFamily}</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>{t.originLabel}</label>
                    <input
                      value={searchForm.origin}
                      onChange={e => setSearchForm({ ...searchForm, origin: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px', fontSize: '15px', fontWeight: '700', letterSpacing: '0.05em' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>{t.destLabel}</label>
                    <input
                      value={searchForm.destination}
                      onChange={e => setSearchForm({ ...searchForm, destination: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px', fontSize: '15px', fontWeight: '700', letterSpacing: '0.05em' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', fontWeight: '600', marginBottom: '6px' }}>{t.depDateLabel}</label>
                    <input
                      type="date"
                      value={searchForm.departureDate}
                      onChange={e => setSearchForm({ ...searchForm, departureDate: e.target.value })}
                      style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{t.adultsLabel}</label>
                    <input type="number" min="1" value={searchForm.adtCount} onChange={e => setSearchForm({ ...searchForm, adtCount: e.target.value })} style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{t.childrenLabel}</label>
                    <input type="number" min="0" value={searchForm.chdCount} onChange={e => setSearchForm({ ...searchForm, chdCount: e.target.value })} style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{t.infantsLabel}</label>
                    <input type="number" min="0" value={searchForm.infCount} onChange={e => setSearchForm({ ...searchForm, infCount: e.target.value })} style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>{t.cabinLabel}</label>
                    <select value={searchForm.cabinClass} onChange={e => setSearchForm({ ...searchForm, cabinClass: e.target.value })} style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '8px' }}>
                      <option value="ECONOMY">{t.economyClass}</option>
                      <option value="BUSINESS">{t.businessClass}</option>
                      <option value="FIRST">{t.firstClass}</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSearch}
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#fff',
                    padding: '14px 28px',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  {loading ? t.searchingBtn : t.searchBtn}
                </button>
              </div>
            )}

            {/* STEP 2: OFFERS LIST */}
            {activeStep === 2 && (
              <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '32px' }}>
                <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#38bdf8', fontWeight: '700' }}>{t.s2Header}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>Endpoint: <code>POST /api/v2/akbar/fare-confirm</code></p>
                  </div>
                  <span style={{ background: '#1e293b', color: '#38bdf8', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                    {session.offers.length} {t.offersFound}
                  </span>
                </div>

                {session.offers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                    <p style={{ fontSize: '16px' }}>{t.noOffers}</p>
                    <button onClick={() => setActiveStep(1)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', marginTop: '10px' }}>
                      {t.goToSearch}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {session.offers.map((offer, i) => (
                      <div key={offer.id || i} style={{
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{ background: '#2563eb', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '12px' }}>
                              {offer.airline || 'Airline'}
                            </span>
                            <span style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>
                              Flight #{offer.flight_number || 'ND-101'}
                            </span>
                          </div>

                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#cbd5e1', margin: '6px 0' }}>
                            {offer.origin} ✈️ {offer.destination}
                          </div>

                          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                            Departure: <strong style={{ color: '#e2e8f0' }}>{new Date(offer.departure_time).toLocaleString()}</strong> | Arrival: <strong style={{ color: '#e2e8f0' }}>{new Date(offer.arrival_time).toLocaleString()}</strong>
                          </div>

                          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                            <span style={{ fontSize: '12px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                              {t.holdAllowed} <strong>{offer.can_be_held ? 'YES ✅' : 'NO ❌'}</strong>
                            </span>
                            <span style={{ fontSize: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                              {t.includedLuggage} <strong>{offer.have_bundles ? t.checkedBaggage : t.standardLuggage}</strong>
                            </span>
                          </div>
                        </div>

                        <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                          <div style={{ fontSize: '24px', fontWeight: '800', color: '#4ade80' }}>
                            {typeof offer.price === 'object' ? offer.price?.total : offer.price} {typeof offer.price === 'object' ? (offer.price?.currency || 'SAR') : 'SAR'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px' }}>{t.taxesIncluded}</div>

                          <button
                            onClick={() => handleFareConfirm(offer)}
                            disabled={loading}
                            style={{
                              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                              color: '#fff',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '14px',
                              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                            }}
                          >
                            {loading ? t.revalidating : t.selectConfirmFare}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: PASSENGER FORM */}
            {activeStep === 3 && (
              <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '32px' }}>
                <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', color: '#38bdf8', fontWeight: '700' }}>{t.s3Header}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>Endpoint: <code>POST /api/v2/akbar/add-passengers</code></p>
                </div>

                {passengersForm.map((pax, index) => (
                  <div key={index} style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <h4 style={{ margin: '0 0 16px', color: '#f8fafc', fontSize: '16px', fontWeight: '700' }}>
                      {t.paxDetails} #{index + 1} ({pax.type})
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{t.titleLabel}</label>
                        <select value={pax.title} onChange={e => {
                          const updated = [...passengersForm];
                          updated[index].title = e.target.value;
                          setPassengersForm(updated);
                        }} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}>
                          <option value="MR">{t.titleMr}</option>
                          <option value="MRS">{t.titleMrs}</option>
                          <option value="MS">{t.titleMs}</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{t.firstNameLabel}</label>
                        <input value={pax.first_name} onChange={e => {
                          const updated = [...passengersForm];
                          updated[index].first_name = e.target.value;
                          setPassengersForm(updated);
                        }} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{t.lastNameLabel}</label>
                        <input value={pax.last_name} onChange={e => {
                          const updated = [...passengersForm];
                          updated[index].last_name = e.target.value;
                          setPassengersForm(updated);
                        }} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 3fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{t.passportNoLabel}</label>
                        <input value={pax.passport_number} onChange={e => {
                          const updated = [...passengersForm];
                          updated[index].passport_number = e.target.value;
                          setPassengersForm(updated);
                        }} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{t.passportExpiryLabel}</label>
                        <input type="date" value={pax.passport_expiry} onChange={e => {
                          const updated = [...passengersForm];
                          updated[index].passport_expiry = e.target.value;
                          setPassengersForm(updated);
                        }} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{t.emailLabel}</label>
                        <input value={pax.email} onChange={e => {
                          const updated = [...passengersForm];
                          updated[index].email = e.target.value;
                          setPassengersForm(updated);
                        }} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleAddPassengers}
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#fff',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  {loading ? t.submittingPax : t.submitPax}
                </button>
              </div>
            )}

            {/* STEP 4: HOLD OR BOOK */}
            {activeStep === 4 && (
              <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '32px' }}>
                <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', color: '#38bdf8', fontWeight: '700' }}>{t.s4Header}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>{t.orderRef} <strong style={{ color: '#f59e0b' }}>{session.orderReference || 'ORD-98231'}</strong></p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                  {/* Option A: Hold Booking */}
                  <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '24px', borderRadius: '12px', border: '1px solid #eab308', boxShadow: '0 10px 25px rgba(234, 179, 8, 0.1)' }}>
                    <div style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', width: 'fit-content', marginBottom: '12px' }}>
                      {t.optionA}
                    </div>
                    <h4 style={{ margin: '0 0 8px', color: '#ffffff', fontSize: '18px', fontWeight: '700' }}>{t.holdTitle}</h4>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.5' }}>
                      {t.holdDesc}
                    </p>
                    <button
                      onClick={handleHold}
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                        color: '#000000',
                        padding: '12px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '800',
                        fontSize: '14px',
                        cursor: 'pointer',
                        width: '100%',
                        boxShadow: '0 4px 14px rgba(234, 179, 8, 0.3)'
                      }}
                    >
                      {loading ? t.holdingBtn : t.holdBtn}
                    </button>
                  </div>

                  {/* Option B: Direct Book & Pay */}
                  <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '24px', borderRadius: '12px', border: '1px solid #22c55e', boxShadow: '0 10px 25px rgba(34, 197, 94, 0.1)' }}>
                    <div style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', width: 'fit-content', marginBottom: '12px' }}>
                      {t.optionB}
                    </div>
                    <h4 style={{ margin: '0 0 8px', color: '#ffffff', fontSize: '18px', fontWeight: '700' }}>{t.bookTitle}</h4>
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', lineHeight: '1.5' }}>
                      {t.bookDesc}
                    </p>
                    <button
                      onClick={handleBookAndPay}
                      disabled={loading}
                      style={{
                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                        color: '#ffffff',
                        padding: '12px 20px',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '800',
                        fontSize: '14px',
                        cursor: 'pointer',
                        width: '100%',
                        boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
                      }}
                    >
                      {loading ? t.bookingBtn : t.bookBtn}
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 5: PNR STATUS & RETRIEVAL */}
            {activeStep === 5 && (
              <div style={{ background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '32px' }}>
                <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', color: '#4ade80', fontWeight: '700' }}>{t.s5Header}</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>Endpoint: <code>GET /api/v2/akbar/retrieve</code></p>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '14px' }}>
                    <div>{t.orderRef} <strong style={{ color: '#f59e0b' }}>{session.orderReference || 'N/A'}</strong></div>
                    <div>{t.bookingStatusLabel} <strong style={{ color: '#4ade80' }}>{session.bookingStatus}</strong></div>
                    <div>{t.airlinePnrLabel} <strong style={{ color: '#facc15' }}>{session.airlinePnr || 'N/A'}</strong></div>
                    <div>{t.akbarRefLabel} <strong style={{ color: '#38bdf8' }}>{session.akbarBookingReference || 'N/A'}</strong></div>
                    <div>{t.holdExpLabel} <strong>{session.holdExpirationDate ? new Date(session.holdExpirationDate).toLocaleString() : 'N/A'}</strong></div>
                  </div>

                  {session.ticketNumbers?.length > 0 && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
                      <div style={{ fontWeight: '700', color: '#38bdf8', marginBottom: '8px', fontSize: '15px' }}>{t.issuedEtickets}</div>
                      {session.ticketNumbers.map((tNum, idx) => (
                        <div key={idx} style={{ fontSize: '14px', color: '#4ade80', fontFamily: 'monospace', background: 'rgba(74, 222, 128, 0.1)', padding: '8px 14px', borderRadius: '6px', width: 'fit-content', marginBottom: '6px' }}>
                          🎫 E-Ticket #{tNum}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={handleRetrieve} disabled={loading} style={{ background: '#0284c7', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                    {t.retrieveLivePnr}
                  </button>

                  {session.bookingStatus === 'ON_HOLD' && (
                    <button onClick={handleBookAfterHold} disabled={loading} style={{ background: '#16a34a', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                      {t.payAfterHold}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Fault Injection Resilience Testing Box */}
            <div style={{ marginTop: '32px', background: '#0f172a', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#f87171', fontSize: '16px', fontWeight: '700' }}>
                  {t.faultHeader}
                </h3>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
                {t.faultDesc}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                <button onClick={() => handleSimulate('409_OFFER_EXPIRED')} style={{ background: 'rgba(127, 29, 29, 0.6)', color: '#fecaca', border: '1px solid #ef4444', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t.sim409}</button>
                <button onClick={() => handleSimulate('429_RATE_LIMIT')} style={{ background: 'rgba(127, 29, 29, 0.6)', color: '#fecaca', border: '1px solid #ef4444', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t.sim429}</button>
                <button onClick={() => handleSimulate('500_SUPPLIER_DOWN')} style={{ background: 'rgba(127, 29, 29, 0.6)', color: '#fecaca', border: '1px solid #ef4444', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t.sim500}</button>
                <button onClick={() => handleSimulate('TIMEOUT_UNKNOWN')} style={{ background: 'rgba(127, 29, 29, 0.6)', color: '#fecaca', border: '1px solid #ef4444', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t.sim504}</button>
                <button onClick={() => handleSimulate('DUPLICATE_WEBHOOK')} style={{ background: 'rgba(127, 29, 29, 0.6)', color: '#fecaca', border: '1px solid #ef4444', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t.simDupWebhook}</button>
              </div>
            </div>

          </div>

          {/* DEVELOPER API INSPECTOR DRAWER */}
          {showLogsDrawer && (
            <div style={{ background: '#020617', borderRadius: '16px', border: '1px solid #1e293b', padding: '20px', height: 'fit-content' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#a855f7', fontSize: '15px', fontWeight: '700' }}>{t.logsHeader}</h3>
                <button onClick={() => setLogs([])} style={{ background: '#334155', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>{t.clearLogs}</button>
              </div>

              {logs.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#64748b' }}>{t.noLogs}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '750px', overflowY: 'auto' }}>
                  {logs.map(log => (
                    <div key={log.id} style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                        <span style={{ color: '#94a3b8' }}>[{log.time}] <strong>{log.method}</strong> {log.endpoint}</span>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', background: log.status < 400 ? '#14532d' : '#7f1d1d', color: log.status < 400 ? '#4ade80' : '#fecaca', fontWeight: 'bold' }}>
                          HTTP {log.status}
                        </span>
                      </div>

                      {log.requestPayload && (
                        <details style={{ marginTop: '4px' }}>
                          <summary style={{ fontSize: '11px', color: '#38bdf8', cursor: 'pointer' }}>Request Payload</summary>
                          <pre style={{ fontSize: '10px', color: '#94a3b8', overflowX: 'auto', background: '#020617', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                            {JSON.stringify(log.requestPayload, null, 2)}
                          </pre>
                        </details>
                      )}

                      <details open style={{ marginTop: '4px' }}>
                        <summary style={{ fontSize: '11px', color: '#a855f7', cursor: 'pointer' }}>Response Payload</summary>
                        <pre style={{ fontSize: '10px', color: '#cbd5e1', overflowX: 'auto', background: '#020617', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                          {JSON.stringify(log.responseData, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
