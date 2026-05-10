import type { ReactNode } from 'react';

/**
 * Section title cho dashboard tab content (e.g. "Lead Flow & Clearance").
 *
 * Phase 8 follow-up batch 10 (2026-05-11): switched từ `text-slate-700` →
 * `text-on-surface` (semantic token). Bar accent giữ nguyên primary.
 */

interface DashboardSectionTitleProps {
  children: ReactNode;
  action?: ReactNode;
}

export default function DashboardSectionTitle({ children, action }: DashboardSectionTitleProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-[length:var(--text-body-sm)] font-semibold text-on-surface">
        <span className="h-4 w-1 rounded-chip bg-primary" aria-hidden="true" />
        {children}
      </h2>
      {action}
    </div>
  );
}
