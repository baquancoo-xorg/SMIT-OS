# Phase 03 — Backfill & Validate

## Context Links
- Brainstorm § 8 (Validation Plan): [brainstorm-260501-0051-resolved-date-auto-from-crm-activities.md](../reports/brainstorm-260501-0051-resolved-date-auto-from-crm-activities.md)
- Sync trigger endpoint: `server/routes/lead-sync.routes.ts`

## Overview
- **Priority:** P1
- **Status:** pending
- **Effort:** ~10m
- Trigger sync mode='backfill' để fill resolvedDate cho toàn bộ Q/UQ lead hiện tại từ CRM activity log.

## Key Insights
- 261 lead Q/UQ trong DB (estimate dựa trên 333 synced - lead Open) — sẽ được fill
- Activity log có 4099 records `change_status_subscriber` → cover đủ
- Sale data nhập sau Phase 03 sẽ bị ghi đè (user accepted)

## Requirements
- Backfill chạy không lỗi
- Spot check 5 lead: resolvedDate khớp activity log timestamp
- Lead Open: resolvedDate vẫn null

## Architecture
```
POST /api/lead-sync/run { mode: 'backfill', from: '2026-04-01' }
  └─ syncLeadsFromCrm
      └─ batch loop:
          ├─ load resolvedDateMap (filter Q/UQ only)
          └─ update Lead.resolvedDate = activity created_at
```

## Related Code Files
**Read only:**
- `server/routes/lead-sync.routes.ts` (trigger endpoint)
- `server/services/lead-sync/crm-lead-sync.service.ts` (sync logic)

## Implementation Steps
1. Verify trigger endpoint:
   ```bash
   grep -n "router.post" server/routes/lead-sync.routes.ts
   ```
2. Trigger backfill:
   ```bash
   curl -X POST http://localhost:3000/api/lead-sync/run \
     -H "Authorization: Bearer <admin-token>" \
     -H "Content-Type: application/json" \
     -d '{"mode": "backfill", "from": "2026-04-01T00:00:00+07:00"}'
   ```
3. Wait completion → check response `{ runId, status, leadsUpdated }`
4. SQL validation:
   ```sql
   -- Q/UQ lead chưa có resolvedDate (expect 0)
   SELECT COUNT(*) FROM "Lead"
   WHERE status IN ('Qualified', 'Unqualified')
     AND "syncedFromCrm" = true
     AND "resolvedDate" IS NULL;

   -- Lead Open có resolvedDate (expect 0 — sync skip)
   SELECT COUNT(*) FROM "Lead"
   WHERE status NOT IN ('Qualified', 'Unqualified')
     AND "syncedFromCrm" = true
     AND "resolvedDate" IS NOT NULL;
   -- Note: > 0 acceptable nếu Sale đã nhập tay từ Phase 03 cho Open lead
   --       (sync chỉ ghi đè cho Q/UQ, không clear cho Open)

   -- Spot check 5 Q/UQ lead
   SELECT id, ae, status, "receivedDate", "resolvedDate"
   FROM "Lead"
   WHERE status IN ('Qualified', 'Unqualified')
     AND "syncedFromCrm" = true
   LIMIT 5;
   ```
5. Cross-check 1 lead với CRM:
   ```sql
   -- Trong CRM
   SELECT created_at FROM crm_activities
   WHERE subscriber_id = <X>
     AND action = 'change_status_subscriber'
   ORDER BY created_at DESC LIMIT 1;
   -- Compare với SMIT-OS Lead.resolvedDate
   ```
6. UI test:
   - Open Lead Tracker → Lead Logs
   - Filter Q/UQ leads
   - Spot check resolvedDate column hiển thị đúng
   - Edit synced Q/UQ lead: resolvedDate input disabled
   - Edit local Q/UQ lead (`syncedFromCrm=false`): resolvedDate input editable

## Todo List
- [ ] Trigger backfill via API
- [ ] Verify run status='success'
- [ ] SQL: count Q/UQ với resolvedDate=null → expect 0
- [ ] SQL: spot check 5 leads
- [ ] Cross-check 1 lead vs CRM activity log
- [ ] UI: synced lead resolvedDate disabled
- [ ] UI: local lead resolvedDate editable
- [ ] Document run result (runId, leadsUpdated count)

## Success Criteria
- Backfill run completes status='success'
- 0 Q/UQ synced lead với resolvedDate=null
- Spot-checked timestamps khớp ±1s với CRM activity log
- UI behavior đúng: disabled/editable theo syncedFromCrm

## Risk Assessment
| Risk | Mitigation |
|---|---|
| PEERDB delay → activity log thiếu một số transitions | Acceptable — chạy sync lần nữa sau 30p |
| Lead có status đặc biệt (lỗi mapping) → resolvedDate null bất ngờ | Check `LeadAuditLog` errors field |
| Sale phàn nàn mất data đã nhập | Đã accept upfront — communicate trước nếu cần |

## Security Considerations
- Backfill admin-only
- Audit log auto-track via `system-sync` actor

## Next Steps
- Close plan, archive
- Monitor cron sync 1 tuần đảm bảo stable
