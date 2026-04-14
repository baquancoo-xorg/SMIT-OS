# Brainstorm: SMIT OS Security & Backend Restructure

**Date:** 2026-04-14
**Timeline:** 10-14 ngày
**Approach:** Secure + Structured

---

## Problem Statement

SMIT OS có rủi ro critical khi scale lên 20-30 users:

| Issue | Severity | Root Cause |
|-------|----------|------------|
| localStorage auth | CRITICAL | Không có JWT/session, ai biết UUID có thể impersonate |
| API không protected | CRITICAL | Tất cả routes public, Postman có thể xóa users |
| Trust client role | HIGH | Frontend gửi role lên, backend trust |
| Monolithic server | HIGH | 667 dòng 1 file, không maintainable |
| N+1 Query | MEDIUM | Loop query trong syncOKRProgress |
| Frontend perf | MEDIUM | 12+ unmemoized array operations |

---

## Chosen Solution

### JWT + httpOnly Cookie Authentication
- Secure: Token không accessible từ JavaScript
- Stateless: Không cần session storage
- Self-implement: Không dependency nặng

### Backend Modularization
```
server/
├── middleware/   # auth, rbac, validation
├── routes/       # endpoint definitions
├── controllers/  # request handling
├── services/     # business logic
├── schemas/      # Zod validation
└── server.ts     # ~50 lines setup only
```

### RBAC Matrix
| Endpoint | Admin | Leader | Member |
|----------|-------|--------|--------|
| GET /api/users | ✅ | ✅ dept | ❌ |
| POST /api/users | ✅ | ❌ | ❌ |
| POST /api/reports/:id/approve | ✅ | ✅ team | ❌ |

### Frontend Updates
- AuthContext → /api/auth/me (no localStorage)
- Handle 401 → redirect login
- useMemo cho PM Dashboard computations

---

## Timeline

### Week 1: Security Foundation
- Days 1-2: JWT Auth (sign, verify, refresh)
- Days 3-4: Middleware & RBAC
- Days 5-6: Frontend auth update
- Day 7: Test & fix

### Week 2: Structure & Performance
- Days 8-10: Backend modularization
- Days 11-12: Zod input validation
- Day 13: Fix N+1 + Frontend useMemo
- Day 14: Final test & deploy

---

## Implementation Considerations

### Dependencies to Add
- `jsonwebtoken` - JWT sign/verify
- `cookie-parser` - Parse cookies
- `zod` - Schema validation

### Security Measures
- JWT secret in .env (rotate quarterly)
- httpOnly + Secure + SameSite=Strict cookies
- Password hashing với bcrypt (existing)
- Input sanitization via Zod

### Migration Strategy
- Keep all existing API routes
- Add auth middleware incrementally
- Test each route after protection
- Frontend: graceful 401 handling

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| JWT secret exposure | Critical | .env only, never commit |
| Breaking existing flows | High | Route-by-route testing |
| Timeline slip | Medium | Buffer on day 14 |
| Frontend auth bugs | Medium | Test logout/refresh edge cases |

---

## Success Criteria

- [ ] All API routes require valid JWT (except /auth/login)
- [ ] Role checks enforced server-side, not client-side
- [ ] server.ts < 100 lines
- [ ] All POST/PUT validated with Zod
- [ ] PM Dashboard no longer lags with 500+ items
- [ ] No security vulnerabilities in penetration test

---

## Next Steps

Proceed with `/ck:plan` to create detailed implementation phases.

---

**Status:** DONE
**Summary:** Approved design for JWT auth + backend restructure + frontend perf fix. Ready for implementation planning.
