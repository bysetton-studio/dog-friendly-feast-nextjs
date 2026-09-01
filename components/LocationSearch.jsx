'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
// TODO: import { useGooglePlaces } from '@/hooks/useGooglePlaces';
// TODO: import { initServices, getPredictions, getPlaceDetails } from '@/hooks/usePlacesCache';
// TODO: import TypeFilter from '@/components/TypeFilter';
import './LocationSearch.css';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const DEBOUNCE_MS = 300;

export default function LocationSearch({ onSelect, mapRef, onToggleFilters, filtersOpen, filtersActive, selectedTypes, onTypesChange }) {
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [open, setOpen] = useState(false);
  // TODO: const ready = useGooglePlaces(API_KEY);

  useEffect(() => {
    // TODO: init Places services when SDK + map ready
  }, [mapRef]);

  const fetchPredictions = useCallback((value) => {
    // TODO
  }, []);

  function handleChange(e) {
    // TODO
  }

  async function handleSelect(prediction) {
    // TODO
  }

  function handleBlur() {
    // TODO
  }

  return (
    <div className="search-wrapper">
      {/* TODO: search box UI */}
      {/* TODO: TypeFilter when filtersOpen */}
      {/* TODO: suggestions dropdown */}
    </div>
  );
}
