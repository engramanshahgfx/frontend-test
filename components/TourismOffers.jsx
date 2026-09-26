"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Star,
  MapPin,
  Clock,
  Eye,
  Heart,
  ChevronRight,
  Users,
} from "lucide-react";
import { API_URL } from "../lib/api";
import { formatCurrency, amountWithVAT } from "../lib/localization";
import BookingModal from "@/components/BookingModal";
import TravelReservationModal from "@/components/TravelReservationModal";

// Fallback data if API fails
const fallbackDestinations = [
  {
    id: 1,
    slug: "offer-1",
    title_en: "Luxury Beach Resort",
    title_ar: "منتجع شاطئ فاخر",
    image: "/placeholder.png",
    rating: 4.8,
    price: 2500,
    description_en: "Experience luxury like never before with stunning ocean views",
    location: "Maldives",
    duration: "5 Days",
    discount: 20,
  },
  {
    id: 2,
    slug: "offer-2",
    title_en: "Mountain Adventure",
    title_ar: "مغامرة جبلية",
    image: "/placeholder.png",
    rating: 4.6,
    price: 1800,
    description_en: "Explore the breathtaking mountains with guided tours",
    location: "Swiss Alps",
    duration: "4 Days",
    discount: 15,
  },
  {
    id: 3,
    slug: "offer-3",
    title_en: "Cultural City Tour",
    title_ar: "جولة مدينة ثقافية",
    image: "/placeholder.png",
    rating: 4.7,
    price: 1200,
    description_en: "Immerse yourself in rich history and culture",
    location: "Istanbul",
    duration: "3 Days",
    discount: null,
  },
  {
    id: 4,
    slug: "offer-4",
    title_en: "Desert Safari",
    title_ar: "رحلة صحراوية",
    image: "/placeholder.png",
    rating: 4.9,
    price: 3200,
    description_en: "Experience the thrill of desert adventures",
    location: "Dubai",
    duration: "2 Days",
    discount: 25,
  },
];

