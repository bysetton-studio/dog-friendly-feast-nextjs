'use client';

import { useState } from 'react';
import { TYPE_FILTERS } from './TypeFilter';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import RadioGroup from '@/components/RadioGroup';

interface Props {
  placeName: string;
  onConfirm: (types: string[], name: string) => void;
  onCancel: () => void;
}

export default function FriendlyTypeModal({ placeName, onConfirm, onCancel }: Props) {
  const [selected, setSelected] = useState(TYPE_FILTERS[0].key);
  const [name, setName] = useState(placeName);

  function handleConfirm() {
    const filter = TYPE_FILTERS.find((f) => f.key === selected)!;
    onConfirm(filter.types.length > 0 ? filter.types : [selected], name.trim() || placeName);
  }

  return (
    <Modal open onClose={onCancel} maxWidth="max-w-90">
      <h2 className="text-[17px] font-semibold text-fg mt-0 mb-1.5">What kind of place is this?</h2>

      <p className="text-[11px] tracking-[0.7px] text-fg-muted mt-0 mb-1.5">Name</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full mb-5 px-3 py-2 text-[14px] text-fg bg-white border border-ink-border rounded-lg outline-none transition-colors"
      />

      <p className="text-[11px] tracking-[0.7px] text-fg-muted mt-0 mb-2">Place type</p>
      <RadioGroup
        className="grid grid-cols-2 gap-2 mb-5"
        options={TYPE_FILTERS.map(({ key, label, emoji }) => ({
          value: key,
          label: <><span className="text-[16px] shrink-0">{emoji}</span>{label}</>,
        }))}
        value={selected}
        onChange={setSelected}
      />

      <div className="flex gap-2.5">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button intent="info" className="flex-1" onClick={handleConfirm}>Add</Button>
      </div>
    </Modal>
  );
}
