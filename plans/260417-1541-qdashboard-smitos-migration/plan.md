---
title: "Migrate Overview page (SummaryCards + KpiTable) sang SMIT OS"
description: "Port Overview tab từ qdashboard (Next.js) sang SMIT OS (Express + React) — chỉ SummaryCards và KpiTable, kèm FB Sync. Sau khi migrate sẽ xoá qdashboard."
status: in_progress
priority: P1
effort: 14d
branch: main
tags: [migration, dashboard, prisma, express, react, facebook-ads]
created: 2026-04-17
---

# Plan tổng quan

Migrate trang Overview của qdashboard (Next.js App Router) sang SMIT OS stack (Express.js backend + React frontend + PostgreSQL + Prisma). **CHỈ** lấy phần `SummaryCards` và `KpiTable`, **KHÔNG** mang theo Cohort/Charts. Logic tính toán giữ nguyên 100% — đổi chỉ runtime/route layer.

## Phạm vi

| In scope | Out of scope |
|---|---|
| `SummaryCards` (Revenue / AdSpend / Signups / ROAS + trend) | `CohortFunnelMatrix`, `CohortFunnelMatrixSLG` |
| `KpiTable` (daily breakdown, sortable, Top/Step rate) | Funnel chart, Lead Velocity chart |
| FB Sync service (Facebook Ads → Postgres) | NextAuth, soft delete middleware |
| Logic `getSummaryMetrics`, `getKpiMetrics`, MQL tier, currency conversion | Cohort attribution queries |
| Express REST routes thay thế Next.js route handlers | API quản trị (settings, fb-account CRUD) |

**Sau khi migrate xong → XOÁ qdashboard repo.**

## Ràng buộc kỹ thuật

- **CRM database**: external (read-only), schema PeerDB sync. SMIT OS chỉ connect, KHÔNG migrate models.
- **Main database**: PostgreSQL của SMIT OS — tạo MỚI 4 bảng FB Ads (`fb_ad_account_config`, `raw_ads_facebook`, `exchange_rate_settings`, `etl_error_log`).
- **Multi-Prisma**: 2 client riêng, output paths khác nhau (`@prisma/client` cho main, `@prisma/client-crm` cho CRM).
- **Port deploy**: 3000, domain `qdashboard.smitbox.com`.
- **Token encryption**: dùng env `NEXTAUTH_SECRET` (rename → `APP_SECRET` trong SMIT OS) cho AES-256.

## Phases

| # | Phase | Effort | Status | File |
|---|---|---|---|---|
| 1 | Database setup (Prisma multi-schema + migrations) | 3d | done | [phase-01-database-setup.md](./phase-01-database-setup.md) |
| 2 | Backend services (overview, fb-sync, currency) | 4d | done | [phase-02-backend-services.md](./phase-02-backend-services.md) |
| 3 | Express API routes + Zod validation | 2d | done | [phase-03-express-api-routes.md](./phase-03-express-api-routes.md) |
| 4 | React components (SummaryCards + KpiTable + DateRange) | 3d | done | [phase-04-react-components.md](./phase-04-react-components.md) |
| 5 | Testing, polish, deploy port 3005 | 2d | in_progress | [phase-05-testing-polish.md](./phase-05-testing-polish.md) |

## Dependencies

- Phase 2 cần Phase 1 (Prisma client generated)
- Phase 3 cần Phase 2 (services exported)
- Phase 4 cần Phase 3 (API endpoints stable)
- Phase 5 chạy sau cùng

## Source references

- Research Express+Prisma: `research/researcher-01-express-prisma.md`
- Research React dashboard: `research/researcher-02-react-dashboard.md`
- Source qdashboard (sẽ xoá sau migrate):
  - `src/services/dashboard/overview.service.ts` (1309 lines)
  - `src/services/facebook/fb-sync.service.ts` (210 lines)
  - `src/lib/currency-converter.ts`, `src/lib/db.ts`, `src/lib/crm-db.ts`
  - `src/components/dashboard/overview/SummaryCards.tsx`, `KpiTable.tsx`, `kpi-table-row.tsx`, `kpi-table-utils.ts`, `kpi-table-sortable-header.tsx`
  - `src/types/dashboard/overview.types.ts`

## Definition of Done

- [ ] SMIT OS hiển thị `SummaryCards` với 4 metrics + trend đúng số liệu CRM
- [ ] `KpiTable` daily breakdown sort được, Top/Step toggle hoạt động
- [ ] FB Sync trigger qua POST `/api/sync/facebook-ads` ghi `raw_ads_facebook`
- [ ] Currency conversion USD→VND dùng `exchange_rate_settings`
- [ ] Tests pass (unit cho service helpers, integration cho 1 endpoint)
- [ ] Deploy port 3000, verify trên `qdashboard.smitbox.com`
- [ ] qdashboard repo archived/removed

## Validation Summary

**Validated:** 2026-04-17  
**Questions asked:** 5

### Confirmed Decisions

| Topic | Decision | Impact |
|-------|----------|--------|
| Prisma setup | SMIT OS đã có Prisma → merge schemas vào existing setup | Phase 1 cần review existing schema trước |
| Auth cho sync endpoint | `/api/sync/facebook-ads` cần admin auth middleware | Phase 3 thêm auth guard |
| FB Ads data source | Sync fresh từ Facebook API, không export từ qdashboard | Phase 2 FB sync service critical |
| Cron mechanism | node-cron in-process | Phase 2 thêm cron setup trong Express |
| UI components | Tạo mới từ đầu (SMIT OS chưa có design system) | Phase 4 effort tăng, cần Tailwind/shadcn |

### Action Items

- [ ] Phase 1: Review existing Prisma schema trong SMIT OS trước khi merge
- [ ] Phase 2: Add node-cron dependency + setup schedule job
- [ ] Phase 3: Implement admin auth middleware cho sync routes
- [ ] Phase 4: Setup Tailwind/shadcn nếu chưa có trong SMIT OS
