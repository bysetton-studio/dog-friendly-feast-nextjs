'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import './home.css';

import LocationSearch from '@/components/LocationSearch';
import MapView from '@/components/MapView';

import LocationList from '@/components/LocationList';
import SubmitBanner from '@/components/SubmitBanner';
import AddSticker from '@/components/AddSticker';

import { useResolvedLocations } from '@/hooks/useResolvedLocations';
import { useGroupedLocations } from '@/hooks/useGroupedLocations';
import { useLocationSelection } from '@/hooks/useLocationSelection';
import { useIpCity } from '@/hooks/useIpCity';
import type { Place, ResolvedLocation } from '@/types';

const GEOGRAPHIC_TYPES = new Set([
  'locality', 'sublocality', 'sublocality_level_1', 'sublocality_level_2',
  'administrative_area_level_1', 'administrative_area_level_2',
  'country', 'route', 'neighborhood', 'postal_code', 'political',
]);

export default function HomePage() {
  const [selected, setSelected] = useState<Place | null>(null);
  const [cityFlipRect, setCityFlipRect] = useState<DOMRect | null>(null);
  const ipCity = useIpCity();
  const hasAutoExpanded = useRef(false);
  const { selectedCity, selectedSuburbs, onCitySelect, onSuburbSelect } = useLocationSelection();
  const [approvedOnly, setApprovedOnly] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const { resolved: allResolved, loading: resolvedLoading } = useResolvedLocations();
  const resolved = useMemo(
    () => approvedOnly ? allResolved.filter((r) => r.isApproved) : allResolved,
    [approvedOnly, allResolved]
  );
  const { grouped, expandedCities, expandedSuburbs, expandedPlaces, toggleCity, toggleSuburb } = useGroupedLocations(resolved, { onCitySelect, onSuburbSelect });

  const expandedCity = Object.entries(expandedCities).find(([, v]) => v)?.[0] ?? null;

  useEffect(() => {
    if (hasAutoExpanded.current) return;
    if (!ipCity || Object.keys(grouped).length === 0) return;
    const match = Object.keys(grouped).find(
      (c) => c.toLowerCase().includes(ipCity.toLowerCase()) || ipCity.toLowerCase().includes(c.toLowerCase())
    );
    if (match) {
      hasAutoExpanded.current = true;
      toggleCity(match);
    }
  }, [ipCity, grouped]);

  function isGeographic(place: Place): boolean {
    return place?.types?.every((t) => GEOGRAPHIC_TYPES.has(t)) ?? true;
  }

  function isInList(place: Place, locs: ResolvedLocation[]): boolean {
    if (!place?.formatted_address) return false;
    const address = place.formatted_address.toLowerCase();
    return locs.some((l) => l.address.toLowerCase() === address);
  }

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps || expandedPlaces.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    expandedPlaces.forEach((p) => bounds.extend(p.geometry!.location!));
    mapRef.current.fitBounds(bounds);
  }, [expandedPlaces]);

  const showSubmitBanner = selected && !resolvedLoading && !isGeographic(selected) && !isInList(selected, allResolved);

  return (
    <main className="home">
        <Link href="/about" className="about-link">About</Link>
        <div className="page-container">
        <AddSticker />
        <div className="logo-area">
          <h1 className="logo">Dog Friendly Feast</h1>
          <p className="tagline">Find dog-friendly restaurants near you</p>
        </div>

        <LocationSearch
          onSelect={setSelected}
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
            inList={isInList(selected, allResolved)}
          />
        )}

        <div className="map-row">
          {expandedCity && (
            <LocationList
              onSelect={setSelected}
              grouped={grouped}
              expandedCities={expandedCities}
              expandedSuburbs={expandedSuburbs}
              toggleCity={toggleCity}
              toggleSuburb={toggleSuburb}
              loading={resolvedLoading}
              selectedTypes={selectedTypes}
              onlyCity={expandedCity}
              flipFromRect={cityFlipRect}
            />
          )}
          <MapView
            selected={selected}
            mapRef={mapRef}
            selectedSuburbs={selectedSuburbs}
            selectedCity={selectedCity}
            resolved={resolved}
            resolvedLoading={resolvedLoading}
            locationsLoading={resolvedLoading}
            approvedOnly={approvedOnly}
            onApprovedOnlyToggle={() => setApprovedOnly((v) => !v)}
            selectedTypes={selectedTypes}
          />
        </div>

        <Link href="/add" className="add-location-link">
          Don&apos;t see your spot? Add a restaurant →
        </Link>

        <LocationList
          onSelect={setSelected}
          grouped={grouped}
          expandedCities={expandedCities}
          expandedSuburbs={expandedSuburbs}
          toggleCity={toggleCity}
          toggleSuburb={toggleSuburb}
          loading={resolvedLoading}
          selectedTypes={selectedTypes}
          excludeCity={expandedCity ?? undefined}
          onCityClickCapture={(_, rect) => setCityFlipRect(rect)}
        />
        </div>
    </main>
  );
}
