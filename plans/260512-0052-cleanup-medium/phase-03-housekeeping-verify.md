# Phase 03 — Housekeeping + Verification

## Context Links

- Researcher 02 (housekeeping): `/Users/dominium/Documents/Project/SMIT-OS/plans/260512-0052-cleanup-medium/research/researcher-02-frontend-housekeeping.md`
- Brainstorm: `/Users/dominium/Documents/Project/SMIT-OS/plans/reports/brainstorm-260512-0052-codebase-cleanup-medium.md`
- Overview: `./plan.md`

## Parallelization Info

- **Parallel group:** B (sequential, runs ONLY after Phase 01 + Phase 02 both completed)
- **Blocks:** PR open
- **Blocked by:** Phase 01, Phase 02
- **Reason sequential:** Needs final tree state to typecheck + smoke + write changelog entry.

## Overview

- **Priority:** P2
- **Status:** completed
- **Effort:** ~1h (actual)
- **Description:** Repo hygiene + final verification gate. Relocate `DATABASE.md` into `docs/`, archive 4 one-time backfill/seed scripts, clean local build artifacts, run full typecheck + dev smoke across 7 sidebar pages, append changelog.

## Key Insights

- `DATABASE.md` referenced from `README.md:89` → must update relative path when moved.
- One-time scripts (research-confirmed): `backfill-crm-leads.ts`, `backfill-lead-source.ts`, `seed-exchange-rate.ts`, `seed-okrs.ts`. Move to `scripts/archive/`.
- `posthog-ui-regression-monitor.ts` — last-run unknown; decide via `git log` inspection (keep if recent, archive if stale).
- `logs/`, `dist/`, `storybook-static/` are LOCAL artifacts only — rm safe; verify `.gitignore` covers all three.
- `backups/` (from Phase 02) must be gitignored if not already.

## Requirements

### Functional
- `docs/DATABASE.md` exists; root-level `DATABASE.md` removed.
- `README.md` link updated to `./docs/DATABASE.md`.
- 4 one-time scripts live under `scripts/archive/`.
- `logs/`, `dist/`, `storybook-static/` not present locally.
- `npm run typecheck` exits 0.
- `npm run dev` boots; 7 sidebar pages render without console error.
- `docs/project-changelog.md` has new entry dated 2026-05-12.

### Non-functional
- Final commit message conventional-commits style.
- PR description references all 3 phase files.

## Architecture

Pure file relocation + verification. No runtime behavior change.

## Related Code Files

### Modify
- `README.md` (update `DATABASE.md` link from `./DATABASE.md` → `./docs/DATABASE.md`).
- `docs/project-changelog.md` (append entry).
- `.gitignore` (add `backups/` if missing; verify `logs/`, `dist/`, `storybook-static/`).

### Move
- `DATABASE.md` → `docs/DATABASE.md` (use `git mv`).
- `scripts/backfill-crm-leads.ts` → `scripts/archive/backfill-crm-leads.ts`.
- `scripts/backfill-lead-source.ts` → `scripts/archive/backfill-lead-source.ts`.
- `scripts/seed-exchange-rate.ts` → `scripts/archive/seed-exchange-rate.ts`.
- `scripts/seed-okrs.ts` → `scripts/archive/seed-okrs.ts`.

### Conditionally Move
- `scripts/posthog-ui-regression-monitor.ts` — move only if `git log` shows no execution evidence in last 60 days.

### Delete (local only)
- `logs/`, `dist/`, `storybook-static/` (untracked artifacts).

### Create
- `scripts/archive/` directory.

## File Ownership (EXCLUSIVE)

```
DATABASE.md  (move source)
docs/DATABASE.md  (move target)
README.md
docs/project-changelog.md
scripts/archive/**
scripts/{backfill-crm-leads,backfill-lead-source,seed-exchange-rate,seed-okrs,posthog-ui-regression-monitor}.ts
.gitignore (incremental add only)
logs/, dist/, storybook-static/ (local rm)
backups/ (verify gitignored)
```

## Implementation Steps

1. Confirm Phase 01 + Phase 02 both committed on `chore/cleanup-medium`.
2. `git mv DATABASE.md docs/DATABASE.md`.
3. Edit `README.md`: replace `./DATABASE.md` with `./docs/DATABASE.md` at line 89.
4. `mkdir -p scripts/archive`.
5. `git mv` the 4 one-time scripts into `scripts/archive/`.
6. Inspect `posthog-ui-regression-monitor.ts`:
   ```
   git log --since="60 days ago" --name-only -- scripts/posthog-ui-regression-monitor.ts
   ```
   If no commits + no `package.json` script references it → `git mv` to archive. Else keep.
