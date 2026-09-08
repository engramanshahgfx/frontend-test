'use client';

import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

export default function StepBar({ currentStep = 1, onStepChange }) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const lang = language || 'en';

  const steps = [
    { n: 1, label: lang === 'ar' ? 'اختر رحلتك' : 'Choose your flight', path: '' },
    { n: 2, label: lang === 'ar' ? 'أدخل بياناتك' : 'Enter your details', path: '/passengers' },
    { n: 3, label: lang === 'ar' ? 'تفاصيل الدفع' : 'Payment Details', path: '/checkout' },
  ];

  const handleStepClick = (s) => {
    if (onStepChange) {
      onStepChange(s.n);
    } else if (s.n < currentStep) {
      router.push(`/${lang}/akbar-flights${s.path}`);
    }
  };

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        {steps.map((s, i) => {
          const isDone = s.n < currentStep;
          const isActive = s.n === currentStep;
          const isClickable = s.n <= currentStep;
          
          return (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: isClickable ? 'pointer' : 'default' }} 
                onClick={() => handleStepClick(s)}
              >
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  background: isDone ? '#00875a' : isActive ? '#00875a' : '#cbd5e1',
                  color: '#fff',
                  transition: 'all .2s'
                }}>
                  {isDone ? '✓' : s.n}
                </div>
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : isDone ? 600 : 500,
                  color: isActive ? '#0f172a' : isDone ? '#00875a' : '#64748b',
                  whiteSpace: 'nowrap'
                }}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 24, height: 1, background: '#cbd5e1', margin: '0 8px' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
