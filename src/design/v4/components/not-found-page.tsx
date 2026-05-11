import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface NotFoundPageProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Action slot (e.g. Button to go home). */
  action?: ReactNode;
  /** Optional extra content above the action. */
  children?: ReactNode;
  className?: string;
}

/**
 * v4 NotFoundPage — full-viewport 404 layout with orange glow accent.
 *
 * @example
 *   <NotFoundPage action={<Button onClick={goHome}>Back to Dashboard</Button>} />
 */
export function NotFoundPage({
  title = '404',
  description = 'The page you are looking for does not exist or has been moved.',
  action,
  children,
  className,
}: NotFoundPageProps) {
  return (
    <div className={cn('min-h-[80vh] flex flex-col items-center justify-center px-comfy text-center', className)}>
      <div
        aria-hidden="true"
        className="text-display font-semibold tracking-tighter text-fg"
        style={{ textShadow: '0 0 60px color-mix(in srgb, var(--brand-500) 50%, transparent)' }}
      >
        {title}
      </div>
      <p className="mt-cozy max-w-cozy text-body text-fg-muted">{description}</p>
      {children && <div className="mt-cozy">{children}</div>}
      {action && <div className="mt-comfy">{action}</div>}
    </div>
  );
}
