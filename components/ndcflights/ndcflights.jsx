"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  FaStar, FaQuoteRight, FaHandshake, FaMapMarkedAlt, 
  FaAward, FaUsers, FaHeart, FaPlane, FaSearch, 
  FaCalendarAlt, FaUser, FaExchangeAlt, FaArrowRight, FaTimes,
  FaChevronDown, FaMinus, FaPlus
} from "react-icons/fa";

export default function NDCFlights() {
  const router = useRouter();
  const params = useParams();
  const lang = params?.lang || "en";
  const isRTL = lang === "ar";

  const content = {
    ar: {
      heroTitle: "سحر الطبيعة كما لم تره من قبل",
      heroSubtitle: "اكتشف المملكة من منظور جديد",
      heroDescription: "دعنا نخطط.. وأنت استمتع بالرحلة",
      bookFlight: "احجز رحلة طيران",
      searchCompare: "ابحث وقارن بين مئات شركات الطيران",
      roundTrip: "ذهاب وعودة",
      oneWay: "ذهاب فقط",
      multiCity: "رحلات متعددة",
      from: "من",
      to: "إلى",
      departure: "تاريخ المغادرة",
      return: "تاريخ العودة",
      passengers: "المسافرون",
      adults: "بالغ",
      children: "طفل",
      infants: "رضيع",
      adultsAge: "12+ سنة",
      childrenAge: "2-11 سنة",
      infantsAge: "أقل من سنتين",
      cabinClass: "درجة السفر",
      economy: "الدرجة السياحية",
      premium: "الدرجة الممتازة",
      business: "رجال الأعمال",
      first: "الدرجة الأولى",
      searchFlights: "بحث عن رحلات",
      searching: "جاري البحث...",
      availableFlights: "الرحلات المتاحة",
      perPerson: "للشخص الواحد",
      noResults: "ابحث عن الرحلات لرؤية العروض المتاحة",
      fillRequired: "الرجاء ملء جميع الحقول المطلوبة",
      failedFetch: "فشل في جلب الرحلات",
      apiError: "خطأ في الاتصال",
      recentSearches: "عمليات البحث الأخيرة",
      exclusiveOffers: "عروض حصرية لك",
      exploreAll: "استكشف جميع العروض",
      bookWithMiles: "احجز بالأميال",
      flyNowPayLater: "اسافر الآن وادفع لاحقاً مع تمارا",
      bookWithTamara: "احجز مع تمارا",
      cityOrAirport: "المدينة أو رمز المطار",
      done: "تم",
      selectFareType: "اختر نوع الأجرة",
      pickOption: "اختر خياراً يناسبك!",
      baggageAllowance: "حد الأمتعة",
      cabinBaggage: "أمتعة القائمة",
      checkedBaggage: "الأمتعة المسجلة",
      cancelDateChange: "الإلغاء وتغيير التاريخ",
      refundable: "قابل للاسترجاع",
      changeable: "قابل للتعديل",
      fees: "برسوم",
      free: "مجاناً",
      benefits: "المزايا",
      tripInsurance: "تأمين الرحلة",
      insuranceDesc: "تغطية الإلغاءات والتأخيرات والحالات الطارئة",
      select: "اختر",
    },
    en: {
      heroTitle: "Explore Domestic and International ",
      heroSubtitle: "Flights in Saudi Arabia",
      heroDescription: "Let us plan... while you enjoy the journey",
      bookFlight: "Book a flight",
      searchCompare: "Search and compare hundreds of airlines",
      roundTrip: "Round trip",
      oneWay: "One way",
      multiCity: "Multi-city",
      from: "From",
      to: "To",
      departure: "Departure",
      return: "Return",
      passengers: "Passengers",
      adults: "Adults",
      children: "Children",
      infants: "Infants",
      adultsAge: "12+ years",
      childrenAge: "2-11 years",
      infantsAge: "Under 2 years",
      cabinClass: "Cabin class",
      economy: "Economy",
      premium: "Premium Economy",
      business: "Business",
      first: "First Class",
      searchFlights: "Search flights",
      searching: "Searching...",
      availableFlights: "Available Flights",
      perPerson: "per person",
      noResults: "Search for flights to see available offers",
      fillRequired: "Please fill all required fields",
      failedFetch: "Failed to fetch flights",
      apiError: "API error",
      recentSearches: "Recent searches",
      exclusiveOffers: "Exclusive Offers for You",
      exploreAll: "Explore all offers",
      bookWithMiles: "Book with Miles",
      flyNowPayLater: "Fly now, pay later with Tamara",
      bookWithTamara: "Book with Tamara",
      cityOrAirport: "City or airport code",
      done: "Done",
      selectFareType: "Select fare type",
      pickOption: "Pick an option that suits you!",
      baggageAllowance: "Baggage allowance",
      cabinBaggage: "Cabin baggage",
      checkedBaggage: "Checked baggage",
      cancelDateChange: "Cancel & date change",
      refundable: "Refundable",
      changeable: "Changeable",
      fees: "with fees",
      free: "for free",
      benefits: "Benefits",
      tripInsurance: "Trip Insurance",
      insuranceDesc: "Coverage for cancellations, delays and emergencies",
      select: "Select",
    },
    zh: {
      heroTitle: "探索沙特阿拉伯的国内和国际航班",
      heroSubtitle: "发现全新的出行体验",
      heroDescription: "让我们规划您的旅程，您尽享快乐旅行",
      bookFlight: "预订航班",
      searchCompare: "搜索并比较数百家航空公司",
      roundTrip: "往返",
      oneWay: "单程",
      multiCity: "多城市",
      from: "出发地",
      to: "目的地",
      departure: "出发日期",
      return: "返回日期",
      passengers: "乘客数",
      adults: "成人",
      children: "儿童",
      infants: "婴幼儿",
      adultsAge: "12岁及以上",
      childrenAge: "2-11岁",
      infantsAge: "2岁以下",
      cabinClass: "舱位等级",
      economy: "经济舱",
      premium: "高级经济舱",
      business: "商务舱",
      first: "头等舱",
      searchFlights: "搜索航班",
      searching: "正在搜索...",
      availableFlights: "可用航班",
      perPerson: "每人",
      noResults: "搜索航班以查看可用优惠",
      fillRequired: "请填写所有必填字段",
      failedFetch: "无法获取航班信息",
      apiError: "API错误",
      recentSearches: "最近搜索",
      exclusiveOffers: "专属优惠",
      exploreAll: "查看所有优惠",
      bookWithMiles: "用里程兑换",
      flyNowPayLater: "现在飞行，稍后支付",
      bookWithTamara: "通过Tamara预订",
      cityOrAirport: "城市或机场代码",
      done: "完成",
      selectFareType: "选择票价类型",
      pickOption: "选择适合您的选项！",
      baggageAllowance: "行李限额",
      cabinBaggage: "随身行李",
      checkedBaggage: "托运行李",
      cancelDateChange: "取消和更改日期",
      refundable: "可退款",
      changeable: "可修改",
      fees: "需手续费",
      free: "免费",
      benefits: "权益",
      tripInsurance: "旅行保险",
      insuranceDesc: "涵盖取消、延误和紧急情况",
      select: "选择",
    }
  };

  const t = content[lang] || content.en;

  // use the same API env var used across the app (falls back to localhost Laravel API)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

  const [tripType, setTripType] = useState("roundtrip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cabinClass, setCabinClass] = useState("economy");
  const [bookWithMiles, setBookWithMilesState] = useState(false);
  const [showPassengers, setShowPassengers] = useState(false);
  const [passengers, setPassengers] = useState([
    { type: "ADT", count: 1, label: t.adults, sublabel: t.adultsAge },
    { type: "CHD", count: 0, label: t.children, sublabel: t.childrenAge },
    { type: "INF", count: 0, label: t.infants, sublabel: t.infantsAge }
  ]);

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [recentSearchesState, setRecentSearchesState] = useState([
    { from: "JED", to: "CAI", date: "13 Mar" },
    { from: "JED", to: "DXB", date: "19 Feb – 24 Mar" },
    { from: "RUH", to: "LON", date: "5 Apr – 12 Apr" },
  ]);

  const removeRecent = (idx) => setRecentSearchesState((s) => s.filter((_, i) => i !== idx));

  const [expandedFlightIdx, setExpandedFlightIdx] = useState(null);

  // Fare options for demonstration
  const generateFareOptions = (basePrice) => {
    const fareLabels = {
      en: {
        economySaver: 'ECONOMY SAVER',
        almosafer: 'Price +',
        economyFlex: 'ECONOMY FLEX PLUS',
        installments: 'Up to 4 interest-free installments',
        cabin: '7 KG Cabin baggage',
        checked25: '25 KG Checked baggage',
        checked30: '30 KG Checked baggage',
        checked35: '35 KG Checked baggage',
        refundableFees: 'Refundable with fees',
        changeableFees: 'Changeable with fees',
        refundableFree: 'Refundable for free',
        changeableFree: 'Changeable without fees',
        benefitsTitle: 'Almosafer benefits',
        tripInsurance: 'Trip Insurance',
        insuranceDesc: 'Coverage for cancellations, delays and emergencies'
      },
      ar: {
        economySaver: 'موفر الاقتصادية',
        almosafer: 'السعر +',
        economyFlex: 'الاقتصادية المرنة بلس',
        installments: 'حتى 4 أقساط بدون فائدة',
        cabin: '7 كيلو أمتعة القائمة',
        checked25: '25 كيلو أمتعة مسجلة',
        checked30: '30 كيلو أمتعة مسجلة',
        checked35: '35 كيلو أمتعة مسجلة',
        refundableFees: 'قابل للاسترجاع برسوم',
        changeableFees: 'قابل للتعديل برسوم',
        refundableFree: 'قابل للاسترجاع مجاناً',
        changeableFree: 'قابل للتعديل بدون رسوم',
        benefitsTitle: 'مزايا المسافر',
        tripInsurance: 'تأمين الرحلة',
        insuranceDesc: 'تغطية الإلغاءات والتأخيرات والحالات الطارئة'
      },
      zh: {
        economySaver: '经济舱超值',
        almosafer: '价格 +',
        economyFlex: '经济舱灵活加强',
        installments: '最多4期免息分期',
        cabin: '7公斤随身行李',
        checked25: '25公斤托运行李',
        checked30: '30公斤托运行李',
        checked35: '35公斤托运行李',
        refundableFees: '可退款但需手续费',
        changeableFees: '可修改但需手续费',
        refundableFree: '可免费退款',
        changeableFree: '可免费修改',
        benefitsTitle: '阿尔莫莎费尔权益',
        tripInsurance: '旅行保险',
        insuranceDesc: '涵盖取消、延误和紧急情况'
      }
    };

    const labels = fareLabels[lang] || fareLabels.en;

    return [
      {
        id: 'economy-saver',
        name: labels.economySaver,
        symbol: '₹',
        price: basePrice,
        installments: labels.installments,
        baggage: [
          labels.cabin,
          labels.checked25
        ],
        cancellation: [
          { icon: '💰', text: labels.refundableFees },
          { icon: '🔄', text: labels.changeableFees }
        ]
      },
      {
        id: 'premium-plus',
        name: labels.almosafer,
        symbol: '₹',
        price: Math.round(basePrice * 1.15),
        installments: labels.installments,
        baggage: [
          labels.cabin,
          labels.checked30
        ],
        cancellation: [
          { icon: '💰', text: labels.refundableFees },
          { icon: '🔄', text: labels.changeableFees }
        ],
        benefits: {
          title: labels.benefitsTitle,
          items: [
            { icon: '🛡️', title: labels.tripInsurance, desc: labels.insuranceDesc }
          ]
        }
      },
      {
        id: 'economy-flex',
        name: labels.economyFlex,
        symbol: '₹',
        price: Math.round(basePrice * 1.3),
        installments: labels.installments,
        baggage: [
          labels.cabin,
          labels.checked35
        ],
        cancellation: [
          { icon: '✅', text: labels.refundableFree },
          { icon: '✅', text: labels.changeableFree }
        ]
      }
    ];
  };

  const exclusiveOffers = [
    { title: "Summer Escape", discount: "20% OFF", code: "SUMMER20", color: "from-purple-50 to-pink-50" },
    { title: "Family Fun", discount: "Kids fly free", code: "FAMILY", color: "from-blue-50 to-indigo-50" },
    { title: "Business Special", discount: "30% OFF", code: "BIZ30", color: "from-amber-50 to-orange-50" },
  ];

  // Offers carousel refs/state
  const offersRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [offerIndex, setOfferIndex] = useState(0);
  const [offersOverflow, setOffersOverflow] = useState(false);

  const updateOffersScroll = () => {
    const el = offersRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 8;
    setOffersOverflow(overflow);
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);

    // update index (approximate by card width)
    const first = el.firstElementChild;
    if (first) {
      const gap = 18; // same as CSS gap
      const per = first.clientWidth + gap;
      const idx = Math.round(el.scrollLeft / per);
      setOfferIndex(Math.max(0, Math.min(idx, Math.max(0, el.children.length - 1))));
    }
  };

  useEffect(() => {
    updateOffersScroll();
    const el = offersRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateOffersScroll, { passive: true });
    window.addEventListener('resize', updateOffersScroll);
    return () => {
      el.removeEventListener('scroll', updateOffersScroll);
      window.removeEventListener('resize', updateOffersScroll);
    };
  }, []);

  const scrollOffers = (dir) => {
    const el = offersRef.current;
    if (!el) return;
    const nextIndex = dir === 'next' ? Math.min(offerIndex + 1, exclusiveOffers.length - 1) : Math.max(offerIndex - 1, 0);
    console.debug('[carousel] scrollOffers', { dir, offerIndex, nextIndex });
    setOfferIndex(nextIndex);
    scrollToOffer(nextIndex);
  };

  const scrollToOffer = (i) => {
    const el = offersRef.current;
    if (!el) return;
    const first = el.firstElementChild;
    const gap = 18;
    const per = first ? first.clientWidth + gap : Math.round(el.clientWidth * 0.8);
    const target = i * per;
    console.debug('[carousel] scrollToOffer', { i, per, target, scrollLeft: el.scrollLeft, clientWidth: el.clientWidth, scrollWidth: el.scrollWidth });

    // try smooth scroll, then fallback to incremental if no movement
    el.scrollTo({ left: target, behavior: 'smooth' });
    setTimeout(() => {
      if (Math.abs(el.scrollLeft - target) > 8) {
        // fallback: perform step scrollBy until reach or no change
        console.debug('[carousel] fallback scrollBy');
        el.scrollBy({ left: target - el.scrollLeft, behavior: 'smooth' });
      }
      updateOffersScroll();
    }, 320);
  };

  const updatePassengerCount = (type, delta) => {
    setPassengers((prev) =>
      prev.map((p) => {
        if (p.type !== type) return p;
        const min = p.type === "ADT" ? 1 : 0;
        const newCount = Math.max(min, Math.min(9, p.count + delta));
        return { ...p, count: newCount };
      })
    );
  };

  const getTotalPassengers = () => passengers.reduce((sum, p) => sum + p.count, 0);

  const getPassengerSummary = () => {
    const total = getTotalPassengers();
    return `${total} ${isRTL ? "مسافر" : total === 1 ? "Passenger" : "Passengers"}`;
  };

  const cabinOptions = [
    { value: "economy", label: t.economy },
    { value: "premium", label: t.premium },
    { value: "business", label: t.business },
    { value: "first", label: t.first },
  ];

  const handleSearch = async () => {
    // Validate airport codes are exactly 3 characters
    if (!origin || origin.length !== 3) {
      setError(`${t.from} must be 3-letter airport code (e.g., JED)`);
      return;
    }
    if (!destination || destination.length !== 3) {
      setError(`${t.to} must be 3-letter airport code (e.g., CAI)`);
      return;
    }
    if (!departDate) {
      setError(t.fillRequired);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Format date as YYYY-MM-DD for API
      const departDateFormatted = new Date(departDate).toISOString().split('T')[0];
      const returnDateFormatted = returnDate ? new Date(returnDate).toISOString().split('T')[0] : null;
      
      // Get passenger counts
      const adultsCount = passengers.find(p => p.type === 'ADT')?.count || 1;
      const childrenCount = passengers.find(p => p.type === 'CHD')?.count || 0;
      const infantsCount = passengers.find(p => p.type === 'INF')?.count || 0;

      // Build request for backend search endpoint
      const searchPayload = {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departure_date: departDateFormatted,
        return_date: returnDateFormatted,
        adults: adultsCount,
        children: childrenCount,
        infants: infantsCount,
        cabin_class: cabinClass || 'economy',
      };

      console.log('🔍 Searching flights with:', searchPayload);

      const response = await fetch(`${API_BASE}/v2/ndc/bookings/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchPayload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`${t.apiError}: ${response.status} - ${errorData.message || ''}`);
      }

      const data = await response.json();
      console.log('✅ Search results:', data);
      
      // Backend returns { success: true, data: { offers: [...], search_id, total_offers } }
      // Extract the offers array from nested structure
      const rawOffers = data?.data?.offers || data?.offers || [];
      
      // Normalize backend response to frontend format
      const normalizedOffers = rawOffers.map(offer => ({
        offerId: offer.offer_id || offer.offerId,
        airline: offer.airline || 'Unknown Airline',
        airlineCode: offer.airline_code || offer.airlineCode || 'XX',
        flightNumber: offer.flight_number || offer.flightNumber || 'N/A',
        departureTime: offer.departure_time || offer.departureTime || '00:00',
        arrivalTime: offer.arrival_time || offer.arrivalTime || '00:00',
        departure: offer.origin || offer.departure || origin?.toUpperCase(),
        arrival: offer.destination || offer.arrival || destination?.toUpperCase(),
        duration: offer.duration || '0h 0m',
        stops: offer.stops || 0,
        price: offer.price || 0,  // Backend provides as number, not object
        currency: offer.currency || 'SAR',
        cabin: offer.cabin_class || offer.cabin || 'Economy',
        aircraft: offer.aircraft || 'Aircraft',
        bundles: offer.bundles || [],
        raw: offer  // Keep original for reference
      }));
      
      setOffers(normalizedOffers);
      
      console.log('✅ Offers loaded:', normalizedOffers.length, normalizedOffers);
      
      if (!normalizedOffers || normalizedOffers.length === 0) {
        setError(t.noResults);
      }
    } catch (err) {
      console.error('❌ Search error:', err);
      setError(err.message || t.failedFetch);
    } finally {
      setLoading(false);
    }
  };

  const selectOffer = (offer) => {
    // Use the normalized offer from search results
    const originCode = offer.departure || origin?.toUpperCase() || 'ORG';
    const destCode = offer.arrival || destination?.toUpperCase() || 'DES';
    
    // normalize the offer into the `selectedFlight` shape used by bundle/passengers/checkout pages
    const stored = {
      // ensure an offerId exists
      offerId: offer.offerId,
      
      // price must be a number for downstream pages (checkout expects flight.price)
      price: offer.price || 0,
      currency: offer.currency || 'SAR',
      passengers: getTotalPassengers() || 1,
      
      // CRITICAL: Map all fields needed for e-ticket display
      airline: offer.airline,
      airlineCode: offer.airlineCode,
      flightNumber: offer.flightNumber,
      flightNo: offer.flightNumber,
      
      // Origin/Departure - USE AIRPORT CODES FROM API, not search input
      from: originCode,
      fromCode: originCode,
      fromCity: origin || originCode || 'Origin',
      fromAirport: `${origin} International Airport` || 'Origin Airport',
      fromTerminal: '',
      departure: originCode,
      departureTime: offer.departureTime,
      dep: offer.departureTime,
      date: departDate ? new Date(departDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      departureDate: departDate ? new Date(departDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      
      // Destination/Arrival - USE AIRPORT CODES FROM API, not search input
      to: destCode,
      toCode: destCode,
      toCity: destination || destCode || 'Destination',
      toAirport: `${destination} International Airport` || 'Destination Airport',
      toTerminal: '',
      arrival: destCode,
      arrivalTime: offer.arrivalTime,
      arr: offer.arrivalTime,
      
      // Flight details
      duration: offer.duration,
      flightDuration: offer.duration,
      cabin: offer.cabin || 'Economy',
      aircraft: offer.aircraft || 'Aircraft',
      baggage: '23kg Checked + 7kg Cabin',
      status: 'Confirmed',
      
      // Keep original fields for reference
      raw: offer
    };

    console.log('💾 Storing flight data:', stored);
    localStorage.setItem('selectedFlight', JSON.stringify(stored));
    // go to unified booking page (handles passengers, extras, checkout, payment)
    router.push(`/${lang}/ndc-flights/booking`);
  };

  const swapLocations = () => {
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="ndc-page">

      {/* ── Hero ── */}
      <section className="ndc-hero">
        <div className="hero-overlay" />

      </section>

      {/* ── Search Card ── */}
      <div className="search-wrapper">
        <div className="search-card">

          {/* Trip type + extras */}
          <div className="search-topbar">
            <div className="trip-tabs">
              {[
                { key: "roundtrip", label: t.roundTrip },
                { key: "oneway", label: t.oneWay },
                { key: "multicity", label: t.multiCity },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`trip-tab ${tripType === key ? "active" : ""}`}
                  onClick={() => setTripType(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="miles-toggle">
              <input
                type="checkbox"
                checked={bookWithMiles}
                onChange={(e) => setBookWithMilesState(e.target.checked)}
              />
              <span className="miles-check" />
              <span className="miles-label">{t.bookWithMiles}</span>
            </label>
          </div>

          {/* Main fields row */}
          <div className="search-fields">

            {/* From */}
            <div className="field-group">
              <label className="field-label">{t.from}</label>
              <div className="field-input-wrap">
                <FaPlane className={`field-icon ${isRTL ? 'flip-plane' : ''}`} />
                <input
                  value={origin}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
                    setOrigin(val);
                  }}
                  placeholder="JED"
                  maxLength="3"
                  className="field-input"
                />
              </div>
            </div>

            {/* Swap button */}
            <button className="swap-btn" onClick={swapLocations} aria-label="Swap">
              <FaExchangeAlt />
            </button>

            {/* To */}
            <div className="field-group">
              <label className="field-label">{t.to}</label>
              <div className="field-input-wrap">
                <FaPlane className={`field-icon ${isRTL ? 'flip-plane' : ''}`} />
                <input
                  value={destination}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
                    setDestination(val);
                  }}
                  placeholder="CAI"
                  maxLength="3"
                  className="field-input"
                />
              </div>
            </div>

            {/* Departure */}
            <div className="field-group">
              <label className="field-label">{t.departure}</label>
              <div className="field-input-wrap">
                <FaCalendarAlt className="field-icon" />
                <input
                  type="date"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  className="field-input date-input"
                />
              </div>
            </div>

            {/* Return */}
            <div className={`field-group ${tripType === "oneway" ? "field-disabled" : ""}`}>
              <label className="field-label">{t.return}</label>
              <div className="field-input-wrap">
                <FaCalendarAlt className="field-icon" />
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  disabled={tripType === "oneway"}
                  className="field-input date-input"
                />
              </div>
            </div>

            {/* Passengers dropdown */}
            <div className="field-group pax-group" style={{ position: "relative" }}>
              <label className="field-label">{t.passengers}</label>
              <div className="field-input-wrap" onClick={() => setShowPassengers(!showPassengers)} style={{ cursor: "pointer" }}>
                <FaUser className="field-icon" />
                <span className="field-input pax-display">{getPassengerSummary()}</span>
                <FaChevronDown className={`pax-chevron ${showPassengers ? "open" : ""}`} />
              </div>
              {showPassengers && (
                <div className="pax-dropdown">
                  {passengers.map((p) => (
                    <div key={p.type} className="pax-row">
                      <div className="pax-info">
                        <span className="pax-label">{p.label}</span>
                        <span className="pax-sub">{p.sublabel}</span>
                      </div>
                      <div className="pax-counter">
                        <button
                          className="pax-btn"
                          onClick={() => updatePassengerCount(p.type, -1)}
                          disabled={p.type === "ADT" && p.count <= 1}
                        >
                          <FaMinus size={10} />
                        </button>
                        <span className="pax-num">{p.count}</span>
                        <button
                          className="pax-btn"
                          onClick={() => updatePassengerCount(p.type, 1)}
                          disabled={p.count >= 9}
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="pax-done" onClick={() => setShowPassengers(false)}>
                    {t.done}
                  </button>
                </div>
              )}
            </div>

            {/* Cabin class */}
            <div className="field-group">
              <label className="field-label">{t.cabinClass}</label>
              <div className="field-input-wrap">
                <FaAward className="field-icon" />
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="field-input field-select"
                >
                  {cabinOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="search-error">
              <FaTimes style={{ marginInlineEnd: 6 }} />{error}
            </div>
          )}

          {/* Search button */}
          <div className="search-action">
            <button className="search-btn" onClick={handleSearch} disabled={loading}>
              <FaSearch style={{ marginInlineEnd: 8 }} />
              {loading ? t.searching : t.searchFlights}
            </button>
          </div>

        </div>
      </div>

      {/* ── Results ── */}
      {offers.length > 0 && (
        <section className="results-section">
          <div className="container-inner">
            <h2 className="section-title">{t.availableFlights}</h2>
            <div className="results-list">
              {offers.map((offer, idx) => (
                <div key={idx} className={`flight-card-wrapper ${expandedFlightIdx === idx ? 'expanded' : ''}`}>
                  <div className="flight-card" onClick={() => setExpandedFlightIdx(expandedFlightIdx === idx ? null : idx)}>
                    {/* Left Section - Airline & Times */}
                    <div className="flight-left">
                      {/* Airline Logo */}
                      <div className="airline-logo">
                        <span className="airline-badge" style={{ 
                          background: `linear-gradient(135deg, ${['#DC143C', '#E63946', '#FF6B6B', '#FF8C42', '#FFD60A'][idx % 5]}, ${['#8B0000', '#A4161A', '#C72C48', '#FF8C42', '#F77F00'][idx % 5]})` 
                        }}>
                          {(offer.airline || "SV").substring(0, 2).toUpperCase()}
                        </span>
                      </div>

                      {/* Time & Route Info */}
                      <div className="flight-info">
                        <div className="departure-time">{offer.departureTime || "10:10"} AM</div>
                        <div className="route-indicator">
                          <span className="route-arrow">→</span>
                          {offer.stops ? (
                            <span className="stops-badge">{offer.stops}</span>
                          ) : (
                            <span className="stops-badge">Direct</span>
                          )}
                        </div>
                        <div className="arrival-time">{offer.arrivalTime || "06:50"} AM<sup>+1</sup></div>
                        <div className="route-code">{offer.departure || origin?.toUpperCase() || "JED"} → {offer.arrival || destination?.toUpperCase() || "DXB"}</div>
                      </div>
                    </div>

                    {/* Middle Section - Flight Details */}
                    <div className="flight-details">
                      <div className="detail-item">
                        <span className="detail-label">Airline</span>
                        <span className="detail-value">{offer.airline || "Saudi Airlines"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Duration</span>
                        <span className="detail-value">{offer.duration || "3h 40m"}</span>
                      </div>
                      <div className="detail-item amenities">
                        <span className="detail-label">Amenities</span>
                        <div className="amenity-icons">
                          <span className="amenity-icon" title="Baggage" aria-label="Baggage">🧳</span>
                          <span className="amenity-icon" title="Meal" aria-label="Meal">🍽️</span>
                          <span className="amenity-icon" title="WiFi" aria-label="WiFi">📡</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Price & Action */}
                    <div className="flight-right">
                      <div className="flight-number">
                        <span className="number-label">Flight</span>
                        <span className="number-value">{offer.flightNumber || "SV 302"}</span>
                      </div>
                      <button 
                        className={`check-fare-btn ${expandedFlightIdx === idx ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedFlightIdx(expandedFlightIdx === idx ? null : idx);
                        }}
                      >
                        {expandedFlightIdx === idx ? 'Hide fare' : 'Check fare'}
                        <span className={`dropdown-icon ${expandedFlightIdx === idx ? 'rotated' : ''}`}>▼</span>
                      </button>
                    </div>

                    {/* Price Display (Mobile) */}
                    <div className="flight-price-mobile">
                      <div className="price-value">{(offer.price || 0).toLocaleString('en-SA')} {offer.currency || 'SAR'}</div>
                      <div className="price-label">{t.perPerson}</div>
                    </div>
                  </div>

                  {/* Expanded Fare Selection */}
                  {expandedFlightIdx === idx && (
                    <div className="fare-selection-expanded">
                      <div className="fare-header">
                        <h3>{t.selectFareType}</h3>
                        <p>{t.pickOption}</p>
                      </div>

                      <div className="fare-cards-grid">
                        {generateFareOptions(offer.price || 1250).map((fare) => (
                          <div key={fare.id} className={`fare-card ${fare.name.includes('+') ? 'premium' : ''}`}>
                            {/* Pricing Section */}
                            <div className="fare-header-section">
                              <div>
                                <h4 className="fare-name">{fare.name}</h4>
                                <div className="fare-price">
                                  <span className="symbol">{fare.symbol}</span>
                                  <span className="amount">{fare.price}</span>
                                </div>
                              </div>
                            </div>

                            <p className="fare-installment">
                              <span className="emoji">💳</span>
                              <span>{fare.installments}</span>
                            </p>

                            {/* Baggage Allowance */}
                            <div className="fare-section">
                              <h5>{t.baggageAllowance}</h5>
                              {fare.baggage.map((item, i) => (
                                <div key={i} className="fare-item">
                                  <span className="checkmark">✓</span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>

                            {/* Cancel & Date Change */}
                            <div className="fare-section">
                              <h5>{t.cancelDateChange}</h5>
                              {fare.cancellation.map((item, i) => (
                                <div key={i} className="fare-item">
                                  <span className="icon">{item.icon}</span>
                                  <span>{item.text}</span>
                                </div>
                              ))}
                            </div>

                            {/* Benefits (Premium only) */}
                            {fare.benefits && (
                              <div className="fare-section">
                                <div className="benefits-header">
                                  <h5>{fare.benefits.title}</h5>
                                  <span className="info-icon">ℹ️</span>
                                </div>
                                {fare.benefits.items.map((item, i) => (
                                  <div key={i} className="benefit-item">
                                    <span className="benefit-icon">{item.icon}</span>
                                    <div>
                                      <div className="benefit-title">{item.title}</div>
                                      <div className="benefit-desc">{item.desc}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Select Button */}
                            <button 
                              className="select-fare-btn"
                              onClick={() => {
                                // Save bundle/fare for booking page
                                const bundle = {
                                  bundleId: fare.id || fare.bundleId || `bundle_${idx}`,
                                  name: fare.name || 'Economy',
                                  price: fare.price || 0,
                                  cabin: fare.cabin || 'economy',
                                  baggage: fare.baggage,
                                  benefits: fare.benefits,
                                  refundable: fare.refundable || false,
                                  changeable: fare.changeable || true,
                                };
                                localStorage.setItem('selectedBundle', JSON.stringify(bundle));
                                localStorage.setItem('selectedFare', JSON.stringify(fare));
                                selectOffer(offer);
                              }}
                            >
                              {t.select}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Exclusive Offers ── */}
      <section className="offers-section">
        <div className="container-inner">
          <div className="offers-header">
            <h2 className="section-title">{t.exclusiveOffers}</h2>
            <button className="explore-btn">{t.exploreAll} →</button>
          </div>
          <div className="offers-carousel">
            <button className="carousel-btn prev" onClick={() => scrollOffers('prev')} aria-label="Previous" disabled={!canScrollLeft}>‹</button>
            <div className={`offers-grid ${offersOverflow ? '' : 'centered'}`} ref={offersRef}>
              {exclusiveOffers.map((offer, idx) => (
                <div key={idx} className="exc-card">
                  <span className="exc-discount">{offer.discount}</span>
                  <p className="exc-title">{offer.title}</p>
                  <div className="exc-code-wrap">
                    <span className="exc-code-label">{t.bookWithMiles}:</span>
                    <span className="exc-code">{offer.code}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="carousel-controls">
              <button className="carousel-btn prev" onClick={() => scrollOffers('prev')} aria-label="Previous" disabled={!canScrollLeft}>‹</button>
              <div className="carousel-dots">
                {exclusiveOffers.map((_, i) => (
                  <button key={i} onClick={() => scrollToOffer(i)} className={`dot ${i === offerIndex ? 'active' : ''}`} aria-label={`Go to slide ${i+1}`} />
                ))}
              </div>
              <button className="carousel-btn next" onClick={() => scrollOffers('next')} aria-label="Next" disabled={!canScrollRight}>›</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Empty state ── */}
      {!loading && offers.length === 0 && (
        <div className="empty-state">
          <FaPlane className={`empty-icon ${isRTL ? 'flip-plane' : ''}`} />
          <p>{t.noResults}</p>
        </div>
      )}

      <style jsx>{`
        /* ─── Base ─── */
        .ndc-page {
          font-family: 'Tajawal', sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #e9edf5 100%);
          min-height: 100vh;
        }

        /* ─── Hero ─── */
        .ndc-hero {
          position: relative;
          min-height: 2vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          padding: 120px 24px 160px;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(138,119,121,0.95) 0%, rgba(239,200,174,0.85) 100%);
          z-index: 1;
        }
        .hero-body {
          position: relative;
          z-index: 2;
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
          color: #fff;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.3);
          padding: 8px 20px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
          letter-spacing: 0.4px;
        }
        .hero-title {
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 800;
          margin-bottom: 14px;
          line-height: 1.2;
        }
        .hero-sub {
          font-size: clamp(1rem, 2.5vw, 1.3rem);
          opacity: 0.9;
          margin-bottom: 8px;
        }
        .hero-desc {
          font-size: clamp(0.9rem, 2vw, 1.05rem);
          opacity: 0.75;
        }

        /* ─── Search Card ─── */
        .search-wrapper {
          max-width: 1100px;
          margin: -60px auto 0;
          padding: 0 16px;
          position: relative;
          z-index: 10;
        }
        .search-card {
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.13);
          border: 1px solid rgba(255,255,255,0.8);
          padding: 28px 28px 22px;
        }

        /* Trip tabs + topbar */
        .search-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 22px;
        }
        .trip-tabs {
          display: flex;
          background: #f1f5f9;
          border-radius: 999px;
          padding: 4px;
          gap: 2px;
        }
        .trip-tab {
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          background: transparent;
          color: #555;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .trip-tab.active {
          background: linear-gradient(135deg, #10b981, #3b82f6);
          color: #fff;
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
        }
        .miles-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .miles-toggle input { display: none; }
        .miles-check {
          width: 18px; height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          position: relative;
        }
        .miles-toggle input:checked + .miles-check {
          background: linear-gradient(135deg, #10b981, #3b82f6);
          border-color: #10b981;
        }
        .miles-toggle input:checked + .miles-check::after {
          content: "✓";
          color: white;
          font-size: 11px;
          line-height: 1;
        }
        .miles-label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        /* Fields grid */
        .search-fields {
          display: grid;
          grid-template-columns: 1fr auto 1fr 1fr 1fr 1fr 1fr;
          gap: 12px;
          align-items: end;
          margin-bottom: 18px;
        }

        @media (max-width: 1024px) {
          .search-fields {
            grid-template-columns: 1fr auto 1fr 1fr;
          }
        }

        @media (max-width: 768px) {
          .search-fields {
            grid-template-columns: 1fr auto 1fr;
          }
        }

        @media (max-width: 600px) {
          .search-fields {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .swap-btn {
            width: 40px;
            height: 40px;
            align-self: center;
            justify-self: center;
            transform: rotate(90deg);
          }
        }

        /* Swap */
        .swap-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 2px solid #10b981;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #10b981;
          font-size: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          align-self: end;
          margin-bottom: 2px;
          box-shadow: 0 4px 12px rgba(16,185,129,0.2);
        }
        .swap-btn:hover {
          background: linear-gradient(135deg,#10b981,#059669);
          border-color: #10b981;
          color: #fff;
          transform: rotate(180deg) scale(1.1);
          box-shadow: 0 8px 24px rgba(16,185,129,0.35);
        }
        .swap-btn:active {
          transform: rotate(180deg) scale(0.95);
        }

        /* Field group */
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-group.field-disabled { opacity: 0.45; pointer-events: none; }
        .field-label {
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          padding-inline-start: 4px;
        }
        .field-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.2s;
          overflow: visible;
        }
        .field-input-wrap:focus-within {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
          background: #fff;
        }
        :global(.field-icon) {
          position: absolute;
          left: 12px;
          right: auto;
          font-size: 15px;
          color: #10b981;
          pointer-events: none;
          z-index: 10;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          transition: all 0.3s ease;
        }
        
        :global([dir="rtl"]) :global(.field-icon) {
          left: auto;
          right: 12px;
        }
        
        .field-input-wrap:hover :global(.field-icon) {
          color: #059669;
          transform: translateY(-50%) scale(1.15);
        }
        
        :global(.fa-plane) {
          animation: flight-hover 3s ease-in-out infinite;
        }
        
        @keyframes flight-hover {
          0%, 100% { transform: translateY(-50%) translateX(0); }
          50% { transform: translateY(-50%) translateX(2px); }
        }
        
        :global(.flip-plane) {
          transform: translateY(-50%) scaleX(-1);
          animation: flight-hover-flip 3s ease-in-out infinite;
        }
        
        @keyframes flight-hover-flip {
          0%, 100% { transform: translateY(-50%) scaleX(-1) translateX(0); }
          50% { transform: translateY(-50%) scaleX(-1) translateX(-2px); }
        }
        
        /* Special styling for passenger and cabin icons */
        :global(.fa-user) {
          color: #3b82f6 !important;
          animation: pulse-icon 2s ease-in-out infinite;
        }
        
        :global(.fa-award) {
          color: #f59e0b !important;
          animation: rotate-icon 3s linear infinite;
        }
        
        @keyframes pulse-icon {
          0%, 100% { transform: translateY(-50%) scale(1); }
          50% { transform: translateY(-50%) scale(1.2); opacity: 0.8; }
        }
        
        @keyframes rotate-icon {
          0% { transform: translateY(-50%) rotate(0deg); }
          100% { transform: translateY(-50%) rotate(360deg); }
        }
        
        .field-input {
          width: 100%;
          height: 46px;
          padding: 0 12px 0 36px;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          font-family: inherit;
        }
        
        :global([dir="rtl"]) .field-input {
          padding: 0 36px 0 12px;
          text-align: right;
        }
        
        .field-input::placeholder { 
          color: #9ca3af; 
          direction: ltr;
        }
        :global([dir="rtl"]) .field-input::placeholder { 
          direction: rtl;
          text-align: right;
        }
        .field-select {
          cursor: pointer;
          appearance: none;
          -webkit-appearance: none;
        }
        .date-input::-webkit-calendar-picker-indicator {
          opacity: 0.5;
          cursor: pointer;
          margin-inline-end: 4px;
        }

        :global([dir="rtl"]) .date-input::-webkit-calendar-picker-indicator {
          margin-right: 4px;
          margin-left: auto;
        }

        /* Passengers dropdown */
        .pax-display {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
        }
        :global(.pax-chevron) {
          position: absolute;
          inset-inline-end: 12px;
          font-size: 11px;
          color: #6b7280;
          transition: transform 0.2s;
        }
        
        :global([dir="rtl"]) :global(.pax-chevron) {
          left: 12px;
          right: auto;
        }
        
        :global(.pax-chevron.open) { transform: rotate(180deg); }
        .pax-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          inset-inline-start: 0;
          width: 260px;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.12);
          padding: 16px;
          z-index: 100;
        }
        .pax-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .pax-row:last-child { border-bottom: none; }
        .pax-info { display: flex; flex-direction: column; gap: 2px; }
        .pax-label { font-size: 14px; font-weight: 600; color: #1f2937; }
        .pax-sub { font-size: 11px; color: #9ca3af; }
        .pax-counter { display: flex; align-items: center; gap: 10px; }
        .pax-btn {
          width: 28px; height: 28px;
          border-radius: 50%;
          border: 1.5px solid #e5e7eb;
          background: #f9fafb;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #374151;
          transition: all 0.2s;
        }
        .pax-btn:hover:not(:disabled) {
          background: linear-gradient(135deg,#10b981,#3b82f6);
          border-color: #10b981;
          color: #fff;
        }
        .pax-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .pax-num { font-size: 16px; font-weight: 700; color: #1f2937; min-width: 20px; text-align: center; }
        .pax-done {
          width: 100%;
          margin-top: 12px;
          padding: 10px;
          background: linear-gradient(135deg,#10b981,#3b82f6);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .pax-done:hover { opacity: 0.9; }

        /* Error */
        .search-error {
          display: flex;
          align-items: center;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 14px;
        }

        /* Search button */
        .search-action { display: flex; justify-content: center; }
        .search-btn {
          display: inline-flex;
          align-items: center;
          padding: 14px 40px;
          background: linear-gradient(135deg,#10b981,#3b82f6);
          color: #fff;
          border: none;
          border-radius: 999px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(16,185,129,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
          letter-spacing: 0.3px;
          font-family: inherit;
        }
        .search-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(16,185,129,0.45);
        }
        .search-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* ─── Shared layout ─── */
        .container-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .section-title {
          font-size: clamp(1.3rem, 3vw, 1.8rem);
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 20px;
        }

        /* ─── Results ─── */
        .results-section { padding: 60px 0; }
        .results-list { display: flex; flex-direction: column; gap: 14px; margin-top: 24px; }
        
        .flight-card {
          background: #fff;
          border-radius: 16px;
          padding: 16px 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .flight-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          border-color: #3b82f6;
          transform: translateY(-2px);
        }
        
        /* Left Section */
        .flight-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 0 0 auto;
          min-width: 280px;
        }
        
        .airline-logo {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .airline-badge {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 800;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          flex-shrink: 0;
        }
        
        .flight-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .departure-time {
          font-size: 15px;
          font-weight: 700;
          color: #1f2937;
        }
        
        .route-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }
        
        .route-arrow {
          color: #9ca3af;
          font-weight: 600;
        }
        
        .stops-badge {
          display: inline-block;
          background: #f3f4f6;
          color: #6b7280;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .arrival-time {
          font-size: 15px;
          font-weight: 700;
          color: #1f2937;
        }
        
        .arrival-time sup {
          font-size: 12px;
          font-weight: 600;
          margin-left: 2px;
        }
        
        .route-code {
          font-size: 12px;
          color: #9ca3af;
          font-weight: 500;
        }
        
        /* Middle Section */
        .flight-details {
          display: flex;
          gap: 28px;
          flex: 1;
          min-width: 300px;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .detail-label {
          font-size: 11px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .detail-value {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }
        
        .detail-item.amenities {
          align-items: flex-start;
        }
        
        .amenity-icons {
          display: flex;
          gap: 8px;
        }
        
        .amenity-icon {
          width: 28px;
          height: 28px;
          background: #f3f4f6;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: help;
        }
        
        /* Right Section */
        .flight-right {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 0 0 auto;
        }
        
        .flight-number {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          padding-right: 12px;
          border-right: 1px solid #e5e7eb;
        }
        
        .number-label {
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
        }
        
        .number-value {
          font-size: 18px;
          font-weight: 800;
          color: #1f2937;
        }
        
        .check-fare-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
        }
        
        .check-fare-btn:hover {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 100%);
          box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4);
          transform: translateY(-1px);
        }
        
        .dropdown-icon {
          font-size: 10px;
          margin-left: 4px;
          transition: transform 0.3s ease;
        }
        
        .dropdown-icon.rotated {
          transform: rotate(180deg);
        }
        
        .check-fare-btn.active {
          background: linear-gradient(135deg, #0e7490 0%, #0891b2 100%);
          box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4);
        }
        
        /* Fare Selection Expanded */
        .flight-card-wrapper {
          display: contents;
        }
        
        .flight-card-wrapper.expanded .flight-card {
          border-bottom: none;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
        
        .fare-selection-expanded {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-top: none;
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
          padding: 24px;
          margin: 0 14px 14px 14px;
          animation: slideDown 0.3s ease;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            overflow: hidden;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }
        
        .fare-header {
          margin-bottom: 28px;
        }
        
        .fare-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }
        
        .fare-header p {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
        
        .fare-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }
        
        .fare-card {
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
        }
        
        .fare-card:hover {
          border-color: #0891b2;
          box-shadow: 0 8px 24px rgba(8, 145, 178, 0.12);
        }
        
        .fare-card.premium {
          background: linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%);
          border-color: #0891b2;
        }
        
        .fare-header-section {
          margin-bottom: 16px;
        }
        
        .fare-name {
          font-size: 13px;
          font-weight: 700;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 8px 0;
        }
        
        .fare-price {
          display: flex;
          align-items: baseline;
          gap: 2px;
        }
        
        .fare-price .symbol {
          font-size: 18px;
          font-weight: 700;
          color: #0891b2;
        }
        
        .fare-price .amount {
          font-size: 32px;
          font-weight: 800;
          color: #0891b2;
        }
        
        .fare-installment {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6b7280;
          margin: 0 0 16px 0;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .fare-installment .emoji {
          font-size: 16px;
        }
        
        .fare-section {
          margin-bottom: 16px;
        }
        
        .fare-section h5 {
          font-size: 13px;
          font-weight: 700;
          color: #1f2937;
          text-transform: capitalize;
          margin: 0 0 8px 0;
        }
        
        .fare-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #4b5563;
          margin-bottom: 6px;
        }
        
        .fare-item:last-child {
          margin-bottom: 0;
        }
        
        .fare-item .checkmark {
          color: #10b981;
          font-weight: 700;
          flex-shrink: 0;
        }
        
        .fare-item .icon {
          font-size: 14px;
          flex-shrink: 0;
        }
        
        .benefits-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .benefits-header h5 {
          margin: 0;
        }
        
        .info-icon {
          font-size: 16px;
          cursor: help;
        }
        
        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 8px;
          background: #f0fdf4;
          border-radius: 8px;
          margin-bottom: 8px;
        }
        
        .benefit-item:last-child {
          margin-bottom: 0;
        }
        
        .benefit-icon {
          font-size: 16px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .benefit-title {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .benefit-desc {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }
        
        .select-fare-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          margin-top: 4px;
        }
        
        .select-fare-btn:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          transform: translateY(-1px);
        }
        
        .flight-price-mobile {
          display: none;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .flight-card {
            flex-wrap: wrap;
            align-items: flex-start;
            gap: 12px;
            padding: 12px 16px;
          }
          
          .flight-left {
            flex: 0 0 100%;
            min-width: auto;
          }
          
          .flight-details {
            flex: 0 0 100%;
            gap: 16px;
            min-width: auto;
          }
          
          .flight-right {
            flex: 0 0 100%;
            justify-content: space-between;
            border-right: none;
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
          }
          
          .flight-number {
            border-right: none;
            flex: 1;
          }
          
          .check-fare-btn {
            flex: 1;
            justify-content: center;
          }
          
          .flight-price-mobile {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            flex: 0 0 100%;
            padding-top: 12px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
          }
          
          .price-value {
            font-size: 22px;
            font-weight: 800;
            color: #0891b2;
          }
          
          .price-label {
            font-size: 12px;
            color: #9ca3af;
          }
        }

        /* ─── Recent ─── */
        .recent-section { padding: 40px 0; background: #f8fafc; }
        .chips-wrap { display: flex; flex-wrap: wrap; gap: 10px; }
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .chip:hover { background: #d1fae5; }
        :global(.chip-icon) { font-size: 11px; color: #10b981; }
        .chip-remove {
          width: 20px; height: 20px;
          border-radius: 50%;
          background: rgba(255,255,255,0.8);
          border: 1px solid #a7f3d0;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #10b981;
          transition: all 0.2s;
        }
        .chip-remove:hover { background: #10b981; color: #fff; }

        /* ─── Exclusive Offers ─── */
        .offers-section { padding: 48px 0; }
        .offers-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .explore-btn {
          font-size: 14px;
          font-weight: 700;
          color: #3b82f6;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.2s;
        }
        .explore-btn:hover { color: #1d4ed8; }
        .offers-carousel { position: relative; overflow: visible; }
        .offers-grid {
          display: flex;
          gap: 18px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding: 0 56px 6px; /* room for arrows */
          scroll-padding-inline: 56px;
          justify-content: flex-start;
        }
        .offers-grid.centered { justify-content: center; }        .offers-grid::-webkit-scrollbar { display: none; }
        .exc-card {
          background: linear-gradient(135deg, #f0fdf4, #eff6ff);
          border: 1.5px solid #e5e7eb;
          border-radius: 18px;
          padding: 22px;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(0,0,0,0.05);
          min-width: 300px;
          flex: 0 0 300px;
          scroll-snap-align: center;
        }
        .exc-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.09);
          border-color: #10b981;
        }
        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 52px;
          height: 52px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.06);
          background: rgba(255,255,255,0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          z-index: 9999; /* ensure clickable above other elements */
          pointer-events: auto;
        }
        .carousel-btn.prev { left: -56px; }
        .carousel-btn.next { right: -56px; }
        .carousel-btn:disabled { opacity: 0.35; cursor: default; }
        .carousel-controls { display:flex; align-items:center; justify-content:center; gap:18px; margin-top:12px; }
        .carousel-dots { display:flex; gap:8px; align-items:center; }
        .carousel-dots .dot { width:8px; height:8px; border-radius:999px; background:rgba(0,0,0,0.12); border:none; cursor:pointer; }
        .carousel-dots .dot.active { background: linear-gradient(90deg,#10b981,#3b82f6); box-shadow:0 4px 10px rgba(16,185,129,0.2); transform:scale(1.2); }

        @media (max-width: 900px) {
          .exc-card { min-width: 260px; flex: 0 0 260px; }
          .carousel-btn.prev { left: 8px; }
          .carousel-btn.next { right: 8px; }
          .offers-grid { padding: 0 12px 6px; scroll-padding-inline: 12px; }
        }
        .exc-discount {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #7c3aed;
          background: #f5f3ff;
          padding: 3px 10px;
          border-radius: 999px;
          display: inline-block;
          margin-bottom: 10px;
        }
        .exc-title {
          font-size: 18px;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .exc-code-wrap { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .exc-code-label { font-size: 12px; color: #6b7280; }
        .exc-code {
          font-family: 'Courier New', monospace;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 3px 10px;
          font-size: 13px;
          font-weight: 700;
          color: #1f2937;
          letter-spacing: 0.5px;
        }

        /* ─── Empty state ─── */
        .empty-state {
          padding: 80px 16px;
          text-align: center;
          color: #9ca3af;
        }
        :global(.empty-icon) {
          font-size: 64px;
          color: #d1d5db;
          margin-bottom: 16px;
        }
        .empty-state p { font-size: 18px; font-weight: 500; }

        /* ─── RTL Support (Arabic) ─── */
        :global([dir="rtl"]) {
          direction: rtl;
        }

        :global([dir="rtl"]) .search-topbar {
          flex-direction: row-reverse;
        }

        :global([dir="rtl"]) .trip-tabs {
          flex-direction: row-reverse;
        }

        :global([dir="rtl"]) .search-fields {
          direction: rtl;
        }

        :global([dir="rtl"]) .swap-btn {
          transform: scaleX(-1);
        }

        :global([dir="rtl"]) .swap-btn:hover {
          transform: scaleX(-1) rotate(180deg) scale(1.1);
        }
        
        :global([dir="rtl"]) .swap-btn:active {
          transform: scaleX(-1) scale(0.95);
        }

        :global([dir="rtl"]) .search-btn {
          flex-direction: row-reverse;
        }

        :global([dir="rtl"]) .search-btn svg {
          margin-right: 0 !important;
          margin-left: 8px !important;
        }

        :global([dir="rtl"]) .field-label {
          text-align: right;
          padding-inline-start: 0;
          padding-inline-end: 4px;
        }

        :global([dir="rtl"]) .field-icon {
          left: auto !important;
          right: 12px !important;
          transform: translateY(-50%) !important;
        }
        
        :global([dir="rtl"]) .flip-plane {
          transform: translateY(-50%) scaleX(-1) !important;
        }

        :global([dir="rtl"]) .field-input {
          text-align: right;
          padding: 0 36px 0 12px;
          direction: rtl;
        }
        
        :global([dir="rtl"]) .field-input-wrap {
          direction: rtl;
        }

        :global([dir="rtl"]) .field-select {
          text-align: right;
          padding: 0 36px 0 12px;
        }

        :global([dir="rtl"]) .date-input {
          text-align: right;
          padding: 0 36px 0 12px;
        }

        :global([dir="rtl"]) .pax-dropdown {
          inset-inline-start: auto;
          inset-inline-end: 0;
          text-align: right;
        }

        :global([dir="rtl"]) .pax-counter {
          flex-direction: row-reverse;
        }

        :global([dir="rtl"]) .pax-row {
          flex-direction: row-reverse;
        }

        :global([dir="rtl"]) .search-error {
          text-align: right;
          flex-direction: row-reverse;
        }

        /* RTL Flight Cards */
        :global([dir="rtl"]) .flight-card {
          flex-direction: row-reverse;
        }

        :global([dir="rtl"]) .flight-left {
          flex-direction: row-reverse;
        }

        :global([dir="rtl"]) .flight-details {
          flex-direction: row-reverse;
        }

        :global([dir="rtl"]) .flight-right {
          flex-direction: row-reverse;
        }

        :global([dir="rtl"]) .flight-number {
          border-right: none;
          border-left: 1px solid #e5e7eb;
          align-items: flex-start;
          padding-left: 12px;
          padding-right: 0;
        }

        :global([dir="rtl"]) .detail-item {
          text-align: right;
        }

        :global([dir="rtl"]) .check-fare-btn {
          flex-direction: row-reverse;
        }

        /* RTL Fare Cards */
        :global([dir="rtl"]) .fare-card {
          text-align: right;
        }

        :global([dir="rtl"]) .fare-section {
          text-align: right;
        }

        :global([dir="rtl"]) .fare-item {
          flex-direction: row-reverse;
        }

        :global([dir="rtl"]) .benefit-item {
          flex-direction: row-reverse;
          text-align: right;
        }

        :global([dir="rtl"]) .benefits-header {
          flex-direction: row-reverse;
          text-align: right;
        }

        /* ─── Responsive ─── */
        @media (max-width: 900px) {
          .search-card { padding: 20px 16px 18px; }
          .search-fields {
            grid-template-columns: 1fr 1fr;
          }
          .swap-btn { display: none; }
        }

        @media (max-width: 560px) {
          .search-wrapper { margin-top: -40px; }
          .search-fields { grid-template-columns: 1fr; }
          .search-topbar { flex-direction: column; align-items: flex-start; }
          .trip-tabs { width: 100%; }
          .trip-tab { flex: 1; text-align: center; }
          .search-btn { width: 100%; justify-content: center; padding: 14px 20px; }
          .pax-dropdown { width: 100%; inset-inline-start: 0; inset-inline-end: 0; }
        }
      `}</style>
    </div>
  );
}