---
title: "SMIT-OS v3 Design System Foundation"
description: "Usage rules, accessibility, motion, Apple Bento patterns. Companion to design-tokens-spec.md."
version: v3
status: live
date: 2026-05-12
direction: "Bento 3D Apple Premium (Luminous B2B Operations)"
---

# v3 Design System Foundation (Apple Bento)

## Philosophy

> "Executive Precision" + "Spatial Depth". Apple visionOS + macOS Sonoma inspired. Bento Grid where data is compartmentalized into hyper-organized modular tiles. Premium craftsmanship, effortless control. (Per Stitch Phase 1 winning direction.)

## Core Patterns

### Bento Tile (canonical container)

```tsx
<div className="bento-tile p-6">
  {/* content */}
</div>
```

CSS:
- `bg-white` (solid, not glass)
- `border-white/40` (subtle 1px stroke)
- `rounded-card` (24px radius)
- `shadow-lg` (chromatic blue-tinted Level 1)
- Hover: `shadow-xl` + `translateY(-1px)` (3D tilt feel)

**v2 compat**: `.glass-card` and `.glass-panel` aliases still work — internally swapped to Bento. New code MUST use `.bento-tile`.

### Page Header (D2 full Apple style)

```tsx
<header className="flex items-end justify-between gap-md mb-lg">
  <div>
    <nav className="flex items-center gap-2 mb-2 text-on-surface-variant text-body-sm">
      <span className="hover:text-primary cursor-pointer">Group</span>
      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
      <span className="text-on-surface">Page Name</span>
    </nav>
    <h1 className="text-h2 font-bold text-on-surface tracking-tight">
      Page Name
    </h1>
  </div>
  <div className="flex items-center gap-3">{/* right actions */}</div>
</header>
```

**Rules** (v3 changes from v2):
- DROPPED v2 italic accent pattern (`text-primary italic`)
- Headlines use Hanken Grotesk bold + tighter tracking (`tracking-tight`)
- Subtle accent via separate decorative element (badge/chip) — not inline italic

### Sidebar (3-group structure)

```tsx
<aside className="bg-surface-container-low p-md">
  <div className="logo">SMIT-OS</div>
  <div className="search-bar" />

  <nav>
    <div className="text-label uppercase tracking-widest text-on-surface-variant mt-md mb-sm">
      Rituals
    </div>
    <SidebarItem icon="check_circle" label="Daily Sync" />
    <SidebarItem icon="calendar" label="Weekly Check-in" />
    <SidebarItem icon="target" label="OKRs" />

    <div className="text-label uppercase tracking-widest text-on-surface-variant mt-md mb-sm">
      Acquisition
    </div>
    <SidebarItem icon="dashboard" label="Dashboard" />
    <SidebarItem icon="people" label="Lead Tracker" />
    <SidebarItem icon="campaign" label="Media Tracker" />
    <SidebarItem icon="paid" label="Ads Tracker" />

    <div className="text-label uppercase tracking-widest text-on-surface-variant mt-md mb-sm">
      Operations
    </div>
    <SidebarItem icon="settings" label="Settings" />
    <SidebarItem icon="person" label="Profile" />
  </nav>

  <UserMenu className="mt-auto" />
</aside>
```

**Rules**:
- Background `surface-container-low` (light uniform, NOT dark contrast)
- Group labels visible (Apple Settings.app style)
- Active state = solid `primary-container` bg + `on-primary-container` text + 2px left accent bar
- Mobile = drawer (slide-in via `Drawer` primitive, NOT bottom tab bar)

### KPI Card (Bento metric tile)

```tsx
<div className="bento-tile p-lg relative overflow-hidden group">
  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>

  <p className="text-label uppercase tracking-widest text-on-surface-variant relative z-10">
    Total Leads
  </p>
  <p className="text-h2 font-bold text-on-surface relative z-10 mt-2">
    1,247
  </p>
  <p className="text-body-sm text-tertiary relative z-10 mt-2">
    +12% vs last week
  </p>
</div>
```

**Decorative blob** signature element from v2 → kept (works with Apple Bento aesthetic).

### Status Pill (semantic colors)

```tsx
<Badge variant="success">On Track</Badge>
<Badge variant="warning">At Risk</Badge>
<Badge variant="error">Off Track</Badge>
<Badge variant="info">In Progress</Badge>
<Badge variant="neutral">Draft</Badge>
```

Pattern: low-opacity bg (10%) + high-opacity text + `rounded-chip` (pill).

### Primary Button (Apple style)

```tsx
<button className="bg-primary text-on-primary px-6 py-3 rounded-button font-semibold text-body shadow-md hover:shadow-lg hover:translate-y-[-1px] transition-all">
  Add Objective
</button>
```

**Rules**:
- Solid `bg-primary` (no gradient on standard buttons; gradients reserved for hero CTA via `apple-gradient`)
- `rounded-button` (full pill) for primary actions
- 3D lift on hover (`translateY(-1px)`)
- Use `apple-gradient` class for hero/marketing CTA only

### Input Field (Apple recessed)

```tsx
<input className="bg-surface-container-low border border-outline-variant rounded-input px-4 py-3 text-body w-full focus:border-primary focus:bg-white focus:ring-3 focus:ring-primary/30" />
```

