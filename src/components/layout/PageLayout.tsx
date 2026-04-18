import React from 'react';

interface PageLayoutProps {
  breadcrumb: { parent: string; current: string };
  title: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function PageLayout({
  breadcrumb,
  title,
  actions,
  children,
}: PageLayoutProps) {
  return (
    <div className="h-full flex flex-col py-6 lg:py-10 space-y-8 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">{breadcrumb.parent}</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">{breadcrumb.current}</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            {title}
          </h2>
        </div>
        {actions && (
          <div className="flex items-center gap-3">{actions}</div>
        )}
      </div>
      {children}
    </div>
  );
}
