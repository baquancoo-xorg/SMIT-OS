# Phase 2: Charts Section

## Overview

Replace current 60/40 charts with 50/50 layout:
- Left: Department Progress + Status Breakdown
- Right: Weekly Velocity Line Chart

## Current State

- Left (60%): Bar chart for Department OKRs
- Right (40%): Pie chart for status distribution

## Target State

- Left (50%): Horizontal bar chart + Progress bars
- Right (50%): Line chart for velocity

## Left Panel: Department & Status

### Department Progress (Horizontal Bars)

```tsx
// Keep existing data computation
const departmentData = Object.entries(departmentMap).map(([dept, progresses]) => ({
  name: dept,
  progress: progresses.length > 0
    ? Math.round(progresses.reduce((sum, p) => sum + p, 0) / progresses.length)
    : 0
}));

// Custom horizontal bar (không dùng recharts)
{departmentData.map(dept => (
  <div key={dept.name} className="flex items-center gap-4">
    <span className="w-20 text-sm font-medium text-on-surface-variant">{dept.name}</span>
    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
      <div 
        className="h-full bg-primary transition-all duration-1000"
        style={{ width: `${dept.progress}%` }}
      />
    </div>
    <span className="w-12 text-sm font-bold text-right">{dept.progress}%</span>
  </div>
))}
```

### Status Breakdown (Progress Bars)

```tsx
// Replace Pie chart with progress bars
const statusData = [
  { name: 'Todo', count: workItems.filter(i => i.status === 'Todo').length, color: 'bg-slate-400' },
  { name: 'In Progress', count: workItems.filter(i => i.status === 'In Progress').length, color: 'bg-primary' },
  { name: 'Review', count: workItems.filter(i => i.status === 'Review').length, color: 'bg-yellow-500' },
  { name: 'Done', count: workItems.filter(i => i.status === 'Done').length, color: 'bg-tertiary' },
];

const total = statusData.reduce((sum, s) => sum + s.count, 0);

{statusData.map(status => (
  <div key={status.name} className="flex items-center gap-4">
    <span className="w-24 text-sm font-medium text-on-surface-variant">{status.name}</span>
    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
      <div 
        className={`h-full ${status.color} transition-all duration-1000`}
        style={{ width: `${total > 0 ? (status.count / total) * 100 : 0}%` }}
      />
    </div>
    <span className="w-12 text-sm font-bold text-right">{status.count}</span>
  </div>
))}
```

## Right Panel: Weekly Velocity

### Data Computation

```tsx
// Group workItems by week, count Done items
const getWeekKey = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
  return d.toISOString().split('T')[0];
};

const velocityData = useMemo(() => {
  const weekMap: Record<string, number> = {};
  
  // Get last 4 weeks
  const now = new Date();
  for (let i = 3; i >= 0; i--) {
    const weekDate = new Date(now);
    weekDate.setDate(weekDate.getDate() - (i * 7));
    const key = getWeekKey(weekDate);
    weekMap[key] = 0;
  }
  
  // Count done items by week (using updatedAt as completion date)
  workItems
    .filter(item => item.status === 'Done')
    .forEach(item => {
      const key = getWeekKey(new Date(item.updatedAt));
      if (weekMap[key] !== undefined) {
        weekMap[key]++;
      }
    });
  
  return Object.entries(weekMap).map(([week, count], i) => ({
    week: `W${i + 1}`,
    completed: count
  }));
}, [workItems]);
```

### Line Chart (recharts)

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={200}>
  <LineChart data={velocityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
    <XAxis 
      dataKey="week" 
      tick={{ fontSize: 12, fill: '#6b7280' }}
      axisLine={{ stroke: '#e5e7eb' }}
    />
    <YAxis 
      tick={{ fontSize: 12, fill: '#6b7280' }}
      axisLine={{ stroke: '#e5e7eb' }}
    />
    <Tooltip
      contentStyle={{
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      formatter={(value: any) => [`${value} tasks`, 'Completed']}
    />
    <Line 
      type="monotone" 
      dataKey="completed" 
      stroke="#0059b6" 
      strokeWidth={3}
      dot={{ fill: '#0059b6', strokeWidth: 2, r: 4 }}
      activeDot={{ r: 6 }}
    />
  </LineChart>
</ResponsiveContainer>
```

## Layout

```tsx
<section className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
  {/* Left Panel */}
  <div className="bg-white rounded-2xl md:rounded-3xl lg:rounded-[40px] border border-outline-variant/10 shadow-sm p-5 md:p-6 lg:p-8">
    <h3 className="text-base md:text-lg font-black font-headline text-on-surface mb-6">
      Department Progress
    </h3>
    {/* Horizontal bars */}
    
    <h3 className="text-base md:text-lg font-black font-headline text-on-surface mt-8 mb-4">
      Status Breakdown
    </h3>
    {/* Status progress bars */}
  </div>
  
  {/* Right Panel */}
  <div className="bg-white rounded-2xl md:rounded-3xl lg:rounded-[40px] border border-outline-variant/10 shadow-sm p-5 md:p-6 lg:p-8">
    <h3 className="text-base md:text-lg font-black font-headline text-on-surface mb-6">
      Weekly Velocity
    </h3>
    {/* Line chart */}
  </div>
</section>
```

## Tasks

- [ ] Replace BarChart with custom horizontal bars
- [ ] Replace PieChart with status progress bars
- [ ] Add velocity data computation with useMemo
- [ ] Add LineChart for velocity
- [ ] Update grid layout to 50/50
- [ ] Remove unused recharts imports (Pie, Cell, Legend)
- [ ] Add empty state for velocity chart
