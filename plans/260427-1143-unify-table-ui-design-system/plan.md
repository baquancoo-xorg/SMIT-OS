---
title: "Unified Table UI Design System Across Product"
description: "Thiết lập 1 chuẩn UI duy nhất cho mọi bảng dữ liệu với 2 biến thể Standard/Dense và rollout 3 phase theo module."
status: completed
priority: P1
effort: 20h
branch: main
tags: [ui, design-system, tables, standardization, dashboard, settings]
created: 2026-04-27
blockedBy: []
blocks: [260426-2346-dashboard-system-refactor-tabs-ui]
---

# Plan: Unified Table UI Design System

## Context Links
- User request + screenshot audit: đồng nhất toàn bộ table UI (font, header, container, spacing, actions, date/time, badge, hover, empty/loading).
- Related completed plan (actions standardization): `../260427-0258-standardize-table-action-ui/plan.md`.
- Related pending plan impacted: `../260426-2346-dashboard-system-refactor-tabs-ui/plan.md`.

## Goal
Thiết kế và áp dụng **một chuẩn Table UI duy nhất** cho toàn bộ dự án, gồm:
1. **Standard Table** cho bảng nghiệp vụ (task/lead/report/settings/workspace).
2. **Dense Table** cho bảng analytics nhiều cột (KPI/call performance/conversion).

Không đổi business logic/API; chỉ chuẩn hóa presentation, interaction shell, và visual consistency.

## Scope
### In scope
- Table shell (container, border, radius, background, sticky header behavior).
- Typography (header/body/meta text scale).
- Spacing (cell paddings, row height, column spacing).
- Action column contract (header bắt buộc, width cố định, right align).
- Date/time display contract (format thống nhất theo loại bảng).
- Badge/chip token mapping.
- Hover/selected/empty/loading visual states.

### Out of scope
- Thay đổi permission model.
- Thay đổi schema/API/data computation.
- Refactor toàn bộ chart/heatmap không phải table.

## UI Contract (Bắt buộc cho mọi table)
1. **Header bắt buộc đầy đủ**: không để cột trống không tiêu đề.
2. **Actions column**: key `actions`, header `Actions`, `text-right`, width cố định theo variant.
3. **Typography**:
   - Header: uppercase, tracking chuẩn, muted color token.
   - Body: text size nhất quán theo variant.
4. **Date/Time**:
   - Standard operational rows: `dd/MM/yyyy - HH:mm` nếu có time, `dd/MM/yyyy` nếu date-only business field.
   - Dense analytics giữ format số liệu hiện có nhưng dùng style token thống nhất.
5. **Badges/Status chips**: dùng token palette chuẩn, không hardcode style rời rạc nếu có thể map về token.
6. **States**: loading/empty/hover/selected có cùng behavior lớp nền và opacity semantics.
7. **Container**: mọi table render trong shell chuẩn (rounded/border/bg/scroll contract), trừ embedded table nơi modal constraints bắt buộc.

## Table Inventory (primary)
- Standard candidates:
  - `src/components/board/TaskTableView.tsx`
  - `src/components/board/ReportTableView.tsx`
  - `src/components/lead-tracker/lead-logs-tab.tsx`
  - `src/pages/ProductBacklog.tsx`
  - `src/pages/DailySync.tsx`
  - `src/components/lead-tracker/daily-stats-tab.tsx`
  - `src/components/settings/user-management-tab.tsx`
  - `src/components/settings/fb-config-tab.tsx`
  - `src/components/settings/sprint-cycles-tab.tsx`
  - `src/components/settings/okr-cycles-tab.tsx`
  - `src/components/modals/ReportDetailDialog.tsx`
  - `src/components/modals/WeeklyCheckinModal.tsx`
  - `src/components/daily-report/components/AdHocTasksSection.tsx`
- Dense candidates:
  - `src/components/dashboard/overview/KpiTable.tsx`
  - `src/components/dashboard/call-performance/call-performance-ae-table.tsx`
  - `src/components/dashboard/call-performance/call-performance-conversion.tsx`

## Phase Overview

| # | Phase | File | Status | Effort |
|---|---|---|---|---|
| 01 | Define table design tokens + shared primitives | [phase-01-table-design-foundation.md](phase-01-table-design-foundation.md) | completed | 5h |
| 02 | Migrate Standard tables by module wave | [phase-02-standard-table-rollout.md](phase-02-standard-table-rollout.md) | completed | 9h |
| 03 | Migrate Dense analytics tables + validate | [phase-03-dense-table-rollout-and-validation.md](phase-03-dense-table-rollout-and-validation.md) | completed | 6h |

## Rollout Strategy (3-phase safe rollout)
- **Phase 01 (foundation + pilot):** tạo primitive/tokens + migrate pilot 2–3 bảng đại diện để khóa contract.
- **Phase 02 (standard wave):** migrate phần lớn workspace/lead/report/settings tables theo cùng contract.
- **Phase 03 (dense wave + hardening):** migrate analytics tables, xử lý dense-specific spacing/typography, cross-page regression QA.

## Dependency Graph
```txt
phase-01 foundation
   ↓
phase-02 standard table migration
   ↓
phase-03 dense analytics migration + full validation

This plan blocks: 260426-2346-dashboard-system-refactor-tabs-ui
```

## Risk Mitigation
- Không big-bang: rollout theo wave để giới hạn blast radius.
- Giữ API/data logic immutable: chỉ touch UI layer.
- Mỗi phase có compile gate + visual QA checklist.
- Ưu tiên migrate file đã có table action standardization trước để giảm churn.

## Regression Checklist (mỗi phase)
- [x] `npm run lint` pass.
- [x] Actions column còn đầy đủ header + alignment.
- [x] Date/time hiển thị đúng contract sau migrate.
- [x] Không mất sorting/filtering/click handlers hiện tại.
- [ ] Empty/loading/scroll behavior không regress trên desktop + mobile (user tự verify UI).

## Success Criteria
- 100% table trong inventory map về 1 trong 2 variant (Standard/Dense).
- Không còn header trống/thiếu cột actions label.
- Không còn sai khác font/spacing/header style không chủ đích giữa các bảng.
- Không phát sinh lỗi TypeScript sau rollout.

## Cook Command
```bash
/ck:cook /Users/dominium/Documents/Project/SMIT-OS/plans/260427-1143-unify-table-ui-design-system/plan.md
```

## Completion Notes (2026-04-27)
- Standard rollout hoàn tất gồm cả modal embedded tables và shared date helpers.
- Dense rollout hoàn tất cho KPI + call-performance tables theo `dense` contract.
- Quality gates:
  - `npm run lint` pass.
  - Tester/checker reports cho phase modal và dense đã ghi tại `plans/reports/`.
- Known minor follow-up (không blocker): xác nhận business precision cho một số chỉ số float ở call-performance (`callsPerLead`, `avgDuration`, `avgCallsBeforeClose`).
