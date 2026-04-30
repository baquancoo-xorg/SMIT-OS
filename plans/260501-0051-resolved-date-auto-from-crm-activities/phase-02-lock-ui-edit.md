# Phase 02 — Lock UI Edit for Synced Lead

## Context Links
- Brainstorm § 4.1 step 4-5: [brainstorm-260501-0051-resolved-date-auto-from-crm-activities.md](../reports/brainstorm-260501-0051-resolved-date-auto-from-crm-activities.md)
- Files: `server/routes/lead.routes.ts`, `src/components/lead-tracker/lead-log-dialog.tsx`

## Overview
- **Priority:** P1
- **Status:** completed
- **Effort:** ~15m
- Lock resolvedDate khỏi user edit cho lead synced (revert UI/API changes của Phase 03 trước).

## Key Insights
- Phase 03 plan trước đã tách lock receivedDate khỏi resolvedDate trong UPDATE endpoint (line ~279-284 of `lead.routes.ts`)
- Cần đảo ngược: gộp resolvedDate trở lại block lock-when-synced
- `stripCrmLockedFields(rest)` (line 273) đã tự động lock vì `'resolvedDate'` đã thêm lại vào `CRM_OWNED_FIELDS` ở Phase 01 → có thể đủ
- UI dialog: nếu Phase 03 đã enable input cho synced lead → revert (disable lại)

## Requirements
- Synced lead: resolvedDate input disabled trong dialog
- Local lead: resolvedDate input editable bình thường
- API UPDATE: synced lead reject thay đổi resolvedDate (silent ignore via stripCrmLockedFields)

## Architecture
```
UPDATE /api/leads/:id
  ├─ existing.syncedFromCrm = true
  │   ├─ stripCrmLockedFields(rest) → loại resolvedDate
  │   └─ block date setters: skip resolvedDate
  └─ existing.syncedFromCrm = false
      └─ all fields editable
```

## Related Code Files
**Modify:**
- `server/routes/lead.routes.ts` (UPDATE endpoint ~line 264-302)
- `src/components/lead-tracker/lead-log-dialog.tsx` (resolvedDate input)

## Implementation Steps
1. Đọc current `lead.routes.ts` line 264-302 (UPDATE handler)
2. Verify `stripCrmLockedFields(rest)` đã tự lock resolvedDate khi `'resolvedDate'` có trong `CRM_OWNED_FIELDS` (Phase 01 đã add)
3. Revert thay đổi Phase 03 trong block date setters:
   ```ts
   // Sau revert (giống pre-Phase-03):
   ...(existing.syncedFromCrm
     ? {}
     : {
         ...(receivedDate && { receivedDate: new Date(receivedDate) }),
         ...(resolvedDate !== undefined && { resolvedDate: resolvedDate ? new Date(resolvedDate) : null }),
       }),
   ```
4. Đọc `lead-log-dialog.tsx`:
   - Tìm input/DatePicker cho resolvedDate
   - Check current state: có check `lead.syncedFromCrm` để disable không?
5. Update dialog: nếu chưa có disable logic, thêm:
   ```tsx
   <DatePicker
     value={form.resolvedDate}
     onChange={(v) => setForm({ ...form, resolvedDate: v })}
     disabled={lead?.syncedFromCrm === true}
     placeholder="Resolved date"
   />
   ```
6. Run `npm run dev` → verify

## Todo List
- [x] Read current `lead.routes.ts` UPDATE handler
- [x] Revert resolvedDate handling: gộp lại block lock-when-synced
- [x] Read `lead-log-dialog.tsx` resolvedDate input
- [x] Add `disabled={lead?.syncedFromCrm}` cho resolvedDate input
- [x] Add visual hint (vd: tooltip "Auto-synced from CRM") nếu UX cần
- [x] TypeScript compile pass
- [x] Manual test: edit synced Q/UQ lead → resolvedDate disabled

## Success Criteria
- UI: synced lead → resolvedDate input disabled (visual feedback rõ ràng)
- UI: local lead → resolvedDate input editable
- API: PUT request gửi resolvedDate cho synced lead → silently ignored (stripCrmLockedFields)
- API: PUT cho local lead → resolvedDate updated bình thường
- Audit log: edit local lead resolvedDate → ghi LeadAuditLog (TRACKED_FIELDS đã có resolvedDate)

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Audit log diff resolvedDate sync vs manual ghi nhầm | TRACKED_FIELDS đã include resolvedDate; sync ghi qua `system-sync` actor — phân biệt được |
| UX không rõ tại sao resolvedDate disabled | Thêm tooltip/hint "Synced from CRM" |
| Phase 03 đã modify UI thực tế thế nào | Verify trước khi revert (đọc git diff) |

## Security Considerations
- Backend lock qua `stripCrmLockedFields` là defense-in-depth (frontend disabled UI có thể bypass)
- RBAC `canWriteLead` đã check ở route level

## Next Steps
- Phase 03: backfill apply data
