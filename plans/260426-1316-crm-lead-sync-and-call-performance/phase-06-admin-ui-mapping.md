# Phase 06 — Admin UI for Mapping (DEFERRED)

## Context Links
- Parent: [plan.md](plan.md)
- Brainstorm §7 (Open Questions): [brainstorm-260426-1316-crm-lead-sync-and-call-performance.md](../reports/brainstorm-260426-1316-crm-lead-sync-and-call-performance.md)
- Depends on: phase-01 (schema), phase-02 (status mapper)

## Overview
- **Date:** 2026-04-26
- **Priority:** P3 (DEFERRED — không blocker cho launch phase 1-5)
- **Status:** deferred
- **Review:** N/A
- **Description:** Trang Admin Settings cho phép quản lý `LeadStatusMapping` CRUD và assign `User.crmEmployeeId`. Brief outline only — sẽ refine khi user yêu cầu chính thức.

## Key Insights
- Phase 1-5 launch được mà không cần phase này (seed scripts đủ ban đầu)
- Cần khi: CRM thêm status mới, hoặc thường xuyên onboard AE mới
- "Unmapped (CRM ID: X)" rows trên Call Performance dashboard chính là pain point thúc đẩy phase này

## Requirements (Brief)

### Lead Status Mapping CRUD
- Trang `Admin → Settings → CRM Mappings`
- Table list `LeadStatusMapping` (crmStatus, smitStatus, active)
- Inline edit `smitStatus`/`active`; delete (with confirm)
- "Add new mapping" button → modal với crmStatus dropdown (load distinct CRM statuses) + smitStatus enum picker

### User CRM Employee ID Assignment
- Trang `Admin → Users` (existing? hoặc new)
- Per-user edit: input `crmEmployeeId` (Int) + lookup helper "Find by CRM AE name"
- Auto-suggest từ CRM `crm_call_history.employee_user_id` distinct values chưa map
- Validation: `crmEmployeeId` unique, integer

### "Unmapped CRM Employees" Report
- Widget trong Admin Dashboard hoặc trong phase-05 Call Performance section header
- List CRM employee_user_id appearing trong `crm_call_history` nhưng chưa map → CTA "Assign to user"

## Architecture (Outline)

```
src/pages/admin/
├── crm-mappings.tsx                       (LeadStatusMapping CRUD)
├── user-crm-employee-mapping.tsx          (User.crmEmployeeId assign)
└── unmapped-crm-employees-widget.tsx      (audit widget)

server/routes/admin/
├── lead-status-mapping.routes.ts          (GET/POST/PUT/DELETE)
└── user-crm-employee.routes.ts            (PUT /api/admin/users/:id/crm-employee-id)

server/services/admin/
└── unmapped-crm-employees.service.ts      (DISTINCT employee_user_id NOT IN User.crmEmployeeId)
```

## Related Code Files (Outline)

### Create
- ~10 frontend + backend files (chi tiết khi activate phase)

### Modify
- Routing config (sidebar/menu)
- Admin permission middleware

## Implementation Steps (Outline)

1. Define route + permission (Admin only)
2. Build CRUD endpoints cho `LeadStatusMapping`
3. Build assign endpoint cho `User.crmEmployeeId`
4. Build "unmapped employees" service
5. Build 3 frontend pages/widgets
6. Integration test với phase-02 sync (verify mapping changes take effect on next sync)

## Todo List (Brief)

- [ ] Define detailed UI mockups
- [ ] Spec API contracts
- [ ] Confirm permission scope (Admin vs Leader Sales)
- [ ] Implement (when activated)

## Success Criteria (When Implemented)
- Admin có thể add/edit/delete status mappings
- Admin có thể assign CRM ID cho user trong UI
- Unmapped CRM employees widget chính xác và actionable
- Sau khi map thêm: cron sync tiếp theo pick up changes (cache invalidation)

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Cache stale sau khi admin update mapping | Medium | Invalidate cache khi mapping change (event hoặc TTL ngắn) |
| Admin delete active mapping → next sync broken | High | Soft delete (active=false) thay vì hard delete; warn user |
| `crmEmployeeId` collision (cùng ID gán 2 user) | High | DB unique constraint đã có ở phase-01 |

## Security Considerations
- Tất cả endpoints PHẢI guard Admin
- Audit log cho mapping changes (who changed what when)
- KHÔNG expose CRM employee data leak (chỉ ID, không full name CRM)

## Next Steps
- Activate phase này khi:
  - User có complaint về "Unmapped" rows
  - Hoặc CRM thêm status mới
  - Hoặc onboard nhiều AE mới
- Trước đó: chạy seed scripts khi cần
