# Phase 5: Medium Priority Polish

## Overview

Fix remaining medium issues for improved mobile/tablet experience.

**Priority:** Medium  
**Effort:** 1h  
**Files:** Multiple

## Issues

| ID | Problem | File | Fix |
|----|---------|------|-----|
| M1 | Filter dropdown small target | OKRsManagement | Add padding |
| M2 | Metric card text too small | OKRsManagement | Responsive text |
| M3 | Sidebar width inconsistent | Sidebar.tsx | Fix progression |
| M4 | NavItem touch target | Sidebar.tsx | Add min-height |
| M5 | Main content padding | AppLayout.tsx | Better progression |
| M8 | Form sections cramped | DailySync.tsx | Responsive padding |
| M9 | Stats grid aggressive | SaturdaySync.tsx | Add md breakpoint |
| M10 | Max width too narrow | LoginPage.tsx | Responsive max-w |
| M16 | Team switcher overflow | WeeklyCheckinModal | Already in Phase 3 |
| M18 | Chart height fixed | PMDashboard.tsx | Responsive height |

## Implementation

### M1: OKRsManagement Filter Target

**Location:** Lines 241-256

```tsx
// Increase tap target
<div className="flex items-center gap-3 bg-surface-container-high px-4 md:px-6 py-3 rounded-full border border-outline-variant/10 min-h-[48px]">
  <span className="material-symbols-outlined text-[18px] text-slate-400">filter_list</span>
  <select className="text-xs md:text-[10px] font-black bg-transparent border-none focus:ring-0 text-on-surface-variant uppercase tracking-widest outline-none cursor-pointer min-h-[44px]">
    {/* options */}
  </select>
</div>
```

### M2: OKRsManagement Metric Text

**Location:** Lines 196-234

```tsx
// Responsive text sizes
<p className="text-xs md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Quarterly Progress</p>
```

### M3: Sidebar Width

**Location:** Line 16

```tsx
// Consistent width progression (remove lg dip)
<aside className="w-64 xl:w-72 bg-surface-container-low ...">
```

### M4: Sidebar NavItem

**Location:** Lines 116-134

```tsx
// Add min-height for touch
<Link
  to={item.path}
  className={`flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl transition-all ${
    isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
  }`}
>
  {/* content */}
</Link>
```

### M5: AppLayout Content Padding

**Location:** Line 39

```tsx
// Better padding progression
<main className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 overflow-auto">
```

### M8: DailySync Form Padding

**Location:** Lines 274-419

```tsx
// DailyReportModal responsive padding
<div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
  {/* form sections */}
</div>
```

### M9: SaturdaySync Stats Grid

**Location:** Line 107

```tsx
// Add intermediate breakpoint
<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
  {/* stats */}
</div>
```

### M10: LoginPage Max Width

**Location:** Line 29

```tsx
// Responsive max-width
<div className="w-full max-w-sm md:max-w-md lg:max-w-lg mx-auto px-4">
  {/* login form */}
</div>
```

### M18: PMDashboard Chart Height

**Location:** Lines 405-441

```tsx
// Responsive chart container
<div className="h-[200px] md:h-[280px] lg:h-[320px]">
  <ResponsiveContainer width="100%" height="100%">
    {/* chart */}
  </ResponsiveContainer>
</div>
```

## Quick Reference Patterns

### Responsive Padding
```tsx
p-4 sm:p-5 md:p-6 lg:p-8
```

### Touch Targets
```tsx
min-h-[44px] // minimum
min-h-[48px] // comfortable
```

### Text Scaling
```tsx
text-xs md:text-[10px] // small labels
text-sm md:text-base   // body text
text-2xl md:text-3xl   // headings
```

### Grid Progression
```tsx
grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
```

## Todo

- [x] Fix OKRsManagement filter (M1)
- [x] Fix OKRsManagement metric text (M2)
- [x] Fix Sidebar width (M3)
- [x] Fix Sidebar NavItem height (M4)
- [x] Fix AppLayout padding (M5)
- [x] Fix DailySync form padding (M8)
- [x] Fix SaturdaySync grid (M9)
- [x] Fix LoginPage max-width (M10)
- [x] Fix PMDashboard chart height (M18)
- [x] Final test all viewports

## Success Criteria

- [x] All touch targets >= 44px
- [x] Text readable without zooming
- [x] Consistent spacing at all breakpoints
- [x] No awkward layout shifts between breakpoints
