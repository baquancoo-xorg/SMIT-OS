# Phase 1: OKRsManagement Critical Fixes

## Overview

Fix 3 critical issues in OKRsManagement.tsx affecting mobile usability.

**Priority:** Critical  
**Effort:** 1h  
**File:** `src/pages/OKRsManagement.tsx`

## Issues

| ID | Problem | Lines | Impact |
|----|---------|-------|--------|
| C1 | Header overflow - tabs + button clash | 152-185 | Users can't see tab labels |
| C2 | Text truncation - titles disappear | 350-351 | User-reported issue |
| C3 | KeyResultRow grid breaks | 726-780 | Action buttons unreachable |

## Implementation

### C1: Header Responsive Layout

**Current:** Fixed `px-6` padding, no stacking
```tsx
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
```

**Fix:** Stack on mobile, responsive padding, shortened labels

```tsx
// Lines 152-185 - Replace entire header section
<div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
  {/* Title - full width on mobile */}
  <div className="min-w-0">
    <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
      <span className="hover:text-primary cursor-pointer">Planning</span>
      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
      <span className="text-on-surface">OKRs</span>
    </nav>
    <h2 className="text-2xl md:text-4xl font-extrabold font-headline tracking-tight text-on-surface">
      <span className="hidden sm:inline">Kinetic Workshop</span>
      <span className="sm:hidden">KW</span> OKRs
    </h2>
  </div>

  {/* Actions - stack on mobile */}
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
    <div className="flex p-1 bg-surface-container-high rounded-full border border-outline-variant/10 self-start">
      <button
        className={`px-3 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'L1' ? 'text-primary bg-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
        onClick={() => setActiveTab('L1')}
      >
        <span className="hidden sm:inline">Company (</span>L1<span className="hidden sm:inline">)</span>
      </button>
      <button
        className={`px-3 sm:px-6 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'L2' ? 'text-primary bg-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
        onClick={() => setActiveTab('L2')}
      >
        <span className="hidden sm:inline">Team (</span>L2<span className="hidden sm:inline">)</span>
      </button>
    </div>
    <button
      onClick={() => setIsAddObjModalOpen(true)}
      className="flex items-center justify-center gap-2 bg-primary text-white px-4 sm:px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-95 transition-all min-h-[44px]"
    >
      <span className="material-symbols-outlined text-[20px]">add</span>
      <span className="hidden sm:inline">New Objective</span>
      <span className="sm:hidden">New</span>
    </button>
  </div>
</div>
```

### C2: Text Truncation Fix

**Problem:** `truncate` cuts text completely when flex parent has no min-width

**Fix locations:**
- Line 350-351 (ObjectiveAccordionCard)
- Line 475 (ChildObjectiveCard)  
- Line 642 (ObjectiveAccordionCardL2)

```tsx
// Pattern to apply at all 3 locations
<div className="flex-1 min-w-0">
  <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
    {/* badges */}
  </div>
  <h3 className="text-base md:text-lg lg:text-xl font-black text-on-surface font-headline line-clamp-2 md:line-clamp-1">
    {objective.title}
  </h3>
</div>
```

**Changes:**
1. Add `min-w-0` to flex parent
2. Replace `truncate` with `line-clamp-2 md:line-clamp-1`
3. This allows 2 lines on mobile, 1 line (truncate) on desktop

### C3: KeyResultRow Grid Fix

**Current:** `grid-cols-12` always, action buttons cramped on mobile

```tsx
// Lines 726-780 - Fix grid layout
<div className="flex flex-col gap-3 md:gap-4 p-4 md:p-6 rounded-2xl md:rounded-[32px] hover:bg-slate-50/50 transition-all duration-500 group border border-transparent hover:border-outline-variant/10">
  {/* Mobile: stack everything */}
  <div className="flex flex-col gap-4 md:grid md:grid-cols-12 md:items-center md:gap-6">
    
    {/* Title section - full width on mobile */}
    <div className="md:col-span-6">
      <div className="flex items-start gap-2 md:gap-3">
        <span className="flex-shrink-0 flex items-center justify-center px-2 py-1 min-w-[28px] md:min-w-[32px] h-7 md:h-8 rounded-lg md:rounded-xl bg-secondary/10 text-secondary text-[10px] md:text-xs font-black shadow-sm border border-secondary/20">
          KR{index + 1}
        </span>
        <p className="text-xs md:text-sm font-black text-on-surface group-hover:text-primary transition-colors line-clamp-2 md:line-clamp-1">
          {krData.title}
        </p>
      </div>
      {/* Owner & Due date row */}
      <div className="flex items-center gap-3 md:gap-4 mt-2 ml-0 md:ml-11 flex-wrap">
        {/* ... existing content ... */}
      </div>
    </div>
    
    {/* Progress section */}
    <div className="md:col-span-3">
      {/* ... existing progress bar ... */}
    </div>
    
    {/* Actions - horizontal on mobile, end-aligned on desktop */}
    <div className="flex items-center gap-2 md:col-span-3 md:justify-end">
      <button className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
        <LinkIcon size={18} />
      </button>
      <button className="min-h-[44px] px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest">
        Edit
      </button>
      <button className="min-h-[44px] min-w-[44px] flex items-center justify-center text-error/60 hover:text-error hover:bg-error/5 rounded-xl transition-all">
        <Trash2 size={18} />
      </button>
    </div>
  </div>
  
  {/* Linked items & notes - unchanged */}
</div>
```

## Todo

- [ ] Update header layout (C1)
- [ ] Fix text truncation in ObjectiveAccordionCard (C2)
- [ ] Fix text truncation in ChildObjectiveCard (C2)
- [ ] Fix text truncation in ObjectiveAccordionCardL2 (C2)
- [ ] Refactor KeyResultRow grid (C3)
- [ ] Test at 375px viewport
- [ ] Test at 768px viewport
- [ ] Verify desktop unchanged

## Testing

```bash
# Start dev server
npm run dev

# Test viewports in browser DevTools:
# - 375px (iPhone SE)
# - 414px (iPhone 12)
# - 768px (iPad Mini)
# - 1024px (iPad Pro)
```

## Success Criteria

- [ ] Header stacks vertically on < 640px
- [ ] Tab buttons show "L1/L2" only on mobile
- [ ] Objective titles show 2 lines on mobile
- [ ] KR action buttons always reachable
- [ ] Touch targets ≥ 44px
