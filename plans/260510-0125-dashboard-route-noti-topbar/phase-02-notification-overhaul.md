# Phase 2 — Notification overhaul

## Context Links

- Plan overview: `./plan.md`
- Brainstorm: `../reports/brainstorm-260510-0125-dashboard-route-noti-topbar.md`
- Architecture: `docs/system-architecture.md`
- DB schema: `prisma/schema.prisma` (Notification model)

## Overview

- **Date:** 2026-05-10
- **Priority:** P2
- **Status:** complete
- **Review status:** complete
- **Effort:** 2.5h
- **Description:** Wipe 154 legacy notifications. Drop `export_failed` + `okr_risk` + `deadline_warning` + `sprint_ending`. Add 3 ritual-driven types: `daily_new`, `daily_late`, `weekly_late`. Keep `report_approved`. Cron registered with `Asia/Ho_Chi_Minh` timezone.

## Key Insights

- Existing 154 rows = legacy noise (124 deadline_warning, 15 sprint_ending, 14 export_failed, 1 test). Truncate safe — không ai depend trên historical data.
- Cron `node-cron` đã trong deps; chỉ cần register new schedules.
- Recipient query reusable: `[admin] + [leader của dept]`. Helper function tránh DRY violation.
- Dedup via existing notification record (findFirst by type+entityId) đủ KISS; không cần unique index defense unless seen race.
- `report_approved` đã work; chỉ tweak frontend click navigation.

## Requirements

### Functional

- DB: Notification table starts empty after deploy.
- Posting daily report → emit `daily_new` to Leader(same dept) + Admin (NOT submitter).
- Mon-Fri 10:30 ICT: emit `daily_late` cho mỗi Member chưa submit hôm nay. Recipients: lateUser + Leader + Admin. Dedup per `${userId}:${YYYY-MM-DD}`.
- Monday 09:00 ICT: emit `weekly_late` cho mỗi Member chưa submit weekly cho tuần vừa kết thúc. Recipients tương tự. Dedup per `${userId}:${weekEnding}`.
- `report_approved` notifications giữ nguyên trigger; click → navigate based on `entityType`.
- Frontend NotificationCenter: icon mapping cho 4 types + click navigation logic.

### Non-functional

- Cron timezone explicit `Asia/Ho_Chi_Minh`.
- Dedup idempotent: 2× run cùng ngày = 0 new rows.
- Empty recipients case (no Leader in dept) → skip insert, no error.
- `npm run typecheck` clean.
- Manual smoke pass cho 4 scenarios trong Implementation Steps.

## Architecture

```
DB Layer
  Notification (truncated)
    ├─ type: 'daily_new' | 'daily_late' | 'weekly_late' | 'report_approved'
    ├─ entityType: 'DailyReport' | 'WeeklyReport'
    └─ entityId: report.id (cho new/approved) hoặc dedupKey (cho late)

Service Layer (server/services/notification.service.ts)
  ├─ notifyReportApproved (KEEP)
  ├─ notifyDailyReportApproved (KEEP)
  ├─ notifyDailyNew(report, recipientIds[])         (NEW)
  ├─ notifyDailyLate(lateUser, recipientIds[])      (NEW)
  ├─ notifyWeeklyLate(lateUser, weekEnding, recipientIds[])  (NEW)
  └─ findRecipientsForUser(user) helper             (NEW; admins + leaders of user.departments)

  REMOVE: notifyFailure (sheets-export.service)
  REMOVE: checkOKRRisks cron + handler

Cron Layer (server/jobs/alert-scheduler.ts)
  ├─ '30 10 * * 1-5' ICT → checkDailyLate    (NEW)
  ├─ '0 9 * * 1' ICT → checkWeeklyLate       (NEW)
  └─ existing checkOKRRisks (REMOVE)

Trigger Layer
  ├─ daily-report.routes.ts POST → call notifyDailyNew
  ├─ daily-report.routes.ts POST /:id/approve → existing notifyDailyReportApproved (KEEP)
  └─ weekly-report.routes.ts POST /:id/approve → existing notifyReportApproved (KEEP)

Frontend (src/components/layout/NotificationCenter.tsx)
  ├─ Icon map: report_approved=✓, daily_new=🆕, daily_late=⏰, weekly_late=📅
  └─ Click handler → navigate based on type/entityType
```

### Recipient Resolution

```ts
async function findRecipientsForUser(targetUser: User): Promise<string[]> {
  const recipients = await prisma.user.findMany({
    where: {
      OR: [
        { isAdmin: true },
        { role: { contains: 'Leader' }, departments: { hasSome: targetUser.departments } },
      ],
    },
    select: { id: true },
  });
  return [...new Set([targetUser.id, ...recipients.map(r => r.id)])];
}
```

For `daily_new` (Leader/Admin only, exclude submitter):
```ts
where: {
  OR: [
    { isAdmin: true },
    { role: { contains: 'Leader' }, departments: { hasSome: req.user.departments } },
  ],
  NOT: { id: req.user.id },
}
```

