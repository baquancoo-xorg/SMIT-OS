---
status: complete
blockedBy: []
blocks: []
---

# Lead Performance Tracker

## Overview

Thêm module CRM vào SMIT OS để theo dõi hiệu suất xử lý Lead hàng ngày cho Sales team. Thay thế hoàn toàn Excel bằng dữ liệu persist trong PostgreSQL.

## Phases

| Phase | File | Status |
|-------|------|--------|
| [Phase 01 - Prisma Schema & Migration](phase-01-prisma-schema.md) | `prisma/schema.prisma` | ✅ complete |
| [Phase 02 - Backend API](phase-02-backend-api.md) | `server/routes/lead.routes.ts`, `server/schemas/lead.schema.ts`, `server.ts` | ✅ complete |
| [Phase 03 - Frontend Components](phase-03-frontend-components.md) | `src/components/lead-tracker/`, `src/types/index.ts`, `src/lib/api.ts` | ✅ complete |
| [Phase 04 - Page & Sidebar Integration](phase-04-page-sidebar-integration.md) | `src/pages/LeadTracker.tsx`, `src/components/layout/Sidebar.tsx`, `src/App.tsx` | ✅ complete |

## Key Dependencies

- Phase 02 phụ thuộc Phase 01 (cần model Lead trong Prisma)
- Phase 03 phụ thuộc Phase 02 (cần API endpoints)
- Phase 04 phụ thuộc Phase 03 (cần components)

## Source Context

- Brainstorm report: `plans/reports/brainstorm-260420-1309-lead-tracker.md`
- Excel source: `docs/BẢNG THEO DÕI HIỆU SUẤT XỬ LÝ LEAD HÀNG NGÀY.xlsx`
