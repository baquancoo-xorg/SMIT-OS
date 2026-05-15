# Claude Code — SMIT OS v6 Frontend Rebuild Prompt

> **HOW TO USE:** Save ADR và prompt này vào repo (`docs/v6/`). Trong Claude Code CLI, paste prompt này:

---

## SYSTEM CONTEXT

Bạn là **Senior Frontend Engineer** specialized trong React 19 + Tailwind v4 + Motion v12, được thuê để rebuild UI layer cho SMIT OS — một SaaS dashboard production cho SMIT Agency. Bạn làm việc với Dominium (solo dev, dùng AI để code).

## MISSION

Migrate frontend từ v5 (custom UI library trong `src/components/v5/`) sang v6 (shadcn/ui + motion + sheen premium) theo **strangler fig pattern**. Giữ nguyên toàn bộ business logic, hooks, API, types, contexts. Chỉ thay UI layer.

## REQUIRED READING (đọc đầy đủ trước khi làm gì)

Bạn PHẢI đọc các file sau theo thứ tự trước khi viết bất kỳ code nào:

1. `docs/v6/ADR-001-design-system.md` — Architecture Decision Record. Đây là source of truth cho mọi quyết định design, stack, conventions, forbidden patterns. **Đọc toàn bộ ADR, không skim.**
2. `docs/v6/showcases/` — 3 HTML showcase files (v3, v4, v5). Mở bằng browser nếu cần để cảm nhận visual behavior:
   - `smit-os-v6-showcase-v3.html` — Button polish levels reference
   - `smit-os-v6-showcase-v4.html` — Final button choice (V1 outline)
   - `smit-os-v6-showcase-v5.html` — Final logo (8 routes) + sidebar mockup
3. `package.json` — current deps
4. `vite.config.ts` — build config
5. `src/main.tsx` — entry point
6. `src/index.css` — current Tailwind v4 theme
7. `src/components/v5/ui/` — old UI library (will be replaced; understand interfaces)
8. `src/hooks/`, `src/lib/api.ts`, `src/contexts/` — DO NOT MODIFY (business logic stays)

## EXECUTION PLAN

Bạn sẽ chạy plan theo 4 stage (xem chi tiết trong ADR section 9). Trong session này:

### TASK 1 — Validate prerequisites (5 phút)

```bash
# Verify Node, package manager, current branch
node --version  # need >= 20
pnpm --version  # or npm/yarn

# Verify dev server runs
pnpm dev &
sleep 5 && curl -s http://localhost:5173/ | head -5
# kill after verification
```

Báo cáo:

- Node version
- Package manager (pnpm/npm/yarn)
- Dev server starts OK? (yes/no, error if any)
- Current git branch
- Any uncommitted changes? (yes/no)

**Nếu có uncommitted changes**: STOP. Hỏi user có muốn commit hay stash trước khi bắt đầu.

### TASK 2 — Create v6 branch + structure (10 phút)

```bash
git checkout -b feat/v6-frontend-rebuild
mkdir -p src/ui/components/{primitives,data,overlays,forms,layout,charts,feedback}
mkdir -p src/ui/components/layout/{sidebar,logo-mark}
mkdir -p src/ui/components/data/{kpi-card,data-table}
mkdir -p src/ui/components/overlays
mkdir -p src/ui/lib
mkdir -p docs/v6
```

Verify structure:

```bash
tree src/ui -L 3
```

### TASK 3 — Stage 0: Install dependencies (20 phút)

Read ADR section 8.3 for the install commands. Execute them, but **first check what's already installed** to avoid duplicates:

```bash
# Check existing
cat package.json | jq '.dependencies + .devDependencies' | grep -E "shadcn|sonner|vaul|cmdk|next-themes|@number-flow|react-hook-form|tailwind-merge|clsx|@floating-ui|usehooks-ts|react-use-measure|react-resizable-panels|embla-carousel|lenis"
```

For each package NOT already present, install it. Use the EXACT package manager the project uses (`pnpm-lock.yaml` → pnpm; `package-lock.json` → npm; `yarn.lock` → yarn).

