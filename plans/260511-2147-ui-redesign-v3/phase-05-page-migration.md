# Phase 05 — Page Migration

## Context Links

- Parent plan: [plan.md](./plan.md)
- Phase 4 input: v3 component library at `src/components/ui/`
- Phase 2 input: wireframes (acceptance reference) + IA freeze doc
- v2 pages baseline: shipped 2026-05-10 via [v2 plan](../260510-0358-ui-system-redesign/plan.md)

## Overview

| Date | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|
| W4 ½ + W5 | P1 (delivers user value) | 1.5 weeks | pending | Phase 4 done (≥80% components, esp. shell) |

## Key Insights

- Migration order by dependency: shell → simple → complex → critical
- Feature flag old UI during migration; remove flag at phase end
- One page at a time on isolated commits → easy rollback
- Mobile gate REQUIRED for DailySync + WeeklyCheckin (per brainstorm + v2 lock)
- OKRsManagement (1010+ LOC) — extract `AddObjectiveModal` minimum (per brainstorm Q3)
- DO NOT touch business logic — only visual + routing per brainstorm risk register

## Requirements

### Functional

Migrate 10 pages in this order (see Implementation Steps for rationale):
1. LoginPage (+ 2FA flow) — isolated, brand first impression
2. Layout shell — Sidebar, Header, NotificationCenter, OkrCycleCountdown, AppLayout
3. Dashboard Overview — 5 tabs (Overview/Sales/Product/Marketing/Media), 38 sub-components
4. Settings — 5 sub-tabs (Profile/Users/OKR Cycles/FB Config/Sheets Export)
5. WeeklyCheckin + DailySync — rituals, mobile critical
6. OKRsManagement — 1010+ LOC, extract AddObjectiveModal
7. LeadTracker + MediaTracker + AdsTracker — acquisition cluster (or merged Acquisition Hub if Phase 2 chose)
8. Profile — trivial

### Per-page acceptance

- Visual match wireframe (≥90% structural fidelity)
- Zero functional regression (smoke test critical flow)
- Mobile responsive at 375px (full pages: required; DailySync + WeeklyCheckin: HARD gate with screenshots)
- E2E manual smoke per page before next page starts

### Non-functional

- Feature flag mechanism: `?v=3` query param OR env flag → toggles v2/v3 component import
- One commit per page minimum (rollback granularity)
- v2 components NOT deleted during migration (kept for rollback) — deletion at phase end after final sign-off
- Branch strategy: migrate on `main` directly per current repo convention (v2 did the same)

## Architecture

```
Migration order (dependency graph):
1. Login           → isolated  (no shell dep)
2. Layout shell    → Sidebar/Header/NotificationCenter (consumed by 3-8)
3. Dashboard       → most components, validate library breadth
4. Settings        → multi-tab pattern reference
5. Rituals         → DailySync + WeeklyCheckin (mobile critical)
6. OKRs            → heaviest, refactor AddObjectiveModal
7. Acquisition     → LeadTracker + MediaTracker + AdsTracker
8. Profile         → trivial, ship last as polish

Feature flag:
├── ?v=3 OR localStorage flag → import v3 page component
└── default → v2 (until phase exit, then flip default to v3)
```

## Related Code Files

### Modify
- `src/pages/LoginPage.tsx` (488 LOC)
- `src/components/layout/{AppLayout,Header,Sidebar,NotificationCenter,OkrCycleCountdown}.tsx`
- `src/components/dashboard/overview/*` + 5 tab containers + 38 sub-components
- `src/pages/SettingsPage.tsx` + `src/components/settings/{profile,user-management,okr-cycles,fb-config,sheets-export}-tab.tsx`
- `src/pages/DailySync.tsx` (349 LOC) + sub-components
- `src/pages/WeeklyCheckin.tsx` (239 LOC) + `src/components/modals/WeeklyCheckinModal.tsx`
- `src/pages/OKRsManagement.tsx` (1010+ LOC)
- `src/components/lead-tracker/*` (10 files)
- `src/components/media-tracker/*` (3 files)
- `src/components/ads-tracker/*` (3 files)
- `src/pages/Profile.tsx` (72 LOC)
- `src/App.tsx` — routing if IA changed (Phase 2 decisions)

### Create
- `src/components/okrs/add-objective-modal.tsx` — extract from OKRsManagement
- Feature flag util (if not present): `src/lib/v3-flag.ts`

### Delete (at phase exit)
- v2 leftover components in `src/components/ui/` (already replaced in Phase 4 in-place — verify nothing orphan)
- Any `*-v2.tsx` shells from previous v2 migration

