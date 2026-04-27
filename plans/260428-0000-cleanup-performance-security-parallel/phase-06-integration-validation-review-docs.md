---
title: "Phase 06 — Integration Validation, Review + Docs"
status: complete
priority: P1
effort: 2h
---

# Phase 06 — Integration Validation, Review + Docs

## Context Links
- Research: `research/researcher-frontend-cleanup-validation.md` § 5 (browser checklist)
- Research: `research/researcher-backend-security-performance.md` § Validation Commands
- Plan: `plan.md`

---

## Parallelization Info

- **Mode:** Final sequential gate
- **Blocks:** nothing (end of plan)
- **Blocked by:** Phase 02, 03, 04, 05 (all must be committed)

---

## Overview

Full validation pass across typecheck, build, dev server, and browser golden path. Code review checkpoint. Update docs to reflect architecture changes. No app source edits.

**Priority:** P1 | **Status:** complete

---

## Key Insights

- This phase is read-only for app source; edits confined to `docs/` only.
- Validation must be run after all prior phases are merged to the same branch.
- Code review should be delegated to `code-reviewer` agent per workflow rules.
- Docs impact: minor (system-architecture.md needs Prisma singleton note; no major structural change).

---

## Requirements

- All validation commands exit 0.
- Browser golden path checklist fully green.
- `docs/system-architecture.md` updated to reflect: Prisma singleton, security header additions.
- No app source files edited in this phase.

---

## Architecture

No architecture changes. Validation + documentation only.

---

## Related Code Files

**Edit:**
- `docs/system-architecture.md` (add Prisma singleton note, security hardening note)

**Read (validation, no edit):**
- All files touched by Phases 01–05

---

## File Ownership

| File | Phase 06 action |
|------|-----------------|
| `docs/system-architecture.md` | EDIT (docs only) |
| All `src/`, `server/`, `server.ts` | READ only — no edits |

---

## Implementation Steps

### Full Validation Suite

1. Typecheck:
   ```bash
   npx tsc --noEmit
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Dead-code cleanup verify:
   ```bash
   grep -rn 'ProtectedRoute\|use-users\|use-objectives\|use-sprints' src/ --include='*.ts' --include='*.tsx'
   # Expected: zero results
   ```

4. Prisma singleton verify:
   ```bash
   grep -rn 'new PrismaClient' server --include='*.ts'
   # Expected: only server/lib/prisma.ts and server/lib/crm-db.ts
   ```

5. Dev server start:
   ```bash
   npm run dev
   ```

6. Browser golden path — open `localhost:3000`, walk each route:
   - [ ] Login → Dashboard loads, KPI table renders, no console errors
   - [ ] PMDashboard → all 6 data sections populate; DevTools Network shows cached pattern (no 6-call waterfall on revisit)
   - [ ] SprintBoard → SprintContextWidget shows active sprint; board columns load; no extra network request on layout re-render
   - [ ] Lead Tracker → tabs switch without full re-fetch flicker; last-sync indicator present
   - [ ] Settings → all tabs render (sprint-cycles, okr-cycles, user-management, fb-config)
   - [ ] Logout → redirects to login, session cleared

7. Security headers check:
   ```bash
   curl -I http://localhost:3000 | grep -i 'content-security-policy'
   # Expected: Content-Security-Policy-Report-Only header present
   ```

8. Admin route auth check:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/fb-config
   # Expected: 401 or 403
   ```

9. Body limit check:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/reports \
     -H 'Content-Type: application/json' \
     -d "{\"x\": \"$(python3 -c \"print('a'*1100000)\")\"}" 
   # Expected: 413
   ```

### Code Review

10. Delegate to `code-reviewer` agent with file list from Phases 01–05.

### Docs Update

11. Update `docs/system-architecture.md`:
    - Add under Data Layer: "Prisma singleton exported from `server/lib/prisma.ts`; `server/lib/crm-db.ts` maintains a separate client for the CRM DB."
    - Add under a new Security Hardening section: body limit (1mb), Helmet CSP report-only, CORS prod-only origin enforcement, general API rate limit (200 req/min), admin route auth gate.

12. Commit docs:
    ```
    docs: update system-architecture with Prisma singleton and security hardening notes
    ```

---

## Todo List

- [x] `npx tsc --noEmit` exits 0
- [x] `npm run build` exits 0
- [x] Dead-code grep returns zero results
- [x] Prisma singleton grep returns exactly 2 hits
- [x] Dev server starts without error
- [x] Login → dashboard golden path green
- [x] PMDashboard data sections populate; network caching confirmed
- [x] SprintBoard sprint widget correct
- [x] Lead tracker tabs switch cleanly
- [x] Settings all tabs render
- [x] Logout works
- [x] CSP-Report-Only header present
- [x] Admin route returns 401/403
- [x] Oversized POST returns 413
- [x] Code review delegated to `code-reviewer` agent
- [x] `docs/system-architecture.md` updated
- [x] Docs commit pushed

---

## Success Criteria

- All commands above exit with expected codes
- Full browser checklist green with no console errors
- Code reviewer approves or flags are resolved
- `docs/system-architecture.md` reflects current state

---

## Conflict Prevention

- No app source edits. Docs only.
- All prior phases must be on same branch before running this validation.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Prior phase left a TS error | Low | Med | tsc catches it; trace to offending phase and fix |
| Browser check reveals broken route | Low | High | Identify which phase introduced regression; revert that phase only |
| Code reviewer flags high-risk change | Low | Med | Address before merging to main |

---

## Security Considerations

- Validation-only; no new attack surface.
- Docs update is additive.

---

## Next Steps

- After Phase 06 passes: plan is complete.
- Monitor CSP-Report-Only violation logs for 1 week; schedule enforce-mode switch as a follow-up ticket.
- Phase 07 (deferred refactors) may begin independently after this plan is complete.
