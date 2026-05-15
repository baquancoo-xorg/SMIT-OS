# Phase 03 — Stage 3: v5 + Legacy Cleanup + Final Polish

## Context Links

- ADR: `docs/v6/ADR-001-design-system.md` section 9 (final state)
- Phase 02 outputs: 8 routes serve từ `src/pages/v6/`, component usage catalog
- v5 directory: `src/components/v5/` (88 files, 0 expected imports sau Phase 02)
- **Pre-v5 legacy dirs** (audit 2026-05-15):
  - `src/components/dashboard/` — 41 files, 0 external imports → likely DEAD
  - `src/components/layout/` — 5 files, 0 imports → likely DEAD (orphan)
  - `src/components/board/` — 1 file, 0 imports → likely DEAD (orphan)
  - `src/components/{lead-tracker,ads-tracker,settings,checkin}/` — 25 files, imported by v5 pages → dies after Phase 02
  - `src/components/{okr,modals}/` — 3 files, 1-2 external imports → verify needed
- **Page duplicates suspect**:
  - `src/pages/LoginPage.tsx`, `DailySync.tsx`, `WeeklyCheckin.tsx`, `OKRsManagement.tsx` exist parallel với `src/pages/v5/` versions
  - App.tsx routes import từ v5/ → top-level versions có thể stale, cần verify

## Overview

- **Priority:** P0 (blocked by Phase 02)
- **Status:** blocked-by-02
- **Description:** Xóa toàn bộ `src/components/v5/` **+ tất cả legacy/orphan dirs trong `src/components/`** + stale top-level pages, rename `src/ui/components/` → `src/components/`, update imports, final polish + perf audit + memory cleanup.

## Key Insights

- v5 = legacy, không kéo dài retention sau khi 0 import (memory entry "v3 retained for 7-day eval" là precedent, nhưng v5 đã ship lâu hơn → có thể clean luôn).
- **Bigger dead code surface than initially scoped**: ~50-75 files ngoài v5/ likely DEAD (dashboard 41, layout 5, board 1 = ~47 files high confidence; thêm các dir support v5 pages dies after Phase 02).
- Rename `src/ui/components/` → `src/components/` cần codemod toàn repo (alias `@/ui/components/` → `@/components/`).
- Verify-before-delete doctrine: grep "0 external imports" có thể miss dynamic imports / lazy loads / barrel re-exports. Mỗi dir delete phải có manual verification step.
- Final polish window: catch visual inconsistency, a11y gaps, perf opportunity còn lại.
- Memory cleanup: stale "v4 SHIPPED" entry phải xóa, thay bằng "v6 = current production".

## Requirements

### Functional
- `src/components/v5/` fully deleted (88 files)
- **Legacy dirs deleted** (after verify): `dashboard/`, `layout/`, `board/`, `lead-tracker/`, `ads-tracker/`, `settings/`, `checkin/`, `okr/`, `modals/`
- **Stale top-level pages deleted** (after verify): `src/pages/{LoginPage,DailySync,WeeklyCheckin,OKRsManagement}.tsx` nếu confirm stale duplicate
- `src/ui/components/` renamed → `src/components/`
- `src/ui/lib/` renamed → `src/lib/ui/` (or merge với existing `src/lib/`)
- Path alias updated: `@/components` thay `@/ui/components` toàn repo
- Lint gate updated: paths reflect new structure
- `src/index.css.v5-backup` deleted
- `src/pages/v5/` directory: deleted hoàn toàn sau khi Phase 02 đã migrate all routes
- All imports work, no broken paths
- Final showcase route consolidated hoặc removed (decision: giữ làm developer reference?)

### Non-functional
- Bundle size cuối cùng: ideally smaller than v5 baseline (v5 có dead code annotations)
- Lighthouse all routes: ≥ 90 perf score
- a11y full audit pass
- Zero TypeScript errors
- All tests pass
- Hot-reload still fast

## Architecture

### Final state

```
src/
├── components/        # ← was src/ui/components/
│   ├── primitives/
│   ├── data/
│   ├── overlays/
│   ├── forms/
│   ├── layout/
│   ├── charts/
│   └── feedback/
├── lib/
│   ├── ui/            # ← was src/ui/lib/ (cn, motion, match-route)
│   ├── api.ts
│   └── ...
├── pages/             # v6 pages (no separate /v6/ subdir)
├── hooks/
├── contexts/
└── ...
```

### Cleanup checklist source

- v5 directory: full delete after final import scan
- v5 type stubs (nếu có): clean
- v5 specific lint rules: remove (cấm `font-black ui-canon-ok` rule no longer relevant)
- v5 docs: `docs/ui-design-contract.md` → update để reflect v6 reality, hoặc supersede bằng `docs/v6/ADR-001`
- Backup files: `src/index.css.v5-backup` delete sau confirm

