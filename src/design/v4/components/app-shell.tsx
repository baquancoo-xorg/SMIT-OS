import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface AppShellProps {
  /** Top header element. Optional — omit if route is full-bleed. */
  header?: ReactNode;
  /** Left sidebar element. */
  sidebar?: ReactNode;
  /** Main content area. */
  children: ReactNode;
  /** Class overrides on the content `<main>`. */
  contentClassName?: string;
}

/**
 * v4 AppShell — layout composition: sidebar | (header → main).
 * Sets `data-ui="v4"` on root so v4 tokens activate within the tree.
 *
 * @example
 *   <AppShell header={<Header ... />} sidebar={<Sidebar ... />}>
 *     <Routes>...</Routes>
 *   </AppShell>
 */
export function AppShell({ header, sidebar, children, contentClassName }: AppShellProps) {
  return (
    <div data-ui="v4" className="flex min-h-screen bg-surface text-fg">
      {sidebar && <div className="shrink-0">{sidebar}</div>}
      <div className="flex flex-1 min-w-0 flex-col">
        {header}
        <main className={cn('flex-1 overflow-y-auto p-comfy', contentClassName)}>{children}</main>
      </div>
    </div>
  );
}
