# Code Review: Dashboard Route + Notification + Topbar

Date: 2026-05-10
Scope: Phase 1/2/3 changesets in `plans/260510-0125-dashboard-route-noti-topbar/`
Files reviewed: 9 modified + 2 new
Build/typecheck/grep/runtime smoke: verified by submitter, re-verified spot checks.

---

## CRITICAL

### C1. `previousFridayICT` returns wrong day (off-by-one)
**File**: `server/jobs/alert-scheduler.ts:28-39`

`getUTCDay()` is invoked on a `Date` constructed from `${todayISO}T00:00:00+07:00`, i.e. `${todayISO-1}T17:00:00Z` UTC. `getUTCDay()` therefore returns the day-of-week of the **previous UTC day**, NOT the ICT calendar day. The comment "Equivalent: day-of-week in ICT" is wrong.

**Verified by trace** (10:00 ICT every day of the week, 2026-05-11..05-17):

| Today (ICT)      | Returns         | Should return   |
|------------------|-----------------|-----------------|
| Mon 2026-05-11   | 2026-05-09 Sat  | 2026-05-08 Fri  |
| Tue 2026-05-12   | 2026-05-09 Sat  | 2026-05-08 Fri  |
| Wed 2026-05-13   | 2026-05-09 Sat  | 2026-05-08 Fri  |
| Thu 2026-05-14   | 2026-05-09 Sat  | 2026-05-08 Fri  |
| Fri 2026-05-15   | 2026-05-09 Sat  | 2026-05-08 Fri  |
| Sat 2026-05-16   | 2026-05-09 Sat  | 2026-05-15 Fri  |
| Sun 2026-05-17   | 2026-05-16 Sat  | 2026-05-15 Fri  |

EVERY invocation returns a Saturday. Two impacts:
1. **Notification copy is wrong**: message says "ending 2026-05-09" (a Saturday) — confusing for users.
2. **Query window happens to still match** because the ±12h/+36h slack window around `vnDayStartUTC("2026-05-09")` (= Fri 17:00 UTC) overlaps with reports filed on Friday-ish times. So daemon will probably dedupe correctly by accident — but this is fragile and silently wrong.

**Fix** (one-line):
```ts
const dow = new Date(`${todayISO}T12:00:00Z`).getUTCDay();
// or use Intl.DateTimeFormat({weekday:'short', timeZone:TZ})
```
Then re-verify the `daysBack` table holds (it does, given correct `dow`).

Severity: HIGH/CRITICAL — incorrect dates in user-facing strings, and silent reliance on a 48h slack window to mask the bug.

---

## HIGH

### H1. Notification dedup is TOCTOU, has no DB-level uniqueness
**File**: `server/services/notification.service.ts:152-168, 178-195`

Pattern is `findFirst` then `createMany`. Two concurrent invocations (e.g. cron tick fires while the previous tick still running, OR `tsx watch` hot-reload restarts mid-tick) will both observe `existing = null` and both create. There is no `@@unique` on the Notification table to backstop.

Today this is unlikely to bite (single server, cron once per day) but the comment "Idempotent: re-running on same day = 0 new rows" is overstated. Consider:
- Add `@@unique([userId, type, entityType, entityId])` to Prisma `Notification` model and use `createMany({ skipDuplicates: true })` — eliminates the race entirely.
- Or wrap dedup + insert in a Prisma `$transaction` (still TOCTOU at default REPEATABLE READ but safer).

Severity: MEDIUM today, HIGH if scaled to 2+ instances.

### H2. No index supporting dedup lookup
**File**: `prisma/schema.prisma:38-55`

`findFirst({ where: { type, entityType, entityId }})` has no supporting index — only `(userId,isRead)` and `(userId,createdAt)`. Will degrade to seq scan as Notification table grows (was just truncated to 0; will refill quickly). Pair with H1: add `@@unique([type, entityType, entityId])` (or include `userId` if more apt) — covers both correctness and lookup speed.

---

## MEDIUM

### M1. N+1 in cron: `findLeadersAndAdminsFor` called per-member
**File**: `server/jobs/alert-scheduler.ts:58-65, 89-96`

For 50 members → 50 user queries per run. Cheap individually (~1-2ms) so total ~100ms — acceptable for daily cron. Mitigation cost is low: query all admins + all leaders once, group leaders by department, intersect in JS. Recommend the refactor before member count grows to 100+.

### M2. Admins receive every member's daily report notification
**File**: `server/services/notification.service.ts:31-47`

