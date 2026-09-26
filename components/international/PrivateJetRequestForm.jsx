"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  Calendar,
  Users,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Send,
  Clock,
  CheckCircle,
} from "lucide-react";
import { API_URL } from "@/lib/api";

const labels = {
  en: {
    // Hero
    premiumBadge: "Premium Service",
    title: "Private Jet Charter",
    subtitle: "Experience the pinnacle of luxury travel with our premium private jet services",
    // Form
    formTitle: "Request a Quote",
    name: "Full Name",
    namePlaceholder: "Enter your full name",
    email: "Email Address",
    emailPlaceholder: "you@example.com",
    phone: "Phone Number",
    phonePlaceholder: "+966 5X XXX XXXX",
    clientType: "Request Type",
    clientTypePlaceholder: "Select request type",
    departure: "Departure City / Airport",
    departurePlaceholder: "e.g., Riyadh Airport, Jeddah, Dubai",
    destination: "Destination City",
    destinationPlaceholder: "e.g., London, Paris, New York",
    date: "Departure Date",
    returnDate: "Return Date (optional)",
    passengers: "Number of Passengers",
    passengersPlaceholder: "Enter number",
    aircraftType: "Aircraft Preference",
    selectAircraftType: "Select aircraft type",
    aircraftOptions: {
      light: "Light Jet (4-6 pax)",
      midsize: "Midsize Jet (6-8 pax)",
      heavy: "Heavy Jet (8-14 pax)",
      vip: "VIP Airliner (14+ pax)",
      xlarge: "Extra Large Jet (20+ pax)",
    },
    specialRequests: "Special Requests",
    specialRequestsPlaceholder: "Catering, ground transportation, etc...",
    submit: "Submit Request",
    submitting: "Submitting...",
    submitSuccess: "Request Submitted Successfully!",
    submitError: "Error submitting request. Please try again.",
    // Client Type Options
    clientOptions: {
      businessman: "Businessman",
      hajj: "Hajj",
      footballTeam: "Football Team",
      government: "Government Entity",
      medical: "Medical Evacuation",
      other: "Other",
    },
    // Features
    featuresTitle: "Why Choose Us",
    luxury: "Luxury Experience",
    luxuryDesc: "Premium cabins with personalized service",
    global: "Global Network",
    globalDesc: "Access to 5,000+ private airports worldwide",
    flexibility: "Flexible Scheduling",
    flexibilityDesc: "Fly on your schedule, 24/7 availability",
    safety: "Safety First",
    safetyDesc: "FAA/EASA certified operators",
    // Contact
    contactInfo: "Contact Information",
    workingHours: "Working Hours",
    workingHoursDetail: "24/7 - Available anytime",
    callUs: "Call Us",
    emailUs: "Email Us",
    // Form helper
    formHelper: "Fill out the form and our team will contact you within 2 hours",
  },
  ar: {
    // Hero
    premiumBadge: "خدمة متميزة",
    title: "استئجار طائرة خاصة",
    subtitle: "اختبر قمة السفر الفاخر مع خدمات الطيران الخاص الحصرية لدينا",
    // Form
    formTitle: "طلب عرض سعر",
    name: "الاسم الكامل",
    namePlaceholder: "أدخل اسمك الكامل",
    email: "البريد الإلكتروني",
    emailPlaceholder: "example@you.com",
    phone: "رقم الهاتف",
    phonePlaceholder: "+966 5X XXX XXXX",
    clientType: "نوع الطلب",
    clientTypePlaceholder: "اختر نوع الطلب",
    departure: "مدينة / مطار المغادرة",
    departurePlaceholder: "مثال: مطار الرياض، جدة، دبي",
    destination: "مدينة الوصول",
    destinationPlaceholder: "مثال: لندن، باريس، نيويورك",
    date: "تاريخ المغادرة",
    returnDate: "تاريخ العودة (اختياري)",
    passengers: "عدد المسافرين",
    passengersPlaceholder: "أدخل العدد",
    aircraftType: "نوع الطائرة المفضل",
    selectAircraftType: "اختر نوع الطائرة",
    aircraftOptions: {
      light: "طائرة خفيفة (4-6 أشخاص)",
      midsize: "طائرة متوسطة (6-8 أشخاص)",
      heavy: "طائرة كبيرة (8-14 أشخاص)",
      vip: "طائرة VIP (14+ شخص)",
      xlarge: "طائرة كبيرة جداً (20+ شخص)",
    },
    specialRequests: "طلبات خاصة",
    specialRequestsPlaceholder: "تجهيزات الطعام، النقل البري، إلخ...",
    submit: "إرسل الطلب",
    submitting: "جاري الإرسال...",
    submitSuccess: "تم إرسل الطلب بنجاح!",
    submitError: "حدث خطأ في إرسل الطلب. يرجى المحاولة مرة أخرى.",
    // Client Type Options
    clientOptions: {
      businessman: "رجل أعمال",
      hajj: "حج",
      footballTeam: "فريق كرة قدم",
      government: "جهة حكومية",
      medical: "إخلاء طبي",
      other: "أخرى",
    },
    // Features
    featuresTitle: "لماذا تختارنا",
    luxury: "تجربة فاخرة",
    luxuryDesc: "مقصورات فاخرة مع خدمة شخصية",
    global: "شبكة عالمية",
    globalDesc: "الوصول إلى أكثر من 5000 مطار خاص حول العالم",
    flexibility: "جدولة مرنة",
    flexibilityDesc: "السفر في وقتك المناسب، متوفر 24/7",
    safety: "السلامة أولاً",
    safetyDesc: "مشغلون معتمدون من FAA/EASA",
    // Contact
    contactInfo: "معلومات الاتصال",
    workingHours: "ساعات العمل",
    workingHoursDetail: "24/7 - متاحون في أي وقت",
    callUs: "اتصل بنا",
    emailUs: "راسلنا",
    // Form helper
    formHelper: "املأ النموذج وسيتواصل معك فريقنا خلال ساعتين",
  },
};

