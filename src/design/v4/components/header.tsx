import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface HeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Left slot — typically the current page title. Logo lives in Sidebar (not here). */
  title?: ReactNode;
  /** Optional brand slot (rarely used now that logo sits in sidebar). Left-most position when set. */
  brand?: ReactNode;
  /** Center slot (search or breadcrumb). Sits between title and actions. */
  center?: ReactNode;
  /** Right side: notifications, history, avatar, etc. */
  actions?: ReactNode;
  /** Sticky to viewport top. Default true. */
  sticky?: boolean;
}

/**
 * v4 Header — top app bar.
 *
 * Layout (left → right):
 *   [brand?] [title?] [center?] [actions?]
 *
 * Per Image 19/20 references, logo lives inside the Sidebar (top-left corner).
 * The Header carries the current page title on the left and icon buttons + avatar on the right.
 */
export function Header({ brand, title, center, actions, sticky = true, className, ...rest }: HeaderProps) {
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
      {title && (
        <div className="min-w-0 flex-1 flex items-center">
          {typeof title === 'string' || typeof title === 'number' ? (
            <h1 className="text-h6 font-semibold tracking-tight text-fg truncate">{title}</h1>
          ) : (
            title
          )}
        </div>
      )}
      {center && <div className="flex justify-center min-w-0">{center}</div>}
      {actions && (
        <div className={cn('flex items-center gap-snug shrink-0', !title && 'ml-auto')}>
          {actions}
        </div>
      )}
    </header>
  );
}