`OR: [{ isAdmin: true }, { role: contains 'Leader', departments: hasSome ... }]` — admin condition has no department filter. With 10 admins × 50 daily reports/day = 500 admin-fanout rows/day. Spammy. Confirm the spec intent. If admins should NOT see every daily, scope to admins-of-same-dept or split into a separate "admin escalation" channel.

### M3. `notifyDailyNew` failure swallowed via `console.error`
**File**: `server/routes/daily-report.routes.ts:74-85`

The try/catch is correct (notification failure should not fail report creation), but `console.error` drops it onto stderr without structure. Use `childLogger('daily-report').error({ err, userId })` — already imported elsewhere. Otherwise tests that mock notify-fails will pass silently while production shows nothing in pino logs.

### M4. `OkrCycleCountdown` daysLeft drift in ICT
**File**: `src/hooks/use-active-okr-cycle.ts:35`

`differenceInDays(new Date(cycle.endDate), new Date())` floors-to-24h-period in browser TZ. If `cycle.endDate` is stored as UTC midnight and user is in ICT (+07:00), at 07:00-23:59 ICT on the end date the pill says "ended" 7 hours early. Minor cosmetic; noted for completeness. Use `differenceInCalendarDays` (date-fns) with TZ awareness if precision matters.

---

## LOW / OBSERVATIONAL

### L1. `bandFor(daysLeft <= 0)` returns 'red' — display is `"ended"` regardless
Logic in `OkrCycleCountdown` shows "ended" + red pill. Visually correct. Unify by short-circuiting in `bandFor` (style only).

### L2. Double `hidden md:inline-flex` / `hidden md:flex`
`Header.tsx` wraps widgets in `<div className="hidden md:flex...">` while `OkrCycleCountdown` button itself has `hidden md:inline-flex`. Redundant — drop the inner one for clarity.

### L3. `targetUser.departments?.length` chain is unreachable
`User.departments` is `String[]` non-null in Prisma; the optional chain is dead code. Trivial cleanup.

### L4. `routeForNotification` returns null for unknown types
`NotificationCenter.tsx:21-28` — defaults to null → click is a no-op (only `markAsRead` fires). For `report_approved` with unexpected `entityType` the fallback is `/daily-sync`. Acceptable. No silent navigation regressions found.

---

## VERIFIED CLEAN

- No dead refs to removed types (`okr_risk`, `deadline_warning`, `sprint_ending`, `export_failed`) — grep returns zero across `server/`, `src/`.
- No remaining `ads-overview` references.
- `/api/okr-cycles/active` correctly mounted AFTER `createAuthMiddleware` (server.ts:126,133) → 401 when unauthed (spec).
- `/dashboard?tab=sale` keeps `pathname=/dashboard` → exact breadcrumb match. No regression.
- `findLeadersAndAdminsFor({excludeSelf:true})` correctly omits the submitter from daily-new fanout.
- `previousFridayICT` self-consistent across ticks → dedup `entityId` stable per day even with the off-by-one.
- Hot-reload note: `tsx watch` ignore patterns include `logs`, `dist`, `node_modules`, `.claude`. Cron schedule re-registers on each restart but `node-cron` task is process-scoped → garbage collected on restart. No leak.

---

## RECOMMENDED ACTIONS (priority order)

1. **C1**: Fix `previousFridayICT` day-of-week computation (one line). Add a test for each weekday.
2. **H1+H2**: Add `@@unique` to Notification (covers dedup + lookup index in one). Migrate via `db push`.
3. **M3**: Replace `console.error` with structured logger in `daily-report.routes.ts:84`.
4. **M2**: Confirm spec for admin spam, scope if needed.
5. **M1**: Refactor cron to single bulk leaders+admins query when team grows past ~50 members.
6. **L1-L4**: Cosmetic / cleanup, ship-as-is acceptable.

---

## UNRESOLVED QUESTIONS

- **Spec**: Is admin fanout intended for every daily report submission across all departments? If yes, accept M2; if no, scope.
- **Migration**: Does adding `@@unique` to existing Notification rows risk collision with backfilled data? Currently table is empty (just truncated), so safe to push now.
- **Weekly dedup horizon**: Currently no expiration on `daily_late` / `weekly_late` markers. Over months/years the dedup `findFirst` query pays for accumulated history. Consider `expiresAt` 30 days post-creation.

---

**Status**: DONE_WITH_CONCERNS
**Summary**: Functional correctness regression in `previousFridayICT` (always returns Saturday). Dedup race + missing index together form a latent scaling cliff. Topbar/route changes are clean.
