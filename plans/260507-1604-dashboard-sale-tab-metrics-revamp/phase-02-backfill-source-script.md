# Phase 02 — Backfill `Lead.source` cho lead cũ

## Context Links
- Brainstorm § Decisions #9
- Mẫu script: `scripts/backfill-lead-type.ts`, `scripts/backfill-crm-leads.ts`

## Overview
- **Priority:** P1
- **Status:** completed
- **Effort:** ~30m
- Một-shot script chạy backfill `Lead.source` cho tất cả lead đã sync từ CRM trước Phase 01.

## Key Insights
- ~333 lead đang có `syncedFromCrm = true` trong DB hiện tại (số đếm theo plan 260429-1048). Có thể tăng theo thời gian.
- Mapping rõ ràng qua `Lead.crmSubscriberId → CrmSubscriber.id → CrmSubscriber.source`.
- Batch size 200 đủ an toàn với Prisma + Postgres.

## Requirements
- Idempotent — chạy lại không sai data.
- Log progress + summary (total processed, updated, skipped, errors).
- Không update lead local-only (`syncedFromCrm = false`).

## Architecture
```
backfill-lead-source.ts
  ├─ Get all Lead where syncedFromCrm=true AND source IS NULL
  ├─ Batch 200 mỗi vòng
  │   ├─ Collect crmSubscriberIds
  │   ├─ Query CRM: SELECT id, source FROM crm_subscribers WHERE id IN (...)
  │   ├─ Build Map<crmSubscriberId, source>
  │   └─ Update Lead.source per match (skip if NULL in CRM)
  └─ Log summary
```

## Related Code Files
**Create:**
- `scripts/backfill-lead-source.ts`

**Read for context:**
- `scripts/backfill-lead-type.ts` (template)
- `scripts/backfill-crm-leads.ts` (CRM batch query pattern)
- `server/lib/crm-db.ts`

## Implementation Steps
1. Copy structure từ `backfill-lead-type.ts`.
2. Thay logic: query Lead với `syncedFromCrm=true AND source IS NULL`.
3. Batch loop:
   - Lấy 200 lead mỗi lần (cursor-based hoặc skip/take).
   - Collect `crmSubscriberId` (số nguyên từ Lead).
   - Query CRM `crm_subscribers` với `id IN (BigInt[])`, select `id, source`.
   - For mỗi lead trong batch: nếu CRM có source → `prisma.lead.update`.
4. Log: `[backfill-source] processed=X updated=Y skipped=Z (CRM source NULL) errors=N`.
5. Add npm script: `"backfill:lead-source": "tsx scripts/backfill-lead-source.ts"`.
6. Run script trên dev DB trước, verify count, rồi chạy production.

## Todo List
- [x] Create script file
- [x] Implement batch query CRM
- [x] Implement update loop with skip-NULL logic
- [x] Add summary log
- [x] Add npm script entry
- [x] Test trên dev: verify count
- [x] Run production backfill
- [x] Verify NULL coverage < 5% trong synced leads

## Success Criteria
- Script hoàn thành không error.
- `SELECT COUNT(*) FROM "Lead" WHERE syncedFromCrm=true AND source IS NULL` < 5% tổng synced lead (số NULL còn lại = lead có CRM source NULL gốc, ~1.6%).
- Distribution `SELECT source, COUNT(*) FROM "Lead" GROUP BY source` khớp với CRM distribution.

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Script chạy lâu, lock connection | Batch 200 + sleep 100ms giữa các batch nếu cần |
| crmSubscriberId không tồn tại trong CRM (deleted) | Skip silently, log count |
| Race condition với cron sync đang chạy | Cron sync dùng upsert, ghi đè cùng giá trị → safe |

## Security Considerations
- Script chạy local/server, không expose ra network.
- Read-only CRM query, write-only SMIT-OS.

## Next Steps
- Phase 03 độc lập, có thể chạy song song với phase này (không phụ thuộc).
