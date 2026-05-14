# Phase 01 — Database schema migration

## Context links

- Brainstorm: `plans/reports/brainstorm-260514-1004-media-tracker-auto-pull-social-apis.md`
- Research FB API: `research/researcher-01-fb-graph-api.md` (impressions deprecated)
- Current schema: `prisma/schema.prisma` lines 372–438 (MediaPost + MediaPostType)

## Parallelization Info

- parallel-with: [phase-02]
- must-wait-for: []
- blocks: [phase-03, phase-04]

## Overview

- Date: 2026-05-14
- Description: Rewrite MediaPost, add SocialChannel + MediaSyncRun. Drop MediaPostType enum, `impressions` column, KOL/PR fields.
- Priority: P2
- Status: pending

## Key Insights

- `impressions` deprecated by Meta Nov 15 2025 → omit entirely; keep `views` instead.
- FB Group dropped → enum no longer needs `FACEBOOK_GROUP` value but include for forward compat (no Phase 1 channel created with it).
- Existing MediaPost rows wiped — fresh migration, no data backfill needed.
- AES-GCM encryption uses `server/lib/crypto.ts` (`encrypt`/`decrypt`); `accessToken` stored as base64 ciphertext in TEXT column. No middleware needed; encrypt at write time in Phase 04 routes.

## Requirements

Functional:
- New enum `MediaFormat` values: STATUS, PHOTO, VIDEO, REEL, ALBUM, LINK, EVENT.
- Extend enum `MediaPlatform` to include: FACEBOOK_PAGE, FACEBOOK_GROUP (reserved), INSTAGRAM, TIKTOK, YOUTUBE, THREADS.
- New model `SocialChannel` with unique `(platform, externalId)`.
- Rewrite `MediaPost`: drop `type`, `cost`, `utmCampaign`, `createdById`, `impressions`. Add `channelId` FK, `format`, `views`, `likes`, `shares`, `comments`, `saves`, `thumbnailUrl`, `metricsExtra` JSON, `lastSyncedAt`.
- New model `MediaSyncRun` for audit.
- Drop `MediaPostType` enum.

Non-functional:
- Migration must be reversible (have down step).
- Wipe MediaPost rows in same migration (`DELETE FROM "MediaPost"` before column drop to dodge NOT NULL conflicts).
- Indexes for query hot paths: `(channelId, publishedAt DESC)`, `(format)`, `(publishedAt)`.

## Architecture

```
SocialChannel 1 ─ * MediaPost
SocialChannel 1 ─ * MediaSyncRun
```

Field map MediaPost (new):
```
id, channelId(FK), externalId, url, title, message?, publishedAt,
format(enum), reach, views, engagement, likes, comments, shares, saves,
thumbnailUrl?, permalink?, metricsExtra(Json?), lastSyncedAt, createdAt, updatedAt
@@unique([channelId, externalId])
```

Field map SocialChannel:
```
id, platform(enum), externalId, name, accessToken(encrypted text), tokenExpiresAt?,
active(bool default true), lastSyncedAt?, lastSyncStatus?, createdAt, updatedAt
@@unique([platform, externalId])
```

Field map MediaSyncRun:
```
id, channelId(FK), startedAt, finishedAt?, status(SUCCESS|PARTIAL|FAILED),
fetched(int), upserted(int), errorMessage?, createdAt
@@index([channelId, startedAt])
```

## Related code files

Modify:
- `prisma/schema.prisma`

Create:
- `prisma/migrations/{timestamp}_media_tracker_auto_pull/migration.sql`

Delete: (none — wipe via SQL inside migration)

## File Ownership

Exclusive owner:
- `prisma/schema.prisma`
- `prisma/migrations/*` (new dir created in this phase)

## Implementation Steps

1. Edit `prisma/schema.prisma`:
   - Replace existing `MediaPlatform` enum (if values insufficient) with full set.
   - Add new enum `MediaFormat`.
   - Delete enum `MediaPostType`.
   - Add model `SocialChannel`.
   - Replace model `MediaPost` body with new fields.
   - Add model `MediaSyncRun`.
2. Run `npx prisma format` to normalize.
3. Run `npx prisma migrate dev --name media_tracker_auto_pull --create-only` to scaffold SQL.
4. Hand-edit migration SQL to prepend `DELETE FROM "MediaPost";` before column drops to avoid NOT NULL constraint errors.
5. Run `npx prisma migrate dev` to apply.
6. Run `npx prisma generate`.
7. Verify `npm run typecheck` passes (some upstream services may break — let Phase 03/04 fix them; Phase 01 ONLY commits schema change).

## Todo list

- [ ] Edit MediaPlatform + add MediaFormat enums
- [ ] Drop MediaPostType enum
- [ ] Add SocialChannel model
- [ ] Rewrite MediaPost model
- [ ] Add MediaSyncRun model
- [ ] Generate + edit migration SQL with wipe
- [ ] Apply migration locally
- [ ] Confirm `prisma generate` succeeds

## Success Criteria

- `psql ... -c '\d "SocialChannel"'` shows all expected columns.
- `psql ... -c 'SELECT COUNT(*) FROM "MediaPost"'` returns 0.
- `npx prisma migrate status` shows applied.
- Migration SQL contains `DELETE FROM "MediaPost"` line.

## Conflict Prevention

This phase touches ONLY `prisma/` directory. No code file overlap with Phase 02 (which only writes to `server/services/facebook/`). Downstream code breakage (in routes/services that reference old `MediaPost.type`, `cost`, `utmCampaign`) is EXPECTED and fixed in Phase 03 + 04 — do NOT modify those files here.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Migration fails on prod due to FK from other tables | Medium | Grep `MediaPost` relations in schema before migrate; none found currently |
| Downstream typecheck red after migrate | High | Acknowledged — Phase 03/04 owns fix. Phase 01 commit must NOT block on full typecheck pass; only schema gen ok |
| Wipe destroys historical analytics | Low | User approved fresh start in brainstorm |

## Security Considerations

- `accessToken` column stored as `String` (TEXT) — actual encryption applied at app layer (Phase 04). No plaintext token stored.
- No PII added.

## Next steps

→ Phase 03 (sync service) + Phase 04 (API routes) unblocked once migration committed and `prisma generate` produces new client types.
