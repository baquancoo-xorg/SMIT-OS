# Phase 07 — Pages Redesign: Large (Dashboard + OKRs)

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Mockup: Phase 3 batch 3
- Component library: Phase 4 v2
- Dependencies: Phase 6 done

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P2 |
| Effort | 1.5-2 tuần |
| Status | pending |

Redesign 2 pages phức tạp nhất: Dashboard (5 tabs, ~30 sub-components) và OKRs (1324 LOC, OKR tree, multi-level, drag-drop). Đây là 2 pages quan trọng nhất với leadership và toàn team — sai 1 chỗ là user complain ngay.

⚠️ **OKRs hiện đang là source of truth cũ** — sau redesign phase này sẽ là source of truth mới. Cần feature parity tuyệt đối.

## Pages

| Page | LOC | Sub-components | Complexity drivers |
|---|---|---|---|
| DashboardOverview.tsx | 132 | **38 files trong `dashboard/`** | 5 tabs với content thật + journey funnel + charts |
| OKRsManagement.tsx | 1324 | + AddObjectiveModal inline | OKR tree L1/L2, drag-drop link, dept colors, accordion, status calc |

### Dashboard 5 tabs — break down sub-components (38 files)

| Tab | Component dir | Files | Use case |
|---|---|---|---|
| **overview** | `dashboard/overview/` + `dashboard/acquisition-overview/` | 4 + ? | KPI summary OR journey funnel 3 stages (đã ship Phase 5 Acquisition) |
| **sale** | `dashboard/lead-distribution/` + `dashboard/call-performance/` | 4 + ? | Lead distribution by AE/country/source + call perf |
| **product** | `dashboard/product/` | 8 | activation-heatmap, channel-breakdown, channel-posthog-secondary, cohort-activation-curve, cohort-retention, funnel-chart, funnel-with-time, kpi-cards, online-time-table |
| **marketing** | `dashboard/marketing/` | ? | Compact ads summary (đã ship Phase 5 Acquisition) |
| **media** | `dashboard/media/` | ? | Compact media summary (đã ship Phase 5 Acquisition) |
| (shared) | `dashboard/ui/` | ? | DashboardEmptyState, DashboardPageHeader, DashboardSectionTitle |

### OKRs sub-features cần redesign (feature parity 100%)

Modal:
- **AddObjectiveModal** — extract từ inline thành standalone v2 component (Phase 4 cần build)

Inline components/logic:
- L1 / L2 tab pill toggle
- Department filter (Tech/Marketing/Media/Sale/BOD)
- Status filter (Off Track / At Risk / On Track)
- Quarterly progress bento card
- Critical Path Health card với pulsing dot
- Days Left countdown card
- ObjectiveAccordionCard (L1)
- ObjectiveAccordionCardL2 (L2 — child)
- Drag-drop link parent/child
- Edit KR with ownership gate (after role-simp)
- Delete confirmation modal

Verify checklist 13 features khi redesign.

## Implementation Steps

### Dashboard redesign (4-5d)

1. Replace `DashboardOverview.tsx` với mockup
2. **5 tabs**:
   - Overview: KPI summary + lead distribution (apply mockup, reuse v2 `<KpiCard />`)
   - Sale: CallPerformance + LeadFlow (sub-components migrate)
   - Product: 8 components (funnel, cohort, retention, channel, heatmap)
   - Marketing: empty placeholder (Acquisition Phase 5 sẽ fill)
   - Media: empty placeholder
3. URL state: `?tab=&from=&to=` shared
4. Date range filter v2
5. Tab switching < 300ms (cache TTL)
6. Sub-components migrate:
   - `dashboard/overview/{SummaryCards, KpiTable, DateRangePicker}` → v2
   - `dashboard/lead-distribution/*` → v2
   - `dashboard/call-performance/*` → v2
   - `dashboard/product/*` (8 components) → v2
   - `dashboard/ui/*` → v2
7. Empty state v2 với illustration

### OKRs redesign (5-6d)

