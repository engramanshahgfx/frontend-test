"use client";

import React from "react";
import {
  FaGavel,
  FaExclamationTriangle,
  FaCalendarTimes,
  FaFileContract,
  FaShieldAlt,
  FaEnvelopeOpenText,
  FaMoneyBillWave,
  FaCreditCard,
  FaUndoAlt,
  FaClock,
  FaBan,
  FaCheckCircle,
  FaFileSignature,
} from "react-icons/fa";

export default function RefundContent({ lang }) {
 const content = {
  ar: {
    heroTitle: "سياسة الاسترداد المالي",
    heroSubtitle: "شركة التلال والرمال لتنظيم الرحلات السياحية",
    intro: "توضح هذه الصفحة سياسة الاسترداد المالي الخاصة بشركة التلال والرمال لتنظيم الرحلات السياحية وفقاً لأنظمة وزارة السياحة في المملكة العربية السعودية.",
    warning: "يُعد إتمام الحجز أو استخدام الموقع موافقة كاملة على سياسة الاسترداد المالي الموضحة أدناه.",
    sections: [
      {
        id: 1,
        title: "شروط الاسترداد",
        icon: <FaMoneyBillWave size={28} />,
        points: [
          "يُجرى الاسترداد بواسطة وسيلة الدفع الأصلية عند الإمكان.",
          "قد تُطبق رسوم إدارية أو شروط استرداد تختلف بحسب مزود الخدمة ونوع الحجز.",
          "الرسوم غير القابلة للاسترداد تُذكر صراحةً في تفاصيل الحجز أو التذكرة.",
          "تحتفظ الشركة بحق خصم التكاليف الفعلية التي تكبدتها وفقاً لسياسات الموردين.",
        ],
      },
      {
        id: 2,
        title: "مدة معالجة الاسترداد",
        icon: <FaClock size={28} />,
        points: [
          "تتم مراجعة طلبات الاسترداد خلال 3 أيام عمل.",
          "يتم تنفيذ الاسترداد المعتمد خلال 14 يوم عمل.",
          "قد تستغرق البنوك من 7 إلى 30 يوم عمل إضافية.",
          "سيتم إشعار العميل بحالة الطلب عبر البريد الإلكتروني.",
        ],
      },
      {
        id: 3,
        title: "حالات الاسترداد الكامل",
        icon: <FaCheckCircle size={28} />,
        points: [
          "إلغاء الخدمة من قبل الشركة لأسباب تشغيلية.",
          "عدم توفر الخدمة المحجوزة في الموعد المحدد.",
          "أخطاء نظام الحجز المزدوج من قبل الشركة.",
          "إلغاء الحجز خلال 24 ساعة من تأكيد الحجز (للبعض).",
        ],
      },
      {
        id: 4,
        title: "حالات الاسترداد الجزئي",
        icon: <FaUndoAlt size={28} />,
        points: [
          "قد يتوفر استرداد جزئي وفق شروط مزود الخدمة ونوع الحجز.",
          "نوصي بالرجوع إلى شروط الحجز أو التذكرة لمعرفة نسب الاسترداد الدقيقة.",
          "في حال وجود فروقات أو رسوم، سيتم إعلام العميل أثناء إجراءات الاسترداد.",
        ],
      },
      {
        id: 5,
        title: "الحالات غير القابلة للاسترداد",
        icon: <FaBan size={28} />,
        points: [
          "عدم الحضور للخدمة في الموعد المحدد (No Show).",
          "الخدمات والعروض الخاصة المصنفة غير قابلة للاسترداد.",
          "إدخال بيانات أو مستندات غير صحيحة من قبل العميل.",
          "مخالفة شروط وأحكام مزودي الخدمات.",
          "الطلبات الملغاة بسبب سوء الأحوال الجوية (حسب السياسة).",
        ],
      },
      {
        id: 6,
        title: "طرق الاسترداد",
        icon: <FaCreditCard size={28} />,
        points: [
          "الاسترداد عبر البطاقة الائتمانية: عادة 7-14 يوم عمل حسب البنك.",
          "الاسترداد عبر التحويل البنكي: عادة 5-10 أيام عمل.",
          "الاسترداد عبر المحفظة الرقمية: عادة 3-7 أيام عمل.",
          "رصيد في حساب العميل بالموقع: قد يكون فوريًا في بعض الحالات.",
        ],
      },
      {
        id: 7,
        title: "إجراءات طلب الاسترداد",
        icon: <FaFileContract size={28} />,
        points: [
          "تقديم طلب خطي عبر البريد الإلكتروني أو خدمة العملاء.",
          "إرفاق رقم الحجز وبيانات الدفع.",
          "انتظار تأكيد الاسترداد من قسم الحسابات.",
          "الاسترداد خلال المدة المحددة حسب طريقة الدفع.",
        ],
      },
      {
        id: 8,
        title: "القوة القاهرة",
        icon: <FaShieldAlt size={28} />,
        points: [
          "في حالات القوة القاهرة يتم تطبيق سياسات الموردين.",
          "قد يتم استرداد المبلغ كرصيد للعميل بدلاً من استرداد نقدي.",
          "تشمل القوة القاهرة: الكوارث الطبيعية، الأوبئة، القرارات الحكومية.",
          "الشركة غير ملزمة بتعويض إضافي خارج نطاق السياسة.",
        ],
      },
      {
        id: 9,
        title: "التواصل",
        icon: <FaEnvelopeOpenText size={28} />,
        points: [
          "البريد الإلكتروني: info@tilalr.com",
          "رقم خدمة العملاء: 966547305060",
          "الواتساب الرسمي: 966547305060",
          "ساعات العمل: الأحد إلى الخميس 9ص - 6م",
        ],
      },
      {
        id: 10,
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
    heroTitle: "Financial Refund Policy",
    heroSubtitle: "Tilal Al Rimal Tourism Company",
    intro: "This page explains the financial refund policy of Tilal Al Rimal Tourism Company in accordance with the regulations of the Ministry of Tourism of the Kingdom of Saudi Arabia.",
    warning: "Completing a booking or using the website constitutes full acceptance of this Refund Policy.",
    sections: [
      {
        id: 1,
        title: "Refund Terms",
        icon: <FaMoneyBillWave size={28} />,
        points: [
          "Refunds are issued using the original payment method.",
          "5% administrative fee applies on cancelled bookings.",
          "Additional service fees are non-refundable after use.",
          "The Company may deduct actual costs incurred.",
        ],
      },
      {
        id: 2,
        title: "Refund Processing Time",
        icon: <FaClock size={28} />,
        points: [
          "Refund requests are reviewed within 3 business days.",
          "Approved refunds are processed within 14 business days.",
          "Banks may take an additional 7-30 business days.",
          "Customers will be notified via email about request status.",
        ],
      },
      {
        id: 3,
        title: "Full Refund Cases",
        icon: <FaCheckCircle size={28} />,
        points: [
          "Service cancellation by the Company for operational reasons.",
          "Booked service unavailable at scheduled time.",
          "Double booking errors caused by the Company.",
          "Cancellation within 24 hours of booking confirmation (for some services).",
        ],
      },
      {
        id: 4,
        title: "Partial Refund Cases",
        icon: <FaUndoAlt size={28} />,
        points: [
          "Cancellation 7 days before service: 75% refund",
          "Cancellation 3 days before service: 50% refund",
          "Cancellation 24 hours before service: 25% refund",
          "Cancellation after service date: No refund",
        ],
      },
      {
        id: 5,
        title: "Non-Refundable Cases",
        icon: <FaBan size={28} />,
        points: [
          "No-show for scheduled service.",
          "Special promotions and services marked non-refundable.",
          "Incorrect information or documents provided by customer.",
          "Violation of supplier terms and conditions.",
          "Cancellations due to weather conditions (subject to policy).",
        ],
      },
      {
        id: 6,
        title: "Refund Methods",
        icon: <FaCreditCard size={28} />,
        points: [
          "Credit card refund: 7-14 business days.",
          "Bank transfer refund: 5-10 business days.",
          "Digital wallet refund: 3-7 business days.",
          "Store credit on website: Instant.",
        ],
      },
      {
        id: 7,
        title: "Refund Request Procedure",
        icon: <FaFileContract size={28} />,
        points: [
          "Submit written request via email or customer service.",
          "Attach booking number and payment details.",
          "Wait for refund confirmation from accounts department.",
          "Refund processed within specified time based on payment method.",
        ],
      },
      {
        id: 8,
        title: "Force Majeure",
        icon: <FaShieldAlt size={28} />,
        points: [
          "Supplier policies apply during force majeure events.",
          "Amount may be refunded as store credit instead of cash.",
          "Force majeure includes: natural disasters, pandemics, government decisions.",
          "Company has no additional compensation obligations.",
        ],
      },
      {
        id: 9,
        title: "Contact Information",
        icon: <FaEnvelopeOpenText size={28} />,
        points: [
          "Email: info@tilalr.com",
          "Customer Service: 966547305060",
          "Official WhatsApp: 966547305060",
          "Working Hours: Sunday-Thursday 9AM-6PM",
        ],
      },
      {
        id: 10,
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
              <FaMoneyBillWave size={50} />
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