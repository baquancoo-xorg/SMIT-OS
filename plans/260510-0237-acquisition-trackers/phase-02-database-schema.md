# Phase 02 — Database Schema

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Brainstorm: [`../reports/brainstorm-260510-0237-acquisition-trackers.md`](../reports/brainstorm-260510-0237-acquisition-trackers.md) (Section 6, Phase 2)
- Existing schema: `prisma/schema.prisma` (model `FbAdAccountConfig`, `RawAdsFacebook`, `Lead`)
- Dependencies: Phase 1 (sidebar shipped)

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P2 |
| Effort | 1-2 ngày |
| Status | ✅ completed |
| Completed | 2026-05-10 |
| Review | passed |

Mở rộng Prisma schema với 3 model mới (`AdCampaign`, `AdSpendRecord`, `MediaPost`) + 3 enum (`AdPlatform`, `MediaPlatform`, `MediaPostType`) để support Ads Tracker, Media Tracker và attribution với Lead Tracker. Shared dimension là `utmCampaign` (Lead Tracker đã có cột `source`).

**Scope MVP:** chỉ Meta Ads → enum `AdPlatform` chỉ có `META`. `GOOGLE`/`TIKTOK` sẽ thêm sau khi mở rộng platform.

## Key Insights

- Giữ raw layer (`RawAdsFacebook` đã có) → thêm normalized layer (`AdCampaign`, `AdSpendRecord`) cho UI/aggregate
- ETL job sẽ map raw → normalized (Phase 3a)
- `MediaPost` design tổng quát đủ để support owned (FB/IG/YouTube post), KOL collab, PR mention — phân biệt qua field `type`
- `FbAdAccountConfig` (đã có) đủ cho Meta auth → KHÔNG cần thêm config table mới ở phase này
- Lead Tracker (`Lead.source`) đã hỗ trợ string-based attribution → join key là `utm_campaign` value match
- Future: khi mở rộng Google/TikTok → thêm `GoogleAdsConfig`, `TiktokAdsConfig` + extend enum `AdPlatform` (migration nhẹ)

## Requirements

### Functional
- Schema migration không break existing data (Lead, FbAdAccountConfig, RawAdsFacebook)
- Models mới support unique constraint chống duplicate (campaign theo `[platform, externalId]`, spend record theo `[campaignId, date]`)
- Index trên các cột query nóng: `utmCampaign`, `date`, `platform`
- Field `meta Json?` cho extensibility (KOL name, PR outlet, custom tags)

### Non-functional
- Migration reversible (`prisma migrate dev` clean)
- Seed data tối thiểu để Phase 3 test ngay được
- Document schema trong `docs/system-architecture.md` (Data Layer section)

## Architecture

### Schema mới

```prisma
enum AdPlatform {
  META   // MVP only — Google/TikTok added later
}

enum MediaPlatform {
  FACEBOOK
  INSTAGRAM
  YOUTUBE
  BLOG
  PR
  OTHER
  // TIKTOK: defer (chưa dùng platform)
}

enum MediaPostType {
  ORGANIC
  KOL
  KOC
  PR
}

model AdCampaign {
  id           String         @id @default(uuid())
  platform     AdPlatform
  externalId   String         // campaign_id từ platform API
  name         String
  utmCampaign  String?        // matching key với Lead.source (utm_campaign value)
  status       String         // ACTIVE | PAUSED | ARCHIVED
  startedAt    DateTime?
  endedAt      DateTime?
  meta         Json?          // platform-specific extras
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  spendRecords AdSpendRecord[]

  @@unique([platform, externalId])
  @@index([utmCampaign])
  @@index([platform, status])
}

model AdSpendRecord {
  id           String   @id @default(uuid())
  campaignId   String
  date         DateTime @db.Date
  spend        Decimal  @db.Decimal(12, 2)
  impressions  Int      @default(0)
  clicks       Int      @default(0)
  conversions  Int      @default(0) // tracked tại platform side
  currency     String   @default("VND")

  campaign AdCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@unique([campaignId, date])
  @@index([date])
}

model MediaPost {
  id           String         @id @default(uuid())
  platform     MediaPlatform
  externalId   String?        // post id từ platform (nếu có API)
  url          String?
  title        String?
  publishedAt  DateTime
  reach        Int            @default(0)
  engagement   Int            @default(0)
  utmCampaign  String?
  type         MediaPostType  @default(ORGANIC)
  cost         Decimal?       @db.Decimal(12, 2) // cho KOL/PR
  meta         Json?          // KOL name, PR outlet, sentiment, deliverable links
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  @@index([platform, type])
  @@index([utmCampaign])
  @@index([publishedAt])
}

// GoogleAdsConfig + TiktokAdsConfig: defer đến khi mở rộng platform.
// Khi cần thêm: schema migration nhẹ + extend enum AdPlatform.
```

