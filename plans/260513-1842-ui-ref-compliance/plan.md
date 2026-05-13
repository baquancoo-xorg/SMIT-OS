---
title: "UI Ref Compliance"
description: "Align SMIT OS v5 UI with the Playground reference style while preserving real data flows."
status: done
priority: P2
effort: 24h
branch: main
tags: [ui, design-system, v5, ref-compliance]
created: 2026-05-13
---

# UI Ref Compliance Plan

## Dependency Graph

```
01 (Token Baseline)
├── 02 (Core Primitives)      ─┐
├── 03 (Table System)          ├── 05 (Dashboard/Reports)
├── 04 (Shell/Nav)             │   06 (Growth Workspace)   ─┐
                               │   07 (Execution WS)        ├── 09 (Validation)
                               └── 08 (Admin/Profile)      ─┘
                                                              └── 10 (Future Governance)
```

Sequential: 01 → {02, 03, 04 parallel} → {05, 06, 07, 08 parallel} → 09 → 10

## Execution Strategy

- **Wave 0:** Phase 01 alone (unblocks all visual work)
- **Wave 1:** Phases 02, 03, 04 in parallel (exclusive file ownership)
- **Wave 2:** Phases 05, 06, 07, 08 in parallel (exclusive file ownership)
- **Wave 3:** Phase 09 alone (validation, cleanup, docs)
- **Wave 4:** Phase 10 alone (future compliance governance)

## Phase List

| # | Phase | Status | Group | Hours | Link |
|---|---|---|---|---|---|
| 01 | Token Baseline | **done** | Wave 0 | 2h | [phase-01](phase-01-token-baseline.md) |
| 02 | Core v5 Primitives | **done** | Wave 1 | 4h | [phase-02](phase-02-core-primitives.md) |
| 03 | Table System Convergence | **done** | Wave 1 | 3h | [phase-03](phase-03-table-system.md) |
| 04 | Shell/Navigation Polish | **done** | Wave 1 | 2h | [phase-04](phase-04-shell-navigation.md) |
| 05 | Dashboard/Reports | **done** | Wave 2 | 2h | [phase-05](phase-05-dashboard-reports.md) |
| 06 | Growth Workspace Legacy | **done** | Wave 2 | 3h | [phase-06](phase-06-growth-workspace.md) |
| 07 | Execution Workspace | **done** | Wave 2 | 3h | [phase-07](phase-07-execution-workspace.md) |
| 08 | Admin/Profile | **done** | Wave 2 | 2h | [phase-08](phase-08-admin-profile.md) |
| 09 | Validation/Cutover | **done** | Wave 3 | 2h | [phase-09](phase-09-validation-cutover.md) |
| 10 | Future Compliance Governance | deferred | Wave 4 | 2h | [phase-10](phase-10-future-compliance-governance.md) |

## File Ownership Matrix

| File/Dir | Phase |
|---|---|
| `src/index.css`, `src/design/v5/tokens.ts`, `docs/ref-ui-playground/*` | 01 |
| `src/components/v5/ui/button.tsx`, `badge.tsx`, `card.tsx`, `kpi-card.tsx`, `tab-pill.tsx`, `input.tsx`, `date-range-picker.tsx`, `date-picker.tsx`, `dropdown-menu.tsx`, `filter-chip.tsx`, `custom-select.tsx`, `modal.tsx`, `empty-state.tsx`, `notification-center.tsx`, `notification-toast.tsx`, `glass-card.tsx`, `page-header.tsx`, `confirm-dialog.tsx`, `form-dialog.tsx`, `skeleton.tsx`, `spinner.tsx`, `status-dot.tsx` | 02 |
| `src/components/v5/ui/data-table.tsx`, `src/components/v5/ui/table-contract.ts`, `src/components/v5/ui/table-shell.tsx`, `src/components/v5/ui/table-row-actions.tsx`, `src/components/v5/ui/table-date-format.ts`, `src/components/v5/ui/sortable-th.tsx`, `src/components/v5/ui/use-sortable-data.ts`, `src/components/ui/table-contract.ts`, `src/components/ui/table-shell.tsx`, `src/components/ui/table-row-actions.tsx`, `src/components/ui/table-date-format.ts`, `src/components/ui/sortable-th.tsx`, `src/components/ui/use-sortable-data.ts` | 03 |
| `src/components/v5/layout/*` | 04 |
| `src/pages/v5/DashboardOverview.tsx`, `src/pages/v5/Reports.tsx`, `src/components/v5/dashboard/**`, `src/components/v5/intelligence/**` | 05 |
| `src/pages/v5/LeadTracker.tsx`, `src/pages/v5/AdsTracker.tsx`, `src/pages/v5/MediaTracker.tsx`, `src/components/lead-tracker/**`, `src/components/ads-tracker/**`, `src/components/media-tracker/**` | 06 |
| `src/pages/v5/OKRsManagement.tsx`, `src/pages/v5/DailySync.tsx`, `src/pages/v5/WeeklyCheckin.tsx`, `src/components/okr/**`, `src/components/daily-sync/**`, `src/components/modals/WeeklyCheckinModal.tsx` | 07 |
| `src/pages/v5/Settings.tsx`, `src/pages/v5/Profile.tsx`, `src/components/settings/**`, `src/components/v5/admin/**` | 08 |
| `docs/project-changelog.md`, `docs/development-roadmap.md` | 09 |
| `docs/code-standards.md`, `docs/project-overview-pdr.md`, `docs/development-roadmap.md`, optional `scripts/check-ui-ref-compliance.ts`, optional `package.json` | 10 |

## Validation Summary

**Validated:** 2026-05-13
**Questions asked:** 4

### Confirmed Decisions
- Token baseline: **Exact ref** — Phase 01 should align radius/header/shadow to Playground values unless implementation proves breakage.
- Theme scope: **Dark + light** — validation must cover both modes, not dark-only.
- Orange exceptions: **Allow data viz** — solid orange fill allowed for heatmap/intensity/status visualization; not allowed for CTA/tab/checkbox/navigation.
- Legacy cleanup: **Delete if unused** — Phase 09 may delete unused legacy dirs/files after grep proves zero imports.

### Action Items
- [x] Revise Phase 09 to validate both dark and light mode for every route.
- [x] Revise Phase 09 ownership to include deletion of proven-unused legacy files, with grep evidence before removal.
- [x] Add approved-exception rule to relevant phase success criteria: `bg-primary` allowed only for data visualization/status intensity.
- [x] Add Phase 10 Future Compliance Governance so future pages/features/charts/KPIs must pass Playground compliance gate.

