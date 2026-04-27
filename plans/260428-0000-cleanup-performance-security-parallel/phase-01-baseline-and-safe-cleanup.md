---
title: "Phase 01 u2014 Baseline + Safe Cleanup"
status: complete
priority: P1
effort: 1h
---

# Phase 01 u2014 Baseline + Safe Cleanup

## Context Links
- Research: `research/researcher-frontend-cleanup-validation.md` u00a7 1
- Plan: `plan.md`

---

## Parallelization Info

- **Mode:** Sequential gate u2014 must complete before any other phase starts
- **Blocks:** Phase 02, 03, 04, 05
- **Blocked by:** nothing
- **File conflicts:** none (deletes only)

---

## Overview

Delete confirmed dead frontend files. Establish baseline typecheck + build pass. No logic changes.

**Priority:** P1 | **Status:** complete

---

## Key Insights

- All 4 files confirmed zero imports via full-src grep scan.
- `ProtectedRoute.tsx` u2014 auth handled at context level; deletion is safe.
- Three hooks (`use-users`, `use-objectives`, `use-sprints`) have no callers inside or outside their own files.
- Build failure after delete = missed import; revert only that specific file.

---

## Requirements

- Functional: remove dead code without breaking any runtime behavior.
- Non-functional: `npx tsc --noEmit` and `npm run build` both pass after deletions.

---

## Architecture

No structural change. Deletion reduces surface area before parallel tracks diverge.

---

## Related Code Files

**Delete:**
- `src/components/ProtectedRoute.tsx`
- `src/hooks/use-users.ts`
- `src/hooks/use-objectives.ts`
- `src/hooks/use-sprints.ts`

**Read (verify imports before delete):**
- `src/App.tsx`
- `src/` (grep scan)

---

## File Ownership

| File | Action |
|------|--------|
| `src/components/ProtectedRoute.tsx` | DELETE |
| `src/hooks/use-users.ts` | DELETE |
| `src/hooks/use-objectives.ts` | DELETE |
| `src/hooks/use-sprints.ts` | DELETE |

No other phase touches these files.

---

## Implementation Steps

1. Pre-delete import audit:
   ```bash
   grep -rn 'ProtectedRoute' src/ --include='*.ts' --include='*.tsx'
   grep -rn 'use-users\|use-objectives\|use-sprints\|useUsers\|useObjectives\|useSprints' src/ --include='*.ts' --include='*.tsx'
   ```
   If any result found outside the file itself u2192 stop, report, do not delete that file.

2. Delete files:
   ```bash
   rm src/components/ProtectedRoute.tsx
   rm src/hooks/use-users.ts
   rm src/hooks/use-objectives.ts
   rm src/hooks/use-sprints.ts
   ```

3. Run baseline validation:
   ```bash
   npx tsc --noEmit
   npm run build
   ```

4. If build fails: re-add the specific deleted file and flag it as "needs import audit" u2014 proceed with remaining deletions.

5. Start dev server, confirm app loads:
   ```bash
   npm run dev
   # Open localhost:3000, login, navigate to Dashboard
   ```

6. Commit:
   ```
   chore: remove confirmed dead frontend files
   ```

---

## Todo List

- [x] Grep audit: confirm zero imports for all 4 files
- [x] Delete `ProtectedRoute.tsx`
- [x] Delete `use-users.ts`
- [x] Delete `use-objectives.ts`
- [x] Delete `use-sprints.ts`
- [x] `npx tsc --noEmit` passes
- [x] `npm run build` passes
- [x] Dev server loads without error
- [x] Commit pushed

---

## Success Criteria

- Zero grep hits for deleted identifiers in `src/`
- `npx tsc --noEmit` exits 0
- `npm run build` exits 0
- App loads and dashboard renders in browser

---

## Conflict Prevention

- This phase owns only deleted files; no other phase can conflict.
- No edits to surviving files.
- Complete and merge before signaling Phase 02/03/04/05 to start.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Hook imported via barrel/alias | Low | Med | Grep for both filename and export name before delete |
| Dynamic import of ProtectedRoute | Very Low | Low | Search `import(` pattern as well |

---

## Security Considerations

- `ProtectedRoute.tsx` deletion is safe: auth enforced in context/middleware, not this component.
- No auth surface change.

---

## Next Steps

After this phase is committed and green:
- Signal Phase 02 (backend) and Phase 05 (frontend caching) to start in parallel.
- Phase 03 waits for Phase 02 to complete.
- Phase 04 can start after Phase 01 (no dependency on Phase 02).
