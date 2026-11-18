import { Suspense } from 'react';
import HotelSearchPage from '@/components/hotels/HotelSearchPage';

export const metadata = {
  title: 'Book Hotels | Tilal Rimal',
  description: 'Live hotel rates in Makkah, Madinah, Riyadh and worldwide, with clear cancellation terms and instant confirmation.',
};

export default async function HotelsPage({ params }) {
  const { lang } = await params;
  return (
    <Suspense fallback={null}>
      <HotelSearchPage lang={lang} />
    </Suspense>
  );
}
