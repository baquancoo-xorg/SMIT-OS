# Phase 04 - Page & Sidebar Integration

## Overview
- **Priority:** Medium
- **Status:** pending
- **Depends on:** Phase 03

## Related Files
- Create: `src/pages/LeadTracker.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

## Implementation Steps

### 1. Create `src/pages/LeadTracker.tsx`

```tsx
import { useState } from 'react';
import LeadLogsTab from '../components/lead-tracker/lead-logs-tab';
import DailyStatsTab from '../components/lead-tracker/daily-stats-tab';
import DashboardTab from '../components/lead-tracker/dashboard-tab';

type TabType = 'logs' | 'daily' | 'dashboard';

const TABS: { key: TabType; label: string }[] = [
  { key: 'logs', label: 'Lead Logs' },
  { key: 'daily', label: 'Hieu suat ngay' },
  { key: 'dashboard', label: 'Dashboard' },
];

export default function LeadTracker() {
  const [tab, setTab] = useState<TabType>('logs');
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Lead Performance Tracker
      </h1>
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'logs' && <LeadLogsTab />}
      {tab === 'daily' && <DailyStatsTab />}
      {tab === 'dashboard' && <DashboardTab />}
    </div>
  );
}
```

### 2. Update `src/App.tsx`

**Add to `ViewType` union (line 24):**
```typescript
export type ViewType = 'dashboard' | 'okrs' | 'tech' | 'backlog' | 'mkt' | 'media'
  | 'sale' | 'sync' | 'daily-sync' | 'settings' | 'profile' | 'ads-overview'
  | 'sprint' | 'lead-tracker';
```

**Add to `SCROLLABLE_VIEWS`:**
```typescript
const SCROLLABLE_VIEWS: ViewType[] = [
  'okrs', 'settings', 'profile', 'sync', 'daily-sync', 'ads-overview', 'lead-tracker'
];
```

**Add import and render (after SprintBoard lines):**
```tsx
import LeadTracker from './pages/LeadTracker';
// ...
{currentView === 'lead-tracker' && <LeadTracker key="lead-tracker" />}
```

### 3. Add CRM group to `src/components/layout/Sidebar.tsx`

Add after closing `</div>` of "Rituals" group, before `</nav>`:

```tsx
{/* CRM */}
<div className="space-y-2">
  <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
    CRM
  </p>
  <NavItem
    icon="person_search"
    label="Lead Tracker"
    active={currentView === 'lead-tracker'}
    onClick={() => onViewChange('lead-tracker')}
  />
</div>
```

## Todo

- [ ] Create `src/pages/LeadTracker.tsx` with 3 tabs
- [ ] Add `lead-tracker` to `ViewType` in `src/App.tsx`
- [ ] Add `lead-tracker` to `SCROLLABLE_VIEWS`
- [ ] Import and render `<LeadTracker>` in `src/App.tsx`
- [ ] Add CRM group and NavItem in `src/components/layout/Sidebar.tsx`
- [ ] Test clicking Lead Tracker from Sidebar opens correct page

## Success Criteria

- Sidebar shows "CRM" group with "Lead Tracker" item
- Clicking opens page with 3 working tabs
- No TypeScript compile errors
- Hot-reload works without errors
