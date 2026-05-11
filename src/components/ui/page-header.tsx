import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  /** Optional icon (Lucide or custom) — sized to 16px. */
  icon?: ReactNode;
}

export interface PageHeaderProps extends HTMLAttributes<HTMLElement> {
  /** Optional breadcrumb trail. Last item is rendered as current page (no link). */
  breadcrumb?: BreadcrumbItem[];
  /** Plain title. The italic accent word is appended via `accent`. */
  title: string;
  /** Italic accent word/phrase appended after `title`. Phase 1 audit signature. */
  accent?: string;
  /** Sub-line under the title. */
  description?: string;
  /** Right-side slot for action buttons / filters. */
  actions?: ReactNode;
}

/**
 * PageHeader v2 — Phase 4 component library.
 *
 * Signature pattern from Phase 1 audit (only 2/8 pages had it). Rebuilt as one canonical block.
 * Italic accent word is the brand signature (e.g., "Daily *Sync*" / "Lead *Tracker*").
 *
 * @example
 * <PageHeader
 *   breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'OKRs' }]}
 *   title="Q2 Objectives & "
 *   accent="Key Results"
 *   description="Quarterly OKR tracking — drag to reorder."
 *   actions={<Button>Add Objective</Button>}
 * />
 */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  ({ breadcrumb, title, accent, description, actions, className = '', ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={[
          'flex flex-col gap-3 pb-6 border-b border-outline-variant/50',
          'md:flex-row md:items-end md:justify-between md:gap-6',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <div className="flex flex-col gap-2 min-w-0">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1 text-[length:var(--text-caption)] text-on-surface-variant">
                {breadcrumb.map((item, idx) => {
                  const isLast = idx === breadcrumb.length - 1;
                  return (
                    <li key={idx} className="flex items-center gap-1">
                      {item.icon && <span aria-hidden="true" className="[&>svg]:size-3.5">{item.icon}</span>}
                      {item.href && !isLast ? (
                        <a
                          href={item.href}
                          className="hover:text-on-surface motion-fast ease-standard transition-colors rounded-sm focus-visible:outline-none"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'font-medium text-on-surface' : ''}>
                          {item.label}
                        </span>
                      )}
                      {!isLast && <ChevronRight aria-hidden="true" className="size-3 text-outline-variant" />}
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}

          <h1 className="font-headline text-[length:var(--text-h2)] leading-tight text-on-surface tracking-[var(--tracking-tight)]">
            {title}
            {accent && <em className="font-medium text-primary italic">{accent}</em>}
          </h1>

          {description && (
            <p className="text-[length:var(--text-body-sm)] text-on-surface-variant leading-snug max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </header>
    );
  },
);

PageHeader.displayName = 'PageHeader';
