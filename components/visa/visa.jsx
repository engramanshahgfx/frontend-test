"use client";

import React, { useState } from "react";
import { API_URL } from "@/lib/api";
import {
  FaPassport,
  FaBuilding,
  FaPlane,
  FaDesktop,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaMoneyBillWave,
  FaClock,
  FaUserCheck,
  FaGlobeAmericas,
  FaShieldAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaUpload,
  FaSpinner,
} from "react-icons/fa";

export default function Visa({ lang }) {
  const [activeMainTab, setActiveMainTab] = useState(1);
  const [activeGccTab, setActiveGccTab] = useState(1);
  const [activeSchengenTab, setActiveSchengenTab] = useState(1);
  const [activeOtherTab, setActiveOtherTab] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    nationality: "",
    passportNumber: "",
    visaType: "electronic",
    travelDate: "",
    notes: "",
    files: {
      passport: null,
      photo: null,
      other: null,
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const content = {
    en: {
      heroTitle: "The Magic of Nature As You've Never Seen Before",
      heroSubtitle: "Discover the visa you need to visit Saudi Arabia",
      heroDescription: "Let us plan... while you enjoy the journey",

      welcomeTitle: "Welcome!",
      welcomeDescription: "Our dear neighbors, citizens of GCC countries, do not need a visa. You can travel to Saudi Arabia at any time using your ID or passport.",

      // Main Tabs
      mainTabs: [
        { id: 1, title: "GCC Countries", icon: <FaGlobeAmericas /> },
        { id: 2, title: "Schengen - USA - UK", icon: <FaShieldAlt /> },
        { id: 3, title: "None of the above", icon: <FaPassport /> },
      ],

      // GCC Tabs
      gccTabs: [
        {
          id: 1,
          title: "GCC Nationality",
          icon: <FaDesktop />,
          content: {
            title: "Welcome!",
            description: "Our dear neighbors, citizens of GCC countries, do not need a visa. You can travel to Saudi Arabia at any time using your ID or passport."
          }
        },
        {
          id: 2,
          title: "GCC Resident",
          icon: <FaPlane />,
          content: {
            title: "Information",
            description: "Electronic Visa Cost: 300 SAR (approximately $80 USD)\nApplication Fee: 39.44 SAR (approximately $10.50 USD)\nMedical Insurance Fee: Not included (price determined by service provider)\nNumber of Entries: Multiple entries or single entry according to Saudi Foreign Ministry decision\nValidity Period: Multiple entry visa valid for one year from issuance date and allows stay for up to 90 consecutive days",
            requirements: "You must submit a valid residence permit issued by one of the GCC countries with validity of at least three months after entry date to Saudi Arabia.\nYour passport must be valid for at least six months after entry date to Saudi Arabia.\nFor travelers under 18 years, the traveler's parent must apply for electronic visa first.\nTravelers wishing to perform Umrah can book Umrah appointment through the official Nusuk platform.",
            applyButton: "Apply Now",
            applyLink: "https://visa.visitsaudi.com/"
          }
        }
      ],

      // Schengen/USA/UK Tabs
      schengenTabs: [
        {
          id: 1,
          title: "Electronic Visa",
          icon: <FaDesktop />,
          content: {
            title: "Information",
            description: "Electronic Visa Cost: 395 SAR\nApplication Fee: Included in electronic visa price\nMedical Insurance Fee: Included in electronic visa price\nNumber of Entries: Multiple entries\nValidity Period: Multiple entry visa valid for one year from issuance date and allows stay for up to 90 consecutive days",
            requirements: "You can apply for electronic visa to visit Saudi Arabia at any age. If you are a minor traveling unaccompanied, you must check your country's regulations regarding travel without guardian, as these regulations vary by nationality. Please ensure all requirements are met before submitting application, and for more information you can check the electronic visa guide or contact us for assistance.\nYour passport must be valid for at least six months after entry date to Saudi Arabia except for US citizens - US citizens can enter as long as their passport is valid, regardless of remaining time before expiry.",
            applyButton: "Apply Now",
            applyLink: "https://visa.visitsaudi.com/"
          }
        },
        {
          id: 2,
          title: "Visa on Arrival",
          icon: <FaPlane />,
          content: {
            title: "Information",
            description: "Visa on Arrival Cost: 300 SAR (approximately $80 USD)\nMedical Insurance Fee: 95 SAR (approximately $25.33 USD)\nMultiple Entries: Multiple entries or single entry according to Saudi Foreign Ministry decision\nValidity Period: Multiple entry visa valid for one year from issuance date. Visa allows stay for up to 90 days maximum",
            requirements: "Upon arrival at your destination airport or other entry points in Saudi Arabia, you can use self-service machines or go directly to passport office to apply for visa on arrival.\n\nYou can apply for electronic visa to visit Saudi Arabia at any age. If you are a minor traveling unaccompanied, you must check your country's regulations regarding travel without guardian, as these regulations vary by nationality. Please ensure all requirements are met before submitting application, and for more information you can check the electronic visa guide or contact us for assistance.\nYour passport must be valid for at least six months after entry date to Saudi Arabia except for US citizens where US citizens can enter as long as their passport is valid, regardless of remaining time before expiry.\nTravelers wishing to perform Umrah can book Umrah appointment through the official Nusuk platform."
          }
        },
        {
          id: 3,
          title: "Transit Visa",
          icon: <FaBuilding />,
          content: {
            title: "Information",
            description: "Transit visa allows visitors passing through Saudi Arabia to enter for multiple purposes including performing Umrah, visiting the Prophet's Mosque, or spending short vacation during trips and enjoying events like Riyadh Season and visiting tourist attractions throughout the Kingdom.\n\nNote: Travelers for Umrah or visit purposes must schedule their appointments on the electronic Nusuk platform Nusuk.sa before going to Mecca or Medina."
          }
        }
      ],

      // Other Countries Tabs
      otherTabs: [
        {
          id: 1,
          title: "Embassy/Consulate",
          icon: <FaPassport />,
          content: {
            title: "Information",
            description: "Medical Insurance Fee: Not included (price determined by service provider)\nNumber of Entries: Multiple entries or single entry according to Saudi Foreign Ministry decision\nValidity Period: Multiple entry visa valid for one year from issuance date. Visa allows stay for up to 90 days",
            requirements: "You must be at least 18 years old to enter alone. Travelers under 18 years cannot enter unless accompanied by parent, grandparent, or adult sibling (over 18 years).\nYour passport must be valid for at least six months after entry date to Saudi Arabia.\nThe following documents are also required for embassy/consulate visa: Proof of residence (in country of residence), return ticket, employment proof, financial proof/bank statement, travel itinerary, ID, accommodation address (address during Saudi Arabia visit)."
          }
        },
        {
          id: 2,
          title: "Accredited Visa Offices",
          icon: <FaBuilding />,
          content: {
            title: "Information",
            description: "If you live in one of the following countries, you can use 'Tasheer' visa facilitation services.\n\nAfrica: Cameroon | Chad | Egypt | Ghana | Guinea | Ivory Coast | Mali | Mauritania | Nigeria | South Africa.\nAsia: Indonesia | Japan | Jordan | Kuwait | Maldives | Pakistan | Philippines | Qatar | Singapore | Sri Lanka | South Korea | Tajikistan | United Arab Emirates.\nEurope: Germany | Italy | Netherlands | Sweden | Switzerland.\nAustralia\n\nTravelers wishing to perform Umrah can book Umrah appointment through the official Nusuk platform.",
            searchButton: "Search",
            searchLink: "https://vc.tasheer.com/",
            nusukButton: "Official Nusuk Platform",
            nusukLink: "https://www.nusuk.sa/"
          }
        },
        {
          id: 3,
          title: "Transit Visa",
          icon: <FaBuilding />,
          content: {
            title: "Information",
            description: "Transit visa allows visitors passing through Saudi Arabia to enter for multiple purposes including performing Umrah, visiting the Prophet's Mosque, or spending short vacation during trips and enjoying events like Riyadh Season and visiting tourist attractions throughout the Kingdom.\n\nNote: Travelers for Umrah or visit purposes must schedule their appointments on the electronic Nusuk platform Nusuk.sa before going to Mecca or Medina."
          }
        }
      ],

      // Form Labels
      requestService: "Request Visa Assistance",
      requestDesc: "Fill out the form below and our team will contact you to help with your Saudi visa application.",
      fullName: "Full Name",
      phone: "Phone Number",
      email: "Email Address",
      nationality: "Nationality",
      passportNumber: "Passport Number",
      visaTypeLabel: "Visa Type",
      visaTypes: {
        electronic: "Electronic Visa",
        arrival: "Visa on Arrival",
        transit: "Transit Visa",
        embassy: "Embassy/Consulate Visa"
      },
      travelDate: "Expected Travel Date",
      notes: "Additional Notes / Questions",
      attachments: "Attachments",
      passportCopy: "Passport Copy",
      photo: "Recent Photo",
      otherDoc: "Other Documents (Optional)",
      submit: "Submit Application",
      submitting: "Submitting...",
      success: "Your application has been submitted successfully! Our team will contact you within 24 hours.",
      error: "An error occurred. Please try again.",
      connectionError: "Connection error. Please check your internet connection.",
      applyNow: "Apply Now",
      search: "Search",
      requirements: "Requirements",
      howToApply: "How to Apply",
      needHelp: "Need help with your visa application?",
      getHelp: "Request Assistance"
    },
    ar: {
      heroTitle: "سحر الطبيعة كما لم تره من قبل",
      heroSubtitle: "اكتشف نوع التأشيرات التي تحتاجها لزيارة المملكة العربية السعودية",
      heroDescription: "دعنا نخطط.. وأنت استمتع بالرحلة",

      welcomeTitle: "مرحبا!",
      welcomeDescription: "جيراننا الأعزاء مواطني دول مجلس التعاون الخليجي لا يحتاجون إلى تأشيرة. يمكنكم السفر إلى المملكة العربية السعودية في أي وقت باستخدام هويتكم أو جواز سفركم.",

      // Main Tabs
      mainTabs: [
        { id: 1, title: "دول الخليج", icon: <FaGlobeAmericas /> },
        { id: 2, title: "تأشيرة شنغن - USA - UK", icon: <FaShieldAlt /> },
        { id: 3, title: "لا شيى مما سبق", icon: <FaPassport /> },
      ],

      // GCC Tabs
      gccTabs: [
        {
          id: 1,
          title: "جنسية من دول الخليج",
          icon: <FaDesktop />,
          content: {
            title: "مرحبا!",
            description: "جيراننا الأعزاء مواطني دول مجلس التعاون الخليجي لا يحتاجون إلى تأشيرة. يمكنكم السفر إلى المملكة العربية السعودية في أي وقت باستخدام هويتكم أو جواز سفركم."
          }
        },
        {
          id: 2,
          title: "مقيم في دول الخليج",
          icon: <FaPlane />,
          content: {
            title: "المعلومات",
            description: "تكلفة التأشيرات الإلكترونية: 300 ريال (حوالي 80 دولار أمريكي)\n\nرسوم الطلب: 39.44 ريال (حوالي 10.50 دولار أمريكي)\n\nرسوم التأمين الطبي: غير مشمولة (يتم تحديد السعر بناءاً على مقدم الخدمة)\n\nعدد مرات الدخول: دخول متعدد أو دخول واحد وفقاً لقرار وزارة الخارجية السعودية\n\nمدة الصلاحية: أشيرة الدخول المتعدد صالحة لمدة عام من تاريخ إصدارها وتسمح بالإقامة لمدة لا تتجاوز 90 يوماً متتالية",
            requirements: "يجب عليك تقديم تأشيرة إقامة صادرة من إحدى دول مجلس التعاون الخليجي مع صلاحية لا تقل عن ثلاثة أشهر بعد تاريخ الدخول إلى المملكة العربية السعودية.\nيجب أن يكون جواز سفرك ساري المفعول لمدة لا تقل عن ستة أشهر بعد تاريخ الدخول إلى المملكة العربية السعودية.\nبالنسبة للمسافرين الذين تقل أعمارهم عن 18 عاماً، يتعين على والد المسافر التقدم للحصول على تأشيرة إلكترونية أولاً\n\nيمكن للمسافرين الراغبين في أداء مناسك العمرة بحجز موعد العمرة عبر منصة نُسك الرسمية",
            applyButton: "تقديم الأن",
            applyLink: "https://visa.visitsaudi.com/"
          }
        }
      ],

      // Schengen/USA/UK Tabs
      schengenTabs: [
        {
          id: 1,
          title: "التأشيرات الإلكترونية",
          icon: <FaDesktop />,
          content: {
            title: "المعلومات",
            description: "تكلفة التأشيرات الإلكترونية:: 395 ريال\n\nرسوم التقديم: مشمولة في سعر التأشيرات الإلكترونية\n\nرسوم التأمين الطبي: مشمولة في سعر التأشيرات الإلكترونية\n\nعدد مرات الدخول: دخول متعدد\n\nمدة الصلاحية: تأشيرة الدخول المتعدد صالحة لمدة عام من تاريخ إصدارها وتسمح بالإقامة لمدة لا تتجاوز 90 يوماً متتالية",
            requirements: "يمكنك التقدّم للحصول على التأشيرات الإلكترونية لزيارة السعودية في أي عمر. وإذا كنت قاصراً وتسافر دون مرافق، فيجب عليك مراجعة أنظمة بلدك المتعلقة بالسفر دون ولي أمر، حيث تختلف هذه الأنظمة حسب الجنسية. يُرجى التأكّد من استيفاء جميع المتطلبات قبل تقديم الطلب، وللمزيد من المعلومات يمكنك الاطّلاع على دليل التأشيرات الإلكترونية أو التواصل معنا للحصول على المساعدة.\nيجب أن يكون جواز سفرك ساري المفعول لمدة لا تقل عن ستة أشهر بعد تاريخ الدخول إلى المملكة العربية السعودية باستثناء مواطني الولايات المتحدة الأمريكية يمكن لمواطني الولايات المتحدة الدخول طالما أن جواز سفرهم ساري المفعول، بغض النظر عن الوقت المتبقي قبل انتهاء الصلاحية.",
            applyButton: "تقديم الأن",
            applyLink: "https://visa.visitsaudi.com/"
          }
        },
        {
          id: 2,
          title: "التأشيرات عند الوصول",
          icon: <FaPlane />,
          content: {
            title: "المعلومات",
            description: "تكلفة التأشيرات عند الوصول: 300 ريال (ما يعادل حوالي 80 دولار أمريكي)\n\nرسوم التأمين الطبي: 95 ريال  (ما يعادل حوالي 25.33 دولار أمريكي)\n\nدخول متعدد: دخول متعدد أو دخول واحد وفقاً لقرار وزارة الخارجية السعودية\n\nمدة الصلاحية: تأشيرة الدخول المتعدد صالحة لمدة عام من تاريخ إصدارها. تسمح التأشيرات بالإقامة لمدة تصل إلى 90 يوماً كحد أقصى",
            requirements: "بمجرد وصولك إلى مطار وجهتك أو إحدى نقاط الدخول الأخرى في السعودية، يمكنك استخدام أجهزة الخدمة الذاتية أو توجّه مباشرة إلى مكتب الجوازات للتقدم بطلب للحصول على تأشيرتك عند الوصول.\n\nيمكنك التقدّم للحصول على التأشيرات الإلكترونية لزيارة السعودية في أي عمر. وإذا كنت قاصراً وتسافر دون مرافق، فيجب عليك مراجعة أنظمة بلدك المتعلقة بالسفر دون ولي أمر، حيث تختلف هذه الأنظمة حسب الجنسية. يُرجى التأكّد من استيفاء جميع المتطلبات قبل تقديم الطلب، وللمزيد من المعلومات يمكنك الاطّلاع على دليل التأشيرات الإلكترونية أو التواصل معنا للحصول على المساعدة.\nيجب أن يكون جواز سفرك ساري المفعول لمدة لا تقل عن ستة أشهر بعد تاريخ الدخول إلى المملكة العربية السعودية باستثناء مواطني الولايات المتحدة الأمريكية حيث يمكن لمواطني الولايات المتحدة الدخول طالما أن جواز سفرهم ساري المفعول، بغض النظر عن الوقت المتبقي قبل انتهاء الصلاحية.\nيمكن للمسافرين الراغبين في أداء مناسك العمرة بحجز موعد العمرة عبر منصة نُسك الرسمية"
          }
        },
        {
          id: 3,
          title: "تأشيرة المرور \"ترانزيت\"",
          icon: <FaBuilding />,
          content: {
            title: "المعلومات",
            description: "تسمح تأشيرة المرور \"الترانزيت\" للزوار المارين عبر السعودية بالدخول لأغراض متعددة منها، أداء مناسك العمرة أو زيارة المسجد النبوي أو لقضاء اجازة قصيرة وسط الرحلات والاستمتاع بالفعاليات مثل موسم الرياض وزيارة المعالم السياحية في جميع أنحاء المملكة.\n\nملاحظة: يجب على المسافرين لأغراض العُمرة أو الزيارة جدولة مواعيدهم على منصة نُسك الإلكترونية Nusuk.sa قبل الذهاب إلى مكة المكرمة أو المدينة المنورة."
          }
        }
      ],

      // Other Countries Tabs
      otherTabs: [
        {
          id: 1,
          title: "السفارة/القنصلية",
          icon: <FaPassport />,
          content: {
            title: "المعلومات",
            description: "رسوم التأمين الطبي: غير مشمولة (يتم تحديد السعر بناءاً على مقدم الخدمة)\n\nعدد مرات الدخول: دخول متعدد أو دخول واحد وفقاً لقرار وزارة الخارجية السعودية\n\nمدة الصلاحية: تأشيرة الدخول المتعدد صالحة لمدة عام من تاريخ إصدارها. تسمح التأشيرات بالإقامة لمدة تصل إلى 90 يوماً",
            requirements: "يجب ألا يقل عمرك عن 18 عاماً للدخول بمفردك. لا يجوز للمسافرين الذين تقل أعمارهم عن 18 عاماً الدخول إلا إذا كانوا برفقة أحد الوالدين أو الأجداد أو الأشقاء البالغين (فوق 18 عاماً).\nيجب أن يكون جواز سفرك ساري المفعول لمدة لا تقل عن ستة أشهر بعد تاريخ الدخول إلى المملكة العربية السعودية.\nالوثائق التالية مطلوبة أيضاً للحصول على تأشيرة سفارة/قنصلية/تأشير: إثبات الإقامة (في البلد الذي تقيم فيه)، تذكرة العودة، إثبات العمل، إثبات مالي/كشف الحساب المصرفي، خط سير الرحلة، الهوية، عنوان الإقامة (عنوان الاقامة أثناء زيارة السعودية)."
          }
        },
        {
          id: 2,
          title: "مكاتب التأشيرات المعتمدة",
          icon: <FaBuilding />,
          content: {
            title: "المعلومات",
            description: "إذا كنت تعيش في إحدى الدول التالية، فستتمكن من استخدام خدمات تسهيل الحصول على تأشيرة \"تأشير\".\n\nأفريقيا: الكاميرون | تشاد | مصر | غانا | غينيا | ساحل العاج|  مالي | موريتانيا | نيجيريا | جنوب أفريقيا.\nآسيا: اندونيسيا | اليابان | الأردن | الكويت | جزر المالديف | باكستان | الفلبين | قطر | سنغافورة | سريلانكا | كوريا الجنوبية | طاجيكستان | الإمارات العربية المتحدة.\nأوروبا: ألمانيا | إيطاليا | هولندا | السويد | سويسرا.\nاستراليا\n\nيمكن للمسافرين الراغبين في أداء مناسك العمرة بحجز موعد العمرة عبر منصة نُسك الرسمية",
            searchButton: "أبحث",
            searchLink: "https://vc.tasheer.com/",
            nusukButton: "منصة نُسك الرسمية",
            nusukLink: "https://www.nusuk.sa/"
          }
        },
        {
          id: 3,
          title: "تأشيرة المرور \"ترانزيت\"",
          icon: <FaBuilding />,
          content: {
            title: "المعلومات",
            description: "تسمح تأشيرة المرور \"الترانزيت\" للزوار المارين عبر السعودية بالدخول لأغراض متعددة منها، أداء مناسك العمرة أو زيارة المسجد النبوي أو لقضاء اجازة قصيرة وسط الرحلات والاستمتاع بالفعاليات مثل موسم الرياض وزيارة المعالم السياحية في جميع أنحاء المملكة.\n\nملاحظة: يجب على المسافرين لأغراض العُمرة أو الزيارة جدولة مواعيدهم على منصة نُسك الإلكترونية Nusuk.sa قبل الذهاب إلى مكة المكرمة أو المدينة المنورة."
          }
        }
      ],

      // Form Labels
      requestService: "طلب المساعدة في التأشيرات",
      requestDesc: "املأ النموذج أدناه وسيتواصل معك فريقنا للمساعدة في طلب تأشيرة السعودية الخاصة بك.",
      fullName: "الاسم الكامل",
      phone: "رقم الجوال",
      email: "البريد الإلكتروني",
      nationality: "الجنسية",
      passportNumber: "رقم الجواز",
      visaTypeLabel: "نوع التأشيرات",
      visaTypes: {
        electronic: "التأشيرات الإلكترونية",
        arrival: "تأشيرة عند الوصول",
        transit: "تأشيرة عبور",
        embassy: "تأشيرة سفارة"
      },
      travelDate: "تاريخ السفر المتوقع",
      notes: "ملاحظات إضافية",
      attachments: "المرفقات",
      passportCopy: "نسخة الجواز",
      photo: "صورة شخصية حديثة",
      otherDoc: "مستندات أخرى (اختياري)",
      submit: "إرسل الطلب",
      submitting: "جاري الإرسال...",
      success: "تم إرسل طلبك بنجاح! سيتواصل معك فريقنا خلال 24 ساعة.",
      error: "حدث خطأ. الرجاء المحاولة مرة أخرى.",
      connectionError: "خطأ في الاتصال. تأكد من اتصال الإنترنت.",
      applyNow: "تقديم الأن",
      search: "أبحث",
      requirements: "المتطلبات",
      howToApply: "كيفية التقديم",
      needHelp: "تحتاج مساعدة في طلب التأشيرات؟",
      getHelp: "طلب مساعدة"
    },

  };

  const safeLang = lang && content[lang] ? lang : "ar";
  const t = content[safeLang];
  const isRTL = safeLang === "ar";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fileKey) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      files: {
        ...prev.files,
        [fileKey]: file
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Create FormData for file uploads
    const submitFormData = new FormData();
    submitFormData.append('full_name', formData.fullName);
    submitFormData.append('phone', formData.phone);
    submitFormData.append('email', formData.email);
    submitFormData.append('nationality', formData.nationality);
    submitFormData.append('passport_number', formData.passportNumber);
    submitFormData.append('visa_type', formData.visaType);
    submitFormData.append('travel_date', formData.travelDate);
    submitFormData.append('notes', formData.notes);
    submitFormData.append('locale', safeLang);
    submitFormData.append('application_type', 'saudi_visa');

    // Append files
    if (formData.files.passport) {
      submitFormData.append('passport_copy', formData.files.passport);
    }
    if (formData.files.photo) {
      submitFormData.append('photo', formData.files.photo);
    }
    if (formData.files.other) {
      submitFormData.append('other_documents', formData.files.other);
    }

    try {
      const response = await fetch(`${API_URL}/visa-applications`, {
        method: 'POST',
        body: submitFormData,
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          nationality: "",
          passportNumber: "",
          visaType: "electronic",
          travelDate: "",
          notes: "",
          files: { passport: null, photo: null, other: null },
        });
        // Reset file inputs
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => input.value = '');
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.errors || { message: t.error });
      }
    } catch (err) {
      setError({ message: t.connectionError });
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = (tabContent) => (
    <div className="tab-content">
      <div className="content-section">
        <h3 className="content-title">{tabContent.title}</h3>
        <p className="content-description">
          {tabContent.description?.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </p>
      </div>

      {tabContent.requirements && (
        <div className="content-section">
          <h4 className="section-subtitle">{t.requirements}</h4>
          <p className="content-description">
            {tabContent.requirements.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>
        </div>
      )}

      {(tabContent.applyButton || tabContent.searchButton || tabContent.nusukButton) && (
        <div className="action-buttons">
          {tabContent.applyButton && (
            <a href={tabContent.applyLink} className="action-btn primary-btn" target="_blank" rel="noopener noreferrer">
              {tabContent.applyButton}
              {isRTL ? <FaArrowLeft className="ms-2" /> : <FaArrowRight className="ms-2" />}
            </a>
          )}
          {tabContent.searchButton && (
            <a href={tabContent.searchLink} className="action-btn secondary-btn" target="_blank" rel="noopener noreferrer">
              {tabContent.searchButton}
            </a>
          )}
          {tabContent.nusukButton && (
            <a href={tabContent.nusukLink} className="action-btn tertiary-btn" target="_blank" rel="noopener noreferrer">
              {tabContent.nusukButton}
            </a>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="visa-page">
      {/* Hero Section */}
      <section className="visa-hero">
        <div className="video-background">
          <video autoPlay muted loop playsInline className="background-video">
            <source src="/visa.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay"></div>
        </div>

        <div className="container">
          <div className="row align-items-center min-vh-80">
            <div className="col-lg-8 mx-auto text-center text-white">
              <div className="hero-content">
                <h1 className="display-4 fw-bold mb-4">{t.heroTitle}</h1>
                <p className="lead mb-3">{t.heroSubtitle}</p>
                <p className="hero-description">{t.heroDescription}</p>
                <button
                  className="help-btn"
                  onClick={() => setShowForm(!showForm)}
                >
                  {t.needHelp}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tabs Section */}
      <section className="visa-tabs-section py-5">
        <div className="container">
          <div className="main-tabs">
            {t.mainTabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeMainTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveMainTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-text">{tab.title}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content-wrapper">
            {/* GCC Countries Tab */}
            {activeMainTab === 1 && (
              <div className="sub-tabs-section">
                <div className="sub-tabs">
                  {t.gccTabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`sub-tab-button ${activeGccTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveGccTab(tab.id)}
                    >
                      <span className="tab-icon">{tab.icon}</span>
                      <span className="tab-text">{tab.title}</span>
                    </button>
                  ))}
                </div>
                <div className="sub-tab-content">
                  {renderContent(t.gccTabs.find(tab => tab.id === activeGccTab).content)}
                </div>
              </div>
            )}

            {/* Schengen/USA/UK Tab */}
            {activeMainTab === 2 && (
              <div className="sub-tabs-section">
                <div className="sub-tabs">
                  {t.schengenTabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`sub-tab-button ${activeSchengenTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveSchengenTab(tab.id)}
                    >
                      <span className="tab-icon">{tab.icon}</span>
                      <span className="tab-text">{tab.title}</span>
                    </button>
                  ))}
                </div>
                <div className="sub-tab-content">
                  {renderContent(t.schengenTabs.find(tab => tab.id === activeSchengenTab).content)}
                </div>
              </div>
            )}

            {/* Other Countries Tab */}
            {activeMainTab === 3 && (
              <div className="sub-tabs-section">
                <div className="sub-tabs">
                  {t.otherTabs.map((tab) => (
                    <button
                      key={tab.id}
                      className={`sub-tab-button ${activeOtherTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveOtherTab(tab.id)}
                    >
                      <span className="tab-icon">{tab.icon}</span>
                      <span className="tab-text">{tab.title}</span>
                    </button>
                  ))}
                </div>
                <div className="sub-tab-content">
                  {renderContent(t.otherTabs.find(tab => tab.id === activeOtherTab).content)}
                </div>
              </div>
            )}
          </div>

          {/* Visa Assistance Form */}
          {(showForm || activeMainTab === 3) && (
            <div className="visa-form-section">
              <h2 className="form-section-title">{t.requestService}</h2>
              <p className="form-section-desc">{t.requestDesc}</p>

              {error && (
                <div className="error-message">
                  {typeof error === 'object' ? Object.values(error).flat().join(", ") : error.message}
                </div>
              )}

              {submitted && (
                <div className="success-message">
                  <FaCheckCircle /> {t.success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="visa-application-form" encType="multipart/form-data">
                <div className="form-grid">
                  <div className="form-group">
                    <label><FaUser /> {t.fullName} *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                      placeholder={t.fullName}
                    />
                  </div>

                  <div className="form-group">
                    <label><FaPhone /> {t.phone} *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                      placeholder={t.phone}
                    />
                  </div>

                  <div className="form-group">
                    <label><FaEnvelope /> {t.email} *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                      placeholder={t.email}
                    />
                  </div>

                  <div className="form-group">
                    <label><FaGlobeAmericas /> {t.nationality} *</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                      placeholder={t.nationality}
                    />
                  </div>

                  <div className="form-group">
                    <label><FaPassport /> {t.passportNumber} *</label>
                    <input
                      type="text"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                      placeholder={t.passportNumber}
                    />
                  </div>

                  <div className="form-group">
                    <label><FaShieldAlt /> {t.visaTypeLabel} *</label>
                    <select
                      name="visaType"
                      value={formData.visaType}
                      onChange={handleInputChange}
                      required
                      disabled={submitting}
                    >
                      <option value="electronic">{t.visaTypes.electronic}</option>
                      <option value="arrival">{t.visaTypes.arrival}</option>
                      <option value="transit">{t.visaTypes.transit}</option>
                      <option value="embassy">{t.visaTypes.embassy}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label><FaCalendarAlt /> {t.travelDate}</label>
                    <input
                      type="date"
                      name="travelDate"
                      value={formData.travelDate}
                      onChange={handleInputChange}
                      disabled={submitting}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>{t.notes}</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      disabled={submitting}
                      placeholder={t.notes}
                    />
                  </div>
                </div>

                <div className="files-section">
                  <h3><FaUpload /> {t.attachments}</h3>
                  <div className="files-grid">
                    <div className="file-group">
                      <label>{t.passportCopy} *</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'passport')}
                        required
                        disabled={submitting}
                      />
                      <small>PDF, JPG, PNG (Max 5MB)</small>
                    </div>

                    <div className="file-group">
                      <label>{t.photo} *</label>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'photo')}
                        required
                        disabled={submitting}
                      />
                      <small>JPG, PNG (Max 2MB)</small>
                    </div>

                    <div className="file-group">
                      <label>{t.otherDoc}</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'other')}
                        disabled={submitting}
                      />
                      <small>PDF, JPG, PNG (Max 5MB)</small>
                    </div>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? <FaSpinner className="spinner" /> : t.submit}
                  {submitting ? " " + t.submitting : ""}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .visa-page {
          background: #f8f9fa;
          font-family: 'Tajawal', sans-serif;
        }

        .visa-hero {
          position: relative;
          padding: 120px 0 80px;
          min-height: 60vh;
          display: flex;
          align-items: center;
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
          background: linear-gradient(
            135deg,
            rgba(138, 119, 121, 0.95) 0%,
            rgba(239, 200, 174, 0.85) 100%
          );
          z-index: 2;
        }

        .visa-hero .container {
          position: relative;
          z-index: 3;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-content h1 {
          font-weight: 800;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          line-height: 1.3;
        }

        .hero-content .lead {
          font-size: 1.5rem;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          font-weight: 600;
        }

        .hero-description {
          font-size: 1.2rem;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          color: rgba(255, 255, 255, 0.9);
        }

        .help-btn {
          margin-top: 1.5rem;
          padding: 0.75rem 2rem;
          background: white;
          color: #8a7779;
          border: none;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .help-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .visa-tabs-section {
          background: #f8f9fa;
        }

        .main-tabs {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 50px;
          font-weight: 600;
          color: #5d6d7e;
          transition: all 0.3s ease;
          cursor: pointer;
          font-family: 'Tajawal', sans-serif;
        }

        .tab-button:hover {
          border-color: #8a7779;
          color: #8a7779;
          transform: translateY(-2px);
        }

        .tab-button.active {
          background: linear-gradient(45deg, #8a7779, #a89294);
          color: white;
          border-color: #8a7779;
          box-shadow: 0 5px 15px rgba(138, 119, 121, 0.3);
        }

        .tab-icon {
          font-size: 1.2rem;
        }

        .sub-tabs-section {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .sub-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .sub-tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 25px;
          font-weight: 500;
          color: #5d6d7e;
          transition: all 0.3s ease;
          cursor: pointer;
          font-family: 'Tajawal', sans-serif;
        }

        .sub-tab-button:hover {
          border-color: #8a7779;
          color: #8a7779;
        }

        .sub-tab-button.active {
          background: linear-gradient(45deg, #8a7779, #a89294);
          color: white;
          border-color: #8a7779;
        }

        .tab-content-wrapper {
          min-height: 400px;
        }

        .content-section {
          margin-bottom: 2rem;
        }

        .content-title {
          color: #2c3e50;
          font-weight: 700;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }

        .section-subtitle {
          color: #8a7779;
          font-weight: 600;
          margin-bottom: 0.75rem;
          font-size: 1.2rem;
        }

        .content-description {
          color: #5d6d7e;
          line-height: 1.8;
          font-size: 1rem;
          white-space: pre-line;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          font-family: 'Tajawal', sans-serif;
        }

        .primary-btn {
          background: linear-gradient(45deg, #8a7779, #a89294);
          color: white;
          box-shadow: 0 4px 15px rgba(138, 119, 121, 0.3);
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(138, 119, 121, 0.4);
          color: white;
        }

        .secondary-btn {
          background: transparent;
          border: 2px solid #8a7779;
          color: #8a7779;
        }

        .secondary-btn:hover {
          background: #8a7779;
          color: white;
          transform: translateY(-2px);
        }

        .tertiary-btn {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          color: #5d6d7e;
        }

        .tertiary-btn:hover {
          background: #e9ecef;
          transform: translateY(-2px);
        }

        /* Form Styles */
        .visa-form-section {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          margin-top: 2rem;
        }

        .form-section-title {
          color: #2c3e50;
          font-weight: 700;
          margin-bottom: 0.5rem;
          font-size: 1.8rem;
          text-align: center;
        }

        .form-section-desc {
          color: #5d6d7e;
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        .form-group label {
          font-weight: 600;
          color: #2c3e50;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid #e9ecef;
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s ease;
          font-family: 'Tajawal', sans-serif;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #8a7779;
          box-shadow: 0 0 0 2px rgba(138, 119, 121, 0.1);
        }

        .files-section {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }

        .files-section h3 {
          color: #2c3e50;
          font-size: 1.2rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .files-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .file-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .file-group label {
          font-weight: 600;
          color: #2c3e50;
        }

        .file-group input {
          padding: 0.5rem;
          border: 1px solid #e9ecef;
          border-radius: 10px;
          cursor: pointer;
        }

        .file-group small {
          color: #7f8c8d;
          font-size: 0.75rem;
        }

        .submit-btn {
          margin-top: 2rem;
          padding: 1rem 2rem;
          background: linear-gradient(45deg, #8a7779, #a89294);
          color: white;
          border: none;
          border-radius: 50px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          max-width: 300px;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(138, 119, 121, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .error-message {
          background: #fee;
          color: #c00;
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .success-message {
          background: #e8f5e9;
          color: #2e7d32;
          padding: 1rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        [dir="rtl"] .ms-2 {
          margin-left: 0;
          margin-right: 0.5rem;
        }

        @media (max-width: 768px) {
          .visa-hero {
            padding: 100px 0 60px;
            min-height: 50vh;
          }

          .hero-content h1 {
            font-size: 2rem;
          }

          .hero-content .lead {
            font-size: 1.2rem;
          }

          .main-tabs {
            flex-direction: column;
            align-items: center;
          }

          .tab-button {
            width: 100%;
            max-width: 300px;
            justify-content: center;
          }

          .sub-tabs {
            flex-direction: column;
          }

          .action-buttons {
            flex-direction: column;
          }

          .action-btn {
            justify-content: center;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full-width {
            grid-column: span 1;
          }

          .files-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}