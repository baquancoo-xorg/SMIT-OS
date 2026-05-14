# Phase 1 — Contract v3.0 Update

## Context Links
- Parent: [plan.md](plan.md)
- Prev: [phase-00-canon-audit-and-extension.md](phase-00-canon-audit-and-extension.md)
- Contract source: `docs/ui-design-contract.md` (v2.0)
- New refs: `docs/ref-ui-playground/DESIGN.md`, `docs/ref-ui-playground/stitch-screens/`
- Existing sections impacted: §22 (Button), §29-§31b (Charts), §32-§34 (Feedback), §44-§45 (Perf/Render)

## Overview
- **Date:** 2026-05-14
- **Priority:** P1
- **Status:** complete
- **Description:** Bump `docs/ui-design-contract.md` from v2.0 → v3.0 — append §47-§51 + update §22/§29-§31b/§32-§34 referencing Phase 0 outputs.

## Key Insights
- Contract update is the load-bearing doc — every downstream phase cites §-sections.
- D9: incremental append; do not rewrite v2.0 content unless inline reference.
- v3.0 must include: chart taxonomy, primary CTA DNA spec, Stitch ref index, light token map, missing primitive specs.
- Frontmatter version bump only; `playground_canon` stays v4.

## Requirements

### Functional
- Add §47 Chart Taxonomy
- Add §48 Primary CTA DNA Spec
- Add §49 Stitch Reference Assets Index
- Add §50 Light Mode Token Mapping
- Add §51 Missing Primitive Specs (13 primitives)
- Update §22 (Button) — cross-ref §48
- Update §29-§31b (Charts) — cross-ref §47 + Stitch batches 01-04, 10
- Update §32-§34 (Feedback) — cross-ref Stitch batch 08
- Update §36 (Overlay) — cross-ref Stitch batch 07
- Bump frontmatter `version: 3.0`

### Non-Functional
- All new sections include "Citation example" code block for phase PRs to copy-paste.
- Each missing primitive spec includes: interface signature, state machine, a11y contract.
- Light token map exhaustive: every dark token → light counterpart.

## Architecture
Append-only model. Order in file: existing §1-§45 → NEW §46 reserved → §47-§51 → existing footer if any.

```
v2.0:                         v3.0:
§1-§45 (existing)             §1-§45 (unchanged unless cross-ref)
                              §47 Chart Taxonomy
                              §48 Primary CTA DNA Spec
                              §49 Stitch Reference Assets Index
                              §50 Light Mode Token Mapping
                              §51 Missing Primitive Specs
```

## Related Code Files
**Modify:**
- `docs/ui-design-contract.md`

**Create:** none (all content inline in contract)

## Implementation Steps
1. Read current `docs/ui-design-contract.md` end-to-end → snapshot frontmatter + section index.
2. Read `docs/ref-ui-playground/DESIGN.md` + `audit-report.md` from Phase 0.
3. Author §47 Chart Taxonomy:
   - Chart type → palette → axis/grid/tooltip token mapping
   - State trinity rule (empty/loading/error)
   - Colorblind safety pattern/dash supplement
4. Author §48 Primary CTA DNA Spec:
   - Explicit recipe: dark gradient base + orange beam + orange icon
   - Class/token names + DO/DON'T examples
5. Author §49 Stitch Reference Assets Index:
   - List 10 batches from Phase 0 with purpose + linked file path
6. Author §50 Light Mode Token Mapping:
   - Table: dark token → light counterpart for every canonical token
7. Author §51 Missing Primitive Specs — 13 entries:
   - Tooltip, Checkbox, Switch, Radio, Textarea, ProgressBar, FileUpload, MultiSelect, Combobox, Banner, SearchInput, Avatar, Pagination
   - Each entry: interface signature, state machine, a11y contract, related §-references
8. Update §22 cross-ref to §48.
9. Update §29-§31b cross-ref §47 + Stitch batches.
10. Update §32-§34 cross-ref §51 (Banner) + Stitch batch 08.
11. Update §36 cross-ref §51 (Tooltip) + Stitch batch 07.
12. Bump frontmatter `version: 3.0`, set `playground_canon: v4`.
13. Re-read contract for self-consistency + broken-link grep.

## Todo List
- [ ] Snapshot v2.0 contract structure + frontmatter
- [ ] Author §47 Chart Taxonomy
- [ ] Author §48 Primary CTA DNA Spec
- [ ] Author §49 Stitch Reference Assets Index
- [ ] Author §50 Light Mode Token Mapping (full table)
- [ ] Author §51 Missing Primitive Specs (13 entries)
- [ ] Update §22 cross-ref
- [ ] Update §29-§31b cross-ref
- [ ] Update §32-§34 cross-ref
- [ ] Update §36 cross-ref
- [ ] Bump frontmatter to v3.0
- [ ] Self-consistency + broken-link verify

## Success Criteria
- 5 new sections added (§47-§51).
- 4 cross-ref updates verified.
- Frontmatter `version: 3.0`.
- No broken §-references on grep.
- 13 missing primitive specs each have interface + state machine + a11y.
- Light token map covers every dark token in §1-§8.

## Risk Assessment
| Risk | Severity | Mitigation |
|---|---|---|
| Contract sprawl / readability drop | Med | Keep §-sections concise; cite Stitch + DESIGN.md externally rather than inline |
| Missing primitive spec misalignment with later Phase 3 implementation | Med | Phase 3 may "primitive hot-add" update contract — D9 allows |
| Light token map gaps | Med | Cross-check vs §1-§8 every token name; verify with DESIGN.md light parity table |
| Forward refs to non-existent files | Low | Phase 0 must complete first (blocker dependency) |

## Security Considerations
- No security surface — docs-only.

## Next Steps
- Blocks Phase 2 (token foundation references §50).
- Blocks Phase 3 (primitive realignment references §51).
- Blocks Phase 4 (chart wrappers reference §47).
