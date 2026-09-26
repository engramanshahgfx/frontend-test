"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Phone,
  Wifi,
  Send,
  CheckCircle,
  Clock,
  Headphones,
  Zap,
  DollarSign,
  Shield,
  TrendingUp,
  Award,
  Sparkles,
  ChevronRight,
  Smartphone,
  Hotspot,
  Zap as Battery,
  MapPin,
  Signal,
} from "lucide-react";
import { API_URL } from "@/lib/api";

const translations = {
  en: {
    title: "Global Internet Packages",
    subtitle: "Stay connected in over 200 countries with lightning-fast internet",
    formTitle: "Get Connected Instantly",
    country: "Destination Country",
    countryPlaceholder: "Select or enter your destination",
    mobileNumber: "Mobile Number",
    mobilePlaceholder: "+966 5X XXX XXXX",
    package: "Choose Your Package",
    selectPackage: "Select data package",
    submit: "Request Package",
    submitting: "Processing...",
    submitSuccess: "Package activated successfully!",
    submitError: "Failed to activate package. Please try again.",
    popular: "Most Popular",
    bestValue: "Best Value",
    features: {
      title: "Premium Features",
      global: "Global Coverage",
      globalDesc: "Seamless connectivity in 200+ countries",
      fast: "Lightning Fast",
      fastDesc: "5G speed available in major cities",
      affordable: "Best Price",
      affordableDesc: "Save up to 70% on roaming charges",
      support: "Priority Support",
      supportDesc: "24/7 dedicated assistance",
    },
    trustIndicators: {
      title: "Trusted Worldwide",
      customers: "Happy Travelers",
      coverage: "Countries",
      uptime: "Network Reliability",
    },
    contactInfo: "Need Assistance?",
    workingHours: "Support Available",
    workingHoursDetail: "24/7 - Global Support Team",
    callUs: "Call Center",
    emailUs: "Email Support",
    instantActivation: "Instant Activation",
    noHiddenFees: "No Hidden Fees",
    easyTopup: "Easy Top-up",
  },
  ar: {
    title: "باقات الإنترنت العالمية",
    subtitle: "ابقَ متصلاً في أكثر من 200 دولة مع إنترنت فائق السرعة",
    formTitle: "احصل على الاتصال فوراً",
    country: "الدولة المقصودة",
    countryPlaceholder: "اختر أو أدخل وجهتك",
    mobileNumber: "رقم الجوال",
    mobilePlaceholder: "+966 5X XXX XXXX",
    package: "اختر باقتك",
    selectPackage: "اختر باقة البيانات",
    submit: " ارسل الطلب",
    submitting: "جاري المعالجة...",
    submitSuccess: "تم تفعيل الباقة بنجاح!",
    submitError: "فشل تفعيل الباقة. يرجى المحاولة مرة أخرى.",
    popular: "الأكثر طلباً",
    bestValue: "أفضل قيمة",
    features: {
      title: "ميزات متميزة",
      global: "تغطية عالمية",
      globalDesc: "اتصال سلس في أكثر من 200 دولة",
      fast: "سرعة البرق",
      fastDesc: "سرعة 5G متوفرة في المدن الكبرى",
      affordable: "أفضل سعر",
      affordableDesc: "وفر حتى 70% من رسوم التجوال",
      support: "دعم مميز",
      supportDesc: "مساعدة مخصصة على مدار الساعة",
    },
    trustIndicators: {
      title: "موثوق عالمياً",
      customers: "مسافرون سعداء",
      coverage: "دولة",
      uptime: "موثوقية الشبكة",
    },
    contactInfo: "بحاجة إلى مساعدة؟",
    workingHours: "الدعم متاح",
    workingHoursDetail: "24/7 - فريق دعم عالمي",
    callUs: "مركز الاتصال",
    emailUs: "الدعم عبر البريد",
    instantActivation: "تفعيل فوري",
    noHiddenFees: "بدون رسوم خفية",
    easyTopup: "شحن سهل",
  },
};

