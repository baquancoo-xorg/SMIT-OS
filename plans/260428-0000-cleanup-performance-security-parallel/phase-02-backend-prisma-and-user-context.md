---
title: "Phase 02 — Backend Prisma Singleton + User Context Fix"
status: complete
priority: P1
effort: 2h
---

# Phase 02 — Backend Prisma Singleton + User Context Fix

## Context Links
- Research: `research/researcher-backend-security-performance.md` § Batch A1, C3
- Plan: `plan.md`

---

## Parallelization Info

- **Mode:** Parallel with Phase 05 after Phase 01 completes
- **Blocks:** Phase 03 (server.ts admin-route fix needs prisma singleton in place)
- **Blocked by:** Phase 01
- **File conflicts:** none with Phase 05 (all server-side files)

---

## Overview

Create a single `server/lib/prisma.ts` export and replace 5 stray `new PrismaClient()` instances. Fix `req.user.fullName` undefined bug by extending AuthUser type and deriving value in auth middleware or route.

**Priority:** P1 | **Status:** complete

---

## Key Insights

- 5 files instantiate their own PrismaClient; each creates a separate connection pool — wasteful and hard to instrument.
- `server/lib/crm-db.ts` is intentionally separate (points at CRM DB) — do NOT consolidate.
- `req.user.fullName` is used in report + lead routes but missing from AuthUser type; causes silent runtime undefined or TS errors.
- Auth middleware already fetches fresh user from DB on every request — `fullName` can be added there without extra query.

---

## Requirements

- Functional: all routes that previously used local PrismaClient continue to work.
- Functional: `req.user.fullName` resolves to correct value in report and lead routes.
- Non-functional: `npx tsc --noEmit` exits 0; `grep -rn 'new PrismaClient' server` returns only `prisma.ts` + `crm-db.ts`.

---

## Architecture

```
server/lib/prisma.ts   (CREATE)
  exports: prisma (singleton PrismaClient)

Consumers (EDIT import only):
  server/lib/currency-converter.ts
  server/routes/admin-fb-config.routes.ts
  server/services/facebook/fb-sync-scheduler.service.ts
  server/services/dashboard/overview-ad-spend.ts
  server/services/facebook/fb-token.service.ts

AuthUser type:
  server/types/   — add fullName: string
  server/middleware/auth.middleware.ts — populate fullName from DB user

Route consumers of fullName:
  server/routes/report.routes.ts
  server/routes/lead.routes.ts
```

---

## Related Code Files

**Create:**
- `server/lib/prisma.ts`

**Edit:**
- `server/lib/currency-converter.ts`
- `server/routes/admin-fb-config.routes.ts`
- `server/services/facebook/fb-sync-scheduler.service.ts`
- `server/services/dashboard/overview-ad-spend.ts`
- `server/services/facebook/fb-token.service.ts`
- `server/types/` (AuthUser interface — add `fullName`)
- `server/routes/report.routes.ts` (consume `req.user.fullName`)
- `server/routes/lead.routes.ts` (consume `req.user.fullName`)

**Do NOT touch:**
- `server/lib/crm-db.ts` (separate DB, intentional isolation)
- `server.ts` (owned by Phase 03)

---

## File Ownership

| File | Phase 02 action |
|------|-----------------|
| `server/lib/prisma.ts` | CREATE |
| `server/lib/currency-converter.ts` | EDIT |
| `server/routes/admin-fb-config.routes.ts` | EDIT |
| `server/services/facebook/fb-sync-scheduler.service.ts` | EDIT |
| `server/services/dashboard/overview-ad-spend.ts` | EDIT |
| `server/services/facebook/fb-token.service.ts` | EDIT |
| `server/types/` (AuthUser) | EDIT |
| `server/routes/report.routes.ts` | EDIT |
| `server/routes/lead.routes.ts` | EDIT |

