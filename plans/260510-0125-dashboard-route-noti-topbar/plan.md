---
title: "Dashboard URL rename + Notification overhaul + Topbar enrich"
description: "Rename /ads-overview → /dashboard, replace 154 legacy notifications with 3 ritual-driven types, add breadcrumb + OKR countdown to topbar"
status: complete
priority: P2
effort: 4h
branch: main
tags: [refactor, ux, notification, cron, routing]
created: 2026-05-10
---

## Goal

Tách 3 chunk độc lập:
1. URL `/ads-overview` → `/dashboard` (hard cut, no legacy redirect).
2. Wipe 154 legacy notifications. Replace với 3 ritual-driven types (`daily_new`, `daily_late`, `weekly_late`) + giữ `report_approved`.
3. Topbar enrich: breadcrumb + OKR cycle countdown pill.

## Context Links

- Brainstorm: `plans/reports/brainstorm-260510-0125-dashboard-route-noti-topbar.md`
- Architecture: `docs/system-architecture.md` (post slim-down)
- Project doc: `CLAUDE.md`

## Page Mapping

| Page | URL change | Noti change | Topbar change |
|---|---|---|---|
| Dashboard Overview | `/ads-overview` → `/dashboard` | none | breadcrumb `Analytics › Dashboard` |
| OKRs | `/okrs` (unchanged) | drop `okr_risk` cron | breadcrumb `Planning › OKRs` |
| Daily Sync | `/daily-sync` (unchanged) | +`daily_new`, +`daily_late` | breadcrumb `Rituals › Daily Sync` |
| Weekly Check-in | `/checkin` (unchanged) | +`weekly_late` | breadcrumb `Rituals › Weekly Check-in` |
| Lead Tracker | `/lead-tracker` (unchanged) | none | breadcrumb `CRM › Lead Tracker` |
| Settings | `/settings` (unchanged) | none | breadcrumb `System › Settings` |
| Profile | `/profile` (unchanged) | none | breadcrumb `User › Profile` |

## Key Decisions

| Decision | Rationale |
|---|---|
| Hard cut URL, no legacy redirect | User explicit; wildcard `*` → `/dashboard` catches stale bookmarks |
| Truncate Notification table | 154 rows toàn legacy, không có signal value |
| Drop `notifyFailure` + `checkOKRRisks` | User: "no other notifications besides 3 + report_approved" |
| Cron timezone `Asia/Ho_Chi_Minh` explicit | Avoid UTC drift on production deploy |
| Dedup key `${userId}:${dateISO}` | Idempotent re-runs sau daemon restart |
| Topbar OKR pill hidden if no active cycle | Graceful fail; không spam users in setup |
| Breadcrumb static map + capitalize fallback | KISS; mới route thì add map entry |

## Phases

| Phase | Title | Effort | Status | Dependency |
|---|---|---|---|---|
| 1 | URL rename `/ads-overview` → `/dashboard` | 10m | complete | none |
| 2 | Notification overhaul (DB wipe + 3 types + cron) | 2.5h | complete | none |
| 3 | Topbar enrich (breadcrumb + OKR pill) | 45m | complete | none |

Recommend: Phase 1 first (trivial), sau đó Phase 2 + 3 parallel.

## Top Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Cron timezone misconfig → spam users | High | Explicit `timezone: 'Asia/Ho_Chi_Minh'`; dev test với `*/5 * * * *` first |
| Race in dedup nếu daemon restart double-fire | Med | `findFirst` before insert; defer unique index unless seen |
| OKR endpoint fail → topbar render error | Low | Hook returns null on error; component returns null |
| Cron empty recipients (no Leader trong dept) | Low | Filter `if (recipientIds.length > 0)` before insert |

## Success Metrics

- `npm run typecheck` + `npm run build` clean
- URL `/dashboard?tab=sale` renders Sale tab
- POST `/api/daily-reports` → Leader+Admin notification count ≥ 1
- Notification table = 0 sau truncate, chỉ accumulate 4 types valid
- Topbar shows correct breadcrumb cho 7 routes
- OKR pill click → `/okrs`
- Manual cron trigger → correct lateUsers count, dedup re-run = 0 new rows

## Unresolved Questions

- Notification rate limiting? (e.g., max 3 lates/day cho 1 user) — defer cho đến khi seen spam.
- Báo cáo cuối tháng (`monthly_late`)? — out of scope, brainstorm later.
- Email/Slack fanout cho notification? — out of scope, in-app only Phase 2.

## Completion Notes

**All 3 phases shipped and merged to main (uncommitted).**

**Code review findings applied:**
- C1 (CRITICAL): Fixed `previousFridayICT` off-by-one bug by replacing `getUTCDay()` with `Intl.DateTimeFormat({weekday})` ICT lookup. Verified all 7 weekdays return correct Friday.
- H1+H2 (High): Added `@@unique([userId, type, entityType, entityId], name: 'notification_dedup')` + `@@index([type, entityType, entityId])` to schema.prisma. Switched dedup pattern to atomic `createMany({skipDuplicates:true})` in notification service.
- M3 (Medium): Replaced `console.error` with `childLogger` in daily-reports route handler.
- M1, M2, L1-L4 deferred per plan unresolved-questions (acceptable — non-blocking observational notes).

**Verification:**
- `npm run typecheck` + `npm run build` clean.
- Notification table = 0 rows after truncate; accumulateds only valid 4 types.
- Server hot-reloaded with new scheduler crons.
- `/dashboard` SPA 200; breadcrumb + OKR pill render correctly.
- Dedup verified: 2× run same day = identical row count.
