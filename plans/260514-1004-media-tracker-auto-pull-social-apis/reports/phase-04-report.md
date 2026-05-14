# Phase 04 Report — Backend API Routes

## Files Created / Rewritten

| File | Lines | Action |
|---|---|---|
| `server/schemas/media-tracker.schema.ts` | 38 | Created |
| `server/schemas/social-channel.schema.ts` | 20 | Created |
| `server/services/media/media-post.service.ts` | 166 | Rewritten |
| `server/services/media/social-channel.service.ts` | 126 | Created |
| `server/routes/media-tracker.routes.ts` | 101 | Rewritten |
| `server/routes/social-channels.routes.ts` | 119 | Created |
| `server.ts` | +2 lines | Import + mount added |

## Final API Contract

```
GET  /api/media-tracker/posts   ?channelId?&platform?&format?&dateFrom?&dateTo?&search?&sortBy?&sortDir?&groupBy?&limit?
     → { success, data: { posts: MediaPostDTO[] } | { groups: GroupedResult[] } }

GET  /api/media-tracker/kpi     ?channelId?&platform?&format?&dateFrom?&dateTo?
     → { success, data: { totalPosts, totalReach, totalViews, totalEngagement, avgEngagementRate } }

POST /api/media-tracker/sync    (admin) body: { channelId? }
     → { success, data: SyncResult | SyncAllResult }

GET    /api/social-channels
       → { success, data: SocialChannelDTO[] }   // no token field

POST   /api/social-channels      (admin) body: socialChannelCreateSchema
       → 201 { success, data: SocialChannelDTO }

PATCH  /api/social-channels/:id  (admin) body: socialChannelUpdateSchema
       → { success, data: SocialChannelDTO }

DELETE /api/social-channels/:id  (admin)
       → { success, data: { id, active: false } }   // soft delete

POST   /api/social-channels/:id/test  (admin)
       → { success, data: { ok: true, pageName } } | 422 { error }
```

## server.ts Edits

Two lines added after existing `createMediaTrackerRoutes` import/mount (lines 46 + 149):
- `import { createSocialChannelsRoutes } from "./server/routes/social-channels.routes";`
- `app.use("/api/social-channels", createSocialChannelsRoutes());`

No other logic modified.

## Token Redaction Approach

`social-channel.service.ts` uses a `SAFE_SELECT` const that explicitly lists every field except `accessTokenEncrypted`. Prisma `select` is applied on all read paths (list, create, update). `accessTokenEncrypted` is never present in `SocialChannelDTO`. No post-processing strip needed.

## Sync Endpoint — Phase 03 Alignment

Phase 03 exports `syncChannel(id): Promise<SyncResult>` and `syncAllActive(): Promise<SyncAllResult>`. Route uses `unknown` result type for dynamic import to avoid type coupling. Both branches verified against actual Phase 03 exports. Error handling distinguishes import errors from runtime errors.

## Validation Results

- `npm run typecheck`: 0 errors in all Phase 04 owned files. Pre-existing errors in `src/` (frontend charts) and Phase 03 test file are out of scope.
- `npm run lint`: 0 warnings/errors in Phase 04 files.
- All files < 200 lines.

## Deviations from Plan

- `social-channel.service.ts` placed at `server/services/media/` (plan doc listed both `server/services/social-channel/` and `server/services/media/` in different sections). Used `server/services/media/` to match the related file ownership table in the phase doc.
- `DELETE` endpoint does soft-delete (set `active=false`) per KISS rule in phase doc, not hard delete.

## Status: DONE
