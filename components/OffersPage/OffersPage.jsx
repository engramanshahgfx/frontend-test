"use client";

import React, { useEffect, useState } from "react";
import { FaStar, FaClock, FaMapMarkerAlt, FaWhatsapp, FaUsers } from "react-icons/fa";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/f0f0f0/999?text=No+Image+Available';

function normalizeOfferFields(item, lang) {
  const getField = (field) => {
    // Try to get the field with language suffix first
    if (item[`${field}_${lang}`]) return item[`${field}_${lang}`];
    if (item[field]) return item[field];
    return '';
  };
  
  const parseArrayField = (value) => {
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
  
  // Handle image URL
  let imageUrl = item.image;
  if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined' || imageUrl.includes('placeholder')) {
    imageUrl = PLACEHOLDER_IMAGE;
  }
  
  return {
    id: item.id,
    title: getField('title'),
    description: getField('description'),
    image: imageUrl,
    duration: getField('duration'),
    location: getField('location'),
    groupSize: getField('groupSize') || getField('group_size'),
    badge: getField('badge'),
    features: parseArrayField(getField('features')),
    highlights: parseArrayField(getField('highlights')),
    price: item.price || item.price_en || item.price_ar || "",
  };
}

export default function OffersPage({ lang = 'en', initialOffers = [] }) {
  const content = {
    en: {
      heroTitle: "Exclusive Offers Not to Be Missed",
      heroSubtitle: "Take advantage of the best tourism opportunities we offer, and enjoy unique experiences at attractive prices!",
      featuredOffers: "Featured Offers",
      contactUs: "Contact Us",
      included: "What's Included",
      loading: "Loading offers...",
      noOffers: "No offers available at the moment.",
      error: "Failed to load offers. Please try again later.",
    },
    ar: {
      heroTitle: "عروض حصرية لا تُفوَّت",
      heroSubtitle: "استفيدوا من أفضل الفرص السياحية التي نقدمها، وستمتعوا بتجارب مميزة بأسعار مغرية!",
      featuredOffers: "العروض المميزة",
      contactUs: "تواصل معنا",
      included: "ما المضمن",
      loading: "جاري تحميل العروض...",
      noOffers: "لا توجد عروض متاحة حالياً.",
      error: "فشل تحميل العروض. يرجى المحاولة لاحقاً.",
    },
    zh: {
      heroTitle: "不容错过的独家优惠",
      heroSubtitle: "利用我们提供的最佳旅游机会，以诱人价格享受独特体验！",
      featuredOffers: "精选优惠",
      contactUs: "联系我们",
      included: "包含项目",
      loading: "正在加载优惠...",
      noOffers: "目前暂无可用优惠。",
      error: "加载优惠失败。请稍后重试。",
    },
  };
  
  const [offers, setOffers] = useState(initialOffers || []);
  const [loading, setLoading] = useState(initialOffers?.length === 0);
  const [fetchError, setFetchError] = useState(null);
  const t = content[lang] || content.en;
  const isRTL = lang === "ar";

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setFetchError(null);
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/offers`);
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const rawItems = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
        const normalized = rawItems.map((item) => normalizeOfferFields(item, lang));
        setOffers(normalized);
      } catch (error) {
        console.error('Error fetching offers:', error);
        setFetchError(t.error);
      } finally {
        setLoading(false);
      }
    };

    if (initialOffers.length === 0) {
      fetchOffers();
    } else {
      setOffers(initialOffers.map(item => normalizeOfferFields(item, lang)));
    }
  }, [lang, initialOffers, t.error]);

  const getSummary = (text, maxChars = 220) => {
    if (!text) return "";
    const normalized = String(text).replace(/\r\n/g, "\n").trim();
    const parts = normalized.split(/\n\s*\n/).filter(p => p.trim());
    const first = parts.length > 0 ? parts[0] : normalized;
    const oneLine = first.replace(/\s+/g, " ").trim();
    return oneLine.length > maxChars ? oneLine.slice(0, maxChars).trim() + "..." : oneLine;
  };

  if (loading) {
    return (
      <div className="offers-page">
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{t.loading}</span>
            </div>
            <p className="mt-3">{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="offers-page">
        <div className="container py-5">
          <div className="alert alert-danger text-center">{fetchError}</div>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="offers-page">
        <div className="container py-5">
          <div className="alert alert-info text-center">{t.noOffers}</div>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={`offers-page ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <section className="offers-hero">
        <div className="video-background">
          <video autoPlay muted loop playsInline className="background-video">
            <source src="/desert.mp4" type="video/mp4" />
          </video>
          <div className="video-overlay"></div>
        </div>
        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-8 mx-auto text-center text-white">
              <div className="hero-content">
                <h1 className="display-4 fw-bold mb-4">{t.heroTitle}</h1>
                <p className="lead mb-5">{t.heroSubtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Grid Section */}
      <section className="offers-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title mb-3">{t.featuredOffers}</h2>
            <div className="section-divider"></div>
          </div>

          <div className="row g-4 justify-content-center">
            {offers.map((offer) => (
              <div key={offer.id} className="col-lg-4 col-md-6 col-sm-12">
                <div className="offer-card">
                  <div className="offer-image">
                    <img 
                      src={offer.image || PLACEHOLDER_IMAGE} 
                      alt={offer.title || 'Offer'}
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE;
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                  <div className="offer-content">
                    <h3 className="offer-title">{offer.title || 'Untitled'}</h3>
                    <p className="offer-description">{getSummary(offer.description)}</p>
                    
                    {offer.highlights && offer.highlights.length > 0 && (
                      <div className="offer-highlights">
                        {offer.highlights.slice(0, 3).map((highlight, idx) => (
                          <span key={idx} className="highlight-tag">{highlight}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="offer-details">
                      {offer.duration && (
                        <div className="detail-item">
                          <FaClock className="detail-icon" />
                          <span>{offer.duration}</span>
                        </div>
                      )}
                      {offer.location && (
                        <div className="detail-item">
                          <FaMapMarkerAlt className="detail-icon" />
                          <span>{offer.location}</span>
                        </div>
                      )}
                      {offer.groupSize && (
                        <div className="detail-item">
                          <FaUsers className="detail-icon" />
                          <span>{offer.groupSize}</span>
                        </div>
                      )}
                    </div>
                    
                    {offer.features && offer.features.length > 0 && (
                      <div className="features-list">
                        <h6>{t.included}:</h6>
                        <div className="features-grid">
                          {offer.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} className="feature-item">
                              <FaStar className="feature-icon" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {offer.price && (
                      <div className="offer-price mb-3">
                        {isRTL ? 'يبدأ من' : 'Starts from'} {offer.price} {isRTL ? 'ريال' : 'SAR'}
                      </div>
                    )}
                    
                    <div className="offer-footer">
                      <a
                        href={`https://wa.me/+966547305060?text=${encodeURIComponent(
                          isRTL ? `أرغب في الحصول على معلومات عن: ${offer.title}` : `I'm interested in: ${offer.title}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-book"
                      >
                        <FaWhatsapp className={isRTL ? "ms-2" : "me-2"} />
                        {t.contactUs}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .offers-page {
          background: #f8f9fa;
          font-family: 'Tajawal', sans-serif;
        }

        .offers-hero {
          position: relative;
          padding: 140px 0 100px;
          min-height: 70vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .video-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .background-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(138, 119, 121, 0.4) 0%, rgba(239, 200, 174, 0.85) 100%);
          z-index: 2;
        }

        .offers-hero .container {
          position: relative;
          z-index: 3;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-content h1 {
          font-weight: 800;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          line-height: 1.3;
        }

        .hero-content .lead {
          font-size: 1.3rem;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          line-height: 1.6;
        }

        .offer-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          height: 100%;
        }

        .offer-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        }

        .offer-image {
          width: 100%;
          height: 320px;
          overflow: hidden;
          position: relative;
          background: #f5f5f5;
        }

        @media (max-width: 768px) {
          .offer-image {
            height: 240px;
          }
        }

        .offer-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .offer-card:hover .offer-image img {
          transform: scale(1.05);
        }

        .offer-content {
          padding: 30px;
        }

        .offer-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #2c3e50;
          margin-bottom: 15px;
        }

        .offer-description {
          color: #5d6d7e;
          margin-bottom: 20px;
          line-height: 1.7;
        }

        .offer-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }

        .highlight-tag {
          background: linear-gradient(45deg, #8a7779, #a89294);
          color: white;
          padding: 6px 15px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .offer-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
          padding: 20px 0;
          border-top: 2px solid #ecf0f1;
          border-bottom: 2px solid #ecf0f1;
          flex-wrap: wrap;
          gap: 15px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #7f8c8d;
        }

        .detail-icon {
          color: #8a7779;
        }

        .features-list h6 {
          color: #2c3e50;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 25px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: #5d6d7e;
        }

        .feature-icon {
          color: #f39c12;
          font-size: 0.8rem;
        }

        .offer-footer {
          text-align: center;
          padding-top: 25px;
          border-top: 2px solid #ecf0f1;
        }

        .offer-price {
          font-size: 1rem;
          font-weight: 700;
          color: #25d366;
          margin-bottom: 15px;
          display: inline-block;
          background: rgba(37,211,102,0.1);
          padding: 8px 16px;
          border-radius: 20px;
        }

        .btn-book {
          background: linear-gradient(45deg, #25d366, #128c7e);
          border: none;
          padding: 12px 25px;
          border-radius: 25px;
          font-weight: 700;
          color: white;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .btn-book:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(37,211,102,0.5);
          color: white;
        }

        .section-title {
          color: #5a4606ff;
          font-weight: 800;
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .section-divider {
          width: 100px;
          height: 5px;
          background: linear-gradient(45deg, #8a7779, #efc8ae);
          margin: 0 auto;
          border-radius: 3px;
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 2rem;
          }
          .offer-title {
            font-size: 1.3rem;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}