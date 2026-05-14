---
type: brainstorm-report
status: confirmed
created: 2026-05-14
plan_dir: plans/260514-0946-ui-canon-v3-compliance/
ref_canon: docs/ref-ui-playground/Playground .html
contract_target: docs/ui-design-contract.md → v3.0
---

# Brainstorm — UI Canon v3 Compliance Overhaul

## Problem
- Playground v4 = visual canon đã chốt (28 sections, 22 primitives) NHƯNG chưa cover chart/heatmap/pie/donut/funnel/checkbox/switch/textarea/tooltip/v.v.
- `src/components/v5/ui/**` có 25 primitives nhưng drift vs canon (radius, shadow, primary CTA DNA, light parity).
- `docs/ui-design-contract.md` v2.0 có 45 sections rule nhưng thiếu: chart taxonomy + palette, primary CTA DNA spec, Stitch ref, light token map, missing-primitive specs.

## Goals
1. Mở rộng canon = Playground v4 HTML + Stitch-generated screens cho missing components → bộ ref hoàn chỉnh.
2. Refactor in-place namespace v5 (KHÔNG tạo v6); tokens → primitives → shell → pages.
3. Light + dark parity day-1 cho mọi component touched.
4. Recharts giữ lại, wrap canonical bằng OKLCH tokens.
5. Mỗi page PR pass 4 gates: visual / token grep / a11y+perf / contract cite.

## Decisions (đã confirm)
| # | Decision | Chốt |
|---|---|---|
| D1 | Canon source | Playground.html v4 ONLY (bỏ ref 1-3.png) |
| D2 | Stitch strategy | Generate full DESIGN.md → seed Stitch project → derive missing screens parallel với v4 DNA |
| D3 | Migration namespace | Keep v5, refactor in place |
| D4 | Light mode | Build parallel light từ day 1 cho mọi component touched |
| D5 | Page order | Foundation-first (tokens → primitives → shell → pages waterfall) |
| D6 | Chart library | Stay Recharts, theme + wrap canonical components trong v5/ui/charts/ |
| D7 | Audit method | Manual review per-component + checklist |
| D8 | DoD checks | Visual + Token grep + A11y/Perf + Contract cite (all 4) |
| D9 | Contract update timing | Incremental (append cuối mỗi phase) |
| D10 | CI grep gate | Warn-only tuần 1, hard gate từ Phase 4 |
| D11 | Playground re-host | Restore `/v4/playground` + add `/v5/playground` sau Phase 3 |

## Approaches Evaluated
| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| **A. Foundation-first (chosen)** | Tokens flow down, primitives align trước, pages chỉ consume | Foundation phase dài trước khi visible page change | ✅ Chốt |
| B. Vertical slice page-by-page | Visible progress mỗi PR | Primitive drift mid-way, vi phạm DRY | ❌ |
| C. All-or-nothing big bang | Single ship | Long-running branch, conflict feature | ❌ |

## Final Architecture — 8 Phases

