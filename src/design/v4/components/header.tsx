import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /** Brand/logo slot, left side. */
  brand?: ReactNode;
  /** Center search or breadcrumb slot. */
  center?: ReactNode;
  /** Right side: user menu, notifications, etc. */
  actions?: ReactNode;
  /** Sticky to viewport top. Default true. */
  sticky?: boolean;
}

/**
 * v4 Header — top app bar inside <header>. Composes with Sidebar via AppShell.
 *
 * @example
 *   <Header brand={<Logo />} center={<Search />} actions={<UserMenu />} />
 */
export function Header({ brand, center, actions, sticky = true, className, ...rest }: HeaderProps) {
  return (
    <header
      className={cn(
        'flex items-center gap-cozy h-[var(--header-h)] px-comfy',
        'bg-surface border-b border-outline-subtle z-header',
        sticky && 'sticky top-0',
        className,
      )}
      {...rest}
    >
      {brand && <div className="shrink-0">{brand}</div>}
      {center && <div className="flex-1 flex justify-center min-w-0">{center}</div>}
      {actions && <div className="ml-auto flex items-center gap-snug">{actions}</div>}
    </header>
  );
}
