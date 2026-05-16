---
title: SMIT-OS Performance Rebuild
slug: perf-rebuild
created: 2026-05-16
status: completed
priority: high
effort: 1.5-2 days
blockedBy: []
blocks: []
---

# SMIT-OS Performance Rebuild

Evidence-based perf optimization. 60% audit items premature (DB tables 0-219 rows) → defensive only. Focus thực: network compression + bundle diet + render memo + targeted virtualization cho `raw_ads_facebook` (4202 rows).

**Source brainstorm:** [reports/brainstorm-260516-1324-perf-rebuild.md](../reports/brainstorm-260516-1324-perf-rebuild.md)

## Pre-flight findings (verified)

- Routes pages ✅ đã lazy (`App.tsx:15-25`)
- No SSE for notifications → compression safe
- DailyReport `@@unique([userId, reportDate])` ✅ đã có (audit false positive)
- WeeklyReport/Objective/KeyResult: 0 rows → defensive index only
- `vite.config.ts` manualChunks per-package → tạo nhiều chunks, cần group lại sau analyzer

## Phases

| # | Phase | File | Status | Effort |
|---|---|---|---|---|
| A | Network compression | [phase-a-network-compression.md](phase-a-network-compression.md) | ✅ done | 30 min |
| B | Bundle visibility | [phase-b-bundle-visibility.md](phase-b-bundle-visibility.md) | ✅ done | 15 min |
| C | Bundle diet (chunks rewrite) | [phase-c-bundle-diet.md](phase-c-bundle-diet.md) | ✅ done (C1 lazy skipped — see reports/phase-c-decision.md) | 30 min |
| D | Render optimization (memo) | [phase-d-render-optimization.md](phase-d-render-optimization.md) | ✅ done (5 base charts) | 20 min |
| E | Targeted virtualization | [phase-e-virtualization.md](phase-e-virtualization.md) | ⏭ skipped (YAGNI — see reports/phase-e-decision.md) | — |
| F | DB defensive | [phase-f-db-defensive.md](phase-f-db-defensive.md) | ✅ done (4 indexes, OKR refactor deferred) | 15 min |
| G | Verification | [phase-g-verification.md](phase-g-verification.md) | ✅ done — see reports/final-metrics.md | 15 min |

## Key dependencies

- A & B độc lập, có thể parallel
- C depends B (cần analyzer report)
- D depends C (lazy boundary affects memo scope)
- E độc lập với C/D (different layer)
- F độc lập (backend)
- G last (need all phases shipped)

## Success metrics

- Lighthouse Performance ≥ 90
- Initial JS gzip giảm ≥ 35%
- Dashboard tab switch <100ms (React Profiler)
- Ads page scroll ≥ 60fps với 4k rows
- API JSON transfer size giảm ≥ 50%
