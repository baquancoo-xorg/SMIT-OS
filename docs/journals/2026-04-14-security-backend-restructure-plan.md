# Security & Backend Restructure Plan

**Date:** 2026-04-14
**Type:** Brainstorm + Planning
**Duration:** ~45 minutes

## Summary

Completed brainstorming and created comprehensive 7-phase implementation plan (10-14 days) to address critical security vulnerabilities and backend architecture issues in SMIT OS.

## Critical Issues Identified

| Issue | Severity | Root Cause |
|-------|----------|------------|
| localStorage auth | CRITICAL | User ID stored client-side, easily spoofed |
| Unprotected APIs | CRITICAL | All routes public, no middleware |
| Trust client role | HIGH | Backend trusts `approverRole` from request body |
| Monolithic server | HIGH | 667 lines in single file |
| N+1 Query | MEDIUM | Loop queries in `syncOKRProgress` |
| Frontend perf | MEDIUM | 12+ unmemoized array operations |

## Chosen Approach

**Approach B: Secure + Structured** (user-approved)
- JWT + httpOnly cookies (self-implemented, no heavy libraries)
- RBAC middleware (Admin/Leader/Member matrix)
- Backend modularization (routes/controllers/services)
- Zod input validation
- Performance optimizations

## Plan Structure

```
plans/260414-0925-security-backend-restructure/
├── plan.md (overview)
├── phase-01-jwt-authentication.md (2 days, CRITICAL)
├── phase-02-auth-middleware-rbac.md (2 days, CRITICAL)
├── phase-03-frontend-auth-update.md (2 days, HIGH)
├── phase-04-backend-modularization.md (3 days, HIGH)
├── phase-05-zod-validation.md (2 days, MEDIUM)
├── phase-06-performance-optimization.md (1 day, MEDIUM)
└── phase-07-testing-deployment.md (2 days, HIGH)
```

## Key Decisions

1. **JWT over Session** - Stateless, simpler infrastructure
2. **httpOnly cookies** - XSS-safe, no localStorage
3. **Keep API routes** - No breaking changes, faster timeline
4. **Self-implement auth** - Avoid heavy dependencies like Passport.js

## Dependencies Added

```bash
npm install jsonwebtoken cookie-parser zod
npm install -D @types/jsonwebtoken @types/cookie-parser
```

## Next Action

```bash
/ck:cook plans/260414-0925-security-backend-restructure
```

## Impact

- **Security:** Closes critical auth vulnerabilities
- **Maintainability:** server.ts from 667 → ~50 lines
- **Performance:** N+1 fix + useMemo = faster UX
- **Scalability:** Ready for 20-30 users

---

**Status:** Plan complete, ready for implementation
