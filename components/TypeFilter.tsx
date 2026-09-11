export interface TypeFilterOption {
  key: string;
  label: string;
  emoji: string;
  types: string[];
}

export const TYPE_FILTERS: TypeFilterOption[] = [
  { key: 'restaurant', label: 'Restaurant', emoji: '🍔', types: ['restaurant'] },
  { key: 'cafe',       label: 'Cafe',       emoji: '☕', types: ['cafe'] },
  { key: 'bar',        label: 'Bar',        emoji: '🍺', types: ['bar'] },
  { key: 'shop',       label: 'Shop',       emoji: '🛍️', types: ['shopping_mall', 'supermarket', 'convenience_store'] },
  { key: 'park',       label: 'Park',       emoji: '🌳', types: ['park'] },
  { key: 'other',      label: 'Other',      emoji: '🦴', types: [] },
];
import Chip from '@/components/Chip';

interface Props {
  selected: Set<string>;
  onChange: (types: Set<string>) => void;
}

export default function TypeFilter({ selected, onChange }: Props) {
  function toggle(key: string): void {
    const next = new Set(selected);
    next.has(key) ? next.delete(key) : next.add(key);
    onChange(next);
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center w-full max-w-145.5">
      <Chip selected={selected.size === 0} onClick={() => onChange(new Set())}>All</Chip>
      {TYPE_FILTERS.map(({ key, label, emoji }) => (
        <Chip key={key} emoji={emoji} selected={selected.has(key)} onClick={() => toggle(key)}>
          {label}
        </Chip>
      ))}
    </div>
  );
}
