# Phase 01 Report — Database Schema Migration

**Date:** 2026-05-14
**Status:** DONE_WITH_CONCERNS

---

## What Changed

### Enums
| Action | Name | Values |
|---|---|---|
| Replaced | `MediaPlatform` | FACEBOOK_PAGE, FACEBOOK_GROUP (reserved), INSTAGRAM, TIKTOK, YOUTUBE, THREADS |
| Added | `MediaFormat` | STATUS, PHOTO, VIDEO, REEL, ALBUM, LINK, EVENT |
| Added | `MediaSyncStatus` | SUCCESS, PARTIAL, FAILED |
| Dropped | `MediaPostType` | (was ORGANIC, KOL, KOC, PR) |

### Models
- **`SocialChannel`** — new; fields: id, platform, externalId, name, accessTokenEncrypted (TEXT), tokenExpiresAt, active, lastSyncedAt, lastSyncStatus, createdAt, updatedAt. Unique: (platform, externalId).
- **`MediaPost`** — rewritten; dropped: platform, type, cost, utmCampaign, createdById, meta. Added: channelId (FK→SocialChannel), format, views, likes, comments, shares, saves, thumbnailUrl, permalink, metricsExtra (JSONB), lastSyncedAt, message. externalId promoted to NOT NULL. Unique: (channelId, externalId).
- **`MediaSyncRun`** — new; fields: id, channelId (FK→SocialChannel), startedAt, finishedAt, status (MediaSyncStatus), fetched, upserted, errorMessage, createdAt.

### Indexes
- Dropped: `MediaPost_platform_type_idx`, `MediaPost_utmCampaign_idx`, `MediaPost_createdById_idx`
- Added: `MediaPost_channelId_publishedAt_idx` (DESC), `MediaPost_format_idx`, `MediaPost_channelId_externalId_key` (unique), `SocialChannel_platform_externalId_key` (unique), `SocialChannel_platform_active_idx`, `MediaSyncRun_channelId_startedAt_idx`

---

## Migration SQL Summary

Key DDL ops in order:
1. `DELETE FROM "MediaPost"` — wipe all rows
2. `DROP INDEX` — remove old indexes
3. `ALTER TABLE "MediaPost" DROP COLUMN` — platform, type, cost, utmCampaign, createdById, meta
4. `DROP TYPE "MediaPostType"` — no column references remain
5. `ALTER ENUM MediaPlatform` — rename-swap pattern (old→new values)
6. `CREATE TYPE "MediaFormat"`, `CREATE TYPE "MediaSyncStatus"`
7. `ALTER TABLE "MediaPost" ADD COLUMN` — channelId (temp DEFAULT 'placeholder'), views, likes, etc.
8. `ALTER COLUMN "channelId" DROP DEFAULT` — clean after add
9. `ALTER COLUMN "externalId" SET NOT NULL`
10. `CREATE TABLE "SocialChannel"`, `CREATE TABLE "MediaSyncRun"`
11. `CREATE INDEX` / `CREATE UNIQUE INDEX` for all three tables
12. `ADD CONSTRAINT` FK: MediaPost→SocialChannel, MediaSyncRun→SocialChannel

---

## Files Touched

- `prisma/schema.prisma` — enums + models rewritten
- `prisma/migrations/20260514124200_media_tracker_auto_pull/migration.sql` — created

---

## TypeScript Errors Expected (Phase 04 responsibility)

### `server/services/media/media-post.service.ts`
- `:10` — `MediaPostType` no longer exported
- `:37` — `platform` not in `MediaPostWhereInput`
- `:38` — `type` not in `MediaPostWhereInput`
- `:61` — `platform` not in `MediaPostCreateInput`
- `:86`, `:112` — `createdById` not on MediaPost type

### `server/routes/media-tracker.routes.ts`
- `:11` — `MediaPostType` no longer exported
- `:21` — `FACEBOOK` not in MediaPlatform
- `:24` — `BLOG` not in MediaPlatform
- `:25` — `PR` not in MediaPlatform
- `:26` — `OTHER` not in MediaPlatform

### `prisma/seeds/acquisition.seed.ts`
- `:8` — `MediaPostType` import
- `:77`, `:101` — `FACEBOOK` not in MediaPlatform
- `:125` — `PR` not in MediaPlatform
- `:142`, `:148` — old field references

**Pre-existing unrelated errors (not caused by Phase 01):**
- `src/components/v5/ui/charts/*.tsx` — chart generic type constraints
- `src/components/v5/growth/date-range-utils.ts` — missing module
- `src/pages/v5/Playground.tsx` — SkeletonVariant / Select type mismatch

---

## Deviations from Plan

1. **`--create-only` not used** — environment is non-interactive; used `prisma migrate diff` to generate SQL manually, then `prisma db execute` + `prisma migrate resolve --applied`. Functionally equivalent.
2. **Migration SQL reordered** vs. auto-generated diff — Prisma's diff placed `ALTER ENUM` before `DROP COLUMN`, causing dependency error. Fixed by: drop columns first → drop enum → rename enum. This is correct and safe given the wipe.
3. **`prisma/seeds/acquisition.seed.ts` errors** — seed file references old MediaPost fields. Not fixed here; Phase 04 scope or separate seed update task.

---

## Concerns

- `acquisition.seed.ts` is in `prisma/seeds/` (not `server/`). Phase 04's file ownership covers `server/routes/media-tracker.routes.ts` and `server/services/media/`. Seed file may need a separate patch task — flagged for plan lead to assign.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Schema migrated, client generated, DB matches schema. All MediaPost rows wiped per plan. 18 TS errors are expected downstream breakage (Phase 04 fixes service+routes; seed file fix unassigned). 6 pre-existing unrelated TS errors also present.
**Concerns:** `prisma/seeds/acquisition.seed.ts` has 6 errors referencing dropped enum/fields — not owned by Phase 04 per plan scope. Needs explicit assignment.