After install, verify the new packages appear in `package.json`:

```bash
cat package.json | jq '.dependencies'
```

### TASK 4 — Stage 0: Initialize shadcn (15 phút)

```bash
npx shadcn@canary init
```

Answer prompts:

- TypeScript? **Yes**
- Style: **Default** (we'll override CSS anyway)
- Base color: **Neutral** (we override with primary tokens)
- Global CSS location: `src/index.css` (existing)
- CSS variables for colors: **Yes**
- Tailwind config: **none** (Tailwind v4 doesn't use one)
- Components dir: `@/ui/components` (custom path)
- Utils dir: `@/ui/lib`
- React Server Components: **No** (Vite, not Next.js)

If `components.json` already exists at the root, configure it to use:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/ui/components",
    "utils": "@/ui/lib/cn",
    "ui": "@/ui/components/primitives",
    "lib": "@/ui/lib",
    "hooks": "@/hooks"
  }
}
```

### TASK 5 — Stage 0: Write foundation files (45 phút)

Create these files based on ADR sections 3, 7, 5.2:

**5.1 —** `src/ui/lib/cn.ts` (className utility):

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**5.2 —** `src/ui/lib/motion.ts` (springs, easings, stagger):

Copy exactly from ADR section 3.2 (the `springs`, `easings`, `stagger`, `fadeInUp` exports).

**5.3 —** `src/ui/lib/match-route.ts`:

Copy from ADR section 5.4 (the `matchRoute` function).

**5.4 —** `src/ui/components/layout/logo-mark/positions.ts`:

Copy from ADR section 5.2 (the `ROUTE_POSITIONS`, `POSITION_TRANSFORMS`, `RouteKey`, `TilePosition`, `LogoTilePair` exports).

**5.5 —** `src/index.css` **— UPDATE with full token block**:

The new `src/index.css` should have this structure (preserve any `@import` already there for fonts):

```css
@import "tailwindcss";

@theme {
  /* Custom utility tokens — see ADR section 3.5 */
  --color-primary: oklch(0.683 0.213 38.5);
  --color-primary-hover: oklch(0.71 0.215 38.5);
  --color-primary-fg: oklch(0.99 0 0);
  --shadow-glow-sm: 0 0 20px -5px oklch(0.683 0.213 38.5 / 0.45);
  --shadow-glow-md: 0 0 40px -10px oklch(0.683 0.213 38.5 / 0.45);
  --shadow-glow-lg: 0 0 80px -20px oklch(0.683 0.213 38.5 / 0.45);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.32, 0.72, 0, 1);
}

/* ============== ROOT TOKENS (motion + radii + shadows) ============== */
:root {
  /* Primary palette */
  --primary: oklch(0.683 0.213 38.5);
  --primary-hover: oklch(0.71 0.215 38.5);
  --primary-pressed: oklch(0.64 0.205 38.5);
  --primary-bright: oklch(0.76 0.215 38.5);
  --primary-fg: oklch(0.99 0 0);
  --primary-glow: oklch(0.683 0.213 38.5 / 0.45);
  --primary-glow-soft: oklch(0.683 0.213 38.5 / 0.20);
  --primary-glow-strong: oklch(0.683 0.213 38.5 / 0.65);
  --primary-border: oklch(0.683 0.213 38.5 / 0.55);
  --primary-border-strong: oklch(0.683 0.213 38.5 / 0.85);
  --primary-soft: oklch(0.683 0.213 38.5 / 0.10);
  --primary-soft-2: oklch(0.683 0.213 38.5 / 0.18);

  /* Easings */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-spring-soft: cubic-bezier(0.5, 1.25, 0.6, 1);
  --ease-smooth: cubic-bezier(0.32, 0.72, 0, 1);

  /* Durations */
  --motion-instant: 80ms;
  --motion-fast: 150ms;
  --motion-medium: 280ms;
  --motion-slow: 500ms;
  --motion-glacial: 800ms;

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --text-xs: 11px;
  --text-sm: 12px;
  --text-base: 13px;
  --text-md: 14px;
  --text-lg: 16px;
  --text-xl: 18px;
  --text-2xl: 22px;
  --text-3xl: 28px;
  --text-4xl: 36px;
  --tracking-tighter: -0.025em;
  --tracking-tight: -0.015em;
  --tracking-normal: -0.005em;
  --tracking-wide: 0.06em;
  --tracking-wider: 0.12em;
}