## Related Code Files

### Modify

- `prisma/schema.prisma` — verify Notification model có fields cần (no schema change expected).
- `server/services/notification.service.ts` — add 3 new methods + helper; keep approval methods.
- `server/services/sheets-export.service.ts` — remove `notifyFailure()` method + call site.
- `server/jobs/alert-scheduler.ts` — drop `checkOKRRisks`; add 2 new schedules.
- `server/routes/daily-report.routes.ts` — POST handler call `notifyDailyNew` after `prisma.dailyReport.create`.
- `src/components/layout/NotificationCenter.tsx` — icon map + click navigation.

### Create

- None (helpers live trong notification.service.ts).

### Delete

- None (just remove methods/handlers within existing files).

### DB Operation

- Run via `psql` or migration: `TRUNCATE "Notification";`. Recommend manual psql one-shot vì Prisma không có truncate native.

## Implementation Steps

### 2.1 Cleanup

1. Connect psql: `psql postgresql://postgres:password@localhost:5435/smitos_db`. Run `TRUNCATE "Notification";`. Verify `SELECT COUNT(*) FROM "Notification";` = 0.
2. Open `server/services/sheets-export.service.ts`. Remove `notifyFailure()` method definition. Grep all callers; remove invocation. Confirm typecheck clean.
3. Open `server/jobs/alert-scheduler.ts`. Locate `checkOKRRisks` cron registration + handler function. Remove both. Confirm cron startup logs đủ thiếu OKR job.

### 2.2 Service helpers

4. Open `server/services/notification.service.ts`. Add at module scope:

```ts
export async function findLeadersAndAdminsFor(targetUser: { id: string; departments: string[] }, opts?: { excludeSubmitter?: boolean }) {
  const where: Prisma.UserWhereInput = {
    OR: [
      { isAdmin: true },
      { role: { contains: 'Leader' }, departments: { hasSome: targetUser.departments } },
    ],
  };
  if (opts?.excludeSubmitter) (where as any).NOT = { id: targetUser.id };
  const users = await prisma.user.findMany({ where, select: { id: true } });
  return users.map(u => u.id);
}
```

5. Add method `notifyDailyNew(report: DailyReport, recipientIds: string[])`:
   - For each recipientId, `prisma.notification.create({ data: { userId: recipientId, type: 'daily_new', entityType: 'DailyReport', entityId: report.id, message: ... } })`.
   - Skip if `recipientIds.length === 0`.

6. Add method `notifyDailyLate(lateUser: User, recipientIds: string[])`:
   - dedupKey = `${lateUser.id}:${formatISO(todayStart, { representation: 'date' })}`.
   - findFirst notification where `type='daily_late' AND entityId=dedupKey AND userId=recipientIds[0]` → if exists, return.
   - Else for each recipientId: insert with `entityId: dedupKey, entityType: 'DailyLateMarker'`.

7. Add method `notifyWeeklyLate(lateUser: User, weekEnding: Date, recipientIds: string[])`:
   - dedupKey = `${lateUser.id}:${formatISO(weekEnding, { representation: 'date' })}`.
   - Same pattern as `notifyDailyLate`.

### 2.3 Cron registration

8. Open `server/jobs/alert-scheduler.ts`. Add:

```ts
import { startOfDay, subDays, previousFriday } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TZ = 'Asia/Ho_Chi_Minh';

cron.schedule('30 10 * * 1-5', checkDailyLate, { timezone: TZ });
cron.schedule('0 9 * * 1', checkWeeklyLate, { timezone: TZ });
```

9. Implement `checkDailyLate`:
   - todayStart = startOfDay(toZonedTime(new Date(), TZ)).
   - submittedUserIds = Set((await prisma.dailyReport.findMany({ where: { reportDate: todayStart }, select: { userId: true } })).map(r => r.userId)).
   - activeMembers = await prisma.user.findMany({ where: { role: 'Member' /* + active filter if exists */ } }).
   - For each member not in submittedUserIds:
     - recipients = await findLeadersAndAdminsFor(member); add member.id.
     - if recipients.length === 0 → skip.
     - notifyDailyLate(member, recipients).

10. Implement `checkWeeklyLate`:
    - now = new Date(). weekEnding = previousFriday(toZonedTime(now, TZ)) (Friday vừa qua).
    - Reset to startOfDay(weekEnding).
    - submittedUserIds = (prisma.weeklyReport.findMany where weekEnding=weekEnding).map userId.
    - activeMembers = prisma.user.findMany where role='Member'.
    - For each lateUser: notifyWeeklyLate(lateUser, weekEnding, recipients).

### 2.4 Trigger wiring

11. Open `server/routes/daily-report.routes.ts`. Locate POST `/` handler (create endpoint). After `const report = await prisma.dailyReport.create(...)`, add:

