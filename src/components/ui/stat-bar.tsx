import type { ReactNode } from 'react';

export interface StatBarItem {
  label: string;
  value: ReactNode;
  /** Tailwind class for dot color, e.g. 'bg-accent', 'bg-info', 'bg-success'. */
  dotClass?: string;
}

export interface StatBarGroup {
  items: StatBarItem[];
}

interface StatBarProps {
  groups: StatBarGroup[];
  className?: string;
}

const PILL_BASE =
  'flex items-center gap-3 px-4 py-2 bg-surface-2 border border-outline-variant/40 rounded-card shadow-sm text-[10px] font-black uppercase tracking-widest whitespace-nowrap';

export function StatBar({ groups, className = '' }: StatBarProps) {
  return (
    <div className={`flex w-full items-center justify-between gap-2 overflow-x-auto pb-1 ${className}`}>
      {groups.map((g, gi) => (
        <div key={gi} className={`${PILL_BASE} shrink-0`}>
          {g.items.map((item, idx) => (
            <span key={`${item.label}-${idx}`} className="flex items-center gap-1.5 text-on-surface-variant whitespace-nowrap">
              <span className={`size-2 rounded-full inline-block ${item.dotClass ?? 'bg-on-surface-variant'}`} aria-hidden="true" />
              {item.label}: {item.value}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
