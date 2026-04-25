# Phase 01 Fix Google OAuth Routing

## Context Links

- Plan: `plan.md`
- Files: `server.ts`, `server/routes/google-oauth.routes.ts`, `server/middleware/auth.middleware.ts`

## Overview

Priority: high.

Fix route ordering so Google admin routes receive `req.user`, while OAuth callback stays public.

## Key Insights

- `server.ts` mounts `/api/google` before `createAuthMiddleware`.
- `server/routes/google-oauth.routes.ts` uses `req.user?.isAdmin` for `/auth`, `/status`, `/folders`, `/folder`, `/disconnect`.
- Callback must stay public because Google redirects browser back to `/api/google/callback`.

## Requirements

### Functional

- Authenticated admin can call `GET /api/google/auth` and receive `{ authUrl }`.
- Unauthenticated/non-admin access to admin Google endpoints returns 401/403.
- `GET /api/google/callback` remains public and validates `google_oauth_state` cookie.

### Non-functional

- Keep routing simple; no new framework.
- Preserve existing OAuth state validation.

## Architecture

Recommended route split:

1. Public route mounted before auth:
   - `GET /api/google/callback`
2. Protected/admin routes mounted after `createAuthMiddleware`:
   - `GET /api/google/auth`
   - `GET /api/google/status`
   - `DELETE /api/google/disconnect`
   - `GET /api/google/folders`
   - `POST /api/google/folder`

Implementation can be done by either:

- Exporting separate public/private routers from `google-oauth.routes.ts`, or
- Mounting callback route before auth and mounting the same router minus callback after auth.

Prefer separate functions for clarity.

## Related Code Files

Modify:

- `server.ts`
- `server/routes/google-oauth.routes.ts`

Read:

- `server/middleware/auth.middleware.ts`
- `server/services/google-oauth.service.ts`

## Implementation Steps

1. Refactor `server/routes/google-oauth.routes.ts` into clear public/private router exports.
2. Keep OAuth cookie constants shared inside file.
3. Move admin route registration after `app.use('/api', createAuthMiddleware(prisma))` in `server.ts`.
4. Mount public callback before auth.
5. Keep error shape `{ error: string }` for JSON endpoints.
6. Ensure callback redirect paths remain `/settings?tab=export&connected=true` and error equivalent.

## Todo List

- [ ] Split Google OAuth route into public callback and admin routes.
- [ ] Update `server.ts` mount order.
- [ ] Confirm private endpoints still check `req.user?.isAdmin`.
- [ ] Confirm callback does not require admin middleware.

## Success Criteria

- Authenticated admin receives OAuth URL.
- Unauthenticated request to `/api/google/auth` no longer silently fails from missing route auth order; it gets proper auth/permission response.
- Callback still works without auth middleware.

## Risk Assessment

- Risk: accidentally protecting callback breaks OAuth. Mitigation: explicit public router.
- Risk: removing admin guard overexposes integration controls. Mitigation: keep `requireAdmin` in private router.

## Security Considerations

- Preserve CSRF-style OAuth `state` cookie validation.
- Keep cookie `httpOnly`, `secure` production-only, `sameSite: strict` unless real callback testing proves otherwise.

## Next Steps

Proceed to Phase 02 for export idempotency.

## Unresolved Questions

- None.
