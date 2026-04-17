import React from 'react';
import { LayoutDashboard, Target, KanbanSquare, Trello, Filter, CalendarSync, Settings, LogOut, Inbox } from 'lucide-react';
import { ViewType } from '../../App';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
  onSettingsClick?: () => void;
}

export default function Sidebar({ currentView, onViewChange, onLogout, onSettingsClick }: SidebarProps) {
  const { currentUser } = useAuth();

  return (
    <aside className="h-full flex flex-col p-4 md:p-6 xl:p-6 bg-white/70 backdrop-blur-xl rounded-r-3xl w-64 xl:w-72 shadow-2xl z-50">
      <div className="flex flex-col items-start mb-10 px-4">
        <h1 className="text-2xl font-bold tracking-tight text-primary font-headline leading-none">SMIT OS</h1>
        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1">The Kinetic Workspace</p>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto overflow-x-visible custom-scrollbar px-1">
        {/* Analytics */}
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Analytics</p>
          <NavItem
            icon="grid_view"
            label="Overview"
            active={currentView === 'dashboard'}
            onClick={() => onViewChange('dashboard')}
          />
          <NavItem
            icon="monitoring"
            label="Dashboard"
            active={currentView === 'ads-overview'}
            onClick={() => onViewChange('ads-overview')}
          />
        </div>

        {/* Workspaces */}
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Workspaces</p>
          <NavItem
            icon="terminal"
            label="Tech & Product"
            active={currentView === 'tech'}
            onClick={() => onViewChange('tech')}
          />
          <NavItem
            icon="layers"
            label="Marketing"
            active={currentView === 'mkt'}
            onClick={() => onViewChange('mkt')}
          />
          <NavItem
            icon="video_library"
            label="Media"
            active={currentView === 'media'}
            onClick={() => onViewChange('media')}
          />
          <NavItem
            icon="payments"
            label="Sales"
            active={currentView === 'sale'}
            onClick={() => onViewChange('sale')}
          />
        </div>

        {/* Planning */}
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Planning</p>
          <NavItem
            icon="track_changes"
            label="OKRs"
            active={currentView === 'okrs'}
            onClick={() => onViewChange('okrs')}
          />
          <NavItem
            icon={<Inbox size={18} />}
            label="Team Backlog"
            active={currentView === 'backlog'}
            onClick={() => onViewChange('backlog')}
          />
        </div>

        {/* Rituals */}
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Rituals</p>
          <NavItem
            icon="event_note"
            label="Daily Sync"
            active={currentView === 'daily-sync'}
            onClick={() => onViewChange('daily-sync')}
          />
          <NavItem
            icon="event_repeat"
            label="Weekly Report"
            active={currentView === 'sync'}
            onClick={() => onViewChange('sync')}
          />
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-100">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-on-surface truncate">{currentUser?.fullName}</p>
            <p className="text-[10px] font-medium text-slate-600 truncate">{currentUser?.role}</p>
          </div>
          <div className="flex items-center gap-1">
            {currentUser?.isAdmin && (
              <button
                onClick={onSettingsClick}
                className="p-2 text-slate-400 hover:text-primary transition-colors rounded-xl hover:bg-slate-100"
                title="Settings"
              >
                <Settings size={18} />
              </button>
            )}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-error transition-colors rounded-xl hover:bg-slate-100"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: string | React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left flex items-center gap-4 px-4 py-3 min-h-[48px] rounded-full cursor-pointer transition-all duration-200 ease-in-out group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${active
        ? 'text-primary font-bold bg-primary/10 border border-primary/20'
        : 'text-slate-500 hover:text-primary hover:bg-slate-50 border border-transparent'
        }`}
      aria-current={active ? 'page' : undefined}
    >
      {typeof icon === 'string' ? (
        <span className="material-symbols-outlined" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
      ) : (
        icon
      )}
      <span className="font-medium">{label}</span>
    </button>
  );
}
