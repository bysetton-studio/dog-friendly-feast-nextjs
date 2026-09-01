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
    const next = new Set(selected);
    next.has(key) ? next.delete(key) : next.add(key);
    onChange(next);
  }

  return (
    <div className="type-filter">
      {TYPE_FILTERS.map(({ key, label, emoji }) => {
        const checked = selected.has(key);
        return (
          <label key={key} className={`type-filter__chip${checked ? ' type-filter__chip--on' : ''}`}>
            <input
              type="checkbox"
              className="type-filter__input"
              checked={checked}
              onChange={() => toggle(key)}
            />
            <span className="type-filter__emoji">{emoji}</span>
            <span className="type-filter__label">{label}</span>
          </label>
        );
      })}
    </div>
  );
}
