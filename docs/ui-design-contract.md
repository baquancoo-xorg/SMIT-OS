---
type: ui-design-contract
status: canonical
version: 3.0
created: 2026-05-13
updated: 2026-05-14
playground_canon: v4 (visual reference đã ship — bạn ưng)
code_target: v5 (rebuild để code khớp 100% playground v4)
source_ref: docs/ref-ui-playground/Playground .html
source_inventory: plans/260513-1842-ui-ref-compliance/research/researcher-03-component-inventory-for-design-contract.md
design_md_ref: docs/ref-ui-playground/DESIGN.md
audit_ref: docs/ref-ui-playground/audit-report.md
---

# UI Design Contract

## Mục tiêu

Playground v4 (`docs/ref-ui-playground/Playground .html`) là **visual canon** đã được approve. Contract này = "rules of the playground", áp dụng cho mọi UI hiện có và UI tương lai: feature, page, chart, KPI, table, tab, toggle, sidebar, icon, typography, spacing, state, motion, form, overlay, feedback và responsive behavior.

**Nguyên tắc giải đột:** khi contract vs playground khác nhau → playground thắng (trừ khi rule là forward target được đánh dấu rõ là "future"). Bất kỳ component mới nào không có trong playground v4 phải được design parallel ngay từ đầu rồi mới merge vào playground.

## Source of Truth

- Visual ref: `docs/ref-ui-playground/Playground .html`
- Canonical primitives: `src/components/ui/**`
- Global tokens: `src/index.css`
- Runtime token mirror: `src/design/v5/tokens.ts`
- Layout shell: `src/components/layout/**`

## Global Contract

### 1. Theme

| Rule | Contract |
|---|---|
| Dark baseline | **Shipped** — playground v4 dark mode là source of truth |
| Light mode | **Forward target** — mọi component MỚI phải design parallel light variant ngay từ đầu, không retrofit sau |
| Theme parity | Light = same hierarchy, contrast, border visibility, không phải visual language khác |
| Token source | Use CSS variables / Tailwind token classes only |
| Raw colors | No hardcoded hex in UI components except token definitions |
| Color space | OKLCH (theo playground) — không dùng hex/rgb trong runtime tokens |

### 2. Color

| Area | Contract |
|---|---|
| Accent canonical | `var(--brand-500)` (OKLCH) — đây là source of truth |
| Accent label | `#ff6d29` chỉ là tên gọi đọc cho người, KHÔNG dùng trong code |
| CTA | Dark gradient + orange beam/icon; no solid orange CTA |
| Tabs/nav/checkbox | No solid orange fill |
| Data viz/status | Solid orange allowed only for intensity/status/data visualization |
| Success/warning/error/info | Use semantic tokens, not arbitrary Tailwind colors |
| Department colors | Use tokenized dept colors only |

### 3. Typography

| Element | Contract |
|---|---|
| Font | Hanken Grotesk primary, Inter fallback |
| Caption | Uppercase metadata, tracking wide/widest |
| Body | Tokenized `text-body-sm/body/body-lg` |
| Heading | Tokenized `h6 → h1/display`, no arbitrary page-local scale unless approved |
| Weight | Use 400/500/600/700/800 consistently; avoid random `font-black` unless hero/KPI |
| Line height | Use tokenized tight/snug/base/loose |

### 4. Iconography

| Area | Contract |
|---|---|
| Library | `lucide-react` only for product UI |
| Sizes | 14 chip, 16 small controls, 18–20 nav/action, 24 large/icon panel |
| Color | Inherit text color; primary CTA icon may use accent |
| Icon-only controls | Must have `aria-label` |
| Material symbols | Not for new UI unless legacy replacement is planned |

### 5. Spacing / Density

| Area | Contract |
|---|---|
| Spacing | Use token spacing/density variables, not random px values |
| Density | Comfortable + compact must remain readable |
| Touch target | Minimum 44px for interactive controls where practical |
| Page padding | Use shell/page padding tokens |
| Data-dense views | Compact allowed, but no clipped focus/hover states |

### 6. Radius

| Element | Contract | Token |
|---|---|---|
| Card | `1.25rem` (playground v4 universal) | `--radius-card` |
| Modal/callout | `1.25rem` | `--radius-modal` |
| Input/select/date | `0.75rem` (playground v4 universal) | `--radius-input` |
| Button/chip/badge | `9999px` pill | `--radius-button` / `--radius-chip` |
| No drift | New UI cannot introduce arbitrary `rounded-xl/2xl/3xl` if token exists | — |

### 7. Shadow / Glow

| Element | Contract |
|---|---|
| Card base | Compact ref shadow, not ambient `shadow-lg/xl` feel |
| Glow | Hover-only unless data visualization explicitly needs emphasis |
| KPI decorative glow | Hidden default, visible on hover only |
| Dropdown/modal | Elevated shadow allowed; must use token scale |
| Focus | Use focus ring token, visible in dark + light |

