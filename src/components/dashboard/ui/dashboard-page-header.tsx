import type { ReactNode } from 'react';

interface BreadcrumbItem {
  label: string;
  active?: boolean;
}

interface DashboardPageHeaderProps {
  breadcrumb: BreadcrumbItem[];
  title: string;
  accent: string;
  rightControls?: ReactNode;
}

export default function DashboardPageHeader({
  breadcrumb,
  title,
  accent,
  rightControls,
}: DashboardPageHeaderProps) {
  return (
    <section className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)] shrink-0">
      <div>
        <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
          {breadcrumb.map((item, index) => (
            <div key={`${item.label}-${index}`} className="flex items-center gap-2">
              <span className={item.active ? 'text-on-surface' : 'hover:text-primary cursor-pointer'}>
                {item.label}
              </span>
              {index < breadcrumb.length - 1 && (
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              )}
            </div>
          ))}
        </nav>
        <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
          {title} <span className="text-primary italic">{accent}</span>
        </h2>
      </div>
      {rightControls}
    </section>
  );
}
