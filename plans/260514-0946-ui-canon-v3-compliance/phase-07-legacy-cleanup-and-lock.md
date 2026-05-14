# Phase 7 — Legacy Cleanup + Lock

## Context Links
- Parent: [plan.md](plan.md)
- Prev: [phase-06-page-refactor.md](phase-06-page-refactor.md)
- Contract: `docs/ui-design-contract.md` §28 (legacy DataTable bridge), Legacy Migration Rules table
- D10 hard gate: codify via ESLint custom rule

## Overview
- **Date:** 2026-05-14
- **Priority:** P1
- **Status:** pending
- **Description:** Delete `src/components/ui/*` duplicates, migrate legacy table/segmented-tabs consumers, install ESLint custom rule to enforce canon, archive playground HTML sealed, bump contract to final v3.0 release.

## Key Insights
- ESLint custom rule = permanent enforcement (CI grep gate becomes redundant for code, kept for CSS).
- Playground HTML must be archived `read-only` semantically — no further edits.
- Contract v3.0 final release with all phases' learnings incorporated.
- PR template update institutionalizes 4 DoD checklist.

## Requirements

### Functional
- Audit `src/components/ui/*` — delete any with v5 equivalent.
- Migrate `dashboard/ui/segmented-tabs` consumers → TabPill.
- Migrate legacy table consumers → DataTable.
- Author ESLint custom rule `eslint-rules/ui-canon.cjs` enforcing forbidden patterns (replaces grep script for code).
- Update PR template `.github/PULL_REQUEST_TEMPLATE.md` with 4 DoD checklist.
- Archive `docs/ref-ui-playground/Playground .html` sealed (frozen — README notes "no edits").
- Bump `docs/ui-design-contract.md` to final v3.0 release notes.

### Non-Functional
- ESLint rule passes existing v5 code (no false positives).
- ESLint rule fails on test fixtures with forbidden patterns.
- PR template enforces structured DoD.
- Re-snapshot final visual baseline post-cleanup.

## Architecture
```
eslint-rules/
└── ui-canon.cjs              (NEW — custom ESLint rule)
.eslintrc.cjs                 (extend — register rule)
.github/
└── PULL_REQUEST_TEMPLATE.md  (NEW or update)
docs/ref-ui-playground/
├── README.md                 (NEW — "frozen, no edits" notice)
└── Playground .html          (untouched, archived)
docs/ui-design-contract.md    (final v3.0 release notes)
```

ESLint rule signature:
```js
module.exports = {
  meta: { type: 'problem', docs: { description: 'UI canon enforcement' } },
  create(context) {
    return {
      Literal(node) { /* hex / bg-white / shadow-lg|xl / rounded-xl|2xl detect */ }
    };
  }
};
```

## Related Code Files
**Delete (after audit):**
- `src/components/ui/*` files duplicating v5 (audit first)

**Modify:**
- Consumers of `dashboard/ui/segmented-tabs` → switch to `v5/ui/tab-pill`
- Consumers of legacy table → switch to `v5/ui/data-table`
- `.eslintrc.cjs` (register custom rule)
- `docs/ui-design-contract.md` (final v3.0)
- `package.json` (add eslint-rules path)

**Create:**
- `eslint-rules/ui-canon.cjs`
- `eslint-rules/ui-canon.test.cjs` (rule fixtures)
- `.github/PULL_REQUEST_TEMPLATE.md`
- `docs/ref-ui-playground/README.md`

## Implementation Steps
1. Audit `src/components/ui/*` — list each file + check usage with grep.
2. For each `components/ui/*` with v5 equivalent:
   - Find all consumers via grep.
   - Update imports to `v5/ui/*`.
   - Delete duplicate file.
