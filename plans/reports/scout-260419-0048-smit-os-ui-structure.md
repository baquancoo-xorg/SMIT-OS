# SMIT-OS UI Structure Scout Report

**Status:** DONE  
**Date:** 2026-04-19

---

## 1. Page Components (src/pages/)

| File | Purpose |
|------|---------|
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/DashboardOverview.tsx` | Main dashboard overview |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/PMDashboard.tsx` | Project manager dashboard |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/TechBoard.tsx` | Tech team kanban workspace |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/MarketingBoard.tsx` | Marketing kanban workspace |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/MediaBoard.tsx` | Media team kanban workspace |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/SaleBoard.tsx` | Sales team kanban workspace |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/OKRsManagement.tsx` | OKR management page |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/ProductBacklog.tsx` | Product backlog view |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/DailySync.tsx` | Daily sync rituals |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/SaturdaySync.tsx` | Weekly report/sync |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/Profile.tsx` | User profile page |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/Settings.tsx` | App settings |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/LoginPage.tsx` | Login/auth page |

---

## 2. Layout Components (src/components/layout/)

| File | Purpose |
|------|---------|
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/AppLayout.tsx` | Main app shell with sidebar + header |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/Header.tsx` | Top header with search, widgets |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/Sidebar.tsx` | Navigation sidebar |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/DateCalendarWidget.tsx` | Date/calendar widget in header |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/SprintContextWidget.tsx` | Sprint context info widget |

---

## 3. Common Button Components

### Shared Button (src/components/ui/Button.tsx)
Generic button with variants: `primary | secondary | outline | ghost`  
Sizes: `sm | md | lg`  
Uses rounded-full (capsule) style.

### "+ New Task" Button Pattern (used inline)
Found in board pages (TechBoard, MarketingBoard, etc.):
```tsx
<button
  onClick={() => setIsModalOpen(true)}
  className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-95 transition-all min-w-[130px] whitespace-nowrap"
>
  <span className="material-symbols-outlined text-[14px]">add</span>
  New Task
</button>
```

**No shared component** for "+ New" action buttons; each page implements inline.

---

## 4. Styling/Theme Constants

### Location
`/Users/dominium/Documents/Project/SMIT-OS/src/index.css`

### Color Tokens (CSS custom properties)
```css
--color-primary: #0059b6
--color-secondary: #a03a0f
--color-tertiary: #006b1f
--color-surface: #f7f5ff
--color-on-surface: #222d51
--color-error: #b31b25
```

### Spacing
Uses Tailwind defaults. Common patterns:
- Main content: `p-4 sm:p-5 md:p-6 lg:p-8 xl:px-10`
- Header height: `h-20` (80px)
- Sidebar width: `w-64 xl:w-72`
- Section spacing: `space-y-6`, `gap-4`

### Border Radius
```css
--radius-action: 9999px    /* capsule - buttons, badges */
--radius-container: 3rem   /* cards, modals */
```

### Typography
- Headline font: Manrope
- Body font: Inter

---

## 5. Other UI Components (src/components/ui/)

| File | Purpose |
|------|---------|
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/Button.tsx` | Shared button component |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/Input.tsx` | Form input |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/Modal.tsx` | Modal wrapper |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/CustomSelect.tsx` | Custom select dropdown |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/CustomFilter.tsx` | Filter component |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/CustomDatePicker.tsx` | Date picker |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/EmptyState.tsx` | Empty state placeholder |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/Skeleton.tsx` | Loading skeletons |

---

## Summary

- **13 page components** covering dashboards, workspaces, planning, rituals
- **5 layout components** for app shell structure
- **No dedicated "+ New" button component**; boards use inline button with consistent styling
- **Styling via CSS theme tokens** in src/index.css using Tailwind v4 @theme syntax
- **Design system:** Capsule buttons (rounded-full), glass panels, soft gradients
