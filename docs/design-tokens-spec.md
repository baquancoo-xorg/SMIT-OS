---
title: "SMIT-OS v3 Design Tokens Spec"
description: "Apple Bento Luminous palette — source of truth for all color/spacing/typography/motion decisions"
version: v3
status: live
date: 2026-05-12
direction: "Bento 3D Apple Premium (Luminous B2B Operations)"
source: src/index.css
---

# Design Tokens v3 (Apple Bento)

> Migrated from v2 Material Design 3 (2026-05-10) → v3 Apple Bento (2026-05-12).
> Token NAMES preserved for component compat; VALUES swapped per Stitch direction winner.

## Brand

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#007aff` | Apple blue — primary CTA, links, active states |
| `--color-on-primary` | `#ffffff` | Text on primary surfaces |
| `--color-primary-container` | `#0070eb` | Hover/active primary container |
| `--color-on-primary-container` | `#fefcff` | Text on primary container |
| `--color-secondary` | `#bf5af2` | Apple purple — secondary actions, AI/predictive indicators |
| `--color-on-secondary` | `#ffffff` | |
| `--color-secondary-container` | `#f6d9ff` | |
| `--color-on-secondary-container` | `#4a006b` | |
| `--color-tertiary` | `#34c759` | Apple green — positive trends, "closed-won", healthy status |
| `--color-on-tertiary` | `#ffffff` | |
| `--color-tertiary-container` | `#d1fadf` | |
| `--color-on-tertiary-container` | `#00531c` | |

## Surfaces (lavender-white tint progression)

| Token | Value |
|---|---|
| `--color-surface` | `#faf9fe` (page background) |
| `--color-on-surface` | `#1a1b1f` (primary text) |
| `--color-on-surface-variant` | `#414755` (muted text, captions) |
| `--color-surface-container-lowest` | `#ffffff` (cards, modals) |
| `--color-surface-container-low` | `#f4f3f8` (sidebar bg) |
| `--color-surface-container` | `#eeedf3` (section dividers) |
| `--color-surface-container-high` | `#e9e7ed` (hover state) |
| `--color-surface-container-highest` | `#e3e2e7` (active state) |
| `--color-outline` | `#717786` (input borders) |
| `--color-outline-variant` | `#c1c6d7` (subtle dividers) |

## Status colors (semantic, kept from v2)

`success` (`#009966`), `warning` (`#d97706`), `error` (`#b31b25`), `info` (`#0284c7`) — each has `on-*` + `*-container` + `on-*-container` variants. See `src/index.css`.

## Department colors

`dept-bod` (`#6e47ff`), `dept-tech` (`#0059b6`), `dept-marketing` (`#f54a00`), `dept-media` (`#e60076`), `dept-sale` (`#009966`)

## Typography

**Font stack** (v3):
- `--font-headline: "Hanken Grotesk", sans-serif`
- `--font-sans: "Hanken Grotesk", "Inter", ui-sans-serif, system-ui, sans-serif`

Loaded via Google Fonts. Hanken Grotesk weights: 400, 500, 600, 700, 800.

**Scale** (modular 1.25):

| Token | Value | px |
|---|---|---|
| `--text-caption` | 0.6875rem | 11px |
| `--text-label` | 0.75rem | 12px (uppercase tags) |
| `--text-body-sm` | 0.8125rem | 13px |
| `--text-body` | 0.875rem | 14px (default) |
| `--text-body-lg` | 1rem | 16px |
| `--text-h6` | 1.125rem | 18px |
| `--text-h5` | 1.25rem | 20px |
| `--text-h4` | 1.5rem | 24px |
| `--text-h3` | 1.875rem | 30px |
| `--text-h2` | 2.25rem | 36px (page title) |
| `--text-h1` | 3rem | 48px |
| `--text-display` | 3.75rem | 60px (hero) |

**Leading**: `--leading-tight 1.2` / `--leading-snug 1.35` / `--leading-base 1.5` / `--leading-loose 1.75`

