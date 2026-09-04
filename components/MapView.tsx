'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { initServices } from '@/hooks/usePlacesCache';
import { TYPE_FILTERS } from '@/components/TypeFilter';
import './MapView.css';
import type { Place, ResolvedLocation } from '@/types';

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? '';
const TILE_URL = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`;
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.geoapify.com">Geoapify</a>';
const DEFAULT_CENTER: L.LatLngTuple = [-33.9249, 18.4241]; // Cape Town
const DEFAULT_ZOOM = 12;

interface MarkerEntry {
  marker: L.Marker;
  name: string;
  suburb: string | null;
  city: string;
  types: string[];
  isFriendly: boolean;
  normalIcon: L.DivIcon;
  dimmedIcon: L.DivIcon;
}

interface Props {
  selected: Place | null;
  mapRef: React.RefObject<L.Map | null>;
  selectedSuburbs: string[] | null;
  selectedCity: string | null;
  resolved: ResolvedLocation[];
  resolvedLoading: boolean;
  locationsLoading: boolean;
  approvedOnly: boolean;
  onApprovedOnlyToggle: () => void;
  selectedTypes: Set<string>;
  capReached: boolean | null;
  expandedPlaces?: Place[];
}

function matchesTypeFilter(types: string[] | undefined, selectedTypes: Set<string>): boolean {
  if (selectedTypes.size === 0) return true;
  if (!types || types.length === 0) return selectedTypes.has('other');
  if (selectedTypes.has('other') && types.length === 0) return true;
  return TYPE_FILTERS.some(
    (f) => f.key !== 'other' && selectedTypes.has(f.key) && f.types.some((t) => types.includes(t))
  );
}

function getTypeEmoji(types: string[] | undefined): string {
  if (!types || types.length === 0) return '🦴';
  const match = TYPE_FILTERS.find((f) => f.key !== 'other' && f.types.some((t) => types.includes(t)));
  return match ? match.emoji : '🦴';
}

function createNormalIcon(isFriendly: boolean, isApproved: boolean, emoji: string): L.DivIcon {
  const size = isFriendly ? 32 : 22;
  const bg = isFriendly ? '#1e7e34' : '#c5221f';
  const border = isFriendly
    ? `2px solid ${isApproved ? '#00420a' : '#1e7e34'}`
    : `1.5px solid ${isApproved ? '#530000' : '#c5221f'}`;
  const opacity = isApproved ? '1' : '0.5';
  const fontSize = isFriendly ? '16px' : '9px';
  const text = isFriendly ? emoji : '✕';

  const html = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:${border};opacity:${opacity};font-size:${fontSize};font-weight:${isFriendly ? 'normal' : '700'};color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-sizing:border-box;">${text}</div>`;
  return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

function createSearchPinIcon(): L.DivIcon {
  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="width:20px;height:20px;border-radius:50% 50% 50% 0;background:#1a73e8;border:2px solid #0d47a1;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [20, 26], iconAnchor: [10, 26] });
}

function createDimmedIcon(): L.DivIcon {
  const html = `<div style="width:8px;height:8px;border-radius:50%;background:#9aa0a6;border:1.5px solid #6b7175;opacity:0.7;"></div>`;
  return L.divIcon({ html, className: '', iconSize: [8, 8], iconAnchor: [4, 4] });
}

function buildPopupContent(name: string, place: Place): string {
  const address = (place.formatted_address as string) ?? '';
  const query = encodeURIComponent(address || name);
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return `
    <div style="font-family:Arial,sans-serif;width:240px;padding:4px 2px 8px">
      <div style="font-size:15px;font-weight:600;color:#202124;margin-bottom:4px">${name}</div>
      <div style="font-size:12px;color:#5f6368;margin-bottom:10px">${address}</div>
      <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer"
        style="display:inline-block;background:#1a73e8;color:#fff;font-size:12px;padding:6px 14px;border-radius:4px;text-decoration:none;">
        Get directions
      </a>
    </div>
  `;
}

