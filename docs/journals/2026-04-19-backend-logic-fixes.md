# Backend Logic Fixes: Sprint Bug + Notification System

**Date**: 2026-04-19 15:00
**Severity**: Critical (sprint bug) / High (missing notifications)
**Component**: Sprint management, Notification system
**Status**: Resolved

## What Happened

Sprint display broke every final day of a sprint cycle. Users saw "No active sprint" on April 19 despite Sprint 2 running through that day. Root cause: timestamp comparison hell. Additionally, the entire notification system was nonexistent - just visual badges, no actual alerts.

## The Brutal Truth

The sprint bug was embarrassing. A classic time-zone-ignorant date comparison that every developer has written at 2am and regretted at 9am. The date stored as `2026-04-19 00:00:00` failed against `2026-04-19 14:30:04` because nobody thought "end of day" meant "start of day timestamp."

The notification system being completely absent? That's months of "we'll add it later" finally coming due.

## Technical Details

**Sprint Bug:**
```typescript
// BEFORE: Broken on final sprint day
const today = new Date(); // 14:30:04
endDate: { gte: today }   // 00:00:00 >= 14:30:04 = FALSE

// AFTER: Normalize to midnight
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);
```

**Notification System Built:**
- Prisma model with `userId`, `type`, `title`, `message`, `isRead`, `relatedId` + indexes
- `NotificationService` with CRUD + batch operations
- REST endpoints: `GET /notifications`, `PATCH /:id/read`, `POST /mark-all-read`
- `alert-scheduler.ts` runs daily 8:00 AM: deadline warnings, sprint endings, OKR risk alerts
- Frontend `NotificationCenter` component integrated into Header

## What We Tried

Date fix was straightforward. The notification system went through three iterations:
1. WebSocket approach - overkill for MVP, scrapped
2. Polling every 30s - simple, works, shipped
3. Batch creation for schedulers - added after code review flagged N+1 queries

## Root Cause Analysis

**Sprint bug:** Lazy date handling. We stored dates without considering timezone or time-of-day implications. Every sprint's final day was effectively skipped.

**Missing notifications:** Scope creep avoidance became scope neglect. The "visual indicators only" approach was a band-aid that became permanent.

## Lessons Learned

1. **Date comparisons need explicit time handling.** Either normalize both sides or use date-only types.
2. **Build notifications early.** Retrofitting them touches every feature that should have triggered alerts.
3. **Code review caught real issues:** Input validation bounds (what if negative page?), missing frontend error handling, N+1 in batch operations.

## Next Steps

- [ ] Monitor scheduler logs for first week of production alerts
- [ ] Add email integration for critical notifications (blocked for now)
- [ ] Consider WebSocket upgrade if polling causes load issues
- [ ] Sprint bug verified manually; add automated test for final-day edge case

---

**Files Modified:**
- `server/routes/sprint.routes.ts` - date normalization fix
- `prisma/schema.prisma` - Notification model
- `server/services/notification.service.ts` - new
- `server/routes/notification.routes.ts` - new  
- `server/jobs/alert-scheduler.ts` - new
- `src/hooks/use-notifications.ts` - new
- `src/components/layout/NotificationCenter.tsx` - new
- `src/components/layout/Header.tsx` - integration
- `server.ts` - route + scheduler registration

**Stats:** 6 phases, ~8h effort, tests passed, code review 7.5/10
