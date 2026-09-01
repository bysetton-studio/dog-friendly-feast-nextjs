import { useState } from 'react';
import { addLocationToCache } from '@/hooks/useLocations';
import type { Place } from '@/types';

export function useSubmitLocation() {
  const [submitting, setSubmitting] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState<boolean | null>(null);

  async function submit(place: Place, value: boolean): Promise<void> {
    const p = place as google.maps.places.PlaceResult;
    const name = p.name ?? '';
    const address = p.formatted_address ?? '';

    setSubmitting(value);

    await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, address, isFriendly: value }),
    });

    addLocationToCache({ name, address, friendly: value, adminApproved: false });
    setSubmitted(value);
    setSubmitting(null);
  }

  return { submit, submitting, submitted };
}
