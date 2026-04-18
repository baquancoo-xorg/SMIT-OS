# Security Audit Report - SMIT-OS

**Date:** 2026-04-19  
**Auditor:** code-reviewer  
**Scope:** API endpoints, database queries, frontend security, dependencies, authentication/authorization

---

## Executive Summary

The SMIT-OS codebase has a **solid foundation** with good security practices in several areas (JWT-based auth, bcrypt password hashing, Zod validation, encrypted token storage). However, several **high-priority issues** require immediate attention, particularly around authorization gaps, input validation inconsistencies, and CORS configuration.

---

## Critical Issues

### C1: Hardcoded Credentials in Scripts (CRITICAL)
**File:** `scripts/setup-db.ts:18`
```typescript
const hashedPassword = await bcrypt.hash('@Dominic23693', 10);
```
**Impact:** Hardcoded admin password exposed in source code.  
**Recommendation:** Use environment variables for initial admin credentials or require interactive setup.

### C2: CORS Wildcard Configuration (CRITICAL)
**File:** `server.ts:31`
```typescript
app.use(cors({ credentials: true, origin: true }));
```
**Impact:** `origin: true` accepts ANY origin, allowing cross-origin attacks with credentials in production.  
**Recommendation:** Use explicit origin whitelist:
```typescript
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({ credentials: true, origin: ALLOWED_ORIGINS }));
```

### C3: Vulnerable Dependencies (CRITICAL)
**NPM Audit Results:**
| Package | Severity | Vulnerability |
|---------|----------|---------------|
| `protobufjs` | Critical | Arbitrary code execution (CVE) |
| `xlsx` | High | Prototype pollution + ReDoS |

**Recommendation:** Run `npm audit fix` for protobufjs. For xlsx, evaluate replacement with `exceljs` or `SheetJS Pro`.

---

## High Priority Issues

### H1: Missing Input Validation on Multiple Routes
**Affected routes:**
- `POST /api/reports` - Direct `req.body` spread without schema validation
- `POST /api/sprints` - Direct `req.body` spread without schema validation
- `POST /api/okr-cycles` - Direct `req.body` without schema validation
- `PUT /api/objectives/:id` - No schema validation on okrService.updateObjective

**Example (report.routes.ts:34-41):**
```typescript
router.post('/', handleAsync(async (req: any, res: any) => {
  const report = await prisma.weeklyReport.create({
    data: {
      ...req.body,  // DANGER: unvalidated spread
      weekEnding: new Date(req.body.weekEnding),
      status: 'Review',
    },
```
**Impact:** Mass assignment vulnerabilities, unexpected fields in database.  
**Recommendation:** Add Zod schemas for all routes like work-item.routes.ts pattern.

### H2: Missing Authorization on DELETE Endpoints
**Affected routes:**
- `DELETE /api/reports/:id` - No ownership/admin check
- `DELETE /api/daily-reports/:id` - No ownership/admin check
- `DELETE /api/sprints/:id` - No admin check
- `DELETE /api/work-items/:id` - No ownership/role check

**Impact:** Any authenticated user can delete any resource.  
**Recommendation:** Add RBAC middleware or ownership checks before deletion.