## Implementation Steps

1. **Setup feature flag** (D1 morning, 30min): `src/lib/v3-flag.ts` reads `?v=3` query OR `localStorage.uiV3`
2. **Migrate LoginPage** (D1): visual rewrite using v3 primitives, retain 2FA flow logic
3. **Migrate layout shell** (D2): Sidebar (new IA grouping), Header, NotificationCenter, OkrCycleCountdown, AppLayout
   - Critical: shell consumed by all subsequent pages → must stabilize before Step 4
4. **Migrate Dashboard** (D3-D4): heaviest page, 5 tabs + 38 sub-components
   - Per tab: visual rewrite, retain data hooks untouched
   - BentoCard adoption checkpoint (signature element)
5. **Migrate Settings** (D5): 5 sub-tabs, form-heavy — validate Input/FormDialog primitives breadth
6. **Migrate Rituals** (D6): WeeklyCheckin + DailySync
   - HARD mobile gate: screenshot 375px for both pages before merge
   - Sticky save bar pattern preserved
7. **Migrate OKRsManagement** (D7-D8):
   - Extract `AddObjectiveModal` to dedicated file (drops main file ~200 LOC)
   - L1/L2 tabs, KR drag-drop preserved
8. **Migrate Acquisition cluster** (D9):
   - If Phase 2 merged Media+Ads → Acquisition Hub: route consolidation + tab restructure
   - Else: 3 separate pages
9. **Migrate Profile** (D10 morning, trivial)
10. **Feature flag flip** (D10 afternoon):
    - Default flip `v3=true`
    - Smoke test all 10 pages
    - User sign-off
11. **Cleanup** (D10 end): remove feature flag code, delete any v2 leftover files
12. **Commit + tag** `v3-migration-complete`; Phase 6 unblocked

## Todo List

- [ ] Feature flag mechanism
- [ ] LoginPage migrate
- [ ] Layout shell migrate (Sidebar/Header/Nav/Countdown/AppLayout)
- [ ] Dashboard migrate (5 tabs, 38 sub-components)
- [ ] Settings migrate (5 sub-tabs)
- [ ] WeeklyCheckin migrate (+ mobile gate)
- [ ] DailySync migrate (+ mobile gate)
- [ ] OKRsManagement migrate + AddObjectiveModal extract
- [ ] LeadTracker migrate
- [ ] MediaTracker migrate (or merged)
- [ ] AdsTracker migrate (or merged)
- [ ] Profile migrate
- [ ] Feature flag flip + smoke test
- [ ] Remove feature flag + v2 cleanup
- [ ] Commit + tag

## Success Criteria

- 10 pages migrated, all using v3 components from `src/components/ui/`
- Feature flag removed; default = v3
- Zero v2 leftover files in `src/components/` (grep audit)
- Manual smoke test passes on critical flows: login → dashboard → checkin → lead log → OKR add
- Mobile screenshots captured at 375px for DailySync + WeeklyCheckin → user approved
- OKRsManagement main file ≤ 850 LOC after `AddObjectiveModal` extract

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| 10 pages migration regression (forms, hooks, integrations) | HIGH | Page-by-page commits; smoke test per page before next; do NOT touch business logic |
| Mobile critical pages regression (DailySync, WeeklyCheckin) | HIGH | Hard mobile gate with 375px screenshots; user approval before merge |
| Database/integration break during migration | MEDIUM | Touch only visual + routing layers; preserve data hooks + API calls verbatim |
| OKRsManagement complexity (1010+ LOC) blows budget | HIGH | Extract `AddObjectiveModal` first; if still >2d, defer cosmetic polish to Phase 6 |
| IA change (Phase 2) breaks deep links / bookmarks | MEDIUM | App.tsx route redirects for old paths if merge happened; document in changelog |
| Feature flag leak (some users stuck on v2) | LOW | Flag removal at phase end is mandatory; verify default v3 on prod build |
| Shell ships broken → all downstream pages broken | HIGH | Shell migrated D2 with explicit smoke test gate before Dashboard starts |

## Security Considerations

- LoginPage migration: preserve 2FA flow logic byte-for-byte; visual only
- Settings/Users tab: preserve RBAC gates (Admin-only access) — no permission regression
- Feature flag MUST NOT bypass auth (visual toggle only, no auth path divergence)

## Next Steps

- Phase 6 consumes: full v3 pages → polish, performance, docs
- Phase 6 also: rewrite `docs/ui-style-guide.md` (was deprecated in v2)
