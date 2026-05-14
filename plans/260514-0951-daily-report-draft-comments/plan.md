---
title: "Daily Report v1.1 — Draft Autosave + Comment Thread"
description: "v5 Daily Sync: localStorage draft per session + threaded comments (owner ↔ admin) với soft delete + notification reuse"
status: completed
priority: P2
effort: 12h
branch: main
tags: [v5, daily-sync, ui, prisma, react-query, notifications]
created: 2026-05-14
---

# Daily Report v1.1 — Plan Overview

## Context
- Brainstorm: [brainstorm-260514-0951-daily-report-draft-comments.md](../reports/brainstorm-260514-0951-daily-report-draft-comments.md)
- Target page: `src/pages/v5/DailySync.tsx` (hiện chỉ re-export → build mới theo pattern `AdsTracker.tsx`)
- UI contract: `docs/ui-design-contract.md` (NO solid orange, radius canon, accent OKLCH, Suspense+Skeleton, light+dark parity)

## Goal
Bổ sung 2 capability vào form báo cáo hàng ngày:
1. **Draft autosave** — localStorage per `userId+date`, debounce 500ms, nút "Lưu nháp" manual, restore banner.
2. **Comment thread** — flat thread trên report cho owner + admin, edit + soft delete, reuse notification system.

## Scope
- ✅ Daily Report v5 page mới + form dialog + detail modal + comment thread
- ✅ Schema mới `DailyReportComment` (flat, FK trực tiếp DailyReport)
- ✅ 4 API endpoints comment CRUD
- ❌ Weekly Report (out of scope)
- ❌ Nested replies, cross-device draft sync
- ❌ Approval flow change (`approvalComment` cũ giữ nguyên)

## Phases

| # | Phase | Status | Effort | File |
|---|-------|--------|--------|------|
| 1 | Schema + Prisma migration | ✅ done | 1h | [phase-01-schema-migration.md](phase-01-schema-migration.md) |
| 2 | Server: comment routes + notifications | ✅ done | 2.5h | [phase-02-server-comment-api.md](phase-02-server-comment-api.md) |
| 3 | Client lib + React Query hooks | ✅ done | 2h | [phase-03-client-lib-hooks.md](phase-03-client-lib-hooks.md) |
| 4 | v5 components (form/detail/thread) | ✅ done | 4h | [phase-04-v5-components.md](phase-04-v5-components.md) |
| 5 | v5 page DailySync (replace re-export) | ✅ done | 1.5h | [phase-05-v5-page-daily-sync.md](phase-05-v5-page-daily-sync.md) |
| 6 | Integration testing + UI compliance | ✅ done | 1h | [phase-06-integration-test.md](phase-06-integration-test.md) |

## Key Dependencies

- Phase 2 depends on Phase 1 (Prisma client types).
- Phase 3 hook `use-daily-report-comments` depends on Phase 2 API contract.
- Phase 4 components depend on Phase 3 hooks + lib.
- Phase 5 page depends on Phase 4 components.
- Phase 6 depends on all.
- Phases 2 ↔ 3 CÓ thể parallel sau Phase 1 (server team / client team độc lập), nhưng linear cũng đủ nhanh.

## Constraints (per CLAUDE.md + ui-design-contract)

- File <200 LOC
- kebab-case file naming
- Primary CTA = dark gradient + orange beam + orange icon (NO solid orange fill)
- Card radius `1.5rem` dark / `0.75rem` light; Input `1rem` / `0.75rem`
- Accent `var(--brand-500)` OKLCH, không hex hardcode
- Data sections bọc `<Suspense fallback={Skeleton}>`
- Light + dark parity

## Success criteria (rollup)

Hoàn thành plan khi:
1. Click outside / reload → mở lại dialog thấy draft prefill + banner restore.
2. Submit → draft tự xóa, ngày mai mở form sạch.
3. Owner + admin có thể comment 2 chiều, edit + soft delete với badge "(đã sửa)".
4. Notification kích hoạt đúng (admin comment → owner; owner reply → admin trong thread).
5. Lint + typecheck pass; mọi file <200 LOC; UI compliance audit pass.
