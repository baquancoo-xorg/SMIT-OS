# Phase 02 — Brand Identity + IA Rewrite

## Context Links

- Parent plan: [plan.md](./plan.md)
- Phase 1 input: `reports/phase-01-direction-winner.md` (winning direction)
- Brainstorm: [/plans/reports/brainstorm-260511-2147-ui-system-redesign-v3-stitch-full-rewrite.md](../reports/brainstorm-260511-2147-ui-system-redesign-v3-stitch-full-rewrite.md)
- Current IA reference: `src/components/layout/Sidebar.tsx`, `src/App.tsx`

## Overview

| Date | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|
| W1 D4-7 | P1 (gates tokens/components) | 4 days | pending | Phase 1 signed off |

## Key Insights

- Brand kit generated AFTER direction lock — avoid distraction (per brainstorm Q1)
- "SMIT" letterform retained even if logo evolves (risk mitigation for stakeholder reject)
- IA freeze AT END of this phase — zero changes after Phase 3 starts (scope creep gate)
- Page merge candidates: MediaTracker + AdsTracker → Acquisition Hub (evaluated, not locked yet)
- Wireframes Stitch-generated, not pixel-perfect — purpose: nav + page structure validation, not visual final

## Requirements

### Functional

- Generate brand kit (logo, color palette, font pairing) via `mcp__stitch__create_design_system`
- Redesign sidebar IA: group into ≤4 logical clusters (proposed: Rituals / Acquisition / Operations / Settings)
- Decide page merge/split per cluster — explicit list of final routes
- Mermaid diagram: new IA tree (sidebar → routes → tabs/sub-tabs)
- Stitch-generate wireframes for all final routes (target ~10)
- **User** sign-off recorded (single validator); IA marked frozen

### Non-functional

- Logo MUST retain "SMIT" letterform recognizability
- Brand kit deliverable: 1 primary + 1 secondary color + 1 accent + grayscale; 1 display + 1 body font
- IA freeze = signed `reports/phase-02-ia-freeze.md`; later changes blocked unless P0 bug
- Wireframes saved to `reports/wireframes/` as Stitch URLs + screenshot exports

## Architecture

```
Brand Kit
├── Logo (primary + monochrome variants)
├── Color palette (primary/secondary/accent + neutrals + status semantic)
└── Type pairing (display + body, fallback stack)

IA Tree (proposed)
├── Rituals
│   ├── DailySync
│   └── WeeklyCheckin
├── Acquisition
│   ├── LeadTracker
│   ├── MediaTracker (or merged)
│   └── AdsTracker (or merged)
├── Operations
│   ├── Dashboard (5 tabs)
│   └── OKRsManagement
└── Settings (5 sub-tabs) + Profile (sidebar item per v2 Q1)
```

## Related Code Files

- **Read for IA audit**:
  - `src/App.tsx` — current route table
  - `src/components/layout/Sidebar.tsx` — current nav structure
  - `src/components/settings/settings-tabs.tsx` — Settings nav
- **No code changes this phase** (design + planning only)
- **New artifacts**:
  - `reports/phase-02-brand-kit.md`
  - `reports/phase-02-ia-diagram.md` (Mermaid)
  - `reports/phase-02-wireframes/` (screenshots + Stitch URLs)
  - `reports/phase-02-ia-freeze.md` (signed sign-off)

## Implementation Steps

1. **Brand kit generation** (D4):
   - `mcp__stitch__create_design_system` seeded with Phase 1 winning direction
   - Iterate prompt until logo retains "SMIT" letterform
   - Capture: logo variants, color palette hex codes, font pairing names
2. **IA audit** (D5 morning): read current Sidebar + App routes → list 10 current routes + 5 Settings sub-tabs + 5 Dashboard tabs
3. **IA proposal** (D5 afternoon):
   - Draft cluster mapping (Rituals/Acquisition/Operations/Settings)
   - Decide merge: MediaTracker + AdsTracker → "Acquisition Hub" yes/no — pros/cons in report
   - Decide Profile placement: sidebar item (per v2 lock) or under Settings
   - Decide Dashboard 5 tabs: keep as tabs or split routes?
4. **Mermaid IA diagram**: tree from root → 4 clusters → routes → tabs/sub-tabs
5. **Wireframe generation** (D6):
   - `mcp__stitch__generate_screen_from_text` for each final route
   - Include layout shell (Sidebar+Header) in every wireframe for coherence check
   - Mobile variants for DailySync + WeeklyCheckin (critical per brainstorm)
6. **Sign-off package** (D7 morning): bundle brand kit + IA diagram + wireframes
7. **User sign-off + IA freeze** (D7 afternoon): block phase exit until signed `reports/phase-02-ia-freeze.md`

## Todo List

- [ ] Generate brand kit via Stitch design system tool
- [ ] Validate "SMIT" letterform retention
- [ ] Audit current routes + sub-routes
- [ ] Draft cluster mapping (4 clusters)
- [ ] Decide MediaTracker+AdsTracker merge
- [ ] Mermaid IA diagram
- [ ] Wireframes for all final routes (~10)
- [ ] Mobile wireframes for DailySync + WeeklyCheckin
- [ ] Sign-off package
- [ ] IA freeze document signed

## Success Criteria

- Brand kit delivered: logo + colors + fonts, "SMIT" letterform retained
- IA diagram: ≤4 clusters, ≤12 sidebar items, no orphan routes
- Wireframes: 1 per final route + mobile variants for 2 ritual pages
- User signed `phase-02-ia-freeze.md` — no IA changes after this point

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Logo rejected (loses "SMIT" recognizability) | MEDIUM | Constraint baked into prompt; iterate up to 5 generations; user veto power; keep current logo as fallback |
| IA scope creep mid-Phase 3+ | HIGH | Hard freeze gate (`ia-freeze.md`); post-freeze IA change requires plan revision + user signature |
| Page merge breaks business logic (Media+Ads share state) | MEDIUM | This phase: only visual/routing decision — defer integration risk to Phase 5 with explicit migration test |
| Mobile wireframes weak (Stitch desktop bias) | MEDIUM | Explicit mobile prompts for DailySync/WeeklyCheckin; 375px viewport context in prompt |
| Stitch design system tool slow/unreliable | MEDIUM | Plan 1d buffer; fallback to manual palette + Google Fonts pairing if tool fails |

## Security Considerations

- N/A (design phase, no code or data)
- Caveat: logo MUST be free-licensed or original — verify Stitch output license terms before commit

## Next Steps

- Phase 3 input: locked brand kit (hex codes, font names) + IA tree → drives token rewrite
- Phase 5 input: wireframes → page migration acceptance reference
