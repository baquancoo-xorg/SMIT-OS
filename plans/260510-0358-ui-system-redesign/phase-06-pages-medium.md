# Phase 06 — Pages Redesign: Medium (DailySync + WeeklyCheckin + LeadTracker + MediaTracker + AdsTracker)

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Mockup: Phase 3 batch 2
- Component library: Phase 4 v2
- Dependencies: Phase 5 done (validated component library)

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P2 |
| Effort | 2.5-3 tuần (expanded scope với 2 pages mới) |
| Status | implementation_done (5 page shells shipped 2026-05-10, pending: user review for Phase 7 sign-off) |

Redesign 5 medium-complexity pages (3 cũ + 2 từ Acquisition đã ship). Mỗi page có data fetching, form CRUD, ownership gates. Target: code v2 trong `src/pages/v2/` namespace, swap import sau khi user OK.

## Pages

| Page | LOC | Sub-components | Complexity drivers |
|---|---|---|---|
| DailySync.tsx | 349 | Multiple | Form CRUD, list, ownership gate. **Mobile critical** (checkin) |
| WeeklyCheckin.tsx | 239 | Modal + board/ReportTableView | Multi-step checkin, approval. **Mobile critical** |
| LeadTracker.tsx | 128 | `lead-tracker/*` (10 files) | Tabs (Logs/Stats), CRM sync, 2 modals (log + detail) |
| **MediaTracker.tsx** (NEW) | ? | `media-tracker/*` (3 files) | 3 tabs (Owned/KOL/PR), 1 dialog |
| **AdsTracker.tsx** (NEW) | ? | `ads-tracker/*` (3 files) | 3 tabs (Campaigns/Performance/Attribution) |

### Modals trong scope Phase 6

1. `lead-tracker/lead-log-dialog.tsx` — Log activity cho lead
2. `lead-tracker/lead-detail-modal.tsx` — Lead detail view
3. `modals/WeeklyCheckinModal.tsx` — Weekly checkin form
4. `media-tracker/media-post-dialog.tsx` — KOL/PR/Owned post entry

### Sub-components cần migrate

**Lead Tracker (10 files):**
- `lead-logs-tab.tsx`, `daily-stats-tab.tsx`
- `lead-log-dialog.tsx`, `lead-detail-modal.tsx`
- `csv-export.ts`, `source-badge.tsx`, `sync-from-crm-button.tsx`, `last-sync-indicator.tsx`
- 2+ misc

**Media Tracker (3 files):** owned-tab, kol-tab, pr-tab + dialog

**Ads Tracker (3 files):** campaigns-table, spend-chart, attribution-table

**Checkin (2 files):** weekly-checkin sub-components

**board/ReportTableView.tsx** (1 file) — Weekly report table view

## Implementation Steps

### DailySync redesign (3-4d)
1. Replace với mockup
2. Reuse v2 `<PageHeader />`, `<DataTable />`, `<FormDialog />`
3. List view: tất cả member daily (read-shared)
4. Edit/delete: ownership gate (`userId === currentUser.id` hoặc Admin)
5. Submit form: validation + loading state
6. Filter by date + member

### WeeklyCheckin redesign (3-4d)
1. Replace với mockup
2. Reuse v2 `<TabPill />`, `<Modal />`, `<FormDialog />`
3. Multi-step checkin form (current week + commitments + retro)
4. Admin approve/reject UI
5. Member view: own checkin + team list (read-only others)
6. WeeklyCheckinModal v2

### LeadTracker redesign (4-5d)
1. Replace với mockup
2. Reuse v2 `<PageHeader />`, `<TabPill />` (Logs/Stats), `<DataTable />`, `<FormDialog />`
3. Sub-components migrate: `lead-log-dialog`, `source-badge`, `sync-from-crm-button`, `last-sync-indicator`, `daily-stats-tab`, `lead-logs-tab`
4. Ownership gate per row: edit chỉ lead `assignedToId === currentUser.id` hoặc Admin
5. CRM sync button: Admin only (gate UI + backend đã có Phase 6 role-simp)
6. CSV export button reuse
7. Date filter for stats tab

### Per-page checklist (giống Phase 5)
- [ ] Match mockup ≥ 95%
- [ ] All states (default/hover/loading/error/empty)
- [ ] Mobile responsive
- [ ] Lighthouse ≥ 85/90
- [ ] 4 persona test
- [ ] Ownership gates work end-to-end
- [ ] No console error/warning

## Output Files

```
src/pages/v2/
├── DailySync.tsx
├── WeeklyCheckin.tsx
└── LeadTracker.tsx

src/components/lead-tracker/v2/
├── lead-log-dialog.tsx
├── source-badge.tsx
├── sync-from-crm-button.tsx
├── last-sync-indicator.tsx
├── daily-stats-tab.tsx
└── lead-logs-tab.tsx

src/components/checkin/v2/        (mới nếu cần)
src/components/daily-sync/v2/     (mới nếu cần)
```

## Todo List

