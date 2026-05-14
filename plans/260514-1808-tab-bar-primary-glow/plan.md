---
title: "Tab Bar Standardization — Primary Glow"
description: "Unify TabPill visual style (primary glow active state, 36px outer height) and migrate OKRs/Leads/Ads tab state to URL query params."
status: completed
priority: P2
effort: 3h
branch: main
tags: [ui, tab-bar, a11y, url-state]
created: 2026-05-14
---

# Tab Bar Standardization — Primary Glow

## Phases

| # | Phase | Status | Effort | Depends on |
|---|-------|--------|--------|------------|
| 1 | [TabPill visual standard](phase-01-tab-pill-visual-standard.md) | completed | 1.5h | — |
| 2 | [Page usage & URL state](phase-02-page-tab-state-and-usage.md) | completed | 1h | Phase 1 |
| 3 | [Validation & review](phase-03-validation-review.md) | completed | 0.5h | Phase 2 |

## Key Decisions

- **Active style:** neutral lifted (`bg-surface-container shadow-sm`) + primary accent ring/glow — no solid orange fill. Aligns with §13 Tab Bar / TabPill and §7 Shadow/Glow.
- **Size:** `sm` prop produces outer height **32px** (28 + 2×2 padding). Target 36px requires `sm` tab height bump to `h-8` (32px item) + `p-0.5` container = **33px**, or custom `md` shrink. Decision: standardize all page-level tabs on `size="sm"` with a new dedicated **`page` size variant** (h-[34px] item, p-0.5 container → 35px outer ≈ 36px). Settings currently `md` (48px outer); will migrate to `page`.
- **URL state:** OKRs, Leads, Ads migrate from `useState` to `useSearchParams` matching Dashboard/DailySync/Settings pattern.

## Files in Scope

| File | Phase |
|------|-------|
| `src/components/v5/ui/tab-pill.tsx` | 1 |
| `src/pages/OKRsManagement.tsx` | 2 |
| `src/pages/v5/LeadTracker.tsx` | 2 |
| `src/pages/v5/AdsTracker.tsx` | 2 |
| `src/pages/v5/Settings.tsx` | 2 |

## Out of Scope

- `src/components/dashboard/ui/segmented-tabs.tsx` — orphaned; optional cleanup post-plan.
- `src/components/dashboard/overview/KpiTable.tsx` — orphaned; no active route.