## Related Code Files

### Delete
- `src/components/v5/**` (entire tree, 88 files)
- `src/components/dashboard/**` (41 files — high confidence DEAD)
- `src/components/layout/**` (5 files — orphan)
- `src/components/board/**` (1 file — orphan)
- `src/components/lead-tracker/**`, `ads-tracker/**`, `settings/**`, `checkin/**` (after v5 pages dropped)
- `src/components/okr/**`, `modals/**` (after verify pass)
- `src/pages/v5/**` (entire dir — replaced by `src/pages/v6/` từ Phase 02, sau flatten thành `src/pages/`)
- `src/pages/{LoginPage,DailySync,WeeklyCheckin,OKRsManagement}.tsx` top-level duplicates (if confirmed stale)
- `src/index.css.v5-backup`
- `docs/ui-design-contract.md` (or merge into ADR-001)
- v5-specific scripts trong `scripts/` (if any)

### Rename / move
- `src/ui/components/` → `src/components/`
- `src/ui/lib/` → `src/lib/ui/`
- `src/pages/v6/` → `src/pages/` (flatten)

### Modify (codemod)
- All import statements: `@/ui/components/...` → `@/components/...`
- All import statements: `@/ui/lib/...` → `@/lib/ui/...`
- `vite.config.ts`: ensure aliases reflect new paths
- `components.json` (shadcn): update aliases section
- `tsconfig.json` paths: update
- `scripts/ui-canon-grep.cjs`: update paths + forbidden patterns final

### DO NOT touch
- Server code, Prisma, database
- Business logic hooks, contexts, api client logic (only their imports if affected)

## Implementation Steps

1. **Pre-cleanup audit (EXPANDED)**
   - Final grep `from '@/components/v5'` — must be 0 hits
   - Final grep `from '@/ui/'` — count for codemod
   - **Per legacy dir**: grep static + dynamic imports
     - Static: `import.*from.*'@?/.*components/<dir>'`
     - Dynamic: `import\(.*<dir>` + `lazy\(.*<dir>` + `React\.lazy.*<dir>`
     - Barrel re-exports: check if `src/components/index.ts` re-exports anything from <dir>
   - **Per top-level page**: diff vs `src/pages/v5/` equivalent
     - `diff src/pages/LoginPage.tsx src/pages/v5/LoginPage.tsx` (if exists)
     - Grep App.tsx + any router for old page references
   - Bundle size snapshot before cleanup
   - **Output:** `plans/reports/dead-code-audit-<date>.md` với verified-safe-to-delete list
2. **Delete v5 components**
   - `git rm -r src/components/v5/`
   - Verify build still pass
2b. **Delete legacy dirs (one-by-one, verify after each)**
   - `git rm -r src/components/dashboard/` → build → smoke test
   - `git rm -r src/components/layout/` → build → smoke test
   - `git rm -r src/components/board/` → build → smoke test
   - Continue for each verified-dead dir
2c. **Delete stale top-level pages**
   - `git rm src/pages/{LoginPage,DailySync,WeeklyCheckin,OKRsManagement}.tsx` (only those confirmed stale)
2d. **Delete v5 pages dir**
   - `git rm -r src/pages/v5/` (sau khi Phase 02 đã migrate hết)
3. **Rename src/ui → src/components + src/lib/ui**
   - Git mv preserves history
   - Update vite aliases + tsconfig paths
4. **Codemod imports**
   - AI batch hoặc jscodeshift: rewrite all `@/ui/components/...` → `@/components/...`
   - Same cho `@/ui/lib/...` → `@/lib/ui/...`
5. **Update lint scripts**
   - `scripts/ui-canon-grep.cjs` paths + final forbidden list
6. **Update components.json + shadcn config**
7. **Final smoke test all 8 routes**
8. **Performance + a11y audit**
   - Lighthouse all routes
   - axe-core all routes
   - Bundle analyzer
9. **Docs cleanup**
   - Supersede `docs/ui-design-contract.md` or merge into ADR-001
   - Update CLAUDE.md docs map
   - Final commit `feat(v6): complete migration, retire v5`
10. **Memory cleanup**
    - Delete `feedback_v4_primary_button_signature.md`, `project_ui_rebuild_v4_plan.md` (stale)
    - Create `project_ui_v6_shipped.md` với production timestamp
    - Update relevant feedback entries if doctrine evolved
11. **Merge `feat/v6-frontend-rebuild` → main**
    - PR review (self) — squash or merge commits based on history quality

## Todo List

