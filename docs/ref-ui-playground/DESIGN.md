# SMIT OS Design System — Playground v4 Canon

**Version:** 1.0  
**Date:** 2026-05-14  
**Source:** `Playground .html` v4 + Stitch extension  
**Status:** Canonical — code targets must match 1:1

---

## 1. Color System

### 1.1 Color Space

All colors use **OKLCH** for perceptually uniform blending. Hex values listed for reference only — use CSS variables in code.

### 1.2 Brand Palette

```css
--brand-50:  #fff5ee;   /* Light tint */
--brand-100: #ffe5d4;
--brand-200: #ffcda8;
--brand-300: #ffaa70;
--brand-400: #ff8a47;
--brand-500: #ff6d29;   /* Canonical accent */
--brand-600: #e5511a;
--brand-700: #bd3d11;
--brand-800: #8f2d0a;
--brand-900: #6a1f05;
--brand-950: #3b0f02;   /* Dark tint */
```

**Usage rules:**
- `--brand-500` is the source of truth for accent color
- Primary CTA uses dark gradient + orange beam/icon — NOT solid orange fill
- Tabs/nav/checkbox: no solid orange fill
- Solid orange allowed ONLY for data viz intensity/status

### 1.3 Warm Palette (Background)

```css
--warm-50:  #f7f0eb;
--warm-100: #ecdcd0;
--warm-200: #d4b8a3;
--warm-300: #b9967a;
--warm-400: #957058;
--warm-500: #71523f;
--warm-600: #5a4031;
--warm-700: #453027;
--warm-800: #30221c;
--warm-900: #1f1612;
--warm-950: #0d0d0d;
```

### 1.4 Neutral Palette

```css
--neutral-50:  #fafafa;   /* oklch(98.5% 0 0) */
--neutral-100: #f4f4f5;
--neutral-200: #e4e4e7;
--neutral-300: #d4d4d8;
--neutral-400: #bababa;   /* oklch(70.8% 0 0) */
--neutral-500: #8a8a8c;   /* oklch(55.6% 0 0) */
--neutral-600: #5e5e60;   /* oklch(43.9% 0 0) */
--neutral-700: #3f3d40;   /* oklch(37.1% 0 0) */
--neutral-800: #27252a;   /* oklch(26.9% 0 0) */
--neutral-900: #1d1a1c;   /* oklch(20.5% 0 0) */
--neutral-950: #161316;   /* oklch(14.5% 0 0) */
```

### 1.5 Semantic Colors

```css
/* Status - Raw values */
--raw-success:    #10b981;   /* Emerald */
--raw-warning:    #f59e0b;   /* Amber */
--raw-error:      #ef4444;   /* Red */
--raw-info:       #0ea5e9;   /* Sky */

/* Workflow States */
--raw-in-progress:   #06b6d4;   /* Cyan */
--raw-to-do:         #8b5cf6;   /* Violet */
--raw-in-review:     #d4a017;   /* Gold */
--raw-design-review: #a855f7;   /* Purple */
--raw-rework:        #dc2626;   /* Red-dark */
--raw-done:          #10b981;   /* Green */
--raw-not-started:   #f43f5e;   /* Rose */
--raw-blocked:       #ef4444;   /* Red */
--raw-on-hold:       #0ea5e9;   /* Sky */
--raw-archived:      #a1a1aa;   /* Neutral */
```

### 1.6 Department Colors

```css
--color-dept-bod:       #8e75ff;   /* Board — Purple */
--color-dept-tech:      #7bb7ff;   /* Tech — Blue */
--color-dept-marketing: var(--brand-500);   /* Marketing — Orange */
--color-dept-media:     #ff7eb6;   /* Media — Pink */
--color-dept-sale:      var(--status-success);   /* Sale — Green */
```

### 1.7 Dark Theme Semantic Mapping

```css
html[data-theme="dark"], :root {
  --color-surface:          var(--neutral-950);
  --color-surface-elevated: var(--neutral-900);
  --color-surface-overlay:  var(--neutral-800);
  --color-surface-popover:  #221f23;
  --color-surface-warm:     var(--warm-700);

  --color-fg:        #ffffff;
  --color-fg-muted:  var(--neutral-400);
  --color-fg-subtle: var(--neutral-500);
  --color-fg-faint:  var(--neutral-600);

  --color-outline:        var(--neutral-700);
  --color-outline-subtle: color-mix(in srgb, var(--neutral-800) 60%, transparent);

  --color-accent:       var(--brand-500);
  --color-accent-hover: var(--brand-400);
  --color-accent-soft:  color-mix(in srgb, var(--brand-500) 15%, transparent);
}
```

