# Phase 05 — Backfill & Validate

## Context Links
- Brainstorm § 4 (Implementation Phases): [brainstorm-260429-1048-lead-sync-refactor-and-ae-fix.md](../reports/brainstorm-260429-1048-lead-sync-refactor-and-ae-fix.md)
- Sync service: `server/services/lead-sync/crm-lead-sync.service.ts`
- Sync route: `server/routes/lead-sync.routes.ts` (kiểm tra path thực tế)

## Overview
- **Priority:** P1
- **Status:** pending
- **Effort:** ~30m
- Sau khi phases 1-3 merge, trigger backfill sync để repopulate AE name + notes cho 333 lead Unmapped. Validate UI + DB.

## Key Insights
- `syncLeadsFromCrm` hỗ trợ mode `'backfill'` với `from`/`to` override (line 12-16, 164-165 in service)
- Backfill từ `CUTOFF_2026_04_01 = 2026-04-01` → today để cover toàn bộ 333 lead
- Sync sẽ skip lead có `deleteRequestedAt` (line 210-212) — an toàn

## Requirements
- Backfill chạy không lỗi
- Sau backfill: `Lead.ae` không còn 'Unmapped'
- `Lead.notes` có timeline format từ CRM
- `Lead.resolvedDate` không bị động đến (phase 03 đã loại)
- UI Lead Logs hiển thị đúng

## Architecture
```
Trigger backfill → syncLeadsFromCrm({ mode: 'backfill', from: 2026-04-01, to: now })
  ├─ Loop 333 subscribers
  ├─ Each: load employeeMap (from CRM smit_employee) + notesMap (from crm_activities)
  ├─ Update Lead row: customerName, ae, receivedDate, status, notes
  └─ Skip resolvedDate (không trong CRM_OWNED_FIELDS nữa)
```

## Related Code Files
**No modification — chỉ trigger + validate**

**Read:**
- `server/services/lead-sync/crm-lead-sync.service.ts:135-330` (syncLeadsFromCrm)
- Server route trigger sync (grep `syncLeadsFromCrm` để tìm endpoint)

## Implementation Steps
1. Locate sync trigger endpoint:
   ```bash
   grep -rn "syncLeadsFromCrm" /Users/dominium/Documents/Project/SMIT-OS/server
   ```
2. Trigger backfill qua API (auth required):
   ```bash
   curl -X POST http://localhost:3000/api/lead-sync/run \
     -H "Authorization: Bearer <admin-token>" \
     -H "Content-Type: application/json" \
     -d '{"mode": "backfill", "from": "2026-04-01T00:00:00+07:00"}'
   ```
   *(URL/payload cụ thể tuỳ implementation hiện tại — verify)*
3. Đợi sync run → check response `{ runId, status, leadsCreated, leadsUpdated, errors }`
4. Validate DB:
   ```sql
   -- Expect 0
   SELECT COUNT(*) FROM "Lead" WHERE ae = 'Unmapped' AND "syncedFromCrm" = true;

   -- Expect 4 distinct names
   SELECT DISTINCT ae FROM "Lead" WHERE "syncedFromCrm" = true ORDER BY ae;

   -- Sample notes
   SELECT id, ae, LEFT(notes, 200) FROM "Lead" WHERE notes IS NOT NULL AND notes != '' LIMIT 5;
   ```
5. Validate UI:
   - Mở Lead Tracker → Lead Logs
   - Filter date range bao gồm 2026-04 → 2026-04-29
   - Spot check 5 lead random:
     - AE column: tên thật (Phương Linh / Kim Huệ / Hồng Nhung / Duy Linh)
     - Notes column: timeline format `[YYYY-MM-DD HH:mm] title: details`
     - SLA badge: On-time/Overdue/Closed đúng
     - Resolved column: editable qua dialog (test 1 lead)
6. Check sync log: `prisma.leadSyncRun.findFirst({orderBy: {startedAt: 'desc'}})` — confirm `errors` empty hoặc acceptable

## Todo List
- [ ] Locate sync trigger endpoint
- [ ] Trigger backfill via API (admin auth)
- [ ] Verify run status = 'success' hoặc 'success_with_errors'
- [ ] DB query: count Unmapped → expect 0
- [ ] DB query: distinct AE names → expect 4
- [ ] DB query: sample notes content
- [ ] UI spot check 5 leads (AE, notes, SLA, resolved)
- [ ] Test edit resolvedDate qua dialog (synced lead)
- [ ] Test edit notes/leadType/unqualifiedType (local-only fields vẫn editable)
- [ ] Document kết quả backfill (run ID, counts, errors)

## Success Criteria
- Backfill run completes status='success' (errors empty acceptable hoặc <5%)
- 0 leads với `ae='Unmapped'` (synced lead)
- ≥80% synced leads có notes content (chỉ lead có CRM activity mới có note)
- 5 spot-checked leads UI hiển thị đúng
- Sale edit resolvedDate trên synced lead thành công

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Backfill timeout với 333 lead × 50 batch | Service có retry/error log; nếu timeout, chạy lại (idempotent) |
| Một số `employee_id_modified` trong CRM không có row tương ứng trong `smit_employee` | Fallback `CRM-emp-{id}` — vẫn không 'Unmapped' |
| Note content có ký tự đặc biệt phá UI render | React tự escape; nếu phát sinh issue → fix riêng |
| API endpoint backfill chưa hỗ trợ `from`/`to` query | Check endpoint signature; fallback: chạy `mode='manual'` (sẽ pickup last successful run, nếu chưa có → từ CUTOFF_2026_04_01) |

## Security Considerations
- Backfill là admin-only operation
- Verify endpoint có RBAC check (Admin role)
- Audit log: backfill ghi `LeadAuditLog` với `actorUserId='system-sync'` (đã có trong service)

## Next Steps
- Sau backfill thành công → close plan, archive
- Nếu phát hiện edge case → tạo follow-up plan
- Monitor sync runs trong 1 tuần để confirm stable