### 8. Motion

| Area | Contract |
|---|---|
| Duration | Use fast/medium/slow tokens |
| Easing | Use standard/emphasized tokens |
| Hover lift | Subtle `translateY(-1px)` max for cards/buttons |
| Reduced motion | Must respect `prefers-reduced-motion` |
| Page transitions | No heavy animation unless approved |

## Layout Contract

### 9. App Shell

| Component | Contract |
|---|---|
| `AppShell` | Global chrome only; no page-specific styling |
| Main area | Uses token page padding and content height |
| Error boundary | Wrap route content |
| Responsive | Desktop sidebar, mobile drawer |

### 10. Sidebar

| State | Contract |
|---|---|
| Expanded | Workspace groups, label + icon, muted inactive |
| Collapsed | Icon-only with accessible title/label |
| Active | Neutral surface lift + accent bar; not solid orange fill |
| Hover | Neutral surface, no ambient glow |
| User block | Card-style surface, token border/shadow |

### 11. Header

| Area | Contract |
|---|---|
| Height | Playground baseline after UI Ref Compliance Phase 01: `4rem` |
| Breadcrumb | Uppercase meta + page title |
| Actions | Theme, density, notification controls tokenized |
| Sticky | Theme-aware opaque/blur background |
| Mobile menu | Icon-only with `aria-label` |

### 12. Mobile Drawer

| Area | Contract |
|---|---|
| Overlay | Modal z-layer; theme-aware backdrop |
| Panel | Surface token, border/shadow token |
| Close | Explicit close control + ESC |
| Nav | Same active state rules as sidebar |

### 12b. Navigation Behavior

| Area | Contract |
|---|---|
| State preservation | Back phải restore scroll position + filter state + form input (URL state hoặc history state) |
| Deep linking | Mọi screen có URL stable; tab/filter/modal state serialize vào query string khi share-relevant |
| Breadcrumb | Hierarchy >=3 level → có breadcrumb với uppercase caption |
| Active route | Highlight rõ trong sidebar/tab; không silent reset stack |
| Focus on route change | Sau navigate, focus chuyển tới `<main>` để screen reader đọc context mới |
| Destructive nav separation | Logout/delete account tách biệt khỏi nav items thường về spatial + visual |

## Navigation / Selection Contract

### 13. Tab Bar / TabPill

| State | Contract |
|---|---|
| Container | Pill surface + subtle border |
| Active | Neutral lifted surface, not orange fill |
| Inactive | Muted text, neutral hover |
| Disabled | Opacity + no pointer |
| Count badge | Tokenized small badge, no solid orange unless status/data |
| Keyboard | ArrowLeft/Right, Home/End |

### 14. Segmented Controls

| Rule | Contract |
|---|---|
| Canonical | Use `TabPill`; migrate legacy `SegmentedTabs` |
| Active | Same as TabPill |
| Page-level filters | Use size `sm` unless prominent page nav |

### 15. Filter Chips

| State | Contract |
|---|---|
| Default | Surface/outline, muted label |
| Active | Accent text/border allowed; avoid solid orange background |
| Dropdown | Uses token popover surface/shadow |
| Check mark | Accent icon/text only |

### 16. Dropdown / Menu

| Area | Contract |
|---|---|
| Panel | Rounded card, token surface, elevated shadow |
| Item | Neutral hover, destructive uses semantic error |
| Separator | Border token |
| Keyboard | Headless accessible behavior preserved |

## Input / Form Contract

### 17. Text Input / Search

| State | Contract |
|---|---|
| Default | Surface-lowest, border-outline, input radius |
| Focus | Primary/focus ring token, no layout shift |
| Error | Error border + text; `aria-invalid` + `role="alert"` cho message |
| Disabled | Muted, no hover emphasis |
| Search | Use `Input iconLeft={<Search />}` until SearchInput exists |
| Validation timing | Validate on `blur`, không `onKeystroke` (tránh nhấp nháy lỗi khi đang gõ) |
| Autofill | Mọi input phải có `autocomplete` attr đúng (email, name, current-password, ...) |
| Password | Có toggle show/hide; type=password + autocomplete=current-password |
| Mobile keyboard | Dùng `inputmode`/`type` đúng semantic (email, tel, numeric) |
| Read-only | Khác biệt visually + semantically với disabled (vẫn copyable) |

### 18. Select / Combobox

| Component | Contract |
|---|---|
| CustomSelect | Canonical for simple select |
| MultiSelect | Missing canonical; must be designed before use |
| Combobox | Missing canonical; do not ad-hoc build without contract update |
| Panel | Same dropdown contract |

### 19. Date Picker / Date Range

| Area | Contract |
|---|---|
| Trigger | Input radius, token surface/border |
| Calendar | Dark + light readable, token popover |
| Selected date | Avoid generic solid orange unless calendar selection is approved exception; prefer accent ring/surface |
| Apply button | Must use primary CTA signature, not solid orange |

