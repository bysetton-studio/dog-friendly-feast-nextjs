interface Props {
  children: React.ReactNode;
  emoji?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const BASE = 'flex items-center gap-[6px] px-[14px] py-[6px] rounded-full border text-[13px] font-[Arial,sans-serif] select-none transition-[background,color,border-color] duration-150';
const OFF  = 'bg-surface/10 border-white/10 text-fg-muted cursor-pointer hover:border-surface-hover/65 hover:text-fg';
const ON   = 'bg-accent border-accent text-white font-semibold cursor-pointer';
const STATIC = 'bg-surface/10 border-white/10 text-fg-muted cursor-default';

export default function Chip({ children, emoji, selected, onClick, className = '' }: Props) {
  const interactive = onClick !== undefined;
  const stateCls = !interactive ? STATIC : selected ? ON : OFF;
  const cls = `${BASE} ${stateCls} ${className}`.trim();

  if (!interactive) {
    return (
      <span className={cls}>
        {emoji && <span className="text-[14px] leading-none">{emoji}</span>}
        <span className="leading-none">{children}</span>
      </span>
    );
  }

  return (
    <button type="button" className={cls} onClick={onClick}>
      {emoji && <span className="text-[14px] leading-none">{emoji}</span>}
      <span className="leading-none">{children}</span>
    </button>
  );
}
