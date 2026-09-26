'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../../../providers/AuthProvider';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function InternationalBookingSuccess({ params }) {
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
  <div style={{ padding: 40, paddingTop: 90, textAlign: isRTL ? 'right' : 'left', minHeight: '100vh', backgroundColor: '#0d0d0d', color: '#e6e6e6' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        <h1 style={{ color: '#dfa528', marginBottom: '20px', textAlign: isRTL ? 'right' : 'center' }}>
          {lang === 'ar' ? 'تم استلام طلب الحجز الدولي' : lang === 'zh' ? '已收到国际预订申请' : 'International Booking Reservation Received'}
        </h1>
        <p style={{ fontSize: '1rem', color: '#cfcfcf', marginTop: '20px', textAlign: isRTL ? 'right' : 'center' }}>
          {lang === 'ar' ? 'شكراً! تم استلام طلب الحجز الخاص بك. سيقوم فريقنا بمراجعته والتواصل معك خلال 24 ساعة.' : 
           lang === 'zh' ? '感谢您！您的预订申请已提交。我们的团队将进行审核，并在24小时内与您联系。' : 
           'Thank you! Your reservation request has been submitted. Our team will review it and contact you within 24 hours.'}
        </p>
        <div style={{ marginTop: '30px', padding: '24px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', color: '#e6e6e6' }}>
          <h3 style={{ marginTop: 0, color: '#f1f1f1' }}>
            {lang === 'ar' ? 'الخطوات التالية:' : lang === 'zh' ? '后续步骤：' : 'What happens next:'}
          </h3>
          <ul style={{ marginTop: '15px', marginLeft: isRTL ? 0 : '20px', marginRight: isRTL ? '20px' : 0, color: '#d6d6d6' }}>
            <li>
              {lang === 'ar' ? 'مراجعة طلب الحجز من قبل فريقنا' : 
               lang === 'zh' ? '我们的团队将审核您的预订请求' : 
               'Our team will review your reservation request'}
            </li>
            <li>
              {lang === 'ar' ? 'إرسال تأكيد التفاصيل والأسعار النهائية' : 
               lang === 'zh' ? '发送最终确认和价格详情' : 
               'Final confirmation with pricing details will be sent'}
            </li>
            <li>
              {lang === 'ar' ? 'بعد الدفع، سيتم تحويل الحجز إلى حجز نهائي' : 
               lang === 'zh' ? '确认付款后，您的预订将转为确认状态' : 
               'After payment is confirmed, your reservation becomes a confirmed booking'}
            </li>
          </ul>
        </div>
        
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '4px solid rgba(0,153,204,0.9)', color: '#e6e6e6' }}>
          <h4 style={{ color: '#7fd3ea', marginTop: 0 }}>
            {lang === 'ar' ? '📝 ملاحظة مهمة' : lang === 'zh' ? '📝 重要提示' : '📝 Important Note'}
          </h4>
          <p style={{ color: '#d6d6d6', marginBottom: 0 }}>
            {lang === 'ar' 
              ? 'إذا كان لديك حساب معنا، قم بتسجيل الدخول لتتمكن من متابعة طلب الحجز الخاص بك في لوحة التحكم.' 
              : lang === 'zh'
              ? '如果您有我们的账户，请登录后在个人中心查看您的预订状态。'
              : 'If you have an account with us, please login to track your reservation in your dashboard.'}
          </p>
        </div>

        <div style={{ marginTop: '30px', textAlign: isRTL ? 'right' : 'left' }}>
          <Link href={`/${lang}`} style={{ color: '#dfa528', textDecoration: 'none', fontWeight: 'bold', marginRight: '20px' }}>
            {lang === 'ar' ? '← العودة إلى الصفحة الرئيسية' : 
             lang === 'zh' ? '← 返回首页' : 
             '← Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}