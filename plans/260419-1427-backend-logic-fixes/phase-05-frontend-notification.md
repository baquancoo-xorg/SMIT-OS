# Phase 5: Frontend Notification Center

**Priority:** Medium
**Estimated:** 2 hours
**Status:** pending
**Depends on:** Phase 4

## Overview

Create notification UI in Header with badge, dropdown list, and mark-as-read functionality.

## Component Design

```
Header
├── NotificationCenter (new)
│   ├── Bell icon with badge
│   ├── Dropdown panel
│   │   ├── Header ("Notifications" + "Mark all read")
│   │   ├── NotificationList
│   │   │   └── NotificationItem (icon, title, message, time, read status)
│   │   └── Empty state
```

## Implementation Steps

### 1. Create useNotifications hook

```typescript
// src/hooks/use-notifications.ts
import { useState, useEffect, useCallback } from 'react';

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

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=20');
      if (res.ok) setNotifications(await res.json());
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/unread-count');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (e) {
      console.error('Failed to fetch unread count:', e);
    }
  }, []);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, refresh: fetchNotifications };
}
```

### 2. Create NotificationCenter component

```typescript
// src/components/layout/NotificationCenter.tsx
import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../hooks/use-notifications';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'report_approved': return '✓';
      case 'deadline_warning': return '⚠';
      case 'sprint_ending': return '🏃';
      case 'okr_risk': return '📊';
      default: return '🔔';
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
      >
        <Bell size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={32} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-sm text-slate-400">No notifications</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                    className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
                      !n.isRead ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="text-lg">{getIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### 3. Add to Header

```typescript
// src/components/layout/Header.tsx
import NotificationCenter from './NotificationCenter';

// In the widgets section (line ~215-218):
<div className="hidden md:flex items-center gap-2">
  <NotificationCenter />
  <DateCalendarWidget workItems={allWorkItems} />
  <SprintContextWidget onViewBacklog={() => onViewChange?.('backlog')} />
</div>
```

## Files to Create

- `src/hooks/use-notifications.ts`
- `src/components/layout/NotificationCenter.tsx`

## Files to Modify

- `src/components/layout/Header.tsx`

## Checklist

- [ ] Create useNotifications hook
- [ ] Create NotificationCenter component
- [ ] Add to Header
- [ ] Test badge count
- [ ] Test dropdown
- [ ] Test mark as read
- [ ] Test polling
