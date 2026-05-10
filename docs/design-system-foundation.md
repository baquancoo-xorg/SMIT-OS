# Design System Foundation — SMIT-OS

> Status: **Source of truth** as of 2026-05-10 | Phase 2 deliverable
> Companion: [`design-tokens-spec.md`](./design-tokens-spec.md) (token reference)
> Implementation: `src/index.css` (@theme + base + utilities + components)

## What this is

The **rules of engagement** for visual design + interaction across SMIT-OS. Token reference is in the companion doc; this file covers principles, accessibility, motion, and what to do/avoid.

## What this is not

- Not a component library — see Phase 4 (`docs/component-library.md`, future)
- Not a wireframe spec — see Phase 3 mockups (`plans/.../reports/mockup-*.md`, future)
- Not Figma — Google Stitch AI is mockup tool

---

## Core principles

1. **Tokens are the contract.** Inline hex / raw px values = drift. If a token doesn't exist, propose adding one — don't bypass.
2. **Material 3 + Glass.** Brand identity = Material Design 3 color system + glassmorphism container pattern.
3. **Mobile-first, desktop-emphasized.** Default styles = mobile. Tablet (`md:`, ≥768) and desktop (`xl:`, ≥1280) progressively enhance.
4. **Tablet is a first-class viewport.** Many admin users on iPad. Don't treat `md:` as throwaway.
5. **Density follows context.** Tables = compact (small text, tight rows). Marketing pages = airy. Dashboards = balanced.
6. **Motion is meaningful.** Fast for feedback, medium for state, slow for hierarchy. Always respect `prefers-reduced-motion`.
7. **A11y is the floor, not the ceiling.** WCAG 2.1 AA = required. Better than that = welcome.

---

## Color usage rules

### Where to use brand colors

| Color | Where | Where NOT |
|---|---|---|
| `primary` | Primary CTA, active state, link | Body text |
| `secondary` | Highlight chips, accent (sparingly) | Primary actions |
| `tertiary` | Success-adjacent (alongside `success`) | General accent |

### Where to use surface family

- Page background: `bg-surface`
- Card on page: `bg-white/50` glass OR `bg-surface-container-low`
- Card on card (nested): `bg-surface-container`
- Input field: `bg-surface-container-low` border `border-outline-variant`

### Where to use status colors

| Use case | Color |
|---|---|
| Success state, KR done, confirmed action | `success` |
| At-risk OKR, expiring deadline | `warning` |
| Failed action, validation error | `error` |
| Informational tooltip, empty state hint | `info` |

**DON'T:** use `error` for "delete" buttons by default — destructive intent is shown via icon + confirm dialog. Reserve `error` for actual failure states.

### Slate is going away

The `text-slate-*`/`bg-slate-*` ladder competes with M3 surface family. **Phase 8 codemod will migrate.** Don't add new slate references; use M3 tokens instead.

---

## Typography rules

### Page header (canonical)

```tsx
<header className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)]">
  <div>
    {/* Breadcrumb */}
    <nav className="flex items-center gap-2 mb-2 text-on-surface-variant text-sm">
      <span className="hover:text-primary cursor-pointer">Group</span>
      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
      <span className="text-on-surface">Page Name</span>
    </nav>

    {/* Title — italic accent on the second word */}
    <h2 className="text-h2 font-extrabold font-headline tracking-tight text-on-surface">
      Page <span className="text-primary italic">Name</span>
    </h2>
  </div>

  <div className="flex items-center gap-3">{/* Right actions */}</div>
</header>
```

**Rule:** every in-app page (not LoginPage) MUST follow this pattern. Phase 4 ships `<PageHeader>` primitive that enforces it.

### Body text

- Default: `text-body` (14px) `text-on-surface`
- Secondary/help: `text-body-sm` (13px) `text-on-surface-variant`
- Caption: `text-caption` (11px) `text-on-surface-variant`
- Form label: `text-label` (12px) `text-on-surface` `font-medium uppercase tracking-widest`

### Numerals

Use `font-headline` (Manrope) for all numbers in data displays — its tabular numerals align in tables/dashboards.

### Avoid

- ❌ `text-slate-800` → use `text-on-surface`
- ❌ `text-[9px]`, `text-[11px]` (random sizes) → use scale tokens
- ❌ `font-bold` on body text → reserve for headings/emphasis

---

## Spacing rules

### Page-level

```
[Page Header]                    margin-bottom: var(--space-lg)
[Bento metric grid]              margin-bottom: var(--space-xl)
[Filters + Content panels]       gap: var(--space-lg)
```

### Card-level

```
.card {
  padding: var(--space-md);                    /* mobile */
  padding: var(--space-lg);                    /* tablet+ */
  border-radius: var(--radius-card);
  gap: var(--space-md);                        /* between elements */
}
```

### Form-level

- Field-to-field vertical gap: `var(--space-md)`
- Label-to-input gap: `var(--space-xs)`
- Inline error gap: `var(--space-xs)` (close to input)

---

## Container patterns

### Glass card (default)

```tsx
<div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm p-4 xl:p-6">
  {/* content */}
</div>
```

OR use the class shortcut (preferred):

```tsx
<div className="glass-card rounded-3xl p-4 xl:p-6">
  {/* content */}
</div>
```

### Bento metric card (signature)

Includes decorative blob — phase 4 will ship as `<BentoMetricCard>`:

```tsx
<div className="bg-white/50 backdrop-blur-md border border-white/20 p-4 xl:p-6 rounded-3xl shadow-sm flex flex-col gap-2 relative overflow-hidden group">
  <div className="absolute top-0 right-0 w-20 h-20 xl:w-32 xl:h-32 bg-primary/5 rounded-full -mr-10 -mt-10 xl:-mr-16 xl:-mt-16 group-hover:scale-150 transition-transform duration-700" />
  <p className="text-caption font-black text-on-surface-variant uppercase tracking-widest relative z-10">Label</p>
  <h4 className="text-h4 xl:text-h2 font-black font-headline relative z-10">42.5%</h4>
</div>
```

