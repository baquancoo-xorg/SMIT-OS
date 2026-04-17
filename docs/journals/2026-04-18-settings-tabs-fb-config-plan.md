# Settings Tabs + FB Config Plan

**Date:** 2026-04-18  
**Type:** Planning  
**Plan:** `260418-0228-settings-tabs-fb-config`

## Context

Brainstorm session identified missing FB Config UI needed for qdashboard migration. Current Settings.tsx is 760 lines monolithic — needs refactoring before adding new features.

## Decision

Created 3-phase plan:
1. **Tab Layout Refactoring** — Extract Users/Sprints/OKRs into separate components
2. **Backend API** — Admin routes for FB accounts CRUD + exchange rates
3. **FB Config Tab** — UI for managing TKQC Facebook

## Key Points

- Follows qdashboard migration plan (`260417-1541`) which marked "API quản trị" as out of scope
- Database tables already exist (Phase 1-2 of migration done)
- Exchange rates section included within FB Config tab (not separate)
- Each component <200 lines per SMIT-OS standards

## Impact

- Enables Dashboard data population via FB account configuration
- Completes admin tooling for qdashboard feature set
- Improves Settings page maintainability

## Next

Run `/ck:cook plans/260418-0228-settings-tabs-fb-config` to implement.
