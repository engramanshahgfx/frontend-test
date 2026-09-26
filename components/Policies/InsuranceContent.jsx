"use client";

import React from "react";
import {
  FaGavel,
  FaExclamationTriangle,
  FaShieldAlt,
  FaEnvelopeOpenText,
  FaFileSignature,
  FaUmbrellaBeach,
  FaHospital,
  FaSuitcase,
  FaAmbulance,
  FaPlane,
  FaFileInvoiceDollar,
  FaClock,
  FaBan,
  FaUserShield,
  FaPhoneAlt,
} from "react-icons/fa";

export default function InsuranceContent({ lang }) {
 const content = {
  ar: {
    heroTitle: "سياسة التأمين على السفر",
    heroSubtitle: "شركة التلال والرمال لتنظيم الرحلات السياحية",
    intro: "توضح هذه الصفحة سياسة التأمين على السفر الخاصة بشركة التلال والرمال لتنظيم الرحلات السياحية بالتعاون مع شركات التأمين المعتمدة.",
    warning: "يُنصح جميع العملاء بقراءة سياسة التأمين بعناية قبل شراء وثيقة التأمين على السفر.",
    sections: [
      {
        id: 1,
        title: "تغطية التأمين الطبي",
        icon: <FaHospital size={28} />,
        points: [
          "تغطية النفقات الطبية الطارئة حتى 500,000 ريال.",
          "تغطية علاج الأسنان الطارئ حتى 5,000 ريال.",
          "تغطية الإخلاء الطبي والطوارئ.",
          "تغطية الأدوية والفحوصات الطبية الموصوفة.",
          "تغطية المبيت في المستشفى حتى 30 يوم.",
        ],
      },
      {
        id: 2,
        title: "تغطية إلغاء الرحلة",
        icon: <FaPlane size={28} />,
        points: [
          "تغطية تكاليف إلغاء الرحلة لأسباب طبية طارئة.",
          "تغطية إلغاء الرحلة بسبب وفاة قريب من الدرجة الأولى.",
          "تغطية إلغاء الرحلة بسبب الظروف الجوية السيئة.",
          "الحد الأقصى للتغطية 20,000 ريال للرحلة الواحدة.",
          "يجب إلغاء الرحلة قبل 48 ساعة من الموعد المحدد.",
        ],
      },
      {
        id: 3,
        title: "تغطية الأمتعة والمتعلقات الشخصية",
        icon: <FaSuitcase size={28} />,
        points: [
          "تغطية فقدان الأمتعة حتى 10,000 ريال.",
          "تغطية تأخر الأمتعة أكثر من 12 ساعة حتى 2,000 ريال.",
          "تغطية الأجهزة الإلكترونية الشخصية حتى 5,000 ريال.",
          "المستندات الثمينة والنقود غير مشمولة بالتغطية.",
          "تطبق خصومات حسب عمر الأمتعة.",
        ],
      },
      {
        id: 4,
        title: "تغطية تأخير الرحلات",
        icon: <FaClock size={28} />,
        points: [
          "تأخير 4 ساعات فأكثر: تعويض 500 ريال.",
          "تأخير 8 ساعات فأكثر: تعويض 1,000 ريال.",
          "تأخير 12 ساعة فأكثر: تعويض 1,500 ريال.",
          "تأخير 24 ساعة فأكثر: تعويض 2,500 ريال.",
          "الحد الأقصى للتعويض 5,000 ريال سنوياً.",
        ],
      },
      {
        id: 5,
        title: "تغطية المسؤولية المدنية",
        icon: <FaUserShield size={28} />,
        points: [
          "تغطية المسؤولية تجاه الغير حتى 1,000,000 ريال.",
          "تغطية الأضرار المادية التي يسببها المؤمن له.",
          "تغطية الإصابات الجسدية الناتجة عن خطأ المؤمن له.",
          "لا تشمل الأضرار المتعمدة أو تحت تأثير المخدرات.",
        ],
      },
      {
        id: 6,
        title: "تغطية الحوادث الشخصية",
        icon: <FaAmbulance size={28} />,
        points: [
          "الوفاة بسبب حادث أثناء السفر: 100,000 ريال.",
          "العجز الدائم الكلي: 100,000 ريال.",
          "فقدان البصر أو أحد الأطراف: 50,000 ريال.",
          "الحروق من الدرجة الثالثة: حسب النسبة المقررة.",
        ],
      },
      {
        id: 7,
        title: "الحالات غير المشمولة بالتأمين",
        icon: <FaExclamationTriangle size={28} />,
        points: [
          "الأمراض المزمنة المعروفة قبل السفر.",
          "الحمل والولادة وما يتعلق بهما.",
          "الأنشطة الخطرة (الغوص، التسلق، السباقات).",
          "الكحول والمخدرات وأثرها.",
          "الحروب والاضطرابات السياسية.",
          "الإجراءات التجميلية والعلاجات غير الطارئة.",
        ],
      },
      {
        id: 8,
        title: "إجراءات تقديم المطالبة",
        icon: <FaFileInvoiceDollar size={28} />,
        points: [
          "الإبلاغ عن الحادث خلال 24 ساعة من حدوثه.",
          "تقديم المستندات الداعمة (تقارير طبية، فواتير).",
          "إرفاق رقم البوليصة ووثائق السفر.",
          "تعيين رقم مطالبة من شركة التأمين.",
          "معالجة المطالبة خلال 14 يوم عمل.",
        ],
      },
      {
        id: 9,
        title: "استثناءات مهمة",
        icon: <FaBan size={28} />,
        points: [
          "السفر إلى دول محظورة أو عليها عقوبات.",
          "المشاركة في أنشطة رياضية محترفة.",
          "الأمراض النفسية والعصبية.",
          "العلاج في بلد الإقامة المعتاد.",
          "الأضرار الناتجة عن الإهمال المتعمد.",
        ],
      },
      {
        id: 10,
        title: "تواصل مع شركة التأمين",
        icon: <FaPhoneAlt size={28} />,
        points: [
          "رقم الطوارئ 24/7: 8001234567",
          "البريد الإلكتروني: info@tilalr.com",
          "الموقع الإلكتروني: https://tilalr.com/insurance",
          "واتساب للطوارئ: +966500000000",
        ],
      },
      {
        id: 11,
        title: "الإقرار والموافقة",
        icon: <FaFileSignature size={28} />,
        points: [
          "شراء وثيقة التأمين يعني الموافقة على جميع الشروط والأحكام.",
        "يجب قراءة نشرة الوثيقة كاملة قبل الشراء.",
        "للمؤمن له الحق في الإلغاء خلال 14 يوم من الشراء (فترة السماح).",
        "الشركة تقدم خدمة وساطة تأمينية فقط.",
      ],
    },
  ],
},
en: {
  heroTitle: "Travel Insurance Policy",
  heroSubtitle: "Tilal Al Rimal Tourism Company",
  intro: "This page explains the travel insurance policy of Tilal Al Rimal Tourism Company in cooperation with licensed insurance providers.",
  warning: "All customers are advised to read the insurance policy carefully before purchasing travel insurance.",
  sections: [
    {
      id: 1,
      title: "Medical Insurance Coverage",
      icon: <FaHospital size={28} />,
      points: [
        "Emergency medical expenses coverage up to 500,000 SAR.",
        "Emergency dental treatment coverage up to 5,000 SAR.",
        "Emergency medical evacuation coverage.",
        "Prescribed medication and medical test coverage.",
        "Hospital stay coverage up to 30 days.",
      ],
    },
    {
      id: 2,
      title: "Trip Cancellation Coverage",
      icon: <FaPlane size={28} />,
      points: [
        "Trip cancellation due to medical emergencies.",
        "Trip cancellation due to first-degree relative death.",
        "Trip cancellation due to severe weather conditions.",
        "Maximum coverage of 20,000 SAR per trip.",
        "Cancellation must be made 48+ hours before departure.",
      ],
    },
    {
      id: 3,
      title: "Baggage & Personal Effects",
      icon: <FaSuitcase size={28} />,
      points: [
        "Baggage loss coverage up to 10,000 SAR.",
        "Baggage delay (12+ hours) coverage up to 2,000 SAR.",
        "Personal electronic devices coverage up to 5,000 SAR.",
        "Valuables and cash are not covered.",
        "Depreciation applies based on item age.",
      ],
    },
    {
      id: 4,
      title: "Trip Delay Coverage",
      icon: <FaClock size={28} />,
      points: [
        "4+ hours delay: 500 SAR compensation.",
        "8+ hours delay: 1,000 SAR compensation.",
        "12+ hours delay: 1,500 SAR compensation.",
        "24+ hours delay: 2,500 SAR compensation.",
        "Maximum annual compensation: 5,000 SAR.",
      ],
    },
    {
      id: 5,
      title: "Public Liability Coverage",
      icon: <FaUserShield size={28} />,
      points: [
        "Third-party liability coverage up to 1,000,000 SAR.",
        "Material damage caused by insured person.",
        "Bodily injury caused by insured person's negligence.",
        "Intentional damage or drug/alcohol influence excluded.",
      ],
    },
    {
      id: 6,
      title: "Personal Accident Coverage",
      icon: <FaAmbulance size={28} />,
      points: [
        "Accidental death during travel: 100,000 SAR.",
        "Permanent total disability: 100,000 SAR.",
        "Loss of sight or limb: 50,000 SAR.",
        "Third-degree burns: as per scheduled percentage.",
      ],
    },
    {
      id: 7,
      title: "Exclusions",
      icon: <FaExclamationTriangle size={28} />,
      points: [
        "Pre-existing chronic conditions before travel.",
        "Pregnancy and childbirth related conditions.",
        "Hazardous activities (diving, climbing, racing).",
        "Alcohol, drugs, and their effects.",
        "Wars and political unrest.",
        "Cosmetic procedures and non-emergency treatments.",
      ],
    },
    {
      id: 8,
      title: "Claim Procedure",
      icon: <FaFileInvoiceDollar size={28} />,
      points: [
        "Report incident within 24 hours of occurrence.",
        "Submit supporting documents (medical reports, invoices).",
        "Attach policy number and travel documents.",
        "Receive claim number from insurance provider.",
        "Claim processing within 14 business days.",
      ],
    },
    {
      id: 9,
      title: "Important Exceptions",
      icon: <FaBan size={28} />,
      points: [
        "Travel to sanctioned or restricted countries.",
        "Professional sports participation.",
        "Mental and neurological disorders.",
        "Treatment in country of habitual residence.",
        "Damages caused by willful negligence.",
      ],
    },
    {
      id: 10,
      title: "Contact Insurance Provider",
      icon: <FaPhoneAlt size={28} />,
      points: [
        "24/7 Emergency Hotline: 8001234567",
        "Email: info@tilalr.com",
        "Website: https://tilalr.com/insurance",
        "Emergency WhatsApp: +966500000000",
      ],
    },
    {
      id: 11,
      title: "Acceptance",
      icon: <FaFileSignature size={28} />,
      points: [
        "Purchasing insurance constitutes acceptance of all terms.",
        "Full policy wording should be read before purchase.",
        "14-day cooling-off period applies for cancellation.",
        "Company acts as an insurance intermediary only.",
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
              <FaShieldAlt size={50} />
            </div>
            <h1 className="display-4 fw-bold mb-3 animate-fade-in">{t.heroTitle}</h1>
            <p className="lead animate-fade-in-delay">{t.heroSubtitle}</p>
          </div>
        </div>
      </section>

      <section className="intro-section">
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

      <section className="terms-content py-5">
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
          background: #f8f9fa;
          font-family: "Tajawal", sans-serif;
          min-height: 100vh;
        }
        .terms-hero {
          position: relative;
          padding: 120px 0 80px;
          background-image: url("/bg.webp"),
            linear-gradient(135deg, #2c3e50 0%, #8a7779 100%);
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
          background: rgba(0, 0, 0, 0.3);
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
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        .animate-fade-in-delay {
          animation: fadeIn 0.8s ease-out 0.3s both;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .intro-section {
          margin-top: -60px;
          position: relative;
          z-index: 3;
          margin-bottom: 40px;
        }
        .intro-card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          color: #5d6d7e;
          border-bottom: 4px solid #8a7779;
        }
        .warning-note {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 15px;
          color: #856404;
          display: flex;
          align-items: flex-start;
        }
        .term-card {
          background: white;
          border-radius: 16px;
          padding: 30px;
          height: 100%;
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
        }
        .term-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
          border-color: #8a7779;
        }
        .term-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f0f0;
        }
        .term-icon {
          color: #8a7779;
          background: rgba(138, 119, 121, 0.1);
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .term-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #2c3e50;
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
          color: #5d6d7e;
          line-height: 1.6;
        }
        .term-points li::before {
          content: "•";
          color: #8a7779;
          font-weight: bold;
          position: absolute;
          inset-inline-start: 0;
          font-size: 1.2em;
          top: -2px;
        }
        @media (max-width: 768px) {
          .terms-hero { padding: 100px 0 60px; }
          .display-4 { font-size: 2.2rem; }
          .intro-card { padding: 25px; }
          .term-card { padding: 20px; }
          .term-header { flex-direction: column; text-align: center; gap: 10px; }
          .term-title { font-size: 1.2rem; }
        }
      `}</style>
    </div>
  );
}