### 1.8 Light Theme Semantic Mapping

```css
html[data-theme="light"] {
  --sys-color-bg:           #f7f1ea;
  --sys-color-bg-elevated:  #fffaf5;
  --sys-color-surface:      #fffaf5;
  --sys-color-surface-2:    #f0e7dc;
  --sys-color-surface-3:    #e8dccf;
  --sys-color-surface-glass: rgba(255, 250, 245, 0.78);

  --sys-color-text-1:     #171412;
  --sys-color-text-2:     #51463f;
  --sys-color-text-muted: #756b63;

  --sys-color-border:        rgba(69, 48, 39, 0.12);
  --sys-color-border-strong: rgba(69, 48, 39, 0.22);

  --sys-color-accent:      var(--brand-600);   /* Slightly darker for light bg */
  --sys-color-accent-text: #a13d0f;
  --sys-color-accent-dim:  rgba(217, 87, 22, 0.12);
}
```

---

## 2. Typography

### 2.1 Font Stack

```css
--font-sans:     "Hanken Grotesk", "Inter", ui-sans-serif, system-ui, sans-serif;
--font-headline: "Hanken Grotesk", sans-serif;
--font-mono:     ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

**Loading:** `font-display: swap`; preload weights 500/600/700 only.

### 2.2 Type Scale

```css
--text-caption:  0.6875rem;   /* 11px */
--text-label:    0.75rem;     /* 12px */
--text-body-sm:  0.8125rem;   /* 13px */
--text-body:     0.875rem;    /* 14px */
--text-body-lg:  1rem;        /* 16px */
--text-h6:       1.125rem;    /* 18px */
--text-h5:       1.25rem;     /* 20px */
--text-h4:       1.5rem;      /* 24px */
--text-h3:       1.875rem;    /* 30px */
--text-h2:       2.25rem;     /* 36px */
--text-h1:       3rem;        /* 48px */
--text-display:  3.75rem;     /* 60px */
```

### 2.3 Line Height & Tracking

```css
--leading-tight:   1.2;
--leading-snug:    1.35;
--leading-base:    1.5;
--leading-relaxed: 1.625;
--leading-loose:   1.75;

--tracking-tighter: -0.05em;
--tracking-tight:   -0.02em;
--tracking-normal:   0;
--tracking-wide:     0.02em;
--tracking-widest:   0.1em;
```

**Caption rule:** Uppercase, `--tracking-widest`.

---

## 3. Radius

| Element       | Value        | Token                |
|---------------|--------------|----------------------|
| Card          | `1.25rem`    | `--radius-card`      |
| Modal/Callout | `1.5rem`     | `--radius-modal`     |
| Input/Select  | `0.75rem`    | `--radius-input`     |
| Button/Chip   | `9999px`     | `--radius-button`    |
| Badge         | `9999px`     | `--radius-chip`      |

**Playground vs index.css drift:**
- Playground: card `1.5rem` (dark), `1.25rem` (v5 index.css)
- Decision: Use playground values for new components

---

## 4. Shadow

### 4.1 Dark Mode Shadows

```css
--shadow-card:     0 1px 2px 0 rgb(0 0 0 / 0.4), 0 1px 3px 0 rgb(0 0 0 / 0.3);
--shadow-elevated: 0 4px 12px -2px rgb(0 0 0 / 0.5), 0 2px 4px -1px rgb(0 0 0 / 0.4);
--shadow-focus:    0 0 0 2px var(--neutral-950), 0 0 0 4px color-mix(in srgb, var(--brand-500) 60%, transparent);
--shadow-glow:     0 0 12px 0 color-mix(in srgb, var(--brand-500) 35%, transparent);
```

### 4.2 Light Mode Shadows

```css
--shadow-card:     0 1px 2px 0 rgba(69, 48, 39, 0.12), 0 1px 3px 0 rgba(69, 48, 39, 0.08);
--shadow-elevated: 0 4px 12px -2px rgba(69, 48, 39, 0.15), 0 2px 4px -1px rgba(69, 48, 39, 0.10);
```

**No ambient `shadow-lg/xl` on cards** — use `--shadow-card` only. Elevated shadow for modals/dropdowns.

---

## 5. Motion

### 5.1 Duration Tokens

```css
--duration-fast:   150ms;
--duration-medium: 250ms;
--duration-slow:   400ms;
```

### 5.2 Easing Functions

```css
--ease-standard:   cubic-bezier(0.2, 0, 0, 1);
--ease-decelerate: cubic-bezier(0, 0, 0, 1);
--ease-accelerate: cubic-bezier(0.3, 0, 1, 1);
--ease-emphasized: cubic-bezier(0.2, 0, 0, 1);
```

### 5.3 Motion Rules

- Hover lift: `translateY(-1px)` max
- `prefers-reduced-motion`: disable animations
- Page transitions: none unless approved

---

## 6. Primary CTA DNA

The signature primary button style — **MANDATORY** for all primary actions.

```css
/* Structure */
.btn-primary {
  position: relative;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--brand-500) 30%, transparent);
  background: linear-gradient(135deg, #1a1714 0%, #2e2925 100%);
  color: var(--color-fg);
  box-shadow: var(--shadow-card);
  border-radius: var(--radius-button);
}