```ts
const recipientIds = await findLeadersAndAdminsFor(req.user!, { excludeSubmitter: true });
if (recipientIds.length > 0) {
  await notifyDailyNew(report, recipientIds);
}
```

### 2.5 Frontend

12. Open `src/components/layout/NotificationCenter.tsx`. Update icon map const:

```ts
const ICON_MAP: Record<string, string> = {
  report_approved: '✓',
  daily_new: '🆕',
  daily_late: '⏰',
  weekly_late: '📅',
};
```

13. Add click handler:

```ts
function handleClick(noti: Notification) {
  markAsRead(noti.id);
  if (noti.type === 'daily_new' || noti.type === 'daily_late') navigate('/daily-sync');
  else if (noti.type === 'weekly_late') navigate('/checkin');
  else if (noti.type === 'report_approved') {
    navigate(noti.entityType === 'WeeklyReport' ? '/checkin' : '/daily-sync');
  }
}
```

### 2.6 Manual smoke test

14. Restart dev server. Confirm cron logs hiện 2 jobs registered with `Asia/Ho_Chi_Minh` tz.
15. Login as Member. POST `/api/daily-reports` (via UI submit). Query `SELECT * FROM "Notification" WHERE type='daily_new';` — expect ≥1 row, recipient = Leader/Admin id, NOT member.id.
16. Login as Leader. Approve daily report. Query for `report_approved` — expect 1 row to submitter.
17. Temporarily call `checkDailyLate()` directly (export + invoke from a one-shot script). Verify count of new rows = activeMembers without submission today × recipients per. Re-run → 0 new (dedup works).
18. Same for `checkWeeklyLate`.

## Todo Checklist

- [x] `TRUNCATE "Notification"` executed; row count = 0
- [x] Remove `notifyFailure()` method + call site in sheets-export.service.ts
- [x] Remove `checkOKRRisks` cron + handler from alert-scheduler.ts
- [x] Add `findLeadersAndAdminsFor()` helper in notification.service.ts
- [x] Add `notifyDailyNew()` method
- [x] Add `notifyDailyLate()` method with dedup logic
- [x] Add `notifyWeeklyLate()` method with dedup logic
- [x] Register cron `30 10 * * 1-5` (daily late) with TZ
- [x] Register cron `0 9 * * 1` (weekly late) with TZ
- [x] Implement `checkDailyLate` handler
- [x] Implement `checkWeeklyLate` handler
- [x] Wire `notifyDailyNew` in daily-report.routes.ts POST
- [x] Update NotificationCenter icon map (4 types)
- [x] Update NotificationCenter click handler routing
- [x] `npm run typecheck` clean
- [x] Smoke 1: daily_new emits to Leader/Admin (not submitter)
- [x] Smoke 2: report_approved emits to submitter
- [x] Smoke 3: checkDailyLate manual trigger emits correct count
- [x] Smoke 4: checkDailyLate re-run = 0 new rows (dedup)
- [x] Smoke 5: checkWeeklyLate manual trigger correct
- [x] Smoke 6: notification click navigates correct page

## Success Criteria

- Notification table chỉ contain 4 valid types (`daily_new`, `daily_late`, `weekly_late`, `report_approved`).
- `SELECT type, COUNT(*) FROM "Notification" GROUP BY type;` no `export_failed`/`deadline_warning`/`sprint_ending`/`okr_risk`.
- POST daily report creates ≥1 `daily_new` row, recipients ≠ submitter.
- Cron dedup: 2× consecutive trigger of same day = same row count (no duplicates).
- Empty Leader/Admin pool case không throw, just skip.
- Frontend NotificationCenter shows icons correctly + click navigates correct page.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cron timezone misconfig → fires off-hours | Med | High | Explicit TZ option; dev test với `*/5 * * * *` first |
| Daemon restart fires cron twice in window → dup rows | Low | Med | findFirst dedup check; entityId-based key |
| Empty recipients → throw error | Low | Low | Guard `if (recipientIds.length > 0)` |
| Truncate misses cascade FK | Low | Med | Verify Notification has no children; use TRUNCATE CASCADE if needed |
| Member role string mismatch (e.g., 'member' lowercase) | Med | High | Confirm enum/string convention via grep before query |
| Date math off-by-one cho previousFriday near Sunday | Low | Med | Unit verify via console.log on dev before deploy |
| User without departments → hasSome empty array → query returns all | Med | Med | Pre-filter `if (!user.departments?.length) return [adminIds]` |

## Security Considerations

- Notification reveals user existence to recipients. Acceptable: Leaders intended to know members of their dept.
- No PII in notification message beyond user display name. Confirm message template không leak email/phone.
- Truncate is destructive; back up DB before run if any historical query risk. (User confirmed no value → proceed.)

## Next Steps

- Independent of Phase 1 + 3.
- Post-deploy: monitor first cron fire (Mon 10:30 ICT) — alert if no rows when expected.
- Future: rate limiting, email/Slack fanout, monthly cron.
