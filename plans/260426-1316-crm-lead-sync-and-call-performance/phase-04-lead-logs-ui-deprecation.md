# Phase 04 — Lead Logs UI Deprecation & Sync Controls

## Context Links
- Parent: [plan.md](plan.md)
- Brainstorm §4.3: [brainstorm-260426-1316-crm-lead-sync-and-call-performance.md](../reports/brainstorm-260426-1316-crm-lead-sync-and-call-performance.md)
- Depends on: phase-02 (sync API)
- Existing: `src/pages/LeadTracker.tsx`, `src/components/lead-tracker/*`

## Overview
- **Date:** 2026-04-26
- **Priority:** P1
- **Status:** pending
- **Review:** pending
- **Description:** Disable manual lead create (Add Lead + Bulk Paste), thêm "Sync from CRM" button (Admin only), badge nguồn, disable edit CRM-owned fields.

## Key Insights
- Lead Logs hiện cho phép paste Excel (TSV) + create lead manually → cần xoá hoàn toàn (decision #10)
- Field protection ở UI: edit modal disable customerName/receivedDate/status/ae khi `syncedFromCrm=true`
- Legacy leads (chưa link CRM, `syncedFromCrm=false`) vẫn cho edit toàn bộ field (backward compat)
- "Sync from CRM" button hiển thị status (running/success/failed) + last sync time
- Bulk edit: chỉ cho `notes`/`leadType`/`unqualifiedType` (SMIT-only fields)

## Requirements

### Functional
- Loại bỏ entry point "Add Lead" + "Bulk Paste" khỏi `LeadTracker` page
- Hiển thị "Sync from CRM" button (Admin only) — click trigger `POST /api/leads/sync-now`
- Hiển thị "Last synced: 2 min ago" indicator (fetch `GET /api/leads/sync-status` mỗi 30s)
- Add badge column "Source": `CRM` (icon) cho `syncedFromCrm=true`, `Manual` cho legacy
- Edit modal cho lead `syncedFromCrm=true`: disable customerName/receivedDate/status/ae fields với tooltip "Synced from CRM"
- Bulk action bar: chỉ enable `bulk edit notes/leadType/unqualifiedType`; disable bulk edit status/ae
- Resolved Date column: read-only display, không có inline edit

### Non-functional
- Sync indicator polling không spam server (30s interval, pause khi tab hidden)
- Disabled fields có visual cue rõ ràng (greyed + tooltip)
- Toast notification khi sync trigger / complete

## Architecture

```
src/pages/LeadTracker.tsx
└─ <LeadLogsTab>
   ├─ Header: <SyncFromCrmButton> (admin) + <LastSyncIndicator>
   ├─ <LeadLogsTable>
   │  ├─ NEW column: Source badge (CRM | Manual)
   │  └─ Existing columns
   ├─ <BulkActionBar> (modified — restrict to SMIT-only fields)
   └─ <LeadLogDialog> (modified — conditional disable based on syncedFromCrm)

src/hooks/useLeadSync.ts
├─ useSyncNow() → mutation
└─ useSyncStatus() → query (30s polling)
```

## Related Code Files

### Modify
- `src/pages/LeadTracker.tsx` — remove "Add Lead" button entry point + remove paste modal trigger
- `src/components/lead-tracker/lead-logs-tab.tsx` — remove paste/add buttons, add sync controls + badge column
- `src/components/lead-tracker/lead-log-dialog.tsx` — add conditional disable logic dựa vào `lead.syncedFromCrm`
- `src/components/lead-tracker/bulk-action-bar.tsx` — restrict bulk edit options to SMIT-only fields
- `src/types/lead.ts` (or wherever Lead type defined) — add `crmSubscriberId`, `syncedFromCrm`, `lastSyncedAt`

### Create
- `src/hooks/useLeadSync.ts` — TanStack Query / SWR hooks
- `src/components/lead-tracker/sync-from-crm-button.tsx`
- `src/components/lead-tracker/last-sync-indicator.tsx`
- `src/components/lead-tracker/source-badge.tsx`

### Delete
- (none — tạm giữ paste logic file để phòng cần revert; chỉ xoá entry point)

## Implementation Steps

1. Update `Lead` type in `src/types/` (or `src/types/lead.ts`) to include 3 new fields.
2. Create `src/hooks/useLeadSync.ts`:
   ```typescript
   useSyncNowMutation() // POST /api/leads/sync-now
   useSyncStatusQuery() // GET /api/leads/sync-status, refetchInterval: 30_000
   ```
3. Create `src/components/lead-tracker/sync-from-crm-button.tsx`:
   - Show only when `user.isAdmin`
   - Button text: "Sync from CRM" + spinner khi đang sync
   - Disabled khi `syncStatus.status === 'running'`
   - Toast on success/error
4. Create `src/components/lead-tracker/last-sync-indicator.tsx`:
   - Display "Last synced: {relative time}" (use `dayjs.fromNow()`)
   - Color: green (success recent), yellow (> 30 min ago), red (failed)
5. Create `src/components/lead-tracker/source-badge.tsx`:
   - Compact badge: "CRM" (icon link/database) hoặc "Manual" (icon user)
6. Modify `lead-logs-tab.tsx`:
   - Remove "Add Lead" button + handler
   - Remove "Bulk Paste" button + Excel paste handler
   - Add `<SyncFromCrmButton />` + `<LastSyncIndicator />` in header
   - Add Source column với `<SourceBadge synced={row.syncedFromCrm} />`
7. Modify `lead-log-dialog.tsx`:
   - Compute `isCrmLocked = lead?.syncedFromCrm ?? false`
   - For each CRM-owned field input: `disabled={isCrmLocked}` + Tooltip "Field synced from CRM"
   - Resolved Date: always disabled (auto from CRM)
8. Modify `bulk-action-bar.tsx`:
   - Remove bulk options: status, ae
   - Keep: notes, leadType, unqualifiedType
   - Show note: "Bulk operations limited to SMIT-only fields (notes, type, UQ reason)"
9. Test scenarios:
   - Admin sees sync button, regular AE doesn't
   - Click sync → toast + last-sync indicator updates
   - Edit CRM-synced lead → CRM-owned fields disabled
   - Edit legacy manual lead (syncedFromCrm=false) → all fields editable (backward compat)
   - Bulk edit on synced leads → only SMIT-only options visible
10. Visual QA: badges render correctly, tooltips work, polling pauses when tab hidden.

## Todo List

- [ ] Update `Lead` type (3 new fields)
- [ ] Create `useLeadSync.ts` hooks
- [ ] Create `sync-from-crm-button.tsx`
- [ ] Create `last-sync-indicator.tsx`
- [ ] Create `source-badge.tsx`
- [ ] Modify `lead-logs-tab.tsx`: remove Add/Paste, add sync controls + badge col
- [ ] Modify `lead-log-dialog.tsx`: conditional field disable
- [ ] Modify `bulk-action-bar.tsx`: restrict to SMIT-only fields
- [ ] Pause polling on tab hidden (use `document.visibilityState`)
- [ ] Test admin vs non-admin visibility
- [ ] Test CRM-locked lead edit modal
- [ ] Test legacy lead edit modal (still fully editable)
- [ ] Test bulk edit options
- [ ] Visual QA on tooltip + badge
- [ ] Verify dev server hot-reload, manual browser test

## Success Criteria
- AE không tìm thấy "Add Lead" hoặc "Bulk Paste" UI nào
- Admin thấy button "Sync from CRM" + indicator real-time
- Edit modal cho CRM lead: 4 fields locked, 3 fields edit được
- Bulk edit: chỉ 3 SMIT-only options
- Source badge hiển thị đúng cho mọi row
- Polling không spam: 30s interval, pause khi tab inactive
- Edit notes của 1 lead → reload → notes giữ nguyên (verify field protection end-to-end)

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Legacy lead (syncedFromCrm=false) nhưng AE muốn edit → bị disable nhầm | Medium | Conditional disable chỉ áp dụng khi `syncedFromCrm=true` |
| Polling spam server khi nhiều admin mở tab | Low | 30s interval đủ thưa; cache shared via TanStack Query |
| User mất chức năng paste Excel (đã quen workflow) → kêu | Medium | Communicate trước; trong UI có thể link tới docs giải thích "Now CRM auto-imports" |
| Race condition: AE edit notes ngay lúc cron chạy | Low | Server-side: cron chỉ update CRM-owned fields, không touch notes; concurrent OK |

## Security Considerations
- "Sync from CRM" button: client-side hide cho non-admin, server-side enforce (đã có ở phase-02)
- Disabled fields ở UI: cosmetic only — server `PUT /api/leads/:id` cũng phải reject update của CRM-owned fields cho synced leads (cần check backend logic, có thể là phase-02 sub-task)
- Tooltip không leak info nhạy cảm

## Next Steps
- Sau merge: monitor user feedback, đảm bảo không có ai stuck workflow
- Phase 05 (call dashboard) độc lập, có thể parallel
- Phase 06 (admin UI for mapping) là deferred
