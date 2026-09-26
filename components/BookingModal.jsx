"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  Calendar,
  User,
  Lock,
  Luggage,
  Check,
  ArrowRight,
  Mail,
  Phone,
  Bed,
  Users,
  ExternalLink,
  Building2,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { API_URL } from "@/lib/api";

function OfferCustomSelect({ personPrices, value, onChange, isRTL, lang, error }) {
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
    <div style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: isRTL ? "10px 40px 10px 12px" : "10px 12px 10px 40px",
          border: error ? "2px solid #dc3545" : "2px solid #e0e0e0",
          borderRadius: "8px",
          fontSize: "14px",
          outline: "none",
          backgroundColor: "#ffffff",
          fontWeight: "600",
          color: value === "custom" ? "#E85D1F" : "#1C0052",
          cursor: "pointer",
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
          color="#666"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            marginLeft: isRTL ? 0 : "8px",
            marginRight: isRTL ? "8px" : 0,
            flexShrink: 0,
          }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
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
                    onChange({ target: { name: "guests", value: offer.persons } });
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
                onChange({ target: { name: "guests", value: "custom" } });
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BookingModal({ isOpen, onClose, packageData, lang, bookingType = "destination", initialGuests = 1, onOpenCustomModal }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    travel_date: "",
    room_type: "DoubleRoom",
    package_id: "",
    package_code: "",
    notes: "",
    guests: 1,
    special_requests: "",
    booking_type: bookingType,
  });
  const [errors, setErrors] = useState({});
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [showPaymentIframe, setShowPaymentIframe] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const isRTL = lang === "ar";

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch(`${API_URL}/coupons/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          booking_amount: calculateTotalPrice(),
          package_type: bookingType || "international",
          package_id: packageData?.id,
          email: formData.email || "",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data);
        setCouponError("");
      } else {
        setAppliedCoupon(null);
        setCouponError(data.message || (isRTL ? "كوبون الخصم غير صالح أو منتهي الصلاحية" : "Invalid or expired promo code"));
      }
    } catch (err) {
      setCouponError(isRTL ? "فشل تطبيق الكوبون" : "Failed to apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const parseJsonField = (field, fallback = {}) => {
    if (!field) return fallback;
    if (typeof field === "string") {
      try {
        return JSON.parse(field);
      } catch {
        return fallback;
      }
    }
    return field;
  };

  const getPackageBasicInfo = () => {
    return parseJsonField(packageData?.basic_info, {});
  };

  const calculateTotalPrice = (customGuests = null) => {
    const guests = Number(customGuests !== null && customGuests !== undefined ? customGuests : formData.guests) || 1;
    const packagePrice = Number(packageData?.price ?? 0);

    if (packageData?.person_prices && Array.isArray(packageData.person_prices) && packageData.person_prices.length > 0) {
      const offer = packageData.person_prices.find(p => Number(p.persons) === guests);
      if (offer && offer.price !== undefined && offer.price !== null) {
        return Number(offer.price);
      }
    }

    return packagePrice * guests;
  };

  const packageTitle =
    lang === "ar"
      ? packageData?.title_ar ?? packageData?.title_en ?? packageData?.title
      : packageData?.title_en ?? packageData?.title_ar ?? packageData?.title;

  // Update total amount when form data changes
  useEffect(() => {
    setTotalAmount(calculateTotalPrice());
  }, [formData.guests, formData.room_type, packageData]);

  // Sync initialGuests and packageData on modal open
  useEffect(() => {
    if (isOpen) {
      const targetGuests = Number(initialGuests) || 1;
      const packageCode =
        packageData?.basic_info?.trip_code ||
        packageData?.trip_code ||
        packageData?.code ||
        packageData?.package_code ||
        `PKG-${packageData?.id || "1"}`;

      setFormData((prev) => ({
        ...prev,
        guests: targetGuests,
        booking_type: bookingType,
        package_id: String(packageData?.id || packageData?.slug || ""),
        package_code: String(packageCode),
      }));

      setTotalAmount(calculateTotalPrice(targetGuests));
    }
  }, [isOpen, initialGuests, packageData, bookingType]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "guests" && value === "custom") {
      onClose();
      if (typeof onOpenCustomModal === "function") {
        onOpenCustomModal();
      }
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name)
      newErrors.first_name = isRTL
        ? "الاسم الأول مطلوب"
        : "First Name is Required";
    if (!formData.last_name)
      newErrors.last_name = isRTL
        ? "اسم العائلة مطلوب"
        : "Last Name is Required";
    if (!formData.email) {
      newErrors.email = isRTL ? "البريد الإلكتروني مطلوب" : "Email is Required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = isRTL
        ? "البريد الإلكتروني غير صحيح"
        : "The Email field is not a valid e-mail address.";
    }
    if (!formData.mobile)
      newErrors.mobile = isRTL ? "رقم الجوال مطلوب" : "Mobile is Required";
    if (!formData.travel_date)
      newErrors.travel_date = isRTL
        ? "تاريخ السفر مطلوب"
        : "The Travel Date field is required.";
    if (!formData.guests || formData.guests < 1)
      newErrors.guests = isRTL
        ? "يرجى اختيار ضيف واحد على الأقل"
        : "Please select at least 1 guest";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Booking & Payment Submission
  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Validation failed:", errors);
      return;
    }

    setLoading(true);
    setPaymentError(null);
    setErrors({});

    const packageId = formData.package_id || String(packageData?.id || "");
    const packageCode =
      formData.package_code ||
      packageData?.basic_info?.trip_code ||
      packageData?.trip_code ||
      `PKG-${packageData?.id || "1"}`;

    const calculatedTotal = calculateTotalPrice();
    let activeCoupon = appliedCoupon;

    // Auto-validate coupon if user typed code but didn't click Apply button first
    if (!activeCoupon && couponCode.trim()) {
      try {
        const res = await fetch(`${API_URL}/coupons/apply`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            code: couponCode.trim(),
            booking_amount: calculatedTotal,
            package_type: bookingType || "destination",
            package_id: packageData?.id,
            email: formData.email || "",
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          activeCoupon = data;
          setAppliedCoupon(data);
          setCouponError("");
        } else {
          setCouponError(data.message || (isRTL ? "كوبون الخصم غير صالح أو منتهي الصلاحية" : "Invalid or expired promo code"));
          setLoading(false);
          return;
        }
      } catch (err) {
        setCouponError(isRTL ? "فشل تطبيق الكوبون" : "Failed to apply coupon");
        setLoading(false);
        return;
      }
    }

    const payableTotal = activeCoupon ? activeCoupon.final_total : calculatedTotal;

    const bookingData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      mobile: formData.mobile,
      travel_date: formData.travel_date,
      room_type: formData.room_type,
      package_id: packageId,
      package_code: packageCode,
      notes: formData.notes || "",
      payment_method: "credit_card",
      booking_type: "destination",
      guests: formData.guests || 1,
      special_requests: formData.special_requests || "",
      total_amount: payableTotal,
      price: payableTotal,
      coupon_code: activeCoupon ? activeCoupon.code : null,
      discount_amount: activeCoupon ? activeCoupon.discount_amount : 0,
    };

    console.log("Submitting booking:", bookingData);

    try {
      // Step 1: Create the booking
      const bookingResponse = await fetch(`${API_URL}/bookings/guest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const bookingResult = await bookingResponse.json();
      console.log("Booking response:", bookingResult);

      if (bookingResponse.ok && bookingResult.success) {
        const newBookingId = bookingResult.data.id;
        setBookingId(newBookingId);

        // Step 2: Initiate Moyasar hosted invoice payment
        try {
          const payResponse = await fetch(`${API_URL}/payments/moyasar/initiate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              booking_id: newBookingId,
              amount: payableTotal,
              lang: lang,
            }),
          });
          const payResult = await payResponse.json();
          if (payResponse.ok && payResult.success && payResult.payment_url) {
            window.location.href = payResult.payment_url;
            return;
          }
        } catch (payErr) {
          console.error("Moyasar payment initiation error:", payErr);
        }

        setLoading(false);
        setIsRedirecting(true);
        window.location.href = `/${lang}/booking-success?booking_id=${newBookingId}`;
      } else {
        if (bookingResult.errors) {
          setErrors(bookingResult.errors);
        } else {
          setErrors({
            submit: bookingResult.message || (isRTL ? "حدث خطأ ما" : "Something went wrong"),
          });
        }
        setLoading(false);
      }
    } catch (error) {
      console.error("Booking error:", error);
      setErrors({
        submit: isRTL
          ? "فشل إنشاء الحجز. يرجى المحاولة مرة أخرى."
          : "Failed to create booking. Please try again.",
      });
      setLoading(false);
    }
  };

  const initiatePayment = async (bookingId, amount) => {
    setLoading(false);
    setIsRedirecting(true);
    window.location.href = `/${lang}/booking-success?booking_id=${bookingId}`;
  };
  const resetForm = () => {
    setStep(1);
    setBookingId(null);
    setPaymentError(null);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      travel_date: "",
      room_type: "DoubleRoom",
      package_id: "",
      package_code: "",
      notes: "",
      guests: 1,
      special_requests: "",
      booking_type: "destination",
    });
    setErrors({});
    setIsRedirecting(false);
    setTotalAmount(0);
    setPaymentUrl(null);
    setShowPaymentIframe(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const labels = {
    en: {
      title: "Complete Your Data",
      firstName: "First Name",
      lastName: "Last Name",
      email: "E-mail",
      mobile: "Mobile Number",
      travelDate: "Travel Date",
      roomType: "Room Type",
      doubleRoom: "Double Room",
      singleRoom: "Single Room",
      notes: "Notes",
      paymentMethod: "Payment Method",
      creditCard: "Pay with Moyasar (Visa, Mada, STC Pay, Apple Pay)",
      confirm: "Confirm Booking & Pay",
      cancel: "Cancel",
      selectPackage: "Select Package",
      data: "Data",
      completed: "Completed",
      bookingSuccess: "Booking Created Successfully!",
      bookingNumber: "Booking Number",
      redirecting: "Redirecting to payment gateway...",
      guests: "Number of Guests",
      specialRequests: "Special Requests",
      continue: "Continue",
      submit: "Processing...",
      payWithCard: "Pay with Credit Card",
      securePayment: "Secure payments via Moyasar gateway",
      paymentSuccess: "Payment Successful!",
      paymentSuccessMessage: "Your booking has been confirmed. We will contact you shortly.",
      payMore: "Pay with Credit Card",
      supports: "Supports Visa, Mada, STC Pay, Apple Pay. Bank transfer fallback available.",
      retry: "Retry",
      paymentError: "Payment Error",
      pricePerPerson: "per person",
      totalAmount: "Total Amount",
      roomPrice: "Room Price",
      additionalGuests: "Additional guests",
      redirectingToPayment: "Redirecting to secure payment page...",
      processingBooking: "Creating your booking...",
    },

    ar: {
      title: "أكمل بياناتك",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      email: "البريد الإلكتروني",
      mobile: "رقم الجوال",
      travelDate: "تاريخ السفر",
      roomType: "نوع الغرفة",
      doubleRoom: "غرفة مزدوجة",
      singleRoom: "غرفة فردية",
      notes: "ملاحظات",
      paymentMethod: "طريقة الدفع",
      creditCard: "ادفع عبر Moyasar (فيزا، مدى، إس تي سي باي، آبل باي)",
      confirm: "تأكيد الحجز والدفع",
      cancel: "إلغاء",
      selectPackage: "اختر الباقة",
      data: "البيانات",
      completed: "مكتمل",
      bookingSuccess: "تم إنشاء الحجز بنجاح!",
      bookingNumber: "رقم الحجز",
      redirecting: "جاري التوجيه لبوابة الدفع...",
      guests: "عدد الضيوف",
      specialRequests: "طلبات خاصة",
      continue: "متابعة",
      submit: "جاري المعالجة...",
      payWithCard: "ادفع ببطاقة الائتمان",
      securePayment: "مدفوعات آمنة عبر بوابة ميسر",
      paymentSuccess: "تم الدفع بنجاح!",
      paymentSuccessMessage: "  .   تم ارسال الطلب بنجاح ستصلك رسالة تاكيد",
      payMore: "ادفع ببطاقة الائتمان",
      supports: "يدعم فيزا، مدى، إس تي سي باي، آبل باي. الدفع عبر التحويل البنكي متاح كخيار احتياطي.",
      retry: "إعادة المحاولة",
      paymentError: "خطأ في الدفع",
      pricePerPerson: "للفرد",
      totalAmount: "المبلغ الإجمالي",
      roomPrice: "سعر الغرفة",
      additionalGuests: "ضيوف إضافيين",
      redirectingToPayment: "جاري التوجيه لصفحة الدفع الآمنة...",
      processingBooking: "جاري إنشاء حجزك...",
    },
  };

  const t = labels[lang] || labels.en;

  // Get price breakdown for display
  const getPriceBreakdown = () => {
    const guests = Number(formData.guests) || 1;
    const packagePrice = Number(packageData?.price ?? 0);

    let description = "";
    if (packageData?.person_prices && Array.isArray(packageData.person_prices) && packageData.person_prices.length > 0) {
      const offer = packageData.person_prices.find(p => Number(p.persons) === guests);
      if (offer && offer.price !== undefined && offer.price !== null) {
        description = isRTL
          ? `عرض مخصص لـ ${guests} ${guests === 1 ? "فرد" : "أفراد"}: ${offer.price} ر.س`
          : `Offer tier for ${guests} ${guests > 1 ? "Persons" : "Person"}: ${offer.price} SAR`;
      }
    }

    if (!description) {
      description = isRTL
        ? `${guests} × ${packagePrice} ر.س`
        : `${guests} × ${packagePrice} SAR (${guests > 1 ? `${guests} Persons` : "1 Person"})`;
    }

    return {
      basePrice: packagePrice,
      total: totalAmount,
      description: description,
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="booking-modal-overlay"
          onClick={handleClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            overflow: "auto",
          }}
        >
          <motion.div
            className="booking-modal"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            style={{
              direction: isRTL ? "rtl" : "ltr",
            }}
          >
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: "16px",
                [isRTL ? "left" : "right"]: "18px",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "#f4f4f6",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
                zIndex: 10,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e5e5ea";
                e.currentTarget.style.color = "#111";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f4f4f6";
                e.currentTarget.style.color = "#666";
              }}
            >
              <X size={18} />
            </button>

            <div className="booking-modal-header">
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <User size={20} color="#E85D1F" />
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#2c2c2c",
                  }}
                >
                  {t.title}
                </span>
              </div>
            </div>

            <div className="booking-modal-steps">
              <ul
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "15px",
                    left: "15%",
                    right: "15%",
                    height: "2px",
                    background: "#e0e0e0",
                    zIndex: 0,
                  }}
                ></div>

                {[
                  {
                    id: 1,
                    icon: <Luggage size={16} />,
                    label: t.selectPackage,
                  },
                  { id: 2, icon: <User size={16} />, label: t.data },
                  { id: 3, icon: <Check size={16} />, label: t.completed },
                ].map((s) => (
                  <li
                    key={s.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                      zIndex: 1,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: step >= s.id ? "#E85D1F" : "#e0e0e0",
                        color: step >= s.id ? "#fff" : "#999",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        transition: "all 0.3s",
                        border: step === s.id ? "3px solid #E85D1F" : "none",
                      }}
                    >
                      {step > s.id ? <Check size={16} color="#fff" /> : s.icon}
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: step >= s.id ? "#E85D1F" : "#999",
                        marginTop: "6px",
                        fontWeight: step >= s.id ? "600" : "400",
                        textAlign: "center",
                      }}
                    >
                      {s.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="booking-modal-body">
              {step === 1 && (
                <div>
                  <div
                    style={{
                      background: "#f8f9fa",
                      padding: "24px 20px",
                      borderRadius: "14px",
                      border: "1px solid #eaeaea",
                      marginBottom: "20px",
                    }}
                  >
                    <h4 style={{ margin: "0 0 8px 0", color: "#1C0052", fontSize: "18px", fontWeight: "700" }}>
                      {packageTitle || packageData?.title || packageData?.title_en}
                    </h4>
                    {packageData?.basic_info && (
                      <div style={{ fontSize: "14px", color: "#666" }}>

                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      width: "100%",
                      padding: "14px 20px",
                      background: "#E85D1F",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.background = "#1C0052")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.background = "#E85D1F")
                    }
                  >
                    {t.continue}
                    {/* <ArrowRight size={16} /> */}
                  </button>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmitBooking}>
                  <div className="modal-form-grid">
                    {/* First Name */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "600",
                          marginBottom: "6px",
                          color: "#333",
                        }}
                      >
                        {t.firstName}{" "}
                        <span style={{ color: "#E85D1F" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <User
                          size={18}
                          style={{
                            position: "absolute",
                            [isRTL ? "right" : "left"]: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#999",
                          }}
                        />
                        <input
                          type="text"
                          name="first_name"
                          placeholder={t.firstName}
                          value={formData.first_name}
                          onChange={handleChange}
                          style={{
                            width: "100%",
                            padding: isRTL
                              ? "10px 40px 10px 12px"
                              : "10px 12px 10px 40px",
                            border: errors.first_name
                              ? "2px solid #dc3545"
                              : "2px solid #e0e0e0",
                            borderRadius: "8px",
                            fontSize: "14px",
                            transition: "all 0.2s",
                            outline: "none",
                            textAlign: isRTL ? "right" : "left",
                          }}
                        />
                      </div>
                      {errors.first_name && (
                        <span
                          style={{
                            color: "#dc3545",
                            fontSize: "13px",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {errors.first_name}
                        </span>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "600",
                          marginBottom: "6px",
                          color: "#333",
                        }}
                      >
                        {t.lastName} <span style={{ color: "#dc3545" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <User
                          size={18}
                          style={{
                            position: "absolute",
                            [isRTL ? "right" : "left"]: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#999",
                          }}
                        />
                        <input
                          type="text"
                          name="last_name"
                          placeholder={t.lastName}
                          value={formData.last_name}
                          onChange={handleChange}
                          style={{
                            width: "100%",
                            padding: isRTL
                              ? "10px 40px 10px 12px"
                              : "10px 12px 10px 40px",
                            border: errors.last_name
                              ? "2px solid #dc3545"
                              : "2px solid #e0e0e0",
                            borderRadius: "8px",
                            fontSize: "14px",
                            outline: "none",
                            textAlign: isRTL ? "right" : "left",
                          }}
                        />
                      </div>
                      {errors.last_name && (
                        <span
                          style={{
                            color: "#dc3545",
                            fontSize: "13px",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {errors.last_name}
                        </span>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "600",
                          marginBottom: "6px",
                          color: "#333",
                        }}
                      >
                        {t.email} <span style={{ color: "#dc3545" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <Mail
                          size={18}
                          style={{
                            position: "absolute",
                            [isRTL ? "right" : "left"]: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#999",
                          }}
                        />
                        <input
                          type="email"
                          name="email"
                          placeholder={t.email}
                          value={formData.email}
                          onChange={handleChange}
                          style={{
                            width: "100%",
                            padding: isRTL
                              ? "10px 40px 10px 12px"
                              : "10px 12px 10px 40px",
                            border: errors.email
                              ? "2px solid #dc3545"
                              : "2px solid #e0e0e0",
                            borderRadius: "8px",
                            fontSize: "14px",
                            outline: "none",
                            textAlign: isRTL ? "right" : "left",
                          }}
                        />
                      </div>
                      {errors.email && (
                        <span
                          style={{
                            color: "#dc3545",
                            fontSize: "13px",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {errors.email}
                        </span>
                      )}
                    </div>

                    {/* Mobile */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "600",
                          marginBottom: "6px",
                          color: "#333",
                        }}
                      >
                        {t.mobile} <span style={{ color: "#dc3545" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <Phone
                          size={18}
                          style={{
                            position: "absolute",
                            [isRTL ? "right" : "left"]: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#999",
                          }}
                        />
                        <input
                          type="tel"
                          name="mobile"
                          placeholder={t.mobile}
                          value={formData.mobile}
                          onChange={handleChange}
                          style={{
                            width: "100%",
                            padding: isRTL
                              ? "10px 40px 10px 12px"
                              : "10px 12px 10px 40px",
                            border: errors.mobile
                              ? "2px solid #dc3545"
                              : "2px solid #e0e0e0",
                            borderRadius: "8px",
                            fontSize: "14px",
                            outline: "none",
                            textAlign: isRTL ? "right" : "left",
                          }}
                        />
                      </div>
                      {errors.mobile && (
                        <span
                          style={{
                            color: "#dc3545",
                            fontSize: "13px",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {errors.mobile}
                        </span>
                      )}
                    </div>

                    {/* Travel Date */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "600",
                          marginBottom: "6px",
                          color: "#333",
                        }}
                      >
                        {t.travelDate}{" "}
                        <span style={{ color: "#dc3545" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <Calendar
                          size={18}
                          style={{
                            position: "absolute",
                            [isRTL ? "right" : "left"]: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#999",
                          }}
                        />
                        <input
                          type="date"
                          name="travel_date"
                          value={formData.travel_date}
                          onChange={handleChange}
                          min={new Date().toISOString().split("T")[0]}
                          style={{
                            width: "100%",
                            padding: isRTL
                              ? "10px 40px 10px 12px"
                              : "10px 12px 10px 40px",
                            border: errors.travel_date
                              ? "2px solid #dc3545"
                              : "2px solid #e0e0e0",
                            borderRadius: "8px",
                            fontSize: "14px",
                            outline: "none",
                            textAlign: isRTL ? "right" : "left",
                          }}
                        />
                      </div>
                      {errors.travel_date && (
                        <span
                          style={{
                            color: "#dc3545",
                            fontSize: "13px",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {errors.travel_date}
                        </span>
                      )}
                    </div>

                    {/* Guests Input */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "600",
                          marginBottom: "6px",
                          color: "#333",
                        }}
                      >
                        {t.guests} <span style={{ color: "#dc3545" }}>*</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <Users
                          size={18}
                          style={{
                            position: "absolute",
                            [isRTL ? "right" : "left"]: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#999",
                            zIndex: 2,
                          }}
                        />
                        {packageData?.person_prices && Array.isArray(packageData.person_prices) && packageData.person_prices.length > 0 ? (
                          <OfferCustomSelect
                            personPrices={packageData.person_prices}
                            value={formData.guests}
                            onChange={handleChange}
                            isRTL={isRTL}
                            lang={lang}
                            error={errors.guests}
                          />
                        ) : (
                          <input
                            type="number"
                            name="guests"
                            value={formData.guests}
                            onChange={handleChange}
                            min="1"
                            max="20"
                            style={{
                              width: "100%",
                              padding: isRTL
                                ? "10px 40px 10px 12px"
                                : "10px 12px 10px 40px",
                              border: errors.guests
                                ? "2px solid #dc3545"
                                : "2px solid #e0e0e0",
                              borderRadius: "8px",
                              fontSize: "14px",
                              outline: "none",
                              transition: "all 0.2s",
                              textAlign: isRTL ? "right" : "left",
                            }}
                          />
                        )}
                      </div>
                      {errors.guests && (
                        <span
                          style={{
                            color: "#dc3545",
                            fontSize: "12px",
                            marginTop: "4px",
                            display: "block",
                          }}
                        >
                          {errors.guests}
                        </span>
                      )}
                    </div>

                    {/* Promo Code Box */}
                    <div style={{ gridColumn: "1 / -1", marginTop: "6px", marginBottom: "4px" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "600",
                          marginBottom: "6px",
                          color: "#333",
                        }}
                      >
                        {isRTL ? "كود الخصم (كوبون)" : "Promo / Discount Code"}
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          placeholder={isRTL ? "أدخل كود الخصم مثل SUMMER5" : "Enter code e.g. SUMMER5"}
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          disabled={!!appliedCoupon}
                          style={{
                            flex: 1,
                            padding: "10px 12px",
                            border: couponError ? "2px solid #dc3545" : appliedCoupon ? "2px solid #28a745" : "2px solid #e0e0e0",
                            borderRadius: "8px",
                            fontSize: "14px",
                            outline: "none",
                            textTransform: "uppercase",
                            textAlign: isRTL ? "right" : "left",
                          }}
                        />
                        {appliedCoupon ? (
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            style={{
                              padding: "10px 16px",
                              background: "#dc3545",
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              fontWeight: "600",
                              fontSize: "13px",
                              cursor: "pointer",
                            }}
                          >
                            {isRTL ? "إزالة" : "Remove"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={applyingCoupon || !couponCode.trim()}
                            style={{
                              padding: "10px 20px",
                              background: "#E85D1F",
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              fontWeight: "600",
                              fontSize: "13px",
                              cursor: "pointer",
                              opacity: applyingCoupon || !couponCode.trim() ? 0.6 : 1,
                            }}
                          >
                            {applyingCoupon ? (isRTL ? "جاري..." : "Applying...") : (isRTL ? "تطبيق" : "Apply")}
                          </button>
                        )}
                      </div>
                      {couponError && (
                        <span style={{ color: "#dc3545", fontSize: "13px", marginTop: "6px", display: "block" }}>
                          ✕ {couponError}
                        </span>
                      )}
                      {appliedCoupon && (
                        <span style={{ color: "#28a745", fontSize: "13px", marginTop: "6px", display: "block", fontWeight: "600" }}>
                          ✓ {isRTL ? `تم تطبيق الكود "${appliedCoupon.code}"! وفرت ${appliedCoupon.discount_amount} ر.س` : `Code "${appliedCoupon.code}" applied! You save SAR ${appliedCoupon.discount_amount}`}
                        </span>
                      )}
                    </div>

                    {/* Price Breakdown Display */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div
                        style={{
                          background: "#f0f8ff",
                          padding: "15px",
                          borderRadius: "8px",
                          border: "1px solid #d4edda",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: appliedCoupon ? "6px" : "0",
                          }}
                        >
                          <span style={{ fontWeight: "600", color: "#2c2c2c" }}>
                            {t.totalAmount}
                          </span>
                          <span
                            style={{
                              fontSize: "18px",
                              fontWeight: "700",
                              color: "#1C0052",
                              textDecoration: appliedCoupon ? "line-through" : "none",
                              opacity: appliedCoupon ? 0.6 : 1,
                            }}
                          >
                            {totalAmount} SAR
                          </span>
                        </div>

                        {appliedCoupon && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              color: "#28a745",
                              fontWeight: "600",
                              marginBottom: "6px",
                            }}
                          >
                            <span>{isRTL ? "الخصم المطبق" : "Discount Applied"}</span>
                            <span>-{appliedCoupon.discount_amount} SAR</span>
                          </div>
                        )}

                        {appliedCoupon && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              borderTop: "1px solid #cce5ff",
                              paddingTop: "6px",
                              marginTop: "4px",
                            }}
                          >
                            <span style={{ fontWeight: "700", color: "#1C0052" }}>
                              {isRTL ? "المبلغ النهائي للدفع" : "Final Payable Amount"}
                            </span>
                            <span
                              style={{
                                fontSize: "22px",
                                fontWeight: "800",
                                color: "#E85D1F",
                              }}
                            >
                              {appliedCoupon.final_total} SAR
                            </span>
                          </div>
                        )}

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginTop: "4px",
                            textAlign: isRTL ? "right" : "left",
                          }}
                        >
                          {getPriceBreakdown().description}
                        </div>
                      </div>
                    </div>

                    {/* Special Requests */}
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: "600",
                          marginBottom: "6px",
                          color: "#333",
                        }}
                      >
                        {t.specialRequests}
                      </label>
                      <div style={{ position: "relative" }}>
                        <textarea
                          name="special_requests"
                          placeholder={t.specialRequests}
                          value={formData.special_requests}
                          onChange={handleChange}
                          rows="2"
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: "2px solid #e0e0e0",
                            borderRadius: "8px",
                            fontSize: "14px",
                            outline: "none",
                            resize: "vertical",
                            fontFamily: "inherit",
                            textAlign: isRTL ? "right" : "left",
                          }}
                        />
                      </div>
                    </div>


                  </div>

                  {errors.submit && (
                    <div
                      style={{
                        background: "#fee",
                        color: "#dc3545",
                        padding: "12px",
                        borderRadius: "8px",
                        marginTop: "15px",
                        fontSize: "14px",
                      }}
                    >
                      {errors.submit}
                    </div>
                  )}

                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "20px" }}
                  >
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{
                        flex: 1,
                        padding: "12px",
                        background: "#f0f0f0",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "14px",
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
                        background: loading ? "#E85D1F" : "#E85D1F",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "600",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.7 : 1,
                        fontSize: "14px",
                        transition: "all 0.3s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                      onMouseEnter={(e) =>
                        !loading && (e.target.style.background = "#E85D1F")
                      }
                      onMouseLeave={(e) =>
                        !loading && (e.target.style.background = "#E85D1F")
                      }
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                          {t.submit}
                        </>
                      ) : (
                        <>
                          <CreditCard size={16} />
                          {t.confirm} ({(appliedCoupon && appliedCoupon.final_total !== undefined ? appliedCoupon.final_total : (totalAmount || calculateTotalPrice()))} SAR)
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <div style={{ padding: "10px 0 0" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <h3 style={{ color: "#28a745", margin: "0 0 6px" }}>
                        {t.bookingSuccess}
                      </h3>
                      <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                        {t.redirectingToPayment}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentUrl(null);
                        setShowPaymentIframe(false);
                        setStep(2);
                        setPaymentError(null);
                      }}
                      style={{
                        background: "#f0f0f0",
                        border: "none",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      {t.cancel}
                    </button>
                  </div>

                  {showPaymentIframe && paymentUrl ? (
                    <div
                      style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "10px",
                        overflow: "hidden",
                        minHeight: "620px",
                        background: "#fff",
                      }}
                    >
                      <iframe
                        src={paymentUrl}
                        title="Moyasar payment"
                        style={{ width: "100%", minHeight: "620px", border: "0" }}
                      />
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                      <Loader2
                        size={34}
                        color="#1C0052"
                        style={{ animation: "spin 1s linear infinite", marginBottom: "12px" }}
                      />
                      <p style={{ color: "#666", margin: 0 }}>
                        {t.redirectingToPayment}
                      </p>
                    </div>
                  )}

                  {paymentError && (
                    <div
                      style={{
                        background: "#fde8e8",
                        color: "#dc3545",
                        padding: "15px",
                        borderRadius: "8px",
                        marginTop: "15px",
                      }}
                    >
                      <strong>{t.paymentError}:</strong> {paymentError}
                      <button
                        onClick={() => {
                          setPaymentError(null);
                          setStep(2);
                        }}
                        style={{
                          background: "#1C0052",
                          color: "#fff",
                          border: "none",
                          padding: "8px 20px",
                          borderRadius: "20px",
                          cursor: "pointer",
                          marginTop: "10px",
                          fontWeight: "600",
                        }}
                      >
                        {t.retry}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}