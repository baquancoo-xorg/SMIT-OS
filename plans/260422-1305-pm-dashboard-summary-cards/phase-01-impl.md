# Phase 01 — Implement 6 Summary Cards + 2 Charts

## Overview
- **Priority:** High
- **Status:** pending
- **File:** `src/pages/PMDashboard.tsx` (single file change)

## Related Files
- `src/pages/PMDashboard.tsx` — file duy nhat can sua
- `src/types/index.ts` — DailyReport type da co san
- `server/routes/daily-report.routes.ts` — GET /api/daily-reports da co san

## Current State (6 cards can thay)
| # | Card hien tai | Van de |
|---|---|---|
| 1 | Company OKRs | Redundant voi Department Progress chart ben duoi |
| 2 | Sprint Countdown | Thieu sprint name, khong so sanh completion vs time elapsed |
| 3 | Flow Efficiency | Tinh all-time tasks, khong sprint-specific |
| 4 | Blockers | Dung Urgent+Todo/InProgress lam proxy sai |
| 5 | This Week Activity | Raw numbers khong actionable |
| 6 | Reports | Bo phi `confidenceScore` field trong DB |

## Implementation Steps

### Step 1 — Them DailyReport state + fetch

Them sau cac state hien co:
```typescript
const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
```

Them vao `fetchData()` trong Promise.all:
```typescript
fetch('/api/daily-reports')
```

Va set sau khi resolve:
```typescript
setDailyReports(dailyReportsData);
```

### Step 2 — Tinh 6 metrics moi (thay the 6 metrics cu)

**Xoa bo metrics cu:**
- `companyOKRProgress`, `l1Objectives` (Company OKRs)
- `daysLeft`, `sprintProgress`, `sprintElapsed`, `sprintDuration` (Sprint Countdown)
- `flowEfficiency` (Flow Efficiency)
- `activeBlockers` (Blockers — dung Urgent proxy sai)
- `createdThisWeek`, `completedThisWeek` (This Week Activity)
- `submittedReports`, `totalMembers`, `weekStart`, `currentWeekReports` (Reports — keep some logic)

**Them metrics moi:**

```typescript
// Card 1: Sprint Burndown
const sprintItems = currentSprint
  ? workItems.filter(i => i.sprintId === currentSprint.id)
  : [];
const sprintDoneCount = sprintItems.filter(i => i.status === 'Done').length;
const sprintTotalCount = sprintItems.length;
const expectedDone = sprintTotalCount > 0 && sprintDuration > 0
  ? Math.round((sprintElapsed / sprintDuration) * sprintTotalCount)
  : 0;
const sprintBurnStatus = sprintDoneCount >= expectedDone ? 'On Track' : 'Behind';
// Giu lai sprintElapsed, sprintDuration tu logic Sprint hien co

// Card 2: Overdue Tasks
const overdueCount = workItems.filter(
  i => i.dueDate && new Date(i.dueDate) < now && i.status !== 'Done'
).length;

// Card 3: Review Queue
const reviewQueueCount = workItems.filter(i => i.status === 'Review').length;

// Card 4: WIP per Person
const inProgressItems = workItems.filter(i => i.status === 'In Progress');
const activeAssignees = new Set(inProgressItems.map(i => i.assigneeId).filter(Boolean)).size;
const wipPerPerson = activeAssignees > 0
  ? Math.round((inProgressItems.length / activeAssignees) * 10) / 10
  : 0;
const wipStatus = wipPerPerson <= 2 ? 'healthy' : wipPerPerson <= 4 ? 'warning' : 'danger';

// Card 5: Daily Report Today
const todayStr = now.toDateString();
const dailyReportsTodayCount = dailyReports.filter(
  r => new Date(r.reportDate).toDateString() === todayStr
).length;
const totalMembersCount = users.filter(u => u.role !== 'Admin').length;

// Card 6: Team Confidence
const getWeekStart = (date: Date) => { /* giu logic hien co */ };
const weekStart = getWeekStart(new Date());
const currentWeekReports = weeklyReports.filter(r => new Date(r.weekEnding) >= weekStart);
const approvedCount = currentWeekReports.filter(r => r.status === 'Approved').length;
const avgConfidence = currentWeekReports.length > 0
  ? Math.round(currentWeekReports.reduce((s, r) => s + (r.confidenceScore ?? 0), 0) / currentWeekReports.length)
  : 0;
```