/* ============== DARK MODE ============== */
:root, .dark {
  --bg: oklch(0.165 0.003 60);
  --surface: oklch(0.195 0.005 60);
  --surface-2: oklch(0.225 0.006 60);
  --surface-3: oklch(0.265 0.007 60);
  --border: oklch(0.28 0.007 60);
  --border-strong: oklch(0.34 0.009 60);
  --text-1: oklch(0.97 0.002 60);
  --text-2: oklch(0.74 0.006 60);
  --text-3: oklch(0.55 0.008 60);
  --success: oklch(0.72 0.16 145);
  --danger: oklch(0.7 0.18 27);
  --warning: oklch(0.78 0.16 75);
  --info: oklch(0.72 0.12 230);
  color-scheme: dark;
}

/* ============== LIGHT MODE ============== */
.light {
  --bg: oklch(0.985 0.002 60);
  --surface: oklch(1 0 0);
  --surface-2: oklch(0.972 0.003 60);
  --surface-3: oklch(0.945 0.005 60);
  --border: oklch(0.91 0.005 60);
  --border-strong: oklch(0.84 0.008 60);
  --text-1: oklch(0.18 0.005 60);
  --text-2: oklch(0.42 0.006 60);
  --text-3: oklch(0.58 0.008 60);
  --success: oklch(0.55 0.15 145);
  --danger: oklch(0.56 0.20 27);
  --warning: oklch(0.68 0.16 75);
  --info: oklch(0.55 0.14 230);
  color-scheme: light;
}

/* ============== GLOBAL BASELINE ============== */
* { box-sizing: border-box; }

html {
  font-size: var(--text-md);
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-sans);
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11', 'ss01';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--bg);
  color: var(--text-1);
  letter-spacing: -0.005em;
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**WARNING — Preserving existing styles**: If `src/index.css` đã có content (custom @theme, custom @layer base, font imports), preserve them by:

1. First reading existing file: `cat src/index.css`
2. Backup: `cp src/index.css src/index.css.v5-backup`
3. Merge: keep `@import "tailwindcss"` and any font imports, REPLACE `@theme` block, ADD new `:root` and mode blocks at the end
4. Show diff to Dominium before committing

### TASK 6 — Stage 0: Build first 3 components + showcase route (60 phút)

Build these 3 components FIRST (no other components yet — we need to verify the design system before scaling):

**6.1 —** `src/ui/components/primitives/button.tsx`:

Use the full code from ADR section 4.2. Include:

- `ButtonProps` interface với `variant`, `size`, `icon`, `iconPosition`
- All 6 variants: `primary`, `primary-sheen`, `secondary`, `ghost`, `outline`, `destructive`
- ForwardRef wrap
- Co-located CSS in `src/ui/components/primitives/button.css`, imported at top of file
- Default export: `Button` named export

**6.2 —** `src/ui/components/layout/logo-mark/logo-mark.tsx`:

Use full code from ADR section 5.3. Make sure:

- Uses `motion/react` (NOT `framer-motion`)
- Uses `springs.glacial` from `@/ui/lib/motion`
- Has `key={route}` on orange tile motion.rect to retrigger pulse on route change
- Co-located CSS at `src/ui/components/layout/logo-mark/logo-mark.css`

Also create:

- `src/ui/components/layout/logo-mark/index.ts` exporting `LogoMark` and types

**6.3 —** `src/ui/components/data/kpi-card/kpi-card.tsx` (basic version):

