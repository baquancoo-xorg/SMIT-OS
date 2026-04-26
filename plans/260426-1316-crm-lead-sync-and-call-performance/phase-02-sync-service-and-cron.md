# Phase 02 — Sync Service & Cron

## Context Links
- Parent: [plan.md](plan.md)
- Brainstorm §4.2: [brainstorm-260426-1316-crm-lead-sync-and-call-performance.md](../reports/brainstorm-260426-1316-crm-lead-sync-and-call-performance.md)
- Depends on: phase-01 (schema)
- Existing: `server/lib/crm-db.ts`, `server/routes/lead.routes.ts`

## Overview
- **Date:** 2026-04-26
- **Priority:** P1
- **Status:** pending
- **Review:** pending
- **Description:** Build incremental sync engine + 10-min cron + manual trigger API. Core của toàn bộ feature auto-sync.

## Key Insights
- CRM Prisma client truy cập qua `getCrmClient()` (lazy init, fallback null nếu CRM down)
- `safeCrmQuery` wrapper bảo vệ khỏi CRM errors
- Sync filter: `WHERE created_at >= '2026-04-01' AND updated_at >= last_sync_at`
- Field protection PHẢI tuyệt đối: không bao giờ include `notes`/`leadType`/`unqualifiedType`/`deleteRequested*` trong update payload
- Resolved Date derive: nếu CRM status ∈ {qualified, unqualified} → tìm `crm_activities` latest `change_status_subscriber` cho subscriber_id đó
- Concurrent cron protection: Postgres `pg_try_advisory_lock(BIGINT_KEY)` (key cố định, ví dụ `0xDEADBEEF`)
- Mỗi sync touch (create + update có changes) → 1 entry `LeadAuditLog` với `actorUserId='system-sync'`

## Requirements

### Functional
- `syncLeadsFromCrm({ from?, to?, mode })` thực hiện full sync logic
- Cron mỗi 10 phút, chạy mode `incremental` (since last successful run)
- Manual trigger API `POST /api/leads/sync-now` (Admin only)
- Status API `GET /api/leads/sync-status` returns last `LeadSyncRun`
- Backfill mode (`mode='backfill'`) sync toàn bộ từ cutoff
- Chunked batch 50 records/iter để tránh long transaction

### Non-functional
- Sync run < 60s cho incremental (~16 leads/day)
- Idempotent: chạy 2 lần không tạo duplicate
- Resilient: 1 record fail không kill cả batch (log error vào `LeadSyncRun.errors`, continue)
- Memory: cache employee map + status map, refresh mỗi run (TTL = run lifetime)

## Architecture

```
crm-lead-sync.service.ts:syncLeadsFromCrm(opts)
├─ acquireAdvisoryLock()                        // pg_try_advisory_lock
├─ runRecord = create LeadSyncRun (status=running)
├─ statusMap = await loadStatusMap()             // status-mapper.ts
├─ employeeMap = await loadEmployeeMap()         // employee-mapper.ts
├─ since = opts.from ?? lastSuccessfulRun.startedAt ?? CUTOFF_2026_04_01
├─ for each batch of 50 from CRM:
│   ├─ subscribers = crmPrisma.crmSubscriber.findMany({
│   │     where: { createdAt: { gte: CUTOFF }, updatedAt: { gte: since } },
│   │     orderBy: { id: 'asc' }, skip, take: 50 })
│   ├─ for each sub:
│   │   ├─ smitStatus = statusMap[sub.status] ?? 'Mới' (log unknown)
│   │   ├─ aeName = employeeMap[sub.employee_id_modified]?.fullName ?? null
│   │   ├─ resolvedDate = await deriveResolvedDate(sub.id, smitStatus)
│   │   ├─ existing = prisma.lead.findUnique({ where: { crmSubscriberId: sub.id }})
│   │   ├─ if existing && existing.deleteRequestedAt → SKIP (soft-deleted)
│   │   ├─ if existing → update CRM-OWNED ONLY:
│   │   │     { customerName, ae, receivedDate, resolvedDate, status, lastSyncedAt: now }
│   │   ├─ else → create with syncedFromCrm: true, lastSyncedAt: now
│   │   ├─ if changes.length > 0 → write LeadAuditLog (actorUserId='system-sync')
│   │   └─ runRecord.{leadsCreated|leadsUpdated}++
│   └─ runRecord.subscribersScanned += batch.length
├─ runRecord.status = 'success', finishedAt = now
└─ releaseAdvisoryLock()

ON ERROR: runRecord.status = 'failed', errors = JSON
```

