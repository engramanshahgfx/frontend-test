'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Home, ShieldCheck, Copy, Check, RotateCcw, AlertTriangle, Loader2, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = (params?.lang as string) || 'en';
  const isRTL = lang === 'ar';

  const bookingId = searchParams?.get('booking_id') || searchParams?.get('bookingId');
  const paymentId = searchParams?.get('id');
  const statusParam = (searchParams?.get('status') || '').toLowerCase();
  const rawMessage = searchParams?.get('message') || searchParams?.get('error');

  const [verifying, setVerifying] = useState(true);
  const [isPaidVerified, setIsPaidVerified] = useState(false);
  const [copied, setCopied] = useState(false);
  const [redirectingToCheckout, setRedirectingToCheckout] = useState(false);

  const handlePayNow = async () => {
    if (!bookingId) {
      window.location.href = `/${lang}`;
      return;
    }
    setRedirectingToCheckout(true);
    try {
      const cleanBase = API_URL.replace(/\/$/, '');
      const initRes = await fetch(`${cleanBase}/payments/moyasar/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ booking_id: bookingId, lang }),
      });
      const initData = await initRes.json();
      if (initRes.ok && initData.success && initData.payment_url) {
        window.location.href = initData.payment_url;
        return;
      }
    } catch (err) {
      console.warn('Direct Moyasar initiate warning:', err);
    }
    window.location.href = `/${lang}/booking-success?booking_id=${bookingId}`;
  };

  useEffect(() => {
    let isMounted = true;
    const checkVerification = async () => {
      // If Moyasar explicit failure URL param
      if (statusParam === 'failed' || statusParam === 'canceled' || statusParam === 'error' || statusParam === 'declined') {
        if (isMounted) {
          setIsPaidVerified(false);
          setVerifying(false);
        }
        return;
      }

      const lookupId = bookingId || paymentId;
      if (!lookupId) {
        if (isMounted) {
          setIsPaidVerified(false);
          setVerifying(false);
        }
        return;
      }

      try {
        const cleanBase = API_URL.replace(/\/$/, '');
        if (statusParam === 'paid' && bookingId && paymentId) {
          const verifyResponse = await fetch(`${cleanBase}/payments/moyasar/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ booking_id: bookingId, payment_id: paymentId }),
          });
          const verifyResult = await verifyResponse.json();
          if (verifyResponse.ok && verifyResult.success) {
            if (isMounted) setIsPaidVerified(true);
            return;
          }
          console.error('[PaymentSuccess] Backend rejected payment verification:', verifyResult.message);
        }

        const res = await fetch(`${cleanBase}/payments/status/${lookupId}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });

        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            setIsPaidVerified(Boolean(json.is_paid));
          }
        } else {
          if (isMounted) setIsPaidVerified(false);
        }
      } catch (err) {
        console.error('[PaymentSuccess] Verification check error:', err);
        if (isMounted) setIsPaidVerified(false);
      } finally {
        if (isMounted) setVerifying(false);
      }
    };

    checkVerification();

    return () => {
      isMounted = false;
    };
  }, [bookingId, paymentId, statusParam]);

  const handleCopyId = () => {
    if (bookingId) {
      navigator.clipboard.writeText(bookingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFailureReason = () => {
    if (rawMessage) {
      const decoded = decodeURIComponent(rawMessage);
      if (decoded.includes('INVALID CARD OR NOT FOUND') || decoded.includes('DECLINED')) {
        return isRTL
          ? 'تم رفض البطاقة: رقم البطاقة غير صحيح أو ملغي.'
          : 'Card Declined: Invalid card number or expired card.';
      }
      return decoded;
    }
    return isRTL
      ? 'لم يتم تأكيد عملية الدفع لهذا الحجز بعد. يرجى إكمال عملية الدفع.'
      : 'Payment for this booking has not been verified or completed yet.';
  };

  const t = {
    en: {
      title: "Payment Successful!",
      subtitle: "Your booking has been confirmed. Thank you for choosing Tilal Rimal.",
      failedTitle: statusParam === 'failed' ? "Payment Failed" : "Payment Unverified",
      failedSubtitle: getFailureReason(),
      bookingId: "Booking ID",
      paymentRef: "Payment Reference",
      status: "Payment Status",
      paid: "Paid & Verified",
      failedStatus: statusParam === 'failed' ? "Failed / Declined" : "Unpaid / Pending",
      backHome: "Back to Home",
      tryAgain: statusParam === 'failed' ? "Try Again" : "Complete Payment",
      sar: "SAR",
      copied: "Copied!",
      copy: "Copy ID"
    },
    ar: {
      title: "تم الدفع بنجاح!",
      subtitle: "تم تأكيد حجزك بنجاح. شكراً لاختيارك التلال والرمال لتنظيم الرحلات.",
      failedTitle: statusParam === 'failed' ? "فشلت عملية الدفع" : "الدفع غير مؤكد",
      failedSubtitle: getFailureReason(),
      bookingId: "رقم الحجز",
      paymentRef: "الرقم المرجعي للدفع",
      status: "حالة الدفع",
      paid: "مكتمل ومعتمد",
      failedStatus: statusParam === 'failed' ? "مرفوضة / لم تكتمل" : "غير مدفوع / معلق",
      backHome: "العودة للرئيسية",
      tryAgain: statusParam === 'failed' ? "إعادة المحاولة" : "إكمال عملية الدفع",
      sar: "ر.س",
      copied: "تم النسخ!",
      copy: "نسخ الرقم"
    },
    zh: {
      title: "支付成功！",
      subtitle: "您的预订已确认。感谢您选择 Tilal Rimal。",
      failedTitle: statusParam === 'failed' ? "支付失败" : "支付未确认",
      failedSubtitle: getFailureReason(),
      bookingId: "预订 ID",
      paymentRef: "支付参考号",
      status: "支付状态",
      paid: "已支付并确认",
      failedStatus: statusParam === 'failed' ? "支付失败" : "未支付",
      backHome: "返回首页",
      tryAgain: statusParam === 'failed' ? "重试" : "去支付",
      sar: "SAR",
      copied: "已复制！",
      copy: "复制 ID"
    }
  };

  const labels = t[lang as keyof typeof t] || t.en;
  const retryUrl = bookingId ? `/${lang}/booking-success?booking_id=${bookingId}` : `/${lang}`;

  if (verifying) {
    return (
      <div
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          minHeight: "100vh",
          background: "#FAF6F0",
          padding: "160px 20px 100px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", background: "#fff", padding: "40px 32px", borderRadius: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.06)" }}>
          <Loader2 size={40} color="#E85D1F" className="animate-spin" style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px auto" }} />
          <h3 style={{ margin: 0, color: "#1C0052", fontSize: "1.1rem" }}>
            {isRTL ? "جاري التحقق من حالة الدفع..." : "Verifying payment status..."}
          </h3>
        </div>
      </div>
    );
  }

  const isSuccess = isPaidVerified && statusParam !== 'failed';

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        background: "#FAF6F0",
        padding: "160px 20px 100px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: "540px",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow: "0 20px 50px rgba(28, 0, 82, 0.08), 0 4px 15px rgba(0, 0, 0, 0.02)",
          border: !isSuccess ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(28, 0, 82, 0.06)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top Decorative Accent Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: !isSuccess
              ? "linear-gradient(90deg, #EF4444 0%, #DC2626 100%)"
              : "linear-gradient(90deg, #10B981 0%, #059669 100%)",
          }}
        />

        {/* Animated Icon Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          style={{
            width: "88px",
            height: "88px",
            borderRadius: "50%",
            background: !isSuccess
              ? "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)"
              : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px auto",
            boxShadow: !isSuccess
              ? "0 12px 30px rgba(239, 68, 68, 0.35)"
              : "0 12px 30px rgba(16, 185, 129, 0.35)",
            position: "relative",
          }}
        >
          {!isSuccess ? <XCircle size={48} strokeWidth={2.2} /> : <CheckCircle2 size={48} strokeWidth={2.2} />}
        </motion.div>

        {/* Title & Subtitle */}
        <h1
          style={{
            fontSize: "1.85rem",
            fontWeight: "800",
            color: !isSuccess ? "#991B1B" : "#1C0052",
            marginBottom: "10px",
            lineHeight: 1.2,
          }}
        >
          {!isSuccess ? labels.failedTitle : labels.title}
        </h1>
        <p
          style={{
            fontSize: "0.98rem",
            color: !isSuccess ? "#B91C1C" : "#64748b",
            marginBottom: "32px",
            lineHeight: 1.5,
          }}
        >
          {!isSuccess ? labels.failedSubtitle : labels.subtitle}
        </p>

        {/* Details Container */}
        <div
          style={{
            background: !isSuccess ? "#FEF2F2" : "#F8FAFC",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "32px",
            border: !isSuccess ? "1px solid #FCA5A5" : "1px solid #E2E8F0",
            textAlign: isRTL ? "right" : "left",
          }}
        >
          {bookingId && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "14px",
                borderBottom: !isSuccess ? "1px solid #FCA5A5" : "1px solid #E2E8F0",
                marginBottom: "14px",
              }}
            >
              <span style={{ fontSize: "0.9rem", color: !isSuccess ? "#991B1B" : "#64748b", fontWeight: "600" }}>
                {labels.bookingId}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "1.1rem", color: "#1C0052", fontWeight: "800" }}>
                  #{bookingId}
                </span>
                <button
                  onClick={handleCopyId}
                  title={labels.copy}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: copied ? "#10B981" : "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    padding: "2px",
                    transition: "color 0.2s ease",
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "0.9rem", color: !isSuccess ? "#991B1B" : "#64748b", fontWeight: "600" }}>
              {labels.status}
            </span>
            <span
              style={{
                fontSize: "0.85rem",
                color: !isSuccess ? "#991B1B" : "#047857",
                fontWeight: "700",
                background: !isSuccess ? "#FEE2E2" : "#D1FAE5",
                padding: "4px 12px",
                borderRadius: "20px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {!isSuccess ? (
                <>
                  <AlertTriangle size={14} /> {labels.failedStatus}
                </>
              ) : (
                <>
                  <ShieldCheck size={14} /> {labels.paid}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {!isSuccess ? (
            <button
              onClick={handlePayNow}
              disabled={redirectingToCheckout}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #E85D1F 0%, #D34C12 100%)",
                color: "#ffffff",
                padding: "14px 24px",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "1rem",
                border: "none",
                cursor: redirectingToCheckout ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 6px 20px rgba(232, 93, 31, 0.3)",
                transition: "all 0.25s ease",
              }}
            >
              {redirectingToCheckout ? (
                <>
                  <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                  <span>{isRTL ? "جاري التوجيه لبوابة الدفع..." : "Redirecting to Payment..."}</span>
                </>
              ) : (
                <>
                  {statusParam === 'failed' ? <RotateCcw size={18} /> : <CreditCard size={18} />}
                  <span>{labels.tryAgain}</span>
                </>
              )}
            </button>
          ) : (
            <Link
              href={`/${lang}`}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #E85D1F 0%, #D34C12 100%)",
                color: "#ffffff",
                padding: "14px 24px",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "1rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 6px 20px rgba(232, 93, 31, 0.3)",
                transition: "all 0.25s ease",
              }}
            >
              <Home size={18} />
              <span>{labels.backHome}</span>
            </Link>
          )}

          {!isSuccess && (
            <Link
              href={`/${lang}`}
              style={{
                width: "100%",
                background: "transparent",
                color: "#64748b",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "0.95rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.25s ease",
              }}
            >
              <Home size={16} />
              <span>{labels.backHome}</span>
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#FAF6F0",
            padding: "160px 20px 100px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}