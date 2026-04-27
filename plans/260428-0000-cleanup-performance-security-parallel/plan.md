---
title: "Cleanup / Performance / Security — Parallel Execution Plan"
description: "Parallel-optimized plan: safe dead-code deletion, Prisma singleton, security hardening, caching, frontend query caching."
status: complete
priority: P1
effort: 14h
branch: main
tags: [cleanup, performance, security, refactor]
created: 2026-04-28
---

# Cleanup / Performance / Security — Parallel Plan

## Dependency Graph

```
Phase 01 (Baseline + Safe Cleanup) — SEQUENTIAL GATE
        |
        ├─── Phase 02 (Backend Prisma + User Context) ─┐
        ├─── Phase 05 (Frontend Query Caching)          ├── Phase 06 (Integration / Validation / Review / Docs)
        |                                               |
        └─── Phase 03 (Security Hardening)  ────────────┤
             [after Phase 02 completes]                 |
                                                        |
             Phase 04 (Backend Cache + Sync) ───────────┘
             [parallel with 03 & 05; no server.ts edits]
```

**Sequencing rules:**
1. Phase 01 must complete before anything else starts.
2. Phase 02 + Phase 05 start in parallel immediately after Phase 01.
3. Phase 03 starts after Phase 02 (admin-route fix requires Prisma singleton import from Phase 02).
4. Phase 04 starts after Phase 01; can run parallel with Phase 03 + 05 (owns only service files).
5. Phase 06 is the final sequential gate.

---

## Execution Strategy

| Step | Phases | Mode |
|------|--------|------|
| 1 | Phase 01 | Sequential |
| 2 | Phase 02 + Phase 05 | Parallel |
| 3 | Phase 03 + Phase 04 (after P02 done) | Parallel |
| 4 | Phase 06 | Sequential |

Note: Phase 07 (deferred) is optional; not part of critical path.

---

## File Ownership Matrix

| Phase | File(s) Owned |
|-------|--------------|
| 01 | `src/components/ProtectedRoute.tsx` (DELETE), `src/hooks/use-users.ts` (DELETE), `src/hooks/use-objectives.ts` (DELETE), `src/hooks/use-sprints.ts` (DELETE) |
| 02 | `server/lib/prisma.ts` (CREATE), `server/lib/currency-converter.ts`, `server/routes/admin-fb-config.routes.ts`, `server/services/facebook/fb-sync-scheduler.service.ts`, `server/services/dashboard/overview-ad-spend.ts`, `server/services/facebook/fb-token.service.ts`, `server/types/` (AuthUser), `server/routes/report.routes.ts`, `server/routes/lead.routes.ts` |
| 03 | `server.ts` (all security edits) |
| 04 | `server/services/dashboard/` (cache), `server/services/lead-sync/` (N+1 fix) |
| 05 | `src/pages/PMDashboard.tsx`, `src/components/layout/SprintContextWidget.tsx`, `src/contexts/SprintContext*` |
| 06 | `docs/` only; no app source edits |
| 07 | `src/pages/OKRsManagement.tsx`, `src/pages/DailySync.tsx`, `src/pages/MarketingBoard.tsx`, `src/pages/TechBoard.tsx`, `src/components/board/group-board-shell.tsx` (new), `src/components/ui/CustomDatePicker.tsx` |

---

## Validation Commands

```bash
# Type check
npx tsc --noEmit

# Build
npm run build

# Dead-code cleanup verify
grep -rn 'ProtectedRoute|use-users|use-objectives|use-sprints' src/ --include='*.ts' --include='*.tsx'

# Prisma singleton verify
grep -rn 'new PrismaClient' server --include='*.ts'
# Expected: only server/lib/prisma.ts and server/lib/crm-db.ts

# Admin route auth check
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/fb-config
# Expected: 401 or 403

# Body limit check
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/reports 
  -H 'Content-Type: application/json' 
  -d "{\"x\": \"$(python3 -c "print('a'*1100000)")\"}
# Expected: 413

# Dev server
npm run dev
```

---

## Browser Golden Path Checklist

- [ ] Login → Dashboard loads, KPI table renders, no console errors
- [ ] PMDashboard → all 6 data sections populate; network tab shows cached/batched calls
- [ ] SprintBoard → SprintContextWidget shows active sprint; board columns load
- [ ] Lead Tracker → tabs switch without full re-fetch flicker
- [ ] Settings → all tabs render (sprint-cycles, okr-cycles, user-management, fb-config)
- [ ] Logout → redirects to login, session cleared
- [ ] Check response headers include `Content-Security-Policy-Report-Only`

---

## Phases

| Phase | Name | Status | Est. |
|-------|------|--------|------|
| [01](phase-01-baseline-and-safe-cleanup.md) | Baseline + Safe Cleanup | complete | 1h |
| [02](phase-02-backend-prisma-and-user-context.md) | Backend Prisma + User Context | complete | 2h |
| [03](phase-03-server-security-hardening.md) | Server Security Hardening | complete | 2h |
| [04](phase-04-backend-performance-cache-and-sync.md) | Backend Cache + Sync | complete | 3h |
| [05](phase-05-frontend-query-caching.md) | Frontend Query Caching | complete | 2h |
| [06](phase-06-integration-validation-review-docs.md) | Integration / Validation / Docs | complete | 2h |
| [07](phase-07-deferred-refactors.md) | Deferred Refactors (optional) | deferred | 4h+ |

---

## Unresolved Questions

1. Max legitimate JSON body size — answered in validation: use 2 MB.
2. Any internal cron/service calling API without Origin header in prod? Must audit before B2 CORS tightening.
3. Other `new PrismaClient()` instances outside `server/` (e.g. scripts/)? Run scan.
4. Does `createAdminFbConfigRoutes` apply its own auth or rely on server.ts mount?
5. Dashboard overview — answered in validation: use 60s TTL.
6. Does SprintContext already expose `activeSprint` to children?
7. Are MarketingBoard/TechBoard filtered by team ID server-side or client-side? Deferred with Phase 07.

---

## Validation Summary

**Validated:** 2026-04-28
**Questions asked:** 7

### Confirmed Decisions

- JSON body limit: set API body limit to `2mb` in Phase 03.
- CORS missing Origin: allow only outside production; production must match allowed origins.
- General API rate limit: use `200` requests/minute.
- Dashboard overview cache TTL: use `60` seconds.
- RBAC route gaps beyond admin mount: audit-only in this plan; do not change work-item/report/lead mutation permissions yet.
- Safe cleanup behavior: if grep finds an unexpected import, keep that file and report it instead of deleting.
- Phase 07 deferred refactors: out of scope for this implementation batch.

### Action Items

- [x] During Phase 03, implement `express.json({ limit: '2mb' })` instead of the phase-file draft `1mb`. DONE.
- [x] During Phase 04, implement dashboard cache TTL as `60_000` instead of the phase-file draft `2 minutes`. DONE.
- [x] During Phase 03, keep non-admin RBAC route findings as report/audit notes only. DONE.
- [x] During Phase 01, delete only candidates with zero confirmed imports. DONE.
- [x] Do not execute Phase 07 in this batch. DEFERRED.