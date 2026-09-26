"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, Clock, Users } from "lucide-react";
import { API_URL } from "@/lib/api";

export default function TourismDestinationsPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params?.lang || "en";
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const labels = {
    en: {
      title: "International Destinations",
      subtitle: "Discover amazing destinations around the world",
      viewDetails: "View Details",
      from: "From",
      perPerson: "per person",
      noDestinations: "No destinations available",
      backToHome: "Back to Home",
    },
    ar: {
      title: "الوجهات الدولية",
      subtitle: "اكتشف وجهات مذهلة حول العالم",
      viewDetails: "عرض التفاصيل",
      from: "من",
      perPerson: "للفرد",
      noDestinations: "لا توجد وجهات متاحة",
      backToHome: "العودة للرئيسية",
    }
  };

  const t = labels[lang] || labels.en;

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await fetch(`${API_URL}/tourism-destinations`);
      const data = await response.json();
      if (data.success) {
        setDestinations(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching destinations:", error);
      setError("Failed to load destinations");
    } finally {
      setLoading(false);
    }
  };

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

  const getImageUrl = (img) => {
    if (!img) return "/placeholder.png";
    if (/^https?:\/\//.test(img)) return img;
    const backendBase = API_URL.replace(/\/api\/?$/, "");
    if (img.startsWith("/")) return `${backendBase}${img}`;
    return `${backendBase}/storage/tourism/${img}`;
  };

  const handleDestinationClick = (destination) => {
    const slug = destination.slug || destination.id || '';
    router.push(`/${lang}/destinations/${slug}`);
  };

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

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="text-center" style={{ padding: "100px 0" }}>
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p style={{ marginTop: "20px", color: "#666" }}>Loading destinations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="text-center" style={{ padding: "100px 0" }}>
            <p style={{ color: "#ff6b6b" }}>{error}</p>
            <button 
              onClick={() => router.push(`/${lang}`)}
              style={{
                marginTop: "20px",
                padding: "10px 30px",
                background: "#dfa528",
                color: "#fff",
                border: "none",
                borderRadius: "25px",
                cursor: "pointer",
              }}
            >
              {t.backToHome}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        {/* Destinations Grid */}
        {destinations.length === 0 ? (
          <div className="text-center" style={{ padding: "60px 0" }}>
            <p>{t.noDestinations}</p>
            <button 
              onClick={() => router.push(`/${lang}`)}
              style={{
                marginTop: "20px",
                padding: "10px 30px",
                background: "#dfa528",
                color: "#fff",
                border: "none",
                borderRadius: "25px",
                cursor: "pointer",
              }}
            >
              {t.backToHome}
            </button>
          </div>
        ) : (
          <div className="destinations-grid">
            {destinations.map((destination) => (
              <motion.div
                key={destination.id}
                className="destination-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                onClick={() => handleDestinationClick(destination)}
              >
                <div className="destination-image">
                  <img
                    src={getImageUrl(destination.image)}
                    alt={getText(destination, "title")}
                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                  />
                  {destination.rating && (
                    <div className="destination-rating">
                      <span>⭐ {destination.rating}</span>
                    </div>
                  )}
                </div>
                <div className="destination-content">
                  <h3>{getText(destination, "title")}</h3>
                  <p className="destination-description">
                    {getText(destination, "description")?.substring(0, 100)}...
                  </p>
                  <div className="destination-meta">
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
                  <div className="destination-footer">
                    <span className="destination-price">
                      {(() => {
                        let displayPrice = destination.price;
                        if (destination.person_prices && Array.isArray(destination.person_prices) && destination.person_prices.length > 0) {
                          const prices = destination.person_prices.map(p => Number(p.price)).filter(p => !isNaN(p) && p > 0);
                          if (prices.length > 0) displayPrice = Math.min(...prices);
                        }
                        if (!displayPrice) return '';
                        return `${t.from} ${displayPrice} `;
                      })()}
                    </span>
                    <button className="btn-view" onClick={(e) => {
                      e.stopPropagation();
                      handleDestinationClick(destination);
                    }}>
                      {t.viewDetails}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .page-container {
          padding: 100px 0 60px;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .page-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2c2c2c;
          margin-bottom: 10px;
        }

        .page-header h1:after {
          content: '';
          display: block;
          width: 60px;
          height: 3px;
          background: #dfa528;
          margin: 15px auto 0;
        }

        .page-header p {
          color: #666;
          font-size: 1.1rem;
          margin-top: 15px;
        }

        .destinations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 30px;
        }

        .destination-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 25px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .destination-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
        }

        .destination-image {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .destination-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .destination-card:hover .destination-image img {
          transform: scale(1.05);
        }

        .destination-rating {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(0, 0, 0, 0.7);
          color: #ffd700;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .destination-content {
          padding: 20px;
        }

        .destination-content h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c2c2c;
          margin: 0 0 8px;
        }

        .destination-description {
          color: #666;
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0 0 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .destination-meta {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }

        .destination-meta span {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.85rem;
          color: #888;
        }

        .destination-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        .destination-price {
          font-size: 1rem;
          font-weight: 700;
          color: #dfa528;
        }

        .btn-view {
          background: #dfa528;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 25px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .btn-view:hover {
          background: #c98c1e;
        }

        @media (max-width: 768px) {
          .destinations-grid {
            grid-template-columns: 1fr 1fr;
          }
          .page-header h1 {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .destinations-grid {
            grid-template-columns: 1fr;
          }
          .destination-image {
            height: 180px;
          }
        }
      `}</style>
    </div>
  );
}