import AkbarFlights from '@/components/akbarflights/akbarflights';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const routeStr = slug?.[0] || 'Flights';
  return {
    title: `Flights ${routeStr} | Tilal Rimal`,
    description: `Compare and book flights for ${routeStr} at the best rates with Tilal Rimal`,
  };
}

export default async function DynamicFlightSearchPage({ params }) {
  const { lang, slug } = await params;
  const routeParts = (slug?.[0] || '').split('-');
  const initialOrigin = routeParts[0] || 'JED';
  const initialDestination = routeParts[1] || 'RUH';
  const initialDepartDate = slug?.[1] || '';
  const initialReturnDate = slug?.[2] && slug[2].match(/^\d{4}-\d{2}-\d{2}$/) ? slug[2] : '';
  const initialCabin = slug?.find(s => ['Economy', 'Business', 'First'].includes(s)) || 'Economy';
  const paxMatch = slug?.find(s => s.match(/\d+Adult/i));
  const initialAdults = paxMatch ? parseInt(paxMatch) || 1 : 1;

  const initialParams = {
    lang,
    origin: initialOrigin,
    destination: initialDestination,
    departDate: initialDepartDate,
    returnDate: initialReturnDate,
    cabinClass: initialCabin,
    adults: initialAdults,
  };

  return <AkbarFlights initialParams={initialParams} />;
}
