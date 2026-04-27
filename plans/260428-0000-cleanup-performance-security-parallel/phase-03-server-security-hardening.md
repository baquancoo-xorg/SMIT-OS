---
title: "Phase 03 u2014 Server Security Hardening"
status: complete
priority: P1
effort: 2h
---

# Phase 03 u2014 Server Security Hardening

## Context Links
- Research: `research/researcher-backend-security-performance.md` u00a7 Batch A2, A3, B1u2013B3
- Plan: `plan.md`

---

## Parallelization Info

- **Mode:** Starts after Phase 02 completes; can run parallel with Phase 04 + Phase 05
- **Blocks:** Phase 06
- **Blocked by:** Phase 01, Phase 02
- **Exclusive file:** `server.ts` u2014 only this phase edits it; no other phase may touch it

---

## Overview

Harden `server.ts`: body size limit, general API rate limiter, admin route auth gap, CORS missing-origin fix (dev-only bypass), Helmet CSP in report-only mode.

**Priority:** P1 | **Status:** complete

---

## Key Insights

- All 5 security issues converge on `server.ts`; must be one sequential phase to avoid conflicts.
- Helmet CSP: report-only first u2014 enforcing immediately will break React SPA asset loading.
- CORS: must audit internal callers before tightening; restrict blank-origin bypass to `NODE_ENV !== 'production'` only.
- Admin route (`/api/admin/*`) currently mounted without `requireAdmin` u2014 high-impact fix, low change risk.
- Body limit `1mb` is assumed; confirm max legitimate payload before enforcing.
- Rate limiter: stack general limiter (200 req/min) on top of existing auth-specific limiters u2014 do not remove existing ones.

---

## Requirements

- Functional: all existing API routes continue to work.
- Functional: `/api/admin/*` returns 401/403 for non-admin requests.
- Functional: oversized JSON bodies return 413.
- Non-functional: response headers include `Content-Security-Policy-Report-Only`.
- Non-functional: CORS still works for all browser clients in dev and prod.

---

## Architecture

```
server.ts (single file, sequential edits)
  Line ~71: express.json({ limit: '1mb' })
  Line ~71: helmet({ contentSecurityPolicy: { useDefaults: true, reportOnly: true } })
  Lines ~59-65: CORS origin u2014 restrict blank-origin to non-prod
  Lines ~77-85: add general API rate limiter after auth limiter
  Line ~103: app.use('/api/admin', requireAdmin, createAdminFbConfigRoutes())
```

---

## Related Code Files

**Edit (exclusively):**
- `server.ts`

**Read (for context, do not edit):**
- `server/middleware/admin-auth.middleware.ts` (confirm requireAdmin export name)
- `server/routes/admin-fb-config.routes.ts` (confirm it does not apply its own auth internally; this was fixed in Phase 02)

---

## File Ownership

| File | Phase 03 action |
|------|-----------------|
| `server.ts` | EDIT u2014 exclusive ownership |

All other phases must not edit `server.ts`.

---

## Implementation Steps

**Pre-work: audit before coding**

1. Confirm `requireAdmin` export from `server/middleware/admin-auth.middleware.ts`.
2. Confirm `createAdminFbConfigRoutes` does NOT apply its own auth (verify after Phase 02 refactored its PrismaClient import).
3. Audit internal callers for missing Origin header:
   ```bash
   grep -rn 'fetch\|axios\|http.get\|http.post' server/jobs server/services --include='*.ts' | grep -v 'localhost\|/api/'
   ```
   If any server-to-server call to the API exists without Origin u2014 note it before tightening CORS.

**Edits to server.ts (apply in order):**

4. Body size limit u2014 update `express.json()` call:
   ```ts
   app.use(express.json({ limit: '1mb' }));
   ```

5. Helmet CSP u2014 update Helmet config:
   ```ts
   app.use(helmet({
     contentSecurityPolicy: {
       useDefaults: true,
       reportOnly: true,
     },
   }));
   ```

6. CORS origin u2014 replace the origin callback:
   ```ts
   const allowMissingOrigin = process.env.NODE_ENV !== 'production';
   origin: (origin, callback) => {
     if ((!origin && allowMissingOrigin) || ALLOWED_ORIGINS.includes(origin ?? '')) {
       callback(null, true);
     } else {
       callback(new Error('CORS not allowed'));
     }
   }
   ```

7. General API rate limiter u2014 add after existing auth limiter block:
   ```ts
   const generalApiLimiter = rateLimit({
     windowMs: 60 * 1000,
     max: 200,
     standardHeaders: true,
     legacyHeaders: false,
   });
   app.use('/api/', generalApiLimiter);
   ```

8. Admin route auth gap u2014 update mount:
   ```ts
   app.use('/api/admin', requireAdmin, createAdminFbConfigRoutes());
   ```

9. Validate:
   ```bash
   npx tsc --noEmit
   npm run dev
   # Test admin route:
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/fb-config
   # Expected: 401 or 403
   # Test CSP header:
   curl -I http://localhost:3000 | grep -i 'content-security-policy'
   # Expected: Content-Security-Policy-Report-Only present
   ```

10. Commit:
    ```
    security: harden server.ts u2014 body limit, CSP report-only, CORS, rate limit, admin auth gate
    ```

---

## Todo List

- [x] Read `admin-auth.middleware.ts` u2014 confirm `requireAdmin` export
- [x] Audit internal callers for missing Origin header
- [x] Add `express.json({ limit: '2mb' })` (validated: 2mb per confirmed decision)
- [x] Enable Helmet CSP in report-only mode
- [x] Tighten CORS blank-origin to non-prod only
- [x] Add general API rate limiter (200/min)
- [x] Add `requireAdmin` to `/api/admin` mount
- [x] `npx tsc --noEmit` passes
- [x] Admin route returns 401/403 for unauthenticated request
- [x] CSP-Report-Only header present in responses
- [x] Commit pushed

---

## Success Criteria

- `curl http://localhost:3000/api/admin/fb-config` (no auth) returns 401 or 403
- Response headers include `Content-Security-Policy-Report-Only`
- Oversized POST body returns 413
- `npx tsc --noEmit` exits 0
- All existing authenticated routes still respond correctly

---

## Conflict Prevention

- `server.ts` is exclusively owned by this phase. No edits from Phase 02, 04, or 05.
- Read-only access to middleware files is allowed; no edits.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| CORS tightening breaks internal cron/service in prod | Medium | High | Audit internal callers first; keep `allowMissingOrigin` flag tied to NODE_ENV |
| General rate limiter too tight u2014 hits real users | Low | Med | Start at 200 req/min; adjust after observing prod traffic |
| Admin route was intentionally unguarded (own internal auth) | Low | Low | Read `createAdminFbConfigRoutes` before adding `requireAdmin`; if it has own auth, document but still add guard |
| Body limit breaks legitimate large payload routes | Low | Med | Confirm max payload size with team; raise limit if needed |

---

## Security Considerations

- CSP report-only is safe: no enforcement, only header + future violation collection.
- CORS change is prod-conditional u2014 dev behavior unchanged.
- Rate limiter adds DoS protection without affecting normal usage patterns.
- Admin auth gap fix is a correctness improvement; lowest rollback risk of all changes here.

---

## Next Steps

After commit:
- Phase 06 final validation can proceed once Phase 03, 04, 05 all complete.
- Monitor CSP-Report-Only violation logs for 1 week before switching to enforce mode (out of scope for this plan).
