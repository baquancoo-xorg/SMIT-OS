---
title: "SMIT-OS v3 UI Style Guide"
description: "Canonical reference for visual implementation. Replaces v2 deprecated guide."
version: v3
status: live
date: 2026-05-12
direction: "Bento 3D Apple Premium (Luminous B2B Operations)"
source_of_truth_for: ["src/index.css tokens", "src/components/ui/* primitives", "page-level patterns"]
---

# UI Style Guide v3 (Apple Bento)

> Single source of truth for UI implementation. All new code MUST reference this guide.
> Companion docs:
> - [`design-tokens-spec.md`](./design-tokens-spec.md) — token values + rationale
> - [`design-system-foundation.md`](./design-system-foundation.md) — usage rules + accessibility

## Quick Start

```tsx
// 1. Standard Bento page
<div className="flex flex-col gap-lg p-lg">
  <PageHeader title="Dashboard" accent="Overview" breadcrumb={[...]} />
  <div className="grid grid-cols-12 gap-lg">
    <GlassCard variant="raised" padding="lg" className="col-span-8">...</GlassCard>
    <GlassCard variant="surface" padding="md" className="col-span-4">...</GlassCard>
  </div>
</div>
```

## Layout Architecture

### Page Wrapper

```tsx
<div className="h-full flex flex-col gap-[var(--space-lg)] w-full p-page">
  {/* Page Header (1 only) */}
  {/* Bento metric/KPI cards row */}
  {/* Content sections in bento grid */}
</div>
```

CSS variables: `--space-sm`, `--space-md`, `--space-lg`, `--space-xl` (clamp-based responsive).

### Page Header

```tsx
<PageHeader
  title="Page Name"
  accent="Subtitle"
  breadcrumb={[{ label: "Group", href: "/group" }, { label: "Page Name" }]}
  description="Optional descriptive subtitle"
  rightSlot={<Button>Action</Button>}
/>
```

**v3 Rules** (changed from v2):
- ❌ NO italic accent (`<em italic>` pattern dropped)
- ✅ Use `<span font-semibold text-primary>` for color accent (PageHeader handles this)
- Title font: Hanken Grotesk bold, tight tracking (`tracking-tight`)
- Breadcrumb: Material icon `chevron_right` size 14px, `text-on-surface-variant`
- Mobile: stack vertical, header items wrap

### Bento Grid Layout

Use Tailwind grid with 12-col base + 24px gutter:

```tsx
<div className="grid grid-cols-12 gap-lg">
  <div className="col-span-12 lg:col-span-8">{/* main */}</div>
  <div className="col-span-12 lg:col-span-4">{/* sidebar */}</div>
</div>
```

Responsive collapse:
- Mobile (< 768px): single column stack
- Tablet (768-1024): 6-col grid
- Desktop (≥ 1024): 12-col full

---

## Core Components

### Bento Card (canonical container)

```tsx
<GlassCard variant="raised" padding="lg" interactive>
  <h3 className="text-h6 font-semibold text-on-surface mb-3">Card title</h3>
  <div>...</div>
</GlassCard>
```

**Variants** (all v3 Apple Bento, "glass" name retained for compat):
- `surface` — bg-white + shadow-lg (default)
- `raised` — bg-white + shadow-xl (elevated section)
- `ghost` — transparent + border (subtle grouping)
- `outlined` — surface-container-lowest + border (recessed feel)

**Padding presets**: `none / sm (p-3) / md (p-5) / lg (p-6 md:p-8)`

**Decorative blob** (signature Bento accent):
```tsx
<GlassCard variant="raised" decorative decorativeAccent="primary">
  ...
</GlassCard>
```
Adds soft colored blob top-right — use for hero KPIs and featured cards.

**Interactive lift**: `interactive` prop adds hover shadow upgrade + `translateY(-1px)`.

### KPI Card

```tsx
<KpiCard
  label="Total Leads"
  value="1,247"
  deltaPercent={12.4}
  deltaLabel="vs last week"
  trend="up"
  decorative
/>
```

Pattern: bg-white + shadow-lg + decorative blob (primary 5% tint) + hover lift.

### Primary Button

```tsx
<Button variant="primary" size="md">Add Objective</Button>
```

