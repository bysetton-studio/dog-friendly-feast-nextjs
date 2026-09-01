'use client';

import { useEffect, useRef, useState } from 'react';
import { addLocationToCache } from '@/hooks/useLocations';
import './SubmitBanner.css';
import type { Place } from '@/types';

const STORAGE_KEY = 'dff_submissions';
const SHEET_URL = process.env.NEXT_PUBLIC_SHEET_URL!;

interface Submission {
  name: string;
  address: string;
  submission: boolean;
}

interface Props {
  place: Place;
  onDismiss: () => void;
  inList: boolean;
}

function getSubmissions(): Record<string, Submission> {
  // TODO
  return {};
}

function saveSubmissionLocally(placeId: string, place: Place, submission: boolean): void {
  // TODO
}

export function submitToSheet(place: Place, submission: boolean): Promise<void> {
  // TODO
  return Promise.resolve();
}

export function getExistingSubmission(placeId: string): Submission | null {
  // TODO
  return null;
}

export default function SubmitBanner({ place, onDismiss, inList }: Props) {
  const placeId = (place as google.maps.places.PlaceResult).place_id;
  const existing = placeId ? getExistingSubmission(placeId) : null;
  const [submission, setSubmission] = useState<boolean | null>(existing?.submission ?? null);
  const [submitting, setSubmitting] = useState<boolean | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (dismissTimer.current) clearTimeout(dismissTimer.current); };
  }, []);

  if (!place) return null;

  async function handleSubmit(value: boolean): Promise<void> {
    // TODO
  }

  return (
    <div className="submit-banner">
      <div className="submit-banner__info">
        <span className="submit-banner__name">
          {(place as google.maps.places.PlaceResult).name}
        </span>
        {!inList && (
          <span className="submit-banner__sub">Not in our list — is it dog friendly?</span>
        )}
      </div>

      {submission !== null ? (
        <div className={`submit-banner__result submit-banner__result--${submission ? 'friendly' : 'not'}`}>
          {submission ? '🐾 Marked as friendly' : '✕ Marked as not friendly'}
        </div>
      ) : (
        <div className="submit-banner__actions">
          <button
            className="submit-banner__btn submit-banner__btn--friendly"
            onClick={() => handleSubmit(true)}
            disabled={submitting !== null}
          >
            {submitting === true ? <span className="submit-banner__spinner" /> : '🐾 Friendly'}
          </button>
          <button
            className="submit-banner__btn submit-banner__btn--not"
            onClick={() => handleSubmit(false)}
            disabled={submitting !== null}
          >
            {submitting === false ? <span className="submit-banner__spinner" /> : '✕ Not Friendly'}
          </button>
        </div>
      )}
    </div>
  );
}
