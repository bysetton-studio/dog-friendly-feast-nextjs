'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import LocationSearch from '@/components/LocationSearch';
import { useSubmitLocation } from '@/hooks/useSubmitLocation';
import { useLocations } from '@/hooks/useLocations';
import './add.css';
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
    <main className="add-page">
      <Link href="/" className="add-page__back">← Back to map</Link>

      <div className="add-page__header">
        <h1 className="add-page__title">Add a dog-friendly restaurant</h1>
        <p className="add-page__subtitle">
          Search for a restaurant below, then tell us whether dogs are welcome.
          Submissions are reviewed before going live.
        </p>
      </div>

      <LocationSearch onSelect={setSelected} mapRef={mapRef} />

      {selected && (
        <div className="add-page__card">
          <div className="add-page__place">
            <span className="add-page__place-name">{selected.name}</span>
            <span className="add-page__place-address">{selected.formatted_address}</span>
          </div>

          {alreadyListed ? (
            <div className="add-page__already-listed">
              ✓ This location is already in our directory.{' '}
              <Link href="/">View it on the map →</Link>
            </div>
          ) : submitted !== null ? (
            <div className={`add-page__confirm add-page__confirm--${submitted ? 'yes' : 'no'}`}>
              {submitted
                ? '🐾 Submitted as dog-friendly — thanks!'
                : '✕ Submitted as not dog-friendly — thanks!'}
              <button className="add-page__change" onClick={() => { setSelected(null); }}>
                Add another
              </button>
            </div>
          ) : (
            <div className="add-page__question">
              <p className="add-page__question-label">Is this restaurant dog-friendly?</p>
              <div className="add-page__actions">
                <button
                  className="add-page__btn add-page__btn--yes"
                  onClick={() => submit(selected, true)}
                  disabled={submitting !== null}
                >
                  {submitting === true ? '...' : '🐾 Yes, dogs are welcome'}
                </button>
                <button
                  className="add-page__btn add-page__btn--no"
                  onClick={() => submit(selected, false)}
                  disabled={submitting !== null}
                >
                  {submitting === false ? '...' : '✕ No, dogs are not allowed'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!selected && (
        <p className="add-page__hint">
          Know a spot that allows dogs? Search for it above and let us know.
        </p>
      )}
    </main>
  );
}
