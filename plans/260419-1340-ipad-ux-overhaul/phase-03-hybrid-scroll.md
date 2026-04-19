# Phase 3: Hybrid Scroll System

## Overview
- **Priority:** High
- **Status:** pending
- **Estimated:** 1 hour

Một số trang cần page-level scroll (OKRs, tables dài), một số cần internal scroll (Kanban).

## Current State

All pages use `.viewport-fit` which locks height to `var(--content-h)`.

```css
.viewport-fit {
  height: var(--content-h);
  overflow: hidden;
}
```

## Implementation

### Step 1: Create scrollable page wrapper variant

**File:** `src/index.css`

```css
.page-scrollable {
  min-height: var(--content-h);
  overflow-y: auto;
}

/* Keep viewport-fit for Kanban-style pages */
.viewport-fit {
  height: var(--content-h);
  overflow: hidden;
}
```

### Step 2: Update AppLayout to accept scrollable prop

**File:** `src/components/layout/AppLayout.tsx`

```tsx
interface AppLayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
  scrollable?: boolean; // NEW
}

// In render
<div className={`${scrollable ? 'page-scrollable' : 'viewport-fit'} page-padding w-full overflow-x-hidden`}>
  {children}
</div>
```

### Step 3: Pass scrollable from App.tsx

**File:** `src/App.tsx`

Define which views need scrollable:

```tsx
const SCROLLABLE_VIEWS: ViewType[] = ['okrs', 'settings', 'ads-overview'];

// In render
<AppLayout
  currentView={currentView}
  onViewChange={setCurrentView}
  onLogout={handleLogout}
  scrollable={SCROLLABLE_VIEWS.includes(currentView)}
>
```

### Step 4: Verify internal scroll still works

Kanban boards rely on internal scroll. Verify:
- `overflow-y-auto` on column containers
- `flex-1 min-h-0` on scrollable areas

## Pages Classification

| Page | Scroll Type | Reason |
|------|-------------|--------|
| Dashboard | viewport-fit | Cards fit screen |
| Tech/Mkt/Media/Sale Kanban | viewport-fit | Columns internal scroll |
| OKRs | scrollable | Long content |
| Team Backlog | viewport-fit | List internal scroll |
| Daily Sync | scrollable | Form content |
| Weekly Report | scrollable | Long form |
| Settings | scrollable | Form content |
| Ads Overview | scrollable | Tables, charts |

## Todo

- [ ] Add `.page-scrollable` class to index.css
- [ ] Update AppLayout props
- [ ] Define SCROLLABLE_VIEWS in App.tsx
- [ ] Test each page type
- [ ] Verify Kanban internal scroll works

## Success Criteria

- OKRs, Settings can scroll full page
- Kanban boards maintain viewport-fit with internal scroll
- No visual regression on desktop
