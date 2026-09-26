"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Star } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useUI } from "@/providers/UIProvider";

export default function StartProject({ lang }) {
  const videoRef = useRef(null);
  const { openReservationModal } = useUI();

  useEffect(() => {
    // Ensure video plays and loops properly
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  const [activeReservation, setActiveReservation] = useState(null);

  // Localized UI strings (en / ar / zh)
  const content = {
    en: {
      title: "Unique destinations await you",
      desc: "Let us plan your perfect journey from start to finish. Enjoy unique travel experiences, local guides, and memories that last a lifetime.",
      domesticBtn: "Domestic Reservation",
      internationalBtn: "International Reservation",
      features: {
        f1: { title: "Exclusive Destinations", subtitle: "Best hidden places" },
        f2: { title: "Local Guides", subtitle: "Area experts" },
        f3: { title: "Flexible Scheduling", subtitle: "Plan around your schedule" },
        f4: { title: "5-Star Reviews", subtitle: "Happy customers" },
      },
    },
    ar: {
      title: "وجهات مميزة بانتظارك",
      desc: "دعنا نخطط لرحلتك المثالية من البداية إلى النهاية. استمتع بتجارب سياحية فريدة، مرشدين محليين، وذكريات تدوم مدى الحياة.",
      domesticBtn: "حجز محلي",
      internationalBtn: "حجز دولي",
      features: {
        f1: { title: "وجهات حصرية", subtitle: "أفضل الأماكن المخفية" },
        f2: { title: "مرشدون محليون", subtitle: "خبراء بالمنطقة" },
        f3: { title: "مرونة المواعيد", subtitle: "خطط حسب جدولك" },
        f4: { title: "تقييمات 5 نجوم", subtitle: "عملاء سعداء" },
      },
    },
    zh: {
      title: "独特的目的地在等您",
      desc: "让我们为您规划完美的旅程。从头到尾享受独特的旅行体验、本地向导和永生难忘的回忆。",
      domesticBtn: "国内预订",
      internationalBtn: "国际预订",
      features: {
        f1: { title: "独家目的地", subtitle: "最佳隐秘景点" },
        f2: { title: "本地向导", subtitle: "本地专家" },
        f3: { title: "灵活安排", subtitle: "按您的时间表安排" },
        f4: { title: "五星评价", subtitle: "满意的客户" },
      },
    },
  };

const reservationTitles = {
  domestic: {
    en: "Domestic Reservation",
    ar: "حجز محلي",
    zh: "国内预订"
  },
  international: {
    en: "International Reservation",
    ar: "حجز دولي",
    zh: "国际预订"
  }
};

const handleReservation = (type = "domestic") => {
  setActiveReservation(type);
  openReservationModal({
    title: reservationTitles[type][lang] || reservationTitles[type].en,
    slug: "",
    type,
    bookingLocation: type === "domestic" ? "local" : "international",
    preferredBookingType: "activity",
    isLocalService: type === "domestic",
  });
};
  return (
    <section
      className="position-relative py-5 text-center text-white"
      style={{ minHeight: "70vh", overflow: "hidden" }}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src="/travel-video.mp4" type="video/mp4" />
        {/* Fallback image if video doesn't exist */}
        <img
          src="/travel-bg.jpg"
          alt="Travel background"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay for better readability */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1,
        }}
      ></div>

      {/* Golden Accent Overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background: `radial-gradient(circle at 20% 80%, rgba(74, 144, 226, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)`,
          zIndex: 1,
        }}
      ></div>

      {/* Content */}
      <div className="container position-relative z-2 d-flex flex-column align-items-center justify-content-center h-100">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <motion.h1
            className="fw-bold display-3"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ color: "#ffffff", fontSize: "1.75rem" }}
          >
            {(content[lang] || content.en).title}
          </motion.h1>

          <motion.p
            className="lead mx-auto mt-3 mb-5"
            style={{ 
              maxWidth: "700px",
              color: "#e0e0e0",
              lineHeight: "1.6"
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            {(content[lang] || content.en).desc}
          </motion.p> 

          <motion.div
            className="d-flex flex-column flex-sm-row justify-content-center gap-3 w-100"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <button
              type="button"
              onClick={() => handleReservation('domestic')}
              className="btn btn-lg d-flex align-items-center justify-content-center gap-2 px-4 py-3 shadow w-100 w-sm-auto"
              style={{
                background: activeReservation === 'domestic' ? '#bb8002ff' : '#EFC8AE',
                color: activeReservation === 'domestic' ? '#ffffff' : '#000000',
                border: 'none',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = activeReservation === 'domestic' ? '0 10px 30px rgba(34,197,94,0.4)' : '0 8px 25px rgba(74,144,226,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.12)';
              }}
              aria-pressed={activeReservation === 'domestic'}
            >
              {(content[lang] || content.en).domesticBtn}
              <Calendar size={20} />
            </button>
            <button
              type="button"
              onClick={() => handleReservation('international')}
              className="btn btn-lg d-flex align-items-center justify-content-center gap-2 px-4 py-3 w-100 w-sm-auto"
              style={{
                background: activeReservation === 'international' ? '#bb8002ff' : '#EFC8AE',
                color: activeReservation === 'international' ? '#ffffff' : '#000000',
                border: 'none',
                fontWeight: '600',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = activeReservation === 'international' ? '0 10px 30px rgba(34,197,94,0.4)' : '0 8px 25px rgba(74,144,226,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.12)';
              }}
              aria-pressed={activeReservation === 'international'}
            >
              <MapPin size={20} />{' '}
              {(content[lang] || content.en).internationalBtn}
            </button>
          </motion.div>

          {/* Travel Features */}
          <motion.div
            className="row mt-5 pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <div className="col-md-3 mb-3">
              <div className="d-flex flex-column align-items-center">
                <div
                  className="rounded-circle p-3 mb-2 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "rgba(74, 144, 226, 0.2)",
                    border: "1px solid rgba(74, 144, 226, 0.5)",
                    width: "70px",
                    height: "70px",
                  }}
                >
                  <MapPin size={24} color="#4a90e2" />
                </div>
                <h6 className="fw-bold mb-1" style={{ color: "#ffffff" }}>
                  {(content[lang] || content.en).features.f1.title}
                </h6>
                <small style={{ color: "#cccccc" }}>
                  {(content[lang] || content.en).features.f1.subtitle}
                </small>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="d-flex flex-column align-items-center">
                <div
                  className="rounded-circle p-3 mb-2 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.2)",
                    border: "1px solid rgba(34, 197, 94, 0.5)",
                    width: "70px",
                    height: "70px",
                  }}
                >
                  <Users size={24} color="#22c55e" />
                </div>
                <h6 className="fw-bold mb-1" style={{ color: "#ffffff" }}>
                  {(content[lang] || content.en).features.f2.title}
                </h6>
                <small style={{ color: "#cccccc" }}>
                  {(content[lang] || content.en).features.f2.subtitle}
                </small>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="d-flex flex-column align-items-center">
                <div
                  className="rounded-circle p-3 mb-2 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.2)",
                    border: "1px solid rgba(245, 158, 11, 0.5)",
                    width: "70px",
                    height: "70px",
                  }}
                >
                  <Calendar size={24} color="#f59e0b" />
                </div>
                <h6 className="fw-bold mb-1" style={{ color: "#ffffff" }}>
                  {(content[lang] || content.en).features.f3.title}
                </h6>
                <small style={{ color: "#cccccc" }}>
                  {(content[lang] || content.en).features.f3.subtitle}
                </small>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="d-flex flex-column align-items-center">
                <div
                  className="rounded-circle p-3 mb-2 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "rgba(168, 85, 247, 0.2)",
                    border: "1px solid rgba(168, 85, 247, 0.5)",
                    width: "70px",
                    height: "70px",
                  }}
                >
                  <Star size={24} color="#a855f7" />
                </div>
                <h6 className="fw-bold mb-1" style={{ color: "#ffffff" }}>
                  {(content[lang] || content.en).features.f4.title}
                </h6>
                <small style={{ color: "#cccccc" }}>
                  {(content[lang] || content.en).features.f4.subtitle}
                </small>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .display-3 {
            font-size: 2.5rem;
          }

          video {
            object-position: center;
          }
        }

        @media (max-width: 576px) {
          .display-3 {
            font-size: 2rem;
          }

          .btn-lg {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
