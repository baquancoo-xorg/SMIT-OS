---
title: "SMIT-OS Codebase Cleanup (Medium)"
description: "Drop Storybook + Sheets export + unused deps; 3 phases, 2 parallel"
status: pending
priority: P2
effort: 4h
branch: chore/cleanup-medium
tags: [cleanup, tech-debt, frontend, backend, db-migration]
created: 2026-05-12
---

# Codebase Cleanup (Medium)

Scope verified by 2 researcher reports. Goal: shrink dep surface, drop unused Sheets export domain, remove Storybook scaffold. Net result: smaller `node_modules`, simpler DB schema, fewer surface routes.

## Phases

| # | Phase | Status | Parallel Group | Effort | Link |
|---|-------|--------|----------------|--------|------|
| 01 | Frontend Lean (Storybook + deps drop) | pending | A | 1h | [phase-01-frontend-lean.md](./phase-01-frontend-lean.md) |
| 02 | Sheets Export Domain Removal | pending | A | 2h | [phase-02-sheets-export-domain.md](./phase-02-sheets-export-domain.md) |
| 03 | Housekeeping + Verification | pending | B (sequential) | 1h | [phase-03-housekeeping-verify.md](./phase-03-housekeeping-verify.md) |

## Dependency Graph

```
        ┌──► [Phase 01: Frontend Lean] ──┐
[start]─┤                                 ├──► [Phase 03: Housekeeping+Verify] ──► [PR]
        └──► [Phase 02: Sheets Removal] ─┘
        (parallel — disjoint file owners)    (sequential — needs both 01 + 02 done)
```

## File Ownership Matrix

| Asset | Phase 01 | Phase 02 | Phase 03 |
|-------|----------|----------|----------|
| `package.json` (deps + scripts) | EXCLUSIVE | — | — |
| `.storybook/`, `storybook-static/`, `*.stories.tsx` (26) | EXCLUSIVE | — | — |
| `.gitignore` (verify only) | EXCLUSIVE | — | — |
| `server.ts` | — | EXCLUSIVE | — |
| `server/routes/sheets-export.routes.ts`, `server/routes/google-oauth.routes.ts` | — | EXCLUSIVE | — |
| `server/services/google-oauth.service.ts`, `server/services/sheets-export.service.ts`+subdir | — | EXCLUSIVE | — |
| `server/jobs/sheets-export-scheduler.ts`, `server/lib/google-sheets-client.ts` | — | EXCLUSIVE | — |
| `src/pages/Settings.tsx`, `src/components/settings/sheets-export-tab.tsx`, `src/components/settings/index.ts` | — | EXCLUSIVE | — |
| `prisma/schema.prisma`, `prisma/migrations/` (new) | — | EXCLUSIVE | — |
| `DATABASE.md` → `docs/DATABASE.md`, `README.md` ref | — | — | EXCLUSIVE |
| `scripts/archive/` + 4 one-time scripts | — | — | EXCLUSIVE |
| `logs/`, `dist/`, `storybook-static/` (local rm) | — | — | EXCLUSIVE |
| `docs/project-changelog.md` (append) | — | — | EXCLUSIVE |

## Key Scope Corrections (from research)

1. Tier 1 unused deps NARROWED to 4 frontend runtime deps: `@xyflow/react`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`. KEEP `motion` (LoginPage.tsx) + `@headlessui/react` (8 components).
2. `EtlErrorLog` MUST STAY (5 active create calls in fb-sync + ads-sync). Tier 3 collapses to migration drop of `GoogleIntegration` + `SheetsExportRun` only.
3. Storybook stories actual count: **26** (not 18).
4. `google-oauth.service.ts` safe to drop — login uses JWT username/password + TOTP only.

## Branch Strategy

- Single branch `chore/cleanup-medium` cut from `main`.
- Phase 01 and Phase 02 commit independently (parallel-safe via file ownership).
- Phase 03 final commit + PR to `main`.

## Success Criteria (rolled-up)

- `npm run typecheck` green
- `npm run dev` boots without sheets/storybook errors
- 7 sidebar pages render
- `node_modules` smaller (record before/after du -sh)
- DB migration applied; no orphan FK to dropped models
- `docs/project-changelog.md` updated

## Validation Summary

**Validated:** 2026-05-12
**Questions asked:** 4

### Confirmed Decisions

1. **Downtime handling for Phase 02 migration:** Stop `com.smitos.dev` daemon + `cloudflared` tunnel BEFORE running `prisma migrate dev`, restart AFTER smoke test passes. Expected downtime: 5-10 min. App is live at `qdashboard.smitbox.com`.
2. **Phase 01 interim typecheck:** ACCEPT red between Phase 01 commit and Phase 02 commit. Final green gated at Phase 03. No phase split needed.
3. **Merge mode:** Merge directly to `main` after Phase 03 verify done. NO PR. Single-user repo, faster turnaround.
4. **`posthog-ui-regression-monitor.ts`:** KEEP as-is in `scripts/`. Do NOT archive. Skip the "60-day rule" inspection step in Phase 03.

### Action Items (implementer apply when executing — NOT yet in phase files)

- [ ] **Phase 02 step pre-1:** `npm run daemon:uninstall` (or `daemon:status` confirm stopped) + `npm run tunnel:stop`. Verify both down before `pg_dump` + migration.
- [ ] **Phase 02 step post-13:** After commit, `npm run daemon:install` + `npm run tunnel:start`. Smoke `https://qdashboard.smitbox.com/dashboard` from external network.
- [ ] **Phase 03 step 6:** SKIP posthog-monitor archival check (keep in `scripts/`).
- [ ] **Phase 03 step 12:** REPLACE "Open PR" with `git checkout main && git merge --no-ff chore/cleanup-medium && git push origin main`. Use `--no-ff` to preserve branch history.
- [ ] **Phase 03 todo list:** remove "Decide on posthog-ui-regression-monitor.ts" and "Open PR"; add "Restart daemon + tunnel" and "Direct merge to main".

### Risk Re-assessment

| Decision | New risk surfaced | Mitigation |
|---|---|---|
| Stop tunnel + daemon | If smoke test fails post-restart, qdashboard.smitbox.com stays down | Phase 03 must verify external access via curl from outside network before declaring done |
| Direct merge to main (no PR) | No GitHub trace of review | Local `git log --oneline chore/cleanup-medium ^main` review before merge; commit messages must be detailed |
| Accept interim red TS | Branch state between commits won't compile | Plan acceptable; final Phase 03 gate must FAIL HARD if typecheck red — no override |

### Recommendation

**Proceed to implementation.** All decisions confirmed. Implementer can read this section first before executing phases.
