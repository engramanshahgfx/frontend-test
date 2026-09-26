"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronLeft, ChevronRight, Waves, Star, Clock, Users } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useUI } from "../../providers/UIProvider";
import { API_URL } from "../../lib/api";

export default function IslandDestinationslocal({ lang }) {
  const router = useRouter();
  const currentLang = lang || 'en';
  const { openBookingOrAuth } = useUI();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Static labels (fallback)
  const labels = {
    en: {
      title: "Discover the World",
      subtitle: "Experience the perfect blend of luxury, nature, and adventure in world 's most stunning destinations",
      viewDetails: "View Details",
      bookNow: "Book Now",
    },
    ar: {
      title: "اكتشف العالم",
      subtitle: "اختبر المزيج المثالي بين الفخامة والطبيعة والمغامرة في أجمل الوجهات العالمية",
      viewDetails: "عرض التفاصيل",
      bookNow: "احجز الآن",
    },
  };
  const t = labels[lang] || labels.en;

  // Safely parse JSON arrays from backend
  const parseList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return value.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  // Get localized field
  const getText = (obj, field) => {
    // Handle title and name fields (both used in different parts)
    if (field === 'title' && obj.title_en) {
      return lang === "ar" ? obj.title_ar : obj.title_en;
    }
    if (field === 'name' && obj.name_en) {
      return lang === "ar" ? obj.name_ar : obj.name_en;
    }
    
    const fieldKey = lang === "ar" ? `${field}_ar` : `${field}_en`;
    return obj[fieldKey] || obj[field] || "";
  };

  // Build a full image URL for destination images with cache busting
  const getImageUrl = (img) => {
    const placeholder = '/placeholder.png';
    if (!img) return placeholder;

    // Absolute URL
    if (/^https?:\/\//i.test(img)) return `${img}?t=${Date.now()}`;

    // Already an absolute path served from the backend (starts with / or storage/)
    if (img.startsWith('/')) return `${img}?t=${Date.now()}`;
    if (img.startsWith('storage/')) {
      // api returns 'storage/islands/xxx' or similar
      const backendBase = API_URL.replace(/\/api\/?$/, '');
      return `${backendBase}/${img}?t=${Date.now()}`;
    }

    // If the returned image already includes the directory 'islands/' then use storage/ + provided path
    if (img.startsWith('islands/')) {
      const backendBase = API_URL.replace(/\/api\/?$/, '');
      return `${backendBase}/storage/${img}?t=${Date.now()}`;
    }

    // Fallback — treat as filename inside islands folder
    const backendBase = API_URL.replace(/\/api\/?$/, '');
    return `${backendBase}/storage/islands/${img}?t=${Date.now()}`;
  };

  // Static island destinations data from seeders
  useEffect(() => {
    const staticDestinations = [
      {
        id: 1,
        title_en: "Trip to AlUla",
        title_ar: "رحلة إلى العلا",
        slug: "trip-to-alula",
        type_en: "Heritage Tour",
        type_ar: "جولة تراثية",
        description_en: "Join us on a trip to AlUla, where you can discover breathtaking natural landscapes and historical landmarks like Hegra (Mada'in Saleh). Immerse yourself in the beauty and history of AlUla with a comprehensive journey. Experience camping under the stars, explore AlHijra (UNESCO site), visit Al-Maraya Theater, and discover the stunning natural formations and heritage sites.",
        description_ar: "انضم إلينا في رحلة إلى العلا، حيث يمكنك اكتشاف المناظر الطبيعية الخلابة والمعالم التاريخية مثل الحجر (مدائن صالح). انغمس في جمال وتاريخ العلا برحلة شاملة. خيم تحت النجوم، استكشف الحجر (موقع اليونسكو)، زر مسرح مرايا، واكتشف التكوينات الطبيعية المذهلة والمواقع التراثية.",
        duration_en: "3 Days 2 Nights",
        duration_ar: "3 أيام ليلتان",
        location_en: "AlUla, Saudi Arabia",
        location_ar: "العلا، السعودية",
        group_size: "2-15 Persons",
        price_en: "From 799 SAR per person",
        price_ar: "من 799 ريال سعودي للفرد",
        rating: 4.9,
        reviews: 328,
        image: "alula-three-days.jpg",
        badge: "Most Popular",
        discount: "25%",
        features: ["Hotel accommodation", "All transportation", "Professional guide", "Desert safari", "Camping experience", "All meals included"],
        features_ar: ["سكن فندقي", "جميع المواصلات", "مرشد محترف", "سفاري صحراوي", "تجربة التخييم", "جميع الوجبات مشمولة"],
        highlights: ["Hegra Visit", "Desert Camping", "Star Gazing", "Historical Sites"],
        highlights_ar: ["زيارة الحجر", "التخييم الصحراوي", "مراقبة النجوم", "المواقع التاريخية"],
        includes_en: [
          "Round-trip transportation from Al-Madinah",
          "Hotel accommodation with all amenities",
          "Certified tour guide at archaeological sites",
          "All main meals (dinner, breakfast, lunch)",
          "Desert camping experience",
          "Star gazing session & entertainment",
          "Activities and site entry fees",
          "Professional photography service",
          "Logistical support for the group"
        ],
        includes_ar: [
          "المواصلات ذهابًا وعودة من المدينة المنورة",
          "إقامة فندقية بجميع المرافق",
          "مرشد سياحي معتمد في المواقع الأثرية",
          "جميع الوجبات الرئيسية",
          "تجربة التخييم الصحراوي",
          "جلسة مراقبة النجوم والترفيه",
          "رسوم الفعاليات والمواقع",
          "خدمة التصوير الاحترافي",
          "دعم لوجستي للمجموعة"
        ],
        itinerary_en: `🗓 Day One - Arrival & Heritage Sites
• 11:00 AM – Departure & Pickup from Al-Madinah
• 3:00 PM – Arrival in AlUla + Lunch & Rest
• 6:00 PM – Visit Elephant Rock & Photography
• 7:00 PM – Visit Waterfall Café
• 8:00 PM – Head to Shabtraz Farm
• Special Dinner
• Star Gazing Session
• Evening Entertainment around the Fire
• 11:00 PM – Overnight in Hotel/Camp

🗓 Day Two - Archaeological & Natural Wonders
• 8:00 AM – Breakfast
• 9:30 AM – Activities (based on booking):
  - Al-Hijra UNESCO Site Tour
  - Dadan & Akma Ancient Tombs
  - Zip-lining Experience
• 12:30 PM – Return to farm for Lunch & Rest
• 4:00 PM – Al-Maraya Theater Visit
• 5:00 PM – Al-Harra Viewpoint & Sunset Photography
• 7:00 PM – Old Town Tour & Local Shopping
• 11:00 PM – Return to Camp & Overnight

🗓 Day Three - Natural Exploration & Return
• 8:00 AM – Breakfast
• 9:30 AM – Natural Experience Activity:
  - Desert Dunes Exploration
  - Wadi Al-Naam Adventure
• 12:00 PM – Return to accommodation & Check-out
• 1:00 PM – Departure to Al-Madinah
• 5:30 PM – Arrival in Al-Madinah`,
        itinerary_ar: `🗓 اليوم الأول - الوصول والمواقع التراثية
• 11:00 صباحًا – الاستقبال والانطلاق من المدينة المنورة
• 03:00 عصرًا – الوصول إلى العلا والتوجه لاستلام السكن + وجبة الغداء + استراحة
• 06:00 مساءً – زيارة جبل الفيل والتقاط الصور
• 07:00 مساءً – التوجه إلى كافي شلال
• 08:00 مساءً – التوجه الى مزرعة شابترز
• عشاء مميز
• جلسة تأمل النجوم
• أمسية طربية على شبة النار
• 11:00 ليلًا – المبيت في الفندق/المخيم

🗓 اليوم الثاني - المواقع الأثرية والعجائب الطبيعية
• 08:00 صباحًا – الإفطار
• 09:30 صباحًا – التوجه إلى الفعاليات (حسب الحجز):
  - جولة موقع الحجر بموقع اليونسكو
  - جولة دادان وعكمة الأثرية
  - تجربة الزبلاين
• 12:30 ظهرًا – العودة إلى المزرعة لتناول الغداء + استراحة
• 04:00 عصرًا – زيارة مسرح مرايا
• 05:00 مساءً – مطل الحرة + مشاهدة الغروب والتصوير
• 07:00 مساءً – جولة في البلدة القديمة + تسوق وتجارب محلية
• 11:00 ليلًا – العودة إلى المخيم والمبيت

🗓 اليوم الثالث - الاستكشاف الطبيعي والعودة
• 08:00 صباحًا – الإفطار
• 09:30 صباحًا – التوجه إلى احد التجارب الطبيعية:
  - استكشاف الكثبان الرملية الصحراوية
  - مغامرة وادي النعام
• 12:00 ظهرًا – العودة إلى السكن + تسليم المخيمات
• 01:00 ظهرًا – الانطلاق عودة إلى المدينة المنورة
• 05:30 مساءً – الوصول إلى المدينة المنورة`
      },
      {
        id: 2,
        title_en: "Charming Sea Cruise in Jeddah",
        title_ar: "رحلة بحرية ساحرة في جدة",
        slug: "jeddah-sea-cruise",
        type_en: "Beach & Marine",
        type_ar: "شاطئ وبحري",
        description_en: "Relax on a sea cruise to Jeddah and enjoy beautiful marine views and beach activities. Discover the beauty of the Red Sea while enjoying luxury cruise amenities, water sports, and professional beach services.",
        description_ar: "استمتع برحلة بحرية إلى جدة واستمتع بأجمل المناظر البحرية وأنشطة الشاطئ. اكتشف جمال البحر الأحمر مع الاستمتاع بمرافق الرحلة البحرية الفاخرة والرياضات المائية والخدمات الشاطئية الاحترافية.",
        duration_en: "2 Days 1 Night",
        duration_ar: "يومان ليلة واحدة",
        location_en: "Jeddah, Red Sea",
        location_ar: "جدة، البحر الأحمر",
        group_size: "4-20 Persons",
        price_en: "From 599 SAR per person",
        price_ar: "من 599 ريال سعودي للفرد",
        rating: 4.7,
        reviews: 243,
        image: "jeddah-sea-cruise.jpg",
        badge: "Limited Spots",
        discount: "25%",
        features: ["Luxury cruise ship", "All meals & snacks", "Snorkeling equipment", "Professional crew", "Beach activities", "Photography service"],
        features_ar: ["سفينة بحرية فاخرة", "جميع الوجبات والوجبات الخفيفة", "معدات الغطس", "طاقم احترافي", "أنشطة شاطئية", "خدمة التصوير"],
        highlights: ["Red Sea Views", "Snorkeling", "Beach Relaxation", "Marine Life"],
        highlights_ar: ["مناظر البحر الأحمر", "الغطس", "استرخاء الشاطئ", "الحياة البحرية"],
        includes_en: [
          "Luxury cruise ship transportation",
          "One night on the cruise ship",
          "All meals and premium snacks",
          "Snorkeling equipment rental",
          "Professional crew and guides",
          "Beach activities (volleyball, swimming)",
          "Marine life observation",
          "Professional photography service",
          "Water sports equipment",
          "Complimentary beverages"
        ],
        includes_ar: [
          "نقل سفينة بحرية فاخرة",
          "ليلة واحدة على السفينة البحرية",
          "جميع الوجبات والوجبات الخفيفة المتميزة",
          "استئجار معدات الغطس",
          "طاقم ومرشدون محترفون",
          "أنشطة شاطئية (كرة الشاطئ، السباحة)",
          "مراقبة الحياة البحرية",
          "خدمة التصوير الاحترافي",
          "معدات الرياضات المائية",
          "المشروبات المجانية"
        ],
        itinerary_en: `🗓 Day One - Departure & Cruise
• 10:00 AM – Meeting point at Jeddah Port
• 10:30 AM – Board the Luxury Cruise Ship
• 11:00 AM – Safety briefing and ship orientation
• 12:00 PM – Welcome lunch at the main dining hall
• 2:00 PM – Snorkeling session with professional guide
• 5:00 PM – Relaxation on the upper deck
• 6:00 PM – Sunset viewing
• 7:00 PM – Gourmet dinner
• 8:30 PM – Evening entertainment
• 11:00 PM – Rest in your cabin

🗓 Day Two - Beach Activities & Return
• 7:00 AM – Breakfast buffet
• 8:00 AM – Early morning swimming
• 9:00 AM – Marine life observation tour
• 10:30 AM – Beach games and sports (volleyball, beach soccer)
• 12:00 PM – Lunch with sea views
• 2:00 PM – Free time for swimming and relaxation
• 4:00 PM – Return to Jeddah Port
• 5:00 PM – Disembark and transfer service`,
        itinerary_ar: `🗓 اليوم الأول - الانطلاق والرحلة البحرية
• 10:00 صباحًا – نقطة الالتقاء في ميناء جدة
• 10:30 صباحًا – الصعود إلى السفينة البحرية الفاخرة
• 11:00 صباحًا – إحاطة سلامة وجولة في السفينة
• 12:00 ظهرًا – غداء ترحيب في قاعة الطعام الرئيسية
• 02:00 عصرًا – جلسة غطس مع مرشد محترف
• 05:00 عصرًا – الاسترخاء على الطابق العلوي
• 06:00 مساءً – مشاهدة الغروب
• 07:00 مساءً – عشاء فاخر
• 08:30 مساءً – ترفيه مسائي
• 11:00 ليلًا – الراحة في غرفتك

🗓 اليوم الثاني - أنشطة الشاطئ والعودة
• 07:00 صباحًا – إفطار بوفيه
• 08:00 صباحًا – السباحة في الصباح الباكر
• 09:00 صباحًا – جولة مراقبة الحياة البحرية
• 10:30 صباحًا – ألعاب الشاطئ والرياضات (كرة الشاطئ، كرة قدم الشاطئ)
• 12:00 ظهرًا – غداء مع إطلالة على البحر
• 02:00 عصرًا – وقت حر للسباحة والاسترخاء
• 04:00 عصرًا – العودة إلى ميناء جدة
• 05:00 مساءً – النزول وخدمة النقل`
      }
    ];

    setLoading(true);
    // Simulate a small delay to match API behavior
    setTimeout(() => {
      setDestinations(staticDestinations);
      setError(null);
      setLoading(false);
    }, 300);
  }, []);

  // Auto-play functionality (moved up to ensure consistent Hooks order)
  useEffect(() => {
    if (!isAutoPlaying || isHovered || destinations.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % destinations.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, destinations.length, isHovered]);

  // Show loading state
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading island destinations...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #8A7779 0%, #6e6768ff 50%, #5a4f50 100%)' }}>
        <div>
          <p style={{ color: '#ff6b6b', fontSize: '1.1rem' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 20px', background: '#dfa528', color: '#333', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use destinations from API, fallback to empty array
  const displayDestinations = destinations.length > 0 ? destinations : [];

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const total = displayDestinations.length;
      if (total === 0) return 0;
      return (prev + 1) % total;
    });
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => {
      const total = displayDestinations.length;
      if (total === 0) return 0;
      return (prev - 1 + total) % total;
    });
  };

  const goToSlide = (index) => {
    const total = displayDestinations.length;
    if (total === 0) return;
    setCurrentSlide(Math.max(0, Math.min(index, total - 1)));
  };

  const handleBookNow = (destination) => {
    let title = getText(destination, 'title') || destination.title || '';
    // Remove URL if it's appended to the title
    if (title.includes('http')) {
      title = title.split(/https?:\/\//)[0].trim();
    }
    // Get price from multiple possible field names and normalize
    const amount = (
      parseFloat(destination.price) ||
      parseFloat(destination.price_en) ||
      parseFloat(destination.price_ar) ||
      parseFloat(destination.amount) ||
      0
    );
    console.debug('[IslandDestinations] book now ->', { slug: destination.slug, title, raw: destination, amount });
    openBookingOrAuth({
      title,
      amount,
      slug: destination.slug || destination.id?.toString?.() || "",
    });
  };

  const handleWhatsApp = (destination) => {
    const title = getText(destination, 'title') || '';
    const id = destination.id?.toString?.() || destination.slug || '';
    const base = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : API_URL.replace(/\/api\/?$/, '');
    const url = id ? `${base}/islands/${id}` : base;
    const message = lang === 'ar'
      ? `مرحبا، أريد الاستفسار عن ${title}. ${url}`
      : `Hello, I'm interested in ${title}. ${url}`;
    const phoneNumber = '966547305060';
    const whatsappUrl = `https://wa.me/${encodeURIComponent(phoneNumber)}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleViewDetails = (destination) => {
    const id = destination.id?.toString?.() || destination.slug || '';
    const path = `/${currentLang}/local-islands/${id}`;
    console.debug('[IslandDestinationsLocal] view details (local) ->', { id, path, destination });
    if (id) {
      router.push(path);
    }
  };
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={14} 
        fill={i < Math.floor(rating) ? "#dfa528" : "none"} 
        color="#dfa528"
      />
    ));
  };

  // Get visible slides for continuous carousel
  const getVisibleSlides = () => {
    const slides = [];
    const total = displayDestinations.length;
    if (total === 0) return slides;
    
    // Always show 5 slides: previous 2, current, next 2
    for (let i = -2; i <= 2; i++) {
      const slideIndex = (currentSlide + i + total) % total;
      slides.push({
        index: slideIndex,
        position: i,
        destination: displayDestinations[slideIndex]
      });
    }
    
    return slides;
  };

  const getSlideStyle = (position) => {
    const baseStyle = {
      transition: "all 0.5s ease-in-out",
      position: "absolute",
    };

    switch (position) {
      case -2: // Far left
        return {
          ...baseStyle,
          transform: "translateX(-180%) scale(0.7)",
          zIndex: 10,
          opacity: 0.4,
          filter: "blur(2px) brightness(0.6)",
        };
      case -1: // Left
        return {
          ...baseStyle,
          transform: "translateX(-90%) scale(0.85)",
          zIndex: 20,
          opacity: 0.7,
          filter: "blur(1px) brightness(0.8)",
        };
      case 0: // Center
        return {
          ...baseStyle,
          transform: "translateX(0) scale(1)",
          zIndex: 30,
          opacity: 1,
          filter: "brightness(1)",
        };
      case 1: // Right
        return {
          ...baseStyle,
          transform: "translateX(90%) scale(0.85)",
          zIndex: 20,
          opacity: 0.7,
          filter: "blur(1px) brightness(0.8)",
        };
      case 2: // Far right
        return {
          ...baseStyle,
          transform: "translateX(180%) scale(0.7)",
          zIndex: 10,
          opacity: 0.4,
          filter: "blur(2px) brightness(0.6)",
        };
      default:
        return baseStyle;
    }
  };

  const visibleSlides = getVisibleSlides();

  return (
    <>
      <section
        className="position-relative py-5 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #8A7779 0%, #6e6768ff 50%, #5a4f50 100%)",
          color: "white",
          direction: lang === "ar" ? "rtl" : "ltr",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Pattern */}
        <div 
          className="position-absolute w-100 h-100"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            opacity: 0.5,
          }}
        />

        <div className="container position-relative z-2">
          {/* Section Header */}
          <div className="text-center mb-5">
            <motion.h2
              className="display-4 fw-bold mb-3"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                fontFamily: "'Tajawal', sans-serif",
                background: "linear-gradient(135deg, #ffffff, #EFC8AE, #dfa528)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "0 4px 8px rgba(0,0,0,0.2)",
                fontSize: "1.75rem",
              }}
            >
              {t.title}
            </motion.h2>

            <motion.p
              className="lead mb-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                fontFamily: "'Tajawal', sans-serif !important",
                maxWidth: "600px",
                margin: "0 auto",
                color: "rgba(255,255,255,0.9)",
                fontSize: "1.2rem",
              }}
            >
              {t.subtitle}
            </motion.p>
          </div>

          {/* Slider Container */}
          <div className="position-relative" style={{ height: "650px" }}>
            {/* Navigation Arrows */}
            <motion.button
              onClick={prevSlide}
              className="btn position-absolute border-0"
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.25)" }}
              whileTap={{ scale: 0.95 }}
              style={{
                top: "50%",
                [lang === "ar" ? "right" : "left"]: "30px",
                transform: "translateY(-50%)",
                zIndex: 40,
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(20px)",
                border: "2px solid rgba(255,255,255,0.3)",
                color: "white",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              {lang === "ar" ? <ChevronRight size={28} /> : <ChevronLeft size={28} />}
            </motion.button>

            <motion.button
              onClick={nextSlide}
              className="btn position-absolute border-0"
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.25)" }}
              whileTap={{ scale: 0.95 }}
              style={{
                top: "50%",
                [lang === "ar" ? "left" : "right"]: "30px",
                transform: "translateY(-50%)",
                zIndex: 40,
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(20px)",
                border: "2px solid rgba(255,255,255,0.3)",
                color: "white",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              {lang === "ar" ? <ChevronLeft size={28} /> : <ChevronRight size={28} />}
            </motion.button>

            {/* Slides Container - Continuous Carousel */}
            <div className="d-flex align-items-center justify-content-center position-relative" style={{ height: "100%" }}>
              <AnimatePresence mode="popLayout">
                {visibleSlides.map(({ index, position, destination }) => {
                  const isActive = position === 0;
                  const style = getSlideStyle(position);

                  return (
                    <motion.div
                      key={`${destination.id}-${position}`}
                      initial={style}
                      animate={style}
                      exit={style}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30,
                        duration: 0.5 
                      }}
                      className="position-absolute"
                      style={{
                        width: "420px",
                        cursor: "pointer",
                      }}
                      onClick={() => goToSlide(index)}
                    >
                      <motion.div
                        className="rounded-4 overflow-hidden position-relative"
                        whileHover={{ scale: isActive ? 1.02 : 1.05 }}
                        style={{
                          height: isActive ? "580px" : "500px",
                          background: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.8)), url(${getImageUrl(destination.image)})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          boxShadow: isActive 
                            ? "0 35px 60px rgba(0,0,0,0.6), 0 0 0 2px rgba(223, 165, 40, 0.3)"
                            : "0 20px 40px rgba(0,0,0,0.4)",
                          transition: "all 0.4s ease",
                        }}
                      >
                        {/* Premium Badge */}
                        <div className="position-absolute top-0 start-0 m-4">
                          <div className="bg-warning text-dark px-3 py-1 rounded-pill fw-bold small d-flex align-items-center gap-2">
                            {getText(destination, 'type')}
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="position-absolute top-0 end-0 m-4">
                          <div className="bg-dark bg-opacity-75 px-2 py-1 rounded-3 d-flex align-items-center gap-1">
                            {renderStars(destination.rating)}
                            <small className="text-warning fw-bold ms-1">{destination.rating}</small>
                          </div>
                        </div>

                        {/* Content Overlay */}
                        <div className="position-absolute bottom-0 start-0 end-0 p-4 text-white">
                          <h4 className="fw-bold mb-3" style={{ fontSize: isActive ? "1.75rem" : "1.5rem" }}>
                            {getText(destination, 'title')}
                          </h4>

                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <p className="mb-4" style={{ opacity: 0.9, lineHeight: "1.6", fontSize: "0.95rem" }}>
                                {getText(destination, 'description')}
                              </p>

                              {/* Features */}
                              <div className="row mb-4">
                                {(destination.features || destination.features_en || []).map((feature, idx) => (
                                  <div key={idx} className="col-6 mb-2">
                                    <div className="d-flex align-items-center gap-2">
                                      <Waves size={14} className="text-warning" />
                                      <small style={{ opacity: 0.9, fontSize: "0.8rem", fontWeight: "500" }}>
                                        {feature}
                                      </small>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Trip Details */}
                              <div className="row mb-4">
                                <div className="col-4">
                                  <div className="d-flex align-items-center gap-2 mb-2">
                                    <Clock size={14} className="text-warning" />
                                    <small style={{ opacity: 0.8, fontSize: "0.75rem" }}>
                                      {getText(destination, 'duration')}
                                    </small>
                                  </div>
                                </div>
                                <div className="col-4">
                                  <div className="d-flex align-items-center gap-2 mb-2">
                                    <Users size={14} className="text-warning" />
                                    <small style={{ opacity: 0.8, fontSize: "0.75rem" }}>
                                      {getText(destination, 'groupSize')}
                                    </small>
                                  </div>
                                </div>
                                <div className="col-4">
                                  <div className="d-flex align-items-center gap-2 mb-2">
                                    <MapPin size={14} className="text-warning" />
                                    <small style={{ opacity: 0.8, fontSize: "0.75rem" }}>
                                      {getText(destination, 'location')}
                                    </small>
                                  </div>
                                </div>
                              </div>

                              {/* Price & CTA */}
                              <div className="d-flex justify-content-between align-items-center">
                             
                                <div className="d-flex gap-3">
                                  <motion.button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleBookNow(destination);
                                    }}
                                    className="btn btn-warning px-4 fw-bold"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ borderRadius: "25px", fontSize: "0.9rem", background: "#EFC8AE", color: "#000", border: "none" }}
                                  >
                                    {t.bookNow}
                                  </motion.button>

                                  <motion.button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleWhatsApp(destination);
                                    }}
                                    className="btn d-flex align-items-center gap-2 px-3 fw-bold"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ borderRadius: "25px", fontSize: "0.9rem", background: "#25D366", color: "#fff", border: "none" }}
                                    title={lang === 'ar' ? 'واتساب' : 'WhatsApp'}
                                  >
                                    <FaWhatsapp style={{ fontSize: '18px' }} />
                                    <span style={{ fontSize: '0.9rem' }}>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                                  </motion.button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewDetails(destination);
                                    }}
                                    className="btn btn-outline-light px-3"
                                    style={{ borderRadius: "25px", fontSize: "0.9rem" }}
                                  >
                                    {t.viewDetails}
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {/* Minimal info for non-active slides */}
                          {!isActive && (
                            <div className="text-center">
                              <div className="text-warning fw-bold mb-2">{getText(destination, 'price')}</div>
                              <small style={{ opacity: 0.7 }}>{getText(destination, 'duration')}</small>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            <div className="d-flex justify-content-center mt-4">
              {displayDestinations.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="btn p-0 mx-1 border-0"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: currentSlide === index ? "24px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    backgroundColor: currentSlide === index ? "#dfa528" : "rgba(255,255,255,0.4)",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div> {/* end slider container */}
        </div> {/* end container */}
      </section>

    </>
  );
}