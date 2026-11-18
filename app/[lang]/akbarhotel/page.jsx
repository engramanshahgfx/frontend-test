import { redirect } from 'next/navigation';

// The hotel search moved to /{lang}/hotels.
export default async function AkbarHotelLegacyPage({ params }) {
  const { lang } = await params;
  redirect(`/${lang || 'en'}/hotels`);
}
