# Phase 01 — Refactor employee-mapper to CRM-direct

## Context Links
- Brainstorm report § 3.4: [brainstorm-260429-1048-lead-sync-refactor-and-ae-fix.md](../reports/brainstorm-260429-1048-lead-sync-refactor-and-ae-fix.md)
- Current file: `server/services/lead-sync/employee-mapper.ts`
- Caller: `server/services/lead-sync/crm-lead-sync.service.ts:73,77`

## Overview
- **Priority:** P1
- **Status:** pending
- **Effort:** ~30m
- Bỏ phụ thuộc SMIT-OS `User.crmEmployeeId` (2/17 user mapped) — query CRM `smit_employee.lark_info` (JSONB) trực tiếp để lấy tên thật.

## Key Insights
- CRM table `smit_employee` có 4 employee active: Phương Linh, Kim Huệ, Hồng Nhung, Duy Linh
- Tên ưu tiên: `lark_info->>'name'` (chính xác nhất)
- Fallback chain: `lark_info.en_name` → `zalo_pancake_info.name` → `CRM-emp-{user_id}`
- `EmployeeMapValue.id` không còn cần thiết → optional (vì không link SMIT-OS User nữa)

## Requirements
- Mapping load nhanh (single CRM query, batch all rows)
- Resilient với JSONB null (lark_info có thể empty)
- Backward-compatible với caller signature

## Architecture
```
loadEmployeeMap()
  ├─ Get CRM client
  ├─ Query: smit_employee WHERE PEERDB_IS_DELETED=false
  │   SELECT user_id, lark_info, zalo_pancake_info
  ├─ Build Map<number, { fullName: string }>
  │   fullName = lark_info?.name
  │            ?? lark_info?.en_name
  │            ?? zalo_pancake_info?.name
  │            ?? `CRM-emp-${user_id}`
  └─ Return map
```

## Related Code Files
**Modify:**
- `server/services/lead-sync/employee-mapper.ts`

**Read for context:**
- `server/services/lead-sync/crm-lead-sync.service.ts` (caller)
- `server/services/lead-sync/state.ts` (Prisma client setup)
- `server/lib/crm-db.ts` (CRM client + safeCrmQuery wrapper)
- `prisma/crm-schema.prisma` (smit_employee model)

## Implementation Steps
1. Đổi import: thêm `getCrmClient`, `safeCrmQuery` từ `../../lib/crm-db`. Bỏ `getLeadSyncPrisma`.
2. Sửa type `EmployeeMapValue`: bỏ `id` field hoặc đánh `id?: string` (caller chỉ dùng `fullName`).
3. Refactor `loadEmployeeMap()`:
   ```ts
   const crm = getCrmClient();
   if (!crm) return new Map();
   const rows = await safeCrmQuery(
     () => crm.smit_employee.findMany({
       where: { PEERDB_IS_DELETED: false },
       select: { user_id: true, lark_info: true, zalo_pancake_info: true },
     }),
     []
   );
   const map = new Map<number, EmployeeMapValue>();
   for (const row of rows) {
     const lark = row.lark_info as { name?: string; en_name?: string } | null;
     const pancake = row.zalo_pancake_info as { name?: string } | null;
     const name = lark?.name?.trim()
       || lark?.en_name?.trim()
       || pancake?.name?.trim()
       || `CRM-emp-${row.user_id}`;
     map.set(row.user_id, { fullName: name });
   }
   return map;
   ```
4. Verify caller `crm-lead-sync.service.ts:73-77` vẫn dùng `mappedEmployee?.fullName` — không cần đổi.
5. Run `npm run dev` (hot-reload) → check no compile errors.

## Todo List
- [ ] Backup current `employee-mapper.ts`
- [ ] Refactor query từ SMIT-OS User → CRM smit_employee
- [ ] Implement fallback chain 4 levels cho name
- [ ] Update `EmployeeMapValue` type
- [ ] Verify caller compatibility
- [ ] Manual test: trigger sync, check log output

## Success Criteria
- TypeScript compile pass
- Test với 1 lead: trigger manual sync → AE name = "Phương Linh" (hoặc tên thật) thay vì "Unmapped"
- `SELECT DISTINCT ae FROM "Lead" WHERE syncedFromCrm=true` không còn 'Unmapped'

## Risk Assessment
| Risk | Mitigation |
|---|---|
| `lark_info` schema khác kỳ vọng (key tên khác) | Verify qua psql trước: `SELECT lark_info FROM smit_employee LIMIT 5` (đã verified key='name') |
| `safeCrmQuery` bị timeout với 100+ employee | Acceptable — 1 query/sync run, batch chứ không loop |
| `User.crmEmployeeId` field thành dead code | Giữ schema, đánh dấu deprecated trong comment, audit lại sau 1 sprint |

## Security Considerations
- CRM credentials đã có trong env (`CRM_DATABASE_URL`)
- Read-only query (findMany với SELECT) — không có write risk
- Không expose JSONB raw lên API — chỉ extract name

## Next Steps
- Phase 02 (notes sync) độc lập, có thể chạy song song
- Phase 05 backfill phụ thuộc phase này (cần AE mapping đúng trước khi backfill)