### Modal/Dialog

Use `<Modal>` component (Phase 4). Until then:

```tsx
<div className="fixed inset-0 z-modal bg-on-surface/40 backdrop-blur-sm flex items-center justify-center">
  <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full mx-4 p-6">
    {/* content */}
  </div>
</div>
```

---

## Motion rules

| Interaction | Duration | Easing |
|---|---|---|
| Hover state (button, link) | `--duration-instant` (75ms) | `--ease-standard` |
| Color/opacity transition | `--duration-fast` (150ms) | `--ease-standard` |
| Card lift, tab switch | `--duration-medium` (250ms) | `--ease-standard` |
| Modal/dialog enter | `--duration-slow` (400ms) | `--ease-decelerate` |
| Modal/dialog exit | `--duration-slow` (400ms) | `--ease-accelerate` |
| Page transition | `--duration-slower` (600ms) | `--ease-emphasized` |

**Always:** wrap motion in `motion-reduce:transition-none` when needed OR rely on global `prefers-reduced-motion` handling (already in `@layer base`).

**Tools:** `motion/react` (Framer) for complex enter/exit. Tailwind `transition-*` for simple hover/active states.

---

## A11y baseline

### WCAG 2.1 AA targets

- **Color contrast:** 4.5:1 normal text, 3:1 large text. M3 token pairs (e.g., `primary` / `on-primary`) verified.
- **Touch targets:** ≥ 44px (use `--touch-min` or `.touch-target` utility).
- **Focus visible:** keyboard focus ring shipped globally (`:focus-visible { box-shadow: var(--shadow-focus); }`). Don't override per-component.
- **Reduced motion:** global `@media (prefers-reduced-motion: reduce)` shrinks animation to 0.01ms.

### Required attributes

- Icon-only buttons MUST have `aria-label` (TS rule via Phase 4 `<Button>` enforce).
- Tab containers MUST have `role="tablist"`, tabs MUST have `role="tab" aria-selected`.
- Modals MUST have `role="dialog" aria-modal="true" aria-labelledby="..."` + focus trap.
- Form inputs MUST have associated `<label>` (or `aria-label`).

### Forbidden

- ❌ `alert()` for error display (replace with toast — Phase 4)
- ❌ Emoji-only icons without `aria-label` (replace with Material Symbols + label)
- ❌ Color-only state indicators (always pair color with icon or text)

---

## Responsive rules

### Breakpoints (post-Phase 2)

| Prefix | Min-width | Persona |
|---|---|---|
| (none) | 0 | Phone portrait |
| `sm:` | 640px | Phone landscape, phablet |
| `md:` | 768px | Tablet portrait |
| `lg:` | 1024px | Tablet landscape, small laptop |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Wide desktop |

### Page layout patterns

| Pattern | Mobile | Tablet (`md:`) | Desktop (`xl:`) |
|---|---|---|---|
| Header | column stack | row | row |
| Bento metrics | 2 cols | 2-3 cols | 4 cols |
| Filters bar | column | row wrap | row |
| Sidebar | drawer | drawer or static | static |
| Content + side panel | stack | stack or split | split |

### Test devices

- **Mobile critical:** ≥ 375px (iPhone SE), 390px (iPhone 12-15)
- **Tablet critical:** 768px (iPad portrait), 1024px (iPad landscape)
- **Desktop:** 1280px, 1440px, 1920px

---

## Checklist for new component / page

- [ ] Uses tokens (no inline hex, no raw px outside spacing scale)
- [ ] Follows page header / card pattern
- [ ] Mobile (375px) tested
- [ ] Tablet (768px) tested
- [ ] Desktop (1280px+) tested
- [ ] Touch targets ≥ 44px on mobile
- [ ] Keyboard navigable (Tab, Esc, Enter, Arrow)
- [ ] Focus ring visible (`:focus-visible`)
- [ ] `aria-label` on icon-only buttons
- [ ] Status changes visible to screen reader
- [ ] Reduced-motion respected
- [ ] Loading state present (skeleton or spinner)
- [ ] Error state present (banner, NOT alert())
- [ ] Empty state present (with CTA)
- [ ] Lighthouse Accessibility ≥ 90 (Phase 8 verify)

---

## What's deferred (post-Phase 2)

- **Component tokens** (`--button-padding`, `--card-shadow-hover` etc) — Phase 4 emerges from primitives
- **Density modes** (compact/comfortable/spacious) — Phase 8 if user requests
- **Dark theme** — architecture-ready (M3 base supports), not scoped
- **Print stylesheets** — out of scope
- **i18n typography** — Vietnamese-only acceptable indefinitely (per Phase 1 decision)
- **Keyboard shortcut layer** (Cmd-K, j/k) — Phase 4-8 if user requests

---

## Source of truth migration

| Doc | Status |
|---|---|
| **`design-tokens-spec.md`** | ✅ Source of truth (Phase 2 ship) |
| **`design-system-foundation.md`** (this) | ✅ Source of truth (Phase 2 ship) |
| `ui-style-guide.md` | 🟡 Deprecated end of Phase 8. Until then: secondary reference. New code MUST follow this doc + token spec. |

---

## Update protocol

This document is **versioned with the codebase** (lives in `docs/`). Changes require:
1. Update this doc + `design-tokens-spec.md`
2. Update `src/index.css` `@theme` if tokens change
3. Add changelog entry in `docs/project-changelog.md`
4. Communicate breaking changes in PR description

Tokens are an interface contract. Breaking changes ≥ semver minor.
