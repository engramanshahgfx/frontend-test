"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  Calendar,
  User,
  Mail,
  Phone,
  Globe,
  FileText,
  MapPin,
  Users,
  Clock,
  Hotel,
  MessageSquare,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ShieldCheck,
  Plane,
  Building,
} from "lucide-react";
import Image from "next/image";
import { API_URL } from "@/lib/api";

// Helper function to safely strip HTML tags & entities from API strings
const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
};

export default function TravelReservationModal({
  isOpen,
  onClose,
  packageData,
  lang = "en",
}) {
  const isRTL = lang === "ar";
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [referenceNo, setReferenceNo] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [reservationType, setReservationType] = useState("individual");

  const [formData, setFormData] = useState({
    // Individual fields
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    nationality: "",
    passport_number: "",
    departure_city: "",

    // Company fields
    company_name: "",
    contact_person_name: "",
    company_cr_number: "",
    company_country: "",
    company_location: "",
    company_address: "",
    company_passports_info: "",

    // Shared fields
    preferred_travel_date: "",
    number_of_adults: 1,
    number_of_children: 0,
    room_type: "Double",
    hotel_preference: "",
    special_requests: "",
    notes: "",
    confirmed: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSubmitError("");
      setLoading(false);
      setErrors({});
      setReservationType("individual");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const labels = {
    en: {
      step1Title: "Selected Package Summary",
      packageName: "Package Name",
      destination: "Destination",
      duration: "Duration",
      tripCode: "Trip Code",
      description: "Description",
      continue: "Continue to Reservation Form",

      step2Title: "Reservation Request Form",
      reservationTypeLabel: "Reservation Type",
      individualType: "Individual Request",
      companyType: "Company / Corporate Request",

      // Individual Fields
      firstName: "First Name",
      lastName: "Last Name",
      nationality: "Nationality",
      passportNumber: "Passport Number",
      departureCity: "Departure City",
      numberOfAdults: "Number of Adults",
      numberOfChildren: "Number of Children",

      // Company Fields
      companyName: "Company / Corporate Name",
      contactPersonName: "Contact Person Name",
      companyCrNumber: "CR / Tax Registration Number",
      companyCountry: "Company Country",
      companyLocation: "Company Location / City",
      companyAddress: "Company Address",
      companyPassportsInfo: "Employee Passports & Group Details",
      numberOfEmployees: "Number of Passengers / Employees",
      accommodationPreference: "Accommodation Preference",

      // Shared Fields
      email: "Email Address",
      mobile: "Mobile / Phone Number",
      preferredTravelDate: "Preferred Travel Date",
      roomType: "Room Type",
      roomSingle: "Single Room",
      roomDouble: "Double Room",
      roomTriple: "Triple Room",
      hotelPreference: "Hotel Preference",
      specialRequests: "Special Requests",
      notes: "Additional Notes",
      confirmCheck: "I confirm that the above information is correct.",
      back: "Back",
      submitReservation: "Submit Reservation",

      step3Title: "Reservation Request Submitted Successfully",
      thankYou: "Thank you for your reservation request.",
      successMsg:
        "Our reservations team will manually review your request and contact you as soon as possible to confirm availability and provide complete booking details.",
      bookingReference: "Booking Reference",
      close: "Close",
      na: "N/A",
      required: "This field is required",
    },
    ar: {
      step1Title: "ملخص الباقة المختارة",
      packageName: "اسم الباقة",
      destination: "الوجهة",
      duration: "المدة",
      tripCode: "رمز الرحلة",
      description: "الوصف",
      continue: "المتابعة لنموذج الحجز",

      step2Title: "نموذج طلب الحجز",
      reservationTypeLabel: "نوع الطلب",
      individualType: "طلب فردي",
      companyType: "طلب المدارس / الشركات والمؤسسات",

      // Individual Fields
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      nationality: "الجنسية",
      passportNumber: "رقم الجواز",
      departureCity: "مدينة المغادرة",
      numberOfAdults: "عدد البالغين",
      numberOfChildren: "عدد الأطفال",

      // Company / School Fields
      companyName: "اسم المدرسة / الشركة",
      contactPersonName: "اسم الشخص المسؤول للتواصل",
      companyCrNumber: "رقم السجل التجاري / الرقم الضريبي",
      companyCountry: "دولة المدرسة / الشركة",
      companyLocation: "مدينة / موقع المدرسة / الشركة",
      companyAddress: "عنوان المدرسة / الشركة المفصل",
      companyPassportsInfo: "معلومات جوازات الموظفين / المجموعة",
      numberOfEmployees: "عدد المسافرين / الموظفين",
      accommodationPreference: "تفضيل الإقامة والسكن",

      // Shared Fields
      email: "البريد الإلكتروني",
      mobile: "رقم الجوال / الهاتف",
      preferredTravelDate: "تاريخ السفر المفضل",
      roomType: "نوع الغرفة",
      roomSingle: "غرفة مفردة",
      roomDouble: "غرفة مزدوجة",
      roomTriple: "غرفة ثلاثية",
      hotelPreference: "تفضل الفندق",
      specialRequests: "طلبات خاصة",
      notes: "ملاحظات إضافية",
      confirmCheck: "أؤكد أن المعلومات المذكورة أعلاه صحيحة.",
      back: "رجوع",
      submitReservation: "إرسال طلب الحجز",

      step3Title: "تم تقديم طلب الحجز بنجاح",
      thankYou: "شكراً لك على تقديم طلب الحجز.",
      successMsg:
        "سوف يقوم فريق الحجوزات بمراجعة طلبك يدوياً والتواصل معك في أقرب وقت ممكن لتأكيد التوفر وتزويدك بالتفاصيل الكاملة.",
      bookingReference: "رقم مرجع الحجز",
      close: "إغلاق",
      na: "غير متوفر",
      required: "هذا الحقل مطلوب",
    },
  };
  const t = labels[lang] || labels.en;

  const getFieldValue = (field) => {
    if (!packageData) return "";
    if (isRTL && packageData[`${field}_ar`]) return packageData[`${field}_ar`];
    if (packageData[`${field}_en`]) return packageData[`${field}_en`];
    if (packageData[field]) return packageData[field];
    return "";
  };

  const pkgTitle =
    stripHtml(getFieldValue("title")) ||
    packageData?.name ||
    packageData?.title ||
    "";

  const pkgDestination =
    stripHtml(getFieldValue("location")) || packageData?.region || packageData?.destination || "";

  const pkgDuration =
    stripHtml(getFieldValue("duration")) || packageData?.duration || "";

  const pkgTripCode =
    packageData?.trip_code ||
    packageData?.basic_info?.trip_code ||
    packageData?.code ||
    "";

  const rawDescription =
    getFieldValue("description") ||
    getFieldValue("short_description") ||
    getFieldValue("long_description") ||
    packageData?.description ||
    packageData?.short_description ||
    packageData?.long_description ||
    "";

  const pkgDescription = stripHtml(rawDescription);

  const getImageUrl = (imageData) => {
    if (!imageData) return "/placeholder.png";
    if (/^https?:\/\//.test(imageData)) return imageData;
    const backendBase = API_URL.replace(/\/api\/?$/, "");
    if (imageData.startsWith("/")) return `${backendBase}${imageData}`;
    return `${backendBase}/storage/tourism/${imageData}`;
  };

  const pkgImage = getImageUrl(packageData?.image_url || packageData?.image);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (reservationType === "individual") {
      if (!formData.first_name.trim()) newErrors.first_name = t.required;
      if (!formData.last_name.trim()) newErrors.last_name = t.required;
    } else {
      if (!formData.company_name.trim()) newErrors.company_name = t.required;
      if (!formData.contact_person_name.trim()) newErrors.contact_person_name = t.required;
      if (!formData.company_country.trim()) newErrors.company_country = t.required;
      if (!formData.company_location.trim()) newErrors.company_location = t.required;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.required;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = isRTL ? "بريد إلكتروني غير صالح" : "Invalid email address";
    }
    if (!formData.mobile.trim()) newErrors.mobile = t.required;
    if (!formData.preferred_travel_date) newErrors.preferred_travel_date = t.required;
    if (!formData.confirmed) {
      newErrors.confirmed = isRTL
        ? "يرجى تأكيد صحة المعلومات"
        : "Please confirm that information is correct";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    setSubmitError("");

    try {
      const payload = {
        reservation_type: reservationType,

        // Individual fields
        first_name: reservationType === "individual" ? formData.first_name : "",
        last_name: reservationType === "individual" ? formData.last_name : "",
        nationality: formData.nationality,
        passport_number: formData.passport_number,
        departure_city: formData.departure_city,

        // Company fields
        company_name: reservationType === "company" ? formData.company_name : "",
        contact_person_name: reservationType === "company" ? formData.contact_person_name : "",
        company_cr_number: formData.company_cr_number,
        company_country: formData.company_country,
        company_location: formData.company_location,
        company_address: formData.company_address,
        company_passports_info: formData.company_passports_info,

        // Shared contact & trip info
        name: reservationType === "company" ? formData.company_name : `${formData.first_name} ${formData.last_name}`.trim(),
        email: formData.email,
        mobile: formData.mobile,
        phone: formData.mobile,
        preferred_travel_date: formData.preferred_travel_date,
        preferred_date: formData.preferred_travel_date,
        number_of_adults: Number(formData.number_of_adults) || 1,
        number_of_children: Number(formData.number_of_children) || 0,
        guests: (Number(formData.number_of_adults) || 1) + (Number(formData.number_of_children) || 0),
        room_type: formData.room_type,
        hotel_preference: formData.hotel_preference,
        special_requests: formData.special_requests,
        notes: formData.notes,

        // Trip Context
        trip_title: pkgTitle,
        package_name: pkgTitle,
        trip_slug: packageData?.slug || "",
        trip_type: "package",
        destination: pkgDestination,
        duration: pkgDuration,
        trip_code: pkgTripCode,
      };

      const res = await fetch(`${API_URL.replace(/\/$/, "")}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error || "Submission failed");
      }

      const generatedRef =
        json.reference_no ||
        json.reservation?.reference_no ||
        `RES-2026-${String(json.reservation?.id || Math.floor(100000 + Math.random() * 900000)).padStart(6, "0")}`;

      setReferenceNo(generatedRef);
      setStep(3);
    } catch (err) {
      console.error("[TravelReservationModal] Submit error:", err);
      setSubmitError(err.message || (isRTL ? "حدث خطأ أثناء تقديم الطلب" : "An error occurred while submitting"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(10, 10, 20, 0.75)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px",
          overflowY: "auto",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(232, 93, 31, 0.15)",
            maxWidth: "740px",
            width: "100%",
            maxHeight: "92vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            direction: isRTL ? "rtl" : "ltr",
            position: "relative",
            margin: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Sunset Accent Bar */}
          <div style={{ height: "4px", background: "linear-gradient(90deg, #E85D1F 0%, #FF8C38 100%)" }} />

          {/* Modal Header */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid #f0e8db",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#FAF6F0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(232, 93, 31, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plane size={20} color="#E85D1F" />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "#1C0052" }}>
                {step === 1 && t.step1Title}
                {step === 2 && t.step2Title}
                {step === 3 && t.step3Title}
              </h3>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                border: "none",
                background: "rgba(28, 0, 82, 0.06)",
                borderRadius: "50%",
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#1C0052",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(232, 93, 31, 0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(28, 0, 82, 0.06)")}
            >
              <X size={18} />
            </button>
          </div>

          {/* Step Indicator */}
          <div style={{ padding: "12px 20px", backgroundColor: "#ffffff", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      minWidth: "26px",
                      borderRadius: "50%",
                      backgroundColor: step >= s ? "#E85D1F" : "#f3f4f6",
                      color: step >= s ? "#ffffff" : "#9ca3af",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {step > s ? <Check size={14} /> : s}
                  </div>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: step === s ? 700 : 500,
                      color: step === s ? "#1C0052" : "#9ca3af",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s === 1 ? t.step1Title : s === 2 ? t.step2Title : t.step3Title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Content Body */}
          <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
            {/* STEP 1: Selected Package Info */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div
                  style={{
                    backgroundColor: "#FAF6F0",
                    borderRadius: "16px",
                    border: "1px solid rgba(232, 93, 31, 0.3)",
                    overflow: "hidden",
                    marginBottom: "20px",
                  }}
                >
                  <div style={{ position: "relative", height: "180px", width: "100%", backgroundColor: "#1C0052" }}>
                    <img
                      src={pkgImage}
                      alt={pkgTitle}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => (e.target.src = "/placeholder.png")}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "16px 20px",
                        background: "linear-gradient(to top, rgba(28, 0, 82, 0.9) 0%, rgba(28, 0, 82, 0.3) 70%, transparent 100%)",
                        color: "#fff",
                      }}
                    >
                      <h4 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, lineHeight: 1.3 }}>{pkgTitle}</h4>
                    </div>
                  </div>

                  <div style={{ padding: "18px 20px" }}>
                    {(pkgDestination || pkgDuration || pkgTripCode) && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                          gap: "12px",
                          marginBottom: "14px",
                        }}
                      >
                        {pkgDestination && (
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <MapPin size={16} color="#E85D1F" />
                            </div>
                            <div>
                              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>
                                {t.destination}
                              </span>
                              <strong style={{ fontSize: "0.85rem", color: "#1C0052" }}>{pkgDestination}</strong>
                            </div>
                          </div>
                        )}

                        {pkgDuration && (
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Clock size={16} color="#E85D1F" />
                            </div>
                            <div>
                              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>
                                {t.duration}
                              </span>
                              <strong style={{ fontSize: "0.85rem", color: "#1C0052" }}>{pkgDuration}</strong>
                            </div>
                          </div>
                        )}

                        {pkgTripCode && (
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <FileText size={16} color="#E85D1F" />
                            </div>
                            <div>
                              <span style={{ fontSize: "0.72rem", color: "#6b7280", display: "block" }}>
                                {t.tripCode}
                              </span>
                              <strong style={{ fontSize: "0.85rem", color: "#1C0052" }}>{pkgTripCode}</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {pkgDescription && (
                      <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 700, display: "block" }}>
                          {t.description}
                        </span>
                        <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "#374151", lineHeight: "1.5" }}>
                          {pkgDescription.length > 220 ? `${pkgDescription.substring(0, 220)}...` : pkgDescription}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{
                    width: "100%",
                    padding: "14px 24px",
                    backgroundColor: "#E85D1F",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "0.98rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(232, 93, 31, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1C0052")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E85D1F")}
                >
                  <span>{t.continue}</span>
                  {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
              </motion.div>
            )}

            {/* STEP 2: Reservation Request Form */}
            {step === 2 && (
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmitReservation}
              >
                {/* Reservation Type Toggle */}
                <div style={{ marginBottom: "18px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#1C0052",
                      marginBottom: "8px",
                    }}
                  >
                    {t.reservationTypeLabel}
                  </label>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => setReservationType("individual")}
                      style={{
                        flex: "1 1 200px",
                        padding: "11px 16px",
                        borderRadius: "10px",
                        border: reservationType === "individual" ? "2px solid #E85D1F" : "1.5px solid #e5e7eb",
                        backgroundColor: reservationType === "individual" ? "#FAF6F0" : "#ffffff",
                        color: reservationType === "individual" ? "#1C0052" : "#4b5563",
                        fontWeight: reservationType === "individual" ? 700 : 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <User size={18} color={reservationType === "individual" ? "#E85D1F" : "#6b7280"} />
                      <span>{t.individualType}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReservationType("company")}
                      style={{
                        flex: "1 1 200px",
                        padding: "11px 16px",
                        borderRadius: "10px",
                        border: reservationType === "company" ? "2px solid #E85D1F" : "1.5px solid #e5e7eb",
                        backgroundColor: reservationType === "company" ? "#FAF6F0" : "#ffffff",
                        color: reservationType === "company" ? "#1C0052" : "#4b5563",
                        fontWeight: reservationType === "company" ? 700 : 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Building size={18} color={reservationType === "company" ? "#E85D1F" : "#6b7280"} />
                      <span>{t.companyType}</span>
                    </button>
                  </div>
                </div>

                {submitError && (
                  <div
                    style={{
                      padding: "10px 14px",
                      backgroundColor: "#fef2f2",
                      border: "1px solid #f87171",
                      borderRadius: "8px",
                      color: "#991b1b",
                      fontSize: "0.85rem",
                      marginBottom: "16px",
                    }}
                  >
                    {submitError}
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "14px",
                  }}
                >
                  {/* INDIVIDUAL FIELDS */}
                  {reservationType === "individual" && (
                    <>
                      <div>
                        <label style={labelStyle}>
                          {t.firstName} <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          style={inputStyle(errors.first_name)}
                          placeholder={t.firstName}
                        />
                        {errors.first_name && <span style={errorStyle}>{errors.first_name}</span>}
                      </div>

                      <div>
                        <label style={labelStyle}>
                          {t.lastName} <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          style={inputStyle(errors.last_name)}
                          placeholder={t.lastName}
                        />
                        {errors.last_name && <span style={errorStyle}>{errors.last_name}</span>}
                      </div>

                      <div>
                        <label style={labelStyle}>{t.nationality}</label>
                        <input
                          type="text"
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleChange}
                          style={inputStyle()}
                          placeholder={t.nationality}
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>{t.passportNumber}</label>
                        <input
                          type="text"
                          name="passport_number"
                          value={formData.passport_number}
                          onChange={handleChange}
                          style={inputStyle()}
                          placeholder="A12345678"
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>{t.departureCity}</label>
                        <input
                          type="text"
                          name="departure_city"
                          value={formData.departure_city}
                          onChange={handleChange}
                          style={inputStyle()}
                          placeholder={isRTL ? "مثال: الرياض، جدة" : "e.g. Riyadh, Jeddah"}
                        />
                      </div>
                    </>
                  )}

                  {/* COMPANY FIELDS */}
                  {reservationType === "company" && (
                    <>
                      <div>
                        <label style={labelStyle}>
                          {t.companyName} <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="company_name"
                          value={formData.company_name}
                          onChange={handleChange}
                          style={inputStyle(errors.company_name)}
                          placeholder={t.companyName}
                        />
                        {errors.company_name && <span style={errorStyle}>{errors.company_name}</span>}
                      </div>

                      <div>
                        <label style={labelStyle}>
                          {t.contactPersonName} <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="contact_person_name"
                          value={formData.contact_person_name}
                          onChange={handleChange}
                          style={inputStyle(errors.contact_person_name)}
                          placeholder={t.contactPersonName}
                        />
                        {errors.contact_person_name && <span style={errorStyle}>{errors.contact_person_name}</span>}
                      </div>

                      <div>
                        <label style={labelStyle}>{t.companyCrNumber}</label>
                        <input
                          type="text"
                          name="company_cr_number"
                          value={formData.company_cr_number}
                          onChange={handleChange}
                          style={inputStyle()}
                          placeholder="1010XXXXXX"
                        />
                      </div>

                      <div>
                        <label style={labelStyle}>
                          {t.companyCountry} <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="company_country"
                          value={formData.company_country}
                          onChange={handleChange}
                          style={inputStyle(errors.company_country)}
                          placeholder={isRTL ? "السعودية، الإمارات..." : "Saudi Arabia, UAE..."}
                        />
                        {errors.company_country && <span style={errorStyle}>{errors.company_country}</span>}
                      </div>

                      <div>
                        <label style={labelStyle}>
                          {t.companyLocation} <span style={{ color: "#dc2626" }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="company_location"
                          value={formData.company_location}
                          onChange={handleChange}
                          style={inputStyle(errors.company_location)}
                          placeholder={isRTL ? "الرياض، جدة..." : "Riyadh, Jeddah..."}
                        />
                        {errors.company_location && <span style={errorStyle}>{errors.company_location}</span>}
                      </div>

                      <div>
                        <label style={labelStyle}>{t.companyAddress}</label>
                        <input
                          type="text"
                          name="company_address"
                          value={formData.company_address}
                          onChange={handleChange}
                          style={inputStyle()}
                          placeholder={isRTL ? "العنوان المفصل..." : "Detailed address..."}
                        />
                      </div>
                    </>
                  )}

                  {/* SHARED FIELDS */}
                  <div>
                    <label style={labelStyle}>
                      {t.email} <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={inputStyle(errors.email)}
                      placeholder="example@domain.com"
                    />
                    {errors.email && <span style={errorStyle}>{errors.email}</span>}
                  </div>

                  <div>
                    <label style={labelStyle}>
                      {t.mobile} <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      style={inputStyle(errors.mobile)}
                      placeholder="+966 50 000 0000"
                    />
                    {errors.mobile && <span style={errorStyle}>{errors.mobile}</span>}
                  </div>

                  <div>
                    <label style={labelStyle}>
                      {t.preferredTravelDate} <span style={{ color: "#dc2626" }}>*</span>
                    </label>
                    <input
                      type="date"
                      name="preferred_travel_date"
                      value={formData.preferred_travel_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      style={inputStyle(errors.preferred_travel_date)}
                    />
                    {errors.preferred_travel_date && (
                      <span style={errorStyle}>{errors.preferred_travel_date}</span>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>
                      {reservationType === "company" ? t.numberOfEmployees : t.numberOfAdults}
                    </label>
                    <input
                      type="number"
                      name="number_of_adults"
                      value={formData.number_of_adults}
                      onChange={handleChange}
                      min="1"
                      max="500"
                      style={inputStyle()}
                    />
                  </div>

                  {reservationType === "individual" && (
                    <div>
                      <label style={labelStyle}>{t.numberOfChildren}</label>
                      <input
                        type="number"
                        name="number_of_children"
                        value={formData.number_of_children}
                        onChange={handleChange}
                        min="0"
                        max="50"
                        style={inputStyle()}
                      />
                    </div>
                  )}

                  <div>
                    <label style={labelStyle}>{t.roomType}</label>
                    <select
                      name="room_type"
                      value={formData.room_type}
                      onChange={handleChange}
                      style={inputStyle()}
                    >
                      <option value="Single">{t.roomSingle}</option>
                      <option value="Double">{t.roomDouble}</option>
                      <option value="Triple">{t.roomTriple}</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>{t.hotelPreference}</label>
                    <input
                      type="text"
                      name="hotel_preference"
                      value={formData.hotel_preference}
                      onChange={handleChange}
                      style={inputStyle()}
                      placeholder={isRTL ? "مثال: فندق 5 نجوم" : "e.g. 5 Star Hotel"}
                    />
                  </div>

                  {reservationType === "company" && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>{t.companyPassportsInfo}</label>
                      <textarea
                        name="company_passports_info"
                        value={formData.company_passports_info}
                        onChange={handleChange}
                        rows="2"
                        style={{ ...inputStyle(), resize: "vertical" }}
                        placeholder={
                          isRTL
                            ? "أدخل قائمة بأسماء وتفاصيل جوازات الموظفين..."
                            : "Enter list of employee names, passport details, or group requirements..."
                        }
                      />
                    </div>
                  )}

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>{t.specialRequests}</label>
                    <textarea
                      name="special_requests"
                      value={formData.special_requests}
                      onChange={handleChange}
                      rows="2"
                      style={{ ...inputStyle(), resize: "vertical" }}
                      placeholder={isRTL ? "أي طلبات خاصة..." : "Any special requests..."}
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>{t.notes}</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="2"
                      style={{ ...inputStyle(), resize: "vertical" }}
                      placeholder={isRTL ? "ملاحظات إضافية..." : "Additional notes..."}
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
                      onChange={handleChange}
                      style={{
                        width: "18px",
                        height: "18px",
                        accentColor: "#E85D1F",
                        cursor: "pointer",
                      }}
                    />
                    <span>{t.confirmCheck}</span>
                  </label>
                  {errors.confirmed && <span style={errorStyle}>{errors.confirmed}</span>}
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    style={{
                      padding: "12px 20px",
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {t.back}
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      backgroundColor: "#E85D1F",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "0.98rem",
                      fontWeight: 700,
                      cursor: loading ? "not-allowed" : "pointer",
                      boxShadow: "0 4px 14px rgba(232, 93, 31, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      opacity: loading ? 0.7 : 1,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.currentTarget.style.backgroundColor = "#1C0052";
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) e.currentTarget.style.backgroundColor = "#E85D1F";
                    }}
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>{t.submitReservation}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 3: Success Screen */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "16px 8px" }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    backgroundColor: "#ecfdf5",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    boxShadow: "0 10px 25px rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <CheckCircle2 size={42} />
                </div>

                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1C0052", margin: "0 0 8px" }}>
                  {t.step3Title}
                </h3>

                <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#E85D1F", margin: "0 0 12px" }}>
                  {t.thankYou}
                </p>

                <p
                  style={{
                    fontSize: "0.88rem",
                    color: "#4b5563",
                    lineHeight: "1.6",
                    maxWidth: "500px",
                    margin: "0 auto 20px",
                  }}
                >
                  {t.successMsg}
                </p>

                {referenceNo && (
                  <div
                    style={{
                      backgroundColor: "#FAF6F0",
                      border: "2px dashed #E85D1F",
                      borderRadius: "12px",
                      padding: "14px 20px",
                      display: "inline-block",
                      marginBottom: "24px",
                    }}
                  >
                    <span style={{ fontSize: "0.78rem", color: "#6b7280", display: "block", marginBottom: "4px" }}>
                      {t.bookingReference}
                    </span>
                    <strong style={{ fontSize: "1.25rem", color: "#1C0052", letterSpacing: "1px" }}>
                      {referenceNo}
                    </strong>
                  </div>
                )}

                <div>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      padding: "12px 32px",
                      backgroundColor: "#1C0052",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(28, 0, 82, 0.2)",
                    }}
                  >
                    {t.close}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "5px",
};

const inputStyle = (error) => ({
  width: "100%",
  padding: "9px 12px",
  borderRadius: "8px",
  border: error ? "1.5px solid #dc2626" : "1.5px solid #d1d5db",
  backgroundColor: "#ffffff",
  fontSize: "0.88rem",
  color: "#111827",
  outline: "none",
  transition: "all 0.2s ease",
});

const errorStyle = {
  fontSize: "0.74rem",
  color: "#dc2626",
  marginTop: "3px",
  display: "block",
};
