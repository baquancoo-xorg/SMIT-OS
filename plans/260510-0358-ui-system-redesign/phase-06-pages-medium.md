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
| Status | pending |

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

- [ ] Build DailySync v2 (3-4d) + mobile UX critical
- [ ] Build WeeklyCheckin v2 + ReportTableView (3-4d) + mobile UX
- [ ] Build LeadTracker v2 + 10 sub-components + 2 modals (4-5d)
- [ ] Build MediaTracker v2 + 3 tabs + media-post-dialog (3-4d)
- [ ] Build AdsTracker v2 + 3 tabs (3-4d)
- [ ] Per-page checklist pass cả 5
- [ ] User review 5 pages
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

## Next Steps

- Phase 7: Pages Large (Dashboard + OKRs) — hardest
