'use client';

import { useState } from 'react';
import { TYPE_FILTERS } from './TypeFilter';

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
    <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-200 p-4" onClick={onCancel}>
      <div className="bg-[rgba(28,28,28,0.98)] border border-white/10 rounded-2xl pt-7 px-6 pb-6 w-full max-w-90 font-[Arial,sans-serif]" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[17px] font-semibold text-[#e0e0e0] mt-0 mb-1.5">What kind of place is this?</h2>
        <p className="text-[13px] text-[#9aa0a6] mt-0 mb-5 whitespace-nowrap overflow-hidden text-ellipsis">{placeName}</p>

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

        <div className="flex gap-2.5">
          <button
            className="flex-1 py-2.5 rounded-lg text-[14px] font-[Arial,sans-serif] cursor-pointer transition-[background] duration-[0.12s] bg-transparent border border-white/10 text-[#9aa0a6] hover:border-white/20 hover:text-[#e0e0e0]"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2.5 rounded-lg text-[14px] font-[Arial,sans-serif] cursor-pointer transition-[background] duration-[0.12s] bg-[rgba(30,126,52,0.2)] border border-[rgba(30,126,52,0.4)] text-[#6fcf97] hover:bg-[rgba(30,126,52,0.3)]"
            onClick={handleConfirm}
          >
            🐾 Mark as Friendly
          </button>
        </div>
      </div>
    </div>
  );
}