### Step 3 — Them Chart 3 data: Member Workload by Department

```typescript
// Group In Progress by department
const memberWorkloadData = useMemo(() => {
  const inProgress = workItems.filter(i => i.status === 'In Progress' && i.assigneeId);
  
  // Group users by department
  const deptMembers: Record<string, { name: string; count: number }[]> = {
    Tech: [], Marketing: [], Media: [], Sale: []
  };
  
  users.forEach(user => {
    user.departments?.forEach(dept => {
      if (deptMembers[dept]) {
        const userCount = inProgress.filter(i => i.assigneeId === user.id).length;
        deptMembers[dept].push({ name: user.fullName.split(' ').pop() ?? user.fullName, count: userCount });
      }
    });
  });
  
  // Flatten for chart: [{dept, name, count}]
  return Object.entries(deptMembers).flatMap(([dept, members]) =>
    members.map(m => ({ dept, ...m }))
  );
}, [workItems, users]);
```

### Step 4 — Them Chart 4 data: Upcoming Deadlines Timeline

```typescript
const upcomingDeadlinesData = useMemo(() => {
  const weeks = [1, 2, 3, 4].map(w => {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + (w * 7));
    return { label: `+${w}w`, end: weekEnd };
  });
  
  return weeks.map(({ label, end }, idx) => {
    const start = idx === 0 ? now : new Date(now.getTime() + idx * 7 * 86400000);
    const items = workItems.filter(i =>
      i.dueDate &&
      i.status !== 'Done' &&
      new Date(i.dueDate) >= start &&
      new Date(i.dueDate) <= end
    );
    return {
      week: label,
      Urgent: items.filter(i => i.priority === 'Urgent').length,
      High: items.filter(i => i.priority === 'High').length,
      Medium: items.filter(i => i.priority === 'Medium').length,
      Low: items.filter(i => i.priority === 'Low').length,
    };
  });
}, [workItems]);
```

### Step 5 — Cap nhat imports

Them vao recharts imports:
```typescript
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
```

Cap nhat lucide imports (xoa icons cu khong dung, them icons moi):
```typescript
import { AlertCircle, Clock, Eye, Users, ClipboardCheck, BarChart2, Calendar, TrendingUp } from 'lucide-react';
```

### Step 6 — Cap nhat JSX: 6 cards moi

Thay the toan bo section `Tier 1: Top Metrics` voi:

**Card 1 — Sprint Burndown:**
```tsx
<div className="..."> 
  <p className="...">Sprint Burndown</p>
  <div className="flex items-center justify-between">
    <h4 className="...">
      {currentSprint ? `${sprintDoneCount}/${sprintTotalCount}` : 'No Sprint'}
    </h4>
    {currentSprint && (
      <span className={`px-2 py-1 text-xs font-bold rounded-lg ${
        sprintBurnStatus === 'On Track' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
      }`}>{sprintBurnStatus}</span>
    )}
  </div>
  <p className="text-[10px] font-bold text-slate-400 mt-1">
    {currentSprint?.name ?? 'No active sprint'}
  </p>
</div>
```

**Card 2 — Overdue Tasks:**
```tsx
<div className="...">
  <p className="...">Overdue Tasks</p>
  <div className="flex items-center justify-between">
    <h4 className={`... ${overdueCount > 0 ? 'text-error' : 'text-on-surface'}`}>
      {overdueCount === 0 ? 'Clear' : overdueCount}
    </h4>
    <AlertCircle size={18} className={overdueCount > 0 ? 'text-error' : 'text-slate-300'} />
  </div>
  <p className="text-[10px] font-bold text-slate-400 mt-1">Past due date</p>
</div>
```

**Card 3 — Review Queue:**
```tsx
<div className="...">
  <p className="...">Review Queue</p>
  <div className="flex items-center justify-between">
    <h4 className={`... ${reviewQueueCount > 3 ? 'text-amber-600' : 'text-on-surface'}`}>
      {reviewQueueCount}
    </h4>
    <Eye size={18} className="text-primary" />
  </div>
  <p className="text-[10px] font-bold text-slate-400 mt-1">Items waiting review</p>
</div>
```

