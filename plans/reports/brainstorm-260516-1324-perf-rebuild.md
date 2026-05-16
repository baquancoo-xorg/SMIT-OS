# Brainstorm — SMIT-OS Performance Rebuild

**Date:** 2026-05-16 13:24 ICT
**Branch:** main
**Source:** Audit report Image #1 (P0/P1/P2)
**Status:** Approved — ready for /ck:plan

---

## Problem statement

Audit report đề xuất 9 fixes (P0–P2) cho perf. User pain: FCP/LCP chậm, dashboard lag tab switch, table lag nhiều rows, API >500ms.

**Goal:** App nhanh hơn, mượt hơn, nhẹ hơn.

---

## Verification (evidence-based)

DB row counts (verified via `docker exec smit_os_db psql`):

| Table | Rows |
|---|---|
| raw_ads_facebook | 4,202 |
| LeadSyncRun | 1,843 |
| Notification | 219 |
| Lead | 36 |
| DailyReport | 11 |
| Objective / KeyResult / WeeklyReport | 0 |

### Verdict per audit item

| # | Audit claim | Reality | Verdict |
|---|---|---|---|
| 1 | Gzip missing | server.ts không có compression middleware | **TRUE → fix** |
| 2 | DailyReport idx | Đã có `@@unique([userId, reportDate])` | **FALSE POSITIVE** |
| 3 | WeeklyReport idx | Thiếu nhưng table 0 rows | **DEFENSIVE add** |
| 4 | Notification composite | Đã có 3 indexes, 219 rows | **SKIP — over-engineering** |
| 5 | OKR N+1 | Code dùng `include` (eager), `$transaction`. recalc có 2 round-trips | **REFACTOR low priority** |
| 6 | Recharts code-split | 17 chart files import recharts trực tiếp | **TRUE → fix** |
| 7 | Bundle analyzer | Chưa cài | **TRUE → add** |
| 8 | List virtualization | DataTable 279 lines no virtual; chỉ raw_ads_facebook đáng virtualize | **TARGETED fix** |
| 9 | React.memo charts | Chưa wrap | **TRUE → fix** |

### NEW issues
- `vite.config.ts` manualChunks per-package → 50+ chunks, HTTP overhead
- Chưa biết route-level `lazy()` của pages có chưa (cần check App.tsx)

---

## Decisions

User confirmed:
1. **Strategy:** Full audit + defensive DB indexes (cheap insurance dù 0 rows)
2. **Recharts:** Lazy-load từng chart component
3. **Chunking:** Quyết sau khi có analyzer report

---

## Final plan — 7 phases

| Phase | Scope | Effort | Expected gain |
|---|---|---|---|
| A — Network | `compression` middleware + ETag strong | 30 min | -60% JSON transfer |
| B — Visibility | `rollup-plugin-visualizer` (gzip+brotli treemap) | 15 min | Chunk graph evidence |
| C — Bundle diet | Recharts React.lazy + route lazy + analyzer-driven manualChunks rewrite | 4-6h | -35% initial JS |
| D — Render | React.memo + useMemo cho 17 charts, Profiler audit | 3-4h | Dashboard tab switch <100ms |
| E — Virtualization | `@tanstack/react-virtual` targeted (raw_ads_facebook) | 2-3h | 60fps scroll 4k rows |
| F — DB defensive | WeeklyReport idx + OKR recalc refactor (skip Notification composite) | 1-2h | Future-proof |
| G — Verification | Lighthouse before/after + bundle delta + smoke | 2h | Evidence of gain |

**Total:** 1.5–2 ngày (cắt 60% từ audit's 3-5 ngày scope).

---

## Risks

| Risk | Mitigation |
|---|---|
| Compression vs SSE | Skip `/api/notifications/stream` nếu có SSE |
| Recharts lazy flash skeleton | Suspense ở dashboard level, không per-chart |
| Manual chunks break HMR | Test dev mode kỹ |
| React.memo + array prop stale | Custom comparator + parent useMemo |
| Virtualization break sticky/horizontal scroll | Test scroll-restore + filter UX |
| OKR refactor break recalc | Unit test trước (hiện không có test cho recalc) |
| Cloudflare tunnel auto-brotli → gzip thừa | Verify bằng curl trước khi cài compression |

---

## Success metrics

- Lighthouse Performance ≥ 90 (baseline TBD)
- Initial JS gzip giảm ≥ 35%
- Dashboard tab switch <100ms (React Profiler)
- Ads page scroll ≥ 60fps với 4k rows
- API JSON transfer size giảm ≥ 50%

---

## Unresolved questions

1. `/api/notifications` có dùng SSE/WebSocket không? (cần skip compression nếu có)
2. Lighthouse baseline hiện tại bao nhiêu? (đo trước khi fix Phase A)
3. Cloudflare tunnel có auto-brotli/auto-gzip không? (curl test trước cài compression server-side)
4. Có unit test cho `okr.service.recalculateObjectiveProgress` không? (cần add trước refactor Phase F)
