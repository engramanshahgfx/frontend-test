"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";

export default function ValueSlider({ lang = "en" }) {
  const isRTL = lang === "ar";

  const slides = [
    {
      title: {
        en: "Building Construction",
        ar: "إنشاء المباني",
        zh: "建筑施工",
      },
      subtitle: {
        en: "Quality Construction for Residential & Commercial Projects",
        ar: "بناء بجودة عالية للمشاريع السكنية والتجارية",
        zh: "为住宅和商业项目提供高质量施工",
      },
      description: {
        en: "We specialize in constructing residential, government, educational, and healthcare buildings with global quality standards, ensuring durability and functionality.",
        ar: "نتخصص في إنشاء المباني السكنية والحكومية والتعليمية والصحية بمعايير جودة عالمية، مع ضمان المتانة والوظائفية.",
        zh: "我们专注于按照全球质量标准建造住宅、政府、教育和医疗建筑，确保耐用性和功能性。",
      },
      features: [
        {
          en: "Residential & commercial buildings",
          ar: "المباني السكنية والتجارية",
          zh: "住宅和商业建筑",
        },
        {
          en: "Government & educational facilities",
          ar: "المرافق الحكومية والتعليمية",
          zh: "政府教育设施",
        },
        {
          en: "Healthcare & hospitality projects",
          ar: "مشاريع الرعاية الصحية والضيافة",
          zh: "医疗和酒店项目",
        },
        {
          en: "Quality assurance & compliance",
          ar: "ضمان الجودة والامتثال",
          zh: "质量保证与合规",
        },
      ],
      image: "/services/BC.png",
    },
    {
      title: {
        en: "Infrastructure Development",
        ar: "تطوير البنية التحتية",
        zh: "基础设施开发",
      },
      subtitle: {
        en: "Comprehensive Road Works & Urban Development",
        ar: "أعمال الطرق الشاملة والتطوير الحضري",
        zh: "全面的道路工程和城市发展",
      },
      description: {
        en: "We provide complete infrastructure solutions including road construction, traffic systems, lighting, and urban development projects with modern engineering techniques.",
        ar: "نوفر حلول بنية تحتية كاملة تشمل إنشاء الطرق، أنظمة المرور، الإنارة، ومشاريع التطوير الحضري بتقنيات هندسية حديثة.",
        zh: "我们提供完整的基础设施解决方案，包括道路建设、交通系统、照明和城市发展项目，采用现代工程技术。",
      },
      features: [
        {
          en: "Road construction & paving",
          ar: "إنشاء الطرق والتعبيد",
          zh: "道路建设与铺设",
        },
        {
          en: "Traffic signals & systems",
          ar: "الإشارات المرورية والأنظمة",
          zh: "交通信号与系统",
        },
        {
          en: "Street lighting & utilities",
          ar: "إنارة الشوارع والمرافق",
          zh: "街道照明与公用设施",
        },
        {
          en: "Urban planning & development",
          ar: "التخطيط الحضري والتطوير",
          zh: "城市规划与发展",
        },
      ],
      image: "/services/MO.png",
    },
    {
      title: {
        en: "Finishing Works",
        ar: "أعمال التشطيب",
        zh: "装修工程",
      },
      subtitle: {
        en: "Premium Interior & Exterior Finishing Solutions",
        ar: "حلول تشطيب داخلية وخارجية فاخرة",
        zh: "优质室内外装修解决方案",
      },
      description: {
        en: "We deliver high-quality finishing works including modern paints, flooring, gypsum board installations, cladding, and comprehensive interior design solutions.",
        ar: "نقدم أعمال تشطيب عالية الجودة تشمل الدهانات الحديثة، الأرضيات، تركيب الجبس بورد، الكلادينج، وحلول التصميم الداخلي الشاملة.",
        zh: "我们提供高质量的装修工程，包括现代涂料、地板、石膏板安装、外墙覆层和全面的室内设计解决方案。",
      },
      features: [
        {
          en: "Interior & exterior painting",
          ar: "الدهانات الداخلية والخارجية",
          zh: "室内外涂装",
        },
        {
          en: "Flooring & wall finishes",
          ar: "تشطيبات الأرضيات والجدران",
          zh: "地板和墙面装修",
        },
        {
          en: "Gypsum board & false ceilings",
          ar: "الجبس بورد والأسقف المعلقة",
          zh: "石膏板和假天花",
        },
        {
          en: "Cladding & facade works",
          ar: "أعمال الكلادينج والواجهات",
          zh: "外墙覆层和立面工程",
        },
      ],
      image: "/services/FW.png",
    },
    {
      title: {
        en: "HVAC Systems",
        ar: "أنظمة التكييف",
        zh: "暖通空调系统",
      },
      subtitle: {
        en: "Modern Climate Control Solutions",
        ar: "حلول التحكم المناخي الحديثة",
        zh: "现代气候控制解决方案",
      },
      description: {
        en: "We install and maintain advanced HVAC systems that ensure comfortable, energy-efficient environments for residential, commercial, and industrial spaces.",
        ar: "نقوم بتركيب وصيانة أنظمة التكييف المتقدمة التي تضمن بيئات مريحة وموفرة للطاقة للمساحات السكنية والتجارية والصناعية.",
        zh: "我们安装和维护先进的暖通空调系统，为住宅、商业和工业空间提供舒适、节能的环境。",
      },
      features: [
        {
          en: "Central air conditioning",
          ar: "التكييف المركزي",
          zh: "中央空调",
        },
        {
          en: "Energy-efficient systems",
          ar: "أنظمة موفرة للطاقة",
          zh: "节能系统",
        },
        {
          en: "Ventilation & air quality",
          ar: "التهوية وجودة الهواء",
          zh: "通风与空气质量",
        },
        {
          en: "Maintenance & servicing",
          ar: "الصيانة والخدمة",
          zh: "维护与服务",
        },
      ],
      image: "/services/HVC.png",
    },
    {
      title: {
        en: "Landscaping & Sports Facilities",
        ar: "التشجير والمرافق الرياضية",
        zh: "景观美化和体育设施",
      },
      subtitle: {
        en: "Creating Beautiful Outdoor Spaces",
        ar: "إنشاء مساحات خارجية جميلة",
        zh: "创造美丽的户外空间",
      },
      description: {
        en: "We design and implement stunning landscapes, sports facilities, and recreational areas including gardens, playgrounds, and athletic fields with natural and artificial turf.",
        ar: "نصمم وننفذ مناظر طبيعية خلابة ومرافق رياضية ومساحات ترفيهية تشمل الحدائق، الملاعب، والمجالات الرياضية بالعشب الطبيعي والصناعي.",
        zh: "我们设计和实施令人惊叹的景观、体育设施和休闲区域，包括花园、游乐场和采用天然及人造草坪的体育场地。",
      },
      features: [
        {
          en: "Garden design & implementation",
          ar: "تصميم وتنفيذ الحدائق",
          zh: "花园设计与实施",
        },
        {
          en: "Sports fields & playgrounds",
          ar: "المجالات الرياضية والملاعب",
          zh: "运动场地和游乐场",
        },
        {
          en: "Natural & artificial turf",
          ar: "العشب الطبيعي والصناعي",
          zh: "天然和人造草坪",
        },
        {
          en: "Irrigation systems",
          ar: "أنظمة الري",
          zh: "灌溉系统",
        },
      ],
      image: "/services/LS.png",
    },
    {
      title: {
        en: "Maintenance & Operation",
        ar: "الصيانة والتشغيل",
        zh: "维护与运营",
      },
      subtitle: {
        en: "Comprehensive Facility Management",
        ar: "إدارة المرافق الشاملة",
        zh: "全面的设施管理",
      },
      description: {
        en: "We provide complete building maintenance, operation, and cleaning services with specialized teams and modern equipment to ensure optimal facility performance.",
        ar: "نوفر خدمات صيانة وتشغيل وتنظيف المباني الكاملة بفرق متخصصة ومعدات حديثة لضمان الأداء الأمثل للمرافق.",
        zh: "我们提供完整的建筑维护、运营和清洁服务，拥有专业团队和现代设备，确保设施的最佳性能。",
      },
      features: [
        {
          en: "Building maintenance & repairs",
          ar: "صيانة وإصلاح المباني",
          zh: "建筑维护与维修",
        },
        {
          en: "Electrical & plumbing services",
          ar: "خدمات الكهرباء والسباكة",
          zh: "电气和管道服务",
        },
        {
          en: "Cleaning & sanitation",
          ar: "التنظيف والتعقيم",
          zh: "清洁与卫生",
        },
        {
          en: "Facility management",
          ar: "إدارة المرافق",
          zh: "设施管理",
        },
      ],
      image: "/services/MO.png",
    },
  ];

  const content = {
    heading: {
      en: "Our Core Services",
      ar: "خدماتنا الأساسية",
      zh: "我们的核心服务",
    },
    subheading: {
      en: "Comprehensive contracting and construction solutions for commercial, industrial, and residential applications",
      ar: "حلول مقاولات وإنشاءات شاملة للتطبيقات التجارية والصناعية والسكنية",
      zh: "为商业、工业和住宅应用提供全面的承包和施工解决方案",
    },
  };
  return (
    <section className="py-16 bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {/* Main Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {content.heading[lang]}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.subheading[lang]}
          </p>
        </div>

        <div className="ValueProposition_container">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination",
            }}
            autoplay={{ delay: 5000 }}
            loop={true}
            className="StackedSlider_container ValueProposition_slideContainer"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {slides.map((slide, index) => (
              <SwiperSlide
                key={index}
                className="StackedSlider_slide StackedSlider_baseSlide"
              >
                <div className={`ValueProposition_slideContent ${isRTL ? 'ValueProposition_slideContentRTL' : ''}`}>
                  {/* Content - Order changes based on RTL */}
                  <div className="ValueProposition_left">
                    <div className="ValueProposition_badge">
                      {slide.title[lang]}
                    </div>
                    <h2 className="sectionTitle">{slide.subtitle[lang]}</h2>
                    <p className="sectionDescription">
                      {slide.description[lang]}
                    </p>
                    <div className={`ValueProposition_featuresRow ${isRTL ? 'ValueProposition_featuresRowRTL' : ''}`}>
                      {slide.features.map((feature, i) => (
                        <div key={i} className={`ValueProposition_featureItem ${isRTL ? 'ValueProposition_featureItemRTL' : ''}`}>
                          <div className="featureIcon">✓</div>
                          <div className="ValueProposition_featureSubtitle">
                            {feature[lang]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Image - Order changes based on RTL */}
                  <div className="ValueProposition_right">
                    <Image
                      src={slide.image}
                      alt={slide.title[lang]}
                      fill
                      className="ValueProposition_image"
                      priority={index === 0}
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}

            {/* Navigation Arrows */}
            <div className={`StackedSlider_arrows ${isRTL ? 'StackedSlider_arrowsRTL' : ''}`}>
              <button
                className="swiper-button-prev StackedSlider_arrowButton StackedSlider_arrowLeft"
                type="button"
              >
                {isRTL ? (
                  // Right arrow for RTL (next slide)
                  <svg
                    fill="none"
                    height="28"
                    viewBox="0 0 42 42"
                    width="28"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 6C12.716 6 6 12.716 6 21C6 29.284 12.716 36 21 36C29.284 36 36 29.284 36 21C36 12.716 29.284 6 21 6ZM30 21V21.004C30 21.1345 29.9742 21.2637 29.9241 21.3841C29.874 21.5046 29.8005 21.614 29.708 21.706L23.708 27.706C23.5194 27.8882 23.2668 27.989 23.0046 27.9867C22.7424 27.9844 22.4916 27.8792 22.3062 27.6938C22.1208 27.5084 22.0156 27.2576 22.0133 26.9954C22.011 26.7332 22.1118 26.4806 22.294 26.292L26.586 22H11C10.7348 22 10.4804 21.8946 10.2929 21.7071C10.1054 21.5196 10 21.2652 10 21C10 20.7348 10.1054 20.4804 10.2929 20.2929C10.4804 20.1054 10.7348 20 11 20H26.586L22.292 15.708C22.1098 15.5194 22.009 15.2668 22.0113 15.0046C22.0136 14.7424 22.1188 14.4916 22.3042 14.3062C22.4896 14.1208 22.7404 14.0156 23.0026 14.0133C23.2648 14.011 23.5174 14.1118 23.706 14.294L29.706 20.294C29.7987 20.3866 29.8722 20.4968 29.922 20.618C29.9735 20.7388 30 20.8687 30 21Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                ) : (
                  // Left arrow for LTR (previous slide)
                  <svg
                    fill="none"
                    height="28"
                    viewBox="0 0 42 42"
                    width="28"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 6C29.284 6 36 12.716 36 21C36 29.284 29.284 36 21 36C12.716 36 6 29.284 6 21C6 12.716 12.716 6 21 6ZM12 21V21.004C12 21.1345 12.0258 21.2637 12.0759 21.3841C12.126 21.5046 12.1995 21.614 12.292 21.706L18.292 27.706C18.4806 27.8882 18.7332 27.989 18.9954 27.9867C19.2576 27.9844 19.5084 27.8792 19.6938 27.6938C19.8792 27.5084 19.9844 27.2576 19.9867 26.9954C19.989 26.7332 19.8882 26.4806 19.706 26.292L15.414 22H31C31.2652 22 31.5196 21.8946 31.7071 21.7071C31.8946 21.5196 32 21.2652 32 21C32 20.7348 31.8946 20.4804 31.7071 20.2929C31.5196 20.1054 31.2652 20 31 20H15.414L19.708 15.708C19.8902 15.5194 19.991 15.2668 19.9887 15.0046C19.9864 14.7424 19.8812 14.4916 19.6958 14.3062C19.5104 14.1208 19.2596 14.0156 18.9974 14.0133C18.7352 14.011 18.4826 14.1118 18.294 14.294L12.294 20.294C12.2013 20.3866 12.1278 20.4968 12.078 20.618C12.0265 20.7388 12 20.8687 12 21Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                )}
              </button>
              <button
                className="swiper-button-next StackedSlider_arrowButton StackedSlider_arrowRight"
                type="button"
              >
                {isRTL ? (
                  // Left arrow for RTL (previous slide)
                  <svg
                    fill="none"
                    height="28"
                    viewBox="0 0 42 42"
                    width="28"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 6C29.284 6 36 12.716 36 21C36 29.284 29.284 36 21 36C12.716 36 6 29.284 6 21C6 12.716 12.716 6 21 6ZM12 21V21.004C12 21.1345 12.0258 21.2637 12.0759 21.3841C12.126 21.5046 12.1995 21.614 12.292 21.706L18.292 27.706C18.4806 27.8882 18.7332 27.989 18.9954 27.9867C19.2576 27.9844 19.5084 27.8792 19.6938 27.6938C19.8792 27.5084 19.9844 27.2576 19.9867 26.9954C19.989 26.7332 19.8882 26.4806 19.706 26.292L15.414 22H31C31.2652 22 31.5196 21.8946 31.7071 21.7071C31.8946 21.5196 32 21.2652 32 21C32 20.7348 31.8946 20.4804 31.7071 20.2929C31.5196 20.1054 31.2652 20 31 20H15.414L19.708 15.708C19.8902 15.5194 19.991 15.2668 19.9887 15.0046C19.9864 14.7424 19.8812 14.4916 19.6958 14.3062C19.5104 14.1208 19.2596 14.0156 18.9974 14.0133C18.7352 14.011 18.4826 14.1118 18.294 14.294L12.294 20.294C12.2013 20.3866 12.1278 20.4968 12.078 20.618C12.0265 20.7388 12 20.8687 12 21Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                ) : (
                  // Right arrow for LTR (next slide)
                  <svg
                    fill="none"
                    height="28"
                    viewBox="0 0 42 42"
                    width="28"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 6C12.716 6 6 12.716 6 21C6 29.284 12.716 36 21 36C29.284 36 36 29.284 36 21C36 12.716 29.284 6 21 6ZM30 21V21.004C30 21.1345 29.9742 21.2637 29.9241 21.3841C29.874 21.5046 29.8005 21.614 29.708 21.706L23.708 27.706C23.5194 27.8882 23.2668 27.989 23.0046 27.9867C22.7424 27.9844 22.4916 27.8792 22.3062 27.6938C22.1208 27.5084 22.0156 27.2576 22.0133 26.9954C22.011 26.7332 22.1118 26.4806 22.294 26.292L26.586 22H11C10.7348 22 10.4804 21.8946 10.2929 21.7071C10.1054 21.5196 10 21.2652 10 21C10 20.7348 10.1054 20.4804 10.2929 20.2929C10.4804 20.1054 10.7348 20 11 20H26.586L22.292 15.708C22.1098 15.5194 22.009 15.2668 22.0113 15.0046C22.0136 14.7424 22.1188 14.4916 22.3042 14.3062C22.4896 14.1208 22.7404 14.0156 23.0026 14.0133C23.2648 14.011 23.5174 14.1118 23.706 14.294L29.706 20.294C29.7987 20.3866 29.8722 20.4968 29.922 20.618C29.9735 20.7388 30 20.8687 30 21Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                )}
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="swiper-pagination StackedSlider_dots"></div>
          </Swiper>
        </div>
      </div>

      <style jsx>{`
        .ValueProposition_container {
          position: relative;
        }

        .StackedSlider_container {
          position: relative;
        }

        .ValueProposition_slideContainer {
          margin: 0 auto;
        }

        .StackedSlider_slide {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .StackedSlider_baseSlide {
          min-height: 600px;
        }

        .ValueProposition_slideContent {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* RTL layout - reverse the grid columns */
        .ValueProposition_slideContentRTL {
          grid-template-columns: 1fr 1fr;
          direction: rtl;
        }

        .ValueProposition_left {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .ValueProposition_badge {
          background: #f3f4f6;
          color: #374151;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: inline-block;
          width: fit-content;
        }

        .sectionTitle {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          color: #111827;
          margin: 0;
        }

        .sectionDescription {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #6b7280;
          margin: 0;
        }

        .ValueProposition_featuresRow {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1rem;
        }

        .ValueProposition_featureItem {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        /* RTL styles for features */
        .ValueProposition_featuresRowRTL {
          direction: rtl;
        }

        .ValueProposition_featureItemRTL {
          flex-direction: row-reverse;
          text-align: right;
        }

        .featureIcon {
          background: #10b981;
          color: white;
          border-radius: 50%;
          width: 1.5rem;
          height: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .ValueProposition_featureSubtitle {
          font-size: 0.95rem;
          color: #374151;
          line-height: 1.4;
          font-weight: 500;
        }

        .ValueProposition_right {
          position: relative;
          width: 100%;
          height: 500px;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .ValueProposition_image {
          object-fit: cover;
          border-radius: 1rem;
        }

        /* Navigation Arrows */
        .StackedSlider_arrows {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          transform: translateY(-50%);
          display: flex;
          justify-content: space-between;
          padding: 0 2rem;
          z-index: 10;
          pointer-events: none;
        }

        .StackedSlider_arrowButton {
          background: #3b73e3ff;
          border: 1px solid #e5e7eb;
          border-radius: 50%;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #000000ff;
          pointer-events: all;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .StackedSlider_arrowButton:hover {
          background: #f9fafb;
          border-color: #d1d5db;
          transform: scale(1.05);
        }

        .StackedSlider_dots {
          display: flex;
          gap: 0.5rem;
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .swiper-pagination-bullet {
          width: 0.5rem;
          height: 0.5rem;
          background: #d1d5db;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
        }

        .swiper-pagination-bullet-active {
          background: #374151;
          transform: scale(1.2);
        }

        /* RTL Support */
        .StackedSlider_arrowsRTL {
          flex-direction: row-reverse;
        }

        /* Text alignment for RTL */
        [dir="rtl"] .sectionTitle,
        [dir="rtl"] .sectionDescription,
        [dir="rtl"] .ValueProposition_featureSubtitle,
        [dir="rtl"] .ValueProposition_badge {
          text-align: right;
        }

        [dir="rtl"] .ValueProposition_featuresRow {
          direction: rtl;
        }

        [dir="rtl"] .ValueProposition_featureItem {
          flex-direction: row-reverse;
          text-align: right;
        }

        /* Swiper overrides */
        .swiper {
          padding-bottom: 6rem;
        }

        .swiper-button-disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: scale(1) !important;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .StackedSlider_arrows {
            padding: 0 1rem;
          }

          .StackedSlider_arrowButton {
            width: 2.5rem;
            height: 2.5rem;
          }

          .ValueProposition_slideContent {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .ValueProposition_slideContentRTL {
            grid-template-columns: 1fr;
            direction: rtl;
          }

          .sectionTitle {
            font-size: 2rem;
          }

          .sectionDescription {
            font-size: 1rem;
          }

          .ValueProposition_featuresRow {
            grid-template-columns: 1fr;
          }

          .ValueProposition_right {
            height: 300px;
            order: -1;
          }

          /* Reset feature item direction for mobile RTL */
          [dir="rtl"] .ValueProposition_featureItem {
            flex-direction: row;
            text-align: left;
          }

          .ValueProposition_featureItemRTL {
            flex-direction: row;
            text-align: left;
          }
        }

        @media (max-width: 480px) {
          .sectionTitle {
            font-size: 1.75rem;
          }

          .sectionDescription {
            font-size: 0.95rem;
          }

          .ValueProposition_badge {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }
        }
      `}</style>
    </section>
  );
}