### 20. Checkbox / Switch / Radio

| Status | Contract |
|---|---|
| Current | Missing canonical components |
| Future rule | Any new checkbox/switch/radio must use canonical component created under `v5/ui` first |
| Checked | No solid orange fill unless explicitly approved; prefer surface + accent border/check |
| Label | Clickable, accessible association |
| Keyboard | Space/Enter behavior preserved |

### 21. Textarea / File / Progress

| Status | Contract |
|---|---|
| Textarea | Missing canonical; create before next textarea-heavy feature |
| FileUpload | Missing canonical; create before upload feature |
| ProgressBar | Missing canonical; create before progress UI |
| Rule | No ad-hoc styling in page files |

### 21b. Form Submit / Multi-step / Errors

| Area | Contract |
|---|---|
| Submit feedback | Disable button + spinner + `aria-busy`; success/error state explicit |
| Multi-error form | Error summary ở top + anchor link tới từng field; auto-focus invalid field đầu tiên sau submit |
| Multi-step flow | Step indicator + cho phép back; preserve state khi back |
| Long form | Autosave draft (debounce 500-1000ms) để tránh mất khi accidentally dismiss |
| Unsaved changes | Sheet/Modal close → confirm dialog |
| Field grouping | Dùng `<fieldset>` + `<legend>` khi group >2 fields liên quan |
| Helper text | Persistent text dưới input, không thay placeholder |
| Required marker | Asterisk + `aria-required="true"` |

## Button / Action Contract

### 22. Button

> See §48 for detailed Primary CTA DNA spec.

| Variant | Contract |
|---|---|
| Primary | Dark gradient + orange beam + orange icon (see §48) |
| Secondary | Neutral surface, border token |
| Ghost | Transparent, neutral hover |
| Destructive | Error semantic, not orange |
| Loading | Inline spinner + `aria-busy` |
| Disabled | Opacity + disabled cursor |
| Icon-only | `aria-label` required |

### 23. Bulk Actions / Row Actions

| Area | Contract |
|---|---|
| Row actions | Icon buttons, group hover okay, no solid orange hover |
| Bulk action bar | Surface/elevated panel; selected count not solid orange unless approved |
| Delete | Semantic error variant |

## Surface / Card Contract

### 24. Card

| Area | Contract |
|---|---|
| Base | Surface, border, ref radius, compact shadow |
| Hover | Subtle border/shadow/lift only |
| Padding | none/sm/md/lg tokenized |
| Glow | Hover-only |

### 25. GlassCard / Panel / Bento

| Area | Contract |
|---|---|
| Glass | Token glass surface only; must work in light mode |
| Raised | Elevated shadow token, no arbitrary `shadow-xl` |
| Bento | Grid cards obey same card contract |
| Decorative blob | Hidden or very subtle by default; no ambient orange glow |

### 26. KPI Card

| Zone | Contract |
|---|---|
| Label | Caption uppercase muted |
| Value | Headline scale, high contrast |
| Icon | Accent text allowed |
| Delta | Semantic success/error/flat badge |
| Sparkline | Accent allowed as line/highlight, not background slab |
| Glow | Hover-only |

## Table / Data Grid Contract

### 27. DataTable

| Area | Contract |
|---|---|
| Canonical | Prefer `v5/ui/data-table.tsx` |
| Shell | Rounded card, subtle border, compact shadow |
| Header | Sticky, surface overlay, uppercase caption |
| Row hover | Neutral surface, no orange hover |
| Sort | Clear icon state; no color-only signal |
| Pagination | Tokenized icon buttons + text |
| Density | Compact/normal/comfortable readable |

### 28. Legacy TableShell

| Rule | Contract |
|---|---|
| Existing use | Can stay only as UI Ref Compliance Phase 03 bridge |
| New use | Forbidden for new pages |
| Migration | Move to DataTable when touching legacy tables |

## Chart / Visualization Contract

> See §47 for complete chart taxonomy, palette mapping, and wrapper component specs.

### 29. Chart Base

| Area | Contract |
|---|---|
| Library | Current Recharts accepted until replaced by plan decision |
| Surface | Chart card follows Card/Panel contract |
| Axis/grid | Muted token colors |
| Tooltip | Theme-aware surface/border/shadow |
| Legend | Token text, compact spacing |
| Empty/loading | Use canonical EmptyState/Skeleton/Spinner |

### 30. Color Semantics

| Data type | Contract |
|---|---|
| Primary series | Accent line/point allowed |
| Secondary series | Neutral/dept/status tokens |
| Success trend | Success token |
| Warning | Warning token |
| Error/drop | Error token |
| Orange fill | Allowed for heatmap/intensity/status visualization only |
| Unknown series | Must define palette mapping before implementation |

### 31. Heatmap / Funnel / Sparkline

