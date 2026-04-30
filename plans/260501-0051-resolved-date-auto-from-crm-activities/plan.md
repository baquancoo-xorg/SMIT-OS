---
title: "Resolved Date Auto from CRM Activities"
description: "Revert một phần Phase 03 (260429-1048) — auto fill resolvedDate từ crm_activities thay vì để Sale nhập tay"
status: in-progress
priority: P1
effort: ~45m
branch: main
tags: [crm-sync, lead-tracker, revert, resolved-date]
created: 2026-05-01
---

# Resolved Date Auto from CRM Activities

## Context
- Brainstorm: [`../reports/brainstorm-260501-0051-resolved-date-auto-from-crm-activities.md`](../reports/brainstorm-260501-0051-resolved-date-auto-from-crm-activities.md)
- Reverts: [Phase 03 of 260429-1048](../260429-1048-lead-sync-refactor-and-ae-mapping-fix/phase-03-resolved-date-local-only.md) (đã completed)
- Source: CRM `crm_activities` action='change_status_subscriber' (4099 records confirmed)

## Problem
- Phase 03 (260429-1048) đã chuyển `resolvedDate` sang local-only — Sale nhập tay
- User phát hiện CRM `crm_activities` đã ghi chính xác thời điểm status đổi → có thể auto
- Cần revert để sync auto fill resolvedDate (Sale mất quyền nhập tay)

## Goals
- Restore `derive-resolved-date.ts` (đã xoá ở Phase 03)
- Add `resolvedDate` lại vào `CRM_OWNED_FIELDS`
- Re-integrate `loadResolvedDateMap` vào sync flow
- Lock UI edit cho synced lead
- Backfill 333 lead Q/UQ hiện tại

## Phases

| # | Phase | Files | Status |
|---|---|---|---|
| 1 | [Restore derive + sync integration](./phase-01-restore-derive-and-sync.md) | `derive-resolved-date.ts` (new), `constants.ts`, `crm-lead-sync.service.ts` | completed |
| 2 | [Lock UI edit](./phase-02-lock-ui-edit.md) | `lead.routes.ts`, `lead-log-dialog.tsx` | completed |
| 3 | [Backfill & validate](./phase-03-backfill-and-validate.md) | manual via API | pending |

## Key Dependencies
- CRM `crm_activities` accessible via PEERDB (verified 4099 records action='change_status_subscriber')
- Plan 260429-1048 đã completed (current state: resolvedDate local-only, Sale nhập tay)

## Success Criteria
- [ ] Synced Q/UQ lead có `resolvedDate != null` sau backfill
- [ ] `resolvedDate` khớp activity log timestamp (spot check 5 lead)
- [ ] Sale không edit được resolvedDate cho synced lead (UI disabled)
- [ ] Sale vẫn edit được cho local-only lead
- [ ] Cron 10p chạy không lỗi

## Risks
- Sale data nhập sau Phase 03 → bị ghi đè (user accepted)
- PEERDB delay → chấp nhận
- UI dialog Phase 03 thực tế modify gì → verify trước khi revert
