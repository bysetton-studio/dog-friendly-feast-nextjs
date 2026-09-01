'use client';

import { useEffect, useState } from 'react';
import { findPlaceDetails } from '@/hooks/usePlacesCache';
import { TYPE_FILTERS } from '@/components/TypeFilter';
import './LocationList.css';
import type { Location, Place } from '@/types';

interface PlaceEntry {
  name: string;
  address: string;
  isFriendly: boolean;
  isApproved: boolean;
  place: google.maps.places.PlaceResult | null;
}

type Grouped = Record<string, Record<string, PlaceEntry[]>>;

interface Props {
  onSelect: (place: Place) => void;
  servicesReady: boolean;
  selectedSuburb: string[] | null;
  onSuburbSelect: (suburbs: Set<string> | null) => void;
  onCitySelect: (city: string | null) => void;
  onExpandedPlacesChange: (places: google.maps.places.PlaceResult[]) => void;
  locations: Location[];
  loading: boolean;
  selectedTypes: Set<string>;
}

function matchesTypeFilter(place: google.maps.places.PlaceResult | null, selectedTypes: Set<string>): boolean {
  // TODO
  return true;
}

function getCity(addressComponents: google.maps.GeocoderAddressComponent[] | undefined): string {
  // TODO
  return 'Other';
}

function getSuburb(addressComponents: google.maps.GeocoderAddressComponent[] | undefined): string | null {
  // TODO
  return null;
}

export default function LocationList({ onSelect, servicesReady, selectedSuburb, onSuburbSelect, onCitySelect, onExpandedPlacesChange, locations = [], loading, selectedTypes = new Set() }: Props) {
  const [grouped, setGrouped] = useState<Grouped>({});
  const [expandedCities, setExpandedCities] = useState<Record<string, boolean>>({});
  const [expandedSuburbs, setExpandedSuburbs] = useState<Record<string, boolean>>({});

  // TODO: useEffect — build grouped from locations
  // TODO: useEffect — notify onExpandedPlacesChange when expanded state changes

  function handleSuburbClick(suburb: string): void {
    // TODO
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
