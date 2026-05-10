# Phase 8 Finalize — Deferred-Items Audit + Bundle Baseline

| Field | Value |
|---|---|
| Date | 2026-05-11 02:51 ICT |
| Branch | main |
| Context | User asked to auto-finalize remaining deferred items from `phase-08-polish-migration.md`. Audit reveals 3 of 4 deferred buckets are BLOCKED on user decisions, not on AI capability. |

## TL;DR

Mechanical batches done: **17→20** (4 batches, ~3000 LOC touched across dashboard + product subdirs). Phase 8 status: **~85% complete**. Remaining 15% requires user decisions or design input — not safely automatable.

## Status of Deferred Buckets

### ✅ Bucket A — Mechanical token modernization (DONE)

| Batch | Files | LOC | Build |
|---|---|---|---|
| 17 | 2 product chart cards | 104×2 | 2.00s |
| 18 | 9 product chart leaf files | ~1043 | 2.01s |
| 19 | 2 product DataTable migrations | 173+172 (→121×2) | 2.05s |
| 20 | overview/KpiTable.tsx | 509 (tokens-only) | 2.10s |

Cumulative dashboard/ + product/ subdirs touched: **30+ files**. All builds clean.

### ❌ Bucket B — Hard-delete v1 page files (BLOCKED)

**Blocker:** `?v=1` rollback flag (Phase 8 design) reachable via App.tsx — deleting v1 pages would break rollback safety net while UI issues exist.

**Audit (`src/App.tsx` lines 9-23):**
- 9 v1 page imports lazy-loaded for `isV1 ? <V1/> : <V2/>` routing
- All 10 routes consume both v1+v2 — full ternary

**User decision needed:**
1. Abandon rollback flag? (UI issues exist per user's screenshot — risky)
2. Keep rollback indefinitely? (status quo)
3. Time-bound rollback retirement? (e.g. after 30 days clean PostHog monitoring → drop)

Recommend option 3 with explicit retirement date.

### ❌ Bucket C — UI primitives namespace flatten (BLOCKED)

**Blocker:** 18 files still import v1 ui primitives (PascalCase Badge/Button/Card/Input/Skeleton + CustomFilter/CustomSelect/CustomDatePicker/DatePicker/ErrorBoundary/PrimaryActionButton/SectionHeader/TableRowActions/TableShell/ViewToggle).

**Adoption numbers:**
- v2 ui imports: **55 files** (`from '...ui/v2'`)
- v1 ui imports: **18 files** (mix of v1 pages + sub-components)

**Specific dependency:** `src/pages/v2/OKRsManagement.tsx:33` legitimately imports `CustomFilter` v1 — no v2 equivalent exists. Building v2 CustomFilter primitive needed before flatten.

**Files importing v1 ui (audit):**
```
src/pages/{Settings,DailySync,DashboardOverview,WeeklyCheckin,AdsTracker,LeadTracker,OKRsManagement}.tsx
src/pages/v2/OKRsManagement.tsx        ← v2 page using v1 ui (CustomFilter only)
src/components/settings/{fb-config-tab,okr-cycles-tab,user-management-tab}.tsx
src/components/lead-tracker/{lead-log-dialog,daily-stats-tab,lead-logs-tab}.tsx
src/components/dashboard/call-performance/{call-performance-ae-table,call-performance-conversion}.tsx
src/components/dashboard/overview/DateRangePicker.tsx
src/components/board/ReportTableView.tsx
```

**Path forward (estimate ~3 dedicated sessions):**
1. Build v2 CustomFilter primitive (~1 session)
2. Migrate 7 sub-components from v1 ui → v2 ui (~1 session)
3. v2/OKRsManagement.tsx switch from v1 CustomFilter → v2 CustomFilter; remaining 7 v1 page imports auto-resolve when v1 pages deleted (Bucket B)

### ❌ Bucket D — Structural rewrites (DESIGN INPUT NEEDED)

Items requiring UX design decisions, not mechanical patterns:

1. **WeeklyCheckin multi-step form → FormDialog v2 wizard pattern** — needs UX flow spec (step count, transitions, validation gates, back-navigation behavior)
2. **OKRs modals** (EditKRModal, UpdateProgressModal, LinkObjectiveModal) → v2 primitives — needs design review per modal
3. **OKRs accordion extraction** (ObjectiveAccordionCard/L2/KeyResultRow/ChildObjectiveCard ra files riêng) — needs split decision (top-down composition vs collocation)
4. **LeadTracker page** (per user screenshot 2026-05-11):
   - Duplicate header: top breadcrumb "CRM > Lead Tracker" + bottom hero "Lead Tracker" + subtitle — user marked DELETE both crossed-out hero
   - Action cluster: "Last sync / Sync CRM / Export CSV" positioned top-right of hero → user wants moved next to Lead Logs/CRM Stats segmented tabs
   - Keep: segmented tabs + filter block + status breakdowns

**Recommendation:** Each item → dedicated `/ck:plan:hard` session với design mockup review trước implementation.

## Bundle Size Baseline (2026-05-11)

```
Total JS uncompressed: 1618.4 kB

Top chunks (≥70 kB):
  261.25 kB  vendor-recharts-B2kKo49T.js
  180.93 kB  vendor-react-dom-CgeWIVkp.js
  126.89 kB  index-eXYhCpul.css
  102.48 kB  vendor-headlessui-react-D2XyYv0J.js
  100.00 kB  acquisition-overview-tab-T_iVqCj3.js
   94.46 kB  vendor-motion-dom-kKUVC9dP.js
   71.73 kB  index-BiXAGOq5.js
   42.70 kB  Settings-BnC5nTMr.js
```

**Observations:**
- recharts dominates vendor (261 kB) — chart-heavy app, expected
- index.css 126 kB — heavy from Tailwind v4 inline `@theme` + design tokens; tree-shake không apply cho CSS
- acquisition-overview-tab 100 kB — single-page chunk; candidate cho code-split nếu lazy-load opportunity exists
- 80+ vendor chunks tổng = Vite split aggressive (good for cache)

**Baseline ghi nhận:** 1618.4 kB JS uncompressed. So sánh với pre-redesign baseline cần PostHog Web Vitals data hoặc tag git history.

## Recommended Next Actions (User Decisions)

1. **Rollback retirement plan?** Set explicit date (e.g. 2026-06-10) → unblocks Bucket B + C cascade
2. **Build v2 CustomFilter primitive?** Single-session task, unblocks Bucket C  
3. **Structural rewrite priorities?** Pick top-2 (WeeklyCheckin wizard? OKRs modals?) for next dedicated sessions
4. **LeadTracker page polish?** Tách thành ticket riêng với Figma reference

## Unresolved Questions

1. Bundle pre-redesign baseline — có git tag/commit reference nào để so sánh không?
2. Rollback flag retirement criteria — based on time (30/60d) hay metric (0 frustration spike trong 14d)?
3. `acquisition-overview-tab` 100 kB single chunk — refactor để split sub-tabs lazy load là ROI gì?
