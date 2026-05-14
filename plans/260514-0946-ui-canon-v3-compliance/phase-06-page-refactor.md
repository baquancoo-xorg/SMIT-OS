# Phase 6 — Per-Page Refactor (10 pages waterfall)

## Context Links
- Parent: [plan.md](plan.md)
- Prev: [phase-05-layout-shell.md](phase-05-layout-shell.md)
- Contract: `docs/ui-design-contract.md` — all sections; specifically:
  - Dashboard: §29-§31b, §47
  - Reports: §29-§31b, §47
  - AdsTracker: §27, §28
  - LeadTracker: §27, §28, §41
  - MediaTracker: §27, §28
  - DailySync: §32-§34
  - OKR: §27, §32-§34
  - WeeklyCheckin: §27, §32-§34
  - Settings: §40
  - Profile: §41
- Stitch ref: all 10 batches from Phase 0
- 4 DoD gates active (Phase 4 hard gate ENV)

## Overview
- **Date:** 2026-05-14
- **Priority:** P1
- **Status:** pending
- **Description:** Waterfall refactor 10 v5 pages — each page gets per-page todo block with 4 DoD gates: Visual / Token grep / A11y+Perf / Contract cite.

## Key Insights
- Page order chosen by chart-heaviness + complexity (dashboard chart-heavy first; profile last).
- "Primitive hot-add" rule (D9) — if a page needs an absent primitive, code it in `v5/ui/` first + backfill contract §51 same PR.
- Each page = separate PR — easier review + rollback.
- DoD gate 4 (contract cite) requires PR description list of §-sections + Future Work Gate checked.
- Long-lived branch `ui-canon-v3` rebased main per page-PR or batched.

## Requirements

### Functional
Refactor 10 pages in order:
1. DashboardOverview
2. Reports
3. AdsTracker
4. LeadTracker
5. MediaTracker
6. DailySync
7. OKRsManagement
8. WeeklyCheckin
9. Settings
10. Profile

Per page:
- Replace ad-hoc styling with canonical primitives.
- Replace ad-hoc charts with `v5/ui/charts/*` wrappers.
- Dark + light verify.
- All 4 DoD gates pass.

### Non-Functional
- Each page file may exceed 200 lines (data-heavy pages); split into sub-components in same folder (e.g. `pages/v5/dashboard/`).
- No raw `useEffect` data fetch — Suspense + Skeleton per §44.
- Page-level Suspense boundary.

## Architecture
Each page becomes a thin orchestrator:
```
src/pages/v5/DashboardOverview.tsx       (orchestrator, <200 lines)
src/pages/v5/dashboard/                  (NEW or extend)
├── kpi-row.tsx
├── chart-panel.tsx
├── recent-activity.tsx
└── …
```
(Similar split pattern per page where needed.)

## Related Code Files
**Modify (10 pages):**
- `src/pages/v5/DashboardOverview.tsx`
- `src/pages/v5/Reports.tsx`
- `src/pages/v5/AdsTracker.tsx`
- `src/pages/v5/LeadTracker.tsx`
- `src/pages/v5/MediaTracker.tsx`
- `src/pages/v5/DailySync.tsx`
- `src/pages/v5/OKRsManagement.tsx`
- `src/pages/v5/WeeklyCheckin.tsx`
- `src/pages/v5/Settings.tsx`
- `src/pages/v5/Profile.tsx`

**Create (page sub-component folders as needed):**
- `src/pages/v5/dashboard/`
- `src/pages/v5/reports/`
- `src/pages/v5/ads-tracker/`
- `src/pages/v5/lead-tracker/`
- `src/pages/v5/media-tracker/`
- `src/pages/v5/daily-sync/`
- `src/pages/v5/okrs/`
- `src/pages/v5/weekly-checkin/`
- `src/pages/v5/settings/`
- `src/pages/v5/profile/`

## Implementation Steps
Per page (template, repeat 10×):
1. Audit current page — list components used + drift areas.
2. Replace ad-hoc primitives with `v5/ui/*` canonical primitives.
3. Replace ad-hoc charts with `v5/ui/charts/*` wrappers.
4. Split into sub-components if >200 lines.
5. Wrap data sections in `<Suspense fallback={Skeleton}>` per §44.
6. Dark mode visual verify.
7. Light mode visual verify.
8. DoD Gate 1 — Visual: screenshot dark+light, ai-multimodal compare vs Stitch ref / playground.
9. DoD Gate 2 — Token grep: `npm run lint:ui-canon` — zero new violations (hard gate).
10. DoD Gate 3 — A11y + Perf checklist per §43/§44/§45 (skip-link, aria-label, focus order, Suspense, skeleton, virtualize).
11. DoD Gate 4 — Contract cite: PR description lists §-sections + Future Work Gate checked.
12. Open PR → merge once 4 gates pass.

## Todo List

### Page 1 — DashboardOverview (§29-§31b, §47)
- [ ] Audit current components + drift areas
- [ ] Refactor: replace ad-hoc styling with canonical primitives
- [ ] Replace ad-hoc charts with `v5/ui/charts/*` wrappers
- [ ] Split into `pages/v5/dashboard/` sub-components if >200 lines
- [ ] Wrap data sections in Suspense + Skeleton (§44)
- [ ] Dark mode visual verify
- [ ] Light mode visual verify
- [ ] DoD Gate 1 — Visual diff vs Stitch ref / playground
- [ ] DoD Gate 2 — `lint:ui-canon` 0 violations
- [ ] DoD Gate 3 — A11y+Perf checklist §43/§44/§45
- [ ] DoD Gate 4 — Contract cite in PR description

