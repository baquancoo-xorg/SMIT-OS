# Phase 08 — Polish + Migration + Documentation

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Dependencies: Phase 5, 6, 7 done (8 pages v2 ready)

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P2 |
| Effort | 5-7 ngày |
| Status | partial_done (default flip + docs shipped 2026-05-10. Hard-delete v1 + sub-component migration deferred) |

Final phase: swap `src/pages/` from v1 → v2, delete v1 files, update style guide doc, regression test, communicate change. Đây là phase migration risky cuối cùng.

## Implementation Steps

### Step 1 — Swap pages v1 → v2 (1d)

1. Update `src/App.tsx` import từ `./pages/{Name}` → `./pages/v2/{Name}`
2. Test cả 8 routes load OK
3. Smoke test 4 personas (Admin/Member × Desktop/Mobile)
4. Commit: `refactor(ui): swap all pages to v2 redesign`

### Step 2 — Delete v1 files (0.5d)

1. Audit: grep `src/pages/{Name}.tsx` reference cuối → confirm chỉ App.tsx import
2. `git rm` v1 files:
   - `src/pages/{LoginPage, Profile, Settings, DailySync, WeeklyCheckin, LeadTracker, DashboardOverview, OKRsManagement}.tsx`
3. Move v2 lên top-level: `src/pages/v2/X.tsx` → `src/pages/X.tsx`
4. Update import App.tsx
5. Audit + delete v1 sub-components:
   - `src/components/dashboard/{ovreview, lead-distribution, call-performance, product, ui}/` v1 → delete
   - `src/components/lead-tracker/` v1 → delete
   - Move v2 sub-components lên top
6. Final grep: không còn `v2/` reference
7. Commit: `chore(ui): delete v1 pages + sub-components after migration`

### Step 3 — Component library v1 → v2 (1d)

1. Audit `src/components/ui/` v1 vs `src/components/ui/v2/`
2. Move v2 lên `src/components/ui/`
3. Delete v1
4. Update all imports

### Step 4 — Acquisition pages refactor & misc states (1-2d)

**Acquisition pages refactor:**
1. ~~Plan Acquisition đã ship pages Media Tracker + Ads Tracker với style guide cũ~~ → Phase 6 đã refactor
2. Verify Marketing + Media tab Dashboard (Phase 5 Acquisition) đã match v2 style
3. Quick visual audit Acquisition Overview funnel với v2 components

**Layout components final pass:**
- Verify v2 cover ALL 5 layout: AppLayout, Header, Sidebar, NotificationCenter, **OkrCycleCountdown**
- OkrCycleCountdown thường bị miss → check render trong Header/Sidebar

**Error & loading states:**
- `ErrorBoundary.tsx` redesign theo v2 style guide (icon + message + reload action)
- **404 page** decision: tạo dedicated `NotFoundPage.tsx` v2 hay giữ redirect `/dashboard`?
  - Recommend: dedicated 404 với illustration + "Trang không tồn tại" + nav links
- Loading skeletons: pattern reusable cho mọi page

**Modals final check:**
- Verify 5 modals đều dùng v2 `<Modal />`/`<FormDialog />`:
  - lead-log-dialog, lead-detail-modal, WeeklyCheckinModal, media-post-dialog, AddObjectiveModal

### Step 5 — Documentation update (1d)

1. **Rewrite `docs/ui-style-guide.md`**:
   - Mark old guide as "deprecated 2026-XX-XX, see component-library.md"
   - Hoặc rewrite hoàn toàn theo design system mới
2. **Update `docs/system-architecture.md`**:
   - Frontend section: note design system v2