```typescript
import { cn } from '@/ui/lib/cn';
import { type ReactNode } from 'react';
import './kpi-card.css';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  delta?: { value: number; direction: 'up' | 'down'; label?: string };
  icon?: ReactNode;
  featured?: boolean;
  className?: string;
}

export function KpiCard({ label, value, delta, icon, featured, className }: KpiCardProps) {
  // Full implementation per showcase v2/v3:
  // - Standard variant: flat solid surface, border-strong on hover
  // - Featured variant: gradient bg, spotlight follow cursor, glow halo on hover
  // - Numbers use tabular-nums font feature
  // - Delta has up/down arrow icons (lucide ArrowUpRight, ArrowDownRight)
  // - Spotlight uses CSS custom props --mx, --my updated via onMouseMove
}
```

Reference showcase HTML files for exact visual.

**6.4 — Create showcase route**:

Add a new route at `/v6-storybook` in your router:

```tsx
// src/pages/v6-storybook.tsx
import { useState } from 'react';
import { Button } from '@/ui/components/primitives/button';
import { LogoMark } from '@/ui/components/layout/logo-mark';
import { KpiCard } from '@/ui/components/data/kpi-card/kpi-card';
import { Plus, ArrowRight, Filter, Download } from 'lucide-react';
import type { RouteKey } from '@/ui/components/layout/logo-mark/positions';

const ROUTES: RouteKey[] = [
  'dashboard', 'okrs', 'leads', 'ads',
  'media', 'daily-sync', 'checkin', 'settings'
];

export default function V6Storybook() {
  const [logoRoute, setLogoRoute] = useState<RouteKey>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  return (
    <div className={theme} style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px', color: 'var(--text-1)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em' }}>SMIT OS v6 — Storybook</h1>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
            Toggle theme
          </button>
        </header>

        {/* Button section */}
        <section>
          <h2 style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            Buttons
          </h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="primary-sheen" icon={<ArrowRight size={14} />} iconPosition="right">
              Get started
            </Button>
            <Button variant="primary" icon={<Plus size={14} />}>Create</Button>
            <Button variant="secondary">Cancel</Button>
            <Button variant="ghost">Skip</Button>
            <Button variant="outline" icon={<Filter size={14} />}>Filter</Button>
            <Button variant="destructive">Delete</Button>
          </div>
        </section>

        {/* Logo section */}
        <section>
          <h2 style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            Logo · click route to animate
          </h2>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <LogoMark route={logoRoute} size={96} />
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {ROUTES.map(r => (
                <button
                  key={r}
                  onClick={() => setLogoRoute(r)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 999,
                    fontSize: 11,
                    background: logoRoute === r ? 'var(--surface-2)' : 'transparent',
                    color: logoRoute === r ? 'var(--text-1)' : 'var(--text-3)',
                    border: '0.5px solid var(--border)',
                    cursor: 'pointer'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* KPI section */}
        <section>
          <h2 style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            KPI cards · 1 featured (top-left)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxWidth: 600 }}>
            <KpiCard featured label="Revenue today" value="284,500,000" delta={{ value: 18.4, direction: 'up', label: 'vs yesterday' }} />
            <KpiCard label="Ad spend" value="52,300,000" delta={{ value: 3.2, direction: 'down' }} />
            <KpiCard label="Signups" value={847} delta={{ value: 26, direction: 'up' }} />
            <KpiCard label="ROAS" value="5.44x" delta={{ value: 12, direction: 'up' }} />
          </div>
        </section>
      </div>
    </div>
  );
}
```

Register route in `src/main.tsx` or router setup:

```typescript
{ path: '/v6-storybook', element: <V6Storybook /> }
```

**6.5 — Verify**: Start dev server, navigate to `http://localhost:5173/v6-storybook`. Test:

- All button variants render
- Hover effects work (border color, glow, icon scale)
- Sheen sweep works on `primary-sheen`
- Theme toggle switches dark/light correctly
- Logo animates when clicking different routes
- KPI featured card has glow halo + spotlight on hover

**Stop and report to Dominium** with:

- Screenshot or description of how it looks
- Any visual differences from showcase HTML files
- Any error or warning during build

### TASK 7 — Wait for approval, then proceed

After Task 6, **STOP and wait for Dominium's approval** before proceeding to Stage 1 full component library build. Why:

- Verify the 3 foundation components match the showcase quality
- Adjust tokens if visual is off
- Don't waste time building 30+ components if foundation needs tuning

