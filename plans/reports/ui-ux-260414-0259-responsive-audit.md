# Mobile/Tablet Responsive Audit Report

**Date:** 2026-04-14  
**Auditor:** UI/UX Designer Agent  
**Project:** SMIT-OS  
**Tech Stack:** React 19 + TypeScript + TailwindCSS v4  
**Breakpoints:** sm: 640px | md: 768px | lg: 1024px | xl: 1280px

---

## Executive Summary

Comprehensive audit of 16 files across pages, layout, board, and modal components. Found **12 Critical**, **18 Medium**, and **15 Polish** issues primarily affecting mobile (< 640px) and tablet (640-1024px) viewports.

**Key Problem Areas:**
1. OKRsManagement.tsx - Text truncation, header overflow, touch targets too small
2. Tables (DailySync, Settings, ReportTableView) - Horizontal overflow without scroll indicators
3. Modals - Not optimized for mobile fullscreen, form inputs cramped
4. Dashboard metric cards - Text overflow on narrow screens
5. Sidebar - Width inconsistency across breakpoints

---

## Critical Issues (Must Fix)

### C1. OKRsManagement.tsx - Header Overflow & Text Truncation
**Location:** Lines 152-185  
**Problem:** On mobile < 400px, the dashboard header with tabs + "New Objective" button causes horizontal overflow. Tab buttons have fixed `px-6` padding causing text cutoff.
```tsx
// Line 163-176: Tab buttons with fixed padding
<button className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest...">
  Company (L1)
</button>
```
**Impact:** Users cannot see full tab labels, buttons may overlap  
**Solution:** Use responsive padding `px-3 md:px-6`, consider icon-only mode on mobile, or stack header vertically on small screens.

### C2. OKRsManagement.tsx - Objective Card Title Truncation
**Location:** Lines 350-351  
**Problem:** Objective titles use `truncate` class but parent flex container doesn't have proper min-width constraint causing text to disappear completely on narrow screens.
```tsx
<h3 className="...truncate">{objective.title}</h3>
```
**Impact:** Reported by user - text bị cắt không đọc được  
**Solution:** Add `min-w-0` to flex parent, use `line-clamp-2` instead of truncate for multi-line support.

### C3. OKRsManagement.tsx - KeyResultRow Grid Issues
**Location:** Lines 726-780  
**Problem:** `grid-cols-12` layout with `col-span-6/3/3` distribution breaks on mobile. Progress section and action buttons stack poorly.
**Impact:** Action buttons (Link, Edit, Delete) become unreachable or too small  
**Solution:** Change to `grid-cols-1 md:grid-cols-12` with proper mobile stacking.

### C4. DailySync.tsx - Table Horizontal Overflow
**Location:** Lines 124-199  
**Problem:** Table has 6 columns with no horizontal scroll wrapper. On mobile, table extends beyond viewport.
**Impact:** Users cannot see "Actions" column, data unreadable  
**Solution:** Wrap table in `overflow-x-auto` container with visual scroll indicator.

### C5. Settings.tsx - Two-Column Layout Breaks
**Location:** Line 194  
**Problem:** `grid grid-cols-1 lg:grid-cols-2` means on tablets (768-1024px), single column layout forces very long scroll.
**Impact:** Poor tablet experience  
**Solution:** Use `md:grid-cols-2` for earlier breakpoint.

### C6. WeeklyCheckinModal.tsx - Modal Not Mobile Optimized
**Location:** Lines 148-407  
**Problem:** Modal uses `max-w-5xl max-h-[90vh]` but inner content has fixed `p-8` padding. On mobile, form controls are cramped.
**Impact:** Difficult to fill out weekly check-in form on mobile  
**Solution:** Responsive padding `p-4 md:p-8`, consider bottom sheet pattern for mobile.

### C7. ReportDetailDialog.tsx - Header Overflow
**Location:** Lines 68-137  
**Problem:** Header section has too many elements in flex row (user info, week, status, score, confidence, approve button, close). On tablets, these overflow.
**Impact:** Approve button may be pushed off-screen  
**Solution:** Stack header elements on mobile, use 2-row layout on tablet.

