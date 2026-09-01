import { useState } from 'react';
import { addLocationToCache } from '@/hooks/useLocations';
import type { Place } from '@/types';

const SHEET_URL = process.env.NEXT_PUBLIC_SHEET_URL!;

function submitJSONP(place: Place, submission: boolean): Promise<void> {
  const p = place as google.maps.places.PlaceResult;
  return new Promise((resolve) => {
    const callbackName = `submit_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const params = new URLSearchParams({
      action: 'submit',
      name: p.name ?? '',
      address: p.formatted_address ?? '',
      submission: String(submission),
      adminApproved: 'false',
      callback: callbackName,
    });

    (window as unknown as Record<string, unknown>)[callbackName] = () => {
      resolve();
      delete (window as unknown as Record<string, unknown>)[callbackName];
      script.remove();
    };

    script.src = `${SHEET_URL}?${params}`;
    script.onerror = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      script.remove();
      resolve();
    };
    document.head.appendChild(script);
  });
}

export function useSubmitLocation() {
  const [submitting, setSubmitting] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState<boolean | null>(null);

  async function submit(place: Place, value: boolean): Promise<void> {
    setSubmitting(value);
    await submitJSONP(place, value);
    const p = place as google.maps.places.PlaceResult;
    addLocationToCache({
      name: p.name ?? '',
      address: p.formatted_address ?? '',
      friendly: value,
      adminApproved: false,
    });
    setSubmitted(value);
    setSubmitting(null);
  }

  return { submit, submitting, submitted };
}
