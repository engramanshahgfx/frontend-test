import { redirect } from 'next/navigation';

// Hotel checkout moved to /{lang}/hotels/booking.
export default async function AkbarHotelBookingLegacyPage({ params }) {
  const { lang } = await params;
  redirect(`/${lang || 'en'}/hotels`);
}
