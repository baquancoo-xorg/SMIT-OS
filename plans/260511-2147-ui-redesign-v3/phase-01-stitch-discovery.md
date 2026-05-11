# Phase 01 — Stitch Discovery

## Context Links

- Parent plan: [plan.md](./plan.md)
- Brainstorm: [/plans/reports/brainstorm-260511-2147-ui-system-redesign-v3-stitch-full-rewrite.md](../reports/brainstorm-260511-2147-ui-system-redesign-v3-stitch-full-rewrite.md)
- v2 predecessor (drift baseline): [/plans/260510-0358-ui-system-redesign/plan.md](../260510-0358-ui-system-redesign/plan.md)
- Inspiration pack (Linear screenshots, reference only): [`reports/inspiration/`](./reports/inspiration/README.md)

## Overview

| Date | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|
| 2026-05-11 → W1 D1-3 | P1 (gates all downstream) | 3 days | pending | None (start phase) |

## Key Insights

- Aesthetic gate is single biggest risk — entire 4-6w plan invalidated if direction wrong
- Stitch Pro Agent had reliability issues in v2 → generate 4-5 variants per prompt to absorb variance
- **No benchmark gate** (user decision 2026-05-11) — single validator + Stitch trust, echo chamber risk accepted
- Cross-page coherence > single-page wow — direction MUST work across 4 key pages
- 5 direction prompts cover spectrum: Glass aurora / Bento 3D / Editorial / Cyberpunk / Premium SaaS

## Requirements

### Functional

- Create Stitch project via `mcp__stitch__create_project`
- Generate 4-5 variants per key page × 4 key pages = 16-20 mockups
- Linear screenshots (5 files) in `reports/inspiration/` available as **reference inspiration only** — not gate criteria
- **User signs off** 1 winning direction before phase exit (single validator)

### Non-functional

- All Stitch outputs saved as references in `reports/stitch-variants/` (URLs + screenshot exports)
- Phase exit deliverable: 1 markdown report with winning direction rationale
- Hard cap: 3 days. If no winner by D3 EOD → escalate (re-prompt or accept 2 finalists for Phase 2 vote)

## Architecture

```
Stitch project
├── Variant set A: Dashboard Overview × 5 directions
├── Variant set B: Sidebar+Header shell × 5 directions
├── Variant set C: Settings (5 sub-tabs) × 5 directions
└── Variant set D: Tables (Lead Logs/Ads/Media) × 5 directions

Decision matrix (5 × 4 = 20 combos)
└── Direction winner = direction that ranks top-2 across ≥3 of 4 pages
```

## Related Code Files

- **No code changes this phase** (discovery only)
- Reference reads:
  - `src/components/dashboard/overview/*` — current Dashboard structure
  - `src/components/layout/{Sidebar,Header}.tsx` — current shell
  - `src/components/settings/*` — current Settings
  - `src/components/lead-tracker/logs-tab.tsx` — current table baseline

## Implementation Steps

1. **Create Stitch project** (D1 morning): `mcp__stitch__create_project` with name "SMIT-OS v3 Discovery"
2. **Build direction prompt library** (D1 afternoon): write 5 master prompts per brainstorm spec
   - "Modern glassmorphism with aurora gradients and depth"
   - "Apple-style bento grid with 3D card hover"
   - "Linear-inspired editorial minimalist with subtle motion"
   - "Dark cyberpunk dashboard with neon accents"
   - "Stripe-style premium SaaS with soft shadows"
3. **Page-specific context strings**:
   - Dashboard: "5 tabs (Overview/Sales/Product/Marketing/Media), 8 KPI cards top, 3 chart panels, recent activity table"
   - Sidebar+Header: "12 menu items grouped 4-4-2-2, logo top, avatar bottom, search top, breadcrumb in header, notification icon"
   - Settings: "5 sub-tab nav (Profile/Users/OKR Cycles/FB Config/Sheets Export), form-heavy"
   - Tables: "sortable columns, filter chips, search, row actions, pagination"
4. **Generate variants** (D2): `mcp__stitch__generate_screen_from_text` for each of 20 combos. Iterate prompt if first output weak.
5. **Cross-page coherence check** (D3 morning): tabulate which direction(s) score top-2 on ≥3 of 4 pages
6. **User review session** (D3 afternoon): walk through variant matrix, user picks winner by gut feel + Linear inspiration cross-check
7. **Pick winner** + write `reports/phase-01-direction-winner.md`
8. **User sign-off gate** — block Phase 2 until signed

## Todo List

- [ ] Create Stitch project via mcp__stitch__create_project
- [ ] Write 5 direction prompts × 4 pages = 20 prompt combos
- [ ] Generate 20 variant sets via Stitch
- [ ] Build cross-page coherence matrix
- [ ] User review session (gut feel + Linear cross-check)
- [ ] Draft direction-winner report
- [ ] User sign-off

## Success Criteria

- ≥1 direction scores top-2 on ≥3 of 4 key pages
- User explicit sign-off recorded in `reports/phase-01-direction-winner.md`
- Phase 2 unblocked

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| All variants bland but user feels wow (echo chamber) | HIGH | User-accepted risk (no benchmark guard). Mitigation: cross-reference Linear inspiration before final pick. |
| Stitch service outage | MEDIUM | Plan day-buffer; fallback to manual inspiration browse if Stitch down >24h |
| Direction wins single page only (no coherence) | MEDIUM | Coherence check IS the gate, not single-page wow |
| User indecisive between 2 finalists | LOW | Time-box decision to 4h; if tied, default to direction with stronger Sidebar+Header (foundation) |
| User opinion shifts after Phase 4-5 build | HIGH | Inherent risk of single-validator. Phase 2 IA freeze + early commitment to direction critical. |

## Security Considerations

- N/A (discovery phase, no code or data touched)

## Next Steps

- Phase 2 input: winning direction document + visual references
- Hand off: locked direction prompt for brand identity generation (Phase 2 Stitch design system creation)
