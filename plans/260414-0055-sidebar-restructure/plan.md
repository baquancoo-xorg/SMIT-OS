---
name: sidebar-restructure
status: completed
priority: medium
created: 2026-04-14
completed: 2026-04-14
estimated_effort: 30m-1h
actual_effort: 15m
brainstorm: ../reports/brainstorm-260414-0055-sidebar-menu-restructure.md
---

# Sidebar Menu Restructuring

## Overview

Restructure sidebar menu theo phương án Workspace-First để cải thiện UX và naming clarity.

## Scope

**Single file change:** `src/components/layout/Sidebar.tsx`

**No backend/database changes required.**

## Changes Summary

| Current | New |
|---------|-----|
| STRATEGIC (Overview, OKRs) | Overview standalone |
| OPERATIONS (Tech&Product, Marketing, Media, Sales) | WORKSPACES (same items) |
| SYSTEM (Backlog, Weekly Report, Daily Sync) | PLANNING (OKRs, Team Backlog) |
| — | RITUALS (Daily Sync, Weekly Report) |

## Phases

| Phase | Description | Effort | Status |
|-------|-------------|--------|--------|
| [Phase 1](phase-01-restructure-sidebar.md) | Restructure sidebar groups | 30m-1h | ✅ completed |

## Success Criteria

- [x] Overview hiển thị standalone (không có group header)
- [x] WORKSPACES group chứa 4 department pages
- [x] PLANNING group chứa OKRs và Team Backlog
- [x] RITUALS group chứa Daily Sync và Weekly Report
- [x] UI hiển thị đúng, không lỗi console

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Layout break | Low | Test responsive trên mobile/desktop |

## Related Files

- [Brainstorm Report](../reports/brainstorm-260414-0055-sidebar-menu-restructure.md)
