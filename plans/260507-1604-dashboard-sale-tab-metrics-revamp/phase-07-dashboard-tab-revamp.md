# Phase 07 — Revamp `dashboard-tab.tsx` consume new endpoint

## Context Links
- Brainstorm § Decisions #5, #6
- Current: `src/components/lead-tracker/dashboard-tab.tsx` (245 lines, self-fetches & computes)

## Overview
- **Priority:** P1
- **Status:** completed
- **Effort:** ~45m
- Bỏ logic client-side compute, dùng `useLeadFlow` để render summary cards + 2 chart đồng nhất.

## Key Insights
- Component hiện tại fetch toàn bộ leads via `api.getLeads({ dateFrom, dateTo })` rồi self-compute. Sau revamp: chỉ gọi `useLeadFlow({ from, to })`.
- 4 KPI cards (Inflow, Cleared, Active Backlog, Clearance Rate) bind trực tiếp với `summary`.
- Weekly Performance bar chart và Backlog Trend line chart bind với `daily` series.
- Clearance Rate khi `null` → hiển thị "—" thay vì "0%".

## Requirements
- File giữ < 200 lines (KISS — split nếu cần).
- UI/visual không đổi — chỉ logic data.
- Loading + error states tử tế.

## Architecture
```
DashboardTab({ dateFrom, dateTo })
  ├─ useLeadFlow({ from: dateFrom, to: dateTo })
  ├─ if loading → spinner
  ├─ if error → error panel
  └─ render
      ├─ KPI cards bind summary
      └─ Charts bind daily series
```

## Related Code Files
**Modify:**
- `src/components/lead-tracker/dashboard-tab.tsx` — refactor toàn bộ data layer.

**Optional split:**
- `src/components/lead-tracker/dashboard-kpi-cards.tsx` (4 cards)
- `src/components/lead-tracker/dashboard-flow-charts.tsx` (2 charts)

**Read for context:**
- Phase 06 hook outputs
- Existing component for UI styles

## Implementation Steps
1. Replace `useState<Lead[]>` + `useEffect(fetchLeads)` bằng `useLeadFlow({ from: dateFrom, to: dateTo })`.
2. Map `data.summary` → KPI cards. ClearanceRate hiển thị `data.summary.clearanceRate ?? '—'` với `%` suffix.
3. Map `data.daily` → bar chart data: `{ day: dayLabel, inflow, cleared, activeBacklog }`.
4. Map `data.daily` → trend chart data: `{ date, remaining: activeBacklog }`.
5. Bỏ `getWeekKey` helper, bỏ `CLEARED_STATUSES` const (đã chuyển BE).
6. Loading state: spinner; Error state: panel với message.
7. Nếu file > 200 lines → split component (xem optional).
8. Type-check, smoke test trên `npm run dev`.

## Todo List
- [x] Refactor data fetching → useLeadFlow
- [x] Wire summary → KPI cards
- [x] Wire daily → bar chart
- [x] Wire daily → trend chart
- [x] Handle clearanceRate null
- [x] Loading / error states
- [x] Verify file < 200 lines
- [x] Manual: chọn 7d range, verify số khớp với endpoint trả về

## Success Criteria
- 4 KPI cards và 2 chart đồng nhất với response endpoint.
- Đổi datepicker → tất cả refetch và update.
- File ≤ 200 lines.
- No console errors.

## Risk Assessment
| Risk | Mitigation |
|---|---|
| dayLabel format đổi (BE trả YYYY-MM-DD vs FE muốn DD/MM) | Helper `dayLabel(iso)` ở FE convert |
| Recharts re-render quá nhiều | useMemo cho mapped data nếu cần |

## Security Considerations
- Hook đã dùng auth fetch wrapper.

## Next Steps
- Phase 08 thêm Lead Distribution section vào Sale tab parent (`DashboardOverview.tsx` hoặc panel khác).