| Type | Contract |
|---|---|
| Heatmap | Token intensity scale, accessible contrast labels |
| Funnel | Step surfaces + semantic drop-off color; no loud orange slabs |
| Sparkline | Minimal axisless line; accent highlight allowed |
| KPI sparkline | Must fit KPI card without creating new visual language |

### 31b. Chart Accessibility & Responsive

| Area | Contract |
|---|---|
| State trinity | Mọi chart phải ship kèm Loading (Skeleton) + Empty (EmptyState) + Error (retry button) state, không render axis rỗng |
| Colorblind safety | Pattern/dash/shape supplement color, KHÔNG dùng color alone (đặc biệt red/green pair) |
| SR summary | `<figure>` + `<figcaption>` hoặc `aria-label` mô tả insight chính (vd: "Doanh thu tháng 5 tăng 23% so với tháng 4") |
| Data table alternative | Cung cấp `<table>` ẩn cho SR đọc data points |
| Tooltip keyboard | Tooltip reachable bằng Tab + arrow keys, không chỉ hover |
| Sortable axis | `aria-sort` indicate current sort state |
| Responsive | Mobile reflow: vertical bar → horizontal bar, fewer ticks, hide gridlines phụ |
| Large dataset | >1000 data points phải aggregate hoặc sample; cung cấp drill-down thay vì render hết |
| Number format | Locale-aware (vi-VN cho VN audience): `1.234.567 ₫` |
| Export | Data-heavy chart → cung cấp CSV/PNG export |
| Touch target | Interactive points/bars phải có hit area >=44pt hoặc expand on touch |
| Animation | Entrance animation respect `prefers-reduced-motion`; data readable ngay lập tức không chờ animation |

## Feedback / Status Contract

### 32. Badge

| Area | Contract |
|---|---|
| Variants | success/warning/error/info/neutral/primary/todo/in-progress/review/done |
| Soft default | Preferred |
| Solid | Reserved for status/data, not CTA |
| Dot | Optional status indicator; glow subtle |

### 33. StatusDot

| Area | Contract |
|---|---|
| Sizes | sm/md/lg |
| Pulse | Only for live/urgent states |
| Color | Semantic token only |

### 34. Toast / Notification

| Area | Contract |
|---|---|
| Toast | Surface card, semantic border/icon, auto-dismiss |
| Notification center | Drawer/dialog contract, unread dot semantic |
| Error toast | Error semantic, not destructive layout |

## Overlay Contract

### 35. Modal / Dialog

| Area | Contract |
|---|---|
| Backdrop | Theme-aware, accessible |
| Panel | Modal radius, surface, elevated shadow |
| Header | Title + optional icon + explicit close |
| Footer | Button row follows Button contract |
| Confirm | Type-to-confirm allowed for destructive action |

### 36. Popover / Tooltip / Drawer

> Tooltip spec: see §51 Missing Primitive Specs.

| Area | Contract |
|---|---|
| Popover | Rounded card, dropdown z-layer |
| Tooltip | Missing canonical — see §51 for full spec; must create before new tooltip-heavy UI |
| Drawer | MobileNavDrawer pattern; no custom drawer without contract update |

## State Contract

### 37. Loading

| State | Contract |
|---|---|
| Inline | Spinner with label |
| Card/table | Skeleton preferred |
| Page | Existing auth/page loading pattern |
| Avoid | Fake data placeholders that look real |

### 38. Empty

| Area | Contract |
|---|---|
| EmptyState | Canonical for no data/no result |
| Copy | Short action-oriented text |
| Action | Optional Button contract |

### 39. Error

| Area | Contract |
|---|---|
| ErrorBoundary | Use canonical fallback |
| Data error | Card/EmptyState with semantic error |
| Retry | Secondary/primary CTA depending impact |

## Admin / Settings / Profile Contract

### 40. Settings

| Area | Contract |
|---|---|
| Appearance | Theme/density controls use TabPill/Card contract |
| Security/API keys | Tables/forms/dialogs must use v5 canonical components |
| User management | DataTable + FormDialog + DropdownMenu |

### 41. Profile

| Area | Contract |
|---|---|
| Avatar | Token card/radius; no arbitrary shadows |
| 2FA | Status badges + QR panel follows card contract |
| Forms | Input/Button/FormDialog contract |

## Responsive / Accessibility Contract

### 42. Responsive

| Area | Contract |
|---|---|
| Desktop | Sidebar + header shell |
| Tablet | Layout remains readable; no horizontal page overflow except tables/chips |
| Mobile | Drawer nav, stacked actions, scrollable tabs |
| Tables | Horizontal scroll allowed; sticky header retained |

### 43. Accessibility

