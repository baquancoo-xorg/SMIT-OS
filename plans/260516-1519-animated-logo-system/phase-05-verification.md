# Phase 05 — Verification + QA

## Context
- Parent: [plan.md](plan.md)
- Depends on: Phase 01-04 complete

## Overview
- **Date:** 2026-05-16
- **Priority:** P2
- **Status:** pending
- **Description:** Build check, lint, manual QA 12 routes, reduced-motion smoke, UI contract audit, journal entry.

## Key Insights
- Visual QA cần cover: sidebar (expanded + collapsed) × 12 routes
- Reduced-motion test = bật System Preferences → Accessibility → Display → Reduce motion
- UI contract audit: grep hex color trong file mới, verify accent token usage

## Requirements
- `npm run build` clean
- `npm run lint` clean (no new warnings)
- 12 routes navigate → logo distinct position
- Login loop visible, smooth, no jank
- Button isLoading shows animated logo (test a Save button)
- prefers-reduced-motion → tile snap, no animation
- No hex hardcoded in branding/* files
- SmitGridMark fully removed from codebase

## Architecture
N/A — verification only.

## Related Code Files
**Read-only audit:**
- `src/components/branding/*` (all 4 new files)
- `src/components/layout/sidebar.tsx`
- `src/pages/LoginPage.tsx`
- `src/components/ui/button.tsx`
- `src/App.tsx`

## Implementation Steps
1. Run `npm run build` — fix any TS errors.
2. Run `npm run lint` (or `npx eslint src/components/branding src/components/layout/sidebar.tsx src/pages/LoginPage.tsx src/components/ui/button.tsx`).
3. Grep audit:
   - `grep -rn "#[0-9a-fA-F]\{3,8\}" src/components/branding/` → expect 0 hex
   - `grep -rn "SmitGridMark" src/` → expect 0
   - `grep -rn "logo-only.png" src/` → expect 0
   - `grep -rn "Spinner" src/components/ui/button.tsx` → expect 0 (only InlineLoader now)
4. Manual navigate (dev server running): /dashboard → /okrs → /leads → /ads → /media → /daily-sync → /weekly-checkin → /reports → /settings → /profile → unknown-path → /login. Verify distinct logo position each route.
5. Toggle macOS reduced-motion: verify sidebar logo snaps, login loop stops.
6. Sidebar collapse toggle: verify logo still renders + animates.
7. Trigger a Button isLoading state (e.g., save form): verify animated mini-logo replaces Spinner.
8. Write completion journal via `/ck:journal` (optional).

## Todo List
- [ ] `npm run build` clean
- [ ] `npm run lint` clean
- [ ] Hex audit pass
- [ ] Dead-code removal verified (grep)
- [ ] Manual QA 12 routes
- [ ] Reduced-motion smoke
- [ ] Sidebar collapsed visual check
- [ ] Button isLoading visual check
- [ ] Update CLAUDE.md memory if new pattern emerges

## Success Criteria
- All grep audits return expected counts
- Build green
- No layout regression
- Reduced-motion respected
- UI contract compliance documented (cite §accent §radius §reduced-motion in completion note)

## Risk Assessment
- **Risk:** Visual regression in sidebar header height. **Mitigation:** Compare before/after screenshot.
- **Risk:** Login loop performance on low-end mobile. **Mitigation:** Verify `animation-play-state: paused` works via DevTools Performance panel.

## Security Considerations
- N/A

## Next Steps
- Plan complete → archive via `/ck:plan:archive` if requested.
- Add memory entry: project_animated_logo_shipped.md
