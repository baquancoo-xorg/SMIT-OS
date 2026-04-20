# Phase 02 u2014 Dashboard Tab Cards & Charts

## Status
pending

## File
`src/components/lead-tracker/dashboard-tab.tsx`

## Context
- Pattern: `src/components/dashboard/overview/SummaryCards.tsx` (card style)
- Icons available: `lucide-react` (CheckCircle2, XCircle, Clock, TrendingUp)

## Changes

### 1. KPI Cards u2014 thu00eam icon + nu00e2ng cu1ea5p style
```tsx
// Before
<div className="bg-white rounded-2xl shadow-sm p-5">
  <p className="text-xs font-medium text-slate-500 mb-1">Qualified</p>
  <p className="text-3xl font-bold text-emerald-600">{qualified}</p>
</div>

// After
<div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm p-5 hover:shadow-md transition-all">
  <div className="flex items-start justify-between mb-3">
    <div className="p-2 rounded-lg bg-emerald-500/10">
      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    </div>
  </div>
  <p className="text-xs font-medium text-slate-500 mb-1">Qualified</p>
  <p className="text-2xl font-bold text-slate-900">{qualified}</p>
</div>
```

### 2. Mu1ed7i KPI card du00f9ng icon riu00eang
| Card | Icon | Icon color |
|------|------|------------|
| Qualified | `CheckCircle2` | `text-emerald-500`, bg `bg-emerald-500/10` |
| Unqualified | `XCircle` | `text-red-500`, bg `bg-red-500/10` |
| u0110ang xu1eed lu00fd | `Clock` | `text-amber-500`, bg `bg-amber-500/10` |

### 3. Chart containers
```tsx
// Before
<div className="bg-white rounded-2xl shadow-sm p-5">

// After
<div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm p-5">
```

### 4. Thu00eam imports
```tsx
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
```

## Todo
- [ ] Thu00eam import Lucide icons
- [ ] Refactor 3 KPI cards: style + icon
- [ ] Refactor 2 chart containers: rounded-3xl + backdrop-blur
