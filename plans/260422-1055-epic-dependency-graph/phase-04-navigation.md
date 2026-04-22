# Phase 04 u2014 Navigation Integration

**Status:** completed  
**Priority:** Medium  
**Depends on:** Phase 03

## Overview

u0110u0103ng ku00fd view type mu1edbi `'epic-graph'` vu00e0o `App.tsx` vu00e0 thu00eam nav item vu00e0o Sidebar.

## Related Files

- Modify: `src/App.tsx`
- Modify: `src/components/layout/Sidebar.tsx`

## Implementation Steps

### 1. Cu1eadp nhu1eadt `src/App.tsx`

**Thu00eam import:**
```ts
import EpicGraph from './pages/EpicGraph';
```

**Thu00eam vu00e0o `ViewType` union:**
```ts
export type ViewType = 'dashboard' | 'okrs' | 'tech' | 'backlog' | 'mkt' | 'media'
  | 'sale' | 'sync' | 'daily-sync' | 'settings' | 'profile' | 'ads-overview'
  | 'sprint' | 'lead-tracker' | 'epics' | 'epic-graph';  // u2190 thu00eam
```

**Thu00eam render condition** (sau `epics` view):
```tsx
{currentView === 'epic-graph' && <EpicGraph key="epic-graph" />}
```

### 2. Cu1eadp nhu1eadt `src/components/layout/Sidebar.tsx`

Thu00eam `NavItem` cho Epic Graph **ngay sau** Epic Board nav item:

```tsx
<NavItem
  icon="hub"  {/* material-symbols: hub = graph network icon */}
  label="Epic Graph"
  active={currentView === 'epic-graph'}
  onClick={() => onViewChange('epic-graph')}
/>
```

> Icon gu1ee3i u00fd: `"hub"` (network node), `"share"` (connection), hou1eb7c `"account_tree"` (hierarchy). Chu1ecdn `"account_tree"` nu1ebfu muu1ed1n ru00f5 hu01a1n.

## Todo

- [x] Import `EpicGraph` vu00e0o `App.tsx`
- [x] Thu00eam `'epic-graph'` vu00e0o `ViewType`
- [x] Thu00eam render `{currentView === 'epic-graph' && <EpicGraph />}`
- [x] Thu00eam `NavItem` "Epic Graph" vu00e0o Sidebar sau "Epic Board"
- [x] Kiu1ec3m tra navigate u0111u1ebfn trang mu1edbi hou1ea1t u0111u1ed9ng

## Success Criteria

- Click "Epic Graph" trong sidebar u2192 hiu1ec3n thu1ecb trang graph
- Active state highlight u0111u00fang
- Khu00f4ng u1ea3nh hu01b0u1edfng navigation cu00e1c view khu00e1c
