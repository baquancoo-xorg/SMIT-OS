---
title: "UI Polish Round 2 — 8 issues, 3 buckets"
description: "Restore page titles, shrink controls to 32px uniform, migrate Media/Ads tables → TableShell, unify DateRangePicker, shrink OKR cards, fix KOL/KOC Spend bug, horizontal statbar."
status: completed
priority: P2
effort: 7h
branch: main
tags: [ui, polish, refactor, bugfix, layout, tables, datepicker, okr]
created: 2026-05-11
---

# UI Polish Round 2 — Layout & Component Consistency

## Context
- Brainstorm report: [`plans/reports/brainstorm-260511-1018-ui-polish-issues.md`](../reports/brainstorm-260511-1018-ui-polish-issues.md)
- User feedback 2026-05-11: 5 pages bị mất title (commit d458645), controls quá to, tables không đồng nhất, KOL Spend hiển thị sai, statbar wrap dọc, OKR cards quá to
- Predecessor: Phase 8 namespace flatten done 2026-05-11 (commit pending)

## Goal
Polish UI consistency across 5 pages — title LEFT + breadcrumb, controls RIGHT cluster size='sm', tables unified, datepicker unified, OKR cards compact, bug fix.

## Phases

| # | Phase | Effort | Status | File |
|---|---|---|---|---|
| 01 | Layout & Sizing (Bucket A) | 2-3h | completed | [phase-01-layout-sizing.md](./phase-01-layout-sizing.md) |
| 02 | Tables & Statbar (Bucket B) | 3-4h | completed | [phase-02-tables-statbar.md](./phase-02-tables-statbar.md) |
| 03 | Components & Bug Fix (Bucket C) | 1-2h | completed | [phase-03-components-bugfix.md](./phase-03-components-bugfix.md) |

**Total:** 6-9h, ~12 files touched

## Critical Path
```
Phase 01 (Layout shell) ──┐
                           ├──> Phase 02 (Tables consume layout) ──> verify
Phase 03 (Components) ─────┘                                          │
                                                                       └─> commit 3 buckets
```

Phase 01 + 03 có thể parallel (different files). Phase 02 depends on Phase 01 shell. Suggested order: 01 → 03 → 02.

## Success Criteria (Plan-Level)
- [x] 5 pages có h2 title + breadcrumb LEFT
- [x] Tất cả controls trên row top = 32px (TabPill/FilterChip/DateRangePicker/Button size='sm')
- [x] Media/Ads tables visual match Lead Logs (TableShell pattern)
- [x] DateRangePicker identical ở Dashboard + Ads + Lead
- [x] OKR L1 card height ≤ 80px, L2 ≤ 64px
- [x] KOL/KOC Spend hiển thị đúng (15,000,000 VND format)
- [x] Lead Logs statbar luôn horizontal
- [x] vite build clean
- [x] 0 TypeScript errors

## Risks
| Risk | Severity | Mitigation |
|---|---|---|
| FilterChip 'sm' = h-9 hiện tại, không match Button/TabPill 'sm' h-8 | 🟡 Medium | Phase 01: tune FilterChip 'sm' = h-8 trong primitive |
| TableShell migration mất built-in sort/pagination | 🟡 Medium | Phase 02: reuse Lead Logs sort pattern, tạm skip pagination (Media/Ads < 50 rows) |
| Decimal bug có nơi khác chưa fix | 🟢 Low | Phase 03: grep audit tất cả `.reduce(s, p) + p.{cost,price,amount,...}` |
| DateRangePicker shape mismatch (v2 Date, v1 string) | 🟡 Medium | Phase 03: chọn v2 Date shape, adapter URL serialize layer |
| OKR card shrink break visual hierarchy | 🟢 Low | Test visual sau shrink, fallback nếu dense quá |

## Dependencies
- v2 primitive library: Button, TabPill, FilterChip, DateRangePicker, GlassCard, TableShell — tất cả đã ship Phase 4
- Lead Logs filter+statbar pattern — reference cho Phase 02 statbar split

## Out of Scope
- Visual regression test (Playwright) — defer
- Lighthouse audit — user skipped
- Internal comms — user task

## Resolved Decisions (2026-05-11)
1. ✅ DateRangePicker URL state cho Ads + Lead Tracker — **sync URL params** giống Dashboard (`?date_from=&date_to=` yyyy-MM-dd)
2. ✅ Statbar position trong Lead Tracker — **cùng GlassCard, separate sub-row** dưới filter row
