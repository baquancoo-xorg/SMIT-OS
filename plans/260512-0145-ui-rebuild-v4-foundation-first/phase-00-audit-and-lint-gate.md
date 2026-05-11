# Phase 00 — Audit + Lint Gate

## Context Links

- Plan overview: [plan.md](./plan.md)
- Brainstorm: `/Users/dominium/Documents/Project/SMIT-OS/plans/reports/brainstorm-260512-0145-ui-rebuild-v4-foundation-first.md` §4.3 row 3
- Current invalid class location: `src/components/ui/*.tsx` (typo `bg-error-container/30/50`)
- Existing tokens: `/Users/dominium/Documents/Project/SMIT-OS/src/index.css`
- v3 primitives dir: `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/`

## Overview

- Date: 2026-05-12 (start week 0)
- Priority: P1 (blocks everything)
- Status: **completed** 2026-05-12 02:23
- Lint mechanism: **regex-grep CI script** (Q7 resolved 2026-05-12 — zero new deps, aligns with cleanup-medium spirit)
- Goal: prove drift exists with concrete audit report, then install mechanical gate so v4 cannot inherit the same drift. Without this, rebuild = re-drift in 2-3 months.

## Key Insights

- v3 has tokens but no enforcement → mixed `bg-blue-600` + `bg-error-container`
- Tailwind silently accepts invalid classes (e.g. `bg-error-container/30/50`) — devs never see failure
- Repo currently has **no eslint config** — Phase 00 must either bootstrap minimal eslint or build a leaner regex grep CI gate
- Whitelist must be tight: any new semantic token added later requires whitelist update (documented friction is the feature, not a bug)

## Requirements

**Functional:**
- Audit report listing every raw-token offense with `file:line:class`, grouped by severity (color > spacing > radius)
- Lint rule blocks: `bg-{tw-color}-{n}`, `text-{tw-color}-{n}`, `border-{tw-color}-{n}`, `rounded-{sm|md|lg|xl|2xl|3xl}`, raw `p-{n}` `m-{n}` `gap-{n}` outside semantic whitelist
- Pre-commit + CI gate failing the build when violated under `src/design/v4/**` and `src/pages-v4/**` (v3 paths exempt during migration)
- Whitelist for legacy v3 path so existing code does not break

**Non-functional:**
- Audit run < 30s on full `src/**/*.tsx`
- Lint rule run < 5s in CI
- Zero false positive after 1 week iteration

## Architecture

```
scripts/raw-tokens-config.ts (shared patterns + whitelist)
              │
              ├──► scripts/audit-raw-tokens.ts ──► reports/00-audit-v3-token-usage.md (full src/)
              │
              └──► scripts/check-raw-tokens.ts ──► exit 1 on violation in v4 paths only
                                                            │
                                                            ▼
                                                npm run lint (CI gate)
```

Decided: regex-grep CI script. ZERO new deps. v3 paths exempt during migration; v4 paths gated.

## Related Code Files

**Modify:**
- `/Users/dominium/Documents/Project/SMIT-OS/package.json` — add `lint` + `audit:tokens` scripts (NO new devDeps)
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/*.tsx` — fix invalid class `bg-error-container/30/50` once typo location confirmed

**Create:**
- `/Users/dominium/Documents/Project/SMIT-OS/scripts/raw-tokens-config.ts` — shared regex patterns + semantic whitelist
- `/Users/dominium/Documents/Project/SMIT-OS/scripts/audit-raw-tokens.ts` — full-src audit, emits markdown report
- `/Users/dominium/Documents/Project/SMIT-OS/scripts/check-raw-tokens.ts` — gate, exits 1 on v4-path violations
- `/Users/dominium/Documents/Project/SMIT-OS/plans/260512-0145-ui-rebuild-v4-foundation-first/reports/00-audit-v3-token-usage.md` — audit output

**Delete:** none

## Implementation Steps

1. Write `scripts/raw-tokens-config.ts` — exports forbidden regex patterns + semantic whitelist (extracted from `src/index.css` v3 tokens).
2. Write `scripts/audit-raw-tokens.ts` — glob `src/**/*.tsx`, run patterns, emit markdown report grouped by severity (color > spacing > radius). Include `file:line:class` per hit.
3. Run `npm run audit:tokens`, commit report to `reports/00-audit-v3-token-usage.md`. Confirm `bg-error-container/30/50` typo appears.
4. Fix typo location → replace with valid `bg-error-container/50`. Exception to no-v3-changes rule because Tailwind silently drops invalid classes.
5. Write `scripts/check-raw-tokens.ts` — same patterns but scoped to `src/design/v4/**` + `src/pages-v4/**`, exit 1 on any hit. v3 paths exempt.
6. Add `lint` + `audit:tokens` scripts to `package.json`. NO new devDeps.
7. Verify gate: plant offender `src/design/v4/__sanity.tsx` with `<div className="bg-blue-600">`. Run `npm run lint` → must exit 1. Remove offender → must exit 0.
8. Append entry to `docs/project-changelog.md`.

## Todo List

- [x] Resolve Q7 (regex-grep, not ESLint)
- [x] Build `scripts/raw-tokens-config.ts` shared module
- [x] Build `scripts/audit-raw-tokens.ts` scanner
- [x] Run audit + save report `reports/00-audit-v3-token-usage.md` (1226 hits / 115 files)
- [x] Fix 5 invalid double-opacity typos (3 in WeeklyCheckinModal, 2 in okr-accordion-cards)
- [x] Build `scripts/check-raw-tokens.ts` gate
- [x] Add `lint` + `lint:tokens` + `audit:tokens` scripts to package.json (ZERO new deps)
- [x] Verify gate: planted + caught 6 violations, removed offender → clean
- [x] Append changelog entry
- [x] Phase 00 gate: `npm run lint` exits 0 on baseline

## Execution Results (2026-05-12 02:23)

- Audit: **1226 hits across 115 files** (invalid: 0 after fixes, color: 49, radius: 43, spacing: 1134)
- Top offender: `src/components/okr/okr-accordion-cards.tsx` (213 hits)
- Gate sanity: planted `src/design/v4/__sanity.tsx` with `bg-blue-600 rounded-lg p-4 text-red-500 m-2 bg-error-container/30/50` → caught **6 violations** across all 4 severity categories, exit 1. Removed offender → exit 0.
- One regex tightening iteration: invalid-double-opacity required known Tailwind prefix to reject false positive on `picsum.photos/seed/pm/96/96` URL in Profile.tsx.
- No false positives in final run.

## Success Criteria

- `npm run lint` exits 0 on current main + audit report committed
- Planted offender under `src/design/v4/__sanity.tsx` exits with nonzero + offending line cited
- Zero false-positive after 1 iteration day
- Q7 resolved + recorded in plan.md

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Whitelist too tight → blocks legitimate semantic class | Medium | Low | Iterate week 0, log every false-positive, expand whitelist promptly |
| Regex misses Tailwind arbitrary syntax `[bg:#ff0]` | Medium | Medium | Add second regex pass for arbitrary value `\[(bg|text|border)[:-]` |
| Regex false-positives on string literals in non-className context | Low | Low | Scan only inside `className=` attributes (regex-bounded), not raw strings |
| No IDE inline feedback (vs ESLint) | Low | Low | Devs run `npm run lint` before commit; CI catches if skipped |

## Security Considerations

- No secrets touched. Audit script reads source files only.
- Lint rule runs locally + CI; no network calls.

## Next Steps

- Unlocks Phase 01 (tokens v4) by guaranteeing v4 paths cannot accept raw classes.
- Handoff: report file path + lint command in plan.md changelog.
