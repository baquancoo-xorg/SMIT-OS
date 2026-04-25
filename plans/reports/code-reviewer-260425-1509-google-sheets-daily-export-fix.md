# Code Review: Google Sheets Daily Export Fix

**Date:** 2025-04-26  
**Reviewer:** code-reviewer  
**Status:** DONE

## Summary

Implementation achieves all stated goals. OAuth routing is correctly split (public callback vs admin-protected routes). DB-backed idempotency is sound with proper race condition handling via unique constraint + P2002 catch. UI error surfacing is complete.

## Scope

- `server/routes/google-oauth.routes.ts` - Route split
- `server.ts` - Route mounting order
- `prisma/schema.prisma` - SheetsExportRun model
- `server/services/sheets-export.service.ts` - Idempotency logic
- `server/types/sheets-export.types.ts` - Type additions
- `src/components/settings/sheets-export-tab.tsx` - Error UI

## Critical Issues

None.

## Major Issues

None.

## Minor Issues

### 1. Missing `spreadsheetId` in race condition branch (Low Impact)

**File:** `server/services/sheets-export.service.ts:85-92`

```typescript
if (conflictRun) {
  return {
    success: conflictRun.status === 'completed',
    spreadsheetUrl: conflictRun.spreadsheetUrl ?? undefined,
    sheetsCreated: conflictRun.sheetsCreated,
    exportDate,
    reusedExisting: conflictRun.status === 'completed',
    error: conflictRun.status === 'running' ? 'Export already in progress' : undefined,
  };
}
```

`spreadsheetId` is omitted (exists in the "completed" early-return at line 47). Callers expecting this field may get inconsistent shape.

**Fix:** Add `spreadsheetId: conflictRun.spreadsheetId ?? undefined` to the return object.

### 2. Stale `running` state if process crashes mid-export

If the server crashes while `status === 'running'`, the row remains stuck. Next day's export is fine (different exportDate), but same-day retry would return "Export already in progress" forever until manual DB fix.

**Suggestion:** Add a `startedAt` staleness check (e.g., if `running` for > 30 min, treat as failed and allow retry). Not blocking for initial implementation.

### 3. OAuth callback error messages exposed to URL

```typescript
res.redirect('/settings?tab=export&error=' + encodeURIComponent(error.message));
```

`error.message` from `googleOAuthService.handleCallback` could leak internal details. Prefer a sanitized error message for user-facing redirect.

**Suggestion:** Map known error types to user-friendly messages; default to generic "Connection failed. Please try again."

## Positive Observations

1. **OAuth state validation** - CSRF protection intact with httpOnly cookie + state comparison
2. **Race condition handling** - P2002 unique constraint catch is the correct pattern
3. **Vietnam timezone** - `Asia/Ho_Chi_Minh` with `en-CA` locale for YYYY-MM-DD is clean
4. **Admin route protection** - `router.use(requireAdmin)` applied to all admin routes correctly
5. **Deprecation marker** - Old `createGoogleOAuthRoutes` marked deprecated for gradual migration

## Verification Checklist

| Check | Status |
|-------|--------|
| Typecheck passes | PASS |
| Prisma schema valid | PASS |
| Auth middleware applied before admin routes | PASS |
| Public callback before auth middleware | PASS |
| Unique constraint on exportDate | PASS |
| Error surfaced to UI | PASS |

## Files to Review Manually

- Verify `db:push` or migration has been run to create `sheets_export_runs` table

---

**Recommendation:** Ship as-is. Minor issues are non-blocking; consider addressing in follow-up.
