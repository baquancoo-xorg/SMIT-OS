# Phase 00 — Stage 0: Foundation

## Context Links

- ADR: `docs/v6/ADR-001-design-system.md` sections 1-7, 12
- Build prompt: `docs/v6/CLAUDE-CODE-BUILD-PROMPT.md` TASK 1-6
- Showcases: `docs/v6/showcase/smit-os-v6-showcase-{v3,v4,v5}.html`
- Brainstorm: `plans/reports/brainstorm-260515-0805-v6-frontend-rebuild-decision.md`
- UI contract: `docs/ui-design-contract.md` (existing v5 contract — v6 supersedes after Stage 3)

## Overview

- **Priority:** P0 (blocks all other phases)
- **Status:** pending
- **Description:** Setup foundation cho v6 — branch, deps, design tokens, motion lib, 3 first components (Button, LogoMark, KpiCard) + showcase route để Dominium đánh giá visual quality trước khi commit 30+ component build.

## Key Insights

- 4 vấn đề v5 (font-black, glass-morphism, glow always-on, motion absence) đều **không fix được sạch in-place** vì có "ui-canon-ok" annotations rải rác. Rebuild from scratch dễ hơn refactor cleanup.
- `motion: ^12.23.24` đã có trong deps — không cần install lại. Chỉ cần shadcn + radix + ecosystem packages.
- v5 vẫn ship liên tục trên main; v6 cô lập trong branch `feat/v6-frontend-rebuild`, không xung đột.
- Showcase v5 HTML là final visual reference cho logo + sidebar. v3/v4 là button polish levels (V1 outline = chosen).

## Requirements

### Functional
- Branch `feat/v6-frontend-rebuild` exist + clean
- `src/ui/` folder structure per ADR section 12.1
- Design tokens (color, motion, typography) trong `src/index.css` (v5 backup giữ làm `src/index.css.v5-backup`)
- `src/ui/lib/{cn,motion,match-route}.ts` exports working
- Button (**7 variants**: primary, primary-sheen, secondary, ghost, outline, destructive, **success**)
  - `primary-sheen` reserved cho hero CTA (1-per-page glow doctrine)
  - `outline` orange (border + icon, transparent fill) = default cho "Create Xxx" actions (confirmed via screenshot audit 2026-05-15)
  - `success` (green) cho OKR check-in pattern và positive confirms
- LogoMark (8 routes: dashboard, okrs, leads, ads, media, daily-sync, checkin, settings)
- KpiCard (standard + featured với spotlight + glow halo on hover)
- `/v6-storybook` route accessible, render 3 components đầy đủ

### Non-functional
- `pnpm tsc --noEmit` pass (zero error)
- Bundle không bloat thêm > 80KB so v5 baseline (sau Stage 0)
- Lighthouse perf score ≥ 90 cho `/v6-storybook` (dev mode chấp nhận thấp hơn)
- Theme toggle dark/light work parity
- Reduce-motion media query respect

## Architecture

```
src/ui/
├── components/
│   ├── primitives/
│   │   ├── button.tsx          # 6 variants, forwardRef, co-located CSS
│   │   └── button.css
│   ├── data/
│   │   └── kpi-card/
│   │       ├── kpi-card.tsx    # standard + featured variants
│   │       └── kpi-card.css
│   └── layout/
│       └── logo-mark/
│           ├── logo-mark.tsx   # 8-route animated SVG
│           ├── logo-mark.css
│           ├── positions.ts    # ROUTE_POSITIONS + TilePosition types
│           └── index.ts
└── lib/
    ├── cn.ts                   # clsx + twMerge wrapper
    ├── motion.ts               # springs + easings + stagger
    └── match-route.ts          # pathname → RouteKey
```

```
src/pages/v6-storybook.tsx       # demo route, theme toggle, all 3 components
```

`components.json` (shadcn config) tại root.

## Related Code Files

### Create
- `src/ui/lib/cn.ts`
- `src/ui/lib/motion.ts`
- `src/ui/lib/match-route.ts`
- `src/ui/components/primitives/button.tsx`
- `src/ui/components/primitives/button.css`
- `src/ui/components/layout/logo-mark/positions.ts`
- `src/ui/components/layout/logo-mark/logo-mark.tsx`
- `src/ui/components/layout/logo-mark/logo-mark.css`
- `src/ui/components/layout/logo-mark/index.ts`
- `src/ui/components/data/kpi-card/kpi-card.tsx`
- `src/ui/components/data/kpi-card/kpi-card.css`
- `src/pages/v6-storybook.tsx`
- `components.json`

### Modify
- `src/index.css` — add token blocks (backup old version first)
- `src/App.tsx` (or router setup) — register `/v6-storybook` route
- `package.json` — add Stage 0 deps via package manager

### DO NOT touch
- `src/components/v5/**`
- `src/hooks/**`, `src/contexts/**`, `src/lib/api.ts`
- Server-side code

## Implementation Steps

