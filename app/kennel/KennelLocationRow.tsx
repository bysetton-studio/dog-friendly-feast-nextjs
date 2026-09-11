'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { TYPE_FILTERS } from '@/components/TypeFilter';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import RadioGroup from '@/components/RadioGroup';

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
  onSaved: (types: string[], isFriendly: boolean) => void;
}) {
  const [selected, setSelected] = useState(currentKey(location.types));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const filter = TYPE_FILTERS.find((f) => f.key === selected)!;
    const types = filter.types.length > 0 ? filter.types : [selected];

    const [typesRes, friendlyRes] = await Promise.all([
      fetch(`/api/locations/${location.id}/types`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ types }),
      }),
      fetch(`/api/locations/${location.id}/friendly`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isFriendly: true }),
          })
    ]);

    setSaving(false);
    if (typesRes.ok && friendlyRes.ok) {
      onSaved(types, true);
      onClose();
    }
  }

  return (
    <Modal open onClose={onClose} maxWidth="max-w-90">
        <h2 className="text-[17px] font-semibold text-fg mt-0 mb-1.5">Edit place</h2>
        <p className="text-[13px] text-fg-muted mt-0 mb-5 whitespace-nowrap overflow-hidden text-ellipsis">{location.name}</p>

        <p className="text-[11px] tracking-[0.7px] text-fg-muted mt-0 mb-2">Place type</p>
        <RadioGroup
          className="grid grid-cols-2 mb-5 gap-2"
          options={TYPE_FILTERS.map(({ key, label, emoji }) => ({
            value: key,
            label: <><span className="text-[16px] shrink-0">{emoji}</span>{label}</>,
          }))}
          value={selected}
          onChange={setSelected}
        />

        <div className="flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button intent="info" className="flex-1" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
    </Modal>
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
  const [isFriendly, setIsFriendly] = useState(loc.isFriendly);

  function handleSaved(newTypes: string[], newFriendly: boolean) {
    setTypes(newTypes);
    setIsFriendly(newFriendly);
    router.refresh();
  }

  return (
    <>
      <li className={`py-3 border-b border-white/6 flex flex-col gap-1 first:pt-0 last:border-b-0 last:pb-0${canEdit ? ' group/loc' : ''}`}>
        <div className="flex justify-between items-center gap-2">
          <span>
            <span className="text-[16px] shrink-0">{typeEmoji(types)}</span>
            <span className="inline-block w-2" />
            <span className="text-[14px] text-fg font-medium whitespace-nowrap overflow-hidden text-ellipsis">{loc.name}</span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            {canEdit && (
              <IconButton
                className="w-5.5! h-5! rounded-md! shrink-0 opacity-0 group-hover/loc:opacity-100 transition-opacity duration-150"
                onClick={() => setEditing(true)}
                aria-label="Edit type"
              >
                <Pencil size={12} strokeWidth={2.5} />
              </IconButton>
            )}
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-[12px] text-fg-muted whitespace-nowrap overflow-hidden text-ellipsis">{loc.address}</span>
        </div>
      </li>

      {editing && (
        <EditTypeModal
          location={{ ...loc, types, isFriendly }}
          onClose={() => setEditing(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
