'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { TYPE_FILTERS } from '@/components/TypeFilter';
import '@/components/FriendlyTypeModal.css';

interface Location {
  id: string;
  name: string;
  address: string;
  isFriendly: boolean;
  types: string[];
}

function typeEmoji(types: string[]): string {
  const match = TYPE_FILTERS.find(
    (f) => f.types.length > 0 && f.types.some((t) => types.includes(t))
  );
  return match ? match.emoji : '🦴';
}

function currentKey(types: string[]): string {
  const match = TYPE_FILTERS.find(
    (f) => f.types.length > 0 && f.types.some((t) => types.includes(t))
  );
  return match ? match.key : 'other';
}

function EditTypeModal({
  location,
  onClose,
  onSaved,
}: {
  location: Location;
  onClose: () => void;
  onSaved: (types: string[]) => void;
}) {
  const [selected, setSelected] = useState(currentKey(location.types));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const filter = TYPE_FILTERS.find((f) => f.key === selected)!;
    const types = filter.types.length > 0 ? filter.types : [selected];

    const res = await fetch(`/api/locations/${location.id}/types`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ types }),
    });

    setSaving(false);
    if (res.ok) {
      onSaved(types);
      onClose();
    }
  }

  return (
    <div className="friendly-modal__backdrop" onClick={onClose}>
      <div className="friendly-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="friendly-modal__title">Edit place type</h2>
        <p className="friendly-modal__place">{location.name}</p>

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
          <button className="friendly-modal__cancel" onClick={onClose}>Cancel</button>
          <button className="friendly-modal__confirm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  loc: Location;
  canEdit?: boolean;
}

export default function KennelLocationRow({ loc, canEdit = false }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [types, setTypes] = useState(loc.types);

  function handleSaved(newTypes: string[]) {
    setTypes(newTypes);
    router.refresh();
  }

  return (
    <>
      <li className={`kennel__location${canEdit ? ' kennel__location--editable' : ''}`}>
        <div className="kennel__location-main">
          <span>
            <span className="kennel__location-type-icon">{typeEmoji(types)}</span>
            <span className="kennel__location-icon-gap" />
            <span className="kennel__location-name">{loc.name}</span>
          </span>
          <span className="kennel__location-actions">
            <span className={`kennel__location-badge ${loc.isFriendly ? 'kennel__location-badge--friendly' : 'kennel__location-badge--not'}`}>
              {loc.isFriendly ? '🐾 Friendly' : '✕ Not friendly'}
            </span>
            {canEdit && (
              <button
                className="kennel__location-edit"
                onClick={() => setEditing(true)}
                aria-label="Edit type"
              >
                <Pencil size={12} strokeWidth={2.5} />
              </button>
            )}
          </span>
        </div>
        <div className="kennel__location-sub">
          <span className="kennel__location-address">{loc.address}</span>
        </div>
      </li>

      {editing && (
        <EditTypeModal
          location={{ ...loc, types }}
          onClose={() => setEditing(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
