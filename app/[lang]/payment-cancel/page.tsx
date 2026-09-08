'use client';

import { useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { XCircle } from 'lucide-react';
import { API_URL } from '@/lib/api';

export default function PaymentCancel() {
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = params?.lang || 'en';
  const bookingId = searchParams?.get('booking_id');
  const isRTL = lang === 'ar';

  useEffect(() => {
    if (bookingId) {
      const cleanBase = API_URL.replace(/\/$/, '');
      fetch(`${cleanBase}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      }).catch((err) => console.error('Failed to cleanup unpaid booking:', err));
    }
  }, [bookingId]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold mt-4">
          {isRTL ? '❌ تم إلغاء عملية الدفع' : '❌ Payment Cancelled'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isRTL
            ? 'لم يتم إكمال عملية الدفع ولم يتم حفظ هذا الحجز. يمكنك المحاولة مرة أخرى.'
            : 'Your payment was not completed and the booking was not saved. You can try again.'}
        </p>
        <button
          onClick={() => (window.location.href = `/${lang}`)}
          className="mt-6 bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 font-semibold"
        >
          {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
        </button>
      </div>
    </div>
  );
}