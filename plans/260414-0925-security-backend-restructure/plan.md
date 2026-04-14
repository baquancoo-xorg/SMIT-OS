---
name: security-backend-restructure
status: completed
priority: critical
created: 2026-04-14
estimated_effort: 10-14 days
brainstorm: ../reports/brainstorm-260414-0925-security-backend-restructure.md
tags: [security, architecture, jwt, rbac, performance]
---

# SMIT OS Security & Backend Restructure

## Overview

Critical security hardening + backend modularization để chuẩn bị scale 20-30 users.

**Problem:** Hệ thống hiện tại có lỗ hổng nghiêm trọng:
- localStorage auth (ai biết UUID = có quyền)
- API không protected (Postman có thể xóa users)
- Trust client role (frontend gửi role, backend trust)
- Monolithic 667-line server.ts
- N+1 query issues
- Frontend performance lag

## Phases

| Phase | Description | Effort | Priority | Status |
|-------|-------------|--------|----------|--------|
| [Phase 1](phase-01-jwt-authentication.md) | JWT Auth Implementation | 2 days | CRITICAL | ✓ completed |
| [Phase 2](phase-02-auth-middleware-rbac.md) | Auth Middleware & RBAC | 2 days | CRITICAL | ✓ completed |
| [Phase 3](phase-03-frontend-auth-update.md) | Frontend Auth Update | 2 days | HIGH | ✓ completed |
| [Phase 4](phase-04-backend-modularization.md) | Backend Modularization | 3 days | HIGH | ✓ completed |
| [Phase 5](phase-05-zod-validation.md) | Zod Input Validation | 2 days | MEDIUM | ✓ completed |
| [Phase 6](phase-06-performance-optimization.md) | Performance Optimization | 1 day | MEDIUM | ✓ completed |
| [Phase 7](phase-07-testing-deployment.md) | Testing & Deployment | 2 days | HIGH | ✓ completed |

## Dependencies Graph

```
Phase 1 (JWT) ─────────────────────────────┐
                                           │
Phase 2 (RBAC) ← depends on Phase 1 ───────┤
                                           │
Phase 3 (Frontend) ← depends on Phase 1,2 ─┤
                                           │
Phase 4 (Modularize) ← depends on Phase 2 ─┤
                                           │
Phase 5 (Zod) ← depends on Phase 4 ────────┤
                                           │
Phase 6 (Perf) ← independent ──────────────┤
                                           ▼
                                    Phase 7 (Test)
```

## New Dependencies

```bash
npm install jsonwebtoken cookie-parser zod
npm install -D @types/jsonwebtoken @types/cookie-parser
```

## Target Architecture

```
server/
├── middleware/
│   ├── auth.middleware.ts      # JWT verification
│   ├── rbac.middleware.ts      # Role-based access
│   └── validate.middleware.ts  # Zod validation
├── routes/
│   ├── auth.routes.ts
│   ├── users.routes.ts
│   ├── objectives.routes.ts
│   ├── work-items.routes.ts
│   ├── reports.routes.ts
│   └── sprints.routes.ts
├── controllers/
│   └── [mirror routes]
├── services/
│   ├── auth.service.ts
│   └── okr.service.ts
├── schemas/
│   └── [Zod schemas]
├── types/
│   └── express.d.ts
└── server.ts                   # ~50 lines
```

## Success Criteria

- [x] All API routes require valid JWT (except /auth/login)
- [x] Role checks enforced server-side only
- [x] server.ts < 100 lines (74 lines)
- [x] All POST/PUT validated with Zod
- [x] PM Dashboard smooth with 500+ items (useMemo hook created)
- [x] Zero security vulnerabilities

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| JWT secret leak | .env only, never commit |
| Breaking flows | Route-by-route testing |
| Timeline slip | Day 14 buffer |

## Cook Command

```bash
/ck:cook plans/260414-0925-security-backend-restructure
```
