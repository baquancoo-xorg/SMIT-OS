import { useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut, Settings } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { workspaceNavGroups, type WorkspaceNavItem } from './workspace-nav-items';

interface SidebarV5Props {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onLogout: () => void;
  onNavigate?: () => void;
}

const sidebarSections = [
  { label: 'Executive', items: ['Dashboard', 'OKRs'] },
  { label: 'Acquisition', items: ['Leads', 'Ads', 'Media'] },
  { label: 'Rhythm', items: ['Daily Sync', 'Weekly Check-in'] },
  { label: 'Reports', items: ['Reports'] },
  { label: 'Admin', items: ['Settings', 'Profile', 'Integrations'] },
];

const navItems = workspaceNavGroups.flatMap(group => group.items);

function findItem(label: string) {
  return navItems.find(item => item.label === label);
}

function SmitGridMark() {
  return (
    <svg className="h-8 w-8 shrink-0" viewBox="0 0 40 40" role="img" aria-label="SMIT OS">
      <path d="M20 4V11" className="stroke-text-muted" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M20 29V36" className="stroke-text-muted" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4 20H11" className="stroke-text-muted" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M29 20H36" className="stroke-text-muted" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="11" y="11" width="8" height="8" rx="1.5" className="fill-transparent stroke-text-1" strokeWidth="1.7" />
      <rect x="21" y="11" width="8" height="8" rx="1.5" className="fill-transparent stroke-text-muted" strokeWidth="1.4" />
      <rect x="11" y="21" width="8" height="8" rx="1.5" className="fill-transparent stroke-text-muted" strokeWidth="1.4" />
      <rect x="21" y="21" width="8" height="8" rx="1.5" className="fill-accent stroke-accent" strokeWidth="1.4" />
    </svg>
  );
}

