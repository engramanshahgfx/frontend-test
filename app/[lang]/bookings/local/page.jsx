'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../../../providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function LocalBookingSuccess({ params }) {
  const resolvedParams = React.use(params);
  const lang = resolvedParams?.lang || 'en';
  const isRTL = lang === 'ar';
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard with reservations tab
    if (!loading && isAuthenticated) {
      router.replace(`/${lang}/dashboard?tab=reservations`);
    }
  }, [isAuthenticated, loading, router, lang]);

  // For guest users (not authenticated), show confirmation message
  return (
    <div style={{ padding: 40, textAlign: isRTL ? 'right' : 'left', minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#dfa528', marginBottom: '20px' }}>
          {isRTL ? 'تم استلام طلب الحجز (أنشطة محلية)' : 'Local Activities Reservation Received'}
        </h1>
        <p style={{ fontSize: '1rem', color: '#666', marginTop: '20px' }}>
          {isRTL ? 'شكراً! سنقوم بمراجعة طلبك والتواصل معك خلال 24 ساعة لتأكيد تفاصيل الأنشطة.' : 'Thank you! Your reservation request has been submitted. We will review it and contact you within 24 hours to confirm the details of your local activities.'}
        </p>
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px', color: '#333' }}>
          <h3>{isRTL ? 'الخطوات التالية:' : 'What happens next:'}</h3>
          <ul style={{ marginTop: '15px', marginLeft: isRTL ? 0 : '20px', marginRight: isRTL ? '20px' : 0 }}>
            <li>{isRTL ? 'مراجعة طلبك من قبل فريقنا' : 'Our team will review your reservation request'}</li>
            <li>{isRTL ? 'التواصل معك لتأكيد التفاصيل والأسعار' : 'Confirmation of details and pricing will be sent to you'}</li>
            <li>{isRTL ? 'تأكيد وتحويل إلى حجز بعد تسديد الدفع' : 'After payment, your reservation will be converted to a confirmed booking'}</li>
          </ul>
        </div>

        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e8f4f8', borderRadius: '8px', borderLeft: '4px solid #0099cc' }}>
          <h4 style={{ color: '#0099cc', marginTop: 0 }}>
            {isRTL ? '📝 ملاحظة مهمة' : '📝 Important Note'}
          </h4>
          <p style={{ color: '#333', marginBottom: 0 }}>
            {isRTL
              ? 'إذا كان لديك حساب معنا، قم بتسجيل الدخول لتتمكن من متابعة طلب الحجز الخاص بك في لوحة التحكم.'
              : 'If you have an account with us, please login to track your reservation in your dashboard.'}
          </p>
        </div>

        <div style={{ marginTop: '30px' }}>
          <Link href={`/${lang}`} style={{ color: '#dfa528', textDecoration: 'none', fontWeight: 'bold', marginRight: '20px' }}>
            {isRTL ? 'العودة إلى الصفحة الرئيسية →' : '← Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}