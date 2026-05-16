---
title: "Animated SMIT Logo System"
description: "12-route mapped animated logo for sidebar, login idle loop, and project-wide loading states."
status: pending
priority: P2
effort: 4h
branch: main
tags: [ui, branding, animation, a11y, loading]
created: 2026-05-16
---

# Animated SMIT Logo System

CSS-only animated logo (2 ô vuông cam + viền trắng, 12 frame) áp dụng vào sidebar (route-driven), login (idle loop), và loading states (page/section/button/toast). Copy pattern từ `docs/v6/showcase/smit-os-v6-showcase-v5.html` 1:1, zero new deps.

## Context
- Brainstorm: `plans/reports/brainstorm-260516-1519-animated-logo-system.md`
- Showcase ref: `docs/v6/showcase/smit-os-v6-showcase-v5.html` (lines 224-269 = CSS pattern)
- UI Contract: `docs/ui-design-contract.md` (§accent OKLCH, §radius, §reduced-motion)

## Phases

| # | Phase | File | Status | Effort |
|---|---|---|---|---|
| 01 | Foundation (core SVG + mapping + CSS) | [phase-01-foundation.md](phase-01-foundation.md) | pending | 1h |
| 02 | Loaders + button isLoading swap | [phase-02-loaders.md](phase-02-loaders.md) | pending | 45m |
| 03 | Sidebar logo swap | [phase-03-sidebar.md](phase-03-sidebar.md) | pending | 30m |
| 04 | Login + App Suspense wiring | [phase-04-login-suspense.md](phase-04-login-suspense.md) | pending | 45m |
| 05 | Verification + QA across 12 routes | [phase-05-verification.md](phase-05-verification.md) | pending | 1h |

## Dependencies
- Phase 01 blocks 02, 03, 04
- Phase 02-04 can run sequentially (small surface, low conflict)
- Phase 05 blocks merge

## Key Decisions
- Approach A: CSS-only `data-route` attribute (KISS)
- Zero new runtime deps (no framer-motion)
- 29 existing Spinner callsites NOT touched (only `button.tsx` isLoading)
- Section-level loader, card-level keeps skeleton shimmer
- Reduced-motion: snap, no animation

## Success Criteria
- `npm run build` passes, no TS errors
- 12 routes show distinct logo positions
- Login idle loop 4s smooth
- `prefers-reduced-motion` snap
- UI contract compliance