**Variants**:
- `primary` — bg-primary + on-primary text + rounded-button (full pill) + shadow-md → hover shadow-lg + translateY(-1px)
- `secondary` — surface-container + on-surface text + rounded-button
- `ghost` — transparent + on-surface-variant + hover surface-container-low
- `destructive` — error variant for delete/dangerous actions

**Hero CTA**: Use `bg-apple-gradient` class for marketing/landing CTAs only.

### Input

```tsx
<Input
  label="Email"
  type="email"
  placeholder="name@company.com"
  iconLeft={<MailIcon />}
/>
```

Pattern: bg-surface-container-low + 1px outline-variant border + rounded-input → focus: white bg + primary border + 3px primary glow ring.

### Status Pill

```tsx
<Badge variant="success">On Track</Badge>
<Badge variant="warning">At Risk</Badge>
<Badge variant="error">Off Track</Badge>
<Badge variant="info">In Progress</Badge>
<Badge variant="neutral">Draft</Badge>
```

Low-opacity bg (10%) + high-opacity text + rounded-chip (full pill). Use ONLY for state communication.

### Tab Pills

```tsx
<TabPill active={tab === 'overview'} onClick={() => setTab('overview')}>
  Overview
</TabPill>
```

Apple-style segmented control. Active = bg-primary-container + on-primary-container text. Inactive = transparent + on-surface-variant.

### Modal

```tsx
<Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm action">
  <p>Are you sure?</p>
  <ButtonGroup>
    <Button variant="ghost" onClick={cancel}>Cancel</Button>
    <Button variant="primary" onClick={confirm}>Confirm</Button>
  </ButtonGroup>
</Modal>
```

Backdrop: `bg-on-surface/40 backdrop-blur-sm` (Level 3 elevation). Modal panel: bento-tile + shadow-2xl + max-w-2xl.

### Form Dialog

```tsx
<FormDialog
  isOpen={open}
  title="Add Objective"
  onSubmit={handleSubmit}
  onClose={() => setOpen(false)}
>
  <Input label="Title" required />
  <Select label="Owner" options={users} />
  ...
</FormDialog>
```

### Table

Use `DataTable` v2 primitive (auto-styled to v3 via tokens):

```tsx
<DataTable
  columns={columns}
  data={rows}
  sort={sort}
  onSortChange={setSort}
  pagination={{ pageSize: 10 }}
/>
```

Headers: surface-container-low bg + label-caps typography. Rows: alternating subtle surface-variant tint. Hover: surface-container-high.

---

## Typography Patterns

### Hierarchy Recipe

```tsx
<h1 className="text-[length:var(--text-h1)] font-bold tracking-tight">Display</h1>
<h2 className="text-[length:var(--text-h2)] font-bold tracking-tight">Page title</h2>
<h3 className="text-[length:var(--text-h4)] font-semibold">Section</h3>
<h4 className="text-[length:var(--text-h6)] font-semibold">Card title</h4>
<p className="text-[length:var(--text-body)] text-on-surface">Body</p>
<p className="text-[length:var(--text-body-sm)] text-on-surface-variant">Caption</p>
<span className="text-[length:var(--text-label)] uppercase tracking-widest text-on-surface-variant">LABEL</span>
```

Or use Tailwind shortcuts if defined: `text-h1`, `text-h2`, `text-body`, `text-label`.

### Title Accent Pattern (v3 D2 Style)

```tsx
<h1 className="text-[length:var(--text-h2)] font-bold text-on-surface tracking-tight">
  Page <span className="font-semibold text-primary">Name</span>
</h1>
```

**Rule**: NEVER use `<em>` or `italic` for the accent — that's deprecated v2 pattern.

---

## Color Use Rules

### Primary blue (#007aff) — sparingly
- Primary CTAs only
- Active navigation states
- Focus rings
- Active data series in charts
- ❌ Don't paint everything blue (corp dashboard syndrome)

### Secondary purple (#bf5af2)
- AI/predictive feature indicators
- Secondary CTAs
- Highlight badges for "AI", "Smart", "Auto"

### Tertiary green (#34c759)
- Positive trends, deltas
- "Healthy" status
- "Closed-won", "Active", "Online" states

### Status colors
- `success`, `warning`, `error`, `info` for STATE communication only
- ❌ Never decorative — use brand colors for that

### Department colors
- `dept-bod`, `dept-tech`, `dept-marketing`, `dept-media`, `dept-sale`
- Only in dept-specific UI (lead source badge, team chip)