**Card 4 — WIP per Person:**
```tsx
<div className="...">
  <p className="...">WIP / Person</p>
  <div className="flex items-center justify-between">
    <h4 className={`... ${
      wipStatus === 'healthy' ? 'text-tertiary' :
      wipStatus === 'warning' ? 'text-amber-600' : 'text-error'
    }`}>{wipPerPerson}</h4>
    <Users size={18} className="text-primary" />
  </div>
  <p className="text-[10px] font-bold text-slate-400 mt-1">Tasks in progress / person</p>
</div>
```

**Card 5 — Daily Report Today:**
```tsx
<div className="...">
  <p className="...">Daily Reports</p>
  <div className="flex items-center justify-between">
    <h4 className="...">{dailyReportsTodayCount}/{totalMembersCount}</h4>
    <ClipboardCheck size={18} className="text-primary" />
  </div>
  <p className="text-[10px] font-bold text-slate-400 mt-1">Submitted today</p>
</div>
```

**Card 6 — Team Confidence:**
```tsx
<div className="...">
  <p className="...">Team Confidence</p>
  <div className="flex items-center justify-between">
    <h4 className="...">
      {avgConfidence > 0 ? `Avg ${avgConfidence}` : 'N/A'}
    </h4>
    <span className="text-xs font-bold text-slate-400">{approvedCount}/{currentWeekReports.length}</span>
  </div>
  <p className="text-[10px] font-bold text-slate-400 mt-1">Weekly score / approved</p>
</div>
```

### Step 7 — Them 2 chart moi vao Tier 2 section

Them sau section Weekly Velocity hien co (hoac tao row moi):

**Chart 3 — Member Workload by Department:**
```tsx
<div className="bg-white rounded-2xl ... p-5">
  <h3 className="...">Member Workload</h3>
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={memberWorkloadData} layout="vertical">
      <XAxis type="number" />
      <YAxis dataKey="name" type="category" width={80} />
      <Tooltip />
      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
        {memberWorkloadData.map((entry, i) => (
          <Cell key={i} fill={
            entry.count <= 2 ? '#009966' :
            entry.count <= 4 ? '#F59E0B' : '#EF4444'
          } />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>
```

**Chart 4 — Upcoming Deadlines Timeline:**
```tsx
<div className="bg-white rounded-2xl ... p-5">
  <h3 className="...">Upcoming Deadlines</h3>
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={upcomingDeadlinesData}>
      <XAxis dataKey="week" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="Urgent" stackId="a" fill="#EF4444" />
      <Bar dataKey="High" stackId="a" fill="#F97316" />
      <Bar dataKey="Medium" stackId="a" fill="#0059B6" />
      <Bar dataKey="Low" stackId="a" fill="#94A3B8" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
</div>
```

## Layout Change

Tier 2 section hien co: `grid-cols-1 xl:grid-cols-2` (2 charts)
Sau khi them: doi thanh 2 rows:
- Row 1: `grid-cols-1 xl:grid-cols-2` — Department Progress+Status | Weekly Velocity
- Row 2: `grid-cols-1 xl:grid-cols-2` — Member Workload | Upcoming Deadlines

## Todo

- [ ] Them `DailyReport[]` state + fetch trong fetchData()
- [ ] Xoa 6 metric computations cu, them 6 metrics moi
- [ ] Them memberWorkloadData useMemo
- [ ] Them upcomingDeadlinesData useMemo  
- [ ] Cap nhat imports (recharts + lucide)
- [ ] Thay the JSX cua 6 cards cu
- [ ] Them 2 chart moi vao Tier 2, doi layout thanh 2 rows
- [ ] Compile check

## Success Criteria

- 6 cards moi hien thi dung du lieu tu DB
- 2 bieu do moi render khong loi
- Khong co TypeScript compile errors
- File van duoi 500 lines (hien tai 441 lines, them ~100 lines net)

## Risk

- `User.departments` la array — can join dung voi workItems.assigneeId
- `/api/daily-reports` tra ve co the can query param `?date=today` de giam payload; neu khong co, filter o frontend
