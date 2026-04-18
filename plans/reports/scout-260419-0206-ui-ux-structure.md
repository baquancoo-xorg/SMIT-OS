# Scout Report: SMIT-OS UI/UX Structure

## Component Organization

### Layout Components (3)
- `/src/components/layout/AppLayout.tsx` - Main app wrapper with sidebar + content area
- `/src/components/layout/Sidebar.tsx` - Navigation sidebar (w=64/72 on xl)
- `/src/components/layout/Header.tsx` - Fixed header with search + widgets

### Page Components (12)
- `/src/pages/TechBoard.tsx`, `MarketingBoard.tsx`, `MediaBoard.tsx`, `SaleBoard.tsx` - Kanban boards
- `/src/pages/DashboardOverview.tsx`, `PMDashboard.tsx` - Analytics views
- `/src/pages/OKRsManagement.tsx`, `ProductBacklog.tsx` - Planning
- `/src/pages/DailySync.tsx`, `SaturdaySync.tsx` - Rituals
- `/src/pages/Settings.tsx`, `Profile.tsx`, `LoginPage.tsx` - User mgmt

### Board Components (7)
- `/src/components/board/TaskCard.tsx` - Main card UI
- `/src/components/board/DraggableTaskCard.tsx` - DnD wrapper
- `/src/components/board/TaskModal.tsx`, `TaskDetailsModal.tsx` - Modals
- `/src/components/board/TaskTableView.tsx`, `ReportTableView.tsx` - Table views
- `/src/components/board/droppable-column.tsx` - DnD column

### UI Components (8)
- `/src/components/ui/Button.tsx` - Reusable button with variants (sm/md/lg)
- `/src/components/ui/PrimaryActionButton.tsx`, `ViewToggle.tsx` - Action buttons
- `/src/components/ui/CustomSelect.tsx`, `CustomFilter.tsx`, `CustomDatePicker.tsx` - Form controls
- `/src/components/ui/Skeleton.tsx`, `ErrorBoundary.tsx` - State handlers

## Responsive Design Approach

### Breakpoints Used
- **xl (1280px):** Primary desktop breakpoint for sidebar visibility
- **lg (1024px):** Board layouts, stat bars
- **md (768px):** Padding adjustments, header widgets visibility
- **sm (640px):** Minor padding/spacing tweaks

### Patterns
- Mobile-first with progressive enhancement
- Sidebar: Fixed off-canvas on <xl, static on xl+
- Header widgets hidden on mobile (`hidden md:flex`)
- Padding scales: `p-4 sm:p-5 md:p-6 lg:p-8 xl:px-10`
- Board layout: Stacked on mobile, side-by-side on lg+ (`flex-col lg:flex-row`)

## Tailwind Configuration

### Setup
- Uses **Tailwind CSS 4.x** via `@import "tailwindcss"` (no separate config file)
- CSS variables defined in `@theme {}` block in `/src/index.css`

### Custom Theme
**Colors (Material Design 3 inspired):**
- primary: #0059B6, secondary: #A03A0F, tertiary: #006B1F
- Surface/container hierarchy with 5 levels
- Semantic: error (#B31B25), outline (#4A5580)

**Typography:**
- `font-sans`: Inter
- `font-headline`: Manrope

**Radius Tokens:**
- `--radius-action: 9999px` (capsule - buttons/badges)
- `--radius-container: 3rem` (48px - cards/modals)
- Default: 1rem, lg: 2rem, xl: 3rem

## Inconsistencies Found

### Spacing
- Padding varies inconsistently: `p-4`, `p-5`, `p-6`, `px-4`, `py-6`, `p-10`
- Card padding: `p-6` in TaskCard, `p-4` in columns, `p-5` in backlog header
- Gap values: `gap-2`, `gap-3`, `gap-4`, `gap-5`, `gap-6`, `gap-8` used freely

### Border Radius
- Sidebar: `rounded-r-3xl`
- Cards: `rounded-3xl` (48px) used everywhere
- Buttons: Mix of `rounded-full`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- Search dropdown: `rounded-2xl sm:rounded-3xl`

### Component Sizing
- Min-height for touch targets: `min-h-[48px]` used inconsistently
- Fixed heights: `h-[400px]`, `h-[500px]` hardcoded in board sections
- No consistent spacing scale documented

## Key Files for UI Updates
```
/src/index.css                    # Theme tokens, base styles
/src/components/layout/*          # Layout structure
/src/components/ui/*              # Shared UI primitives
/src/pages/*Board.tsx             # Page-specific layouts
```

## Unresolved Questions
1. Why no tailwind.config.ts? Using CSS-first config (Tailwind 4.x feature)
2. Is the radius inconsistency intentional (hierarchy) or accidental?
3. Should fixed heights in boards be converted to flex/min-height?
