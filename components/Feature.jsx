"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';

export default function WhyChooseUs({ lang }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const content = {
    en: {
      title: "Welcome to Tilal Rimal",
      subtitle: "For Exceptional Tourism Experiences",
      description:
        "We provide high-quality tourism experiences at competitive prices, blending enjoyment with valuable insights to create unforgettable memories for you. Our passionate young team plans and executes every trip with precision, ensuring lasting memories for a lifetime.",
      stats: [
        { number: "500+", label: "Happy Travelers" },
        { number: "50+", label: "Destinations" },
        { number: "98%", label: "Satisfaction Rate" },
        { number: "5", label: "Years Experience" },
      ],
      cta: "Explore Our Story",
    },
    ar: {
      title: "مرحباً بكم في التلال والرمال",
      subtitle: "لتنظيم الرحلات السياحية المتميزة",
      description:
        "نقدّم رحلات سياحية عالية الجودة بأسعار تنافسية، حيث نمزج بين المتعة والقيمة المفيدة لنصنع لكم تجارب لا تُنسى. فريقنا الشاب والشغوف يخطط وينفذ كل رحلة بدقة، ليمنحكم ذكريات تبقى مدى الحياة.",
      stats: [
        { number: "٥٠٠+", label: "مسافر سعيد" },
        { number: "٥٠+", label: "وجهة" },
        { number: "٩٨٪", label: "معدل الرضا" },
        { number: "٥", label: "سنوات خبرة" },
      ],
      cta: "اكتشف قصتنا",
    },
    zh: {
      title: "欢迎来到Tilal Rimal",
      subtitle: "提供卓越的旅游体验",
      description:
        "我们以极具竞争力的价格提供高品质的旅游体验，将乐趣与宝贵见解相结合，为您创造难忘的回忆。我们充满热情的年轻团队精心策划和执行每一次旅行，确保为您留下终生的美好记忆。",
      stats: [
        { number: "500+", label: "快乐旅行者" },
        { number: "50+", label: "目的地" },
        { number: "98%", label: "满意度" },
        { number: "5", label: "年经验" },
      ],
      cta: "了解我们的故事",
    },
  };

  const t = content[lang] || content.en;

  const handleExploreStory = () => {
    if (lang === "ar") {
      router.push("/ar/about-us");
    } else if (lang === "zh") {
      router.push("/zh/about-us");
    } else {
      router.push("/en/about-us");
    }
  };

  // Use a simple div on server, motion.div on client
  const MotionContainer = isClient ? motion.div : 'div';

  return (
    <section
      className="position-relative py-5"
      style={{
        fontFamily: lang === "ar" ? "'Tajawal', sans-serif" : lang === "zh" ? "'Noto Sans SC', sans-serif" : "'Inter', sans-serif",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%)",
        color: "white",
        direction: lang === "ar" ? "rtl" : "ltr",
      }}
    >
      <div className="container">
        <div className="row align-items-center">
          {/* Text Content */}
          <div className="col-lg-6 mb-4 mb-lg-0">
            <MotionContainer
              {...(isClient && {
                initial: { opacity: 0, x: lang === "ar" ? 50 : -50 },
                whileInView: { opacity: 1, x: 0 },
                transition: { duration: 0.8 },
              })}
            >
              <h6
                className="text-warning mb-3 fw-bold"
                style={{ fontSize: "1.1rem" }}
              >
                {t.subtitle}
              </h6>

              <h1
                className="display-5 fw-bold mb-4"
                style={{
                  background: "linear-gradient(135deg, #ffffff, #EFC8AE)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "#ffffff", // Fallback color
                  fontFamily: lang === "zh" ? "'Noto Sans SC', sans-serif" : "inherit",
                }}
              >
                {t.title}
              </h1>

              <p
                className="lead mb-5"
                style={{
                  color: "#e0e0e0",
                  lineHeight: lang === "zh" ? "1.9" : "1.8",
                  fontSize: lang === "zh" ? "1.15rem" : "1.2rem",
                  fontFamily: lang === "zh" ? "'Noto Sans SC', sans-serif" : "inherit",
                }}
              >
                {t.description}
              </p>

              {/* CTA Buttons */}
              <div className="d-flex flex-wrap gap-3 mb-5">
                <button
                  onClick={handleExploreStory}
                  className="btn btn-warning px-4 py-3 fw-bold"
                  style={{
                    fontFamily: lang === "ar" ? "'Tajawal', sans-serif" : lang === "zh" ? "'Noto Sans SC', sans-serif" : "'Inter', sans-serif",
                    borderRadius: "12px",
                    fontSize: "1.1rem",
                    transition: "all 0.3s ease",
                  }} 
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-3px)";
                    e.target.style.boxShadow =
                      "0 10px 25px rgba(223, 165, 40, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  {t.cta}
                </button>
              </div>
            </MotionContainer>
          </div>

          {/* Stats Section */}
          <div className="col-lg-6">
            <MotionContainer
              {...(isClient && {
                initial: { opacity: 0, x: lang === "ar" ? -50 : 50 },
                whileInView: { opacity: 1, x: 0 },
                transition: { duration: 0.8, delay: 0.2 },
              })}
              className="row g-4"
            >
              {t.stats.map((stat, index) => (
                <div key={index} className="col-6">
                  <div
                    className="text-center p-4 rounded-3"
                    style={{
                      fontFamily: lang === "zh" ? "'Noto Sans SC', sans-serif" : "'Tajawal', sans-serif",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      backdropFilter: "blur(10px)",
                      height: "100%",
                      transition: "all 0.3s ease",
                    }} 
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(223, 165, 40, 0.1)";
                      e.target.style.borderColor = "rgba(223, 165, 40, 0.3)";
                      e.target.style.transform = "translateY(-5px)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(255,255,255,0.05)";
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                      e.target.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      className="display-6 fw-bold mb-2"
                      style={{
                        fontFamily: lang === "zh" ? "'Noto Sans SC', sans-serif" : "'Tajawal', sans-serif",
                        background: "#dfa528",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        color: "#dfa528",
                        minHeight: "60px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }} 
                    >
                      {stat.number}
                    </div>
                    <div
                      className="small fw-medium"
                      style={{ 
                        color: "#cccccc",
                        fontFamily: lang === "zh" ? "'Noto Sans SC', sans-serif" : "inherit",
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </MotionContainer>
          </div>
        </div>
      </div>
    </section>
  );
} 