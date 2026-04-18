# Phase 3: Refactor Other Pages

**Status:** completed
**Effort:** 30 minutes
**Priority:** Medium

## Overview

Update remaining pages cho spacing consistency và button sizing.

## Files to Modify

| File | Changes Needed |
|------|----------------|
| `src/pages/ProductBacklog.tsx` | `py-2` → `py-2.5`, add `min-w-[130px]` |
| `src/pages/OKRsManagement.tsx` | `space-y-10` → `space-y-8` |
| `src/pages/DashboardOverview.tsx` | `space-y-6` → `space-y-8` |
| `src/pages/DailySync.tsx` | Align button với PrimaryActionButton style |

## Tasks

### 3.1 Fix ProductBacklog.tsx

**Line ~209:** Change button styling
```tsx
// Before
className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full..."

// After
className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-95 transition-all min-w-[130px] whitespace-nowrap"
```

### 3.2 Fix OKRsManagement.tsx

**Line ~212:** Change container spacing
```tsx
// Before
<div className="h-full flex flex-col py-6 md:py-10 space-y-10 w-full">

// After  
<div className="h-full flex flex-col py-6 md:py-10 space-y-8 w-full">
```

### 3.3 Fix DashboardOverview.tsx

**Line ~36:** Change container spacing
```tsx
// Before
<div className="h-full flex flex-col py-6 lg:py-10 space-y-6 w-full">

// After
<div className="h-full flex flex-col py-6 lg:py-10 space-y-8 w-full">
```

### 3.4 Align DailySync.tsx button

Button đã có `min-w-[130px]` nhưng dùng `Plus` icon từ lucide thay vì material symbols.

**Option:** Keep as-is (acceptable) hoặc switch to material icon for consistency.

## Visual QA Checklist

After all changes:
- [x] Start dev server: `npm run dev`
- [x] Check Overview Dashboard
- [x] Check Tech Board
- [x] Check Marketing Board
- [x] Check Media Board
- [x] Check Sales Board
- [x] Check OKRs page
- [x] Check Team Backlog
- [x] Check Daily Sync
- [x] Verify buttons align với Sprint widget
- [x] Verify spacing consistent (32px)

## Implementation Notes

- ProductBacklog/OKRsManagement: Keep inline buttons - different toggle labels (PBI/Sprint, Tree/Timeline/Kanban)
- DailySync: Uses lucide Plus icon - acceptable deviation
- All pages now use space-y-8 (32px) spacing consistently
