# Phase 2 — Token Foundation + CI Gate

## Context Links
- Parent: [plan.md](plan.md)
- Prev: [phase-01-contract-v3.md](phase-01-contract-v3.md)
- Contract: `docs/ui-design-contract.md` §1, §2, §3, §5, §6, §7, §8, §50
- Stitch DESIGN.md: `docs/ref-ui-playground/DESIGN.md`
- Canon: `docs/ref-ui-playground/Playground .html` (root tokens lines ~17-180)

## Overview
- **Date:** 2026-05-14
- **Priority:** P1
- **Status:** complete
- **Description:** Align `src/index.css` + `src/design/v5/tokens.ts` to canon OKLCH, add light-mode mirror, install CI grep gate (warn-only), set screenshot baseline.

## Key Insights
- Tokens flow downward → mistakes cascade across all primitives + pages.
- D10: grep gate runs WARN-ONLY week 1 (PR comment), hard gate from Phase 4.
- Light parity per D4 — every dark token gets light counterpart day-1.
- Screenshot baseline = Playwright + visual ref dir for regression detection in later phases.

## Requirements

### Functional
- Replace ad-hoc CSS variables in `src/index.css` with playground canon values.
- Mirror runtime tokens in `src/design/v5/tokens.ts`.
- Add light-mode namespace (`[data-theme="light"]` or equivalent).
- Implement `scripts/ui-canon-grep.sh` (or `.cjs`) scanning v5 paths for forbidden patterns.
- Wire `npm run lint:ui-canon` script.
- Add GitHub Actions workflow — warn-only mode (PR comment).
- Setup Playwright screenshot baseline tool — capture `/v4/playground` (and `/v5/playground` once Phase 5 lands) reference images.

### Non-Functional
- All token values OKLCH (no hex/rgb in CSS).
- Token names match contract §1-§8 exactly.
- Light mode CSS variables override under `[data-theme="light"]` block.
- Grep script exits 0 on warn-only, exits 1 hard-gate (toggle by ENV `UI_CANON_STRICT`).
- Baseline screenshot tool runs in headless Playwright, output to `tests/visual-ref/`.

## Architecture
```
src/
├── index.css                 (refactor — dark + light root vars)
├── design/v5/tokens.ts       (refactor — runtime mirror)
scripts/
└── ui-canon-grep.cjs         (NEW — pattern scanner)
.github/workflows/
└── ui-canon-check.yml        (NEW — warn-only PR comment)
tests/visual-ref/
└── (NEW — Playwright snapshots, gitignored or LFS)
playwright.config.ts          (NEW or extended)
```

Token flow:
```
Playground HTML root tokens
  → src/index.css :root { --brand-500: oklch(…); … }
  → src/index.css [data-theme="light"] { --brand-500: oklch(…); … }
  → src/design/v5/tokens.ts (runtime mirror for JS consumption)
  → consumed by Tailwind config + components
```

Grep gate forbidden patterns (scan `src/components/v5/**`, `src/pages/v5/**`, `*.tsx`):
- `#[0-9a-fA-F]{3,8}` (hex literal)
- `bg-white|text-white|border-white` (Tailwind white shortcuts)
- `shadow-lg|shadow-xl|shadow-2xl`
- `rounded-xl|rounded-2xl|rounded-3xl` (allow `rounded-pill`, `rounded-full`)
- `font-black` (allow only with explicit eslint-disable comment for hero/KPI)

## Related Code Files
**Modify:**
- `src/index.css`
- `src/design/v5/tokens.ts`
- `package.json` (add `lint:ui-canon` script)

**Create:**
- `scripts/ui-canon-grep.cjs`
- `.github/workflows/ui-canon-check.yml`
- `tests/visual-ref/.gitkeep`
- `playwright.config.ts` (or extend if exists)
- `tests/visual-baseline.spec.ts` (Playwright baseline capture)

## Implementation Steps
1. Read `Playground .html` lines 17-180 → extract every `--token-name: value;`.
2. Read current `src/index.css` → diff vs canon.
3. Refactor `src/index.css`:
   - `:root` block — dark canon tokens (default).
   - `[data-theme="light"]` block — light mirror per contract §50.
   - Group: color (brand, neutral, semantic, dept), typography, radius, shadow, motion.
4. Refactor `src/design/v5/tokens.ts` — runtime export matching CSS var names.
5. Author `scripts/ui-canon-grep.cjs`:
   - Use `glob` + `fs.readFile` + regex array.
   - Output: `{file, line, pattern, snippet}` table.
   - Exit code 0 if strict=false, exit 1 if `process.env.UI_CANON_STRICT === '1'`.
6. Add `package.json` script: `"lint:ui-canon": "node scripts/ui-canon-grep.cjs"`.
7. Author `.github/workflows/ui-canon-check.yml`:
   - Trigger: pull_request paths `src/components/v5/**`, `src/pages/v5/**`.
   - Run: `npm run lint:ui-canon`.
   - Post results as PR comment via `actions/github-script`.
   - Warn-only week 1, switch `UI_CANON_STRICT=1` at Phase 4 start.
8. Install Playwright (if not present): `npm i -D @playwright/test`.
9. Author `playwright.config.ts` — headless chromium, baseUrl localhost:3000.
10. Author `tests/visual-baseline.spec.ts` — capture `/v4/playground` snapshots (28 sections by anchor scroll).
11. Run baseline script — save PNGs to `tests/visual-ref/`.
12. Validate: render localhost:3000 → light mode toggle works, dark default unchanged visually.

## Todo List
- [ ] Extract playground root tokens (lines 17-180)
- [ ] Refactor `src/index.css` — dark canon
- [ ] Add `[data-theme="light"]` block — light mirror per §50
- [ ] Refactor `src/design/v5/tokens.ts` runtime mirror
- [ ] Author `scripts/ui-canon-grep.cjs`
- [ ] Wire `npm run lint:ui-canon`
- [ ] Author `.github/workflows/ui-canon-check.yml` (warn-only)
- [ ] Install Playwright + config
- [ ] Author `tests/visual-baseline.spec.ts`
- [ ] Capture baseline snapshots → `tests/visual-ref/`
- [ ] Smoke test light mode toggle live
- [ ] Run `lint:ui-canon` on current v5 → record baseline violation count

## Success Criteria
- `src/index.css` + `src/design/v5/tokens.ts` 100% OKLCH, no hex/rgb.
- Light-mode `[data-theme="light"]` block present with all §50 tokens.
- `npm run lint:ui-canon` runs end-to-end + outputs violation table.
- GitHub Actions workflow runs on test PR + posts comment (warn).
- Playwright baseline captures all 28 playground section anchors.
- Live light-mode toggle visually correct (manual smoke).

## Risk Assessment
| Risk | Severity | Mitigation |
|---|---|---|
| Token name mismatch breaks downstream Tailwind | High | Diff old vs new names; update `tailwind.config` if any var-driven theme |
| Light mode regression on untouched v5 pages | High | Defer page light visual fix to Phase 6; smoke-test only here |
| Grep false positives (e.g. `#region` comments) | Med | Whitelist via comment-pattern exclusion in regex |
| Playwright install bloats CI time | Low | Cache browser binaries, run only on UI-path PRs |
| Baseline drift while v5 still un-aligned | Med | Re-snapshot per phase; tag baseline version |

## Security Considerations
- CI workflow uses `GITHUB_TOKEN` only — read perms.
- No secret token exposure.

## Next Steps
- Blocks Phase 3 (primitives consume tokens).
- Blocks Phase 4 (charts consume color tokens).
- Phase 6 may require token additions (primitive hot-add) — D9 allows backfill.
