"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/api";
import BookingModal from "@/components/BookingModal";
import TravelReservationModal from "@/components/TravelReservationModal";
import Image from "next/image";
import { Headphones, CreditCard, Copy, Phone, MessageSquare, Mail, MapPin, FileText, Star, CheckCircle, XCircle, Calendar, Luggage, Clock, ChevronDown, Check } from "lucide-react";

function OfferCustomSelect({ personPrices, value, onChange, isRTL, lang }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOffer = (personPrices || []).find((o) => Number(o.persons) === Number(value));

  const getLabel = (persons, price, isCustom) => {
    if (isCustom) {
      return lang === "ar" ? "طلب عرض خاص (عدد أفراد مخصص)" : "Request Custom Offer (Custom Persons)";
    }
    return lang === "ar"
      ? `عرض ${persons} ${Number(persons) === 1 ? "فرد" : "أفراد"} - (${price} ر.س)`
      : `${persons} ${Number(persons) > 1 ? "Persons" : "Person"} Offer - (${price} SAR)`;
  };

  let currentText = "";
  if (value === "custom") {
    currentText = lang === "ar" ? "طلب عرض خاص (عدد أفراد مخصص)" : "Request Custom Offer (Custom Persons)";
  } else if (selectedOffer) {
    currentText = getLabel(selectedOffer.persons, selectedOffer.price, false);
  } else {
    currentText = lang === "ar" ? "اختر العرض" : "Select Offer";
  }

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "100%" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "8px",
          border: "2px solid #E85D1F",
          backgroundColor: "#fff",
          color: value === "custom" ? "#E85D1F" : "#1C0052",
          fontWeight: "600",
          fontSize: "0.95rem",
          cursor: "pointer",
          outline: "none",
          boxShadow: "0 2px 8px rgba(232, 93, 31, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          textAlign: isRTL ? "right" : "left",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: isRTL ? "right" : "left" }}>
          {currentText}
        </span>
        <ChevronDown
          size={16}
          color="#E85D1F"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            marginLeft: isRTL ? 0 : "8px",
            marginRight: isRTL ? "8px" : 0,
            flexShrink: 0,
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            backgroundColor: "#ffffff",
            border: "2px solid #E85D1F",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.18)",
            zIndex: 9999,
            maxHeight: "220px",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          {(personPrices || []).map((offer, idx) => {
            const isSelected = Number(offer.persons) === Number(value);
            return (
              <div
                key={idx}
                onClick={() => {
                  onChange(offer.persons);
                  setIsOpen(false);
                }}
                style={{
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: isSelected ? "700" : "500",
                  color: isSelected ? "#ffffff" : "#1C0052",
                  backgroundColor: isSelected ? "#E85D1F" : "#ffffff",
                  cursor: "pointer",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  lineHeight: "1.4",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
              >
                <span>{getLabel(offer.persons, offer.price, false)}</span>
                {isSelected && <Check size={14} color="#ffffff" />}
              </div>
            );
          })}
          <div
            onClick={() => {
              onChange("custom");
              setIsOpen(false);
            }}
            style={{
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: "700",
              color: value === "custom" ? "#ffffff" : "#E85D1F",
              backgroundColor: value === "custom" ? "#E85D1F" : "#FAF6F0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              lineHeight: "1.4",
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            <span>{getLabel(null, null, true)}</span>
            {value === "custom" && <Check size={14} color="#ffffff" />}
          </div>
        </div>
      )}
    </div>
  );
}

