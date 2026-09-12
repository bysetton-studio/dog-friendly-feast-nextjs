'use client';

import { useRef, useState } from 'react';
import { TYPE_FILTERS } from './TypeFilter';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import RadioGroup from '@/components/RadioGroup';

interface Props {
  title: string;
  initialName: string;
  initialTypeKey?: string;
  confirmLabel: string;
  onConfirm: (types: string[], name: string) => void | Promise<void>;
  onCancel: () => void;
}

export default function EditLocationModal({ title, initialName, initialTypeKey, confirmLabel, onConfirm, onCancel }: Props) {
  const [name, setName] = useState(initialName);
  const [selected, setSelected] = useState(initialTypeKey ?? TYPE_FILTERS[0].key);
  const [confirming, setConfirming] = useState(false);
  const mounted = useRef(true);

  async function handleConfirm() {
    const filter = TYPE_FILTERS.find((f) => f.key === selected)!;
    const types = filter.types.length > 0 ? filter.types : [selected];
    setConfirming(true);
    try {
      await onConfirm(types, name.trim() || initialName);
    } finally {
      if (mounted.current) setConfirming(false);
    }
  }

  return (
    <Modal open onClose={onCancel} maxWidth="max-w-90">
      <h2 className="text-[17px] font-semibold text-fg mt-0 mb-4">{title}</h2>

      <p className="text-[11px] tracking-[0.7px] text-fg-muted mt-0 mb-1.5">Name</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full mb-1.5 px-3 py-2 text-[14px] text-fg bg-white border border-ink-border rounded-lg outline-none transition-colors"
      />
      <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5 mt-0 mb-5 items-center gap-1.5">
        <span>⚠️</span> Name auto-filled, <span className="font-bold">double check</span> it looks right before submitting.
      </p>

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
        <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={confirming}>Cancel</Button>
        <Button intent="info" className="flex-1" onClick={handleConfirm} disabled={confirming}>
          {confirming ? 'Saving…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
