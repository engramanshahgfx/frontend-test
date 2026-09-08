'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

const AIRLINE_TRANSLATIONS = {
  'Saudi Arabian Airlines': 'الخطوط السعودية',
  'Saudia': 'الخطوط السعودية',
  'Flyadeal': 'طيران أديل',
  'flyadeal': 'طيران أديل',
  'Flynas': 'طيران ناس',
  'flynas': 'طيران ناس',
  'Emirates': 'طيران الإمارات',
  'Qatar Airways': 'الخطوط القطرية',
  'Etihad Airways': 'الاتحاد للطيران',
  'EgyptAir': 'مصر للطيران',
  'Gulf Air': 'طيران الخليج',
  'Air Arabia': 'العربية للطيران',
  'Flydubai': 'فلاي دبي'
};

export default function Sidebar({ flight, step, passengerName, addInsurance, extras = [], passengerCount = 1 }) {
  const { t, language } = useTranslation();
  const lang = language;
  const [showFlightDetailsModal, setShowFlightDetailsModal] = useState(false);
  const [showCancelDetailsModal, setShowCancelDetailsModal] = useState(false);

  if (!flight) return null;

  const calculateProgressiveServiceFee = (subtotal) => {
    const amount = Number(subtotal) || 0;
    if (amount <= 1000) {
      return Math.round(amount * 0.10 * 100) / 100;
    }
    const firstTier = 1000 * 0.10; // 100 SAR
    const remaining = amount - 1000;
    const secondTier = remaining * 0.05;
    return Math.round((firstTier + secondTier) * 100) / 100;
  };
 
  const perPaxPrice = flight?.price || flight?.baseFare || 380;
  const baseFare = perPaxPrice * (passengerCount || 1);
  const serviceFee = typeof flight?.serviceFee === 'number'
    ? flight.serviceFee * (passengerCount || 1)
    : calculateProgressiveServiceFee(baseFare);
  const insurancePrice = (flight?.insurancePrice || 32) * (passengerCount || 1);

  const extrasTotal = extras.reduce((sum, extra) => sum + (extra.price || 0), 0) * (passengerCount || 1);
  const flightTotal = baseFare;
  const addonsTotal = (addInsurance ? insurancePrice : 0) + extrasTotal;
  const grandTotal = flightTotal + serviceFee + addonsTotal;

  const leg = flight.legs?.[0] || {
    from: flight.origin || 'PEW',
    to: flight.destination || 'RUH',
    airline: flight.airline || 'Flyadeal',
    flightNo: flight.flightNo || 'F3-658',
    date: flight.departureDate || 'Wed, 02 Sep 2026',
    dep: flight.depTime || '06:35 AM',
    arr: flight.arrTime || '09:25 AM',
    duration: flight.duration || '04h 50m',
    isDirect: true
  };

  const displayAirline = (lang === 'ar' && AIRLINE_TRANSLATIONS[leg.airline]) ? AIRLINE_TRANSLATIONS[leg.airline] : leg.airline;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 140 }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{t('flightBooking.sidebar.flightSummary')}</span>
          <button 
            onClick={() => setShowFlightDetailsModal(!showFlightDetailsModal)}
            style={{ border: 'none', background: 'transparent', fontSize: '0.78rem', color: '#00875a', fontWeight: 600, cursor: 'pointer' }}
          >
            {t('flightBooking.sidebar.details')}
          </button>
        </div>

        <div style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, marginBottom: 2 }}>{t('flightBooking.sidebar.departure')}</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>{leg.date}</div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#701a75', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>
                {leg.airline?.[0] || 'F'}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                {displayAirline} · {leg.flightNo}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#00875a', background: '#f0fdf4', padding: '2px 8px', borderRadius: 4 }}>
              {leg.isDirect ? t('flightBooking.sidebar.direct') : t('flightBooking.sidebar.oneStop')}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{leg.dep}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{leg.from}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: 2 }}>{leg.duration}</div>
              <div style={{ width: 40, height: 1, background: '#cbd5e1', position: 'relative' }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#00875a', position: 'absolute', right: 0, top: -1.5 }} />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{leg.arr}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{leg.to}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 18px', background: '#fafafa', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500 }}>{t('flightBooking.sidebar.cancelAndDateChange')}</span>
          <button 
            onClick={() => setShowCancelDetailsModal(!showCancelDetailsModal)}
            style={{ border: 'none', background: 'transparent', fontSize: '0.75rem', color: '#00875a', fontWeight: 600, cursor: 'pointer' }}
          >
            {t('flightBooking.sidebar.rules')}
          </button>
        </div>
      </div>

      {/* ── 2. Price Breakdown Card ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>{t('flightBooking.sidebar.priceBreakdown')}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem', color: '#475569' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('flightBooking.sidebar.flightsPax', { count: passengerCount })}</span>
            <span style={{ fontWeight: 600, color: '#1e293b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {flightTotal.toFixed(2)}
              <img src="/saudi_riyal.png" alt="SAR" style={{ height: 14, width: 'auto', display: 'inline-block' }} />
            </span>
          </div>

          {serviceFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t('flightBooking.sidebar.serviceFee')}</span>
              <span style={{ fontWeight: 600, color: '#1e293b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {serviceFee.toFixed(2)}
                <img src="/saudi_riyal.png" alt="SAR" style={{ height: 14, width: 'auto', display: 'inline-block' }} />
              </span>
            </div>
          )}

          {addInsurance && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem' }}>{t('flightBooking.extrasStep.travelInsurance')}</span>
              <span style={{ fontWeight: 600, color: '#1e293b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {insurancePrice.toFixed(2)}
                <img src="/saudi_riyal.png" alt="SAR" style={{ height: 14, width: 'auto', display: 'inline-block' }} />
              </span>
            </div>
          )}

          {extras.map((extra, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem' }}>{extra.name}</span>
              <span style={{ fontWeight: 600, color: '#1e293b', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {(extra.price || 0).toFixed(2)}
                <img src="/saudi_riyal.png" alt="SAR" style={{ height: 14, width: 'auto', display: 'inline-block' }} />
              </span>
            </div>
          ))}

          <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{t('flightBooking.sidebar.totalInclVat')}</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#00875a', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {grandTotal.toFixed(2)}
              <img src="/saudi_riyal.png" alt="SAR" style={{ height: 16, width: 'auto', display: 'inline-block' }} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
