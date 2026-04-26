import type { ReactNode } from 'react';

interface DashboardSectionTitleProps {
  children: ReactNode;
  action?: ReactNode;
}

export default function DashboardSectionTitle({ children, action }: DashboardSectionTitleProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <span className="w-1 h-4 bg-primary rounded-full" />
        {children}
      </h2>
      {action}
    </div>
  );
}