| Rule | Contract |
|---|---|
| Icon-only | `aria-label` required |
| Tabs | ARIA tablist/tab + keyboard nav |
| Dialogs | Focus management + explicit close + ESC + focus trap |
| Tables | `<th scope>` + `aria-sort` cho sortable |
| Forms | Label, helper, error, aria-invalid, aria-required |
| Contrast | 4.5:1 body / 3:1 large + UI element, dark + light visible focus/borders/text |
| Skip link | "Skip to main content" link đầu tiên trong tab order |
| Heading hierarchy | h1→h6 sequential, không skip level |
| Focus on route change | Auto-focus `<main>` sau navigate |
| Live region | Toast/notification dùng `aria-live="polite"`; error dùng `role="alert"` |
| Reduced motion | `prefers-reduced-motion: reduce` disable hover-lift + page transition |
| Color not alone | Status/sort/error luôn có icon hoặc text kèm, không chỉ màu |
| Number column | `font-variant-numeric: tabular-nums` cho cột số/tiền/timer |
| Keyboard shortcut | Mọi action có shortcut phải có alt path bằng UI control |

## Performance Contract

### 44. Web Vitals & Asset Strategy

| Area | Contract |
|---|---|
| LCP target | < 2.5s p75 trên 4G; hero/above-fold không lazy-load |
| CLS target | < 0.1 — mọi image/chart/iframe phải có `aspect-ratio` hoặc `width/height` |
| INP target | < 200ms — debounce/throttle high-frequency event (scroll, input) |
| Font loading | `font-display: swap`; preload Hanken Grotesk **500/600/700 only**, các weight khác lazy |
| Image | WebP/AVIF với `<picture>` fallback; `loading="lazy"` cho below-fold |
| Icon | `lucide-react` tree-shaken; KHÔNG import barrel (`import { X } from "lucide-react"` ok, KHÔNG `import * as Icons`) |
| Bundle | Chart lib (Recharts), DatePicker, Modal heavy → `React.lazy` + `<Suspense>` |
| Viewport unit | `min-h-dvh` thay `100vh` trên mobile (tránh URL bar resize bug) |
| Third-party | Analytics/logging defer sau hydration (`afterInteractive`) |
| Skeleton threshold | Load > 300ms → Skeleton bắt buộc, không spinner mặc định |
| Virtualize | DataTable/list > 50 rows phải dùng TanStack Virtual hoặc react-window |
| Tap delay | `touch-action: manipulation` trên button/link để loại 300ms delay mobile |

## Rendering Contract

### 45. React Rendering Patterns

| Area | Contract |
|---|---|
| Suspense boundary | Mọi data section bọc `<Suspense fallback={<Skeleton />}>`; không await blocking render parent |
| Server cache | Server fetch dùng `React.cache()` (hoặc TanStack Query) cho per-request dedup |
| Client fetch | TanStack Query (project đã có); KHÔNG fetch trong `useEffect` raw |
| Parallel fetch | Multiple independent fetch dùng `Promise.all`; tránh await tuần tự |
| Memoization | Chart, DataTable, heavy list cell → `memo` + primitive deps trong `useMemo`/`useCallback` |
| State subscription | Subscribe vào derived primitive (`isOpen`), không raw object — tránh re-render thừa |
| Functional setState | `setX(prev => ...)` để callback stable, ít re-create |
| Lazy state init | `useState(() => expensive())` cho initial value tốn |
| Transitions | Filter/search update dùng `startTransition` để giữ input responsive |
| Code splitting | Route-level `React.lazy`; component > 30KB lazy |
| Direct import | `import { Button } from "@/components/ui/button"`, KHÔNG `import { Button } from "@/components/ui"` (barrel) |
| Conditional render | `cond ? <A /> : <B />` thay vì `cond && <A />` để tránh edge case `0`/`""` leak |
| Hoist static JSX | JSX không depend props/state → khai báo ngoài component |
| Animate wrapper | Animate `<div>` wrapper, không animate `<svg>` element trực tiếp |

## Future Work Gate

Every future UI task must answer this checklist before done:

**Visual**
- [ ] Does it use existing v5 primitive first?
- [ ] If a primitive is missing, did we add/update canonical primitive instead of ad-hoc page styling?
- [ ] Does it pass dark + light smoke?
- [ ] Does it avoid solid orange for CTA/tab/checkbox/navigation?
- [ ] If orange fill exists, is it data viz/status intensity and documented?
- [ ] Does it avoid `shadow-lg/xl` ambient drift unless overlay/modal?
- [ ] Does it avoid raw hex / `bg-white` / `border-gray-*` in UI files?
- [ ] Does it follow table/chart/KPI contract if relevant?
- [ ] Does code review mention Playground compliance?

**Accessibility (§43)**
- [ ] Skip-link, heading hierarchy correct?
- [ ] Icon-only có `aria-label`?
- [ ] Toast/error có `aria-live`/`role="alert"`?
- [ ] Focus chuyển về `<main>` khi đổi route?
- [ ] `prefers-reduced-motion` honored?
- [ ] Tabular numbers cho cột số?

