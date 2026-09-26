"use client";
import "./Badge.css";
import { motion } from "framer-motion";
import { LucideShield, LucideCircleCheckBig } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Badge({ lang = "en" }) {
  const features = {
    en: ["The latest global technology", "A team of certified engineers"],
    ar: ["أحدث التقنيات العالمية", "فريق من المهندسين المعتمدين"],
  };

  const heroTitle = {
    en: "Powering Businesses with the Best Management Systems",
    ar: "تمكين الأعمال بأفضل أنظمة الإدارة",
  };

  const heroDescription = {
    en: "Streamline your operations, boost efficiency, and stay ahead with our all-in-one business management solutions — tailored for your success.",
    ar: "قم بتحسين عملياتك، وزيادة الكفاءة، والبقاء في المقدمة باستخدام حلول إدارة الأعمال الشاملة الخاصة بنا — مصممة خصيصًا لنجاحك.",
  };

  const circleColors = [
    "#FACC15",
    "#F472B6",
    "#38BDF8",
    "#34D399",
    "#F87171",
    "#A78BFA",
  ];

  return (
    <section
      className="hero-section col-lg-12 mx-auto position-relative"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
  

      <div
        className="hero-container row align-items-center position-relative"
        style={{ zIndex: 1 }}
      >

        <div
          className={`col-lg-8 order-2 order-lg-1 ${
            lang === "ar" ? "text-end" : "text-start"
          }`}
        >
          <motion.h2
            className="fw-bold mb-3"
            style={{ color: "#FFD700" }}
            initial={{ opacity: 0, x: lang === "ar" ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {heroTitle[lang]}
          </motion.h2>
          <motion.p
            className="mb-4"
            initial={{ opacity: 0, x: lang === "ar" ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {heroDescription[lang]}
          </motion.p>

          <div
            className={`d-flex flex-wrap gap-2 ${
              lang === "ar" ? "justify-content-end" : ""
            }`}
          >
            {features[lang].map((feature, idx) => (
              <div key={idx} className="feature-badge">
                <span>{feature}</span>
                <LucideCircleCheckBig size={20} color="white" />
              </div>
            ))}
          </div>
        </div>

        {/* Icon Section */}
        <div
          className={`col-lg-4 d-flex justify-content-center ${
            lang === "ar"
              ? "justify-content-lg-start"
              : "justify-content-lg-end"
          } order-1 order-lg-2 mb-4 mb-lg-0`}
        >
          <div className="shield-container">
            {circleColors.map((color, idx) => (
              <motion.div
                key={idx}
                className="floating-circle"
                style={{ backgroundColor: color }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 2 + idx * 0.2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
            ))}
            <div className="shield-center">
              <LucideShield size={80} color="#1E3A8A" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
