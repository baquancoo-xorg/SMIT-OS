import { useCallback, useEffect, useMemo, useState } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  entityType?: string;
  entityId?: string;
}

const isTestNotification = (n: Notification): boolean => {
  const type = (n.type || '').toLowerCase();
  const title = (n.title || '').toLowerCase();
  const message = (n.message || '').toLowerCase();
  return type === 'test'
    || type === 'test_notification'
    || title.includes('test notification')
    || message.includes('testing notification');
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=20', { credentials: 'include' });
      if (!res.ok) return;
      const data: Notification[] = await res.json();
      setNotifications(data.filter(n => !isTestNotification(n)));
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', credentials: 'include' });
      if (!res.ok) return false;
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
      return true;
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/mark-all-read', { method: 'POST', credentials: 'include' });
      if (!res.ok) return false;
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      return true;
    } catch (e) {
      console.error('Failed to mark all notifications as read:', e);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    let interval: ReturnType<typeof setInterval> | null = null;
    const startPolling = () => {
      if (!interval) interval = setInterval(fetchNotifications, 30000);
    };
    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
    const onVisibilityChange = () => {
      if (document.hidden) stopPolling();
      else {
        fetchNotifications();
        startPolling();
      }
    };
    if (!document.hidden) startPolling();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
