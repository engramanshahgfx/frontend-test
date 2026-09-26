'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function CustomPaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const uniqueLink = params.uniqueLink;
  const lang = params.lang || 'en';

  const [offerData, setOfferData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null); // null, 'success', 'failed', 'already_paid'
  const [moyasarReady, setMoyasarReady] = useState(false);
  const [paymentInitialized, setPaymentInitialized] = useState(false);

  // Check for payment callback from Moyasar (redirect flow)
  useEffect(() => {
    const status = searchParams.get('status');
    const id = searchParams.get('id');
    const message = searchParams.get('message');

    if (status) {
      if (status === 'paid') {
        // Payment was successful, update backend
        updatePaymentStatus('success', id);
      } else if (status === 'failed') {
        setPaymentStatus('failed');
        setError(message || 'Payment was not completed');
      }
    }
  }, [searchParams]);

  // Fetch offer details
  useEffect(() => {
    const fetchOffer = async () => {
      if (!uniqueLink) return;

      try {
        const response = await fetch(`${API_URL}/custom-payment-offers/${uniqueLink}`);
        const data = await response.json();

        if (data.success) {
          setOfferData(data.data);
          
          // Check if already paid
          if (data.data.already_paid || data.data.payment_status === 'paid' || data.data.payment_status === 'completed') {
            setPaymentStatus('already_paid');
          }
        } else {
          setError(data.message || 'Payment offer not found');
        }
      } catch (err) {
        setError('Failed to load payment details. Please try again later.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [uniqueLink]);

  // Update payment status on backend
  const updatePaymentStatus = async (status, transactionId) => {
    try {
      const endpoint = status === 'success' ? 'payment-success' : 'payment-failed';
      const response = await fetch(`${API_URL}/custom-payment-offers/${uniqueLink}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transaction_id: transactionId,
          status: status === 'success' ? 'paid' : 'failed'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setPaymentStatus(status);
      } else {
        console.error('Failed to update payment status:', result.message);
        // Still show success to user if payment was made
        if (status === 'success') {
          setPaymentStatus('success');
        }
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      // Still show success to user if payment was made
      if (status === 'success') {
        setPaymentStatus('success');
      }
    }
  };

  // Initialize Moyasar payment form
  const initMoyasar = useCallback(() => {
    if (!offerData || paymentInitialized || !moyasarReady || paymentStatus) return;

    const moyasarKey = process.env.NEXT_PUBLIC_MOYASAR_PUBLIC_KEY || process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY;
    
    if (!moyasarKey) {
      setError('Payment configuration error. Please contact support.');
      console.error('Moyasar key not configured');
      return;
    }

    if (typeof window.Moyasar === 'undefined') {
      console.log('Moyasar not loaded yet');
      return;
    }

    try {
      // Amount in halalas (smallest SAR unit)
      const amountInHalalas = Math.round(offerData.amount * 100);
      const callbackUrl = `${window.location.origin}/${lang}/pay-custom-offer/${uniqueLink}`;

      window.Moyasar.init({
        element: '.moyasar-form',
        amount: amountInHalalas,
        currency: 'SAR',
        description: offerData.description || 'Custom Payment',
        publishable_api_key: moyasarKey,
        callback_url: callbackUrl,
        metadata: {
          unique_link: uniqueLink,
          customer_name: offerData.customer_name,
        },
        methods: ['creditcard', 'stcpay', 'applepay'],
        apple_pay: {
          country: 'SA',
          label: 'Tilal Rimal',
          validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
        },
        on_initiating: function() {
          console.log('Payment initiating...');
        },
        on_completed: function(payment) {
          console.log('Payment completed:', payment);
          if (payment.status === 'paid') {
            updatePaymentStatus('success', payment.id);
          } else {
            setPaymentStatus('failed');
            setError('Payment was not successful');
          }
        },
        on_failure: function(error) {
          console.error('Payment failed:', error);
          setPaymentStatus('failed');
          setError(error?.message || 'Payment failed. Please try again.');
        },
      });

      setPaymentInitialized(true);
    } catch (err) {
      console.error('Moyasar init error:', err);
      setError('Failed to initialize payment. Please refresh the page.');
    }
  }, [offerData, paymentInitialized, moyasarReady, paymentStatus, uniqueLink, lang]);

  // Try to initialize Moyasar when ready
  useEffect(() => {
    if (moyasarReady && offerData && !paymentStatus) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(initMoyasar, 100);
      return () => clearTimeout(timer);
    }
  }, [moyasarReady, offerData, paymentStatus, initMoyasar]);

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingCard}>
          <div className={styles.spinner}></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !paymentStatus) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>✕</div>
          <h2>Error</h2>
          <p>{error}</p>
          <a href="/" className={styles.homeLink}>
            Go Back Home
          </a>
        </div>
      </div>
    );
  }

  // Already paid state
  if (paymentStatus === 'already_paid') {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h2>Already Paid</h2>
          <p>This payment offer has already been completed.</p>
          <p className={styles.successDescription}>
            Amount: <strong>{offerData?.amount} SAR</strong>
          </p>
          <a href="/" className={styles.homeLink}>
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // Payment success state
  if (paymentStatus === 'success') {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h2>Payment Successful!</h2>
          <p>Thank you for your payment of <strong>{offerData?.amount} SAR</strong></p>
          <p className={styles.successDescription}>{offerData?.description}</p>
          <p className={styles.confirmationText}>
            A confirmation email has been sent to your email address.
          </p>
          <a href="/" className={styles.homeLink}>
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // Payment failed state
  if (paymentStatus === 'failed') {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>✕</div>
          <h2>Payment Failed</h2>
          <p>{error || 'Your payment could not be processed.'}</p>
          <button 
            onClick={() => {
              setPaymentStatus(null);
              setError('');
              setPaymentInitialized(false);
            }}
            className={styles.retryButton}
          >
            Try Again
          </button>
          <a href="/" className={styles.homeLink}>
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // Main payment form
  return (
    <>
      {/* Moyasar Scripts */}
      <Script 
        src="https://cdn.moyasar.com/mpf/1.14.0/moyasar.js"
        onLoad={() => setMoyasarReady(true)}
        onError={() => setError('Failed to load payment system')}
      />
      <link 
        rel="stylesheet" 
        href="https://cdn.moyasar.com/mpf/1.14.0/moyasar.css" 
      />

      <div className={styles.container}>
        <div className={styles.paymentCard}>
          <div className={styles.cardHeader}>
            <div className={styles.logo}>🏜️</div>
            <h1 className={styles.brandName}>Tilal Rimal</h1>
          </div>

          <div className={styles.offerDetails}>
            <h2 className={styles.title}>Complete Your Payment</h2>

            {/* Offer Information */}
            <div className={styles.detailsSection}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Customer Name</span>
                <span className={styles.value}>{offerData?.customer_name}</span>
              </div>
              {offerData?.customer_email && (
                <div className={styles.detailRow}>
                  <span className={styles.label}>Email</span>
                  <span className={styles.value}>{offerData.customer_email}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span className={styles.label}>Description</span>
                <span className={styles.value}>{offerData?.description}</span>
              </div>

              {/* Amount Box */}
              <div className={styles.amountBox}>
                <span className={styles.amountLabel}>Total Amount</span>
                <span className={styles.amountValue}>
                  {Number(offerData?.amount).toLocaleString('en-SA', { 
                    minimumFractionDigits: 2 
                  })} SAR
                </span>
              </div>
            </div>

            {/* Moyasar Payment Form */}
            <div className={styles.paymentSection}>
              <h3 className={styles.paymentTitle}>Choose Payment Method</h3>
              
              {!moyasarReady ? (
                <div className={styles.paymentLoading}>
                  <div className={styles.miniSpinner}></div>
                  <p>Loading payment options...</p>
                </div>
              ) : (
                <div className="moyasar-form"></div>
              )}
            </div>

            {/* Security Info */}
            <div className={styles.securityInfo}>
              <p>🔒 Your payment is secure and encrypted</p>
              <p>Powered by Moyasar Payment Gateway</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
