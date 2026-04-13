# Phase 1: Top Metrics Cards

## Overview

Refactor 4 cards → 6 cards với consistent styling và new metrics.

## Current State

4 cards với inconsistent styling:
- Card 1-3: `bg-white`
- Card 4 (Bottleneck): `bg-yellow-50` khi có items

## Target State

6 cards, all `bg-white`, uniform sizing.

## Card Specifications

### Card 1: Company OKRs Progress
```tsx
// Keep existing logic
const l1Objectives = objectives.filter(obj => obj.level === 'L1' || obj.department === 'BOD');
const companyOKRProgress = l1Objectives.length > 0
  ? Math.round(l1Objectives.reduce((sum, obj) => sum + obj.progressPercentage, 0) / l1Objectives.length)
  : 0;

// Display: "{count} Active Objectives" + progress bar + badge
```

### Card 2: Sprint Countdown (NEW)
```tsx
// Find current sprint
const now = new Date();
const currentSprint = sprints.find(s => 
  new Date(s.startDate) <= now && new Date(s.endDate) >= now
);

// Calculate days left
const daysLeft = currentSprint 
  ? Math.ceil((new Date(currentSprint.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  : null;

// Sprint progress %
const sprintDuration = currentSprint
  ? (new Date(currentSprint.endDate).getTime() - new Date(currentSprint.startDate).getTime())
  : 0;
const sprintElapsed = currentSprint
  ? (now.getTime() - new Date(currentSprint.startDate).getTime())
  : 0;
const sprintProgress = sprintDuration > 0 ? Math.round((sprintElapsed / sprintDuration) * 100) : 0;

// Display: "{daysLeft} days left" + progress bar + sprint name
// Fallback: "No Active Sprint"
```

### Card 3: Flow Efficiency
```tsx
// Keep existing logic
const doneItems = workItems.filter(item => item.status === 'Done').length;
const flowEfficiency = workItems.length > 0
  ? Math.round((doneItems / workItems.length) * 100)
  : 0;

// Display: "{done}/{total} Completed" + green progress bar
```

### Card 4: Active Blockers
```tsx
// Keep existing logic
const activeBlockers = workItems.filter(
  item => item.priority === 'Urgent' &&
    (item.status === 'Todo' || item.status === 'In Progress')
).length;

// Display: "{count} Blocked" or "All Clear"
// Remove conditional bg-yellow
```

### Card 5: This Week Activity (NEW)
```tsx
// Tasks created/completed in last 7 days
const weekAgo = new Date();
weekAgo.setDate(weekAgo.getDate() - 7);

const createdThisWeek = workItems.filter(item => 
  new Date(item.createdAt) >= weekAgo
).length;

const completedThisWeek = workItems.filter(item => 
  item.status === 'Done' && new Date(item.updatedAt) >= weekAgo
).length;

// Display: "+{created} / ✓{completed}" with icons
```

### Card 6: Report Status (NEW)
```tsx
// Need to fetch weekly reports for current week
const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);

// In fetchData:
const reportsRes = await fetch('/api/weekly-reports');
const reportsData = await reportsRes.json();
setWeeklyReports(reportsData);

// Filter current week
const weekStart = getWeekStart(new Date());
const currentWeekReports = weeklyReports.filter(r => 
  new Date(r.weekEnding) >= weekStart
);
const submittedCount = currentWeekReports.length;
const totalMembers = users.length;

// Display: "{submitted}/{total}" submitted
```

## Styling (All Cards)

```tsx
<div className="bg-white p-5 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl lg:rounded-[40px] border border-outline-variant/10 shadow-sm flex flex-col gap-2">
  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
    {label}
  </p>
  <div className="flex items-center justify-between">
    <h4 className="text-lg md:text-xl lg:text-2xl font-black font-headline text-on-surface">
      {value}
    </h4>
    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg">
      {badge}
    </span>
  </div>
  {/* Optional progress bar */}
</div>
```

## Grid Layout

```tsx
<section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
  {/* 6 cards */}
</section>
```

## API Changes

Add Sprint fetch to existing fetchData:
```tsx
const [sprints, setSprints] = useState<Sprint[]>([]);

// In fetchData
const sprintsRes = await fetch('/api/sprints');
const sprintsData = await sprintsRes.json();
setSprints(sprintsData);
```

## Tasks

- [ ] Add Sprint and WeeklyReport state
- [ ] Update fetchData to fetch sprints and reports
- [ ] Create Sprint Countdown card
- [ ] Create This Week Activity card
- [ ] Create Report Status card
- [ ] Update grid layout to 6 columns
- [ ] Remove conditional yellow bg from Blockers card
- [ ] Test responsive layout