### Page 2 — Reports (§29-§31b, §47)
- [ ] Audit
- [ ] Refactor primitives
- [ ] Refactor charts (pie/donut/area surface)
- [ ] Sub-component split if needed
- [ ] Suspense + Skeleton
- [ ] Dark / Light verify
- [ ] DoD Gate 1 — Visual
- [ ] DoD Gate 2 — Token grep
- [ ] DoD Gate 3 — A11y+Perf
- [ ] DoD Gate 4 — Contract cite

### Page 3 — AdsTracker (§27, §28)
- [ ] Audit
- [ ] Refactor table → DataTable + Pagination
- [ ] Refactor filters → FilterChip + Combobox
- [ ] Sub-component split if needed
- [ ] Suspense + Skeleton
- [ ] Dark / Light verify
- [ ] DoD Gate 1 — Visual
- [ ] DoD Gate 2 — Token grep
- [ ] DoD Gate 3 — A11y+Perf
- [ ] DoD Gate 4 — Contract cite

### Page 4 — LeadTracker (§27, §28, §41)
- [ ] Audit
- [ ] Refactor table + funnel chart usage
- [ ] Replace lead avatar with Avatar primitive
- [ ] Sub-component split if needed
- [ ] Suspense + Skeleton
- [ ] Dark / Light verify
- [ ] DoD Gate 1 — Visual
- [ ] DoD Gate 2 — Token grep
- [ ] DoD Gate 3 — A11y+Perf
- [ ] DoD Gate 4 — Contract cite

### Page 5 — MediaTracker (§27, §28)
- [ ] Audit
- [ ] Refactor table + filter row
- [ ] Sub-component split if needed
- [ ] Suspense + Skeleton
- [ ] Dark / Light verify
- [ ] DoD Gate 1 — Visual
- [ ] DoD Gate 2 — Token grep
- [ ] DoD Gate 3 — A11y+Perf
- [ ] DoD Gate 4 — Contract cite

### Page 6 — DailySync (§32-§34)
- [ ] Audit
- [ ] Refactor feedback stack (toast/banner/alert)
- [ ] Sub-component split if needed
- [ ] Suspense + Skeleton
- [ ] Dark / Light verify
- [ ] DoD Gate 1 — Visual
- [ ] DoD Gate 2 — Token grep
- [ ] DoD Gate 3 — A11y+Perf
- [ ] DoD Gate 4 — Contract cite

### Page 7 — OKRsManagement (§27, §32-§34)
- [ ] Audit
- [ ] Refactor table + progress bars
- [ ] Sub-component split if needed
- [ ] Suspense + Skeleton
- [ ] Dark / Light verify
- [ ] DoD Gate 1 — Visual
- [ ] DoD Gate 2 — Token grep
- [ ] DoD Gate 3 — A11y+Perf
- [ ] DoD Gate 4 — Contract cite

### Page 8 — WeeklyCheckin (§27, §32-§34)
- [ ] Audit
- [ ] Refactor checkin form (Textarea, FileUpload, MultiSelect)
- [ ] Sub-component split if needed
- [ ] Suspense + Skeleton
- [ ] Dark / Light verify
- [ ] DoD Gate 1 — Visual
- [ ] DoD Gate 2 — Token grep
- [ ] DoD Gate 3 — A11y+Perf
- [ ] DoD Gate 4 — Contract cite

### Page 9 — Settings (§40)
- [ ] Audit
- [ ] Refactor controls (Checkbox / Switch / Radio / Combobox)
- [ ] Sub-component split if needed
- [ ] Suspense + Skeleton
- [ ] Dark / Light verify
- [ ] DoD Gate 1 — Visual
- [ ] DoD Gate 2 — Token grep
- [ ] DoD Gate 3 — A11y+Perf
- [ ] DoD Gate 4 — Contract cite

### Page 10 — Profile (§41)
- [ ] Audit
- [ ] Refactor profile surface (Avatar, Card, Banner)
- [ ] Sub-component split if needed
- [ ] Suspense + Skeleton
- [ ] Dark / Light verify
- [ ] DoD Gate 1 — Visual
- [ ] DoD Gate 2 — Token grep
- [ ] DoD Gate 3 — A11y+Perf
- [ ] DoD Gate 4 — Contract cite

## Success Criteria
- All 10 pages pass 4 DoD gates.
- `lint:ui-canon` 0 violations across `src/pages/v5/**`.
- Dark + light visual parity verified per page.
- Page files ≤200 lines (or split into sub-components).
- Suspense + Skeleton on all data sections.
- A11y per §43-§45.
- PR descriptions cite §-sections + Future Work Gate checked.

## Risk Assessment
| Risk | Severity | Mitigation |
|---|---|---|
| Page surface uses a primitive not in Phase 3 list | Med | Apply primitive hot-add rule — code primitive in same PR + backfill §51 |
| Light parity broken on heatmap/funnel | Med | Allow skip light snapshot for these; revisit Phase 7 |
| Sub-component split blows out PR diff | Med | Mechanical split commit + functional change commit separate |
| Visual gate ai-multimodal flaky | Low | Allow manual screenshot diff as backup |
| Hard gate violation surprises team | Med | Pre-flight: announce hard gate ON before this phase starts |
| Suspense boundary missing in some legacy pages | Med | Add at minimum 1 boundary per data section |
| Long PR queue blocks other work | High | Strict freeze on `v5/ui/**` from feature PRs during this phase |

## Security Considerations
- A11y compliance per WCAG 2.1 AA across every page.
- No PII in screenshots committed to baseline (use seed data only).
- File upload (WeeklyCheckin) — client-side validation per §51 spec.

## Next Steps
- Blocks Phase 7 (legacy cleanup needs page consumers stable first).
- Final visual baseline re-snapshot post-phase (Phase 7 step).