**Performance (§44)**
- [ ] Image/chart có `aspect-ratio` reserve (CLS < 0.1)?
- [ ] Heavy lib lazy-loaded?
- [ ] Skeleton cho load > 300ms?
- [ ] DataTable > 50 rows virtualized?

**Rendering (§45)**
- [ ] Data section bọc `<Suspense>`?
- [ ] Heavy component `memo` với primitive deps?
- [ ] Không fetch trong raw `useEffect`?
- [ ] Direct import (no barrel)?

## Required Canonical Gaps Before Future Use

| Missing canonical | Priority | Required before | Notes |
|---|---|---|---|
| Checkbox | P1 | Settings/preferences/multi-select forms mới | Solid orange check REJECTED — dùng surface + accent border/check |
| Switch | P1 | Theme/density toggle mới | Currently custom/tab-based |
| RadioGroup | P1 | Preferences/options mới | — |
| Tooltip | P2 | Replace inline `title=""` | Rich hints, keyboard-reachable |
| Textarea | P2 | Notes/long-form feature | Auto-resize optional |
| MultiSelect | P2 | Filter có chọn nhiều | — |
| Combobox | P2 | Searchable selection | Async option load support |
| ProgressBar | P3 | Onboarding/upload UI | Determinate + indeterminate variants |
| FileUpload | P3 | Upload feature | Drag-drop + accessibility |
| SearchInput | Optional | — | Có thể wrap `Input iconLeft` later |
| EmptyState (chart-specific) | P2 | Chart components | Subtype của EmptyState chung |

## Legacy Migration Rules

| Legacy pattern | Rule |
|---|---|
| `components/ui/*` duplicate of v5 | Do not use in new v5 pages |
| `dashboard/ui/segmented-tabs` | Replace with `TabPill` |
| legacy table components | Replace with `DataTable` or approved bridge only |
| duplicate date pickers | Keep one canonical v5 implementation |
| legacy sidebar/header | Do not import into v5 routes |

---

## v3.0 Extensions

### 47. Chart Taxonomy

Complete chart type mapping with token and wrapper specifications.

| Chart Type | Wrapper | Primary Token | Secondary Token | State Trinity |
|---|---|---|---|---|
| Line | `LineChartWrapper` | `--color-accent` | `--color-fg-muted` | Required |
| Bar | `BarChartWrapper` | `--color-accent` | Dept tokens | Required |
| Area | `AreaChartWrapper` | `--color-accent` (gradient fill) | — | Required |
| Pie/Donut | `PieChartWrapper` | Dept/status tokens | — | Required |
| Heatmap | `HeatmapWrapper` | Intensity scale | — | Required |
| Funnel | `FunnelChartWrapper` | Step surfaces | Drop-off: error | Required |
| Sparkline | Inline in KPICard | `--color-accent` | — | N/A (inline) |

**Palette Mapping:**

```css
/* Primary series */
--chart-primary: var(--color-accent);

/* Department series */
--chart-dept-bod: var(--color-dept-bod);
--chart-dept-tech: var(--color-dept-tech);
--chart-dept-marketing: var(--color-dept-marketing);
--chart-dept-media: var(--color-dept-media);
--chart-dept-sale: var(--color-dept-sale);

/* Semantic */
--chart-success: var(--color-success);
--chart-warning: var(--color-warning);
--chart-error: var(--color-error);

/* Intensity scale (heatmap) */
--chart-intensity-1: oklch(95% 0.02 var(--brand-hue));
--chart-intensity-5: var(--color-accent);
--chart-intensity-9: oklch(45% 0.2 var(--brand-hue));
```

**Axis/Grid tokens:**

```css
--chart-axis: var(--color-fg-subtle);
--chart-grid: var(--color-outline-subtle);
--chart-tooltip-bg: var(--color-surface-elevated);
--chart-tooltip-border: var(--color-outline);
```

**Citation example:**
```markdown
Per §47 Chart Taxonomy, line chart uses `--chart-primary` token for main series.
```

### 48. Primary CTA DNA Spec

The signature primary button style — **MANDATORY** for all primary actions.

**Structure:**

```tsx
// Button.tsx primary variant
const primary = cn(
  'relative overflow-hidden',
  'border border-accent/30',
  'bg-[linear-gradient(135deg,#1a1714_0%,#2e2925_100%)]',
  'text-text-1 shadow-card',
  // Orange beam (top edge)
  'before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-accent/60',
  // Hover
  'hover:border-accent/50 hover:shadow-glass',
  // Icon accent
  '[&>svg]:text-accent',
);
```

**DO:**
- Use dark gradient background (`#1a1714` → `#2e2925`)
- Add orange beam pseudo-element at top
- Color icons with accent token
- Use `shadow-card` base, `shadow-glass` on hover

