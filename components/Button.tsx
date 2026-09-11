import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'tertiary';
type Intent  = 'base' | 'info' | 'alert';

interface BaseProps {
  children: React.ReactNode;
  variant?: Variant;
  intent?: Intent;
  className?: string;
  disabled?: boolean;
}

interface ButtonProps extends BaseProps {
  href?: never;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

interface LinkProps extends BaseProps {
  href: string;
  onClick?: never;
  type?: never;
}

type Props = ButtonProps | LinkProps;

const BASE = 'inline-flex items-center justify-center gap-1.5 rounded-full text-[14px] font-bold font-[Arial,sans-serif] cursor-pointer transition-[opacity,filter] duration-150 disabled:opacity-40 disabled:cursor-default px-4 py-2 border select-none';

const GLOSS = 'shadow-[0_2px_0px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.35)] hover:enabled:brightness-110 active:enabled:brightness-90';
const OUTLINE = 'bg-white shadow-[0_2px_0px_rgba(0,0,0,0.10)] hover:enabled:brightness-95 font-normal';
const GHOST = 'bg-transparent border-transparent underline font-normal hover:enabled:opacity-70';

const STYLES: Record<Intent, Record<Variant, string>> = {
  base: {
    primary:   `${GLOSS} [background:linear-gradient(180deg,var(--color-btn-base-from),var(--color-btn-base-to))] border-[var(--color-btn-base-border)] text-[var(--color-btn-base-text)]`,
    secondary: `${OUTLINE} border-[var(--color-btn-base-border)] text-[var(--color-btn-base-muted)]`,
    tertiary:  `${GHOST} text-[var(--color-btn-base-muted)]`,
  },
  info: {
    primary:   `${GLOSS} [background:linear-gradient(180deg,var(--color-btn-info-from),var(--color-btn-info-to))] border-[var(--color-btn-info-border)] text-[var(--color-btn-info-text)]`,
    secondary: `${OUTLINE} border-[var(--color-btn-info-muted)] text-[var(--color-btn-info-muted)]`,
    tertiary:  `${GHOST} text-[var(--color-btn-info-muted)]`,
  },
  alert: {
    primary:   `${GLOSS} [background:linear-gradient(180deg,var(--color-btn-alert-from),var(--color-btn-alert-to))] border-[var(--color-btn-alert-border)] text-[var(--color-btn-alert-text)]`,
    secondary: `${OUTLINE} border-[var(--color-btn-alert-muted)] text-[var(--color-btn-alert-muted)]`,
    tertiary:  `${GHOST} text-[var(--color-btn-alert-muted)]`,
  },
};

export default function Button({
  children,
  variant = 'primary',
  intent = 'base',
  className = '',
  disabled,
  ...props
}: Props) {
  const cls = `${BASE} ${STYLES[intent][variant]} ${className}`.trim();

  if ('href' in props && props.href) {
    return <Link href={props.href} className={cls}>{children}</Link>;
  }

  const { onClick, type = 'button' } = props as ButtonProps;
  return (
    <button className={cls} onClick={onClick} disabled={disabled} type={type}>
      {children}
    </button>
  );
}
