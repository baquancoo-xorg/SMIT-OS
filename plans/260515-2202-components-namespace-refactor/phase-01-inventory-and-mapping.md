# Phase 01 — Inventory + Mapping

## Context Links

- Overview: `plan.md`
- UI contract: `docs/ui-design-contract.md` §45, §618
- Codebase summary: `docs/codebase-summary.md` Key Directories

## Overview

Priority: P0  
Status: Completed

Tạo inventory chính xác trước khi move file. Không sửa source trong phase này ngoài plan/checklist nếu cần.

## Requirements

- Liệt kê toàn bộ folders/files dưới `src/components`.
- Phân loại từng folder: canonical UI, layout shell, workspace/domain, legacy/orphan.
- Grep import usage cho từng legacy root và `v5/*`.
- Xác định file nào đang có uncommitted changes để tránh overwrite.

## Related Code Files

Read-only:

- `src/components/**`
- `src/pages/**`
- `src/hooks/**`
- `src/App.tsx`

## Implementation Steps

1. Run inventory:
   - `find src/components -maxdepth 4 -type f \( -name '*.ts' -o -name '*.tsx' \) | sort`
2. Run import scan:
   - grep for `components/v5`, `components/ads-tracker`, `components/lead-tracker`, `components/okr`, `components/settings`, `components/modals`, `components/checkin`.
3. Build mapping table from current path to target path.
4. Flag files with PascalCase names for kebab-case rename.
5. Check `git status --short` and preserve existing user changes.

## Initial Mapping Recommendation

| Current | Target |
|---|---|
| `src/components/v5/ui/**` | `src/components/ui/**` |
| `src/components/v5/ui/charts/**` | `src/components/ui/charts/**` |
| `src/components/v5/layout/**` | `src/components/layout/**` |
| `src/components/v5/dashboard/**` | `src/components/workspace/dashboard/**` |
| `src/components/v5/growth/ads/**` + `src/components/ads-tracker/**` | `src/components/workspace/growth/ads/**` |
| `src/components/v5/growth/lead/**` + `src/components/lead-tracker/**` | `src/components/workspace/growth/lead/**` |
| `src/components/v5/growth/media/**` | `src/components/workspace/growth/media/**` |
| `src/components/v5/execution/**` | `src/components/workspace/execution/**` |
| `src/components/okr/**` | `src/components/workspace/execution/okr/**` |
| `src/components/checkin/**` + `src/components/modals/WeeklyCheckinModal.tsx` | `src/components/workspace/execution/checkin/**` |
| `src/components/v5/intelligence/**` | `src/components/workspace/intelligence/**` |
| `src/components/v5/admin/**` + `src/components/settings/**` | `src/components/workspace/admin/**` |
| `src/components/v5/integrations/**` | `src/components/workspace/admin/integrations/**` |

## Todo List

- [ ] Inventory component files.
- [ ] Inventory imports.
- [ ] Confirm target mapping.
- [ ] Identify rename-only files.
- [ ] Identify potential orphan files.

## Success Criteria

- Mapping table is complete before file moves.
- No ambiguous destination remains.
- User-owned uncommitted changes are known before refactor.

## Risks

- Moving before inventory can break imports silently.
- `index.ts` barrels can hide usage. Grep direct and indirect imports.

## Security Considerations

No security behavior change expected.

## Next Steps

Proceed to Phase 02 only after mapping is complete.

## Unresolved Questions

- None.
