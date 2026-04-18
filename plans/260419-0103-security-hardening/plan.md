---
status: completed
created: 2026-04-19
completed: 2026-04-19
scope: Security Hardening - Fix Critical/High vulnerabilities
priority: P0
effort: 4h
blockedBy: []
blocks: []
tags: [security, critical, cors, auth, validation]
---

# Security Hardening Plan

## Overview

Fix 3 Critical + 5 High security vulnerabilities identified in security audit.

**Reference:** [Security Audit Report](../reports/security-260419-0103-audit.md)

## Goals

1. **Eliminate Critical vulnerabilities** — CORS, hardcoded creds, vulnerable deps
2. **Fix authorization bypass** — Use JWT user instead of query params
3. **Add input validation** — Zod schemas for all routes
4. **Strengthen production security** — Fail hard on missing secrets

## Phases

| Phase | Description | Effort | Files |
|-------|-------------|--------|-------|
| [Phase 1](phase-01-critical-fixes.md) | CORS, credentials, dependencies | 1h | server.ts, setup-db.ts, package.json |
| [Phase 2](phase-02-auth-validation.md) | Auth bypass + input validation | 1.5h | daily-report.routes.ts, 4 route files |
| [Phase 3](phase-03-authorization.md) | RBAC + ownership checks | 1h | DELETE endpoints (4 files) |
| [Phase 4](phase-04-hardening.md) | JWT/crypto fail-hard, helmet, rate-limit | 0.5h | auth.service.ts, crypto.ts, server.ts |

## Success Criteria

- [x] CORS accepts only explicit origins
- [x] No hardcoded credentials in source
- [x] `npm audit` shows 0 critical/high
- [x] Daily reports use `req.user` not query params
- [x] All POST/PUT routes have Zod validation
- [x] DELETE endpoints check ownership/admin
- [x] JWT_SECRET missing in production = fail startup

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking existing clients | Test all endpoints after CORS change |
| xlsx replacement needed | Evaluate exceljs as alternative |
| Rate limiting too aggressive | Start with generous limits, tune later |
