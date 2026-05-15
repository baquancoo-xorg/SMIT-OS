# Phase 05 — Validation + Docs

## Context Links

- Overview: `plan.md`
- UI contract: `docs/ui-design-contract.md` §45, §567 Future Work Gate, §618 Legacy Migration Rules
- Codebase summary: `docs/codebase-summary.md`

## Overview

Priority: P0  
Status: Completed

Validate the refactor and update docs so future developers see the new component standard.

## Requirements

- Compile/typecheck after moves.
- Build before reporting complete.
- Grep for old import paths.
- Update docs that identify component source of truth.
- UI task compliance report must cite contract sections.

## Validation Commands

Required:

```bash
npm run typecheck
npm run build
```

Recommended:

```bash
npm run lint
```

Import verification:

```bash
grep -R "components/v5\|components/ads-tracker\|components/lead-tracker\|components/okr\|components/settings\|components/modals\|components/checkin" -n src --include='*.ts' --include='*.tsx'
```

## Docs Impact

Update if implementation changes paths:

- `docs/codebase-summary.md`
- `docs/ui-design-contract.md` Source of Truth lines if `v5/ui` becomes `components/ui`
- Any roadmap/changelog docs if project policy requires it

## Implementation Steps

1. Run required validation commands.
2. Fix import/type errors without changing scope.
3. Run grep for legacy paths.
4. Update docs references from `src/components/v5/**` to new canonical paths.
5. Produce final report with contract compliance:
   - §22 Button preserved.
   - §24 Card preserved.
   - §27 DataTable preserved.
   - §45 direct imports enforced.
   - §618 legacy roots migrated.

## Todo List

- [ ] Run typecheck.
- [ ] Run build.
- [ ] Run lint if practical.
- [ ] Grep old paths.
- [ ] Update docs references.
- [ ] Summarize compliance and unresolved issues.

## Success Criteria

- Typecheck passes.
- Build passes.
- No old component import paths remain unless explicitly documented as temporary bridge.
- Docs point to the new canonical component structure.

## Risks

- Docs update can drift if done before final path decisions. Update after code paths settle.
- Build may expose unrelated existing issues; distinguish pre-existing from refactor-caused.

## Security Considerations

No security behavior change expected. Confirm no secrets or env files touched.

## Next Steps

If validation passes, ask user whether to commit changes.

## Unresolved Questions

- None.
