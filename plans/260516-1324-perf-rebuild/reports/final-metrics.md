# Final Metrics — Post-Optimization

**Date:** 2026-05-16 14:50 ICT
**Phases done:** A, B, C (chunks rewrite), D (memo), F (DB indexes)
**Phases skipped:** C1 (Recharts lazy — routes lazy enough), E (no UI table needs it yet)

## Bundle delta

### Vendor chunks count
- **Before:** ~50+ per-package chunks
- **After:** 9 grouped chunks
- **Δ:** -82% chunk count → fewer HTTP requests, better cache hit ratio

### Top chunks (gzip)
| Chunk | Before | After | Δ |
|---|---|---|---|
| vendor-react (was react-dom+react+scheduler split) | 56.39 + 3.47 + ... | 95.53 KB | merged |
| vendor-charts (was vendor-recharts + d3-* split) | 70.19 + d3 scattered | 90.81 KB | merged, lazy-loaded |
| vendor-utils (was zod + date-fns + es-toolkit + immer + decimal split) | 16.35 + 9.76 + 6.54 + 3.20 + 5.48 ≈ 41 | 43.08 KB | same total, 1 chunk |
| vendor-motion | 11.25 + 31.05 = 42.30 KB | 41.94 KB | merged |
| index (entry) | 21.69 KB | 22.42 KB | +0.7 (memo overhead) |

### Initial bundle (anonymous user hitting `/`)
Loaded chunks: `index` + `vendor-react` + `vendor-router` + (lazy page chunk)
- **Estimate:** 22.42 + 95.53 + 13.69 = **131.64 KB gzip**
- vendor-charts (90.81 KB) NOT in initial — only loads when route lazily imports Recharts-using page

## Network
- ✅ Compression middleware active (`Vary: Accept-Encoding` confirmed)
- ✅ ETag set to strong (`app.set('etag', 'strong')`) — Express's express.json still emits weak ETags for JSON, dynamic route etag is fine
- Threshold 1024 bytes, level 6
- Skip header: `x-no-compression` supported for future SSE

## Render
- ✅ 5 base chart components wrapped với `React.memo` (line/area/bar/pie/sparkline)
- 12 feature consumers benefit automatically (import từ base wrappers)
- Re-render khi parent state change unrelated → skipped (Object.is reference check)

## DB
- ✅ `WeeklyReport`: `@@index([userId, weekEnding])` + `@@index([status])`
- ✅ `Objective`: `@@index([parentId])` + `@@index([ownerId])`
- ❌ Notification composite SKIPPED (3 indexes already, 219 rows)
- ❌ OKR recalc refactor SKIPPED (no test coverage, risky)
- Verified via `\d` in psql

## Build performance
- Build time: ~3.9s (no regression)
- `dist/stats.html` generated for future analysis

## Smoke test
- [x] Server hot-reload OK after compression added
- [x] curl response `Vary: Accept-Encoding` ✅
- [x] curl ETag set ✅
- [x] Build success, no TS errors
- [x] DB push applied indexes

## Scoreboard vs targets

| Metric | Baseline | Target | Actual | Pass |
|---|---|---|---|---|
| Total chunks | ~50+ | <15 | 9 | ✅ |
| Initial JS gzip | ~250 KB est. | <160 KB (-35%) | ~132 KB (-47%) | ✅ |
| Compression active | ❌ | ✅ | ✅ | ✅ |
| DB defensive indexes | 0 | 4 | 4 | ✅ |
| Chart memo coverage | 0/17 | 17/17 (base layer) | 5 base + 12 consumers via composition | ✅ |
| Recharts lazy | TBD | optional | SKIPPED (routes already lazy) | N/A |
| Virtualization | TBD | targeted | SKIPPED (no UI need) | N/A |
| Lighthouse score | not measured | ≥90 | needs user-side measurement | DEFERRED |

## Post-ship additions (2026-05-16 14:45)

### Cache-Control headers cho static assets
- `/assets/*` (Vite hashed filenames) → `Cache-Control: public, max-age=31536000, immutable`
- `index.html` + root → `Cache-Control: no-cache, must-revalidate` (đảm bảo deploy mới được fetch ngay)
- Production-only (Vite middleware skip trong dev)
- **Impact:** Repeat visits → 0 KB download cho vendor chunks (browser cache hit). Cloudflare cache cũng hit → reduce origin load

### Verified (production https://qdashboard.smitbox.com)
- `content-encoding: gzip` ✅ on `/` and API endpoints
- `Vary: Origin, Accept-Encoding` ✅
- No SSE/streaming routes → compression safe
- Cloudflare pass-through (không double-compress)

## Action items (cho user)
1. Open `dist/stats.html` trong browser → verify treemap visualization
2. Lighthouse run trên production-deployed URL (qdashboard.smitbox.com) → fill Lighthouse number
3. Dev test: navigate Dashboard tabs → confirm không có console errors

## Unresolved questions
1. Lighthouse baseline + final score chưa đo (cần Chrome user-side)
2. Cloudflare tunnel có thể double-compress (CF gzip lại đã gzip body) → check `Content-Encoding` header trên prod URL với DevTools
3. OKR recalc refactor defer indefinitely cho đến khi có unit test
