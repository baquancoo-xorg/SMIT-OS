# Tester Report — Cleanup / Performance / Security Validation

**Plan:** `plans/260428-0000-cleanup-performance-security-parallel/`
**Date:** 2026-04-28 00:56 ICT
**Branch:** main

---

## Test Results Overview

| Check | Result | Notes |
|-------|--------|-------|
| `npx tsc --noEmit` | PASS | zero output, zero errors |
| `npm run build` | PASS | ✓ built in 2.36s, 4048 modules |
| Deleted-hook grep | PASS | No refs to `ProtectedRoute`, `use-users`, `use-objectives`, `use-sprints` in `src/` |
| `new PrismaClient` count | PASS | Exactly 2 hits: `server/lib/prisma.ts` + `server/lib/crm-db.ts` |
| Admin route auth | PASS | `GET /api/admin/fb-config` (no auth) → `401` |
| Body limit enforcement | PARTIAL | `PayloadTooLargeError` IS raised for >2 MB payloads, but error handler returns `500` instead of `413` |
| CSP-Report-Only header | PASS | Header present on all responses |
| CORS allowMissingOrigin | PASS | Conditioned on `NODE_ENV !== 'production'` |
| General rate limiter | PASS | `200 req/min` via `generalApiLimiter` at `/api/` |
| Cache TTL 60s | PASS | `TTL_MS = 60_000` in `overview-ad-spend.ts`; 3 functions wrapped |
| N+1 fix (lead sync) | PASS | Pre-batch `findMany` + `Map` lookup replaces per-loop `findUnique` |
| SprintContext created | PASS | `src/contexts/SprintContext.tsx` with `useQuery` exposes `activeSprint` |
| PMDashboard migrated | PASS | 7 `useQuery` calls (import + 6 data calls), staleTime 60s |

---

## Failed / Degraded Checks

### [MINOR] 413 surfaced as 500

**Cause:** Global error handler in `server.ts:144–151` always calls `res.status(500)` without inspecting `err.status`.  
`body-parser` sets `err.status = 413` and `err.type = 'entity.too.large'` on `PayloadTooLargeError`, but it is discarded.

**Actual behavior:** `PayloadTooLargeError: request entity too large` is raised and logged; the body IS rejected. No data leaks.  
**Impact:** Non-standard HTTP status for oversized payloads; clients cannot distinguish payload-too-large from actual server errors. Not a security regression — enforcement is active.

**Fix (1 line):**
```ts
// server.ts:147 — change:
res.status(500).json({
// to:
res.status(err.status ?? 500).json({
```

**This was NOT addressed by Phase 03** — phase spec does not mention updating the error handler. Pre-existing gap.

---

## Coverage Analysis

No automated test suite exists for this project (confirmed: no test scripts in package.json beyond build/lint).  
All validation is via type-check, build, grep, and live HTTP probes.

---

## Phase Implementation Status (from reports + grep verification)

| Phase | Status | Evidence |
|-------|--------|----------|
| 01 — Safe cleanup (delete dead hooks) | DONE | `src/hooks/use-users.ts` etc. absent; grep clean |
| 02 — Prisma singleton + user context | DONE | `server/lib/prisma.ts` exists; 2 `new PrismaClient` hits only |
| 03 — Security hardening (server.ts) | DONE | helmet CSP-RO, CORS, rate limit, admin auth, body limit all active |
| 04 — Backend cache + N+1 fix | DONE | `withCache` + batch map in place |
| 05 — Frontend query caching | DONE | PMDashboard, SprintContext, lead tracker migrated |
| 06 — Integration/validation/docs | NOT YET — this report serves as input |

---

## Build Warnings

- 6 empty chunks emitted (`vendor-set-cookie-parser`, `vendor-react-router-dom`, `vendor-motion`, `vendor-swc-helpers`, `vendor-tanstack-virtual-core`, `vendor-tabbable`) — cosmetic, pre-existing, no functional impact.

---

## Recommendations

1. **Fix error handler** (`server.ts:147`): `res.status(err.status ?? 500)` — 1-line change, makes 413 tests deterministic.
2. Add minimal smoke tests for admin auth and body limit in a CI script to prevent regression.
3. Phase 06 (docs sync) can proceed — all implementation phases verified.

---

## Unresolved Questions

1. Are any internal server-to-server calls made without an `Origin` header in production? CORS blank-origin bypass is dev-only now — need prod audit before going live.
2. Phase 03 spec listed body limit as `1mb` but implementation uses `2mb` (per plan.md override). Confirm `2mb` is the final agreed limit.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** All 5 implementation phases verified via type-check (PASS), build (PASS), and live probes. Security hardening active; 4/5 plan validation criteria fully met.
**Concerns:** Body limit enforcement IS active but surfaces as HTTP 500 instead of 413 due to pre-existing error handler gap — not introduced by this plan. Fix is trivial (1 line). No blocking issues for Phase 06.
