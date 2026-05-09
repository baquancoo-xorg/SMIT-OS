# Dashboard URL rename + Notification overhaul + Topbar enrich

**Date**: 2026-05-10 01:25  
**Severity**: Medium  
**Component**: Routing, Notifications, UI  
**Status**: Shipped & merged

## What Shipped

Three independent chunks completed in one session:

1. **URL rename** — `/ads-overview` → `/dashboard` hard cut. No legacy redirect; wildcard `*` catches stale bookmarks.
2. **Notification table wipe** — Dropped 154 legacy rows (deadline_warning, sprint_ending, export_failed, 1 test). Replaced with 3 ritual-driven types: `daily_new`, `daily_late`, `weekly_late`. Kept `report_approved`. Deleted `notifyFailure` handler + `checkOKRRisks` cron entirely per user explicit request.
3. **Topbar enrichment** — Added 7-route static breadcrumb map (Analytics › Dashboard, Planning › OKRs, etc.) + OKR cycle countdown pill (green >30d / amber 7-30d / red <7d). Hidden on mobile/loading/error/no-cycle.

## Key Decisions Worth Recalling

- **Hard cut over redirect** — User explicit. Wildcard is the safety net; no TOFU redirect logic needed.
- **Truncate over migrate** — 154 rows were 100% noise with zero user signal. Zero breakage.
- **Inline TZ math, no date-fns-tz** — Used `Intl.DateTimeFormat({timeZone, weekday})` + ISO parsing. One less dependency.
- **Dedup via `@@unique` constraint** — Atomic, no TOCTOU race. `createMany({skipDuplicates:true})` replaces error-prone `findFirst` → `create`. Schema needed `--accept-data-loss` (safe; table was 0 rows post-truncate).
- **Notification fanout failure wrapped in try/catch** — POST `/api/daily-reports` must not block on leader/admin notification send. Structured logger captures failures.
- **2× ICT-scheduled crons** — Mon-Fri 10:30 daily-late, Mon 09:00 weekly-late. Timezone explicit `Asia/Ho_Chi_Minh`.

## Bugs Caught + Fixed

**C1 (CRITICAL: Timezone DoW off-by-one)** — `previousFridayICT` used `getUTCDay()` on a `+07:00`-anchored Date, returning the previous UTC day's DoW. Every weekday returned Saturday. Caught by code-reviewer's runtime trace. Fixed with `Intl.DateTimeFormat({weekday: 'short', timeZone: 'Asia/Ho_Chi_Minh'})` lookup. **Lesson: timezone-aware day-of-week needs a TZ-aware API, not Date arithmetic.**

**H1+H2 (TOCTOU dedup + missing index)** — Original `findFirst → if !exists → createMany` is race-prone on hot-reload. Switched to `@@unique([userId, type, entityType, entityId])` + atomic `skipDuplicates`. Reviewer also flagged missing index; added `@@index([type, entityType, entityId])`.

## Verification

- `npm run typecheck` + `npm run build` clean.
- Dedup smoke test: 2× consecutive runs = identical row count. ✓
- Server hot-reload logged "alert-scheduler initialized: daily-late Mon-Fri 10:30, weekly-late Mon 09:00" with TZ Asia/Ho_Chi_Minh. ✓
- `/dashboard` SPA 200; breadcrumb + OKR pill render correctly. ✓
- Notification table = 0 rows post-truncate; valid 4 types only. ✓

## Ship State

5 commits pushed to origin/main: `07f525b`, `60b76f0`, `d9f0d90`, `0f72d38`, `b125efb`. All phases complete, code-review fixes applied, merged. Ready for prod.
