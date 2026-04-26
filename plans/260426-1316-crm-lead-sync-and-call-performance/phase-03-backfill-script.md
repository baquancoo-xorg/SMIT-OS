# Phase 03 — Backfill Historical Script

## Context Links
- Parent: [plan.md](plan.md)
- Brainstorm §4.2: [brainstorm-260426-1316-crm-lead-sync-and-call-performance.md](../reports/brainstorm-260426-1316-crm-lead-sync-and-call-performance.md)
- Depends on: phase-01 (schema), phase-02 (sync service)

## Overview
- **Date:** 2026-04-26
- **Priority:** P2 (chạy 1 lần sau phase-02)
- **Status:** completed
- **Review:** completed
- **Description:** Script chạy 1 lần để backfill toàn bộ subscriber từ 2026-04-01 trở đi vào Lead table. Thin wrapper quanh sync service.

## Key Insights
- Volume nhẹ: ~391 records (live data) → < 5 phút
- Sync service đã handle idempotent (upsert by `crmSubscriberId`) → backfill chạy lại an toàn
- Cần dry-run mode để verify trước khi commit
- Cron có thể chạy song song → backfill PHẢI giữ advisory lock (đã có sẵn từ phase-02)

## Requirements

### Functional
- Script `scripts/backfill-crm-leads.ts` accept flags: `--dry-run`, `--from <date>`, `--to <date>`
- Default: `from=2026-04-01`, `to=now`
- Dry-run: chỉ count + log, không write
- Real run: gọi `syncLeadsFromCrm({ mode: 'backfill', from, to })`
- Progress log mỗi batch (50 records)
- Cuối: in summary (created, updated, errors)

### Non-functional
- Hoàn thành < 10 phút cho dataset hiện tại
- Không kill cron đang chạy (lock acquire fail → retry hoặc skip)

## Architecture

```
scripts/backfill-crm-leads.ts
├─ parse args (commander or process.argv)
├─ if --dry-run: count crmSubscribers in range, log, exit
├─ else: call syncLeadsFromCrm({ mode: 'backfill', from, to })
└─ print final LeadSyncRun summary
```

## Related Code Files

### Create
- `scripts/backfill-crm-leads.ts`

### Modify
- `package.json` — add `"backfill:leads": "tsx scripts/backfill-crm-leads.ts"`

### Delete
- (none)

## Implementation Steps

1. Create `scripts/backfill-crm-leads.ts`:
   - Import `syncLeadsFromCrm` from sync service
   - Parse args manually (no need for commander):
     - `--dry-run` → boolean
     - `--from=YYYY-MM-DD` → optional, default `2026-04-01`
     - `--to=YYYY-MM-DD` → optional, default now
   - If dry-run:
     ```typescript
     const count = await crmPrisma.crmSubscriber.count({
       where: { createdAt: { gte: from, lte: to } }
     });
     console.log(`[DRY-RUN] Would sync ${count} subscribers from ${from} to ${to}`);
     ```
   - Else:
     ```typescript
     const run = await syncLeadsFromCrm({ mode: 'backfill', from, to });
     console.log('Backfill complete:', JSON.stringify(run, null, 2));
     ```
2. Add npm script in `package.json`.
3. Test: `npm run backfill:leads -- --dry-run` → should print count without writing.
4. Test: `npm run backfill:leads` → should populate Lead table.
5. Verify in `npm run db:studio`: Lead rows have `crmSubscriberId`, `syncedFromCrm=true`.

## Todo List

- [x] Create `scripts/backfill-crm-leads.ts`
- [x] Implement arg parsing (--dry-run, --from, --to)
- [x] Implement dry-run mode (count only)
- [x] Implement real-run mode (call sync service)
- [x] Add npm script `backfill:leads`
- [ ] Test dry-run on dev DB <!-- unverified: no test log -->
- [ ] Test real-run on dev DB <!-- unverified -->
- [ ] Verify Lead rows count matches CRM count <!-- unverified -->
- [x] Document usage in script header comment

## Success Criteria
- Dry-run prints accurate count from CRM
- Real run completes < 5 phút
- All ~391 (or current) eligible subscribers have matching Lead rows
- `LeadSyncRun` row created with `triggerType='backfill'`, `status='success'`
- No duplicates created on rerun (idempotent verified)

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Backfill kéo cron song song → lock contention | Low | Advisory lock từ sync service đã handle |
| Real run trên prod nhầm → ảnh hưởng AE work | Medium | Dry-run mặc định, real run cần explicit `--no-dry-run` flag (xem option dưới) |
| Memory spike khi load 391 records | Low | Sync service đã chunked 50/batch |

**Optional safety:** make dry-run default, require explicit `--commit` flag for real run.

## Security Considerations
- Script chạy local với DB credentials → không expose qua API
- Không commit JSON config file nếu có
- Log không in PII subscriber emails/phones

## Next Steps
- Sau khi backfill thành công: cron tự động maintain incremental
- Sau khi xác nhận backfill OK → có thể announce phase-04 UI deprecation
