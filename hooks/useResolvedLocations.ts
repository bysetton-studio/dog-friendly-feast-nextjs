import { useEffect, useState } from 'react';
import { findPlaceDetails } from '@/hooks/usePlacesCache';
import { getCity, getSuburb, isFriendly, isApproved } from '@/lib/placeUtils';
import type { Location, ResolvedLocation } from '@/types';

export function useResolvedLocations(
  locations: Location[],
  servicesReady: boolean
): { resolved: ResolvedLocation[]; loading: boolean } {
  const [resolved, setResolved] = useState<ResolvedLocation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!servicesReady || locations.length === 0) return;

    setResolved([]);
    setLoading(true);
    let completed = 0;

    locations.forEach((loc) => {
      const { name, address, friendly, adminApproved } = loc;

      findPlaceDetails(name, address)
        .then((place) => {
          const fullPlace = place as google.maps.places.PlaceResult;
          setResolved((prev) => [
            ...prev,
            {
              name,
              address,
              isFriendly: isFriendly(friendly),
              isApproved: isApproved(adminApproved),
              place: fullPlace,
              city: getCity(fullPlace.address_components),
              suburb: getSuburb(fullPlace.address_components),
            },
          ]);
        })
        .catch(() => {
          // Skip unresolvable locations silently
        })
        .finally(() => {
          completed++;
          if (completed === locations.length) setLoading(false);
        });
    });
  }, [servicesReady, locations]);

  return { resolved, loading };
}
