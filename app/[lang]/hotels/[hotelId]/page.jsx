import { Suspense } from 'react';
import HotelDetailsPage from '@/components/hotels/HotelDetailsPage';

export const metadata = {
  title: 'Hotel Details | Tilal Rimal',
  description: 'Photos, amenities, policies and live room rates.',
};

export default async function HotelPage({ params }) {
  const { lang, hotelId } = await params;
  return (
    <Suspense fallback={null}>
      <HotelDetailsPage lang={lang} hotelId={decodeURIComponent(hotelId)} />
    </Suspense>
  );
}
