# Docs Sync Report: v2.3.1 Shipped (2026-05-10)

## Files Updated
1. **`docs/project-changelog.md`** — Added v2.3.1 entry, corrected v2.3.0 staleness
2. **`docs/system-architecture.md`** — Updated route map, added Notification System section

## Changes Made

### project-changelog.md
- **Added v2.3.1 entry** (2026-05-10) covering 3 phases:
  - URL rename: `/ads-overview` → `/dashboard` (hard cut)
  - Notification refactor: 4 active types, 2 new crons (10:30 ICT daily, 09:00 ICT Monday), dedup constraint, dropped OKR risk job + sheets-export alerts
  - Topbar enrich: OkrCycleCountdown hook + component, breadcrumb map in Header
  - QA gate: typecheck, build, hot-reload, dedup smoke test
- **Fixed v2.3.0 staleness:**
  - Added v2.3.1 cross-reference annotations to dropped items (notifyFailure, checkOKRRisks)
  - Clarified route changes were superseded by v2.3.1 (/ads-overview → /dashboard)
  - Still lists context (e.g., 3 notification handlers dropped) with "(removed in v2.3.1)" tag for traceability

### system-architecture.md
- **Route Map section (line 197):** Updated `/ads-overview` → `/dashboard` with v2.3.1 version note
- **New section: Notification System & Alerts (lines 162–184):**
  - Table: 4 active types (report_approved, daily_new, daily_late, weekly_late) with triggers & recipients
  - Dedup constraint & atomic createMany pattern explained
  - 2 alert crons table (checkDailyLate, checkWeeklyLate) with timezone & schedules
  - Daily report flow: notifyDailyNew fans out to leaders/admins, failures caught
  - Dropped items (v2.3.0–v2.3.1): OKR risk, notifyFailure, deadline/sprint watchers

## Staleness Corrected
- ✅ v2.3.0 "alert-scheduler now only checks OKR risks" — corrected with dropped items note + v2.3.1 reference
- ✅ v2.3.0 notification types — cross-referenced with v2.3.1 clarification (4 active types, legacy 2 removed)
- ✅ Route references — `/ads-overview` → `/dashboard` in both docs + changelog v2.3.1 entry
- ✅ Legacy cron jobs — documented as dropped with clear version history

## Consistency Check
- No contradictions between changelog and architecture docs
- Notification types match shipped reality (4 types: report_approved, daily_new, daily_late, weekly_late)
- Cron schedules aligned with plan phase-02 (10:30 Mon–Fri, 09:00 Monday, both ICT)
- DB schema changes (dedup constraint) documented in changelog

## Notes
- Did not modify other docs files (setup guides, API docs remain unchanged)
- No fabricated scaffolding; all sections reference actual shipped code
- Version history preserved for traceability (v2.3.0 → v2.3.1 progression)
