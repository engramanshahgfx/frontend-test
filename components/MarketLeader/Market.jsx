"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Users, Award, Shield, Clock, Wrench, CheckCircle, TrendingUp } from "lucide-react";
import './Market.css';

export default function Market({ lang }) {
  const [activeTab, setActiveTab] = useState(1);

  const translations = {
    en: {
      headerTitle: "Why Choose Rock Summit Contracting?",
      headerDesc: "With over a decade of construction excellence, Rock Summit delivers superior quality, innovative solutions, and unmatched expertise in building your vision into reality.",
      tabs: [
        {
          title: "Expert Construction Team",
          description: "Our team of certified engineers, architects, and construction specialists brings decades of combined experience in delivering high-quality, sustainable building solutions tailored to your specific requirements and vision.",
        },
        {
          title: "Comprehensive Building Solutions",
          description: "We offer end-to-end construction services including residential and commercial buildings, infrastructure development, finishing works, and maintenance services with the highest standards of quality and safety.",
        },
        {
          title: "Quality & Timely Delivery",
          description: "We pride ourselves on completing projects on schedule while maintaining exceptional quality standards, transparent communication, and comprehensive after-construction support for lasting client relationships.",
        },
      ],
      stats: [
        { value: "", label: "" },
        { value: "", label: "" },
        { value: "", label: "" },
        { value: "", label: "" },
      ],
      cta: "Start Your Construction Project",
    },
    ar: {
      headerTitle: "لماذا تختار القمة الصخرية للمقاولات؟",
      headerDesc: "بأكثر من عقد من التميز في البناء، تقدم القمة الصخرية جودة فائقة، حلولاً مبتكرة، وخبرة لا مثيل لها في تحويل رؤيتك إلى واقع ملموس.",
      tabs: [
        {
          title: "فريق بناء متخصص",
          description: "يضم فريقنا من المهندسين المعتمدين والمهندسين المعماريين ومتخصصي البناء عقودًا من الخبرة المجمعة في تقديم حلول بناء عالية الجودة ومستدامة مصممة خصيصًا لمتطلباتك ورؤيتك.",
        },
        {
          title: "حلول بناء شاملة",
          description: "نقدم خدمات بناء متكاملة تشمل المباني السكنية والتجارية، تطوير البنية التحتية، أعمال التشطيب، وخدمات الصيانة بأعلى معايير الجودة والسلامة.",
        },
        {
          title: "جودة وتسليم في الوقت المحدد",
          description: "نفتخر بإنجاز المشاريع في الجدول الزمني مع الحفاظ على معايير الجودة الاستثنائية، التواصل الشفاف، ودعم شامل ما بعد البناء لعلاقات عملاء دائمة.",
        },
      ],
      stats: [
        { value: "", label: "" },
        { value: "", label: " " },
        { value: "", label: " " },
        { value: "", label: " " },
      ],
      cta: "ابدأ مشروعك الإنشائي",
    },
  };

  const t = translations[lang] || translations.en;

  const tabs = [
    { id: 1, icon: <Users size={24} />, ...t.tabs[0] },
    { id: 2, icon: <Building2 size={24} />, ...t.tabs[1] },
    { id: 3, icon: <Award size={24} />, ...t.tabs[2] },
  ];

  const statsIcons = [<Building2 size={32} />, <Clock size={32} />, <Users size={32} />, <Shield size={32} />];

  return (
    <section
      className="py-5 position-relative"
      style={{ 
        backgroundImage: "url('/bg-1.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        direction: lang === "ar" ? "rtl" : "ltr", 
        overflow: "hidden",
        position: "relative",
        minHeight: "100vh",
      }}
    >
      {/* Dark Overlay for better readability */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 0
        }}
      ></div>

      {/* Golden Accent Overlay */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{
        background: `radial-gradient(circle at 20% 80%, rgba(206, 172, 36, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(206, 172, 36, 0.05) 0%, transparent 50%)`,
        zIndex: 1
      }}></div>

      <div className="container position-relative" style={{ zIndex: 2 }}>
        {/* Header */}
        <motion.div 
          className="text-center mb-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="fw-bold mb-3 text-white display-4" style={{ fontWeight: '700', color: '#ceac24' }}>
            {t.headerTitle}
          </h2>
          <div
            className="mx-auto mb-4"
            style={{ 
              width: "100px", 
              height: "4px", 
              background: "linear-gradient(90deg, #ceac24 0%, #d4b445 100%)",
              borderRadius: '2px'
            }}
          ></div>
          <p className="text-light lead" style={{ fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', color: '#e0e0e0' }}>
            {t.headerDesc}
          </p>
        </motion.div>

        {/* Stats Section - Hidden since stats are empty */}
        {t.stats && t.stats.some(stat => stat.value || stat.label) && (
          <motion.div 
            className="row mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t.stats.map((stat, index) => (
              <div key={index} className="col-6 col-md-3 text-center mb-4">
                <div className="d-flex flex-column align-items-center">
                  <div className="mb-3 p-3 rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      backgroundColor: 'rgba(206, 172, 36, 0.2)',
                      border: '2px solid rgba(206, 172, 36, 0.3)',
                      width: '80px',
                      height: '80px'
                    }}
                  >
                    <div style={{ color: '#ceac24' }}>
                      {statsIcons[index]}
                    </div>
                  </div>
                  <h3 className="text-white fw-bold mb-2" style={{ fontSize: '2.5rem', color: '#ceac24' }}>{stat.value}</h3>
                  <p className="text-light mb-0" style={{ fontSize: '1rem', color: '#cccccc' }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="d-flex justify-content-center mb-5 flex-wrap gap-3">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, #ceac24 0%, #d4b445 100%)' 
                  : 'rgba(255, 255, 255, 0.1)',
                border: activeTab === tab.id ? '2px solid #ceac24' : '2px solid rgba(206, 172, 36, 0.3)',
                color: activeTab === tab.id ? '#000000' : '#ceac24',
                padding: '1rem 2rem',
                borderRadius: '50px',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ color: activeTab === tab.id ? '#000000' : '#ceac24' }}>
                {tab.icon}
              </span>
              {tab.title}
            </motion.button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="d-flex justify-content-center">
          <div className="col-12 col-lg-10">
            <AnimatePresence mode="wait">
              {tabs.map(
                (tab) =>
                  activeTab === tab.id && (
                    <motion.div
                      key={tab.id}
                      className="tab-panel p-5 rounded-4"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        background: 'rgba(26, 26, 26, 0.8)',
                        border: '2px solid rgba(206, 172, 36, 0.3)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                      }}
                    >
                      <div className="d-flex align-items-start mb-4">
                        <div className="me-4 p-3 rounded-circle d-flex align-items-center justify-content-center"
                          style={{ 
                            backgroundColor: 'rgba(206, 172, 36, 0.2)',
                            border: '2px solid rgba(206, 172, 36, 0.5)',
                            width: '70px',
                            height: '70px',
                            flexShrink: 0
                          }}
                        >
                          <div style={{ color: '#ceac24' }}>
                            {tab.icon}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-white mb-3" style={{ fontWeight: '600', color: '#ceac24' }}>{tab.title}</h4>
                          <p className="text-light mb-0 lead" style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#e0e0e0' }}>
                            {tab.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CTA Button */}
        <motion.div 
          className="text-center mt-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.a 
            href={lang === "ar" ? "/ar/contact-us" : "/en/contact-us"} 
            className="btn btn-lg px-5 py-3 fw-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'linear-gradient(135deg, #ceac24 0%, #d4b445 100%)',
              color: '#000000',
              border: 'none',
              borderRadius: '50px',
              fontSize: '1.1rem',
              boxShadow: '0 10px 30px rgba(206, 172, 36, 0.4)'
            }}
          >
            {t.cta}
          </motion.a>
        </motion.div>
      </div>

      <style jsx>{`
        .tab-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(206, 172, 36, 0.3);
        }
        
        .tab-panel {
          transition: all 0.3s ease;
        }
        
        .tab-panel:hover {
          border-color: rgba(206, 172, 36, 0.5) !important;
          box-shadow: 0 25px 50px rgba(206, 172, 36, 0.2) !important;
        }
        
        @media (max-width: 768px) {
          .display-4 {
            font-size: 2.5rem;
          }
          
          .tab-button {
            padding: 0.75rem 1.5rem !important;
            font-size: 0.9rem !important;
          }
          
          section {
            background-attachment: scroll;
          }
        }
      `}</style>
    </section>
  );
}