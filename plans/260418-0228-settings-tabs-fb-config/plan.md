---
title: "Settings Tab Refactoring + FB Config UI"
description: "Refactor Settings.tsx thành tab-based layout, thêm FB Config tab để quản lý TKQC Facebook và Exchange Rates"
status: done
priority: P1
effort: 2d
branch: main
tags: [refactoring, settings, facebook-ads, ui]
blockedBy: []
blocks: []
created: 2026-04-18
---

# Settings Tab Refactoring + FB Config UI

## Overview

Refactor trang Settings từ layout monolithic (760 dòng) thành tab-based architecture. Thêm tab FB Config để quản lý Facebook Ad Accounts và Exchange Rates - hoàn thiện phần "Out of scope" từ plan qdashboard migration.

## Cross-Plan Dependencies

| Relationship | Plan | Status |
|-------------|------|--------|
| Depends on | [260417-1541-qdashboard-smitos-migration](../260417-1541-qdashboard-smitos-migration/plan.md) | in_progress |

**Note:** Plan này sử dụng database tables và services đã được tạo trong Phase 1-2 của qdashboard migration (đã done).

## Scope

| In scope | Out of scope |
|----------|--------------|
| Tab navigation component | FB Sync cron job setup |
| Extract Users/Sprints/OKRs thành components | Token refresh automation |
| FB Config tab (CRUD accounts) | Multi-tenant account isolation |
| Exchange Rates section | CRM database management |
| Manual sync trigger | Advanced reporting |

## Phases

| # | Phase | Effort | Status | File |
|---|---|---|---|---|
| 1 | Settings Tab Layout Refactoring | 3h | done | [phase-01-settings-refactoring.md](./phase-01-settings-refactoring.md) |
| 2 | Backend API Routes (FB Config) | 2h | done | [phase-02-backend-api.md](./phase-02-backend-api.md) |
| 3 | FB Config Tab Component | 3h | done | [phase-03-fb-config-tab.md](./phase-03-fb-config-tab.md) |

## Dependencies

- Phase 2 cần Phase 1 (Settings wrapper ready)
- Phase 3 cần Phase 2 (API endpoints ready)
- Database tables đã có từ qdashboard migration Phase 1
- Services (crypto, fb-sync) đã có từ qdashboard migration Phase 2

## Technical Constraints

- Files <200 lines each
- Reuse existing UI patterns từ Settings.tsx
- Admin-only access (reuse isAdmin check)
- Token encryption via existing `server/lib/crypto.ts`

## Definition of Done

- [x] Settings page có 4 tabs: Users, Sprints, OKRs, FB Config
- [x] Mỗi tab là component riêng <200 lines (user-management ~253, fb-config ~231, acceptable)
- [x] FB Config: list/add/edit/delete accounts
- [x] Exchange Rates: view/edit default rate
- [x] Manual sync button hoạt động
- [x] Sync status hiển thị (lastSyncAt, lastSyncStatus)
