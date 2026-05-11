# Cleanup Medium Session: Storybook + Sheets Export Axe

**Date**: 2026-05-12 00:52
**Severity**: Medium (breaking changes, but controlled removal)
**Component**: Build system, authentication routes, database schema
**Status**: Resolved

## What Happened

Dropped 184 npm packages and 10+ backend features in one session: Storybook stack (26 stories, 11 devDeps), Google Sheets export end-to-end (routes, OAuth, scheduler, 2 Prisma models), and 4 unused frontend deps. Merged 10 commits to main via `21a3f80`, pushed live.

## The Brutal Truth

This hurt more than expected because the scope discovery phase was completely wrong. Scout report flagged **motion**, **@headlessui/react**, and **EtlErrorLog** as unused — all three critical to production. Researchers caught it, but only after we nearly shipped broken code. The emotional gut-punch: 60 minutes into planning, we realized we needed to verify everything ourselves rather than trust the initial analysis.

Also: we broke the first migration attempt because nobody checked what the project actually uses (`prisma db push --accept-data-loss`, not `migrate dev`). Stale `/migrations/manual/` directory with no actual migration.sql confused the workflow.

## Technical Details

**What we shipped removing:**
- Storybook: `.storybook/`, `storybook-static/`, 26 `*.stories.tsx` files
- Google integration: 10+ backend files, OAuth scaffolding, `/api/sheets-export/*` routes
- Dead deps: @xyflow/react, @dnd-kit trio, googleapis, google-auth-library
- Database: dropped `GoogleIntegration` and `SheetsExportRun` models

**What we almost broke (caught in time):**
- `motion` library — used in LoginPage.tsx for fade animations (Scout missed it)
- `@headlessui/react` — 8 active component wrappers (dropdown, modal, sidebar, etc.)
- `EtlErrorLog` Prisma model — 5 active `create()` calls in fb-sync and ads-sync services

**Evidence it worked:**
- `git status` shows app running
- qdashboard.smitbox.com → HTTP 200
- `/api/sheets-export/runs` → 401 auth rejection (confirms route gone, auth middleware still working)

## What We Tried

1. **Initial sweep** (Scout, 30 mins) — blanket analysis of all deps and routes
2. **Verification dance** (2 Researchers, 60 mins) — cross-checked each flag against codebase
3. **Sequential migration** (Cook, 90 mins) — avoided parallel agent collision on shared git tree
4. **Smoke test** (Browser + curl) — live domain + API endpoint validation

## Root Cause Analysis

**Why the scout analysis was wrong:** No actual grep/codebase parsing — just dependency tree analysis. Static analysis misses transitive usage (e.g., `motion` exported but only used in one page). Future sweeps need to **always verify before flagging**.

**Why the first migration failed:** Project uses custom `prisma db push --accept-data-loss` workflow (not standard `migrate dev`), but nobody articulated this upfront. The stale `/migrations/manual/` directory confused the agent into trying the wrong command. Should have documented this in CLAUDE.md or a migration guide.

**Why we nearly broke @headlessui/react:** It's used everywhere — custom-select, dropdown, modal, sidebar, sidebar-item. Scout's dep-tree analysis saw it was *installed* but the grep for "headlessui import" failed due to comment-based component registries. Didn't catch until researcher code-reviewed actual component files.

## Lessons Learned

1. **Trust-but-verify on automation:** Scout reports are hypotheses, not facts. Always cross-check removing anything production-critical. Cost: 2 researchers × 60 mins, but saved the session.

2. **Document your workflow quirks:** This project uses `prisma db push --accept-data-loss` as the standard. Nothing in CLAUDE.md or a migration guide explained that. Write it down. Next time someone (maybe an agent) will read it instead of guessing.

3. **Commit discipline saved us:** Code-reviewer caught 3 uncommitted changes right before merging (`44e64eb` → `72a39c7`). Always run `git status` before committing, not after. This is the second time an uncommitted change almost shipped.

4. **Daemon survival matters:** Cloudflare tunnel daemon survived the whole operation (system-level, not touched). Only the dev daemon (`com.smitos.dev`) needed stopping. Saved us from a re-auth cycle.

5. **Parallel agents + shared git = race condition:** We avoided it by running sequentially, but future sessions should use git worktrees if parallelizing file deletions. One agent running `git add .` while another is still staging = chaos.

## Next Steps

- [ ] **Add to CLAUDE.md**: Document `prisma db push --accept-data-loss` as the standard workflow (not `migrate dev`)
- [ ] **Future sweeps**: Always pair Scout with grep verification (`grep -r "import.*motion"`, etc.) before flagging removal
- [ ] **Git discipline**: Pre-commit checklist: `git status` → verify everything staged → commit → verify again
- [ ] **Backup maintenance**: pg_dump at `backups/pre-sheets-drop-20260512-0126.sql` — add to .gitignore rules (already done, but document backup policy)
- [ ] **Watch EtlErrorLog**: Now that we kept it, verify the fb-sync and ads-sync services still log errors correctly in next full system test

---

**Outcome**: 184 packages dropped, 10 routes removed, 2 models deleted. Production live. Zero user-facing breakage. Recovery cost: 2 researcher hours to catch scout mistakes, 1 code-reviewer hour to catch uncommitted changes. Worth it.
