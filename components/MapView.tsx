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
  if (selectedTypes.size === 0) return true;
  if (!types) return true;
  return TYPE_FILTERS.some(
    (f) => selectedTypes.has(f.key) && f.types.some((t) => types.includes(t))
  );
}

function getTypeEmoji(types: string[] | undefined): string {
  if (!types) return '🦴';
  const match = TYPE_FILTERS.find((f) => f.types.some((t) => types.includes(t)));
  return match ? match.emoji : '🦴';
}

function getSuburb(addressComponents: google.maps.GeocoderAddressComponent[] | undefined): string | null {
  const types = ['sublocality_level_1', 'sublocality', 'neighborhood', 'locality'];
  for (const type of types) {
    const component = addressComponents?.find((c) => c.types.includes(type));
    if (component) return component.long_name;
  }
  return null;
}

function buildInfoWindowContent(place: google.maps.places.PlaceResult): string {
  const photoUrl = place.photos?.[0]?.getUrl({ maxWidth: 280, maxHeight: 140 });
  const stars = place.rating
    ? '★'.repeat(Math.round(place.rating)) + '☆'.repeat(5 - Math.round(place.rating))
    : null;
  const todayIndex = new Date().getDay();
  const todayHours = place.opening_hours?.weekday_text?.[todayIndex === 0 ? 6 : todayIndex - 1];
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination_place_id=${place.place_id}`;

  return `
    <div style="font-family:Arial,sans-serif;width:280px;overflow:hidden;border-radius:4px">
      ${photoUrl ? `<img src="${photoUrl}" style="width:100%;height:140px;object-fit:cover;display:block;margin-bottom:10px;border-radius:4px 4px 0 0" />` : ''}
      <div style="padding:4px 2px 8px">
        <div style="font-size:15px;font-weight:600;color:#202124;margin-bottom:4px">${place.name}</div>
        <div style="font-size:12px;color:#5f6368;margin-bottom:8px">${place.formatted_address || ''}</div>
        ${stars ? `
          <div style="margin-bottom:8px;display:flex;align-items:center;gap:6px">
            <span style="color:#f5a623;font-size:14px;letter-spacing:1px">${stars}</span>
            <span style="font-size:12px;color:#5f6368">${place.rating} (${place.user_ratings_total?.toLocaleString() ?? 0} reviews)</span>
          </div>` : ''}
        ${todayHours ? `
          <div style="font-size:12px;color:#5f6368;margin-bottom:6px">🕐 ${todayHours}</div>` : ''}
        ${place.formatted_phone_number ? `
          <div style="font-size:12px;margin-bottom:6px">
            📞 <a href="tel:${place.formatted_phone_number}" style="color:#1a73e8;text-decoration:none">${place.formatted_phone_number}</a>
          </div>` : ''}
        ${place.website ? `
          <div style="font-size:12px;margin-bottom:10px">
            🌐 <a href="${place.website}" target="_blank" rel="noopener noreferrer" style="color:#1a73e8;text-decoration:none">${new URL(place.website).hostname}</a>
          </div>` : ''}
        <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer"
          style="display:inline-block;background:#1a73e8;color:#fff;font-size:12px;padding:6px 14px;border-radius:4px;text-decoration:none;margin-top:2px">
          Get directions
        </a>
      </div>
    </div>
  `;
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
