# Phase B — Bundle Visibility

**Priority:** P0 | **Status:** pending | **Effort:** 15 min

## Overview
Add `rollup-plugin-visualizer` để có bundle treemap. Evidence cho Phase C chunking decision.

## Implementation
1. `npm install -D rollup-plugin-visualizer`
2. `vite.config.ts` add plugin (chỉ build mode):
```ts
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  react(),
  tailwindcss(),
  visualizer({
    filename: 'dist/stats.html',
    gzipSize: true,
    brotliSize: true,
    template: 'treemap',
    open: false,
  }),
],
```
3. `npm run build`
4. Open `dist/stats.html` trong browser

## Files
- Modify: `vite.config.ts`
- Modify: `package.json` (devDeps)
- Output: `dist/stats.html` (gitignored)

## Todo
- [ ] Install visualizer
- [ ] Add to vite.config.ts
- [ ] `npm run build` success
- [ ] Capture screenshot top 10 chunks → save `plans/260516-1324-perf-rebuild/visuals/bundle-before.png`
- [ ] List top 5 heaviest packages → ghi `reports/bundle-analysis.md`

## Success
- `dist/stats.html` generate được
- Treemap show recharts size, react size, vendor breakdown

## Output dependencies (cho Phase C)
- Recharts gzip size (expect ~85-95KB)
- Total initial JS gzip (baseline)
- Top 10 vendor chunks
