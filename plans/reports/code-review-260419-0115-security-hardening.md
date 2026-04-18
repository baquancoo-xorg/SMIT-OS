# Security Hardening Code Review

**Date:** 2026-04-19  
**Reviewer:** code-reviewer  
**Status:** DONE_WITH_CONCERNS

---

## Scope

- Files: 11 security-critical files
- Focus: Security best practices, auth/authz, input validation, error handling
- LOC: ~600 lines of security infrastructure

---

## Overall Assessment

The security hardening implementation is **generally solid** with good foundational patterns. However, there are **3 critical issues** that require immediate attention before production deployment, primarily around auth bypass vulnerabilities and missing authorization checks.

---

## Critical Issues (BLOCKING)

### 1. Auth Bypass in PUT /daily-reports/:id (CRITICAL)

**File:** `server/routes/daily-report.routes.ts:80-104`

The PUT endpoint trusts `currentUserId` from the request body instead of using `req.user` from the authenticated session:

```typescript
router.put('/:id', handleAsync(async (req: any, res: any) => {
  const { currentUserId, tasksData, adHocTasks, ...updateData } = req.body;
  const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
  // ...
  const isOwner = report.userId === currentUserId;
```

**Impact:** Any authenticated user can impersonate any other user by passing a different `currentUserId` in the request body, allowing unauthorized report modifications.

**Fix:** Replace `currentUserId` from body with `req.user.userId`:
```typescript
const currentUser = req.user;
const isOwner = report.userId === currentUser.userId;
```

---

### 2. Auth Bypass in PUT /reports/:id (CRITICAL)

**File:** `server/routes/report.routes.ts:50-70`

Same pattern - trusts client-provided `currentUserId` and `currentUserRole`:

```typescript
const { currentUserId, currentUserRole, ...updateData } = req.body;
```

But then the endpoint **never uses these values for authorization** - it just spreads updateData without any ownership check.

**Impact:** Any authenticated user can modify any weekly report.

**Fix:** Add ownership middleware or inline check using `req.user`:
```typescript
router.put('/:id', checkOwnership('weeklyReport'), validate(...), handleAsync(...));
```

---

### 3. Missing Authorization on OKR Cycle DELETE (HIGH)

**File:** `server/routes/okr-cycle.routes.ts:61-64`

Delete endpoint has no authorization check:

```typescript
router.delete('/:id', handleAsync(async (req: any, res: any) => {
  await prisma.okrCycle.delete({ where: { id: req.params.id } });
```

**Impact:** Any authenticated user can delete OKR cycles.

**Fix:** Add admin-only restriction:
```typescript
router.delete('/:id', RBAC.adminOnly, handleAsync(...));
```

---

## High Priority Issues

### 4. Ownership Middleware Edge Case - workItem with null assigneeId

**File:** `server/middleware/ownership.middleware.ts:32-34`

```typescript
const ownerId = resource.userId || resource.assigneeId;
if (ownerId && ownerId !== user.userId) {
  return res.status(403).json({ error: 'Not authorized' });
}
```

If `ownerId` is null (unassigned work item), the condition `ownerId && ...` is falsy, so authorization passes for anyone.

**Impact:** Unassigned work items can be deleted by any user.

**Fix:** Explicitly handle null case:
```typescript
if (!ownerId) {
  // Unassigned items - require admin to delete
  return res.status(403).json({ error: 'Only admin can delete unassigned items' });
}
```

---

### 5. Missing Validation on Sprint/OKR Cycle PUT (MEDIUM)

**File:** `server/routes/sprint.routes.ts:60-70`, `server/routes/okr-cycle.routes.ts:40-58`

PUT endpoints validate input but have no RBAC checks. Any authenticated user can modify sprints and OKR cycles.

**Fix:** Add `RBAC.adminOnly` or `RBAC.leaderOrAdmin`:
```typescript
router.put('/:id', RBAC.adminOnly, validate(updateSprintSchema), handleAsync(...));
```

---

### 6. Date Validation Missing

**File:** `server/schemas/okr-cycle.schema.ts`, `server/schemas/sprint.schema.ts`

Date fields accept any string without validation:

```typescript
startDate: z.string(),
endDate: z.string(),
```

**Impact:** Invalid dates could cause runtime errors or data corruption.

**Fix:** Add date validation:
```typescript
startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
```

