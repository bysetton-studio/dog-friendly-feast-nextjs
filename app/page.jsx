'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

// TODO: import components
// import LocationSearch from '@/components/LocationSearch';
// import MapView from '@/components/MapView';
// import LocationList from '@/components/LocationList';
// import SubmitBanner from '@/components/SubmitBanner';

// TODO: import hooks and data
// import { useLocations } from '@/hooks/useLocations';
// import { backgroundArt } from '@/data/backgroundArt';

export default function HomePage() {
  const [selected, setSelected] = useState(null);
  const [servicesReady, setServicesReady] = useState(false);
  const [selectedSuburbs, setSelectedSuburbs] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [approvedOnly, setApprovedOnly] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const mapRef = useRef(null);

  // TODO: const { locations, loading } = useLocations();
  const locations = [];
  const loading = false;

  function handleSelect(place) {
    // TODO
  }

  function isGeographic(place) {
    // TODO
  }

  function isInList(place, locs) {
    // TODO
  }

  const visibleLocations = [];   // TODO: filter by approvedOnly
  const showSubmitBanner = false; // TODO: derive from selected + loading + helpers

  return (
    <>
      {/* TODO: background art */}
      <main className="home">
        <Link href="/about" className="about-link">About</Link>
        <div className="logo-area">
          <h1 className="logo">Dog Friendly Feast</h1>
          <p className="tagline">Find dog-friendly restaurants near you</p>
        </div>

        {/* TODO: <LocationSearch /> */}
        {/* TODO: {showSubmitBanner && <SubmitBanner />} */}
        {/* TODO: <MapView /> */}

        <Link href="/add" className="add-location-link">
          Don&apos;t see your spot? Add a restaurant →
        </Link>

        {/* TODO: <LocationList /> */}
      </main>
    </>
  );
}