1. Replace `OKRsManagement.tsx` với mockup
2. **Feature parity tuyệt đối** — KHÔNG mất:
   - L1/L2 tabs
   - Department filter (Tech/Marketing/Media/Sale/BOD)
   - Status filter (Off Track/At Risk/On Track)
   - Accordion expand/collapse
   - Department colors hardcoded
   - Quarterly progress bento card
   - Critical Path Health card
   - Days Left card
   - OKR Tree List với accordion
   - Add Objective modal
   - Link parent/child (drag-drop hoặc modal)
   - Delete confirmation
   - Edit KR (ownership: own only, Admin all)
3. Reuse v2: `<PageHeader />`, `<KpiCard />`, `<TabPill />`, `<DateRangePicker />` (cycle), `<DataTable />` (nếu list view), `<FormDialog />` (Add Objective)
4. Decoupling: tách OKR card thành `<ObjectiveCard />`, `<KeyResultCard />` v2 reusable

### Per-page checklist (giống Phase 5-6)
- [ ] Match mockup ≥ 95%
- [ ] All states
- [ ] Mobile responsive (Dashboard tabs scrollable trên mobile)
- [ ] Lighthouse ≥ 85/90
- [ ] 4 persona test
- [ ] Feature parity OKRs verified (checklist 13 features trên)
- [ ] Performance: Dashboard tab switch < 300ms, OKRs render 50+ objectives < 500ms

## Output Files

```
src/pages/v2/
├── DashboardOverview.tsx
└── OKRsManagement.tsx

src/components/dashboard/v2/
├── overview/{summary-cards, kpi-table, date-range-picker}.tsx
├── lead-distribution/{...}.tsx (4 files)
├── call-performance/{...}.tsx
├── product/{...}.tsx (8 files)
└── ui/{...}.tsx

src/components/okr/v2/
├── objective-card.tsx
├── key-result-card.tsx
├── objective-accordion-card.tsx
├── objective-accordion-card-l2.tsx
├── add-objective-modal.tsx
└── department-color-config.ts
```

## Todo List

- [ ] Dashboard v2: shell + tab switching (1d)
- [ ] Dashboard v2: Overview tab (1d)
- [ ] Dashboard v2: Sale tab (1d)
- [ ] Dashboard v2: Product tab (1-2d)
- [ ] OKRs v2: shell + bento metrics (1d)
- [ ] OKRs v2: tree list + accordion (2d)
- [ ] OKRs v2: Add Objective modal (1d)
- [ ] OKRs v2: link parent/child (1d)
- [ ] OKRs v2: Edit KR with ownership (1d)
- [ ] Feature parity verify checklist
- [ ] Per-page checklist pass cả 2
- [ ] User review 2 pages
- [ ] Performance tune

## Success Criteria

- [ ] 2 pages match mockup ≥ 95%
- [ ] OKRs feature parity 100% (13 items checklist)
- [ ] Dashboard 5 tabs work với data thật
- [ ] Mobile responsive (Dashboard tabs scrollable)
- [ ] Lighthouse Performance ≥ 85
- [ ] User sign-off → unblock Phase 8

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| OKRs feature parity miss → user complain | 🔴 High | Checklist 13 features trên, manual verify từng feature, regression test |
| Dashboard sub-components migrate sai data shape | 🔴 High | Test với data thật từng tab, không stub |
| Performance regress (1324 LOC OKRs render chậm) | 🟡 Medium | useTransition + Suspense + virtualize accordion list nếu > 50 items |
| Drag-drop link parent/child UX phức tạp | 🟡 Medium | Modal-based fallback nếu drag-drop khó implement |
| Department color hardcoded vs design tokens | 🟡 Medium | Convert sang semantic tokens Phase 2 nếu hợp lý, hoặc giữ hardcoded |
| Acquisition tab Marketing/Media (empty) sẽ block plan acquisition | 🟢 Low | Phase này KHÔNG fill, chỉ giữ empty placeholder. Acquisition plan Phase 5 fill |

## Security Considerations

- OKR edit gate authoritative ở backend (role-simp Phase 6)
- Dashboard data: KHÔNG expose PII trong KPI/chart tooltip
- Department color: chỉ visual, không leak business data

## Next Steps

- Phase 8: Polish + Migration + Documentation
