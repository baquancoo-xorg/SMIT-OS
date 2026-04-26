# Phase 01 — Schema Migration & Seed

## Context Links
- Parent plan: [plan.md](plan.md)
- Brainstorm §4.1: [brainstorm-260426-1316-crm-lead-sync-and-call-performance.md](../reports/brainstorm-260426-1316-crm-lead-sync-and-call-performance.md)
- Existing schema: `prisma/schema.prisma`

## Overview
- **Date:** 2026-04-26
- **Priority:** P1 (blocker cho mọi phase sau)
- **Status:** completed
- **Review:** completed
- **Description:** Thêm các cột/bảng cần thiết để track CRM linkage, AE mapping, status mapping config, và sync run history.

## Key Insights
- CRM `crm_subscribers.id` là `BigInt` → `Lead.crmSubscriberId` phải là `BigInt? @unique`
- CRM `employee_user_id` là `Int` → `User.crmEmployeeId` phải là `Int? @unique`
- `LeadStatusMapping` chỉ có 5 rows ban đầu (CRM enum đã verify live: `new`, `mql_contacting`, `mql_nurturing`, `mql_qualified`, `mql_unqualified`)
- `LeadSyncRun` cần lưu metrics đủ để debug + hiển thị "last sync" trên UI
- `smit_ae_name_mapping` (CRM side) đang rỗng → KHÔNG dùng, chuyển hoàn toàn sang `User.crmEmployeeId` (SMIT-side)

## Requirements

### Functional
- Lead có thể link tới CRM subscriber qua `crmSubscriberId` (nullable cho legacy leads)
- User có thể link tới CRM employee qua `crmEmployeeId` (nullable, unique)
- Status mapping configurable runtime (KHÔNG hardcode)
- Mỗi sync run lưu lại: thời gian bắt đầu/kết thúc, status, số records scanned/created/updated, errors, trigger type

### Non-functional
- Migration non-breaking (legacy data còn dùng được)
- Indexes hợp lý: unique trên `crmSubscriberId`, `crmEmployeeId`, `crmStatus`
- Seed idempotent (chạy lại không tạo duplicate)

## Architecture

```
prisma/schema.prisma
├── model Lead (modified)
│   + crmSubscriberId   BigInt?   @unique
│   + syncedFromCrm     Boolean   @default(false)
│   + lastSyncedAt      DateTime?
├── model User (modified)
│   + crmEmployeeId     Int?      @unique
├── model LeadStatusMapping (NEW)
│   id, crmStatus@unique, smitStatus, active, createdAt, updatedAt
└── model LeadSyncRun (NEW)
    id, startedAt, finishedAt, status, subscribersScanned,
    leadsCreated, leadsUpdated, errors(Json?), triggerType,
    @@index([startedAt(sort: Desc)])
```

## Related Code Files

### Modify
- `prisma/schema.prisma` — add columns + 2 new models

### Create
- `prisma/seeds/lead-status-mapping.seed.ts` — seed 5 status mappings
- `scripts/seed-user-crm-employee-id.ts` — interactive/JSON-input mapping script

### Delete
- (none)

## Implementation Steps

1. Edit `prisma/schema.prisma`:
   - In `model Lead`: add 3 fields (`crmSubscriberId`, `syncedFromCrm`, `lastSyncedAt`) + `@@index([crmSubscriberId])` if not auto-indexed by `@unique`.
   - In `model User`: add `crmEmployeeId Int? @unique`.
   - Append new model `LeadStatusMapping`.
   - Append new model `LeadSyncRun` with `@@index([startedAt(sort: Desc)])`.
2. Run `npx prisma format` → verify syntax.
3. Run `npx prisma migrate dev --name add_crm_lead_sync_fields` → review SQL → apply.
4. Run `npx prisma generate` → update client.
5. Create `prisma/seeds/lead-status-mapping.seed.ts` with `upsert` logic for 5 mappings:
   - `new` → "Mới"
   - `mql_contacting` → "Đang liên hệ"
   - `mql_nurturing` → "Đang nuôi dưỡng"
   - `mql_qualified` → "Qualified"
   - `mql_unqualified` → "Unqualified"
6. Add npm script `db:seed:lead-status` in `package.json` → `tsx prisma/seeds/lead-status-mapping.seed.ts`.
7. Run seed script, verify rows in Prisma Studio.
8. Create `scripts/seed-user-crm-employee-id.ts`:
   - Accept JSON via `--file <path>` arg, format `[{ username|fullName, crmEmployeeId }, ...]`
   - For each entry: `prisma.user.update({ where: { username }, data: { crmEmployeeId } })`
   - Log mapped vs not-found
9. Document expected JSON format in script header comment.

## Todo List

- [x] Edit `Lead` model: 3 new fields
- [x] Edit `User` model: `crmEmployeeId`
- [x] Add `LeadStatusMapping` model
- [x] Add `LeadSyncRun` model + index
- [x] Run `prisma format`
- [x] Run `prisma migrate dev` with descriptive name
- [x] Run `prisma generate`
- [x] Create + test `lead-status-mapping.seed.ts` (idempotent)
- [x] Add npm script `db:seed:lead-status`
- [x] Run seed, verify 5 rows in DB
- [x] Create `scripts/seed-user-crm-employee-id.ts`
- [x] Document JSON input format
- [ ] Test script with sample JSON (1-2 known users) <!-- unverified: no test log found -->
- [x] Verify all 4 schema changes via `npm run db:studio`

## Success Criteria
- `prisma migrate status` clean
- 5 rows in `LeadStatusMapping` after seed
- `User.crmEmployeeId` populated for at least 1 test user
- `Lead.crmSubscriberId/syncedFromCrm/lastSyncedAt` columns visible in DB
- No regression: existing `/api/leads` endpoints still work

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Migration phá vỡ existing leads | High | Tất cả new fields nullable hoặc default; test trước trên dev DB |
| `@unique` constraint conflict khi backfill | Medium | Chỉ unique nullable → multiple null OK; backfill check trước khi insert |
| Seed script trùng lặp data | Low | Dùng `upsert` thay vì `create` |

## Security Considerations
- Migration không expose data mới ra API — chỉ DB level
- `seed-user-crm-employee-id.ts` chạy local → JSON file không commit (add to `.gitignore` nếu cần)
- `User.crmEmployeeId` không leak qua API hiện tại (cần audit `/api/users` response sau)

## Next Steps
- Phase 02 (sync service) phụ thuộc 100% phase này
- Phase 05 (call performance) cũng phụ thuộc `User.crmEmployeeId`
- Sau khi merge: chạy `seed-user-crm-employee-id.ts` với JSON đầy đủ AE thực tế
