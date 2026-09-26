"use client";

import React from "react";
import Slider from "react-slick";

export default function SpecialOffers({ lang = "ar" }) {
  const [offers, setOffers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const copy = {
    en: {
      heading: "Exclusive Special Offers",
      subheading: "Unlock limited-time deals on luxury stays, unforgettable experiences, and curated adventures across Saudi Arabia. Don't miss your chance to travel in style for less.",
      loading: "Loading...",
    },
    ar: {
      heading: "عروض خاصة حصرية",
      subheading: "اكتشف عروضًا محدودة الوقت على الإقامات الفاخرة والتجارب التي لا تنسى والمغامرات المختارة بعناية في أنحاء المملكة العربية السعودية. لا تفوّت فرصتك للسفر بأناقة وبسعر أقل.",
      loading: "جاري التحميل...",
    },
    zh: {
      heading: "独家特别优惠",
      subheading: "解锁沙特阿拉伯限时优惠，涵盖奢华住宿、难忘体验与精选探险之旅。不要错过以更优惠价格享受高品质旅行的机会。",
      loading: "加载中...",
    },
  };
  const t = copy[lang] || copy.en;

  const isRTL = lang === "ar";
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const settings = {
    dots: true,
    infinite: offers.length > 1,
    speed: 450,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: offers.length > 1,
    autoplaySpeed: 4500,
    arrows: true,
    rtl: isRTL,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  React.useEffect(() => {
    let active = true;

    const loadOffers = async () => {
      try {
        setLoading(true);
        // Using the new dedicated special-offers endpoint
        const url = `${apiBase}/special-offers?_ts=${Date.now()}`;
        const res = await fetch(url, { cache: "no-store" });
        
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);

        const payload = await res.json();
        
        // Handle the response format
        let rawItems = [];
        if (payload.success && Array.isArray(payload.data)) {
          rawItems = payload.data;
        } else if (Array.isArray(payload)) {
          rawItems = payload;
        }

        const normalized = rawItems
          .filter((item) => item && item.image)
          .slice(0, 10)
          .map((item) => ({
            id: item.id,
            image: item.image || "/placeholder.png",
          }));

        if (active) setOffers(normalized);
      } catch (error) {
        console.error("[SpecialOffers] Error loading offers:", error);
        if (active) setOffers([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOffers();
    return () => {
      active = false;
    };
  }, [apiBase]);

  if (!loading && offers.length === 0) {
    return null;
  }

  return (
    <section className="special-offers" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container">
        <div className="special-offers-header text-center">
          <h2 className="special-offers-title">{t.heading}</h2>
          <p className="special-offers-subtitle">{t.subheading}</p>
        </div>

        {loading ? (
          <div className="text-center py-4">{t.loading}</div>
        ) : (
          <Slider {...settings}>
            {offers.map((offer) => (
              <div key={offer.id} className="slide-item">
                <img
                  src={offer.image}
                  alt="Special Offer"
                  className="offer-image"
                  onError={(e) => {
                    if (e.currentTarget.src !== "/placeholder.png") {
                      e.currentTarget.src = "/placeholder.png";
                    }
                  }}
                />
              </div>
            ))}
          </Slider>
        )}
      </div>

      <style jsx>{`
        .special-offers {
          --so-bg-start: #8a7779;
          --so-bg-mid: #6e6768;
          --so-bg-end: #5a4f50;
          --so-gold: #dfa528;
          --so-gold-deep: #6f4e00;
          padding: 56px 0 72px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(
            135deg,
            var(--so-bg-start) 0%,
            var(--so-bg-mid) 50%,
            var(--so-bg-end) 100%
          );
        }

        .special-offers::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E");
          opacity: 0.55;
          pointer-events: none;
        }

        .special-offers :global(.container) {
          position: relative;
          z-index: 1;
        }

        .special-offers-header {
          max-width: 900px;
          margin: 0 auto 28px;
        }

        .special-offers-title {
          margin: 0 0 10px;
          font-size: clamp(1.7rem, 3.2vw, 2.4rem);
          line-height: 1.2;
          font-weight: 800;
          color: #f4e1cf;
          letter-spacing: 0.02em;
          text-shadow: 0 4px 18px rgba(0, 0, 0, 0.25);
        }

        .special-offers-subtitle {
          margin: 0 auto;
          max-width: 780px;
          font-size: clamp(0.95rem, 1.5vw, 1.08rem);
          line-height: 1.75;
          color: rgba(255, 255, 255, 0.9);
        }

        :global(.special-offers .slick-slide > div) {
          padding: 0 10px;
        }

        .slide-item {
          display: flex !important;
          justify-content: center;
          align-items: center;
        }

        .offer-image {
          width: 100%;
          max-width: 420px;
          height: auto;
          aspect-ratio: 840 / 1160;
          object-fit: cover;
          display: block;
          border-radius: 14px;
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(223, 165, 40, 0.24);
        }

        :global(.special-offers .slick-dots) {
          bottom: -35px;
        }

        :global(.special-offers .slick-dots li button:before) {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.55);
        }

        :global(.special-offers .slick-dots li.slick-active button:before) {
          color: var(--so-gold);
        }

        :global(.special-offers .slick-prev),
        :global(.special-offers .slick-next) {
          z-index: 5;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.17);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          display: grid !important;
          place-items: center;
        }

        :global(.special-offers .slick-prev:before),
        :global(.special-offers .slick-next:before) {
          color: var(--so-gold-deep);
          font-size: 20px;
          opacity: 1;
        }

        :global(.special-offers .slick-prev:hover),
        :global(.special-offers .slick-next:hover) {
          background: rgba(255, 255, 255, 0.24);
        }

        @media (max-width: 768px) {
          .special-offers {
            padding: 44px 0 64px;
          }

          .special-offers-header {
            margin-bottom: 22px;
          }

          .offer-image {
            max-width: 100%;
          }

          :global(.special-offers .slick-prev),
          :global(.special-offers .slick-next) {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </section>
  );
}