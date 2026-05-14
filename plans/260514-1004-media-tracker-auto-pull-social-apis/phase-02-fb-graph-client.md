# Phase 02 — FB Graph client library

## Context links

- Research: `research/researcher-01-fb-graph-api.md` (v22+, post fields, insights metrics, BUC limits, token lifecycle)
- Existing partial: `server/lib/facebook-api.ts` (205 lines — ads-focused). Do NOT modify; build new module.

## Parallelization Info

- parallel-with: [phase-01]
- must-wait-for: []
- blocks: [phase-03]

## Overview

- Date: 2026-05-14
- Description: Typed Graph API client for FB Fanpage feed + post insights. Isolated module with fixture-based unit tests. No DB access.
- Priority: P2
- Status: completed

## Key Insights

- Use Graph API **v22.0** (stable as of 2026-05). Pin version in URL.
- `post_impressions` deprecated → request `views` only.
- Detect format from `attachments.data[0].media_type` returned by Graph API (values: `photo`, `video`, `album`, `link`, `event`, `share`). REEL not first-class; treat `video` with `is_reel` flag in `attachments.media.source` or fallback to `video` format.
- Batch insights via `?ids=postId1,postId2,...&fields=insights.metric(metric1,metric2)`. Max 50 IDs per call (Meta limit).
- BUC headers parsed for backoff: read `x-business-use-case-usage`, sleep if `call_count >= 75`.

## Requirements

Functional:
- `fetchPagePosts(channel, since?: Date): Promise<RawPost[]>` — paginate `/{page-id}/published_posts?fields=id,message,created_time,permalink_url,full_picture,attachments{media_type,subattachments}` with `limit=100`, follow `paging.next` until empty or until `created_time < since`.
- `fetchPostInsights(postIds: string[], token: string): Promise<Record<string, InsightMap>>` — batch up to 50 IDs, metrics `views,post_engaged_users,post_reactions_by_type_total,post_clicks`.
- `mapAttachmentToFormat(att): MediaFormat` — pure mapper.
- `parseRateLimitHeader(h): { callCount, totalTime }` — exposes BUC usage for backoff decisions.

Non-functional:
- File < 200 lines (split into `fb-graph-client.ts` + `fb-graph-mapper.ts` if needed).
- No `prisma` import (zero DB dependency → testable in isolation).
- All HTTP via global `fetch` (Node 20+ supports). No axios dep.
- Errors typed: `FBTokenError` (190), `FBRateLimitError` (4/17), `FBGenericError`.

## Architecture

```
SocialChannel (caller) ──token──▶ fb-graph-client
                                    │
                                    ├──▶ fetch posts (paged)
                                    ├──▶ fetch insights (batched)
                                    └──▶ map → RawPost[] + InsightMap
                                          │
                                          ▼
                                    Returned to sync service (Phase 03)
```

Public types:
```ts
export interface RawPost {
  externalId: string;
  message?: string;
  createdTime: string;   // ISO
  permalinkUrl?: string;
  fullPicture?: string;
  format: MediaFormat;
  raw: unknown;          // for metricsExtra
}
export interface InsightMap {
  views?: number;
  engagement?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  raw: unknown;
}
```

## Related code files

Create:
- `server/services/facebook/fb-graph-client.ts`
- `server/services/facebook/fb-graph-mapper.ts` (only if client > 180 lines)
- `server/services/facebook/__tests__/fb-graph-client.test.ts`
- `server/services/facebook/__tests__/fixtures/fb-page-posts.json`
- `server/services/facebook/__tests__/fixtures/fb-post-insights.json`

Do NOT modify:
- `server/lib/facebook-api.ts` (ads code, different concern)
- `server/services/facebook/fb-sync.service.ts` (existing ads sync)

## File Ownership

Exclusive owner:
- `server/services/facebook/fb-graph-client.ts`
- `server/services/facebook/fb-graph-mapper.ts` (if split)
- `server/services/facebook/__tests__/fb-graph-client.test.ts`
- `server/services/facebook/__tests__/fixtures/*`

## Implementation Steps

1. Create fixture JSON files capturing real Graph API shape (sample 3 posts: photo, video, link).
2. Implement `fetchPagePosts`:
   - Build URL `https://graph.facebook.com/v22.0/{pageId}/published_posts`.
   - Add fields query param.
   - Follow `paging.next` cursor.
   - Stop when `created_time < since` OR no next page.
3. Implement `mapAttachmentToFormat`:
   - `photo` → PHOTO
   - `video`/`video_inline`/`animated_image_video` → VIDEO
   - `album` → ALBUM
   - `link`/`share` → LINK
   - `event` → EVENT
   - missing attachments + message → STATUS
4. Implement `fetchPostInsights`:
   - Batch 50 IDs per request via `?ids=...`.
   - Parse Meta error envelope `error.code` → throw typed errors.
5. Implement BUC header parsing helper.
6. Write tests using **Node built-in test runner** (`node:test`), NOT vitest/jest:
   - `import { describe, it, mock } from 'node:test';`
   - `import assert from 'node:assert/strict';`
   - Mock `global.fetch` with `mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => fixture }) as any)`.
   - Test pagination stops on empty `data`.
   - Test mapper covers all enum values + fallback.
   - Test token error throws `FBTokenError`.
7. Run `npm run typecheck && npm run lint && npm run test`.

## Todo list

- [x] Create fixtures (posts + insights)
- [x] Implement `fetchPagePosts` with pagination
- [x] Implement `mapAttachmentToFormat`
- [x] Implement `fetchPostInsights` (batched)
- [x] Implement typed errors + BUC parser
- [x] Write unit tests (≥80% coverage on this file)
- [x] Lint + typecheck clean

## Success Criteria

- `npm run test -- fb-graph-client` passes ≥6 tests.
- File < 200 lines each.
- Zero prisma/express imports.
- All `RawPost.format` values reachable in tests.

## Conflict Prevention

This phase creates NEW files only under `server/services/facebook/` (new file names). Does NOT touch `prisma/schema.prisma` (owned by Phase 01) or existing `fb-sync.service.ts`/`facebook-api.ts`. Type imports from Prisma client are allowed once Phase 01 lands, but if Phase 02 finishes earlier, use string literal type `'PHOTO' | 'VIDEO' | ...` then swap to `MediaFormat` enum after merge.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Attachment `media_type` enum mismatch with real API | Medium | Fixtures from real call (curl sample on first FB token); add `default → STATUS` fallback |
| Rate limit hit during sync | Medium | BUC parser + Phase 03 backoff; <40 channels safe |
| `views` metric not available on old posts | Low | Treat as 0, log warning |
| Token expired (error 190) | Medium | Throw `FBTokenError`; Phase 03 marks channel inactive + alerts |

## Security Considerations

- Token passed via Authorization header `Bearer {token}` OR `access_token` query param. Prefer header.
- Never log token. Redact in errors (`token=***`).
- No write operations on FB graph (read-only).

## Implementation Result

**DONE** — See `reports/phase-02-report.md`.

- 5 files created: client (182 lines), mapper (47 lines), tests (284 lines), fixtures (152 lines total).
- 27 tests pass (100% coverage).
- Deviations: mapper split (intentional at >180 lines), token via query param (codebase pattern), fields left undefined (can extend in Phase 03).

## Next steps

→ Phase 03 (sync service) consumes this client. Phase 03 must NOT add HTTP logic; all FB fetch goes through this module.