### H3: Default JWT Secret in Development
**File:** `server/services/auth.service.ts:5`
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
```
**Impact:** Predictable JWT secret if env var not set.  
**Recommendation:** Fail hard if JWT_SECRET is not set in production:
```typescript
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}
```

### H4: Weak Crypto Key Warning (Silent)
**File:** `server/lib/crypto.ts:6-8`
```typescript
if (SECRET.length < 32) {
  console.warn('[crypto] APP_SECRET/JWT_SECRET should be >= 32 chars');
}
```
**Impact:** Only warns, doesn't prevent encryption with weak key.  
**Recommendation:** Throw error or disable encryption feature if key is weak.

### H5: Query Parameter Trust in Daily Reports
**File:** `server/routes/daily-report.routes.ts:10-11`
```typescript
const { userId, userRole, userDepartment } = req.query;
if (userRole === 'Member') {
  where.userId = userId;
}
```
**Impact:** Client-controlled role bypass. Attacker can set `userRole=Admin` to view all reports.  
**Recommendation:** Use `req.user` from JWT instead of query parameters for authorization.

---

## Medium Priority Issues

### M1: No Rate Limiting
**Impact:** Brute force attacks on login, API abuse.  
**Recommendation:** Add `express-rate-limit`:
```typescript
import rateLimit from 'express-rate-limit';
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));
```

### M2: Missing Helmet Security Headers
**Impact:** Missing CSP, HSTS, X-Frame-Options headers.  
**Recommendation:** Add `helmet` middleware (was planned but not implemented).

### M3: Error Messages Expose Internal Details
**File:** `server.ts:61-64`
```typescript
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});
```
**Impact:** `err.message` may leak stack traces or internal paths.  
**Recommendation:** Only include `message` in development mode.

### M4: Default Password for New Users
**File:** `server/services/user.service.ts:34`
```typescript
const hashedPassword = await bcrypt.hash(data.password || '123456', 10);
```
**Impact:** Weak default password if not provided.  
**Recommendation:** Require password or generate secure random password.

### M5: No CSRF Protection
**Impact:** State-changing requests vulnerable to CSRF (JWT in httpOnly cookie mitigates some risk).  
**Recommendation:** Consider `csurf` middleware or SameSite=strict cookies (already has `sameSite: 'strict'`).

---

## Low Priority Issues

### L1: JWT Token Lifetime (7 days)
**File:** `server/services/auth.service.ts:6`
```typescript
const JWT_EXPIRES_IN = '7d';
```
**Recommendation:** Consider shorter expiry (1 day) with refresh token pattern.

### L2: No Audit Logging
**Impact:** No trail of sensitive operations (user changes, deletions, approvals).  
**Recommendation:** Add audit log table for sensitive actions.

### L3: Cookie Options in Development
**File:** `server/routes/auth.routes.ts:9`
```typescript
secure: process.env.NODE_ENV === 'production',
```
**Note:** Correctly disables `secure` in development. Good practice.

---

## Positive Observations

1. **Password Hashing:** bcrypt with cost factor 10 - industry standard
2. **Zod Validation:** Present on work-items, users, auth - good pattern
3. **httpOnly Cookies:** JWT stored in httpOnly cookie - prevents XSS theft
4. **No SQL Injection:** Prisma ORM with parameterized queries throughout
5. **No XSS in React:** No `dangerouslySetInnerHTML` found
6. **Encrypted FB Tokens:** AES-256-GCM for Facebook access tokens
7. **Admin Middleware:** Proper admin checks on FB config routes
8. **Last Admin Protection:** Prevents deleting the last admin user
9. **.env in .gitignore:** Environment files excluded from version control
10. **Auth Middleware Structure:** Proper token verification and user refresh

---

## Recommended Actions (Priority Order)

| Priority | Action | Effort |
|----------|--------|--------|
| 1 | Fix CORS wildcard configuration | Low |
| 2 | Remove hardcoded credentials from scripts | Low |
| 3 | Add schema validation to all routes | Medium |
| 4 | Fix daily-report query param authorization | Low |
| 5 | Add rate limiting to auth endpoints | Low |
| 6 | Update vulnerable dependencies | Medium |
| 7 | Add RBAC to DELETE endpoints | Medium |
| 8 | Add Helmet security headers | Low |
| 9 | Fail on missing JWT_SECRET in production | Low |
| 10 | Sanitize error messages in production | Low |

---

## Metrics

| Metric | Value |
|--------|-------|
| Routes Reviewed | 12 |
| Critical Issues | 3 |
| High Priority Issues | 5 |
| Medium Priority Issues | 5 |
| Low Priority Issues | 3 |
| Vulnerable Dependencies | 2 |
| Routes with Proper Validation | 4/12 (33%) |
| Routes with Proper Authorization | 6/12 (50%) |

---

## Unresolved Questions

1. Is `xlsx` package actively used? If not, consider removal.
2. What is the production deployment environment? (Docker, cloud platform)
3. Is there a WAF or reverse proxy (nginx) providing additional security?
4. What is the expected user base size for rate limit tuning?

---

**Status:** DONE_WITH_CONCERNS  
**Summary:** Solid foundation with significant authorization and validation gaps that need addressing before production deployment.  
**Concerns:** The CORS wildcard and query-param-based authorization issues are particularly dangerous and should be fixed immediately.
