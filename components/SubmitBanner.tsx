'use client';

import { useEffect, useRef, useState } from 'react';
import { useSubmitLocation } from '@/hooks/useSubmitLocation';
import FriendlyTypeModal from './FriendlyTypeModal';
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
    <div className="w-full max-w-82.5 bg-white border border-[#e8eaed] rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex-wrap">
      <div className="flex flex-col gap-0.5 min-w-0">
        {!inList && (
          <span className="text-sm font-semibold text-[#202124] whitespace-nowrap overflow-hidden text-ellipsis">Not in our list, is it dog friendly?</span>
        )}
        <span className="text-xs text-[#9aa0a6]">{place.name as string}</span>
      </div>

      {submitted !== null ? (
        <div className={`text-[13px] font-medium flex items-center gap-2.5 shrink-0 ${submitted ? 'text-[#1e7e34]' : 'text-[#c5221f]'}`}>
          🐾 Marked as friendly
        </div>
      ) : (
        <div className="flex gap-2 shrink-0">
          <button
            className="border-none rounded-lg py-1.75 px-3.5 text-[13px] font-medium cursor-pointer transition-opacity duration-150 hover:opacity-85 bg-[#e6f4ea] text-[#1e7e34]"
            onClick={() => setShowTypeModal(true)}
            disabled={submitting !== null}
          >
            {submitting === true ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin align-middle opacity-60" />
            ) : 'Add'}
          </button>
        </div>
      )}
    </div>
    </>
  );
}