/* Orange beam (top edge) */
.btn-primary::before {
  content: '';
  position: absolute;
  inset-inline: 0.75rem;
  top: 0;
  height: 1px;
  background: color-mix(in srgb, var(--brand-500) 60%, transparent);
}

/* Icon accent */
.btn-primary svg {
  color: var(--brand-500);
}

/* Hover */
.btn-primary:hover {
  border-color: color-mix(in srgb, var(--brand-500) 50%, transparent);
  box-shadow: var(--shadow-glow);
}
```

**NEVER use solid orange background for CTA buttons.**

---

## 7. Spacing System

### 7.1 Fluid Spacing

```css
--spacing-tight: clamp(0.25rem, 0.5vw, 0.5rem);
--spacing-snug:  clamp(0.5rem, 1vw, 0.75rem);
--spacing-cozy:  clamp(0.75rem, 1.5vw, 1rem);
--spacing-comfy: clamp(1rem, 2vw, 1.5rem);
--spacing-wide:  clamp(1.5rem, 3vw, 2rem);
--spacing-vast:  clamp(2rem, 4vw, 3rem);
--spacing-huge:  clamp(3rem, 6vw, 4rem);
```

### 7.2 Layout Tokens

```css
--header-h:    4rem;
--content-h:   calc(100dvh - var(--header-h));
--touch-min:   44px;
--sidebar-width: 18.5rem;
--sidebar-width-collapsed: 5.25rem;
```

---

## 8. Z-Index Scale

```css
--z-sidebar:  20;
--z-header:   30;
--z-dropdown: 40;
--z-modal:    50;
--z-toast:    60;
--z-tooltip:  70;
```

---

## 9. Light + Dark Parity Map

All components must work in both themes. Key differences:

| Token              | Dark              | Light              |
|--------------------|-------------------|--------------------|
| Background         | `--warm-950`      | `#f7f1ea`          |
| Surface            | `--warm-900`      | `#fffaf5`          |
| Text primary       | `#ffffff`         | `#171412`          |
| Text muted         | `--neutral-400`   | `#756b63`          |
| Border             | `rgba(255,255,255,0.08)` | `rgba(69,48,39,0.12)` |
| Accent             | `--brand-500`     | `--brand-600`      |
| Shadow base        | Black 40%/30%     | Warm 12%/8%        |

---

## 10. Missing Primitives (Stitch Extension)

Components not in Playground v4 that need Stitch-generated reference:

1. **Checkbox** — surface + accent border/check, NO solid orange
2. **Switch** — toggle with accent indicator
3. **RadioGroup** — radio buttons
4. **Tooltip** — rich tooltip, keyboard reachable
5. **Textarea** — auto-resize option
6. **MultiSelect** — filter with multiple selection
7. **Combobox** — searchable select
8. **ProgressBar** — determinate + indeterminate
9. **FileUpload** — drag-drop accessible
10. **Chart wrappers** — line, bar, pie, donut, heatmap, funnel, sparkline

Each must be generated with:
- Dark + light variant
- OKLCH color tokens
- Primary CTA DNA (for apply buttons)
- Loading/empty/error states for charts

---

## 11. Usage Rules Summary

| DO                                          | DON'T                                    |
|---------------------------------------------|------------------------------------------|
| Use CSS variables for all colors            | Hardcode hex in components               |
| Primary CTA = dark gradient + orange beam   | Solid orange CTA background              |
| `--shadow-card` for cards                   | `shadow-lg/xl` arbitrary                 |
| `--radius-card` = 1.25rem                   | `rounded-xl/2xl/3xl` arbitrary           |
| Semantic color tokens for status            | Random Tailwind color classes            |
| Dark + light parity from day 1              | Dark-only then retrofit light            |
| `prefers-reduced-motion` honored            | Animation without motion query           |

---

**End of Design System Specification**
