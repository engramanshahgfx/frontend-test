"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, User, Mail, Phone, Calendar, Users } from "lucide-react";
import { API_URL } from "@/lib/api";

export default function BookingModal({ isOpen, onClose, packageData, lang }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    guests: 1,
    notes: "",
  });
  const [errors, setErrors] = useState({});

  const isRTL = lang === "ar";

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = isRTL ? "الاسم مطلوب" : "Name is required";
    if (!formData.email) {
      newErrors.email = isRTL ? "البريد الإلكتروني مطلوب" : "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = isRTL ? "البريد الإلكتروني غير صحيح" : "Email is invalid";
    }
    if (!formData.phone) newErrors.phone = isRTL ? "رقم الهاتف مطلوب" : "Phone is required";
    if (!formData.date) newErrors.date = isRTL ? "التاريخ مطلوب" : "Date is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          package_id: packageData?.id,
          package_name: packageData?.title_en,
        }),
      });

      if (response.ok) {
        setStep(2);
      }
    } catch (error) {
      console.error("Booking error:", error);
    }
    setLoading(false);
  };

  const labels = {
    en: {
      title: "Book Now",
      name: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      date: "Travel Date",
      guests: "Number of Guests",
      notes: "Special Requests",
      submit: "Submit Booking",
      cancel: "Cancel",
      success: "Booking Submitted!",
      successMessage: "We will contact you shortly to confirm your booking.",
    },
    ar: {
      title: "احجز الآن",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      date: "تاريخ السفر",
      guests: "عدد الضيوف",
      notes: "طلبات خاصة",
      submit: "إرسال الحجز",
      cancel: "إلغاء",
      success: "تم إرسال الحجز!",
      successMessage: "سنتواصل معك قريباً لتأكيد حجزك.",
    },
  };

  const t = labels[lang] || labels.en;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="booking-modal-overlay"
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "30px",
              position: "relative",
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "15px",
                [isRTL ? "left" : "right"]: "20px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "24px",
                color: "#999",
                zIndex: 10,
              }}
            >
              <X size={24} />
            </button>

            {step === 1 ? (
              <>
                <h2 style={{ marginBottom: "20px", color: "#2c2c2c" }}>
                  {t.title}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                      {t.name} <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <User size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "10px 12px 10px 40px",
                          border: errors.name ? "2px solid #dc3545" : "2px solid #e0e0e0",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </div>
                    {errors.name && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.name}</span>}
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                      {t.email} <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "10px 12px 10px 40px",
                          border: errors.email ? "2px solid #dc3545" : "2px solid #e0e0e0",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </div>
                    {errors.email && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.email}</span>}
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                      {t.phone} <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Phone size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "10px 12px 10px 40px",
                          border: errors.phone ? "2px solid #dc3545" : "2px solid #e0e0e0",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </div>
                    {errors.phone && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.phone}</span>}
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                      {t.date} <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Calendar size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        style={{
                          width: "100%",
                          padding: "10px 12px 10px 40px",
                          border: errors.date ? "2px solid #dc3545" : "2px solid #e0e0e0",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </div>
                    {errors.date && <span style={{ color: "#dc3545", fontSize: "12px" }}>{errors.date}</span>}
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                      {t.guests}
                    </label>
                    <div style={{ position: "relative" }}>
                      <Users size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                      <input
                        type="number"
                        name="guests"
                        value={formData.guests}
                        onChange={handleChange}
                        min="1"
                        max="20"
                        style={{
                          width: "100%",
                          padding: "10px 12px 10px 40px",
                          border: "2px solid #e0e0e0",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>
                      {t.notes}
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        border: "2px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={onClose}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "#f0f0f0",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 2,
                        padding: "12px",
                        background: "#dfa528",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "600",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? "..." : t.submit}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "#d4edda",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <Check size={40} color="#28a745" />
                </div>
                <h3 style={{ color: "#28a745", marginBottom: "10px" }}>{t.success}</h3>
                <p style={{ color: "#666" }}>{t.successMessage}</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}