interface Option {
  value: string;
  label: React.ReactNode;
}

interface Props {
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  /** Replaces the default wrapper layout. Defaults to "flex flex-wrap gap-2". */
  className?: string;
}

const SELECTED = 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] bg-btn-base-to/30 border-btn-base-border text-btn-base-text font-bold';
const UNSELECTED = 'bg-white shadow-[0_2px_0px_rgba(0,0,0,0.10)] border-btn-base-border text-btn-base-muted hover:brightness-95';

export default function RadioGroup({ options, value, onChange, className = 'flex flex-wrap gap-2' }: Props) {
  return (
    <div className={className}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`inline-flex items-center justify-center gap-1.5 rounded-full text-[14px] font-[Arial,sans-serif] cursor-pointer px-4 py-2 border select-none transition-[box-shadow,background,filter] duration-150 ${opt.value === value ? SELECTED : UNSELECTED}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
