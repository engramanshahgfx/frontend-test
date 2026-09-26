'use client';

import { useEffect, useRef, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

declare global {
  interface Window {
    Moyasar: any;
    ApplePaySession?: {
      canMakePayments?: () => boolean;
    };
  }
}

export default function BookingSuccessPage() {
  const [lang, setLang] = useState('en');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  type PaymentMethodType = 'creditcard' | 'stcpay' | 'applepay';
  type PaymentMethod = {
    value: PaymentMethodType;
    label: string; 
    // icon: JSX.Element;
    available: boolean;
  };

  const [amount, setAmount] = useState<number | null>(null);
  const paymentFormRef = useRef<HTMLDivElement | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [applePayAvailable, setApplePayAvailable] = useState(false);

  // Inject CSS
  useEffect(() => {
    const styleId = 'moyasar-payment-page-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* ===== GLOBAL RESET ===== */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        /* ===== LOADING SCREEN ===== */
        .payment-loading-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fefaf0 0%, #ffffff 50%, #faf7f0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .payment-loading-content {
          text-align: center;
        }
        .payment-loading-spinner {
          position: relative;
          display: inline-block;
        }
        .payment-loading-spinner-ring {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 4px solid #d4a853;
          border-top-color: transparent;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        .payment-loading-text {
          margin-top: 24px;
          color: #6b5d52;
          font-weight: 500;
        }

        /* ===== ERROR SCREEN ===== */
        .payment-error-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fefaf0 0%, #ffffff 50%, #faf7f0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .payment-error-card {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          max-width: 400px;
          width: 100%;
          padding: 32px;
          text-align: center;
        }
        .payment-error-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #fef2f2;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 40px;
        }
        .payment-error-title {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 12px;
        }
        .payment-error-message {
          color: #6b5d52;
          margin-bottom: 32px;
        }
        .payment-error-button {
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(135deg, #d4a853 0%, #c49a44 100%);
          color: #ffffff;
          border: none;
          border-radius: 16px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 30px rgba(212, 168, 83, 0.3);
        }
        .payment-error-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(212, 168, 83, 0.4);
        }

        /* ===== MAIN PAYMENT PAGE ===== */
        .payment-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #fefaf0 0%, #ffffff 50%, #faf7f0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
        }
        .payment-container {
          width: 100%;
          max-width: 672px;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #f0e8d8;
          padding: 32px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
        }

        /* ===== HEADER ===== */
        .payment-header-icon {
          display: inline-flex;
          width: 56px;
          height: 56px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #fef3e8;
          color: #d4a853;
          margin-top: -12px !important;
        }
        .payment-header-icon svg {
          width: 28px;
          height: 28px;
        }
        .payment-title {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          text-align: center;
        }
        .payment-subtitle {
          margin-top: 8px;
          font-size: 14px;
          color: #8a7a6a;
          text-align: center;
        }
        .payment-amount-box {
          margin-top: 20px;
          display: inline-block;
          background: #fefaf0;
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 600;
          color: #8a6d3b;
        }
        .payment-amount-box span {
          font-size: 18px;
        }

        /* ===== METHOD BUTTONS ===== */
        .payment-methods-row {
          margin-top: 24px;
          display: flex;
          gap: 12px;
          justify-content: center !important;
          flex-wrap: wrap;
        }
        .payment-method-btn {
          padding: 8px 20px;
          border-radius: 9999px;
          border: 1px solid #f0e8d8;
          background: #ffffff;
          color: #8a6d3b;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        .payment-method-btn:hover {
          border-color: #d4a853;
          background: #fefaf0;
        }
        .payment-method-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f5f2eb;
          border-color: #e8e2d7;
          color: #9b8f7e;
        }
        .payment-method-btn.active {
          background: #d4a853;
          color: #ffffff;
          border-color: #d4a853;
        }
        .payment-method-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          margin-right: 8px;
        }

        /* ===== PAYMENT FORM ===== */
        .payment-form-wrapper {
          margin-top: 32px;
          display: flex;
          justify-content: center;
        }
        .payment-form-box {
          width: 100%;
          max-width: 512px;
          background: #faf7f5;
          border-radius: 16px;
          border: 1px solid #f0ebe6;
          padding: 16px 20px;
        }
        #moyasar-payment-form {
          width: 100%;
          min-height: 320px;
        }

        /* Improve layout of Moyasar form fields so card inputs line up nicely */
        #moyasar-payment-form .moyasar-form .moyasar-field {
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 10px;
        }
        #moyasar-payment-form .moyasar-form .moyasar-field > * {
          flex: 1 1 0;
          min-width: 0;
        }
        #moyasar-payment-form .moyasar-form input,
        #moyasar-payment-form .moyasar-form .moyasar-input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          background: #fff;
        }
        /* make sure grouped fields (card number / expiry / cvc) look balanced */
        #moyasar-payment-form .moyasar-form .moyasar-field.moyasar-field--inline {
          display: flex;
        }
        /* RTL tweaks when the page language is Arabic */
        .payment-container[dir="rtl"] #moyasar-payment-form .moyasar-form,
        .payment-container[dir="rtl"] #moyasar-payment-form .moyasar-form .moyasar-field {
          direction: rtl;
        }

        /* ===== MOYASAR OVERRIDES ===== */
        #moyasar-payment-form .moyasar-powered-by,
        #moyasar-payment-form .moyasar-footer,
        #moyasar-payment-form .moyasar-test-mode,
        #moyasar-payment-form [class*="powered"],
        #moyasar-payment-form [class*="branding"],
        #moyasar-payment-form [class*="test-mode"],
        #moyasar-payment-form a[href*="moyasar.com"] {
          display: none !important;
        }
        #moyasar-payment-form .moyasar-form {
          background: transparent !important;
          border: 0 !important;
          padding: 0 !important;
        }
        #moyasar-payment-form .moyasar-form .moyasar-field {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
          padding: 14px;
          margin-bottom: 12px;
        }
        #moyasar-payment-form .moyasar-form input,
        #moyasar-payment-form .moyasar-form .moyasar-input {
          font-size: 15px;
          color: #0f172a;
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
        }
        #moyasar-payment-form .moyasar-form .moyasar-field-label {
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 6px;
          display: block;
        }
        #moyasar-payment-form .moyasar-form .moyasar-button,
        #moyasar-payment-form .moyasar-form button {
          width: 100%;
          display: inline-block;
          padding: 14px 18px;
          border-radius: 12px;
          border: 0;
          font-weight: 700;
          color: #ffffff;
          background: #d4a853 !important;
          box-shadow: 0 8px 30px rgba(212, 168, 83, 0.2);
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        #moyasar-payment-form .moyasar-form .moyasar-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(212, 168, 83, 0.3);
        }
        #moyasar-payment-form .moyasar-form .moyasar-button:disabled,
        #moyasar-payment-form .moyasar-form button[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
        }
        #moyasar-payment-form .moyasar-form .moyasar-card-icons {
          display: flex;
          gap: 4px;
          margin-top: 6px;
        }
        #moyasar-payment-form .moyasar-form .moyasar-header {
          display: none;
        }
        #moyasar-payment-form .moyasar-form .moyasar-note {
          color: #6b7280;
          font-size: 13px;
          margin-top: 10px;
        }

        /* ===== FOOTER ===== */
        .payment-footer-text {
          margin-top: 24px;
          text-align: center;
          font-size: 12px;
          color: #b8a99a;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 640px) {
          .payment-container {
            padding: 24px 16px;
          }
          #moyasar-payment-form .moyasar-form .moyasar-field {
            padding: 10px;
          }
          .payment-methods-row {
            gap: 8px;
          }
          .payment-method-btn {
            padding: 6px 14px;
            font-size: 12px;
          }
        }

        /* ===== ANIMATIONS ===== */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    return () => document.getElementById(styleId)?.remove();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const id = searchParams.get('booking_id');
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const currentLang = pathSegments[0] || 'en';

    setLang(currentLang);
    setBookingId(id);

    const applePaySupported =
      typeof window.ApplePaySession !== 'undefined' &&
      typeof window.ApplePaySession.canMakePayments === 'function' &&
      window.ApplePaySession.canMakePayments();

    setApplePayAvailable(Boolean(applePaySupported));

    if (!id) {
      setError('No booking ID provided.');
      setLoading(false);
      return;
    }

    const fetchPaymentDetails = async () => {
      try {
        // First try to initiate Moyasar hosted invoice payment
        try {
          const initRes = await fetch(`${API_URL}/payments/moyasar/initiate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({ booking_id: id, lang }),
          });
          const initData = await initRes.json();
          if (initRes.ok && initData.success && initData.payment_url) {
            window.location.href = initData.payment_url;
            return;
          }
        } catch (initErr) {
          console.warn('Moyasar hosted invoice initiate warning:', initErr);
        }

        const response = await fetch(`${API_URL}/bookings/${id}/payment-details`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Unable to load payment details.');
        }

        const parsedAmount = Number(data.amount);
        const validAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
        setAmount(validAmount);
        setBookingReference(data.reference || `#${id}`);

        if (validAmount <= 0) {
          setError('Invalid payment amount. Please refresh or contact support.');
          setLoading(false);
          return;
        }
      } catch (fetchError) {
        console.error('Fetch payment details error:', fetchError);
        setError('Unable to load booking payment details. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || amount === null || loading || !bookingId) return;
    if (amount <= 0) {
      setError('Invalid payment amount. Please refresh or contact support.');
      return;
    }

    const MOYASAR_SDK_URL = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js';
    const MOYASAR_CSS_URL = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css';

    const addMoyasarStylesheet = () => {
      if (document.querySelector(`link[href="${MOYASAR_CSS_URL}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = MOYASAR_CSS_URL;
      document.head.appendChild(link);
    };

    const loadMoyasarSDK = () => {
      if (typeof window.Moyasar !== 'undefined') {
        initPayment();
        return;
      }

      const script = document.createElement('script');
      script.src = MOYASAR_SDK_URL;
      script.async = true;
      script.onload = () => {
        initPayment();
      };
      script.onerror = () => {
        setError('Failed to load payment gateway. Please refresh.');
      };
      document.body.appendChild(script);
      addMoyasarStylesheet();

      setTimeout(() => {
        if (typeof window.Moyasar === 'undefined') {
          setError('Payment gateway loading timeout. Please refresh.');
        }
      }, 15000);
    };

    const initPayment = () => {
      const publishableKey =
        process.env.NEXT_PUBLIC_MOYASAR_PUBLIC_KEY ||
        process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY ||
        'pk_live_JjGYt4f9iWDGpc9uCE9FCMBvZ9u5FBa5SsQvEFAY';
      if (!publishableKey) {
        setError('Payment gateway is not configured.');
        return;
      }

      const container = paymentFormRef.current;
      if (!container) {
        window.setTimeout(initPayment, 100);
        return;
      }

      try {
        container.innerHTML = '';
        const methods = ['creditcard', 'stcpay', ...(applePayAvailable ? ['applepay'] : [])];

        window.Moyasar.init({
          element: container,
          amount: Math.round(amount * 100),
          currency: 'SAR',
          description: bookingReference ? `Booking ${bookingReference}` : `Booking #${bookingId}`,
          publishable_api_key: publishableKey,
          callback_url: `${window.location.origin}/${lang}/payment-success?booking_id=${bookingId}`,
          methods,
          apple_pay: {
            country: 'SA',
            label: 'Tilal Rimal',
            validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
          },
          on_completed: () => {
            window.location.href = `/${lang}/payment-success?booking_id=${bookingId}`;
          },
          on_failure: (error: any) => {
            console.error('Payment error:', error);
            setError('Payment failed. Please try again.');
          },
        });

        const hideDefaultBranding = () => {
          const nodes = container.querySelectorAll('*');
          nodes.forEach((node: Element) => {
            const text = node.textContent?.toLowerCase() || '';
            if (text.includes('powered by') || text.includes('test mode')) {
              (node as HTMLElement).style.display = 'none';
            }
          });
          container.querySelectorAll('a[href*="moyasar.com"]').forEach((node) => {
            (node as HTMLElement).style.display = 'none';
          });
        };

        window.setTimeout(hideDefaultBranding, 300);
        window.setTimeout(hideDefaultBranding, 1200);
      } catch (err) {
        console.error('Moyasar init error:', err);
        setError('Failed to initialize payment.');
      }
    };

    loadMoyasarSDK();
  }, [amount, loading, bookingId, lang]);

  if (loading) {
    return (
      <div className="payment-loading-container">
        <div className="payment-loading-content">
          <div className="payment-loading-spinner">
            <div className="payment-loading-spinner-ring"></div>
          </div>
          <p className="payment-loading-text">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-error-container">
        <div className="payment-error-card">
          <div className="payment-error-icon">⚠️</div>
          <h2 className="payment-error-title">Something went wrong</h2>
          <p className="payment-error-message">{error}</p>
          <button className="payment-error-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

        {/* Header Icon */}
        <div style={{ textAlign: 'center' }}>
          {/* <div className="payment-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M7 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
            </svg>
          </div> */}

          {/* <h1 className="payment-title">Complete Your Payment</h1>
          <p className="payment-subtitle">Secure checkout with your preferred payment method.</p> */}

          <div className="payment-amount-box">
            Total Amount: <span>{amount} SAR</span>
          </div>
        </div>

        {/* Payment Form */}
        <div className="payment-form-wrapper">
          <div className="payment-form-box">
            <div ref={paymentFormRef} id="moyasar-payment-form" />
          </div>
        </div>

        {/* Footer */}
        <p className="payment-footer-text">
          Secure payments powered by Moyasar. Supports Visa, Mada, STC Pay, and Apple Pay.
        </p>

      </div>
    </div>
  );
}