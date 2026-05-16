import { ChevronLeft, ChevronRight, LogOut, Settings } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { workspaceNavGroups, type WorkspaceNavItem } from './workspace-nav-items';

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onLogout: () => void;
  onNavigate?: () => void;
}

const sidebarSections = [
  { label: 'Executive', items: ['Dashboard', 'OKRs'] },
  { label: 'Acquisition', items: ['Leads', 'Ads', 'Media'] },
  { label: 'Rhythm', items: ['Daily Sync', 'Weekly Check-in'] },
];

const navItems = workspaceNavGroups.flatMap(group => group.items);

function findItem(label: string) {
  return navItems.find(item => item.label === label);
}

function SmitGridMark() {
  return (
    <svg className="h-6 w-6 shrink-0" viewBox="0 0 40 40" role="img" aria-label="SMIT OS">
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
        return `group relative flex min-h-9 items-center text-[length:var(--text-label)] font-bold transition-all duration-fast ${collapsed ? 'mx-auto w-11 justify-center' : 'gap-2'} ${selected ? 'text-text-1' : 'text-text-muted hover:text-text-1'}`;
      }}
    >
      {({ isActive }) => {
        const selected = active || isActive;
        return (
          <>
            <span
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full transition-colors duration-fast ${collapsed ? 'left-2 h-5 w-0.5' : 'left-0 h-7 w-1'} ${selected ? 'bg-[var(--sys-sidebar-active-bar)] opacity-100' : 'opacity-0'}`}
            />
            <span
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${collapsed ? 'left-[0.625rem] h-6 w-8' : 'left-1 h-8 w-20'} transition-[opacity,transform] duration-medium ease-standard ${selected ? 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5' : 'opacity-0'}`}
              style={{
                background: 'linear-gradient(90deg, color-mix(in oklab, var(--sys-color-accent) 34%, transparent) 0%, color-mix(in oklab, var(--sys-color-accent) 18%, transparent) 42%, transparent 100%)',
                filter: 'blur(7px)',
              }}
            />
            <span
              className={`flex min-h-9 items-center gap-2.5 border text-[length:var(--text-label)] font-bold transition-all duration-fast ${collapsed ? 'w-9 justify-center rounded-[var(--radius-input)] border-transparent bg-transparent' : 'flex-1 rounded-[var(--radius-input)] px-2.5'} ${
                selected
                  ? collapsed
                    ? 'text-text-1'
                    : 'border-[var(--sidebar-item-border)] bg-[var(--sidebar-item-active)] text-text-1 shadow-card'
                  : collapsed
                    ? 'text-text-muted group-hover:text-text-1'
                    : 'border-transparent text-text-muted group-hover:bg-[var(--sidebar-item-hover)] group-hover:text-text-1'
              }`}
            >
              <Icon size={15} className="shrink-0 text-current" />
              {!collapsed && <span className="truncate uppercase tracking-[0.08em]">{item.label}</span>}
            </span>
          </>
        );
      }}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onCollapsedChange, onLogout, onNavigate }: SidebarProps) {
  const { currentUser } = useAuth();
  const location = useLocation();

  const visibleSections = sidebarSections;

  return (
    <aside
      className={`my-3 ml-3 h-[calc(100dvh-1.5rem)] shrink-0 overflow-hidden border border-border bg-surface shadow-elevated transition-[width] duration-medium ease-standard ${collapsed ? 'w-[var(--sidebar-width-collapsed)] rounded-[2rem]' : 'w-[var(--sidebar-width)] rounded-[2rem]'}`}
      aria-label="Primary navigation"
    >
      <div className="flex h-full flex-col">
        <div className={`flex h-[3.25rem] shrink-0 items-center border-b border-border ${collapsed ? 'justify-center' : 'gap-2.5 px-6'}`}>
          <SmitGridMark />
          {!collapsed && <span className="text-sm font-extrabold tracking-tight text-text-1">SMIT OS</span>}
        </div>

        <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${collapsed ? 'space-y-5 px-0 py-5' : 'space-y-5 px-5 py-4'}`} aria-label="Workspace navigation">
          {visibleSections.map((section, index) => (
            <div key={section.label} className={collapsed ? 'space-y-3.5' : 'space-y-2'}>
              {!collapsed && <p className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">{section.label}</p>}
              <div className={collapsed ? 'space-y-2.5' : 'space-y-1'}>
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

        <div className={`relative shrink-0 border-t border-border ${collapsed ? 'px-0 py-4' : 'flex h-[4.5rem] items-center gap-1.5 px-5'}`}>
          {!collapsed && (
            <NavLink to="/profile" onClick={onNavigate} className="min-w-0 flex-1 rounded-[var(--radius-input)] py-1.5 text-left transition hover:text-text-1">
              <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.04em] text-text-1">{currentUser?.fullName || 'Nguyễn Quân'}</p>
              <p className="truncate text-[9px] font-semibold uppercase tracking-[0.08em] text-text-muted">{currentUser?.role || 'Admin'}</p>
            </NavLink>
          )}
          {!collapsed && (
            <NavLink to="/settings" onClick={onNavigate} className="grid size-8 place-items-center rounded-full border border-[var(--sidebar-item-border)] bg-[var(--sidebar-button-bg)] text-text-muted transition hover:bg-[var(--sidebar-button-hover)] hover:text-text-1" aria-label="Settings">
              <Settings size={14} />
            </NavLink>
          )}
          {!collapsed && (
            <button type="button" onClick={onLogout} className="grid size-8 place-items-center rounded-full border border-[var(--sidebar-item-border)] bg-[var(--sidebar-button-bg)] text-text-muted transition hover:bg-[var(--sidebar-button-hover)] hover:text-error" aria-label="Sign out">
              <LogOut size={14} />
            </button>
          )}
          <button type="button" onClick={() => onCollapsedChange(!collapsed)} className={`grid size-8 place-items-center rounded-full border border-[var(--sidebar-item-border)] bg-[var(--sidebar-button-bg)] text-text-muted transition hover:bg-[var(--sidebar-button-hover)] hover:text-text-1 ${collapsed ? 'mx-auto' : ''}`} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>
    </aside>
  );
}

