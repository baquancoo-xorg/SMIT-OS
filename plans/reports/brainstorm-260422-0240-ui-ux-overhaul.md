# Brainstorm Report: SMIT-OS UI/UX Overhaul

**Date:** 2026-04-22 | **Scope:** Desktop & Tablet UI/UX Improvements

## Problem Statement

SMIT-OS has 3 compounding UI issues:
1. **Tablet/small laptop layout breaks** — text truncation, overflow, vỡ layout at 768-1023px
2. **Inconsistent UI components** — border-radius too aggressive (cuts into text), colors bypass design system tokens, duplicate patterns without shared components
3. **Settings page is visually misaligned** — tab styling, table responsiveness, and tab content don't match app's glass/surface aesthetic

## Root Causes Found

### 1. CSS Tokens Unused
- `index.css` defines `--radius-action: 1rem` (16px) and `--radius-container: 1.25rem` (20px)
- `Card.tsx` hardcodes `rounded-3xl` (24px) — corners clip into content
- `Button.tsx` uses `rounded-lg/xl/2xl` per size, not tokens
- `TaskStatusCard` uses `rounded-full` on status buttons — overly aggressive

### 2. Color System Bypass
- `TaskStatusCard`: hardcoded `emerald-50/500`, `blue-50/500`
- `DailyReportBase` modal: `bg-slate-100` (not `bg-surface-container-low`)
- `SettingsTabs`: `bg-slate-100` (not surface tokens)
- Widespread `text-slate-400/500` instead of `text-on-surface-variant`

### 3. Responsive Breakpoint Issue
- Sidebar hides below `xl:` (1280px) — tablet 768-1279px has no fixed sidebar
- Custom breakpoints override: `md` = 430px (not standard 768px)
- Many grids use `md:grid-cols-2` which triggers at 430px, may look wrong on tablet

### 4. Settings-Specific Issues
- `user-management-tab`: `overflow-x-auto -mx-8 px-8` negative margin hack — breaks on tablet
- Inline forms and edit modals use inconsistent Card variants
- Tab content doesn't use shared `Input`/`Button`/`Card` from `ui/` consistently

## Evaluated Approaches

### Option A: Component-First (Token Alignment)
Fix shared components first (Card, Button), then cascade fixes to all pages.
- **Pro:** Single source of truth, cascades automatically
- **Con:** Risk of unintended visual changes across app

### Option B: Page-by-Page Fix
Fix each page independently without touching shared components.
- **Pro:** Isolated, lower risk
- **Con:** Creates more duplication, doesn't solve root cause

### Option C: 4-Phase Hybrid (Recommended)
Fix foundation first, then targeted page fixes.
- **Pro:** Clean foundation enables correct per-page fixes; phased delivery reduces risk
- **Con:** Phase 1 touches shared components (need visual verification)

## Agreed Solution: 4-Phase Hybrid

### Phase 1 — Token Alignment + Shared Components
- `Card.tsx`: `rounded-3xl` → `rounded-2xl` (20px = `--radius-container`)
- `Button.tsx`: Standardize all sizes to `rounded-xl` (12px)
- `Input.tsx`: Keep `rounded-xl` (already correct)
- Add `Badge.tsx` — status chip using design system colors
- Add `SectionHeader.tsx` — icon + title + subtitle pattern (duplicated 6+ times)

### Phase 2 — Settings Page Overhaul
- `SettingsTabs`: `bg-slate-100` → `bg-surface-container-low`
- `user-management-tab`: Replace overflow table with responsive card list on tablet
- All tab content: Refactor to use `SectionHeader`, shared `Input`/`Button`/`Card`

### Phase 3 — Daily Report Forms
- `DailyReportBase`: `bg-slate-100` → `bg-surface-container-low`
- `TaskStatusCard`: `rounded-full` → `rounded-xl`, replace hardcoded colors with `Badge`
- Form metric fields: Standardize input styling

### Phase 4 — Responsive Audit
- Fix layout breaks at 768-1023px (tablet range)
- Fix text truncation/overflow in DailySync, Dashboard, LeadTracker
- Ensure touch targets ≥ 44px (token `--touch-min` already defined)

## Implementation Considerations

- `ui/index.ts` already exports shared components — new components go here
- Tailwind v4 with `@theme` — custom CSS properties usable as Tailwind classes
- `md` breakpoint = 430px (custom override) — use `tablet:` semantics for 768px
- Settings page keeps horizontal tabs layout (user preference)

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Phase 1 Card radius change affects entire app | Medium | Visual verification per page |
| Breakpoint `md=430px` causes responsive confusion | Medium | Document in code comments |
| Phase 4 audit scope creep | Low | Limit to overflow/truncation fixes only |

## Success Metrics
- No text/content clipped by border-radius
- Consistent color token usage across all pages
- Settings page visually matches app glass aesthetic
- Zero horizontal overflow at 768px viewport
- All touch targets ≥ 44px

## Files to Modify (Key)
- `src/components/ui/Card.tsx`, `Button.tsx`
- `src/components/ui/Badge.tsx` (new), `SectionHeader.tsx` (new)
- `src/components/settings/settings-tabs.tsx`, `user-management-tab.tsx`, `fb-config-tab.tsx`
- `src/components/daily-report/DailyReportBase.tsx`, `components/TaskStatusCard.tsx`
- `src/index.css` (breakpoint alias if needed)