Also add logical validation: `endDate >= startDate`.

---

## Medium Priority Issues

### 7. Crypto Key Derived from JWT_SECRET

**File:** `server/lib/crypto.ts:4`

```typescript
const SECRET = process.env.APP_SECRET ?? process.env.JWT_SECRET ?? '';
```

Using JWT_SECRET as encryption key is acceptable but not ideal - separate secrets provide defense in depth.

**Recommendation:** Document that `APP_SECRET` should be set in production for key separation.

---

### 8. Rate Limiter Only on Login

**File:** `server.ts:49-56`

Rate limiting only applies to `/api/auth/login`. Other sensitive endpoints (password change, report submission) lack rate limiting.

**Recommendation:** Add rate limiting to:
- Password change endpoints
- Report creation (prevent spam)
- Admin operations

---

### 9. Content-Type Validation Missing

**File:** `server.ts`

No explicit check that requests have correct Content-Type header before parsing JSON.

**Impact:** Low risk but could lead to unexpected behavior with malformed requests.

---

### 10. Helmet CSP Disabled

**File:** `server.ts:44`

```typescript
app.use(helmet({ contentSecurityPolicy: false }));
```

CSP is disabled, likely for Vite compatibility in development.

**Recommendation:** Enable CSP in production mode with appropriate directives.

---

## Low Priority Issues

### 11. Error Handler Leaks Stack in Dev Mode

**File:** `server.ts:84-91`

Stack traces are only exposed in dev mode, which is correct. However, `err.message` could contain sensitive info.

**Recommendation:** Sanitize error messages in production:
```typescript
error: isDev ? err.message : "An error occurred"
```

---

### 12. JWT Expiry - 7 Days May Be Long

**File:** `server/services/auth.service.ts:13`

7-day token expiry is quite long for a business application.

**Recommendation:** Consider shorter expiry (1-2 days) with refresh token pattern.

---

## Positive Observations

1. **CORS Whitelist** - Properly validates origin against allowed list
2. **Fail-hard on Secrets** - JWT_SECRET and APP_SECRET throw in production if missing/weak
3. **Ownership Middleware** - Good abstraction for resource authorization (once edge cases fixed)
4. **RBAC Middleware** - Clean preset configurations for common patterns
5. **Zod Validation** - Input validation present on most routes
6. **bcrypt** - Password hashing uses proper algorithm with salt rounds
7. **HttpOnly Cookies** - JWT stored in httpOnly cookie, not localStorage
8. **SameSite Strict** - CSRF protection via cookie attributes
9. **Setup Script** - Removed hardcoded password, requires env var

---

## Recommended Actions (Priority Order)

1. **IMMEDIATE:** Fix auth bypass in PUT /daily-reports/:id - use req.user
2. **IMMEDIATE:** Fix auth bypass in PUT /reports/:id - add ownership check
3. **HIGH:** Add RBAC.adminOnly to DELETE /okr-cycles/:id
4. **HIGH:** Fix ownership middleware null assigneeId edge case
5. **HIGH:** Add RBAC to PUT /sprints/:id and PUT /okr-cycles/:id
6. **MEDIUM:** Add date validation to Zod schemas
7. **LOW:** Enable CSP in production
8. **LOW:** Add rate limiting to sensitive non-auth endpoints

---

## Security Checklist Verification

- [x] Concurrency: No shared mutable state identified
- [x] Error boundaries: Global error handler present
- [~] API contracts: Auth middleware populates req.user correctly, but some routes ignore it
- [x] Backwards compatibility: No breaking changes
- [~] Input validation: Zod validation present but date validation weak
- [~] Auth/authz paths: Auth present but authz bypassed in 3 routes
- [x] N+1 / query efficiency: No unbounded loops
- [x] Data leaks: No PII exposed in error responses (prod mode)

---

## Unresolved Questions

1. Should unassigned work items be deletable by their creator? Current logic allows any user.
2. Is the 7-day JWT expiry intentional? Business requirement or default?
3. Are there plans to add audit logging for sensitive operations?

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Security hardening has good foundations but contains 3 auth bypass vulnerabilities that must be fixed before production. The ownership middleware pattern is sound but needs edge case handling for null owners.
**Concerns:** Critical auth bypass in PUT endpoints; missing RBAC on administrative operations; ownership check fails for unassigned items.
