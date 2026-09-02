'use client';

import { useLayoutEffect, useRef } from 'react';
import { TYPE_FILTERS } from '@/components/TypeFilter';
import './LocationList.css';
import type { Place, ResolvedLocation } from '@/types';

type Grouped = Record<string, Record<string, ResolvedLocation[]>>;

interface Props {
  onSelect: (place: Place) => void;
  grouped: Grouped;
  expandedCities: Record<string, boolean>;
  expandedSuburbs: Record<string, boolean>;
  toggleCity: (city: string) => void;
  toggleSuburb: (suburb: string) => void;
  loading: boolean;
  selectedTypes: Set<string>;
  onlyCity?: string;
  excludeCity?: string;
  flipFromRect?: DOMRect | null;
  onCityClickCapture?: (city: string, rect: DOMRect) => void;
}

function matchesTypeFilter(place: google.maps.places.PlaceResult | null, selectedTypes: Set<string>): boolean {
  if (selectedTypes.size === 0) return true;
  if (!place?.types) return true;
  return TYPE_FILTERS.some(
    (f) => selectedTypes.has(f.key) && f.types.some((t) => place.types!.includes(t))
  );
}

export default function LocationList({ onSelect, grouped, expandedCities, expandedSuburbs, toggleCity, toggleSuburb, loading, selectedTypes = new Set(), onlyCity, excludeCity, flipFromRect, onCityClickCapture }: Props) {
  const groupRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!onlyCity || !flipFromRect || !groupRef.current) return;
    const el = groupRef.current;
    const toRect = el.getBoundingClientRect();
    const dx = flipFromRect.left - toRect.left;
    const dy = flipFromRect.top - toRect.top;

    el.style.transition = 'none';
    el.style.transform = `translate(${dx}px, ${dy}px)`;
    el.style.opacity = '0.6';

    requestAnimationFrame(() => {
      el.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease';
      el.style.transform = '';
      el.style.opacity = '';
    });
  }, [onlyCity, flipFromRect]);

  const sortedCities = Object.entries(grouped)
    .filter(([city]) => {
      if (onlyCity != null) return city === onlyCity;
      if (excludeCity != null) return city !== excludeCity;
      return true;
    })
    .sort(([a], [b]) => a.localeCompare(b));

  if (loading) return <p style={{ color: '#9aa0a6', fontSize: 14 }}>Loading locations...</p>;
  if (sortedCities.length === 0) return null;

  return (
    <div className={`location-list${onlyCity ? ' location-list--sidebar' : ''}`}>
      {sortedCities.map(([city, suburbs]) => {
        const isCityOpen = expandedCities[city] ?? false;
        const totalCount = Object.values(suburbs).reduce(
          (sum, entries) => sum + entries.filter((e) => e.isFriendly && matchesTypeFilter(e.place, selectedTypes)).length,
          0
        );

        return (
          <div key={city} className="location-group" ref={onlyCity ? groupRef : undefined}>
            <h2
              className="city-heading"
              onClick={(e) => {
                if (!isCityOpen && onCityClickCapture) {
                  const groupEl = (e.currentTarget as HTMLElement).closest('.location-group');
                  if (groupEl) onCityClickCapture(city, groupEl.getBoundingClientRect());
                }
                toggleCity(city);
              }}
            >
              <span className="city-heading__name">{city}</span>
              <span className="city-heading__meta">
                <span className="city-heading__count">{totalCount}</span>
                <span className="city-heading__chevron">{isCityOpen ? '▲' : '▼'}</span>
              </span>
            </h2>

            {isCityOpen && (
              <div className="suburb-list">
                {Object.entries(suburbs)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([suburb, entries]) => {
                    const isSuburbOpen = expandedSuburbs[suburb] ?? false;
                    const suburbCount = entries.filter((e) => e.isFriendly && matchesTypeFilter(e.place, selectedTypes)).length;

                    return (
                      <div key={suburb} className="suburb-group">
                        <h3 className="suburb-heading" onClick={() => toggleSuburb(suburb)}>
                          <span className="suburb-heading__name">{suburb}</span>
                          <span className="suburb-heading__meta">
                            <span className="city-heading__count">{suburbCount}</span>
                            <span className="city-heading__chevron">{isSuburbOpen ? '▲' : '▼'}</span>
                          </span>
                        </h3>

                        {isSuburbOpen && (
                          <ul className="place-list">
                            {[...entries]
                              .filter(({ place }) => matchesTypeFilter(place, selectedTypes))
                              .sort((a, b) => Number(b.isFriendly) - Number(a.isFriendly))
                              .map(({ name, address, isFriendly, isApproved, place }) => (
                                <li
                                  key={name}
                                  className={`place-item${isFriendly ? '' : ' place-item--unfriendly'}`}
                                  onClick={() => onSelect((place ?? { name, formatted_address: address }) as Place)}
                                >
                                  <span className="place-info">
                                    <span className="place-name">{name}</span>
                                    <span className="place-address">{address}</span>
                                    {!isApproved && (
                                      <span className="place-community-tag">Community suggested</span>
                                    )}
                                  </span>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
