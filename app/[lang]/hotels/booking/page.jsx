import { Suspense } from 'react';
import HotelCheckoutPage from '@/components/hotels/HotelCheckoutPage';

export const metadata = {
  title: 'Hotel Checkout | Tilal Rimal',
  description: 'Complete your hotel booking securely.',
  robots: { index: false },
};

export default async function HotelBookingPage({ params }) {
  const { lang } = await params;
  return (
    <Suspense fallback={null}>
      <HotelCheckoutPage lang={lang} />
    </Suspense>
  );
}
