"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, Calendar, Bed, Users, MessageSquare } from "lucide-react";
import { API_URL } from "@/lib/api";

export default function TourismOfferBookingModal({ isOpen, onClose, offerData, lang }) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    travel_date: '',
    room_type: 'DoubleRoom',
    package_id: '',
    package_code: '',
    notes: '',
    guests: 1,
    special_requests: '',
    booking_type: 'tourism_offer',
    payment_method: 'bank_transfer',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (offerData) {
      // Get package code from various possible sources
      const packageCode = 
        offerData.basic_info?.trip_code || 
        offerData.trip_code || 
        offerData.code || 
        offerData.slug ||
        `PKG-${offerData.id || Date.now()}`;
      
      setFormData(prev => ({
        ...prev,
        package_id: String(offerData.id || offerData.slug || ''),
        package_code: String(packageCode),
      }));
    }
  }, [offerData]);

  if (!isOpen) return null;

  const isRTL = lang === 'ar';

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch(`${API_URL}/coupons/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          booking_amount: calculateOfferTotal(),
          package_type: 'tourism_offer',
          package_id: offerData?.id,
          email: formData.email || '',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data);
        setCouponError('');
      } else {
        setAppliedCoupon(null);
        setCouponError(data.message || (isRTL ? 'كوبون الخصم غير صالح أو منتهي الصلاحية' : 'Invalid or expired promo code'));
      }
    } catch (err) {
      setCouponError(isRTL ? 'فشل تطبيق الكوبون' : 'Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const labels = {
    en: {
      title: "Book Tourism Offer",
      firstName: "First Name",
      lastName: "Last Name",
      email: "E-mail",
      mobile: "Mobile Number",
      travelDate: "Travel Date",
      roomType: "Room Type",
      doubleRoom: "Double Room",
      singleRoom: "Single Room",
      guests: "Number of Guests",
      specialRequests: "Special Requests",
      confirm: "Confirm Booking",
      cancel: "Cancel",
      bookingSuccess: "Booking Confirmed!",
      thankYou: "Thank you for your booking. We will contact you shortly.",
    },
    ar: {
      title: "احجز عرض سياحي",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      email: "البريد الإلكتروني",
      mobile: "رقم الجوال",
      travelDate: "تاريخ السفر",
      roomType: "نوع الغرفة",
      doubleRoom: "غرفة مزدوجة",
      singleRoom: "غرفة فردية",
      guests: "عدد الضيوف",
      specialRequests: "طلبات خاصة",
      confirm: "تأكيد الحجز",
      cancel: "إلغاء",
      bookingSuccess: "تم تأكيد الحجز!",
      thankYou: "شكراً لحجزك. سنتواصل معك قريباً.",
    }
  };

  const t = labels[lang] || labels.en;

  // Helper to get the title from the offer data
  const getOfferTitle = () => {
    if (!offerData) return 'Tourism Offer';
    return offerData.title_en || offerData.title_ar || offerData.title || 'Tourism Offer';
  };

  const getOfferPrice = () => {
    if (!offerData) return 0;
    return Number(offerData.price ?? offerData.original_price ?? 0);
  };

  const calculateOfferTotal = () => {
    const guests = Number(formData.guests) || 1;
    const price = getOfferPrice();
    return price * guests;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = 'First Name is Required';
    if (!formData.last_name) newErrors.last_name = 'Last Name is Required';
    if (!formData.email) {
      newErrors.email = 'Email is Required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'The Email field is not a valid e-mail address.';
    }
    if (!formData.mobile) newErrors.mobile = 'Mobile is Required';
    if (!formData.travel_date) newErrors.travel_date = 'The Travel Date field is required.';
    if (!formData.guests || formData.guests < 1) newErrors.guests = 'Please select at least 1 guest';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const offerPrice = Number(offerData?.price ?? offerData?.original_price ?? 0);
      const totalAmount = calculateOfferTotal();
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
              booking_amount: totalAmount,
              package_type: 'tourism_offer',
              package_id: offerData?.id,
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

      const payableTotal = activeCoupon ? activeCoupon.final_total : totalAmount;

      if (!offerPrice || totalAmount <= 0) {
        setErrors({ submit: 'Offer price not available or invalid' });
        setLoading(false);
        return;
      }

      const bookingData = {
        ...formData,
        booking_type: 'tourism_offer',
        payment_method: 'credit_card',
        total_amount: payableTotal,
        price: payableTotal,
        package_title: getOfferTitle(),
        coupon_code: activeCoupon ? activeCoupon.code : null,
        discount_amount: activeCoupon ? activeCoupon.discount_amount : 0,
      };

      console.log("Submitting tourism offer booking:", bookingData);
      
      // Step 1: Create the booking
      const response = await fetch(`${API_URL}/bookings/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      console.log("Booking response:", data);

      if (response.ok && data.success) {
        const bookingId = data.data.id;
        
        // Redirect to checkout page where Moyasar form will handle payment
        window.location.href = `/${lang}/booking-success?booking_id=${bookingId}`;
      } else {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ submit: data.message || 'Something went wrong' });
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Booking error:', error);
      setErrors({ submit: 'Failed to create booking. Please try again.' });
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      mobile: '',
      travel_date: '',
      room_type: 'DoubleRoom',
      package_id: '',
      package_code: '',
      notes: '',
      guests: 1,
      special_requests: '',
      booking_type: 'tourism_offer',
      payment_method: 'bank_transfer',
    });
  };

  const handleClose = () => {
    resetForm();
    setErrors({});
    setStep(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="modal-overlay" 
          onClick={handleClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'auto'
          }}
        >
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '550px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              padding: '30px'
            }}
          >
            <button 
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '24px',
                color: '#999',
                zIndex: 10,
                padding: '5px'
              }}
            >
              <X size={24} />
            </button>

            {step === 1 ? (
              <>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px' }}>
                  {t.title}
                </h2>
                
                {offerData && (
                  <div style={{
                    background: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '10px',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{ margin: '0 0 5px', color: '#2c2c2c' }}>
                      {getOfferTitle()}
                    </h4>
                    {getOfferPrice() && (
                      <p style={{ margin: 0, color: '#dfa528', fontWeight: 'bold' }}>
                        {getOfferPrice()} SAR
                      </p>
                    )}
                    {offerData.duration && (
                      <p style={{ margin: '5px 0 0', color: '#666', fontSize: '14px' }}>
                        Duration: {offerData.duration}
                      </p>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                        {t.firstName} <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User size={18} style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#999'
                        }} />
                        <input
                          type="text"
                          name="first_name"
                          placeholder={t.firstName}
                          value={formData.first_name}
                          onChange={handleChange}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            border: errors.first_name ? '2px solid #dc3545' : '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                      {errors.first_name && (
                        <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                          {errors.first_name}
                        </span>
                      )}
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                        {t.lastName} <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User size={18} style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#999'
                        }} />
                        <input
                          type="text"
                          name="last_name"
                          placeholder={t.lastName}
                          value={formData.last_name}
                          onChange={handleChange}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            border: errors.last_name ? '2px solid #dc3545' : '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      {errors.last_name && (
                        <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                          {errors.last_name}
                        </span>
                      )}
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                        {t.email} <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#999'
                        }} />
                        <input
                          type="email"
                          name="email"
                          placeholder={t.email}
                          value={formData.email}
                          onChange={handleChange}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            border: errors.email ? '2px solid #dc3545' : '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      {errors.email && (
                        <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                          {errors.email}
                        </span>
                      )}
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                        {t.mobile} <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={18} style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#999'
                        }} />
                        <input
                          type="tel"
                          name="mobile"
                          placeholder={t.mobile}
                          value={formData.mobile}
                          onChange={handleChange}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            border: errors.mobile ? '2px solid #dc3545' : '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      {errors.mobile && (
                        <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                          {errors.mobile}
                        </span>
                      )}
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                        {t.travelDate} <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Calendar size={18} style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#999'
                        }} />
                        <input
                          type="date"
                          name="travel_date"
                          value={formData.travel_date}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            border: errors.travel_date ? '2px solid #dc3545' : '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      {errors.travel_date && (
                        <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                          {errors.travel_date}
                        </span>
                      )}
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                        {t.guests} <span style={{ color: '#dc3545' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Users size={18} style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#999'
                        }} />
                        <input
                          type="number"
                          name="guests"
                          value={formData.guests}
                          onChange={handleChange}
                          min="1"
                          max="20"
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            border: errors.guests ? '2px solid #dc3545' : '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                          }}
                        />
                      </div>
                      {errors.guests && (
                        <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                          {errors.guests}
                        </span>
                      )}
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>
                        {t.specialRequests}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <MessageSquare size={18} style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#999'
                        }} />
                        <textarea
                          name="special_requests"
                          placeholder={t.specialRequests}
                          value={formData.special_requests}
                          onChange={handleChange}
                          rows="3"
                          style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                          }}
                        />
                      </div>
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
                              background: "#dfa528",
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
                  </div>

                  {errors.submit && (
                    <div style={{
                      background: '#fee',
                      color: '#dc3545',
                      padding: '12px',
                      borderRadius: '8px',
                      marginTop: '15px',
                      fontSize: '14px'
                    }}>
                      {errors.submit}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: '#f0f0f0',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        fontSize: '14px'
                      }}
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 2,
                        padding: '12px',
                        background: '#dfa528',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        fontSize: '14px',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => !loading && (e.target.style.background = '#c98c1e')}
                      onMouseLeave={(e) => !loading && (e.target.style.background = '#dfa528')}
                    >
                      {loading ? 'Processing...' : `${t.confirm} (${(appliedCoupon && appliedCoupon.final_total !== undefined ? appliedCoupon.final_total : calculateOfferTotal())} SAR)`}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#d4edda',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{ color: '#28a745', marginBottom: '10px' }}>{t.bookingSuccess}</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                  {isRTL 
                    ? 'سيتم نقلك إلى صفحة الدفع الآمنة...'
                    : 'You will be redirected to secure payment page...'}
                </p>
                <div style={{
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '3px solid #dfa528',
                  borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}