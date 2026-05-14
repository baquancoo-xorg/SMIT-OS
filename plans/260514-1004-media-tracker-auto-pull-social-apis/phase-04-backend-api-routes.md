# Phase 04 — Backend API routes

## Context links

- Existing routes (rewrite): `server/routes/media-tracker.routes.ts` (169 lines)
- Existing service (rewrite): `server/services/media/media-post.service.ts` (117 lines)
- Schema source: `server/schemas/admin-fb-config.schema.ts` (Zod pattern reference)
- Auth middleware: `server/middleware/auth.middleware.ts` + `rbac.middleware.ts`
- Crypto util: `server/lib/crypto.ts` (`encrypt`/`decrypt`)

## Parallelization Info

- parallel-with: [phase-03]
- must-wait-for: [phase-01]
- blocks: [phase-05, phase-06]

## Overview

- Date: 2026-05-14
- Description: Rewrite media-tracker routes (drop POST/PATCH/DELETE), add filter/groupBy/search params. New social-channels routes for admin CRUD + sync trigger. Define API contract that Phase 05 + 06 consume.
- Priority: P2
- Status: completed

## Key Insights

- GET `/api/media-tracker` consumed by `use-media-tracker.ts` — contract change is breaking but acceptable (Phase 05 rewrites consumer in parallel).
- Refresh endpoint must run sync inline (≤30s expected) or accept-and-queue. KISS: run inline; client shows spinner. If >30s observed in prod, switch to background queue.
- Admin-only mutations (channel CRUD, sync trigger). Read of MediaPost allowed for all auth users.
- Encrypt `accessToken` on create/update; decrypt only in sync service (Phase 03). Never return token in GET responses.
- "Test connection" endpoint: ping `/me` on FB Graph with token → return `{ ok, pageName, expiresAt }`.

## Requirements

Functional:
- `GET /api/media-tracker?channel=&format=&dateFrom=&dateTo=&search=&groupBy=&sortBy=&sortDir=&page=&pageSize=` → returns `{ posts: MediaPostDTO[], total, kpi: { totalPosts, totalReach, totalEngagement, avgEngagementRate } }`.
- Remove POST/PATCH/DELETE handlers entirely.
- `POST /api/media-tracker/sync` (admin) → invoke `syncAllActive()` → return `{ fetched, upserted, failures }`.
- `GET /api/social-channels` → list channels (no token field).
- `POST /api/social-channels` (admin) → create with encrypted token.
- `PATCH /api/social-channels/:id` (admin) → update (active, name, token-if-provided).
- `DELETE /api/social-channels/:id` (admin) → soft delete (set active=false) — KISS.
- `POST /api/social-channels/:id/test` (admin) → test FB token → `{ ok, pageName?, error? }`.

Non-functional:
- All inputs validated via Zod schemas.
- Files < 200 lines each (split route file if needed).
- DTO never includes `accessToken`.

## Architecture

```
HTTP
 │
 ├──▶ GET /api/media-tracker
 │     ──▶ media-post.service.list({filters, groupBy, pagination})
 │           ──▶ prisma query + KPI aggregation
 │
 ├──▶ POST /api/media-tracker/sync (admin)
 │     ──▶ media-sync.service.syncAllActive() (Phase 03)
 │
 └──▶ /api/social-channels/*
       ──▶ social-channel.service (encrypt on write, mask on read)
```

DTO shape (response):
```ts
interface MediaPostDTO {
  id: string;
  channelId: string;
  channelName: string;
  platform: MediaPlatform;
  externalId: string | null;
  url: string | null;
  permalink: string | null;
  title: string | null;
  message: string | null;
  publishedAt: string;          // ISO
  format: MediaFormat;
  reach: number; views: number; engagement: number;
  likes: number; comments: number; shares: number; saves: number;
  thumbnailUrl: string | null;
  lastSyncedAt: string | null;
}
```

## Related code files

Create:
- `server/routes/social-channels.routes.ts`
- `server/services/media/social-channel.service.ts`
- `server/schemas/social-channel.schema.ts`

Rewrite:
- `server/routes/media-tracker.routes.ts`
- `server/services/media/media-post.service.ts`
- `server/schemas/media-tracker.schema.ts` (if exists; else create)

Modify (additive route mount):
- `server.ts` — add `app.use('/api/social-channels', createSocialChannelsRoutes())` next to existing media-tracker mount.

## File Ownership

Exclusive owner:
- `server/routes/media-tracker.routes.ts` (rewrite)
- `server/services/media/media-post.service.ts` (rewrite)
- `server/routes/social-channels.routes.ts` (new)
- `server/services/media/social-channel.service.ts` (new)
- `server/schemas/media-tracker.schema.ts`
- `server/schemas/social-channel.schema.ts`

