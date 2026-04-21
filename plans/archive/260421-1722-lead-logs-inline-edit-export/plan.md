---
id: 260421-1722-lead-logs-inline-edit-export
title: Lead Logs - Inline Edit + Detail Modal + Export CSV
status: completed
priority: high
createdAt: 2026-04-21
blockedBy: []
blocks: []
---

# Lead Logs - Inline Edit + Detail Modal + Export CSV

## Overview
Thêm 3 tính năng vào trang Lead Logs:
1. **Detail Modal** — click customer name → popup read-only toàn bộ thông tin lead
2. **Per-cell Inline Edit** — click trực tiếp vào 5 trường (Status, Resolved Date, Lead Type, UQ Reason, Notes) → sửa ngay, auto-save
3. **Export CSV** — export toàn bộ leads từ DB ra file CSV (UTF-8 BOM cho Excel)

## Phases

| Phase | File | Status |
|-------|------|--------|
| [Phase 01 — Lead Detail Modal](phase-01-lead-detail-modal.md) | `lead-detail-modal.tsx` (new) | completed |
| [Phase 02 — Inline Edit + Export CSV](phase-02-inline-edit-and-export.md) | `lead-logs-tab.tsx`, `csv-export.ts` (new) | completed |

## Key Dependencies
- Phase 02 phụ thuộc Phase 01 (import `LeadDetailModal`)
- API `api.getLeads()` không có pagination → export an toàn

## Files Changed
- **Create:** `src/components/lead-tracker/lead-detail-modal.tsx`
- **Create:** `src/components/lead-tracker/csv-export.ts`
- **Modify:** `src/components/lead-tracker/lead-logs-tab.tsx`

## Brainstorm Report
`plans/reports/brainstorm-260421-1722-lead-logs-inline-edit-export.md`
