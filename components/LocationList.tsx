'use client';

import { useLayoutEffect, useRef } from 'react';
import { TYPE_FILTERS } from '@/components/TypeFilter';
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

function matchesTypeFilter(place: Place | null | undefined, selectedTypes: Set<string>): boolean {
  if (selectedTypes.size === 0) return true;
  if (!place?.types) return true;
  return TYPE_FILTERS.some(
    (f) => selectedTypes.has(f.key) && f.types.some((t) => (place.types as string[]).includes(t))
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
    <div
      className={
        onlyCity
          ? 'w-55 min-w-55 max-w-55 flex flex-col gap-2 items-stretch'
          : 'w-full max-w-287.5 grid grid-cols-3 max-sm:grid-cols-1 gap-3 pb-15 items-start'
      }
    >
      {sortedCities.map(([city, suburbs]) => {
        const isCityOpen = expandedCities[city] ?? false;
        const totalCount = Object.values(suburbs).reduce(
          (sum, entries) => sum + entries.filter((e) => e.isFriendly && matchesTypeFilter(e.place, selectedTypes)).length,
          0
        );

        return (
          <div
            key={city}
            data-location-group
            className="bg-[rgb(30,30,30)] max-h-137.5 overflow-auto rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.3)] relative z-1"
            ref={onlyCity ? groupRef : undefined}
          >
            <h2
              className="text-[13px] font-semibold text-[#e0e0e0] m-0 px-4 py-3.5 cursor-pointer flex justify-between items-center transition-[background] duration-150 select-none"
              onClick={(e) => {
                if (!isCityOpen && onCityClickCapture) {
                  const groupEl = (e.currentTarget as HTMLElement).closest('[data-location-group]');
                  if (groupEl) onCityClickCapture(city, groupEl.getBoundingClientRect());
                }
                toggleCity(city);
              }}
            >
              <span className="text-sm font-semibold text-[#e0e0e0]">{city}</span>
              <span className="flex items-center gap-2.5">
                <span className="text-[11px] font-semibold bg-white/10 text-[#9aa0a6] rounded-[20px] py-0.5 px-2">{totalCount}</span>
                <span className="text-[10px] text-[#9aa0a6]">{isCityOpen ? '▲' : '▼'}</span>
              </span>
            </h2>

            {isCityOpen && (
              <div className="overflow-scroll py-1.5 px-2 flex flex-col gap-0.5">
                {Object.entries(suburbs)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([suburb, entries]) => {
                    const isSuburbOpen = expandedSuburbs[suburb] ?? false;
                    const suburbCount = entries.filter((e) => e.isFriendly && matchesTypeFilter(e.place, selectedTypes)).length;

                    return (
                      <div key={suburb} className="rounded-[10px] overflow-hidden">
                        <h3
                          className="text-xs font-semibold text-[#9aa0a6] bg-white/4 m-0 px-3 py-2 cursor-pointer flex justify-between items-center transition-[background] duration-150 select-none hover:bg-white/8"
                          onClick={() => toggleSuburb(suburb)}
                        >
                          <span className="text-xs font-semibold text-[#9aa0a6]">{suburb}</span>
                          <span className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold bg-white/10 text-[#9aa0a6] rounded-[20px] py-0.5 px-2">{suburbCount}</span>
                            <span className="text-[10px] text-[#9aa0a6]">{isSuburbOpen ? '▲' : '▼'}</span>
                          </span>
                        </h3>

                        {isSuburbOpen && (
                          <ul className="list-none m-0 p-2 flex flex-col gap-0.5">
                            {[...entries]
                              .filter(({ place }) => matchesTypeFilter(place, selectedTypes))
                              .sort((a, b) => Number(b.isFriendly) - Number(a.isFriendly))
                              .map(({ name, address, isFriendly, isApproved, place }) => (
                                <li
                                  key={name}
                                  className={
                                    isFriendly
                                      ? 'group flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer transition-[background] duration-150 hover:bg-white/6'
                                      : 'group flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer transition-[background] duration-150 hover:bg-[rgba(255,80,80,0.08)]'
                                  }
                                  onClick={() => onSelect((place ?? { name, formatted_address: address }) as Place)}
                                >
                                  <span className="flex flex-col min-w-0">
                                    <span
                                      className={
                                        isFriendly
                                          ? 'text-[13px] font-semibold text-[#e0e0e0] whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-150 group-hover:text-white'
                                          : 'text-[13px] font-semibold text-[#f28b82] whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-150 group-hover:text-[#ff9a94]'
                                      }
                                    >
                                      {name}
                                    </span>
                                    <span className="text-[11px] text-[#9aa0a6] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{address}</span>
                                    {!isApproved && (
                                      <span className="text-[10px] font-medium text-[#b06000] bg-[#fff3e0] rounded px-1.5 mt-0.75 inline-block w-fit">Community suggested</span>
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
