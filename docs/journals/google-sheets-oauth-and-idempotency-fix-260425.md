# Google Sheets OAuth & Idempotency Fix

**Date**: 2026-04-25 15:30
**Severity**: High
**Component**: Google Sheets Daily Export
**Status**: Resolved

## What Happened

Google Sheets export silently failed due to OAuth route mounting before auth middleware, causing `req.user` to be undefined on all admin endpoints. Additionally, duplicate sheets were created on retry attempts.

## The Brutal Truth

This is embarrassing. Routes mounted at app initialization, so `req.user` was always `null`. We only caught it during manual testing. Silent failures are the worst—no logs, no errors, just broken functionality that users discovered.

## Technical Details

**Root Cause**: Express router initialization order matters. Routes registered before middleware don't benefit from that middleware.

```
WRONG:  app.use(routes) → app.use(authMiddleware)
RIGHT:  app.use(authMiddleware) → app.use(routes)
```

**Error**: `POST /api/google/auth` returned 403 (unauthorized) because `req.user === undefined`.

## What We Tried & Fixed

1. **OAuth Route Split** – Separated callback (public) from admin routes (protected). Google redirects client browser to callback; only callback can be public. Admin endpoints (`/auth`, `/status`, `/folders`) now execute after auth middleware.

2. **DB-Backed Idempotency** – Added `SheetsExportRun` model with unique constraint on `exportDate` (Vietnam timezone). Prevents duplicate sheets: completed returns existing sheet, running returns 409 conflict, failed allows retry.

3. **UI Error Surface** – Added `googleError` state to surface OAuth/callback errors instead of silently failing.

## Root Cause Analysis

Middleware execution order was never validated. We assumed it worked because the callback endpoint seemed to work (it's public). Admin endpoints silently failed without tests.

## Lessons Learned

- **Middleware order is load-bearing** – Test auth in integration tests, not just unit tests
- **Idempotency keys prevent cascading failures** – Database constraints are cheap insurance
- **Silent failures kill debugging** – Always log auth failures, even 403s

## Next Steps

- Add integration tests for OAuth flow (admin routes require valid session)
- Log all auth middleware rejections to investigate similar issues
- Verify no other routes suffer this problem