**Rules**:
- Subtle gray fill (`surface-container-low`) — appears recessed
- 1px border (`outline-variant`)
- On focus: white fill + primary border + 3px primary glow ring

### Modal (Level 3 elevation)

```tsx
<div className="fixed inset-0 bg-black/40 backdrop-blur-2xl z-modal flex items-center justify-center">
  <div className="bento-tile p-xl max-w-2xl w-full">
    {/* modal content */}
  </div>
</div>
```

Backdrop blur 80px (`backdrop-blur-2xl`), modal uses `shadow-2xl` for multi-layer depth.

## Color Use Guidelines

- **Primary blue** = USE SPARINGLY for high-priority actions. Don't paint everything blue.
- **Secondary purple** = AI/predictive features, secondary CTAs, brand accents
- **Tertiary green** = positive trends, success states, healthy metrics
- **Status colors** (success/warning/error/info) = ONLY for state communication, never decorative
- **Department colors** = ONLY in dept-specific UI (lead source badge, team chip)
- **Background** = `surface` for page, `surface-container-lowest` (white) for cards/modals

## Accessibility

### Contrast ratios (WCAG AA minimum)
- Body text on surface: `#1a1b1f` on `#faf9fe` = 17.8:1 ✅
- Muted text: `#414755` on `#faf9fe` = 9.4:1 ✅
- Primary on white: `#007aff` on `#ffffff` = 4.0:1 ⚠️ (large text only, not body)
- Use `primary-container` for accessible primary text on light backgrounds

### Focus rings
- Token-driven: `:focus-visible { box-shadow: var(--shadow-focus); }`
- Already applied globally in `@layer base`
- Custom components MUST preserve focus visibility

### Touch targets
- All interactive elements ≥ `--touch-min` (44px) per WCAG 2.1
- Use `.touch-target` utility class on small icon buttons

### Motion
- `prefers-reduced-motion` respected globally (animations → 0.01ms)
- All transitions use token timings (`--duration-fast` to `--duration-slow`)

## Typography Guidelines

### Hierarchy
- Page title: `text-h2 font-bold tracking-tight`
- Section title: `text-h4 font-semibold`
- Card title: `text-h6 font-semibold`
- Body: `text-body` (14px default; 16px `text-body-lg` for marketing/landing)
- Label/caption: `text-label uppercase tracking-widest text-on-surface-variant`

### Rules
- Avoid font weights < 400 (legibility on white)
- Headlines: tighter tracking (`tracking-tight`) for "locked-in" feel
- Labels: small + semibold + slight tracking (`tracking-widest`) — clean metadata markers

## Motion Guidelines

### Defaults
- All transitions: `var(--duration-medium) var(--ease-standard)`
- Use utility class `.transition-layout` or motion utilities (`.motion-fast`, `.motion-medium`, `.motion-slow`)

### Patterns
- Hover lift: `translateY(-1px)` + shadow upgrade (`md → lg` or `lg → xl`)
- Page entry: fade + 8px slide (use `.toast-enter` pattern for inspiration)
- Modal: backdrop fade + scale (95% → 100%)
- Avoid bouncy/spring animations (not Apple-aligned); prefer smooth deceleration

### 3D tilt (signature Apple Bento)
Implementation deferred to Phase 4 component library. Subtle X/Y rotation based on mouse position (`useMotionValue` or vanilla pointerMove handler).

## Z-index Discipline

Strict layer order, no inline `z-50` hacks:

```
0   base content
10  sticky table headers
20  sidebar
30  app header
40  dropdowns, selects, popovers
50  modals + modal backdrop
60  toast notifications
70  tooltips
```

Use utility classes `.z-sidebar`, `.z-header`, `.z-modal`, etc.

## Composition Rules

- **DO** compose with tokens — `bg-primary`, `text-on-surface`, `rounded-card`, `shadow-lg`
- **DON'T** use raw colors inline — no `bg-blue-500`, no `text-slate-700`, no hardcoded hex
- **DO** extend tokens in `src/index.css` for new patterns
- **DO** use semantic radius (`rounded-button`, `rounded-card`) over generic (`rounded-lg`) when possible
- **DON'T** mix v2 patterns (italic title accent, `bg-white/50 backdrop-blur-md`) with v3 — pick v3 only

## File References

- Token spec: [`docs/design-tokens-spec.md`](./design-tokens-spec.md)
- Source: `src/index.css`
- Direction winner report: `plans/260511-2147-ui-redesign-v3/reports/phase-01-direction-winner.md`
- IA freeze report: `plans/260511-2147-ui-redesign-v3/reports/phase-02-ia-proposal.md`
- Wireframes: `plans/260511-2147-ui-redesign-v3/reports/wireframes/`

## Open Questions (Phase 4+ resolutions)

1. 3D tilt hover: framer-motion vs CSS `@starting-style` — decide Phase 4 D1
2. Bento decorative blobs: keep v2 KPI signature or simplify? — Phase 4 component design
3. Dark mode (v4): deferred unless variant winner is dark-default (it wasn't — Direction 2 light won)
