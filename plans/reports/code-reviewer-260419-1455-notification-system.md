# Code Review: Notification System Implementation

**Date:** 2026-04-19
**Reviewer:** code-reviewer agent
**Scope:** Notification system (backend service, routes, scheduler, frontend hook/component)

---

## Overall Assessment

**Score: 7.5/10**

The notification system is well-structured with clean separation of concerns. The implementation covers core functionality (CRUD, real-time count polling, scheduled alerts). However, there are several security, performance, and error handling concerns that should be addressed before production.

---

## Scope

- **Files Reviewed:** 8 files
- **LOC:** ~400 lines
- **Focus:** New notification feature implementation

---

## Critical Issues (Blocking)

### 1. Missing Auth Check in Delete Route - IDOR Vulnerability

**File:** `server/routes/notification.routes.ts` (line 42-52)

The delete route fetches the notification to check ownership, but the check occurs AFTER the notification is fetched. If the delete fails for a non-existent notification, the error message could leak information.

More critically: the `service.delete(req.params.id)` call happens regardless of ownership check due to missing `return` statement.

```typescript
// Current code - ownership check is correct, but needs explicit return
if (!notification || notification.userId !== req.user.userId) {
  return res.status(404).json({ error: 'Not found' });
}
await service.delete(req.params.id);  // This line executes correctly
```

**Status:** The code looks correct on re-inspection. The `return` is present. No issue.

### 2. N+1 Query in Alert Scheduler

**File:** `server/jobs/alert-scheduler.ts` (lines 21-23, 45-49, 74-85)

The scheduler loops over work items and creates notifications one-by-one:

```typescript
for (const item of dueTomorrow) {
  await notificationService.notifyDeadlineWarning(item);  // N individual inserts
}
```

**Impact:** With 100 work items due tomorrow, this creates 100 sequential DB operations.

**Recommendation:** Use `createMany` with batched inserts:

```typescript
const notifications = dueTomorrow
  .filter(item => item.assigneeId)
  .map(item => ({
    userId: item.assigneeId!,
    type: 'deadline_warning',
    title: 'Deadline Approaching',
    message: `"${item.title}" is due tomorrow`,
    entityType: 'WorkItem',
    entityId: item.id,
    priority: 'high' as const,
  }));
await prisma.notification.createMany({ data: notifications });
```

---

## High Priority Issues

### 3. Missing Input Validation on Query Parameters

**File:** `server/routes/notification.routes.ts` (line 13)

```typescript
const limit = parseInt(req.query.limit) || 50;
```

**Issues:**
- No upper bound validation - user could request `?limit=1000000` causing memory exhaustion
- `parseInt` with invalid string returns `NaN`, which is falsy, so defaults to 50 (ok), but no explicit validation

**Recommendation:** Cap the limit:

```typescript
const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 50), 100);
```

### 4. Frontend Error Handling Silently Fails

**File:** `src/hooks/use-notifications.ts` (lines 42-48, 50-54)

```typescript
const markAsRead = async (id: string) => {
  await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  // Optimistically updates state without checking response
```

**Issues:**
- No response status check - if API fails, UI shows read but backend didn't update
- No error handling or user feedback
- State mutation happens regardless of API success

**Recommendation:** Add response validation:

```typescript
const markAsRead = async (id: string) => {
  try {
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to mark as read');
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  } catch (e) {
    console.error('Failed to mark notification as read:', e);
    // Optionally: add toast notification for user feedback
  }
};
```

### 5. Duplicate Notification Risk in Scheduler

**File:** `server/jobs/alert-scheduler.ts`

If the scheduler runs twice (e.g., server restart near 8 AM), users get duplicate notifications. No deduplication logic exists.

**Recommendation:** Add a `lastNotifiedAt` field on WorkItem or create a separate tracking table:

```typescript
// Check if we already notified today
const alreadyNotified = await prisma.notification.findFirst({
  where: {
    userId: item.assigneeId,
    entityType: 'WorkItem',
    entityId: item.id,
    type: 'deadline_warning',
    createdAt: { gte: today },
  },
});
if (!alreadyNotified) {
  await notificationService.notifyDeadlineWarning(item);
}
```

---

## Medium Priority Issues

### 6. Race Condition in unreadCount

**File:** `src/hooks/use-notifications.ts` (line 47)

```typescript
setUnreadCount(prev => Math.max(0, prev - 1));
```

If two notifications are marked as read simultaneously, both will decrement, but the server count might differ. The polling interval (30s) will eventually sync, but UI can be temporarily inconsistent.

**Recommendation:** After marking read, refetch the count:

```typescript
await fetchUnreadCount();
```

### 7. Missing Type Safety

