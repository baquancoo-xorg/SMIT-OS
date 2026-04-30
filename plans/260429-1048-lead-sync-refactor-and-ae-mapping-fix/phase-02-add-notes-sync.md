# Phase 02 — Add Notes Sync from crm_activities

## Context Links
- Brainstorm § 3.1: [brainstorm-260429-1048-lead-sync-refactor-and-ae-fix.md](../reports/brainstorm-260429-1048-lead-sync-refactor-and-ae-fix.md)
- CRM evidence: 6205 add_note records, format `title` (loại) + `details` (nội dung)
- Pattern reference: `server/services/lead-sync/derive-resolved-date.ts` (cùng kiểu batch query)

## Overview
- **Priority:** P1
- **Status:** pending
- **Effort:** ~1h
- Tạo helper sync notes từ CRM `crm_activities (action='add_note')`, cap 90 ngày, concat timeline format. Thêm `notes` vào `CRM_OWNED_FIELDS` để sync ghi đè.

## Key Insights
- Format CRM: `title` thường là loại note ("đã gọi điện", "đã thêm note"), `details` là nội dung thực
- Order: `created_at ASC` (timeline cũ → mới) — giúp đọc tự nhiên
- Cap: chỉ note có `created_at >= NOW() - INTERVAL '90 days'`
- Format output: `[YYYY-MM-DD HH:mm] title: details\n\n...`
- Sale không edit được notes của lead synced (do `stripCrmLockedFields` tự lock — không cần code mới)

## Requirements
- Batch query — tránh N+1
- Resilient với null `title` hoặc `details`
- Format thân thiện UI

## Architecture
```
loadNotesMap(crmSubIds: bigint[])
  ├─ Get CRM client
  ├─ Query crm_activities:
  │   WHERE subscriber_id IN (...)
  │     AND action = 'add_note'
  │     AND PEERDB_IS_DELETED = false
  │     AND created_at >= NOW() - INTERVAL '90 days'
  │   ORDER BY subscriber_id ASC, created_at ASC
  │   SELECT subscriber_id, title, details, created_at
  ├─ Group rows by subscriber_id
  ├─ For each subscriber:
  │   notes = activities
  │     .map(a => `[${formatDateTime(a.created_at)}] ${a.title ?? ''}: ${a.details ?? ''}`)
  │     .join('\n\n')
  └─ Return Map<bigint, string>
```

## Related Code Files
**Create:**
- `server/services/lead-sync/derive-notes.ts` (new file, ~50 lines)

**Modify:**
- `server/services/lead-sync/constants.ts` (thêm `'notes'` vào `CRM_OWNED_FIELDS`)
- `server/services/lead-sync/crm-lead-sync.service.ts` (gọi `loadNotesMap`, payload thêm notes)

**Read for context:**
- `server/services/lead-sync/derive-resolved-date.ts` (pattern reference)
- `prisma/crm-schema.prisma` (crm_activities model)
- `prisma/schema.prisma` (Lead.notes field)