No overlap with Phase 03 (owns server.ts), Phase 04 (owns dashboard/lead-sync services), Phase 05 (owns frontend).

---

## Implementation Steps

### A1 — Prisma Singleton

1. Scan for any additional stray instances outside `server/`:
   ```bash
   grep -rn 'new PrismaClient' . --include='*.ts' --exclude-dir=node_modules
   ```

2. Create `server/lib/prisma.ts`:
   ```ts
   import { PrismaClient } from '@prisma/client';
   export const prisma = new PrismaClient();
   ```

3. In each of the 5 stray files: remove local `new PrismaClient()` declaration and replace with:
   ```ts
   import { prisma } from '../lib/prisma'; // adjust relative path per file
   ```
   Ensure variable references inside each file match the imported name.

4. Verify:
   ```bash
   grep -rn 'new PrismaClient' server --include='*.ts'
   # Must return only: server/lib/prisma.ts, server/lib/crm-db.ts
   npx tsc --noEmit
   ```

### C3 — AuthUser fullName Fix

5. Read `server/types/` to locate AuthUser interface.

6. Add `fullName: string` (or `fullName?: string` if not guaranteed) to AuthUser.

7. Read `server/middleware/auth.middleware.ts` — confirm DB user fetch includes `fullName` field. If yes, assign `req.user.fullName = dbUser.fullName`. If field name differs (e.g. `name`), derive: `req.user.fullName = dbUser.name ?? ''`.

8. In `server/routes/report.routes.ts` and `server/routes/lead.routes.ts`: replace any workaround/undefined usage of `fullName` with `req.user.fullName`.

9. Final typecheck:
   ```bash
   npx tsc --noEmit
   ```

10. Commit:
    ```
    refactor: introduce Prisma singleton and fix AuthUser fullName type
    ```

---

## Todo List

- [x] Scan entire repo for stray `new PrismaClient()` instances
- [x] Create `server/lib/prisma.ts`
- [x] Refactor `currency-converter.ts`
- [x] Refactor `admin-fb-config.routes.ts`
- [x] Refactor `fb-sync-scheduler.service.ts`
- [x] Refactor `overview-ad-spend.ts`
- [x] Refactor `fb-token.service.ts`
- [x] Verify grep returns only 2 hits
- [x] Add `fullName` to AuthUser type
- [x] Populate `fullName` in auth middleware
- [x] Update `report.routes.ts` usage
- [x] Update `lead.routes.ts` usage
- [x] `npx tsc --noEmit` passes
- [x] Commit pushed — signal Phase 03 to start

---

## Success Criteria

- `grep -rn 'new PrismaClient' server --include='*.ts'` returns exactly 2 lines (prisma.ts + crm-db.ts)
- `npx tsc --noEmit` exits 0
- All affected routes respond correctly in dev server smoke test
- No runtime undefined for `req.user.fullName` in report/lead routes

---

## Conflict Prevention

- Never edit `server.ts` — owned by Phase 03.
- Never edit `server/lib/crm-db.ts`.
- Never edit `server/services/dashboard/overview-*` cache logic — Phase 04 owns that concern; this phase only changes the PrismaClient import in `overview-ad-spend.ts`.
- Phase 04 may further edit `overview-ad-spend.ts` for caching — ensure Phase 02 commits and merges before Phase 04 starts editing that file.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Relative import path wrong for nested files | Low | Med | Use path alias or double-check depth per file |
| Auth middleware DB query missing fullName field | Low | Low | Read middleware + Prisma select before editing |
| Singleton causes unexpected behavior with transactions | Very Low | Low | PrismaClient singleton is standard practice; transactions unaffected |

---

## Security Considerations

- No auth surface change. Singleton reduces connection pool sprawl.
- `fullName` added to in-memory req.user only; not exposed via new endpoints.

---

## Next Steps

When committed and green:
- Signal Phase 03 (server.ts security hardening) to start — it requires admin-fb-config.routes.ts to already import from the singleton.
