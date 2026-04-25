# Phase 04 Validate And Review

## Context Links

- Plan: `plan.md`
- Previous phases: `phase-01-fix-google-oauth-routing.md`, `phase-02-add-export-run-idempotency.md`, `phase-03-update-export-ui-errors.md`

## Overview

Priority: high.

Validate final code and run required review after implementation.

## Key Insights

- This change touches auth routing, Prisma schema, backend service logic, and UI.
- Typecheck is mandatory after code changes.
- Real Google OAuth cannot be fully validated without configured credentials, but route behavior can be validated locally.

## Requirements

### Functional validation

- `/api/google/callback` remains reachable without auth middleware.
- `/api/google/auth` requires authenticated admin and returns `{ authUrl }` when env is configured.
- `/api/sheets-export/trigger` is admin-only.
- Duplicate same-day trigger does not start another Google export.

### Non-functional validation

- `npm run lint` passes.
- No new mock-only behavior.
- Code reviewer agent reviews final implementation.

## Architecture

Validation layers:

1. Static: TypeScript compile via `npm run lint`.
2. DB: Prisma schema push/generate if needed.
3. API: manual route checks with authenticated session where possible.
4. Service: duplicate trigger/idempotency behavior.
5. Review: code-reviewer after tests/typecheck.

## Related Code Files

Validate:

- `server.ts`
- `server/routes/google-oauth.routes.ts`
- `server/services/sheets-export.service.ts`
- `server/routes/sheets-export.routes.ts`
- `prisma/schema.prisma`
- `src/components/settings/sheets-export-tab.tsx`

## Implementation Steps

1. Run Prisma schema update command after schema change.
2. Run `npm run lint`.
3. If tests exist for touched backend service/routes, run relevant tests; otherwise run `npm test` if feasible.
4. Start dev server if UI validation needed.
5. Validate Export tab in browser if credentials/session allow.
6. Delegate tester agent to validate final code.
7. Delegate code-reviewer agent after tester passes.
8. Update docs/changelog only if user wants formal project docs update; otherwise report docs impact.

## Todo List

- [ ] Run DB schema push/generate.
- [ ] Run `npm run lint`.
- [ ] Run test suite or relevant tests.
- [ ] Validate UI route behavior.
- [ ] Run tester agent.
- [ ] Run code-reviewer agent.
- [ ] Report docs impact.

## Success Criteria

- Typecheck passes.
- No obvious auth regression.
- No duplicate daily export path remains.
- Reviewer finds no blocking issues.

## Risk Assessment

- Risk: cannot fully test Google OAuth without credentials. Mitigation: validate route response/error handling and document manual credential check.
- Risk: DB push affects local database. Mitigation: confirm before running if environment is shared.

## Security Considerations

- Confirm private routes are admin-only.
- Confirm callback state validation remains intact.
- Confirm errors do not expose tokens.

## Next Steps

After implementation and validation, summarize changed files and whether docs need update.

## Unresolved Questions

- Whether Google OAuth credentials are configured in the target environment.
