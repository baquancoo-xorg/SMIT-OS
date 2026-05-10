# Phase 04 — Component Library Implementation

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Input: Phase 3 mockup (sign-off)
- Dependencies: Phase 2 (tokens) + Phase 3 (mockup) done

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P2 |
| Effort | 1-1.5 tuần |
| Status | pending |

Code base reusable component library theo design tokens Phase 2 + mockup Phase 3. Output là `src/components/ui/v2/` với ≥ 15 components ready cho Phase 5-7 page redesign. Bao gồm Storybook (hoặc demo page) để preview + test isolation.

## Key Insights

- KHÔNG đụng pages ở phase này — chỉ build component
- Dùng `src/components/ui/` hiện tại làm reference (đã có Button, Card, CustomSelect...)
- Build trong namespace mới `src/components/ui/v2/` để KHÔNG break pages cũ trong khi đang chạy
- Apply React 19 best practices (useTransition, optimistic update, Suspense boundaries)

## Component Inventory (≥ 15 components)

### Atoms
- `<Button />` (variants: primary/secondary/ghost/destructive, sizes: sm/md/lg)
- `<Input />` (text/number/email + error state)
- `<Badge />` (variants: success/warning/error/info/neutral)
- `<StatusDot />` (with pulse animation)
- `<Spinner />` / `<Skeleton />`

### Molecules
- `<PageHeader />` (breadcrumb + title italic + action slot)
- `<TabPill />` (pill-style tab toggle)
- `<DateRangePicker />` (with presets)
- `<EmptyState />` (icon + label + action slot)
- `<KpiCard />` (Bento metric với decorative blob, hover anim)

### Organisms
- `<GlassCard />` (wrapper container)
- `<DataTable />` (sortable, paginated, density variants)
- `<Modal />` (size variants, lazy mount)
- `<NotificationToast />` (success/error/info)
- `<FormDialog />` (modal + form combo, with validation) — base cho 5 modals của app
- `<DropdownMenu />` (anchor + items)
- `<ConfirmDialog />` (delete confirm pattern, used by OKRs delete + Lead delete)

### Layout (5 components)
- `<Sidebar />` (nav items + group + active state)
- `<Header />` (logo + breadcrumb + user menu + notification)
- `<AppLayout />` (composition)
- `<NotificationCenter />` (slide-in panel)
- `<OkrCycleCountdown />` (Q-deadline countdown widget — render trong Header)

### Misc states (NEW additions)
- `<ErrorBoundary />` — generic error fallback (icon + message + reload)
- `<NotFoundPage />` — dedicated 404 page với illustration + nav links
- `<LoadingSkeleton />` variants (page-level, card-level, row-level)

## Implementation Steps

1. **Setup Storybook hoặc demo page** (1d):
   - Decision: Storybook (rich) vs simple `/dev/components` page (light)
   - Goal: preview components in isolation + all states

2. **Build atoms** (2d):
   - Button, Input, Badge, StatusDot, Spinner, Skeleton
   - Mỗi component: TypeScript types + JSDoc + variants + states demo

3. **Build molecules** (2-3d):
   - PageHeader, TabPill, DateRangePicker, EmptyState, KpiCard
   - KpiCard signature: decorative blob, hover scale anim

4. **Build organisms** (2-3d):
   - GlassCard, DataTable, Modal, NotificationToast, FormDialog, DropdownMenu

5. **Build layout** (1-2d):
   - Sidebar, Header, AppLayout (NEW versions, không touch existing)

6. **Tests & A11y** (1d):
   - Render test mỗi component
   - Accessibility: keyboard nav, screen reader labels, focus state
   - Lighthouse Accessibility ≥ 95 cho demo page

7. **Documentation**:
   - Mỗi component: usage example + props table
   - `docs/component-library.md` — index + how-to-use

## Output Files

```
src/components/ui/v2/
├── button.tsx
├── input.tsx
├── badge.tsx
├── status-dot.tsx
├── spinner.tsx
├── skeleton.tsx
├── page-header.tsx
├── tab-pill.tsx
├── date-range-picker.tsx
├── empty-state.tsx
├── kpi-card.tsx
├── glass-card.tsx
├── data-table.tsx
├── modal.tsx
├── notification-toast.tsx
├── form-dialog.tsx
├── dropdown-menu.tsx
├── sidebar.tsx
├── header.tsx
├── app-layout.tsx
└── index.ts                  (re-export)

src/pages/dev/Components.tsx  (demo page, hoặc .storybook/)

docs/component-library.md
```

## Todo List

- [ ] Decision Storybook vs demo page
- [ ] Setup demo environment
- [ ] Build 6 atoms + demo
- [ ] Build 5 molecules + demo
- [ ] Build 6 organisms + demo
- [ ] Build 3 layout + demo
- [ ] A11y test
- [ ] Lighthouse demo page
- [ ] Component library doc
- [ ] User review demo page

## Success Criteria

- [ ] ≥ 20 components built (atoms + molecules + organisms + layout)
- [ ] Mỗi component có demo + props doc
- [ ] All variants + states render đúng
- [ ] Lighthouse Accessibility ≥ 95
- [ ] User review demo page → sign-off Phase 5

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Component thiếu vs mockup → Phase 5 stuck | 🔴 High | Audit lại mockup Phase 3, list mọi component cần BEFORE start build |
| Storybook setup tốn thời gian | 🟡 Medium | Default simple `/dev/components` page nếu Storybook overhead |
| Component over-engineered | 🟡 Medium | YAGNI — chỉ props cần cho mockup, không hypothetical |
| Conflict với Acquisition plan dùng v1 components | 🟡 Medium | v2 namespace tách riêng, Acquisition dùng v1 (Phase 8 migrate) |
| A11y bị skip | 🟡 Medium | Checklist a11y mỗi component (focus, keyboard, ARIA) |

## Security Considerations

- Input components: sanitize XSS-prone props (dangerouslySetInnerHTML cấm)
- DataTable: no PII leak qua sort/filter URL

## Next Steps

- Phase 5: Pages Small (Auth + Profile + Settings) — first migration target
