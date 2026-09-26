"use client";

import React from "react";
import {
  FaGavel,
  FaExclamationTriangle,
  FaCalendarTimes,
  FaFileContract,
  FaShieldAlt,
  FaEnvelopeOpenText,
  FaPlane,
  FaHotel,
  FaUmbrellaBeach,
  FaTimesCircle,
  FaClock,
  FaBan,
  FaFileSignature,
} from "react-icons/fa";

export default function CancellationContent({ lang }) {
 const content = {
  ar: {
    heroTitle: "سياسة الإلغاء",
    heroSubtitle: "شركة التلال والرمال لتنظيم الرحلات السياحية",
    intro: "توضح هذه الصفحة سياسة الإلغاء الخاصة بشركة التلال والرمال لتنظيم الرحلات السياحية وفقاً لأنظمة وزارة السياحة في المملكة العربية السعودية.",
    warning: "يُعد إتمام الحجز أو استخدام الموقع موافقة كاملة على سياسة الإلغاء الموضحة أدناه.",
    sections: [
      {
        id: 1,
        title: "طلبات الإلغاء",
        icon: <FaCalendarTimes size={28} />,
        points: [
          "يمكن للعميل طلب إلغاء الحجز عبر الموقع أو البريد الإلكتروني أو خدمة العملاء.",
          "يجب تقديم طلب الإلغاء قبل موعد الخدمة وفقاً للشروط المحددة.",
          "يتم تسجيل جميع طلبات الإلغاء بتاريخ ووقت الاستلام الرسمي.",
          "تخضع الموافقة على الإلغاء لسياسات مزودي الخدمات المعتمدين.",
        ],
      },
      {
        id: 2,
        title: "رسوم الإلغاء",
        icon: <FaTimesCircle size={28} />,
        points: [
          "تختلف رسوم الإلغاء حسب مزود الخدمة (شركة الطيران، الفندق، الموردين الآخرين) ونوع الحجز.",
          "قد تُطبَّق رسوم إدارية أو شروط عدم الاسترداد بحسب سياسة الجهة المزودة.",
          "يرجى الرجوع إلى شروط الحجز أو التذكرة لمعرفة البنود غير القابلة للاسترداد.",
          "أي مبالغ مذكورة في صفحة الحجز تغلب سياسة مزود الخدمة إذا اختلفت.",
        ],
      },
      {
        id: 3,
        title: "إلغاء حجوزات الطيران",
        icon: <FaPlane size={28} />,
        points: [
          "تخضع جميع تذاكر الطيران لسياسات شركة الطيران الناقلة.",
          "بعض التذاكر الاقتصادية غير قابلة للإلغاء أو الاسترداد.",
          "تذاكر درجة رجال الأعمال قابلة للإلغاء برسوم تصل إلى 25%.",
          "حالات عدم الحضور (No Show) تطبق عليها غرامة كاملة.",
          "يتم إعلام العميل بشروط الإلغاء قبل تأكيد الحجز.",
        ],
      },
      {
        id: 4,
        title: "إلغاء حجوزات الفنادق",
        icon: <FaHotel size={28} />,
        points: [
          "تختلف سياسة الإلغاء حسب الفندق ونوع الحجز.",
          "الحجوزات غير القابلة للاسترداد لا يمكن إلغاؤها بعد التأكيد.",
          "تطبق رسوم ليلة أو ليلتين كحد أدنى لمعظم الفنادق.",
          "الطلبات الخاصة غير قابلة للإلغاء بعد تأكيد الفندق.",
          "الحجوزات الجماعية لها سياسة إلغاء مختلفة.",
        ],
      },
      {
        id: 5,
        title: "إلغاء الرحلات والباقات",
        icon: <FaUmbrellaBeach size={28} />,
        points: [
          "إلغاء الباقة الكاملة يخضع لسياسة البرنامج السياحي.",
          "قد يتم خصم التكاليف الفعلية التي تحملتها الشركة.",
          "يجوز تعديل أو إلغاء بعض البرامج بسبب الظروف التشغيلية.",
          "في حالات الإلغاء من قبل الشركة يتم الاسترداد الكامل.",
        ],
      },
      {
        id: 6,
        title: "إجراءات الإلغاء",
        icon: <FaFileContract size={28} />,
        points: [
          "تقديم طلب إلغاء خطي مع ذكر سبب الإلغاء.",
          "إرفاق رقم الحجز وبيانات التواصل.",
          "انتظار تأكيد الإلغاء من قسم الحجوزات.",
          "تطبق رسوم الإلغاء حسب الفترة المتبقية على الخدمة.",
        ],
      },
      {
        id: 7,
        title: "حالات الإلغاء بدون رسوم",
        icon: <FaBan size={28} />,
        points: [
          "إلغاء الخدمة من قبل الشركة لأسباب تشغيلية.",
          "الكوارث الطبيعية أو حالات الطوارئ العامة.",
          "الوفاة أو المرض الشديد للعميل (مع إثباتات طبية).",
          "أخطاء نظام الحجز المزدوج من قبل الشركة.",
        ],
      },
      {
        id: 8,
        title: "تعديل الحجوزات",
        icon: <FaClock size={28} />,
        points: [
          "يمكن طلب تعديل الحجز قبل مدة زمنية معقولة حسب نوع الخدمة (مثلاً 48 ساعة أو أكثر).",
          "تخضع التعديلات للتوفر الفعلي ولشروط مزود الخدمة؛ قد تترتب رسوم أو فرق سعر.",
          "في بعض الحالات يُعتبر التعديل إلغاءً وإعادة حجز وفقاً لسياسة المزود.",
          "يرجى مراجعة تفاصيل الحجز أو التواصل مع خدمة العملاء لمعرفة التكاليف المحتملة.",
        ],
      },
      {
        id: 9,
        title: "القوة القاهرة",
        icon: <FaShieldAlt size={28} />,
        points: [
          "تشمل القوة القاهرة: الكوارث الطبيعية، الأحوال الجوية، القرارات الحكومية.",
          "قد تشمل أيضاً إغلاق الحدود أو المطارات أو الأزمات الصحية العامة.",
          "تطبق في هذه الحالات سياسات مزودي الخدمات المعنيين.",
          "لا تتحمل الشركة أي التزامات إضافية خارج نطاق تلك السياسات.",
        ],
      },
      {
        id: 10,
        title: "التواصل",
        icon: <FaEnvelopeOpenText size={28} />,
        points: [
          "البريد الإلكتروني: info@tilalr",
          "الموقع الإلكتروني: wwww.tilalr.com",
          "خدمة العملاء: 966547305060",
          "واتساب: 966547305060",
        ],
      },
      {
        id: 11,
        title: "الإقرار والموافقة",
        icon: <FaFileSignature size={28} />,
        points: [
          "باستخدام الموقع أو إتمام أي حجز يقر العميل بموافقته على هذه السياسة.",
          "تعتبر هذه السياسة جزءاً من شروط وأحكام استخدام الموقع.",
          "تحتفظ الشركة بحق تعديل هذه السياسة في أي وقت.",
        ],
      },
    ],
  },
  en: {
    heroTitle: "Cancellation Policy",
    heroSubtitle: "Tilal Al Rimal Tourism Company",
    intro: "This page explains the cancellation policy of Tilal Al Rimal Tourism Company in accordance with the regulations of the Ministry of Tourism of the Kingdom of Saudi Arabia.",
    warning: "Completing a booking or using the website constitutes full acceptance of this Cancellation Policy.",
    sections: [
      {
        id: 1,
        title: "Cancellation Requests",
        icon: <FaCalendarTimes size={28} />,
        points: [
          "Customers may submit cancellation requests through the website, email, or customer service.",
          "Cancellation requests must be submitted before the service date according to specified terms.",
          "All requests are recorded with the official submission date and time.",
          "Approval is subject to supplier policies.",
        ],
      },
      {
        id: 2,
        title: "Cancellation Fees",
        icon: <FaTimesCircle size={28} />,
        points: [
          "Cancellation 30+ days before: 10% fee",
          "Cancellation 14 days before: 25% fee",
          "Cancellation 7 days before: 50% fee",
          "Cancellation 48 hours before: 75% fee",
          "Cancellation 24 hours or less: 100% fee",
        ],
      },
      {
        id: 3,
        title: "Flight Cancellations",
        icon: <FaPlane size={28} />,
        points: [
          "All flight tickets are subject to airline policies.",
          "Some economy tickets are non-cancellable and non-refundable.",
          "Business class tickets are cancellable with up to 25% fee.",
          "No-show cases are subject to full penalty.",
          "Customers are informed of cancellation terms before booking confirmation.",
        ],
      },
      {
        id: 4,
        title: "Hotel Cancellations",
        icon: <FaHotel size={28} />,
        points: [
          "Cancellation policies vary by hotel and booking type.",
          "Non-refundable bookings cannot be cancelled after confirmation.",
          "One or two night fees apply as minimum for most hotels.",
          "Special requests are non-cancellable after hotel confirmation.",
          "Group bookings have different cancellation policies.",
        ],
      },
      {
        id: 5,
        title: "Tour & Package Cancellations",
        icon: <FaUmbrellaBeach size={28} />,
        points: [
          "Full package cancellation is subject to tour program policy.",
          "Actual costs incurred by the company may be deducted.",
          "Some programs may be modified or cancelled due to operational conditions.",
          "Full refund applies when cancellation is initiated by the company.",
        ],
      },
      {
        id: 6,
        title: "Cancellation Procedure",
        icon: <FaFileContract size={28} />,
        points: [
          "Submit written cancellation request with reason.",
          "Attach booking number and contact information.",
          "Wait for cancellation confirmation from bookings department.",
          "Cancellation fees apply based on time remaining until service.",
        ],
      },
      {
        id: 7,
        title: "Fee-Free Cancellation Cases",
        icon: <FaBan size={28} />,
        points: [
          "Service cancellation by the company for operational reasons.",
          "Natural disasters or public emergencies.",
          "Customer death or serious illness (with medical proof).",
          "Double booking errors caused by the company.",
        ],
      },
      {
        id: 8,
        title: "Booking Modifications",
        icon: <FaClock size={28} />,
        points: [
          "Modification requests accepted 48+ hours before service.",
          "Modifications subject to actual service availability.",
          "Additional fees or fare differences may apply.",
          "Company does not guarantee modification of confirmed bookings.",
          "Modification is treated as cancellation and rebooking under applicable policy.",
        ],
      },
      {
        id: 9,
        title: "Force Majeure",
        icon: <FaShieldAlt size={28} />,
        points: [
          "Force majeure includes natural disasters, weather conditions, government decisions.",
          "Border closures, airport closures, and public health emergencies may also apply.",
          "Relevant supplier policies will be followed.",
          "Company bears no additional obligations beyond such policies.",
        ],
      },
      {
        id: 10,
        title: "Contact Information",
        icon: <FaEnvelopeOpenText size={28} />,
        points: [
          "Email: cancellations@altelal-walramal.sa",
          "Website: https://tilalr.com",
          "Customer Service: 920000123",
          "WhatsApp: +966500000000",
        ],
      },
      {
        id: 11,
        title: "Acceptance",
        icon: <FaFileSignature size={28} />,
        points: [
          "By using the website or completing a booking, customers accept this policy.",
          "This policy forms part of the website Terms & Conditions.",
          "The Company reserves the right to update this policy at any time.",
        ],
      },
    ],
  },
};

  const t = content[lang] || content.ar;
  const isRTL = lang === "ar";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="terms-page">
      <section className="terms-hero">
        <div className="hero-overlay"></div>
        <div className="container position-relative z-2">
          <div className="text-center text-white">
            <div className="hero-icon mb-4">
              <FaCalendarTimes size={50} />
            </div>
            <h1 className="display-4 fw-bold mb-3 animate-fade-in">{t.heroTitle}</h1>
            <p className="lead animate-fade-in-delay">{t.heroSubtitle}</p>
          </div>
        </div>
      </section>
      <section className="intro-section" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="container">
          <div className="intro-card">
            <p className="lead text-center m-0">{t.intro}</p>
            <div className="warning-note mt-4">
              <FaExclamationTriangle className="me-2" />
              <strong>{t.warning}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="terms-content py-5" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="container">
          <div className="row g-4">
            {t.sections.map((section) => (
              <div key={section.id} className="col-lg-6">
                <div className="term-card">
                  <div className="term-header">
                    <div className="term-icon">{section.icon}</div>
                    <h3 className="term-title">{section.title}</h3>
                  </div>
                  <ul className="term-points">
                    {section.points.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        .terms-page {
          background: #FAF6F0;
          font-family: "Tajawal", sans-serif;
          min-height: 100vh;
        }

        /* Hero Section */
        .terms-hero {
          position: relative;
          padding: 150px 0 80px;
          background-image: url("/bg.webp"),
            linear-gradient(135deg, #1C0052 0%, #0F0030 100%);
          background-size: cover;
          background-position: center;
          margin-bottom: 50px;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(28, 0, 82, 0.4);
          z-index: 1;
        }

        .hero-icon {
          background: rgba(255, 255, 255, 0.2);
          width: 90px;
          height: 90px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #FFC60B;
        }

        /* Animations */
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        .animate-fade-in-delay {
          animation: fadeIn 0.8s ease-out 0.3s both;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Intro Card */
        .intro-section {
          margin-top: -60px;
          position: relative;
          z-index: 3;
          margin-bottom: 40px;
        }

        .intro-card {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          color: #555;
          border-bottom: 4px solid #E85D1F;
          border: 1px solid rgba(28, 0, 82, 0.06);
        }

        .warning-note {
          background: rgba(232, 93, 31, 0.08);
          border: 1px solid rgba(232, 93, 31, 0.15);
          border-radius: 10px;
          padding: 15px;
          color: #E85D1F;
          display: flex;
          align-items: flex-start;
        }

        /* Terms Cards */
        .term-card {
          background: white;
          border-radius: 10px;
          padding: 30px;
          height: 100%;
          border: 1px solid rgba(28, 0, 82, 0.06);
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }

        .term-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(28, 0, 82, 0.12);
          border-color: rgba(232, 93, 31, 0.3);
        }

        .term-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(28, 0, 82, 0.06);
        }

        .term-icon {
          color: #E85D1F;
          background: rgba(232, 93, 31, 0.08);
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .term-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1C0052;
          margin: 0;
        }

        .term-points {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .term-points li {
          position: relative;
          padding-inline-start: 20px;
          margin-bottom: 12px;
          color: #555;
          line-height: 1.6;
        }

        .term-points li::before {
          content: "•";
          color: #E85D1F;
          font-weight: bold;
          position: absolute;
          inset-inline-start: 0;
          font-size: 1.2em;
          top: -2px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .terms-hero {
            padding: 100px 0 60px;
          }
          .display-4 {
            font-size: 2.2rem;
          }
          .intro-card {
            padding: 25px;
          }
          .term-card {
            padding: 20px;
          }
          .term-header {
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }
          .term-title {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}