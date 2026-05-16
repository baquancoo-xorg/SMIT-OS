import { useMemo, useState } from 'react';
import { Bell, CalendarDays, CheckCircle2, Clock, Menu, Moon, Sun } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/theme-context';
import { useNotifications } from '../../hooks/use-notifications';
import { Button } from '../ui/button';
import { NotificationCenter } from '../ui/notification-center';
import { findNavGroup, findNavItem } from './workspace-nav-items';

interface HeaderProps {
  onMenuClick: () => void;
}

interface HeaderNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  entityType?: string;
}

function resolveBreadcrumb(pathname: string) {
  const item = findNavItem(pathname);
  if (!item) return { group: 'Workspace', page: 'Command Center' };
  const group = findNavGroup(item.workspace);
  return { group: group?.eyebrow ?? 'Workspace', page: item.label };
}

function routeForNotification(noti: HeaderNotification): string | null {
  if (noti.type === 'daily_new' || noti.type === 'daily_late') return '/daily-sync';
  if (noti.type === 'weekly_late') return '/checkin';
  if (noti.type === 'report_approved') return noti.entityType === 'WeeklyReport' ? '/checkin' : '/daily-sync';
  return null;
}

function notificationTone(type: string): 'info' | 'success' | 'warning' {
  if (type === 'report_approved') return 'success';
  if (type.endsWith('_late')) return 'warning';
  return 'info';
}

function notificationIcon(type: string) {
  if (type === 'report_approved') return <CheckCircle2 aria-hidden="true" />;
  if (type === 'daily_late') return <Clock aria-hidden="true" />;
  if (type === 'weekly_late') return <CalendarDays aria-hidden="true" />;
  return <Bell aria-hidden="true" />;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const breadcrumb = resolveBreadcrumb(location.pathname);

  const panelNotifications = useMemo(
    () => notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      description: notification.message,
      timestamp: new Date(notification.createdAt),
      unread: !notification.isRead,
      tone: notificationTone(notification.type),
      icon: notificationIcon(notification.type),
      onClick: async () => {
        if (!notification.isRead) {
          const marked = await markAsRead(notification.id);
          if (!marked) return;
        }
        setNotificationsOpen(false);
        const route = routeForNotification(notification);
        if (route) navigate(route);
      },
    })),
    [markAsRead, navigate, notifications],
  );

  return (
    <>
      <header className="sticky top-0 z-header h-[var(--header-h)] bg-bg/95 backdrop-blur-xl">
        <div className="mx-[var(--content-px-mobile)] flex h-full items-center justify-between gap-4 border-b border-border md:mx-[var(--content-px-tablet)] xl:mx-[var(--content-px-desktop)]">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="size-11 shrink-0 border border-border bg-surface-2/80 px-0 shadow-sm xl:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={20} aria-hidden="true" />
            </Button>

            <nav
              aria-label="Breadcrumb"
              className="min-w-0 truncate text-xs font-bold uppercase tracking-[0.18em] text-text-muted"
            >
              <span>{breadcrumb.group}</span>
              <span className="px-2 text-accent" aria-hidden="true">/</span>
              <span className="text-text-1" aria-current="page">{breadcrumb.page}</span>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="relative inline-flex size-9 items-center justify-center text-text-muted transition hover:text-text-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolvedTheme === 'dark' ? <Moon className="size-4" aria-hidden="true" /> : <Sun className="size-4" aria-hidden="true" />}
            </button>

            <NotificationCenter.Trigger
              count={unreadCount}
              onClick={() => setNotificationsOpen(true)}
              ariaLabel="Open notifications"
            />
          </div>
        </div>
      </header>

      <NotificationCenter.Panel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={panelNotifications}
        headerActions={unreadCount > 0 ? (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Mark all read
          </Button>
        ) : undefined}
      />
    </>
  );
}