**DON'T:**
- Solid orange background (`bg-accent`, `bg-brand-500`)
- Remove the beam pseudo-element
- Use white/neutral icons on primary buttons
- Apply to non-CTA elements (tabs, nav, checkboxes)

**Light mode parity:**

```css
[data-theme="light"] .btn-primary {
  background: linear-gradient(135deg, #faf5f0 0%, #f0e7dc 100%);
  border-color: var(--sys-color-accent-dim);
  color: var(--sys-color-text-1);
}
[data-theme="light"] .btn-primary::before {
  background: var(--brand-500);
}
```

**Citation example:**
```markdown
Per §48 Primary CTA DNA, button uses dark gradient + orange beam signature.
```

### 49. Stitch Reference Assets Index

Reference screens generated via Stitch for missing components (deferred due to API timeout — generate manually in Stitch UI).

| Batch | Purpose | Target File |
|---|---|---|
| 01 | Dashboard charts (line/bar/sparkline) | `stitch-screens/01-dashboard-charts.png` |
| 02 | Reports pie/donut/area | `stitch-screens/02-reports-surface.png` |
| 03 | Heatmap matrix | `stitch-screens/03-heatmap-matrix.png` |
| 04 | Funnel viz | `stitch-screens/04-funnel-viz.png` |
| 05 | Settings (checkbox/switch/radio) | `stitch-screens/05-settings-controls.png` |
| 06 | Form modal (textarea/file/multi/combo) | `stitch-screens/06-form-modal.png` |
| 07 | Tooltip variants | `stitch-screens/07-tooltip-variants.png` |
| 08 | Feedback (toast/banner/alert/callout) | `stitch-screens/08-feedback-stack.png` |
| 09 | Pagination + virtualized table | `stitch-screens/09-pagination-table.png` |
| 10 | Chart empty/loading/error trinity | `stitch-screens/10-chart-states.png` |

**Usage:** When implementing missing primitives, reference corresponding Stitch screen for visual canon.

**Note:** Stitch screens deferred — use `DESIGN.md` spec as primary reference until generated.

### 50. Light Mode Token Mapping

Exhaustive mapping from dark tokens to light counterparts.