1. **TASK 1 — Validate prerequisites** (5 min)
   - Verify Node >= 20, detect package manager (pnpm/npm/yarn) from lockfile
   - Verify dev server starts
   - Confirm current branch + uncommitted state
   - Report findings, STOP if uncommitted blocking work

2. **TASK 2 — Branch + folder structure** (10 min)
   - `git checkout -b feat/v6-frontend-rebuild`
   - Create `src/ui/{components,lib}` subdirs per ADR 12.1
   - Verify `tree src/ui -L 3` output

3. **TASK 3 — Install Stage 0 deps** (20 min)
   - Check existing deps để tránh duplicate (motion v12 đã có)
   - Install: shadcn cli, sonner, vaul, cmdk, next-themes, @number-flow/react, react-hook-form, tailwind-merge (nếu thiếu), clsx, @floating-ui/react, usehooks-ts, react-use-measure, react-resizable-panels (chỉ cài khi cần)
   - Verify `package.json` updated

4. **TASK 4 — Init shadcn** (15 min)
   - `npx shadcn@canary init` với answers cho Vite + Tailwind v4 + `@/ui/components` path
   - Tạo/configure `components.json` per build prompt template

5. **TASK 5 — Foundation files** (45 min)
   - Read `src/index.css` hiện tại + backup → `src/index.css.v5-backup`
   - Write `src/ui/lib/cn.ts`, `motion.ts`, `match-route.ts` per ADR sections 3.2, 5.4
   - Update `src/index.css` với @theme block + :root tokens + dark/light mode blocks (preserve existing @import font)
   - Show diff cho Dominium trước khi commit

6. **TASK 6 — 3 components + showcase route** (60 min)
   - Build Button (6 variants) per ADR section 4.2
   - Build LogoMark per ADR section 5.3 (key={route} để retrigger pulse)
   - Build KpiCard basic + featured per showcase HTML
   - Create `/v6-storybook` route, render all 3
   - Run dev server, visual verify trên browser

## Todo List

- [ ] TASK 1: validate prereq + report
- [ ] TASK 2: branch + folder structure
- [ ] TASK 3: install deps
- [ ] TASK 4: init shadcn
- [ ] TASK 5: foundation files (cn, motion, match-route, index.css)
- [ ] TASK 6: Button + LogoMark + KpiCard + showcase route
- [ ] Visual verification (dev server, theme toggle, all 8 logo routes)
- [ ] Run `pnpm tsc --noEmit` — must pass
- [ ] Commit per task (conventional commit format)
- [ ] Report screenshot + visual diff vs showcase HTML
- [ ] **STOP + wait for Dominium explicit "continue" trước khi sang Phase 01**

## Success Criteria

1. Branch `feat/v6-frontend-rebuild` exist với clean structure
2. `src/ui/` đầy đủ folder per ADR 12.1
3. `components.json` configured correctly
4. `src/index.css` có token system, v5 backup giữ
5. 3 components render đúng tại `/v6-storybook`:
   - Button hover effects (border, glow, icon scale) work
   - Sheen sweep trên `primary-sheen` variant work
   - LogoMark animate khi click 8 route khác nhau
   - KpiCard featured có glow halo + spotlight follow cursor
6. Theme toggle dark/light parity
7. `pnpm tsc --noEmit` pass
8. Dev server runs without warning/error
9. Visual khớp showcase HTML (acceptable variance < 10% — nếu lớn hơn, adjust tokens)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| shadcn init xung đột với Tailwind v4 (không có tailwind.config) | Medium | Medium | `components.json` set `tailwind.config: ""` per build prompt |
| `npx shadcn@canary` package version unstable | Medium | Low | Pin version sau khi init thành công; fallback `shadcn@latest` |
| `motion/react` import vs `framer-motion` confusion | Low | Medium | ADR + lint rule cấm `framer-motion` import |
| Token OKLCH values không render đúng trên Safari cũ | Low | High | Test Safari 16+, fallback `@supports` nếu cần |
| Showcase HTML là "spec" nhưng actual implementation drift | Medium | Medium | Side-by-side compare trong browser, screenshot diff |
| Glass-morphism unintended migration sang v6 | Low | Low | ADR section 10 forbidden patterns + manual review |

## Security Considerations

- Không có user input mới ở Stage 0 (storybook chỉ render hardcoded data)
- shadcn components trong primitives = read-only renders, không có XSS surface mới
- Theme toggle dùng localStorage — không có sensitive data
- KpiCard `value: ReactNode` — props từ trusted code, không phải user input

## Next Steps

- **Blocked by:** Dominium review brainstorm report → approve hoặc abort
- **Unblocks:** Phase 01 (full component library)
- **Follow-up artifacts:**
  - Stage 0 completion report → `plans/reports/stage-0-completion-<date>.md`
  - Visual diff screenshots (showcase HTML vs `/v6-storybook`)
  - Decision log update (memory entry cho v6 progress)
