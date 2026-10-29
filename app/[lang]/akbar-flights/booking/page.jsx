'use client';

import { useParams } from 'next/navigation';
import CheckoutPage from '@/components/flight-checkout/CheckoutPage';

export default function BookingPage() {
  const { lang } = useParams();
  return <CheckoutPage lang={lang} />;
}