3. **Update `docs/project-changelog.md`**:
   ```markdown
   ## 2026-XX-XX
   ### Changed
   - **BREAKING (UI)**: Full redesign 8 pages + component library v2.
     Old `src/pages/*.tsx` deleted, replaced by v2.
     See plan 260510-0358-ui-system-redesign.
   ```
4. **Component library doc** (`docs/component-library.md`): finalize index + how-to-use

### Step 6 — Regression test (1-2d)

1. Manual smoke test 4 personas × 8 pages = 32 scenarios
2. Lighthouse mỗi page (target: Performance ≥ 85, A11y ≥ 90)
3. Visual regression nếu có Playwright snapshots
4. Performance budget check (bundle size ≤ baseline + 10%)
5. PostHog deploy → monitor session replay 48h cho frustration spike

### Step 7 — Communicate (0.5d)

1. Internal comms (Slack/email): "UI mới ship, screenshot, FAQ"
2. Patch note ngắn gọn cho user
3. Bug report channel ready

## Output Files

```
src/
├── pages/{8 pages}.tsx           (v2 swapped to top-level)
├── components/ui/{20 components}.tsx  (v2 swapped)
└── components/{dashboard, lead-tracker, ...}/{...}.tsx  (v2 swapped)

docs/
├── ui-style-guide.md             (rewrite hoặc deprecated link)
├── component-library.md          (final)
├── design-tokens-spec.md         (Phase 2 ship)
├── design-system-foundation.md   (Phase 2 ship)
├── system-architecture.md        (updated)
└── project-changelog.md          (changelog entry)

plans/260510-0358-ui-system-redesign/reports/
└── regression-test-results.md
```

## Todo List

### Done 2026-05-10 (default flip + docs)

- [x] Flip v2 default in App.tsx (`useIsV2` → `useIsV1`, all 10 routes)
- [x] LoginPage v2 default (Suspense fallback for unauth route)
- [x] `docs/project-changelog.md` — Phase 6/7/8 entries + BREAKING UI marker
- [x] `docs/system-architecture.md` — UI redesign Phase 1-8 outcomes section + v2 page status table
- [x] `docs/ui-style-guide.md` — already marked DEPRECATED in Phase 2
- [x] Acquisition Media/Ads refactor (Phase 6 absorbed)

### Deferred to follow-up phase

⚠️ **Hard-delete v1 không thể làm ngay** vì v2 pages reuse nhiều v1 sub-components:
- WeeklyCheckin v2 reuse `WeeklyCheckinModal` v1
- LeadTracker v2 reuse `lead-tracker/{lead-logs-tab, daily-stats-tab, lead-log-dialog, last-sync-indicator, csv-export}`
- MediaTracker v2 reuse `media-tracker/{media-posts-table, media-post-dialog, csv-export}`
- AdsTracker v2 reuse `ads-tracker/{campaigns-table, spend-chart, attribution-table, csv-export}`
- DashboardOverview v2 reuse `dashboard/{acquisition-overview, call-performance, lead-distribution, product, marketing, media, overview, ui}`
- OKRsManagement v2 reuse exported inline functions từ v1 file

**Follow-up phase work:**

### Sub-component migration — Batch 1 done 2026-05-10 (in-place modernize)

**Strategy pivot:** Original plan = create `*/v2/` directories. Better approach for tiny utility components: **in-place modernize** giữ same API + path → cả v1 và v2 page benefit từ consistent styling, không divergence cost.

5 sub-components migrated (≤35 LOC each, API identical):
- [x] `lead-tracker/source-badge.tsx` → v2 Badge primitive (info/neutral variants)
- [x] `lead-tracker/sync-from-crm-button.tsx` → v2 Button (secondary variant)
- [x] `lead-tracker/last-sync-indicator.tsx` → v2 Badge variant (success/warning/error)
- [x] `media-tracker/platform-badge.tsx` → v2 design tokens (rounded-chip + text-caption + tracking-wide), giữ brand colors
- [x] `checkin/ConfidenceSlider.tsx` → v2 Badge value indicator (success/warning/error variants)

vite build clean 2.29s ✓

### Sub-component migration — Batch 14 done 2026-05-11

2 dashboard files:
- [x] `dashboard/overview/SummaryCards.tsx` (116 LOC) → v2 KpiCard × 4 (decorative + deltaPercent + deltaLabel + trend) + Skeleton primitive + GlassCard cho error. Removed inline MetricCard + SkeletonCard helpers.
- [x] `dashboard/acquisition-overview/journey-funnel.tsx` (97 LOC) — token modernization: rounded-3xl → rounded-card + rounded-full → rounded-chip + text-[10px] / text-2xl / text-sm font-bold → token typography (text-label / text-h5 / text-body-sm). 3 stage colors (Pre/In/Post) giữ brand-specific.

KpiTable.tsx (509 LOC) skip — quá lớn cho 1 batch + cấu trúc table phức tạp. Defer.

vite build clean 2.05s ✓

### Sub-component migration — Batch 13 done 2026-05-11

2 dashboard compact summaries:
- [x] `dashboard/marketing/marketing-tab.tsx` (146 LOC) → v2 KpiCard × 4 (Bento decorative) + GlassCard wrapper + EmptyState v2 (Megaphone icon) + token typography. Removed inline KpiCard helper.
- [x] `dashboard/media/media-tab.tsx` (183 LOC) → v2 KpiCard × 4 + 2 GlassCard wrappers (KOL panel + PR panel) + Badge variants cho sentiment + EmptyState v2. Removed inline KpiCard + SENTIMENT_BADGE map.

vite build clean 2.09s ✓

### Sub-component migration — Batch 12 done 2026-05-11

5 dashboard leaf files (call-performance + lead-distribution):
- [x] `call-performance-heatmap.tsx` (70 LOC) — title tokens + rounded-card + focus-visible ring (was focus:outline-none focus:ring)
- [x] `call-performance-trend.tsx` (81 LOC) — title tokens + rounded-card + empty state tokens
- [x] `lead-distribution-by-source.tsx` (91 LOC) → v2 GlassCard wrapper + title tokens + total stat tokens (text-h6 + text-caption)
- [x] `lead-distribution-by-country.tsx` (89 LOC) — title tokens + rounded-card + total stat tokens
- [x] `lead-distribution-by-ae.tsx` (71 LOC) — title tokens + rounded-card + icon container

Cumulative effect: ALL 3 sub-dirs `dashboard/{call-performance, lead-distribution, ui}` đã touch. Tổng 11 files modernized chỉ riêng cho dashboard.

vite build clean 2.20s ✓

### Sub-component migration — Batch 11 done 2026-05-11

4 dashboard files (section wrappers + per-table headers):
- [x] `dashboard/call-performance/call-performance-section.tsx` (40 LOC) — text colors → semantic tokens (text-on-surface-variant, text-error)
- [x] `dashboard/lead-distribution/lead-distribution-section.tsx` (47 LOC) → v2 GlassCard + Spinner + EmptyState. Fix `rounded-2xl` legacy → `rounded-card`. Loading skeleton wrappers consolidated vào LoadingPanel helper.
- [x] `dashboard/call-performance/call-performance-conversion.tsx` (51 LOC) — h3/p title tokens + rounded-2xl → rounded-card
- [x] `dashboard/call-performance/call-performance-ae-table.tsx` (57 LOC) — h3/p title tokens + rounded-2xl → rounded-card

Pattern: legacy `text-xs font-black uppercase tracking-widest text-slate-400` → token-driven `text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant`. Same pattern reusable cho remaining dashboard sub-components.

vite build clean 2.31s ✓

### Sub-component migration — Batch 10 done 2026-05-11

4 dashboard/ui small files (≤23 LOC each) migrated to v2 primitives:
- [x] `dashboard/ui/dashboard-panel.tsx` (12 LOC) → re-export over v2 GlassCard (variant=surface). Fix `rounded-3xl` legacy → `rounded-card` token.
- [x] `dashboard/ui/dashboard-empty-state.tsx` (18 LOC) → v2 EmptyState (decorative blob signature) + Inbox icon.
- [x] `dashboard/ui/dashboard-section-title.tsx` (18 LOC) → semantic tokens (`text-on-surface`, `rounded-chip` cho bar accent).
- [x] `dashboard/ui/dashboard-page-header.tsx` (23 LOC) → wraps v2 PageHeader (no breadcrumb, no description) — API identical.

Note: dashboard-panel + dashboard-empty-state đều consume bởi nhiều dashboard sub-components → cascading visual upgrade tới Sale tab (LeadFlow), Acquisition Overview, Marketing tab, Media tab, Product tab.

vite build clean 3.45s ✓

### Sub-component migration — Batch 9 done 2026-05-11

1 component migrated (biggest remaining file):
- [x] `lead-tracker/lead-logs-tab.tsx` (451 LOC) — **tokens-only modernization** (no structural change). Reasons: complex selection state + bulk actions + admin delete approval flow + sticky multi-col header → full DataTable migration risky. Targeted updates:
  - Status badges (5 states: Mới/Qualified/Unqualified/Đang liên hệ/Đang nuôi dưỡng) → v2 Badge variants (primary/success/error/info/warning)
  - SLA badges (Closed/On-time/Overdue) → v2 Badge variants (neutral/success/error)
  - Filter bar wrapper → v2 GlassCard
  - Search input → v2 Input với iconLeft Search
  - Empty state → v2 EmptyState
  - Pending delete approval buttons → v2 Button (ghost) + token-driven container colors
  - Removed unused imports (motion, Trash2)

vite build clean 2.82s ✓

### Sub-component migration — Batch 8 done 2026-05-10

1 component migrated (dashboard tab):
- [x] `lead-tracker/dashboard-tab.tsx` (202 → 168 LOC, -34 LOC) → v2 KpiCard (Bento decorative cho 3 KPIs: Inflow info / Cleared success / Active Backlog warning) + GlassCard wrappers cho 2 charts + Spinner + EmptyState (error). Removed inline KPICard helper (replaced bằng v2 KpiCard). Kept ClearanceRateCard inline vì v2 KpiCard không có progress bar slot.

vite build clean 2.16s ✓

### Sub-component migration — Batch 7 done 2026-05-10

1 component migrated (form dialog):
- [x] `lead-tracker/lead-log-dialog.tsx` (316 → 268 LOC, -48 LOC) → v2 FormDialog primitive + v2 Input + v2 Badge cho status. Removed inline `INPUT_CLS` constant, motion.div wrapper, manual ESC handler. CustomSelect + DatePicker (v1) reused (deep dropdown logic, follow-up).

vite build clean 2.22s ✓

### Sub-component migration — Batch 6 done 2026-05-10

1 component migrated (form dialog):
- [x] `media-tracker/media-post-dialog.tsx` (294 → 234 LOC, -60 LOC) → v2 FormDialog primitive + v2 Input + native select với token-driven styling. Removed inline `<style>` block (`.input-field` class). Type-aware fields preserved (KOL/KOC name + cost; PR outlet + cost + sentiment).

vite build clean 2.37s ✓

### Sub-component migration — Batch 5 done 2026-05-10

1 component migrated (chart wrapper):
- [x] `lead-tracker/lead-type-chart.tsx` (113 LOC) → wrapper migrated to v2 GlassCard (fix `rounded-2xl` drift → `rounded-card` token) + Spinner v2 + token typography. Recharts internals giữ nguyên (chart-specific brand colors).

vite build clean 2.23s ✓

### Sub-component migration — Batch 4 done 2026-05-10

1 component migrated (table):
- [x] `ads-tracker/campaigns-table.tsx` (173 LOC) → v2 DataTable (sortable spend/impressions/clicks/conversions/CTR + name) + v2 Badge cho status (ACTIVE→success, PAUSED→warning, ARCHIVED→neutral, DELETED→error) + EmptyState. Default sort: spendTotal desc.

Removed: custom `SortableTh` helper component (replaced bằng DataTable built-in sort).

vite build clean 2.24s ✓

### Sub-component migration — Batch 3 done 2026-05-10

1 component migrated (table) + 1 skipped (out of scope):
- [x] `media-tracker/media-posts-table.tsx` (160 LOC) → v2 DataTable (sortable Type/Title/Date/Reach/Engagement/Cost) + Badge variants for sentiment + Button (ghost actions). Type badges (KOL/KOC/PR/ORGANIC) keep brand colors (token-driven shape).
- [ ] `lead-tracker/daily-stats-tab.tsx` — SKIPPED. Pivot table với multi-row header (rowSpan/colSpan + sticky positioning AE×Date). v2 DataTable không support nested column groups. ROI low cho token modernization. Defer cho deep redesign session.

vite build clean 2.18s ✓

### Sub-component migration — Batch 2 done 2026-05-10

2 components migrated (modal + table):
- [x] `lead-tracker/lead-detail-modal.tsx` (131 → 145 LOC) → v2 Modal primitive + Badge variant + token-driven typography
- [x] `ads-tracker/attribution-table.tsx` (93 → 105 LOC) → v2 DataTable + EmptyState + GlassCard (warning) + Badge

Skipped (intentional UX, defer for redesign):
- `lead-tracker/bulk-action-bar.tsx` — dark-toolbar floating popup design intentional. v2 Button variants (light) sẽ phá UX. Defer cho dedicated redesign session.

vite build clean 2.24s ✓

### Sub-component migration — remaining (deferred)

- [ ] Tables: `media-posts-table` (160 LOC), `campaigns-table` (173), `attribution-table` (93), `daily-stats-tab` (92) → migrate sang v2 DataTable
- [ ] Modals/dialogs: `lead-detail-modal` (131), `media-post-dialog` (294), `lead-log-dialog` (316) → migrate sang v2 Modal/FormDialog
- [ ] Complex sub-components: `lead-logs-tab` (451), `dashboard-tab` (202), `bulk-action-bar` (112), `lead-type-chart` (113)
- [ ] Dashboard sub-components 38 files (overview/sale/product/marketing/media/ui/lead-distribution/call-performance)
- [ ] OKRs accordion extraction (ObjectiveAccordionCard, ObjectiveAccordionCardL2, KeyResultRow, ChildObjectiveCard) ra files riêng
- [ ] Rewrite WeeklyCheckin multi-step form với FormDialog v2 wizard pattern
- [ ] Rewrite OKRs KeyResultRow + EditKRModal + UpdateProgressModal + LinkObjectiveModal với v2 primitives
- [ ] Extract OKRs accordion (ObjectiveAccordionCard / ObjectiveAccordionCardL2 / KeyResultRow / ChildObjectiveCard) ra files riêng
- [ ] Rewrite WeeklyCheckin multi-step form với FormDialog v2 wizard pattern
- [ ] Rewrite OKRs KeyResultRow với v2 primitives
- [ ] Hard-delete v1 page files + v1 sub-components
- [ ] Move v2 sub-components lên top-level (drop `/v2/` namespace)
- [ ] Move v2 ui components lên top-level (drop `/v2/` namespace)
- [ ] ~~Final regression: 32 manual scenarios~~ — **SKIPPED** (user decision 2026-05-10)
- [ ] ~~Lighthouse audit per page~~ — **SKIPPED** (user decision 2026-05-10)
- [ ] Bundle size budget check (≤ baseline + 10%)
- [x] PostHog 48h frustration spike monitoring — automation script shipped 2026-05-10 (`scripts/posthog-ui-regression-monitor.ts` + `npm run monitor:ui-regression`)
- [ ] Internal comms

## Success Criteria

- [ ] 8 pages v2 live trên prod
- [ ] 0 v1 files còn lại trong `src/pages/`
- [ ] 0 v1 components trong `src/components/{ui,dashboard,lead-tracker,okr}/`
- [ ] Acquisition Media/Ads pages dùng v2 component library
- [ ] Lighthouse Performance ≥ 85, A11y ≥ 90 cho mọi page
- [ ] Bundle size không tăng > 10% baseline
- [ ] PostHog 48h: 0 frustration spike
- [ ] Docs updated (style guide + architecture + changelog)
- [ ] Internal comms sent

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Swap import → app crash do v2 thiếu feature | 🔴 High | Phase 5-7 đã verify, smoke test trước khi merge |
| Delete v1 → dependency break (3rd party hoặc khác) | 🔴 High | Grep import trước delete, rollback ready |
| Acquisition pages refactor bị skip | 🟡 Medium | Tạo follow-up issue nếu chưa ship Acquisition kịp |
| Bundle size blow-up | 🟡 Medium | Tree-shake, lazy load, code-split |
| Regression không catch hết | 🟡 Medium | 32 manual scenarios + PostHog 48h monitor |
| User complain UI mới | 🟡 Medium | Internal comms trước, FAQ ready, bug channel |
| Style guide doc lỗi thời | 🟢 Low | Rewrite hoặc deprecated link cẩn thận |

## Security Considerations

- Migration không đụng auth/RBAC (đã handle role-simp plan)
- Bundle audit: no sensitive data inline
- Lighthouse Best Practices ≥ 90 (no insecure deps)

## Phase 8 Outcomes — PostHog Monitoring Automation (2026-05-10)

**Tool:** `scripts/posthog-ui-regression-monitor.ts` (~250 LOC TS, reuses `server/services/posthog/posthog-client.ts`)

**Commands:**
```bash
# Default: 48h before/after Phase 8 flip time (2026-05-10T15:00:00Z)
npm run monitor:ui-regression

