'use client';

import { TYPE_FILTERS } from '@/components/TypeFilter';
import './LocationList.css';
import type { Place, ResolvedLocation } from '@/types';

type Grouped = Record<string, Record<string, ResolvedLocation[]>>;

interface Props {
  onSelect: (place: Place) => void;
  onSuburbSelect: (suburbs: Set<string> | null) => void;
  onCitySelect: (city: string | null) => void;
  grouped: Grouped;
  expandedCities: Record<string, boolean>;
  expandedSuburbs: Record<string, boolean>;
  toggleCity: (city: string) => void;
  toggleSuburb: (suburb: string) => void;
  loading: boolean;
  selectedTypes: Set<string>;
}

function matchesTypeFilter(place: google.maps.places.PlaceResult | null, selectedTypes: Set<string>): boolean {
  if (selectedTypes.size === 0) return true;
  if (!place?.types) return true;
  return TYPE_FILTERS.some(
    (f) => selectedTypes.has(f.key) && f.types.some((t) => place.types!.includes(t))
  );
}

export default function LocationList({ onSelect, onSuburbSelect, onCitySelect, grouped, expandedCities, expandedSuburbs, toggleCity, toggleSuburb, loading, selectedTypes = new Set() }: Props) {
  function handleSuburbClick(suburb: string): void {
    toggleSuburb(suburb);
    const newExpanded = { ...expandedSuburbs, [suburb]: !expandedSuburbs[suburb] };
    const openSet = new Set(Object.entries(newExpanded).filter(([, v]) => v).map(([k]) => k));
    onSuburbSelect?.(openSet.size > 0 ? openSet : null);
  }

  const sortedCities = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

  if (loading) return <p style={{ color: '#9aa0a6', fontSize: 14 }}>Loading locations...</p>;
  if (sortedCities.length === 0) return null;

  return (
    <div className="location-list">
      {/* TODO: city/suburb/place tree */}
    </div>
  );
}
