import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { workspaceNavGroups } from './workspace-nav-items';

interface SidebarV5Props {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onLogout: () => void;
  onNavigate?: () => void;
}

export default function SidebarV5({ collapsed, onCollapsedChange, onLogout, onNavigate }: SidebarV5Props) {
  const { currentUser } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={`h-full shrink-0 border-r border-border bg-surface/95 px-3 py-4 shadow-lg transition-[width] duration-medium ease-standard ${collapsed ? 'w-[var(--sidebar-width-collapsed)]' : 'w-[var(--sidebar-width)]'}`}
      aria-label="Primary navigation"
    >
      <div className="flex h-full flex-col overflow-hidden">
        <div className={`mb-6 flex items-center ${collapsed ? 'justify-center' : 'gap-2 px-2'}`}>
          <img src="/logo-icon.png" alt="" className="h-8 w-8 shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-lg font-black leading-none tracking-tight text-text-1">SMIT OS</p>
              <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.22em] text-accent-text">Command Center</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden" aria-label="Workspace navigation">
          {workspaceNavGroups.map(group => (
            <div key={group.workspace} className="space-y-1.5">
              {!collapsed && (
                <div className="px-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{group.eyebrow}</p>
                  <p className="text-xs font-bold text-text-2">{group.label}</p>
                </div>
              )}
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const active = location.pathname === item.href || item.legacyHrefs?.includes(location.pathname);

                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) => {
                        const selected = active || isActive;
                        return `group relative flex min-h-[var(--density-row-min)] items-center gap-3 rounded-full border px-3 text-sm transition-all duration-fast ${collapsed ? 'justify-center' : ''} ${
                          selected
                            ? 'border-border bg-surface-container text-text-1'
                            : 'border-transparent text-text-2 hover:bg-surface-container/60 hover:text-text-1'
                        }`;
                      }}
                    >
                      {({ isActive }) => {
                        const selected = active || isActive;
                        return (
                          <>
                            <span className={`absolute left-0 h-5 w-1 rounded-full bg-accent transition-opacity ${selected ? 'opacity-100' : 'opacity-0'}`} />
                            <Icon size={18} className="shrink-0" />
                            {!collapsed && <span className="truncate font-semibold">{item.label}</span>}
                          </>
                        );
                      }}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-5 space-y-3 border-t border-border pt-4">
          {!collapsed && (
            <div className="rounded-card border border-border bg-surface-2 px-3 py-2.5">
              <p className="truncate text-xs font-bold text-text-1">{currentUser?.fullName}</p>
              <p className="mt-0.5 truncate text-[11px] font-semibold text-text-muted">{currentUser?.role}</p>
            </div>
          )}
          <div className={`flex items-center ${collapsed ? 'flex-col gap-2' : 'justify-between gap-2'}`}>
            <button
              type="button"
              onClick={() => onCollapsedChange(!collapsed)}
              className="touch-target flex items-center justify-center rounded-full border border-border bg-surface-2 px-3 text-text-2 transition hover:text-accent-text"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="touch-target flex items-center justify-center rounded-full border border-border bg-surface-2 px-3 text-text-2 transition hover:text-error"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
