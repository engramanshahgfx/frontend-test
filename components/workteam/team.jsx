"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function TeamSection({ lang = "en" }) {
  const translations = {
    en: {
      heading: "Our Leadership Team",
      description: "Meet our experienced team of construction professionals, engineers, and project managers dedicated to building excellence.",
    },
    ar: {
      heading: "فريق القيادة",
      description: "تعرف على فريقنا المتمرس من محترفي البناء والمهندسين ومديري المشاريع المكرسين لتحقيق التميز في البناء.",
    },
  };

  const t = translations[lang] ?? translations.en;

  const teamMembers = [
    { 
      id: 1, 
      name: { en: "Eng. Ahmed Al-Rashid", ar: "م. أحمد الرشيد" }, 
      position: { en: "Chief Executive Officer", ar: "الرئيس التنفيذي" }, 
      image: "/aman.jpg",
      expertise: { en: "Construction Management", ar: "إدارة الإنشاءات" }
    },
    { 
      id: 2, 
      name: { en: "Eng. Mohammed Al-Ghamdi", ar: "م. محمد الغامدي" }, 
      position: { en: "Projects Director", ar: "مدير المشاريع" }, 
      image: "/aman.jpg",
      expertise: { en: "Civil Engineering", ar: "الهندسة المدنية" }
    },
    { 
      id: 3, 
      name: { en: "Eng. Sarah Al-Mansour", ar: "م. سارة المنصور" }, 
      position: { en: "Operations Manager", ar: "مدير العمليات" }, 
      image: "/aman.jpg",
      expertise: { en: "Construction Operations", ar: "عمليات البناء" }
    },
    { 
      id: 4, 
      name: { en: "Eng. Khalid Al-Otaibi", ar: "م. خالد العتيبي" }, 
      position: { en: "Technical Director", ar: "المدير الفني" }, 
      image: "/aman.jpg",
      expertise: { en: "Structural Engineering", ar: "الهندسة الإنشائية" }
    },
    { 
      id: 5, 
      name: { en: "Eng. Fatima Al-Zahrani", ar: "م. فاطمة الزهراني" }, 
      position: { en: "Quality Control Manager", ar: "مدير مراقبة الجودة" }, 
      image: "/aman.jpg",
      expertise: { en: "Quality Assurance", ar: "ضمان الجودة" }
    },
    { 
      id: 6, 
      name: { en: "Eng. Faisal Al-Shammari", ar: "م. فيصل الشمري" }, 
      position: { en: "Site Operations Manager", ar: "مدير عمليات الموقع" }, 
      image: "/aman.jpg",
      expertise: { en: "Site Management", ar: "إدارة المواقع" }
    },
  ];

  return (
    <section className="team-section" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="container">
        <h2>{t.heading}</h2>
        <p>{t.description}</p>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={3}
          navigation
          pagination={{ clickable: true }}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1400: { slidesPerView: 4 }
          }}
        >
          {teamMembers.map((member) => (
            <SwiperSlide key={member.id}>
              <div className="team-card">
                <div className="image-wrapper">
                  <img src={member.image} alt={member.name[lang]} />
                  <div className="member-overlay">
                    <span className="expertise">{member.expertise[lang]}</span>
                  </div>
                </div>
                <div className="member-info">
                  <h3>{member.name[lang]}</h3>
                  <p className="position">{member.position[lang]}</p>
                  <p className="expertise-text">{member.expertise[lang]}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx>{`
        .team-section {
          padding: 5rem 1rem;
          text-align: center;
          font-family: 'Tajawal', sans-serif;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        h2 {
          font-size: 2.8rem;
          margin-bottom: 1rem;
          color: #2d3e8f;
          font-weight: 700;
        }
        
        p {
          font-size: 1.2rem;
          margin-bottom: 3rem;
          color: #666;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }
        
        .team-card {
          background: white;
          border-radius: 20px;
          padding: 2rem 1.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          border: 1px solid #e9ecef;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .team-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(45, 62, 143, 0.15);
        }
        
        .image-wrapper {
          position: relative;
          width: 160px;
          height: 160px;
          margin: 0 auto 1.5rem;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid #2d3e8f;
          background: #f8f9fa;
        }
        
        .image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .team-card:hover .image-wrapper img {
          transform: scale(1.1);
        }
        
        .member-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(45, 62, 143, 0.9));
          padding: 0.5rem;
          transform: translateY(100%);
          transition: transform 0.3s ease;
        }
        
        .team-card:hover .member-overlay {
          transform: translateY(0);
        }
        
        .expertise {
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .member-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .team-card h3 {
          font-size: 1.4rem;
          margin: 0.5rem 0 0.25rem 0;
          color: #2d3e8f;
          font-weight: 700;
        }
        
        .position {
          font-size: 1.1rem;
          color: #ceac24;
          font-weight: 600;
          margin: 0.25rem 0;
        }
        
        .expertise-text {
          font-size: 0.95rem;
          color: #666;
          margin: 0.5rem 0 0 0;
          font-style: italic;
        }
        
        /* Swiper Navigation Customization */
        :global(.swiper-button-next),
        :global(.swiper-button-prev) {
          color: #2d3e8f;
          background: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        :global(.swiper-button-next):after,
        :global(.swiper-button-prev):after {
          font-size: 1.2rem;
          font-weight: bold;
        }
        
        :global(.swiper-pagination-bullet-active) {
          background: #2d3e8f;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          h2 {
            font-size: 2.2rem;
          }
          
          p {
            font-size: 1.1rem;
          }
          
          .team-card {
            padding: 1.5rem 1rem;
          }
          
          .image-wrapper {
            width: 140px;
            height: 140px;
          }
        }
        
        @media (max-width: 480px) {
          .team-section {
            padding: 3rem 1rem;
          }
          
          h2 {
            font-size: 1.8rem;
          }
          
          p {
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
}