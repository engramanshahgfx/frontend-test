"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ChevronLeft,
  ChevronRight,
  Waves,
  Star,
  Clock,
  Users,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useUI } from "../../providers/UIProvider";
import { API_URL } from "../../lib/api";

// Fallback data if API fails
const fallbackDestinations = [
  {
    id: 1,
    slug: "island-1",
    title_en: "International Destination",
    title_ar: "وجهة دولية",
    title_zh: "国际目的地",
    image: "/placeholder.png",
    rating: 4.5,
  },
];

export default function IslandDestinationsinternational({ lang }) {
  const router = useRouter();
  const currentLang = lang || "en";
  const { openBookingOrAuth } = useUI();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Respect reduced motion preference
  const prefersReducedMotion = (typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || false;

  // Dynamic labels based on language
  const labels = {
    en: {
      title: "Discover the World",
      subtitle: "Experience the perfect blend of luxury, nature, and adventure in world's most stunning destinations",
      viewDetails: "View Details",
      bookNow: "Book Now",
    },
    ar: {
      title: "اكتشف العالم",
      subtitle: "اختبر المزيج المثالي بين الفخامة والطبيعة والمغامرة في أجمل الوجهات العالمية",
      viewDetails: "عرض التفاصيل",
      bookNow: "احجز الآن",
    },
    zh: {
      title: "探索世界",
      subtitle: "在世界最令人惊叹的目的地体验奢华、自然与冒险的完美融合",
      viewDetails: "查看详情",
      bookNow: "立即预订",
    },
  };

  const t = labels[lang] || labels.en;

  // Safely parse JSON arrays from backend
  const parseList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  // Get localized field
  const getText = (obj, field) => {
    // Handle title and name fields (both used in different parts)
    if (field === "title" && obj.title_en) {
      if (lang === "zh") return obj.title_zh || obj.title_en;
      if (lang === "ar") return obj.title_ar || obj.title_en;
      return obj.title_en;
    }
    if (field === "name" && obj.name_en) {
      if (lang === "zh") return obj.name_zh || obj.name_en;
      if (lang === "ar") return obj.name_ar || obj.name_en;
      return obj.name_en;
    }

    // Fallback for all other fields with Chinese support
    let fieldKey = `${field}_en`;
    if (lang === "zh") fieldKey = `${field}_zh`;
    else if (lang === "ar") fieldKey = `${field}_ar`;
    return obj[fieldKey] || obj[`${field}_en`] || obj[field] || "";
  };

  // Build a full image URL for destination images with cache busting
  const getImageUrl = (img) => {
    const placeholder = "/placeholder.png";
    if (!img) return placeholder;
    // If already a full URL (includes http), return as-is
    if (/^https?:\/\//.test(img)) return img;
    const backendBase = API_URL.replace(/\/api\/?$/, "");

    // If starts with /, it's already a path
    if (img.startsWith("/")) return `${backendBase}${img}?t=${Date.now()}`;

    // Support existing conventions: storage/... or islands/... (both under /storage/ symlink)
    if (img.startsWith("storage/")) return `${backendBase}/${img}?t=${Date.now()}`;
    if (img.startsWith("islands/") || img.startsWith("international/")) return `${backendBase}/storage/${img}?t=${Date.now()}`;

    // Fallback: assume it's a relative path
    return `${backendBase}/storage/islands/${img}?t=${Date.now()}`;
  };

  // Fetch international island destinations from backend
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiEndpoint = `${API_URL.replace(/\/$/, '')}/island-destinations?type=international`;
        console.debug('[IslandDestinationsInternational] Fetching from:', apiEndpoint);
        
        const res = await fetch(apiEndpoint, { 
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        console.debug('[IslandDestinationsInternational] Response status:', res.status);
        
        const json = await res.json();
        console.debug('[IslandDestinationsInternational] Response data:', json);
        
        if (!res.ok) {
          throw new Error(`API error: ${res.status} - ${json?.message || 'Unknown error'}`);
        }
        
        if (!json?.success) {
          throw new Error(json?.message || 'Failed to fetch destinations');
        }
        
        const data = Array.isArray(json.data) ? json.data : [];
        console.debug('[IslandDestinationsInternational] Loaded destinations count:', data.length);
        
        if (data.length > 0) {
          setDestinations(
            data.map((d) => ({
              ...d,
              image: d.image || '/placeholder.png',
            }))
          );
        } else {
          // Use fallback data if API returns empty
          console.warn('[IslandDestinationsInternational] API returned empty, using fallback');
          setDestinations(fallbackDestinations);
        }
        setLoading(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[IslandDestinationsInternational] Fetch error:', err.message);
          // Use fallback data on error instead of showing error state
          console.warn('[IslandDestinationsInternational] Using fallback destinations due to API error');
          setDestinations(fallbackDestinations);
          setError(null); // Don't show error if we have fallback
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  // Auto-play functionality (with improved timing & reduced-motion support)
  useEffect(() => {
    if (destinations.length === 0) return;

    if (prefersReducedMotion) {
      setIsAutoPlaying(false);
      return;
    }

    if (isHovered || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % destinations.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, destinations.length, isHovered, prefersReducedMotion]);

  // Keyboard navigation & space toggles autoplay
  useEffect(() => {
    const onKey = (e) => {
      if (document.activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => {
          const total = destinations.length;
          return total ? (prev - 1 + total) % total : 0;
        });
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide(prev => {
          const total = destinations.length;
          return total ? (prev + 1) % total : 0;
        });
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        setIsAutoPlaying(s => !s);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [destinations.length]);

  // Show loading state
  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading island destinations...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #8A7779 0%, #6e6768ff 50%, #5a4f50 100%)",
        }}
      >
        <div>
          <p style={{ color: "#ff6b6b", fontSize: "1.1rem" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#dfa528",
              color: "#333",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
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
    let title = getText(destination, 'title') || '';
    // Remove URL if it's appended to the title
    if (title.includes('http')) {
      title = title.split(/https?:\/\//)[0].trim();
    }
    // Get price from multiple possible field names
    const amount = (
      parseFloat(destination.price) ||
      parseFloat(destination.price_en) ||
      parseFloat(destination.price_ar) ||
      parseFloat(destination.amount) ||
      0
    );
    const slug = destination.slug || destination.id || '';
    console.debug('[IslandDestinationsInternational] book now ->', { slug, title, raw: destination, amount });
    try {
      openBookingOrAuth({ title, amount, slug });
    } catch (e) {
      console.error('openBookingOrAuth not available', e);
      handleWhatsApp(destination);
    }
  };

  const handleWhatsApp = (destination) => {
    const title = getText(destination, "title") || "";
    const id = destination.id?.toString?.() || destination.slug || "";
    const base =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : API_URL.replace(/\/api\/?$/, "");
    const url = id ? `${base}/islands/${id}` : base;
    const message =
      lang === "ar"
        ? `مرحبا، أريد الاستفسار عن ${title}. ${url}`
        : `Hello, I'm interested in ${title}. ${url}`;
    const phoneNumber = "+966533360423";
    const whatsappUrl = `https://wa.me/${encodeURIComponent(
      phoneNumber
    )}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // const handleViewDetails = (destination) => {
  //   const slug = destination.slug || "";
  //   const path = `/${currentLang}/islands/${slug}`;
  //   console.debug("[IslandDestinationsInternational] view details ->", {
  //     slug,
  //     path,
  //     destination,
  //   });

  //   if (slug) router.push(path);
  // };

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
        destination: displayDestinations[slideIndex],
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
          background:
            "linear-gradient(135deg, #8A7779 0%, #6e6768ff 50%, #5a4f50 100%)",
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
                background:
                  " #dfa528",
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
              aria-label={lang === 'ar' ? 'Next slide' : 'Previous slide'}
              className="btn position-absolute border-0"
              tabIndex={0}
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(255,255,255,0.25)",
              }}
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
                outline: 'none',
              }}
            >
              {lang === "ar" ? (
                <ChevronRight size={28} />
              ) : (
                <ChevronLeft size={28} />
              )}
            </motion.button>

            <motion.button
              onClick={nextSlide}
              aria-label={lang === 'ar' ? 'Previous slide' : 'Next slide'}
              className="btn position-absolute border-0"
              tabIndex={0}
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(255,255,255,0.25)",
              }}
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
                outline: 'none',
              }}
            >
              {lang === "ar" ? (
                <ChevronLeft size={28} />
              ) : (
                <ChevronRight size={28} />
              )}
            </motion.button>

            {/* Slides Container - Continuous Carousel */}
            <div
              className="d-flex align-items-center justify-content-center position-relative"
              style={{ height: "100%" }}
            >
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
                        duration: 0.5,
                      }}
                      className="position-absolute"
                      tabIndex={0}
                      role="button"
                      aria-label={`Go to slide ${index + 1} - ${getText(destination, 'title')}`}
                      style={{
                        width: "clamp(380px, 36vw, 420px)",
                        cursor: "pointer",
                        outline: "none",
                      }}S
                      onClick={() => goToSlide(index)}
                      onKeyDown={(e) => { if (e.key === 'Enter') goToSlide(index); }} 
                    >
                      <motion.div
                        className="rounded-4 overflow-hidden position-relative"
                        whileHover={{ scale: isActive ? 1.02 : 1.05 }}
                        style={{
                          height: isActive ? "580px" : "500px",
                          boxShadow: isActive
                            ? "0 35px 60px rgba(0,0,0,0.3), 0 0 0 2px rgba(223, 165, 40, 0.3)"
                            : "0 20px 40px rgba(0,0,0,0.2)",
                          transition: prefersReducedMotion ? 'none' : 'transform 0.5s cubic-bezier(.2,.8,.2,1)',
                          willChange: 'transform',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={getImageUrl(destination.image)}
                          alt={getText(destination, 'title') || 'Island image'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        <div className="position-absolute bottom-0 start-0 end-0 p-4 text-white d-flex justify-content-center" style={{ background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.45))' }}>
                          <div className="d-flex gap-3 align-items-center"> 
                  

                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleWhatsApp(destination);
                              }}
                              className="btn d-flex align-items-center gap-2 px-3 fw-bold"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              style={{
                                borderRadius: "25px",
                                fontSize: "0.9rem",
                                background: "#25D366",
                                color: "#fff",
                                border: "none",
                              }}
                              title={lang === "ar" ? "واتساب" : "WhatsApp"}
                            >
                              <FaWhatsapp style={{ fontSize: "18px" }} />
                              <span style={{ fontSize: "0.9rem" }}>
                                {lang === "ar" ? "واتساب" : "WhatsApp"}
                              </span>
                            </motion.button>

                     
                          </div>
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
                  aria-label={`Go to slide ${index + 1}`}
                  role="tab"
                  aria-selected={currentSlide === index}
                  className="btn p-0 mx-1 border-0"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    width: currentSlide === index ? "24px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    backgroundColor:
                      currentSlide === index
                        ? "#dfa528"
                        : "rgba(255,255,255,0.4)",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>{" "}
        </div>{" "}
      </section>
    </>
  );
}