| Token (Dark) | Dark Value | Light Value | Notes |
|---|---|---|---|
| `--sys-color-bg` | `--warm-950` (#0d0d0d) | `#f7f1ea` | Page background |
| `--sys-color-bg-elevated` | `--warm-900` (#161316) | `#fffaf5` | Card/modal bg |
| `--sys-color-surface` | `--warm-900` | `#fffaf5` | Primary surface |
| `--sys-color-surface-2` | `--warm-800` (#211c19) | `#f0e7dc` | Elevated surface |
| `--sys-color-surface-3` | `#2b241f` | `#e8dccf` | Highest surface |
| `--sys-color-surface-glass` | `oklab(--warm-800 72%)` | `rgba(255,250,245,0.78)` | Blur overlay |
| `--sys-color-text-1` | `#fffaf5` | `#171412` | Primary text |
| `--sys-color-text-2` | `--neutral-300` | `#51463f` | Secondary text |
| `--sys-color-text-muted` | `--neutral-400` | `#756b63` | Muted/disabled |
| `--sys-color-border` | `rgba(255,255,255,0.08)` | `rgba(69,48,39,0.12)` | Subtle border |
| `--sys-color-border-strong` | `rgba(255,255,255,0.16)` | `rgba(69,48,39,0.22)` | Emphasis border |
| `--sys-color-accent` | `--brand-500` (#ff6d29) | `--brand-600` (#d95716) | Darker for light bg |
| `--sys-color-accent-text` | `--brand-400` | `#a13d0f` | Legible on light |
| `--sys-color-accent-dim` | `rgba(255,109,41,0.16)` | `rgba(217,87,22,0.12)` | Hover/focus bg |
| `--sys-shadow-card` | Black 40%/30% | Warm 12%/8% | Reduced contrast |
| `--sys-shadow-elevated` | Black 50%/40% | Warm 15%/10% | Modal/dropdown |

**Usage:** All v5 components must use `var(--sys-color-*)` tokens — automatic theme switch.

**Citation example:**
```markdown
Per §50, text uses `--sys-color-text-1` which maps to #171412 in light mode.
```

### 51. Missing Primitive Specs

Specifications for 13 primitives not yet in v5. Each includes interface, state machine, and a11y requirements.

#### 51.1 Checkbox

```tsx
interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
}
```

**State machine:** unchecked → checked → unchecked (indeterminate is transient)

**Visual:** Surface bg + accent border/check mark. NO solid orange fill.

**A11y:** `role="checkbox"`, `aria-checked`, label association, Space toggles.

#### 51.2 Switch

```tsx
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}
```

**State machine:** off ↔ on

**Visual:** Pill track + thumb. Off = neutral. On = accent track, white thumb.

**A11y:** `role="switch"`, `aria-checked`, label required.

#### 51.3 RadioGroup

```tsx
interface RadioGroupProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; disabled?: boolean }[];
  name: string;
  orientation?: 'horizontal' | 'vertical';
}
```

**State machine:** Single selection within group.

**Visual:** Circle outline + accent dot when selected. No solid orange.

**A11y:** `role="radiogroup"`, arrow key navigation, `aria-checked`.

#### 51.4 Tooltip

```tsx
interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayMs?: number;
}
```

**State machine:** closed → hover/focus → open → close on leave/blur

**Visual:** Surface-elevated bg, outline border, elevated shadow. Max 200px width.

**A11y:** `role="tooltip"`, focus-triggered, keyboard reachable via Tab.

#### 51.5 Textarea

```tsx
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  autoResize?: boolean;
  maxRows?: number;
}
```

**State machine:** Same as Input (default → focus → error → disabled).

**Visual:** `rounded-input`, focus ring, error border.

**A11y:** Label association, `aria-invalid`, `aria-describedby` for helper/error.

#### 51.6 ProgressBar

```tsx
interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  variant?: 'determinate' | 'indeterminate';
  label?: string;
  size?: 'sm' | 'md';
}
```

**State machine:** idle → loading → complete (or error)

**Visual:** Track (surface-2) + fill (accent). Indeterminate = animated gradient.

**A11y:** `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.

#### 51.7 FileUpload

```tsx
interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
}
```

**State machine:** idle → dragover → uploading → success/error

**Visual:** Dashed border card, icon + text. Dragover = accent border.

**A11y:** `role="button"`, keyboard operable, file input hidden but accessible.

#### 51.8 MultiSelect

```tsx
interface MultiSelectProps<T extends string> {
  value: T[];
  onChange: (value: T[]) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
  searchable?: boolean;
}
```

**State machine:** closed → open → typing (if searchable) → selection → closed

**Visual:** Same as CustomSelect but with chip badges for selected items.

**A11y:** `role="listbox"`, `aria-multiselectable="true"`, chip removal via keyboard.

#### 51.9 Combobox

```tsx
interface ComboboxProps<T> {
  value: T | null;
  onChange: (value: T | null) => void;
  options: T[];
  getLabel: (item: T) => string;
  placeholder?: string;
  loading?: boolean;
  onSearch?: (query: string) => void;
}
```

**State machine:** closed → open → typing → filtering → selection → closed

**Visual:** Input + dropdown panel. Loading state = spinner in input.

**A11y:** `role="combobox"`, `aria-expanded`, `aria-autocomplete="list"`.

#### 51.10 Banner

```tsx
interface BannerProps {
  variant: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
}
```

**State machine:** visible → dismissed (if dismissible)

**Visual:** Full-width, semantic bg (soft), icon + text + optional action.

**A11y:** `role="alert"` for error, `role="status"` for others.

#### 51.11 SearchInput

```tsx
interface SearchInputProps extends Omit<InputProps, 'iconLeft'> {
  onSearch?: (value: string) => void;
  debounceMs?: number;
  loading?: boolean;
}
```

**State machine:** Same as Input + debounced search trigger.

**Visual:** Input with search icon left, optional clear button right.

**A11y:** `role="searchbox"`, `aria-label` if no visible label.

#### 51.12 Avatar

```tsx
interface AvatarProps {
  src?: string;
  alt: string;
  fallback?: string; // Initials
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

**State machine:** loading → loaded | error (fallback)

**Visual:** Circle image or initials on neutral bg. Sizes: 24/32/40/48px.

**A11y:** `alt` required for images, `aria-label` for fallback initials.

#### 51.13 Pagination

```tsx
interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  siblingCount?: number;
}
```

**State machine:** Navigation between pages, edge detection.

**Visual:** Icon buttons (prev/next) + page numbers. Current page = accent surface.

**A11y:** `aria-label="Pagination"`, `aria-current="page"` for active.

---

## Changelog

### v3.0 (2026-05-14) — UI Canon Compliance Release

**Breaking:**
- Deleted `src/components/ui/` — all imports must use `src/components/v5/ui/`
- Deleted orphaned legacy pages in `src/pages/` (v5 versions are canonical)

**Added:**
- Chart wrapper components: LineChart, BarChart, AreaChart, PieChart, DonutChart, SparklineChart, HeatmapChart
- ChartCard container with title/subtitle/tooltip support
- `/playground` route for v5 component showcase
- PR template with 4 DoD gates (`.github/PULL_REQUEST_TEMPLATE.md`)
- CI grep gate script (`scripts/ui-canon-grep.cjs`) with `ui-canon-ok` exclusion pattern

**Fixed:**
- All shadow-lg/xl violations → shadow-card/shadow-elevated tokens
- All raw hex color violations in UI components
- Dark/light theme parity for all v5 primitives

**Compliance:**
- 0 grep gate violations across codebase
- All 10 v5 pages pass 4 DoD gates
