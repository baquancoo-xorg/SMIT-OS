# Phase 01 — Stage 1: Full Component Library

## Context Links

- ADR: `docs/v6/ADR-001-design-system.md` sections 4, 6, 7, 10, 12
- Build prompt: `docs/v6/CLAUDE-CODE-BUILD-PROMPT.md` section 9.2 (Stage 1)
- Phase 00 outputs: `src/ui/components/{primitives/button, layout/logo-mark, data/kpi-card}/`
- Screenshot audit 2026-05-15: 8 page references validated component requirements

## Overview

- **Priority:** P0 (blocked by Phase 00)
- **Status:** blocked-by-00
- **Description:** Build **44+ components** (30 original + 14 từ screenshot audit) — primitives, data, overlays, forms, layout, charts, feedback — đủ surface area để migrate 8 routes ở Phase 02. Tất cả components có showcase entry để Dominium review batch-by-batch.

## Key Insights

- Phase 00 chứng minh token system + 3 components đạt visual ambition. Phase 01 scale theo cùng pattern, không re-debate design.
- Showcase route `/v6-storybook` mở rộng dần, không tạo route mới per component.
- Tách batches để Dominium gate từng batch (tránh build hết rồi mới sai hướng).
- Composite components (Modal, Sheet, Combobox) dùng Radix UI underneath qua shadcn — không tự build accessibility primitives.

## Requirements

### Functional — Component checklist per ADR section 12.1

**Primitives** (`src/ui/components/primitives/`)
- Badge, IconButton, Avatar, Spinner, Separator (was Divider, renamed for shadcn parity), Kbd, Tag
- **StatusBadge variant** — Badge với dot indicator + status color tokens (NEW, ATT, On-time, Late, Early, Approved, Pending review)
- (Button đã có ở Phase 00 với 7 variants)

**Data** (`src/ui/components/data/`)
- DataTable (TanStack Table wrapper) — phải support: multi-select checkbox, sort indicators, custom cell renderers (badges/icons/tabular numbers), action column (view/edit/delete icons), filter integration, pagination integration, search integration
- **Pagination** (shadcn) — pair với DataTable
- **ScrollArea** (shadcn) — long table/list containers
- StatCard (variant of KpiCard for sidebar/inline)
- ProgressBar, ProgressRing
- Sparkline
- EmptyState

