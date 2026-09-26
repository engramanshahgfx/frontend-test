"use client";

import React from "react";
import { FaArrowLeft, FaGlobe, FaLandmark, FaEye, FaBook, FaLanguage, FaChartLine, FaMountain, FaCity, FaHeart } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

export default function AboutSaudi({ lang }) {
  const content = {
    ar: {
      heroTitle: "سحر الطبيعة كما لم تره من قبل",
      heroSubtitle: "حول السعودية",
      heroDescription: "اكتشف المملكة من منظور جديد",
      
      culture: {
        title: "الثقافة",
        content: "تتميز المملكة العربية السعودية بتراث غني وتقاليد عريقة، حيث شكّلت مركزًا تجاريًا رئيسيًا عبر التاريخ وشهدت ولادة الدين الإسلامي. وفي السنوات الأخيرة، خضعت المملكة لتحول ثقافي مهم، حيث تم تطوير عادات عمرها قرون بما يتلاءم مع زمننا المعاصر."
      },
      
      language: {
        title: "اللغة",
        content: "العربية هي اللغة الرسمية في المملكة العربية السعودية وهي اللغة الرئيسية المستخدمة في التعاملات والمعاملات العامة. وتُعدّ الإنجليزية لغة ثانية غير رسمية في المملكة ويتحدثها قسم كبير من السكان. كما وتعرض جميع لوحات السير المعلومات باللغتين العربية والإنجليزية."
      },
      
      vision: {
        title: "رؤية المملكة 2030",
        content: "منذ إطلاق صاحب السمو الملكي الأمير محمد بن سلمان بن عبد العزيز آل سعود ولي العهد رئيس مجلس الوزراء -حفظه الله- رؤية المملكة 2030. وهي تسعى لتنويع مصادر الاقتصاد وتقليل الاعتماد على الإيرادات النفطية. ومنذ ذلك الوقت؛ تعيش المملكة العربية السعودية مرحلة تحول ونمو متزايدة في قطاعات واعدة متنوعة، كقطاعات التعدين، والصناعة، والخدمات اللوجستية، مرتكزةً في ذلك على ثلاثة محاور رئيسية وهي مجتمع حيوي، واقتصاد مزدهر، ووطن طموح."
      },
      
      backButton: "العودة للرئيسية",
      exploreMore: "استكشف المزيد",
      stats: {
        regions: "منطقة",
        population: "سكان",
        founded: "التأسيس"
      },
      pillars: {
        vibrant: "مجتمع حيوي",
        thriving: "اقتصاد مزدهر",
        ambitious: "وطن طموح"
      },
      ctaTitle: "استعد لاكتشاف المملكة",
      ctaDescription: "انطلق في رحلة لا تُنسى عبر المملكة العربية السعودية"
    },
    en: {
      heroTitle: "The Magic of Nature As You've Never Seen Before",
      heroSubtitle: "About Saudi Arabia",
      heroDescription: "Discover the Kingdom from a new perspective",
      
      culture: {
        title: "Culture",
        content: "The Kingdom of Saudi Arabia boasts a rich heritage and ancient traditions, having served as a major commercial center throughout history and witnessed the birth of Islam. In recent years, the Kingdom has undergone significant cultural transformation, developing centuries-old customs to align with our contemporary era."
      },
      
      language: {
        title: "Language",
        content: "Arabic is the official language of the Kingdom of Saudi Arabia and is the primary language used in public dealings and transactions. English is considered an unofficial second language in the Kingdom and is spoken by a large segment of the population. All road signs display information in both Arabic and English."
      },
      
      vision: {
        title: "Saudi Vision 2030",
        content: "Since the launch of Saudi Vision 2030 by His Royal Highness Prince Mohammed bin Salman bin Abdulaziz Al Saud, Crown Prince and Prime Minister - may God protect him - the vision aims to diversify economic sources and reduce dependence on oil revenues. Since then, the Kingdom of Saudi Arabia has been experiencing a phase of transformation and increasing growth in various promising sectors, such as mining, industry, and logistics, based on three main pillars: a vibrant society, a thriving economy, and an ambitious nation."
      },
      
      backButton: "Back to Home",
      exploreMore: "Explore More",
      stats: {
        regions: "Regions",
        population: "Population",
        founded: "Founded"
      },
      pillars: {
        vibrant: "Vibrant Society",
        thriving: "Thriving Economy",
        ambitious: "Ambitious Nation"
      },
      ctaTitle: "Ready to Explore the Kingdom?",
      ctaDescription: "Embark on an unforgettable journey through Saudi Arabia"
    }
  };

  const t = content[lang] || content.ar;
  const isRTL = lang === "ar";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="about-saudi-page">
      {/* Hero Section with Cover Background */}
      <section className="about-saudi-hero">
        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-8 mx-auto text-center">
              <div className="hero-content">
                <h6 className="hero-subtitle mb-3">{t.heroSubtitle}</h6>
                <h1 className="hero-title display-4 fw-bold mb-4">
                  {t.heroTitle}
                </h1>
                <p className="hero-description lead mb-5">
                  {t.heroDescription}
                </p>
                
                <div className="hero-stats row justify-content-center">
                  <div className="col-4">
                    <div className="stat-item text-center">
                      <div className="stat-number h3 mb-1">14</div>
                      <div className="stat-label small">
                        {t.stats.regions}
                      </div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="stat-item text-center">
                      <div className="stat-number h3 mb-1">35M+</div>
                      <div className="stat-label small">
                        {t.stats.population}
                      </div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="stat-item text-center">
                      <div className="stat-number h3 mb-1">1932</div>
                      <div className="stat-label small">
                        {t.stats.founded}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="content-sections py-5" style={{maxWidth: "1200px", margin: "0 auto"}}>
        <div className="container">
          {/* Culture Section */}
          <div className="row align-items-center mb-5 py-5">
            <div className="col-lg-6">
              <div className="section-image position-relative">
                <div className="image-container rounded-3 overflow-hidden shadow-lg">
                  <Image
                    src="/saudi-culture.jpg"
                    alt={t.culture.title}
                    width={700}
                    height={550}
                    className="section-img"
                  />
                  <div className="image-overlay"></div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="section-content">
                <div className="section-icon mb-3">
                  <FaBook size={32} />
                </div>
                <h2 className="section-title h3 fw-bold mb-4">
                  {t.culture.title}
                </h2>
                <p className="section-text lead">
                  {t.culture.content}
                </p>
              </div>
            </div>
          </div>

          {/* Language Section */}
          <div className="row align-items-center mb-5 py-5">
            <div className="col-lg-6 order-lg-2">
              <div className="section-image position-relative">
                <div className="image-container rounded-3 overflow-hidden shadow-lg">
                  <Image
                    src="/saudi-language.jpeg"
                    alt={t.language.title}
                    width={700}
                    height={550}
                    className="section-img"
                  />
                  <div className="image-overlay"></div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <div className="section-content">
                <div className="section-icon mb-3">
                  <FaLanguage size={32} />
                </div>
                <h2 className="section-title h3 fw-bold mb-4">
                  {t.language.title}
                </h2>
                <p className="section-text lead">
                  {t.language.content}
                </p>
              </div>
            </div>
          </div>

          {/* Vision 2030 Section */}
          <div className="row align-items-center py-5">
            <div className="col-lg-6">
              <div className="section-image position-relative">
                <div className="image-container rounded-3 overflow-hidden shadow-lg">
                  <Image
                    src="/saudi-vision.jpg"
                    alt={t.vision.title}
                    width={700}
                    height={550}
                    className="section-img"
                  />
                  <div className="image-overlay"></div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="section-content">
                <div className="section-icon mb-3">
                  <FaEye size={32} />
                </div>
                <h2 className="section-title h3 fw-bold mb-4">
                  {t.vision.title}
                </h2>
                <p className="section-text lead">
                  {t.vision.content}
                </p>
                <div className="vision-pillars mt-4">
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <div className="pillar-card text-center p-3 rounded-3">
                        <div className="pillar-icon mb-2">
                          <FaGlobe size={24} />
                        </div>
                        <h6 className="pillar-title fw-bold mb-2">
                          {t.pillars.vibrant}
                        </h6>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="pillar-card text-center p-3 rounded-3">
                        <div className="pillar-icon mb-2">
                          <FaChartLine size={24} />
                        </div>
                        <h6 className="pillar-title fw-bold mb-2">
                          {t.pillars.thriving}
                        </h6>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="pillar-card text-center p-3 rounded-3">
                        <div className="pillar-icon mb-2">
                          <FaEye size={24} />
                        </div>
                        <h6 className="pillar-title fw-bold mb-2">
                          {t.pillars.ambitious}
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .about-saudi-page {
          background: #FAF6F0;
          font-family: 'Tajawal', sans-serif;
        }

        .about-saudi-hero {
          background: linear-gradient(
            135deg, 
            rgba(28, 0, 82, 0.9) 0%, 
            rgba(249, 229, 210, 0.8) 100%
          ), url('/vision.jpg') center/cover no-repeat fixed;
          padding: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          color: white;
        }
        
        .back-button {
          color: #ffffff;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
          padding: 10px 20px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .back-button:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.3);
          text-decoration: none;
          transform: translateY(-2px);
        }
        
        .hero-subtitle {
          font-size: 1.2rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #FFC60B;
          margin-bottom: 1rem;
        }
        
        .hero-title {
          color: #ffffff;
          font-weight: 800;
          line-height: 1.2;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          margin-bottom: 1.5rem;
        }
        
        .hero-description {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.3rem;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          margin-bottom: 3rem;
        }

        .image-container {
          position: relative;
          width: 100%;
          height: 400px;
          border-radius: 10px !important;
          overflow: hidden;
        }

        .section-image .image-container {
          height: 350px;
        }

        .section-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .image-container:hover .section-img {
          transform: scale(1.08);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, rgba(28, 0, 82, 0.1), rgba(232, 93, 31, 0.1));
          pointer-events: none;
        }
        
        .stat-item {
          padding: 1rem;
        }
        
        .stat-number {
          font-weight: 800;
          color: #FFC60B;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .stat-label {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }
        
        .section-content {
          padding: 2rem;
        }
        
        .section-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: rgba(232, 93, 31, 0.08);
          border-radius: 10px;
          color: #E85D1F;
        }
        
        .section-title {
          color: #1C0052;
          font-weight: 800;
          font-family: 'Tajawal', sans-serif;
        }
        
        .section-text {
          color: #555;
          line-height: 1.8;
        }
        
        .pillar-card {
          transition: all 0.3s ease;
          border: 1px solid rgba(28, 0, 82, 0.06);
          background: white;
          border-radius: 10px !important;
        }
        
        .pillar-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(28, 0, 82, 0.1);
          border-color: rgba(232, 93, 31, 0.3);
        }
        
        .pillar-icon {
          color: #E85D1F;
        }
        
        .pillar-title {
          color: #1C0052;
        }
        
        .cta-section {
          background: linear-gradient(135deg, #1C0052 0%, #0F0030 100%);
          color: white;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #E85D1F 0%, #FFC60B 100%);
          color: white !important;
          border: none;
          padding: 12px 30px;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(232, 93, 31, 0.2);
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(232, 93, 31, 0.35);
        }
        
        @media (max-width: 768px) {
          .about-saudi-hero {
            padding: 4rem 0;
            background-attachment: scroll;
          }
          
          .hero-title {
            font-size: 2.5rem;
          }
          
          .section-content {
            padding: 1rem 0;
          }
          
          .image-container {
            height: 300px;
            margin-bottom: 2rem;
          }

          .section-image .image-container {
            height: 250px;
          }
          
          .hero-stats {
            margin-top: 2rem;
          }
        }
        
        @media (max-width: 576px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-description {
            font-size: 1.1rem;
          }
          
          .stat-item {
            padding: 0.5rem;
          }

          .image-container {
            height: 250px;
          }

          .section-image .image-container {
            height: 200px;
          }
        }
        
        [dir="rtl"] .section-content {
          text-align: right;
        }
        
        [dir="rtl"] .hero-stats {
          direction: ltr;
        }
        
        [dir="rtl"] .back-button {
          flex-direction: row-reverse;
        }
      `}</style>
    </div>
  );
}