### Data flow

```
[Meta API]    → RawAdsFacebook (raw)    → normalize → AdCampaign + AdSpendRecord

[Lead.source]  ─matching utm_campaign─▶  AdCampaign.utmCampaign  → Attribution view

[FB/IG/YouTube Post API] → MediaPost (type=ORGANIC)
[Manual entry KOL]       → MediaPost (type=KOL/KOC, cost set)
[Manual entry PR]        → MediaPost (type=PR, meta.outlet)
```

## Related Code Files

### Modify
- `prisma/schema.prisma` — thêm 3 model + 3 enum
- `docs/system-architecture.md` — document Data Layer section

### Create
- `prisma/migrations/{timestamp}_add_acquisition_tracking/migration.sql` (auto-generated)
- `prisma/seeds/acquisition-seed.ts` — seed example data cho dev (1 campaign Meta, 7 ngày spend, 5 media posts)

### Reference
- `prisma/schema.prisma` (existing `FbAdAccountConfig`) — pattern đặt index, enum, relation

## Implementation Steps

1. **Design review** — đọc lại schema này với team backend trước khi gen migration
2. **Edit `prisma/schema.prisma`**
   - Thêm 3 enum trên cùng (sau existing enums): `AdPlatform`, `MediaPlatform`, `MediaPostType`
   - Thêm 3 model: `AdCampaign`, `AdSpendRecord`, `MediaPost`
   - Verify naming convention nhất quán với existing models
3. **Generate migration**
   ```bash
   npm run db:push  # local first
   # nếu OK:
   npx prisma migrate dev --name add_acquisition_tracking
   ```
4. **Verify migration SQL** — đọc file `.sql` sinh ra, đảm bảo:
   - Không có DROP nào với data hiện có
   - Index được tạo đúng
   - FK constraint đúng
5. **Seed data** — tạo `prisma/seeds/acquisition-seed.ts`:
   - 1 `AdCampaign` Meta với `utmCampaign = "summer_sale_2026"`
   - 7 `AdSpendRecord` (7 ngày gần đây, spend random)
   - 5 `MediaPost`: 2 ORGANIC (FB+IG), 1 KOL, 1 KOC, 1 PR
   - Update `package.json` script nếu cần
6. **Document** — update `docs/system-architecture.md` Data Layer section:
   - Liệt kê 3 model mới + chức năng
   - Note về raw layer vs normalized
7. **Test**
   ```bash
   npm run db:push
   npm run db:studio  # verify visual
   npx tsx prisma/seeds/acquisition-seed.ts
   ```
8. **Commit**: `feat(db): add acquisition tracking schema (campaigns, spend, media posts)`

## Todo List

- [x] Edit `prisma/schema.prisma` (3 enum + 3 model)
- [x] Run `prisma migrate dev` local
- [x] Verify migration SQL không destructive
- [x] Create seed file `acquisition-seed.ts`
- [x] Update `docs/system-architecture.md`
- [x] Test seed + Prisma Studio
- [x] Commit & push

## Success Criteria

- [x] Migration apply clean trên local DB không lỗi
- [x] `npm run db:push` không break existing models (Lead, FbAdAccountConfig, RawAdsFacebook intact)
- [x] Seed chạy thành công, data visible trong Prisma Studio
- [x] Có thể query `prisma.adCampaign.findMany({ include: { spendRecords: true } })`
- [x] `docs/system-architecture.md` cập nhật

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Migration phá data hiện có | 🔴 High | Run trên local trước, review SQL kỹ, backup DB trước khi prod migrate |
| Decimal precision không đủ cho spend lớn | 🟡 Medium | Dùng `Decimal(12,2)` cover đến 9.999.999.999.99 — đủ cho VND/USD scale doanh nghiệp |
| Tên enum trùng với đâu đó khác | 🟢 Low | Search codebase trước khi commit |
| Index thiếu → query chậm | 🟢 Low | Đã thêm index trên các cột query nóng; có thể bổ sung sau khi đo |

## Security Considerations

- Reuse pattern `FbAdAccountConfig` (đã có) cho Meta token storage — không cần thêm encryption layer mới
- Field `meta Json?` không lưu PII (KOL contact info để external)

## Next Steps

- Phase 3a: Meta extend — extend `facebook-api.ts` để fetch campaign-level data populate `AdCampaign` + `AdSpendRecord`
- Sau khi Phase 2 ship: communicate marketing team về UTM convention sẽ enforce ở Phase 3b
