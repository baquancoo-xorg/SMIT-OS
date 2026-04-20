# Brainstorm: Lead Tracker UI Sync

**Date:** 2026-04-20  
**Status:** Agreed

## Problem
Lead Tracker UI khu00f4ng u0111u1ed3ng bu1ed9 vu1edbi design system SMIT OS: header nhu1ecf, tabs underline, card style cu0169, filter raw HTML.

## Gaps Phu00e1t Hiu1ec7n

| Component | Hiu1ec7n tu1ea1i | Chuu1ea9n SMIT OS |
|-----------|-----------|---------------|
| Page header | `text-2xl font-bold` | `text-4xl font-extrabold font-headline` |
| Layout container | `div.p-6` | `h-full flex flex-col gap-[var(--space-lg)]` |
| Tab navigation | underline `border-b-2` | pill `bg-slate-100 p-1 rounded-2xl` |
| KPI cards | `rounded-2xl bg-white shadow-sm` | `rounded-3xl bg-white/50 backdrop-blur-md border border-white/20` |
| Filter selects | raw `<select>` | `CustomFilter` component |
| Action buttons | raw `<button>` | `PrimaryActionButton` |

## Giu1ea3i Phu00e1p Chu1ecdn
4 phase su1eeda u0111u00fang vu00e0o 4 files, khu00f4ng tu1ea1o file mu1edbi, khu00f4ng thu00eam feature.

## Files Su1eeda
1. `src/pages/LeadTracker.tsx`
2. `src/components/lead-tracker/dashboard-tab.tsx`
3. `src/components/lead-tracker/lead-logs-tab.tsx`
4. `src/components/lead-tracker/daily-stats-tab.tsx`
