'use client';

import { useState } from 'react';
import { TYPE_FILTERS } from './TypeFilter';
import './FriendlyTypeModal.css';

interface Props {
  placeName: string;
  onConfirm: (types: string[]) => void;
  onCancel: () => void;
}

export default function FriendlyTypeModal({ placeName, onConfirm, onCancel }: Props) {
  const [selected, setSelected] = useState(TYPE_FILTERS[0].key);

  function handleConfirm() {
    const filter = TYPE_FILTERS.find((f) => f.key === selected)!;
    onConfirm(filter.types.length > 0 ? filter.types : [selected]);
  }

  return (
    <div className="friendly-modal__backdrop" onClick={onCancel}>
      <div className="friendly-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="friendly-modal__title">What kind of place is this?</h2>
        <p className="friendly-modal__place">{placeName}</p>

        <div className="friendly-modal__options">
          {TYPE_FILTERS.map(({ key, label, emoji }) => (
            <button
              key={key}
              className={`friendly-modal__option${selected === key ? ' friendly-modal__option--selected' : ''}`}
              onClick={() => setSelected(key)}
            >
              <span className="friendly-modal__option-emoji">{emoji}</span>
              {label}
            </button>
          ))}
        </div>

        <div className="friendly-modal__actions">
          <button className="friendly-modal__cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="friendly-modal__confirm" onClick={handleConfirm}>
            🐾 Mark as Friendly
          </button>
        </div>
      </div>
    </div>
  );
}
