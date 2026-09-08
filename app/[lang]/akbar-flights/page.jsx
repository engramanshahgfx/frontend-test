import AkbarFlights from '@/components/akbarflights/akbarflights';

export const metadata = {
  title: 'Book Flights - Akbar Travels & Tilal Rimal',
  description: 'Search and compare domestic & international flights in Saudi Arabia via Akbar Travels B2B',
};

export default async function AkbarFlightsPage({ params }) {
  const { lang } = await params;
  return <AkbarFlights initialParams={{ lang }} />;
}