### C8. ProductBacklog.tsx - Stats Row Overflow
**Location:** Lines 216-238  
**Problem:** Stats section with 4 stat items in horizontal flex doesn't wrap. Text labels like "UPPERCASE TRACKING-WIDEST" truncate.
**Impact:** Stats unreadable on mobile  
**Solution:** Use `flex-wrap` and responsive gap, consider 2x2 grid on mobile.

### C9. TaskCard.tsx - Touch Targets Too Small
**Location:** Lines 119-157  
**Problem:** Action menu button is `w-10 h-10` (40px) which meets minimum, but the dropdown menu items are only `py-3` with no min-height.
**Impact:** Difficult to tap correct menu option  
**Solution:** Add `min-h-[44px]` to all interactive dropdown items.

### C10. TaskTableView.tsx - Table Without Responsive Alternative
**Location:** Lines 78-266  
**Problem:** Full table layout with 8 columns has no card-view alternative for mobile. Table becomes unusable below 768px.
**Impact:** Critical data inaccessible on mobile  
**Solution:** Implement card-based list view for mobile, toggle between table/card based on breakpoint.

### C11. PMDashboard.tsx - 6-Column Grid Breaks
**Location:** Line 264  
**Problem:** `grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6` creates awkward layouts on tablets where 3 cards per row leaves orphan cards.
**Impact:** Visual imbalance  
**Solution:** Use `grid-cols-2 md:grid-cols-3 xl:grid-cols-6` for better progression.

### C12. Header.tsx - Search Dropdown Overflow
**Location:** Lines 88-145  
**Problem:** Search results dropdown uses `rounded-[32px]` and `max-h-[500px]` but on mobile, it may extend beyond viewport.
**Impact:** Cannot see all search results, difficult to dismiss  
**Solution:** On mobile, make dropdown full-width with `max-h-[60vh]`, add close button.

---

## Medium Issues

### M1. OKRsManagement.tsx - Filter Dropdown Small Target
**Location:** Lines 241-256  
**Problem:** Filter dropdown `text-[10px]` with small hit area  
**Solution:** Increase tap target with padding `py-3`

### M2. OKRsManagement.tsx - Metric Card Text Size
**Location:** Lines 196-234  
**Problem:** `text-[10px]` labels too small on mobile  
**Solution:** Use `text-xs md:text-[10px]`

### M3. Sidebar.tsx - Width Inconsistency
**Location:** Line 16  
**Problem:** `w-64 lg:w-56 xl:w-72` - width shrinks at lg then expands at xl  
**Solution:** Use consistent progression `w-64 lg:w-72`

### M4. Sidebar.tsx - NavItem Touch Target
**Location:** Lines 116-134  
**Problem:** NavItem `py-3` may be insufficient for fat-finger taps  
**Solution:** Add `min-h-[48px]` for comfortable mobile tap

### M5. AppLayout.tsx - Main Content Padding
**Location:** Line 39  
**Problem:** `p-4 md:p-8` creates cramped mobile layout  
**Solution:** Consider `p-4 sm:p-6 md:p-8` for better progression

### M6. TaskModal.tsx - Two-Column Form on Mobile
**Location:** Line 139  
**Problem:** `grid grid-cols-2 gap-6` forces cramped inputs on mobile  
**Solution:** `grid-cols-1 md:grid-cols-2`

### M7. TaskDetailsModal.tsx - Modal Max Width
**Location:** Line 79  
**Problem:** `max-w-3xl` may be too wide for tablets  
**Solution:** Add `mx-4` margin for breathing room

### M8. DailyReportModal - Form Sections Cramped
**Location:** DailySync.tsx Lines 274-419  
**Problem:** `p-8` padding too large for mobile  
**Solution:** `p-4 md:p-8`

### M9. SaturdaySync.tsx - Stats Grid
**Location:** Line 107  
**Problem:** `grid-cols-1 md:grid-cols-4` jumps too aggressively  
**Solution:** `grid-cols-2 md:grid-cols-4`

### M10. LoginPage.tsx - Max Width Too Narrow
**Location:** Line 29  
**Problem:** `max-w-md` on large screens feels cramped  
**Solution:** Good for mobile but add `lg:max-w-lg` for larger screens

### M11. ReportTableView.tsx - Column Width Issues
**Location:** Lines 50-156  
**Problem:** No minimum column widths, text truncation unpredictable  
**Solution:** Add `min-w-[100px]` to data columns

