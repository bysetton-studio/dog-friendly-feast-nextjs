type Intent = 'base' | 'alert';

interface Props {
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
  intent?: Intent;
  children: React.ReactNode;
}

const GLOSS = 'shadow-[0_2px_0px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.35)] hover:enabled:brightness-110 active:enabled:brightness-90';

const INTENTS: Record<Intent, string> = {
  base:  `${GLOSS} [background:linear-gradient(180deg,var(--color-btn-base-from),var(--color-btn-base-to))] border-btn-base-border text-btn-base-text`,
  alert: `${GLOSS} [background:linear-gradient(180deg,var(--color-btn-alert-from),var(--color-btn-alert-to))] border-btn-alert-border text-btn-alert-text`,
};

export default function IconButton({ onClick, disabled, 'aria-label': ariaLabel, className = '', style, intent = 'base', children }: Props) {
  return (
    <button
      className={`w-7 h-7 rounded-full border flex items-center justify-center cursor-pointer p-0 disabled:opacity-40 disabled:cursor-default ${INTENTS[intent]} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={style}
    >
      {children}
    </button>
  );
}
