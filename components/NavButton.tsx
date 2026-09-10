import Link from 'next/link';

interface BaseProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'danger';
}

interface LinkProps extends BaseProps {
  href: string;
  onClick?: never;
  disabled?: never;
  type?: never;
}

interface ButtonProps extends BaseProps {
  href?: never;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

type Props = LinkProps | ButtonProps;

const BASE =
  'text-white text-[15px] font-[Arial,sans-serif] tracking-[0.3px] bg-surface/85 px-3.5 py-2 rounded-full leading-none inline-flex items-center transition-colors duration-150 cursor-pointer border-none';

const VARIANTS = {
  default: 'text-surface-fg-muted hover:text-surface-fg',
  danger:  'text-unfriendly hover:text-surface-fg',
};

export default function NavButton({ children, className = '', variant = 'default', ...props }: Props) {
  const cls = `${BASE} ${VARIANTS[variant]} ${className}`.trim();

  if ('href' in props && props.href) {
    return <Link href={props.href} className={cls}>{children}</Link>;
  }

  const { onClick, disabled, type = 'button' } = props as ButtonProps;
  return (
    <button className={cls} onClick={onClick} disabled={disabled} type={type}>
      {children}
    </button>
  );
}
