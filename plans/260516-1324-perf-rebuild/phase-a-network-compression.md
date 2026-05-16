# Phase A — Network Compression

**Priority:** P0 | **Status:** pending | **Effort:** 30 min

## Overview
Add gzip compression middleware + ETag strong cho Express. Skip nếu Cloudflare tunnel đã auto-brotli (verify trước).

## Pre-check (5 min)
```bash
# Test response header hiện tại
curl -sI -H "Accept-Encoding: gzip, br" https://qdashboard.smitbox.com/api/users/me \
  -b cookie.txt | grep -i "content-encoding\|content-length"
```
- Có `content-encoding: br/gzip` → Cloudflare đã handle → **SKIP phase A**, ghi note
- Không có → proceed

## Implementation
1. `npm install compression @types/compression`
2. `server.ts` thêm import + middleware **trước** `app.use(express.json)`:
```ts
import compression from 'compression';
app.use(compression({
  threshold: 1024,
  level: 6,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));
```
3. `app.set('etag', 'strong')` sau khi tạo `app`
4. Restart dev server (hot-reload tự handle)

## Files
- Modify: `server.ts`
- Modify: `package.json` (add deps)

## Todo
- [ ] curl test Cloudflare auto-compression
- [ ] Install `compression` + types
- [ ] Add middleware + ETag config
- [ ] Verify: `curl -sI -H "Accept-Encoding: gzip" localhost:3000/api/users/me` → `Content-Encoding: gzip`
- [ ] Verify response body unchanged (json valid)

## Success
- Response `Content-Encoding: gzip` cho JSON >1KB
- Transfer size giảm ≥50% trên endpoints lớn

## Risks
- SSE stream (none hiện tại) → skip via `x-no-compression` header nếu add sau
- Static assets đã gzip sẵn từ Vite → middleware skip nhờ filter
