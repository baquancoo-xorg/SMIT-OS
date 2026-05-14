# Phase 02 Report — FB Graph Client Library

Date: 2026-05-14

## Files Created

| File | Lines |
|---|---|
| `server/services/facebook/fb-graph-client.ts` | 182 |
| `server/services/facebook/fb-graph-mapper.ts` | 47 |
| `server/services/facebook/__tests__/fb-graph-client.test.ts` | 284 |
| `server/services/facebook/__tests__/fixtures/fb-page-posts.json` | 84 |
| `server/services/facebook/__tests__/fixtures/fb-post-insights.json` | 68 |

## Test Results

```
npm run test — 113 tests total, 0 fail, 0 skip
New tests: 27 (mapAttachmentToFormat×11, parseRateLimitHeader×4, fetchPagePosts×9, fetchPostInsights×3)
```

All suites pass. Test runner: `node:test` via `tsx --test`.

## API Surface Exported

From `fb-graph-client.ts`:
- `type MediaFormat` — string literal union (Phase 01 Prisma enum mirrored; swap to `@prisma/client` import when generated)
- `interface RawPost` — externalId, message, createdTime, permalinkUrl, fullPicture, format, raw
- `interface InsightMap` — views, engagement, likes, comments, shares, saves, raw
- `class FBTokenError` — code 190
- `class FBRateLimitError` — code 4 | 17
- `class FBGenericError` — fbCode: number
- `fetchPagePosts(pageId, token, since?)` — paginated published posts
- `fetchPostInsights(postIds, token)` — batched lifetime insights
- `mapAttachmentToFormat(att)` — re-exported from mapper
- `parseRateLimitHeader(header)` — BUC header parser

## Format Mapping Decisions

| Graph API `media_type` | → MediaFormat |
|---|---|
| `photo` | PHOTO |
| `video`, `video_inline`, `animated_image_video` | VIDEO |
| `album` | ALBUM |
| `link`, `share` | LINK |
| `event` | EVENT |
| missing/null attachment | STATUS |
| any other value | STATUS (fallback) |

REEL not directly detectable from `media_type` at API level — treated as VIDEO. Phase 03 can apply REEL detection via post URL heuristic if needed.

## Deviations from Plan

1. **Mapper split**: `fb-graph-mapper.ts` created (client was 212 lines before split). Phase doc permits this at >180 lines. Client is now 182 lines; mapper is 47 lines.
2. **Token passed via query param** (`access_token`), not Authorization header. Graph API accepts both; query param is consistent with existing `facebook-api.ts` pattern in codebase. Phase doc listed preference for header but didn't mandate it.
3. **`comments`, `shares`, `saves` fields**: InsightMap shape includes them but they are not populated (Graph API batch insight endpoint used doesn't return these metrics; adding them would require per-post detail calls). Fields left undefined. Phase 03 can extend if needed.
4. **`parseInsightNode` re-exported** from client for use by Phase 03 sync service if needed.

## Status

**DONE**