3. Audit `dashboard/ui/segmented-tabs` consumers → migrate to `v5/ui/tab-pill`.
4. Audit legacy table consumers (any not on `v5/ui/data-table`) → migrate.
5. Author `eslint-rules/ui-canon.cjs`:
   - Detect hex literals in className strings.
   - Detect `bg-white|text-white|border-white`.
   - Detect `shadow-lg|shadow-xl|shadow-2xl`.
   - Detect `rounded-xl|rounded-2xl|rounded-3xl`.
   - Detect `font-black` (allow with `// eslint-disable-next-line ui-canon/no-font-black -- hero|kpi`).
6. Author `eslint-rules/ui-canon.test.cjs` — test fixtures for each pattern.
7. Register rule in `.eslintrc.cjs` + scope to `src/components/v5/**` + `src/pages/v5/**`.
8. Run `npm run lint` — must pass.
9. Author `.github/PULL_REQUEST_TEMPLATE.md`:
   - Summary section
   - 4 DoD checklist (Visual / Token grep / A11y+Perf / Contract cite)
   - Future Work Gate checkbox
10. Author `docs/ref-ui-playground/README.md`:
    - "Frozen canon — DO NOT EDIT"
    - Pointer to DESIGN.md + Stitch screens for extensions
    - Pointer to contract §49 (Stitch ref index)
11. Update `docs/ui-design-contract.md`:
    - Final v3.0 release notes section
    - Changelog: §47-§51 + cross-ref updates
    - Frontmatter `status: stable` (or equivalent)
12. Re-snapshot Playwright baseline final state.
13. Smoke test full app — every page renders dark + light.

## Todo List
- [ ] Audit `src/components/ui/*` — usage map
- [ ] Migrate consumers of `components/ui/*` duplicates → `v5/ui/*`
- [ ] Delete `components/ui/*` duplicates
- [ ] Migrate `dashboard/ui/segmented-tabs` consumers → TabPill
- [ ] Migrate legacy table consumers → DataTable
- [ ] Author `eslint-rules/ui-canon.cjs`
- [ ] Author `eslint-rules/ui-canon.test.cjs` fixtures
- [ ] Register rule in `.eslintrc.cjs` (scoped to v5 paths)
- [ ] `npm run lint` clean
- [ ] Author `.github/PULL_REQUEST_TEMPLATE.md` with 4 DoD checklist
- [ ] Author `docs/ref-ui-playground/README.md` frozen notice
- [ ] Update `docs/ui-design-contract.md` final v3.0 release notes
- [ ] Re-snapshot Playwright baseline final
- [ ] Full app smoke test dark + light

## Success Criteria
- `src/components/ui/*` has zero v5-duplicate files.
- All `segmented-tabs` consumers on TabPill.
- All legacy table consumers on DataTable.
- ESLint custom rule active + `npm run lint` clean.
- PR template enforces 4 DoD checklist.
- Playground HTML archived with frozen notice.
- Contract v3.0 released with full changelog.
- Playwright baseline final snapshot complete.

## Risk Assessment
| Risk | Severity | Mitigation |
|---|---|---|
| Hidden consumer of deleted legacy component breaks runtime | High | Pre-delete grep exhaustively; smoke test all routes |
| ESLint rule false positive on legit code | Med | Test fixtures + comment-disable escape hatch |
| Contract v3.0 still has §51 spec drift from Phase 3-6 hot-adds | Low | Final reconciliation pass during this phase |
| PR template adoption resistance | Low | Document in CONTRIBUTING; require for v5 PRs only |
| Re-snapshot baseline diff noise | Low | Accept new baseline as v3.0 reference; tag commit |
| Deferred light snapshot (heatmap/funnel) still missing | Med | Document as known limitation in README; followup ticket |

## Security Considerations
- ESLint rule changes affect CI — review with team before merging to main.
- PR template public-facing — no internal-only references.

## Next Steps
- Final merge of `ui-canon-v3` branch into `main`.
- Tag release `v3.0-ui-canon`.
- Followup tickets:
  - Deferred heatmap/funnel light snapshot.
  - Storybook re-introduction evaluation (deferred per brainstorm Open Questions).
  - Visual regression CI tool choice (Chromatic / Playwright snapshots / Percy).
  - Recharts → Visx migration if Phase 4 documented fallback need.
