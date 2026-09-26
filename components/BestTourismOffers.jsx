"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Clock,
  Eye,
  Heart,
  ChevronRight,
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
    description_ar: "اختبر الفخامة كما لم تفعل من قبل مع إطلالات بحرية ساحرة",
    location: "Maldives",
    location_ar: "جزر المالديف",
    duration: "5 Days",
    duration_ar: "5 أيام",
    discount: 20,
  },
  {
    id: 2,
    slug: "offer-2",
    title_en: "Mountain Adventure",
    title_ar: "مغامرة جبلية",
    image: "/placeholder.png",
    rating: 4.6,
    description_en: "Explore the breathtaking mountains with guided tours",
    description_ar: "استكشف الجبال الخلابة مع جولات إرشادية",
    location: "Swiss Alps",
    location_ar: "جبال الألب السويسرية",
    duration: "4 Days",
    duration_ar: "4 أيام",
    discount: 15,
  },
  {
    id: 3,
    slug: "offer-3",
    title_en: "Cultural City Tour",
    title_ar: "جولة مدينة ثقافية",
    image: "/placeholder.png",
    rating: 4.7,
    description_en: "Immerse yourself in rich history and culture",
    description_ar: "انغمس في التاريخ الغني والثقافة",
    location: "Istanbul",
    location_ar: "اسطنبول",
    duration: "3 Days",
    duration_ar: "3 أيام",
    discount: null,
  },
  {
    id: 4,
    slug: "offer-4",
    title_en: "Desert Safari",
    title_ar: "رحلة صحراوية",
    image: "/placeholder.png",
    rating: 4.9,
    description_en: "Experience the thrill of desert adventures",
    description_ar: "اختبر إثارة مغامرات الصحراء",
    location: "Dubai",
    location_ar: "دبي",
    duration: "2 Days",
    duration_ar: "2 أيام",
    discount: 25,
  },
];

