# Phase 01 — Restore derive-resolved-date + Sync Integration

## Context Links
- Brainstorm § 4.1: [brainstorm-260501-0051-resolved-date-auto-from-crm-activities.md](../reports/brainstorm-260501-0051-resolved-date-auto-from-crm-activities.md)
- Reference cũ: git history of `server/services/lead-sync/derive-resolved-date.ts` (xoá ở plan 260429-1048 phase 03)

## Overview
- **Priority:** P1
- **Status:** completed
- **Effort:** ~20m
- Restore file `derive-resolved-date.ts`, add `resolvedDate` lại `CRM_OWNED_FIELDS`, re-integrate sync flow.

## Key Insights
- Code cũ đã verified hoạt động đúng — chỉ cần restore từ git history
- Logic: Q/UQ status → query latest `change_status_subscriber` activity → `created_at` = resolvedDate
- Filter: `subscriber_id IN (...)` AND `action='change_status_subscriber'` AND `PEERDB_IS_DELETED=false`

## Requirements
- Code restore identical với version pre-Phase-03
- Sync flow integrate đúng order: load status map → filter Q/UQ → batch query activities → write payload

## Architecture
```
syncLeadsFromCrm batch loop:
  ├─ statusMap = loadStatusMap()
  ├─ employeeMap = loadEmployeeMap()  (CRM-direct from phase 01 of 260429)
  ├─ For each batch of subscribers:
  │   ├─ Compute statusBySubscriber (mapped status)
  │   ├─ resolvedDateMap = loadResolvedDateMap(subs filtered Q/UQ only)
  │   ├─ notesMap = loadNotesMap(all subs)  (from phase 02 of 260429)
  │   └─ For each sub: payload = mapLeadPayload(sub, ..., resolvedDate)
```

## Related Code Files
**Create:**
- `server/services/lead-sync/derive-resolved-date.ts`

**Modify:**
- `server/services/lead-sync/constants.ts` (thêm `'resolvedDate'`)
- `server/services/lead-sync/crm-lead-sync.service.ts` (import + integrate)

**Read for context:**
- Git log: `git log --all --oneline -- server/services/lead-sync/derive-resolved-date.ts`
- Pattern: `server/services/lead-sync/derive-notes.ts` (sibling helper)

## Implementation Steps
1. Recover code từ git history:
   ```bash
   git log --all --oneline -- server/services/lead-sync/derive-resolved-date.ts
   git show <commit-pre-phase-03>:server/services/lead-sync/derive-resolved-date.ts > server/services/lead-sync/derive-resolved-date.ts
   ```
   *Hoặc viết lại theo brainstorm § 4.1:*
   ```ts
   import { safeCrmQuery, getCrmClient } from '../../lib/crm-db';

   export async function loadResolvedDateMap(crmSubIds: bigint[]): Promise<Map<bigint, Date>> {
     const uniqueIds = Array.from(new Set(crmSubIds.map((id) => Number(id))));
     if (uniqueIds.length === 0) return new Map();
     const crm = getCrmClient();
     if (!crm) return new Map();

     const rows = await safeCrmQuery(
       () => crm.crm_activities.findMany({
         where: {
           subscriber_id: { in: uniqueIds },
           action: 'change_status_subscriber',
           PEERDB_IS_DELETED: false,
         },
         orderBy: [{ subscriber_id: 'asc' }, { created_at: 'desc' }],
         select: { subscriber_id: true, created_at: true },
       }),
       []
     );

     const result = new Map<bigint, Date>();
     for (const row of rows) {
       if (row.subscriber_id == null) continue;
       const key = BigInt(row.subscriber_id);
       if (!result.has(key)) result.set(key, row.created_at);  // first = latest do orderBy desc
     }
     return result;
   }
   ```

2. Sửa `constants.ts`:
   ```ts
   export const CRM_OWNED_FIELDS = [
     'customerName',
     'ae',
     'receivedDate',
     'resolvedDate',  // <-- add back
     'status',
     'notes',
   ] as const;
   ```

3. Sửa `crm-lead-sync.service.ts`:
   - Import `loadResolvedDateMap` from `./derive-resolved-date`
   - Trong batch loop, sau `statusBySubscriber`:
     ```ts
     const resolvedDateMap = await loadResolvedDateMap(
       batch.filter(sub => {
         const s = statusBySubscriber.get(sub.id);
         return s === 'Qualified' || s === 'Unqualified';
       }).map(sub => sub.id)
     );
     ```
   - `mapLeadPayload`: nhận `resolvedDate` arg, return field `resolvedDate`
   - `prisma.lead.create.data` + `prisma.lead.update.data`: thêm `resolvedDate: payload.resolvedDate`
   - Trong loop: `const resolvedDate = resolvedDateMap.get(sub.id) ?? null;` → pass vào `mapLeadPayload`

4. Run `npm run dev` → verify TypeScript compile

## Todo List
- [x] Recover/write `derive-resolved-date.ts` với `loadResolvedDateMap`
- [x] Add `'resolvedDate'` vào `CRM_OWNED_FIELDS`
- [x] Import + integrate `loadResolvedDateMap` trong sync service
- [x] Update `mapLeadPayload` signature + return
- [x] Update create/update calls với resolvedDate
- [x] Verify TypeScript compile pass

## Success Criteria
- TypeScript compile pass
- Trigger manual sync 1 Q/UQ lead → DB lưu `resolvedDate` đúng
- Lead Open → `resolvedDate = null` (sync skip)
- No regression: notes/AE/status vẫn sync đúng (phase 01-02 của 260429)

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Git history không chứa version cũ | Fallback: viết lại theo brainstorm § 4.1 (~20 lines) |
| `mapLeadPayload` signature change ảnh hưởng test | Update test mocks tương ứng |
| Existing data resolvedDate bị ghi đè ngay sync đầu | User accepted |

## Security Considerations
- Read-only CRM query
- Activity log không expose lên API — chỉ dùng nội bộ

## Next Steps
- Phase 02: lock UI edit
- Phase 03: backfill via API