- [ ] Pre-cleanup grep audit (static + dynamic + barrel re-exports) → save report
- [ ] Diff top-level pages vs `src/pages/v5/` equivalents → catalog stale list
- [ ] Delete `src/components/v5/` (88 files)
- [ ] Delete `src/components/dashboard/` (41 files, high confidence)
- [ ] Delete `src/components/layout/` (5 files, orphan)
- [ ] Delete `src/components/board/` (1 file, orphan)
- [ ] Delete `src/components/{lead-tracker,ads-tracker,settings,checkin}/` (after v5 pages drop)
- [ ] Delete `src/components/{okr,modals}/` (after verify pass)
- [ ] Delete `src/pages/v5/` (entire dir)
- [ ] Delete stale top-level pages (verified stale list)
- [ ] Rename `src/ui/components/` → `src/components/`
- [ ] Rename `src/ui/lib/` → `src/lib/ui/`
- [ ] Codemod import paths repo-wide
- [ ] Update `vite.config.ts` aliases
- [ ] Update `tsconfig.json` paths
- [ ] Update `components.json` aliases
- [ ] Update `scripts/ui-canon-grep.cjs`
- [ ] Final smoke test 8 routes
- [ ] Lighthouse audit all routes ≥ 90
- [ ] axe-core audit pass
- [ ] Bundle size compare vs v5 baseline
- [ ] Delete `src/index.css.v5-backup`
- [ ] Supersede `docs/ui-design-contract.md`
- [ ] Update `CLAUDE.md` docs map
- [ ] Memory cleanup (stale v4 entries)
- [ ] Merge `feat/v6-frontend-rebuild` → main
- [ ] Tag release `v6.0.0` (optional but recommended)

## Success Criteria

1. `src/components/v5/` không tồn tại
2. `src/components/{dashboard,layout,board,lead-tracker,ads-tracker,settings,checkin,okr,modals}/` không tồn tại (only verified-dead ones)
3. `src/pages/v5/` không tồn tại
4. Stale top-level pages deleted (per verified list)
5. `src/ui/` không tồn tại (renamed)
6. All imports work, `pnpm tsc --noEmit` pass
7. `npm run build` succeed
8. All 8 routes serve correctly từ new path structure
9. Lighthouse all routes ≥ 90 perf
10. Bundle size giảm đáng kể so v5 baseline (target: -15% to -25% do dead code removal)
11. Lint gate active với final v6 rules
12. Memory entries cleaned, no stale references
13. Dead code audit report saved cho traceability
14. Branch merged, optionally tagged

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Codemod miss edge case import | Medium | High | Manual grep verify sau codemod; CI builds catch broken imports |
| Path alias xung đột vite vs tsconfig | Medium | Medium | Update đồng thời cả 2, test ngay |
| Hot-reload break sau rename | Low | Low | Restart dev server clean state |
| Bundle splitting changes | Medium | Low | Bundle analyzer compare; tweak Vite config nếu cần |
| Lost git history khi rename | Low | Medium | Dùng `git mv` không phải `mv` + `git add` |
| Memory cleanup nhầm xóa entry còn relevant | Medium | Low | Backup memory dir trước cleanup |
| `docs/ui-design-contract.md` references còn trong CLAUDE.md hoặc memory | Medium | Low | Grep audit trước khi xóa, update references |
| Recent ads-page screenshot reference stale | Low | Low | Delete after migration done |
| Dynamic import / `React.lazy` ở dead dir bị miss | Medium | High | Audit step 1 specifically grep `import\(`, `lazy(`, barrel files; delete one-by-one with build verify |
| Top-level page là production route khác với v5/ version | Low | High | Diff content + grep App.tsx import paths trước khi xóa |
| Storybook v6 còn import từ legacy dir | Low | Medium | Audit storybook entries cuối Phase 02 |
| Git history mất khi xóa legacy dir | Low | Low | `git rm` preserve history; tag pre-cleanup commit để dễ revert |

## Security Considerations

- File rename không expose new attack surface
- Path alias change không bypass any security middleware (server-side untouched)
- Removing `docs/ui-design-contract.md`: verify không có script CI depend on it
- Memory cleanup: không xóa security-related memory entries (none currently exist, but verify)

## Next Steps

- **Blocked by:** Phase 02 completion + Dominium approve
- **Unblocks:** Future feature work on clean v6 foundation
- **Follow-up:**
  - Optional: Storybook deploy thành standalone (Chromatic, Vercel)
  - Optional: Component docs site (Mintlify) nếu team mở rộng
  - Optional: Visual regression CI (Playwright + percy/chromatic)
  - Decision: retire `/v6-storybook` route hay giữ làm dev tool?