**Tracking**: `--tracking-tight -0.02em` / `--tracking-normal 0` / `--tracking-wide 0.02em` / `--tracking-widest 0.1em`

## Radius (semantic-first, generic kept for migration)

| Semantic | Value | Use |
|---|---|---|
| `--radius-button` | 9999px | Pill buttons (primary CTA) |
| `--radius-chip` | 9999px | Status pills, badges |
| `--radius-input` | 16px | Inputs, selects |
| `--radius-card` | 24px | Bento cards |
| `--radius-modal` | 24px | Modals/dialogs |

Generic stops: `--radius-sm 6px / DEFAULT 8px / md 10px / lg 12px / xl 16px / 2xl 20px / 3xl 24px / full 9999px`

## Spacing (clamp-based responsive)

`--space-xs` → `--space-3xl` (4-64px responsive via `clamp()`). See `src/index.css` for exact clamps.

## Shadows (v3 chromatic blue-tinted — signature Apple Bento depth)

| Token | Value | Use |
|---|---|---|
| `--shadow-xs` | 0 1px 2px rgba(0,122,255,0.04) | Subtle outline |
| `--shadow-sm` | 0 1px 3px + 0 1px 2px chromatic | Inputs, dropdowns |
| `--shadow-md` | 0 4px 6px + 0 2px 4px chromatic | Hover lift |
| `--shadow-lg` | 0 4px 20px rgba(0,122,255,0.08) | **Bento tile (signature Level 1)** |
| `--shadow-xl` | 0 12px 32px rgba(0,122,255,0.12) | **Hover/active (Level 2)** |
| `--shadow-2xl` | 0 20px 40px + 0 30px 60px multi-layer | Modal/overlay (Level 3) |
| `--shadow-glass` | alias of `--shadow-lg` | Compat for v2 component refs |
| `--shadow-focus` | 0 0 0 3px rgba(0,122,255,0.3) | :focus-visible ring |

## Motion

`--duration-instant 75ms / fast 150ms / medium 250ms / slow 400ms / slower 600ms`

`--ease-standard cubic-bezier(0.2,0,0,1)` (Material standard — kept for compat with `motion-medium` class etc.)

## Z-index layers

`--z-base 0 / sticky 10 / sidebar 20 / header 30 / dropdown 40 / modal 50 / toast 60 / tooltip 70`

## Touch targets (a11y)

`--touch-min 44px` (WCAG 2.1) / `--touch-comfort 48px` (recommended)

## Breakpoints (Tailwind defaults)

`sm 640px / md 768px / lg 1024px / xl 1280px / 2xl 1536px`

## Migration Notes (v2 → v3)

### What changed
- Fonts: Manrope → Hanken Grotesk
- Primary blue: `#0059b6` → `#007aff` (Apple-ier, brighter)
- Secondary: coral `#a03a0f` → purple `#bf5af2` (Apple aesthetic alignment)
- Surfaces: blue-tinted → lavender-tinted (warmer light mode feel)
- On-surface: `#222d51` → `#1a1b1f` (more neutral)
- Shadows: slate-tint (rgba 34,45,81,*) → blue-tint (rgba 0,122,255,*)

### What stayed
- Token NAMES (no component breaks)
- Status/department color semantics
- Typography scale (text-h1 through text-caption)
- Spacing scale (clamp-based)
- Radius semantic names (button/chip/input/card/modal)
- Breakpoints, z-index, motion timings

### Component compat
- `.glass-panel` + `.glass-card` aliases retained → internally swapped to Bento (solid white + chromatic shadow, no backdrop-blur)
- New `.bento-tile` canonical class — use for all new bento components
- New `.apple-gradient` (Apple blue logo gradient `#007aff → #5856d6`); `.soft-gradient` aliased; `.coral-gradient` swapped to Apple purple

## Source of truth

`src/index.css` is the canonical token definition. This doc reflects values as of 2026-05-12. Any change to tokens MUST update both files in same commit.
