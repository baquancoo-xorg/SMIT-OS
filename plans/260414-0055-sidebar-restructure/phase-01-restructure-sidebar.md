# Phase 1: Restructure Sidebar Groups

## Context

- [Brainstorm Report](../reports/brainstorm-260414-0055-sidebar-menu-restructure.md)
- [plan.md](plan.md)

## Overview

- **Priority:** Medium
- **Status:** ✅ Completed
- **Effort:** 30m-1h (actual: 15m)

Thay đổi cấu trúc và naming của sidebar menu groups.

## File to Modify

`src/components/layout/Sidebar.tsx`

## Current Structure (Lines 27-93)

```
nav > space-y-8
├── Strategic (group)
│   ├── Overview
│   └── OKRs
├── Operations (group)
│   ├── Tech&Product
│   ├── Marketing
│   ├── Media
│   └── Sales
└── System (group)
    ├── Backlog
    ├── Weekly Report
    └── Daily Sync
```

## Target Structure

```
nav > space-y-8
├── Overview (standalone - NO group header)
├── Workspaces (group)
│   ├── Tech & Product
│   ├── Marketing
│   ├── Media
│   └── Sales
├── Planning (group)
│   ├── OKRs
│   └── Team Backlog
└── Rituals (group)
    ├── Daily Sync
    └── Weekly Report
```

## Implementation Steps

### Step 1: Restructure JSX in nav element

Replace lines 28-92 with new structure:

```tsx
{/* Overview - Standalone */}
<div className="space-y-2">
  <NavItem
    icon="grid_view"
    label="Overview"
    active={currentView === 'dashboard'}
    onClick={() => onViewChange('dashboard')}
  />
</div>

{/* Workspaces */}
<div className="space-y-2">
  <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Workspaces</p>
  <NavItem
    icon="terminal"
    label="Tech & Product"
    active={currentView === 'tech'}
    onClick={() => onViewChange('tech')}
  />
  <NavItem
    icon="layers"
    label="Marketing"
    active={currentView === 'mkt'}
    onClick={() => onViewChange('mkt')}
  />
  <NavItem
    icon="video_library"
    label="Media"
    active={currentView === 'media'}
    onClick={() => onViewChange('media')}
  />
  <NavItem
    icon="payments"
    label="Sales"
    active={currentView === 'sale'}
    onClick={() => onViewChange('sale')}
  />
</div>

{/* Planning */}
<div className="space-y-2">
  <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Planning</p>
  <NavItem
    icon="track_changes"
    label="OKRs"
    active={currentView === 'okrs'}
    onClick={() => onViewChange('okrs')}
  />
  <NavItem
    icon={<Inbox size={18} />}
    label="Team Backlog"
    active={currentView === 'backlog'}
    onClick={() => onViewChange('backlog')}
  />
</div>

{/* Rituals */}
<div className="space-y-2">
  <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Rituals</p>
  <NavItem
    icon="event_note"
    label="Daily Sync"
    active={currentView === 'daily-sync'}
    onClick={() => onViewChange('daily-sync')}
  />
  <NavItem
    icon="event_repeat"
    label="Weekly Report"
    active={currentView === 'sync'}
    onClick={() => onViewChange('sync')}
  />
</div>
```

## Key Changes Summary

| Line | Change |
|------|--------|
| Remove | "Strategic" group header |
| Keep | Overview as standalone NavItem |
| Rename | "Operations" → "Workspaces" |
| Rename | "Tech&Product" → "Tech & Product" (spacing) |
| Move | OKRs từ Strategic sang Planning |
| New | "Planning" group với OKRs + Team Backlog |
| Rename | "Backlog" → "Team Backlog" |
| Rename | "System" → "Rituals" |
| Reorder | Daily Sync trước Weekly Report |

## Testing Checklist

- [x] npm run dev không lỗi
- [x] Sidebar hiển thị đúng structure mới
- [x] Click mỗi NavItem navigate đúng view
- [x] Active state highlight đúng item
- [x] Responsive layout không vỡ

## Success Criteria

- [x] Tất cả group names đổi đúng
- [x] Items được reorder đúng vị trí
- [x] Không có lỗi TypeScript/runtime