### M12. BacklogTableView - Missing Responsive Alternative
**Location:** ProductBacklog.tsx Lines 550-686  
**Problem:** Same issue as TaskTableView  
**Solution:** Card-based mobile alternative

### M13. DeleteConfirmModal - Button Stack
**Location:** OKRsManagement.tsx Lines 891-906  
**Problem:** Side-by-side buttons may be cramped on very small screens  
**Solution:** `flex-col sm:flex-row` for vertical stack on mobile

### M14. EditKRModal - Form Layout
**Location:** OKRsManagement.tsx Lines 958-978  
**Problem:** `grid-cols-2` for Unit/Due Date fields cramped on mobile  
**Solution:** `grid-cols-1 sm:grid-cols-2`

### M15. AddObjectiveModal - Form Padding
**Location:** OKRsManagement.tsx Lines 1250-1302  
**Problem:** `p-8` inner padding too large for mobile  
**Solution:** `p-4 md:p-8`

### M16. WeeklyCheckinModal - Team Switcher
**Location:** Lines 167-179  
**Problem:** 4 team buttons in horizontal row overflow on small tablets  
**Solution:** Consider dropdown or 2x2 grid on smaller screens

### M17. WeeklyCheckinModal - Table Layout
**Location:** Lines 305-370  
**Problem:** Table for "Next Week Plans" has horizontal overflow  
**Solution:** Card-based mobile alternative

### M18. PMDashboard.tsx - Chart Container Height
**Location:** Lines 405-441  
**Problem:** Chart container has fixed `height={280}` which may be too small on wide tablets  
**Solution:** Use responsive height `h-[200px] md:h-[280px]`

---

## Polish Issues

### P1. OKRsManagement.tsx - Page Title Length
**Location:** Line 159  
**Problem:** "Kinetic Workshop OKRs" may wrap awkwardly  
**Solution:** Consider shorter mobile title or font-size reduction

### P2. All Pages - Breadcrumb Visibility
**Problem:** Breadcrumbs `text-sm` may be too small on mobile  
**Solution:** Consider hiding on mobile or enlarging

### P3. Sidebar.tsx - Logo Section Spacing
**Location:** Lines 17-19  
**Problem:** `mb-10` creates large gap on shorter screens  
**Solution:** `mb-6 lg:mb-10`

### P4. Header.tsx - Icon Button Spacing
**Location:** Line 148  
**Problem:** `gap-3 md:gap-4` could be tighter on mobile  
**Solution:** `gap-2 md:gap-4`

### P5. TaskCard.tsx - Progress Bar Height
**Location:** Line 209  
**Problem:** `h-2` progress bar thin for touch interaction  
**Solution:** `h-2 md:h-2` (keep but add visual indicator)

### P6. All Modals - Backdrop Blur Performance
**Problem:** `backdrop-blur-sm` may cause performance issues on older mobile devices  
**Solution:** Consider reducing blur or removing on mobile

### P7. DailySync.tsx - Empty State Layout
**Location:** Lines 190-196  
**Problem:** Empty state centered but padding inconsistent  
**Solution:** Add consistent vertical padding

### P8. Settings.tsx - Form Input Heights
**Location:** Throughout  
**Problem:** `py-2` inputs may feel cramped  
**Solution:** `py-2.5 md:py-2`

### P9. ProductBacklog.tsx - View Toggle Button Size
**Location:** Lines 189-204  
**Problem:** Icon + text buttons cramped on mobile  
**Solution:** Icon-only on mobile with tooltip

### P10. Linked Work Items - Max Width
**Location:** OKRsManagement.tsx Line 793  
**Problem:** `max-w-[150px]` truncates text aggressively  
**Solution:** `max-w-[120px] md:max-w-[150px]`

### P11. OKRsManagement.tsx - Expand/Collapse Icon Size
**Location:** Lines 362-366  
**Problem:** ChevronDown `size={20}` with `md:size-7` creates jump  
**Solution:** Smoother `size={18} md:size-24`

### P12. TaskDetailsModal - Title Line Height
**Location:** Line 101  
**Problem:** `text-3xl` title may need tighter line-height  
**Solution:** Add `leading-tight`

