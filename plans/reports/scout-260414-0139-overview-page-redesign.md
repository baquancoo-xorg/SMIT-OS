# Scout Report: Overview Page Redesign

**Date:** 2026-04-14
**Agent:** scout
**Task:** Understanding Overview (PMDashboard) page redesign needs

---

## Current Overview Structure

### Location
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/PMDashboard.tsx` (~500 lines)
- Accessed via `dashboard` view type in App.tsx
- Sidebar shows it as "Overview" (Sidebar.tsx line 30-35)

### Current Layout Sections

1. **Header**
   - Breadcrumb: `Overview > Dashboard`
   - Title: "Project Management Control Panel"
   - Last updated timestamp

2. **Top Metrics (4-card grid)**
   - Company OKRs Progress (L1 objectives avg %)
   - Active Blockers (Urgent items in Todo/In Progress)
   - Flow Efficiency (Done / Total items %)
   - Bottleneck Alert (items stuck in Review)

3. **Charts Section (60/40 split)**
   - Department OKRs Health (Bar chart - L2 objectives by dept)
   - Workload Distribution (Pie chart - status breakdown)

4. **Mission Control (2-column)**
   - Needs PM Attention (urgent items, max 5)
   - Critical OKR Path (L1/L2 with progress < 30%)

### Current Issues Identified
- Page is PM-focused, not general Overview
- Heavy on OKR/Project metrics; may not suit all user roles
- No quick links to workspaces
- No recent activity feed
- Missing: personal task summary, announcements, sprint progress

---

## Available Data from Database

### Schema Models (prisma/schema.prisma)

| Model | Key Fields | Useful for |
|-------|-----------|------------|
| **User** | fullName, department, role, scope, avatar | Profile cards, team views |
| **Objective** | title, department, progressPercentage, level, parentId | OKR summaries |
| **KeyResult** | title, currentValue, targetValue, progressPercentage | KR metrics |
| **WorkItem** | title, status, priority, type, assigneeId, sprintId | Task counts, boards |
| **Sprint** | name, startDate, endDate | Sprint progress |
| **WeeklyReport** | progress, blockers, score, status | Report stats |
| **DailyReport** | tasksData, blockers, status | Daily activity |

### API Endpoints Used
- `/api/work-items` - All work items
- `/api/objectives` - All objectives
- `/api/users` - All users

---

## Project Design Language

### Color System (src/index.css)
```css
--color-primary: #0059b6     /* Blue */
--color-secondary: #a03a0f   /* Coral/Orange */
--color-tertiary: #006b1f    /* Green */
--color-error: #b31b25       /* Red */
--color-surface: #f7f5ff     /* Light purple bg */
--color-on-surface: #222d51  /* Dark text */
--color-on-surface-variant: #505a81
```

### Typography
- Headline font: `Manrope` (extrabold, black weights)
- Body font: `Inter` (medium, semibold)
- Uppercase tracking-widest for labels/badges

### Component Patterns

**Card Style:**
- `rounded-2xl md:rounded-3xl lg:rounded-[40px]`
- `bg-white border border-outline-variant/10 shadow-sm`
- `p-5 md:p-6 lg:p-8` (responsive padding)

**Metric Labels:**
- `text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest`

**Metric Values:**
- `text-lg md:text-xl lg:text-2xl font-black font-headline`

**Progress Bars:**
- `h-2 bg-slate-100 rounded-full overflow-hidden`
- Inner: `bg-primary transition-all duration-1000`

**Buttons:**
- Primary: `bg-primary text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-primary/20`
- Toggle: `flex p-1 bg-surface-container-high rounded-full border`

**Page Layout:**
- `p-6 md:p-10 space-y-10 w-full`
- Breadcrumb nav pattern used consistently

---

## Consistency Patterns from Other Pages

### OKRsManagement.tsx
- Same header style with breadcrumb
- 4-metric grid at top
- Tab toggle for views
- Accordion cards with expandable content

### TechBoard.tsx
- Board/Table view toggle
- Sprint filter bar
- Column status indicators
- `rounded-[32px]` for main containers

### ProductBacklog.tsx
- Search + filter bar pattern
- Grouped view with type icons
- Table view with selection

### SaturdaySync.tsx
- 4-column metric cards
- Table view for reports
- Modal patterns

---

## Recommendations for Consistency

1. **Keep the header pattern** - breadcrumb + title + action button
2. **4-card metric grid** - proven pattern across pages
3. **Use rounded-[32px] or rounded-[40px]** for major containers
4. **Keep color semantic meanings:**
   - Primary (blue) - progress, active
   - Tertiary (green) - success, done
   - Error (red) - blockers, urgent
   - Secondary (orange) - warnings
5. **Font sizes follow responsive pattern** - use `md:` and `lg:` breakpoints
6. **Charts library:** recharts (already in use)

---

## Files Relevant for Redesign

| Path | Purpose |
|------|---------|
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/PMDashboard.tsx` | Main file to modify |
| `/Users/dominium/Documents/Project/SMIT-OS/src/index.css` | Theme/colors reference |
| `/Users/dominium/Documents/Project/SMIT-OS/prisma/schema.prisma` | Data models |
| `/Users/dominium/Documents/Project/SMIT-OS/src/types/index.ts` | TypeScript types |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/Sidebar.tsx` | Navigation context |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/OKRsManagement.tsx` | Style reference |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/TechBoard.tsx` | Board patterns |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/ProductBacklog.tsx` | List patterns |

---

## Unresolved Questions

1. Who is the target audience for Overview? (PM only? All users?)
2. Should Overview show role-specific content?
3. What actions should be available from Overview?
4. Is there a need for announcements/notifications section?
5. Should Overview include quick navigation cards to workspaces?

---

**Status:** DONE
**Summary:** Comprehensive analysis of PMDashboard structure, design system, and database schema completed. Ready for redesign planning.
