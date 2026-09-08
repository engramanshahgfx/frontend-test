import AkbarFlights from '@/components/akbarflights/akbarflights';

export const metadata = {
  title: 'Book Flights | Tilal Rimal',
  description: 'Search and compare domestic & international flights in Saudi Arabia',
};

export default async function FlightsLandingPage({ params }) {
  const { lang } = await params;
  return <AkbarFlights initialParams={{ lang }} />;
}