export default function MapView({
  selected,
  mapRef,
  selectedSuburbs,
  selectedCity,
  resolved = [],
  resolvedLoading,
  locationsLoading,
  approvedOnly,
  onApprovedOnlyToggle,
  selectedTypes = new Set(),
  capReached,
  expandedPlaces,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const locationMarkersRef = useRef<MarkerEntry[]>([]);

  // Initialize Leaflet map once
  useEffect(() => {
    if (!containerRef.current || capReached || capReached === null) return;
    if (mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 20,
    }).addTo(map);

    mapRef.current = map;
    initServices(map);

    return () => {
      locationMarkersRef.current.forEach(({ marker }) => marker.remove());
      locationMarkersRef.current = [];
      selectedMarkerRef.current?.remove();
      selectedMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capReached]);

  // Sync map markers from resolved locations
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const visibleNames = new Set(resolved.map(({ name }) => name));

    // Remove stale markers
    locationMarkersRef.current
      .filter(({ name }) => !visibleNames.has(name))
      .forEach(({ marker }) => marker.remove());
    locationMarkersRef.current = locationMarkersRef.current.filter(({ name }) => visibleNames.has(name));

    // Add new markers
    const existingNames = new Set(locationMarkersRef.current.map(({ name }) => name));

    resolved
      .filter(({ name }) => !existingNames.has(name))
      .forEach(({ name, isFriendly, isApproved, place, suburb, city }) => {
        const loc = place.geometry?.location;
        if (!loc) return;

        const types = (place.types as string[] | undefined) ?? [];
        const emoji = getTypeEmoji(types);
        const normalIcon = createNormalIcon(isFriendly, isApproved, emoji);
        const dimmedIcon = createDimmedIcon();

        const marker = L.marker([loc.lat, loc.lng], {
          icon: normalIcon,
          zIndexOffset: isFriendly ? 1000 : 0,
          title: name,
        });

        marker.bindPopup(buildPopupContent(name, place), { maxWidth: 260 });
        marker.addTo(map);

        locationMarkersRef.current.push({ marker, name, suburb, city, types, isFriendly, normalIcon, dimmedIcon });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRef.current, resolved]);

  // Dim/highlight markers when suburb filter changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    locationMarkersRef.current.forEach((entry) => {
      const { marker, suburb, isFriendly, normalIcon, dimmedIcon } = entry;
      const isFiltering = selectedSuburbs && selectedSuburbs.length > 0;
      const inExpandedSuburb = isFiltering && selectedSuburbs!.includes(suburb ?? '');

      if (!isFiltering || inExpandedSuburb) {
        marker.setIcon(normalIcon);
        if (!map.hasLayer(marker)) marker.addTo(map);
      } else if (!isFriendly) {
        marker.remove();
      } else {
        marker.setIcon(dimmedIcon);
        if (!map.hasLayer(marker)) marker.addTo(map);
      }
    });
  }, [selectedSuburbs]);

  // Show/hide markers when type filter changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    locationMarkersRef.current.forEach(({ marker, types }) => {
      if (matchesTypeFilter(types, selectedTypes)) {
        if (!map.hasLayer(marker)) marker.addTo(map);
      } else {
        marker.remove();
      }
    });
  }, [selectedTypes]);

  // Fit map bounds to selected city
  useEffect(() => {
    if (!mapRef.current || !selectedCity) return;
    const map = mapRef.current;

    const cityMarkers = locationMarkersRef.current.filter(({ city }) => city === selectedCity);
    if (cityMarkers.length === 0) return;

    if (cityMarkers.length === 1) {
      map.setView(cityMarkers[0].marker.getLatLng(), 14);
    } else {
      const bounds = L.latLngBounds(cityMarkers.map(({ marker }) => marker.getLatLng()));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [selectedCity]);

  // Fit map to expanded suburb places
  useEffect(() => {
    if (!mapRef.current || !expandedPlaces || expandedPlaces.length === 0) return;
    const map = mapRef.current;

    const points = expandedPlaces
      .filter((p) => p.geometry?.location)
      .map((p) => [p.geometry!.location.lat, p.geometry!.location.lng] as L.LatLngTuple);

    if (points.length === 0) return;
    const bounds = L.latLngBounds(points);
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
  }, [expandedPlaces]);

  // Pan and temporary pin when a location is selected via search
  useEffect(() => {
    if (!mapRef.current || !selected?.geometry?.location) return;
    const map = mapRef.current;
    const { lat, lng } = selected.geometry.location;

    map.setView([lat, lng], 14);

    selectedMarkerRef.current?.remove();
    selectedMarkerRef.current = null;

    // Geoapify result_type values for areas/regions — no pin for these
    const GEOGRAPHIC_RESULT_TYPES = new Set([
      'country', 'state', 'county', 'city', 'postcode', 'street', 'district', 'suburb',
    ]);
    const isGeographic = GEOGRAPHIC_RESULT_TYPES.has(selected.result_type as string)

    if (!isGeographic) {
      selectedMarkerRef.current = L.marker([lat, lng], { icon: createSearchPinIcon() }).addTo(map);
    }
  }, [selected]);

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
          <strong>{(selected.name as string) || selected.formatted_address}</strong>
          {selected.name && <span>{selected.formatted_address as string}</span>}
        </div>
      )}
    </div>
  );
}
