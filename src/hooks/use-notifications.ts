import { useState, useEffect, useCallback, useMemo } from 'react';
import { addDays, isSameDay } from 'date-fns';
import { WorkItem } from '../types';
import { useAuth } from '../contexts/AuthContext';

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

const DISMISSED_DEADLINES_KEY_PREFIX = 'dismissed_deadline_ids';

const isTestNotification = (notification: Notification) => {
  const type = (notification.type || '').toLowerCase();
  const title = (notification.title || '').toLowerCase();
  const message = (notification.message || '').toLowerCase();

  return type === 'test'
    || type === 'test_notification'
    || title.includes('test notification')
    || message.includes('testing notification');
};

export function useNotifications(workItems: WorkItem[] = []) {
  const { currentUser } = useAuth();
  const dismissedStorageKey = useMemo(
    () => `${DISMISSED_DEADLINES_KEY_PREFIX}:${currentUser?.id ?? 'anonymous'}`,
    [currentUser?.id]
  );

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dismissedDeadlineIds, setDismissedDeadlineIds] = useState<string[]>([]);
  const [dismissedReady, setDismissedReady] = useState(false);

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
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    const res = await fetch('/api/notifications/mark-all-read', { method: 'POST', credentials: 'include' });
    if (!res.ok) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    setDismissedReady(false);
    try {
      const raw = localStorage.getItem(dismissedStorageKey);
      if (!raw) {
        setDismissedDeadlineIds([]);
        setDismissedReady(true);
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setDismissedDeadlineIds(parsed.filter((id): id is string => typeof id === 'string'));
      } else {
        setDismissedDeadlineIds([]);
      }
    } catch {
      setDismissedDeadlineIds([]);
    } finally {
      setDismissedReady(true);
    }
  }, [dismissedStorageKey]);

  const persistDismissedDeadlines = useCallback((ids: string[]) => {
    setDismissedDeadlineIds(ids);
    try {
      localStorage.setItem(dismissedStorageKey, JSON.stringify(ids));
    } catch {
      // Ignore localStorage write issues
    }
  }, [dismissedStorageKey]);

  const dismissDeadline = (workItemId: string) => {
    setDismissedDeadlineIds(prev => {
      if (prev.includes(workItemId)) return prev;
      const next = [...prev, workItemId];
      try {
        localStorage.setItem(dismissedStorageKey, JSON.stringify(next));
      } catch {
        // Ignore localStorage write issues
      }
      return next;
    });
  };

  const activeWorkItemIds = useMemo(() => new Set(workItems.map(item => item.id)), [workItems]);

  useEffect(() => {
    if (!dismissedReady || workItems.length === 0) return;
    const filtered = dismissedDeadlineIds.filter(id => activeWorkItemIds.has(id));
    if (filtered.length !== dismissedDeadlineIds.length) {
      persistDismissedDeadlines(filtered);
    }
  }, [activeWorkItemIds, dismissedDeadlineIds, dismissedReady, persistDismissedDeadlines, workItems.length]);

  const deadlineItems = useMemo(() => {
    const now = new Date();
    const maxDate = addDays(now, 3);
    const dismissedSet = new Set(dismissedDeadlineIds);

    return workItems
      .filter(item => item.dueDate && item.status !== 'Done')
      .filter(item => {
        const due = new Date(item.dueDate!);
        return isSameDay(due, now) || (due > now && due <= maxDate);
      })
      .filter(item => !dismissedSet.has(item.id))
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [workItems, dismissedDeadlineIds]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    let interval: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (!interval) {
        interval = setInterval(fetchUnreadCount, 30000);
      }
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
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
    deadlineItems,
    dismissDeadline,
    dismissedDeadlineCount: dismissedDeadlineIds.length,
  };
}
