# Phase 01 — Merge Epic Tabs into Team Backlog

**Priority:** P2
**Status:** pending
**Effort:** ~1.5h

## Context Links

- `src/pages/EpicBoard.tsx` (201 lines)
- `src/pages/EpicGraph.tsx` (256 lines)
- `src/pages/ProductBacklog.tsx` (697 lines)
- `src/App.tsx` (75 lines)
- `src/components/layout/Sidebar.tsx` (183 lines)

## Overview

Add a `hideHeader?: boolean` prop to EpicBoard and EpicGraph so they can be embedded without their own page headers. Extend ProductBacklog's view state from `'board' | 'table'` to `'grouped' | 'table' | 'epic-board' | 'epic-graph'`, wire up the new tabs, conditionally suppress Stats/Filters/New-Item for epic tabs, and clean up the now-dead routes in App.tsx and Sidebar.tsx.

## Key Insights

- Current `'board'` value in ProductBacklog means "Grouped view" — rename to `'grouped'` to avoid collision with EpicBoard's own internal board concept.
- EpicBoard and EpicGraph each render their own full-page header (breadcrumb + title). The `hideHeader` prop gates that block; no other behavior changes.
- Stats & Filters section and New Item button in ProductBacklog are only meaningful for the backlog data tabs — suppress for epic tabs.
- EpicBoard has its own "New Epic" button internally; no button duplication needed.
- Removing `'epics' | 'epic-graph'` from ViewType in App.tsx will produce TypeScript errors on the two conditional renders and the Sidebar — fix all callsites in the same pass.

## Architecture

```
ProductBacklog
  ViewToggle: [Grouped | Table | Board | Graph]
    ├── 'grouped'    → <GroupedView> (existing)
    ├── 'table'      → <BacklogTableView> (existing)
    ├── 'epic-board' → <EpicBoard hideHeader />
    └── 'epic-graph' → <EpicGraph hideHeader />
```

Data flows for epic tabs are entirely self-contained inside EpicBoard/EpicGraph (they fetch `/api/work-items` independently). ProductBacklog does not pass data into them.

## Related Code Files

| File | Change |
|------|--------|
| `src/pages/EpicBoard.tsx` | Add `hideHeader?: boolean` prop; wrap header block in `{!hideHeader && ...}` |
| `src/pages/EpicGraph.tsx` | Same pattern as EpicBoard |
| `src/pages/ProductBacklog.tsx` | Rename view state, extend type, update ViewToggle options, gate Stats/Filters/New Item, add two conditional renders |
| `src/App.tsx` | Remove `'epics' \| 'epic-graph'` from ViewType; remove EpicBoard/EpicGraph imports and conditional renders |
| `src/components/layout/Sidebar.tsx` | Remove NavItem for Epic Board and Epic Graph |

## Implementation Steps

### Step 1 — EpicBoard.tsx: add `hideHeader` prop

1. Change component signature from `export default function EpicBoard()` to `export default function EpicBoard({ hideHeader = false }: { hideHeader?: boolean })`.
2. Locate the page header block (breadcrumb nav + `<h2>` title). Wrap the entire block: `{!hideHeader && ( ... )}`.
3. No other changes.

### Step 2 — EpicGraph.tsx: add `hideHeader` prop

Identical pattern to Step 1 applied to EpicGraph.

### Step 3 — ProductBacklog.tsx: extend view state

1. Change state type and initial value:
   ```tsx
   // before
   const [view, setView] = useState<'board' | 'table'>('board');
   // after
   const [view, setView] = useState<'grouped' | 'table' | 'epic-board' | 'epic-graph'>('grouped');
   ```

2. Add imports at top:
   ```tsx
   import EpicBoard from './EpicBoard';
   import EpicGraph from './EpicGraph';
   ```

3. Update ViewToggle `onChange` cast and `options`:
   ```tsx
   <ViewToggle
     value={view}
     onChange={(v) => setView(v as 'grouped' | 'table' | 'epic-board' | 'epic-graph')}
     options={[
       { value: 'grouped',    label: 'Grouped', icon: <span className="material-symbols-outlined text-[14px]">account_tree</span> },
       { value: 'table',      label: 'Table',   icon: <span className="material-symbols-outlined text-[14px]">table_rows</span> },
       { value: 'epic-board', label: 'Board',   icon: <span className="material-symbols-outlined text-[14px]">flag</span> },
       { value: 'epic-graph', label: 'Graph',   icon: <span className="material-symbols-outlined text-[14px]">share</span> },
     ]}
   />
   ```

