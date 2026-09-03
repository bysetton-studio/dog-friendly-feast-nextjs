'use client';

import { useEffect, useRef } from 'react';
import { useSubmitLocation } from '@/hooks/useSubmitLocation';
import './SubmitBanner.css';
import type { Place } from '@/types';

interface Props {
  place: Place;
  onDismiss: () => void;
  inList: boolean;
}

export default function SubmitBanner({ place, onDismiss, inList }: Props) {
  const { submit, submitting, submitted } = useSubmitLocation();
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (submitted !== null) {
      dismissTimer.current = setTimeout(() => onDismiss?.(), 3000);
    }
    return () => { if (dismissTimer.current) clearTimeout(dismissTimer.current); };
  }, [submitted, onDismiss]);

  if (!place) return null;

  return (
    <div className="submit-banner">
      <div className="submit-banner__info">
        <span className="submit-banner__name">{place.name as string}</span>
        {!inList && (
          <span className="submit-banner__sub">Not in our list — is it dog friendly?</span>
        )}
      </div>

      {submitted !== null ? (
        <div className={`submit-banner__result submit-banner__result--${submitted ? 'friendly' : 'not'}`}>
          {submitted ? '🐾 Marked as friendly' : '✕ Marked as not friendly'}
        </div>
      ) : (
        <div className="submit-banner__actions">
          <button
            className="submit-banner__btn submit-banner__btn--friendly"
            onClick={() => submit(place, true)}
            disabled={submitting !== null}
          >
            {submitting === true ? <span className="submit-banner__spinner" /> : '🐾 Friendly'}
          </button>
          <button
            className="submit-banner__btn submit-banner__btn--not"
            onClick={() => submit(place, false)}
            disabled={submitting !== null}
          >
            {submitting === false ? <span className="submit-banner__spinner" /> : '✕ Not Friendly'}
          </button>
        </div>
      )}
    </div>
  );
}
