/**
 * v4 AppShell wrapper — shared layout for all /v4/* routes.
 * Wraps page content with v4 Sidebar + Header + AppShell + NotificationProvider.
 */
import { useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  Hexagon,
  Home,
  LayoutDashboard,
  LogOut,
  MegaphoneIcon,
  Newspaper,
  PlayCircle,
  Settings as SettingsIcon,
  Target,
  User as UserIcon,
} from 'lucide-react';
import {
  AppShell,
  Button,
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

export function V4Shell({ children }: V4ShellProps) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
            brand={
              <button
                type="button"
                onClick={() => navigate('/v4/dashboard')}
                className="inline-flex items-center gap-snug font-semibold text-fg hover:text-accent transition-colors"
              >
                <Hexagon size={20} className="text-accent" />
                <span>SMIT</span>
              </button>
            }
            actions={
              <>
                <span className="text-body-sm text-fg-muted">
                  {currentUser?.fullName ?? currentUser?.username ?? 'Guest'}
                </span>
                <Button variant="ghost" size="sm" leftIcon={<LogOut size={14} />} onClick={logout}>
                  Logout
                </Button>
              </>
            }
          />
        }
        sidebar={
          <Sidebar
            sections={NAV_SECTIONS(location.pathname, navigate)}
            footer={
              <button
                type="button"
                onClick={() => navigate('/v4/dashboard')}
                className="flex w-full items-center gap-snug rounded-input bg-surface-warm px-snug py-snug text-body-sm text-fg hover:opacity-90 transition-opacity"
              >
                <Home size={16} className="text-accent" />
                <span className="flex-1 text-left">Back to v4 home</span>
              </button>
            }
          />
        }
      >
        {children}
      </AppShell>
    </NotificationProvider>
  );
}
