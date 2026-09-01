'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { initServices, getPredictions, getPlaceDetails } from '@/hooks/usePlacesCache';
import TypeFilter from '@/components/TypeFilter';
import './LocationSearch.css';
import type { Prediction, Place } from '@/types';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
const DEBOUNCE_MS = 300;

interface Props {
  onSelect: (place: Place) => void;
  mapRef: React.RefObject<google.maps.Map | null>;
  onToggleFilters?: () => void;
  filtersOpen?: boolean;
  filtersActive?: boolean;
  selectedTypes?: Set<string>;
  onTypesChange?: (types: Set<string>) => void;
}

export default function LocationSearch({ onSelect, mapRef, onToggleFilters, filtersOpen = false, filtersActive = false, selectedTypes = new Set(), onTypesChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const ready = useGooglePlaces(API_KEY);

  useEffect(() => {
    if (ready) initServices(mapRef?.current ?? null);
  }, [ready, mapRef]);

  const fetchPredictions = useCallback((value: string) => {
    clearTimeout(debounceRef.current ?? undefined);
    if (!value.trim()) {
      setPredictions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await getPredictions(value);
      setPredictions(results);
      setOpen(results.length > 0);
    }, DEBOUNCE_MS);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const value = e.target.value;
    setQuery(value);
    fetchPredictions(value);
  }

  async function handleSelect(prediction: Prediction): Promise<void> {
    setQuery(prediction.description);
    setPredictions([]);
    setOpen(false);
    const place = await getPlaceDetails(prediction.place_id);
    window.gtag?.('event', 'search', {
      search_term: prediction.description,
      place_id: prediction.place_id,
    });
    onSelect(place);
  }

  function handleBlur(): void {
    setTimeout(() => setOpen(false), 150);
  }

  return (
    <div className="search-wrapper">
      <div className={`search-box ${open ? 'search-box--open' : ''}`}>
        <span className="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#9aa0a6"
              d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search for a dog-friendly restaurant or area..."
          aria-label="Location search"
          value={query}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => predictions.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        <button
          className={`filter-btn${filtersOpen ? ' filter-btn--open' : ''}${filtersActive ? ' filter-btn--active' : ''}`}
          onClick={onToggleFilters}
          aria-label="Toggle filters"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
          </svg>
          {filtersActive && <span className="filter-btn__dot" />}
        </button>
      </div>

      {filtersOpen && onTypesChange && (
        <TypeFilter selected={selectedTypes} onChange={onTypesChange} />
      )}

      {open && (
        <ul className="suggestions">
          {predictions.map((p) => (
            <li
              key={p.place_id}
              className="suggestion-item"
              onMouseDown={() => handleSelect(p)}
            >
              <span className="suggestion-main">{p.structured_formatting.main_text}</span>
              <span className="suggestion-secondary">{p.structured_formatting.secondary_text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
