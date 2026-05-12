import type { HTMLAttributes, ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../lib/cn';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Optional title. If the global Header already renders the page title (V4Shell case),
   *  omit this and use `subtitle` + `actions` only. */
  title?: ReactNode;
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
        'flex flex-col gap-snug pb-comfy',
        bordered && 'border-b border-outline-subtle mb-comfy',
        className,
      )}
      {...rest}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-tight text-caption text-fg-subtle">
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
              <span key={i} className="inline-flex items-center gap-tight">
                {content}
                {!isLast && <ChevronRight size={12} aria-hidden="true" />}
              </span>
            );
          })}
        </nav>
      )}
      <div className="flex items-center justify-between gap-comfy">
        {(title || subtitle) ? (
          <div className="min-w-0">
            {title && <h1 className="text-h3 font-semibold tracking-tight text-fg truncate">{title}</h1>}
            {subtitle && <p className={cn(title && 'mt-tight', 'text-body-sm text-fg-muted')}>{subtitle}</p>}
          </div>
        ) : (
          <span aria-hidden="true" />
        )}
        {actions && <div className="flex shrink-0 items-center gap-snug">{actions}</div>}
      </div>
    </header>
  );
}
