"use client";
import { useState, useEffect } from "react";
import { FaStar, FaAngleLeft, FaAngleRight } from "react-icons/fa";

export default function Testimonials({ lang = "en" }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonialsContent = {
    en: [
      {
        name: "Ahmed",
        quote: "Our trip to the Hail Mountains was a wonderful experience! Everything was excellently organized, and the staff was very helpful.",
        rating: 5,
      },
      {
        name: "Mohamed",
        quote: "Tourism in Saudi Arabia with your team is different, like you've never seen it before. Thank you, Hills and Sands team.",
        rating: 5,
      },
      {
        name: "Khaled",
        quote: "Special thanks to Omar for his attention to the smallest details of the adventure and to the cooperative team; a truly unique experience.",
        rating: 5,
      },
      {
        name: "Yassin",
        quote: "Amazing service and unforgettable memories. The attention to detail and customer care was exceptional throughout our journey.",
        rating: 5,
      },
      {
        name: "Rady",
        quote: "The desert safari experience was breathtaking! Professional guides and well-planned itinerary made our trip memorable.",
        rating: 5,
      },
      {
        name: "Seif",
        quote: "From start to finish, everything was perfectly arranged. We felt safe and well taken care of during our entire Saudi adventure.",
        rating: 5,
      },
    ],
    ar: [
      {
        name: "أحمد",
        quote: "رحلتنا إلى جبال حائل كانت تجربة رائعة! كل شيء كان منظمًا بشكل ممتاز، والطاقم كان مفيدًا جدًا.",
        rating: 5,
      },
      {
        name: "محمد",
        quote: "السياحة في السعودية مع فريقكم مختلفة، مثلما لم ترها من قبل. شكرًا لكم فريق التلال والرمال.",
        rating: 5,
      },
      {
        name: "خالد",
        quote: "شكر خاص لعمر على اهتمامه بأدق تفاصيل المغامرة وإلى الفريق المتعاون؛ تجربة فريدة حقًا.",
        rating: 5,
      },
      {
        name: "راضي",
        quote: "خدمة مذهلة وذكريات لا تنسى. الاهتمام بالتفاصيل والرعاية للعملاء كان استثنائيًا طوال رحلتنا.",
        rating: 5,
      },
      {
        name: "سيف",
        quote: "تجربة سفاري الصحراء كانت رائعة! المرشدون المحترفون والبرنامج المُخطط جيدًا جعلوا رحلتنا لا تُنسى.",
        rating: 5,
      },
      {
        name: "ياسين",
        quote: "من البداية إلى النهاية، كل شيء كان مُرتبًا بشكل مثالي. شعرنا بالأمان والرعاية الجيدة خلال مغامرتنا في السعودية.",
        rating: 5,
      },
    ],
    zh: [
      {
        name: "正义之士",
        quote: "我们前往哈伊勒山脉的旅行是一次美妙的体验！一切组织得井井有条，工作人员非常热心。",
        rating: 5,
      },
      {
        name: "愉悦之客",
        quote: "与你们的团队一同游览沙特阿拉伯，体验与众不同，前所未见。感谢山丘与沙地团队。",
        rating: 5,
      },
      {
        name: "永恒回忆",
        quote: "特别感谢奥马尔对冒险旅程每一个细节的关注，以及协作团队的努力；真正独一无二的体验。",
        rating: 5,
      },
      {
        name: "满意之宾",
        quote: "卓越的服务，难忘的回忆。在整个旅途中，对细节的关注和对客户的关怀都无与伦比。",
        rating: 5,
      },
      {
        name: "冒险家",
        quote: "沙漠探险之旅令人叹为观止！专业的向导和精心规划的行程让我们的旅行难以忘怀。",
        rating: 5,
      },
      {
        name: "探索者",
        quote: "从始至终，一切都安排得完美无瑕。在整个沙特冒险期间，我们感到安全且备受关照。",
        rating: 5,
      },
    ],
  };

  const testimonials = testimonialsContent[lang] || testimonialsContent.en;
  const slidesToShow = 4;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (testimonials.length - slidesToShow + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? testimonials.length - slidesToShow : prev - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const visibleTestimonials = testimonials.slice(currentSlide, currentSlide + slidesToShow);

  return (
    <section className="testimonials-section" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="container">
    <div className="testimonials-header text-center mb-5">
  <h2 className="section-title">
    {lang === "ar"
      ? "آراء عملائنا"
      : lang === "zh"
      ? "客户评价"
      : "What Our Customers Say"}
  </h2>
  <p className="section-subtitle">
    {lang === "ar"
      ? "تجارب حقيقية من مسافرينا السعداء"
      : lang === "zh"
      ? "来自我们快乐旅行者的真实体验"
      : "Real experiences from our happy travelers"}
  </p>
</div>

        <div className="testimonials-slider">
          <div className="testimonials-container">
            {visibleTestimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-item">
                <div className="testimonial-card">
                  <p className="evaluate">{testimonial.quote}</p>
                  
                  <div className="info-content">
                    <div className="client-info">
                      <div className="name-job">
                        <h6 className="name">{testimonial.name}</h6>
                      </div>
                    </div>
                    
                    <div className="ova-rating">
                      <div className="star-rating" title="5/5">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <i key={i} className="star-full">
                            <FaStar />
                          </i>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Navigation Arrows */}
          <div className="slider-nav">
            <button className="nav-btn prev" onClick={prevSlide} aria-label="Previous">
              {lang === "ar" ? <FaAngleRight /> : <FaAngleLeft />}
            </button>
            <button className="nav-btn next" onClick={nextSlide} aria-label="Next">
              {lang === "ar" ? <FaAngleLeft /> : <FaAngleRight />}
            </button>
          </div>
          {/* Dots */}
          <div className="slider-dots">
            {Array.from({ length: testimonials.length - slidesToShow + 1 }).map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              >
                <span></span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .testimonials-section {
          padding: 80px 0;
          background: #FAF6F0;
          font-family: 'Tajawal', sans-serif;
        }

        .section-title {
          color: #1C0052;
          font-weight: 800;
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          color: #555;
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .testimonials-slider {
          position: relative;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .testimonials-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 2rem;
        }

        .testimonial-item {
          min-width: 0;
        }

        .testimonial-card {
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          text-align: center;
          transition: all 0.3s ease;
          height: 100%;
          border: 1px solid rgba(28, 0, 82, 0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .testimonial-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(28, 0, 82, 0.1);
          border-color: rgba(232, 93, 31, 0.3);
        }

        .evaluate {
          color: #555;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-style: italic;
          flex-grow: 1;
        }

        .info-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.8rem;
        }

        .name-job h6 {
          color: #E85D1F;
          font-weight: 700;
          font-size: 1rem;
          margin: 0;
          text-transform: capitalize;
        }

        .ova-rating {
          display: flex;
          justify-content: center;
        }

        .star-rating {
          display: flex;
          gap: 2px;
        }

        .star-full {
          color: #FFC60B;
          font-size: 1rem;
        }

        /* Navigation */
        .slider-nav {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .nav-btn {
          background: #1C0052;
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .nav-btn:hover {
          background: #E85D1F;
          transform: scale(1.1);
        }

        /* Dots */
        .slider-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }

        .dot {
          background: #d1d5db;
          border: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dot.active {
          background: #E85D1F;
          transform: scale(1.2);
        }

        .dot span {
          display: none;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .testimonials-container {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 991px) {
          .testimonials-container {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .testimonial-card {
            padding: 1.5rem;
          }
        }

        @media (max-width: 767px) {
          .testimonials-container {
            grid-template-columns: 1fr;
          }
          
          .section-title {
            font-size: 2rem;
          }
          
          .testimonials-section {
            padding: 60px 0;
          }
          
          .testimonial-card {
            padding: 1.5rem;
          }
        }

        @media (max-width: 575px) {
          .section-title {
            font-size: 1.8rem;
          }
          
          .evaluate {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </section>
  );
}