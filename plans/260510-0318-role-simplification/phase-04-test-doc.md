# Phase 04 — Test + Documentation

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Dependencies: Phase 1, 2, 3 done

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P1 |
| Effort | 0.5 ngày |
| Status | ✅ completed (2026-05-10) |

Final verification + cập nhật `docs/system-architecture.md` cho RBAC mới. Đảm bảo không còn Leader sót trong codebase và 2 persona test pass.

## Implementation Steps

1. **Final grep**:
   ```bash
   grep -rn "Leader" server/ src/ prisma/ \
     | grep -v "node_modules\|.test\|leader-board\|LeaderBoard"
   ```
   Kỳ vọng = 0 dòng nghiệp vụ. Nếu còn → bổ sung refactor.

2. **E2E test 2 personas**:
   - Admin: full access (Lead manage, OKR edit, daily/weekly report admin actions, settings)
   - Member: chỉ self-service (own daily report, own weekly checkin, view own data)
   - Test 4 routes Leader-gated cũ: gate đã chuyển đúng theo decision table

3. **API smoke test**:
   ```bash
   # Login Admin → call protected endpoint → 200
   # Login Member → call admin endpoint → 403
   # Login Member → call self endpoint → 200
   ```

4. **Update `docs/system-architecture.md`**:
   - Section "Authorization": chỉ còn 2 role
   - Bỏ note Leader
   - Document quyết định RBAC mới

5. **Update `docs/project-changelog.md`**:
   ```markdown
   ## 2026-05-10
   ### Changed
   - **BREAKING**: Role simplified to Admin + Member. Leader role removed.
     All Leader users demoted to Member. See plan 260510-0318.
   ```

6. **Sanity check production migration** (sau khi deploy):
   ```sql
   SELECT role, COUNT(*) FROM "User" GROUP BY role;
   -- Expect: chỉ Admin và Member
   ```

7. **Communicate** với team Member mới (cũ là Leader) về thay đổi nếu cần.

## Todo List

- [ ] Final grep `Leader` = 0
- [ ] E2E test Admin persona
- [ ] E2E test Member persona
- [ ] API smoke test 4 routes cũ
- [ ] Update `system-architecture.md`
- [ ] Update `project-changelog.md`
- [ ] Production migration verify
- [ ] Communicate (user task)

## Success Criteria

- [ ] `grep -rn "Leader" ...` = 0 nghiệp vụ
- [ ] Admin persona: tất cả flow work
- [ ] Member persona: tất cả flow work theo decision table
- [ ] No 403 unexpected, no security hole
- [ ] Docs updated

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| E2E test miss 1 flow → bug prod | 🟡 Medium | Checklist 4 routes Leader cũ + smoke test routes mới của Acquisition |
| Doc không sync với code | 🟢 Low | Step 4-5 trong checklist |
| User Member confused vì mất quyền | 🟡 Medium | Communicate trước, FAQ docs ngắn |

## Security Considerations

- Verify không có route bị mở quá rộng sau refactor (deny-by-default)
- Verify session JWT không leak role cũ (test logout/login lại)

## Next Steps

- Sau khi plan này ship → unblock plan `260510-0237-acquisition-trackers` (Phase 6 RBAC dùng Admin/Member chuẩn)
- Run `/ck:plan:archive` cho plan này khi tất cả phases done
