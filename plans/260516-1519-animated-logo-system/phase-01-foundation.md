# Phase 01 — Foundation

## Context
- Parent: [plan.md](plan.md)
- Brainstorm: `plans/reports/brainstorm-260516-1519-animated-logo-system.md`
- Reference: `docs/v6/showcase/smit-os-v6-showcase-v5.html` lines 224-269

## Overview
- **Date:** 2026-05-16
- **Priority:** P2
- **Status:** pending
- **Description:** Build core animated logo SVG, 12-route mapping table, CSS keyframes + reduced-motion media query. Foundation cho 3 phase tiếp theo.

## Key Insights
- Showcase v5 dùng SVG 40x40 viewBox, 4 tile-frame (border) + 1 tile-white + 1 tile-orange
- Animation = CSS transform translate trên 2 tile, transition 600ms cubic-bezier
- `data-route` attribute drive variant — no JS animation logic
- Login idle loop = keyframes cycle 12 frames over 4s, `animation-play-state: paused` khi tab hidden

## Requirements
- Core component supports props: `route?: string`, `size: 'xs'|'sm'|'md'|'lg'|'xl'`, `looping?: boolean`, `inline?: boolean`, `className?: string`
- Mapping table cho 12 routes + fallback
- CSS keyframes `smitLogoCycle` cho idle loop
- `@media (prefers-reduced-motion: reduce)` → `transition: none; animation: none`
- Tile colors dùng CSS custom property `var(--brand-500)` cho orange tile, `var(--text-1)` cho white-frame tile

## Architecture
```
src/components/branding/
├── animated-logo.tsx       (forwardRef, accepts route or explicit frame)
├── logo-routes.ts          (PATHNAME_TO_FRAME map + FRAMES array)
└── animated-logo.css       (keyframes, sizes, reduced-motion)
```

`logo-routes.ts` exports:
- `FRAMES: Array<{ white: [number, number]; orange: [number, number] }>` (length 12)
- `resolveFrameIndex(pathname: string): number` — match longest prefix, default fallback (11)
- `IDLE_LOOP_DURATION_MS = 4000`

`animated-logo.tsx`:
- Stateless functional component, forwardRef HTMLSpanElement
- If `route` provided: set `data-frame={resolveFrameIndex(route)}` on `<span>` wrapper
- If `looping`: set `data-looping="true"` → CSS animation kicks in
- SVG inner uses CSS classes `.smit-logo__tile-white` and `.smit-logo__tile-orange`
- Sizes: xs=14, sm=20, md=24, lg=80, xl=128 (px)

## Related Code Files
**Create:**
- `src/components/branding/animated-logo.tsx`
- `src/components/branding/logo-routes.ts`
- `src/components/branding/animated-logo.css`
- `src/components/branding/index.ts` (barrel for branding folder only — public API)

**Reference (read-only):**
- `docs/v6/showcase/smit-os-v6-showcase-v5.html` (lines 224-269)
- `src/components/layout/sidebar.tsx` (lines 25-38 for SmitGridMark current shape)
- `docs/ui-design-contract.md` §accent §radius §reduced-motion

## Implementation Steps
1. Create `logo-routes.ts` with FRAMES array (12 entries) + resolveFrameIndex (longest-prefix match against PATHNAME_TO_FRAME table).
2. Create `animated-logo.css`:
   - Base `.smit-logo` styles
   - 12 selectors `.smit-logo[data-frame="0"] .smit-logo__tile-white { transform: translate(0,0); }` etc.
   - `transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1)` on tile classes
   - `@keyframes smitLogoCycle` advancing through 12 frames (8.33% each step)
   - `.smit-logo[data-looping="true"] .smit-logo__tile-white` → `animation: smitLogoCycleWhite 4s infinite`
   - Similar for orange
   - `@media (prefers-reduced-motion: reduce) { .smit-logo *, .smit-logo { transition: none !important; animation: none !important; } }`
   - Size classes `.smit-logo--xs/sm/md/lg/xl`
3. Create `animated-logo.tsx`:
   - Import `./animated-logo.css`
   - forwardRef, render `<span>` wrapper + SVG 40x40 viewBox
   - 4 `<rect>` tile-frame (border) + 2 animated `<rect>` (tile-white, tile-orange)
   - `useEffect` để pause animation khi `document.hidden` (chỉ khi `looping`)
4. Create `index.ts` barrel exporting AnimatedLogo + types.
5. Verify TS compile: `npx tsc --noEmit` trên file mới.

## Todo List
- [ ] Create `logo-routes.ts` with 12-frame mapping
- [ ] Create `animated-logo.css` with transitions + keyframes + reduced-motion
- [ ] Create `animated-logo.tsx` with forwardRef + visibility pause hook
- [ ] Create `index.ts` barrel
- [ ] TS compile clean (`npx tsc --noEmit` or `npm run build`)

## Success Criteria
- All 4 files exist, total ~250 LOC
- Component renders without errors when imported into a test page
- TS no errors
- CSS validates (no warnings on `@media`/`@keyframes`)
- Tile colors resolve from design tokens, not hex

## Risk Assessment
- **Risk:** Keyframes interpolation might cause jump between frame 11 → 0 in loop. **Mitigation:** Use `cubic-bezier(0.65, 0, 0.35, 1)` and verify with browser DevTools animation panel.
- **Risk:** `document.hidden` listener leak. **Mitigation:** Cleanup in useEffect return.

## Security Considerations
- N/A — pure presentational component, no user input, no external resources.

## Next Steps
- Phase 02 imports `AnimatedLogo` for loaders.
