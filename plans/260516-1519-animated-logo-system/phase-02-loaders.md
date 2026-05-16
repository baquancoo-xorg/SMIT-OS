# Phase 02 — Loaders + Button isLoading

## Context
- Parent: [plan.md](plan.md)
- Depends on: [phase-01-foundation.md](phase-01-foundation.md)

## Overview
- **Date:** 2026-05-16
- **Priority:** P2
- **Status:** pending
- **Description:** Build wrapper components (PageLoader, SectionLoader, InlineLoader) + swap Spinner trong `button.tsx` isLoading variant.

## Key Insights
- 29 callsites của `Spinner` KHÔNG touch — chỉ thay biến thể inline trong `button.tsx`
- Section-level loader only — card-level skeleton shimmer giữ nguyên
- `PageLoader` dùng cho Suspense fallback toàn app (full-screen center)
- `SectionLoader` dùng cho data section fallback (vùng vừa, 1 logo center + label optional)
- `InlineLoader` cho toast/button/inline status

## Requirements
- PageLoader: full-screen overlay, AnimatedLogo size=xl looping, optional label
- SectionLoader: min-height ~200px, AnimatedLogo size=lg looping, center
- InlineLoader: inline-flex span, AnimatedLogo size=xs looping, optional aria-label
- All 3 wrappers preserve `role="status"` + `aria-label="Loading"` semantics
- Button isLoading: replace inline Spinner with InlineLoader (size=xs)

## Architecture
```
src/components/branding/
└── logo-loader.tsx  (export PageLoader, SectionLoader, InlineLoader)
```

Each loader = thin wrapper, no state, no logic except className + ARIA.

## Related Code Files
**Create:**
- `src/components/branding/logo-loader.tsx`

**Edit:**
- `src/components/ui/button.tsx` (swap Spinner → InlineLoader in isLoading branch only)
- `src/components/branding/index.ts` (add loader exports)

**Reference (read-only):**
- `src/components/ui/spinner.tsx` (ARIA contract to mirror)
- `src/components/ui/button.tsx` (locate isLoading branch)

## Implementation Steps
1. Read `src/components/ui/spinner.tsx` lines 1-end để hiểu ARIA pattern.
2. Read `src/components/ui/button.tsx` to find isLoading render branch (grep `isLoading`).
3. Create `logo-loader.tsx`:
   - `PageLoader({ label }: { label?: string })` — fixed inset overlay, backdrop blur, center AnimatedLogo xl looping
   - `SectionLoader({ label, minHeight }: { label?: string; minHeight?: string })` — flex center, default minHeight `12rem`
   - `InlineLoader({ label, size }: { label?: string; size?: 'xs' | 'sm' })` — inline-flex, AnimatedLogo
4. Edit `button.tsx`:
   - Locate isLoading render path
   - Replace `<Spinner ... />` với `<InlineLoader size="xs" label={loadingLabel} />`
   - Keep import path consistent (no circular dep)
5. Update `src/components/branding/index.ts` to export 3 loaders.
6. TS compile check.

## Todo List
- [ ] Create `logo-loader.tsx` with 3 wrappers
- [ ] Edit `button.tsx` isLoading branch
- [ ] Update branding `index.ts`
- [ ] TS compile clean
- [ ] Visual smoke: import InlineLoader in a test render, verify spinning

## Success Criteria
- 3 loader components exported from `src/components/branding`
- Button `isLoading` shows animated logo instead of Spinner
- Other 28 Spinner callsites untouched (verify via grep)
- ARIA `role="status"` + `aria-label` preserved

## Risk Assessment
- **Risk:** Button layout shift khi swap Spinner (border 2px) → InlineLoader (SVG). **Mitigation:** Size xs = 14px match Spinner sm, test button height visually.
- **Risk:** Circular import nếu loader import button. **Mitigation:** Loader chỉ import AnimatedLogo, button import loader — one-way.

## Security Considerations
- N/A

## Next Steps
- Phase 03 dùng AnimatedLogo trực tiếp trong sidebar (không qua loader).