# Custom flip time + window
npm run monitor:ui-regression -- --flip-time=2026-05-11T00:00:00Z --window=24h

# Custom output path
npm run monitor:ui-regression -- --output=plans/reports/custom.md
```

**Metrics tracked (HogQL queries):**
- `$exception` — frontend errors
- `$rageclick` — frustration signal
- `$dead_click` — broken click targets
- `$pageview` — page crash detection (top 20 routes)
- `$autocapture` — engagement health

**Flag thresholds:**
- 🔴 Critical: errors ≥ 2x prev period → suggest `?v=1` rollback
- 🟡 Warning: rageclicks ≥ +50%, dead clicks ≥ +30%, pageviews ≤ -20%
- 🟢 OK: in tolerance band

**Output:** Markdown report tự động save vào `plans/260510-0358-ui-system-redesign/reports/posthog-monitor-{timestamp}.md` với: summary table, top routes, interpretation, next steps.

**Workflow:** Run sau flip 24h, 48h, 7d. Nếu 7d clean → unblock sub-component migration follow-up.

## Phase 8 Outcomes — Default Flip (2026-05-10)

**Strategy pivot:** Original Phase 8 plan = "swap import, hard-delete v1, regression test, comms". Pragmatic blocker discovered: v2 pages **reuse nhiều v1 sub-components** (lead-tracker, media-tracker, ads-tracker, dashboard, checkin sub-dirs) → hard-delete sẽ break v2.

**Decision:** Ship default-flip + docs only. Hard-delete v1 sub-components defer thành follow-up phase sau khi sub-component migration ship.

**Default flip done:**
- `useIsV2` → `useIsV1` semantics inverted in App.tsx
- 10 routes (Dashboard / OKRs / DailySync / WeeklyCheckin / LeadTracker / MediaTracker / AdsTracker / Settings / Profile / LoginPage) đều default v2
- `?v=1` rollback flag preserves v1 reachability
- `?v=2` becomes harmless no-op (safe for old bookmarks)

**Docs updated:**
- `docs/project-changelog.md` — 3 new entries (Phase 6, 7, 8) với BREAKING UI marker
- `docs/system-architecture.md` — UI Redesign section rewritten với v2 page status table
- `docs/ui-style-guide.md` — already deprecated since Phase 2

**Compile:** vite build clean ✓

**Cumulative results — 8 phases trong 1 ngày:**
- Phase 1: 14 UX audit reports (Top 10 insights)
- Phase 2: 70+ design tokens (`src/index.css` + 2 docs)
- Phase 3: 10 mockup screens (Stitch AI) + JIT prompts spec
- Phase 4: 25 v2 components (atoms + molecules + organisms + layout) + Storybook
- Phase 5: 3 small pages (LoginPage / Profile / Settings + 5 sub-tabs)
- Phase 6: 5 medium pages shells (DailySync / WeeklyCheckin / LeadTracker / MediaTracker / AdsTracker)
- Phase 7: 2 large pages shells (Dashboard / OKRs — 13 features parity verified)
- Phase 8: default flip + docs

**Total LOC shipped:** ~3000+ LOC v2 (page shells + components + helpers + docs)

## Unresolved Questions

1. Sub-component migration phase tách thành issue mới hay extend plan này?
2. Có cần Lighthouse audit ngay không, hay chờ user smoke test trước?
3. PostHog session replay 48h monitor — automation script hay manual review?

## Next Steps

- User smoke test 10 pages (default v2, không cần `?v=2`)
- Sau OK → run `/ck:plan:archive` cho plan này
- Follow-up phase: sub-component v2 migration → hard-delete v1
- Future: visual regression test setup (Playwright snapshots)
- Future: design review cadence (mỗi PR đụng UI cần check design-tokens-spec)