**Overlays** (`src/ui/components/overlays/`)
- Dialog (modal)
- Sheet (drawer)
- Tooltip
- Popover
- DropdownMenu
- ContextMenu
- **Accordion** (shadcn) — for OKR L1 expandable cards (Image #5)
- **Collapsible** (shadcn) — for OKR L2 child objective items
- **FilterPopover** composite — Popover + form inputs (Image #6,7 "Filters" button)
- CommandPalette (cmdk-based)
- Toast (sonner-based)

**Forms** (`src/ui/components/forms/`)
- Input, Textarea, Select, Checkbox, Switch, RadioGroup
- **Calendar** (shadcn) — base primitive cho date pickers
- DatePicker (single date, Calendar + Popover compose)
- **DateRangePicker** composite — Calendar (range mode) + Popover — used top-right tất cả pages (Image #1-4,6)
- ComboBox
- Form (react-hook-form wrapper)
- FieldError, FieldLabel, FieldHint

**Layout** (`src/ui/components/layout/`)
- Sidebar (full shell + nav items + section labels — leverage shadcn `Sidebar` primitives nếu hợp; sub-components: SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem)
- **SidebarFooter / UserMenu** composite — user info (name, role) + settings icon + logout + collapse toggle (Image bottom-left tất cả pages)
- Header (top bar với backdrop-blur — chỉ 1 chỗ glass-morphism allow)
- **NotificationBell** composite — IconButton + Badge count + Popover (top-right header, badge count 20 in screenshots)
- **ThemeToggle** composite — IconButton + theme context toggle (sun/moon top-right)
- PageContainer, SectionHeader, Breadcrumb
- Tabs (pill style từ v5 polish, icon support — Image #1-4 tab navigation Overview/Acquisition/Call/...)
- (LogoMark đã có ở Phase 00)

**Charts** (`src/ui/components/charts/`)
- LineChart, BarChart, AreaChart (Recharts wrappers — chỉ restyling, không rewrite)
- **BarChart `stacked` variant** — multi-series stacking via Recharts `stackId` (Image #4 AE Workload horizontal stacked bar)
- **PieChart / DonutChart** — Recharts Pie với optional `innerRadius` cho donut variant (Image #4 Lead by Source, Lead by Country)
- **HeatmapChart** — **CUSTOM SVG grid** (no library) — dim 7×24, intensity scale dùng primary color tokens (Image #3 Call Distribution Heatmap)
- **FunnelChart** — compose từ stat cards + ProgressBar steps + conversion %, KHÔNG dùng Recharts funnel-shape (Image #2 Journey Funnel với PRE/IN/POST-PRODUCT sections)
- ChartTooltip, ChartLegend
- ChartAxis (token-based styling)

**Feedback** (`src/ui/components/feedback/`)
- Alert (success/danger/warning/info variants)
- Banner
- Skeleton (multi-variant: text, card, table, chart)
- ErrorBoundary fallback UI

### Non-functional
- Mỗi file < 200 lines (tách subcomponent nếu cần)
- Tất cả components forwardRef nếu interactive
- Type-safe props, no `any`
- Co-located CSS file cho complex visual logic
- Lint gate (`scripts/ui-canon-grep.cjs` updated) cấm: font-black/extrabold/bold, backdrop-blur except header, glow without :hover
- Storybook entry cho mỗi component (text mô tả + render examples)

## Architecture

Pattern repeat per component:

```
src/ui/components/<category>/<name>/
├── index.ts
├── <name>.tsx           # < 200 lines
├── <name>.css           # co-located styles
├── <name>.types.ts      # if complex types
└── <subparts>.tsx       # if needed
```

Storybook entries grouped:
```
src/pages/v6-storybook/
├── index.tsx            # main route, links to sections
├── primitives.tsx       # Button, Badge, IconButton, etc
├── data.tsx             # KpiCard, DataTable, etc
├── overlays.tsx
├── forms.tsx
├── layout.tsx
├── charts.tsx
└── feedback.tsx
```

## Related Code Files

### Create (estimate ~110 new files: 44+ components × avg 2-3 files each)

Subdirectory structure detail trong ADR section 12.1.

**Component count breakdown sau screenshot audit:**
- Primitives: 8 (Badge, IconButton, Avatar, Spinner, Separator, Kbd, Tag, StatusBadge)
- Data: 8 (DataTable, Pagination, ScrollArea, StatCard, ProgressBar, ProgressRing, Sparkline, EmptyState)
- Overlays: 11 (Dialog, Sheet, Tooltip, Popover, DropdownMenu, ContextMenu, Accordion, Collapsible, FilterPopover, CommandPalette, Toast)
- Forms: 13 (Input, Textarea, Select, Checkbox, Switch, RadioGroup, Calendar, DatePicker, DateRangePicker, ComboBox, Form, FieldError, FieldLabel, FieldHint)
- Layout: 9 (Sidebar, SidebarFooter/UserMenu, Header, NotificationBell, ThemeToggle, PageContainer, SectionHeader, Breadcrumb, Tabs)
- Charts: 10 (LineChart, BarChart, BarChart-stacked variant, AreaChart, PieChart/DonutChart, HeatmapChart, FunnelChart, ChartTooltip, ChartLegend, ChartAxis)
- Feedback: 4 (Alert, Banner, Skeleton, ErrorBoundary)
- **Total: ~63 components** (some count as single export với variants)

### Modify
- `src/pages/v6-storybook.tsx` → split into subroutes
- `scripts/ui-canon-grep.cjs` → update forbidden patterns cho v6
- `package.json` → install batch deps lúc cần (TanStack Table cho DataTable, Recharts deps cho charts wrapper, etc)

### DO NOT touch
- `src/components/v5/**`
- Business logic files

## Implementation Steps

**Batch order (gate per batch):**

1. **Batch A — Primitives extension** (~3 days)
   - Badge, IconButton, Avatar, Spinner, Separator (renamed from Divider), Kbd, Tag
   - **StatusBadge variant** (dot + color tokens)
   - Update storybook `primitives` page
   - Gate: visual review

2. **Batch B — Feedback + Layout primitives** (~4 days, +1 day cho additions)
   - Alert, Banner, Skeleton, ErrorBoundary
   - PageContainer, SectionHeader, Breadcrumb, Tabs (pill + icon variant)
   - **Accordion, Collapsible** (shadcn) cho OKR cards
   - **ScrollArea** (shadcn)
   - Gate: layout primitives đủ build skeleton page + OKR accordion

3. **Batch C — Forms** (~5 days, +1 day cho Calendar + DateRangePicker)
   - Input, Textarea, Select, Checkbox, Switch, RadioGroup
   - **Calendar** (shadcn base primitive)
   - DatePicker (single)
   - **DateRangePicker** (composite, dùng top-right tất cả pages)
   - ComboBox
   - Form wrapper với react-hook-form
   - Gate: form components đủ rebuild Daily Sync + Check-in pages

4. **Batch D — Overlays** (~4 days, +1 day cho FilterPopover composite)
   - Dialog, Sheet, Tooltip, Popover, DropdownMenu, ContextMenu
   - **FilterPopover** composite (Popover + form inputs cho Filters button trên Leads/Daily Sync)
   - CommandPalette (cmdk), Toast (sonner)
   - Gate: overlay system complete

5. **Batch E — Data + Charts** (~7 days, +2 days cho Pagination + Pie/Donut + Heatmap + Funnel)
   - DataTable (TanStack Table) — most complex single component, must support: multi-select, sort, custom cells, action column, filter, search, pagination integration
   - **Pagination** (shadcn)
   - StatCard, ProgressBar, ProgressRing, Sparkline, EmptyState
   - Recharts wrappers: LineChart, BarChart (+ stacked variant), AreaChart
   - **PieChart / DonutChart** (Recharts Pie với innerRadius prop)
   - **HeatmapChart** — **CUSTOM SVG build** (no library, dim 7×24, intensity scale)
   - **FunnelChart** composite — stat cards + ProgressBar steps + conversion % (NOT recharts funnel-shape)
   - Gate: data layer đủ build dashboard (Overview, Acquisition, Call, Distribution tabs) + reports

6. **Batch F — Shell (Sidebar + Header) + Composites** (~4 days, +1 day cho NotificationBell + ThemeToggle + UserMenu)
   - Sidebar (leverage shadcn Sidebar primitives nếu fit) với nav items + section labels (integrate LogoMark)
   - **SidebarFooter / UserMenu** composite (user info + settings + logout + collapse)
   - Header với backdrop-blur (chỉ chỗ allow glass-morphism)
   - **NotificationBell** composite (IconButton + Badge count + Popover)
   - **ThemeToggle** composite (IconButton + theme context)
   - Gate: shell ready cho page migration Phase 02

## Todo List

- [ ] Batch A — Primitives extension (8 components incl. StatusBadge)
- [ ] Batch B — Feedback + Layout primitives + Accordion/Collapsible/ScrollArea (11 components)
- [ ] Batch C — Forms + Calendar + DateRangePicker (13 components)
- [ ] Batch D — Overlays + FilterPopover (11 components)
- [ ] Batch E — Data + Charts incl. Pagination/Pie/Donut/Heatmap/Funnel (18 components)
- [ ] Batch F — Shell + NotificationBell + ThemeToggle + UserMenu (9 components)
- [ ] Update `scripts/ui-canon-grep.cjs` forbidden patterns
- [ ] Storybook subroutes cho mỗi batch (showcase tất cả ~63 components)
- [ ] `pnpm tsc --noEmit` pass sau mỗi batch
- [ ] Bundle size audit (chấp nhận growth tuyến tính theo component count)
- [ ] HeatmapChart visual khớp Image #3 reference (7×24 grid, intensity gradient)
- [ ] FunnelChart visual khớp Image #2 reference (3 sections PRE/IN/POST-PRODUCT)
- [ ] **STOP + wait for Dominium approve trước khi sang Phase 02**

## Success Criteria

1. Tất cả ~63 components render đúng tại `/v6-storybook` subroutes (matches 8 screenshot references)
2. Mỗi file < 200 lines (lint enforced)
3. `pnpm tsc --noEmit` pass
4. Lint gate active, cấm forbidden patterns
5. No `any` types, all interactive components forwardRef
6. Accessibility baseline (Radix-backed components keyboard nav work)
7. Theme toggle dark/light parity tất cả components
8. Visual khớp showcase + ADR design philosophy (Linear/Vercel/Stripe feel)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| DataTable component blow up >200 lines | High | Medium | Tách `<table>`, `<header>`, `<row>`, `<pagination>` subcomponents |
| Recharts không support OKLCH | Medium | Medium | Pass hex equivalent vào Recharts; tokens lookup table |
| Form validation patterns không đồng nhất | Medium | Low | Standardize Zod schemas, react-hook-form resolver pattern |
| Batch order block dependencies | Medium | Medium | Batch order đã tính dependency (primitives → forms → overlays → data) |
| Solo dev burnout giữa Stage 1 | High | High | Stage gate cuối batch = natural pause |
| Showcase route trở thành mess | Medium | Low | Split subroutes per batch |
| Radix peer dependency conflict | Low | Medium | shadcn install handles peers; verify `--legacy-peer-deps` fallback |

## Security Considerations

- Form components: ensure XSS protection trong Input/Textarea (React tự escape by default)
- CommandPalette: dùng cmdk có inherent CSRF safety
- DataTable: row data từ trusted hooks, không phải user input direct
- Toast: messages có thể chứa dynamic content — sanitize trước khi pass vào Toast
- DatePicker: validate locale/timezone không leak server-side info

## Next Steps

- **Blocked by:** Phase 00 completion + Dominium approval
- **Unblocks:** Phase 02 (page migration — cần shell + data + form components ready)
- **Follow-up:**
  - Component changelog → docs/v6/changelog.md
  - Codemod prep cho Phase 02 (catalog v5 component → v6 component mapping)
