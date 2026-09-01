'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import './home.css';

import LocationSearch from '@/components/LocationSearch';

// TODO: import components
// import MapView from '@/components/MapView';
// import LocationList from '@/components/LocationList';
// import SubmitBanner from '@/components/SubmitBanner';

import { backgroundArt } from '@/data/backgroundArt';
import { useLocations } from '@/hooks/useLocations';
import type { Location, Place } from '@/types';

const POSITIONS: React.CSSProperties[] = [
  { top: '2%',    left: '1%'  },
  { top: '2%',    right: '1%' },
  { top: '50%',   left: '1%'  },
  { top: '50%',   right: '1%' },
  { bottom: '2%', left: '1%'  },
  { bottom: '2%', right: '1%' },
];

const GEOGRAPHIC_TYPES = new Set([
  'locality', 'sublocality', 'sublocality_level_1', 'sublocality_level_2',
  'administrative_area_level_1', 'administrative_area_level_2',
  'country', 'route', 'neighborhood', 'postal_code', 'political',
]);

export default function HomePage() {
  const [selected, setSelected] = useState<Place | null>(null);
  const [servicesReady, setServicesReady] = useState(false);
  const [selectedSuburbs, setSelectedSuburbs] = useState<string[] | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [approvedOnly, setApprovedOnly] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const { locations, loading } = useLocations();

  function isGeographic(place: Place): boolean {
    return place?.types?.every((t) => GEOGRAPHIC_TYPES.has(t)) ?? true;
  }

  function isInList(place: Place, locs: Location[]): boolean {
    if (!place?.formatted_address) return false;
    const address = place.formatted_address.toLowerCase();
    return locs.some((l) => l.address.toLowerCase() === address);
  }

  function handleSelect(place: Place): void {
    setSelected(place);
  }

  function handleExpandedPlacesChange(places: google.maps.places.PlaceResult[]): void {
    if (!mapRef.current || !window.google?.maps || places.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    places.forEach((p) => bounds.extend(p.geometry!.location!));
    mapRef.current.fitBounds(bounds);
  }

  const visibleLocations: Location[] = approvedOnly
    ? locations.filter((l) => l.adminApproved !== false && l.adminApproved !== 'FALSE' && l.adminApproved !== 'false')
    : locations;

  const showSubmitBanner = selected && !loading && !isGeographic(selected) && !isInList(selected, locations);

  return (
    <>
      {POSITIONS.map((pos, i) => (
        <pre key={i} className="bg-art" style={pos} aria-hidden="true">
          {backgroundArt[i % backgroundArt.length]}
        </pre>
      ))}
      <main className="home">
        <Link href="/about" className="about-link">About</Link>
        <div className="logo-area">
          <h1 className="logo">Dog Friendly Feast</h1>
          <p className="tagline">Find dog-friendly restaurants near you</p>
        </div>

        <LocationSearch
          onSelect={handleSelect}
          mapRef={mapRef}
          onToggleFilters={() => setFiltersOpen((v) => !v)}
          filtersOpen={filtersOpen}
          filtersActive={selectedTypes.size > 0}
          selectedTypes={selectedTypes}
          onTypesChange={setSelectedTypes}
        />

        {/* TODO: {showSubmitBanner && (
          <SubmitBanner
            place={selected}
            onDismiss={() => setSelected(null)}
            inList={isInList(selected, locations)}
          />
        )} */}

        {/* TODO: <MapView
          selected={selected}
          mapRef={mapRef}
          onServicesReady={() => setServicesReady(true)}
          selectedSuburbs={selectedSuburbs}
          onSuburbDetected={setSelectedSuburbs}
          selectedCity={selectedCity}
          locations={visibleLocations}
          locationsLoading={loading}
          approvedOnly={approvedOnly}
          onApprovedOnlyToggle={() => setApprovedOnly((v) => !v)}
          selectedTypes={selectedTypes}
        /> */}

        <Link href="/add" className="add-location-link">
          Don&apos;t see your spot? Add a restaurant →
        </Link>

        {/* TODO: <LocationList
          onSelect={handleSelect}
          servicesReady={servicesReady}
          selectedSuburb={selectedSuburbs}
          onSuburbSelect={(suburbs) => setSelectedSuburbs(suburbs ?? null)}
          onCitySelect={setSelectedCity}
          onExpandedPlacesChange={handleExpandedPlacesChange}
          locations={visibleLocations}
          loading={loading}
          selectedTypes={selectedTypes}
        /> */}
      </main>
    </>
  );
}
