'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import LocationSearch from '@/components/LocationSearch';
import { useSubmitLocation } from '@/hooks/useSubmitLocation';
import { useLocations } from '@/hooks/useLocations';
import Button from '@/components/Button';
import type { Place } from '@/types';

export default function AddLocationPage() {
  const mapRef = useRef<unknown>(null);
  const [selected, setSelected] = useState<Place | null>(null);
  const { submit, submitting, submitted } = useSubmitLocation();
  const { locations } = useLocations();

  const alreadyListed = selected
    ? locations.some((l) => l.name.toLowerCase() === ((selected.name as string) ?? '').toLowerCase())
    : false;

  return (
    <main className="max-w-155 mx-auto px-6 pt-15 pb-20 font-sans flex flex-col items-center gap-6">
      <Link href="/" className="self-start text-sm text-fg-muted no-underline hover:text-fg">← Back to map</Link>

      <div className="text-center">
        <h1 className="text-[32px] font-normal text-fg m-0 mb-3">Add a dog-friendly restaurant</h1>
        <p className="text-[15px] text-fg-muted leading-[1.6] m-0">
          Search for a restaurant below, then tell us whether dogs are welcome.
          Submissions are reviewed before going live.
        </p>
      </div>

      <LocationSearch onSelect={setSelected} mapRef={mapRef} />

      {selected && (
        <div className="w-full bg-white rounded-2xl px-6 py-5 shadow-[0_2px_12px_rgba(0,0,0,0.12)] flex flex-col gap-5">
          <div className="flex flex-col gap-1 border-b border-b-ink-dim pb-4">
            <span className="text-[20px] font-semibold text-ink">{selected.name}</span>
            <span className="text-[13px] text-ink-soft">{selected.formatted_address}</span>
          </div>

          {alreadyListed ? (
            <div className="text-sm text-friendly-dark bg-friendly-light rounded-lg px-4 py-3 [&_a]:text-accent [&_a]:underline">
              ✓ This location is already in our directory.{' '}
              <Link href="/">View it on the map →</Link>
            </div>
          ) : submitted !== null ? (
            <div className={`text-[15px] font-medium flex items-center justify-between gap-3 flex-wrap ${submitted ? 'text-friendly-dark' : 'text-unfriendly-dark'}`}>
              {submitted
                ? '🐾 Submitted as dog-friendly — thanks!'
                : '✕ Submitted as not dog-friendly — thanks!'}
              <Button variant="secondary" className="ml-auto" onClick={() => { setSelected(null); }}>Add another</Button>
            </div>
          ) : (
            <div>
              <p className="text-[15px] font-medium text-ink m-0 mb-3.5">Is this restaurant dog-friendly?</p>
              <div className="flex flex-col gap-2.5">
                <Button intent="info" className="w-full" onClick={() => submit(selected, true)} disabled={submitting !== null}>
                  {submitting === true ? '...' : '🐾 Yes, dogs are welcome'}
                </Button>
                <Button intent="alert" className="w-full" onClick={() => submit(selected, false)} disabled={submitting !== null}>
                  {submitting === false ? '...' : '✕ No, dogs are not allowed'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {!selected && (
        <p className="text-sm text-fg-muted text-center m-0">
          Know a spot that allows dogs? Search for it above and let us know.
        </p>
      )}
    </main>
  );
}
