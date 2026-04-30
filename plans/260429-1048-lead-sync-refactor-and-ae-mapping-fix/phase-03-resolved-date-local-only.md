# Phase 03 — Resolved Date → Local-Only

## Context Links
- Brainstorm § 3.2: [brainstorm-260429-1048-lead-sync-refactor-and-ae-fix.md](../reports/brainstorm-260429-1048-lead-sync-refactor-and-ae-fix.md)
- Files: `crm-lead-sync.service.ts`, `lead.routes.ts`, `lead-log-dialog.tsx`, xoá `derive-resolved-date.ts`

## Overview
- **Priority:** P1
- **Status:** pending
- **Effort:** ~45m
- Loại `resolvedDate` khỏi sync flow, cho Sale chỉnh thủ công kể cả lead synced.

## Key Insights
- `derive-resolved-date.ts` chỉ được dùng bởi `crm-lead-sync.service.ts` (confirmed bằng grep)
- Data cũ giữ nguyên — không clear migration
- UPDATE endpoint hiện lock `resolvedDate` qua `stripCrmLockedFields` (vì có trong `CRM_OWNED_FIELDS`) → bỏ field khỏi list = tự động unlock
- UI dialog cần input field cho resolvedDate (check status hiện tại)

## Requirements
- Sale edit được resolvedDate qua dialog edit (kể cả synced lead)
- Sync run không động đến `resolvedDate` nữa
- Backward-compat: data cũ giữ nguyên

## Architecture
```
[Trước]
sync flow:
  loadResolvedDateMap → resolvedDate → write Lead.resolvedDate
  CRM_OWNED_FIELDS includes 'resolvedDate' → UPDATE endpoint locks

[Sau]
sync flow: (KHÔNG động vào resolvedDate)
CRM_OWNED_FIELDS không có 'resolvedDate' → UPDATE endpoint cho phép Sale sửa
```

## Related Code Files
**Modify:**
- `server/services/lead-sync/constants.ts` (bỏ `'resolvedDate'`)
- `server/services/lead-sync/crm-lead-sync.service.ts` (bỏ `loadResolvedDateMap` import + call, bỏ `resolvedDate` khỏi payload)
- `server/routes/lead.routes.ts` (line ~279-284: bỏ check `existing.syncedFromCrm` cho resolvedDate)
- `src/components/lead-tracker/lead-log-dialog.tsx` (đảm bảo có input cho resolvedDate)

**Delete:**
- `server/services/lead-sync/derive-resolved-date.ts`

**Read for context:**
- `prisma/schema.prisma` (Lead.resolvedDate vẫn nullable — không cần migration)

## Implementation Steps
1. Sửa `constants.ts` — bỏ `'resolvedDate'` khỏi `CRM_OWNED_FIELDS`:
   ```ts
   export const CRM_OWNED_FIELDS = [
     'customerName',
     'ae',
     'receivedDate',
     'status',
     'notes', // (từ phase 02)
   ] as const;
   ```
2. Sửa `crm-lead-sync.service.ts`:
   - Bỏ import `loadResolvedDateMap` (line 7)
   - Bỏ block tính `resolvedDateMap` (line 188-195)
   - Bỏ `resolvedDate` khỏi `mapLeadPayload` return (line 79)
   - Trong `prisma.lead.create` và `prisma.lead.update`: bỏ field `resolvedDate`
3. Xoá file `derive-resolved-date.ts`
4. Sửa `lead.routes.ts` line ~279-284 — đơn giản hoá:
   ```ts
   // Trước:
   ...(existing.syncedFromCrm
     ? {}
     : {
         ...(receivedDate && { receivedDate: new Date(receivedDate) }),
         ...(resolvedDate !== undefined && { resolvedDate: resolvedDate ? new Date(resolvedDate) : null }),
       }),

   // Sau: receivedDate vẫn lock, resolvedDate luôn cho Sale sửa
   ...(existing.syncedFromCrm
     ? {}
     : { ...(receivedDate && { receivedDate: new Date(receivedDate) }) }),
   ...(resolvedDate !== undefined && { resolvedDate: resolvedDate ? new Date(resolvedDate) : null }),
   ```
5. Verify `lead-log-dialog.tsx` có input cho resolvedDate trong edit mode:
   - Nếu đã có → confirm field render đúng
   - Nếu chưa có → thêm DatePicker cho `resolvedDate` (optional, nullable)
6. Run `npm run dev` → check no errors
7. Manual test: edit 1 synced lead, đổi resolvedDate, save → verify DB lưu

## Todo List
- [ ] Bỏ `resolvedDate` khỏi `CRM_OWNED_FIELDS`
- [ ] Bỏ `loadResolvedDateMap` import + call trong sync service
- [ ] Bỏ `resolvedDate` khỏi `mapLeadPayload` return + create/update
- [ ] Xoá `derive-resolved-date.ts`
- [ ] Sửa `lead.routes.ts` UPDATE: tách lock receivedDate khỏi resolvedDate
- [ ] Verify/add input resolvedDate trong `lead-log-dialog.tsx`
- [ ] TypeScript compile pass
- [ ] Manual test: synced lead edit resolvedDate

## Success Criteria
- TypeScript compile pass
- Sale edit synced lead → đổi resolvedDate thành công, DB cập nhật
- Trigger sync → `resolvedDate` không bị overwrite
- Synced lead vẫn lock `customerName`, `ae`, `receivedDate`, `status`, `notes`
- Dialog hiển thị input resolvedDate khi edit (kể cả synced lead)

## Risk Assessment
| Risk | Mitigation |
|---|---|
| `lead-log-dialog.tsx` chưa có resolvedDate input | Check trước; nếu thiếu → thêm DatePicker (1 dòng) |
| Data resolvedDate cũ inconsistent với status | Acceptable — Sale sẽ cleanup dần qua UI |
| Other callers còn import `derive-resolved-date` | grep confirmed chỉ 1 caller — safe to delete |
| Audit log không track changes resolvedDate | Check `TRACKED_FIELDS` trong `lead.routes.ts` có resolvedDate không; nếu không, thêm vào |

## Security Considerations
- Sale có thể đặt resolvedDate trong tương lai/quá khứ — nghiệp vụ không validate, chấp nhận
- `canWriteLead(req.user)` đã RBAC cho UPDATE endpoint

## Next Steps
- Phase 04 (SLA doc) độc lập, có thể song song
- Phase 05 backfill: sync chạy không touch resolvedDate → an toàn
