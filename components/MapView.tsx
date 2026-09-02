'use client';

import { useEffect, useRef } from 'react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { initServices } from '@/hooks/usePlacesCache';
import { TYPE_FILTERS } from '@/components/TypeFilter';
import './MapView.css';
import type { Place, ResolvedLocation } from '@/types';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID!;
const DEFAULT_CENTER = { lat: -33.9249, lng: 18.4241 }; // Cape Town
const DEFAULT_ZOOM = 12;

interface SavedStyle {
  width: string;
  height: string;
  background: string;
  border: string;
  fontSize: string;
  opacity: string;
}

interface MarkerEntry {
  marker: google.maps.marker.AdvancedMarkerElement;
  el: HTMLElement;
  suburb: string | null;
  city: string;
  types: string[];
  isFriendly: boolean;
  savedStyle: SavedStyle;
  savedText: string;
}

interface Props {
  selected: Place | null;
  mapRef: React.RefObject<google.maps.Map | null>;
  selectedSuburbs: string[] | null;
  selectedCity: string | null;
  resolved: ResolvedLocation[];
  resolvedLoading: boolean;
  locationsLoading: boolean;
  approvedOnly: boolean;
  onApprovedOnlyToggle: () => void;
  selectedTypes: Set<string>;
  capReached: boolean | null;
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

function buildInfoWindowContent(place: google.maps.places.PlaceResult): string {
  const firstPhoto = place.photos?.[0] as
    | google.maps.places.PlacePhoto
    | { photoReference: string }
    | undefined;
  const photoUrl =
    (firstPhoto as { photoReference?: string })?.photoReference != null
      ? `/api/maps/photo?name=${encodeURIComponent((firstPhoto as { photoReference: string }).photoReference)}&maxWidth=280`
      : (firstPhoto as google.maps.places.PlacePhoto | undefined)?.getUrl?.({ maxWidth: 280, maxHeight: 140 });
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
            <a href="${place.website}" target="_blank" rel="noopener noreferrer" style="color:#1a73e8;text-decoration:none">${new URL(place.website).hostname}</a>
          </div>` : ''}
        <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer"
          style="display:inline-block;background:#1a73e8;color:#fff;font-size:12px;padding:6px 14px;border-radius:4px;text-decoration:none;margin-top:2px">
          Get directions
        </a>
      </div>
    </div>
  `;
}

function createMarkerEl(isFriendly: boolean, isApproved: boolean, emoji: string): { el: HTMLElement; savedStyle: SavedStyle; savedText: string } {
  const el = document.createElement('div');
  const size = isFriendly ? '32px' : '22px';
  const bg = isFriendly ? '#1e7e34' : '#c5221f';
  const border = isFriendly
    ? `2px solid ${isApproved ? '#00420a' : '#1e7e34'}`
    : `1.5px solid ${isApproved ? '#530000' : '#c5221f'}`;
  const opacity = isApproved ? '1' : '0.5';
  const fontSize = isFriendly ? '16px' : '9px';
  const text = isFriendly ? emoji : '✕';

  el.style.cssText = `
    width: ${size}; height: ${size};
    border-radius: 50%;
    background: ${bg};
    border: ${border};
    opacity: ${opacity};
    font-size: ${fontSize};
    font-weight: ${isFriendly ? 'normal' : '700'};
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-sizing: border-box;
  `;
  el.textContent = text;

  const savedStyle: SavedStyle = { width: size, height: size, background: bg, border, fontSize, opacity };
  return { el, savedStyle, savedText: text };
}

function applyDefaultStyle(entry: MarkerEntry): void {
  const { el, savedStyle, savedText } = entry;
  el.style.width = savedStyle.width;
  el.style.height = savedStyle.height;
  el.style.background = savedStyle.background;
  el.style.border = savedStyle.border;
  el.style.fontSize = savedStyle.fontSize;
  el.style.opacity = savedStyle.opacity;
  el.textContent = savedText;
}

function applyDimmedStyle(el: HTMLElement): void {
  el.style.width = '8px';
  el.style.height = '8px';
  el.style.background = '#9aa0a6';
  el.style.border = '1.5px solid #6b7175';
  el.style.fontSize = '0px';
  el.style.opacity = '0.7';
  el.textContent = '';
}

export default function MapView({ selected, mapRef, selectedSuburbs, selectedCity, resolved = [], resolvedLoading, locationsLoading, approvedOnly, onApprovedOnlyToggle, selectedTypes = new Set(), capReached }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const locationMarkersRef = useRef<MarkerEntry[]>([]);
  const openInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  console.log(capReached, '--- capReached')
  const ready = useGooglePlaces(API_KEY, capReached);

  // Init map once
  useEffect(() => {
    console.log(ready, ' --- ready')
    if (!ready || !containerRef.current || capReached || capReached === null) return;

    mapRef.current = new window.google.maps.Map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      disableDefaultUI: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      mapId: MAP_ID,
    });

    initServices(mapRef.current);

    return () => {
      locationMarkersRef.current.forEach(({ marker }) => { marker.map = null; });
      locationMarkersRef.current = [];
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [ready, mapRef, capReached, containerRef.current]);

  // Sync pins from resolved locations
  useEffect(() => {
    if (!ready || !mapRef.current) return;

    const visibleNames = new Set(resolved.map(({ name }) => name));

    // Remove stale markers
    locationMarkersRef.current
      .filter(({ marker }) => !visibleNames.has(marker.title ?? ''))
      .forEach(({ marker }) => { marker.map = null; });
    locationMarkersRef.current = locationMarkersRef.current.filter(
      ({ marker }) => visibleNames.has(marker.title ?? '')
    );

    // Add new markers
    const existingNames = new Set(locationMarkersRef.current.map(({ marker }) => marker.title));
    const newEntries = resolved.filter(({ name }) => !existingNames.has(name));

    newEntries.forEach(({ name, isFriendly, isApproved, place, suburb, city }) => {
      const emoji = getTypeEmoji(place.types);
      const { el, savedStyle, savedText } = createMarkerEl(isFriendly, isApproved, emoji);

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: place.geometry!.location,
        map: mapRef.current,
        title: name,
        zIndex: isFriendly ? 2 : 1,
        content: el,
      });

      const infoWindow = new window.google.maps.InfoWindow({ content: buildInfoWindowContent(place) });
      marker.addListener('gmp-click', () => {
        if (openInfoWindowRef.current) openInfoWindowRef.current.close();
        infoWindow.open(mapRef.current, marker);
        openInfoWindowRef.current = infoWindow;
      });

      locationMarkersRef.current.push({ marker, el, suburb, city, types: place.types ?? [], isFriendly, savedStyle, savedText });
    });
  }, [ready, mapRef, resolved]);

  // Dim/highlight markers when selectedSuburbs changes
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;

    locationMarkersRef.current.forEach((entry) => {
      const { marker, el, suburb, isFriendly } = entry;
      const isFiltering = selectedSuburbs && selectedSuburbs.length > 0;
      const inExpandedSuburb = isFiltering && selectedSuburbs!.includes(suburb ?? '');

      if (!isFiltering || inExpandedSuburb) {
        marker.map = mapRef.current;
        applyDefaultStyle(entry);
      } else if (!isFriendly) {
        marker.map = null;
      } else {
        marker.map = mapRef.current;
        applyDimmedStyle(el);
      }
    });
  }, [selectedSuburbs]);

  // Show/hide markers when selectedTypes changes
  useEffect(() => {
    locationMarkersRef.current.forEach(({ marker, types }) => {
      marker.map = matchesTypeFilter(types, selectedTypes) ? mapRef.current : null;
    });
  }, [selectedTypes]);

  // Fit map to city when selectedCity changes
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps || !selectedCity) return;

    const bounds = new window.google.maps.LatLngBounds();
    let matchCount = 0;

    locationMarkersRef.current.forEach(({ marker, city }) => {
      if (city === selectedCity) {
        bounds.extend(marker.position as google.maps.LatLng);
        matchCount++;
      }
    });

    if (matchCount === 1) { mapRef.current.panTo(bounds.getCenter()); mapRef.current.setZoom(14); }
    else if (matchCount > 1) { mapRef.current.fitBounds(bounds, 80); }
  }, [selectedCity]);

  // Pan + marker when a location is selected via search
  useEffect(() => {
    if (!mapRef.current || !(selected as google.maps.places.PlaceResult)?.geometry?.location) return;

    const location = (selected as google.maps.places.PlaceResult).geometry!.location!;
    mapRef.current.panTo(location);
    mapRef.current.setZoom(14);

    if (markerRef.current) { markerRef.current.map = null; markerRef.current = null; }

    const GEOGRAPHIC_TYPES = new Set([
      'locality', 'sublocality', 'sublocality_level_1', 'sublocality_level_2',
      'administrative_area_level_1', 'administrative_area_level_2',
      'country', 'route', 'neighborhood', 'postal_code', 'political',
    ]);
    const isGeographic = selected?.types?.every((t) => GEOGRAPHIC_TYPES.has(t)) ?? false;

    if (!isGeographic) {
      markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
        position: location,
        map: mapRef.current,
        title: selected?.formatted_address as string,
      });
    }
  }, [selected, mapRef]);

  return (
    <div className="map-container">
      <div ref={containerRef} className="map" />
      <label className="map-approved-toggle" onClick={onApprovedOnlyToggle}>
        <span>Verified only</span>
        <div className={`toggle-switch${approvedOnly ? ' toggle-switch--on' : ''}`}>
          <div className="toggle-switch__thumb" />
        </div>
      </label>
      {(locationsLoading || resolvedLoading) && (
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
