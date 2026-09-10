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

  const chipBase = 'flex items-center gap-[6px] px-[14px] py-[6px] rounded-full bg-[rgba(30,30,30,0.7)] border border-white/10 text-[#9aa0a6] text-[13px] font-[Arial,sans-serif] cursor-pointer select-none transition-[background,color,border-color] duration-150 hover:bg-[rgba(50,50,50,0.85)] hover:text-[#e0e0e0]';
  const chipOn = 'bg-[#1a73e8] border-[#1a73e8] text-white font-semibold';

  return (
    <div className="flex flex-wrap gap-2 justify-center w-full max-w-145.5">
      <button
        className={`${chipBase}${selected.size === 0 ? ` ${chipOn}` : ''}`}
        onClick={() => onChange(new Set())}
      >
        <span className="leading-none">All</span>
      </button>
      {TYPE_FILTERS.map(({ key, label, emoji }) => {
        const checked = selected.has(key);
        return (
          <label key={key} className={`${chipBase}${checked ? ` ${chipOn}` : ''}`}>
            <input
              type="checkbox"
              className="hidden"
              checked={checked}
              onChange={() => toggle(key)}
            />
            <span className="text-[14px] leading-none">{emoji}</span>
            <span className="leading-none">{label}</span>
          </label>
        );
      })}
    </div>
  );
}