export default function InternetPackagesForm({ lang = "en" }) {
  const currentLang = lang || "en";
  const t = translations[currentLang];
  const isRTL = currentLang === "ar";

  const [formData, setFormData] = useState({
    country: "",
    mobile_number: "",
    package: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [selectedCountryFlag, setSelectedCountryFlag] = useState("🌍");

  const packages = [
    { value: "1GB", label: "1 GB", price: "$10", validity: "7 days", speed: "4G/LTE", popular: false, bestValue: false },
    { value: "3GB", label: "3 GB", price: "$25", validity: "15 days", speed: "4G/LTE", popular: true, bestValue: false },
    { value: "5GB", label: "5 GB", price: "$40", validity: "30 days", speed: "5G Ready", popular: false, bestValue: true },
    { value: "10GB", label: "10 GB", price: "$70", validity: "30 days", speed: "5G Ready", popular: false, bestValue: false },
    { value: "20GB", label: "20 GB", price: "$130", validity: "60 days", speed: "5G Ultra", popular: false, bestValue: false },
    { value: "50GB", label: "50 GB", price: "$300", validity: "90 days", speed: "5G Ultra", popular: false, bestValue: false },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "country" && value) {
      const countryFlags = {
        "saudi": "🇸🇦", "uae": "🇦🇪", "egypt": "🇪🇬", "usa": "🇺🇸",
        "uk": "🇬🇧", "france": "🇫🇷", "germany": "🇩🇪", "italy": "🇮🇹",
        "spain": "🇪🇸", "turkey": "🇹🇷", "japan": "🇯🇵", "china": "🇨🇳",
      };
      const countryLower = value.toLowerCase();
      for (const [key, flag] of Object.entries(countryFlags)) {
        if (countryLower.includes(key)) {
          setSelectedCountryFlag(flag);
          return;
        }
      }
      setSelectedCountryFlag("🌍");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${API_URL}/internet-packages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Internet package API error:", responseData);
        setSubmitStatus("error");
        return;
      }

      setSubmitStatus("success");
      setFormData({ country: "", mobile_number: "", package: "" });
      setSelectedCountryFlag("🌍");
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error("Error submitting internet package request:", error);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPackage = packages.find(p => p.value === formData.package);

  return (
    <div className="container py-4" style={{ direction: isRTL ? "rtl" : "ltr", overflow: "visible" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "5rem" }}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "40px" }}
        >
          <h1 style={{
            fontSize: "clamp(1.8rem, 5vw, 3.2rem)",
            fontWeight: "bold",
            marginBottom: "12px",
            color: "#1C0052"
          }}>
            {t.title}
          </h1>

          <p style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", color: "#666", maxWidth: "768px", margin: "0 auto" }}>
            {t.subtitle}
          </p>

          {/* Quick Stats Pills */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "24px",
            flexWrap: "wrap",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(232, 93, 31, 0.08)",
              border: "1px solid rgba(232, 93, 31, 0.15)",
              padding: "6px 14px",
              borderRadius: "10px",
              fontSize: "0.8rem",
              fontWeight: "500"
            }}>
              <Zap size={14} color="#E85D1F" />
              <span style={{ color: "#E85D1F" }}>{t.instantActivation}</span>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(28, 0, 82, 0.08)",
              border: "1px solid rgba(28, 0, 82, 0.15)",
              padding: "6px 14px",
              borderRadius: "10px",
              fontSize: "0.8rem",
              fontWeight: "500"
            }}>
              <Shield size={14} color="#1C0052" />
              <span style={{ color: "#1C0052" }}>{t.noHiddenFees}</span>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(232, 93, 31, 0.08)",
              border: "1px solid rgba(232, 93, 31, 0.15)",
              padding: "6px 14px",
              borderRadius: "10px",
              fontSize: "0.8rem",
              fontWeight: "500"
            }}>
              <TrendingUp size={14} color="#E85D1F" />
              <span style={{ color: "#E85D1F" }}>{t.easyTopup}</span>
            </div>
          </div>
        </motion.div>

        {/* MAIN GRID */}
        <div className="row g-4" style={{ overflow: "visible" }}>
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-lg-8"
          >
            <div style={{
              background: "#ffffff",
              borderRadius: "10px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
              border: "1px solid rgba(28, 0, 82, 0.06)"
            }}>
              <div style={{
                background: "#1C0052",
                padding: "20px 24px"
              }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "white", marginBottom: "4px" }}>{t.formTitle}</h2>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", margin: 0 }}>
                  {isRTL ? "املأ التفاصيل واحصل على اتصال سريع خلال دقائق" : "Fill out the details and get connected in minutes"}
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
                {/* Status Messages */}
                <AnimatePresence>
                  {submitStatus === "success" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px 16px",
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.3)",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        fontSize: "0.9rem"
                      }}
                    >
                      <CheckCircle size={18} color="#22c55e" />
                      <span style={{ color: "#15803d", fontWeight: "500" }}>{t.submitSuccess}</span>
                    </motion.div>
                  )}
                  {submitStatus === "error" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px 16px",
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        fontSize: "0.9rem"
                      }}
                    >
                      <div style={{
                        width: "18px",
                        height: "18px",
                        background: "#ef4444",
                        borderRadius: "9999px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        fontWeight: "bold",
                        color: "white"
                      }}>!</div>
                      <span style={{ color: "#b91c1c", fontWeight: "500" }}>{t.submitError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Fields */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      color: "#1C0052",
                      marginBottom: "6px"
                    }}>
                      <Globe size={14} color="#E85D1F" /> {t.country}
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        placeholder={t.countryPlaceholder}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          paddingRight: isRTL ? "14px" : "48px",
                          paddingLeft: isRTL ? "48px" : "14px",
                          background: "#ffffff",
                          border: "1px solid rgba(28, 0, 82, 0.15)",
                          borderRadius: "10px",
                          color: "#111",
                          outline: "none",
                          fontSize: "0.95rem",
                        }}
                      />
                      <div style={{
                        position: "absolute",
                        right: isRTL ? "auto" : "12px",
                        left: isRTL ? "12px" : "auto",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "22px",
                        pointerEvents: "none"
                      }}>
                        {selectedCountryFlag}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      color: "#1C0052",
                      marginBottom: "6px"
                    }}>
                      <Phone size={14} color="#E85D1F" /> {t.mobileNumber}
                    </label>
                    <input
                      type="tel"
                      name="mobile_number"
                      value={formData.mobile_number}
                      onChange={handleChange}
                      required
                      placeholder={t.mobilePlaceholder}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        background: "#ffffff",
                        border: "1px solid rgba(28, 0, 82, 0.15)",
                        borderRadius: "10px",
                        color: "#111",
                        outline: "none",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                </div>

                {/* Package Selection */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    color: "#1C0052",
                    marginBottom: "10px"
                  }}>
                    <Wifi size={14} color="#E85D1F" /> {t.package}
                  </label>
                  
                  <div className="row g-2">
                    {packages.map((pkg) => (
                      <div key={pkg.value} className="col-6 col-sm-4">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData(prev => ({ ...prev, package: pkg.value }))}
                          style={{
                            position: "relative",
                            width: "100%",
                            padding: "14px 12px",
                            borderRadius: "10px",
                            border: formData.package === pkg.value ? "2px solid #E85D1F" : "1px solid rgba(28, 0, 82, 0.15)",
                            background: formData.package === pkg.value ? "rgba(232, 93, 31, 0.05)" : "#ffffff",
                            textAlign: isRTL ? "right" : "left",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            minHeight: "85px",
                          }}
                        >
                          {pkg.popular && (
                            <div style={{
                              position: "absolute",
                              top: "-6px",
                              right: isRTL ? "auto" : "-6px",
                              left: isRTL ? "-6px" : "auto",
                              background: "linear-gradient(135deg, #FFC60B, #E85D1F)",
                              color: "white",
                              fontSize: "8px",
                              fontWeight: "bold",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              textTransform: "uppercase"
                            }}>
                              {t.popular}
                            </div>
                          )}
                          {pkg.bestValue && (
                            <div style={{
                              position: "absolute",
                              top: "-6px",
                              right: isRTL ? "auto" : "-6px",
                              left: isRTL ? "-6px" : "auto",
                              background: "linear-gradient(135deg, #1c0052, #E85D1F)",
                              color: "white",
                              fontSize: "8px",
                              fontWeight: "bold",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              textTransform: "uppercase"
                            }}>
                              {t.bestValue}
                            </div>
                          )}
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "6px"
                          }}>
                            <span style={{ color: "#1C0052", fontWeight: "bold", fontSize: "0.95rem" }}>{pkg.label}</span>
                            <span style={{ color: "#E85D1F", fontWeight: "bold", fontSize: "0.9rem" }}>{pkg.price}</span>
                          </div>
                          <div style={{ color: "#666", fontSize: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "2px" }}>
                              <Clock size={10} /> {pkg.validity}
                            </div>
                            <div style={{ fontWeight: "500", color: "#1C0052" }}>{pkg.speed}</div>
                          </div>
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Package Preview */}
                <AnimatePresence>
                  {selectedPackage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      style={{
                        background: "rgba(28, 0, 82, 0.04)",
                        borderRadius: "10px",
                        padding: "14px 16px",
                        border: "1px solid rgba(28, 0, 82, 0.08)",
                        marginBottom: "20px",
                      }}
                    >
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "10px"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "40px",
                            height: "40px",
                            background: "linear-gradient(135deg, #1C0052, #E85D1F)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}>
                            <Wifi size={20} color="white" />
                          </div>
                          <div>
                            <p style={{ fontWeight: "bold", color: "#1C0052", fontSize: "1rem", margin: 0 }}>{selectedPackage.label}</p>
                            <div style={{
                              display: "flex",
                              gap: "10px",
                              fontSize: "0.75rem",
                              color: "#666",
                              flexWrap: "wrap",
                              marginTop: "2px"
                            }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                <Clock size={10} /> {selectedPackage.validity}
                              </span>
                              <span style={{ fontWeight: "600", color: "#1C0052" }}>{selectedPackage.speed}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: isRTL ? "left" : "right" }}>
                          <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#E85D1F", margin: 0 }}>{selectedPackage.price}</p>
                          <p style={{ fontSize: "0.65rem", color: "#888", margin: 0 }}>{isRTL ? "دفع لمرة واحدة" : "One-time payment"}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    background: "linear-gradient(135deg, #E85D1F 0%, #FFC60B 100%)",
                    border: "none",
                    borderRadius: "10px",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 15px rgba(232, 93, 31, 0.2)",
                    transition: "all 0.2s",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Clock size={18} className="animate-spin" />
                      {t.submitting}
                    </>
                  ) : (
                    <>
                      <Send size={18} className={isRTL ? "ms-1" : "me-1"} />
                      {t.submit}
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="col-lg-4"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Features Card */}
            <div style={{
              background: "#ffffff",
              borderRadius: "10px",
              padding: "20px",
              border: "1px solid rgba(28, 0, 82, 0.06)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)"
            }}>
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: "bold",
                color: "#1C0052",
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <Award size={18} color="#E85D1F" /> {t.features.title}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { icon: Globe, bgColor: "rgba(232, 93, 31, 0.08)", iconColor: "#E85D1F", title: t.features.global, desc: t.features.globalDesc },
                  { icon: Zap, bgColor: "rgba(28, 0, 82, 0.08)", iconColor: "#1C0052", title: t.features.fast, desc: t.features.fastDesc },
                  { icon: DollarSign, bgColor: "rgba(232, 93, 31, 0.08)", iconColor: "#E85D1F", title: t.features.affordable, desc: t.features.affordableDesc },
                  { icon: Headphones, bgColor: "rgba(28, 0, 82, 0.08)", iconColor: "#1C0052", title: t.features.support, desc: t.features.supportDesc },
                ].map((feature, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      background: feature.bgColor,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <feature.icon size={18} style={{ color: feature.iconColor }} />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: "600", color: "#1C0052", fontSize: "0.9rem", marginBottom: "2px" }}>{feature.title}</h4>
                      <p style={{ fontSize: "0.8rem", color: "#666", margin: 0 }}>{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Indicators */}
            <div style={{
              background: "#ffffff",
              borderRadius: "10px",
              padding: "20px",
              border: "1px solid rgba(28, 0, 82, 0.06)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)"
            }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#1C0052", marginBottom: "14px" }}>
                {t.trustIndicators.title}
              </h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                textAlign: "center"
              }}>
                <div>
                  <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#1C0052" }}>100K+</div>
                  <div style={{ fontSize: "0.7rem", color: "#666" }}>{t.trustIndicators.customers}</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#E85D1F" }}>200+</div>
                  <div style={{ fontSize: "0.7rem", color: "#666" }}>{t.trustIndicators.coverage}</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#1C0052" }}>99.9%</div>
                  <div style={{ fontSize: "0.7rem", color: "#666" }}>{t.trustIndicators.uptime}</div>
                </div>
              </div>
            </div>

            {/* Contact Info Card */}
            <div style={{
              background: "linear-gradient(135deg, #1C0052, #3b00a8)",
              borderRadius: "10px",
              padding: "20px",
              color: "white",
              boxShadow: "0 4px 15px rgba(28, 0, 82, 0.15)"
            }}>
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: "bold",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <Headphones size={18} /> {t.contactInfo}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Clock size={16} />
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "0.85rem", margin: 0 }}>{t.workingHours}</p>
                    <p style={{ fontSize: "0.75rem", opacity: 0.8, margin: 0 }}>{t.workingHoursDetail}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Phone size={16} />
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "0.85rem", margin: 0 }}>{t.callUs}</p>
                    <p style={{ fontSize: "0.75rem", opacity: 0.8, margin: 0 }}>00966547305060</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Globe size={16} />
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "0.85rem", margin: 0 }}>{t.emailUs}</p>
                    <p style={{ fontSize: "0.75rem", opacity: 0.8, margin: 0 }}>info@tilalr.com</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}