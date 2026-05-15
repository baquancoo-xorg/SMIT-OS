# Phase 03 — Move Layout

## Context Links

- Overview: `plan.md`
- UI contract: `docs/ui-design-contract.md` §9 App Shell, §10 Sidebar, §11 Header, §12 Mobile Drawer, §45
- Codebase summary: `docs/codebase-summary.md` Frontend Entry

## Overview

Priority: P0  
Status: Completed

Move app shell files from `src/components/v5/layout/**` to `src/components/layout/**`.

## Requirements

- Preserve authenticated shell behavior.
- Preserve sidebar/header/mobile drawer behavior.
- Keep route-level imports direct.
- No visual redesign in this phase.

## Architecture

`src/components/layout/**` owns global chrome only:

- app shell
- sidebar
- header
- mobile nav drawer
- workspace nav items

No page-specific styling should move into layout.

## Related Code Files

Move:

- `src/components/v5/layout/header-v5.tsx`
- `src/components/v5/layout/mobile-nav-drawer.tsx`
- `src/components/v5/layout/sidebar-v5.tsx`
- `src/components/v5/layout/v5-shell.tsx`
- `src/components/v5/layout/workspace-nav-items.ts`

Likely rename targets:

- `v5-shell.tsx` → `app-shell.tsx`
- `header-v5.tsx` → `app-header.tsx`
- `sidebar-v5.tsx` → `app-sidebar.tsx`

## Implementation Steps

1. Move layout files to `src/components/layout`.
2. Rename versioned filenames if import churn is already being handled.
3. Update `src/App.tsx` and related imports.
4. Update layout-to-ui imports to point at `src/components/ui/*`.
5. Run `npm run typecheck`.

## Todo List

- [ ] Move layout files.
- [ ] Rename versioned layout filenames.
- [ ] Update app imports.
- [ ] Update internal UI imports.
- [ ] Run typecheck.

## Success Criteria

- No imports from `src/components/v5/layout` remain.
- Layout filenames no longer encode `v5`.
- Authenticated shell still compiles.

## Risks

- Sidebar currently has uncommitted changes; preserve diff carefully.
- Route navigation can break if path imports are updated mechanically without checking relative depth.

## Security Considerations

Preserve logout/destructive nav separation per UI contract §12b.

## Next Steps

Proceed to Phase 04 after layout compiles.

## Unresolved Questions

- None.
