# Phase 3: Modal Mobile Optimization

## Overview

Optimize modals for mobile screens with responsive padding, proper height constraints, and touch-friendly inputs.

**Priority:** Critical  
**Effort:** 1.5h  
**Files:**
- `src/components/modals/WeeklyCheckinModal.tsx`
- `src/components/modals/ReportDetailDialog.tsx`
- `src/pages/OKRsManagement.tsx` (inline modals)
- `src/components/board/TaskModal.tsx`
- `src/components/board/TaskDetailsModal.tsx`

## Issues

| ID | Problem | File | Impact |
|----|---------|------|--------|
| C6 | Fixed padding, cramped controls | WeeklyCheckinModal | Can't fill form on mobile |
| C7 | Header overflow | ReportDetailDialog | Approve button hidden |
| M6 | Two-column on mobile | TaskModal | Cramped inputs |
| M7 | Max width too wide | TaskDetailsModal | No breathing room |
| M13 | Side-by-side buttons cramped | DeleteConfirmModal | Hard to tap |
| M14 | Grid cols cramped | EditKRModal | Cramped inputs |
| M15 | Large padding | AddObjectiveModal | Wastes space |

## Implementation

### Pattern: Responsive Modal Base

Apply to ALL modals:

```tsx
// Modal container pattern
<div className="fixed inset-0 bg-slate-900/50 flex items-end sm:items-center justify-center z-50 backdrop-blur-sm p-0 sm:p-4">
  <div className="bg-surface rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col border border-outline-variant/20">
    
    {/* Header - fixed */}
    <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-outline-variant/10 flex-shrink-0">
      {/* header content */}
    </div>
    
    {/* Body - scrollable */}
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* body content */}
    </div>
    
    {/* Footer - fixed */}
    <div className="px-4 sm:px-6 py-4 sm:py-6 border-t border-outline-variant/10 flex-shrink-0">
      {/* buttons */}
    </div>
  </div>
</div>
```

### C6: WeeklyCheckinModal

**Location:** Lines 148-407

Key changes:
1. Responsive padding `p-4 md:p-8`
2. Team switcher → dropdown on mobile
3. Reduce section spacing

```tsx
// Team switcher - dropdown on mobile, buttons on desktop
<div className="mb-6">
  {/* Mobile: dropdown */}
  <select className="w-full md:hidden bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-bold">
    <option value="all">All Teams</option>
    <option value="tech">Tech</option>
    <option value="marketing">Marketing</option>
    <option value="media">Media</option>
  </select>
  
  {/* Desktop: buttons */}
  <div className="hidden md:flex p-1 bg-surface-container-high rounded-xl">
    {/* existing buttons */}
  </div>
</div>

// Form sections
<div className="space-y-4 md:space-y-6">
  {/* section content with responsive padding */}
</div>
```

### C7: ReportDetailDialog Header

**Location:** Lines 68-137

```tsx
// Stack header on mobile
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
  {/* Left side - user info */}
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
      <span className="text-primary font-bold text-sm">{initials}</span>
    </div>
    <div>
      <h3 className="font-bold text-on-surface">{userName}</h3>
      <p className="text-xs text-on-surface-variant">Week {weekNumber}</p>
    </div>
  </div>
  
  {/* Right side - metrics & action - wrap on mobile */}
  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
    <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100">{status}</span>
    <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">Score: {score}</span>
    <span className="text-xs font-bold px-2 py-1 rounded-full bg-secondary/10 text-secondary">Conf: {confidence}%</span>
    <button className="min-h-[44px] px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold">
      Approve
    </button>
  </div>
</div>
```

### M6: TaskModal Two-Column Fix

**Location:** Line 139

```tsx
// Change from grid-cols-2 to responsive
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
  {/* form fields */}
</div>
```

### M13: DeleteConfirmModal Buttons

**Location:** OKRsManagement.tsx Lines 891-906

```tsx
// Stack buttons on very small screens
<div className="flex flex-col-reverse sm:flex-row w-full gap-3">
  <button className="flex-1 px-6 py-3 text-sm font-bold text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest rounded-xl transition-all min-h-[48px]">
    Cancel
  </button>
  <button className="flex-1 px-6 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-lg shadow-rose-200 min-h-[48px]">
    Delete
  </button>
</div>
```

### M14: EditKRModal Grid Fix

**Location:** OKRsManagement.tsx Lines 958-978

```tsx
// Responsive grid for Unit/Due Date
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
  <div>
    <label className="...">Unit</label>
    <input className="..." />
  </div>
  <div>
    <label className="...">Due Date</label>
    <input type="date" className="..." />
  </div>
</div>
```

### M15: AddObjectiveModal Padding

**Location:** OKRsManagement.tsx Lines 1250-1302

```tsx
// Responsive padding
<div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
  {/* form content */}
</div>
```

## Todo

- [ ] Apply base modal pattern to all modals
- [ ] Fix WeeklyCheckinModal responsive (C6)
- [ ] Fix ReportDetailDialog header (C7)
- [ ] Fix TaskModal grid (M6)
- [ ] Add margin to TaskDetailsModal (M7)
- [ ] Fix DeleteConfirmModal buttons (M13)
- [ ] Fix EditKRModal grid (M14)
- [ ] Fix AddObjectiveModal padding (M15)
- [ ] Test all modals at 375px

## Success Criteria

- [ ] All modals usable on 375px width
- [ ] No content cut off at bottom
- [ ] All buttons ≥ 44px height
- [ ] Forms scrollable when content exceeds viewport
- [ ] Close/dismiss always accessible
