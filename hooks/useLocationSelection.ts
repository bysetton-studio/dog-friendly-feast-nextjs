import { useState } from 'react';

export interface LocationSelectionResult {
  selectedCity: string | null;
  selectedSuburbs: string[] | null;
  onCitySelect: (city: string | null) => void;
  onSuburbSelect: (suburbs: Set<string> | null) => void;
}

export function useLocationSelection(): LocationSelectionResult {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSuburbs, setSelectedSuburbs] = useState<string[] | null>(null);

  function onCitySelect(city: string | null): void {
    setSelectedCity(city);
    if (!city) setSelectedSuburbs(null);
  }

  function onSuburbSelect(suburbs: Set<string> | null): void {
    setSelectedSuburbs(suburbs ? Array.from(suburbs) : null);
  }

  return { selectedCity, selectedSuburbs, onCitySelect, onSuburbSelect };
}
