'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Map as LeafletMap } from 'leaflet';
import { authClient } from '@/lib/auth-client';
import BackgroundArt from '@/components/BackgroundArt';
import KennelDropdown from '@/components/KennelDropdown';

import LocationSearch from '@/components/LocationSearch';
import LocationList from '@/components/LocationList';
import SubmitBanner from '@/components/SubmitBanner';
import AddSticker from '@/components/AddSticker';
import SupportSticker from '@/components/SupportSticker';

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
  const { data: session } = authClient.useSession();
  const [selected, setSelected] = useState<Place | null>(null);
  const [cityFlipRect, setCityFlipRect] = useState<DOMRect | null>(null);
  const ipCity = useIpCity();
  const hasAutoExpanded = useRef(false);
  const { selectedCity, selectedSuburbs, onCitySelect, onSuburbSelect } = useLocationSelection();
  const [approvedOnly, setApprovedOnly] = useState(false);
  const [boneOpen, setBoneOpen] = useState(false);
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
    if(!place.result_type)return false;
    return GEOGRAPHIC_RESULT_TYPES.has(place.result_type)
  }

  function isInList(place: Place, locs: ResolvedLocation[]): boolean {
    if (!place?.formatted_address) return false;
    const address = (place.formatted_address as string).toLowerCase();
    return locs.some((l) => l.address.toLowerCase() === address);
  }

  const showSubmitBanner = selected && !resolvedLoading && !isGeographic(selected) && !isInList(selected, allResolved);

  return (
    <main className="flex-1 flex flex-col items-center justify-start gap-8 pt-15 px-5 pb-10">
        <BackgroundArt />
        <nav className="top-nav top-nav--left">
          <Link href="/about" className="top-nav__link">About</Link>
          <div style={{ position: 'relative' }}>
            <button className="top-nav__btn" onClick={() => setBoneOpen((v) => !v)}>🦴</button>
            <SupportSticker open={boneOpen} onClose={() => setBoneOpen(false)} />
          </div>
        </nav>
        <nav className="top-nav">
          {session
            ? <KennelDropdown />
            : <Link href="/auth" className="top-nav__link">Sign up / Log in</Link>
          }
        </nav>
        <div className="relative w-full max-w-6xl flex flex-col items-center gap-8">
          <AddSticker />
          <div className="text-center">
            <h1 className="text-[98px] font-bold text-[#e0e0e0] mb-2 font-['Comic_Neue','Comic_Sans_MS','Comic_Sans',cursive]">Dog World</h1>
            <p className="text-base text-[#e0e0e0]font-[Arial,sans-serif]">Find dog-friendly restaurants near you</p>
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

          <div className="flex flex-row items-start gap-4 w-full max-w-6xl max-sm:flex-col max-sm:items-stretch">
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
              onMapClick={setSelected}
            />
          </div>

          {capReached && (
            <div className="fixed inset-0 bg-black/75 z-200 flex items-center justify-center h-[min(100vh,1050px)]">
              <img src="/run_out_of_money.svg" className="absolute w-[min(120vh,1050px)] h-[min(120vh,1050px)] animate-cap-spin" aria-hidden="true" />
              <div className="relative flex flex-col items-center justify-center p-[15%] box-border">
                <span className="max-w-120">
                  <p className="text-center text-[34px] text-white leading-normal font-[Arial,sans-serif] m-0"><b>Daily map limit reached ! ! ! :(</b> <br/>Consider supporting us to keep the lights on.</p>
                </span>
                <span className="inline-flex flex-col items-center gap-2 mt-4.5">
                  <span className="text-[1em] font-normal text-white/70 tracking-[0.5px]">contact us to support</span>
                  <button
                    className="inline-block bg-white/20 text-white border-2 border-white/60 rounded-full py-2.5 px-6 text-[1em] font-semibold font-[Arial,sans-serif] cursor-pointer transition-[background,border-color] duration-150 hover:bg-white/30 hover:border-white"
                    onClick={() => {
                      navigator.clipboard.writeText('bysetton+dogworldweb@gmail.com');
                      setEmailCopied(true);
                      setTimeout(() => setEmailCopied(false), 2000);
                    }}
                  >
                    {emailCopied ? 'Copied!' : 'bysetton+dogworldweb@gmail.com'}
                  </button>
                  <Link href="/about" className="text-[0.75em] text-white/70 no-underline tracking-[0.3px] mt-4.5 hover:text-white hover:underline">Find out what we do →</Link>
                </span>
              </div>
            </div>
          )}

          <Link href="/add" className="text-[13px] text-[#9aa0a6] underline font-[Arial,sans-serif] -mt-3 hover:text-[#e0e0e0]">
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
