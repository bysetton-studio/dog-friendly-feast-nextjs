'use client';

import { useCallback, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { getPredictions, getPlaceDetails } from '@/hooks/usePlacesCache';
import TypeFilter from '@/components/TypeFilter';
import type { Prediction, Place } from '@/types';

const DEBOUNCE_MS = 800;

interface Props {
  onSelect: (place: Place) => void;
  mapRef: React.RefObject<unknown>;
  onToggleFilters?: () => void;
  filtersOpen?: boolean;
  filtersActive?: boolean;
  selectedTypes?: Set<string>;
  onTypesChange?: (types: Set<string>) => void;
}

export default function LocationSearch({ onSelect, mapRef: _mapRef, onToggleFilters, filtersOpen = false, filtersActive = false, selectedTypes = new Set(), onTypesChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);

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
      setOpen(true);
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
    <div className="flex flex-col items-center w-full max-w-145.5 relative gap-2">
      <div className={`flex items-center w-full border border-ink-border bg-white px-4 py-2.5 relative z-200 transition-[box-shadow,border-color] duration-200 ${open ? 'rounded-[24px_24px_0_0] border-transparent border-b-ink-dim shadow-[0_4px_12px_rgba(0,0,0,0.15)]' : 'rounded-3xl shadow-none focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.15)] focus-within:border-transparent'}`}>
        <span className="flex items-center mr-3 shrink-0">
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
          className="flex-1 border-none outline-none text-base text-ink bg-transparent font-[Arial,sans-serif] placeholder:text-fg-muted"
          placeholder="Search for a dog-friendly restaurant or area..."
          aria-label="Location search"
          value={query}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => predictions.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        <button
          className={`flex items-center justify-center relative shrink-0 w-8 h-8 border-none rounded-full cursor-pointer ml-1 transition-[background,color] duration-150 ${filtersOpen ? 'bg-accent-subtle text-accent' : 'bg-transparent text-fg-muted hover:bg-ink-dim hover:text-ink-soft'} ${filtersActive ? 'text-accent' : ''}`}
          onClick={onToggleFilters}
          aria-label="Toggle filters"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
            <path fill="currentColor" d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
          </svg>
          {filtersActive && <span className="absolute top-1 right-1 w-1.75 h-1.75 rounded-full bg-accent border-[1.5px] border-white" />}
        </button>
      </div>

      {filtersOpen && onTypesChange && (
        <TypeFilter selected={selectedTypes} onChange={onTypesChange} />
      )}

      {open && (
        <ul className="absolute top-full left-0 right-0 bg-white border border-transparent border-t-ink-dim rounded-[0_0_24px_24px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] list-none m-0 pt-1 pb-2 z-200 overflow-hidden">
          {!!predictions.length ? predictions.map((p) => (
            <li
              key={p.place_id}
              className="flex flex-col px-4 pt-2.5 pb-2.5 pl-13 cursor-pointer transition-colors duration-100 hover:bg-ink-dim"
              onMouseDown={() => handleSelect(p)}
            >
              <span className="text-[14px] text-ink">{p.structured_formatting.main_text}</span>
              <span className="text-[12px] text-ink-soft mt-0.5">{p.structured_formatting.secondary_text}</span>
            </li>
          )) : (
            <li className="flex items-center gap-2.5 px-4 py-3 text-[13px] text-ink-soft">
              <MapPin size={15} strokeWidth={2} className="shrink-0 text-fg-muted" />
              Can&apos;t find it? Drop a pin on the map instead
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