## Related Code Files

### Create
- `server/services/lead-sync/crm-lead-sync.service.ts` — main entry
- `server/services/lead-sync/derive-resolved-date.ts` — helper
- `server/services/lead-sync/status-mapper.ts` — load + cache `LeadStatusMapping`
- `server/services/lead-sync/employee-mapper.ts` — load + cache `User.crmEmployeeId` map
- `server/services/lead-sync/advisory-lock.ts` — pg_try_advisory_lock wrapper
- `server/services/lead-sync/constants.ts` — `CUTOFF_2026_04_01`, `LEAD_SYNC_LOCK_KEY`, `BATCH_SIZE=50`
- `server/cron/lead-sync.cron.ts` — `setInterval` or `node-cron` registration
- `server/routes/lead-sync.routes.ts` — POST `/sync-now` (Admin), GET `/sync-status`
- `server/middleware/require-admin.ts` (if not already exists) — guard for sync-now

### Modify
- `server.ts` — register cron in startup, register `lead-sync.routes` under `/api/leads`
- `prisma/schema.prisma` — (already done in phase-01)
- `package.json` — verify `node-cron` is in deps (else install)

### Delete
- (none)

## Implementation Steps

1. Check if `node-cron` installed; if not: `npm i node-cron && npm i -D @types/node-cron`.
2. Create `server/services/lead-sync/constants.ts` with `CUTOFF_2026_04_01 = new Date('2026-04-01T00:00:00+07:00')`, `LEAD_SYNC_LOCK_KEY = 0xDEADBEEFn`, `BATCH_SIZE = 50`, `CRM_OWNED_FIELDS = ['customerName','ae','receivedDate','resolvedDate','status']`.
3. Create `status-mapper.ts`: function `loadStatusMap(): Promise<Record<string, string>>` query `LeadStatusMapping where active=true`.
4. Create `employee-mapper.ts`: function `loadEmployeeMap(): Promise<Map<number, {id, fullName}>>` query `User where crmEmployeeId not null`.
5. Create `derive-resolved-date.ts`:
   ```typescript
   export async function deriveResolvedDate(crmSubId: bigint, smitStatus: string): Promise<Date | null> {
     if (smitStatus !== 'Qualified' && smitStatus !== 'Unqualified') return null;
     const last = await crmPrisma.crm_activities.findFirst({
       where: { subscriber_id: Number(crmSubId), action: 'change_status_subscriber' },
       orderBy: { created_at: 'desc' },
       select: { created_at: true },
     });
     return last?.created_at ?? null;
   }
   ```
6. Create `advisory-lock.ts`:
   ```typescript
   export async function withAdvisoryLock<T>(key: bigint, fn: () => Promise<T>): Promise<T | null> {
     const [{ locked }] = await prisma.$queryRaw`SELECT pg_try_advisory_lock(${key}) AS locked`;
     if (!locked) return null;
     try { return await fn(); }
     finally { await prisma.$queryRaw`SELECT pg_advisory_unlock(${key})`; }
   }
   ```
7. Create `crm-lead-sync.service.ts` implementing pseudocode above. Key concerns:
   - **Field protection:** spread guard — explicitly enumerate CRM-owned fields, never `...sub`
   - Use `prisma.lead.upsert` with `where: { crmSubscriberId }` + careful `update`/`create` payloads
   - Wrap CRM calls in `safeCrmQuery`
   - Catch per-record errors, push to `errors[]`, continue loop
   - Compute changes diff để chỉ ghi audit log khi có thay đổi thực sự
8. Create `server/routes/lead-sync.routes.ts`:
   - `POST /sync-now` middleware require Admin → call `syncLeadsFromCrm({mode: 'manual'})` async, return job id
   - `GET /sync-status` → return latest `LeadSyncRun` ORDER BY `startedAt` DESC LIMIT 1