7. `rm -rf logs dist storybook-static` (local, untracked).
8. Verify `.gitignore` contains: `logs/`, `dist/`, `storybook-static/`, `backups/`, `node_modules/`. Append any missing.
9. **Full verification:**
   - `npm run typecheck` → must exit 0.
   - `npm run dev` → wait for "ready", then open each sidebar page (Dashboard, Daily Sync, Weekly Checkin, Ads Tracker, Lead Tracker, Media Tracker, OKRs, Settings). Confirm no console error and Settings tab list missing "Sheets Export".
   - Hit `curl localhost:3000/api/sheets-export/runs` → expect 404.
10. Append `docs/project-changelog.md` entry:
    ```
    ## 2026-05-12 — Cleanup (Medium)
    - chore(deps): drop storybook scaffold + 4 unused frontend deps + 2 sheets runtime deps
    - feat(cleanup): remove google sheets export domain (routes + services + scheduler + UI tab)
    - refactor(db): drop Prisma models GoogleIntegration + SheetsExportRun (migration: drop-sheets-export-models)
    - chore(repo): relocate DATABASE.md to docs/, archive 4 one-time scripts
    ```
11. Commit: `chore(repo): relocate docs, archive one-time scripts, update changelog`.
12. Open PR from `chore/cleanup-medium` → `main`. Body references all 3 phase files + lists migration name + DB backup path.

## Todo List

- [x] Verify Phase 01 + Phase 02 committed
- [x] `git mv DATABASE.md → docs/DATABASE.md`
- [x] Update README.md ref
- [x] Create `scripts/archive/`
- [x] Move 4 one-time scripts
- [x] Decide on `posthog-ui-regression-monitor.ts` via git log
- [x] `rm -rf logs dist storybook-static`
- [x] Verify `.gitignore` (logs, dist, storybook-static, backups)
- [x] `npm run typecheck` exits 0
- [x] `npm run dev` boots
- [x] Smoke 7 sidebar pages
- [x] `/api/sheets-export/runs` returns 404
- [x] Append `docs/project-changelog.md`
- [x] Commit
- [x] Merge to main (direct merge, no PR per plan decision)

## Success Criteria

- `ls DATABASE.md 2>&1 | grep "No such"` (root-level gone).
- `cat docs/DATABASE.md | wc -l` > 0.
- `ls scripts/archive/*.ts` shows ≥ 4 files.
- `npm run typecheck` → exit 0.
- `npm run dev` → 7 pages OK, sheets endpoint 404.
- `grep "2026-05-12" docs/project-changelog.md` matches new entry.
- PR opened against `main`.

## Conflict Prevention

- All other phases done before this starts. No concurrency risk.
- Only edits `README.md`, `docs/project-changelog.md`, `.gitignore`. No code/schema edits.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `npm run typecheck` fails due to lingering reference | Medium | Medium | Fix in place: grep error, decide which phase owner edits a fix-up commit; do NOT mask error |
| Sidebar page smoke reveals broken Settings tab | Low | Medium | Re-open Phase 02; re-verify edits |
| `posthog-ui-regression-monitor.ts` still wired in CI | Low | Low | Step 6 git log + grep CI workflows before archiving |
| `.gitignore` missing `backups/` → DB dump committed | Medium | High | Step 8 explicit add; double-check `git status` before commit |
| `README.md` has additional refs to `DATABASE.md` beyond line 89 | Low | Low | `grep -rn "DATABASE.md"` after move; fix any stragglers |

## Security Considerations

- `backups/` MUST be gitignored before commit (contains DB dump with credentials/PII).
- No new auth surface; verification only.

## Next Steps

- After PR merge, monitor server logs 24h for any orphan reference / scheduler error.
- Update `docs/system-architecture.md` if it references sheets export domain (out of scope here, follow-up task).

## Unresolved Questions

- Q1: Should `docs/system-architecture.md` be updated in this phase or a follow-up doc task? (Proposed: follow-up — keep this phase focused on cleanup gate.)
- Q2: Is there a `.github/workflows/` step running `npm run storybook` or `build-storybook`? If yes, must remove there too — grep before final commit.
- Q3: Should we also drop `posthog` MCP-related deps if not used in app code? Out of scope per current research, defer.
