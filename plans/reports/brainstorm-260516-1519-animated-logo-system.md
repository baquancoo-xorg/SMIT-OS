# Brainstorm — SMIT Animated Logo System

**Date:** 2026-05-16 15:19 | **Source:** docs/v6/showcase/smit-os-v6-showcase-v5.html

## Problem
Áp dụng animated SMIT logo (2 ô vuông cam + viền trắng, 12 biến thể) vào:
1. Login page — idle loop 12 frames
2. Loading animation toàn dự án
3. Sidebar logo — chuyển động theo route khi đổi trang

## Decisions (user-approved)

| Topic | Decision |
|---|---|
| Variant mapping | 1 variant cố định / route, 12-route mapping table |
| Loading scope | Full-page + button isLoading + section Suspense + toast |
| Login behavior | Idle loop 12 frames (4s/cycle) |
| Reduced-motion | Respect `prefers-reduced-motion` |
| Sidebar collapsed | Vẫn animate (size 24px) |
| Multi-loader | Section-level 1 logo, card-level giữ skeleton shimmer |
| Approach | A — CSS-only `data-route` (copy v5 pattern) |
| Login logo size | 80px (giữ nguyên hiện tại) — pending re-confirm if needed |

## Architecture

```
src/components/branding/
├── animated-logo.tsx       # Core SVG 40x40, props: route, size, looping, inline
├── logo-routes.ts          # 12-frame mapping + idle loop sequence
└── logo-loader.tsx         # Wrappers: SectionLoader, PageLoader, InlineLoader
```

## 12-Route Mapping

| # | Route | white (x,y) | orange (x,y) |
|---|---|---|---|
| 0 | /dashboard | 0,0 | 0,0 |
| 1 | /okrs | 10,0 | -10,0 |
| 2 | /leads | 10,10 | -10,-10 |
| 3 | /ads | 0,10 | 0,-10 |
| 4 | /media | 0,0 | 0,-10 |
| 5 | /daily-sync | 0,10 | 0,0 |
| 6 | /weekly-checkin | 0,0 | -10,0 |
| 7 | /settings | 10,0 | 0,0 |
| 8 | /reports | -10,0 | 10,0 |
| 9 | /profile | -10,10 | 10,-10 |
| 10 | /login | -10,-10 | 10,10 |
| 11 | * fallback | 0,-10 | 0,10 |

Login idle loop: `@keyframes` cycle 0→11→0 over 4s.

## Animation Timing
- Route transition: 600ms cubic-bezier(0.4, 0, 0.2, 1)
- Login loop: 4000ms / 12 frames, cubic-bezier(0.65, 0, 0.35, 1)
- Reduced-motion: snap instant, no loop

## Files Touched

| File | Action | LOC delta |
|---|---|---|
| `src/components/branding/animated-logo.tsx` | NEW | +80 |
| `src/components/branding/logo-routes.ts` | NEW | +40 |
| `src/components/branding/logo-loader.tsx` | NEW | +50 |
| `src/components/branding/animated-logo.css` | NEW | +80 |
| `src/components/layout/sidebar.tsx` | Replace SmitGridMark | -10 +3 |
| `src/pages/LoginPage.tsx` | Replace `/logo-only.png` | -1 +3 |
| `src/components/ui/button.tsx` | isLoading swap | -3 +3 |
| `src/App.tsx` / route shell | Suspense fallback wiring | +5 |

Net ~250 lines, 4 new + 4 edit. 29 chỗ Spinner non-branded giữ nguyên.

## Risk

| Risk | Mitigation |
|---|---|
| Suspense multi-fire → nhiều logo flash | Section-level only, card-level skeleton |
| Sidebar logo annoy daily nav | 600ms transition, tile-only transform, no pulse |
| Mobile pin drain (login loop) | `animation-play-state: paused` when tab hidden |
| Reduced-motion compliance | `@media (prefers-reduced-motion)` snap |

## UI Contract Compliance (docs/ui-design-contract.md)
- ✅ Accent = `var(--brand-500)` OKLCH, no hex
- ✅ Reduced-motion respected
- ✅ No solid orange CTA (branding mark, not interactive)
- ✅ Components feature-based (`branding/` folder)

## Success Criteria
- 12 routes show distinct logo positions
- Login page idle loop 4s smooth
- Button isLoading swap không break existing 29 callsites
- Reduced-motion user thấy snap, không transition
- Sidebar collapsed (24px) vẫn animate clean
- Zero new runtime deps

## Open Questions
- Login logo có cần upscale 80px → 128px hero feel? (Pending UX call)
- App.tsx có top-level Suspense chưa? Cần verify khi plan.
