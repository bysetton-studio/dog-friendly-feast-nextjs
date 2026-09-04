import './TypeFilter.css';

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
      <button
        className={`type-filter__chip${selected.size === 0 ? ' type-filter__chip--on' : ''}`}
        onClick={() => onChange(new Set())}
      >
        <span className="type-filter__label">All</span>
      </button>
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