9. Create `server/cron/lead-sync.cron.ts`:
   - `cron.schedule('*/10 * * * *', () => syncLeadsFromCrm({mode: 'cron'}))`
   - Log start/end mỗi run
   - Skip if previous run still running (advisory lock handles)
10. Modify `server.ts`:
    - Import + start cron after server listens
    - Mount `lead-sync.routes` at `/api/leads`
11. Add unit tests (`server/services/lead-sync/__tests__/`):
    - `field-protection.test.ts` — verify update payload never contains protected fields
    - `derive-resolved-date.test.ts` — mock CRM, test 4 cases (qualified, unqualified, contacting, no activities)
    - `status-mapper.test.ts` — test cache + unknown status fallback

## Todo List

- [ ] Install `node-cron` if missing
- [ ] Create `constants.ts` with all sync constants
- [ ] Implement `status-mapper.ts`
- [ ] Implement `employee-mapper.ts`
- [ ] Implement `derive-resolved-date.ts`
- [ ] Implement `advisory-lock.ts`
- [ ] Implement `crm-lead-sync.service.ts` core logic
- [ ] Implement field protection guard (whitelist CRM-owned fields)
- [ ] Implement chunked batch loop with per-record error handling
- [ ] Implement `LeadSyncRun` lifecycle (running → success/failed)
- [ ] Implement `LeadAuditLog` write per sync touch (actorUserId='system-sync')
- [ ] Skip soft-deleted leads logic
- [ ] Create `lead-sync.routes.ts` with sync-now + sync-status endpoints
- [ ] Add Admin middleware on `/sync-now`
- [ ] Create `lead-sync.cron.ts` with 10-min schedule
- [ ] Register cron + routes in `server.ts`
- [ ] Unit test: field protection
- [ ] Unit test: derive-resolved-date 4 cases
- [ ] Unit test: status-mapper cache + fallback
- [ ] Manual end-to-end test: trigger `/sync-now`, verify Lead rows created
- [ ] Verify `LeadSyncRun` record created with correct metrics

## Success Criteria
- Manual `POST /api/leads/sync-now` returns 200 < 60s
- After 1 cron tick: `LeadSyncRun` row with `status='success'`
- Lead table populated với CRM data, `crmSubscriberId` đúng
- AE name match khi `User.crmEmployeeId` đã seed; `null` khi chưa seed (expected)
- Update test: chỉnh `notes` trong SMIT, sync chạy lại → `notes` KHÔNG đổi
- Concurrent cron + manual trigger: chỉ 1 chạy, lock hoạt động

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Field protection logic sai → mất AE work | Critical | Whitelist (not blacklist) approach, unit tests |
| `BigInt` ↔ `Number` conversion lỗi | High | Explicit `Number(sub.id)` chỉ cho CRM subscriber_id (Int trong activities); giữ BigInt khi save vào Lead |
| Cron chạy chồng chéo | High | Advisory lock + run check |
| CRM down → cron crash | Medium | `safeCrmQuery` returns null, sync exits gracefully |
| `crm_activities` query chậm | Medium | Index trên `(subscriber_id, action, created_at)` ở CRM side; nếu chậm: cache/batch query |
| `LeadAuditLog` table phồng nhanh | Medium | Acceptable; có thể prune sau (config retention) |
| Unknown CRM status → mặc định "Mới" có thể sai | Low | Log warning vào `LeadSyncRun.errors`; admin update mapping |

## Security Considerations
- `POST /api/leads/sync-now` PHẢI guard Admin (ngăn AE thường spam)
- CRM credentials đã trong env, không log
- `LeadAuditLog.actorUserId='system-sync'` là sentinel, đảm bảo không clash với UUID thật
- Advisory lock key cố định, không bị attacker control

## Next Steps
- Phase 03 (backfill) gọi service này với `mode='backfill'`
- Phase 04 (UI) hiển thị `sync-status` API + button trigger
- Sau khi merge: monitor cron logs 24h trước khi xem là stable
