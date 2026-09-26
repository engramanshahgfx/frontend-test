"use client";
import React from 'react';
import Slider from 'react-slick';

export default function CoverBanner({ lang, data }) {
  // Fallback data in case props are undefined
const safeData = data || {
    title: {
      en: "The Magic of Nature As You've Never Seen Before",
      ar: "سحر الطبيعة كما لم تره من قبل",
      zh: "大自然的神奇，前所未见"
    },
    subtitle: {
      en: "Discover the Kingdom from a New Perspective",
      ar: "اكتشف المملكة من منظور جديد",
      zh: "从新视角探索王国"
    },
    description: {
      en: "Let us plan.. and you enjoy the journey",
      ar: "دعنا نخطط.. وأنت استمتع بالرحلة",
      zh: "让我们来规划.. 您只管享受旅程"
    },
    featuredTrips: [
      {
        title: {
          en: "Egyptian Night",
          ar: "ليلة مصرية",
          zh: "埃及之夜"
        },
        description: {
          en: "Enjoy evening activities in natural surroundings",
          ar: "استمتع بأنشطة مسائية في أجواء طبيعية",
          zh: "在自然环境中享受晚间活动"
        },
        badge: {
          en: "Featured",
          ar: "مميز",
          zh: "精选"
        },
        image: "/trips/egyptian-night.jpg"
      },
      {
        title: {
          en: "Jeddah Winter",
          ar: "شتاء جدة", 
          zh: "吉达冬日"
        },
        description: {
          en: "Enjoy evening activities in natural surroundings",
          ar: "استمتع بأنشطة مسائية في أجواء طبيعية",
          zh: "在自然环境中享受晚间活动"
        },
        badge: {
          en: "Featured",
          ar: "مميز",
          zh: "精选"
        },
        image: "/trips/jeddah-winter.jpg"
      },
      {
        title: {
          en: "Foundation Day",
          ar: "يوم التأسيس",
          zh: "建国日"
        },
        description: {
          en: "Experience different atmospheres",
          ar: "اختبر أجواء مختلفة",
          zh: "体验不同氛围"
        },
        badge: {
          en: "Featured", 
          ar: "مميز",
          zh: "精选"
        },
        image: "/trips/foundation-day.jpg"
      }
    ]
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    arrows: false
  };

  return (
    <section className="cover-banner">
      <Slider {...settings}>
        {/* Main Hero Slide */}
        <div className="hero-slide">
          <div className="slide-background" 
            style={{ 
              backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/banners/hero-1.jpg')" 
            }}>
            <div className="container">
              <div className="row align-items-center min-vh-100">
                <div className="col-lg-8 text-white">
                  <h1 className="display-3 fw-bold mb-4">{safeData.title}</h1>
                  <h2 className="display-6 mb-4">{safeData.subtitle}</h2>
                  <p className="lead mb-5">{safeData.description}</p>
                  <div className="d-flex gap-3">
                    <button className="btn btn-primary btn-lg">
                      {lang === 'ar' ? 'استكشف الرحلات' : lang === 'zh' ? '探索旅行' : 'Explore Trips'}
                    </button>
                    <button className="btn btn-outline-light btn-lg">
                      {lang === 'ar' ? 'عرض المزيد' : lang === 'zh' ? '查看更多' : 'View More'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Trips Slides */}
        {safeData.featuredTrips && safeData.featuredTrips.map((trip, index) => (
          <div key={index} className="trip-slide">
            <div className="slide-background" 
              style={{ 
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${trip.image || '/banners/default-trip.jpg'}')` 
              }}>
              <div className="container">
                <div className="row align-items-center min-vh-100">
                  <div className="col-lg-6 text-white">
                    <span className="badge bg-warning text-dark mb-3">{trip.badge || 'Featured'}</span>
                    <h2 className="display-4 fw-bold mb-4">{trip.title || 'Featured Trip'}</h2>
                    <p className="lead mb-5">{trip.description || 'Experience amazing adventures'}</p>
                    <button className="btn btn-primary btn-lg">
                      {lang === 'ar' ? 'عرض التفاصيل' : lang === 'zh' ? '查看详情' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      <style jsx>{`
        .cover-banner {
          position: relative;
        }
        .hero-slide, .trip-slide {
          position: relative;
        }
        .slide-background {
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          min-height: 100vh;
          display: flex;
          align-items: center;
        }
        .min-vh-100 {
          min-height: 100vh;
        }
        
        @media (max-width: 768px) {
          .display-3 {
            font-size: 2.5rem;
          }
          .display-4 {
            font-size: 2rem;
          }
        }
      `}</style>
    </section>
  );
}