# Phase G — Verification

**Priority:** P1 | **Status:** pending | **Effort:** 2h | **Depends:** A-F

## Overview
Measure trước & sau. Evidence cho success metrics. Không có numbers = không claim "nhanh hơn".

## Baseline (chạy TRƯỚC Phase A)
1. Lighthouse Performance score (Chrome DevTools, desktop + mobile)
2. Bundle size: `du -sh dist/assets` + parse `dist/stats.html` total gzip
3. Dashboard tab switch latency (Performance tab record)
4. Ads page scroll FPS (4k rows, Performance tab)
5. API transfer size: Network tab, filter XHR, capture top 5 endpoint sizes

**Save baseline:** `plans/260516-1324-perf-rebuild/reports/baseline-metrics.md`

## After (chạy SAU tất cả phases)
Re-run cùng bộ test. Diff vào `reports/final-metrics.md`.

## Success criteria
| Metric | Baseline | Target | Pass? |
|---|---|---|---|
| Lighthouse Perf (desktop) | TBD | ≥90 | |
| Lighthouse Perf (mobile) | TBD | ≥80 | |
| Initial JS gzip | TBD | -35% | |
| Dashboard tab switch | TBD | <100ms | |
| Ads scroll FPS (4k rows) | <30 expect | ≥60 | |
| Top API transfer size | TBD | -50% | |

## Smoke test checklist
- [ ] Login → Dashboard render OK
- [ ] All 4 dashboard tabs switch không error
- [ ] AdsTracker virtualized scroll OK
- [ ] OKR page (0 data) không error
- [ ] DailySync form submit OK
- [ ] Notification dropdown opens
- [ ] No console errors
- [ ] No layout shift (CLS visual check)

## Todo
- [ ] Run baseline measurements + save report
- [ ] After A-F complete: rerun all measurements
- [ ] Diff table + sign-off
- [ ] Update root `plan.md` status: completed
- [ ] Run `/ck:journal` để ghi journal entry

## Risks
- Lighthouse variance ±5 pts giữa runs → run 3x, lấy median
- Cloudflare cache poisoning → test với cache bypass (`?nocache=1` hoặc devtools disable cache)
- Profiler overhead skew dashboard switch metric → chạy production build cho measure final
