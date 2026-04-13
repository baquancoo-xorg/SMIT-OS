# Backlog Grouped View - Layout Redesign Proposal

**Date:** 2026-04-14  
**Author:** UI/UX Designer  
**Component:** `BacklogItemRow` (src/pages/ProductBacklog.tsx:437-541)  

---

## Problem Statement

Current description field uses `max-w-[300px]` creating wasted horizontal space in the middle of the row. Layout is left-heavy while center area remains empty.

**Current layout analysis:**
- Left zone: ~40% (checkbox + title block + description cramped)
- Center zone: ~30% (EMPTY)
- Right zone: ~30% (priority + actions)

---

## Design System Context

```
Colors: primary (#0059b6), surface (#f7f5ff), on-surface (#222d51)
Typography: Inter (body), Manrope (headlines)
Radius: 1rem default, 2rem lg
Patterns: glass-panel (bg-white/70 backdrop-blur-xl)
```

---

## Proposal A: Three-Column Grid Layout

### Concept
Split row into 3 logical zones with description occupying center.

### ASCII Mockup
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ☐  [Epic] [3 SP] Fix authentication bug          │ User login fails when...    │ [High] │ 👁 ✏️ 🗑 │
│                  👤 John · 📅 Apr 15              │ session token expires...    │        │        │
└─────────────────────────────────────────────────────────────────────────────────┘

├────────── LEFT (35%) ───────────┤──── CENTER (35%) ────┤── RIGHT (30%) ──┤
   Title + Meta                      Description            Priority + Actions
```

### Code Structure
```tsx
<div className="grid grid-cols-[1fr_1fr_auto] gap-4 p-4 items-center">
  {/* Left: Checkbox + Title + Meta */}
  <div className="flex items-center gap-3 min-w-0">
    <checkbox />
    <div>
      <div>{type} {sp} {title}</div>
      <div>{assignee} {dueDate}</div>
    </div>
  </div>
  
  {/* Center: Description */}
  <p className="text-xs text-slate-400 line-clamp-2">{description}</p>
  
  {/* Right: Priority + Actions */}
  <div className="flex items-center gap-3">
    <span>{priority}</span>
    <div>{actions}</div>
  </div>
</div>
```

### Pros
- Clear visual separation
- Description gets dedicated space
- Consistent column alignment across rows
- Good for scanning long lists

### Cons
- Rigid structure may waste space on short descriptions
- Mobile collapse requires significant rework
- Title truncation on narrow viewports

### UX Rationale
Grid layout follows the natural F-pattern reading: users scan left (identify task), glance center (context), check right (status/actions). Aligns with Jira, Linear, and Asana patterns.

---

## Proposal B: Inline Description with Flex Growth

### Concept
Keep single-row flex layout but allow description to fill available space between title and priority.

### ASCII Mockup
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ☐  [Epic] [3 SP] Fix auth bug  │  User login fails when session token...  │ [High] │ 👁 ✏️ 🗑 │
│                👤 John · 📅 Apr 15                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘

├── FIXED ──┤├──────────── FLEX-1 (fills remaining) ───────────────┤├── FIXED ──┤
```

### Code Structure
```tsx
<div className="p-4">
  {/* Row 1: Main content */}
  <div className="flex items-center gap-4">
    <checkbox />
    <div className="shrink-0 max-w-[200px]">
      <div>{type} {sp} {title}</div>
    </div>
    <p className="flex-1 text-xs text-slate-400 truncate px-4">
      {description}
    </p>
    <span className="shrink-0">{priority}</span>
    <div className="shrink-0">{actions}</div>
  </div>
  
  {/* Row 2: Meta info */}
  <div className="ml-9 mt-1 flex gap-4 text-[10px] text-slate-400">
    {assignee} {dueDate}
  </div>
</div>
```

### Pros
- Minimal code change from current
- Description naturally expands/contracts
- Single-line compact view
- Mobile: simply stack elements

### Cons
- Title width capped at 200px (may truncate long titles)
- Less visual hierarchy
- Description competes with title for attention

### UX Rationale
Follows the "information density" principle - power users can scan more items quickly. Similar to GitHub Issues compact view.

---

