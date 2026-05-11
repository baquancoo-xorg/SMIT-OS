import { useState, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface SidebarItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  /** Mark this item active. */
  active?: boolean;
  /** Optional badge content (e.g. count). */
  badge?: ReactNode;
  onClick?: () => void;
  /** Pass href for anchor-style nav. If both onClick and href set, both fire. */
  href?: string;
  disabled?: boolean;
}

export interface SidebarSection {
  key: string;
  label?: ReactNode;
  items: SidebarItem[];
  /** Initially collapsed. Default false. */
  collapsedByDefault?: boolean;
}

export interface SidebarProps {
  sections: SidebarSection[];
  /** Brand/logo slot rendered at top. */
  brand?: ReactNode;
  /** Footer slot (e.g. promo card, user). */
  footer?: ReactNode;
  /** Collapse to icon-only rail. */
  collapsed?: boolean;
  className?: string;
}

/**
 * v4 Sidebar — vertical nav with collapsible sections, active orange-accent bar.
 * Active items get a left-edge orange bar + accent-soft background.
 *
 * @example
 *   <Sidebar
 *     sections={[{
 *       label: 'MAIN',
 *       items: [
 *         { key:'dash', label:'Dashboard', icon:<HomeIcon />, active:true },
 *         { key:'leads', label:'Leads', badge:'12' },
 *       ]
 *     }]}
 *   />
 */
export function Sidebar({ sections, brand, footer, collapsed = false, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col bg-surface border-r border-outline-subtle z-sidebar',
        collapsed ? 'w-16' : 'w-60',
        'transition-[width] duration-medium ease-standard',
        className,
      )}
    >
      {brand && (
        <div className={cn('flex items-center h-[var(--header-h)] px-md', collapsed && 'justify-center px-xs')}>
          {brand}
        </div>
      )}
      <nav className="flex-1 overflow-y-auto px-sm py-md">
        {sections.map((section) => (
          <SidebarSectionBlock key={section.key} section={section} collapsed={collapsed} />
        ))}
      </nav>
      {footer && <div className="border-t border-outline-subtle p-md">{footer}</div>}
    </aside>
  );
}

function SidebarSectionBlock({ section, collapsed }: { section: SidebarSection; collapsed: boolean }) {
  const [open, setOpen] = useState(!section.collapsedByDefault);
  return (
    <div className="mb-md">
      {section.label && !collapsed && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between px-sm py-xs text-caption font-semibold uppercase tracking-widest text-fg-subtle hover:text-fg-muted"
        >
          <span>{section.label}</span>
          <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        </button>
      )}
      {open && (
        <ul className="flex flex-col gap-xs">
          {section.items.map((item) => (
            <li key={item.key}>
              <SidebarItemRow item={item} collapsed={collapsed} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SidebarItemRow({ item, collapsed }: { item: SidebarItem; collapsed: boolean }) {
  const Tag = item.href ? 'a' : 'button';
  return (
    <Tag
      href={item.href}
      type={Tag === 'button' ? 'button' : undefined}
      onClick={item.onClick}
      disabled={Tag === 'button' ? item.disabled : undefined}
      aria-current={item.active ? 'page' : undefined}
      className={cn(
        'group relative flex w-full items-center gap-sm rounded-input px-sm py-sm text-body-sm transition-colors duration-fast',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        item.active
          ? 'bg-accent-soft text-fg'
          : 'text-fg-muted hover:bg-surface-overlay hover:text-fg',
      )}
    >
      {item.active && !collapsed && (
        <span aria-hidden="true" className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-px bg-accent shadow-glow-sm" />
      )}
      {item.icon && <span aria-hidden="true" className={cn('inline-flex shrink-0', item.active && 'text-accent')}>{item.icon}</span>}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="inline-flex items-center justify-center rounded-pill bg-surface-overlay px-xs text-caption text-fg-subtle">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Tag>
  );
}
