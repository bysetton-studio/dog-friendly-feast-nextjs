'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import './home.css';

import LocationSearch from '@/components/LocationSearch';
import MapView from '@/components/MapView';

import LocationList from '@/components/LocationList';
import SubmitBanner from '@/components/SubmitBanner';

import { useLocations } from '@/hooks/useLocations';
import { useResolvedLocations } from '@/hooks/useResolvedLocations';
import { useGroupedLocations } from '@/hooks/useGroupedLocations';
import { useLocationSelection } from '@/hooks/useLocationSelection';
import { isApproved } from '@/lib/placeUtils';
import type { Location, Place } from '@/types';

const GEOGRAPHIC_TYPES = new Set([
  'locality', 'sublocality', 'sublocality_level_1', 'sublocality_level_2',
  'administrative_area_level_1', 'administrative_area_level_2',
  'country', 'route', 'neighborhood', 'postal_code', 'political',
]);

export default function HomePage() {
  const [selected, setSelected] = useState<Place | null>(null);
  const [servicesReady, setServicesReady] = useState(false);
  const { selectedCity, selectedSuburbs, onCitySelect, onSuburbSelect } = useLocationSelection();
  const [approvedOnly, setApprovedOnly] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const { locations, loading } = useLocations();
  const visibleLocations = useMemo(
    () => approvedOnly ? locations.filter((l) => isApproved(l.adminApproved)) : locations,
    [approvedOnly, locations]
  );
  const { resolved, loading: resolvedLoading } = useResolvedLocations(visibleLocations, servicesReady);
  const { grouped, expandedCities, expandedSuburbs, expandedPlaces, toggleCity, toggleSuburb } = useGroupedLocations(resolved, { onCitySelect, onSuburbSelect });

  const expandedCity = Object.entries(expandedCities).find(([, v]) => v)?.[0] ?? null;

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

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps || expandedPlaces.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    expandedPlaces.forEach((p) => bounds.extend(p.geometry!.location!));
    mapRef.current.fitBounds(bounds);
  }, [expandedPlaces]);

  const showSubmitBanner = selected && !loading && !isGeographic(selected) && !isInList(selected, locations);

  return (
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

        {showSubmitBanner && (
          <SubmitBanner
            place={selected}
            onDismiss={() => setSelected(null)}
            inList={isInList(selected, locations)}
          />
        )}

        <div className="map-row">
          {expandedCity && (
            <LocationList
              onSelect={handleSelect}
              grouped={grouped}
              expandedCities={expandedCities}
              expandedSuburbs={expandedSuburbs}
              toggleCity={toggleCity}
              toggleSuburb={toggleSuburb}
              loading={resolvedLoading}
              selectedTypes={selectedTypes}
              onlyCity={expandedCity}
            />
          )}
          <MapView
            selected={selected}
            mapRef={mapRef}
            onServicesReady={() => setServicesReady(true)}
            selectedSuburbs={selectedSuburbs}
            onSuburbDetected={(s) => onSuburbSelect(s ? new Set(s) : null)}
            selectedCity={selectedCity}
            resolved={resolved}
            resolvedLoading={resolvedLoading}
            locationsLoading={loading}
            approvedOnly={approvedOnly}
            onApprovedOnlyToggle={() => setApprovedOnly((v) => !v)}
            selectedTypes={selectedTypes}
          />
        </div>

        <Link href="/add" className="add-location-link">
          Don&apos;t see your spot? Add a restaurant →
        </Link>

        <LocationList
          onSelect={handleSelect}
          grouped={grouped}
          expandedCities={expandedCities}
          expandedSuburbs={expandedSuburbs}
          toggleCity={toggleCity}
          toggleSuburb={toggleSuburb}
          loading={resolvedLoading}
          selectedTypes={selectedTypes}
          excludeCity={expandedCity ?? undefined}
        />
    </main>
  );
}
