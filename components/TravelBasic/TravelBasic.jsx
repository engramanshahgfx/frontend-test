"use client";

import React from "react";
import { FaPassport, FaMap, FaGlobe, FaPlane, FaArrowLeft, FaArrowRight } from "react-icons/fa";

export default function TravelBasic({ lang }) {
  const content = {
    ar: {
      heroTitle: "دليلك لاكتشاف المملكة",
      heroSubtitle: "كل ما تحتاج معرفته للسفر إلى المملكة العربية السعودية",
      categories: [
        {
          id: 1,
          title: "متطلبات تأشيرة الدخول",
          description: "تعرف على متطلبات التأشيرات والإجراءات اللازمة لدخول المملكة العربية السعودية",
          icon: <FaPassport size={40} />,
          link: "/visa-requirements",
          buttonText: "اعرف أكثر"
        },
        {
          id: 2,
          title: "دليل السفر",
          description: "دليل شامل للتخطيط لرحلتك، بما في ذلك أفضل الأوقات للزيارة والتقاليد المحلية",
          icon: <FaMap size={40} />,
          link: "/travel-guide",
          buttonText: "اعرف أكثر"
        },
        {
          id: 3,
          title: "حول السعودية",
          description: "اكتشف الثقافة الغنية، التراث التاريخي، والمناطق الجغرافية المتنوعة في المملكة",
          icon: <FaGlobe size={40} />,
          link: "/about-saudi",
          buttonText: "اعرف أكثر"
        },
        {
          id: 4,
          title: "الوصول إلى وجهتك",
          description: "معلومات عن المطارات، المواصلات الداخلية، وأفضل ways للتنقل بين المدن",
          icon: <FaPlane size={40} />,
          link: "/transportation",
          buttonText: "اعرف أكثر"
        }
      ]
    },
    en: {
      heroTitle: "Your Guide to Discovering the Kingdom",
      heroSubtitle: "Everything you need to know for traveling to Saudi Arabia",
      categories: [
        {
          id: 1,
          title: "Visa Entry Requirements",
          description: "Learn about visa requirements and necessary procedures for entering Saudi Arabia",
          icon: <FaPassport size={40} />,
          link: "/visa-requirements",
          buttonText: "Learn More"
        },
        {
          id: 2,
          title: "Travel Guide",
          description: "Comprehensive guide for planning your trip, including best times to visit and local customs",
          icon: <FaMap size={40} />,
          link: "/travel-guide",
          buttonText: "Learn More"
        },
        {
          id: 3,
          title: "About Saudi Arabia",
          description: "Discover the rich culture, historical heritage, and diverse geographical regions of the Kingdom",
          icon: <FaGlobe size={40} />,
          link: "/about-saudi",
          buttonText: "Learn More"
        },
        {
          id: 4,
          title: "Reach Your Destination",
          description: "Information about airports, internal transportation, and best ways to travel between cities",
          icon: <FaPlane size={40} />,
          link: "/transportation",
          buttonText: "Learn More"
        }
      ]
    },
     zh: {
    heroTitle: "探索王国指南",
    heroSubtitle: "前往沙特阿拉伯旅行所需的一切信息",
    categories: [
      {
        id: 1,
        title: "签证入境要求",
        description: "了解进入沙特阿拉伯的签证要求和必要程序",
        icon: <FaPassport size={40} />,
        link: "/visa-requirements",
        buttonText: "了解更多"
      },
      {
        id: 2,
        title: "旅行指南",
        description: "规划旅程的综合指南，包括最佳访问时间和当地习俗",
        icon: <FaMap size={40} />,
        link: "/travel-guide",
        buttonText: "了解更多"
      },
      {
        id: 3,
        title: "关于沙特阿拉伯",
        description: "探索王国丰富的文化、历史遗产和多样的地理区域",
        icon: <FaGlobe size={40} />,
        link: "/about-saudi",
        buttonText: "了解更多"
      },
      {
        id: 4,
        title: "抵达目的地",
        description: "关于机场、内部交通以及城市间最佳出行方式的信息",
        icon: <FaPlane size={40} />,
        link: "/transportation",
        buttonText: "了解更多"
      }
    ]
  }
  };

  const t = content[lang] || content.ar;
  const isRTL = lang === "ar";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="travel-basics-page">
      {/* Hero Section */}
      <section className="travel-hero">
        <div className="container">
          <div className="row align-items-center min-vh-80">
            <div className="col-lg-8 mx-auto text-center text-white">
              <div className="hero-content">
                <h1 className="display-4 fw-bold mb-4">{t.heroTitle}</h1>
                <p className="lead mb-5">{t.heroSubtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="categories-section py-5">
        <div className="container">
          <div className="row g-4">
            {t.categories.map((category) => (
              <div key={category.id} className="col-lg-6">
                <div className="category-card">
                  <div className="category-icon">
                    {category.icon}
                  </div>
                  <div className="category-content">
                    <h3 className="category-title">{category.title}</h3>
                    <p className="category-description">{category.description}</p>
                    <a 
                      href={`/${lang}${category.link}`}
                      className="category-btn"
                    >
                      {category.buttonText}
                      {isRTL ? <FaArrowLeft className="ms-2" /> : <FaArrowRight className="ms-2" />}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .travel-basics-page {
          background: #f8f9fa;
          font-family: 'Tajawal', sans-serif;
        }

        .travel-hero {
          background: linear-gradient(135deg, 
            rgba(138, 119, 121, 0.95) 0%, 
            rgba(239, 200, 174, 0.85) 100%),
            url('/bg.webp') center/cover;
          padding: 120px 0 80px;
          position: relative;
          min-height: 60vh;
          display: flex;
          align-items: center;
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

        .categories-section {
          background: #f8f9fa;
        }

        .category-card {
          background: white;
          border-radius: 20px;
          padding: 40px 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid #e9ecef;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .category-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          border-color: #8a7779;
        }

        .category-icon {
          color: #8a7779;
          margin-bottom: 25px;
          padding: 20px;
          border-radius: 50%;
          background: rgba(138, 119, 121, 0.1);
          transition: all 0.3s ease;
        }

        .category-card:hover .category-icon {
          background: rgba(138, 119, 121, 0.2);
          transform: scale(1.1);
        }

        .category-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .category-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 15px;
          line-height: 1.3;
        }

        .category-description {
          color: #5d6d7e;
          margin-bottom: 25px;
          line-height: 1.6;
          font-size: 1rem;
        }

        .category-btn {
          background: linear-gradient(45deg, #8a7779, #a89294);
          color: white;
          padding: 12px 30px;
          border-radius: 25px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          box-shadow: 0 4px 15px rgba(138, 119, 121, 0.3);
        }

        .category-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(138, 119, 121, 0.4);
          color: white;
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .travel-hero {
            padding: 100px 0 60px;
            min-height: 50vh;
          }

          .hero-content h1 {
            font-size: 2.2rem;
          }

          .hero-content .lead {
            font-size: 1.1rem;
          }

          .category-card {
            padding: 30px 20px;
          }

          .category-title {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 576px) {
          .hero-content h1 {
            font-size: 1.8rem;
          }

          .category-card {
            padding: 25px 15px;
          }
        }
      `}</style>
    </div>
  );
}