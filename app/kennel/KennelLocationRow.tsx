'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { TYPE_FILTERS } from '@/components/TypeFilter';
import IconButton from '@/components/IconButton';
import EditLocationModal from '@/components/EditLocationModal';

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

interface Props {
  loc: Location;
  canEdit?: boolean;
}

export default function KennelLocationRow({ loc, canEdit = false }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [types, setTypes] = useState(loc.types);
  const [name, setName] = useState(loc.name);

  async function handleConfirm(newTypes: string[], newName: string) {
    await Promise.all([
      fetch(`/api/locations/${loc.id}/types`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ types: newTypes }),
      }),
      fetch(`/api/locations/${loc.id}/name`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      }),
      fetch(`/api/locations/${loc.id}/friendly`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFriendly: true }),
      }),
    ]);
    setTypes(newTypes);
    setName(newName);
    setEditing(false);
    router.refresh();
  }

  return (
    <>
      <li className={`py-3 border-b border-white/6 flex flex-col gap-1 first:pt-0 last:border-b-0 last:pb-0${canEdit ? ' group/loc' : ''}`}>
        <div className="flex justify-between items-center gap-2">
          <span className="overflow-hidden text-ellipsis flex">
            <span className="text-[16px] shrink-0">{typeEmoji(types)}</span>
            <span className="inline-block w-2" />
            <span className="text-[14px] text-fg font-medium whitespace-nowrap overflow-hidden text-ellipsis">{name}</span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            {canEdit && (
              <IconButton
                className="w-5.5! h-5! rounded-md! shrink-0 opacity-100 sm:opacity-0 sm:group-hover/loc:opacity-100 transition-opacity duration-150"
                onClick={() => setEditing(true)}
                aria-label="Edit location"
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
        <EditLocationModal
          title="Edit place"
          initialName={name}
          initialTypeKey={currentKey(types)}
          confirmLabel="Save"
          onConfirm={handleConfirm}
          onCancel={() => setEditing(false)}
        />
      )}
    </>
  );
}
