# Phase 4 — Chart Wrappers

## Context Links
- Parent: [plan.md](plan.md)
- Prev: [phase-03-primitive-realignment.md](phase-03-primitive-realignment.md)
- Contract: `docs/ui-design-contract.md` §29-§31b, §47 (Chart Taxonomy)
- Stitch ref: `docs/ref-ui-playground/stitch-screens/01-dashboard-charts.png`, `02-reports-surface.png`, `03-heatmap-matrix.png`, `04-funnel-viz.png`, `10-chart-states.png`
- D6: stay Recharts, wrap canonical

## Overview
- **Date:** 2026-05-14
- **Priority:** P1
- **Status:** pending
- **Description:** Author `src/components/v5/ui/charts/` with 9 canonical chart wrappers around Recharts, OKLCH palette from Phase 2 tokens, state trinity (empty/loading/error), colorblind safety.

## Key Insights
- D10 hard gate ACTIVATES this phase — `lint:ui-canon` must exit non-zero in CI.
- Recharts theming wall is the top risk → prototype 1 chart (line-chart) FIRST.
- Charts must consume OKLCH tokens from Phase 2 via JS bridge (Recharts doesn't read CSS vars natively).
- A11y: figure/figcaption SR summary + data-table alternative + keyboard-reachable tooltip + aria-sort where applicable.

## Requirements

### Functional
- `chart-card.tsx` — surface + title + legend slot + state trinity wrapper.
- 8 chart wrappers:
  - `line-chart.tsx`
  - `bar-chart.tsx`
  - `area-chart.tsx`
  - `pie-chart.tsx`
  - `donut-chart.tsx`
  - `sparkline-chart.tsx`
  - `heatmap-chart.tsx`
  - `funnel-chart.tsx`
- Empty / loading / error state every chart (§31b).
- Colorblind safety: pattern/dash supplement color.
- Accessibility: figure+figcaption + data-table fallback + tooltip keyboard-reach + aria-sort.

### Non-Functional
- Each chart file ≤200 lines.
- Charts consume tokens via `src/design/v5/tokens.ts` runtime mirror (Phase 2).
- Recharts version pinned in `package.json`.
- Light mode: chart color palette mirrors dark per §50 light token map.
- `lint:ui-canon` hard gate (UI_CANON_STRICT=1) enforced from this phase onward.

## Architecture
```
src/components/v5/ui/charts/
├── chart-card.tsx           (surface wrapper)
├── chart-empty-state.tsx    (shared empty)
├── chart-loading-state.tsx  (shared loading skeleton)
├── chart-error-state.tsx    (shared error)
├── chart-palette.ts         (OKLCH palette from tokens.ts + colorblind patterns)
├── line-chart.tsx
├── bar-chart.tsx
├── area-chart.tsx
├── pie-chart.tsx
├── donut-chart.tsx
├── sparkline-chart.tsx
├── heatmap-chart.tsx
├── funnel-chart.tsx
└── index.ts
```

Chart wrapper pattern:
```
<ChartCard title="..." legend={...} state="ready|empty|loading|error">
  <Recharts.X> ... </Recharts.X>
  <figcaption className="sr-only">SR summary</figcaption>
  <details><summary>Data table</summary><table>...</table></details>
</ChartCard>
```

Token flow:
```
src/design/v5/tokens.ts → chart-palette.ts → Recharts color props (stroke, fill, etc.)
```

## Related Code Files
**Create:**
- `src/components/v5/ui/charts/chart-card.tsx`
- `src/components/v5/ui/charts/chart-empty-state.tsx`
- `src/components/v5/ui/charts/chart-loading-state.tsx`
- `src/components/v5/ui/charts/chart-error-state.tsx`
- `src/components/v5/ui/charts/chart-palette.ts`
- `src/components/v5/ui/charts/line-chart.tsx`
- `src/components/v5/ui/charts/bar-chart.tsx`
- `src/components/v5/ui/charts/area-chart.tsx`
- `src/components/v5/ui/charts/pie-chart.tsx`
- `src/components/v5/ui/charts/donut-chart.tsx`
- `src/components/v5/ui/charts/sparkline-chart.tsx`
- `src/components/v5/ui/charts/heatmap-chart.tsx`
- `src/components/v5/ui/charts/funnel-chart.tsx`
- `src/components/v5/ui/charts/index.ts`

**Modify:**
- `src/components/v5/ui/index.ts` (re-export charts subpath)
- `.github/workflows/ui-canon-check.yml` — flip `UI_CANON_STRICT=1`

## Implementation Steps
1. **Prototype line-chart (risk pre-validate)** — write `line-chart.tsx` with full Recharts theming wiring (stroke from chart-palette, tooltip token, grid color, axis label color).
2. Smoke render in `/v4/playground` chart section — verify token wiring works axis/grid/tooltip.
3. If theming wall hit → DOCUMENT IN REPORT + propose Visx fallback evaluation (out of scope but flagged).
4. Author `chart-palette.ts`:
   - 8-color sequential brand palette (OKLCH).
   - Semantic palette (success/warn/error/info).
   - Pattern/dash supplement for colorblind safety.
5. Author state trinity components:
   - `chart-empty-state.tsx` — illustration + CTA per §31b.
   - `chart-loading-state.tsx` — skeleton bars.
   - `chart-error-state.tsx` — error icon + retry CTA.
6. Author `chart-card.tsx` — surface wrapper consuming Phase 3 Card primitive + state slot.
7. Author 7 remaining chart wrappers (bar, area, pie, donut, sparkline, heatmap, funnel).
8. Each wrapper: figure/figcaption + data-table `<details>` alternative + keyboard tooltip + aria-sort if axial.
9. Extend `src/components/v5/ui/charts/index.ts` + parent `index.ts`.
10. Flip CI to hard-gate: edit workflow `UI_CANON_STRICT=1`.
11. Run `npm run build` + `lint:ui-canon` — must pass.

## Todo List
- [ ] Prototype `line-chart.tsx` — Recharts theming wiring smoke test
- [ ] Decision gate: theming OK → continue, theming wall → document fallback
- [ ] Author `chart-palette.ts` (OKLCH + patterns)
- [ ] Author `chart-empty-state.tsx`
- [ ] Author `chart-loading-state.tsx`
- [ ] Author `chart-error-state.tsx`
- [ ] Author `chart-card.tsx`
- [ ] Author `bar-chart.tsx`
- [ ] Author `area-chart.tsx`
- [ ] Author `pie-chart.tsx`
- [ ] Author `donut-chart.tsx`
- [ ] Author `sparkline-chart.tsx`
- [ ] Author `heatmap-chart.tsx`
- [ ] Author `funnel-chart.tsx`
- [ ] Extend `charts/index.ts` + `ui/index.ts`
- [ ] Flip CI hard-gate `UI_CANON_STRICT=1`
- [ ] `npm run build` clean
- [ ] `lint:ui-canon` zero violations on `v5/ui/charts/**`
- [ ] Manual dark+light smoke per chart in `/v5/playground`

## Success Criteria
- 9 chart components + 3 state components + palette + card shipped.
- All charts consume OKLCH tokens via `chart-palette.ts`.
- Every chart has empty/loading/error path.
- A11y: figure+figcaption + data-table alt + keyboard tooltip verified.
- CI hard-gate active — `UI_CANON_STRICT=1`.
- `npm run build` clean + `lint:ui-canon` 0 violations in `v5/ui/charts/**`.

## Risk Assessment
| Risk | Severity | Mitigation |
|---|---|---|
| Recharts doesn't accept token props on axis/grid/tooltip | High | Prototype first (line-chart); document fallback Visx evaluation if fail — DO NOT abandon Recharts in scope |
| Light parity for heatmap dept color matrix complex | Med | Allow skip light snapshot for heatmap (revisit Phase 7); document deferred work |
| Funnel chart not native to Recharts | Med | Use Recharts BarChart with horizontal layout + custom shape, or composable primitives |
| Chart wrapper file > 200 lines | Med | Split chart-specific helpers into sub-files (e.g. `line-chart-tooltip.tsx`) |
| Hard gate breaks unrelated PR | Med | Coordinate freeze window with team before flipping flag |

## Security Considerations
- No PII in chart data layer (consumers handle data sourcing).
- A11y per WCAG 2.1 AA for every chart.

## Next Steps
- Blocks Phase 6 (pages consume chart wrappers — Dashboard, Reports especially).
- May feedback into Phase 1 contract (§47 refinement post-impl).
