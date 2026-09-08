"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FaPlane, FaSearch, FaCalendarAlt, FaUser, FaExchangeAlt,
  FaChevronDown, FaMinus, FaPlus, FaSuitcase, FaCheckCircle, FaTimes,
  FaMobileAlt, FaTrain, FaSwimmer, FaTicketAlt, FaKaaba, FaGlobe, FaWhatsapp, FaEllipsisH,
  FaRegStar, FaStar
} from "react-icons/fa";

import ALL_AIRPORTS from "@/lib/akbarAirports";
import akbarApi from "@/lib/akbarApi";
import { useTranslation } from "@/hooks/useTranslation";

export default function AkbarFlights({ initialParams }) {
  const router = useRouter();
  const params = useParams();
  const { language } = useTranslation();
  const lang = initialParams?.lang || params?.lang || language || "en";
  const isRTL = lang === "ar";

  const getTodayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getTomorrowISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getDayAfterTomorrowISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getAirportDetails = (code) => {
    if (!code) return { city: '', name: '' };
    const ap = ALL_AIRPORTS.find(a => a.Code.toUpperCase() === code.toUpperCase());
    if (ap) {
      const cityStr = isRTL 
        ? `${ap.CityNameAr || ap.city_ar || ap.CityName}، ${ap.CountryAr || ap.country_ar || ap.Country}`
        : `${ap.CityName}, ${ap.Country}`;
      const nameStr = isRTL
        ? (ap.NameAr || ap.name_ar || ap.Name)
        : ap.Name;
      return { city: cityStr, name: nameStr };
    }
    return { city: `${code} Airport`, name: `${code} Airport` };
  };

  const [tripType, setTripType] = useState(initialParams?.returnDate ? "roundtrip" : "oneway");
  const [directOnly, setDirectOnly] = useState(false);
  const [includedBaggage, setIncludedBaggage] = useState(false);

  const initialOrigCode = initialParams?.origin || "";
  const initialDestCode = initialParams?.destination || "";

  const [origin, setOrigin] = useState(initialOrigCode);
  const [originCity, setOriginCity] = useState(initialOrigCode ? getAirportDetails(initialOrigCode).city : "");
  const [originAirportName, setOriginAirportName] = useState(initialOrigCode ? getAirportDetails(initialOrigCode).name : "");

  const [destination, setDestination] = useState(initialDestCode);
  const [destinationCity, setDestinationCity] = useState(initialDestCode ? getAirportDetails(initialDestCode).city : "");
  const [destAirportName, setDestAirportName] = useState(initialDestCode ? getAirportDetails(initialDestCode).name : "");

  const [departDate, setDepartDate] = useState(initialParams?.departDate || getTomorrowISO());
  const [returnDate, setReturnDate] = useState(initialParams?.returnDate || "");

  const [adults, setAdults] = useState(initialParams?.adults || 1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState(initialParams?.cabinClass?.toLowerCase() || "economy");

  const [showPaxModal, setShowPaxModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'origin' | 'dest' | null
  const [searchQuery, setSearchQuery] = useState("");
  const [backendAirports, setBackendAirports] = useState([]);

  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState([]);
  const [datePrices, setDatePrices] = useState({});
  const [error, setError] = useState(null);

  const dropdownRef = useRef(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const totalPassengers = adults + children + infants;

  useEffect(() => {
    if (!searchQuery.trim()) {
      setBackendAirports([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await akbarApi.getAirports(searchQuery);
        if (res.ok && res.data?.data) {
          setBackendAirports(res.data.data);
        }
      } catch (err) {
        console.error('Failed fetching backend airports:', err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync component state when initialParams prop changes (e.g. dynamic URL navigation)
  useEffect(() => {
    if (initialParams) {
      if (initialParams.origin) {
        const code = initialParams.origin.toUpperCase();
        setOrigin(code);
        const details = getAirportDetails(code);
        setOriginCity(details.city);
        setOriginAirportName(details.name);
      }
      if (initialParams.destination) {
        const code = initialParams.destination.toUpperCase();
        setDestination(code);
        const details = getAirportDetails(code);
        setDestinationCity(details.city);
        setDestAirportName(details.name);
      }
      if (initialParams.departDate) {
        setDepartDate(initialParams.departDate);
      }
      if (initialParams.returnDate !== undefined) {
        setReturnDate(initialParams.returnDate || "");
      }
      if (initialParams.cabinClass) {
        setCabinClass(initialParams.cabinClass.toLowerCase());
      }
      if (initialParams.adults) {
        setAdults(initialParams.adults);
      }
    }
  }, [initialParams?.origin, initialParams?.destination, initialParams?.departDate, initialParams?.returnDate, initialParams?.cabinClass, initialParams?.adults]);

  // Perform initial flight search only if route is specified
  useEffect(() => {
    if (initialParams?.origin && initialParams?.destination) {
      handleSearch(null, true);
    }
  }, []);

  const parseISODate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const formatISODate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getNextDayISO = (isoDateStr) => {
    const d = parseISODate(isoDateStr || getTomorrowISO());
    d.setDate(d.getDate() + 1);
    return formatISODate(d);
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "";
    const d = parseISODate(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(isRTL ? "ar-SA" : "en-US", { weekday: "short", day: "numeric", month: "short" });
  };

  const handleSwap = () => {
    const tmpCode = origin;
    const tmpCity = originCity;
    const tmpName = originAirportName;

    const newOrigin = destination;
    const newDest = tmpCode;

    setOrigin(newOrigin);
    setOriginCity(destinationCity);
    setOriginAirportName(destAirportName);

    setDestination(newDest);
    setDestinationCity(tmpCity);
    setDestAirportName(tmpName);

    setTimeout(() => {
      handleSearch(null, false, null, newOrigin, newDest);
    }, 50);
  };

  const filteredAirports = backendAirports.length > 0
    ? backendAirports
    : ALL_AIRPORTS.filter((ap) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        ap.Code.toLowerCase().includes(q) ||
        ap.CityName.toLowerCase().includes(q) ||
        ap.Country.toLowerCase().includes(q) ||
        ap.Name.toLowerCase().includes(q) ||
        (ap.Alias && ap.Alias.toLowerCase().includes(q))
      );
    }).sort((a, b) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return 0;
      const aExact = a.Code.toLowerCase() === q;
      const bExact = b.Code.toLowerCase() === q;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aCodeStarts = a.Code.toLowerCase().startsWith(q);
      const bCodeStarts = b.Code.toLowerCase().startsWith(q);
      if (aCodeStarts && !bCodeStarts) return -1;
      if (!aCodeStarts && bCodeStarts) return 1;

      const aCityStarts = a.CityName.toLowerCase().startsWith(q);
      const bCityStarts = b.CityName.toLowerCase().startsWith(q);
      if (aCityStarts && !bCityStarts) return -1;
      if (!aCityStarts && bCityStarts) return 1;

      return 0;
    });

  const selectAirport = (ap, type) => {
    let newOrigin = origin;
    let newDest = destination;
    const cityStr = isRTL
      ? `${ap.CityNameAr || ap.city_ar || ap.CityName}، ${ap.CountryAr || ap.country_ar || ap.Country}`
      : `${ap.CityName}, ${ap.Country}`;
    const nameStr = isRTL
      ? (ap.NameAr || ap.name_ar || ap.Name)
      : ap.Name;

    if (type === "origin") {
      newOrigin = ap.Code;
      setOrigin(ap.Code);
      setOriginCity(cityStr);
      setOriginAirportName(nameStr);
    } else {
      newDest = ap.Code;
      setDestination(ap.Code);
      setDestinationCity(cityStr);
      setDestAirportName(nameStr);
    }
    setActiveDropdown(null);
    setSearchQuery("");

    setTimeout(() => {
      handleSearch(null, false, null, newOrigin, newDest);
    }, 50);
  };

  const formatTimeStr = (str) => {
    if (!str) return "06:05";
    if (typeof str === "string" && str.includes("T")) {
      const timePart = str.split("T")[1]?.substring(0, 5);
      if (timePart) return timePart;
    }
    return str;
  };

  const handleSearch = async (e, isInitial = false, customDate = null, overrideOrigin = null, overrideDest = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);

    const activeDepartDate = customDate || initialParams?.departDate || departDate;
    if (customDate) {
      setDepartDate(customDate);
    }

    const activeOrigin = ((overrideOrigin !== null ? overrideOrigin : (origin || initialParams?.origin)) || "").toUpperCase();
    const activeDest = ((overrideDest !== null ? overrideDest : (destination || initialParams?.destination)) || "").toUpperCase();

    if (!activeOrigin || !activeDest) {
      setLoading(false);
      setOffers([]);
      if (!isInitial) {
        setError(isRTL ? "يرجى اختيار مطار المغادرة والوصول أولاً." : "Please select origin and destination airports.");
      }
      return;
    }

    setLoading(true);

    if (activeOrigin === activeDest) {
      setLoading(false);
      setOffers([]);
      setError(isRTL ? "يرجى اختيار مطارين مختلفين للمغادرة والوصول." : "Origin and Destination airports must be different.");
      return;
    }

    const activeReturnDate = tripType === 'roundtrip' ? (returnDate || initialParams?.returnDate || getNextDayISO(activeDepartDate)) : null;

    // Update browser URL slug with exact route and departure date matching Almosafer structure
    if (typeof window !== 'undefined') {
      const cabinLabel = cabinClass ? (cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1)) : 'Economy';
      const cleanUrl = `/${lang}/flights/${activeOrigin}-${activeDest}/${activeDepartDate}${activeReturnDate ? '/' + activeReturnDate : ''}/${cabinLabel}/${adults}Adult`;

      if (e) {
        router.push(cleanUrl);
      } else if (!isInitial && window.history) {
        window.history.pushState(null, '', cleanUrl);
      }
    }

    try {
      const searchPayload = {
        origin: activeOrigin,
        destination: activeDest,
        departure_date: activeDepartDate,
        return_date: activeReturnDate,
        adults,
        children,
        infants,
        cabin_class: cabinClass,
        direct_only: directOnly,
      };

      const response = await fetch(`${API_BASE}/v2/akbar/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Language": lang || "en"
        },
        body: JSON.stringify(searchPayload),
      });

      const data = await response.json();
      const rawOffers = data?.data?.offers || data?.offers || [];

      const normalizedOffers = rawOffers.map(offer => {
        const rawAirline = offer.AirlineName || offer.airline || offer.airline_code || offer.Airline || 'Saudi Arabian Airlines';
        const airlineName = rawAirline.split('|')[0].trim();
        const airlineCode = offer.VAC || offer.MAC || offer.OAC || offer.airline_code || offer.AirlineCode || offer.airlineCode || 'SV';
        const rawFlightNo = (offer.FlightNo || offer.flight_number || offer.FlightNumber || '').toString().trim();
        const flightNumber = rawFlightNo ? (rawFlightNo.includes(airlineCode) ? rawFlightNo : `${airlineCode}-${rawFlightNo}`) : `${airlineCode}-304`;

        const depTime = formatTimeStr(offer.DepartureTime || offer.departure_time || offer.departureTime || '07:15');
        const arrTime = formatTimeStr(offer.ArrivalTime || offer.arrival_time || offer.arrivalTime || '09:30');

        const rawPrice = offer.CustomerTotalSAR || offer.GrossFare || offer.NetFare || (typeof offer.price === 'object' ? offer.price?.total : offer.price) || 272.2;
        const priceVal = parseFloat(rawPrice) || 272.2;

        return {
          offerId: offer.Index || offer.supplier_offer_id || offer.offer_id || offer.OfferID || `OFFER-${airlineCode}-${Date.now()}`,
          airline: airlineName,
          airlineCode: airlineCode,
          flightNumber: flightNumber,
          departureTime: depTime,
          arrivalTime: arrTime,
          departure: offer.From || offer.origin || activeOrigin,
          arrival: offer.To || offer.destination || activeDest,
          departureDate: activeDepartDate,
          duration: (offer.Duration || offer.duration || '02h 15m').toString().trim(),
          stops: offer.Hops ?? offer.Stops ?? offer.stops ?? 0,
          price: Math.round(priceVal * 100) / 100,
          currency: typeof offer.price === 'object' ? (offer.price?.currency || 'SAR') : 'SAR',
          cabin: offer.Cabin === 'B' ? 'Business' : (offer.cabin_class_label || offer.CabinClass || 'Economy'),
          checkedBaggage: offer.checked_baggage || offer.Baggage || '20 KG Checked Baggage',
          cabinBaggage: offer.cabin_baggage || '7 KG Cabin Baggage',
          raw: offer
        };
      });

      setOffers(normalizedOffers);
      if (normalizedOffers.length > 0) {
        const minPrice = Math.min(...normalizedOffers.map(o => o.price));
        setDatePrices(prev => ({ ...prev, [activeDepartDate]: minPrice }));
      }
      if (normalizedOffers.length === 0) {
        setError(isRTL ? "لم نتمكن من العثور على رحلات حية متوفرة لهذا المسار وتاريخ السفر المحدد." : "No live flight offers found for this route on the selected date.");
      }
    } catch (err) {
      console.warn("API search request error:", err);
      setOffers([]);
      setError(isRTL ? "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً." : "Failed to load live flight offers.");
    } finally {
      setLoading(false);
    }
  };

  const selectOffer = (offer) => {
    const isRoundTrip = tripType === 'roundtrip' && !!returnDate;
    const numAdults = adults || 1;
    const numChildren = children || 0;
    const numInfants = infants || 0;
    const stored = {
      offerId: offer.offerId,
      airline: offer.airline,
      airlineCode: offer.airlineCode,
      flightNo: offer.flightNumber,
      origin: offer.departure,
      destination: offer.arrival,
      departureDate: departDate,
      returnDate: returnDate || null,
      isRoundTrip: isRoundTrip,
      depTime: offer.departureTime,
      arrTime: offer.arrivalTime,
      duration: offer.duration,
      price: offer.price,
      currency: offer.currency,
      adults: numAdults,
      children: numChildren,
      infants: numInfants,
      passengerCount: numAdults + numChildren + numInfants,
      legs: [
        {
          from: offer.departure,
          to: offer.arrival,
          airline: offer.airline,
          flightNo: offer.flightNumber,
          date: departDate,
          dep: offer.departureTime,
          arr: offer.arrivalTime,
          duration: offer.duration,
          isDirect: true
        },
        ...(isRoundTrip ? [{
          from: offer.arrival,
          to: offer.departure,
          airline: offer.airline,
          flightNo: offer.flightNumber,
          date: returnDate,
          dep: offer.departureTime,
          arr: offer.arrivalTime,
          duration: offer.duration,
          isDirect: true
        }] : [])
      ],
      raw: offer
    };

    localStorage.setItem('selectedFlight', JSON.stringify(stored));
    router.push(`/${lang}/flights/booking`);
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Dynamic Hero Backdrop (Almosafer Style) ── */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
        backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: 140,
        paddingBottom: 70,
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)',
        marginTop: 0
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.45)' }} />

        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>

          {/* Almosafer Hero Headline */}
          <div style={{ marginBottom: 24, textAlign: isRTL ? 'right' : 'left' }}>
            <h1 style={{ color: '#ffffff', fontSize: '2.4rem', fontWeight: 800, margin: '0 0 6px 0', textShadow: '0 2px 10px rgba(0,0,0,0.3)', fontFamily: 'DM Sans, sans-serif' }}>
              {isRTL ? 'العالم بأكمله بانتظارك!' : 'The entire world awaits you!'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.92)', fontSize: '1.05rem', fontWeight: 500, margin: 0 }}>
              {isRTL ? 'سافر إلى أي مكان مع أكثر من 450 شركة طيرانك المفضلة' : 'Fly anywhere with over 450 of your favorite airlines'}
            </p>
          </div>

          {/* ── Main White Search Widget Container ── */}
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: '24px 28px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }}>

            {/* ── Top Bar: Trip Type Pills & Checkboxes ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>

              {/* Trip Type Radio Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setTripType('oneway');
                    setReturnDate('');
                    if (origin && destination) handleSearch(null, false, null);
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 24,
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: tripType === 'oneway' ? '#e0f2fe' : '#f1f5f9',
                    color: tripType === 'oneway' ? '#0284c7' : '#475569',
                    transition: 'all 0.2s'
                  }}
                >
                  {isRTL ? 'اتجاه واحد' : 'One Way'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTripType('roundtrip');
                    const nextDate = returnDate || getNextDayISO(departDate);
                    setReturnDate(nextDate);
                    if (origin && destination) handleSearch(null, false, null);
                  }}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 24,
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: tripType === 'roundtrip' ? '#e0f2fe' : '#f1f5f9',
                    color: tripType === 'roundtrip' ? '#0284c7' : '#475569',
                    transition: 'all 0.2s'
                  }}
                >
                  {isRTL ? 'ذهاب وإياد' : 'Round Trip'}
                </button>
                <button
                  type="button"
                  onClick={() => setTripType('multicity')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 24,
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: tripType === 'multicity' ? '#e0f2fe' : '#f1f5f9',
                    color: tripType === 'multicity' ? '#0284c7' : '#475569',
                    transition: 'all 0.2s'
                  }}
                >
                  {isRTL ? 'وجهات متعددة' : 'Multi City'}
                </button>
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={directOnly}
                    onChange={(e) => setDirectOnly(e.target.checked)}
                    style={{ accentColor: '#0284c7', width: 16, height: 16, cursor: 'pointer' }}
                  />
                  {isRTL ? 'رحلات مباشرة' : 'Direct Flights'}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={includedBaggage}
                    onChange={(e) => setIncludedBaggage(e.target.checked)}
                    style={{ accentColor: '#0284c7', width: 16, height: 16, cursor: 'pointer' }}
                  />
                  {isRTL ? 'أمتعة مشمولة' : 'Included Baggage'}
                </label>
              </div>
            </div>

            {/* ── Main Unified Search Bar Row ── */}
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'stretch', gap: 8, flexWrap: 'wrap' }} ref={dropdownRef}>

              {/* 1. Joined From / To Airport Selector Box */}
              <div style={{
                flex: '2 1 380px',
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: 12,
                padding: '4px 10px',
                background: '#ffffff',
                position: 'relative'
              }}>

                {/* ── FROM FIELD ── */}
                <div
                  onClick={() => { setActiveDropdown('origin'); setSearchQuery(''); }}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: activeDropdown === 'origin' ? '#f0f9ff' : 'transparent',
                    borderRadius: 8
                  }}
                >
                  <FaPlane style={{ color: '#94a3b8', transform: 'rotate(-45deg)', fontSize: 16 }} />
                  <div style={{ width: '100%', overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{isRTL ? 'من' : 'From'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: '0.92rem',
                        fontWeight: origin ? 800 : 500,
                        color: origin ? '#0f172a' : '#94a3b8',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {origin
                          ? originCity
                          : (isRTL ? 'من أين؟' : 'Origin')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Swap Circle Button */}
                <button
                  type="button"
                  onClick={handleSwap}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 2,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    flexShrink: 0
                  }}
                >
                  <FaExchangeAlt style={{ fontSize: 12 }} />
                </button>

                {/* ── TO FIELD ── */}
                <div
                  onClick={() => { setActiveDropdown('dest'); setSearchQuery(''); }}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: activeDropdown === 'dest' ? '#f0f9ff' : 'transparent',
                    borderRadius: 8
                  }}
                >
                  <FaPlane style={{ color: '#94a3b8', transform: 'rotate(45deg)', fontSize: 16 }} />
                  <div style={{ width: '100%', overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{isRTL ? 'إلى' : 'To'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: '0.92rem',
                        fontWeight: destination ? 800 : 500,
                        color: destination ? '#0f172a' : '#94a3b8',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {destination
                          ? destinationCity
                          : (isRTL ? 'إلى أين؟' : 'Destination')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── LIVE AIRPORT SEARCH POPUP DROPDOWN ── */}
                {activeDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '108%',
                    left: isRTL ? 'auto' : (activeDropdown === 'origin' ? 0 : 'auto'),
                    right: isRTL ? (activeDropdown === 'origin' ? 0 : 'auto') : (activeDropdown === 'dest' ? 0 : 'auto'),
                    width: 380,
                    background: '#ffffff',
                    borderRadius: 14,
                    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18)',
                    border: '1px solid #e2e8f0',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}>
                    {/* Search Input Box */}
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FaSearch style={{ color: '#94a3b8', fontSize: 14 }} />
                      <input
                        type="text"
                        autoFocus
                        placeholder={isRTL ? 'ابحث عن مدينة، دولة أو رمز المطار...' : 'Search city, country or airport code...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}
                      />
                    </div>

                    {/* Section Header */}
                    <div style={{ padding: '10px 16px 6px 16px', fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                      {searchQuery ? (isRTL ? `نتائج البحث (${filteredAirports.length})` : `Search Results (${filteredAirports.length})`) : (isRTL ? 'الوجهات الشائعة' : 'Top destinations')}
                    </div>

                    {/* Airport Options List */}
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                      {filteredAirports.length > 0 ? (
                        filteredAirports.map((ap) => (
                          <div
                            key={ap.Code}
                            onClick={() => selectAirport(ap, activeDropdown)}
                            style={{
                              padding: '10px 16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f8fafc',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <FaRegStar style={{ color: '#94a3b8', fontSize: 14, flexShrink: 0 }} />
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                                  {isRTL
                                    ? `${ap.CityNameAr || ap.city_ar || ap.CityName}، ${ap.CountryAr || ap.country_ar || ap.Country}`
                                    : `${ap.CityName}, ${ap.Country}`}
                                </div>
                                <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 1 }}>
                                  {isRTL
                                    ? (ap.NameAr || ap.name_ar || ap.Name)
                                    : ap.Name}
                                </div>
                              </div>
                            </div>
                            <span style={{
                              background: '#f1f5f9',
                              color: '#0f172a',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              padding: '4px 8px',
                              borderRadius: 6,
                              letterSpacing: '0.5px'
                            }}>
                              {ap.Code}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                          {isRTL ? `لم يتم العثور على مطارات لـ "${searchQuery}"` : `No airports found for "${searchQuery}"`}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Departure & Return Dates Box */}
              <div style={{
                flex: '2 1 290px',
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: 12,
                background: '#ffffff',
                overflow: 'hidden'
              }}>
                {/* Departure Box */}
                <div style={{ flex: 1, padding: '8px 12px', borderLeft: isRTL ? 'none' : '1px solid #e2e8f0', borderRight: isRTL ? '1px solid #e2e8f0' : 'none', display: 'flex', alignItems: 'center', gap: 10, position: 'relative', cursor: 'pointer' }}>
                  <FaCalendarAlt style={{ color: '#94a3b8', fontSize: 16, flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{isRTL ? 'المغادرة' : 'Departure'}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {formatDateLabel(departDate)}
                    </span>
                  </div>
                  <input
                    type="date"
                    value={departDate}
                    min={getTodayISO()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        setDepartDate(val);
                        if (origin && destination) {
                          handleSearch(null, false, val);
                        }
                      }
                    }}
                    style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                  />
                </div>

                {/* Return Box */}
                <div style={{ flex: 1, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10, position: 'relative', cursor: 'pointer' }}>
                  {tripType === 'roundtrip' ? (
                    <>
                      <FaCalendarAlt style={{ color: '#0284c7', fontSize: 16, flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span style={{ fontSize: '0.68rem', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase' }}>{isRTL ? 'العودة' : 'Return'}</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {formatDateLabel(returnDate || getNextDayISO(departDate))}
                        </span>
                      </div>
                      <input
                        type="date"
                        value={returnDate || getNextDayISO(departDate)}
                        min={departDate || getTodayISO()}
                        onChange={(e) => {
                          setReturnDate(e.target.value);
                          if (origin && destination) {
                            handleSearch(null, false, null);
                          }
                        }}
                        style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTripType('oneway');
                          setReturnDate('');
                          if (origin && destination) {
                            handleSearch(null, false, null);
                          }
                        }}
                        style={{
                          position: 'relative',
                          zIndex: 10,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          flexShrink: 0
                        }}
                      >
                        <FaTimes style={{ fontSize: 10 }} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTripType('roundtrip');
                        const nextDate = getNextDayISO(departDate);
                        setReturnDate(nextDate);
                        if (origin && destination) {
                          handleSearch(null, false, null);
                        }
                      }}
                      style={{ border: 'none', background: 'transparent', color: '#0284c7', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', width: '100%', textAlign: isRTL ? 'right' : 'left' }}
                    >
                      {isRTL ? '+ إضافة عودة' : '+ Add return'}
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Passengers & Cabin Class Field */}
              <div
                onClick={() => setShowPaxModal(!showPaxModal)}
                style={{
                  flex: '1 1 200px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  border: '1px solid #cbd5e1',
                  borderRadius: 12,
                  padding: '12px 14px',
                  background: '#ffffff',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <FaUser style={{ color: '#94a3b8', fontSize: 14 }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  {isRTL ? `${totalPassengers} مسافر، الدرجة السياحية` : `${totalPassengers} Traveler${totalPassengers > 1 ? 's' : ''}, ${cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1)}`}
                </span>
                <FaChevronDown style={{ color: '#94a3b8', fontSize: 10, marginLeft: 'auto' }} />

                {/* Pax Selector Dropdown Popup */}
                {showPaxModal && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      top: '110%',
                      right: isRTL ? 'auto' : 0,
                      left: isRTL ? 0 : 'auto',
                      width: 280,
                      background: '#ffffff',
                      borderRadius: 12,
                      padding: 16,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                      border: '1px solid #e2e8f0',
                      zIndex: 100
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{isRTL ? 'بالغون (12+ سنة)' : 'Adults (12+ yrs)'}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff' }}>-</button>
                        <span style={{ fontWeight: 700 }}>{adults}</span>
                        <button type="button" onClick={() => setAdults(adults + 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff' }}>+</button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{isRTL ? 'أطفال (2-11 سنة)' : 'Children (2-11 yrs)'}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff' }}>-</button>
                        <span style={{ fontWeight: 700 }}>{children}</span>
                        <button type="button" onClick={() => setChildren(children + 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff' }}>+</button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{isRTL ? 'رضع (أقل من سنتين)' : 'Infants (< 2 yrs)'}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button type="button" onClick={() => setInfants(Math.max(0, infants - 1))} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff' }}>-</button>
                        <span style={{ fontWeight: 700 }}>{infants}</span>
                        <button type="button" onClick={() => setInfants(infants + 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff' }}>+</button>
                      </div>
                    </div>

                    <button type="button" onClick={() => setShowPaxModal(false)} style={{ width: '100%', padding: '8px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>{isRTL ? 'تطبيق' : 'Apply'}</button>
                  </div>
                )}
              </div>

              {/* 4. Vibrant Search Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0 28px',
                  height: 48,
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(244, 63, 94, 0.4)',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
              >
                <FaSearch style={{ fontSize: 16 }} />
                <span>{loading ? (isRTL ? 'جارٍ البحث...' : 'Searching...') : (isRTL ? 'بحث' : 'Search')}</span>
              </button>

            </form>
          </div>
        </div>
      </div>

      {/* ── Almosafer Quick Services Bar ── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '20px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
          {[
            { icon: '/SVG/eSim.svg', label: isRTL ? 'بطاقات eSIM' : 'eSIM', action: () => router.push(`/${lang}/international/internet-packages`) },
            { icon: '/SVG/Haramain.svg', label: isRTL ? 'قطار الحرمين' : 'Haramain', action: () => router.push(`/${lang}/services`) },
            { icon: '/SVG/Aquarabia.svg', label: isRTL ? 'أكوارابيا' : 'Aquarabia', action: () => router.push(`/${lang}/tousimoffers`) },
            // { icon: '/SVG/Six Flags.svg', label: isRTL ? 'سيكس فلاجز' : 'Six Flags', action: () => router.push(`/${lang}/tousimoffers`) },
            { icon: '/SVG/Umrah.svg', label: isRTL ? 'العمرة' : 'Umrah', action: () => router.push(`/${lang}/tousimoffers`) },
            { icon: '/SVG/International packages.svg', label: isRTL ? 'باقات دولية' : 'International packages', action: () => router.push(`/${lang}/tousimoffers`) },
            { icon: '/SVG/more services.svg', label: isRTL ? 'المزيد من الخدمات' : 'More services', action: () => router.push(`/${lang}/visa`) },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s', width: 110 }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: 10
              }}>
                {typeof item.icon === 'string' ? (
                  <img src={item.icon} alt={item.label} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                ) : (
                  item.icon
                )}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', textAlign: 'center', lineHeight: 1.2 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Almosafer 7-Day Date Carousel Strip ── */}
      <div style={{ maxWidth: 1180, margin: '30px auto 0 auto', padding: '0 20px' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '14px 18px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isRTL ? 'تاريخ المغادرة المحدد' : 'Selected Departure Date'}
          </div>

          {/* Date Pills Carousel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {(() => {
              const base = parseISODate(departDate || getTomorrowISO());
              const datePills = [];

              for (let i = -3; i <= 3; i++) {
                const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
                const iso = formatISODate(d);
                const dayName = d.toLocaleDateString(isRTL ? "ar-SA" : "en-US", { weekday: "short" });
                const monthDay = d.toLocaleDateString(isRTL ? "ar-SA" : "en-US", { day: "numeric", month: "short" });
                const isSelected = iso === departDate;
                const pillPrice = isSelected && offers.length > 0
                  ? Math.min(...offers.map(o => o.price))
                  : datePrices[iso];

                datePills.push(
                  <div
                    key={iso}
                    onClick={() => handleSearch(null, false, iso)}
                    style={{
                      flex: '1 0 135px',
                      minWidth: 125,
                      padding: '10px 14px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      background: isSelected ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#f8fafc',
                      color: isSelected ? '#ffffff' : '#0f172a',
                      border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      boxShadow: isSelected ? '0 4px 14px rgba(2, 132, 199, 0.35)' : 'none',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: isSelected ? 800 : 600, opacity: isSelected ? 0.9 : 0.7 }}>
                      {dayName}
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, margin: '2px 0' }}>
                      {monthDay}
                    </div>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      marginTop: 4,
                      background: isSelected ? 'rgba(255,255,255,0.2)' : '#e0f2fe',
                      color: isSelected ? '#ffffff' : '#0369a1',
                      padding: '2px 8px',
                      borderRadius: 10,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      {pillPrice ? (
                        <span>SAR {pillPrice}</span>
                      ) : (
                        <span>{isRTL ? 'عرض السعر' : 'View Fare'}</span>
                      )}
                    </div>
                  </div>
                );
              }
              return datePills;
            })()}
          </div>
        </div>
      </div>

      {/* ── Flight Results Cards ── */}
      <div style={{ maxWidth: 1180, margin: '24px auto 100px auto', padding: '0 20px 80px 20px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0' }}>
            <FaPlane style={{ fontSize: 36, color: '#0284c7', animation: 'spin 2s linear infinite', marginBottom: 12 }} />
            <h4 style={{ color: '#0f172a', fontWeight: 800, margin: 0 }}>{isRTL ? 'جاري البحث عن أفضل الرحلات الحية...' : 'Searching for best live flights...'}</h4>
          </div>
        )}

        {!loading && offers.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{isRTL ? `الرحلات المتاحة الحية (${offers.length})` : `Available Live Flights (${offers.length})`}</h3>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{isRTL ? 'أسعار مباشرة من الشركة' : 'Live direct supplier fares'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {offers.map((offer, idx) => (
                <div key={idx} style={{ background: '#ffffff', borderRadius: 16, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#701a75', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                        {offer.airlineCode}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{offer.airline}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{offer.flightNumber}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{offer.departureTime}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{offer.departure}</div>
                        <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700, marginTop: 2 }}>{formatDateLabel(offer.departureDate || departDate)}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{offer.duration}</div>
                        <div style={{ width: 60, height: 1, background: '#cbd5e1', position: 'relative', margin: '4px 0' }}>
                          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#0284c7', position: 'absolute', right: 0, top: -1.5 }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#00875a', fontWeight: 700 }}>{isRTL ? 'مباشر' : 'Direct'}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{offer.arrivalTime}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{offer.arrival}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: isRTL ? 'left' : 'right', display: 'flex', flexDirection: 'column', alignItems: isRTL ? 'flex-start' : 'flex-end', gap: 8 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span>{offer.price}</span>
                      <img src="/saudi_riyal.png" alt="SAR" style={{ height: 18, width: 'auto', display: 'inline-block' }} />
                    </div>
                    <button
                      onClick={() => selectOffer(offer)}
                      style={{
                        padding: '10px 24px',
                        background: '#f43f5e',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(244,63,94,0.3)'
                      }}
                    >
                      {isRTL ? 'عرض السعر' : 'View Fare'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && offers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <FaPlane style={{ fontSize: 42, color: '#cbd5e1', marginBottom: 16 }} />
            <h4 style={{ color: '#0f172a', fontWeight: 800, fontSize: '1.1rem', margin: '0 0 8px 0' }}>
              {isRTL ? 'لا توجد رحلات حية متوفرة لهذا المسار وتاريخ السفر' : 'No Live Flights Available For This Route'}
            </h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: 460, margin: '0 auto' }}>
              {isRTL
                ? 'يرجى تغيير تاريخ الذهاب أو البحث عن خطوط سير أخرى مدعومة في نظام الاختبار الحقيقي (مثل BOM إلى DXB، BOM إلى DEL، أو BOM إلى JED).'
                : 'Please select another date or try supported live API test routes (e.g. BOM to DXB, BOM to DEL, BOM to JED).'
              }
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