### Background
- `surface` (#faf9fe) — page canvas
- `surface-container-lowest` (#ffffff) — bento tiles
- `surface-container-low` (#f4f3f8) — sidebar, recessed inputs
- `surface-container` → `highest` — progressive depth via tonal layering

---

## Motion Patterns

### Hover lift (default for interactive cards)
```css
.interactive {
  transition: all var(--duration-medium) var(--ease-standard);
}
.interactive:hover {
  box-shadow: var(--shadow-xl);
  transform: translateY(-1px);
}
```

### Page entry (route transitions)
Use Framer Motion `AnimatePresence` with subtle fade + 8px slide:
```tsx
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
>
  {children}
</motion.div>
```

### Modal entry
Backdrop fade + panel scale 95% → 100%:
```tsx
<Modal isOpen={open} /* uses Headless UI Transition internally */>
```

### Status: 3D tilt (deferred)
Apple Bento spec calls for X/Y tilt on cards based on mouse position. Defer to Phase 6+ motion polish session — use plain `hover:translateY(-1px)` for now.

---

## Anti-Patterns (DO NOT DO)

### ❌ Hardcoded colors
```tsx
// BAD
<div className="bg-blue-500 text-slate-700">

// GOOD
<div className="bg-primary text-on-surface">
```

### ❌ v2 glass blur patterns
```tsx
// BAD (v2)
<div className="bg-white/50 backdrop-blur-md border border-white/20">

// GOOD (v3)
<div className="bg-white border border-outline-variant/30 shadow-lg">
```

### ❌ Italic page title accent
```tsx
// BAD (v2)
<h1>Page <em className="italic text-primary">Name</em></h1>

// GOOD (v3)
<h1>Page <span className="font-semibold text-primary">Name</span></h1>
```

### ❌ Inline z-index hacks
```tsx
// BAD
<div className="z-[100]">

// GOOD
<div className="z-modal">
```

### ❌ Mixing v2 and v3 patterns
Don't use v2 glass backdrop-blur on some cards and v3 solid Bento on others. Pick v3, stay v3.

---

## Accessibility Checklist

- [ ] Touch targets ≥ 44px (use `.touch-target` utility)
- [ ] Focus visible on all interactive elements (`:focus-visible` ring already global)
- [ ] Color contrast ≥ 4.5:1 for body text (verify with WCAG checker)
- [ ] `aria-label` on icon-only buttons
- [ ] Heading hierarchy correct (h1 → h2 → h3, no skips)
- [ ] Form labels associated with inputs (use `<Input label="">` always)
- [ ] `prefers-reduced-motion` respected (global)

---

## Migration Notes (v2 → v3)

### Auto-migrated (no code changes needed)
- All components using token names (`bg-primary`, `text-on-surface`, etc.) — auto-cascade to v3 values
- `<GlassCard>` calls — internals swapped, API unchanged
- `<KpiCard>`, `<EmptyState>`, `<DropdownMenu>` — token-only updates

### Manual migration applied
- Page title italic accent (`<em>` → `<span font-semibold>`)
- Inline `bg-white/50 backdrop-blur-md` → `bg-white shadow-lg`
- LoginPage card wrapper, spend-chart, lead-logs-tab, lead-filters-popover, Sidebar — drift-fixed

### Still v2-pattern (intentional, OK to keep)
- Modal/Toast/Sidebar mobile-overlay use `backdrop-blur-sm` — correct Level 3 elevation per v3 spec
- Header sticky uses `bg-surface/80 backdrop-blur-md` — correct for sticky pattern

---

## Source of Truth

Token definitions: `src/index.css`
UI primitives: `src/components/ui/`
Direction reference: `plans/260511-2147-ui-redesign-v3/reports/phase-01-direction-winner.md`
Wireframes: `plans/260511-2147-ui-redesign-v3/reports/wireframes/`

Any deviation from this guide MUST update guide + tokens in same commit.

## Unresolved (defer to future iteration)

1. 3D tilt hover motion (Apple Bento signature) — needs framer-motion spike
2. Dark mode support — defer to v4 (Direction 2 = light-default)
3. Mobile-first patterns for DailySync/WeeklyCheckin — verify in actual usage
4. Print stylesheets — not in scope
