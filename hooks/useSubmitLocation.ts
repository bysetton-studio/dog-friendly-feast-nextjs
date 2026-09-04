import { useState } from 'react';
import { addLocationToCache } from '@/hooks/useLocations';
import { addResolvedLocation } from '@/hooks/useResolvedLocations';
import type { Place, ResolvedLocation } from '@/types';

export function useSubmitLocation() {
  const [submitting, setSubmitting] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState<boolean | null>(null);

  async function submit(place: Place, value: boolean, types?: string[]): Promise<void> {
    const name = (place.name as string) ?? '';
    const address = (place.formatted_address as string) ?? '';

    setSubmitting(value);

    const res = await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, address, isFriendly: value, ...(types ? { types } : {}) }),
    });

    addLocationToCache({ name, address, friendly: value, adminApproved: false });

    if (res.ok) {
      const data = await res.json();
      if (data.place) {
        addResolvedLocation({
          name,
          address,
          isFriendly: value,
          isApproved: false,
          place: data.place as ResolvedLocation['place'],
          city: data.city ?? '',
          suburb: data.suburb ?? null,
        });
      }
    }

    setSubmitted(value);
    setSubmitting(null);
  }

  return { submit, submitting, submitted };
}
