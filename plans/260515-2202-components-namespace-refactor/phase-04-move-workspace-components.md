# Phase 04 — Move Workspace Components

## Context Links

- Overview: `plan.md`
- UI contract: `docs/ui-design-contract.md` §618 Legacy Migration Rules
- Codebase summary: `docs/codebase-summary.md` V5 Workspace Routes

## Overview

Priority: P1  
Status: Completed

Move domain-specific components into `src/components/workspace/**` so `src/components` reads as a professional system: primitives, layout, workspace modules.

## Requirements

- Do one workspace group at a time.
- Preserve behavior and public route UI.
- Prefer kebab-case filenames.
- Avoid new barrels.
- Remove legacy roots only after grep confirms zero imports.

## Architecture

Workspace target:

```txt
src/components/workspace/
  dashboard/
  growth/
    ads/
    lead/
    media/
  execution/
    okr/
    checkin/
    daily-sync/
  intelligence/
  admin/
```

## Related Code Files

Move groups:

| Current | Target |
|---|---|
| `src/components/v5/dashboard/**` | `src/components/workspace/dashboard/**` |
| `src/components/v5/growth/ads/**` | `src/components/workspace/growth/ads/**` |
| `src/components/ads-tracker/**` | `src/components/workspace/growth/ads/**` |
| `src/components/v5/growth/lead/**` | `src/components/workspace/growth/lead/**` |
| `src/components/lead-tracker/**` | `src/components/workspace/growth/lead/**` |
| `src/components/v5/growth/media/**` | `src/components/workspace/growth/media/**` |
| `src/components/v5/execution/**` | `src/components/workspace/execution/daily-sync/**` or appropriate execution subfolder |
| `src/components/okr/**` | `src/components/workspace/execution/okr/**` |
| `src/components/checkin/**` | `src/components/workspace/execution/checkin/**` |
| `src/components/modals/WeeklyCheckinModal.tsx` | `src/components/workspace/execution/checkin/weekly-checkin-modal.tsx` |
| `src/components/v5/intelligence/**` | `src/components/workspace/intelligence/**` |
| `src/components/v5/admin/**` | `src/components/workspace/admin/**` |
| `src/components/settings/**` | `src/components/workspace/admin/settings/**` |
| `src/components/v5/integrations/**` | `src/components/workspace/admin/integrations/**` |

## Implementation Steps

1. Move dashboard group, update imports, typecheck.
2. Move growth/ads group, update imports, typecheck.
3. Move growth/lead group, update imports, typecheck.
4. Move growth/media group, update imports, typecheck.
5. Move execution groups, update imports, typecheck.
6. Move intelligence/admin groups, update imports, typecheck.
7. Grep legacy roots and delete empty folders only after zero imports.

## Todo List

- [ ] Move dashboard components.
- [ ] Move growth ads components.
- [ ] Move growth lead components.
- [ ] Move growth media components.
- [ ] Move execution components.
- [ ] Move intelligence components.
- [ ] Move admin/settings/integrations components.
- [ ] Delete empty legacy roots after verification.

## Success Criteria

- No page imports from legacy roots remain.
- `src/components/workspace/**` owns all domain-specific components.
- `src/components/ui/**` remains free of business-specific code.
- Typecheck passes after each group or at minimum after phase completion.

## Risks

- Some files may be genuinely legacy but still imported by non-v5 pages. Do not delete until verified.
- Settings components currently have an `index.ts`; direct import migration can be noisy.

## Security Considerations

Preserve admin-only UI assumptions. Backend RBAC remains authoritative.

## Next Steps

Proceed to Phase 05 after all workspace moves compile.

## Unresolved Questions

- Exact target for each `v5/execution/**` file should be confirmed during inventory.
