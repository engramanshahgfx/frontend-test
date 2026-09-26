"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FaGlobe,
  FaHotel,
  FaPlane,
  FaTag,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaStar,
  FaClock,
  FaWhatsapp,
} from "react-icons/fa";
import BookingModal from "../../components/IslandDestinations/BookingModal"; // Import the modal component
import { API_URL } from "../../lib/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function InternationalContent({ 
  lang,
  initialFlights = [],
  initialHotels = [],
  initialPackages = [],
  initialDestinations = []
}) {
  const [activeTab, setActiveTab] = useState("flights");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingData, setSelectedBookingData] = useState({
    type: "flight",
    destination: null,
  });

  // State for dynamic data from API - initialize with SSR data
  const [flights, setFlights] = useState(initialFlights || []);
  const [hotels, setHotels] = useState(initialHotels || []);
  const [packages, setPackages] = useState(initialPackages || []);
  const [destinations, setDestinations] = useState(initialDestinations || []);
  const [loading, setLoading] = useState(false); // Start with false since we have initial data
  const [error, setError] = useState(null);

  // Transparent 1x1 data URI used to avoid 404 when image is invalid/missing
  const TRANSPARENT_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  
  // Refs for scrolling to sections
  const flightsSectionRef = useRef(null);
  const hotelsSectionRef = useRef(null);
  const destinationsSectionRef = useRef(null);

  // Swiper instances (used to control slides programmatically)
  const flightsSwiperRef = useRef(null);
  const hotelsSwiperRef = useRef(null);
  const packagesSwiperRef = useRef(null);
  const destinationsSwiperRef = useRef(null);

  // Static content for UI labels (fallback)
  const content = {
    en: {
      pageTitle: "International Travel",
      pageSubtitle: "Explore the world with our premium international travel services",
      searchTitle: "Book Your International Trip",
      searchSubtitle: "Find the best deals for flights, hotels, and packages worldwide",
      flightTab: "Flights",
      hotelTab: "Hotels",
      offersTab: "Packages",
      departure: "Departure",
      arrival: "Arrival",
      noFlights: "No flights available",
      noHotels: "No hotels available",
      noPackages: "No packages available",
      popularDestinationsTab: "Popular Destinations",
      popularDestinations: "Popular Destinations",
      featuredPackages: "Featured International Packages",
      whyChooseUs: "Why Choose Our International Services",
      travelTips: "International Travel Tips",
      bookNow: "Reservation",
      viewDetails: "View Details",
      contactUs: "Contact Us",
      needHelp: "Need Help?",
      contactSupport: "Contact our support team",
      features: [
        {
          icon: <FaGlobe />,
          title: "Global Network",
          description: "Access to 500+ airlines and 200,000+ hotels worldwide"
        },
        {
          icon: <FaCheckCircle />,
          title: "Best Price Guarantee",
          description: "We guarantee the best prices for all our international packages"
        },
        {
          icon: <FaStar />,
          title: "Premium Support",
          description: "24/7 customer support in multiple languages"
        },
        {
          icon: <FaStar />,
          title: "Group Discounts",
          description: "Special discounts for family and group bookings"
        }
      ],
      tips: [
        "Check passport validity (minimum 6 months)",
        "Research visa requirements for your destination",
        "Purchase comprehensive travel insurance",
        "Notify your bank about international travel",
        "Download offline maps and translation apps",
        "Learn basic local phrases"
      ]
    },

    ar: {
      pageTitle: "السفر الدولي",
      pageSubtitle: "استكشف العالم مع خدمات السفر الدولية المميزة لدينا",
      searchTitle: "احجز رحلتك الدولية",
      searchSubtitle: "ابحث عن أفضل العروض للطيران، الفنادق، والحزم حول العالم",
      flightTab: "الطيران",
      hotelTab: "الفنادق",
      offersTab: "الباقات ",
      departure: "المغادرة",
      arrival: "الوصول",
      noFlights: "لا توجد رحلات متاحة",
      noHotels: "لا توجد فنادق متاحة",
      noPackages: "لا توجد باقات متاحة",
      popularDestinationsTab: "الوجهات المفضلة",
      popularDestinations: "الوجهات المفضلة",
      featuredPackages: "الحزم الدولية المميزة",
      whyChooseUs: "لماذا تختار خدماتنا الدولية",
      travelTips: "نصائح السفر الدولي",
      bookNow: "حجز",
      viewDetails: "عرض التفاصيل",
      contactUs: "تواصل معنا",
      needHelp: "هل تحتاج مساعدة؟",
      contactSupport: "تواصل مع فريق الدعم لدينا",
      features: [
        {
          icon: <FaGlobe />,
          title: "شبكة عالمية",
          description: "الوصول إلى ٥٠٠+ شركة طيران و٢٠٠,٠٠٠+ فندق حول العالم"
        },
        {
          icon: <FaCheckCircle />,
          title: "ضمان أفضل سعر",
          description: "نضمن أفضل الأسعار لجميع حزمنا الدولية"
        },
        {
          icon: <FaStar />,
          title: "دعم مميز",
          description: "دعم العملاء ٢٤/٧ بلغات متعددة"
        },
        {
          icon: <FaStar />,
          title: "خصومات المجموعات",
          description: "خصومات خاصة لحجوزات العائلات والمجموعات"
        }
      ],
      tips: [
        "تحقق من صلاحية الجواز (الحد الأدنى ٦ أشهر)",
        "ابحث عن متطلبات التأشيرات لوجهتك",
        "اشترِ تأمين سفر شامل",
        "أبلغ بنكك عن السفر الدولي",
        "حمّل خرائط وتطبيقات ترجمة دون اتصال",
        "تعلّم بعض العبارات المحلية الأساسية"
      ]
    },
 
  };

  const t = content[lang] || content.ar;
  const isRTL = lang === "ar";
  const flightCount = flights.length;
  const hotelCount = hotels.length;
  const packageCount = packages.length;
  const destinationCount = destinations.length;
  const flightBreakpoints = {
    576: { slidesPerView: 1 },
    768: { slidesPerView: Math.min(2, Math.max(flightCount, 1)) },
    992: { slidesPerView: Math.min(3, Math.max(flightCount, 1)) },
    1200: { slidesPerView: Math.min(4, Math.max(flightCount, 1)) },
  };
  const hotelBreakpoints = {
    576: { slidesPerView: 1 },
    768: { slidesPerView: Math.min(2, Math.max(hotelCount, 1)) },
    992: { slidesPerView: Math.min(3, Math.max(hotelCount, 1)) },
    1200: { slidesPerView: Math.min(4, Math.max(hotelCount, 1)) },
  };
  const packageBreakpoints = {
    576: { slidesPerView: 1 },
    768: { slidesPerView: Math.min(2, Math.max(packageCount, 1)) },
    992: { slidesPerView: Math.min(3, Math.max(packageCount, 1)) },
    1200: { slidesPerView: Math.min(4, Math.max(packageCount, 1)) },
  };
  const destinationBreakpoints = {
    576: { slidesPerView: 1 },
    768: { slidesPerView: Math.min(2, Math.max(destinationCount, 1)) },
    992: { slidesPerView: Math.min(3, Math.max(destinationCount, 1)) },
    1200: { slidesPerView: Math.min(4, Math.max(destinationCount, 1)) },
  };

  // Slider state
  const [currentFlightIndex, setCurrentFlightIndex] = useState(0);
  const [currentHotelIndex, setCurrentHotelIndex] = useState(0);
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0);

  // Visible count for responsive slider (desktop:4, tablet:2, mobile:1)
  const [visibleCount, setVisibleCount] = useState(4);

  // Refs for slider containers (used to compute pixel transform)
  const flightsContainerRef = useRef(null);
  const hotelsContainerRef = useRef(null);
  const packagesContainerRef = useRef(null);
  const destinationsContainerRef = useRef(null);

  // Re-render trigger for resize measurements
  const [measureKey, setMeasureKey] = useState(0);
  const GAP = 16; // px

  useEffect(() => {
    const updateVisible = () => {
      const w = window.innerWidth;
      if (w >= 1200) setVisibleCount(4);
      else if (w >= 768) setVisibleCount(2);
      else setVisibleCount(1);
      setMeasureKey(k => k + 1);
      console.debug('[slider] viewport', w, 'visibleCount', visibleCount);
    };

    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  const getMaxIndex = (length) => Math.max(0, length - visibleCount);

  const logAndSet = (setter, updater, type) => {
    setter(prev => {
      const next = updater(prev);
      console.debug(`[slider] ${type} index:`, prev, '->', next);
      return next;
    });
  };

  const nextSlide = (type, length) => {
    const maxIdx = getMaxIndex(length);
    const small = (length || 0) <= visibleCount;
    switch (type) {
      case 'flights':
        logAndSet(setCurrentFlightIndex, (i) => {
          if (small && length > 1) return (i + 1) % length; // advance by 1 when items <= visibleCount
          return i >= maxIdx ? 0 : Math.min(i + visibleCount, maxIdx);
        }, 'flights');
        break;
      case 'hotels':
        logAndSet(setCurrentHotelIndex, (i) => {
          if (small && length > 1) return (i + 1) % length;
          return i >= maxIdx ? 0 : Math.min(i + visibleCount, maxIdx);
        }, 'hotels');
        break;
      case 'packages':
        logAndSet(setCurrentPackageIndex, (i) => {
          if (small && length > 1) return (i + 1) % length;
          return i >= maxIdx ? 0 : Math.min(i + visibleCount, maxIdx);
        }, 'packages');
        break;
      case 'destinations':
        logAndSet(setCurrentDestinationIndex, (i) => {
          if (small && length > 1) return (i + 1) % length;
          return i >= maxIdx ? 0 : Math.min(i + visibleCount, maxIdx);
        }, 'destinations');
        break;
      default:
    }
  };

  const prevSlide = (type, length) => {
    const maxIdx = getMaxIndex(length);
    const small = (length || 0) <= visibleCount;
    switch (type) {
      case 'flights':
        logAndSet(setCurrentFlightIndex, (i) => {
          if (small && length > 1) return (i - 1 + length) % length;
          return i <= 0 ? maxIdx : Math.max(i - visibleCount, 0);
        }, 'flights');
        break;
      case 'hotels':
        logAndSet(setCurrentHotelIndex, (i) => {
          if (small && length > 1) return (i - 1 + length) % length;
          return i <= 0 ? maxIdx : Math.max(i - visibleCount, 0);
        }, 'hotels');
        break;
      case 'packages':
        logAndSet(setCurrentPackageIndex, (i) => {
          if (small && length > 1) return (i - 1 + length) % length;
          return i <= 0 ? maxIdx : Math.max(i - visibleCount, 0);
        }, 'packages');
        break;
      case 'destinations':
        logAndSet(setCurrentDestinationIndex, (i) => {
          if (small && length > 1) return (i - 1 + length) % length;
          return i <= 0 ? maxIdx : Math.max(i - visibleCount, 0);
        }, 'destinations');
        break;
      default:
    }
  };

  const goToSlide = (type, pageIndex, length) => {
    const idx = pageIndex * visibleCount;
    const maxIdx = getMaxIndex(length);
    const clamped = Math.min(idx, maxIdx);
    switch (type) {
      case 'flights': setCurrentFlightIndex(clamped); break;
      case 'hotels': setCurrentHotelIndex(clamped); break;
      case 'packages': setCurrentPackageIndex(clamped); break;
      case 'destinations': setCurrentDestinationIndex(clamped); break;
      default: break;
    }

    // trigger re-measure to avoid stale widths after jumping
    setMeasureKey(k => k + 1);
  };

  // Helpers to compute measured widths/transforms for sliders
  const getContainerRef = (type) => {
    switch (type) {
      case 'flights': return flightsContainerRef.current;
      case 'hotels': return hotelsContainerRef.current;
      case 'packages': return packagesContainerRef.current;
      case 'destinations': return destinationsContainerRef.current;
      default: return null;
    }
  };

  const getSlideWidth = (type) => {
    const ref = getContainerRef(type);
    if (!ref) return null;
    const containerWidth = ref.offsetWidth || 0;
    const slideWidth = Math.floor((containerWidth - GAP * (visibleCount - 1)) / visibleCount);
    return slideWidth;
  };

  // Compute simple percent-based translate with GPU acceleration
  const computeTranslate = (type, index) => {
    const percent = (index * 100) / visibleCount;
    console.log(`[SLIDER] ${type} -> index=${index}, visibleCount=${visibleCount}, percent=${percent}%`);
    return `translate3d(-${percent}%, 0, 0)`;
  };

  // Helper to parse translate value from style transform. Returns percent (negative means left).
  // Accepts an optional containerWidth (px) to convert px -> percent when needed.
  const parseTranslate = (transform, containerWidth) => {
    if (!transform) return 0;
    // Try percent first: translate3d(-25%, 0, 0)
    let m = /translate3d\((-?\d+\.?\d*)%/.exec(transform);
    if (m) return parseFloat(m[1]);
    // Fallback: px values (translateX( -200px ) or translate3d(-200px,...))
    m = /translateX\((-?\d+\.?\d*)px\)/.exec(transform) || /translate3d\((-?\d+\.?\d*)px/.exec(transform);
    if (m) {
      const px = parseFloat(m[1]);
      if (containerWidth && containerWidth > 0) {
        return (px / containerWidth) * 100; // convert px -> percent
      }
      return px;
    }
    return 0;
  }; 


  const flightsSlidesRef = useRef(null);
  const hotelsSlidesRef = useRef(null);
  const packagesSlidesRef = useRef(null);
  const destinationsSlidesRef = useRef(null);


  // Fetch data from API on component mount
  useEffect(() => {
    const fetchData = async () => {
   
      try {
        console.debug('[InternationalContent] Fetching data from backend API...');

        // Fetch flights, hotels, packages, and destinations from backend API in parallel
        const [flightsRes, hotelsRes, packagesRes, destinationsRes] = await Promise.all([
          fetch(`${API_URL}/international/flights`).catch(() => null),
          fetch(`${API_URL}/international/hotels`).catch(() => null),
          fetch(`${API_URL}/international/packages`).catch(() => null),
          fetch(`${API_URL}/international/destinations`).catch(() => null)
        ]);

        // Process flights response
        if (flightsRes && flightsRes.ok) {
          const flightsData = await flightsRes.json();
          const apiFlights = flightsData.data || flightsData;
          if (Array.isArray(apiFlights)) {
            console.log('[InternationalContent] ✓ Flights from API:', apiFlights.length, 'items');
            setFlights(apiFlights);
          } else {
            console.log('[InternationalContent] Flights API returned non-array payload; keeping SSR data');
            setFlights(Array.isArray(initialFlights) ? initialFlights : []);
          }
        } else {
          console.log('[InternationalContent] Flights API unavailable; keeping SSR data');
          setFlights(Array.isArray(initialFlights) ? initialFlights : []);
        }

        // Process hotels response
        if (hotelsRes && hotelsRes.ok) {
          const hotelsData = await hotelsRes.json();
          const apiHotels = hotelsData.data || hotelsData;
          if (Array.isArray(apiHotels)) {
            console.log('[InternationalContent] ✓ Hotels from API:', apiHotels.length, 'items');
            setHotels(apiHotels);
          } else {
            console.log('[InternationalContent] Hotels API returned non-array payload; keeping SSR data');
            setHotels(Array.isArray(initialHotels) ? initialHotels : []);
          }
        } else {
          console.log('[InternationalContent] Hotels API unavailable; keeping SSR data');
          setHotels(Array.isArray(initialHotels) ? initialHotels : []);
        }

        // Process packages response
        if (packagesRes && packagesRes.ok) {
          const packagesData = await packagesRes.json();
          const apiPackages = packagesData.data || packagesData;
          if (Array.isArray(apiPackages)) {
            console.log('[InternationalContent] ✓ Packages from API:', apiPackages.length, 'items');
            setPackages(apiPackages);
          } else {
            console.log('[InternationalContent] Packages API returned non-array payload; keeping SSR data');
            setPackages(Array.isArray(initialPackages) ? initialPackages : []);
          }
        } else {
          console.log('[InternationalContent] Packages API unavailable; keeping SSR data');
          setPackages(Array.isArray(initialPackages) ? initialPackages : []);
        }

        // Process destinations response
        if (destinationsRes && destinationsRes.ok) {
          const destinationsData = await destinationsRes.json();
          const apiDestinations = destinationsData.data || destinationsData;
          if (Array.isArray(apiDestinations)) {
            console.log('[InternationalContent] ✓ Destinations from API:', apiDestinations.length, 'items');
            setDestinations(apiDestinations);
          } else {
            console.log('[InternationalContent] Destinations API returned non-array payload; keeping SSR data');
            setDestinations(Array.isArray(initialDestinations) ? initialDestinations : []);
          }
        } else {
          console.log('[InternationalContent] Destinations API unavailable; keeping SSR data');
          setDestinations(Array.isArray(initialDestinations) ? initialDestinations : []);
        }

        setError(null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching international data:', err);
        // Keep SSR data on client fetch errors.
        setFlights(Array.isArray(initialFlights) ? initialFlights : []);
        setHotels(Array.isArray(initialHotels) ? initialHotels : []);
        setPackages(Array.isArray(initialPackages) ? initialPackages : []);
        setDestinations(Array.isArray(initialDestinations) ? initialDestinations : []);
        setError(null);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Re-measure when data or visible count changes so transforms are recalculated
  useEffect(() => {
    setMeasureKey(k => k + 1);

    // clamp current indices to valid ranges when length or visibleCount changes
    setCurrentFlightIndex((i) => Math.max(0, Math.min(i, getMaxIndex(flights.length))));
    setCurrentHotelIndex((i) => Math.max(0, Math.min(i, getMaxIndex(hotels.length))));
    setCurrentPackageIndex((i) => Math.max(0, Math.min(i, getMaxIndex(packages.length))));
    setCurrentDestinationIndex((i) => Math.max(0, Math.min(i, getMaxIndex(destinations.length))));

    // schedule a couple of re-measures after layout settle (images may load after render)
    const t1 = setTimeout(() => setMeasureKey(k => k + 1), 120);
    const t2 = setTimeout(() => setMeasureKey(k => k + 1), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [flights.length, hotels.length, packages.length, destinations.length, visibleCount]);

  // Re-measure when containers resize (covers image load, layout shifts)
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;
    const elements = [
      flightsContainerRef.current,
      hotelsContainerRef.current,
      packagesContainerRef.current,
      destinationsContainerRef.current,
    ].filter(Boolean);

    const observers = elements.map((el) => {
      const ro = new ResizeObserver(() => setMeasureKey(k => k + 1));
      ro.observe(el);
      return ro;
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [measureKey]);

  // Manual pointer/drag handlers removed — Swiper handles pointer/touch gestures and momentum natively.

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#fff' }}>
        <p>Loading international travel data...</p>
      </div>
    );
  }

  // Helper functions to get localized data
  const getFlightText = (flight, field) => {
    let fieldKey;
    if (lang === "zh") {
      fieldKey = `${field}_zh`;
    } else if (lang === "ar") {
      fieldKey = `${field}_ar`;
    } else {
      fieldKey = `${field}_en`;
    }
    return flight[fieldKey] || flight[`${field}_en`] || "";
  };

  const getHotelText = (hotel, field) => {
    let fieldKey;
    if (lang === "zh") {
      fieldKey = `${field}_zh`;
    } else if (lang === "ar") {
      fieldKey = `${field}_ar`;
    } else {
      fieldKey = `${field}_en`;
    }
    return hotel[fieldKey] || hotel[`${field}_en`] || "";
  };

  const getPackageText = (pkg, field) => {
    let fieldKey;
    if (lang === "zh") {
      fieldKey = `${field}_zh`;
    } else if (lang === "ar") {
      fieldKey = `${field}_ar`;
    } else {
      fieldKey = `${field}_en`;
    }
    return pkg[fieldKey] || pkg[`${field}_en`] || "";
  };

  const getDestinationText = (destination, field) => {
    // Handle both API format (title_en/description_en) and static format (name_en/description_en)
    let fieldKey;
    if (lang === "zh") {
      fieldKey = `${field}_zh`;
    } else if (lang === "ar") {
      fieldKey = `${field}_ar`;
    } else {
      fieldKey = `${field}_en`;
    }
    
    // If looking for 'name' but it doesn't exist, try 'title' (API uses title_en/title_ar/title_zh)
    if (field === 'name' && !destination[fieldKey]) {
      if (lang === "zh") {
        fieldKey = 'title_zh';
      } else if (lang === "ar") {
        fieldKey = 'title_ar';
      } else {
        fieldKey = 'title_en';
      }
    }
    
    return destination[fieldKey] || destination[`${field}_en`] || "";
  };

  // Safely parse a value that may be an array or a JSON-encoded array string
  const parseList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      // Try JSON.parse first (we store JSON strings from the API)
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // ignore parse error and fall back to comma-split
      }
      // Fallback: split comma-separated strings
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const normalizeImageUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return TRANSPARENT_IMAGE;
    const trimmed = rawUrl.trim();
    if (!trimmed) return TRANSPARENT_IMAGE;

    // Encode spaces and other unsafe characters while preserving the URL structure.
    if (/^https?:\/\//i.test(trimmed)) {
      return encodeURI(trimmed);
    }

    const base = (process.env.NEXT_PUBLIC_BACKEND_URL || '').trim().replace(/\/$/, '');
    if (base) {
      return encodeURI(`${base}/${trimmed.replace(/^\/+/, '')}`);
    }

    return encodeURI(trimmed);
  };

  // Handle tab click with scroll
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    
    // Scroll to the corresponding section
    setTimeout(() => {
      if (tab === "flights" && flightsSectionRef.current) {
        flightsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (tab === "hotels" && hotelsSectionRef.current) {
        hotelsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (tab === "popular" && destinationsSectionRef.current) {
        destinationsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Handle flight booking
  const handleFlightBooking = (flight) => {
    setSelectedBookingData({
      type: "flight",
      destination: {
        id: flight.id,
        title: getFlightText(flight, 'route'),
        description: `${getFlightText(flight, 'airline_en' === lang ? 'airline_en' : 'airline_ar')} - ${flight.duration} - ${getFlightText(flight, 'stops')}`,
        image: undefined,
        country_en: flight.country_en,
        country_ar: flight.country_ar,
        city_en: flight.city_en,
        city_ar: flight.city_ar,
        flightInfo: flight
      }
    });
    setIsBookingModalOpen(true);
  };

  // Handle hotel booking
  const handleHotelBooking = (hotel) => {
    setSelectedBookingData({
      type: "hotel",
      destination: {
        id: hotel.id,
        title: getHotelText(hotel, 'name'),
        description: getHotelText(hotel, 'location'),
        image: hotel.image || undefined,
        country_en: hotel.country_en,
        country_ar: hotel.country_ar,
        city_en: hotel.city_en,
        city_ar: hotel.city_ar,
        hotelInfo: hotel
      }
    });
    setIsBookingModalOpen(true);
  };

  // Handle package booking
  const handlePackageBooking = (pkg) => {
    setSelectedBookingData({
      type: "package",
      destination: {
        id: pkg.id,
        title: getPackageText(pkg, 'title'),
        description: getPackageText(pkg, 'description'),
        image: pkg.image || undefined,
        country_en: pkg.country_en,
        country_ar: pkg.country_ar,
        city_en: pkg.city_en,
        city_ar: pkg.city_ar,
        packageInfo: pkg
      }
    });
    setIsBookingModalOpen(true);
  };

  // Handle destination booking
  const handleDestinationBooking = (destination) => {
    setSelectedBookingData({
      type: "activity",
      destination: {
        id: destination.id,
        title: getDestinationText(destination, 'name'),
        description: getDestinationText(destination, 'description'),
        image: destination.image || undefined,
        country_en: destination.country_en,
        country_ar: destination.country_ar,
        city_en: destination.city_en,
        city_ar: destination.city_ar,
        destinationInfo: destination
      }
    });
    setIsBookingModalOpen(true);
  };

  // Handle contact button
  const handleContactSupport = () => {
    const message = isRTL 
      ? "أحتاج مساعدة في حجز رحلة دولية" 
      : "I need help booking an international trip";
    const whatsappUrl = `https://wa.me/+966533360423?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Close booking modal
  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedBookingData({
      type: "flight",
      destination: null,
    });
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="international-page">
      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        destination={selectedBookingData.destination}
        lang={lang}
        allowedTypes={selectedBookingData.type ? [selectedBookingData.type] : null}
      />

      {/* Hero Section */}
      <section className="hero-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="hero-content">
                <h1 className="hero-title">{t.pageTitle}</h1>
                <p className="hero-subtitle">{t.pageSubtitle}</p>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              {/* <FaGlobe className="hero-icon" /> */}
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs Section */}
      <section className="tabs-section py-5">
        <div className="container">
          <div className="tabs-container">
            <div className="text-center mb-5">
              <h2 className="tabs-title">{t.searchTitle}</h2>
              <p className="tabs-subtitle">{t.searchSubtitle}</p>
            </div>

            {/* Tab Navigation */}
            <div className="tabs-navigation">
              <button
                className={`tab-button ${activeTab === "flights" ? "active" : ""}`}
                onClick={() => handleTabClick("flights")}
              >
                <div className="tab-icon-wrapper">
                  <FaPlane className="tab-icon-main" />
                </div>
                <span className="tab-text">{t.flightTab}</span>
                <p className="tab-description">
                  {t.searchSubtitle}
                </p>
              </button>
              
              <button
                className={`tab-button ${activeTab === "hotels" ? "active" : ""}`}
                onClick={() => handleTabClick("hotels")}
              >
                <div className="tab-icon-wrapper">
                  <FaHotel className="tab-icon-main" />
                </div>
                <span className="tab-text">{t.hotelTab}</span>
                <p className="tab-description">
                  {t.searchSubtitle}
                </p>
              </button>
              
              
           

         
            </div>
          </div>
        </div>
      </section>

      {/* Flights Section */}
      <section className="content-section py-5" ref={flightsSectionRef}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">{t.flightTab}</h2>
            <div className="section-divider"></div>
          </div>

          <div className="slider-wrapper">
            <button className="slider-nav left" onClick={() => flightsSwiperRef.current?.slidePrev()} aria-label="Previous">
              <FaChevronLeft />
            </button>

            <Swiper
              onSwiper={(sw) => (flightsSwiperRef.current = sw)}
              modules={[Autoplay, Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              breakpoints={flightBreakpoints}
              autoplay={flightCount > 1 ? { delay: 3500, disableOnInteraction: false } : false}
              pagination={{ clickable: true, dynamicBullets: true }}
              loop={flightCount > 1}
              speed={600}
              className="swiper-flights"
            >
              {flights.length > 0 ? (
                flights.map((flight) => (
                  <SwiperSlide key={flight.id}>
                    <div className="destination-card">
                      <div className="flight-card-header">
                        <div className="airline-badge">
                          <FaPlane className="airline-icon" />
                          <span>{getFlightText(flight, 'airline')}</span>
                        </div>
                      </div>
                      <div className="destination-content">
                        <h4 className="destination-name">{getFlightText(flight, 'route')}</h4>
                        <div className="flight-times">
                          <div className="time-slot">
                            <span className="time-label">{t.departure}</span>
                            <span className="time-value">{flight.departure_time}</span>
                          </div>
                          <div className="flight-arrow"><FaPlane /></div>
                          <div className="time-slot">
                            <span className="time-label">{t.arrival}</span>
                            <span className="time-value">{flight.arrival_time}</span>
                          </div>
                        </div>
                        <div className="flight-details">
                          <span className="detail-tag"><FaClock className="detail-icon" /> {flight.duration}</span>
                          <span className="detail-tag">{getFlightText(flight, 'stops')}</span>
                        </div>
                        <div className="destination-footer">
                          <button className="btn btn-outline-primary" onClick={() => handleFlightBooking(flight)} style={{ background: '#EFC8AE', color: '#000', border: 'none' }}>{t.bookNow}</button>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))
              ) : (
                <div className="col-12 text-center" style={{color: '#5d6d7e'}}>
                  <p>{t.noFlights}</p>
                </div>
              )}
            </Swiper>

            <button className="slider-nav right" onClick={() => flightsSwiperRef.current?.slideNext()} aria-label="Next">
              <FaChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* Hotels Section */}
      <section className="content-section py-5 bg-light" ref={hotelsSectionRef}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">{t.hotelTab}</h2>
            <div className="section-divider"></div>
          </div>

          <div className="slider-wrapper">
            <button className="slider-nav left" onClick={() => hotelsSwiperRef.current?.slidePrev()} aria-label="Previous">
              <FaChevronLeft />
            </button>

            <Swiper
              onSwiper={(sw) => (hotelsSwiperRef.current = sw)}
              modules={[Autoplay, Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              breakpoints={hotelBreakpoints}
              autoplay={hotelCount > 1 ? { delay: 3500, disableOnInteraction: false } : false}
              pagination={{ clickable: true, dynamicBullets: true }}
              loop={hotelCount > 1}
              speed={600}
              className="swiper-hotels"
            >
              {hotels.length > 0 ? (
                hotels.map((hotel) => (
                  <SwiperSlide key={hotel.id}>
                    <div className="destination-card hotel-card">
                      <div className="hotel-image">
                        <img src={hotel.image || TRANSPARENT_IMAGE} alt={getHotelText(hotel, 'name')} className="img-fluid" />
                        <div className="hotel-rating">
                          {Array.from({ length: hotel.rating || 0 }).map((_, i) => (<FaStar key={i} className="star-icon" />))}
                        </div>
                      </div>
                      <div className="destination-content">
                        <h4 className="destination-name">{getHotelText(hotel, 'name')}</h4>
                        <p className="destination-description">{getHotelText(hotel, 'location')}</p>
                        <div className="hotel-amenities">{parseList(lang === 'zh' ? (hotel.amenities_zh || hotel.amenities_en) : (lang === 'ar' ? hotel.amenities_ar : hotel.amenities_en)).slice(0,3).map((amenity, index) => (<span key={index} className="amenity-tag">{amenity}</span>))}</div>
                        <div className="destination-footer"><button className="btn btn-outline-primary" onClick={() => handleHotelBooking(hotel)} style={{ background: '#EFC8AE', color: '#000', border: 'none' }}>{t.bookNow}</button></div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))
              ) : (
                <div className="col-12 text-center" style={{color: '#5d6d7e'}}><p>{t.noHotels}</p></div>
              )}
            </Swiper>

            <button className="slider-nav right" onClick={() => hotelsSwiperRef.current?.slideNext()} aria-label="Next">
              <FaChevronRight />
            </button>
          </div> 
        </div>
      </section>

      {/* Offers Section */}
   

    


   

      {/* Why Choose Us */}
      <section className="features-section py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">{t.whyChooseUs}</h2>
            <div className="section-divider"></div>
          </div>

          <div className="row g-4">
            {t.features.map((feature, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="feature-card">
                  <div className="feature-icon-wrapper">{feature.icon}</div>
                  <h5 className="feature-title">{feature.title}</h5>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Tips */}
      <section className="tips-section py-5">
        <div className="container">
          <div className="tips-card">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h3 className="tips-title">{t.travelTips}</h3>
                <ul className="tips-list">
                  {t.tips.map((tip, index) => (
                    <li key={index} className="tip-item">
                      <FaCheckCircle className="tip-icon" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-lg-4 text-center">
                <div className="cta-box">
                  <h4>{t.needHelp}</h4>
                  <p>{t.contactSupport}</p>
                  <button
                    onClick={handleContactSupport}
                    className="btn btn-success"
                  >
                    <FaWhatsapp className={isRTL ? "ms-2" : "me-2"} />
                    {t.contactUs}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .international-page {
          background: #000000ff;
          font-family: "Tajawal", sans-serif;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #000000ff 0%, #26272aff 100%);
          padding: 100px 20px 80px;
        }

        .hero-content {
          text-align: center;
        }

        .hero-title {
          color: #f9f9f9ff;
          font-weight: 800;
          font-size: 3.5rem;
          margin-top: 60px;
          margin-bottom: 20px;
          font-family: "Tajawal", sans-serif;
          text-align: center;
        }

        .hero-subtitle {
          color: #b2b3b4ff;
          font-size: 1.2rem;
          line-height: 1.8;
          font-family: "Tajawal", sans-serif;
          text-align: center;
          max-width: 700px;
          margin: 0 auto;
        }

        .hero-icon {
          font-size: 15rem;
          color: rgba(90, 70, 6, 0.1);
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        /* Tabs Section */
        .tabs-section {
          margin-top: -40px;
          position: relative;
          z-index: 10;
          padding: 40px 20px;
        }

        .tabs-container {
          background: white;
          border-radius: 20px;
          padding: 50px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
          max-width: 1400px;
          margin: 0 auto;
        }

        .tabs-title {
          color: #5a4606ff;
          font-weight: 700;
          font-size: 2.2rem;
          margin-bottom: 15px;
          text-align: center;
        }

        .tabs-subtitle {
          color: #5d6d7e;
          font-size: 1.1rem;
          text-align: center;
          margin-bottom: 40px;
        }

        .tabs-navigation {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          align-items: stretch;
        }

        .tab-button {
          flex: 1;
          min-width: 200px;
          background: #f8f9fa;
          border: none;
          border-radius: 15px;
          padding: 30px 25px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: all 0.3s ease;
          cursor: pointer;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .tab-button:hover {
          background: #e9ecef;
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .tab-button.active {
          background: linear-gradient(135deg, #8a7779 0%, #efc8ae 100%);
          color: white;
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(138, 119, 121, 0.3);
        }

        .tab-button.active .tab-icon-wrapper {
          background: rgba(255, 255, 255, 0.95);
          color: #8a7779;
          transform: scale(1.1);
        }

        .tab-button.active .tab-description {
          color: rgba(255, 255, 255, 0.95);
        }

        .tab-icon-wrapper {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #8a7779, #efc8ae);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .tab-icon-main {
          font-size: 2.2rem;
        }

        .tab-text {
          font-weight: 700;
          font-size: 1.1rem;
          color: inherit;
        }

        .tab-description {
          color: #5d6d7e;
          font-size: 0.85rem;
          line-height: 1.5;
          margin: 0;
          transition: all 0.3s ease;
        }

        /* Content Sections */
        .content-section {
          background: white;
          padding: 60px 20px;
        }

        .content-section.bg-light {
          background: #f8f9fa;
        }

        .section-title {
          color: #5a4606ff;
          font-weight: 800;
          font-size: 2.8rem;
          margin-bottom: 15px;
          text-align: center;
        }

        .section-divider {
          width: 100px;
          height: 5px;
          background: linear-gradient(90deg, #8a7779, #efc8ae);
          margin: 20px auto 40px;
          border-radius: 3px;
        }

        .slider-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 1300px;
          margin: 0 auto;
          padding: 20px 0;
        }

        .slides-container {
          width: 100%;
          overflow: hidden;
          border-radius: 10px;
        }

        .slides {
          display: flex;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        .slide {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .content-card {
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          border: 1px solid #e9ecef;
        }

        .content-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
          border-color: #efc8ae;
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .content-title {
          color: #5a4606ff;
          font-weight: 700;
          font-size: 1.2rem;
          margin: 0;
        }

        .content-price {
          color: #e74c3c;
          font-weight: 800;
          font-size: 1.5rem;
        }

        .content-body {
          padding: 10px 0;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .content-location {
          color: #5d6d7e;
          font-size: 0.9rem;
          margin-bottom: 15px;
        }

        .content-description {
          color: #5d6d7e;
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 15px;
          flex-grow: 1;
        }

        .content-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 15px;
        }

        .slider-nav {
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(138, 119, 121, 0.85);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.2rem;
        }

        .slider-nav:hover {
          background: rgba(138, 119, 121, 1);
          transform: translateY(-50%) scale(1.1);
        }

        .slider-nav.left { left: -60px; }
        .slider-nav.right { right: -60px; }

        .slider-dots {
          text-align: center;
          margin-top: 30px;
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .slider-dots button {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(90, 70, 6, 0.2);
          border: none;
          margin: 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .slider-dots button:hover {
          background: rgba(90, 70, 6, 0.4);
          transform: scale(1.2);
        }

        .slider-dots button.active {
          background: linear-gradient(135deg, #8a7779, #efc8ae);
          width: 32px;
          border-radius: 6px;
        }

        /* Flight Specific */
        .flight-route {
          text-align: center;
          margin-bottom: 15px;
        }

        .route-path {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          gap: 10px;
        }

        .route-from, .route-to {
          color: #5a4606ff;
          font-weight: 700;
          font-size: 0.95rem;
          text-align: center;
          flex: 1;
        }

        .route-arrow {
          color: #8a7779;
          font-size: 1.3rem;
          flex-shrink: 0;
        }

        .route-name {
          color: #5d6d7e;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .content-details {
          display: flex;
          justify-content: space-around;
          border-top: 1px solid #e9ecef;
          padding-top: 12px;
          gap: 10px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex: 1;
        }

        .detail-label {
          color: #5d6d7e;
          font-size: 0.8rem;
          margin-bottom: 4px;
        }

        .detail-value {
          color: #5a4606ff;
          font-weight: 700;
          font-size: 0.95rem;
        }

        /* Hotel Specific */
        .hotel-image {
          height: 180px;
          position: relative;
          border-radius: 15px 15px 0 0;
          overflow: hidden;
          background: #f0f0f0;
        }

        .hotel-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .hotel-card:hover .hotel-image img {
          transform: scale(1.05);
        }

        .hotel-rating {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(255, 255, 255, 0.95);
          padding: 6px 12px;
          border-radius: 20px;
          display: flex;
          gap: 3px;
        }

        .star-icon {
          color: #ffd700;
          font-size: 0.85rem;
        }

        .hotel-amenities {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .amenity-tag {
          background: linear-gradient(135deg, rgba(138, 119, 121, 0.1), rgba(239, 200, 174, 0.1));
          color: #5a4606ff;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          border: 1px solid rgba(138, 119, 121, 0.2);
        }

        /* Offers Specific */
        .offer-badge {
          position: absolute;
          top: -12px;
          left: 15px;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #8a7779, #efc8ae);
          box-shadow: 0 4px 12px rgba(138, 119, 121, 0.3);
        }

        .package-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #8a7779, #efc8ae);
          box-shadow: 0 4px 12px rgba(138, 119, 121, 0.3);
        }

        /* Package Image Specific */
        .package-image {
          height: 380px;
          position: relative;
          border-radius: 15px 15px 0 0;
          overflow: hidden;
          background: #f0f0f0;
          aspect-ratio: 820 / 1120;
        }

        .package-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .package-card:hover .package-image img {
          transform: scale(1.05);
        }

        .package-duration {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #5d6d7e;
          font-size: 0.9rem;
          margin-bottom: 15px;
        }

        .duration-icon {
          color: #8a7779;
        }

        /* Flight Card Specific */
        .flight-card-header {
          background: linear-gradient(135deg, #8a7779, #efc8ae);
          padding: 20px;
          border-radius: 15px 15px 0 0;
          margin: -1px -1px 0 -1px;
        }

        .airline-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .airline-icon {
          font-size: 1.3rem;
        }

        .flight-times {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 15px 0;
          padding: 15px 0;
          border-bottom: 1px solid #e9ecef;
        }

        .time-slot {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .time-label {
          font-size: 0.75rem;
          color: #5d6d7e;
          margin-bottom: 4px;
        }

        .time-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: #5a4606ff;
        }

        .flight-arrow {
          color: #8a7779;
          font-size: 1.2rem;
        }

        .flight-details {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }

        .detail-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, rgba(138, 119, 121, 0.1), rgba(239, 200, 174, 0.1));
          color: #5a4606ff;
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .detail-icon {
          color: #8a7779;
          font-size: 0.9rem;
        }

        .offer-image {
          height: 160px;
          overflow: hidden;
          border-radius: 10px;
          margin-bottom: 15px;
          background: #f0f0f0;
        }

        .offer-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .content-card:hover .offer-image img {
          transform: scale(1.05);
        }

        /* Destinations */
        .destination-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid #e9ecef;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .destination-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
          border-color: #efc8ae;
        }

        .destination-image {
          height: 380px;
          position: relative;
          overflow: hidden;
          background: #f0f0f0;
          aspect-ratio: 820 / 1120;
        }

        .destination-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .destination-card:hover .destination-image img {
          transform: scale(1.08);
        }

        .destination-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(0, 0, 0, 0.6) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .destination-card:hover .destination-overlay {
          opacity: 1;
        }

        .destination-content {
          padding: 20px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .destination-name {
          color: #5a4606ff;
          font-weight: 700;
          font-size: 1.3rem;
          margin-bottom: 8px;
        }

        .destination-description {
          color: #5d6d7e;
          margin-bottom: 15px;
          line-height: 1.5;
          font-size: 0.9rem;
          flex-grow: 1;
        }

        .destination-footer {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-top: auto;
        }

        .destination-price {
          color: #e74c3c;
          font-weight: 700;
          font-size: 1.3rem;
        }

        /* Features Section */
        .features-section {
          background: white;
          padding: 60px 20px;
        }

        .feature-card {
          background: linear-gradient(135deg, #ffffff, #f8f9fa);
          padding: 40px 30px;
          border-radius: 15px;
          text-align: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          height: 100%;
          border: 1px solid #e9ecef;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
          border-color: #efc8ae;
          background: linear-gradient(135deg, #ffffff, #faf9f7);
        }

        .feature-icon-wrapper {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #8a7779, #efc8ae);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 2.5rem;
          color: white;
          transition: all 0.3s ease;
        }

        .feature-card:hover .feature-icon-wrapper {
          transform: scale(1.1);
          box-shadow: 0 10px 25px rgba(138, 119, 121, 0.3);
        }

        .feature-title {
          color: #5a4606ff;
          font-weight: 700;
          font-size: 1.3rem;
          margin-bottom: 12px;
        }

        .feature-description {
          color: #5d6d7e;
          line-height: 1.7;
          font-size: 0.95rem;
        }

        /* Tips Section */
        .tips-section {
          background: linear-gradient(135deg, #8a7779 0%, #efc8ae 100%);
          padding: 60px 20px;
        }

        .tips-card {
          background: white;
          border-radius: 20px;
          padding: 50px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          max-width: 1200px;
          margin: 0 auto;
        }

        .tips-title {
          color: #5a4606ff;
          font-weight: 800;
          font-size: 2.2rem;
          margin-bottom: 30px;
          text-align: center;
        }

        .tips-list {
          list-style: none;
          padding: 0;
          margin: 0;
          column-count: 2;
          column-gap: 30px;
        }

        .tip-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 18px;
          color: #5d6d7e;
          line-height: 1.6;
          break-inside: avoid;
        }

        .tip-icon {
          color: #27ae60;
          flex-shrink: 0;
          margin-top: 2px;
          font-size: 1.2rem;
        }

        .cta-box {
          background: linear-gradient(135deg, #8a7779, #efc8ae);
          color: white;
          padding: 40px 30px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          text-align: center;
        }

        .cta-box h4 {
          font-weight: 700;
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        .cta-box p {
          margin-bottom: 25px;
          opacity: 0.95;
          font-size: 1rem;
        }

        .btn-success {
          background: #25d366;
          border: none;
          padding: 12px 30px;
          border-radius: 25px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .btn-success:hover {
          background: #128c7e;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 211, 102, 0.3);
        }

        .btn-primary {
          background: linear-gradient(135deg, #8a7779, #efc8ae);
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-weight: 700;
          transition: all 0.3s ease;
          cursor: pointer;
          font-size: 0.95rem;
          display: inline-block;
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(138, 119, 121, 0.4);
        }

        .btn-outline-primary {
          border: 2px solid #8a7779;
          color: #8a7779;
          background: transparent;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: 700;
          transition: all 0.3s ease;
          cursor: pointer;
          font-size: 0.95rem;
        }

        .btn-outline-primary:hover {
          background: #8a7779;
          color: white;
        }

        .w-100 {
          width: 100%;
        }

        .mt-3 {
          margin-top: 1rem;
        }

        .ms-2 {
          margin-left: 0.5rem;
        }

        .me-2 {
          margin-right: 0.5rem;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .slider-nav.left { left: 0; }
          .slider-nav.right { right: 0; }
          
          .tips-list {
            column-count: 1;
          }
        }

        @media (max-width: 992px) {
          .hero-title {
            font-size: 2.8rem;
          }

          .section-title {
            font-size: 2.2rem;
          }

          .tabs-container {
            padding: 35px 25px;
          }

          .tabs-navigation {
            gap: 15px;
          }

          .tab-button {
            min-width: 160px;
            padding: 20px 15px;
          }

          .tips-card {
            padding: 40px 30px;
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding: 60px 20px;
          }

          .hero-title {
            font-size: 2.2rem;
            margin-top: 40px;
          }

          .tabs-section {
            margin-top: -30px;
            padding: 20px;
          }

          .tabs-container {
            padding: 25px 20px;
          }

          .tabs-title {
            font-size: 1.8rem;
          }

          .section-title {
            font-size: 1.8rem;
          }

          .slider-nav {
            width: 36px;
            height: 36px;
            font-size: 1rem;
          }

          .slider-nav.left { left: 5px; }
          .slider-nav.right { right: 5px; }

          .slider-wrapper {
            padding: 15px 50px;
          }

          .content-card {
            padding: 20px;
          }

          .tabs-navigation {
            flex-direction: column;
          }

          .tab-button {
            width: 100%;
            min-width: auto;
          }

          .destination-footer {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }

          .content-footer {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
        }

        @media (max-width: 576px) {
          .hero-section {
            padding: 50px 15px;
          }

          .hero-title {
            font-size: 1.8rem;
            margin-top: 30px;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .content-section {
            padding: 40px 15px;
          }

          .section-title {
            font-size: 1.5rem;
          }

          .tabs-title {
            font-size: 1.5rem;
          }

          .tabs-container {
            padding: 20px 15px;
          }

          .slider-wrapper {
            padding: 10px 40px;
          }

          .slider-nav {
            width: 32px;
            height: 32px;
            font-size: 0.9rem;
          }

          .slider-nav.left { left: 2px; }
          .slider-nav.right { right: 2px; }

          .slider-dots {
            gap: 6px;
          }

          .slider-dots button {
            width: 8px;
            height: 8px;
          }

          .slider-dots button.active {
            width: 24px;
          }

          .content-card {
            padding: 15px;
          }

          .hotel-image {
            height: 140px;
          }

          .package-image {
            height: 280px;
          }

          .destination-image {
            height: 280px;
          }

          .tips-card {
            padding: 25px 15px;
          }

          .tips-title {
            font-size: 1.5rem;
            margin-bottom: 20px;
          }

          .tip-item {
            margin-bottom: 12px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}