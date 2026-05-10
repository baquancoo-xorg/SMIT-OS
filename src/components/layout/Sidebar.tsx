import React, { memo } from 'react';
import { LogOut, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  onLogout: () => void;
  onNavigate?: () => void;
}

export default function Sidebar({ onLogout, onNavigate }: SidebarProps) {
  const { currentUser } = useAuth();

  return (
    <aside className="h-full flex flex-col p-4 md:p-5 xl:p-5 bg-white/70 backdrop-blur-xl rounded-r-3xl w-60 xl:w-64 shadow-2xl z-50">
      <div className="flex flex-col items-start mb-8 px-3">
        <div className="flex items-center gap-1.5">
          <img src="/logo-icon.png" alt="" className="h-7 w-7" />
          <h1 className="text-[22px] font-bold tracking-tight text-primary font-headline leading-none">SMIT OS</h1>
        </div>
        <p className="text-[9px] font-medium text-on-surface-variant uppercase tracking-[0.15em] mt-1">The Kinetic Workspace</p>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto overflow-x-visible custom-scrollbar px-1">
        <div className="space-y-2">
          <p className="px-3 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">Analytics</p>
          <NavItem icon="monitoring" label="Dashboard" to="/dashboard" onNavigate={onNavigate} />
        </div>

        <div className="space-y-2">
          <p className="px-3 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">Planning</p>
          <NavItem icon="track_changes" label="OKRs" to="/okrs" onNavigate={onNavigate} />
        </div>

        <div className="space-y-2">
          <p className="px-3 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">Rituals</p>
          <NavItem icon="event_note" label="Daily Sync" to="/daily-sync" onNavigate={onNavigate} />
          <NavItem icon="event_repeat" label="Weekly Checkin" to="/checkin" onNavigate={onNavigate} />
        </div>

        <div className="space-y-2">
          <p className="px-3 text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">Acquisition</p>
          <NavItem icon="campaign" label="Media Tracker" to="/media-tracker" onNavigate={onNavigate} />
          <NavItem icon="ads_click" label="Ads Tracker" to="/ads-tracker" onNavigate={onNavigate} />
          <NavItem icon="person_search" label="Lead Tracker" to="/lead-tracker" onNavigate={onNavigate} />
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-outline-variant/40">
        <div className="flex items-center gap-3 px-4 py-3 bg-surface-variant/30 rounded-3xl shadow-sm">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-on-surface truncate">{currentUser?.fullName}</p>
            <p className="text-[10px] font-medium text-on-surface-variant truncate">{currentUser?.role}</p>
          </div>
          <div className="flex items-center gap-1">
            {currentUser?.isAdmin && (
              <NavLink
                to="/settings"
                onClick={onNavigate}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-xl hover:bg-surface-variant/60"
                title="Settings"
              >
                <Settings size={18} />
              </NavLink>
            )}
            <button
              onClick={onLogout}
              className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-xl hover:bg-surface-variant/60"
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

const NavItem = memo(function NavItem({ icon, label, to, onNavigate }: { icon: string | React.ReactNode; label: string; to: string; onNavigate?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) => `w-full text-left flex items-center gap-2.5 px-3 py-1.5 min-h-[34px] rounded-full cursor-pointer transition-all duration-200 ease-in-out group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${isActive
        ? 'text-primary font-bold bg-primary/10 border border-primary/20'
        : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant/30 border border-transparent'
        }`}
    >
      {({ isActive }) => (
        <>
          {typeof icon === 'string' ? (
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0", fontSize: '20px' }}>{icon}</span>
          ) : (
            icon
          )}
          <span className="font-medium text-sm">{label}</span>
        </>
      )}
    </NavLink>
  );
});
