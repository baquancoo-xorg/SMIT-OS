---
status: completed
created: 2026-04-25
updated: 2026-04-25
scope: google-sheets-export-oauth-idempotency
blockedBy: []
blocks: []
---

# Google Sheets Daily Export Fix Plan

## Overview

Fix Workspace Settings > Export issues:

- Google Connect does not open OAuth.
- Daily export creates multiple Google Sheets per day.

Recommended approach from brainstorm: fix OAuth route auth order and add DB-backed daily export idempotency.

## Context Links

- Brainstorm report: `../reports/brainstorm-260425-1253-google-sheets-daily-export-fix.md`
- Architecture doc: `../../docs/system-architecture.md`

## Phases

| Phase | Status | File | Goal |
| --- | --- | --- | --- |
| 01 | completed | `phase-01-fix-google-oauth-routing.md` | Make Connect Google hit authenticated admin route while keeping callback public |
| 02 | completed | `phase-02-add-export-run-idempotency.md` | Persist daily export run state with unique date guard |
| 03 | completed | `phase-03-update-export-ui-errors.md` | Show clear Export tab errors for OAuth/export failures |
| 04 | completed | `phase-04-validate-and-review.md` | Run schema/type/test validation and code review |

## Key Dependencies

- Phase 02 needs Prisma schema update before service code can compile.
- Phase 03 depends on known API error shapes from Phase 01/02.
- Phase 04 validates final integrated code only.

## Success Criteria

- `GET /api/google/auth` works for authenticated admins and returns `{ authUrl }`.
- Google callback remains public and validates OAuth state cookie.
- Non-admin users cannot use Google admin endpoints.
- Cron/manual trigger cannot create more than 1 completed spreadsheet per Vietnam calendar day.
- Same-day trigger returns existing run/status/URL instead of creating a new spreadsheet.
- `npm run lint` passes.

## Cook Command

```bash
/ck:cook /Users/dominium/Documents/Project/SMIT-OS/plans/260425-1253-google-sheets-daily-export-fix/plan.md
```

## Unresolved Questions

- Production process model unknown; DB idempotency handles both single and multi-process.
- Force re-export same day intentionally excluded from scope.
