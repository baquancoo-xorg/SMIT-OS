---
type: brainstorm
date: 2026-05-16
slug: dashboard-ui-uniformity
status: design-approved
contract_refs: [docs/ui-design-contract.md §2 §3 §6 §7]
---

# Dashboard UI Uniformity — Design

## Problem
5 nhóm UI lệch khỏi v5 contract / không đồng nhất:
1. Acquisition KPI strip dùng `KpiBand` custom với stage tint + revenue solid orange — vi phạm §2 (no solid orange CTA-like fill, prefer accent token).
2. Overview summary cards (4 KpiCard) tách rời khỏi Daily Breakdown Card → 2 visual blocks tách rời.
3. Call Performance có duplicate title: `SectionCard.title="Conversion Operations"` + inner `DashboardSectionTitle="Call Performance"`.
4. Product tab có 5 sub-section title (`§1 Executive Overview` … `§5 Operational`) chứa toàn bộ trong 1 file `product-section.tsx` 119 LOC.
5. Visual không đồng nhất giữa các tab.

## Requirements
- Đồng nhất KpiCard canonical cho mọi KPI strip (Overview + Acquisition).
- Card radius/typography/color theo §2/§3/§6.
- Không hex hardcode, không solid orange fill cho card highlight.
- Light+dark parity (§1 theme parity).
- Bỏ duplicate text/title.
- Modularize Product tab thành 5 sub-section files.

## Approaches Evaluated

### A — Acquisition KPI strip
| Approach | Pros | Cons | Decision |
|---|---|---|---|
| 8x KpiCard canonical, no tint, no orange | Match Overview, §2 compliant, KISS | Mất visual hint cho 3-stage | ✅ Chosen |
| KpiCard + stage dot | Giữ stage info | Thêm complexity | ✗ |

### B — Product split
| Approach | Pros | Cons | Decision |
|---|---|---|---|
| 5 sub-section files | Mỗi file <80 LOC, dễ maintain, DRY | Thêm 5 files | ✅ Chosen |
| Inline div blocks | KISS-er | Không meet user yêu cầu split | ✗ |

### C — Overview merge layout
| Approach | Pros | Cons | Decision |
|---|---|---|---|
| Card: header → 4 KpiCard → toggles → table | Single visual unit, 1 Card border | Cần refactor KpiTable header | ✅ Chosen |
| Nested cards | Less refactor | Nested Card vi phạm §6 universal radius | ✗ |

## Final Design

### 1. Acquisition KPI strip (`acquisition-overview-tab.tsx`)
- **Replace** `KpiBand` custom component (xoá function + helper) → dùng `KpiCard` từ `components/ui`.
- Grid: `grid-cols-2 md:grid-cols-4 xl:grid-cols-4` (8 cards = 2 rows on xl).
- Map: Reach (Globe), Clicks (MousePointer), Visits (Eye), Leads (UserPlus), Trials (FlaskConical), Active (Activity), Paid (CreditCard), Revenue (DollarSign).
- Không stage tint, không highlight orange. Revenue treat như metric thường.
- Giữ `SectionCard eyebrow="Acquisition" title="Journey Funnel"`.
- §2 compliance: tất cả màu qua token, no `bg-info-container/30` custom band.

### 2. Overview merge (`DashboardOverview.tsx` + `kpi-table.tsx`)
- Bỏ render riêng `<SummaryCards />` ngoài Card.
- Move `SummaryCards` content vào trong `KpiTable` Card, layout:
  ```
  Card (single, rounded-card border-border bg-surface)
  ├─ Header row: Daily Breakdown / KPI Metrics (left) + toggles (right)
  ├─ Divider (border-b border-border)
  ├─ 4 KpiCard grid (padding inside Card)
  ├─ Divider
  └─ Scroll sync table (3 layers)
  ```
- Pass `summary` prop vào `KpiTable` mới hoặc tạo wrapper `OverviewBreakdownCard`.
- **Chosen:** thêm prop `summary?: SummaryMetrics` vào `KpiTable`, render KpiCard row khi có data. SummaryCards.tsx có thể giữ làm helper export hoặc inline.
- §6: 1 Card duy nhất, radius `rounded-card`.

### 3. Call Performance (`call-performance-section.tsx`)
- Xoá `<DashboardSectionTitle>Call Performance</DashboardSectionTitle>` (line 20-22).
- Giữ `SectionCard eyebrow="Call performance" title="Conversion Operations"` — đã là title canonical.

### 4. Product 5-split (`product-section.tsx` + 5 new files)
Cấu trúc mới:
```
src/components/features/dashboard/product/
├─ product-section.tsx              (compose 5 sub-sections)
├─ product-executive-overview.tsx   (§1: KpiCards + PrePqlTrend + ActivationHeatmap)
├─ product-conversion-funnel.tsx    (§2: FunnelWithTime + TtvHistogram)
├─ product-cohort-retention-section.tsx (§3: CohortRetention + CohortActivationCurve)
├─ product-channel-attribution.tsx  (§4: ChannelBreakdown + PrePqlBySource + ChannelPostHogSecondary)
└─ product-operational.tsx          (§5: OnlineTime + Touchpoint + TopFeatures + Stuck)
```
- Bỏ tất cả 5 `DashboardSectionTitle §1..§5`.
- Giữ Refresh button — move vào sub-section §1 hoặc lên `SectionCard` header action.
- **Chosen:** Refresh button lên header của `SectionCard` (action slot nếu hỗ trợ) hoặc giữ trong §1 component không có title (compact toolbar).
- index.ts re-export 5 components.

### 5. Compliance Checklist
| § | Rule | Check |
|---|---|---|
| §1 | Light + dark parity | Tokens semantic → parity tự động |
| §2 | No solid orange CTA / no hex | KpiCard accent token, no `bg-primary` solid block ngoài highlight prop nội bộ |
| §3 | Typography token | KpiCard label/value đã tokenize |
| §6 | Card radius universal | 1 Card per section, `rounded-card` |
| §7 | Shadow/glow | KpiCard default, no custom shadow |

## Implementation Plan (5 phases, 1 commit per phase)
1. **Phase 1** — Acquisition KPI strip: replace KpiBand → KpiCard. ~30 min.
2. **Phase 2** — Call Performance: bỏ duplicate title. ~5 min.
3. **Phase 3** — Product split: tạo 5 sub-section files, refactor product-section.tsx, xoá §1-§5 titles. ~45 min.
4. **Phase 4** — Overview merge: refactor KpiTable accept summary, update DashboardOverview. ~30 min.
5. **Phase 5** — Type-check + commit + push. ~10 min.

## Risks
- KpiTable đã có viewMode/onViewModeChange props từ commit trước. Thêm summary prop optional → backward compat OK.
- SummaryCards.tsx có thể trở thành dead code nếu chỉ Overview dùng → xoá luôn nếu không có caller khác.
- Product sub-section files cần đảm bảo prop `range` được forward đúng.

## Success Metrics
- `npx tsc --noEmit` pass.
- 5 product files mới <80 LOC mỗi file.
- Visual: 8 acquisition KPI giống hệt Overview 4 KPI (cùng KpiCard primitive).
- 1 Card duy nhất bao 4 KPI + table.
- Không còn 5 title `§1..§5` trong Product.
- Không còn `Call Performance` duplicate.

## Unresolved Questions
- SectionCard có hỗ trợ `action` slot trên header để chứa Refresh button không? Nếu không → giữ Refresh inline trong §1 (compact top-right).
- SummaryCards.tsx có caller nào khác ngoài DashboardOverview không? (cần grep verify trước khi xoá)
