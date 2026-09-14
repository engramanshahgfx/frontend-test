import React from 'react';
import AkbarHotelBookingSystem from '@/components/akbarhotel/AkbarHotelBookingSystem';

export const metadata = {
  title: 'Hotels & Resorts Engine — Tilal Rimal Tourism',
  description: 'Search and book luxury hotels, resorts, and executive suites across Saudi Arabia and worldwide with instant confirmation and live rates.',
};

export default function AkbarHotelAliasPage({ params }) {
  const lang = params?.lang || 'en';

  return (
    <main className="min-h-screen bg-slate-50">
      <AkbarHotelBookingSystem lang={lang} />
    </main>
  );
}