export default function PrivateJetRequestForm({ lang }) {
  const currentLang = lang || "en";
  const t = labels[currentLang];
  const isRTL = currentLang === "ar";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    clientType: "",
    departure: "",
    destination: "",
    date: "",
    returnDate: "",
    passengers: "",
    aircraftType: "",
    specialRequests: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const payload = {
      name: formData.name,
      client_type: formData.clientType || "Other",
      mobile_number: formData.phone,
      email: formData.email,
      number_of_people: Number(formData.passengers),
      destination: formData.destination,
      departure_airport: formData.departure,
      departure_date: formData.date,
      return_date: formData.returnDate || null,
      special_requirements: [
        formData.aircraftType ? `Aircraft preference: ${formData.aircraftType}.` : "",
        formData.specialRequests,
      ]
        .filter(Boolean)
        .join(" "),
    };

    try {
      const response = await fetch(`${API_URL}/private-jet-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Private jet API error:", result);
        setSubmitStatus("error");
        return;
      }

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        clientType: "",
        departure: "",
        destination: "",
        date: "",
        returnDate: "",
        passengers: "",
        aircraftType: "",
        specialRequests: "",
      });
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error("Error submitting private jet request:", error);
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ 
      direction: isRTL ? "rtl" : "ltr", 
      overflow: "visible",
      paddingBottom: "5rem",
      maxWidth: "1200px"
      }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-5"
      >
        <h1 className="display-4 fw-bold mb-3" style={{ color: "#1C0052" }}>
          {t.title}
        </h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: "650px" }}>
          {t.subtitle}
        </p>
      </motion.div>

      <div className="row g-4" style={{ overflow: "visible" }}>
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="col-lg-7"
          style={{ overflow: "visible" }}
        >
          <div 
            className="card border-0 shadow-sm overflow-visible"
            style={{
              borderRadius: "10px",
              border: "1px solid rgba(28, 0, 82, 0.06)",
              backgroundColor: "#ffffff"
            }}
          >
            <div 
              className="card-header text-white py-4 px-4 border-0"
              style={{
                backgroundColor: "#1C0052",
                borderRadius: "10px 10px 0 0"
              }}
            >
              <h3 className="h4 mb-0 fw-semibold">{t.formTitle}</h3>
              <p className="text-white-50 small mt-1 mb-0">
                {t.formHelper}
              </p>
            </div>
            <div className="card-body p-4 overflow-visible">
              <form onSubmit={handleSubmit} style={{ overflow: "visible" }}>
                <div className="row g-3" style={{ overflow: "visible" }}>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: "#1C0052" }}>
                      <Users size={16} className={isRTL ? "ms-1" : "me-1"} /> {t.name}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t.namePlaceholder}
                      required
                      className="form-control form-control-lg"
                      style={{ borderRadius: "10px", borderColor: "rgba(28, 0, 82, 0.15)", fontSize: "0.95rem" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: "#1C0052" }}>
                      <Mail size={16} className={isRTL ? "ms-1" : "me-1"} /> {t.email}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t.emailPlaceholder}
                      required
                      className="form-control form-control-lg"
                      style={{ borderRadius: "10px", borderColor: "rgba(28, 0, 82, 0.15)", fontSize: "0.95rem" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: "#1C0052" }}>
                      <Phone size={16} className={isRTL ? "ms-1" : "me-1"} /> {t.phone}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t.phonePlaceholder}
                      required
                      className="form-control form-control-lg"
                      style={{ borderRadius: "10px", borderColor: "rgba(28, 0, 82, 0.15)", fontSize: "0.95rem" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: "#1C0052" }}>
                      <Plane size={16} className={isRTL ? "ms-1" : "me-1"} /> {t.clientType}
                    </label>
                    <select
                      name="clientType"
                      value={formData.clientType}
                      onChange={handleChange}
                      required
                      className={`form-select form-select-lg pj-select ${isRTL ? 'text-end' : 'text-start'}`}
                      style={{ 
                        direction: isRTL ? 'rtl' : 'ltr',
                        borderRadius: "10px",
                        borderColor: "rgba(28, 0, 82, 0.15)",
                        fontSize: "0.95rem"
                      }}
                    >
                      <option value="" disabled>
                        {t.clientTypePlaceholder}
                      </option>
                      <option value="Businessman">{t.clientOptions.businessman}</option>
                      <option value="Hajj">{t.clientOptions.hajj}</option>
                      <option value="Football Team">{t.clientOptions.footballTeam}</option>
                      <option value="Government Entity">{t.clientOptions.government}</option>
                      <option value="Medical Evacuation">{t.clientOptions.medical}</option>
                      <option value="Other">{t.clientOptions.other}</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: "#1C0052" }}>
                      <Calendar size={16} className={isRTL ? "ms-1" : "me-1"} /> {t.date}
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="form-control form-control-lg"
                      style={{ borderRadius: "10px", borderColor: "rgba(28, 0, 82, 0.15)", fontSize: "0.95rem" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: "#1C0052" }}>
                      <Calendar size={16} className={isRTL ? "ms-1" : "me-1"} /> {t.returnDate}
                    </label>
                    <input
                      type="date"
                      name="returnDate"
                      value={formData.returnDate}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      style={{ borderRadius: "10px", borderColor: "rgba(28, 0, 82, 0.15)", fontSize: "0.95rem" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: "#1C0052" }}>
                      <MapPin size={16} className={isRTL ? "ms-1" : "me-1"} /> {t.departure}
                    </label>
                    <input
                      type="text"
                      name="departure"
                      value={formData.departure}
                      onChange={handleChange}
                      placeholder={t.departurePlaceholder}
                      required
                      className="form-control form-control-lg"
                      style={{ borderRadius: "10px", borderColor: "rgba(28, 0, 82, 0.15)", fontSize: "0.95rem" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: "#1C0052" }}>
                      <MapPin size={16} className={isRTL ? "ms-1" : "me-1"} /> {t.destination}
                    </label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      placeholder={t.destinationPlaceholder}
                      required
                      className="form-control form-control-lg"
                      style={{ borderRadius: "10px", borderColor: "rgba(28, 0, 82, 0.15)", fontSize: "0.95rem" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: "#1C0052" }}>
                      <Users size={16} className={isRTL ? "ms-1" : "me-1"} /> {t.passengers}
                    </label>
                    <input
                      type="number"
                      name="passengers"
                      value={formData.passengers}
                      onChange={handleChange}
                      placeholder={t.passengersPlaceholder}
                      required
                      min="1"
                      className="form-control form-control-lg"
                      style={{ borderRadius: "10px", borderColor: "rgba(28, 0, 82, 0.15)", fontSize: "0.95rem" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ color: "#1C0052" }}>
                      <Plane size={16} className={isRTL ? "ms-1" : "me-1"} /> {t.aircraftType}
                    </label>
                    <select
                      name="aircraftType"
                      value={formData.aircraftType}
                      onChange={handleChange}
                      required
                      className={`form-select form-select-lg pj-select ${isRTL ? 'text-end' : 'text-start'}`}
                      style={{ 
                        direction: isRTL ? 'rtl' : 'ltr',
                        borderRadius: "10px",
                        borderColor: "rgba(28, 0, 82, 0.15)",
                        fontSize: "0.95rem"
                      }}
                    >
                      <option value="" disabled hidden>
                        {t.selectAircraftType}
                      </option>
                      <option value="light" style={{ color: '#111' }}>{t.aircraftOptions.light}</option>
                      <option value="midsize" style={{ color: '#111' }}>{t.aircraftOptions.midsize}</option>
                      <option value="heavy" style={{ color: '#111' }}>{t.aircraftOptions.heavy}</option>
                      <option value="vip" style={{ color: '#111' }}>{t.aircraftOptions.vip}</option>
                      <option value="xlarge" style={{ color: '#111' }}>{t.aircraftOptions.xlarge}</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold" style={{ color: "#1C0052" }}>
                      <MessageCircle size={16} className={isRTL ? "ms-1" : "me-1"} /> {t.specialRequests}
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      rows="4"
                      placeholder={t.specialRequestsPlaceholder}
                      className="form-control"
                      style={{ borderRadius: "10px", borderColor: "rgba(28, 0, 82, 0.15)", fontSize: "0.95rem" }}
                    />
                  </div>
                  <div className="col-12 mt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-lg w-100 fw-semibold text-white transition-all"
                      style={{
                        background: "#E85D1F ",
                        border: "none",
                        padding: "14px",
                        borderRadius: "10px",
                        boxShadow: "0 4px 15px rgba(232, 93, 31, 0.2)"
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          {t.submitting}
                        </>
                      ) : (
                        <>
                          <Send size={18} className={isRTL ? "ms-2" : "me-2"} /> {t.submit}
                        </>
                      )}
                    </button>
                  </div>
                  {submitStatus === "success" && (
                    <div className="alert alert-success d-flex align-items-center gap-2" style={{ borderRadius: "10px" }}>
                      <CheckCircle size={18} />
                      {t.submitSuccess}
                    </div>
                  )}
                  {submitStatus === "error" && (
                    <div className="alert alert-danger" style={{ borderRadius: "10px" }}>{t.submitError}</div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Features & Contact Section */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="col-lg-5"
        >
          <div 
            className="card border-0 shadow-sm mb-4 overflow-hidden"
            style={{
              borderRadius: "10px",
              border: "1px solid rgba(28, 0, 82, 0.06)",
              backgroundColor: "#ffffff"
            }}
          >
            <div 
              className="card-header text-white py-3 px-4 border-0"
              style={{
                backgroundColor: "#1C0052"
              }}
            >
              <h4 className="h5 mb-0 fw-semibold">{t.featuresTitle}</h4>
            </div>
            <div className="card-body p-4">
              <div className="d-flex gap-3 mb-4">
                <div 
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "rgba(232, 93, 31, 0.08)",
                    borderRadius: "10px",
                    width: "50px",
                    height: "50px",
                    flexShrink: 0
                  }}
                >
                  <Plane size={24} style={{ color: "#E85D1F" }} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: "#1C0052" }}>{t.luxury}</h6>
                  <p className="text-muted small mb-0">{t.luxuryDesc}</p>
                </div>
              </div>
              <div className="d-flex gap-3 mb-4">
                <div 
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "rgba(28, 0, 82, 0.08)",
                    borderRadius: "10px",
                    width: "50px",
                    height: "50px",
                    flexShrink: 0
                  }}
                >
                  <MapPin size={24} style={{ color: "#1C0052" }} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: "#1C0052" }}>{t.global}</h6>
                  <p className="text-muted small mb-0">{t.globalDesc}</p>
                </div>
              </div>
              <div className="d-flex gap-3 mb-4">
                <div 
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "rgba(232, 93, 31, 0.08)",
                    borderRadius: "10px",
                    width: "50px",
                    height: "50px",
                    flexShrink: 0
                  }}
                >
                  <Clock size={24} style={{ color: "#E85D1F" }} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: "#1C0052" }}>{t.flexibility}</h6>
                  <p className="text-muted small mb-0">{t.flexibilityDesc}</p>
                </div>
              </div>
              <div className="d-flex gap-3">
                <div 
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "rgba(28, 0, 82, 0.08)",
                    borderRadius: "10px",
                    width: "50px",
                    height: "50px",
                    flexShrink: 0
                  }}
                >
                  <CheckCircle size={24} style={{ color: "#1C0052" }} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1" style={{ color: "#1C0052" }}>{t.safety}</h6>
                  <p className="text-muted small mb-0">{t.safetyDesc}</p>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="card border-0 shadow-sm overflow-hidden"
            style={{
              borderRadius: "10px",
              border: "1px solid rgba(28, 0, 82, 0.06)",
              backgroundColor: "#ffffff"
            }}
          >
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3" style={{ color: "#1C0052" }}>{t.contactInfo}</h5>
              <div className="border-bottom pb-3 mb-3" style={{ borderColor: "rgba(28, 0, 82, 0.06)" }}>
                <p className="text-muted small mb-1">{t.workingHours}</p>
                <p className="fw-semibold mb-0" style={{ color: "#1C0052" }}>{t.workingHoursDetail}</p>
              </div>
              <div className="border-bottom pb-3 mb-3" style={{ borderColor: "rgba(28, 0, 82, 0.06)" }}>
                <p className="text-muted small mb-1">{t.callUs}</p>
                <p className="fw-semibold mb-0" style={{ color: "#E85D1F" }}>966547305060</p>
              </div>
              <div>
                <p className="text-muted small mb-1">{t.emailUs}</p>
                <p className="fw-semibold mb-0" style={{ color: "#E85D1F" }}>info@tilalr.com</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <style jsx>{`
        .pj-select {
          background-color: #ffffff !important;
          color: #1a1a1a !important;
          border-color: rgba(28, 0, 82, 0.15) !important;
          box-shadow: none !important;
          appearance: menulist !important;
        }

        .pj-select option {
          background-color: #ffffff !important;
          color: #1a1a1a !important;
        }

        .pj-select:focus {
          border-color: #E85D1F !important;
          outline: 0 !important;
          box-shadow: 0 0 0 0.2rem rgba(232, 93, 31, 0.15) !important;
        }
      `}</style>
    </div>
  );
}