/**
 * v4 AppShell wrapper — shared layout for all /v4/* routes.
 * Logo lives inside Sidebar (top-left). Header carries page title + icon buttons + avatar.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  CalendarCheck,
  ClipboardList,
  Clock,
  Hexagon,
  LayoutDashboard,
  MegaphoneIcon,
  Newspaper,
  PlayCircle,
  Settings as SettingsIcon,
  Target,
  User as UserIcon,
} from 'lucide-react';
import {
  AppShell,
  DropdownMenu,
  Header,
  NotificationProvider,
  Sidebar,
  type SidebarSection,
} from '../design/v4/index.js';
import '../design/v4/tokens.css';
import { useAuth } from '../contexts/AuthContext';

interface V4ShellProps {
  children: ReactNode;
}

const ROUTE_TITLES: Array<{ prefix: string; title: string }> = [
  { prefix: '/v4/dashboard', title: 'Dashboard' },
  { prefix: '/v4/leads', title: 'Lead Tracker' },
  { prefix: '/v4/ads', title: 'Ads Tracker' },
  { prefix: '/v4/media', title: 'Media Tracker' },
  { prefix: '/v4/okrs', title: 'OKR Management' },
  { prefix: '/v4/daily-sync', title: 'Daily Sync' },
  { prefix: '/v4/checkin', title: 'Weekly Checkin' },
  { prefix: '/v4/settings', title: 'Settings' },
  { prefix: '/v4/profile', title: 'Profile' },
];

function pageTitle(pathname: string): string {
  const match = ROUTE_TITLES.find((r) => pathname.startsWith(r.prefix));
  return match?.title ?? 'SMIT OS';
}

const NAV_SECTIONS = (currentPath: string, navigate: (p: string) => void): SidebarSection[] => [
  {
    key: 'main',
    label: 'Main',
    items: [
      { key: '/v4/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, active: currentPath.startsWith('/v4/dashboard'), onClick: () => navigate('/v4/dashboard') },
      { key: '/v4/leads', label: 'Lead Tracker', icon: <ClipboardList size={16} />, active: currentPath.startsWith('/v4/leads'), onClick: () => navigate('/v4/leads') },
      { key: '/v4/ads', label: 'Ads Tracker', icon: <MegaphoneIcon size={16} />, active: currentPath.startsWith('/v4/ads'), onClick: () => navigate('/v4/ads') },
      { key: '/v4/media', label: 'Media Tracker', icon: <PlayCircle size={16} />, active: currentPath.startsWith('/v4/media'), onClick: () => navigate('/v4/media') },
    ],
  },
  {
    key: 'team',
    label: 'Team',
    items: [
      { key: '/v4/okrs', label: 'OKRs', icon: <Target size={16} />, active: currentPath.startsWith('/v4/okrs'), onClick: () => navigate('/v4/okrs') },
      { key: '/v4/daily-sync', label: 'Daily Sync', icon: <Newspaper size={16} />, active: currentPath.startsWith('/v4/daily-sync'), onClick: () => navigate('/v4/daily-sync') },
      { key: '/v4/checkin', label: 'Weekly Checkin', icon: <CalendarCheck size={16} />, active: currentPath.startsWith('/v4/checkin'), onClick: () => navigate('/v4/checkin') },
    ],
  },
  {
    key: 'tools',
    label: 'Tools',
    items: [
      { key: '/v4/settings', label: 'Settings', icon: <SettingsIcon size={16} />, active: currentPath.startsWith('/v4/settings'), onClick: () => navigate('/v4/settings') },
      { key: '/v4/profile', label: 'Profile', icon: <UserIcon size={16} />, active: currentPath.startsWith('/v4/profile'), onClick: () => navigate('/v4/profile') },
    ],
  },
];

function HeaderIconButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-9 items-center justify-center rounded-pill bg-surface-overlay border border-outline-subtle text-fg-muted hover:text-fg hover:border-outline transition-colors duration-fast"
    >
      {icon}
    </button>
  );
}

function AvatarMenu() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (currentUser?.fullName ?? currentUser?.username ?? '?').slice(0, 1).toUpperCase();

  return (
    <DropdownMenu
      align="bottom-end"
      items={[
        { key: 'profile', label: 'Profile', onSelect: () => navigate('/v4/profile') },
        { key: 'settings', label: 'Settings', onSelect: () => navigate('/v4/settings') },
        { key: 'logout', label: 'Logout', danger: true, onSelect: () => logout() },
      ]}
      trigger={
        <button
          type="button"
          aria-label="Account menu"
          className="inline-flex size-9 items-center justify-center rounded-pill bg-accent-soft text-accent ring-2 ring-accent/40 hover:ring-accent/60 transition-shadow duration-fast"
        >
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="" className="size-9 rounded-pill object-cover" />
          ) : (
            <span className="text-body-sm font-semibold">{initials}</span>
          )}
        </button>
      }
    />
  );
}

export function V4Shell({ children }: V4ShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.ui = 'v4';
    return () => {
      delete document.documentElement.dataset.ui;
    };
  }, []);

  return (
    <NotificationProvider>
      <AppShell
        header={
          <Header
            title={pageTitle(location.pathname)}
            actions={
              <>
                <HeaderIconButton icon={<Clock size={16} />} label="History" />
                <HeaderIconButton icon={<Bell size={16} />} label="Notifications" />
                <AvatarMenu />
              </>
            }
          />
        }
        sidebar={
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
            brand={
              !sidebarCollapsed ? (
                <button
                  type="button"
                  onClick={() => navigate('/v4/dashboard')}
                  className="inline-flex items-center gap-snug font-semibold text-fg hover:text-accent transition-colors"
                >
                  <Hexagon size={22} className="text-accent" />
                </button>
              ) : (
                <Hexagon size={22} className="text-accent" />
              )
            }
            sections={NAV_SECTIONS(location.pathname, navigate)}
          />
        }
      >
        {children}
      </AppShell>
    </NotificationProvider>
  );
}