function SidebarNavItem({ item, collapsed, active, onNavigate }: { item: WorkspaceNavItem; collapsed: boolean; active: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={({ isActive }) => {
        const selected = active || isActive;
        return `group relative flex min-h-[var(--touch-min)] items-center text-sm font-bold transition-all duration-fast ${collapsed ? 'mx-auto w-14 justify-center' : 'gap-2'} ${
          selected ? 'text-text-1' : 'text-text-muted hover:text-text-1'
        }`;
      }}
    >
      {({ isActive }) => {
        const selected = active || isActive;
        return (
          <>
            <span
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full bg-accent transition-opacity duration-fast ${collapsed ? 'left-2 h-5 w-0.5' : 'left-0 h-9 w-1'} ${selected ? 'opacity-100' : 'opacity-0'}`}
              style={{ boxShadow: selected ? '0 0 10px var(--sys-color-accent), 0 0 20px var(--sys-color-accent-dim)' : undefined }}
            />
            <span className={`flex min-h-[var(--touch-min)] items-center gap-4 border text-sm font-bold transition-all duration-fast ${collapsed ? 'w-11 justify-center rounded-[var(--radius-input)] border-transparent bg-transparent' : 'flex-1 rounded-[var(--radius-input)] px-4'} ${
              selected
                ? collapsed
                  ? 'text-text-1'
                  : 'border-[var(--sidebar-item-border)] bg-[var(--sidebar-item-active)] text-text-1 shadow-card'
                : collapsed
                  ? 'text-text-muted group-hover:text-text-1'
                  : 'border-transparent text-text-muted group-hover:bg-[var(--sidebar-item-hover)] group-hover:text-text-1'
            }`}>
              <Icon size={18} className="shrink-0 text-current" />
              {!collapsed && <span className="truncate uppercase tracking-[0.08em]">{item.label}</span>}
            </span>
          </>
        );
      }}
    </NavLink>
  );
}

export default function SidebarV5({ collapsed, onCollapsedChange, onLogout, onNavigate }: SidebarV5Props) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const visibleSections = sidebarSections.map(section => {
    if (section.label !== 'Admin') return section;
    if (currentUser?.isAdmin) return section;
    // Non-admin: hide Integrations from Admin section
    return { ...section, items: section.items.filter(label => label !== 'Integrations') };
  });

  return (
    <aside
      className={`my-3 ml-3 h-[calc(100dvh-1.5rem)] shrink-0 overflow-hidden border border-border bg-surface shadow-elevated transition-[width] duration-medium ease-standard ${collapsed ? 'w-[var(--sidebar-width-collapsed)] rounded-[2rem]' : 'w-[var(--sidebar-width)] rounded-[2rem]'}`}
      aria-label="Primary navigation"
    >
      <div className="flex h-full flex-col">
        <div className={`flex h-24 shrink-0 items-center border-b border-border ${collapsed ? 'justify-center' : 'gap-4 px-9'}`}>
          <SmitGridMark />
          {!collapsed && <span className="text-2xl font-extrabold tracking-tight text-text-1">SMIT OS</span>}
        </div>

        <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${collapsed ? 'space-y-7 px-0 py-7' : 'space-y-8 px-7 py-6'}`} aria-label="Workspace navigation">
          {visibleSections.map((section, index) => (
            <div key={section.label} className={collapsed ? 'space-y-5' : 'space-y-3'}>
              {!collapsed && <p className="px-1 text-xs font-bold uppercase tracking-[0.18em] text-text-muted">{section.label}</p>}
              <div className={collapsed ? 'space-y-4' : 'space-y-2'}>
                {section.items.map(label => {
                  const item = findItem(label);
                  if (!item) return null;
                  const active = location.pathname === item.href || item.legacyHrefs?.includes(location.pathname) || false;
                  return <SidebarNavItem key={item.href} item={item} collapsed={collapsed} active={active} onNavigate={onNavigate} />;
                })}
              </div>
              {collapsed && index < visibleSections.length - 1 && <div className="mx-auto h-px w-8 bg-border" />}
            </div>
          ))}
        </nav>

        <div className={`relative shrink-0 border-t border-border ${collapsed ? 'px-0 py-6' : 'flex h-24 items-center gap-3 px-7'}`}>
          {!collapsed && (
            <>
              <button
                type="button"
                onClick={() => setUserMenuOpen(open => !open)}
                className="min-w-0 flex-1 rounded-[var(--radius-input)] py-2 text-left transition hover:text-text-1"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <p className="truncate text-sm font-extrabold uppercase tracking-[0.08em] text-text-1">{currentUser?.fullName || 'Nguyễn Quân'}</p>
                <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">{currentUser?.role || 'Admin'}</p>
              </button>
              {userMenuOpen && (
                <div className="absolute bottom-20 left-7 right-7 z-dropdown rounded-card border border-border bg-surface-2 p-1 shadow-elevated" role="menu">
                  <NavLink to="/settings" onClick={onNavigate}                     className="flex min-h-[var(--touch-min)] items-center gap-3 rounded-[var(--radius-input)] px-3 text-sm font-bold text-text-2 transition hover:bg-[var(--sidebar-item-hover)] hover:text-text-1" role="menuitem">
                    <Settings size={16} />
                    Settings
                  </NavLink>
                  <button type="button" onClick={onLogout}                     className="flex min-h-[var(--touch-min)] w-full items-center gap-3 rounded-[var(--radius-input)] px-3 text-left text-sm font-bold text-text-2 transition hover:bg-[var(--sidebar-item-hover)] hover:text-error" role="menuitem">
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              )}
            </>
          )}
          <button type="button" onClick={() => onCollapsedChange(!collapsed)} className={`touch-target grid place-items-center rounded-full border border-[var(--sidebar-item-border)] bg-[var(--sidebar-button-bg)] text-text-muted transition hover:bg-[var(--sidebar-button-hover)] hover:text-text-1 ${collapsed ? 'mx-auto' : ''}`} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
