# Phase 03 — Skill Movement section

**Priority:** High — answers "team đang tiến/lùi gì"
**Status:** pending
**Depends on:** Phase 01

## Why
User explicit request: "timeline phát triển theo quý, so sánh Q1 vs Q2 vs current, highlight skill nào tăng/giảm nhiều nhất".

## Requirements

### Functional
- F1. Radar chart overlay 3 quarters (Q-2 / Q-1 / current) — team avg per skill, grouped by `SkillGroup` (Job/Personal/General)
- F2. Tab selector group: `[Job | Personal | General]` switch skill set rendered
- F3. **Top movers list** dưới radar — top 3 ↑ + top 3 ↓ across all groups, format: `[skill label] [Δ value] [from→to]`
- F4. Empty state: < 2 quý data → "Cần ≥2 quý để xem chuyển động"
- F5. Tooltip on radar point: skill label + 3 quarter scores

### v4 contract
- Radar lines: Q-2 `--brand-300` opacity 40%, Q-1 `--brand-400` opacity 70%, current `--brand-500` opacity 100%
- Top movers ↑ emerald, ↓ rose
- Card `rounded-3xl` dark gradient

## Files

| Action | Path | LOC |
|---|---|---|
| CREATE | `src/components/features/dashboard/personnel/skill-movement.tsx` | ~180 |
| CREATE | `src/components/features/dashboard/personnel/skill-radar-chart.tsx` | ~120 |
| CREATE | `src/components/features/dashboard/personnel/top-movers-list.tsx` | ~60 |

(3 files to keep each <200 LOC per development-rules.md)

## Implementation
1. `skill-radar-chart.tsx` — recharts `<RadarChart>` with 3 `<Radar>` overlays. Reuse existing radar pattern from `personnel-mini-radar.tsx`.
2. `top-movers-list.tsx`:
   - Sort `skillRadar` by `current - prev` absolute Δ
   - Filter Δ ≥ 1 (1-5 scale meaningful threshold per plan.md decision)
   - Render up/down split lists
3. `skill-movement.tsx` orchestrator with group tab state
4. memo `<SkillRadarChart>` with React.memo (perf canon)

## Todo
- [ ] `skill-radar-chart.tsx` overlay 3 series
- [ ] `top-movers-list.tsx` ranked Δ
- [ ] `skill-movement.tsx` compose + group tabs
- [ ] React.memo radar chart
- [ ] Empty state < 2 quý

## Success criteria
- Radar renders 3 overlay series correctly aligned trên axes
- Top movers ranked đúng theo |Δ| descending, filter Δ < 1 out
- Group tab switch không re-fetch (data đã có)

## Risks
- **R1:** Recharts performance với 30+ skills. Mitigation: only render group selected, not all (already done via tab).
- **R2:** Skill list khác nhau giữa quý (new skill added). Mitigation: union all skills, missing quarter = null point (recharts handles).
