# Backend Cleanup / Security / Performance — Implementation Guidance
**Date:** 2026-04-28 | **Scope:** server.ts + server/**

---

## Confirmed Issues (codebase scan)

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 1 | 6x `new PrismaClient()` scattered across modules | server/lib/currency-converter.ts, server/routes/admin-fb-config.routes.ts, server/services/facebook/fb-sync-scheduler.service.ts, server/services/dashboard/overview-ad-spend.ts, server/services/facebook/fb-token.service.ts | HIGH |
| 2 | `express.json()` no body size limit | server.ts:72 | HIGH |
| 3 | Helmet CSP disabled | server.ts:71 | MEDIUM |
| 4 | CORS allows missing `origin` unconditionally (prod risk) | server.ts:59-65 | MEDIUM |
| 5 | Rate limiting auth-routes only; no general API limiter | server.ts:77-85 | MEDIUM |
| 6 | `/api/admin/*` mounts without `requireAdmin` in server.ts | server.ts:103 | MEDIUM |
| 7 | `req.user.fullName` undefined (not on AuthUser type) | server/routes/report.routes.ts, lead.routes.ts | LOW-MED |
| 8 | Dashboard overview: no caching, many CRM queries per request | server/services/dashboard/ | PERF |
| 9 | Lead sync N+1 pattern | server/services/lead-sync/ | PERF |

Note: `server/lib/crm-db.ts` has its own `PrismaClient` pointing at a separate CRM DB — do NOT consolidate with main prisma instance.

---

## Parallel Batch Plan

### Batch A — Zero-risk infrastructure (safe to parallelize; no logic changes)

Each item below owns distinct files. No inter-item conflicts.

**A1 — Prisma singleton cleanup**
- File ownership: `server/lib/prisma.ts` (CREATE), then edit only the 5 stray files listed above
- Create `server/lib/prisma.ts` exporting `export const prisma = new PrismaClient()`
- Replace the bare `new PrismaClient()` calls in the 5 files with import from this module
- server.ts already passes prisma via factory injection to most routes — leave those alone
- Validation: `grep -rn 'new PrismaClient' server --include='*.ts'` must return only `crm-db.ts` and `server/lib/prisma.ts`

**A2 — Body size limit**
- File ownership: `server.ts` line 72 only
- Change: `app.use(express.json({ limit: '1mb' }));`
- Validation: `curl -X POST http://localhost:3000/api/reports -d @large.json` returns 413

**A3 — General API rate limiter**
- File ownership: `server.ts` rate-limit block (lines 77-85)
- Add a loose general limiter (e.g. 200 req/min per IP) applied to `/api/` after the strict auth limiter
- Do NOT remove existing auth limiters — stack them
- Validation: `ab -n 300 -c 10 http://localhost:3000/api/users` returns 429 after threshold

---

### Batch B — Security hardening (sequential within batch; each touches server.ts)

Batch B must run **after Batch A is merged** because B items all touch server.ts and risk conflicts if parallelized.

**B1 — Fix `/api/admin` auth gap**
- In server.ts, add `requireAdmin` to the admin route mount:
  `app.use("/api/admin", requireAdmin, createAdminFbConfigRoutes());`
- Verify `createAdminFbConfigRoutes` itself does not apply auth internally (it instantiates its own PrismaClient — fix that in A1 first)
- Validation: `curl -b non-admin-cookie http://localhost:3000/api/admin/...` returns 403

**B2 — CORS missing-origin tightening**
- Current behavior: missing origin (server-to-server, curl) is allowed unconditionally
- Safe change: restrict blank-origin bypass to non-production only
  ```
  const allowMissingOrigin = process.env.NODE_ENV !== 'production';
  origin: (origin, callback) => {
    if ((!origin && allowMissingOrigin) || ALLOWED_ORIGINS.includes(origin ?? '')) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  }
  ```
- Risk: if any internal service calls the API without Origin header in prod, it will break — audit first

**B3 — Helmet CSP (report-only first)**
- Enable CSP in report-only mode to collect violations before enforcing:
  `helmet({ contentSecurityPolicy: { useDefaults: true, reportOnly: true } })`
- Move to enforce-only after 1 week of no violations in logs
- Validation: response headers include `Content-Security-Policy-Report-Only`

---

### Batch C — Performance (run after B; independent within C if file ownership respected)

**C1 — Dashboard overview caching**
- File ownership: `server/services/dashboard/` only
- Add in-memory TTL cache (node-cache or simple Map+timestamp) for expensive CRM aggregation calls
- TTL suggestion: 2 minutes for overview metrics (acceptable staleness)
- Do NOT add Redis; in-process cache is KISS-compliant here
- Validation: second request within TTL should complete in <50ms vs first

**C2 — Lead sync N+1 fix**
- File ownership: `server/services/lead-sync/` only
- Batch DB reads before the loop; use `prisma.lead.findMany({ where: { id: { in: ids } } })` then index by id
- Validation: count query logs during sync — should be O(1) not O(n)

**C3 — req.user.fullName fix**
- File ownership: `server/types/` + `server/routes/report.routes.ts` + `server/routes/lead.routes.ts`
- Add `fullName` to AuthUser type if it exists on the DB user model, or derive it in the auth middleware
- Validation: `tsc --noEmit` returns no type errors on those files

---

## What NOT to Do in First Parallel Batch

1. **Do not edit server.ts in Batch A** — multiple devs touching it simultaneously will conflict; Batch A agents should only touch the 5 stray service files and create the new singleton
2. **Do not enable Helmet CSP in enforce mode immediately** — will break the React SPA; use report-only first
3. **Do not merge CORS tightening before auditing internal callers** — servers/crons calling the API without Origin will silently break in prod
4. **Do not add Redis/external cache for Batch C** — overkill for current scale; simple TTL map is sufficient
5. **Do not combine Prisma singleton + admin route fix in one PR** — keep concerns separated for easy rollback

---

## File Ownership Boundaries

| Agent | Owns |
|-------|------|
| A1 | `server/lib/prisma.ts`, `server/lib/currency-converter.ts`, `server/routes/admin-fb-config.routes.ts`, `server/services/facebook/fb-sync-scheduler.service.ts`, `server/services/dashboard/overview-ad-spend.ts`, `server/services/facebook/fb-token.service.ts` |
| A2+A3 | `server.ts` (only rate-limit + json-limit lines) — single agent must own this |
| B1+B2+B3 | `server.ts` (security block) — single sequential agent |
| C1 | `server/services/dashboard/` |
| C2 | `server/services/lead-sync/` |
| C3 | `server/types/`, `server/routes/report.routes.ts`, `server/routes/lead.routes.ts` |

---

## Validation Commands (per batch)

```bash
# After A1
grep -rn 'new PrismaClient' server --include='*.ts'
# Expected: only prisma.ts and crm-db.ts

# After A2
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/reports \
  -H 'Content-Type: application/json' \
  -d "$(python3 -c "print('{\"x\": \"' + 'a'*1100000 + '\"}')")" 
# Expected: 413

# After B1
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/fb-config
# Expected: 401 or 403 (not 200)

# Type safety
npx tsc --noEmit
# Expected: 0 errors

# After C1 (timing)
time curl -s http://localhost:3000/api/dashboard/overview > /dev/null
# Run twice; second should be significantly faster
```

---

## Risk Summary

| Change | Rollback complexity | Breaking risk |
|--------|--------------------|--------------|
| Prisma singleton | Low — swap import | None |
| Body limit | Low | None (legitimate large payloads?) |
| General rate limiter | Low — remove middleware | Low (tight threshold could hit real users) |
| Admin route auth fix | Low | None (was a bug) |
| CORS tightening | Medium — must audit callers | Medium in prod |
| Helmet CSP report-only | Low | None |
| Dashboard cache | Medium | Low (stale data within TTL) |
| Lead sync batch | Medium | Low |
| fullName type fix | Low | None |

---

## Unresolved Questions

1. Does any internal cron/service call the API without an Origin header in production? Must audit before B2.
2. What is the max legitimate JSON payload size? 1mb assumed — confirm with team before enforcing.
3. Are there other `new PrismaClient()` instances outside `server/` (e.g. scripts/)? Quick scan recommended.
4. Does `createAdminFbConfigRoutes` apply its own auth internally, or does it rely fully on server.ts mount?
5. Dashboard overview — what staleness is acceptable to stakeholders for metrics? Determines TTL for C1.