Shared edit (additive):
- `server.ts` — Phase 04 adds 2 lines (import + mount). Phase 03 also edits but at a DIFFERENT line region (cron imports). No textual conflict because edits are in distinct sections.

## Implementation Steps

1. Define Zod schemas: `mediaTrackerListQuerySchema`, `socialChannelCreateSchema`, `socialChannelUpdateSchema`.
2. Implement `media-post.service.ts` rewrite:
   - `listMediaPosts(filters)` — prisma findMany with `include: { channel: true }`, dynamic where, orderBy.
   - `computeKpi(filters)` — separate aggregate query: total count + sum(reach) + sum(engagement) + avg engagement rate.
   - DO NOT include legacy `create/update/delete` methods.
3. Implement `social-channel.service.ts`:
   - `listChannels()` — strip `accessToken`.
   - `createChannel(input)` — `encrypt(input.accessToken)` before insert.
   - `updateChannel(id, patch)` — only re-encrypt if patch.accessToken provided.
   - `softDelete(id)` — set `active=false`.
   - `testChannel(id)` — decrypt → call `fetch('https://graph.facebook.com/v22.0/me?fields=name,id', { headers: Bearer })` → return masked result.
4. Routes:
   - Mount auth middleware globally for both routers.
   - Mount admin middleware on mutations.
   - Validate request via `.parse(schema)`.
5. Register social-channels router in `server.ts`.
6. Tests (api integration via supertest):
   - GET filter combinations.
   - POST sync triggers service (mocked).
   - POST channel rejects non-admin (403).
   - GET channels never includes token.
7. `npm run typecheck && npm run lint && npm run test`.

## Todo list

- [x] Write Zod schemas
- [x] Rewrite `media-post.service.ts` (list + kpi only)
- [x] Write `social-channel.service.ts` with encrypt/decrypt
- [x] Rewrite `media-tracker.routes.ts` (GET + sync only)
- [x] Create `social-channels.routes.ts` (CRUD + test)
- [x] Mount new router in `server.ts`
- [x] Supertest integration tests pass
- [x] DTO contract documented in JSDoc on service

## Success Criteria

- `curl /api/media-tracker?format=PHOTO` returns filtered list.
- `curl -X POST /api/media-tracker/sync` (admin token) returns `{ fetched, upserted, failures }`.
- `curl /api/social-channels` shows channels WITHOUT `accessToken` field.
- Non-admin POST to `/api/social-channels` → 403.
- Test channel endpoint returns `{ ok: true, pageName: '...' }` with valid token.

## Conflict Prevention

Routes/services files are exclusively owned by Phase 04. `server.ts` is touched by Phase 03 (cron init) AND Phase 04 (route mount) — but at distinct logical sections (cron block vs `app.use` block). Merge order: Phase 03 first (smaller diff), then Phase 04 — guaranteed no overlap because line regions differ. If both phases land in same PR, both diffs apply cleanly via `git apply` on `server.ts`.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Frontend (Phase 05) consumes old contract | High | Define DTO in Phase 04 JSDoc + share via Slack ack to Phase 05 owner before Phase 05 starts coding |
| Token leak in GET response | High | DTO mapper strips field; assertion test verifies |
| KPI aggregate slow on large dataset | Low | Phase 1 expects <5k rows; raw aggregate OK. Add index on `publishedAt` in Phase 01 already |
| Refresh endpoint timeout (>30s) | Medium | Add `?async=true` flag returning `202` — defer to Phase 07 if observed |

## Security Considerations

- `accessToken` encrypted at rest (AES-GCM via `server/lib/crypto.ts`).
- `testChannel` returns redacted token info only.
- Admin middleware required for: POST/PATCH/DELETE social-channels, POST sync.
- Read of media posts requires auth (any role).
- Input validation prevents SQL injection (Prisma + Zod).

## Implementation Result

**DONE** — See `reports/phase-04-report.md`.

- 7 files created/rewritten: schemas (2), services (2), routes (2), 1 server.ts line added.
- API contract defined: GET /media-tracker + /media-tracker/sync + full /social-channels CRUD.
- Token redaction: `SAFE_SELECT` const removes `accessTokenEncrypted` from all GET responses.
- 0 new TS errors, all files <200 lines. Soft-delete implemented per KISS.

## Next steps

→ Phase 05 + Phase 06 consume DTO/contract. Phase 07 deletes legacy `media-post-dialog.tsx` consumer.