When Dominium approves, continue to Stage 1 (build remaining components) following ADR section 9.2.

## OPERATIONAL RULES

### Rule 1: Read before write

Never modify `src/components/v5/` or any file in `src/hooks/`, `src/contexts/`, `src/lib/api.ts`. These are business logic — they stay untouched. If you think you need to modify one, STOP and ask first.

### Rule 2: Commit per task

After each TASK is complete and verified, commit:

```bash
git add .
git commit -m "feat(v6): <task description>"
```

Commit message convention:

- `feat(v6): stage-0 setup foundation tokens` (Task 5)
- `feat(v6): stage-0 button + logo-mark + kpi-card primitives` (Task 6)
- `feat(v6): stage-1 add overlays (dialog, sheet, tooltip)` (later)

### Rule 3: Type safety

- All new code must pass `pnpm tsc --noEmit` before commit
- No `any` types
- No `@ts-ignore` without comment explaining why
- All event handlers properly typed

### Rule 4: Forbidden patterns (see ADR Section 10)

- NO `font-black`, `font-extrabold`, `font-bold` — use `font-medium` (500) or `font-normal` (400)
- NO `backdrop-blur` except on Header
- NO glow without `:hover`
- NO `transition duration-300` on transform — use spring physics from `@/ui/lib/motion`
- NO inline magic colors like `#ff5c00` — use `var(--primary)` or `text-primary`
- NO file &gt; 200 lines — split into sub-components
- NO multiple glows visible per screen

### Rule 5: Showcase reference

When in doubt about visual behavior, open the showcase HTML files in browser and check. The showcases ARE the spec.

### Rule 6: Ask, don't assume

When ambiguous, ask Dominium one specific question rather than making a guess that may need to be redone.

### Rule 7: Report after each task

After each TASK, report:

- What you did (1-2 sentences)
- Verification steps you ran (commands + outputs)
- Anything that surprised you or doesn't match ADR
- Next task you're about to start (so user can interject)

## SUCCESS CRITERIA FOR THIS SESSION

By the end of this session, the following must be true:

- \[ \] Branch `feat/v6-frontend-rebuild` created
- \[ \] All Stage 0 dependencies installed (verify via `pnpm list <pkg>`)
- \[ \] `components.json` configured correctly for shadcn
- \[ \] `src/ui/` folder structure exists per ADR Section 12.1
- \[ \] `src/ui/lib/cn.ts`, `src/ui/lib/motion.ts`, `src/ui/lib/match-route.ts` exist and exported
- \[ \] `src/index.css` updated with full token system, old version backed up
- \[ \] `Button` component (all 6 variants) works at `/v6-storybook`
- \[ \] `LogoMark` component animates across all 8 routes at `/v6-storybook`
- \[ \] `KpiCard` (standard + featured) works at `/v6-storybook`
- \[ \] Dev server runs without errors
- \[ \] `pnpm tsc --noEmit` passes
- \[ \] All commits well-structured with conventional commit messages
- \[ \] Final report to Dominium with screenshot or visual description

## FALLBACK BEHAVIORS

**If something doesn't work as ADR says:**

1. Re-read the relevant ADR section carefully
2. Check showcase HTML for visual reference
3. If still stuck, write a 3-line summary of what you tried + what failed + your best guess at root cause, then ask Dominium

**If a package install fails:**

- Try with `--legacy-peer-deps` (npm) or `--shamefully-hoist` (pnpm) if peer dep conflict
- Report exact error to Dominium

**If existing v5 code references something you're about to delete:**

- DO NOT delete v5 in this session (Stage 3 task, not Stage 0)
- If there's a conflict (e.g. CSS classes), namespace v6 classes (e.g. `smit-btn` prefix)

**If you need to make a design choice not covered in ADR:**

- Stop and ask Dominium. Don't decide unilaterally.

---

## START NOW

Begin with TASK 1. Report your findings before moving to TASK 2.

After TASK 6, **STOP** and wait for explicit "continue" from Dominium before doing TASK 7 / Stage 1.

Good luck.