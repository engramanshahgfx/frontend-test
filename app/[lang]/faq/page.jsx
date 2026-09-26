export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { lang } = resolvedParams;

const metas = {
  en: {
    title: "Frequently Asked Questions | Next Future",
    description:
      "Find answers to the most common questions about our IT, web, and digital services, and discover how we can help your business grow.",
  },
  ar: {
    title: "الأسئلة المتكررة | نكست فيوتشر",
    description:
      "اعثر على إجابات لأكثر الأسئلة شيوعًا حول خدمات نكست فيوتشر لتقنية المعلومات والحلول الرقمية، وتعرف على كيفية مساعدتنا لنمو عملك.",
  },
};


  const meta = metas[lang] || metas.en;
  const baseUrl = "https://brandraize.com";
  const canonicalUrl = `${baseUrl}/${lang}/faq`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en/faq`,
        ar: `${baseUrl}/ar/faq`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function FAQs({ params }) {
  const resolvedParams = await params;
  const { lang } = resolvedParams;

  const faqsEn = [
    {
      question: "What is BrandRaize?",
      answer:
        "BrandRaize is a software company based in Saudi Arabia, helping businesses worldwide with digital transformation and custom software solutions.",
    },
    {
      question: "How much experience does BrandRaize have?",
      answer:
        "We have over 5 years of experience delivering impactful software products and digital services.",
    },
    {
      question: "What services do you offer?",
      answer:
        "We specialize in custom software development, web and mobile applications, UI/UX design, and cloud solutions.",
    },
    {
      question: "Do you work with international clients?",
      answer:
        "Yes, we work remotely with clients all over the world.",
    },
    {
      question: "Do you provide support after project delivery?",
      answer:
        "Yes, we offer continuous support and maintenance packages to ensure your software runs smoothly.",
    },
    {
      question: "Which technologies do you use?",
      answer:
        "We work with modern stacks like React, Next.js, Node.js, Python, and cloud platforms like AWS and Firebase.",
    },
    {
      question: "How can I get started?",
      answer:
        "You can contact us through our website to discuss your project requirements and schedule a consultation.",
    },
  ];

  const faqsAr = [
    {
      question: "ما هي براندرايز؟",
      answer:
        "براندرايز هي شركة برمجيات مقرها في السعودية، تساعد الشركات حول العالم في التحول الرقمي وتطوير البرمجيات المخصصة.",
    },
    {
      question: "ما هي خبرة براندرايز؟",
      answer: "لدينا أكثر من ٥ سنوات من الخبرة في تقديم منتجات برمجية وحلول رقمية مؤثرة.",
    },
    {
      question: "ما هي الخدمات التي تقدمونها؟",
      answer:
        "نحن متخصصون في تطوير البرمجيات المخصصة، وتطبيقات الويب والجوال، وتصميم واجهات وتجربة المستخدم، والحلول السحابية.",
    },
    {
      question: "هل تعملون مع عملاء دوليين؟",
      answer:
        "نعم، نحن نعمل عن بُعد مع عملاء في جميع أنحاء العالم.",
    },
    {
      question: "هل تقدمون دعمًا بعد تسليم المشروع؟",
      answer:
        "نعم، نقدم حزم دعم وصيانة مستمرة لضمان تشغيل برمجياتكم بسلاسة.",
    },
    {
      question: "ما هي التقنيات التي تستخدمونها؟",
      answer:
        "نستخدم تقنيات حديثة مثل React و Next.js و Node.js و Python، بالإضافة إلى منصات سحابية مثل AWS و Firebase.",
    },
    {
      question: "كيف يمكنني البدء؟",
      answer:
        "يمكنك التواصل معنا عبر موقعنا الإلكتروني لمناقشة متطلبات مشروعك وتحديد موعد للاستشارة.",
    },
  ];

  const faqs = lang === "ar" ? faqsAr : faqsEn;

  const titles = {
    en: { title: "Frequently Asked Questions", description: "Find answers to common questions about our services" },
    ar: { title: "الأسئلة المتكررة", description: "اعثر على إجابات لأكثر الأسئلة شيوعًا حول خدماتنا" },
  };

  const headerText = titles[lang] || titles.en;

  return (
    <>
      <div className="py-5" style={{ backgroundColor: "#52a9ff" }}>
        <div className="container d-flex flex-column align-items-center text-white">
          <h1 className="text-center mb-3" style={{ fontWeight: "700" }}>
            {headerText.title}
          </h1>
          <p
            className="text-center w-md-75"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            {headerText.description}
          </p>
        </div>
      </div>
      <div className="container py-5 lh-lg">
        {faqs.map((faq, index) => (
          <details key={index} open={false}>
            <summary>
              <div className="faq-summary-content">
                <div className="faq-index primary-bg">{index + 1}</div>
                {faq.question}
              </div>
              <span className="icon plus text-secondary">+</span>
              <span className="icon minus text-secondary">-</span>
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
      <style>{`
        details {
          border: 1px solid rgba(236, 236, 236, 1);
          border-radius: 20px;
          margin-bottom: 1rem;
          padding: 20px;
          background-color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        details[open] {
          background-color: rgb(136, 207, 247,0.5);
        }
        summary {
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 18px;
          font-weight: 600;
          list-style: none;
        }
        summary::-webkit-details-marker {
          display: none;
        }
        .faq-index {
          width: 24px;
          height: 24px;
          min-width: 24px;
          min-height: 24px;
          border-radius: 50%;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 14px;
          margin-right: ${lang === "ar" ? "0" : "8px"};
          margin-left: ${lang === "ar" ? "8px" : "0"};
          flex-shrink: 0;
          font-weight: 700;
        }
        .faq-summary-content {
          display: flex;
          align-items: center;
          flex-grow: 1;
        }
        .icon {
          font-weight: 900;
          font-size: 24px;
          user-select: none;
          margin-left: 10px;
          flex-shrink: 0;
        }
        details[open] .icon.plus {
          display: none;
        }
        details:not([open]) .icon.minus {
          display: none;
        }
        details > p {
          margin-top: 1rem;
          line-height: 1.5;
          color: #181818;
        }
      `}</style>
    </>
  );
}
