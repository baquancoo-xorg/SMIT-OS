# Brainstorm — Resolved Date Auto from CRM Activities

**Ngày:** 2026-05-01 00:51
**Trang ảnh hưởng:** Lead Tracker → tab Lead Logs (cột Resolved)
**Reverts:** [Phase 03 của plan 260429-1048](../260429-1048-lead-sync-refactor-and-ae-mapping-fix/phase-03-resolved-date-local-only.md) (đã completed 2026-04-29)

---

## 1. Problem Statement

User đề xuất tự động cập nhật `resolvedDate` thay vì để Sale nhập tay (Phase 03 trước đó). User assumption ban đầu: "DB CRM không lưu thời điểm lead Unqualified".

**Phát hiện qua psql query:** Assumption sai. CRM `crm_activities` ghi đầy đủ:
```
title: "đã thay đổi trạng thái từ MQL - Đang liên hệ sang MQL - Unqualified (subscriber)"
action: 'change_status_subscriber'
created_at: 2026-04-29 08:46:28.413613+00
```

→ Source of truth có sẵn, chính xác đến mili-giây.

---

## 2. Decisions (User confirmed)

| Topic | Decision |
|---|---|
| Approach | **B — Restore `derive-resolved-date.ts`** (auto thuần, Sale mất quyền nhập tay) |
| Override rule | Sync luôn ghi đè (B thuần) |
| Cron frequency | Giữ nguyên `*/10 * * * *` |
| Migration data Sale đã nhập | Chấp nhận bị ghi đè bởi sync |

---

## 3. Approaches Evaluated

### A. User's idea — Sync timestamp proxy
- Detect transition trong sync; sync time = resolvedDate
- ❌ Lệch ~10 phút (theo cron)
- ❌ Code phức tạp (state-aware diff)
- ❌ Initial sync lead Closed cần fallback
- ❌ "Chế lại" khi CRM đã có ground truth

### B. ✅ Restore `derive-resolved-date.ts` (RECOMMENDED + CHOSEN)
- Query `crm_activities` action='change_status_subscriber' → `created_at`
- Chính xác 100%, không lệch
- Code đã từng tồn tại (Phase 03 mới xoá) → restore từ git history
- Sale mất quyền nhập tay → đơn giản

### C. Hybrid B + Sale override
- Sync auto fill, Sale edit takes precedence
- Linh hoạt nhưng cần thêm flag `resolvedDateManual`
- User KHÔNG chọn → bỏ

---

## 4. Final Solution (Approach B)

### 4.1 Code restore
1. Restore file `server/services/lead-sync/derive-resolved-date.ts`:
   ```ts
   // Logic cũ — đã verified trong git history
   loadResolvedDateMap(crmSubIds[]) → Map<bigint, Date>
     Query crm_activities:
       WHERE subscriber_id IN (...)
         AND action = 'change_status_subscriber'
         AND PEERDB_IS_DELETED = false
       ORDER BY subscriber_id ASC, created_at DESC
     → Lấy created_at đầu tiên (latest) cho mỗi subscriber
   ```

2. Re-add `'resolvedDate'` vào `CRM_OWNED_FIELDS` (`constants.ts`):
   ```ts
   export const CRM_OWNED_FIELDS = [
     'customerName', 'ae', 'receivedDate', 'resolvedDate', 'status', 'notes',
   ] as const;
   ```

3. Re-integrate trong `crm-lead-sync.service.ts`:
   - Import `loadResolvedDateMap`
   - Filter sub có mapped status ∈ {Q, UQ}, batch query
   - `mapLeadPayload` return `resolvedDate`
   - `prisma.lead.create/update` ghi `resolvedDate`

4. Lock UI edit `lead.routes.ts` UPDATE:
   - Revert thay đổi Phase 03: resolvedDate trở lại trong `stripCrmLockedFields`
   - Synced lead → Sale không edit được resolvedDate

5. UI dialog `lead-log-dialog.tsx`:
   - Disable input resolvedDate khi `lead.syncedFromCrm === true`
   - Local-only lead vẫn cho nhập

### 4.2 Backfill
- Trigger manual sync → toàn bộ lead Q/UQ được fill resolvedDate đúng từ activity log
- Lead Open: resolvedDate vẫn null (đúng)

### 4.3 Logic justification
Status hiện tại của lead = Q/UQ ⟹ latest `change_status_subscriber` activity phải là transition đến status đó (CRM business logic). Code cũ đúng cho 100% main flow.

Edge case (lead có status transition phức tạp như Q → Open → Q): latest activity timestamp = thời điểm Q gần nhất → đúng nghiệp vụ.

---

## 5. Implementation Phases

| # | Phase | Files | Effort |
|---|---|---|---|
| 1 | Restore derive-resolved-date.ts + sync integration | `derive-resolved-date.ts` (new), `constants.ts`, `crm-lead-sync.service.ts` | 20m |
| 2 | Lock UI edit cho synced lead | `lead.routes.ts`, `lead-log-dialog.tsx` | 15m |
| 3 | Backfill + validate | manual via API | 10m |

**Total:** ~45m

---

## 6. Risks & Mitigations

| # | Risk | Mitigation |
|---|---|---|
| 1 | Sale đã nhập resolvedDate sau Phase 03 → ghi đè khi sync | User chấp nhận (B thuần) |
| 2 | PEERDB delay activity log → resolvedDate trễ vài giây | Acceptable (vẫn chính xác hơn proxy) |
| 3 | Lead Open có activity history (transition phức tạp) | Code skip query khi status không phải Q/UQ → null đúng |
| 4 | UI dialog Phase 03 đã enable input → cần disable lại | Cần verify code Phase 03 thực tế đã modify gì |

---

## 7. Success Criteria

- [ ] Tất cả lead synced có `status ∈ {Qualified, Unqualified}` đều có `resolvedDate != null` sau backfill
- [ ] `resolvedDate` khớp với CRM activity log (spot check 5 lead)
- [ ] Sale không edit được `resolvedDate` qua dialog cho synced lead (UI disabled)
- [ ] Sale vẫn edit được `resolvedDate` cho local-only lead (`syncedFromCrm=false`)
- [ ] Cron sync chạy 10 phút/lần không lỗi
- [ ] Lead Open có `resolvedDate = null`

---

## 8. Validation Plan

**SQL spot check:**
```sql
-- Tất cả Q/UQ lead có resolvedDate
SELECT COUNT(*) FROM "Lead"
WHERE status IN ('Qualified', 'Unqualified')
  AND "syncedFromCrm" = true
  AND "resolvedDate" IS NULL;
-- Expect: 0

-- So sánh với CRM activity
SELECT l.id, l."resolvedDate", l.status
FROM "Lead" l
WHERE l."syncedFromCrm" = true
  AND l.status IN ('Qualified', 'Unqualified')
LIMIT 5;
-- Cross-check với CRM crm_activities.created_at (manual)
```

**UI test:**
- Edit synced Q/UQ lead → resolvedDate input disabled
- Edit local lead → resolvedDate input editable

---

## 9. Open Questions

- Có cần migration script để clear `resolvedDate` cũ trước backfill không? (Đề xuất: KHÔNG — sync sẽ tự ghi đè)
- Audit log có nên log thay đổi resolvedDate do sync không? (Hiện đã có via `LeadAuditLog` actor `system-sync`)
