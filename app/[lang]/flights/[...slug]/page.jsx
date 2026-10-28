import FlightSearchPage from '@/components/flights/FlightSearchPage';
import { parseSearchSlug, airportInfo } from '@/lib/flights/offerModel';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { origin, destination } = parseSearchSlug(slug);
  const route = `${airportInfo(origin).city || origin} to ${airportInfo(destination).city || destination}`;
  return {
    title: `Flights ${route} | Tilal Rimal`,
    description: `Compare and book flights from ${route} at the best live fares with Tilal Rimal`,
  };
}

export default async function DynamicFlightSearchPage({ params }) {
  const { lang, slug } = await params;
  const search = parseSearchSlug(slug);

  // Keyed by the URL so every new search starts from a clean page.
  return <FlightSearchPage key={(slug || []).join('/')} initialParams={{ lang, ...search }} />;
}
