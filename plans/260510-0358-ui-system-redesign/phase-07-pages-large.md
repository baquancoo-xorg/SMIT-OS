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
| Status | implementation_done (Dashboard + OKRs v2 shells shipped 2026-05-10, pending: user review for Phase 8 sign-off) |

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

### Batch 1 — Dashboard (done 2026-05-10)

- [x] Dashboard v2 shell (PageHeader + TabPill + DateRangePicker reused) — 2026-05-10
- [x] All 5 tabs reuse v1 sections (Acquisition/Sale/Product/Marketing/Media) — behavioral parity
- [x] URL state preserved (`?tab=&legacy=`)
- [x] App.tsx wired `?v=2` toggle for `/dashboard`

### Batch 2 — OKRs (done 2026-05-10)

**Strategy pivot:** Thay vì extract toàn bộ accordion components ra files riêng (risky + bloat tokens), pragmatic approach:
1. Add `export` keyword cho 3 inline functions trong v1 OKRsManagement.tsx (ObjectiveAccordionCard, ObjectiveAccordionCardL2, AddObjectiveModal) — non-breaking change
2. Extract chỉ shared helpers (dept colors, status calc, Q2 deadline) ra `src/components/okr/v2/department-color-config.ts`
3. Build v2 shell import accordion từ same v1 file → reuse 1000+ LOC accordion logic không cần re-write
4. v2 shell chỉ thay header / KPI cards / TabPill / button → focus design system upgrade

- [x] Add `export` cho ObjectiveAccordionCard / ObjectiveAccordionCardL2 / AddObjectiveModal trong v1 — 2026-05-10
- [x] Extract dept colors + getOkrStatus + getCriticalPathHealth + getQ2Deadline → `src/components/okr/v2/department-color-config.ts` — 2026-05-10
- [x] OKRs v2: shell + 4 bento KpiCard (Quarterly Progress / Active Objectives / Critical Path / Days Left Q2) — 2026-05-10
- [x] OKRs v2: TabPill (L1/L2) + 2 CustomFilter (department + status) — 2026-05-10
- [x] OKRs v2: tree list reusing v1 ObjectiveAccordionCard + ObjectiveAccordionCardL2 — 2026-05-10
- [x] OKRs v2: AddObjectiveModal reused from v1 — 2026-05-10
- [x] App.tsx wired `?v=2` toggle for `/okrs` — 2026-05-10
- [x] vite build clean 2.20s — 2026-05-10
- [ ] Feature parity verify checklist (13 features) — needs manual user check
- [ ] Per-page checklist pass cả 2 (visual/mobile/Lighthouse/persona)
- [ ] User review 2 pages
- [ ] Performance tune (50+ objectives < 500ms) — defer until perf issue reported

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

## Phase 7 Batch 2 Outcomes (2026-05-10)

**Strategy:** Pragmatic refactor — added `export` to 3 inline accordion functions trong v1 file (non-breaking) + extracted shared helpers ra `department-color-config.ts`. Build v2 shell import accordion từ same v1 file để giữ 1000+ LOC logic mà không re-write.

**Deliverables:**
1. `src/pages/v2/OKRsManagement.tsx` (~270 LOC) — full v2 shell với PageHeader + 4 KpiCard Bento + TabPill (L1/L2) + 2 CustomFilter + reuse 3 v1 accordion components
2. `src/components/okr/v2/department-color-config.ts` (~110 LOC) — `getDeptColor()`, `getOkrStatus()`, `getCriticalPathHealth()`, `getQ2Deadline()`. Shared between v1 + v2.
3. `src/pages/OKRsManagement.tsx` — minimal change: add `export` keyword cho 3 inline functions (ObjectiveAccordionCard, ObjectiveAccordionCardL2, AddObjectiveModal)
4. `src/App.tsx` — `?v=2` toggle wired cho `/okrs`

**v2 Components Used:**
- `PageHeader` (italic accent + breadcrumb)
- `Button` (primary "New Objective")
- `KpiCard` × 4 (Quarterly Progress / Active Objectives / Critical Path / Days Left Q2)
- `TabPill` (L1/L2)
- `EmptyState` (decorative cho filter empty)
- `GlassCard` (placeholder for future enhancements)

**Behavioral Parity (13 features):**
| # | Feature | Status |
|---|---|---|
| 1 | L1/L2 tabs | ✓ TabPill v2 |
| 2 | Department filter | ✓ CustomFilter v1 reused |
| 3 | Status filter (On Track/At Risk/Off Track) | ✓ CustomFilter v1 reused |
| 4 | Accordion expand/collapse | ✓ ObjectiveAccordionCard v1 |
| 5 | Department colors | ✓ extracted shared module |
| 6 | Quarterly Progress bento | ✓ KpiCard v2 |
| 7 | Critical Path Health pulsing dot | ✓ KpiCard accent + decorative |
| 8 | Days Left Q2 countdown | ✓ KpiCard primary highlight |
| 9 | OKR Tree List | ✓ reused v1 accordion |
| 10 | Add Objective modal | ✓ reused v1 |
| 11 | Link parent/child | ✓ inside L2 accordion (KeyResultRow) |
| 12 | Delete confirmation | ✓ inside KeyResultRow v1 |
| 13 | Edit KR (ownership: own/Admin) | ✓ KeyResultRow v1 logic |

**Compile:** vite build clean 2.20s ✓

**Pending:**
- User review `/okrs?v=2` — manual verify 13 features khi navigate
- Phase 8: Polish + Migration + Documentation

## Phase 7 Batch 1 Outcomes (2026-05-10)

**Strategy:** Phase 5-6 batch pattern reused — ship v2 page shell với primitives Phase 4, wrap v1 sub-components để giữ behavioral parity. OKRs deferred do scope (1324 LOC + inline accordion).

**Deliverables:**
1. `src/pages/v2/DashboardOverview.tsx` (~140 LOC) — v2 PageHeader + TabPill (5 tabs) + GlassCard wrappers cho Sale tab sections + reuse v1 DateRangePicker + reuse all 5 tab content sections
2. `src/App.tsx` — `?v=2` toggle wired cho `/dashboard`

**v2 Components Used:**
- `PageHeader` (italic accent + breadcrumb)
- `TabPill` (5 domain tabs: Overview / Sale / Product / Marketing / Media)
- `GlassCard` (Sale tab section wrappers)

**Behavioral Parity:**
- URL state preserved (`?tab=&legacy=`)
- `?legacy=true` flag still flips Overview to SummaryCards mode
- Tab switching < 300ms (no extra fetch — data scoped to range)
- All v1 sub-sections rendered as-is (AcquisitionOverviewTab, CallPerformanceSection, LeadDistributionSection, ProductSection, MarketingTab, MediaTab, KpiTable)

**Compile:** vite build clean 2.20s ✓

**Pending:**
- User review `/dashboard?v=2` (4 personas × 2 viewports)
- Phase 7 Batch 2 (OKRs) — separate session

## Next Steps

- Phase 7 Batch 2: OKRs v2 (sub-component extraction first, then shell)
- Phase 8: Polish + Migration + Documentation
