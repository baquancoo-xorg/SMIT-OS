# Brainstorm: PM Dashboard Summary Cards Redesign

**Date:** 2026-04-22 | **File:** `src/pages/PMDashboard.tsx`

## Problem
6 summary cards hiện tại kém actionable: Company OKRs redundant với chart bên dưới, Flow Efficiency tính all-time thay vì sprint-specific, Blockers dùng proxy sai, Reports bỏ phí `score`/`confidenceScore` fields.

## Final Design: 6 Thẻ Mới

| # | Thẻ mới | Thay thế | Công thức | Data source |
|---|---|---|---|---|
| 1 | **Sprint Burndown** | Company OKRs | Done/Total sprint items + On Track/Behind/Ahead | `WorkItem.sprintId`, `Sprint` |
| 2 | **Overdue Tasks** | Sprint Countdown | items có `dueDate < now && status !== 'Done'` | `WorkItem.dueDate` |
| 3 | **Review Queue** | Flow Efficiency | count `status === 'Review'` | `WorkItem.status` |
| 4 | **WIP per Person** | Blockers | In Progress / active members, màu green/yellow/red | `WorkItem`, `User` |
| 5 | **Daily Report Today** | This Week Activity | DailyReport hôm nay / total members | `DailyReport.reportDate` |
| 6 | **Team Confidence** | Reports | avg `confidenceScore` + approved/total weekly reports | `WeeklyReport.confidenceScore`, `status` |

### Detail Logic

**Card 1 — Sprint Burndown**
- Filter `workItems` by `sprintId === currentSprint.id`
- `doneCount` = sprint items có `status === 'Done'`
- `expectedDone` = `Math.round((sprintElapsed / sprintDuration) * totalSprintItems)`
- Status: `doneCount >= expectedDone` → On Track, else Behind
- Display: `Sprint 3 · 12/30` + badge `On Track` / `Behind` / `Ahead`

**Card 2 — Overdue Tasks**
- `workItems.filter(i => i.dueDate && new Date(i.dueDate) < now && i.status !== 'Done')`
- Display: count đỏ nếu > 0, "Clear" xanh nếu = 0
- Sub-label: "Past due date"

**Card 3 — Review Queue**
- `workItems.filter(i => i.status === 'Review').length`
- Display: count + "items waiting"
- Color: warning nếu > 3

**Card 4 — WIP per Person**
- `inProgressCount / activeMembers` (members có ít nhất 1 In Progress item)
- Thresholds: ≤ 2 = green, 3–4 = yellow/warning, ≥ 5 = red
- Display: `2.3 tasks/person`

**Card 5 — Daily Report Today**
- `dailyReports.filter(r => sameDay(r.reportDate, today)).length`
- Cần fetch `/api/daily-reports` (endpoint đã có cho DailySync)
- Display: `14 / 20 today`

**Card 6 — Team Confidence**
- `currentWeekReports` (same logic as existing Reports card)
- `avgConfidence = Math.round(reports.reduce((s, r) => s + r.confidenceScore, 0) / reports.length)`
- `approvedCount = reports.filter(r => r.status === 'Approved').length`
- Display: `Avg 78 · 4/15 approved`

## Final Design: 2 Biểu Đồ Bổ Sung

### Chart 3 — Member Workload by Department
- **Type:** Grouped horizontal bar chart (Recharts `BarChart` horizontal)
- **X:** In Progress task count, **Y:** thành viên, **Group:** department
- **Color threshold:** green (≤2), yellow (3–4), red (≥5)
- **Data:** `workItems.filter(i => i.status === 'In Progress')` group by `assigneeId` → join `users`
- **Value:** Giúp PM thấy ngay ai overloaded trong từng department

### Chart 4 — Upcoming Deadlines Timeline  
- **Type:** Stacked bar chart (4 tuần tới)
- **X:** W+1 → W+4, **Y:** count tasks đến hạn, **Stack:** Urgent/High/Medium/Low
- **Data:** `workItems.filter(i => i.dueDate && i.status !== 'Done' && dueDate <= 4 weeks from now)`
- **Value:** PM thấy pressure points sắp tới để điều phối resource trước

## Implementation Notes
- Tất cả computations đều frontend (useMemo) — không cần API mới ngoại trừ Card 5 cần thêm fetch daily-reports
- File duy nhất cần sửa: `src/pages/PMDashboard.tsx`
- Cần import thêm `BarChart, Bar` từ recharts (đã có sẵn package)
- Card 5 cần thêm `useState<DailyReport[]>` + 1 fetch call

## Risks
- `DailyReport` type cần kiểm tra có trong `src/types/index.ts` chưa
- Nếu team chưa dùng `dueDate` nhiều → Card 2 và Chart 4 có thể hiển thị 0 values lúc đầu
