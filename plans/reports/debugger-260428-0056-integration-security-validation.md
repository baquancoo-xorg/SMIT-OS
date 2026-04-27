# Integration/Security Validation Report

**Date:** 2026-04-28 00:56 ICT
**Server:** http://localhost:3000 (dev, `npm run dev`)
**Branch:** main

---

## 1. Dev Server Reachability

| Check | Result |
|-------|--------|
| `GET /` | HTTP 200 OK |

**PASS**

---

## 2. Admin Route Auth Enforcement

**Test:** `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/admin/fb-config`

**Result:** `HTTP 401`

**Mechanism (code evidence):**
- `app.use("/api", createAuthMiddleware(prisma))` at `server.ts:116` runs before the admin mount.
- `app.use('/api/admin', requireAdmin, createAdminFbConfigRoutes())` at `server.ts:132`.
- Unauthenticated request: auth middleware rejects first -> 401.
- Authenticated non-admin: `requireAdmin` checks `req.user?.isAdmin` -> 403.

**PASS**

---

## 3. CSP Report-Only Header

**Test:** `curl -sI http://localhost:3000/ | grep -i content-security-policy`

**Result (exact header from response):**
```
Content-Security-Policy-Report-Only: default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests
```

**Mechanism:** `server.ts:70-75` — `helmet({ contentSecurityPolicy: { useDefaults: true, reportOnly: true } })`.

Note: `script-src 'self'` without `'unsafe-eval'` or nonces means the React SPA must not use `eval`. Vite dev mode injects HMR scripts via `<script type="module">` which is fine. This has not been tested under production build.

**PASS**

---

## 4. Oversized JSON Body Limit

**Test:** POST 2,097,263-byte JSON payload to `/api/auth/login` (limit is `2mb` = 2,097,152 bytes)

**Result:** `HTTP 500` (expected: `HTTP 413`)

**Root cause — CONFIRMED BUG:**

The global error handler at `server.ts:144-151` unconditionally returns `res.status(500)`:

```ts
// server.ts:144-151 — current (buggy)
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(500).json({         // <-- always 500
    error: "Internal server error",
    ...(isDev && { message: err.message, stack: err.stack })
  });
});
```

`body-parser` sets `err.status = 413` and `err.type = 'entity.too.large'` on `PayloadTooLargeError`. The error handler ignores these and overwrites with 500.

The stack trace in the response body confirms the correct error IS being raised:
```
PayloadTooLargeError: request entity too large
    at readStream (...node_modules/raw-body/index.js:163:17)
```

**Fix required in `server.ts`:**
```ts
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = typeof err.status === 'number' ? err.status : 500;
  if (status !== 500) {
    return res.status(status).json({ error: err.message });
  }
  console.error(err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(500).json({
    error: "Internal server error",
    ...(isDev && { message: err.message, stack: err.stack })
  });
});
```

**FAIL — requires fix**

---

## 5. Code Path Inspection

### 5a. Lead Sync (`server/services/lead-sync/`)

| Concern | Finding | Risk |
|---------|---------|------|
| State init safety | `getLeadSyncPrisma()` throws if called before `initLeadSyncPrisma()` | Low — `initLeadSyncPrisma(prisma)` called at server startup (`server.ts:45`) before any route can fire |
| Advisory lock | `withAdvisoryLock` wraps the sync run — prevents concurrent cron+manual double-run | OK |
| Fire-and-forget in route | `/sync-now` calls `syncLeadsFromCrm()` without `await`, catches errors only via `.catch()` | Acceptable — route returns 202 immediately by design; errors are logged |
| Error surfacing | Sync errors are pushed to `errors[]` array and saved to `LeadSyncRun.errors` in DB | OK |
| Unknown CRM status | Pushes to `errors[]` but continues with `FALLBACK_STATUS` | OK — non-fatal degradation |

No runtime regressions found.

### 5b. Dashboard Cache (`server/services/dashboard/`)

**call-performance.service.ts** — in-process `Map` cache:
- TTL: 5 min, max 500 keys.
- Eviction: LRU-like (delete first inserted key when full) — not true LRU but acceptable for this volume.
- Cache key: `from::to::aeId` — deterministic, no user-scoped isolation (all users share same cache). This is intentional for a shared dashboard but means AE-filtered results are visible across all admin users. Acceptable given the app's trust model.
- `crm` client null-check: returns empty result and writes to cache — prevents thundering-herd on CRM unavailability.

**overview-ad-spend.ts** — in-process `Map` cache:
- TTL: 60 seconds.
- `conversionRatesCache` is a module-level singleton with its own 60s TTL.
- No max-key guard — unbounded growth if date range queries are highly varied. Low severity in practice (dashboard queries are bounded date ranges).

No runtime regressions found. Minor note: unbounded `_cache` Map in `overview-ad-spend.ts` vs bounded 500-key cap in call-performance service — inconsistency worth addressing later but not a blocker.

---

## Summary Table

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Dev server reachable | 200 | 200 | PASS |
| Admin route no-auth | 401 or 403 | 401 | PASS |
| CSP Report-Only header present | header exists | present, full directive | PASS |
| Oversized body (>2mb) | 413 | 500 | FAIL |
| Lead-sync code path | no regressions | clean | PASS |
| Dashboard cache code path | no regressions | clean, minor inconsistency | PASS |

---

## Required Fix

**File:** `server.ts:144-151`
**Issue:** Global error handler ignores `err.status` from body-parser / express middleware errors, returns 500 for all errors.
**Priority:** P1 — security/correctness: 413 is a spec requirement from Phase 03; 500 leaks stack traces in dev and masks error type in prod.

---

## Unresolved Questions

1. Should the error handler also handle `err.type === 'entity.too.large'` explicitly (as a safeguard) in case `err.status` is absent on older body-parser versions?
2. The `overview-ad-spend.ts` `_cache` Map has no key cap — confirm if unbounded growth is acceptable or should mirror the 500-key cap from call-performance service.
3. `script-src 'self'` in CSP — has the production build been verified to work without `'unsafe-eval'`? Vite production output is fine but some polyfill libs use `eval`.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** 3/4 security checks pass. Critical bug: error handler returns 500 instead of 413 for oversized bodies. Fix is a 5-line change to `server.ts` error handler.
**Concerns:** `server.ts` error handler must be patched to forward `err.status` — affects 413, and potentially other HTTP-status-bearing errors (e.g., 400 from third-party middleware).
