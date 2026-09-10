'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { TYPE_FILTERS } from '@/components/TypeFilter';

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
  const [friendly, setFriendly] = useState(location.isFriendly);
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
      friendly !== location.isFriendly
        ? fetch(`/api/locations/${location.id}/friendly`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isFriendly: friendly }),
          })
        : Promise.resolve({ ok: true } as Response),
    ]);

    setSaving(false);
    if (typesRes.ok && friendlyRes.ok) {
      onSaved(types, friendly);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-200 p-4" onClick={onClose}>
      <div className="bg-[rgba(28,28,28,0.98)] border border-white/10 rounded-2xl pt-7 px-6 pb-6 w-full max-w-90 font-[Arial,sans-serif]" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[17px] font-semibold text-[#e0e0e0] mt-0 mb-1.5">Edit place</h2>
        <p className="text-[13px] text-[#9aa0a6] mt-0 mb-5 whitespace-nowrap overflow-hidden text-ellipsis">{location.name}</p>

        <p className="text-[11px] uppercase tracking-[0.7px] text-[#9aa0a6] mt-0 mb-2 font-[Arial,sans-serif]">Place type</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {TYPE_FILTERS.map(({ key, label, emoji }) => (
            <button
              key={key}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-[10px] border text-[14px] font-[Arial,sans-serif] cursor-pointer transition-[background,border-color,color] duration-[0.12s] text-left ${
                selected === key
                  ? 'border-[rgba(30,126,52,0.6)] bg-[rgba(30,126,52,0.15)] text-[#6fcf97]'
                  : 'border-white/8 bg-white/4 text-[#c0c0c0] hover:bg-white/8 hover:text-[#e0e0e0]'
              }`}
              onClick={() => setSelected(key)}
            >
              <span className="text-[16px] shrink-0">{emoji}</span>
              {label}
            </button>
          ))}
        </div>

        <p className="text-[11px] uppercase tracking-[0.7px] text-[#9aa0a6] mt-0 mb-2 font-[Arial,sans-serif]">Dog friendly?</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            className={`flex items-center gap-2 px-3 py-2.5 rounded-[10px] border text-[14px] font-[Arial,sans-serif] cursor-pointer transition-[background,border-color,color] duration-[0.12s] text-left ${
              friendly
                ? 'border-[rgba(30,126,52,0.6)] bg-[rgba(30,126,52,0.15)] text-[#6fcf97]'
                : 'border-white/8 bg-white/4 text-[#c0c0c0] hover:bg-white/8 hover:text-[#e0e0e0]'
            }`}
            onClick={() => setFriendly(true)}
          >
            <span className="text-[16px] shrink-0">🐾</span>
            Friendly
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2.5 rounded-[10px] border text-[14px] font-[Arial,sans-serif] cursor-pointer transition-[background,border-color,color] duration-[0.12s] text-left ${
              !friendly
                ? 'border-[rgba(255,80,80,0.5)] bg-[rgba(255,80,80,0.12)] text-[#f28b82]'
                : 'border-white/8 bg-white/4 text-[#c0c0c0] hover:bg-white/8 hover:text-[#e0e0e0]'
            }`}
            onClick={() => setFriendly(false)}
          >
            <span className="text-[16px] shrink-0">✕</span>
            Not friendly
          </button>
        </div>

        <div className="flex gap-2.5">
          <button
            className="flex-1 py-2.5 rounded-lg text-[14px] font-[Arial,sans-serif] cursor-pointer transition-[background] duration-[0.12s] bg-transparent border border-white/10 text-[#9aa0a6] hover:border-white/20 hover:text-[#e0e0e0]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2.5 rounded-lg text-[14px] font-[Arial,sans-serif] cursor-pointer transition-[background] duration-[0.12s] bg-[rgba(30,126,52,0.2)] border border-[rgba(30,126,52,0.4)] text-[#6fcf97] hover:bg-[rgba(30,126,52,0.3)]"
            onClick={handleSave}
            disabled={saving}
          >
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
            <span className="text-[14px] text-[#e0e0e0] font-medium whitespace-nowrap overflow-hidden text-ellipsis">{loc.name}</span>
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            {canEdit && (
              <button
                className="flex items-center justify-center w-5.5 h-5.5 rounded-md border border-white/10 bg-transparent text-[#9aa0a6] cursor-pointer opacity-0 group-hover/loc:opacity-100 transition-[opacity,background,color] duration-150 p-0 shrink-0 hover:bg-white/8 hover:text-[#e0e0e0]"
                onClick={() => setEditing(true)}
                aria-label="Edit type"
              >
                <Pencil size={12} strokeWidth={2.5} />
              </button>
            )}
            <span className={`text-[11px] py-0.5 px-2 rounded-full shrink-0 ${isFriendly ? 'bg-[rgba(30,126,52,0.15)] text-[#6fcf97]' : 'bg-[rgba(255,80,80,0.12)] text-[#f28b82]'}`}>
              {isFriendly ? '🐾 Friendly' : '✕ Not friendly'}
            </span>
          </span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <span className="text-[12px] text-[#9aa0a6] whitespace-nowrap overflow-hidden text-ellipsis">{loc.address}</span>
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
