"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/providers/UIProvider";
import {
  Headphones,
  X,
  Send,
  Phone,
  Compass,
  Sparkles,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  Star,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Plane,
  Wifi,
  FileText,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import TravelReservationModal from "@/components/TravelReservationModal";

export default function ChatAssistant({ lang = "en" }) {
  const router = useRouter();
  const { openReservationModal } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTravelReservationModal, setShowTravelReservationModal] = useState(false);
  const [reservationPackageData, setReservationPackageData] = useState(null);
  const messagesEndRef = useRef(null);

  const isRTL = lang === "ar";

  // Initial welcome message with professional concierge persona
  const initialMessages = [
    {
      id: 1,
      sender: "bot",
      text: isRTL
        ? "مرحباً بك في شركة التلال والرمال لتنظيم الرحلات السياحية! 👋\n\nأنا مستشارك السياحي الخاص، وأسعد بمساعدتك في اختيار وتنفيذ أروع الرحلات والتجارب في ربوع المملكة وخارجها (العلا، الليالي المصرية، يوم التأسيس، الطيران الخاص، التأشيرات، والمواصلات).\n\nكيف يمكنني خدمتك اليوم؟"
        : "Welcome to Tilal Rimal Tourism Organization! 👋\n\nI am your Personal Travel Advisor. I'm here to assist you in discovering and booking unforgettable journeys across Saudi Arabia and internationally (AlUla desert camps, Egyptian nights, Foundation Day, Private Jets, Visas, & Transportation).\n\nHow may I assist you today?",
      actions: [
        { type: "reservation", label: isRTL ? "📋 طلب حجز رحلة" : "📋 Reserve a Trip" },
        { type: "whatsapp", label: isRTL ? "💬 تواصل عبر الواتساب" : "💬 Chat on WhatsApp" },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ];

  const [messages, setMessages] = useState(initialMessages);

  // Suggested Topics based on complete website content
  const quickTopics = [
    {
      id: "winter_hills",
      label: isRTL ? "🏜️ رحلة الشتاء والرمال بالعلا" : "🏜️ Winter Hills & Sands AlUla",
      query: isRTL ? "حدثني عن رحلة الشتاء والرمال بالعلا" : "Tell me about Winter Hills and Sands trip in AlUla",
    },
    {
      id: "egyptian_night",
      label: isRTL ? "🪕 الليلة المصرية بالعلا" : "🪕 Egyptian Night AlUla",
      query: isRTL ? "تفاصيل الليلة المصرية في العلا" : "Details about Egyptian Night in AlUla",
    },
    {
      id: "foundation_day",
      label: isRTL ? "🇸🇦 فعاليات يوم التأسيس" : "🇸🇦 Foundation Day Trip",
      query: isRTL ? "برنامج وتفاصيل يوم التأسيس" : "Foundation Day trip highlights",
    },
    {
      id: "transport",
      label: isRTL ? "🚆 دليل القطارات والمواصلات" : "🚆 Transport & Trains Guide",
      query: isRTL ? "كيف أتأجر سيارة أو أحجز القطار والمترو بالسعودية؟" : "How to use trains, flights, and car rentals in Saudi Arabia?",
    },
    {
      id: "private_jet",
      label: isRTL ? "✈️ استئجار طائرة خاصة" : "✈️ Private Jet Charter",
      query: isRTL ? "كيف يمكنني طلب حجز طائرة خاصة؟" : "How can I book a private jet charter?",
    },
    {
      id: "internet",
      label: isRTL ? "📶 باقات الإنترنت العالمية" : "📶 Global eSIM & Data",
      query: isRTL ? "أسعار وباقات الإنترنت في الخارج" : "What are the international internet data packages?",
    },
    {
      id: "visa",
      label: isRTL ? "📑 تأشيرة الشنغن والسياحة" : "📑 Schengen & Tourist Visa",
      query: isRTL ? "ما هي شروط ومتطلبات استخراج تأشيرة الشنغن؟" : "What are the requirements for a Schengen visa?",
    },
    {
      id: "about_saudi",
      label: isRTL ? "🇸🇦 عن المملكة ورؤية 2030" : "🇸🇦 About Saudi Arabia & Vision 2030",
      query: isRTL ? "معلومات عن الثقافة ورؤية المملكة 2030" : "Tell me about Saudi culture and Vision 2030",
    },
    {
      id: "reviews",
      label: isRTL ? "⭐ آراء وتقييمات العملاء" : "⭐ Client Reviews",
      query: isRTL ? "ما هي تقييمات العملاء السابقين؟" : "What do clients say about Tilal Rimal?",
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Comprehensive AI Knowledge Base matching all user site data
  const generateBotReply = (userText) => {
    const text = userText.toLowerCase();

    // 1. Winter Hills & Sands
    if (text.includes("winter") || text.includes("شتاء") || text.includes("رمال") || text.includes("hills")) {
      return {
        text: isRTL
          ? "🏜️ **رحلة الشتاء والرمال (جدة - العلا)**:\n\nاستمتع بإنشاء ذكريات لا تُنسى في أحضان الطبيعة والرمال!\n\n✨ **أبرز الأنشطة**:\n• جلسات سمر دافئة وأمسيات غنائية.\n• تقديم مشروبات ساخنة ووجبات BBQ وتحديات الرماية بالقوس.\n• **المدة**: ليلة واحدة (يناير 2025).\n• **السعة**: 20 - 50 شخصاً.\n\nيمكنك الآن إكمال حجزك المباشر أو التواصل فوراً مع موظف الحجوزات عبر الواتساب:"
          : "🏜️ **Winter Hills & Sands (Jeddah - AlUla)**:\n\nEnjoy unforgettable desert moments under the stars!\n\n✨ **Highlights**:\n• Warm bonfire gathering sessions & live music.\n• Hot beverages, BBQ dining, & archery challenges.\n• **Duration**: 1 Night (Jan 2025).\n• **Capacity**: 20 - 50 Persons.\n\nYou can submit a reservation request or contact our team directly:",
        actions: [
          { type: "reservation", label: isRTL ? "📋 احجز رحلة الشتاء والرمال" : "📋 Reserve Winter Hills Trip", tripTitle: "Winter Hills and Sands" },
          { type: "whatsapp", label: isRTL ? "💬 حجز مباشر عبر الواتساب" : "💬 Direct WhatsApp Booking", textMsg: "استفسار عن رحلة الشتاء والرمال بالعلا" },
        ],
      };
    }

    // 2. Egyptian Night
    if (text.includes("egyptian") || text.includes("مصري") || text.includes("الليلة المصرية") || text.includes("oud")) {
      return {
        text: isRTL
          ? "🪕 **الليلة المصرية في الشتاء والرمال (جدة - العلا)**:\n\nعش أجواء طربية وأمسيات ساحرة في قلب الطبيعة الصحراوية!\n\n🎶 **أبرز الفعاليات**:\n• جلسة عود مع الفنان الأصيل 'العمدة'.\n• بوفيه عشاء مصري فاخر ومأكولات شيوخ.\n• معزوفات وألحان كلاسيكية مع فرقة 'أمثال'.\n• **المدة**: ليلة واحدة (فبراير 2025).\n• **السعة**: 25 - 60 شخصاً."
          : "🪕 **Egyptian Night at Winter Hills & Sands (Jeddah - AlUla)**:\n\nImmerse yourself in authentic Egyptian culture and melodies under the open sky!\n\n🎶 **Highlights**:\n• Oud music session with artist 'Al-Omda'.\n• Authentic Egyptian dinner buffet.\n• Classic melodies with 'Amathal' band.\n• **Duration**: 1 Night (Feb 2025).\n• **Capacity**: 25 - 60 Persons.",
        actions: [
          { type: "reservation", label: isRTL ? "📋 حجز الليلة المصرية" : "📋 Reserve Egyptian Night", tripTitle: "Egyptian Night at Winter Hills" },
          { type: "whatsapp", label: isRTL ? "💬 استفسر عبر الواتساب" : "💬 Inquire via WhatsApp", textMsg: "استفسار عن حجز الليلة المصرية بالعلا" },
        ],
      };
    }

    // 3. Foundation Day
    if (text.includes("foundation") || text.includes("تأسيس") || text.includes("يوم التأسيس")) {
      return {
        text: isRTL
          ? "🇸🇦 **رحلة يوم التأسيس في الشتاء والرمال**:\n\nاحتفل بمعنى التأسيس في أجواء تراثية وتغطية استثنائية!\n\n👑 **الفعاليات والتراث**:\n• مسيرة يوم التأسيس والعروض الفولكلورية والفرق الشعبية.\n• معزوفات عود مع الفنان 'العمدة' وعروض شعبية نسائية.\n• ضيافة أصيلة، وركوب الخيل والإبل.\n• **المدة**: ليلة واحدة (فبراير 2025).\n• **السعة**: 30 - 100 شخص."
          : "🇸🇦 **Foundation Day at Winter Hills & Sands**:\n\nCelebrate Saudi Foundation Day with rich heritage and grand festivities!\n\n👑 **Highlights**:\n• Official Foundation Day procession & folklore performances.\n• Live Oud music, traditional hospitality, horse & camel riding.\n• **Duration**: 1 Night (Feb 2025).\n• **Capacity**: 30 - 100 Persons.",
        actions: [
          { type: "reservation", label: isRTL ? "📋 حجز فعاليات يوم التأسيس" : "📋 Reserve Foundation Day", tripTitle: "Foundation Day Trip" },
          { type: "whatsapp", label: isRTL ? "💬 التواصل مع المنسق" : "💬 Contact Trip Coordinator", textMsg: "طلب حجز رحلة يوم التأسيس بالعلا" },
        ],
      };
    }

    // 4. Transportation & Trains Guide
    if (text.includes("transport") || text.includes("train") || text.includes("قطار") || text.includes("مترو") || text.includes("طيران") || text.includes("سيارة") || text.includes("قيادة")) {
      return {
        text: isRTL
          ? "🚆 **دليل المواصلات والتنقل في السعودية**:\n\nتتوفر في المملكة منظومة نقل متطورة تضمن لك السهولة والراحة:\n\n✈️ **الرحلات الجوية**: 18 مطاراً محلياً و10 مطارات دولية عبر الخطوط السعودية، طيران ناس، وطيران أديل.\n🚆 **القطارات**: \n• **قطار سار**: مسار الشمال (الرياض ↔ القريات) ومسار الشرق (الرياض ↔ الدمام).\n• **قطار الحرمين السريع**: يربط بين مكة والمدينة وجدة ومدينة الملك عبدالله الاقتصادية بأعلى سرعة.\n• **مترو الرياض**: 6 خطوط رئيسية و 85 محطة حديثة.\n🚗 **تأجير السيارات**: طرق سريعة حديثة ولوحات إرشادية بالعربية والإنجليزية مع تطبيقات عالمية ومحلية."
          : "🚆 **Transportation & Getting Around Guide**:\n\nSaudi Arabia offers modern seamless transport infrastructure:\n\n✈️ **Flights**: 18 domestic & 10 international airports via Saudia, Flynas, & Flyadeal.\n🚆 **Trains**:\n• **SAR Railway**: North Line (Riyadh ↔ Al Qurayyat) & East Line (Riyadh ↔ Dammam).\n• **Haramain High-Speed Train**: Fast rail connecting Makkah, Madinah, Jeddah, & KAEC.\n• **Riyadh Metro**: 6 main lines with 85 state-of-the-art stations.\n🚗 **Car Rental**: Modern highways with bilingual signage (Arabic & English).",
        actions: [
          { type: "navigate", href: "/transportation", label: isRTL ? "🔗 فتح دليل المواصلات الكامل" : "🔗 Open Full Transport Guide" },
          { type: "whatsapp", label: isRTL ? "💬 مساعدة في ترتيب التنقل" : "💬 Help with Transport Booking", textMsg: "ترتيب مواصلات وتنقل داخل السعودية" },
        ],
      };
    }

    // 5. Private Jet Charter
    if (text.includes("jet") || text.includes("طائرة خاصة") || text.includes("استئجار طائرة") || text.includes("خاصة")) {
      return {
        text: isRTL
          ? "✈️ **خدمة استئجار الطيران الخاص الفاخر**:\n\nاختبر قمة السفر الفاخر والراحة مع خدماتنا الحصرية:\n\n⭐ **لماذا تختار التلال والرمال للطيران الخاص؟**\n• مقصورات فاخرة مع خدمة شخصية على مدار 24/7.\n• وصول لأكثر من 5000 مطار خاص حول العالم.\n• مشغلون معتمدون من FAA / EASA مع أعلى معايير السلامة.\n• الرد وتوفير عرض السعر خلال ساعتين فقط!"
          : "✈️ **Luxury Private Jet Charter**:\n\nExperience ultimate luxury and privacy in the sky:\n\n⭐ **Why Choose Us?**\n• VIP luxury cabins with 24/7 personalized concierge service.\n• Access to over 5,000 private airports worldwide.\n• FAA/EASA certified operators with top safety ratings.\n• Price quotation response within 2 hours!",
        actions: [
          { type: "navigate", href: "/international/private-jet", label: isRTL ? "📄 نموذج طلب طائرة خاصة" : "📄 Private Jet Request Form" },
          { type: "whatsapp", label: isRTL ? " طلب عرض سعر مباشر" : " Get Instant Jet Quote", textMsg: "طلب عرض سعر طيران خاص" },
        ],
      };
    }

    // 6. Global Internet Data Packages
    if (text.includes("internet") || text.includes("إنترنت") || text.includes("انترنت") || text.includes("باقة") || text.includes("شريحة") || text.includes("esim")) {
      return {
        text: isRTL
          ? "📶 **باقات الإنترنت العالمية (تفعيل فوري)**:\n\nابقَ متصلاً بثبات وسرعة عالية في أكثر من 200 دولة بخصومات تصل لـ 70% من رسوم التجوال:\n\n• **1 GB**: $10 (7 أيام - 4G/LTE)\n• **3 GB**: $25 (15 يوماً - 4G/LTE - الأكثر طلباً ⭐)\n• **5 GB**: $40 (30 يوماً - 5G Ready)\n• **10 GB**: $70 (30 يوماً - 5G Ready)\n• **20 GB**: $130 (60 يوماً - 5G Ultra)\n• **50 GB**: $300 (90 يوماً - 5G Ultra)"
          : "📶 **Global Internet Data Packages (Instant Activation)**:\n\nStay seamlessly connected in 200+ countries with up to 70% savings on roaming fees:\n\n• **1 GB**: $10 (7 days - 4G/LTE)\n• **3 GB**: $25 (15 days - 4G/LTE - Best Seller ⭐)\n• **5 GB**: $40 (30 days - 5G Ready)\n• **10 GB**: $70 (30 days - 5G Ready)\n• **20 GB**: $130 (60 days - 5G Ultra)\n• **50 GB**: $300 (90 days - 5G Ultra)",
        actions: [
          { type: "navigate", href: "/international/internet-packages", label: isRTL ? "🌐 تصفح وتفعيل الباقات" : "🌐 View & Order Packages" },
          { type: "whatsapp", label: isRTL ? "💬 تفعيل سريع عبر الواتساب" : "💬 Quick WhatsApp Order", textMsg: "طلب تفعيل باقة إنترنت عالمية" },
        ],
      };
    }

    // 7. Visa Services (Schengen & Tourist)
    if (text.includes("visa") || text.includes("تأشير") || text.includes("شنغن") || text.includes("schengen")) {
      return {
        text: isRTL
          ? "📑 **خدمة استخراج وتجهيز تأشيرة الشنغن والسياحة**:\n\nنجهز ملفك كاملاً للسعوديين والمقيمين بالمملكة:\n\n✅ **المتطلبات الأساسية**:\n1. جواز سفر صالح لمدة 6 أشهر على الأقل (مع نسختين فارغتين).\n2. صور شخصية خلفية بيضاء مقاس 3.5×4.5 سم.\n3. تأمين طبي يغطي دول الشنغن بحد أدنى 30,000 يورو.\n4. حجز طيران وفندق مؤكد، وكشف حساب بنكي لآخر 6 أشهر بالإنجليزية.\n5. للمقيمين: إقامة سارية + تأشيرة خروج وعودة + خطاب تعريف بالراتب مصدق."
          : "📑 **Schengen & Tourist Visa Services**:\n\nComplete file preparation for Saudis and residents:\n\n✅ **Requirements**:\n1. Passport valid for 6+ months from return date.\n2. (2) White background photos (3.5 x 4.5 cm).\n3. Travel Insurance covering Schengen area (min. €30,000).\n4. Confirmed flight/hotel reservation & 6-month English bank statement.\n5. For Residents: Valid Iqama + Exit/Re-entry Visa + Chamber certified salary letter.",
        actions: [
          { type: "navigate", href: "/visa", label: isRTL ? "📄 رفع مستندات التأشيرة" : "📄 Upload Visa Documents" },
          { type: "whatsapp", label: isRTL ? "💬 استشارة تأشيرة مجانية" : "💬 Free Visa Consultation", textMsg: "استفسار عن حجز موعد وتأشيرة الشنغن" },
        ],
      };
    }

    // 8. About Saudi Arabia & Vision 2030
    if (text.includes("about") || text.includes("saudi") || text.includes("رؤية") || text.includes("2030") || text.includes("ثقافة") || text.includes("لغة")) {
      return {
        text: isRTL
          ? "🇸🇦 **عن المملكة العربية السعودية ورؤية 2030**:\n\n• **الموقع**: 14 منطقة إدارية، وسكان يزيدون عن 35 مليون نسمة.\n• **التأسيس**: تأسست عام 1932م.\n• **اللغة**: العربية هي اللغة الرسمية وتُستخدم الإنجليزية على نطاق واسع في المعاملات والسياحة واللوحات الإرشادية.\n• **رؤية 2030**: التي أطلقها سمو ولي العهد الأمير محمد بن سلمان لتنويع الاقتصاد وترسيخ 3 محاور رئيسية: **مجتمع حيوي، اقتصاد مزدهر، ووطن طموح**."
          : "🇸🇦 **About Saudi Arabia & Vision 2030**:\n\n• **Overview**: 14 administrative regions with over 35 Million residents.\n• **Foundation**: Founded in 1932.\n• **Language**: Arabic is the official language, with English widely spoken in business, tourism, and road signs.\n• **Vision 2030**: Launched by HRH Crown Prince Mohammed bin Salman to build a **Vibrant Society, Thriving Economy, & Ambitious Nation**.",
        actions: [
          { type: "navigate", href: "/about-saudi", label: isRTL ? "📖 اقرأ المزيد عن السعودية" : "📖 Read About Saudi Arabia" },
          { type: "reservation", label: isRTL ? "📋 حجز جولة داخلية" : "📋 Book a Local Saudi Tour" },
        ],
      };
    }

    // 9. Customer Reviews & Ratings
    if (text.includes("review") || text.includes("تقييم") || text.includes("عملاء") || text.includes("آراء") || text.includes("testimonial")) {
      return {
        text: isRTL
          ? "⭐ **تقييمات وآراء عملاء شركة التلال والرمال**:\n\n• *\"شكر خاص للاهتمام بأصغر التفاصيل في المغامرة وفريق العمل المتعاون. كانت تجربة متميزة لا تُنسى\"* – عميل راضٍ.\n• *\"أفضل تجربة سياحية حظيت بها في حياتي. التنظيم كان ممتازاً والمرشدون محترفون للغاية\"* – سارة أحمد.\n• *\"الاهتمام بالتفاصيل والخدمة الاستثنائية جعلت الرحلة غير عادية\"* – محمد الخالد."
          : "⭐ **Client Reviews & Testimonials**:\n\n• *'Special thanks for attention to the smallest details in the adventure and the cooperative team. Unforgettable experience!'* – Satisfied Customer\n• *'The best tourism experience I've ever had. Organization was excellent and guides were professional.'* – Sarah Ahmed\n• *'Exceptional service and care for details made our trip magical.'* – Mohammed Al Khalid",
        actions: [
          { type: "BookingModal", label: isRTL ? "📋 احجز تجربتك الآن" : "📋 Book Your Experience Now" },
          { type: "whatsapp", label: isRTL ? "💬 تواصل معنا على الواتساب" : "💬 Talk to Us on WhatsApp", textMsg: "استفسار عن حجز رحلة جديدة" },
        ],
      };
    }

    // Default Fallback Response
    return {
      text: isRTL
        ? "أهلاً بك مجدداً في **شركة التلال والرمال لتنظيم الرحلات السياحية** 🌴\n\nنحن نقدم رحلات سياحية متكاملة (رحلات العلا، الفعاليات الموسيقية، الطيران الخاص، باقات إنترنت 5G، والتأشيرات) بأسعار تنافسية وجودة عالية تتماشى مع رؤية السعودية 2030.\n\nيمكنك اختيار طلب حجز مباشر أو التحدث معنا على الواتساب الآن:"
        : "Welcome to **Tilal Rimal Tourism Organization** 🌴\n\nWe provide premier tourism packages (AlUla trips, musical events, private jets, 5G internet eSIMs, and Schengen visas) aligned with Saudi Vision 2030.\n\nYou can start a direct reservation request or chat with us on WhatsApp:",
      actions: [
        { type: "reservation", label: isRTL ? "📋 طلب حجز / استفسار" : "📋 Submit Reservation Request" },
        { type: "whatsapp", label: isRTL ? "💬 تواصل عبر الواتساب" : "💬 Chat on WhatsApp", textMsg: "مرحباً، أود الاستفسار عن رحلاتكم السياحية" },
      ],
    };
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const newUserMsg = {
      id: Date.now(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const replyObj = generateBotReply(userText);
      const newBotMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: replyObj.text,
        actions: replyObj.actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleQuickTopicClick = (topic) => {
    const userText = topic.query;
    const newUserMsg = {
      id: Date.now(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const replyObj = generateBotReply(userText);
      const newBotMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: replyObj.text,
        actions: replyObj.actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleActionButtonClick = (action) => {
    if (action.type === "reservation" || action.type === "BookingModal" || action.type === "TravelReservationModal") {
      const pkgData = {
        title: action.tripTitle || "Tilal Rimal Package",
        name: action.tripTitle || "Tilal Rimal Package",
        id: "chat_pkg_1",
      };
      setReservationPackageData(pkgData);
      setShowTravelReservationModal(true);
    } else if (action.type === "whatsapp") {
      const encodedMsg = encodeURIComponent(action.textMsg || "مرحباً، أود الاستفسار والحجز مع شركة التلال والرمال");
      window.open(`https://wa.me/966547305060?text=${encodedMsg}`, "_blank");
    } else if (action.type === "navigate" && action.href) {
      router.push(`/${lang}${action.href}`);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Concierge Badge Trigger Button */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          [isRTL ? "left" : "right"]: "90px",
          zIndex: 99990,
          display: isOpen ? "none" : "block",
        }}
      >
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(true)}
          style={{
            background: "#1C0052",
            color: "#ffffff",
            border: "2px solid #E85D1F",
            borderRadius: "50px",
            padding: "10px 18px",
            boxShadow: "0 12px 35px rgba(28, 0, 82, 0.35), 0 0 0 4px rgba(232, 93, 31, 0.2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: 700,
            fontSize: "0.92rem",
            direction: isRTL ? "rtl" : "ltr",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "rgba(232, 93, 31, 0.2)",
              border: "1px solid #E85D1F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFC60B",
              flexShrink: 0,
            }}
          >
            <Headphones size={18} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: "1.2" }}>
            <span style={{ color: "#ffffff", fontSize: "0.88rem", fontWeight: 700 }}>
              {isRTL ? "مستشار التلال والرمال" : "Tilal Rimal Concierge"}
            </span>
            <span style={{ color: "#FFC60B", fontSize: "0.72rem", fontWeight: 500 }}>
              {isRTL ? "خدمة العملاء والحجوزات" : "Travel & Booking Support"}
            </span>
          </div>
          <Sparkles size={16} color="#FFC60B" style={{ marginLeft: "4px" }} />
        </motion.button>
      </div>

      {/* Floating Concierge Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: "fixed",
              bottom: isExpanded ? "20px" : "24px",
              [isRTL ? "left" : "right"]: isExpanded ? "20px" : "24px",
              width: isExpanded ? "calc(100vw - 40px)" : "410px",
              maxWidth: "720px",
              height: isExpanded ? "calc(100vh - 40px)" : "630px",
              maxHeight: "88vh",
              backgroundColor: "#ffffff",
              borderRadius: "22px",
              boxShadow: "0 25px 65px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(232, 93, 31, 0.35)",
              zIndex: 99999,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            {/* Professional Header Bar */}
            <div
              style={{
                background: "#1C0052",
                color: "#ffffff",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "3.5px solid #E85D1F",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(223, 165, 40, 0.15)",
                    border: "1.5px solid #DFA528",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#F3D082",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <Headphones size={22} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#ffffff" }}>
                    {isRTL ? "المستشار السياحي - التلال والرمال" : "Tilal Rimal Travel Advisor"}
                  </h4>
                  <span style={{ fontSize: "0.75rem", color: "#F3D082", display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ width: "7px", height: "7px", backgroundColor: "#10b981", borderRadius: "50%" }} />
                    {isRTL ? "متاح الان للحجز والاستفسار" : "Available 24/7 for Reservations"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* WhatsApp Direct Header Icon */}
                <a
                  href="https://wa.me/966547305060"
                  target="_blank"
                  rel="noreferrer"
                  title="WhatsApp Support"
                  style={{
                    color: "#25D366",
                    backgroundColor: "rgba(255, 255, 255, 0.12)",
                    borderRadius: "50%",
                    width: "35px",
                    height: "35px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  <FaWhatsapp size={19} />
                </a>

                {/* Expand / Minimize Toggle */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{
                    background: "rgba(255, 255, 255, 0.12)",
                    border: "none",
                    color: "#ffffff",
                    borderRadius: "50%",
                    width: "35px",
                    height: "35px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: "rgba(255, 255, 255, 0.12)",
                    border: "none",
                    color: "#ffffff",
                    borderRadius: "50%",
                    width: "35px",
                    height: "35px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Sub-Header Notice */}
            <div
              style={{
                backgroundColor: "#FAF6F0",
                padding: "8px 16px",
                borderBottom: "1px solid #EFE4D2",
                fontSize: "0.78rem",
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontWeight: 600, color: "#1C0052" }}>
                {isRTL ? "خدمات التنظيم والحجز المباشر لجميع رحلات المملكة" : "Official Concierge Service for All Saudi Tours & Packages"}
              </span>
              <button
                onClick={() => setMessages(initialMessages)}
                title="Reset Chat"
                style={{ background: "none", border: "none", color: "#DFA528", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <RefreshCw size={12} />
                <span style={{ fontSize: "0.72rem", fontWeight: 600 }}>{isRTL ? "إعادة التعيين" : "Reset"}</span>
              </button>
            </div>

            {/* Chat Messages Body */}
            <div
              style={{
                flex: 1,
                padding: "16px 18px",
                overflowY: "auto",
                backgroundColor: "#f9fafb",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      maxWidth: "90%",
                      flexDirection: msg.sender === "user" ? "row-reverse" : "row",
                    }}
                  >
                    {msg.sender === "bot" && (
                      <div
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          backgroundColor: "#1C0052",
                          color: "#F3D082",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          flexShrink: 0,
                          marginTop: "2px",
                          border: "1px solid #DFA528",
                        }}
                      >
                        <UserCheck size={16} />
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: msg.sender === "user" ? "#1C0052" : "#ffffff",
                          color: msg.sender === "user" ? "#ffffff" : "#1f2937",
                          padding: "13px 16px",
                          borderRadius: msg.sender === "user" ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                          boxShadow: msg.sender === "user" ? "0 4px 14px rgba(28, 0, 82, 0.2)" : "0 3px 12px rgba(0,0,0,0.06)",
                          border: msg.sender === "user" ? "none" : "1px solid #e5e7eb",
                          fontSize: "0.9rem",
                          lineHeight: "1.6",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {msg.text}
                      </div>

                      {/* Interactive Reservation & WhatsApp Action Cards */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "2px" }}>
                          {msg.actions.map((act, actIdx) => (
                            <button
                              key={actIdx}
                              onClick={() => handleActionButtonClick(act)}
                              style={{
                                backgroundColor: act.type === "whatsapp" ? "#25D366" : act.type === "reservation" ? "#DFA528" : "#1C0052",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "12px",
                                padding: "8px 14px",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
                                transition: "all 0.2s ease-in-out",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                            >
                              {act.type === "whatsapp" ? (
                                <FaWhatsapp size={15} />
                              ) : act.type === "reservation" ? (
                                <Briefcase size={15} />
                              ) : (
                                <ExternalLink size={15} />
                              )}
                              <span>{act.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <span style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "4px", padding: "0 6px" }}>
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      backgroundColor: "#1C0052",
                      color: "#F3D082",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #DFA528",
                    }}
                  >
                    <UserCheck size={16} />
                  </div>
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      padding: "10px 16px",
                      borderRadius: "16px 16px 16px 2px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Loader2 size={16} color="#DFA528" className="animate-spin" />
                    <span style={{ fontSize: "0.82rem", color: "#6b7280", fontWeight: 600 }}>
                      {isRTL ? "جاري تحضير الرد والتفاصيل..." : "Preparing response & booking options..."}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "10px 14px 6px",
                borderTop: "1px solid #f0f0f0",
                display: "flex",
                gap: "8px",
                overflowX: "auto",
                whiteSpace: "nowrap",
                scrollbarWidth: "none",
              }}
            >
              {quickTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleQuickTopicClick(topic)}
                  style={{
                    backgroundColor: "#FAF6F0",
                    border: "1px solid #EFE4D2",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#1C0052",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#DFA528";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FAF6F0";
                    e.currentTarget.style.color = "#1C0052";
                  }}
                >
                  {topic.label}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: "12px 16px",
                backgroundColor: "#ffffff",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isRTL ? "اكتب استفسارك للحجز أو المعلومات..." : "Type your question or booking inquiry..."}
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  borderRadius: "25px",
                  border: "1.5px solid #e5e7eb",
                  backgroundColor: "#FAF6F0",
                  fontSize: "0.9rem",
                  color: "#111827",
                  outline: "none",
                  direction: isRTL ? "rtl" : "ltr",
                }}
              />

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: inputMessage.trim() ? "#DFA528" : "#e5e7eb",
                  color: "#ffffff",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: inputMessage.trim() ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  boxShadow: inputMessage.trim() ? "0 4px 14px rgba(223, 165, 40, 0.35)" : "none",
                }}
              >
                <Send size={18} style={{ transform: isRTL ? "rotate(180deg)" : "none" }} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Direct Travel Reservation Modal */}
      <TravelReservationModal
        isOpen={showTravelReservationModal}
        onClose={() => setShowTravelReservationModal(false)}
        packageData={reservationPackageData}
        lang={lang}
      />
    </>
  );
}
