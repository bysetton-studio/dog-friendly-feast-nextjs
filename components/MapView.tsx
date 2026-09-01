'use client';

import { useEffect, useRef } from 'react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { initServices } from '@/hooks/usePlacesCache';
import { TYPE_FILTERS } from '@/components/TypeFilter';
import './MapView.css';
import type { Place, ResolvedLocation } from '@/types';

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
  resolved: ResolvedLocation[];
  resolvedLoading: boolean;
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

export default function MapView({ selected, mapRef, onServicesReady, selectedSuburbs, onSuburbDetected, selectedCity, resolved = [], resolvedLoading, locationsLoading, approvedOnly, onApprovedOnlyToggle, selectedTypes = new Set() }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const locationMarkersRef = useRef<MarkerEntry[]>([]);
  const openInfoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const ready = useGooglePlaces(API_KEY);

  // Init map once
  useEffect(() => {
    if (!ready || !containerRef.current) return;

    mapRef.current = new window.google.maps.Map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      disableDefaultUI: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    initServices(mapRef.current);
    onServicesReady?.();

    return () => {
      locationMarkersRef.current.forEach(({ marker }) => marker.setMap(null));
      locationMarkersRef.current = [];
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [ready, mapRef]);

  // Sync pins from resolved locations
  useEffect(() => {
    if (!ready || !mapRef.current) return;

    const visibleNames = new Set(resolved.map(({ name }) => name));

    // Remove stale markers
    locationMarkersRef.current
      .filter(({ marker }) => !visibleNames.has(marker.getTitle() ?? ''))
      .forEach(({ marker }) => marker.setMap(null));
    locationMarkersRef.current = locationMarkersRef.current.filter(
      ({ marker }) => visibleNames.has(marker.getTitle() ?? '')
    );

    // Add new markers
    const existingNames = new Set(locationMarkersRef.current.map(({ marker }) => marker.getTitle()));
    const newEntries = resolved.filter(({ name }) => !existingNames.has(name));

    newEntries.forEach(({ name, isFriendly, isApproved, place, suburb, city }) => {
      const icon: google.maps.Symbol = isFriendly
        ? { path: window.google.maps.SymbolPath.CIRCLE, scale: 16, fillColor: '#1e7e34', fillOpacity: isApproved ? 1 : 0.5, strokeColor: isApproved ? '#00420a' : '#1e7e34', strokeWeight: 2 }
        : { path: window.google.maps.SymbolPath.CIRCLE, scale: 11, fillColor: '#c5221f', fillOpacity: isApproved ? 1 : 0.5, strokeColor: isApproved ? '#530000' : '#c5221f', strokeWeight: 1.5 };

      const label: google.maps.MarkerLabel = isFriendly
        ? { text: getTypeEmoji(place.types), fontSize: '16px', color: '#fff' }
        : { text: '✕', fontSize: '9px', fontWeight: '700', color: '#fff' };

      const marker = new window.google.maps.Marker({
        position: place.geometry!.location,
        map: mapRef.current,
        title: name,
        zIndex: isFriendly ? 2 : 1,
        icon,
        label,
      });

      const infoWindow = new window.google.maps.InfoWindow({ content: buildInfoWindowContent(place) });
      marker.addListener('click', () => {
        if (openInfoWindowRef.current) openInfoWindowRef.current.close();
        infoWindow.open(mapRef.current, marker);
        openInfoWindowRef.current = infoWindow;
      });

      locationMarkersRef.current.push({ marker, suburb, city, types: place.types ?? [], icon, label, isFriendly });
    });
  }, [ready, mapRef, resolved]);

  // Dim/highlight markers when selectedSuburbs changes
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;

    const dimmedIcon: google.maps.Symbol = {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 4, fillColor: '#9aa0a6', fillOpacity: 0.7, strokeColor: '#6b7175', strokeWeight: 1.5,
    };

    locationMarkersRef.current.forEach(({ marker, suburb, icon, label, isFriendly }) => {
      const isFiltering = selectedSuburbs && selectedSuburbs.length > 0;
      const inExpandedSuburb = isFiltering && selectedSuburbs!.includes(suburb ?? '');

      if (!isFiltering) {
        marker.setVisible(true); marker.setIcon(icon); marker.setLabel(label); marker.setOpacity(1);
      } else if (inExpandedSuburb) {
        marker.setVisible(true); marker.setIcon(icon); marker.setLabel(label); marker.setOpacity(1);
      } else if (!isFriendly) {
        marker.setVisible(false);
      } else {
        marker.setVisible(true); marker.setIcon(dimmedIcon); marker.setLabel(''); marker.setOpacity(1);
      }
    });
  }, [selectedSuburbs]);

  // Show/hide markers when selectedTypes changes
  useEffect(() => {
    locationMarkersRef.current.forEach(({ marker, types }) => {
      marker.setVisible(matchesTypeFilter(types, selectedTypes));
    });
  }, [selectedTypes]);

  // Fit map to city when selectedCity changes
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps || !selectedCity) return;

    const bounds = new window.google.maps.LatLngBounds();
    let matchCount = 0;

    locationMarkersRef.current.forEach(({ marker, city }) => {
      if (city === selectedCity) { bounds.extend(marker.getPosition()!); matchCount++; }
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

    if (markerRef.current) { markerRef.current.setMap(null); markerRef.current = null; }

    const GEOGRAPHIC_TYPES = new Set([
      'locality', 'sublocality', 'sublocality_level_1', 'sublocality_level_2',
      'administrative_area_level_1', 'administrative_area_level_2',
      'country', 'route', 'neighborhood', 'postal_code', 'political',
    ]);
    const isGeographic = selected?.types?.every((t) => GEOGRAPHIC_TYPES.has(t)) ?? false;

    if (!isGeographic) {
      markerRef.current = new window.google.maps.Marker({
        position: location,
        map: mapRef.current,
        title: selected?.formatted_address as string,
        animation: window.google.maps.Animation.DROP,
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
