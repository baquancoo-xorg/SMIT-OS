import type { ReactNode } from 'react';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { Button } from './button';

export interface NotFoundPageProps {
  /** Heading. Default: "Page not found". */
  title?: string;
  /** Description. Default helpful copy. */
  description?: string;
  /** Optional ROUTE the user attempted (shown in copy). */
  attemptedPath?: string;
  /** Primary action. Default: link to "/". */
  primaryAction?: ReactNode;
  /** Secondary action. Default: "Go back" (history.back). */
  secondaryAction?: ReactNode;
  className?: string;
}

/**
 * NotFoundPage v2 — full-page 404 with Bento decorative blob.
 *
 * Use as the route element for catch-all routes. Caller can override actions
 * to integrate with the app router.
 *
 * @example
 * // React Router:
 * <Route path="*" element={<NotFoundPage primaryAction={<Link to="/"><Button>Home</Button></Link>} />} />
 */
export function NotFoundPage({
  title = 'Page not found',
  description,
  attemptedPath,
  primaryAction,
  secondaryAction,
  className = '',
}: NotFoundPageProps) {
  const desc =
    description ??
    (attemptedPath
      ? `We couldn't find anything at "${attemptedPath}". The link may be broken or the page may have moved.`
      : "We couldn't find that page. The link may be broken or the page may have moved.");

  return (
    <div
      className={[
        'relative flex min-h-[calc(100dvh-var(--header-h))] items-center justify-center overflow-hidden p-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 size-[36rem] rounded-full bg-primary-container/30 blur-3xl"
        style={{ top: '-10%', right: '-10%' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 size-[28rem] rounded-full bg-secondary-container/30 blur-3xl"
        style={{ bottom: '-10%', left: '-10%' }}
      />

      <div className="relative flex max-w-lg flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-card bg-surface-container text-on-surface-variant [&>svg]:size-7">
          <Compass aria-hidden="true" />
        </div>

        <p className="font-headline text-[length:var(--text-display)] font-bold leading-none text-primary">404</p>
        <h1 className="font-headline text-[length:var(--text-h3)] font-bold tracking-[var(--tracking-tight)] text-on-surface">
          {title}
        </h1>
        <p className="text-[length:var(--text-body)] text-on-surface-variant leading-snug">{desc}</p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {primaryAction ?? (
            <Button
              variant="primary"
              iconLeft={<Home />}
              onClick={() => {
                window.location.href = '/';
              }}
            >
              Go to dashboard
            </Button>
          )}
          {secondaryAction ?? (
            <Button
              variant="ghost"
              iconLeft={<ArrowLeft />}
              onClick={() => window.history.back()}
            >
              Go back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

NotFoundPage.displayName = 'NotFoundPage';
