import './TypeFilter.css';

export interface TypeFilterOption {
  key: string;
  label: string;
  emoji: string;
  types: string[];
}

export const TYPE_FILTERS: TypeFilterOption[] = [
  { key: 'restaurant', label: 'Restaurant', emoji: '🍔', types: ['restaurant'] },
  { key: 'cafe',       label: 'Cafe',       emoji: '☕', types: ['cafe', 'bakery'] },
  { key: 'bar',        label: 'Bar',        emoji: '🍺', types: ['bar', 'night_club'] },
  { key: 'shop',       label: 'Shop',       emoji: '🛍️', types: ['store', 'shopping_mall', 'supermarket', 'convenience_store'] },
  { key: 'park',       label: 'Park',       emoji: '🌳', types: ['park'] },
];

interface Props {
  selected: Set<string>;
  onChange: (types: Set<string>) => void;
}

export default function TypeFilter({ selected, onChange }: Props) {
  function toggle(key: string): void {
    // TODO
  }

  return (
    <div className="type-filter">
      {/* TODO: chips */}
    </div>
  );
}
