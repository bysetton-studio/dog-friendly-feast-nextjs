'use client';

import { useEffect, useRef, useState } from 'react';
import { useSubmitLocation } from '@/hooks/useSubmitLocation';
import FriendlyTypeModal from './FriendlyTypeModal';
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
  const [showTypeModal, setShowTypeModal] = useState(false);

  useEffect(() => {
    if (submitted !== null) {
      dismissTimer.current = setTimeout(() => onDismiss?.(), 3000);
    }
    return () => { if (dismissTimer.current) clearTimeout(dismissTimer.current); };
  }, [submitted, onDismiss]);

  if (!place) return null;

  return (
    <>
    {showTypeModal && (
      <FriendlyTypeModal
        placeName={place.name as string}
        onConfirm={(types) => { setShowTypeModal(false); submit(place, true, types); }}
        onCancel={() => setShowTypeModal(false)}
      />
    )}
    <div className="submit-banner">
      <div className="submit-banner__info">
        {!inList && (
          <span className="submit-banner__name">Not in our list, is it dog friendly?</span>
        )}
        <span className="submit-banner__sub">{place.name as string}</span>
      </div>

      {submitted !== null ? (
        <div className={`submit-banner__result submit-banner__result--${submitted ? 'friendly' : 'not'}`}>
          🐾 Marked as friendly
        </div>
      ) : (
        <div className="submit-banner__actions">
          <button
            className="submit-banner__btn submit-banner__btn--friendly"
            onClick={() => setShowTypeModal(true)}
            disabled={submitting !== null}
          >
            {submitting === true ? <span className="submit-banner__spinner" /> : 'Add'}
          </button>
        </div>
      )}
    </div>
    </>
  );
}
