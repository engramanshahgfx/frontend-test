'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const goldThemeStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    font-family: 'DM Sans', sans-serif;
    background: linear-gradient(135deg, #faf8f4 0%, #f5f2ed 100%);
    color: #0e0c0a;
  }
  
  .pay-wrapper {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 20px;
    min-height: 100vh;
  }
  
  .pay-header {
    text-align: center;
    margin-bottom: 40px;
  }
  
  .pay-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 500;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
  }
  
  .pay-logo span { color: #c9a84c; }
  
  .pay-crumb {
    font-size: 11px;
    color: #7a7469;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  
  .pay-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 40px;
    align-items: start;
  }
  
  @media (max-width: 768px) {
    .pay-grid { grid-template-columns: 1fr; gap: 20px; }
  }
  
  .pay-card {
    background: white;
    border: 1px solid rgba(201, 168, 76, 0.2);
    border-radius: 2px;
    padding: 28px;
    box-shadow: 0 4px 40px rgba(14, 12, 10, 0.08);
  }
  
  .pay-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 500;
    margin-bottom: 20px;
    color: #0e0c0a;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #7a7469;
    margin-bottom: 6px;
  }
  
  input, select {
    width: 100%;
    padding: 11px 12px;
    border: 1px solid rgba(201, 168, 76, 0.2);
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    transition: all 0.2s;
  }
  
  input:focus, select:focus {
    outline: none;
    border-color: #c9a84c;
    box-shadow: 0 0 0 2px rgba(201, 168, 76, 0.15);
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  
  .form-row.full { grid-template-columns: 1fr; }
  
  .pay-btn {
    width: 100%;
    padding: 13px;
    background: #c9a84c;
    color: white;
    border: none;
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 12px;
  }
  
  .pay-btn:hover:not(:disabled) { background: #b8953e; }
  .pay-btn:disabled { background: #ccc; cursor: not-allowed; }
  
  .pay-summary {
    background: white;
    border: 1px solid rgba(201, 168, 76, 0.2);
    border-radius: 2px;
    padding: 28px;
    box-shadow: 0 4px 40px rgba(14, 12, 10, 0.08);
    height: fit-content;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    font-size: 13px;
    border-bottom: 1px solid rgba(201, 168, 76, 0.1);
  }
  
  .summary-row.total {
    border-top: 2px solid rgba(201, 168, 76, 0.2);
    margin-top: 12px;
    padding-top: 16px;
    font-weight: 600;
    font-size: 18px;
    color: #c9a84c;
  }
  
  .summary-label { color: #7a7469; }
  .summary-value { font-weight: 500; color: #0e0c0a; }
  
  .error-box {
    background: rgba(220, 80, 80, 0.08);
    border: 1px solid rgba(220, 80, 80, 0.25);
    color: #b94040;
    padding: 12px 14px;
    border-radius: 2px;
    font-size: 12px;
    margin-bottom: 16px;
  }
  
  .success-box {
    background: rgba(80, 180, 80, 0.08);
    border: 1px solid rgba(80, 180, 80, 0.25);
    color: #2d8a2d;
    padding: 12px 14px;
    border-radius: 2px;
    font-size: 12px;
    margin-bottom: 16px;
  }
  
  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 2px solid rgba(201, 168, 76, 0.2);
    border-top-color: #c9a84c;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 20px auto;
  }
  
  @keyframes spin { to { transform: rotate(360deg); } }
`;

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params?.lang || 'en';
  
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [paymentData, setPaymentData] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  // Load payment data from URL params
  useEffect(() => {
    const pnr = searchParams.get('pnr');
    const amount = searchParams.get('amount');
    
    if (!pnr || !amount) {
      setError('Missing payment details. Please go back and try again.');
      setLoading(false);
      return;
    }

    setPaymentData({
      pnr,
      amount: parseFloat(amount),
      bookingId: searchParams.get('booking_id'),
      email: searchParams.get('email') || 'customer@example.com',
      name: searchParams.get('name') || 'Customer',
    });
    
    setLoading(false);
  }, [searchParams]);

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let cleanValue = value;

    if (name === 'cardNumber') {
      cleanValue = value.replace(/\D/g, '').slice(0, 16);
    } else if (name === 'cvv') {
      cleanValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({
      ...prev,
      [name]: cleanValue
    }));
  };

  // Handle payment submission
  const handlePayment = async (e) => {
    e.preventDefault();
    setPaying(true);
    setError(null);

    // Validate form
    if (!formData.cardNumber || !formData.cardHolder || !formData.expiryMonth || !formData.expiryYear || !formData.cvv) {
      setError('Please fill in all payment details');
      setPaying(false);
      return;
    }

    if (formData.cardNumber.length !== 16) {
      setError('Card number must be 16 digits');
      setPaying(false);
      return;
    }

    if (formData.cvv.length < 3) {
      setError('CVV must be at least 3 digits');
      setPaying(false);
      return;
    }

    try {
      console.log('Processing payment:', {
        pnr: paymentData.pnr,
        amount: paymentData.amount,
        card: formData.cardNumber.slice(-4).padStart(16, '*'),
      });

      // Call backend to verify and confirm booking
      const response = await fetch(
        `${API_BASE}/v2/ndc/bookings/${paymentData.pnr}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            payment_reference: `TEST-${Date.now()}`,
            amount: paymentData.amount,
            currency: 'SAR',
            status: 'paid',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment confirmation failed');
      }

      setSuccess(true);
      setFormData({
        cardNumber: '',
        cardHolder: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
      });

      // Redirect to confirmation after 2 seconds
      setTimeout(() => {
        router.push(
          `/${lang}/ndc-flights/confirmation?pnr=${paymentData.pnr}&status=confirmed`
        );
      }, 2000);

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: goldThemeStyles }} />
        <div className="pay-wrapper" style={{ textAlign: 'center', paddingTop: '100px' }}>
          <div className="loading-spinner" />
          <p style={{ color: '#7a7469', marginTop: '20px' }}>Loading payment...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: goldThemeStyles }} />
      <div className="pay-wrapper">
        {/* Header */}
        <div className="pay-header">
          <div className="pay-logo">
            Tilal<span>Rimal</span>
          </div>
          <div className="pay-crumb">Step 4: Payment</div>
        </div>

        {/* Main Content */}
        <div className="pay-grid">
          {/* Payment Form */}
          <div className="pay-card">
            <h2 className="pay-title">Card Details</h2>

            {error && <div className="error-box">{error}</div>}
            {success && <div className="success-box">Payment successful! Redirecting...</div>}

            <form onSubmit={handlePayment}>
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  name="cardHolder"
                  value={formData.cardHolder}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  disabled={paying}
                />
              </div>

              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber.replace(/(.{4})/g, '$1 ').trim()}
                  onChange={handleInputChange}
                  placeholder="4111 1111 1111 1111"
                  disabled={paying}
                  maxLength="19"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Month</label>
                  <select
                    name="expiryMonth"
                    value={formData.expiryMonth}
                    onChange={handleInputChange}
                    disabled={paying}
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Expiry Year</label>
                  <select
                    name="expiryYear"
                    value={formData.expiryYear}
                    onChange={handleInputChange}
                    disabled={paying}
                  >
                    <option value="">YY</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={String(year).slice(-2)}>
                          {String(year).slice(-2)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  disabled={paying}
                  maxLength="4"
                />
              </div>

              <button 
                type="submit" 
                className="pay-btn" 
                disabled={paying || success}
              >
                {paying ? 'Processing...' : `Pay ${paymentData?.amount?.toLocaleString()} SAR`}
              </button>
            </form>

            <p style={{ fontSize: '11px', color: '#7a7469', marginTop: '20px', textAlign: 'center' }}>
              🔒 256-bit Secure Encryption
            </p>
          </div>

          {/* Summary Sidebar */}
          <div className="pay-summary">
            <h3 className="pay-title">Booking Summary</h3>

            <div className="summary-row">
              <span className="summary-label">Reference</span>
              <span className="summary-value">{paymentData?.pnr}</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Passenger</span>
              <span className="summary-value">{paymentData?.name}</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Email</span>
              <span className="summary-value" style={{ fontSize: '12px' }}>
                {paymentData?.email}
              </span>
            </div>

            <div className="summary-row total">
              <span>Total Amount</span>
              <span>{paymentData?.amount?.toLocaleString()} SAR</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}