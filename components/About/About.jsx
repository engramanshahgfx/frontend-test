"use client";

import React from "react";
import { FaStar, FaQuoteRight, FaHandshake, FaMapMarkedAlt, FaAward, FaUsers, FaHeart } from "react-icons/fa";
import TripsArchive from "../TripsArchive/TripsArchive";

export default function About({ lang }) {
  const content = {
    ar: {
      heroTitle: "سحر الطبيعة كما لم تره من قبل",
      heroSubtitle: "اكتشف المملكة من منظور جديد",
      heroDescription: "دعنا نخطط.. وأنت استمتع بالرحلة",
      
      welcomeTitle: "مرحبًا بكم في التلال والرمال",
      welcomeSubtitle: "لتنظيم الرحلات السياحية",
      welcomeDescription: "نقدّم رحلات سياحية عالية الجودة بأسعار تنافسية، حيث نمزج بين المتعة والقيمة المفيدة لنصنع لكم تجارب لا تُنسى. فريقنا الشاب والشغوف يخطط وينفذ كل رحلة بدقة، ليمنحكم ذكريات تبقى مدى الحياة. انضموا إلينا لاكتشاف جمال المملكة العربية السعودية، بين الطبيعة الخلابة، والمعالم التاريخية، والمغامرات الممتعة بأسلوب مختلف.",

      features: [
        {
          icon: <FaHandshake size={40} />,
          title: "موثوقون وذو خبرة",
          description: "نُنظم رحلات فريدة تجمع بين المتعة والمغامرة والقيمة المفيدة في ربوع المملكة."
        }
      ],

      visionTitle: "رؤيتنا",
      visionDescription: "نطمح إلى تنظيم رحلات سياحية تجمع بين الجودة العالية والأسعار التنافسية، حيث ندمج اللحظات الممتعة بالقيم المفيدة. نسعى لأن تكون رحلاتنا فارقة ونقطة تحوّل في تجديد مفهوم الترفيه السياحي في المملكة، مما يتماشى مع رؤية المملكة 2030. نؤمن بأن التجارب السياحية يجب أن تُثري حياة الأفراد، وتعزز من استكشاف جمال بلادنا وثقافتها الفريدة.",

      testimonialsTitle: "تقييمات عملائنا",
      testimonialsDescription: "اكتشف ما يقوله عملاؤنا عن تجاربهم معنا وكيف ساعدناهم في تحقيق رحلات لا تُنسى",

      testimonials: [
        {
          id: 1,
          text: "شكر خاص للأستاذ عمر لاهتمامه بأدق التفاصيل في المغامرة وفريق العمل المتعاون. الفعالية لا تنسى كانت تجربة مميزة",
          author: "عميل راضي",
          rating: 5
        },
        {
          id: 2,
          text: "أفضل تجربة سياحية مررت بها في حياتي. التنظيم كان ممتازًا والمرشدين محترفين جدًا",
          author: "سارة أحمد",
          rating: 5
        },
        {
          id: 3,
          text: "الاهتمام بالتفاصيل والخدمة المميزة جعلت الرحلة لا تُنسى. شكرًا لفريق التلال والرمال",
          author: "محمد الخالد",
          rating: 5
        }
      ],

      ctaButtons: {
        contact: "تواصل معنا",
        book: "إحجز رحلتك الان",
        profile: "الملف التعريفي للشركة"
      }
    },
    en: {
      heroTitle: "The Magic of Nature As You've Never Seen Before",
      heroSubtitle: "Discover Saudi Arabia from a New Perspective",
      heroDescription: "Let us plan... while you enjoy the journey",
      
      welcomeTitle: "Welcome to Tilal Rimal",
      welcomeSubtitle: "For Tourism Trip Organization",
      welcomeDescription: "We provide high-quality tourist trips at competitive prices, blending enjoyment with valuable experiences to create unforgettable memories for you. Our young and passionate team plans and executes every trip with precision, giving you memories that last a lifetime. Join us to discover the beauty of Saudi Arabia, amidst stunning nature, historical landmarks, and enjoyable adventures in a unique style.",

      features: [
        {
          icon: <FaHandshake size={40} />,
          title: "Trusted & Experienced",
          description: "We organize unique trips that combine enjoyment, adventure, and valuable experiences throughout the Kingdom."
        }
      ],

      visionTitle: "Our Vision",
      visionDescription: "We aspire to organize tourist trips that combine high quality with competitive prices, integrating enjoyable moments with valuable experiences. We strive to make our trips distinctive and transformative in renewing the concept of tourism entertainment in the Kingdom, aligning with Saudi Vision 2030. We believe that tourism experiences should enrich individuals' lives and enhance the exploration of our country's beauty and unique culture.",

      testimonialsTitle: "Our Clients' Reviews",
      testimonialsDescription: "Discover what our clients say about their experiences with us and how we helped them achieve unforgettable journeys",

      testimonials: [
        {
          id: 1,
          text: "Special thanks to Mr. Omar for his attention to the smallest details in the adventure and the cooperative work team. The event was unforgettable, it was a distinguished experience",
          author: "Satisfied Customer",
          rating: 5
        },
        {
          id: 2,
          text: "The best tourism experience I've ever had in my life. The organization was excellent and the guides were very professional",
          author: "Sarah Ahmed",
          rating: 5
        },
        {
          id: 3,
          text: "Attention to details and exceptional service made the trip unforgettable. Thanks to the Tilal Rimal team",
          author: "Mohammed Al Khalid",
          rating: 5
        }
      ],

      ctaButtons: {
        contact: "Contact Us",
        book: "Book Your Trip Now",
        profile: "Company Profile"
      }
    }
  };

  const t = content[lang] || content.ar;
  const isRTL = lang === "ar";

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar 
        key={i} 
        size={16} 
        color={i < rating ? "#FFD700" : "#E5E7EB"} 
        className={i < rating ? "text-warning" : "text-gray-300"}
      />
    ));
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="about-page">
      {/* Hero Section with Video Background */}
      <section className="about-hero">
        <div className="video-background">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="background-video"
          >
            <source src="/desert.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay"></div>
        </div>
        
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto text-center text-white">
              <div className="hero-content">
                <h1 className="display-4 fw-bold mb-4">{t.heroTitle}</h1>
                <p className="lead mb-3">{t.heroSubtitle}</p>
                <p className="hero-description">{t.heroDescription}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="welcome-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <img 
                src="/about.webp" 
                alt={t.welcomeTitle}
                className="img-fluid rounded-3 shadow-lg"
                onError={(e) => {
                  e.target.src = '/placeholder.png';
                }}
              />
            </div>
            <div className="col-lg-6">
              <div className="welcome-content">
                <h2 className="display-5 fw-bold mb-3">{t.welcomeTitle}</h2>
                <h4 className="text-muted mb-4">{t.welcomeSubtitle}</h4>
                <p className="lead mb-4">{t.welcomeDescription}</p>
                
                {/* Features */}
                {t.features.map((feature, index) => (
                  <div key={index} className="feature-item d-flex align-items-start mb-4">
                    <div className="feature-icon me-4">
                      {feature.icon}
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2">{feature.title}</h5>
                      <p className="mb-0">{feature.description}</p>
                    </div>
                  </div>
                ))}

                {/* CTA Buttons */}
                <div className="cta-buttons mt-4">
                  <a
                    href={`https://wa.me/+966547305060`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-lg"
                  >
                    {t.ctaButtons.contact}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="vision-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 order-2 order-lg-1">
              <div className="vision-content">
                <h2 className="display-5 fw-bold mb-4">{t.visionTitle}</h2>
                <p className="lead vision-description">{t.visionDescription}</p>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 mb-4 mb-lg-0">
              <img 
                src="/vision.webp" 
                alt={t.visionTitle}
                className="img-fluid rounded-3 shadow-lg"
                onError={(e) => {
                  e.target.src = '/placeholder.png';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Company Profile Download Section */}
      <section className="profile-download-section py-5 text-center">
        <div className="container">
          <a
            href="/pdfs/company-profile.pdf"
            download="Company Profile.pdf"
            className="btn btn-primary btn-lg px-5 shadow-sm"
          >
            {t.ctaButtons.profile}
          </a>
        </div>
      </section>

      {/* Our Previous Trips Section */}
      <TripsArchive lang={lang} hideHero={true} />

      {/* Testimonials Section */}
      <section className="testimonials-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-4 fw-bold mb-3">{t.testimonialsTitle}</h2>
            <p className="lead text-muted">{t.testimonialsDescription}</p>
          </div>

          <div className="row g-4">
            {t.testimonials.map((testimonial) => (
              <div key={testimonial.id} className="col-lg-4">
                <div className="testimonial-card">
                  <div className="testimonial-content">
                    <FaQuoteRight className="quote-icon" />
                    <p className="testimonial-text">"{testimonial.text}"</p>
                    <div className="testimonial-rating mb-3">
                      {renderStars(testimonial.rating)}
                    </div>
                    <div className="testimonial-author">
                      <strong>{testimonial.author}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .about-page {
          font-family: 'Tajawal', sans-serif;
          background-color: #FAF6F0;
        }

        .about-hero {
          position: relative;
          padding: 140px 0 100px;
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
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
          background: linear-gradient(135deg, 
            rgba(28, 0, 82, 0.9) 0%, 
            rgba(232, 93, 31, 0.7) 100%);
          z-index: 2;
        }

        .about-hero .container {
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
          font-family: 'Tajawal', sans-serif;
        }

        .hero-content .lead {
          font-size: 1.5rem;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          font-weight: 600;
          font-family: 'Tajawal', sans-serif;
        }

        .hero-description {
          font-size: 1.2rem;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          color: rgba(255,255,255,0.9);
          font-family: 'Tajawal', sans-serif;
        }
        
        .testimonials-section{
          padding-bottom: 200px !important;
        }

        .welcome-section, .vision-section, .testimonials-section {
          padding: 80px 0;
        }

        .welcome-content h2 {
          color: #E85D1F;
          font-family: 'Tajawal', sans-serif;
        }

        .welcome-content h4 {
          font-family: 'Tajawal', sans-serif;
        }

        .welcome-content p {
          font-family: 'Tajawal', sans-serif;
        }

        .feature-icon {
          color: #E85D1F;
          padding: 15px;
          border-radius: 50%;
          background: rgba(232, 93, 31, 0.1);
          transition: all 0.3s ease;
        }

        .feature-item:hover .feature-icon {
          background: rgba(232, 93, 31, 0.2);
          transform: scale(1.1);
        }

        .feature-item h5 {
          font-family: 'Tajawal', sans-serif;
        }

        .feature-item p {
          font-family: 'Tajawal', sans-serif;
        }

        .btn-primary {
          background: linear-gradient(45deg, #1C0052, #E85D1F);
          border: none;
          padding: 12px 30px;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s ease;
          font-family: 'Tajawal', sans-serif;
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(232, 93, 31, 0.4);
        }

        .btn-outline-primary {
          border: 2px solid #1C0052;
          color: #1C0052;
          padding: 12px 30px;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s ease;
          font-family: 'Tajawal', sans-serif;
        }

        .btn-outline-primary:hover {
          background: #1C0052;
          color: white;
          transform: translateY(-2px);
        }

        .vision-content h2 {
          color: #E85D1F;
          font-family: 'Tajawal', sans-serif;
        }

        .testimonials-section h2 {
          color: #E85D1F;
          font-family: 'Tajawal', sans-serif;
        }

        .vision-description {
          color: #5d6d7e;
          line-height: 1.8;
          font-size: 1.1rem;
          font-family: 'Tajawal', sans-serif;
        }

        .testimonial-card {
          background: white;
          border-radius: 20px;
          padding: 40px 30px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid #e9ecef;
          height: 100%;
          position: relative;
          font-family: 'Tajawal', sans-serif;
        }

        .testimonial-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .quote-icon {
          color: #E85D1F;
          font-size: 2rem;
          margin-bottom: 20px;
          opacity: 0.7;
        }

        .testimonial-text {
          color: #5d6d7e;
          line-height: 1.7;
          font-style: italic;
          margin-bottom: 20px;
          font-family: 'Tajawal', sans-serif;
        }

        .testimonial-rating {
          display: flex;
          gap: 5px;
          justify-content: center;
        }

        .testimonial-author {
          color: #2c3e50;
          font-weight: 600;
          text-align: center;
          font-family: 'Tajawal', sans-serif;
        }

        @media (max-width: 768px) {
          .about-hero {
            padding: 120px 0 80px;
            min-height: 60vh;
          }

          .hero-content h1 {
            font-size: 2.5rem;
          }

          .hero-content .lead {
            font-size: 1.3rem;
          }

          .welcome-section, .vision-section, .testimonials-section {
            padding: 60px 0;
          }

          .cta-buttons {
            text-align: center;
          }

          .btn {
            display: block;
            width: 100%;
            margin-bottom: 10px;
          }

          .btn.me-3 {
            margin-right: 0 !important;
          }
        }

        @media (max-width: 576px) {
          .hero-content h1 {
            font-size: 2rem;
          }

          .hero-content .lead {
            font-size: 1.1rem;
          }

          .testimonial-card {
            padding: 30px 20px;
          }
        }
      `}</style>
    </div>
  );
}