# Phase 08 — Lead Distribution components (Source donut + AE Workload bar)

## Context Links
- Brainstorm § Decisions #8
- Phase 05 endpoint, Phase 06 hook
- Mẫu component: `src/components/dashboard/call-performance/*`

## Overview
- **Priority:** P2
- **Status:** completed
- **Effort:** ~1h
- 2 chart mới + section wrapper, wire vào tab Sale dưới `DashboardTab`.

## Key Insights
- Recharts đã có sẵn (PieChart cho donut, BarChart layout="vertical" cho horizontal stacked bar).
- Style/UI follow pattern `DashboardPanel` + section title của các component dashboard hiện có.
- Donut top 8 + "Others", color palette chuẩn brand (navy + cyan + supporting).
- AE bar stacked 2 màu: amber (Active) + emerald (Cleared).

## Requirements
- Cả 2 chart tuân datepicker chung (props `from`, `to`).
- Empty state khi không có data.
- File mỗi component < 200 lines.
- Section wrapper component để wire 1 chỗ vào parent.

## Architecture
```
src/components/dashboard/lead-distribution/
  ├─ lead-distribution-section.tsx       (wrapper, gọi useLeadDistribution)
  ├─ lead-distribution-by-source.tsx     (donut chart)
  ├─ lead-distribution-by-ae.tsx         (horizontal stacked bar)
  └─ index.ts                             (re-export)
```

```
LeadDistributionSection({ from, to })
  ├─ const { data, isLoading, error } = useLeadDistribution({ from, to })
  ├─ Section title "Lead Distribution"
  └─ <div grid grid-cols-2 gap-4>
      ├─ <LeadDistributionBySource data={data?.bySource} />
      └─ <LeadDistributionByAe data={data?.byAe} />
```

## Related Code Files
**Create:**
- `src/components/dashboard/lead-distribution/lead-distribution-section.tsx`
- `src/components/dashboard/lead-distribution/lead-distribution-by-source.tsx`
- `src/components/dashboard/lead-distribution/lead-distribution-by-ae.tsx`
- `src/components/dashboard/lead-distribution/index.ts`

**Modify:**
- `src/pages/DashboardOverview.tsx` (hoặc Sale tab container) — render `<LeadDistributionSection from={...} to={...} />`.

**Read for context:**
- `src/components/dashboard/call-performance/call-performance-section.tsx` (pattern)
- `src/components/dashboard/ui/dashboard-panel.tsx`, `dashboard-section-title.tsx`
- Existing `DashboardOverview.tsx` Sale tab structure

## Implementation Steps
1. **lead-distribution-by-source.tsx**:
   - Props: `{ data: LeadDistributionBySourceItem[] }`.
   - PieChart with Pie inner/outer radius cho donut effect.
   - Color array (8 màu + grey cho "Others").
   - Center label: total count.
   - Legend bottom.
   - Tooltip show source + count + percent.
2. **lead-distribution-by-ae.tsx**:
   - Props: `{ data: LeadDistributionByAeItem[] }`.
   - BarChart `layout="vertical"`, YAxis `dataKey="ae"`.
   - 2 Bars stacked: `dataKey="active"` + `dataKey="cleared"`, `stackId="a"`.
   - Sort data desc by `total` (BE đã sort, FE không cần).
   - Color: amber active, emerald cleared.
3. **lead-distribution-section.tsx**:
   - Wrap 2 chart trong `DashboardPanel` riêng + grid 2 cột.
   - Loading: spinner trong panel.
   - Error: text rose-600.
   - Empty (data rỗng): "Không có lead nào trong khoảng đã chọn".
4. **index.ts**: export `LeadDistributionSection`.
5. Wire vào `DashboardOverview.tsx` Sale tab block — đặt sau `DashboardTab` (Lead Flow & Clearance):
   ```
   {activeTab === 'sale' && (
     <>
       <CallPerformanceSection from={from} to={to} />
       <DashboardTab dateFrom={from} dateTo={to} />
       <LeadDistributionSection from={from} to={to} />  ← NEW
     </>
   )}
   ```
6. Type-check + visual check qua browser.

## Todo List
- [x] LeadDistributionBySource component (donut)
- [x] LeadDistributionByAe component (horizontal stacked bar)
- [x] LeadDistributionSection wrapper với loading/error/empty
- [x] index.ts re-export
- [x] Wire vào DashboardOverview Sale tab
- [x] Type-check
- [x] Visual check both charts render correctly

## Success Criteria
- 2 chart render đúng với data thực, color đúng palette.
- Donut tổng count khớp `summary.inflow` từ Lead Flow endpoint cho cùng range.
- AE bar sort desc, không có "Unmapped" entry.
- Empty state hiển thị đúng khi range ngày không có lead.

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Donut với nhiều source (>14) trông rối | Top 8 + "Others" đã giải quyết ở BE |
| AE quá nhiều → bar list dài | Limit top 12 AE BE-side hoặc FE scroll-y |
| Color collision với chart khác | Reuse brand palette từ existing dashboard components |

## Security Considerations
- Không có form input → no XSS risk.

## Next Steps
- Phase 09 verify nhất quán metrics + UX polish.
