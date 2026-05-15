# ADR-001: SMIT OS v6 Frontend Design System

**Status:** Accepted **Date:** 2026-05-15 **Author:** Dominium **Supersedes:** SMIT OS v5 component library (`src/components/v5/`)

---

## Mục lục

 1. [Bối cảnh & Quyết định](https://claude.ai/chat/cec27120-4546-45c6-894a-8dde600a983f#1-b%E1%BB%91i-c%E1%BA%A3nh--quy%E1%BA%BFt-%C4%91%E1%BB%8Bnh)
 2. [Design Philosophy](https://claude.ai/chat/cec27120-4546-45c6-894a-8dde600a983f#2-design-philosophy)
 3. [Design Tokens](https://claude.ai/chat/cec27120-4546-45c6-894a-8dde600a983f#3-design-tokens)
 4. [Component Anatomy — Button](https://claude.ai/chat/cec27120-4546-45c6-894a-8dde600a983f#4-component-anatomy--button)
 5. [Component Anatomy — Logo Mark](https://claude.ai/chat/cec27120-4546-45c6-894a-8dde600a983f#5-component-anatomy--logo-mark)
 6. [Component Conventions](https://claude.ai/chat/cec27120-4546-45c6-894a-8dde600a983f#6-component-conventions)
 7. [Motion System](https://claude.ai/chat/cec27120-4546-45c6-894a-8dde600a983f#7-motion-system)
 8. [Stack & Dependencies](https://claude.ai/chat/cec27120-4546-45c6-894a-8dde600a983f#8-stack--dependencies)
 9. [Migration Strategy (Strangler Fig)](https://claude.ai/chat/cec27120-4546-45c6-894a-8dde600a983f#9-migration-strategy-strangler-fig)
10. [Forbidden Patterns (Anti-patterns từ v5)](https://claude.ai/chat/cec27120-4546-45c6-894a-8dde600a983f#10-forbidden-patterns-anti-patterns-t%E1%BB%AB-v5)
11. [Testing Strategy](https://claude.ai/chat/cec27120-4546-45c6-894a-8dde600a983f#11-testing-strategy)
12. [File Structure](https://claude.ai/chat/cec27120-4546-45c6-894a-8dde600a983f#12-file-structure)

---

## 1. Bối cảnh & Quyết định

### 1.1 Tại sao rebuild?

v5 hiện tại có \~150+ components, đang chạy production, nhưng có 4 vấn đề cốt lõi:

1. **Typography over-engineered**: `font-black` (weight 900) dùng khắp nơi với annotation `// ui-canon-ok: font-black for KPI` ở 8+ file. Đây là nguyên nhân chính khiến app cảm giác "thô".
2. **Glass-morphism abuse**: `GlassCard` với `backdrop-blur-md` xuất hiện trong 40+ vị trí, mất cảm giác layer hierarchy.
3. **Glow always-on**: Decorative blobs ở góc card, dot, badge — luôn glow thay vì chỉ hover.
4. **Motion vắng mặt**: Không có page transition, list stagger, spring physics, hay micro-interaction nào meaningful. Cảm giác "tĩnh".

### 1.2 Quyết định

Xây dựng lại UI layer theo **strangler fig pattern**: build `src/ui/` parallel với `src/components/v5/`, migrate từng route, xóa v5, đổi tên `src/ui/` thành `src/components/`.

**Giữ nguyên (không đập)**:

- Hooks (`use-lead-flow`, `use-product-dashboard`, `use-ads-tracker`, ...)
- API client (`lib/api.ts`), types
- Contexts (Auth, Theme, Density)
- Recharts wrappers — chỉ restyling tokens, không rewrite
- React Query setup, React Router 7 routes
- Business logic, validation logic

**Thay thế**:

- Toàn bộ `src/components/v5/ui/*`
- Layout shell, sidebar, header
- Toast, Modal, Form components
- Page templates (giữ data flow, đổi UI)

---

## 2. Design Philosophy

### 2.1 Reference benchmarks

App phải có cảm giác như **Linear + Vercel + Stripe**: clean, premium, motion-rich nhưng không loè loẹt.

Cụ thể:

- **Linear**: Multi-layer button (gradient + sheen + halo), spring animations cho mọi transform, restrained colors.
- **Vercel**: Typography hierarchy với weight 400/500 only, hairline borders, subtle shadows.
- **Stripe**: Sheen sweep trên hero CTA, perfect tabular numbers, micro-interactions everywhere.

### 2.2 5 Golden Rules

Mọi component v6 phải tuân thủ:

1. **Typography**: Chỉ dùng 2 font weights (400 regular, 500 medium). **CẤM** `font-black`, `font-extrabold`, `font-bold`. **CẤM** `uppercase tracking-widest` cho mọi label thường — chỉ dùng cho section headers trong sidebar.
2. **Glass-morphism**: Chỉ dùng trong 1 trường hợp duy nhất — **header bar** với `backdrop-blur`. Cards luôn flat solid.
3. **Glow**: Chỉ trên **hover** + chỉ trên **2 component**: Primary Button (V3 sheen variant) và featured KpiCard. **CẤM** glow ở card thường, badge, dot, icon.
4. **Motion**: Dùng **spring physics** cho mọi transform (scale, translate). Dùng **cubic-bezier** cho color/opacity. **CẤM** dùng `duration-300` mặc định của Tailwind cho transform.
5. **One file per component, &lt; 200 lines**. Nếu vượt → tách subcomponent (e.g. `Sidebar.tsx` + `SidebarNavItem.tsx` + `SidebarSectionLabel.tsx`).

### 2.3 Glow doctrine: "1 điểm glow per màn"

Mỗi route hiển thị tối đa 1 điểm có glow active. Logic chọn:

- Trang có hero CTA → glow ở Primary Button đó
- Trang dashboard → glow ở 1 KPI card "featured" (top-left)
- Trang form-heavy (Daily Sync, Check-in) → glow ở submit button cuối
- Trang table-heavy (Leads, Ads, Media) → glow ở "Create new" button top-right

Logo mark trong sidebar có pulse 2 lần khi route đổi nhưng KHÔNG tính vào quota "1 glow per màn" — nó là indicator chứ không phải CTA.

---

## 3. Design Tokens

### 3.1 Color tokens

Source of truth là logo identity của SMIT OS (file `stitch_smit_os_identity_exploration.zip`).

**Primary palette (SMIT Orange):**

```css
/* Hex source: #ff5c00 từ primary-container của logo */
--primary:           oklch(0.683 0.213 38.5);   /* base */
--primary-hover:     oklch(0.71 0.215 38.5);    /* +brightness on hover */
--primary-pressed:   oklch(0.64 0.205 38.5);    /* -brightness on active */
--primary-bright:    oklch(0.76 0.215 38.5);    /* highlight/sheen */
--primary-fg:        oklch(0.99 0 0);            /* white text on primary */

/* Glow alpha values */
--primary-glow:        oklch(0.683 0.213 38.5 / 0.45);
--primary-glow-soft:   oklch(0.683 0.213 38.5 / 0.20);
--primary-glow-strong: oklch(0.683 0.213 38.5 / 0.65);

/* Border tints */
--primary-border:        oklch(0.683 0.213 38.5 / 0.55);
--primary-border-strong: oklch(0.683 0.213 38.5 / 0.85);

/* Soft fill (cho tinted backgrounds) */
--primary-soft:    oklch(0.683 0.213 38.5 / 0.10);
--primary-soft-2:  oklch(0.683 0.213 38.5 / 0.18);
```

**Dark mode (calibrated to logo #131313 background):**

```css
.dark {
  --bg:            oklch(0.165 0.003 60);
  --surface:       oklch(0.195 0.005 60);
  --surface-2:     oklch(0.225 0.006 60);
  --surface-3:     oklch(0.265 0.007 60);
  --border:        oklch(0.28 0.007 60);
  --border-strong: oklch(0.34 0.009 60);
  --text-1:        oklch(0.97 0.002 60);  /* primary text */
  --text-2:        oklch(0.74 0.006 60);  /* secondary text */
  --text-3:        oklch(0.55 0.008 60);  /* muted */
  --success:       oklch(0.72 0.16 145);
  --danger:        oklch(0.7 0.18 27);
  --warning:       oklch(0.78 0.16 75);
  --info:          oklch(0.72 0.12 230);
  color-scheme: dark;
}
```

**Light mode (parity required, calibrated for daylight contrast):**

```css
.light {
  --bg:            oklch(0.985 0.002 60);
  --surface:       oklch(1 0 0);
  --surface-2:     oklch(0.972 0.003 60);
  --surface-3:     oklch(0.945 0.005 60);
  --border:        oklch(0.91 0.005 60);
  --border-strong: oklch(0.84 0.008 60);
  --text-1:        oklch(0.18 0.005 60);
  --text-2:        oklch(0.42 0.006 60);
  --text-3:        oklch(0.58 0.008 60);
  --success:       oklch(0.55 0.15 145);
  --danger:        oklch(0.56 0.20 27);
  --warning:       oklch(0.68 0.16 75);
  --info:          oklch(0.55 0.14 230);
  color-scheme: light;
}
```

### 3.2 Motion tokens

```css
:root {
  /* Easings — Apple/Linear curves */
  --ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quart:  cubic-bezier(0.25, 1, 0.5, 1);
  --ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-spring-soft: cubic-bezier(0.5, 1.25, 0.6, 1);
  --ease-smooth:     cubic-bezier(0.32, 0.72, 0, 1);

  /* Durations */
  --motion-instant: 80ms;   /* button press, immediate feedback */
  --motion-fast:    150ms;  /* color, opacity, border */
  --motion-medium:  280ms;  /* transform, box-shadow */
  --motion-slow:    500ms;  /* halo glow fade in */
  --motion-glacial: 800ms;  /* logo tile transitions */
}
```

Motion JS configs (`src/ui/lib/motion.ts`):

```typescript
import { type Transition } from 'motion/react';

export const springs = {
  snappy: { type: 'spring', stiffness: 400, damping: 30 } satisfies Transition,
  soft:   { type: 'spring', stiffness: 200, damping: 25 } satisfies Transition,
  bouncy: { type: 'spring', stiffness: 500, damping: 20 } satisfies Transition,
  glacial:{ type: 'spring', stiffness: 80, damping: 22 } satisfies Transition,
} as const;

export const easings = {
  outExpo:    [0.16, 1, 0.3, 1],
  outQuart:   [0.25, 1, 0.5, 1],
  smooth:     [0.32, 0.72, 0, 1],
  spring:     [0.34, 1.56, 0.64, 1],
  springSoft: [0.5, 1.25, 0.6, 1],
} as const;

export const stagger = {
  default: { delayChildren: 0.05, staggerChildren: 0.06 },
  fast:    { delayChildren: 0.02, staggerChildren: 0.03 },
  slow:    { delayChildren: 0.1,  staggerChildren: 0.1  },
} as const;

export const fadeInUp = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: springs.snappy,
};
```

### 3.3 Radii, shadows, spacing

```css
:root {
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;

  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.06), 0 1px 1px oklch(0 0 0 / 0.04);
  --shadow-md: 0 2px 4px oklch(0 0 0 / 0.08), 0 4px 8px oklch(0 0 0 / 0.06);
  --shadow-lg: 0 4px 12px oklch(0 0 0 / 0.10), 0 8px 24px oklch(0 0 0 / 0.08);

  --shadow-glow-sm: 0 0 20px -5px var(--primary-glow);
  --shadow-glow-md: 0 0 40px -10px var(--primary-glow);
  --shadow-glow-lg: 0 0 80px -20px var(--primary-glow);
}
```

### 3.4 Typography scale

```css
:root {
  /* Font families */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;

  /* Sizes (mobile-first; desktop scales via clamp where needed) */
  --text-xs:   11px;  /* labels, badges */
  --text-sm:   12px;  /* secondary text, descriptions */
  --text-base: 13px;  /* body, buttons */
  --text-md:   14px;  /* main content */
  --text-lg:   16px;  /* card titles, page subtitle */
  --text-xl:   18px;  /* section headings */
  --text-2xl:  22px;  /* KPI values */
  --text-3xl:  28px;  /* hero numbers */
  --text-4xl:  36px;  /* page hero */

  /* Tracking (letter-spacing) */
  --tracking-tighter: -0.025em;  /* large numbers */
  --tracking-tight:   -0.015em;  /* titles */
  --tracking-normal:  -0.005em;  /* body */
  --tracking-wide:    0.06em;    /* uppercase labels */
  --tracking-wider:   0.12em;    /* section labels */
}
```

Font feature settings always-on globally:

```css
body {
  font-family: var(--font-sans);
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11', 'ss01';
  -webkit-font-smoothing: antialiased;
}
```

### 3.5 Tailwind v4 `@theme` integration

File `src/index.css` cần update:

```css
@import "tailwindcss";

@theme {
  /* Reference tokens vào Tailwind utility classes */
  --color-primary: oklch(0.683 0.213 38.5);
  --color-primary-hover: oklch(0.71 0.215 38.5);
  --color-primary-fg: oklch(0.99 0 0);

  /* Shadow utilities */
  --shadow-glow-sm: 0 0 20px -5px oklch(0.683 0.213 38.5 / 0.45);
  --shadow-glow-md: 0 0 40px -10px oklch(0.683 0.213 38.5 / 0.45);
  --shadow-glow-lg: 0 0 80px -20px oklch(0.683 0.213 38.5 / 0.45);

  /* Custom easings as utility */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Mode-specific tokens defined in :root layer (not @theme) */
:root, .dark { /* dark by default */ }
.light       { /* override for light */ }
```

Sau đó dùng `shadow-glow-md`, `ease-out-expo` như utility classes thường.

---

## 4. Component Anatomy — Button

### 4.1 Variants

| Variant | Khi dùng | Cảm giác |
| --- | --- | --- |
| `primary` (outline V1) | Hành động chính per màn | Border cam, glow nhẹ on hover |
| `primary-sheen` (V3 - ONLY 1 per screen) | Hero CTA quan trọng nhất | V1 + sheen sweep animation |
| `secondary` | Hành động phụ | Solid surface-2, no glow |
| `ghost` | Action ít quan trọng | Transparent, hover bg |
| `outline` | Filter, More | Border thường, no primary color |
| `destructive` | Delete, Pause | Red/danger |

### 4.2 Anatomy — Primary outline (V1, the default)

```tsx
// src/ui/components/button.tsx
import { cn } from '@/ui/lib/cn';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'primary-sheen' | 'secondary' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'default', icon, iconPosition = 'left', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-variant={variant}
        data-size={size}
        className={cn('smit-btn', className)}
        {...props}
      >
        {icon && iconPosition === 'left' && <span className="smit-btn-icon">{icon}</span>}
        <span className="smit-btn-label">{children}</span>
        {icon && iconPosition === 'right' && <span className="smit-btn-icon">{icon}</span>}
      </button>
    );
  }
);
Button.displayName = 'Button';
```

CSS (in `src/index.css` or a `button.css` co-located):

```css
.smit-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 500;
  letter-spacing: -0.008em;
  cursor: pointer;
  border: none;
  outline: none;
  white-space: nowrap;
  user-select: none;
  isolation: isolate;
  transition:
    border-color 280ms var(--ease-smooth),
    color 280ms var(--ease-smooth),
    background 280ms var(--ease-smooth),
    box-shadow 480ms var(--ease-out-expo),
    transform 380ms var(--ease-spring);
}

.smit-btn:focus-visible {
  box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--primary);
}

.smit-btn[data-size="default"] { height: 36px; padding: 0 16px; }
.smit-btn[data-size="sm"]      { height: 30px; padding: 0 12px; font-size: var(--text-sm); }
.smit-btn[data-size="lg"]      { height: 40px; padding: 0 20px; font-size: var(--text-md); }

.smit-btn-icon {
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--text-1);
  transition:
    color 280ms var(--ease-smooth),
    transform 380ms var(--ease-out-expo);
}

/* PRIMARY (V1 outline — default) */
.smit-btn[data-variant="primary"] {
  background: transparent;
  color: var(--text-1);
  border: 0.5px solid var(--primary-border);
}

.smit-btn[data-variant="primary"]::before {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 12px;
  background: radial-gradient(
    ellipse 60% 80% at 50% 50%,
    var(--primary-glow-soft) 0%,
    transparent 70%
  );
  opacity: 0;
  z-index: -1;
  transition: opacity 500ms var(--ease-out-expo);
  pointer-events: none;
}

.smit-btn[data-variant="primary"]:hover {
  border-color: var(--primary-border-strong);
  color: var(--text-1);
  transform: translateY(-1px);
  box-shadow: 0 0 0 0.5px var(--primary-border-strong);
}

.smit-btn[data-variant="primary"]:hover::before {
  opacity: 1;
}

.smit-btn[data-variant="primary"]:hover .smit-btn-icon {
  color: var(--primary);
  transform: scale(1.08);
}

.smit-btn[data-variant="primary"]:active {
  transform: translateY(0) scale(0.985);
  transition-duration: 100ms;
}

/* PRIMARY-SHEEN (V3 - hero CTA only) */
.smit-btn[data-variant="primary-sheen"] {
  /* same as primary, but adds overflow:hidden + sheen child */
  background: transparent;
  color: var(--text-1);
  border: 0.5px solid var(--primary-border);
  overflow: hidden;
}

.smit-btn[data-variant="primary-sheen"]::after {
  /* sheen sweep */
  content: '';
  position: absolute;
  top: 0;
  left: -40%;
  width: 40%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--primary-glow) 50%,
    transparent 100%
  );
  transform: skewX(-20deg);
  pointer-events: none;
  transition: left 800ms var(--ease-smooth);
  z-index: 0;
}

.smit-btn[data-variant="primary-sheen"]:hover::after {
  left: 110%;
}

/* SECONDARY */
.smit-btn[data-variant="secondary"] {
  background: var(--surface-2);
  color: var(--text-1);
  border: 0.5px solid var(--border);
  box-shadow:
    inset 0 1px 0 oklch(1 0 0 / 0.06),
    0 1px 2px oklch(0 0 0 / 0.15);
}

.smit-btn[data-variant="secondary"]:hover {
  background: var(--surface-3);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}

/* GHOST */
.smit-btn[data-variant="ghost"] {
  background: transparent;
  color: var(--text-2);
  border: none;
}

.smit-btn[data-variant="ghost"]:hover {
  background: var(--surface-2);
  color: var(--text-1);
}

/* OUTLINE (neutral, no primary) */
.smit-btn[data-variant="outline"] {
  background: transparent;
  color: var(--text-1);
  border: 0.5px solid var(--border-strong);
}

.smit-btn[data-variant="outline"]:hover {
  background: var(--surface-2);
  border-color: var(--text-3);
}

/* DESTRUCTIVE */
.smit-btn[data-variant="destructive"] {
  background: transparent;
  color: var(--danger);
  border: 0.5px solid color-mix(in oklch, var(--danger) 60%, transparent);
}

.smit-btn[data-variant="destructive"]:hover {
  background: color-mix(in oklch, var(--danger) 12%, transparent);
  border-color: var(--danger);
}
```

### 4.3 Rules of usage

1. Per màn chỉ 1 button được dùng `primary-sheen`. Còn lại dùng `primary`.
2. Mỗi button phải có **icon đi kèm text** (lucide-react). Icon-only button = đặc biệt, phải có `aria-label`.
3. Loading state: disable button + thay icon thành Spinner (rotation animation). Không thay đổi width.
4. Disabled: `opacity: 0.5; cursor: not-allowed; pointer-events: none;` — không hover effect.

---

## 5. Component Anatomy — Logo Mark

### 5.1 Behavior

Logo là 1 SVG 40x40 viewBox với:

- 4 ô khung (frame tiles) — luôn hiển thị ở grid 2x2, stroke dim
- 1 ô trắng (`tile-white`) — di chuyển theo route
- 1 ô cam (`tile-orange`) — di chuyển theo route
- 4 crosshair lines (decorative)

2 ô trắng + cam **luôn hiển thị, luôn ở 2 vị trí khác nhau** (không trùng).

### 5.2 8 Route → 8 cặp vị trí

```typescript
// src/ui/components/logo-mark/positions.ts
export type TilePosition = 'TL' | 'TR' | 'BL' | 'BR';
export type RouteKey =
  | 'dashboard' | 'okrs' | 'leads' | 'ads'
  | 'media' | 'daily-sync' | 'checkin' | 'settings';

export interface LogoTilePair {
  white: TilePosition;
  orange: TilePosition;
}

export const ROUTE_POSITIONS: Record<RouteKey, LogoTilePair> = {
  // 4 diagonal pairs (system-level routes)
  dashboard:    { white: 'TL', orange: 'BR' }, // default identity
  okrs:         { white: 'TR', orange: 'BL' }, // top-down inverted
  leads:        { white: 'BR', orange: 'TL' }, // 180° rotation
  ads:          { white: 'BL', orange: 'TR' }, // diagonal opposite

  // 4 adjacent pairs (workflow-level routes)
  media:        { white: 'TL', orange: 'TR' }, // top row
  'daily-sync': { white: 'BL', orange: 'BR' }, // bottom row
  checkin:      { white: 'TL', orange: 'BL' }, // left column
  settings:     { white: 'TR', orange: 'BR' }, // right column
};

// Translate map: from base position (white=TL, orange=BR) to target
export const POSITION_TRANSFORMS: Record<TilePosition, { dx: number; dy: number }> = {
  TL: { dx: 0,  dy: 0  },  // (11, 11)
  TR: { dx: 10, dy: 0  },  // (21, 11)
  BL: { dx: 0,  dy: 10 },  // (11, 21)
  BR: { dx: 10, dy: 10 },  // (21, 21)
};
```

### 5.3 Implementation

```tsx
// src/ui/components/logo-mark/logo-mark.tsx
import { motion } from 'motion/react';
import { springs } from '@/ui/lib/motion';
import { ROUTE_POSITIONS, POSITION_TRANSFORMS, type RouteKey } from './positions';

interface LogoMarkProps {
  route: RouteKey;
  size?: number;
  className?: string;
}

export function LogoMark({ route, size = 28, className }: LogoMarkProps) {
  const { white, orange } = ROUTE_POSITIONS[route];
  const whiteT = POSITION_TRANSFORMS[white];
  const orangeT = POSITION_TRANSFORMS[orange];

  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={className}
      aria-label="SMIT OS"
    >
      {/* Crosshair guides */}
      <line x1="20" y1="3" x2="20" y2="10" className="logo-crosshair" />
      <line x1="20" y1="30" x2="20" y2="37" className="logo-crosshair" />
      <line x1="3" y1="20" x2="10" y2="20" className="logo-crosshair" />
      <line x1="30" y1="20" x2="37" y2="20" className="logo-crosshair" />

      {/* 4 dim frame tiles (grid skeleton) */}
      <rect x="11" y="11" width="8" height="8" rx="1.5" className="logo-frame" />
      <rect x="21" y="11" width="8" height="8" rx="1.5" className="logo-frame" />
      <rect x="11" y="21" width="8" height="8" rx="1.5" className="logo-frame" />
      <rect x="21" y="21" width="8" height="8" rx="1.5" className="logo-frame" />

      {/* White tile — animated */}
      <motion.rect
        x="11" y="11" width="8" height="8" rx="1.5"
        className="logo-tile-white"
        animate={{ x: whiteT.dx, y: whiteT.dy }}
        transition={springs.glacial}
      />

      {/* Orange tile — animated + pulse on route change */}
      <motion.rect
        x="21" y="21" width="8" height="8" rx="1.5"
        className="logo-tile-orange"
        animate={{ x: orangeT.dx - 10, y: orangeT.dy - 10 }} // base origin is BR
        transition={springs.glacial}
        key={route} // re-mount triggers pulse animation
      />
    </svg>
  );
}
```

CSS:

```css
.logo-crosshair {
  stroke: oklch(0.32 0.005 60);
  stroke-width: 1;
}

.logo-frame {
  fill: none;
  stroke: oklch(0.32 0.006 60);
  stroke-width: 1.3;
}

.logo-tile-white {
  fill: none;
  stroke: oklch(0.97 0 0);
  stroke-width: 1.5;
}

.logo-tile-orange {
  fill: var(--primary);
  stroke: var(--primary);
  stroke-width: 1.4;
  animation: tilePulseTwice 1400ms var(--ease-smooth);
}

@keyframes tilePulseTwice {
  0%   { filter: drop-shadow(0 0 0 oklch(0.683 0.213 38.5 / 0)); }
  20%  { filter: drop-shadow(0 0 5px oklch(0.683 0.213 38.5 / 0.7)); }
  40%  { filter: drop-shadow(0 0 0 oklch(0.683 0.213 38.5 / 0)); }
  60%  { filter: drop-shadow(0 0 4px oklch(0.683 0.213 38.5 / 0.5)); }
  100% { filter: drop-shadow(0 0 0 oklch(0.683 0.213 38.5 / 0)); }
}
```

### 5.4 Sidebar integration

```tsx
// src/ui/components/sidebar/sidebar-brand.tsx
import { useLocation } from 'react-router-dom';
import { LogoMark } from '@/ui/components/logo-mark';
import { matchRoute } from '@/ui/lib/match-route';

export function SidebarBrand() {
  const { pathname } = useLocation();
  const route = matchRoute(pathname); // returns RouteKey

  return (
    <div className="sidebar-brand-row">
      <LogoMark route={route} size={28} />
      <span className="sidebar-brand-text">SMIT OS</span>
    </div>
  );
}
```

```typescript
// src/ui/lib/match-route.ts
import type { RouteKey } from '@/ui/components/logo-mark/positions';

export function matchRoute(pathname: string): RouteKey {
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/okrs')) return 'okrs';
  if (pathname.startsWith('/leads')) return 'leads';
  if (pathname.startsWith('/ads')) return 'ads';
  if (pathname.startsWith('/media')) return 'media';
  if (pathname.startsWith('/daily-sync')) return 'daily-sync';
  if (pathname.startsWith('/checkin') || pathname.startsWith('/weekly-checkin')) return 'checkin';
  if (pathname.startsWith('/settings') || pathname.startsWith('/profile')) return 'settings';
  return 'dashboard'; // default
}
```

---

## 6. Component Conventions

### 6.1 File structure per component

```
src/ui/components/<component-name>/
├── index.ts              # re-exports
├── <component>.tsx       # main component (<200 lines)
├── <component>.css       # co-located styles (when CSS-in-CSS needed)
├── <component>.types.ts  # complex types if needed
├── <subcomponent>.tsx    # for parts (e.g. CardHeader, CardBody)
└── README.md             # 1-page usage docs (optional)
```

For simple components (&lt; 80 lines), single file is fine:

```
src/ui/components/badge.tsx
```

### 6.2 Naming

- File: kebab-case (`kpi-card.tsx`)
- Component export: PascalCase (`KpiCard`)
- Props interface: `<ComponentName>Props`
- CSS class prefix: `smit-` for component-specific (`smit-btn`, `smit-card`) to prevent collision
- Data attributes for variants: `data-variant`, `data-size`, `data-state`

### 6.3 Forwarding refs

All interactive components must forward refs:

```tsx
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(...);
```

### 6.4 Type discipline

- No `any` in component props. Use `unknown` if truly dynamic.
- All event handlers properly typed: `(e: ChangeEvent<HTMLInputElement>) => void`
- Component variants use string union: `'primary' | 'secondary' | ...`, never strings
- Generic `T` only when component is data-driven (Table, Combobox)

### 6.5 Imports

Use path aliases:

```typescript
import { Button } from '@/ui/components/button';
import { cn } from '@/ui/lib/cn';
import { springs } from '@/ui/lib/motion';
```

In `vite.config.ts`:

```typescript
resolve: {
  alias: { '@': path.resolve(__dirname, './src') }
}
```

---

## 7. Motion System

### 7.1 When to use what

| Property | Library | Why |
| --- | --- | --- |
| `scale`, `translate`, `rotate` | `motion` springs | Physical feel |
| `opacity`, `color`, `border-color` | CSS transitions cubic-bezier | Faster, simpler |
| Page transitions | `motion/react` `AnimatePresence` | Layout animation |
| List stagger | `motion/react` `staggerChildren` | Coordinated entrance |
| Numbers ticker | `@number-flow/react` | Apple-grade ticker |
| Card spotlight | CSS `radial-gradient` + mouse vars | Cheap, smooth |

### 7.2 Springs config matrix

```typescript
// src/ui/lib/motion.ts (already shown above)

// Usage:
<motion.div animate={{ y: 0 }} initial={{ y: 6 }} transition={springs.snappy} />
<motion.div animate={{ x: 10 }} transition={springs.glacial} />
```

### 7.3 AnimatePresence for route changes

```tsx
// src/AppRouter.tsx
import { AnimatePresence, motion } from 'motion/react';
import { useLocation, Outlet } from 'react-router-dom';

export function PageWrapper() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
```

### 7.4 Stagger lists

```tsx
import { motion } from 'motion/react';
import { stagger, fadeInUp } from '@/ui/lib/motion';

<motion.ul initial="initial" animate="animate" variants={{ animate: { transition: stagger.default } }}>
  {items.map(item => (
    <motion.li key={item.id} variants={fadeInUp}>
      {item.content}
    </motion.li>
  ))}
</motion.ul>
```

### 7.5 Reduced motion respect

```typescript
// src/ui/lib/use-reduced-motion.ts
import { useReducedMotion as useMotionReducedMotion } from 'motion/react';

export function useReducedMotion(): boolean {
  return useMotionReducedMotion() ?? false;
}
```

Use in spring-heavy components:

```tsx
const reduced = useReducedMotion();
<motion.div animate={{ y: 0 }} transition={reduced ? { duration: 0 } : springs.snappy} />
```

---

## 8. Stack & Dependencies

### 8.1 Stack chốt

| Category | Package | Version | Lý do |
| --- | --- | --- | --- |
| **Component primitives** | `shadcn/ui` | canary | Tailwind v4 + React 19 support |
| **Headless behaviors** | `@radix-ui/react-*` | via shadcn | Replaces @headlessui/react |
| **Motion core** | `motion` | `^12.23.24` (đã có) | Spring physics, AnimatePresence |
| **Motion utilities** | `motion-primitives` | copy-paste | TextEffect, AnimatedNumber, Tilt, BorderTrail |
| **Number animation** | `@number-flow/react` | latest | Apple-grade ticker |
| **Toast** | `sonner` | latest | Replaces existing Toast |
| **Drawer mobile** | `vaul` | latest | iOS-feel drawer |
| **Command palette** | `cmdk` | latest | Cmd+K search |
| **Forms** | `react-hook-form` + `zod` | latest | zod already installed |
| **Data fetching** | `@tanstack/react-query` | (đã có) | Keep |
| **Charts** | `recharts` | (đã có) | Keep, restyle with tokens |
| **Date utilities** | `date-fns` | (đã có) | Keep |
| **Icons** | `lucide-react` | (đã có) | Keep |
| **Class utilities** | `tailwind-merge` + `clsx` | latest | `cn()` helper |
| **Theme switcher** | `next-themes` | latest | Dark/light/system mode |
| **Resizable panels** | `react-resizable-panels` | latest | User-customizable dashboard |
| **Floating UI** | `@floating-ui/react` | latest | Tooltip/popover positioning |
| **Carousel** | `embla-carousel-react` | latest | Onboarding, gallery |
| **Smooth scroll** | `lenis` | latest | Apple-grade page scroll |
| **3D tilt** | `@react-spring/parallax` or custom | optional | Card tilt effect (only if needed) |
| **Lottie** | `lottie-react` | optional | Loading states, illustrations |
| **Hooks utilities** | `usehooks-ts` | latest | Common hooks |
| **Measure** | `react-use-measure` | latest | Element size tracking |

### 8.2 Packages to REMOVE

- `@headlessui/react` — replaced by Radix (via shadcn)
- `react-hot-toast` (if present) — replaced by sonner

### 8.3 Install script (Stage 0)

```bash
# Initialize shadcn (canary for Tailwind v4 + React 19)
npx shadcn@canary init

# Core motion
pnpm add @number-flow/react

# Toast & overlays
pnpm add sonner vaul cmdk

# Forms
pnpm add react-hook-form

# Utilities
pnpm add tailwind-merge clsx next-themes
pnpm add @floating-ui/react usehooks-ts react-use-measure

# Layout & advanced
pnpm add react-resizable-panels embla-carousel-react lenis

# Optional
pnpm add lottie-react

# Remove
pnpm remove @headlessui/react
```

Note: User uses pnpm based on lockfile presence. Adjust to npm/yarn if needed.

### 8.4 Pinning policy

Pin major versions in `package.json` for stability. Allow minor + patch for security:

```json
"sonner": "^1.7.0",
"vaul": "^1.0.0",
"cmdk": "^1.0.0"
```

---

## 9. Migration Strategy (Strangler Fig)

### 9.1 Stage 0 — Setup (1-2 days)

- \[ \] Install dependencies (script in 8.3)
- \[ \] Update `src/index.css` with Tailwind v4 `@theme` block + dark/light tokens
- \[ \] Create `src/ui/lib/cn.ts`, `src/ui/lib/motion.ts`, `src/ui/lib/match-route.ts`
- \[ \] Setup folder structure (Section 12)
- \[ \] Run `npx shadcn@canary init` and configure to output into `src/ui/components/`
- \[ \] Verify dark/light theme switcher works (basic Toggle component first)
- \[ \] Setup Sonner provider in `src/main.tsx`

### 9.2 Stage 1 — Component library (4-5 days)

Build in `src/ui/components/` in priority order. Each component needs a showcase page at `/v6-storybook/<component>`.

**Order:**

1. **Primitives** (day 1):
   - `Button` (5 variants, V3 sheen variant for hero CTA)
   - `Input`, `Label`, `Textarea`
   - `Badge` (3 variants: primary, success, neutral)
   - `Card`, `CardHeader`, `CardContent`, `CardFooter`
2. **Logo & navigation** (day 1):
   - `LogoMark` (with 8 route mappings)
   - `Sidebar`, `SidebarSection`, `SidebarItem`
   - `Header`, `Shell` (page wrapper)
3. **Data display** (day 2):
   - `Table`, `DataTable` (with sort, filter)
   - `KpiCard` (standard + featured variant with spotlight)
   - `NumberFlow` wrapper around `@number-flow/react`
   - `EmptyState`
4. **Overlays** (day 3):
   - `Dialog`, `Sheet` (Radix-based)
   - `Popover`, `Tooltip`
   - `DropdownMenu`
   - `Toast` (Sonner wrapper)
   - `CommandPalette` (cmdk-based, Cmd+K)
5. **Forms** (day 4):
   - `Select`, `Combobox`
   - `DatePicker`, `DateRangePicker`
   - `Switch`, `Checkbox`, `RadioGroup`
   - `FormField`, `FormError` (react-hook-form integration)
6. **Charts** (day 5):
   - Recharts wrappers: `LineChartWrapper`, `BarChartWrapper`, `AreaChartWrapper`, `DonutChartWrapper`, `SparklineWrapper`
   - All using design tokens (no hardcoded colors)

### 9.3 Stage 2 — Route migration (1-2 weeks)

Order (low → high risk):

| \# | Route | Risk | Why |
| --- | --- | --- | --- |
| 1 | `/profile` (or `/settings/profile`) | Low | Small page, few components |
| 2 | `/settings` | Medium | Form-heavy, tests form patterns |
| 3 | `/daily-sync` | Medium | Form + modal flow |
| 4 | `/checkin` (weekly) | Medium | Similar to daily-sync |
| 5 | `/okrs` | Medium-high | Nested data |
| 6 | `/leads` | Medium-high | Table + filters |
| 7 | `/ads` | High | Table + Meta integration |
| 8 | `/media` | High | Mixed data display |
| 9 | `/dashboard` | Highest | Chart-heavy, do last |

For each route:

1. Copy logic untouched (hooks, queries, types)
2. Replace UI components: `<v5/Button>` → `@/ui/components/button`
3. Test in dev — verify visual + interaction
4. PR + merge

### 9.4 Stage 3 — Cleanup (1-2 days)

- \[ \] Verify no imports from `src/components/v5/` anywhere via grep: 

  ```bash
  grep -r "components/v5" src/ --exclude-dir=node_modules
  
  ```
- \[ \] Delete `src/components/v5/`
- \[ \] Rename `src/ui/` → `src/components/` (or merge into existing `src/components/`)
- \[ \] Update all `@/ui/components/...` imports to `@/components/...`
- \[ \] Run full test suite
- \[ \] Delete `src/components/v5-deprecated/` if existed
- \[ \] Update README

---

## 10. Forbidden Patterns (Anti-patterns từ v5)

These patterns are **strictly forbidden** in v6. ESLint rules or codereview will flag them.

### 10.1 Typography violations

```tsx
// ❌ FORBIDDEN
<div className="font-black">...</div>
<div className="font-extrabold">...</div>
<div className="font-bold">...</div> // use font-medium (500) instead
<div className="uppercase tracking-widest">...</div> // unless in sidebar section label
{/* @ts-ignore: ui-canon-ok: font-black for KPI */} // remove ALL these comments

// ✅ ALLOWED
<div className="font-medium">...</div> // weight 500
<div className="font-normal">...</div> // weight 400
<p className="text-text-2 tracking-tight">...</p>
```

### 10.2 Glass-morphism abuse

```tsx
// ❌ FORBIDDEN — anywhere except header
<div className="backdrop-blur-md bg-surface/80">...</div>
<GlassCard>...</GlassCard> // delete entire component

// ✅ ALLOWED — only on Header
<header className="sticky top-0 backdrop-blur-md bg-bg/80">...</header>
```

### 10.3 Always-on glow

```tsx
// ❌ FORBIDDEN
<div className="shadow-glow-md">...</div> // glow without :hover
<div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl" /> // decorative blob

// ✅ ALLOWED
<button className="hover:shadow-glow-md transition-shadow duration-500">...</button>
```

### 10.4 Default Tailwind transitions on transform

```tsx
// ❌ FORBIDDEN
<div className="hover:scale-105 transition duration-300">...</div>

// ✅ ALLOWED
<motion.div whileHover={{ scale: 1.05 }} transition={springs.snappy}>...</motion.div>
// or CSS with spring cubic-bezier:
<div className="hover:scale-105 transition-transform duration-300 ease-spring">...</div>
// where ease-spring is in tailwind config
```

### 10.5 Inline magic colors

```tsx
// ❌ FORBIDDEN
<div style={{ color: '#ff5c00' }}>...</div>
<div className="bg-[#ff5c00]">...</div>
<div className="text-orange-500">...</div>

// ✅ ALLOWED
<div className="text-primary">...</div>
<div style={{ color: 'var(--primary)' }}>...</div>
```

### 10.6 Component bloat

```tsx
// ❌ FORBIDDEN — > 200 lines in single file
// SuperDashboardWidgetWithEverything.tsx (450 lines)

// ✅ ALLOWED — split
// dashboard-widget.tsx       (orchestration, < 100 lines)
// dashboard-widget-header.tsx
// dashboard-widget-body.tsx
// dashboard-widget-footer.tsx
```

### 10.7 Untyped event handlers

```tsx
// ❌ FORBIDDEN
const handleClick = (e: any) => {...}
const handleChange = (e) => {...}

// ✅ ALLOWED
const handleClick = (e: MouseEvent<HTMLButtonElement>) => {...}
const handleChange = (e: ChangeEvent<HTMLInputElement>) => {...}
```

### 10.8 Multiple glows per screen

```tsx
// ❌ FORBIDDEN — 2+ glows visible at the same time
<div>
  <KpiCard featured /> {/* glow */}
  <Button variant="primary-sheen">...</Button> {/* sheen, glow */}
</div>

// ✅ ALLOWED — pick one
<div>
  <KpiCard featured /> {/* this is the glow point */}
  <Button variant="primary">...</Button> {/* no sheen */}
</div>
```

---

## 11. Testing Strategy

### 11.1 Visual regression

Each component has a Storybook-style page at `/v6-storybook/<component>` showing:

- All variants
- All sizes
- All states (default, hover via `:hover` selector toggle, disabled, loading)
- Light + dark mode toggle

Manual review required before component is "done". Optional: Playwright screenshot tests.

### 11.2 Type safety

- TypeScript strict mode on
- `pnpm tsc --noEmit` must pass before commit
- No `@ts-ignore` comments without explanation comment above

### 11.3 Lint rules to add

In `eslint.config.js`, add custom rule (or use `eslint-plugin-tailwindcss`):

```javascript
'no-restricted-syntax': [
  'error',
  {
    selector: "Literal[value=/font-(black|extrabold|bold)/]",
    message: 'Use font-medium or font-normal. font-black/extrabold/bold are forbidden in v6.'
  },
  {
    selector: "Literal[value=/backdrop-blur/]",
    message: 'backdrop-blur is only allowed on header. Use flat solid for cards.'
  }
],
```

### 11.4 Bundle size budget

- Total JS gzipped: &lt; 250 KB initial, &lt; 800 KB total
- Per-route lazy load via React Router lazy: &lt; 50 KB per route addition
- Monitor with `vite-bundle-visualizer` after each route migration

---

## 12. File Structure

### 12.1 Target structure (after Stage 3)

```
src/
├── components/                    # (after rename from src/ui)
│   ├── primitives/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── data/
│   │   ├── kpi-card/
│   │   │   ├── index.ts
│   │   │   ├── kpi-card.tsx
│   │   │   └── kpi-card-spotlight.tsx
│   │   ├── data-table/
│   │   │   ├── index.ts
│   │   │   ├── data-table.tsx
│   │   │   ├── data-table-header.tsx
│   │   │   └── data-table-row.tsx
│   │   ├── number-flow.tsx
│   │   └── ...
│   ├── overlays/
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── tooltip.tsx
│   │   ├── popover.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── command-palette.tsx
│   ├── forms/
│   │   ├── select.tsx
│   │   ├── date-picker.tsx
│   │   ├── date-range-picker.tsx
│   │   ├── combobox.tsx
│   │   └── form-field.tsx
│   ├── layout/
│   │   ├── shell.tsx
│   │   ├── header.tsx
│   │   ├── sidebar/
│   │   │   ├── index.ts
│   │   │   ├── sidebar.tsx
│   │   │   ├── sidebar-brand.tsx
│   │   │   ├── sidebar-section.tsx
│   │   │   └── sidebar-item.tsx
│   │   └── logo-mark/
│   │       ├── index.ts
│   │       ├── logo-mark.tsx
│   │       └── positions.ts
│   ├── charts/
│   │   ├── line-chart.tsx
│   │   ├── bar-chart.tsx
│   │   ├── area-chart.tsx
│   │   ├── donut-chart.tsx
│   │   └── sparkline.tsx
│   └── feedback/
│       ├── toast.tsx               # Sonner wrapper
│       ├── empty-state.tsx
│       └── loading-spinner.tsx
├── lib/
│   ├── cn.ts                       # className utility
│   ├── motion.ts                   # springs, easings, stagger
│   ├── match-route.ts              # pathname → RouteKey
│   ├── format.ts                   # date, number formatters
│   └── api.ts                      # (untouched from v5)
├── hooks/                          # (untouched from v5)
├── contexts/                       # (untouched from v5)
├── pages/                          # (rebuild route by route)
├── types/                          # (untouched from v5)
├── index.css                       # Tailwind v4 @theme + tokens
└── main.tsx                        # entry
```

### 12.2 Intermediate structure (during Stage 1-2)

```
src/
├── components/
│   └── v5/                         # OLD — gradually deleted
│       └── ui/
│           ├── button.tsx
│           └── ...
├── ui/                             # NEW — being built
│   ├── components/
│   ├── lib/
│   └── (same structure as 12.1)
├── pages/
└── ...
```

Imports during transition:

```typescript
// Old code (v5)
import { Button } from '@/components/v5/ui/button';

// New code (v6)
import { Button } from '@/ui/components/primitives/button';

// After Stage 3 rename
import { Button } from '@/components/primitives/button';
```

---

## Approval

- \[ \] Tokens reviewed and approved
- \[ \] Button variants showcase approved (showcase v4)
- \[ \] Logo 8-route mapping approved (showcase v5)
- \[ \] Stack list approved
- \[ \] Migration strategy approved
- \[ \] Forbidden patterns approved

**Final sign-off:** Dominium · 2026-05-15

---

## Appendix A: Reference showcases

The following HTML showcases form the visual source-of-truth for v6:

- `smit-os-v6-showcase-v3.html` — Button & logo polish levels
- `smit-os-v6-showcase-v4.html` — **Final button (V1 outline)** + logo refinement (chosen)
- `smit-os-v6-showcase-v5.html` — **Final logo (8 route signatures)** + sidebar mockup (chosen)

Claude Code should reference these when in doubt about visual behavior.

## Appendix B: Files to delete in Stage 3

```
src/components/v5/ui/
├── button.tsx          (replaced)
├── card.tsx            (replaced)
├── glass-card.tsx      (DELETE — no replacement)
├── kpi-card.tsx        (replaced)
├── badge.tsx           (replaced)
├── input.tsx           (replaced)
├── label.tsx           (replaced)
├── select.tsx          (replaced)
├── combobox.tsx        (replaced)
├── modal.tsx           (replaced by Dialog)
├── form-dialog.tsx     (refactored as composition)
├── data-table.tsx      (replaced)
├── chart-card.tsx      (replaced)
├── notification-center.tsx (replaced)
├── toast.tsx           (replaced by Sonner)
├── date-range-picker.tsx (replaced)
├── dropdown-menu.tsx   (replaced via Radix)
├── filter-chip.tsx     (replaced)
├── date-picker.tsx     (replaced)
├── custom-select.tsx   (replaced)
└── ...
```

Verify each with grep before deletion:

```bash
grep -r "from '@/components/v5/ui/<filename>'" src/
```