## Proposal C: Two-Row Card with Full-Width Description (RECOMMENDED)

### Concept
Separate primary info (top row) from secondary info (bottom row). Description spans full width below.

### ASCII Mockup
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ ☐  [Epic] [3 SP] Fix authentication bug                           [High] 👁 ✏️ 🗑 │
│ ─────────────────────────────────────────────────────────────────────────────── │
│    User login fails when session token expires after 24 hours. Need to         │
│    implement refresh token mechanism.                                           │
│    👤 John Doe · 📅 Due: Apr 15, 2026                                           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Code Structure
```tsx
<motion.div className="p-4 hover:bg-surface-container-low/30 transition-all group">
  {/* Row 1: Primary info */}
  <div className="flex items-center gap-3">
    <checkbox />
    <span>{type}</span>
    <span>{storyPoints}</span>
    <h4 className="flex-1 font-bold truncate">{title}</h4>
    <span className="shrink-0">{priority}</span>
    <div className="shrink-0 flex gap-1">{actions}</div>
  </div>
  
  {/* Row 2: Description (full width) */}
  {description && (
    <p className="mt-2 ml-7 text-xs text-slate-500 line-clamp-2">
      {description}
    </p>
  )}
  
  {/* Row 3: Meta */}
  <div className="mt-2 ml-7 flex gap-4 text-[10px] text-slate-400">
    {assignee && <span>👤 {assignee}</span>}
    {dueDate && <span>📅 {dueDate}</span>}
  </div>
</motion.div>
```

### Pros
- Description gets FULL row width (no truncation at 300px)
- Clear visual hierarchy: Title > Description > Meta
- Maintains scannable top row for quick browsing
- Easy mobile adaptation
- Graceful degradation: no description = compact row

### Cons
- Slightly taller rows (more vertical space)
- May feel less "dense" for power users
- Requires adjusting group expand/collapse logic

### UX Rationale
This follows the "progressive disclosure" principle. Primary action (identify task) is row 1. Secondary context (understand task) is row 2. Matches Notion database cards, Todoist expanded view, and ClickUp list items.

---

## Comparison Matrix

| Criteria | Proposal A | Proposal B | Proposal C |
|----------|-----------|-----------|-----------|
| Description visibility | ★★★☆☆ | ★★★☆☆ | ★★★★★ |
| Space efficiency | ★★★☆☆ | ★★★★☆ | ★★★☆☆ |
| Code simplicity | ★★★☆☆ | ★★★★★ | ★★★★☆ |
| Mobile friendly | ★★☆☆☆ | ★★★★☆ | ★★★★★ |
| Visual hierarchy | ★★★★☆ | ★★☆☆☆ | ★★★★★ |
| Consistency w/ system | ★★★☆☆ | ★★★★☆ | ★★★★★ |

---

## Recommendation

**Proposal C (Two-Row Card)** is recommended because:

1. **Solves core problem**: Description gets full width, no artificial constraints
2. **Maintains scannability**: Top row serves as "at-a-glance" summary
3. **Flexible**: Works well with or without description
4. **Responsive**: Stacks naturally on mobile
5. **Consistent**: Aligns with existing card patterns in SMIT-OS (glass-panel, rounded corners)

### Implementation Notes

- Use `line-clamp-2` for description to maintain row height consistency
- Add hover effect to expand description on demand (optional enhancement)
- Consider adding a "compact mode" toggle for power users who prefer density

---

## Optional Enhancement: Expand/Collapse Description

For long descriptions, add hover-to-expand:

```tsx
const [expanded, setExpanded] = useState(false);

<p 
  className={`mt-2 ml-7 text-xs text-slate-500 cursor-pointer ${expanded ? '' : 'line-clamp-2'}`}
  onClick={() => setExpanded(!expanded)}
>
  {description}
</p>
```

---

## Unresolved Questions

1. Should compact mode be user preference or screen-size based?
2. Do we need keyboard navigation support for expand/collapse?
3. Should description be editable inline or require modal?

---

**Status:** DONE  
**Summary:** Proposed 3 layout options for BacklogItemRow. Recommended Proposal C (Two-Row Card) for best balance of description visibility and scannability.
