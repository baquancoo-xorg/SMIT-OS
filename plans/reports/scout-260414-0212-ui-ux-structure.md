# Scout Report: SMIT-OS UI/UX Structure

**Date:** 2026-04-14  
**Status:** DONE

## Summary

SMIT-OS is a React 19 + TypeScript project management dashboard using TailwindCSS v4 with a custom Material Design 3-inspired theme. No external UI component library (like shadcn or Material UI) - all components are custom-built.

---

## File Inventory

### Layout Components
| File | Purpose |
|------|---------|
| `/src/components/layout/AppLayout.tsx` | Root layout with sidebar + header + content area, responsive with mobile sidebar toggle |
| `/src/components/layout/Sidebar.tsx` | Navigation sidebar with sections: Overview, Workspaces, Planning, Rituals |
| `/src/components/layout/Header.tsx` | Fixed header with search, dark mode toggle, settings button |

### Page Components
| File | Purpose |
|------|---------|
| `/src/pages/PMDashboard.tsx` | Overview dashboard with metrics, charts (recharts) |
| `/src/pages/TechBoard.tsx` | Tech & Product Kanban board with dnd-kit |
| `/src/pages/MarketingBoard.tsx` | Marketing Kanban board |
| `/src/pages/MediaBoard.tsx` | Media Kanban board |
| `/src/pages/SaleBoard.tsx` | Sales Kanban board |
| `/src/pages/OKRsManagement.tsx` | OKRs management page |
| `/src/pages/ProductBacklog.tsx` | Team backlog page |
| `/src/pages/DailySync.tsx` | Daily sync/standup page |
| `/src/pages/SaturdaySync.tsx` | Weekly report page |
| `/src/pages/Settings.tsx` | Admin settings page |
| `/src/pages/Profile.tsx` | User profile page |
| `/src/pages/LoginPage.tsx` | Login page |

### Board/Card Components
| File | Purpose |
|------|---------|
| `/src/components/board/TaskCard.tsx` | Expandable task card with subtasks, progress, KR linking |
| `/src/components/board/DraggableTaskCard.tsx` | Wrapper for TaskCard with dnd-kit sortable |
| `/src/components/board/TaskTableView.tsx` | Table view for tasks |
| `/src/components/board/ReportTableView.tsx` | Table view for weekly reports |
| `/src/components/board/TaskModal.tsx` | Create/edit task modal |
| `/src/components/board/TaskDetailsModal.tsx` | Read-only task details modal |

### Modal Components
| File | Purpose |
|------|---------|
| `/src/components/modals/WeeklyCheckinModal.tsx` | Weekly check-in form modal |
| `/src/components/modals/ReportDetailDialog.tsx` | Report detail dialog |

### Context/State
| File | Purpose |
|------|---------|
| `/src/contexts/AuthContext.tsx` | Auth state, user management, login/logout |

### Types
| File | Purpose |
|------|---------|
| `/src/types/index.ts` | All TypeScript interfaces: User, WorkItem, Sprint, Objective, KeyResult, etc. |

### Styling
| File | Purpose |
|------|---------|
| `/src/index.css` | TailwindCSS v4 config with @theme directive, custom colors, fonts |

---

## UI Architecture

### Design System
- **Fonts:** Manrope (headlines), Inter (body)
- **Color Scheme:** Material Design 3-inspired with custom tokens:
  - Primary: #0059b6 (blue)
  - Secondary: #a03a0f (coral)
  - Tertiary: #006b1f (green)
  - Surface system with multiple levels
  - Error: #b31b25
- **Border Radius:** 1rem default, up to 3rem (xl)
- **Glass morphism:** `glass-panel` class with backdrop blur

### Icon Systems
1. **Material Symbols Outlined** - Primary icon set (via Google Fonts)
2. **Lucide React** - Secondary icons for specific use cases

### Animation Library
- **motion** (Framer Motion) - Used for AnimatePresence, motion.div transitions

### Drag and Drop
- **@dnd-kit/core** + **@dnd-kit/sortable** - Kanban board drag functionality

### Charts
- **recharts** - Dashboard charts (LineChart, ResponsiveContainer)

### Layout Pattern
```
AppLayout (flex h-screen)
├── Sidebar (fixed/responsive, w-64 to w-72)
│   ├── Logo
│   ├── Nav sections (Overview, Workspaces, Planning, Rituals)
│   └── User footer with logout
└── Main content area
    ├── Header (fixed top, search + actions)
    └── Main (scrollable content with padding)
```

### Navigation Pattern
- State-based routing via `ViewType` in App.tsx
- Views: dashboard, okrs, tech, backlog, mkt, media, sale, sync, daily-sync, settings, profile
- No React Router - simple conditional rendering

### Responsive Breakpoints
- Mobile: sidebar hidden by default, menu button in header
- xl: sidebar always visible

---

## Key UI Patterns

1. **Card Design:** Rounded corners (rounded-[32px]), glass morphism, subtle shadows
2. **Badges:** Uppercase tracking, small font (text-[10px]), rounded-full
3. **Tables:** Custom styled, no external table library
4. **Modals:** Custom implementation with backdrop, AnimatePresence
5. **Forms:** Custom inputs, no form library

---

## Dependencies Summary

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.0.0 | UI framework |
| tailwindcss | 4.1.14 | Styling |
| motion | 12.23.24 | Animations |
| lucide-react | 0.546.0 | Icons |
| recharts | 3.8.1 | Charts |
| @dnd-kit/* | various | Drag and drop |

---

## Unresolved Questions
- None
