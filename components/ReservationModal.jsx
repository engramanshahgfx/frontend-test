"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL, getToken } from "../lib/api";
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  Users,
  Building2,
  GraduationCap,
  HeartHandshake,
  UserCheck,
  Compass,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
  Globe,
  FileText,
  Hotel,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useUI } from "../providers/UIProvider";
import { useAuth } from "../providers/AuthProvider";

export default function ReservationModal() {
  const params = useParams();
  const lang = params?.lang || "en";
  const isRTL = lang === "ar";

  const { reservationModal, closeReservationModal, triggerDashboardRefresh } = useUI();
  const { user } = useAuth();
  const isOpen = reservationModal?.open;
  const destination = reservationModal?.trip || null;

  const [requestType, setRequestType] = useState("individual"); // 'individual' | 'company' | 'school'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reservationRef, setReservationRef] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [showValidationError, setShowValidationError] = useState(false);

  const getDefaultDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const defaultDate = getDefaultDate();

  const [formData, setFormData] = useState({
    // Individual fields
    first_name: "",
    last_name: "",
    nationality: "",
    passport_number: "",
    departure_city: "",

    // Company / School fields
    organization_name: "",
    contact_person_name: "",
    cr_number: "",
    country: "",
    city_location: "",
    address: "",
    passports_info: "",

    // Shared fields
    email: "",
    mobile: "",
    preferred_travel_date: defaultDate,
    number_of_adults: 1,
    number_of_children: 0,
    room_type: "Double",
    hotel_preference: "",
    special_requests: "",
    notes: "",
    confirmed: true,
  });

  // Sync state on modal open
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setIsSubmitted(false);
      setSubmitError(null);
      setShowValidationError(false);

      const titleLower = String(destination?.title || destination?.type || destination?.category || "").toLowerCase();

      let defaultType = destination?.type || destination?.category || "individual";
      if (
        destination?.type === "school" ||
        destination?.category === "school" ||
        titleLower.includes("school") ||
        titleLower.includes("student") ||
        titleLower.includes("جامع") ||
        titleLower.includes("مدرس") ||
        titleLower.includes("مدارس") ||
        titleLower.includes("مدراس") ||
        titleLower.includes("طلاب") ||
        titleLower.includes("تعليم")
      ) {
        defaultType = "school";
      } else if (
        destination?.type === "company" ||
        destination?.type === "corporate" ||
        destination?.category === "company" ||
        destination?.category === "corporate" ||
        titleLower.includes("company") ||
        titleLower.includes("corporate") ||
        titleLower.includes("شرك") ||
        titleLower.includes("أعمال") ||
        titleLower.includes("مؤسس")
      ) {
        defaultType = "company";
      } else if (
        destination?.type === "family" ||
        destination?.type === "private" ||
        destination?.category === "family" ||
        destination?.category === "private" ||
        titleLower.includes("family") ||
        titleLower.includes("group") ||
        titleLower.includes("عوائل") ||
        titleLower.includes("عائل") ||
        titleLower.includes("مجموعات") ||
        titleLower.includes("خاص")
      ) {
        defaultType = "family";
      }

      setRequestType(defaultType);

      setFormData({
        first_name: user?.name?.split(" ")[0] || "",
        last_name: user?.name?.split(" ").slice(1).join(" ") || "",
        nationality: "",
        passport_number: "",
        departure_city: "",
        organization_name: "",
        contact_person_name: user?.name || "",
        cr_number: "",
        country: isRTL ? "السعودية" : "Saudi Arabia",
        city_location: isRTL ? "الرياض" : "Riyadh",
        address: "",
        passports_info: "",
        email: user?.email || "",
        mobile: user?.phone || "",
        preferred_travel_date: defaultDate,
        number_of_adults: destination?.guests || 1,
        number_of_children: 0,
        room_type: "Double",
        hotel_preference: "",
        special_requests: "",
        notes: "",
        confirmed: true,
      });
    }
  }, [isOpen, destination, user, isRTL]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const getHeaderInfo = () => {
    if (requestType === "school") {
      return {
        title: isRTL ? "طلب حجز المدارس والجامعات" : "School & Educational Request",
        subtitle: isRTL ? "رحلات تعليمية وترفيهية مخصصة للطلاب" : "Educational & Recreational Student Trips",
        icon: <GraduationCap size={22} />,
      };
    }
    if (requestType === "company") {
      return {
        title: isRTL ? "طلب حجز الشركات والأعمال" : "Company & Corporate Request",
        subtitle: isRTL ? "خدمات سفر وإقامة متكاملة للشركات" : "Corporate & Business Travel Solutions",
        icon: <Building2 size={22} />,
      };
    }
    if (requestType === "family") {
      return {
        title: isRTL ? "رحلات العوائل والمجموعات الخاصة" : "Family & Private Group Trips Request",
        subtitle: isRTL ? "شركة التلال والرمال لتنظيم الرحلات" : "Tilal Rimal Tourism Organization",
        icon: <HeartHandshake size={22} />,
      };
    }
    return {
      title: destination?.title ? destination.title : (isRTL ? "طلب حجز رحلة سياحية" : "Travel Reservation Form"),
      subtitle: isRTL ? "شركة التلال والرمال لتنظيم الرحلات" : "Tilal Rimal Tourism Organization",
      icon: <Compass size={22} />,
    };
  };

  const headerInfo = getHeaderInfo();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (showValidationError) setShowValidationError(false);
  };

  const isFormValid = () => {
    if (!formData.email || !formData.mobile || !formData.preferred_travel_date || !formData.confirmed) {
      return false;
    }

    if (requestType === "individual") {
      return !!formData.first_name && !!formData.last_name;
    }

    if (requestType === "school") {
      return !!formData.organization_name && !!formData.contact_person_name && !!formData.city_location;
    }

    if (requestType === "company") {
      return !!formData.organization_name && !!formData.contact_person_name && !!formData.country && !!formData.city_location;
    }

    if (requestType === "family") {
      return !!formData.contact_person_name;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      setShowValidationError(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const fullName = requestType === "individual"
        ? `${formData.first_name} ${formData.last_name}`.trim()
        : formData.contact_person_name;

      // Map frontend requestType to backend expected trip_type
      let mappedTripType = requestType;
      if (requestType === "company") {
        mappedTripType = "corporate";
      } else if (requestType === "individual") {
        mappedTripType = "family";
      }

      const token = getToken();
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: fullName,
          email: formData.email,
          phone: formData.mobile,
          trip_type: mappedTripType,
          trip_slug: destination?.slug || null,
          trip_title: headerInfo.title,
          preferred_date: formData.preferred_travel_date,
          guests: Number(formData.number_of_adults) || 1,
          notes: formData.notes || formData.special_requests,
          details: {
            ...formData,
            request_type: requestType,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMsg = result?.message;
        if (result?.errors) {
          const firstErrKey = Object.keys(result.errors)[0];
          const firstErrList = result.errors[firstErrKey];
          errorMsg = Array.isArray(firstErrList) ? firstErrList[0] : String(firstErrList);
        }
        throw new Error(errorMsg || (isRTL ? "فشل إرسال طلب الحجز" : "Failed to complete reservation"));
      }

      setReservationRef(result.reservation?.id || `REF-${Math.floor(100000 + Math.random() * 900000)}`);
      setIsSubmitted(true);
      triggerDashboardRefresh?.();

      setTimeout(() => {
        closeReservationModal();
        setIsSubmitted(false);
        setIsSubmitting(false);
      }, 4000);
    } catch (error) {
      console.error("Reservation Error:", error);
      setIsSubmitting(false);
      setSubmitError(error?.message || (isRTL ? "حدث خطأ أثناء إرسال طلب الحجز" : "Error submitting reservation request"));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          direction: isRTL ? "rtl" : "ltr",
        }}
        onClick={closeReservationModal}
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            width: "100%",
            maxWidth: "680px",
            maxHeight: "90vh",
            boxShadow: "0 25px 65px rgba(0, 0, 0, 0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Header Bar */}
          <div
            style={{
                background: "#E85D1F",
              color: "#F9E5D2",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "3.5px solid #F9E5D2",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(232, 93, 31, 0.18)",
                  border: "1.5px solid #F9E5D2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#F9E5D2",
                }}
              >
                {headerInfo.icon}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#F9E5D2" }}>
                  {headerInfo.title}
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#F9E5D2" }}>
                  {headerInfo.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={closeReservationModal}
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                border: "none",
                color: "#F9E5D2",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body */}
          <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
            {submitError && (
              <div
                style={{
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fca5a5",
                  color: "#991b1b",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  marginBottom: "16px",
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <AlertCircle size={18} />
                <span>{submitError}</span>
              </div>
            )}

            {isSubmitted ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    backgroundColor: "#d1fae5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <CheckCircle2 size={44} />
                </div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1C0052", marginBottom: "8px" }}>
                  {isRTL ? "تم استلام طلب الحجز بنجاح!" : "Reservation Submitted Successfully!"}
                </h3>
                <p style={{ color: "#4b5563", fontSize: "0.95rem", marginBottom: "16px" }}>
                  {isRTL
                    ? "سيتواصل معك فريق الحجوزات بشركة التلال والرمال خلال 24 ساعة لتأكيد التفاصيل."
                    : "Our team at Tilal Rimal will contact you within 24 hours to confirm your booking."}
                </p>
                {reservationRef && (
                  <div
                    style={{
                      display: "inline-block",
                      backgroundColor: "#FAF6F0",
                      border: "1.5px dashed #E85D1F",
                      padding: "10px 20px",
                      borderRadius: "12px",
                      fontWeight: 700,
                      color: "#1C0052",
                      fontSize: "1rem",
                    }}
                  >
                    {isRTL ? "رقم المرجعية: " : "Reference No: "} {reservationRef}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="reservation-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>

                  {/* INDIVIDUAL FIELDS */}
                  {requestType === "individual" && (
                    <>
                      {/* First Name */}
                      <div style={{ gridColumn: "span 1" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                          {isRTL ? "الاسم الأول *" : "First Name *"}
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          placeholder={isRTL ? "الاسم الأول" : "First Name"}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: showValidationError && !formData.first_name ? "1.5px solid #ef4444" : "1.5px solid #EFE4D2",
                            backgroundColor: "#FAF6F0",
                            color: "#1C0052",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      {/* Last Name */}
                      <div style={{ gridColumn: "span 1" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                          {isRTL ? "اسم العائلة *" : "Last Name *"}
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          placeholder={isRTL ? "اسم العائلة" : "Last Name"}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: showValidationError && !formData.last_name ? "1.5px solid #ef4444" : "1.5px solid #EFE4D2",
                            backgroundColor: "#FAF6F0",
                            color: "#1C0052",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      {/* Nationality */}
                      <div style={{ gridColumn: "span 1" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                          {isRTL ? "الجنسية" : "Nationality"}
                        </label>
                        <input
                          type="text"
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleInputChange}
                          placeholder={isRTL ? "الجنسية" : "Nationality"}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: "1.5px solid #EFE4D2",
                            backgroundColor: "#FAF6F0",
                            color: "#1C0052",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      {/* Passport Number */}
                      <div style={{ gridColumn: "span 1" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                          {isRTL ? "رقم الجواز" : "Passport Number"}
                        </label>
                        <input
                          type="text"
                          name="passport_number"
                          value={formData.passport_number}
                          onChange={handleInputChange}
                          placeholder="A12345678"
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: "1.5px solid #EFE4D2",
                            backgroundColor: "#FAF6F0",
                            color: "#1C0052",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      {/* Departure City */}
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                          {isRTL ? "مدينة المغادرة" : "Departure City"}
                        </label>
                        <input
                          type="text"
                          name="departure_city"
                          value={formData.departure_city}
                          onChange={handleInputChange}
                          placeholder={isRTL ? "مثال: الرياض، جدة" : "e.g. Riyadh, Jeddah"}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: "1.5px solid #EFE4D2",
                            backgroundColor: "#FAF6F0",
                            color: "#1C0052",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>
                    </>
                  )}

                  {/* FAMILY FIELDS */}
                  {requestType === "family" && (
                    <>
                      {/* Contact Person Name */}
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                          {isRTL ? "اسم الشخص المسؤول للتواصل *" : "Contact Person Name *"}
                        </label>
                        <input
                          type="text"
                          name="contact_person_name"
                          value={formData.contact_person_name}
                          onChange={handleInputChange}
                          placeholder={isRTL ? "اسم الشخص المسؤول للتواصل" : "Contact Person Name"}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: showValidationError && !formData.contact_person_name ? "1.5px solid #ef4444" : "1.5px solid #EFE4D2",
                            backgroundColor: "#FAF6F0",
                            color: "#1C0052",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>
                    </>
                  )}

                  {/* COMPANY FIELDS */}
                  {requestType === "company" && (
                    <>
                      {/* Company Name */}
                      <div style={{ gridColumn: "span 1" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                          {isRTL ? "اسم الشركة / المؤسسة *" : "Company / Corporate Name *"}
                        </label>
                        <input
                          type="text"
                          name="organization_name"
                          value={formData.organization_name}
                          onChange={handleInputChange}
                          placeholder={isRTL ? "اسم الشركة / المؤسسة" : "Company Name"}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: showValidationError && !formData.organization_name ? "1.5px solid #ef4444" : "1.5px solid #EFE4D2",
                            backgroundColor: "#FAF6F0",
                            color: "#1C0052",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      {/* Contact Person Name */}
                      <div style={{ gridColumn: "span 1" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                          {isRTL ? "اسم الشخص المسؤول للتواصل *" : "Contact Person Name *"}
                        </label>
                        <input
                          type="text"
                          name="contact_person_name"
                          value={formData.contact_person_name}
                          onChange={handleInputChange}
                          placeholder={isRTL ? "اسم الشخص المسؤول للتواصل" : "Contact Person Name"}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: showValidationError && !formData.contact_person_name ? "1.5px solid #ef4444" : "1.5px solid #EFE4D2",
                            backgroundColor: "#FAF6F0",
                            color: "#1C0052",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      {/* CR Number */}
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                          {isRTL ? "رقم السجل التجاري / الرقم الضريبي" : "CR / Tax Registration Number"}
                        </label>
                        <input
                          type="text"
                          name="cr_number"
                          value={formData.cr_number}
                          onChange={handleInputChange}
                          placeholder="1010XXXXXX"
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: "1.5px solid #EFE4D2",
                            backgroundColor: "#FAF6F0",
                            color: "#1C0052",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      {/* Company Country */}
                      <div style={{ gridColumn: "span 1" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                          {isRTL ? "دولة الشركة *" : "Company Country *"}
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder={isRTL ? "السعودية، الإمارات..." : "Saudi Arabia, UAE..."}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: showValidationError && !formData.country ? "1.5px solid #ef4444" : "1.5px solid #EFE4D2",
                            backgroundColor: "#FAF6F0",
                            color: "#1C0052",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      {/* Company Location / City */}
                      <div style={{ gridColumn: "span 1" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                          {isRTL ? "مدينة / موقع الشركة *" : "Company Location / City *"}
                        </label>
                        <input
                          type="text"
                          name="city_location"
                          value={formData.city_location}
                          onChange={handleInputChange}
                          placeholder={isRTL ? "الرياض، جدة..." : "Riyadh, Jeddah..."}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: showValidationError && !formData.city_location ? "1.5px solid #ef4444" : "1.5px solid #EFE4D2",
                            backgroundColor: "#FAF6F0",
                            color: "#1C0052",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      {/* Company Address */}
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                          {isRTL ? "عنوان الشركة المفصل" : "Detailed Company Address"}
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder={isRTL ? "العنوان المفصل..." : "Detailed address..."}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: "1.5px solid #EFE4D2",
                            backgroundColor: "#FAF6F0",
                            color: "#1C0052",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>
                    </>
                  )}

                  {/* SCHOOL FIELDS */}
                  {requestType === "school" && (
                    <>
                      {/* School Name */}
                      <div style={{ gridColumn: "span 1" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                          {isRTL ? "اسم المدرسة *" : "School Name *"}
                        </label>
                        <input
                          type="text"
                          name="organization_name"
                          value={formData.organization_name}
                          onChange={handleInputChange}
                          placeholder={isRTL ? "اسم المدرسة" : "School Name"}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: showValidationError && !formData.organization_name ? "1.5px solid #ef4444" : "1.5px solid #EFE4D2",
                            backgroundColor: "#FAF6F0",
                            color: "#1C0052",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      {/* Contact Person Name */}
                      <div style={{ gridColumn: "span 1" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                          {isRTL ? "اسم الشخص المسؤول للتواصل *" : "Contact Person Name *"}
                        </label>
                        <input
                          type="text"
                          name="contact_person_name"
                          value={formData.contact_person_name}
                          onChange={handleInputChange}
                          placeholder={isRTL ? "اسم الشخص المسؤول للتواصل" : "Contact Person Name"}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: showValidationError && !formData.contact_person_name ? "1.5px solid #ef4444" : "1.5px solid #EFE4D2",
                            backgroundColor: "#FAF6F0",
                            color: "#1C0052",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>

                      {/* School Location / City */}
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                          {isRTL ? "مدينة / موقع المدرسة *" : "School Location / City *"}
                        </label>
                        <input
                          type="text"
                          name="city_location"
                          value={formData.city_location}
                          onChange={handleInputChange}
                          placeholder={isRTL ? "الرياض، جدة..." : "Riyadh, Jeddah..."}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "12px",
                            border: showValidationError && !formData.city_location ? "1.5px solid #ef4444" : "1.5px solid #EFE4D2",
                            backgroundColor: "#FAF6F0",
                            color: "#1C0052",
                            fontSize: "0.9rem",
                            outline: "none",
                          }}
                        />
                      </div>
                    </>
                  )}

                  {/* SHARED CONTACT & TRIP FIELDS */}
                  {/* Email */}
                  <div style={{ gridColumn: "span 1" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                      {isRTL ? "البريد الإلكتروني *" : "Email Address *"}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@domain.com"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        border: showValidationError && !formData.email ? "1.5px solid #ef4444" : "1.5px solid #EFE4D2",
                        backgroundColor: "#FAF6F0",
                        color: "#1C0052",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Mobile */}
                  <div style={{ gridColumn: "span 1" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                      {isRTL ? "رقم الجوال / الهاتف *" : "Mobile / Phone Number *"}
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="+966 50 000 0000"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        border: showValidationError && !formData.mobile ? "1.5px solid #ef4444" : "1.5px solid #EFE4D2",
                        backgroundColor: "#FAF6F0",
                        color: "#1C0052",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Preferred Travel Date */}
                  <div style={{ gridColumn: "span 1" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                      {isRTL ? "تاريخ السفر المفضل *" : "Preferred Travel Date *"}
                    </label>
                    <input
                      type="date"
                      name="preferred_travel_date"
                      value={formData.preferred_travel_date}
                      onChange={handleInputChange}
                      min={defaultDate}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        border: showValidationError && !formData.preferred_travel_date ? "1.5px solid #ef4444" : "1.5px solid #EFE4D2",
                        backgroundColor: "#FAF6F0",
                        color: "#1C0052",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Number of Persons */}
                  <div style={{ gridColumn: "span 1" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                      {isRTL ? "عدد الأشخاص" : "Number of Persons"}
                    </label>
                    <input
                      type="number"
                      name="number_of_adults"
                      min={1}
                      max={500}
                      value={formData.number_of_adults}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1.5px solid #EFE4D2",
                        backgroundColor: "#FAF6F0",
                        color: "#1C0052",
                        fontSize: "0.9rem",
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Number of Children */}
                  {requestType !== "company" && (
                    <div style={{ gridColumn: "span 1" }}>
                      <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                        {isRTL ? "عدد الأطفال" : "Number of Children"}
                      </label>
                      <input
                        type="number"
                        name="number_of_children"
                        min={0}
                        max={500}
                        value={formData.number_of_children}
                        onChange={handleInputChange}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "12px",
                          border: "1.5px solid #EFE4D2",
                          backgroundColor: "#FAF6F0",
                          color: "#1C0052",
                          fontSize: "0.9rem",
                          outline: "none",
                        }}
                      />
                    </div>
                  )}

                  {/* Special Requests */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                      {isRTL ? "طلبات خاصة" : "Special Requests"}
                    </label>
                    <textarea
                      name="special_requests"
                      rows={2}
                      value={formData.special_requests}
                      onChange={handleInputChange}
                      placeholder={isRTL ? "أي طلبات خاصة..." : "Any special requests..."}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1.5px solid #EFE4D2",
                        backgroundColor: "#FAF6F0",
                        color: "#1C0052",
                        fontSize: "0.9rem",
                        outline: "none",
                        resize: "none",
                      }}
                    />
                  </div>

                  {/* Additional Notes */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "6px", display: "block" }}>
                      {isRTL ? "ملاحظات إضافية" : "Additional Notes"}
                    </label>
                    <textarea
                      name="notes"
                      rows={2}
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder={isRTL ? "ملاحظات إضافية..." : "Additional notes..."}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1.5px solid #EFE4D2",
                        backgroundColor: "#FAF6F0",
                        color: "#1C0052",
                        fontSize: "0.9rem",
                        outline: "none",
                        resize: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Confirmation Checkbox */}
                <div style={{ marginTop: "16px", marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      color: "#374151",
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="checkbox"
                      name="confirmed"
                      checked={formData.confirmed}
                      onChange={handleInputChange}
                      style={{
                        width: "18px",
                        height: "18px",
                        accentColor: "#E85D1F",
                      }}
                    />
                    <span>{isRTL ? "أؤكد أن المعلومات المذكورة أعلاه صحيحة." : "I confirm that the above information is correct."}</span>
                  </label>
                </div>

                {showValidationError && !isFormValid() && (
                  <div style={{ color: "#ef4444", fontSize: "0.82rem", marginBottom: "12px", textAlign: "center", fontWeight: 600 }}>
                    {isRTL ? "يرجى تعبئة جميع الحقول المطلوبة بالشكل الصحيح" : "Please complete all required fields correctly"}
                  </div>
                )}

                {/* Submit Action Button */}
                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      padding: "14px 28px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#E85D1F",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "1rem",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      opacity: isSubmitting ? 0.7 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 14px rgba(232, 93, 31, 0.35)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                        <span>{isRTL ? "جاري إرسال الطلب..." : "Submitting Request..."}</span>
                      </>
                    ) : (
                      <span>{isRTL ? "إرسال طلب الحجز" : "Submit Reservation Request"}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}