# Phase 0 — Canon Audit + Stitch Extension

## Context Links
- Parent: [plan.md](plan.md)
- Brainstorm: `plans/reports/brainstorm-260514-0946-ui-canon-v3-compliance.md`
- Canon: `docs/ref-ui-playground/Playground .html` (10059 lines, 28 sections)
- Contract: `docs/ui-design-contract.md` (v2.0, sections §1-§45)
- Codebase: `docs/codebase-summary.md`

## Overview
- **Date:** 2026-05-14
- **Priority:** P1
- **Status:** in_progress (docs complete, Stitch screens deferred)
- **Description:** Audit 25 existing v5 primitives vs Playground canon, generate Stitch DESIGN.md + 10 derived screens to fill missing-component canon gaps.

## Key Insights
- Playground HTML 10k+ lines — must grep section markers (`<h2`, `<h3`) rather than full read.
- Stitch DESIGN.md must be ≥200 lines covering color OKLCH / typography Hanken / radius / shadow / motion / primary CTA DNA / light parity map.
- Sequential batch generation (pin `GEMINI_3_1_PRO`) — drift mitigation per D2.
- Existing primitives drift areas: radius, shadow, primary CTA DNA, light parity.

## Requirements

### Functional
- Produce audit matrix for 25 v5 primitives mapping to playground §1-§28.
- Produce `DESIGN.md` Stitch seed file ≥200 lines.
- Produce 10 Stitch-generated screen batches (PNG) covering missing-component canon.

### Non-Functional
- All artifacts under `docs/ref-ui-playground/`.
- Audit cross-verified with ai-multimodal screenshot compare vs playground.
- DESIGN.md OKLCH values match playground HTML root tokens (lines ~17-180).

## Architecture
```
docs/ref-ui-playground/
├── Playground .html        (existing — frozen canon)
├── DESIGN.md               (NEW — Stitch seed, ≥200 lines)
├── audit-report.md         (NEW — 25-component matrix)
└── stitch-screens/         (NEW)
    ├── 01-dashboard-charts.png
    ├── 02-reports-surface.png
    ├── 03-heatmap-matrix.png
    ├── 04-funnel-viz.png
    ├── 05-settings-controls.png
    ├── 06-form-modal.png
    ├── 07-tooltip-variants.png
    ├── 08-feedback-stack.png
    ├── 09-pagination-table.png
    └── 10-chart-states.png
```

Flow:
1. Grep playground HTML → extract section structure (28 sections).
2. Read 25 v5 primitives → diff vs playground → matrix output.
3. Author DESIGN.md from playground token extracts.
4. Use MCP Stitch `create_design_system_from_design_md` → seed project.
5. Use `generate_screen_from_text` × 10 batches → PNG.

## Related Code Files
**Modify:** none (audit-only phase)
**Create:**
- `docs/ref-ui-playground/DESIGN.md`
- `docs/ref-ui-playground/audit-report.md`
- `docs/ref-ui-playground/stitch-screens/01-dashboard-charts.png`
- `docs/ref-ui-playground/stitch-screens/02-reports-surface.png`
- `docs/ref-ui-playground/stitch-screens/03-heatmap-matrix.png`
- `docs/ref-ui-playground/stitch-screens/04-funnel-viz.png`
- `docs/ref-ui-playground/stitch-screens/05-settings-controls.png`
- `docs/ref-ui-playground/stitch-screens/06-form-modal.png`
- `docs/ref-ui-playground/stitch-screens/07-tooltip-variants.png`
- `docs/ref-ui-playground/stitch-screens/08-feedback-stack.png`
- `docs/ref-ui-playground/stitch-screens/09-pagination-table.png`
- `docs/ref-ui-playground/stitch-screens/10-chart-states.png`

## Implementation Steps
1. Grep `Playground .html` for `<h2|<h3` → list 28 section anchors + dump to scratch.
2. Read each `src/components/v5/ui/*.tsx` (25 files) — note structural classes, color refs, radius, shadow.
3. Build `audit-report.md` matrix: columns = `component | playground § | current state | drift | action | effort`.
4. Cross-verify drift via ai-multimodal — screenshot `localhost:3000/v4/playground` section vs v5 in-app usage.
5. Extract playground root tokens (CSS variables lines 17-180) → seed DESIGN.md color/radius/shadow/motion.
6. Write DESIGN.md with sections: Color (OKLCH brand/neutral/semantic/dept), Typography (Hanken), Radius (card/input/button), Shadow (compact/elevated/glow), Motion (timing/easing), Primary CTA DNA, Light Parity Map.
7. Invoke `mcp__stitch__create_design_system_from_design_md` with DESIGN.md content.
8. Sequentially invoke `mcp__stitch__generate_screen_from_text` ×10 (one batch at a time — review before next).
9. Save PNG outputs to `stitch-screens/` with kebab-case names.
10. Final ai-multimodal pass — verify each PNG aligns with playground DNA (no solid orange, dark gradient CTA, OKLCH palette).

## Todo List
- [x] Grep playground HTML structure → 28 sections list
- [x] Read 25 v5 primitives — drift notes
- [x] Author `audit-report.md` matrix
- [ ] Cross-verify drift via ai-multimodal screenshot diff (deferred)
- [x] Extract playground root tokens
- [x] Author `DESIGN.md` (≥200 lines) — all required sections
- [x] MCP Stitch seed project from DESIGN.md (existing project used)
- [ ] Generate batch 01-10 — Stitch screens (timeout, deferred to manual)
- [ ] Final ai-multimodal DNA compliance verify (deferred)

**Note:** Stitch API timeout on screen generation. Docs complete. Stitch screens can be generated manually via Stitch UI using DESIGN.md spec.

## Success Criteria
- `audit-report.md` complete: all 25 components mapped, action + effort listed.
- `DESIGN.md` ≥200 lines covering 7 spec sections.
- 10 PNG saved in `stitch-screens/`.
- Each PNG verified — no solid orange CTA, OKLCH palette, dark+light DNA visible.

## Risk Assessment
| Risk | Severity | Mitigation |
|---|---|---|
| Playground HTML grep returns noisy/incomplete sections | Low | Cross-check by rendering `/v4/playground` localhost screenshot — D11 not yet restored, use static HTML snapshot |
| Stitch batch drift between calls | Med | Sequential, pin GEMINI_3_1_PRO, review each before next batch |
| Audit miss edge case in 25 components | Med | ai-multimodal screenshot diff vs playground per primitive |
| MCP Stitch unavailable / quota | Med | Fallback: manual mockup via existing playground HTML clip + annotation |

## Security Considerations
- No PII / no auth surface — docs-only phase.
- Stitch outputs are static PNG, no executable content.

## Next Steps
- Blocks Phase 1 (contract update consumes audit + Stitch ref).
- Followup: feed audit + DESIGN.md into Phase 1 contract v3.0 specs.
