# Phase 03 — Sidebar Logo Swap

## Context
- Parent: [plan.md](plan.md)
- Depends on: [phase-01-foundation.md](phase-01-foundation.md)

## Overview
- **Date:** 2026-05-16
- **Priority:** P2
- **Status:** pending
- **Description:** Replace `SmitGridMark` SVG (sidebar.tsx:25-38) bằng `AnimatedLogo` với `route={location.pathname}`. Mỗi route change → CSS transform transition tự fire.

## Key Insights
- `Sidebar` đã có `useLocation()` (line ~91) — reuse
- Collapsed state (24px) vẫn animate (per user decision)
- Logo render 2 nơi: header sidebar (line ~102) — chỉ 1 instance
- KHÔNG cần wrapper hay state — `data-frame` từ pathname là đủ

## Requirements
- Sidebar header logo react với `location.pathname` change
- Size `md` (24px) — match current SmitGridMark h-6 w-6
- Collapsed: same component, same size
- Remove `SmitGridMark` function (dead code after swap)

## Architecture
No new files. Sidebar imports `AnimatedLogo` from `@/components/branding`.

## Related Code Files
**Edit:**
- `src/components/layout/sidebar.tsx` (remove SmitGridMark 25-38, replace usage 102, add import)

**Reference (read-only):**
- Phase 01 output: `src/components/branding/animated-logo.tsx`

## Implementation Steps
1. Open `src/components/layout/sidebar.tsx`.
2. Delete `SmitGridMark` function (lines 25-38).
3. Add import: `import { AnimatedLogo } from '../branding';`
4. Replace `<SmitGridMark />` at line 102 với `<AnimatedLogo route={location.pathname} size="md" />`.
5. Verify `useLocation()` already destructured (line ~91) — no new hook needed.
6. TS compile check.

## Todo List
- [ ] Delete SmitGridMark function
- [ ] Add AnimatedLogo import
- [ ] Replace usage with route prop
- [ ] TS compile clean
- [ ] Manual: navigate sidebar to verify logo transitions on route change

## Success Criteria
- Sidebar logo transforms tile positions on every route navigate
- Collapsed sidebar still shows + animates logo
- No regression in sidebar layout (size, spacing)
- SmitGridMark fully removed (grep returns 0)

## Risk Assessment
- **Risk:** Logo size visual change vs old SmitGridMark (different stroke/fill semantic). **Mitigation:** Verify visually after phase 05 QA; tweak `--brand-500` opacity if needed.
- **Risk:** Sidebar re-renders on every pathname change (already does — useLocation triggers). No new perf cost.

## Security Considerations
- N/A

## Next Steps
- Phase 04 wires Login + App Suspense (independent surface).
