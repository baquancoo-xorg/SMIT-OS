---
title: "LeadLogs — Modal UX & Delete Permission System"
status: completed
createdAt: 2026-04-22
completedAt: 2026-04-24
blockedBy: []
blocks: []
---

# LeadLogs — Modal UX & Delete Permission System

> Refactor bảng LeadLogs: thay toàn bộ inline edit + pending rows bằng modal dialog; thêm hệ thống phân quyền xoá (Admin/Leader xoá trực tiếp, Member gửi yêu cầu xoá chờ duyệt).

## Context

- Brainstorm: cuộc hội thoại brainstorm ngày 2026-04-22
- Stack: Express 5 + Prisma + React 19 + TailwindCSS v4
- Auth: JWT httpOnly cookie → `req.user.{userId, role, isAdmin, departments}`
- RBAC middleware: `server/middleware/rbac.middleware.ts`

## Phases

| # | Phase | Status |
|---|-------|--------|
| 1 | [Schema Migration](phase-01-schema-migration.md) | pending |
| 2 | [Backend API](phase-02-backend-api.md) | pending |
| 3 | [Frontend Types & API Client](phase-03-frontend-types-api.md) | pending |
| 4 | [LeadLogDialog Component](phase-04-lead-log-dialog.md) | pending |
| 5 | [Refactor LeadLogsTab](phase-05-refactor-lead-logs-tab.md) | pending |

## Key Decisions

- **Delete request**: 2 fields trên `Lead` model (`deleteRequestedBy`, `deleteRequestedAt`) — không tạo model riêng, đủ KISS
- **Leader Sale check**: `role === 'Leader' && departments.includes('Sale')` → xoá được
- **Paste từ clipboard**: GIỮ NGUYÊN — chỉ xoá pending rows thủ công, paste vẫn dùng pending flow
- **Bulk delete**: cập nhật permission check theo role

## Completion Note

- Hoàn tất về mặt codebase: modal dialog, delete permission flow, frontend/backend wiring đã hiện diện trong repo.
- Bug focus/caret phát sinh sau đó được theo dõi riêng tại plan `260424-1457-lead-log-dialog-focus-caret-fix`.

## Files Affected

```
prisma/schema.prisma
server/routes/lead.routes.ts
src/types/index.ts
src/lib/api.ts
src/components/lead-tracker/lead-logs-tab.tsx       ← refactor lớn
src/components/lead-tracker/lead-log-dialog.tsx     ← file mới
```
