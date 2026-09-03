'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Map as LeafletMap } from 'leaflet';
import './home.css';

import LocationSearch from '@/components/LocationSearch';
import LocationList from '@/components/LocationList';
import SubmitBanner from '@/components/SubmitBanner';
import AddSticker from '@/components/AddSticker';

import { useResolvedLocations } from '@/hooks/useResolvedLocations';
import { useGroupedLocations } from '@/hooks/useGroupedLocations';
import { useLocationSelection } from '@/hooks/useLocationSelection';
import { useIpCity } from '@/hooks/useIpCity';
import type { Place, ResolvedLocation } from '@/types';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

// Geoapify result_type values for areas/regions — not specific places
const GEOGRAPHIC_RESULT_TYPES = new Set([
  'country', 'state', 'county', 'city', 'postcode', 'street', 'district', 'suburb',
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
  const [emailCopied, setEmailCopied] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);
  const { resolved: allResolved, loading: resolvedLoading, capReached } = useResolvedLocations();
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
    return GEOGRAPHIC_RESULT_TYPES.has((place as Record<string, unknown>).result_type as string)
      || !place?.types?.length;
  }

  function isInList(place: Place, locs: ResolvedLocation[]): boolean {
    if (!place?.formatted_address) return false;
    const address = (place.formatted_address as string).toLowerCase();
    return locs.some((l) => l.address.toLowerCase() === address);
  }

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
            capReached={capReached}
            expandedPlaces={expandedPlaces}
          />
        </div>

        {capReached && (
          <div className="page-cap-backdrop">
            <img src="/run_out_of_money.svg" className="page-cap-svg" aria-hidden="true" />
            <div className="page-cap-content">
              <span className="cap-main-text">
                <p><b>Daily map limit reached ! ! ! :(</b> <br/>Consider supporting us to keep the lights on.</p>
              </span>
              <span className="cap-contact-group">
                <span className="cap-contact-label">contact us to support</span>
                <button
                  className="cap-copy-email"
                  onClick={() => {
                    navigator.clipboard.writeText('bysetton+dogfriendlyfeast@gmail.com');
                    setEmailCopied(true);
                    setTimeout(() => setEmailCopied(false), 2000);
                  }}
                >
                  {emailCopied ? 'Copied!' : 'bysetton+dogfriendlyfeast@gmail.com'}
                </button>
                <Link href="/about" className="cap-about-link">Find out what we do →</Link>
              </span>
            </div>
          </div>
        )}

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