| # | Phase | Output | Effort |
|---|---|---|---|
| 0 | Canon Audit + Extension | `audit-report.md`, `DESIGN.md`, `stitch-screens/` (10 batches) | 1-2d |
| 1 | Contract v3.0 | `ui-design-contract.md` v3.0 với chart taxonomy + DNA primary + Stitch ref + light map + missing primitives | 1d |
| 2 | Token Foundation | `src/index.css` + `src/design/v5/tokens.ts` dark + light + CI grep gate + screenshot baseline | 1-2d |
| 3 | Primitive Realignment | 25 existing v5/ui/* refactor + 13 missing primitives | 4-5d |
| 3b | Chart Wrappers | `v5/ui/charts/` (Line/Bar/Area/Pie/Donut/Sparkline/Heatmap/Funnel + ChartCard) | 2d |
| 4 | Layout Shell | V5Shell + Header + Sidebar + MobileNavDrawer + NotificationCenter | 1d |
| 5 | Per-Page Refactor (waterfall) | Dashboard → Reports → AdsTracker → LeadTracker → MediaTracker → DailySync → OKR → WeeklyCheckin → Settings → Profile | 5-7d |
| 6 | Legacy Cleanup + Lock | Xóa `components/ui/*` duplicates, migrate legacy tables, ESLint rule, archive playground sealed | 1d |

**Tổng:** ~15-18 working days.

## Missing Primitives (Phase 3)
Tooltip, Checkbox, Switch, Radio, Textarea, ProgressBar, FileUpload, MultiSelect, Combobox, Banner/Alert, SearchInput, Avatar, Pagination.

## Chart Wrappers (Phase 3b)
ChartCard surface + LineChart + BarChart + AreaChart + PieChart + DonutChart + SparklineChart + HeatmapChart + FunnelChart. Mỗi cái wrap Recharts với OKLCH palette + canonical tooltip/legend/empty/loading state trinity per §29-§31b.

## Stitch DESIGN.md Spec
- **Color (OKLCH):** brand-50→900, neutral-50→950, semantic, dept colors
- **Typography:** Hanken Grotesk 400-800; scale h1→display + body + caption
- **Radius:** card 1.5rem/0.75rem, input 1rem/0.75rem, button pill 9999px
- **Shadow:** compact + elevated + glow (hover-only)
- **Motion:** fast/medium/slow + standard/emphasized
- **Primary CTA DNA:** dark gradient base + orange beam + orange icon (NO solid orange)
- **Light parity:** mapping table mỗi token dark→light

## Stitch Screens (10 batches Phase 0)
1. Dashboard chart panel (line+bar+sparkline)
2. Reports pie/donut/area surface
3. Heatmap matrix (dept × week)
4. Funnel viz (lead conversion)
5. Settings checkbox/switch/radio/toggle
6. Form modal (textarea/file/multi/combo)
7. Tooltip variants
8. Toast/Banner/Alert/Callout stack
9. Pagination + virtualized table
10. Chart empty/loading/error trinity

## DoD Gates (per page PR)
- **Visual:** screenshot dark + light khớp playground/Stitch ref (ai-multimodal verify)
- **Token grep:** zero hex/rgb/`bg-white`/`shadow-lg|xl`/`rounded-xl|2xl` ad-hoc
- **A11y + Perf:** §43/§44/§45 checklist (skip-link, aria-label, focus, Suspense, skeleton, virtualize)
- **Contract cite:** PR description list §-sections + Future Work Gate checked

## Risks
| Risk | Severity | Mitigation |
|---|---|---|
| Recharts theming token wiring không tới axis grid custom | Med | Phase 3b prototype 1 chart pre-validate |
| Light parity 2x effort/component | High | Accept; allow skip light-snapshot test cho chart phức tạp (revisit Phase 6) |
| Stitch generation drift giữa batches | Med | Generate sequential, pin GEMINI_3_1_PRO, review per batch |
| Page surface primitive mới chưa có trong Phase 3 | Med | Allow "primitive hot-add" rule: code trước, contract sau cùng PR |
| Conflict feature dev song song | Med | Branch `ui-canon-v3` long-lived, rebase main mỗi phase, freeze v5/ui/* edit từ feature PR |
| Playground HTML 10k lines khó grep | Low | Re-render localhost:3000/v4/playground screenshot làm visual ref thực |

## Success Metrics
- ✅ 0 hex/rgb/`bg-white`/`shadow-lg|xl`/`rounded-xl|2xl` ad-hoc trong `src/components/v5/**` + `src/pages/v5/**`
- ✅ 100% 28 playground sections cover trong DESIGN.md
- ✅ 13 missing primitives shipped với Stitch ref + light parity
- ✅ 25 existing primitives audit completed + aligned per matrix
- ✅ 10 pages PR pass 4 gates
- ✅ Future Work Gate checklist enforce trong PR template

## Dependencies / Files
**Update:**
- `src/index.css` (tokens)
- `src/design/v5/tokens.ts` (runtime mirror)
- `src/components/v5/ui/**` (primitives — refactor + add)
- `src/components/v5/layout/**` (shell refactor)
- `src/pages/v5/**` (10 pages refactor)
- `docs/ui-design-contract.md` → v3.0 incremental

**Create:**
- `docs/ref-ui-playground/DESIGN.md` (Stitch source)
- `docs/ref-ui-playground/audit-report.md` (25 components matrix)
- `docs/ref-ui-playground/stitch-screens/*.png` (10 batches)
- `src/components/v5/ui/charts/**` (new chart wrappers)
- `src/components/v5/ui/{tooltip,checkbox,switch,radio,textarea,progress-bar,file-upload,multi-select,combobox,banner,search-input,avatar,pagination}.tsx`
- ESLint custom rule for canon enforcement
- PR template update với compliance checklist

## Next Step
Invoke `/plan` để vạch phase files chi tiết trong `plans/260514-0946-ui-canon-v3-compliance/`.

## Open Questions (post-plan revisit)
- Storybook tool choice (re-introduce sau khi Phase 3 ổn?) — đã defer
- Visual regression CI (Chromatic/Playwright/Percy) — defer Phase 6 evaluate
- Recharts → Visx migration nếu Phase 3b theming gặp wall — fallback option, không scope hiện tại
