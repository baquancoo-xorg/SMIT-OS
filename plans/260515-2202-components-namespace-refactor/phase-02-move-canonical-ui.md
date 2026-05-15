# Phase 02 — Move Canonical UI

## Context Links

- Overview: `plan.md`
- UI contract: `docs/ui-design-contract.md` §22, §24, §27, §45

## Overview

Priority: P0  
Status: Completed

Move canonical UI primitives from `src/components/v5/ui/**` to `src/components/ui/**`.

## Requirements

- Preserve component behavior and styling.
- Preserve chart wrappers under `src/components/ui/charts/**`.
- Update imports to direct file imports per §45.
- Avoid introducing new barrel imports.

## Architecture

`src/components/ui/**` becomes the canonical primitive layer:

- Button: §22 Button contract.
- Card/KpiCard/GlassCard: §24 Card contract.
- DataTable/table helpers: §27 DataTable contract.
- Charts: chart taxonomy remains under `ui/charts`.

## Related Code Files

Move:

- `src/components/v5/ui/**` → `src/components/ui/**`

Update imports in:

- `src/pages/**`
- `src/components/**`
- `src/hooks/**`

## Implementation Steps

1. Move `src/components/v5/ui` to `src/components/ui`.
2. Update imports from `components/v5/ui/<file>` to `components/ui/<file>`.
3. Replace barrel imports from `components/v5/ui` with direct imports.
4. Keep `index.ts` only if still needed temporarily; do not add new imports to it.
5. Run `npm run typecheck`.

## Todo List

- [ ] Move UI primitive files.
- [ ] Move chart files.
- [ ] Update direct imports.
- [ ] Remove or quarantine obsolete UI barrel usage.
- [ ] Run typecheck.

## Success Criteria

- No imports from `src/components/v5/ui` remain.
- UI primitive imports are direct where practical.
- Typecheck passes.

## Risks

- Many current files import from `../../components/v5/ui`; mass update must be reviewed.
- Removing `index.ts` too early can create noisy failures. Prefer direct imports first, delete bridge later.

## Security Considerations

No auth/data security change. Preserve accessibility props while moving files.

## Next Steps

Proceed to Phase 03 after typecheck passes.

## Unresolved Questions

- Whether to delete `src/components/ui/index.ts` immediately or keep as temporary bridge while direct imports are migrated.