export default function BestTourismOffers({ lang }) {
  const router = useRouter();
  const currentLang = lang || "en";
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTravelReservationModal, setShowTravelReservationModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  // Debug: Log state changes
  useEffect(() => {
    console.log("showBookingModal changed:", showBookingModal);
    console.log("selectedOffer:", selectedOffer);
  }, [showBookingModal, selectedOffer]);

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
        console.log("[BestTourismOffers] Fetching from:", apiEndpoint);

        const res = await fetch(apiEndpoint, {
          signal: controller.signal,
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        const contentType = (res.headers.get("content-type") || "").toLowerCase();

        // If the server returned non-JSON (e.g. HTML error page), fall back safely
        if (!contentType.includes("application/json")) {
          const text = await res.text();
          console.warn("[BestTourismOffers] Non-JSON response from API:", text.slice(0, 300));
          // If it's an HTML error (starts with <!DOCTYPE or <html), assume backend served an error page
          setDestinations(fallbackDestinations);
          setLoading(false);
          return;
        }

        const json = await res.json();
        console.log("[BestTourismOffers] Response:", json);

        if (!res.ok) {
          throw new Error(`API error: ${res.status} - ${json?.message || "Unknown error"}`);
        }

        if (Array.isArray(json)) {
          // Some endpoints may return an array directly
          if (json.length > 0) setDestinations(json);
          else setDestinations(fallbackDestinations);
        } else {
          if (!json?.success && !Array.isArray(json?.data)) {
            throw new Error(json?.message || "Failed to fetch offers");
          }

          const data = Array.isArray(json.data) ? json.data : [];
          if (data.length > 0) {
            setDestinations(data);
          } else {
            setDestinations(fallbackDestinations);
          }
        }

        setLoading(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("[BestTourismOffers] Fetch error:", err.message);
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
    const id = destination.id || destination.slug || "";
    router.push(`/${currentLang}/tousimoffers/${id}`);
  };

  // FIXED: This function now properly opens the modal
  const handleBookNow = (destination) => {
    console.log("Book Now clicked for:", destination);
    setSelectedOffer(destination);
    setShowBookingModal(true);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) - fullStars >= 0.5;
    return Array.from({ length: 5 }, (_, i) => {
      if (i < fullStars) {
        return <Star key={i} size={16} fill="#dfa528" color="#dfa528" style={{ display: "inline" }} />;
      } else if (i === fullStars && hasHalfStar) {
        return <Star key={i} size={16} fill="#dfa528" color="#dfa528" style={{ display: "inline", opacity: 0.5 }} />;
      } else {
        return <Star key={i} size={16} fill="none" color="#ddd" style={{ display: "inline" }} />;
      }
    });
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

  const displayDestinations = destinations.length > 0 ? destinations : [];

  return (
    <>
      <section className="offers-section" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h2 className="section-title">{t.title}</h2>


            </div>
          </div>

          <div className="row">
            {displayDestinations.map((destination, index) => (
              <motion.div
                key={destination.id || index}
                className="col-md-4 col-sm-6"
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
                    </div>

                    <div className="offer-footer">
                      <div className="offer-price">
                        {destination.original_price && (
                          <span className="price-original">
                            {formatCurrency(destination.original_price, "SAR", lang)}
                          </span>
                        )}
                        <span className="price-amount">
                          {formatCurrency(destination.price, "SAR", lang)}
                        </span>
                        <span className="price-per">{t.perPerson}</span>
                      </div>
                      <button
                        className="btn-book"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
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
            <div className="row">
              <div className="col-12 text-center">
                <motion.button
                  className="btn-view-all"
                  onClick={handleViewAllOffers}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t.viewAll} <ChevronRight size={18} />
                </motion.button>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .offers-section {
            padding: 60px 0;
            background: #f8f9fa;
          }

          .section-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #2c2c2c;
            position: relative;
            margin-bottom: 10px;
          }

          .section-title:after {
            content: "";
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: #dfa528;
          }

          .section-subtitle {
            color: #666;
            font-size: 1.1rem;
            margin-top: 20px;
          }

          .offer-card {
            background: #fff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
            transition: all 0.4s ease;
            margin-bottom: 30px;
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .offer-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
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
            right: 15px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 2;
          }

          .discount-badge {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: #fff;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            animation: pulse 2s infinite;
          }

          .popular-badge {
            background: linear-gradient(135deg, #dfa528, #f9ca24);
            color: #fff;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
          }

          .limited-badge {
            background: linear-gradient(135deg, #a29bfe, #6c5ce7);
            color: #fff;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
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
            background: rgba(0, 0, 0, 0.5);
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
            color: #2c2c2c;
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
            background: #dfa528;
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
            color: #2c2c2c;
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
            color: #888;
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
          }

          .price-amount {
            font-size: 1.3rem;
            font-weight: 700;
            color: #dfa528;
          }

          .price-per {
            font-size: 0.7rem;
            color: #888;
          }

          .btn-book {
            background: linear-gradient(135deg, #dfa528, #c98c1e);
            color: #fff;
            border: none;
            padding: 10px 24px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 0.85rem;
            transition: all 0.3s ease;
            cursor: pointer;
            white-space: nowrap;
            box-shadow: 0 4px 15px rgba(223, 165, 40, 0.3);
          }

          .btn-book:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 8px 25px rgba(223, 165, 40, 0.4);
          }

          .btn-view-all {
            background: #dfa528;
            color: #fff;
            border: none;
            padding: 12px 35px;
            border-radius: 30px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 20px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(223, 165, 40, 0.3);
          }

          .btn-view-all:hover {
            background: #c98c1e;
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(223, 165, 40, 0.4);
          }

          .btn-view-all svg {
            transition: transform 0.3s ease;
          }

          .btn-view-all:hover svg {
            transform: translateX(5px);
          }

          @media (max-width: 768px) {
            .col-md-4 {
              flex: 0 0 50%;
              max-width: 50%;
            }
            .section-title {
              font-size: 2rem;
            }
          }

          @media (max-width: 480px) {
            .col-md-4 {
              flex: 0 0 100%;
              max-width: 100%;
            }
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

      {/* Modal - Placed outside the section */}
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