**File:** `server/services/notification.service.ts` (lines 61, 72, 85)

Methods use `any` type for entities:

```typescript
async notifyReportApproved(report: any, approverName: string) {
```

**Recommendation:** Import or define proper types:

```typescript
import { WeeklyReport, WorkItem, Sprint } from '@prisma/client';

async notifyReportApproved(report: WeeklyReport & { userId: string }, approverName: string) {
```

### 8. No Notification Expiry Cleanup

The `expiresAt` field exists in schema but is never used for cleanup. Notifications accumulate indefinitely.

**Recommendation:** Add cleanup job:

```typescript
// In alert-scheduler.ts
async function cleanupExpiredNotifications(prisma: PrismaClient) {
  await prisma.notification.deleteMany({
    where: { expiresAt: { lte: new Date() } }
  });
}
```

### 9. OKR Risk Notification Logic Issue

**File:** `server/jobs/alert-scheduler.ts` (line 69)

```typescript
where: {
  progressPercentage: { lt: progressExpected * 0.5 },
  parentId: { not: null },  // Why only child objectives?
}
```

The filter `parentId: { not: null }` excludes top-level objectives. This may be intentional (only check KR-level) but isn't documented.

---

## Low Priority Issues

### 10. Console.log in Production

**File:** `server/jobs/alert-scheduler.ts` (lines 25, 52, 88, 105)

Multiple `console.log` statements. Consider using a proper logger with levels.

### 11. Missing Loading State in NotificationCenter

**File:** `src/components/layout/NotificationCenter.tsx`

The `loading` state from hook is destructured but never used. Should show skeleton loader.

### 12. Mobile Notification Access

**File:** `src/components/layout/Header.tsx` (line 217)

```typescript
<div className="hidden md:flex items-center gap-2">
  <NotificationCenter />
```

NotificationCenter is hidden on mobile (`hidden md:flex`). Users on phones cannot access notifications.

---

## Positive Observations

1. **Clean Architecture:** Factory pattern for services (`createNotificationService`) enables testability
2. **Proper Auth Integration:** Routes correctly behind auth middleware in server.ts
3. **RBAC on Report Approval:** `RBAC.leaderOrAdmin` check before approving reports
4. **Index Optimization:** Prisma schema has `@@index([userId, isRead])` for efficient filtering
5. **Outside Click Handling:** NotificationCenter properly closes on outside click
6. **Timezone Awareness:** Scheduler uses `Asia/Ho_Chi_Minh` timezone

---

## Edge Cases Found

| Location | Edge Case | Status |
|----------|-----------|--------|
| `markAsRead` | Rapid double-click marks same notification twice | Needs debounce |
| `alert-scheduler` | Server restart near 8 AM triggers duplicate notifications | Needs deduplication |
| `getByUser` | User with 10,000 notifications hits limit=50 but count shows 10,000 | Ok, expected |
| `checkOKRRisks` | Cycle starts/ends same day causes division issues | Edge case not handled |
| `notifySprintEnding` | Sprint with 0 assigned items sends no notifications | Ok, handled |

---

## Security Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Auth on all routes | PASS | Behind `/api` middleware |
| Ownership validation | PASS | markAsRead/delete check userId |
| Input validation | PARTIAL | No limit cap on query params |
| Rate limiting | MISSING | No rate limit on notification routes |
| XSS in message | PASS | React auto-escapes |
| SQL injection | PASS | Prisma parameterized queries |

---

## Recommended Actions (Prioritized)

1. **[HIGH]** Add upper bound to `limit` query parameter (5 min fix)
2. **[HIGH]** Add error handling to frontend `markAsRead` / `markAllAsRead` (15 min)
3. **[HIGH]** Batch notification creation in scheduler to avoid N+1 (30 min)
4. **[MEDIUM]** Add deduplication logic to prevent duplicate notifications (30 min)
5. **[MEDIUM]** Replace `any` types with proper Prisma types (15 min)
6. **[MEDIUM]** Add mobile access to notification center (20 min)
7. **[LOW]** Add notification cleanup job for expired entries
8. **[LOW]** Use proper logger instead of console.log

---

## Unresolved Questions

1. Is the `parentId: { not: null }` filter on OKR risks intentional? Should top-level objectives be monitored?
2. Should notifications have a delete-all option for users?
3. Is 30-second polling interval acceptable, or should WebSocket/SSE be considered for real-time?
4. What happens if `user.fullName` is undefined in `notifyReportApproved`?

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Notification system is functional with good architecture. High-priority fixes needed for production: input validation bounds, frontend error handling, and N+1 query in scheduler.
**Concerns:** Frontend silently fails on API errors; scheduler has duplicate notification risk; no rate limiting on notification routes.
