import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Optional breadcrumb trail above the title. */
  breadcrumbs?: BreadcrumbItem[];
  /** Right-aligned action slot (Buttons, filters, etc.). */
  actions?: ReactNode;
  /** Apply bottom divider. Default true. */
  bordered?: boolean;
}

/**
 * v4 PageHeader — composition slot for page-level titling.
 *
 * @example
 *   <PageHeader
 *     title="Dashboard"
 *     subtitle="Last updated 2 min ago"
 *     breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
 *     actions={<><Button>Export</Button><Button>+ New</Button></>}
 *   />
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  bordered = true,
  className,
  ...rest
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-sm pb-lg',
        bordered && 'border-b border-outline-subtle mb-lg',
        className,
      )}
      {...rest}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-xs text-caption text-fg-subtle">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            const content = isLast ? (
              <span aria-current="page" className="text-fg-muted">
                {crumb.label}
              </span>
            ) : crumb.href ? (
              <a href={crumb.href} className="hover:text-fg-muted transition-colors duration-fast">
                {crumb.label}
              </a>
            ) : (
              <button
                type="button"
                onClick={crumb.onClick}
                className="hover:text-fg-muted transition-colors duration-fast"
              >
                {crumb.label}
              </button>
            );
            return (
              <span key={i} className="inline-flex items-center gap-xs">
                {content}
                {!isLast && <span aria-hidden="true">›</span>}
              </span>
            );
          })}
        </nav>
      )}
      <div className="flex items-start justify-between gap-lg">
        <div className="min-w-0">
          <h1 className="text-h3 font-semibold tracking-tight text-fg truncate">{title}</h1>
          {subtitle && <p className="mt-xs text-body-sm text-fg-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-sm">{actions}</div>}
      </div>
    </header>
  );
}