export default function JamoulaOfferDetails() {
  const params = useParams();
  const router = useRouter();
  const lang = params?.lang || "en";
  const id = params?.id;
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTravelReservationModal, setShowTravelReservationModal] = useState(false);
  const [selectedPersons, setSelectedPersons] = useState(1);

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const labels = {
    en: {
      back: " ← Back to Offers",
      description: "Description",
      details: "Details",
      price: "Price",
      duration: "Duration",
      location: "Location",
      groupSize: "Group Size",
      includes: "Package Includes",
      notIncludes: "Package Not Includes",
      itinerary: "Itinerary",
      bookNow: "Book Now",
      perPerson: "per person",
      from: "From",
      contact: "Contact Information",
      paymentMethods: "Payment Methods",
      features: "Features",
      loading: "Loading offer details...",
      offerNotFound: "Offer not found",
      failedToLoad: "Failed to load offer",
      home: "Home",
      jamoulaOffers: "Jamoula Offers",
      day: "Day",
      tripCode: "Trip Code",
      days: "Days",
      destination: "Destination",
      availableTo: "Available To",
      doubleRoom: "Double Room",
      singleRoom: "Single Room",
      account: "Account",
      iban: "IBAN",
      bankTransfer: "Bank Transfer",
      electronicPayment: "Electronic Payment",
      electronicPaymentDesc: "We provide a secure electronic payment gateway by sending a payment link for the required amount"
    },
    ar: {
      back: " ← العودة للعروض",
      description: "الوصف",
      details: "التفاصيل",
      price: "السعر",
      duration: "المدة",
      location: "الموقع",
      groupSize: "حجم المجموعة",
      includes: "تشمل الباقة",
      notIncludes: "لا تشمل الباقة",
      itinerary: "البرنامج",
      bookNow: "احجز الآن",
      perPerson: "للفرد",
      from: "من",
      contact: "معلومات الاتصال",
      paymentMethods: "طرق الدفع",
      features: "المميزات",
      loading: "جارٍ تحميل تفاصيل العرض...",
      offerNotFound: "العرض غير موجود",
      failedToLoad: "فشل تحميل العرض",
      home: "الرئيسية",
      jamoulaOffers: "عروض جمولة",
      day: "اليوم",
      tripCode: "رمز الرحلة",
      days: "الأيام",
      destination: "الوجهة",
      availableTo: "متاح حتى",
      doubleRoom: "غرفة مزدوجة",
      singleRoom: "غرفة مفردة",
      account: "الحساب",
      iban: "رقم الآيبان",
      bankTransfer: "تحويل بنكي",
      electronicPayment: "الدفع الإلكتروني",
      electronicPaymentDesc: "نوفر لك بوابة دفع إلكترونية آمنة عن طريق إرسال رابط الدفع للمبلغ المطلوب"
    },
  };

  const t = labels[lang] || labels.en;

  useEffect(() => {
    if (id) {
      fetchOffer();
    }
  }, [id]);

  const fallbackOffers = [
    {
      id: "1",
      slug: "jamoula-offer-1",
      title_en: "Special Jamoula Package",
      title_ar: "عرض جمولة الخاص",
      image: "/placeholder.png",
      rating: 4.9,
      price: 2900,
      original_price: 3500,
      description_en: "Exclusive Jamoula travel package with premium amenities",
      description_ar: "باقة باقة جمولة الحصرية مع خدمات فاخرة وإقامة متميزة",
      location_en: "London",
      location_ar: "لندن",
      duration_en: "6 Days",
      duration_ar: "6 أيام",
      discount: 18,
    },
    {
      id: "jamoula-offer-1",
      slug: "jamoula-offer-1",
      title_en: "Special Jamoula Package",
      title_ar: "عرض جمولة الخاص",
      image: "/placeholder.png",
      rating: 4.9,
      price: 2900,
      original_price: 3500,
      description_en: "Exclusive Jamoula travel package with premium amenities",
      description_ar: "باقة جمولة الحصرية مع خدمات فاخرة وإقامة متميزة",
      location_en: "London",
      location_ar: "لندن",
      duration_en: "6 Days",
      duration_ar: "6 أيام",
      discount: 18,
    },
  ];

  const fetchOffer = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/jamoula-offers/${id}`);
      const data = await response.json();
      if (response.ok && data?.success && data?.data) {
        setOffer(data.data);
        setError(null);
      } else {
        const matched = fallbackOffers.find(
          (o) => String(o.id) === String(id) || o.slug === String(id)
        ) || fallbackOffers[0];
        setOffer(matched);
        setError(null);
      }
    } catch (err) {
      console.log("Using fallback offer for ID:", id);
      const matched = fallbackOffers.find(
        (o) => String(o.id) === String(id) || o.slug === String(id)
      ) || fallbackOffers[0];
      setOffer(matched);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const getPersonPricesList = (offerObj) => {
    if (!offerObj || !offerObj.person_prices) return [];
    let prices = offerObj.person_prices;
    if (typeof prices === "string") {
      try {
        prices = JSON.parse(prices);
      } catch (e) {
        prices = [];
      }
    }
    if (Array.isArray(prices)) {
      return prices
        .map((p) => ({
          persons: Number(p.persons || p.person_count || p.count || p.num),
          price: Number(p.price),
        }))
        .filter((p) => !isNaN(p.persons) && p.persons > 0 && !isNaN(p.price));
    }
    return [];
  };

  useEffect(() => {
    if (offer) {
      const list = getPersonPricesList(offer);
      if (list.length > 0) {
        setSelectedPersons(list[0].persons);
      }
    }
  }, [offer]);

  // Improved getLocalizedText function that handles more cases
  const getLocalizedText = (value, fallback = "") => {
    if (!value) return fallback;
    if (typeof value === "string") return value;
    if (typeof value !== "object") return fallback;

    // If it's an array, try to get the first item or join
    if (Array.isArray(value)) {
      return value.length > 0 ? value[0] : fallback;
    }

    // Check for Arabic version first if lang is Arabic
    if (lang === "ar") {
      // Try various Arabic field names
      const arValue =
        value.ar ||
        value.arabic ||
        value.title_ar ||
        value.name_ar ||
        value.feature_ar ||
        value.include_ar ||
        value.not_include_ar ||
        value.description_ar ||
        value.text_ar ||
        value.label_ar ||
        value.address_ar ||
        value.value_ar ||
        value.title ||
        value.name ||
        value.feature ||
        value.include ||
        value.not_include ||
        value.description ||
        value.text ||
        value.label ||
        value.address ||
        value.value;

      // If we found an Arabic value, return it
      if (arValue && typeof arValue === "string") return arValue;
      if (arValue && typeof arValue === "object") return JSON.stringify(arValue);

      // Fallback to English if no Arabic found
      const enValue =
        value.en ||
        value.english ||
        value.title_en ||
        value.name_en ||
        value.feature_en ||
        value.include_en ||
        value.not_include_en ||
        value.description_en ||
        value.text_en ||
        value.label_en ||
        value.address_en ||
        value.value_en;

      return enValue || fallback;
    } else {
      // English version
      const enValue =
        value.en ||
        value.english ||
        value.title_en ||
        value.name_en ||
        value.feature_en ||
        value.include_en ||
        value.not_include_en ||
        value.description_en ||
        value.text_en ||
        value.label_en ||
        value.address_en ||
        value.value_en ||
        value.title ||
        value.name ||
        value.feature ||
        value.include ||
        value.not_include ||
        value.description ||
        value.text ||
        value.label ||
        value.address ||
        value.value;

      if (enValue && typeof enValue === "string") return enValue;
      if (enValue && typeof enValue === "object") return JSON.stringify(enValue);

      // Fallback to Arabic if no English found
      const arValue =
        value.ar ||
        value.arabic ||
        value.title_ar ||
        value.name_ar ||
        value.feature_ar ||
        value.include_ar ||
        value.not_include_ar ||
        value.description_ar ||
        value.text_ar ||
        value.label_ar ||
        value.address_ar ||
        value.value_ar;

      return arValue || fallback;
    }
  };

  const getText = (obj, field) => {
    if (!obj) return "";

    // Handle specific fields with priority
    if (field === "title") {
      if (lang === "ar") {
        return obj.title_ar || obj.title_en || obj.title || "";
      }
      return obj.title_en || obj.title_ar || obj.title || "";
    }

    if (field === "description") {
      if (lang === "ar") {
        return obj.description_ar || obj.description_en || obj.description || "";
      }
      return obj.description_en || obj.description_ar || obj.description || "";
    }

    if (field === "long_description") {
      if (lang === "ar") {
        return obj.long_description_ar || obj.long_description_en || obj.long_description || "";
      }
      return obj.long_description_en || obj.long_description_ar || obj.long_description || "";
    }

    if (field === "duration") {
      if (lang === "ar") {
        return obj.duration_ar || obj.duration_en || obj.duration || "";
      }
      return obj.duration_en || obj.duration_ar || obj.duration || "";
    }

    if (field === "location") {
      if (lang === "ar") {
        return obj.location_ar || obj.location_en || obj.location || "";
      }
      return obj.location_en || obj.location_ar || obj.location || "";
    }

    if (field === "group_size") {
      if (lang === "ar") {
        return obj.group_size_ar || obj.group_size_en || obj.group_size || "";
      }
      return obj.group_size_en || obj.group_size_ar || obj.group_size || "";
    }

    // Generic field handling
    const fieldKey = lang === "ar" ? `${field}_ar` : `${field}_en`;
    return obj[fieldKey] || obj[`${field}_en`] || obj[`${field}_ar`] || obj[field] || "";
  };

  // Helper to safely parse JSON fields
  const safeParseArray = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    if (data && typeof data === "object") {
      if (Object.values(data).every((v) => typeof v === "object")) {
        return Object.values(data);
      }
      return [];
    }
    return [];
  };

  const getFeatures = (field) => {
    if (!offer) return [];
    const data = lang === "ar" ? offer[`${field}_ar`] : offer[`${field}_en`];
    return safeParseArray(data);
  };

  const getItinerary = () => {
    if (!offer) return [];
    const data = lang === "ar" ? offer.itinerary_ar : offer.itinerary_en;
    return safeParseArray(data);
  };

  const getPaymentMethods = () => {
    if (!offer) return [];
    const data = offer.payment_methods;
    return safeParseArray(data);
  };

  const getContactInfo = () => {
    if (!offer) return {};
    const data = offer.contact_info;
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return {};
      }
    }
    return data || {};
  };

  const getBasicInfo = () => {
    if (!offer) return {};
    const data = offer.basic_info;
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return {};
      }
    }
    return data || {};
  };

  const getImageUrl = (img) => {
    if (!img) return "/placeholder.png";
    if (/^https?:\/\//.test(img)) return img;
    const backendBase = API_URL.replace(/\/api\/?$/, "");
    if (img.startsWith("/")) return `${backendBase}${img}`;
    return `${backendBase}/storage/${img}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Text copied to clipboard: " + text);
      })
      .catch((err) => {
        console.error("Unable to copy text to clipboard", err);
      });
  };

  const handleBookNow = () => {
    console.log("Opening booking modal for offer:", offer);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="offer-details">
        <div
          className="container"
          style={{ padding: "100px 0", textAlign: "center" }}
        >
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: "20px", color: "#666" }}>
            {t.loading}
          </p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div
        className="container"
        style={{ padding: "100px 0", textAlign: "center" }}
      >
        <p style={{ color: "#ff6b6b" }}>{error || t.offerNotFound}</p>
        <button
          onClick={() => router.push(`/${lang}/jamoulaoffers`)}
          className="btn-back"
          style={{
            marginTop: "20px",
            padding: "10px 30px",
            background: "#dfa528",
            color: "#fff",
            border: "none",
            borderRadius: "25px",
            cursor: "pointer",
          }}
        >
          {t.back}
        </button>
      </div>
    );
  }

  const features = getFeatures("features");
  const includes = getFeatures("includes");
  const notIncludes = getFeatures("not_includes");
  const itinerary = getItinerary();
  const rawContactInfo = getContactInfo();
  const contactInfo = {
    address: rawContactInfo.address || (lang === "ar" ? "حي الربوة، جدة" : "Al Rabwa District, Jeddah"),
    phone: rawContactInfo.phone || "+966547305060",
    whatsapp: rawContactInfo.whatsapp || "+966547305060",
    email: rawContactInfo.email || "info@tilalr.com"
  };

  const paymentMethods = [
    // {
    //   name: lang === "ar" ? "مصرف الراجحي" : "Al Rajhi Bank",
    //   account_no: "11111111",
    //   iban: "SA1111111111111",
    // },
    {
      name: lang === "ar" ? "إس تي سي باي" : "STC Pay",
      account_no: "22222222",
      iban: "SA2222222222222",
    },
  ];
  const basicInfo = getBasicInfo();

  return (
    <>
      <div className="offer-details" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="container" style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}>
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <a href={`/${lang}`}>{t.home}</a>
            <span> / </span>
            <a href={`/${lang}/jamoulaoffers`}>{t.jamoulaOffers}</a>
            <span> / </span>
            <span className="current">{getText(offer, "title")}</span>
          </nav>

          {/* Header */}
          <div className="offer-header">
            <h1>{getText(offer, "title")}</h1>
            {offer.rating && (
              <div className="rating">
                <span>⭐</span>
                <span>{offer.rating}</span>
              </div>
            )}
          </div>

          {/* Main Image */}
          <div className="main-image">
            <img
              src={getImageUrl(offer.image)}
              alt={getText(offer, "title")}
              onError={(e) => {
                e.target.src = "/placeholder.png";
              }}
            />
            {offer.discount && (
              <span className="discount-badge">{offer.discount}% OFF</span>
            )}
          </div>

          {/* Gallery */}
          {offer.gallery &&
            Array.isArray(offer.gallery) &&
            offer.gallery.length > 0 && (
              <div className="gallery">
                {offer.gallery.map((img, index) => (
                  <img
                    key={index}
                    src={getImageUrl(img)}
                    alt={`Gallery ${index + 1}`}
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />
                ))}
              </div>
            )}

          {/* Description */}
          <div className="sidebar-panel" style={{ marginBottom: "30px" }}>
            <div className="panel-header">
              <FileText size={18} color="#fff" />
              <h4>{t.description}</h4>
            </div>
            <div className="panel-body">
              <p style={{ margin: 0 }}>
                {getText(offer, "long_description") ||
                  getText(offer, "description")}
              </p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="quick-info" style={{ marginBottom: "30px" }}>
            <div className="info-item">
              <span className="label">{t.price}</span>
              <span className="value">
                <span className="current-price">
                  {(() => {
                    const list = getPersonPricesList(offer);
                    const matched = list.find((p) => p.persons === selectedPersons);
                    return matched ? matched.price : offer.price;
                  })()}{" "}
                  <Image
                    src="/saudi_riyal.png"
                    alt="SAR"
                    width={16}
                    height={16}
                    className="currency-icon"
                  />
                </span>
                <span className="per">{t.perPerson}</span>
              </span>
            </div>

            {getPersonPricesList(offer).length > 0 && (
              <div className="info-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "6px", width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box" }}>
                <span className="label" style={{ fontWeight: "700", color: "#1C0052", fontSize: "0.95rem" }}>
                  {lang === "ar" ? "العروض المتاحة :" : "Available Offers :"}
                </span>
                <OfferCustomSelect
                  personPrices={getPersonPricesList(offer)}
                  value={selectedPersons}
                  onChange={(val) => {
                    if (val === "custom") {
                      setShowTravelReservationModal(true);
                    } else {
                      setSelectedPersons(Number(val));
                    }
                  }}
                  isRTL={lang === "ar"}
                  lang={lang}
                />
              </div>
            )}
            {getText(offer, "duration") && (
              <div className="info-item">
                <span className="label">{t.duration}</span>
                <span className="value">{getText(offer, "duration")}</span>
              </div>
            )}
            {getText(offer, "location") && (
              <div className="info-item">
                <span className="label">{t.location}</span>
                <span className="value">{getText(offer, "location")}</span>
              </div>
            )}
            {getText(offer, "group_size") && (
              <div className="info-item">
                <span className="label">{t.groupSize}</span>
                <span className="value">{getText(offer, "group_size")}</span>
              </div>
            )}
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="sidebar-panel" style={{ marginBottom: "30px" }}>
              <div className="panel-header">
                <Star size={18} color="#fff" />
                <h4>{t.features}</h4>
              </div>
              <div className="panel-body">
                <ul className="features-list">
                  {features.map((item, index) => (
                    <li key={index}>
                      {getLocalizedText(item, typeof item === "string" ? item : "")}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Includes */}
          {includes.length > 0 && (
            <div className="sidebar-panel" style={{ marginBottom: "30px" }}>
              <div className="panel-header">
                <CheckCircle size={18} color="#fff" />
                <h4>{t.includes}</h4>
              </div>
              <div className="panel-body">
                <ul className="includes-list">
                  {includes.map((item, index) => (
                    <li key={index}>
                      ✓{" "}
                      {getLocalizedText(item, typeof item === "string" ? item : "")}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Not Includes */}
          {notIncludes.length > 0 && (
            <div className="sidebar-panel" style={{ marginBottom: "30px" }}>
              <div className="panel-header">
                <XCircle size={18} color="#fff" />
                <h4>{t.notIncludes}</h4>
              </div>
              <div className="panel-body">
                <ul className="not-includes-list">
                  {notIncludes.map((item, index) => (
                    <li key={index}>
                      ✗{" "}
                      {getLocalizedText(item, typeof item === "string" ? item : "")}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Itinerary */}
          {itinerary.length > 0 && (
            <div className="sidebar-panel" style={{ marginBottom: "30px" }}>
              <div className="panel-header">
                <Calendar size={18} color="#fff" />
                <h4>{t.itinerary}</h4>
              </div>
              <div className="panel-body">
                <div className="itinerary">
                  {itinerary.map((day, index) => (
                    <motion.div
                      key={index}
                      className="day-card"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <h4>
                        {t.day} {day.day}: {getLocalizedText(day.title, day.title) || getLocalizedText(day, "title") || day.title || "Title"}
                      </h4>
                      <p>{getLocalizedText(day.description, day.description) || getLocalizedText(day, "description") || day.description || "Description"}</p>
                      {day.image && (
                        <img
                          src={getImageUrl(day.image)}
                          alt={`Day ${day.day}`}
                          onError={(e) => {
                            e.target.src = "/placeholder.png";
                          }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Basic Info */}
          {Object.keys(basicInfo).length > 0 && (
            <div className="sidebar-panel" style={{ marginBottom: "30px" }}>
              <div className="panel-header">
                <Luggage size={18} color="#fff" />
                <h4>{t.details}</h4>
              </div>
              <div className="panel-body">
                <div className="contact-grid">
                  {basicInfo.trip_code && (
                    <div>🆔 {t.tripCode}: {basicInfo.trip_code}</div>
                  )}
                  {basicInfo.days_num && <div>📅 {t.days}: {basicInfo.days_num}</div>}
                  {basicInfo.destination_name && (
                    <div>📍 {t.destination}: {getLocalizedText(basicInfo, "destination_name") || basicInfo.destination_name}</div>
                  )}
                  {basicInfo.available_to && (
                    <div>📆 {t.availableTo}: {basicInfo.available_to}</div>
                  )}
                  {basicInfo.double_room && (
                    <div>
                      🛏️ {t.doubleRoom}: {basicInfo.double_room}{" "}
                      <Image
                        src="/saudi_riyal.png"
                        alt="SAR"
                        width={12}
                        height={12}
                        className="currency-icon"
                      />
                    </div>
                  )}
                  {basicInfo.single_room && (
                    <div>
                      🛏️ {t.singleRoom}: {basicInfo.single_room}{" "}
                      <Image
                        src="/saudi_riyal.png"
                        alt="SAR"
                        width={12}
                        height={12}
                        className="currency-icon"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          {Object.keys(contactInfo).length > 0 && (
            <div className="sidebar-panel" style={{ marginBottom: "30px" }}>
              <div className="panel-header">
                <Headphones size={18} color="#fff" />
                <h4>{t.contact}</h4>
              </div>
              <div className="panel-body">
                <ul className="contact-list">
                  {contactInfo.address && (
                    <li>
                      <MapPin size={16} color="#E85D1F" />
                      <a href="https://maps.app.goo.gl/WakCAhdZsZERp1M97" target="_blank" rel="noopener noreferrer">
                        <span>{contactInfo.address}</span>
                      </a>
                    </li>
                  )}
                  {contactInfo.phone && (
                    <>
                      <li className="divider"></li>
                      <li>
                        <Phone size={16} color="#E85D1F" />
                        <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
                      </li>
                    </>
                  )}
                  {contactInfo.whatsapp && (
                    <>
                      <li className="divider"></li>
                      <li>
                        <MessageSquare size={16} color="#E85D1F" />
                        <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\s/g, "")}`} target="_blank" rel="noopener noreferrer">
                          {contactInfo.whatsapp}
                        </a>
                      </li>
                    </>
                  )}
                  {contactInfo.email && (
                    <>
                      <li className="divider"></li>
                      <li>
                        <Mail size={16} color="#E85D1F" />
                        <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div className="sidebar-panel" style={{ marginBottom: "30px" }}>
            <div className="panel-header">
              <CreditCard size={18} color="#fff" />
              <h4>{t.paymentMethods}</h4>
            </div>
            <div className="panel-body">
              <h5 className="payment-title">1. {t.bankTransfer}</h5>
              {[
                {
                  name: lang === "ar" ? "بنك الإنماء" : "Alinma Bank",
                  account_no: "68205990876000",
                  iban: "SA3705000068205990876000",
                },
                // {
                //   name: lang === "ar" ? "مصرف الراجحي" : "Al Rajhi Bank",
                //   account_no: "SA6780000189608010004821",
                //   iban: "SA6780000189608010004821",
                // },
              ].map((method, index, arr) => (
                <div key={index} className="bank-item">
                  <div className="bank-details">
                    <div className="bank-row">
                      <span className="bank-label">{lang === "ar" ? "الاسم" : "Name"} :</span>
                      <span className="bank-number">{method.name}</span>
                    </div>
                    {method.account_no && (
                      <div className="bank-row">
                        <span className="bank-label">{lang === "ar" ? "رقم الحساب" : "Account No."} :</span>
                        <span className="bank-number">{method.account_no}</span>
                        <button
                          className="copy-btn"
                          onClick={() => copyToClipboard(method.account_no)}
                          title="Copy Account"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    )}
                    {method.iban && (
                      <div className="bank-row">
                        <span className="bank-label">{lang === "ar" ? "رقم الآيبان" : "IBAN"} :</span>
                        <span className="bank-number">{method.iban}</span>
                        <button
                          className="copy-btn"
                          onClick={() => copyToClipboard(method.iban)}
                          title="Copy IBAN"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  {index < arr.length - 1 && (
                    <div className="divider"></div>
                  )}
                </div>
              ))}
              <div className="divider"></div>
              <h5 className="payment-title">2. {t.electronicPayment}</h5>
              <p className="electronic-text">{t.electronicPaymentDesc}</p>
              <img
                className="payment-logos"
                src="https://travelerclub.sa.com/images/verified.webp"
                alt="Payment Methods"
              />
            </div>
          </div>

          {/* Book Now */}
          <div className="book-now-section">
            <button className="btn-book-now" onClick={handleBookNow}>
              {t.bookNow}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal - Pass offer data */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => {
          console.log("Closing modal");
          setShowBookingModal(false);
        }}
        packageData={offer}
        lang={lang}
        bookingType="jamoula_offer"
        initialGuests={selectedPersons}
        onOpenCustomModal={() => setShowTravelReservationModal(true)}
      />

      <TravelReservationModal
        isOpen={showTravelReservationModal}
        onClose={() => setShowTravelReservationModal(false)}
        packageData={offer}
        lang={lang}
        bookingType="jamoula_offer"
      />

      <style jsx>{`
        .offer-details {
          padding: 150px 0 100px; /* Clear floating navbar & provide space before footer */
          background: #FAF6F0; /* Soft Desert Sand theme variant */
          min-height: 100vh;
        }

        .breadcrumb {
          padding: 10px 0 20px;
          font-size: 0.95rem;
          color: #666;
        }

        .breadcrumb a {
          color: #1C0052; /* Deep Heritage Purple */
          text-decoration: none;
          font-weight: 500;
        }

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        .breadcrumb .current {
          color: #666;
        }

        .btn-back {
          background: transparent;
          border: none;
          color: #1C0052;
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 20px;
          padding: 8px 0;
          font-weight: 600;
        }

        .btn-back:hover {
          text-decoration: underline;
        }

        .offer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .offer-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #E85D1F; /* Deep Heritage Purple */
          margin: 0;
        }

        .rating {
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .main-image {
          position: relative;
          border-radius: 10px; /* 10px rounded corners */
          overflow: hidden;
          margin-bottom: 30px;
        }

        .main-image img {
          width: 100%;
          max-height: 500px;
          object-fit: cover;
        }

        .discount-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #E85D1F; /* Desert Sunset Orange */
          color: white;
          padding: 8px 20px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 1rem;
        }

        .gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .gallery img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 10px;
        }

        .section {
          background: white;
          padding: 30px;
          border-radius: 10px;
          margin-bottom: 30px;
          border: 1px solid rgba(28, 0, 82, 0.06);
          box-shadow: 0 4px 15px rgba(28, 0, 82, 0.04);
        }

        .section h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1C0052;
          margin-bottom: 15px;
        }

        .section p {
          font-size: 1rem;
          line-height: 1.8;
          color: #555;
          white-space: pre-line;
        }

        .quick-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          background: white;
          padding: 25px;
          border-radius: 10px;
          margin-bottom: 30px;
          border: 1px solid rgba(28, 0, 82, 0.06);
          box-shadow: 0 4px 15px rgba(28, 0, 82, 0.04);
        }

        .info-item {
          text-align: center;
        }

        .info-item .label {
          display: block;
          font-size: 0.85rem;
          color: #888;
          margin-bottom: 5px;
        }

        .info-item .value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1C0052;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .currency-icon {
          display: inline-block;
          vertical-align: middle;
        }

        .original-price {
          text-decoration: line-through;
          color: #999;
          font-size: 0.9rem;
          margin-right: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .current-price {
          color: #E85D1F; /* Desert Sunset Orange */
          font-size: 1.3rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .per {
          font-size: 0.8rem;
          color: #888;
          font-weight: 400;
        }

        .features-list,
        .includes-list,
        .not-includes-list {
          list-style: none;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 10px;
        }

        .features-list li,
        .includes-list li,
        .not-includes-list li {
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 10px;
          color: #555;
        }

        .itinerary {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .day-card {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          border-left: 4px solid #E85D1F; /* Sunset Orange border marker */
        }

        .day-card h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1C0052;
          margin-bottom: 10px;
        }

        .day-card p {
          font-size: 0.95rem;
          line-height: 1.8;
          color: #555;
          margin-bottom: 10px;
          white-space: pre-line;
        }

        .day-card img {
          width: 100%;
          max-height: 200px;
          object-fit: cover;
          border-radius: 10px;
        }

        .sidebar-panel {
          background: #fff;
          border-radius: 10px;
          border: 1px solid rgba(28, 0, 82, 0.06);
          box-shadow: 0 4px 15px rgba(28, 0, 82, 0.04);
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px 20px;
          background: #E85D1F; /* Deep Heritage Purple header */
        }

        .panel-header h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          margin: 0;
        }

        .panel-body {
          padding: 18px 20px;
        }

        .contact-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .contact-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          font-size: 0.9rem;
          color: #555;
        }

        .contact-list li a {
          color: #555;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .contact-list li a:hover {
          color: #E85D1F;
        }

        .payment-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1C0052;
          margin: 10px 0 15px;
        }

        .bank-item {
          margin-bottom: 15px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 10px;
          text-align: left;
        }

        .bank-item:last-child {
          margin-bottom: 0;
        }

        .bank-logo {
          max-height: 35px;
          margin-bottom: 8px;
          display: block;
        }

        .bank-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .bank-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .bank-label {
          font-size: 0.85rem;
          color: #888;
          font-weight: 500;
          min-width: 90px;
        }

        .bank-number {
          font-size: 0.85rem;
          color: #2c2c2c;
          font-weight: 600;
          word-break: break-all;
        }

        .copy-btn {
          background: transparent;
          border: none;
          color: #E85D1F;
          cursor: pointer;
          padding: 2px 5px;
          transition: color 0.3s ease;
        }

        .copy-btn:hover {
          color: #FFC60B;
        }

        .electronic-text {
          font-size: 0.85rem;
          color: #555;
          line-height: 1.6;
          margin: 10px 0;
          text-align: left;
        }

        .payment-logos {
          max-height: 40px;
          margin-top: 10px;
          display: block;
        }

        .payment-card img {
          max-height: 40px;
          margin-bottom: 10px;
        }

        .payment-card h5 {
          font-size: 1rem;
          font-weight: 600;
          color: #1C0052;
          margin-bottom: 8px;
        }

        .payment-card p {
          font-size: 0.85rem;
          color: #555;
          margin: 3px 0;
        }

        .book-now-section {
          text-align: center;
          margin-top: 40px;
          margin-bottom: 40px;
          padding-bottom: 20px;
        }

        .btn-book-now {
          background: linear-gradient(135deg, #E85D1F 0%, #FFC60B 100%); /* Sunset to Dune gradient */
          color: white;
          border: none;
          padding: 14px 50px;
          border-radius: 10px; /* 10px border radius */
          font-weight: 700;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(232, 93, 31, 0.25);
        }

        .btn-book-now:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(232, 93, 31, 0.45);
        }

        @media (max-width: 768px) {
          .offer-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .offer-header h1 {
            font-size: 2rem;
          }

          .quick-info {
            grid-template-columns: 1fr;
          }

          .gallery {
            grid-template-columns: repeat(2, 1fr);
          }

          .features-list,
          .includes-list,
          .not-includes-list {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .gallery {
            grid-template-columns: 1fr;
          }

          .section {
            padding: 20px;
          }

          .btn-book-now {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
