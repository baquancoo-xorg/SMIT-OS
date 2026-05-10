# Phase 03 — Refactor Frontend

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Decision table: `reports/leader-audit-260510-0318.md`
- Dependencies: Phase 2 done

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P1 |
| Effort | 0.5 ngày |
| Status | ✅ completed (2026-05-10) |

Refactor 6 frontend files: bỏ Leader option trong UI, đơn giản UI gates còn Admin/Member, sync với backend Phase 2.

## Files to refactor

| File | Action |
|---|---|
| `src/types/index.ts` | Update `Role` type definition |
| `src/components/settings/user-management-tab.tsx` | Bỏ Leader option khỏi role dropdown, hiển thị warning nếu user cũ còn Leader (sau migration thì không còn) |
| `src/components/modals/WeeklyCheckinModal.tsx` | Visibility logic theo decision |
| `src/pages/WeeklyCheckin.tsx` | Leader-gated UI → Admin hoặc all |
| `src/pages/DailySync.tsx` | Tương tự |
| `src/pages/LeadTracker.tsx` (line 18) | `canManageLeads = isAdmin \|\| role.includes('Leader')` → `canManageLeads = isAdmin` |

## Implementation Steps

1. **Update `types/index.ts`**:
   - `type Role = 'admin' | 'member'` (lowercase nhất quán)
   - Remove Leader-related types/enums

2. **`user-management-tab.tsx`**:
   - Role dropdown chỉ còn 2 option: Admin, Member
   - Remove Leader case trong validation/render

3. **Page-level gates** (4 files) — pattern **read-shared, write-own**:

   - **Read gate**: bỏ check Leader → mở cho mọi authenticated user (list endpoints luôn cho phép)
   - **Write gate**: thay bằng `isOwner || isAdmin`:
     ```tsx
     // BEFORE
     const canManageLeads = currentUser?.isAdmin || currentUser?.role?.includes('Leader');

     // AFTER (ownership-based)
     const canEditLead = (lead) =>
       currentUser?.isAdmin || lead.assignedToId === currentUser?.id;
     ```
   - **UI hint**: ẩn/disable edit button khi `!canEditLead(lead)`. KHÔNG dựa vào UI gate cho security — backend Phase 2 mới authoritative.

   Specific cases:
   - `LeadTracker.tsx` line 18: `canEditLead(lead)` per row, KHÔNG global flag
   - `OKRsManagement.tsx`: edit KR button hiện theo `kr.userId === currentUser.id || isAdmin`
   - `WeeklyCheckin.tsx` / `DailySync.tsx`: edit own only (đã pattern, chỉ bỏ Leader override)
   - `MediaTracker.tsx` (Phase 4 acquisition): edit KOL/PR theo `createdById`

4. **Compile check**:
   ```bash
   npm run typecheck  # hoặc tsc --noEmit
   ```

5. **Manual visual test** dev server với 2 persona:
   - Login Admin → thấy mọi UI cũ
   - Login Member (user vừa demote) → đúng quyền theo decision

6. **Commit**: `refactor(ui): drop Leader role from UI gates`

## Todo List

- [ ] Update `types/index.ts`
- [ ] Update `user-management-tab.tsx`
- [ ] Update `WeeklyCheckinModal.tsx`
- [ ] Update `WeeklyCheckin.tsx`
- [ ] Update `DailySync.tsx`
- [ ] Update `LeadTracker.tsx` (line 18)
- [ ] TypeScript compile clean
- [ ] Visual test 2 personas
- [ ] Commit

## Success Criteria

- [ ] `grep -rn "Leader" src/` = 0 nghiệp vụ
- [ ] TypeScript compile clean
- [ ] User management dropdown chỉ còn 2 option
- [ ] Visual test pass cả 2 personas

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| UI không đồng bộ với backend (frontend cho phép, backend reject) | 🟡 Medium | Test 2 personas, follow decision table chặt |
| Bỏ sót 1 component → user thấy tính năng nhưng click 403 | 🟡 Medium | Final grep + Phase 4 e2e |
| Type error rộng do đổi Role type | 🟢 Low | TS sẽ catch hết, fix tuần tự |

## Security Considerations

- Frontend gate là UX hint, không phải security boundary → backend Phase 2 mới là authoritative
- Member không nên thấy admin actions trong UI (UX clean)

## Next Steps

- Phase 4: Test + Doc