## Implementation Steps
1. Tạo `derive-notes.ts`:
   ```ts
   import { safeCrmQuery, getCrmClient } from '../../lib/crm-db';

   const NOTES_CAP_DAYS = 90;

   function formatDateTime(d: Date): string {
     const yyyy = d.getUTCFullYear();
     const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
     const dd = String(d.getUTCDate()).padStart(2, '0');
     const hh = String(d.getUTCHours()).padStart(2, '0');
     const mi = String(d.getUTCMinutes()).padStart(2, '0');
     return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
   }

   export async function loadNotesMap(crmSubIds: bigint[]): Promise<Map<bigint, string>> {
     const uniqueIds = Array.from(new Set(crmSubIds.map((id) => Number(id))));
     if (uniqueIds.length === 0) return new Map();
     const crm = getCrmClient();
     if (!crm) return new Map();

     const cutoff = new Date(Date.now() - NOTES_CAP_DAYS * 24 * 60 * 60 * 1000);
     const rows = await safeCrmQuery(
       () => crm.crm_activities.findMany({
         where: {
           subscriber_id: { in: uniqueIds },
           action: 'add_note',
           PEERDB_IS_DELETED: false,
           created_at: { gte: cutoff },
         },
         orderBy: [{ subscriber_id: 'asc' }, { created_at: 'asc' }],
         select: { subscriber_id: true, title: true, details: true, created_at: true },
       }),
       []
     );

     const result = new Map<bigint, string[]>();
     for (const row of rows) {
       if (row.subscriber_id == null) continue;
       const key = BigInt(row.subscriber_id);
       const line = `[${formatDateTime(row.created_at)}] ${row.title ?? ''}: ${row.details ?? ''}`.trim();
       const existing = result.get(key) ?? [];
       existing.push(line);
       result.set(key, existing);
     }

     return new Map(Array.from(result.entries()).map(([k, v]) => [k, v.join('\n\n')]));
   }
   ```
2. Sửa `constants.ts`:
   ```ts
   export const CRM_OWNED_FIELDS = [
     'customerName',
     'ae',
     'receivedDate',
     'resolvedDate', // Phase 03 sẽ bỏ
     'status',
     'notes', // <-- thêm
   ] as const;
   ```
3. Sửa `crm-lead-sync.service.ts`:
   - Import `loadNotesMap` from `./derive-notes`
   - Trong batch loop (sau `loadResolvedDateMap` ~ line 188-195):
     ```ts
     const notesMap = await loadNotesMap(batch.map(s => s.id));
     ```
   - Trong `mapLeadPayload`: thêm `notes: notesMap.get(sub.id) ?? ''` (cần thay đổi signature để nhận notesMap)
   - Trong `prisma.lead.create` và `prisma.lead.update`: thêm `notes: payload.notes`
4. Update LeadWritePayload type — đã tự động bao gồm `notes` qua `Pick<Lead, CRM_OWNED_FIELDS[number]>`
5. Run `npm run dev` → verify no compile errors

## Todo List
- [ ] Tạo file `derive-notes.ts`
- [ ] Implement `loadNotesMap` với batch query + 90-day cap
- [ ] Implement `formatDateTime` helper
- [ ] Thêm `'notes'` vào `CRM_OWNED_FIELDS`
- [ ] Integrate `loadNotesMap` vào sync flow
- [ ] Update `mapLeadPayload` signature để nhận `notesMap`
- [ ] Update create/update calls trong sync
- [ ] Manual test: trigger sync 1 lead, check notes content

## Success Criteria
- TypeScript compile pass
- Test 1 lead có nhiều add_note: notes column hiển thị timeline format
- Lead Logs UI hiển thị notes đầy đủ (truncated UI vẫn ok vì có max-width)
- Lead synced không cho Sale edit notes qua UPDATE endpoint (`stripCrmLockedFields` tự lock)
- Lead local-only (`syncedFromCrm=false`) vẫn cho Sale nhập tay

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Note quá dài trong 90 ngày | Acceptable — cap đã giảm; nếu phát sinh thêm cap max-records (vd: 30) |
| `details` chứa ký tự đặc biệt phá UI | UI render text plain, escape xử lý ở React tự động |
| `created_at` timezone mismatch | Format theo UTC (consistent); nếu muốn local-time có thể dùng date-fns-tz |
| Notes ghi đè khi Sale đã nhập tay | User chấp nhận (`CRM_OWNED_FIELDS` ghi đè) |

## Security Considerations
- Read-only CRM query
- Note content có thể chứa thông tin nhạy cảm khách hàng → đảm bảo Lead Logs có RBAC (đã có via `RBAC.authenticated` trong route)

## Next Steps
- Phase 03 cũng sửa `crm-lead-sync.service.ts` → cần coordinate (làm sequential, phase 02 trước)
- Phase 05 backfill sẽ apply notes cho 333 lead hiện tại
