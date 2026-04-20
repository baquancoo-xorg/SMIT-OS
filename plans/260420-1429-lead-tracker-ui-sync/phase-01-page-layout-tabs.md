# Phase 01 — Page Layout & Tabs

## Status
pending

## File
`src/pages/LeadTracker.tsx`

## Context
- Pattern: `src/pages/Settings.tsx` (layout, header)
- Pattern: `src/components/settings/settings-tabs.tsx` (pill tabs)

## Changes

### 1. Page container
```tsx
// Before
<div className="p-6">

// After
<div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
```

### 2. Header section
```tsx
// Before
<h1 className="text-2xl font-bold text-slate-800 mb-6">Lead Performance Tracker</h1>

// After
<section className="shrink-0 flex items-start justify-between">
  <div>
    <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
      Lead <span className="text-primary italic">Tracker</span>
    </h2>
    <p className="text-slate-500 mt-2">Theo dõi hiệu suất xử lý Lead của Sales team.</p>
  </div>
</section>
```

### 3. Tab navigation
```tsx
// Before: underline style
<div className="flex gap-1 mb-6 border-b border-slate-200">
  <button className={`... ${tab === t.key ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}>

// After: pill/segmented style (như SettingsTabs)
<div className="shrink-0">
  <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
    <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
      tab === t.key ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
    }`}>
      <Icon size={16} />
      {t.label}
    </button>
  </div>
</div>
```

### 4. Thêm icons cho tabs
```tsx
import { ListOrdered, BarChart2, LayoutDashboard } from 'lucide-react';

const TABS = [
  { key: 'logs', label: 'Lead Logs', icon: ListOrdered },
  { key: 'daily', label: 'Hiệu suất ngày', icon: BarChart2 },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
];
```

### 5. Content area
```tsx
// Wrap tab content in scrollable flex-1
<div className="flex-1 overflow-y-auto pb-8">
  {tab === 'logs' && <LeadLogsTab />}
  {tab === 'daily' && <DailyStatsTab />}
  {tab === 'dashboard' && <DashboardTab />}
</div>
```

## Todo
- [ ] Update import: thêm Lucide icons
- [ ] Thay container div
- [ ] Thay header h1 → section + h2 + p
- [ ] Thay tab navigation
- [ ] Wrap content area
