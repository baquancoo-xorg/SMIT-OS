import type { ReactNode } from 'react';

export interface AppLayoutProps {
  /** Pre-composed `<Sidebar>` instance. */
  sidebar: ReactNode;
  /** Pre-composed `<Header>` instance. */
  header: ReactNode;
  /** Page content. */
  children: ReactNode;
  /** Optional footer rendered below main content. */
  footer?: ReactNode;
  /** Apply page-padding utility to main. Disable for full-bleed pages. */
  withPagePadding?: boolean;
  className?: string;
}

/**
 * AppLayout v2 — top-level composition wrapper.
 *
 * Layout: sidebar (lg+ static, smaller = overlay handled by Sidebar) | column with header + main.
 * Header sticks to top, main scrolls independently. Mobile: header takes full width, sidebar is overlay.
 *
 * @example
 * <AppLayout
 *   sidebar={<Sidebar ... mobileOpen={mobileNav} onMobileClose={...} />}
 *   header={<Header ... onMobileMenuClick={() => setMobileNav(true)} />}
 * >
 *   <PageHeader title="OKRs" />
 *   <DataTable ... />
 * </AppLayout>
 */
export function AppLayout({
  sidebar,
  header,
  children,
  footer,
  withPagePadding = true,
  className = '',
}: AppLayoutProps) {
  return (
    <div className={['flex min-h-screen bg-surface', className].filter(Boolean).join(' ')}>
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">
        {header}
        <main
          id="main-content"
          tabIndex={-1}
          className={[
            'flex-1 outline-none',
            withPagePadding ? 'page-padding page-scrollable' : 'page-scrollable',
          ].join(' ')}
        >
          {children}
        </main>
        {footer}
      </div>
    </div>
  );
}

AppLayout.displayName = 'AppLayout';