- [x] Build DailySync v2 shell (PageHeader + KpiCard + DataTable + FormDialog + Modal) — 2026-05-10
- [x] Build WeeklyCheckin v2 shell + reuse v1 WeeklyCheckinModal (deferred multi-step rewrite) — 2026-05-10
- [x] Build LeadTracker v2 shell wrapping LeadLogsTab + DailyStatsTab — 2026-05-10
- [x] Build MediaTracker v2 shell + KpiCard Bento + reuse MediaPostDialog — 2026-05-10
- [x] Build AdsTracker v2 shell + 3 tabs + KpiCard Bento — 2026-05-10
- [x] Wire `?v=2` toggle in App.tsx for all 5 medium pages — 2026-05-10
- [x] Compile clean (vite build 2.19s ✓)
- [ ] Per-page checklist pass cả 5 (visual mockup match, mobile responsive, Lighthouse, persona test)
- [ ] User review 5 pages (?v=2 preview)
- [ ] Sub-component deep migration (lead-tracker/v2/, media-tracker/v2/, ads-tracker/v2/, checkin/v2/) — follow-up
- [ ] Component v2 fix-back nếu thiếu

## Success Criteria

- [ ] 3 pages match mockup ≥ 95%
- [ ] Ownership gates per-row work
- [ ] CRM sync button Admin only
- [ ] CSV export work
- [ ] User sign-off → unblock Phase 7

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| LeadTracker sub-components migration phức tạp | 🔴 High | Migrate tuần tự, test từng component standalone |
| Form validation logic phức tạp (WeeklyCheckin multi-step) | 🟡 Medium | Reuse react-hook-form pattern, FormDialog v2 hỗ trợ multi-step |
| CRM sync break (depend backend) | 🟡 Medium | Backend không đụng, chỉ refactor UI button |
| Ownership per-row UX confusing | 🟡 Medium | Visual hint: edit button disabled + tooltip "chỉ owner sửa được" |

## Security Considerations

- Ownership check authoritative ở backend (Phase 6 role-simp)
- UI hide edit button = UX hint, không phải security boundary
- CSV export include sensitive lead data → require auth + log download

## Phase 6 Outcomes (2026-05-10)

**Implementation strategy:** Phase 5 batch pattern reused — ship v2 page shells bằng v2 primitives (PageHeader / TabPill / KpiCard / DataTable / FormDialog / Modal / GlassCard), wrap v1 sub-components (LeadLogsTab, DailyStatsTab, MediaPostsTable, MediaPostDialog, CampaignsTable, SpendChart, AttributionTable, WeeklyCheckinModal) để giữ behavioral parity. Sub-component deep migration là follow-up task.

**Deliverables:**
1. `src/pages/v2/DailySync.tsx` — full v2 (PageHeader + 4 KpiCards + DataTable + FormDialog + Modal detail) — đã rewrite form/detail dùng FormDialog v2
2. `src/pages/v2/WeeklyCheckin.tsx` — v2 shell + reuse v1 WeeklyCheckinModal (multi-step KR loading) + new v2 detail Modal
3. `src/pages/v2/LeadTracker.tsx` — v2 shell + TabPill (Logs/Stats) + reuse LeadLogsTab + DailyStatsTab
4. `src/pages/v2/MediaTracker.tsx` — v2 shell + TabPill (Owned/KOL/PR) + 4 KpiCard Bento + reuse MediaPostsTable + MediaPostDialog
5. `src/pages/v2/AdsTracker.tsx` — v2 shell + TabPill (Campaigns/Performance/Attribution) + 4 KpiCard Bento + reuse CampaignsTable + SpendChart + AttributionTable
6. `src/App.tsx` — `?v=2` toggle wired for cả 5 routes (`/daily-sync`, `/checkin`, `/lead-tracker`, `/media-tracker`, `/ads-tracker`)

**Metrics:**
- 5 page shells (~ 150-280 LOC mỗi page) shipped
- v1 sub-components untouched (zero regression risk)
- vite build clean 2.19s ✓
- Bundle size: DailySync v2 9.7kB, WeeklyCheckin v2 8.4kB, LeadTracker v2 ~4kB, MediaTracker v2 ~4kB, AdsTracker v2 ~5.7kB

**Pending user review:**
- Visit `/daily-sync?v=2`, `/checkin?v=2`, `/lead-tracker?v=2`, `/media-tracker?v=2`, `/ads-tracker?v=2`
- Validate 4 personas (Admin + Sale + Marketing + Member) × Desktop + Mobile
- Mobile critical: DailySync + WeeklyCheckin (member checkin flow)
- Sign-off → unlock Phase 7 (Dashboard + OKRs — hardest)

## Next Steps

- Phase 7: Pages Large (Dashboard + OKRs) — hardest
- Follow-up: deep migrate sub-components (`lead-tracker/v2/`, `media-tracker/v2/`, `ads-tracker/v2/`, `checkin/v2/`) sau khi Phase 7 ship
