-- Phase 01: Media Tracker Auto Pull — schema migration
-- Wipe MediaPost rows first to avoid NOT NULL and FK constraint errors.

DELETE FROM "MediaPost";

-- DropIndex (before AlterTable)
DROP INDEX IF EXISTS "MediaPost_createdById_idx";
DROP INDEX IF EXISTS "MediaPost_platform_type_idx";
DROP INDEX IF EXISTS "MediaPost_utmCampaign_idx";
DROP INDEX IF EXISTS "MediaPost_publishedAt_idx";

-- AlterTable: drop old columns FIRST (removes dependency on MediaPlatform + MediaPostType)
ALTER TABLE "MediaPost"
  DROP COLUMN IF EXISTS "cost",
  DROP COLUMN IF EXISTS "createdById",
  DROP COLUMN IF EXISTS "meta",
  DROP COLUMN IF EXISTS "platform",
  DROP COLUMN IF EXISTS "type",
  DROP COLUMN IF EXISTS "utmCampaign";

-- DropEnum (safe now — no column references it)
DROP TYPE IF EXISTS "MediaPostType";

-- AlterEnum: replace old MediaPlatform values with new canonical set
BEGIN;
CREATE TYPE "MediaPlatform_new" AS ENUM ('FACEBOOK_PAGE', 'FACEBOOK_GROUP', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'THREADS');
ALTER TYPE "MediaPlatform" RENAME TO "MediaPlatform_old";
ALTER TYPE "MediaPlatform_new" RENAME TO "MediaPlatform";
DROP TYPE "MediaPlatform_old";
COMMIT;

-- CreateEnum
CREATE TYPE "MediaFormat" AS ENUM ('STATUS', 'PHOTO', 'VIDEO', 'REEL', 'ALBUM', 'LINK', 'EVENT');

-- CreateEnum
CREATE TYPE "MediaSyncStatus" AS ENUM ('SUCCESS', 'PARTIAL', 'FAILED');

-- Add new columns to MediaPost
ALTER TABLE "MediaPost"
  ADD COLUMN "channelId"    TEXT NOT NULL DEFAULT 'placeholder',
  ADD COLUMN "comments"     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "format"       "MediaFormat" NOT NULL DEFAULT 'STATUS',
  ADD COLUMN "lastSyncedAt" TIMESTAMP(3),
  ADD COLUMN "likes"        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "message"      TEXT,
  ADD COLUMN "metricsExtra" JSONB,
  ADD COLUMN "permalink"    TEXT,
  ADD COLUMN "saves"        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "shares"       INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "thumbnailUrl" TEXT,
  ADD COLUMN "views"        INTEGER NOT NULL DEFAULT 0;

-- Drop placeholder DEFAULT (table is empty, safe to require FK value at insert time)
ALTER TABLE "MediaPost" ALTER COLUMN "channelId" DROP DEFAULT;

-- Make externalId NOT NULL (safe after DELETE above)
ALTER TABLE "MediaPost" ALTER COLUMN "externalId" SET NOT NULL;

-- CreateTable SocialChannel
CREATE TABLE "SocialChannel" (
    "id" TEXT NOT NULL,
    "platform" "MediaPlatform" NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accessTokenEncrypted" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "lastSyncStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable MediaSyncRun
CREATE TABLE "MediaSyncRun" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" "MediaSyncStatus" NOT NULL,
    "fetched" INTEGER NOT NULL DEFAULT 0,
    "upserted" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex SocialChannel
CREATE UNIQUE INDEX "SocialChannel_platform_externalId_key" ON "SocialChannel"("platform", "externalId");
CREATE INDEX "SocialChannel_platform_active_idx" ON "SocialChannel"("platform", "active");

-- CreateIndex MediaSyncRun
CREATE INDEX "MediaSyncRun_channelId_startedAt_idx" ON "MediaSyncRun"("channelId", "startedAt");

-- CreateIndex MediaPost (new)
CREATE UNIQUE INDEX "MediaPost_channelId_externalId_key" ON "MediaPost"("channelId", "externalId");
CREATE INDEX "MediaPost_channelId_publishedAt_idx" ON "MediaPost"("channelId", "publishedAt" DESC);
CREATE INDEX "MediaPost_format_idx" ON "MediaPost"("format");
CREATE INDEX "MediaPost_publishedAt_idx" ON "MediaPost"("publishedAt");

-- AddForeignKey MediaPost → SocialChannel
ALTER TABLE "MediaPost" ADD CONSTRAINT "MediaPost_channelId_fkey"
  FOREIGN KEY ("channelId") REFERENCES "SocialChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey MediaSyncRun → SocialChannel
ALTER TABLE "MediaSyncRun" ADD CONSTRAINT "MediaSyncRun_channelId_fkey"
  FOREIGN KEY ("channelId") REFERENCES "SocialChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
