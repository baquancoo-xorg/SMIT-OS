# Phase 4: Layout & Components

## Overview

Fix layout issues in Settings, Dashboard, Header and improve touch targets.

**Priority:** Critical  
**Effort:** 1.5h  
**Files:**
- `src/pages/Settings.tsx`
- `src/pages/ProductBacklog.tsx`
- `src/pages/PMDashboard.tsx`
- `src/components/board/TaskCard.tsx`
- `src/components/layout/Header.tsx`

## Issues

| ID | Problem | File | Impact |
|----|---------|------|--------|
| C5 | Two-column breaks at lg | Settings.tsx | Long scroll on tablets |
| C8 | Stats row overflow | ProductBacklog.tsx | Stats unreadable |
| C9 | Touch targets < 44px | TaskCard.tsx | Hard to tap menu items |
| C11 | 6-col grid orphan cards | PMDashboard.tsx | Visual imbalance |
| C12 | Search dropdown overflow | Header.tsx | Can't see all results |

## Implementation

### C5: Settings Two-Column Breakpoint

**Location:** Line 194

```tsx
// Change lg to md for earlier breakpoint
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* settings sections */}
</div>
```

### C8: ProductBacklog Stats Row

**Location:** Lines 216-238

```tsx
// Current: horizontal flex no wrap
// Fix: grid with 2x2 on mobile
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
  <div className="bg-white p-4 rounded-2xl border border-outline-variant/10">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Items</p>
    <p className="text-2xl font-black text-on-surface">{totalItems}</p>
  </div>
  <div className="bg-white p-4 rounded-2xl border border-outline-variant/10">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In Progress</p>
    <p className="text-2xl font-black text-primary">{inProgress}</p>
  </div>
  <div className="bg-white p-4 rounded-2xl border border-outline-variant/10">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed</p>
    <p className="text-2xl font-black text-tertiary">{completed}</p>
  </div>
  <div className="bg-white p-4 rounded-2xl border border-outline-variant/10">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Blocked</p>
    <p className="text-2xl font-black text-error">{blocked}</p>
  </div>
</div>
```

### C9: TaskCard Touch Targets

**Location:** Lines 119-157

```tsx
// Dropdown menu items need min-height
<div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-outline-variant/10 py-2 min-w-[160px] z-50">
  <button className="w-full text-left px-4 py-3 min-h-[48px] text-sm hover:bg-slate-50 flex items-center gap-3 transition-colors">
    <span className="material-symbols-outlined text-[18px]">edit</span>
    Edit
  </button>
  <button className="w-full text-left px-4 py-3 min-h-[48px] text-sm hover:bg-slate-50 flex items-center gap-3 transition-colors">
    <span className="material-symbols-outlined text-[18px]">content_copy</span>
    Duplicate
  </button>
  <button className="w-full text-left px-4 py-3 min-h-[48px] text-sm text-error hover:bg-error/5 flex items-center gap-3 transition-colors">
    <span className="material-symbols-outlined text-[18px]">delete</span>
    Delete
  </button>
</div>
```

### C11: PMDashboard Grid Progression

**Location:** Line 264

```tsx
// Smoother grid progression
<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
  {/* metric cards */}
</div>
```

### C12: Header Search Dropdown

**Location:** Lines 88-145

```tsx
// Mobile-optimized search dropdown
{searchQuery && (
  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl md:rounded-[32px] shadow-xl border border-outline-variant/10 max-h-[60vh] md:max-h-[500px] overflow-y-auto z-50">
    {/* Add close button for mobile */}
    <div className="sticky top-0 bg-white px-4 py-3 border-b border-outline-variant/10 flex items-center justify-between md:hidden">
      <span className="text-xs font-bold text-slate-500">Search Results</span>
      <button 
        onClick={() => setSearchQuery('')}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
    
    {/* Results list */}
    <div className="p-2">
      {searchResults.map(result => (
        <button
          key={result.id}
          className="w-full text-left p-3 md:p-4 rounded-xl md:rounded-2xl hover:bg-slate-50 transition-colors min-h-[48px]"
          onClick={() => handleResultClick(result)}
        >
          <p className="text-sm font-medium text-on-surface line-clamp-1">{result.title}</p>
          <p className="text-xs text-on-surface-variant mt-1">{result.type}</p>
        </button>
      ))}
    </div>
    
    {searchResults.length === 0 && (
      <div className="p-6 text-center text-sm text-slate-400">
        No results found
      </div>
    )}
  </div>
)}
```

## Todo

- [ ] Fix Settings grid breakpoint (C5)
- [ ] Convert ProductBacklog stats to 2x2 grid (C8)
- [ ] Add min-h to TaskCard dropdown items (C9)
- [ ] Fix PMDashboard grid progression (C11)
- [ ] Optimize Header search dropdown (C12)
- [ ] Test all changes at 375px and 768px

## Success Criteria

- [ ] Settings shows 2-col at tablet (768px+)
- [ ] Stats readable as 2x2 grid on mobile
- [ ] All dropdown items ≥ 48px height
- [ ] Dashboard cards balance evenly
- [ ] Search dropdown dismissable on mobile
