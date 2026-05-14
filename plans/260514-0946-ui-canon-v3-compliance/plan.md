---
title: "UI Canon v3 Compliance Overhaul"
description: "Foundation-first refactor — align entire v5 UI to Playground v4 canon + Stitch-extended ref, with dark+light parity, chart wrappers, 4 DoD gates per page."
status: complete
priority: P1
effort: 15-18d
branch: ui-canon-v3
tags: [ui, refactor, design-system, v5, canon, light-mode, charts, stitch]
created: 2026-05-14
---

# UI Canon v3 Compliance Overhaul

## Problem
Playground v4 = visual canon (28 sections / 22 primitives) but missing chart/heatmap/pie/donut/funnel/checkbox/switch/textarea/tooltip/etc. `src/components/v5/ui/**` has 25 primitives drifting vs canon (radius, shadow, primary CTA DNA, light parity). `docs/ui-design-contract.md` v2.0 lacks chart taxonomy, primary CTA DNA spec, Stitch ref, light token map, missing-primitive specs.

## Goals
1. Extend canon = Playground v4 HTML + Stitch-generated screens for missing components.
2. Refactor in-place v5 (no v6); tokens → primitives → shell → pages.
3. Dark + light parity day-1 for every touched component.
4. Wrap Recharts canonical with OKLCH tokens.
5. Every page PR pass 4 DoD gates: visual / token grep / a11y+perf / contract cite.

## Source Refs
- Brainstorm: `plans/reports/brainstorm-260514-0946-ui-canon-v3-compliance.md`
- Canon: `docs/ref-ui-playground/Playground .html`
- Contract: `docs/ui-design-contract.md` → v3.0
- Stack: `docs/system-architecture.md`, `docs/code-standards.md`, `docs/codebase-summary.md`

## Decisions (locked — see brainstorm)
D1 Canon = Playground.html v4 only · D2 Stitch full DESIGN.md → seed → derive · D3 Refactor v5 in-place · D4 Light + dark parity day-1 · D5 Foundation-first waterfall · D6 Recharts wrap in `v5/ui/charts/` · D7 Manual audit per-component · D8 4 DoD gates · D9 Contract incremental update · D10 CI grep gate warn → hard at Phase 4 · D11 Restore `/v4/playground` + add `/v5/playground` post-Phase 3.

## Phases
| # | Phase | File | Status | Effort |
|---|---|---|---|---|
| 0 | Canon Audit + Stitch Extension | [phase-00-canon-audit-and-extension.md](phase-00-canon-audit-and-extension.md) | complete (docs) | 1-2d |
| 1 | Contract v3.0 Update | [phase-01-contract-v3.md](phase-01-contract-v3.md) | complete | 1d |
| 2 | Token Foundation + CI Gate | [phase-02-token-foundation.md](phase-02-token-foundation.md) | complete | 1-2d |
| 3 | Primitive Realignment (25 + 13) | [phase-03-primitive-realignment.md](phase-03-primitive-realignment.md) | complete | 4-5d |
| 4 | Chart Wrappers | [phase-04-chart-wrappers.md](phase-04-chart-wrappers.md) | complete | 2d |
| 5 | Layout Shell + Playground Routes | [phase-05-layout-shell.md](phase-05-layout-shell.md) | complete | 1d |
| 6 | Per-Page Refactor (10 pages) | [phase-06-page-refactor.md](phase-06-page-refactor.md) | complete | 5-7d |
| 7 | Legacy Cleanup + Lock | [phase-07-legacy-cleanup-and-lock.md](phase-07-legacy-cleanup-and-lock.md) | complete | 1d |

## Branch Strategy
- Long-lived branch `ui-canon-v3` from `main`.
- Rebase main per phase; merge phase PR when done.
- Freeze `src/components/v5/ui/**` edits from feature PRs (announce in team).
- Phase 0-2 single PR each; Phase 3+ split sub-PRs (existing audit / missing primitives / chart wrappers).

## Top-Level Dependencies
- MCP Stitch tools (`mcp__stitch__*`) for Phase 0 screen generation.
- ai-multimodal skill for visual diff verification.
- Playwright (Phase 2 screenshot baseline).
- Recharts library (no migration).

## Cross-Phase Risks (summary — full per phase)
- Recharts theming token wall (Phase 4) → prototype line-chart first.
- Light parity 2x effort (Phase 3/4/5/6) → accept; allow chart light snapshot skip.
- Long-lived branch conflicts → rebase per phase, freeze rule.

## Success Metrics
- 0 hex/rgb/`bg-white`/`shadow-lg|xl`/`rounded-xl|2xl` ad-hoc in `src/components/v5/**` + `src/pages/v5/**`.
- 100% 28 playground sections covered in `docs/ref-ui-playground/DESIGN.md`.
- 13 missing primitives shipped with Stitch ref + light parity.
- 25 existing primitives aligned per audit matrix.
- 10 pages pass 4 DoD gates.
- Future Work Gate checklist enforced in PR template.
- `docs/ui-design-contract.md` bumped to v3.0.
