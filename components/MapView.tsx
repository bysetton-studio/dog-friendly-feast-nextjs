'use client';

import { useEffect, useRef, useState } from 'react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { initServices, findPlaceDetails } from '@/hooks/usePlacesCache';
import { TYPE_FILTERS } from '@/components/TypeFilter';
import './MapView.css';
import type { Location, Place } from '@/types';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
const DEFAULT_CENTER = { lat: -33.9249, lng: 18.4241 }; // Cape Town
const DEFAULT_ZOOM = 12;

interface MarkerEntry {
  marker: google.maps.Marker;
  suburb: string | null;
  city: string;
  types: string[];
  icon: google.maps.Symbol;
  label: google.maps.MarkerLabel | string;
  isFriendly: boolean;
}

interface Props {
  selected: Place | null;
  mapRef: React.RefObject<google.maps.Map | null>;
  onServicesReady: () => void;
  selectedSuburbs: string[] | null;
  onSuburbDetected: (suburbs: string[] | null) => void;
  selectedCity: string | null;
  locations: Location[];
  locationsLoading: boolean;
  approvedOnly: boolean;
  onApprovedOnlyToggle: () => void;
  selectedTypes: Set<string>;
}

function matchesTypeFilter(types: string[] | undefined, selectedTypes: Set<string>): boolean {
  // TODO
  return true;
}

function getTypeEmoji(types: string[] | undefined): string {
  // TODO
  return '🦴';
}

function getSuburb(addressComponents: google.maps.GeocoderAddressComponent[] | undefined): string | null {
  // TODO
  return null;
}

function buildInfoWindowContent(place: google.maps.places.PlaceResult): string {
  // TODO
  return '';
}

export default function MapView({ selected, mapRef, onServicesReady, selectedSuburbs, onSuburbDetected, selectedCity, locations = [], locationsLoading, approvedOnly, onApprovedOnlyToggle, selectedTypes = new Set() }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const locationMarkersRef = useRef<MarkerEntry[]>([]);
  const openInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const ready = useGooglePlaces(API_KEY);
  const [pinsLoading, setPinsLoading] = useState(true);

  // TODO: useEffect — init map
  // TODO: useEffect — sync pins when locations change
  // TODO: useEffect — dim/highlight markers when selectedSuburbs changes
  // TODO: useEffect — show/hide markers when selectedTypes changes
  // TODO: useEffect — fit map to city when selectedCity changes
  // TODO: useEffect — pan + marker when selected changes

  return (
    <div className="map-container">
      <div ref={containerRef} className="map" />
      <label className="map-approved-toggle" onClick={onApprovedOnlyToggle}>
        <span>Verified only</span>
        <div className={`toggle-switch${approvedOnly ? ' toggle-switch--on' : ''}`}>
          <div className="toggle-switch__thumb" />
        </div>
      </label>
      {(locationsLoading || pinsLoading) && (
        <div className="map-loading">
          <div className="map-loading__spinner" />
          <span className="map-loading__text">Loading locations...</span>
        </div>
      )}
      {selected && (
        <div className="map-label">
          <strong>{(selected as google.maps.places.PlaceResult).name || selected.formatted_address}</strong>
          {(selected as google.maps.places.PlaceResult).name && <span>{selected.formatted_address}</span>}
        </div>
      )}
    </div>
  );
}
