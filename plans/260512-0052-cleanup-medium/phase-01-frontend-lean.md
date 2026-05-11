# Phase 01 — Frontend Lean (Storybook + Unused Deps)

## Context Links

- Brainstorm: `/Users/dominium/Documents/Project/SMIT-OS/plans/reports/brainstorm-260512-0052-codebase-cleanup-medium.md`
- Researcher 02 (frontend/housekeeping): `/Users/dominium/Documents/Project/SMIT-OS/plans/260512-0052-cleanup-medium/research/researcher-02-frontend-housekeeping.md`
- Overview: `./plan.md`

## Parallelization Info

- **Parallel group:** A (runs concurrently with Phase 02)
- **Blocks:** Phase 03
- **Blocked by:** none
- **Reason parallel-safe:** Owns disjoint files from Phase 02 (`package.json`, `.storybook/`, `*.stories.tsx`). Phase 02 explicitly does NOT touch `package.json` — all sheets-related dep removals routed through this phase.

## Overview

- **Priority:** P2
- **Status:** pending
- **Effort:** ~1h
- **Description:** Drop 4 unused frontend runtime deps + 2 sheets export runtime deps (proxied here for ownership safety) + 11 Storybook devDeps + 2 storybook npm scripts. Delete `.storybook/` config, local `storybook-static/`, and 26 `*.stories.tsx` files. Verify `.gitignore` covers build artifacts.

## Key Insights

- `motion` and `@headlessui/react` MUST stay (used in production code) — research overrode brainstorm.
- 26 story files confirmed via `find` (not 18).
- Stories live under `src/components/ui/*.stories.tsx` (mostly) + a few in feature folders. Owner removes by glob `src/**/*.stories.tsx`.
- Storybook devDeps cluster around `@storybook/*` + addon packages; verify exact set in current `package.json` before edit.
- `node_modules` shrink expected ~80-120MB (Storybook + xyflow + dnd-kit weight).

## Requirements

### Functional
- After phase: `npm run storybook` and `npm run build-storybook` no longer exist.
- After phase: `import "@xyflow/react"` / `@dnd-kit/*` anywhere fails (grep proves zero usage already).
- After phase: `googleapis` and `google-auth-library` removed from runtime deps.

### Non-functional
- Single atomic commit per phase.
- `npm install` runs cleanly post-edit (no peer-dep errors).
- `npm run typecheck` green at end of phase (no consumer broken).

## Architecture

No runtime behavior change. Pure dep-graph shrink. Build pipeline unaffected because Vite never referenced Storybook. Sheets runtime deps are removed here to avoid `package.json` conflict with Phase 02; Phase 02 handles code-level removal and Prisma migration.

## Related Code Files

### Modify
- `package.json` (deps, devDependencies, scripts)
- `.gitignore` (verify only — add `storybook-static/` if missing)

### Delete
- `.storybook/` (whole directory)
- `storybook-static/` (whole directory if tracked)
- `src/**/*.stories.tsx` (26 files)

### Create
- None

## File Ownership (EXCLUSIVE)

```
package.json
.gitignore
.storybook/**
storybook-static/**
src/**/*.stories.tsx
```

Phase 02 MUST NOT touch any of the above. If overlap discovered, STOP and escalate.

## Implementation Steps

1. Snapshot baseline: `du -sh node_modules` → record.
2. Read current `package.json` to confirm exact Storybook dep names + versions.
3. Edit `package.json`:
   - Remove from `dependencies`: `@xyflow/react`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `googleapis`, `google-auth-library`.
   - Remove from `devDependencies`: all `@storybook/*` packages + `storybook` + related addons (e.g., `@chromatic-com/storybook` if present).
   - Remove from `scripts`: `storybook`, `build-storybook`.
4. `rm -rf .storybook storybook-static`.
5. `find src -name "*.stories.tsx" -delete`.
6. Verify `.gitignore` includes: `logs/`, `dist/`, `storybook-static/`, `node_modules/`. Append any missing.
7. `npm install` (regenerate lockfile).
8. `npm run typecheck`.
9. Snapshot: `du -sh node_modules` → compare delta.
10. Commit: `chore(deps): drop storybook scaffold + unused frontend/sheets runtime deps`.

## Todo List

- [ ] Snapshot `du -sh node_modules` before
- [ ] Edit `package.json` dependencies (4 frontend + 2 sheets)
- [ ] Edit `package.json` devDependencies (Storybook cluster)
- [ ] Remove `storybook` + `build-storybook` scripts
- [ ] `rm -rf .storybook storybook-static`
- [ ] Delete 26 `*.stories.tsx`
- [ ] Verify `.gitignore`
- [ ] `npm install` clean
- [ ] `npm run typecheck` green
- [ ] Snapshot `du -sh node_modules` after
- [ ] Commit

## Success Criteria

- `package.json` has zero `@storybook/*`, zero `@xyflow/react`, zero `@dnd-kit/*`, zero `googleapis`, zero `google-auth-library`.
- `find . -name "*.stories.tsx" -not -path "*/node_modules/*"` returns 0.
- `.storybook` and `storybook-static` directories absent.
- `npm run typecheck` exits 0.
- `node_modules` size strictly smaller than baseline.

## Conflict Prevention

- DO NOT touch `server.ts` (Phase 02 territory).
- DO NOT touch `prisma/` (Phase 02 territory).
- DO NOT touch `src/pages/Settings.tsx` (Phase 02 territory).
- If `npm install` reveals unexpected peer-dep on a "kept" package → escalate before forcing.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Hidden import of `@dnd-kit/*` outside grep coverage | Low | Medium | `npm run typecheck` catches before commit |
| Storybook dep transitively required by another tool | Low | Low | `npm install` will warn; investigate before commit |
| `motion` mistakenly removed | Low | High | Research already flagged; explicit keep list in checklist |
| Sheets deps removed but Phase 02 not yet started → `server.ts` compile fail | Medium | Low | Acceptable interim: branch state between phases not required to typecheck server until both done. Phase 03 typecheck gate covers final state. Phase 01 typecheck targets `tsc -p tsconfig.json` (frontend) only if possible; otherwise note interim red and proceed. |

## Security Considerations

- No auth/authz surface changes.
- Removing `google-auth-library` removes one OAuth code path (Phase 02 cleans consumer).

## Next Steps

- Phase 03 will run `npm run typecheck` + `npm run dev` smoke once Phase 02 also done.

## Unresolved Questions

- Q1: Should phase 01 require server-side typecheck green, or accept interim red while Phase 02 still in-flight? (Proposed: accept red; gate at Phase 03.)
- Q2: Any `@chromatic-com/storybook` or visual-regression CI workflows pointing to Storybook? Researcher 02 didn't flag — confirm at runtime via `.github/workflows/` grep before commit.