// ✅ FIXED: Changed from BestTourismOffers to TourismOffers
export default function TourismOffers({ lang, maxItems = 3 }) {
  const router = useRouter();
  const currentLang = lang || "en";
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTravelReservationModal, setShowTravelReservationModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const labels = {
    en: {
      title: "Best Saudi Offers",
      subtitle: "Discover amazing deals and unforgettable experiences",
      viewDetails: "View Details",
      bookNow: "Book Now",
      viewAll: "View All Offers",
      from: "From",
      perPerson: "per person",
      popular: "Popular",
      limited: "Limited Offer",
    },
    ar: {
      title: "أفضل عروض السعودية",
      subtitle: "اكتشف الصفقات المذهلة والتجارب التي لا تنسى",
      viewDetails: "عرض التفاصيل",
      bookNow: "احجز الآن",
      viewAll: "عرض جميع العروض",
      from: "من",
      perPerson: "للفرد",
      popular: "الأكثر شهرة",
      limited: "عرض محدود",
    },
  };

  const t = labels[lang] || labels.en;

  const getText = (obj, field) => {
    if (!obj) return "";
    if (field === "title" && obj.title_en) {
      return lang === "ar" ? obj.title_ar || obj.title_en : obj.title_en;
    }
    if (field === "description" && obj.description_en) {
      return lang === "ar" ? obj.description_ar || obj.description_en : obj.description_en;
    }
    if (field === "location" && obj.location_en) {
      return lang === "ar" ? obj.location_ar || obj.location_en : obj.location_en;
    }
    if (field === "duration" && obj.duration_en) {
      return lang === "ar" ? obj.duration_ar || obj.duration_en : obj.duration_en;
    }
    const fieldKey = lang === "ar" ? `${field}_ar` : `${field}_en`;
    return obj[fieldKey] || obj[`${field}_en`] || obj[field] || "";
  };

  const getImageUrl = (item) => {
    if (!item) return "/placeholder.png";
    let img = item;
    if (typeof item === "object") {
      if (item.image_url && typeof item.image_url === "string" && /^https?:\/\//.test(item.image_url)) {
        return item.image_url;
      }
      img = item.image_url || item.image || item.image_path || "";
    }
    if (!img || typeof img !== "string") return "/placeholder.png";
    if (/^https?:\/\//.test(img)) return img;
    const backendBase = API_URL.replace(/\/api\/?$/, "");
    const cleanImg = img.replace(/^\//, "");
    if (cleanImg.startsWith("storage/")) return `${backendBase}/${cleanImg}`;
    if (cleanImg.startsWith("offers/") || cleanImg.startsWith("tourism/") || cleanImg.includes("/")) {
      return `${backendBase}/storage/${cleanImg}`;
    }
    return `${backendBase}/storage/offers/${cleanImg}`;
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiEndpoint = `${API_URL.replace(/\/$/, "")}/tourism-offers`;
        console.log("[TourismOffers] Fetching from:", apiEndpoint);

        const res = await fetch(apiEndpoint, {
          signal: controller.signal,
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        const json = await res.json();
        console.log("[TourismOffers] Response:", json);

        if (!res.ok) {
          throw new Error(`API error: ${res.status} - ${json?.message || "Unknown error"}`);
        }

        if (!json?.success) {
          throw new Error(json?.message || "Failed to fetch offers");
        }

        const data = Array.isArray(json.data) ? json.data : [];
        if (data.length > 0) {
          setDestinations(data);
        } else {
          setDestinations(fallbackDestinations);
        }
        setLoading(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("[TourismOffers] Fetch error:", err.message);
          setDestinations(fallbackDestinations);
          setError(null);
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  const handleViewAllOffers = () => {
    router.push(`/${currentLang}/tousimoffers`);
  };

  const handleViewDetails = (destination) => {
    // Use slug for SEO-friendly URLs, fallback to ID
    const slug = destination.slug || destination.id || "";
    router.push(`/${currentLang}/tousimoffers/${slug}`);
  };

  const handleBookNow = (destination) => {
    console.log("Book Now clicked for:", destination);
    console.log("Offer data:", {
      id: destination.id,
      title: destination.title_en,
      price: destination.price,
      slug: destination.slug
    });
    setSelectedOffer(destination);
    setShowBookingModal(true);
  };
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) - fullStars >= 0.5;
    return Array.from({ length: 5 }, (_, i) => {
      if (i < fullStars) {
        return <Star key={i} size={16} fill="#FFC60B" color="#FFC60B" style={{ display: "inline" }} />;
      } else if (i === fullStars && hasHalfStar) {
        return <Star key={i} size={16} fill="#FFC60B" color="#FFC60B" style={{ display: "inline", opacity: 0.5 }} />;
      } else {
        return <Star key={i} size={16} fill="none" color="#ddd" style={{ display: "inline" }} />;
      }
    });
  };

  // Helper function to format price with icon
  const formatPriceWithIcon = (price) => {
    return (
      <span className="price-amount-wrapper">
        <span className="price-amount">{price}</span>
        <Image
          src="/saudi_riyal.png"
          alt="SAR"
          width={16}
          height={16}
          className="currency-icon"
        />
      </span>
    );
  };

  if (loading) {
    return (
      <section className="offers-section">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading offers...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="offers-section">
        <div className="container">
          <div className="text-center py-5">
            <p className="text-danger">{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-main">
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  const getPersonRange = (destination) => {
    if (!destination) return null;

    let prices = destination.person_prices;
    if (typeof prices === "string") {
      try {
        prices = JSON.parse(prices);
      } catch (e) {
        prices = null;
      }
    }

    if (Array.isArray(prices) && prices.length > 0) {
      const personNums = prices
        .map((item) => Number(item.persons || item.person_count || item.count || item.num))
        .filter((n) => !isNaN(n) && n > 0);

      if (personNums.length > 0) {
        const min = Math.min(...personNums);
        const max = Math.max(...personNums);
        if (min === max) return `${min}`;
        return `${min} - ${max}`;
      }
    }

    const minP = Number(destination.min_persons);
    const maxP = Number(destination.max_persons);
    if (!isNaN(minP) && minP > 0 && !isNaN(maxP) && maxP > 0) {
      if (minP === maxP) return `${minP}`;
      return `${minP} - ${maxP}`;
    }

    if (destination.group_size) {
      const str = String(destination.group_size).replace(/persons|person|أفراد|فرد/gi, '').trim();
      if (str) return str;
    }

    if (destination.person_count || destination.persons) {
      return String(destination.person_count || destination.persons);
    }

    return null;
  };

  const displayDestinations = Array.isArray(destinations) && destinations.length > 0
    ? destinations.slice(0, maxItems)
    : [];

  return (
    <>
      <section className="offers-section" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="container" style={{ maxWidth: "1200px" }}>
          <div className="row">
            <div className="col-12 text-center">

              <h2 className="section-title">
                {lang === "ar" ? (
                  <><span className="highlight-orange">اكتشف</span> <span className="highlight-green">السعودية</span></>
                ) : (
                  <><span className="highlight-orange">Discover</span> <span className="highlight-green">Saudi Arabia</span></>
                )}
              </h2>

            </div>
          </div>

          <div className="row g-4">
            {displayDestinations.map((destination, index) => (
              <motion.div
                key={destination.id || index}
                className="col-lg-4 col-md-6 col-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="offer-card">
                  <div className="offer-image">
                    <img
                      src={getImageUrl(destination.image)}
                      alt={getText(destination, "title")}
                      onError={(e) => { e.target.src = "/placeholder.png"; }}
                    />
                    <div className="badges-container">
                      {destination.discount && (
                        <span className="discount-badge">{destination.discount}% OFF</span>
                      )}
                      {destination.popular && <span className="popular-badge">{t.popular}</span>}
                      {destination.limited && <span className="limited-badge">{t.limited}</span>}
                    </div>
                    <div className="offer-overlay">
                      <button className="btn-quick-view" onClick={() => handleViewDetails(destination)}>
                        <Eye size={20} />
                      </button>
                      <button className="btn-favorite">
                        <Heart size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="offer-content">
                    <div className="offer-header">
                      <h3>{getText(destination, "title")}</h3>
                      <div className="rating">
                        {renderStars(destination.rating)}
                        <span className="rating-value">{destination.rating || 0}</span>
                      </div>
                    </div>

                    <p className="offer-description">
                      {getText(destination, "description")}
                    </p>

                    <div className="offer-meta">
                      {getText(destination, "location") && (
                        <span><MapPin size={14} /> {getText(destination, "location")}</span>
                      )}
                      {getText(destination, "duration") && (
                        <span><Clock size={14} /> {getText(destination, "duration")}</span>
                      )}
                      {getPersonRange(destination) && (
                        <span><Users size={14} /> {getPersonRange(destination)}</span>
                      )}
                    </div>

                    <div className="offer-footer">
                      <div className="offer-price">
                        {destination.original_price && (
                          <span className="price-original">
                            {destination.original_price}
                            <Image
                              src="/saudi_riyal.png"
                              alt="SAR"
                              width={12}
                              height={12}
                              className="currency-icon-small"
                            />
                          </span>
                        )}
                        <div className="price-amount-wrapper">
                          <span className="price-amount">{destination.price}</span>
                          <Image
                            src="/saudi_riyal.png"
                            alt="SAR"
                            width={16}
                            height={16}
                            className="currency-icon"
                          />
                        </div>
                        {/* <span className="price-per">{t.perPerson}</span> */}
                      </div>
                      <button
                        className="btn-book"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(destination);
                        }}
                      >
                        {t.bookNow}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {displayDestinations.length > 0 && (
            <div className="row mt-2">
              <div className="col-12 text-center">
                <motion.button
                  className="btn-view-all"
                  onClick={handleViewAllOffers}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#E85D1F',
                    color: '#fff',
                    padding: '12px 35px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '1rem',
                    border: 'none',
                    marginTop: '10px',
                    textDecoration: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 15px rgba(255, 123, 0, 0.41)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1C0052';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 15, 151, 0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#E85D1F';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(28, 0, 82, 0.25)';
                  }}
                >
                  <span>{t.viewAll}</span>
                  <ChevronRight size={18} />
                </motion.button>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .offers-section {
            padding: 30px 0 35px 0;
            background: #FAF6F0; /* Soft Desert Sand theme variant */
          }
          .section-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #E85D1F; /* Desert Sunset Orange */
            position: relative;
            padding-bottom: 10px;
            margin-bottom: 35px;
          }
          .highlight-green {
            color: #006C35; /* Premium Saudi Flag Green */
          }

          .highlight-orange {
            color: #E85D1F; /* Desert Sunset Orange */
          }

          .section-title:after {
            content: "";
            position: absolute;
            bottom: 0px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: #E85D1F;
          }

          .section-subtitle {
            color: #666;
            font-size: 1.1rem;
            margin-top: 20px;
          }

          .offer-card {
            background: #fff;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid rgba(28, 0, 82, 0.06); /* Accent border */
            box-shadow: 0 5px 25px rgba(28, 0, 82, 0.04);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .offer-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 45px rgba(28, 0, 82, 0.12);
            border-color: rgba(232, 93, 31, 0.3);
          }

          .offer-image {
            position: relative;
            overflow: hidden;
            height: 220px;
            flex-shrink: 0;
            background: #f0f0f0;
          }

          .offer-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s ease;
          }
          .offer-card:hover .offer-image img {
            transform: scale(1.08);
          }
          .badges-container {
            position: absolute;
            top: 15px;
            inset-inline-start: 15px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 2;
          }

          .discount-badge {
            background: #ee5a24;
            color: #fff;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            animation: pulse 2s infinite;
            text-align: center;
            width: fit-content;
            align-self: flex-start;
          }
            
          .popular-badge {
            width: fit-content;
            background: #E85D1F; /* Brand sunset orange to yellow */
            color: #fff;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            text-align: center;
            align-self: flex-start;
          }
              
          .limited-badge {
            background: #1C0052;
            color: #fff;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            text-align: center;
            align-self: flex-start;
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }

          .offer-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(28, 0, 82, 0.4);
            opacity: 0;
            transition: opacity 0.4s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            backdrop-filter: blur(4px);
          }

          .offer-card:hover .offer-overlay {
            opacity: 1;
          }

          .btn-quick-view,
          .btn-favorite {
            background: #fff;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #1C0052;
            transition: all 0.3s ease;
            cursor: pointer;
            transform: translateY(20px) scale(0.8);
            opacity: 0;
          }

          .offer-card:hover .btn-quick-view,
          .offer-card:hover .btn-favorite {
            transform: translateY(0) scale(1);
            opacity: 1;
          }

          .btn-quick-view:hover {
            background: #E85D1F; /* Sunset Orange */
            color: #fff;
            transform: scale(1.1);
          }

          .btn-favorite:hover {
            background: #ff6b6b;
            color: #fff;
            transform: scale(1.1);
          }

          .offer-content {
            padding: 20px;
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .offer-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
            gap: 10px;
          }
          .offer-header h3 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #E85D1F; /* Desert Sunset Orange */
            margin: 0;
            flex: 1;
          }
          .rating {
            display: flex;
            align-items: center;
            gap: 2px;
            flex-shrink: 0;
          }

          .rating-value {
            color: #666;
            font-size: 0.85rem;
            margin-left: 4px;
            font-weight: 500;
          }

          .offer-description {
            color: #666;
            font-size: 0.9rem;
            line-height: 1.6;
            margin: 10px 0 15px;
            flex: 1;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .offer-meta {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            flex-wrap: wrap;
          }

          .offer-meta span {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.85rem;
            color: #1C0052;
          }

          .offer-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 15px;
            border-top: 1px solid #eee;
            margin-top: auto;
            gap: 10px;
          }

          .offer-price {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .price-original {
            font-size: 0.8rem;
            color: #999;
            text-decoration: line-through;
            display: flex;
            align-items: center;
            gap: 3px;
          }

          .price-amount-wrapper {
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .price-amount {
            font-size: 1.3rem;
            font-weight: 700;
            color: #E85D1F; /* Desert Sunset Orange */
          }

          .currency-icon {
            display: inline-block;
            vertical-align: middle;
          }

          .currency-icon-small {
            display: inline-block;
            vertical-align: middle;
            opacity: 0.7;
          }

          .price-per {
            font-size: 0.7rem;
            color: #888;
          }

          .btn-book {
            background: #1C0052; /* Brand Orange to Yellow gradient */
            color: #fff;
            border: none;
            padding: 10px 24px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 0.85rem;
            transition: all 0.3s ease;
            cursor: pointer;
            white-space: nowrap;
            box-shadow: 0 4px 15px rgba(0, 45, 104, 0.25);
          }

          .btn-book:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 8px 25px rgba(31, 118, 232, 0.45);
          }

          .btn-view-all {
            background: #E85D1F;
            color: #fff;
            border: none;
            padding: 12px 35px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 10px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 145, 0, 1);
          }

          .btn-view-all:hover {
            background: #1C0052;
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(31, 78, 232, 0.4);
          }

          .btn-view-all svg {
            transition: transform 0.3s ease;
          }

          .btn-view-all:hover svg {
            transform: translateX(5px);
          }

          @media (max-width: 768px) {
            .section-title {
              font-size: 2rem;
            }
          }

          @media (max-width: 480px) {
            .offer-image {
              height: 180px;
            }
            .offer-footer {
              flex-direction: column;
              align-items: stretch;
              gap: 12px;
            }
            .btn-book {
              width: 100%;
              text-align: center;
            }
            .btn-view-all {
              width: 100%;
              justify-content: center;
            }
          }
        `}</style>
      </section>

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => {
          console.log("Closing modal");
          setShowBookingModal(false);
          setSelectedOffer(null);
        }}
        onOpenCustomModal={() => {
          setShowBookingModal(false);
          setShowTravelReservationModal(true);
        }}
        packageData={selectedOffer}
        lang={lang}
        bookingType="tourism_offer"
      />
      <TravelReservationModal
        isOpen={showTravelReservationModal}
        onClose={() => {
          setShowTravelReservationModal(false);
          setSelectedOffer(null);
        }}
        packageData={selectedOffer}
        lang={lang}
      />
    </>
  );
}