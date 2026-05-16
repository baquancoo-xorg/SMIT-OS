# Baseline Metrics — Pre-Optimization

**Date:** 2026-05-16 14:35 ICT
**Build:** `npm run build` (Vite 7, manualChunks per-package)

## Bundle (gzip sizes)

Top 10 heaviest chunks:

| Chunk | Raw | Gzip |
|---|---|---|
| vendor-recharts | 273.29 KB | **70.19 KB** |
| vendor-react-dom | 180.93 KB | 56.39 KB |
| vendor-headlessui-react | 102.48 KB | 31.76 KB |
| vendor-motion-dom | 94.46 KB | 31.05 KB |
| DashboardOverview | 89.46 KB | 17.62 KB |
| index (entry) | 79.76 KB | 21.69 KB |
| vendor-zod | 60.14 KB | 16.35 KB |
| vendor-lucide-react | 46.85 KB | 9.21 KB |
| vendor-tanstack-query-core | 38.38 KB | 11.29 KB |
| vendor-react-router | 38.11 KB | 13.71 KB |

**Total chunks:** ~50+ vendor chunks (per-package strategy)
**Initial load gzip estimate (without lazy routes):** ~250 KB
- vendor-react-dom (56) + vendor-recharts (70) + index (22) + vendor-router (14) + vendor-headlessui (32) + others

## Network

- Compression: ✅ ACTIVE (Phase A done) — Vary: Accept-Encoding confirmed
- ETag: strong (`app.set('etag', 'strong')`)

## DB (row counts, verified)

| Table | Rows |
|---|---|
| raw_ads_facebook | 4,202 |
| LeadSyncRun | 1,843 |
| Notification | 219 |
| Lead | 36 |
| DailyReport | 11 |
| Objective / KeyResult / WeeklyReport | 0 |

## Lighthouse / Profiler

TBD — chạy production preview server sau Phase C/D.

## Targets (Phase G)

| Metric | Baseline | Target |
|---|---|---|
| vendor-recharts gzip | 70.19 KB | Lazy-loaded (not in initial bundle) |
| Total chunks | ~50 | <15 |
| Initial JS gzip | ~250 KB | <160 KB (-35%) |

## Notes

- Recharts là **biggest win**: 70KB gzip + 17 charts dùng. Lazy-load → cắt khỏi initial
- `vendor-headlessui-react` 32KB là candidate review (xài bao nhiêu components?)
- `vendor-motion-dom` 31KB → framer-motion overhead, check usage
- Bundle analyzer treemap: `dist/stats.html`
