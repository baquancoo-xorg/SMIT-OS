import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '../lib/cn';

export interface SidebarItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  badge?: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}

export interface SidebarSection {
  key: string;
  label?: ReactNode;
  items: SidebarItem[];
  collapsedByDefault?: boolean;
}

export interface SidebarProps {
  sections: SidebarSection[];
  /** Brand/logo slot rendered at top-left of sidebar header. */
  brand?: ReactNode;
  /** Footer slot (e.g. promo card, user). */
  footer?: ReactNode;
  /** Collapsed-to-rail mode (icon-only). */
  collapsed?: boolean;
  /** Called when user clicks the collapse toggle (top-right of header). */
  onToggleCollapse?: () => void;
  className?: string;
}

/**
 * v4 Sidebar — vertical nav inspired by Image 17:
 * - Logo top-left + collapse toggle top-right inside sidebar header
 * - Indented items with vertical tree connector
 * - Horizontal divider lines between sections
 * - Section labels with collapse chevron
 */
export function Sidebar({ sections, brand, footer, collapsed = false, onToggleCollapse, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col bg-surface border-r border-outline-subtle z-sidebar',
        collapsed ? 'w-16' : 'w-64',
        'transition-[width] duration-medium ease-standard',
        className,
      )}
    >
      {(brand || onToggleCollapse) && (
        <div
          className={cn(
            'flex items-center gap-snug h-[var(--header-h)] px-comfy border-b border-outline-subtle',
            collapsed ? 'justify-center px-tight' : 'justify-between',
          )}
        >
          {brand && <div className={cn('flex items-center min-w-0', collapsed && 'shrink-0')}>{brand}</div>}
          {onToggleCollapse && !collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              className="inline-flex size-7 items-center justify-center rounded-input text-fg-muted hover:text-fg hover:bg-surface-overlay transition-colors duration-fast"
            >
              <PanelLeftClose size={16} />
            </button>
          )}
          {onToggleCollapse && collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              className="inline-flex size-7 items-center justify-center rounded-input text-fg-muted hover:text-fg hover:bg-surface-overlay transition-colors duration-fast"
            >
              <PanelLeftOpen size={16} />
            </button>
          )}
        </div>
      )}
      <nav className="flex-1 overflow-y-auto px-comfy py-comfy">
        {sections.map((section, i) => (
          <SidebarSectionBlock
            key={section.key}
            section={section}
            collapsed={collapsed}
            showTopDivider={i > 0 && !collapsed}
          />
        ))}
      </nav>
      {footer && <div className="border-t border-outline-subtle p-cozy">{footer}</div>}
    </aside>
  );
}

function SidebarSectionBlock({
  section,
  collapsed,
  showTopDivider,
}: {
  section: SidebarSection;
  collapsed: boolean;
  showTopDivider: boolean;
}) {
  const [open, setOpen] = useState(!section.collapsedByDefault);
  return (
    <div className={cn('mb-cozy', showTopDivider && 'pt-cozy border-t border-outline-subtle')}>
      {section.label && !collapsed && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between mb-tight px-tight py-tight text-caption font-semibold uppercase tracking-widest text-fg-subtle hover:text-fg-muted"
        >
          <span>{section.label}</span>
          {open ? <ChevronDown size={12} aria-hidden="true" /> : <ChevronRight size={12} aria-hidden="true" />}
        </button>
      )}
      {open && (
        <ul className={cn('relative flex flex-col gap-tight', !collapsed && 'pl-comfy')}>
          {/* Vertical tree connector line on the left */}
          {!collapsed && section.items.length > 0 && (
            <span
              aria-hidden="true"
              className="absolute left-snug top-0 bottom-0 w-px bg-outline-subtle"
            />
          )}
          {section.items.map((item) => (
            <li key={item.key} className="relative">
              {!collapsed && (
                <span
                  aria-hidden="true"
                  className="absolute -left-cozy top-1/2 h-px w-snug bg-outline-subtle"
                />
              )}
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
        'group relative flex w-full items-center gap-snug rounded-input px-snug py-snug text-body-sm transition-colors duration-fast',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        collapsed && 'justify-center',
        item.active
          ? 'bg-accent-soft text-fg'
          : 'text-fg-muted hover:bg-surface-overlay hover:text-fg',
      )}
    >
      {item.icon && (
        <span
          aria-hidden="true"
          className={cn('inline-flex shrink-0', item.active && 'text-accent')}
        >
          {item.icon}
        </span>
      )}
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left">{item.label}</span>
          {item.badge && (
            <span className="inline-flex items-center justify-center rounded-pill bg-surface-overlay px-tight text-caption text-fg-subtle">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Tag>
  );
}