4. Gate New Item button — only render for grouped/table:
   ```tsx
   {(view === 'grouped' || view === 'table') && (
     <PrimaryActionButton onClick={...}>New Item</PrimaryActionButton>
   )}
   ```

5. Gate Stats & Filters section:
   ```tsx
   {(view === 'grouped' || view === 'table') && (
     <div className="flex flex-col lg:flex-row gap-4">...</div>
   )}
   ```

6. Gate Bulk Actions bar (already gated by `selectedIds.size > 0`, but epic tabs can never select items — no change needed; safe as-is).

7. Replace content conditional block:
   ```tsx
   {/* Content */}
   {view === 'table' && (
     <div className="flex-1 overflow-y-auto pb-8">
       <BacklogTableView ... />
     </div>
   )}
   {view === 'grouped' && (
     <div className="flex-1 overflow-y-auto pb-8 space-y-6 custom-scrollbar">
       {/* existing grouped render */}
     </div>
   )}
   {view === 'epic-board' && <EpicBoard hideHeader />}
   {view === 'epic-graph' && <EpicGraph hideHeader />}
   ```
   Remove the old `view === 'table' ? ... : ...` ternary and replace with the four explicit conditionals above.

### Step 4 — App.tsx: remove dead routes

1. Remove `'epics' | 'epic-graph'` from the `ViewType` union (line 27).
2. Remove `import EpicBoard` and `import EpicGraph`.
3. Remove the two conditional renders:
   ```tsx
   // delete these two lines
   {currentView === 'epics' && <EpicBoard key="epics" />}
   {currentView === 'epic-graph' && <EpicGraph key="epic-graph" />}
   ```
4. Remove `'epics'` and `'epic-graph'` from `SCROLLABLE_VIEWS` if present (currently not there — verify).

### Step 5 — Sidebar.tsx: remove NavItems

Delete the two NavItem blocks:
```tsx
// delete
<NavItem
  icon="flag"
  label="Epic Board"
  active={currentView === 'epics'}
  onClick={() => onViewChange('epics')}
/>
<NavItem
  icon="account_tree"
  label="Epic Graph"
  active={currentView === 'epic-graph'}
  onClick={() => onViewChange('epic-graph')}
/>
```

## Todo List

- [ ] Step 1: EpicBoard — add `hideHeader` prop, wrap header block
- [ ] Step 2: EpicGraph — add `hideHeader` prop, wrap header block
- [ ] Step 3a: ProductBacklog — update view state type + initial value
- [ ] Step 3b: ProductBacklog — add EpicBoard/EpicGraph imports
- [ ] Step 3c: ProductBacklog — update ViewToggle options
- [ ] Step 3d: ProductBacklog — gate New Item button
- [ ] Step 3e: ProductBacklog — gate Stats & Filters section
- [ ] Step 3f: ProductBacklog — replace ternary content block with four conditionals
- [ ] Step 4: App.tsx — remove ViewType entries, imports, renders
- [ ] Step 5: Sidebar.tsx — remove two NavItems
- [ ] Compile check: `npx tsc --noEmit`
- [ ] Manual smoke test: all 4 tabs render, Grouped/Table retain full functionality

## Success Criteria

- `npx tsc --noEmit` passes with zero errors
- Team Backlog page renders 4 tabs; switching tabs works
- Stats/Filters row and New Item button absent on Board and Graph tabs
- Sidebar Planning section shows: OKRs, Team Backlog, Sprint Board (no Epic Board / Epic Graph)
- Existing Grouped and Table tab behavior unchanged

## Failure Modes & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `hideHeader` prop missing from EpicGraph (different header structure) | Low | Low | Read EpicGraph header block before wrapping — structure may differ from EpicBoard |
| ViewToggle component rejects values it doesn't know | Low | Medium | ViewToggle takes generic `string` value — no restriction; confirmed from existing usage |
| EpicBoard/EpicGraph internal scroll conflicts with ProductBacklog container | Medium | Medium | Epic tabs should fill remaining height; test overflow behavior, adjust wrapper div if needed |
| TypeScript errors from stale `'epics'\|'epic-graph'` references beyond the 5 files | Low | Low | Run `tsc --noEmit` after Step 5 to catch any missed callsites |

## Rollback Plan

All changes are in 5 files, no DB/API changes. Revert via git:
```bash
git restore src/pages/EpicBoard.tsx src/pages/EpicGraph.tsx src/pages/ProductBacklog.tsx src/App.tsx src/components/layout/Sidebar.tsx
```
