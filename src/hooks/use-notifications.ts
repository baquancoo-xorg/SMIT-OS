import { useCallback, useEffect, useState } from 'react';

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
  const [unreadCount, setUnreadCount] = useState(0);
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

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/unread-count', { credentials: 'include' });
      if (!res.ok) return;
      const data: { count: number } = await res.json();
      setUnreadCount(data.count);
    } catch (e) {
      console.error('Failed to fetch unread count:', e);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH', credentials: 'include' });
    if (!res.ok) return;
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    const res = await fetch('/api/notifications/mark-all-read', { method: 'POST', credentials: 'include' });
    if (!res.ok) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    let interval: ReturnType<typeof setInterval> | null = null;
    const startPolling = () => {
      if (!interval) interval = setInterval(fetchUnreadCount, 30000);
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
        fetchUnreadCount();
        startPolling();
      }
    };
    if (!document.hidden) startPolling();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
}
