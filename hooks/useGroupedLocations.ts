import { useEffect, useMemo, useState } from 'react';
import type { Place, ResolvedLocation } from '@/types';

type Grouped = Record<string, Record<string, ResolvedLocation[]>>;

interface Options {
  onCitySelect?: (city: string | null) => void;
  onSuburbSelect?: (suburbs: Set<string> | null) => void;
}

export interface GroupedLocationsResult {
  grouped: Grouped;
  expandedCities: Record<string, boolean>;
  expandedSuburbs: Record<string, boolean>;
  expandedPlaces: Place[];
  toggleCity: (city: string) => void;
  toggleSuburb: (suburb: string) => void;
}

export function useGroupedLocations(resolved: ResolvedLocation[], options: Options = {}): GroupedLocationsResult {
  const { onCitySelect, onSuburbSelect } = options;
  const [grouped, setGrouped] = useState<Grouped>({});
  const [expandedCities, setExpandedCities] = useState<Record<string, boolean>>({});
  const [expandedSuburbs, setExpandedSuburbs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (resolved.length === 0) { setGrouped({}); return; }

    const next: Grouped = {};
    resolved.forEach((entry) => {
      const { city, suburb } = entry;
      const suburbKey = suburb ?? city;
      const cityGroup = next[city] ?? {};
      next[city] = { ...cityGroup, [suburbKey]: [...(cityGroup[suburbKey] ?? []), entry] };
    });
    setGrouped(next);
    setExpandedCities((prev) => {
      const updated = { ...prev };
      Object.keys(next).forEach((city) => { if (!(city in updated)) updated[city] = false; });
      return updated;
    });
    setExpandedSuburbs((prev) => {
      const updated = { ...prev };
      resolved.forEach(({ suburb, city }) => {
        const key = suburb ?? city;
        if (!(key in updated)) updated[key] = false;
      });
      return updated;
    });
  }, [resolved]);

  const expandedPlaces = useMemo(() => {
    const places: Place[] = [];
    Object.entries(grouped).forEach(([city, suburbs]) => {
      if (!expandedCities[city]) return;
      Object.entries(suburbs).forEach(([suburb, entries]) => {
        if (!expandedSuburbs[suburb]) return;
        entries.forEach(({ place }) => { if (place) places.push(place); });
      });
    });
    return places;
  }, [grouped, expandedCities, expandedSuburbs]);

  function toggleCity(city: string): void {
    setExpandedCities((prev) => {
      const opening = !prev[city];
      if (!opening) {
        onCitySelect?.(null);
        onSuburbSelect?.(null);
      } else {
        onCitySelect?.(city);
      }
      const next: Record<string, boolean> = {};
      Object.keys(prev).forEach((c) => { next[c] = c === city ? opening : false; });
      return next;
    });
  }

  function toggleSuburb(suburb: string): void {
    setExpandedSuburbs((prev) => {
      const next = { ...prev, [suburb]: !prev[suburb] };
      const openSet = new Set(Object.entries(next).filter(([, v]) => v).map(([k]) => k));
      onSuburbSelect?.(openSet.size > 0 ? openSet : null);
      return next;
    });
  }

  return { grouped, expandedCities, expandedSuburbs, expandedPlaces, toggleCity, toggleSuburb };
}