### P13. All Date Inputs - Mobile Picker
**Problem:** Native date inputs work but styling inconsistent  
**Solution:** Custom date picker component for consistency

### P14. ReportDetailDialog - Content Spacing
**Location:** Line 140  
**Problem:** `space-y-10` creates large gaps  
**Solution:** `space-y-6 md:space-y-10`

### P15. WeeklyCheckinModal - Section Headers
**Location:** Throughout  
**Problem:** `text-lg` section headers compete with form content  
**Solution:** `text-base md:text-lg`

---

## Priority Matrix

| Effort \ Impact | High Impact | Medium Impact | Low Impact |
|-----------------|-------------|---------------|------------|
| **Low Effort** | C1, C2, C3, M1, M2 | M5, M6, P1, P2 | P3, P4, P7 |
| **Medium Effort** | C4, C5, C6, C7, C12 | M3, M7, M8, M13, M14, M15 | P5, P8, P10, P11, P14 |
| **High Effort** | C8, C9, C10, C11 | M9, M10, M11, M12, M16, M17, M18 | P6, P9, P12, P13, P15 |

---

## Recommended Solutions Summary

### Immediate Actions (Low Effort, High Impact)

1. **Fix OKRsManagement Header**
```tsx
// Replace line 152-185
<div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
  {/* Title section - full width on mobile */}
  <div className="min-w-0">
    <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
      <span className="hover:text-primary cursor-pointer">Planning</span>
      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
      <span className="text-on-surface">OKRs</span>
    </nav>
    <h2 className="text-2xl md:text-4xl font-extrabold font-headline tracking-tight text-on-surface truncate">
      <span className="hidden sm:inline">Kinetic Workshop</span>
      <span className="sm:hidden">KW</span> OKRs
    </h2>
  </div>

  {/* Actions - stack on mobile */}
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
    <div className="flex p-1 bg-surface-container-high rounded-full border border-outline-variant/10 self-start">
      <button className={`px-3 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'L1' ? 'text-primary bg-white shadow-md' : 'text-slate-500 hover:text-primary'}`}>
        <span className="hidden sm:inline">Company (</span>L1<span className="hidden sm:inline">)</span>
      </button>
      <button className={`px-3 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'L2' ? 'text-primary bg-white shadow-md' : 'text-slate-500 hover:text-primary'}`}>
        <span className="hidden sm:inline">Team (</span>L2<span className="hidden sm:inline">)</span>
      </button>
    </div>
    <button className="flex items-center justify-center gap-2 bg-primary text-white px-4 sm:px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-95 transition-all min-h-[44px]">
      <span className="material-symbols-outlined text-[20px]">add</span>
      <span className="hidden sm:inline">New Objective</span>
      <span className="sm:hidden">New</span>
    </button>
  </div>
</div>
```

2. **Fix Truncation Issue**
```tsx
// Add min-w-0 to flex parents containing truncated text
<div className="flex-1 min-w-0">
  <h3 className="text-base md:text-lg font-black text-on-surface font-headline line-clamp-2 md:truncate">
    {objective.title}
  </h3>
</div>
```

3. **Add Table Scroll Wrapper**
```tsx
// Wrap all tables
<div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
  <div className="min-w-[800px]">
    <table>...</table>
  </div>
</div>
```

### Medium Term (Requires Design Review)

1. Implement mobile card view alternative for tables
2. Create mobile-optimized modal components (bottom sheet pattern)
3. Design responsive data dashboard with collapsible sections

### Long Term (Architecture)

1. Create responsive wrapper HOC for complex layouts
2. Implement breakpoint-aware component variants
3. Add device detection for touch-first interactions

---

## Unresolved Questions

1. Should tables switch to card view automatically or provide a toggle?
2. Is bottom sheet pattern acceptable for all modals on mobile?
3. Should breadcrumbs be hidden on mobile or converted to back button?
4. What is the minimum supported viewport width (320px or 375px)?
5. Should charts be simplified/hidden on mobile devices?

---

**Status:** DONE  
**Summary:** Comprehensive audit completed with 12 Critical, 18 Medium, 15 Polish issues identified. Immediate fixes available for highest-impact issues. Recommend starting with OKRsManagement.tsx fixes as user has already reported problems.
