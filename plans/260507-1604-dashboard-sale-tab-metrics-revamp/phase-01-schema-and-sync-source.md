# Phase 01 — Schema + sync `Lead.source` from CRM

## Context Links
- Brainstorm § Decisions #9: [brainstorm-260507-1604-dashboard-sale-tab-metrics-revamp.md](../reports/brainstorm-260507-1604-dashboard-sale-tab-metrics-revamp.md)
- CRM source: `crm_subscribers.source` (verified 98.4% coverage, 14 values)
- Sync flow ref: `server/services/lead-sync/crm-lead-sync.service.ts`

## Overview
- **Priority:** P1
- **Status:** completed
- **Effort:** ~30m
- Add `source` field vào Lead schema, sync từ `crmSubscriber.source` mỗi lần CRM sync chạy.

## Key Insights
- `crm_subscribers.source` là String nullable, đã chuẩn hóa thành enum-like values: `agency-create-business`, `original-website`, `countdown-agency`, `agency-demo`, `marketing-social-media`, `pricing-agency`, `marketing-paid-ads`, `landing-page-1..5`, `referral-partner`, `marketing-seo`, `sales-team-initiative`.
- Không enum hóa ở Postgres → giữ String? để CRM thêm value mới không break sync.
- Source là **CRM-owned field** → user không edit qua UI. Add vào `CRM_OWNED_FIELDS`.

## Requirements
- Schema migration không destructive (add column NULL, không default).
- Sync logic copy `source` mỗi lần upsert lead.
- Type-safe (Prisma client regenerate).

## Architecture
```
crm-lead-sync.service.ts
  └─ buildLeadUpsertData(crmSubscriber)
      └─ ...existing fields
      └─ source: crmSubscriber.source ?? null  ← NEW
```

## Related Code Files
**Modify:**
- `prisma/schema.prisma` — add `source String?` to `Lead` model
- `server/services/lead-sync/crm-lead-sync.service.ts` — copy `source` field
- `server/services/lead-sync/constants.ts` — add `'source'` to `CRM_OWNED_FIELDS`
- `src/types/index.ts` — add `source?: string | null` to `Lead` interface

**Read for context:**
- `prisma/crm-schema.prisma` (CrmSubscriber model)
- `server/services/lead-sync/state.ts`

## Implementation Steps
1. Edit `prisma/schema.prisma`, thêm `source String?` vào Lead model.
2. Run `npm run db:push` (apply migration to dev DB).
3. Run `npx prisma generate` (regenerate client).
4. Edit `crm-lead-sync.service.ts`: trong hàm build upsert data, thêm `source: crmSubscriber.source ?? null`.
5. Edit `constants.ts`: append `'source'` vào `CRM_OWNED_FIELDS` array.
6. Edit `src/types/index.ts`: thêm `source?: string | null` vào interface `Lead`.
7. Run `npx tsc --noEmit` → no errors.
8. Manual test: trigger sync 1 lead có `source` trong CRM → verify `Lead.source` được set trong DB.

## Todo List
- [x] Add `source` column to Prisma Lead model
- [x] Run db:push migration
- [x] Regenerate Prisma client
- [x] Sync logic copy source from CRM
- [x] Add to CRM_OWNED_FIELDS
- [x] Update Lead TypeScript interface
- [x] Type-check pass
- [x] Manual sync verify

## Success Criteria
- `\d "Lead"` shows `source` column type `text` nullable.
- Trigger sync via API → 1 lead mới có `source` không null nếu CRM có giá trị.
- TypeScript no compile errors.

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Migration block khi có active connections | Add NULL column → non-blocking với Postgres |
| Prisma client regenerate quên → runtime error | Step 3 explicit, ship cùng commit |
| User edit UI sửa source nhầm | CRM_OWNED_FIELDS chặn ở backend |

## Security Considerations
- Source là string đã được CRM kiểm soát, không có user input → no injection risk.
- Read-only từ CRM → no write back.

## Next Steps
- Phase 02: backfill cho lead cũ (~6000 lead synced trước migration sẽ có source NULL).
