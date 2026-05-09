import type { ReactNode } from 'react';

interface DashboardPageHeaderProps {
  title: string;
  accent: string;
  rightControls?: ReactNode;
}

// Breadcrumb is owned by the topbar (Header.tsx). Page header renders only the H1.
export default function DashboardPageHeader({
  title,
  accent,
  rightControls,
}: DashboardPageHeaderProps) {
  return (
    <section className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)] shrink-0">
      <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
        {title} <span className="text-primary italic">{accent}</span>
      </h2>
      {rightControls}
    </section>
  );
}
