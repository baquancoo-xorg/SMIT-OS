# Phase 03 u2014 Daily Report Forms Fix

## Overview

- **Priority:** High
- **Status:** completed
- **Blocked by:** Phase 01 (cu1ea7n `Badge` tu1eeb Phase 01)
- **Effort:** ~2h

Fix UI cu1ee7a Daily Report forms: modal background, status buttons, form fields inconsistency.

## Key Insights

- `DailyReportBase` modal du00f9ng `bg-slate-100` cho background u2014 flat, khu00f4ng khu1edbp glass aesthetic
- `TaskStatusCard` du00f9ng `rounded-full` cho status buttons (u0110u00e3 Xong / u0110ang Lu00e0m) u2014 quu00e1 thou00e1t, khu00f4ng nhu1ea5t quu00e1n
- `TaskStatusCard` hardcode `emerald-50/500` vu00e0 `blue-50/500` thay vu00ec du00f9ng design tokens
- `TodayPlanCard` cu00f3 6 hardcode color maps theo team type (`indigo/orange/pink/emerald`) u2014 bypass design system
- `BlockerCard` du00f9ng `border-red-100 bg-red-50/40` u2014 OK vu00ec u0111u00e2y lu00e0 cu1ea3nh bu00e1o, nhu01b0ng nu00fat X vu1eabn du00f9ng `rounded-full`
- `DailyReportBase` header layout cu00f3 thu1ec3 bao gm `flex-wrap gap-4` u0111u1ec3 responsive u2014 u0111u00e3 u00f3K

## Requirements

### DailyReportBase.tsx
- Modal container: `bg-slate-100` u2192 `bg-surface-container-low`
- Modal container border-radius: `rounded-xl` u2192 `rounded-2xl` (khu1edbp `--radius-container`)
- Modal max-height: giu1eef `max-h-[90vh]` u2014 OK
- Header: giu1eef nguyu00ean (cu00f3 team color gradient, OK)
- Thu00eam `tablet:max-w-2xl` nu1ebfu cu1ea7n (hiu1ec7n `max-w-3xl`)

### TaskStatusCard.tsx
- Status buttons: `rounded-full` u2192 `rounded-xl`
- "u0110u00e3 Xong" button colors:
  - Active: `bg-emerald-50 border-emerald-500 text-emerald-700` u2192 `bg-tertiary/10 border-tertiary text-tertiary`
  - Inactive: giu1eef `bg-white border-slate-300 text-slate-500`
- "u0110ang Lu00e0m" button colors:
  - Active: `bg-blue-50 border-blue-500 text-blue-700` u2192 `bg-primary/10 border-primary text-primary`
  - Inactive: giu1eef `bg-white border-slate-300 text-slate-500`
- Task ID badge: `rounded` u2192 `rounded-md`
- Card background: giu1eef `bg-white border border-slate-200 rounded-xl` u2014 OK (contrast card nu1ed9i trong modal)

### TodayPlanCard.tsx
- Xu00f3a `colorClasses` map hardcode theo teamType
- Thay vu00ec du00f9ng mu00e0u theo team, du00f9ng primary token cho focus/border
- Priority state giu1eef `red-*` (cu1ea3nh bu00e1o = red lu00e0 u0111u00fang)
- Input fields: Thay cu00e1c `input` raw thu00e0nh `Input` component tu1eeb `ui/` hou1eb7c giu1eef nguyu00ean styling nu1ebfu input cu00f3 custom percent/icon
- Nu00fat X: `rounded-full` u2192 `rounded-xl`

### BlockerCard.tsx
- Nu00fat X: `rounded-full` u2192 `rounded-xl`  
- Tag buttons: `rounded` u2192 `rounded-md` (nhu1ea5t quu00e1n)
- Textarea border: giu1eef `border-red-200` (context = blocker, red lu00e0 u0111u00fang)
- `grid grid-cols-1 md:grid-cols-3` u2014 `md` = 430px u00e0 check xem cu00f3 vu1ee1 khu00f4ng; nu1ebfu cu1ea7n u0111u1ed5i `tablet:grid-cols-3`

### AdHocTasksSection.tsx
- Kiu1ec3m tra vu00e0 fix nu1ebfu cu00f3 inconsistent patterns

## Files to Modify

- `src/components/daily-report/DailyReportBase.tsx`
- `src/components/daily-report/components/TaskStatusCard.tsx`
- `src/components/daily-report/components/TodayPlanCard.tsx`
- `src/components/daily-report/components/BlockerCard.tsx`
- `src/components/daily-report/components/AdHocTasksSection.tsx` (kiu1ec3m tra)

## Implementation Steps

1. **Fix `DailyReportBase.tsx`**: background + border-radius
2. **Fix `TaskStatusCard.tsx`**: `rounded-full` u2192 `rounded-xl`, colors u2192 tokens
3. **Fix `TodayPlanCard.tsx`**: Xu00f3a colorClasses map, du00f9ng primary tokens, fix nu00fat X radius
4. **Fix `BlockerCard.tsx`**: Nu00fat X radius, tag buttons radius
5. **Kiu1ec3m tra `AdHocTasksSection.tsx`**: Fix nu1ebfu cu1ea7n
6. **Compile check**

## Todo

- [x] Fix `DailyReportBase.tsx` u2014 background + border-radius
- [x] Fix `TaskStatusCard.tsx` u2014 `rounded-full` u2192 `rounded-xl` + design token colors
- [x] Fix `TodayPlanCard.tsx` u2014 xu00f3a hardcode team colors, du00f9ng primary tokens
- [x] Fix `BlockerCard.tsx` u2014 nu00fat X + tag buttons radius
- [x] Kiu1ec3m tra `AdHocTasksSection.tsx`
- [x] Compile check

## Success Criteria

- Daily report modal khu1edbp glass aesthetic
- Status buttons (u0110u00e3 Xong/u0110ang Lu00e0m) du00f9ng design system colors
- Khu00f4ng cu00f3 `rounded-full` tru00ean bu1ea5t ku1ef3 button interactive nu00e0o (tru1eeb icons/avatars)
- `TodayPlanCard` khu00f4ng cu00f3 hardcode team colors
