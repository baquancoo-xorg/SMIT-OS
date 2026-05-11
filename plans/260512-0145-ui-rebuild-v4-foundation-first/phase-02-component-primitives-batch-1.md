# Phase 02 — Component Primitives Batch 1

## Context Links

- Plan overview: [plan.md](./plan.md)
- Brainstorm: `/Users/dominium/Documents/Project/SMIT-OS/plans/reports/brainstorm-260512-0145-ui-rebuild-v4-foundation-first.md` §4.4
- v3 primitives (reference only, do not import): `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/`
- Phase 01 tokens: `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/tokens.css`

## Overview

- Date: 2026-05-12 (week 2)
- Priority: P1
- Status: **completed** 2026-05-12 03:10 (foundation gate passed)
- Goal: ship 8 most-used primitives end-to-end to validate the token system + lint gate works under real component pressure. If batch 1 slips > 50%, fallback to shadcn for batch 2 per brainstorm §7.

## Key Insights

- 8 components chosen because they cover layout/form/data/feedback/overlay families — every component family proven before batch 2 scales out
- Self-built decision is locked (brainstorm §2 row 7). No shadcn imports in v4.
- Each file < 200 lines per development-rules — split if larger (headless logic to `primitives/`, styled shell stays)
- Phase 02 is a foundation gate: batch 1 review before batch 2 begins

## Requirements

**Functional:**
- 8 components shipped: `button`, `input`, `badge`, `surface-card`, `modal`, `dropdown-menu`, `data-table`, `page-header`
- Each component: TypeScript strict, no `any`, props typed, default + variants documented in inline JSDoc
- Headless behavior (focus trap, keyboard nav, ARIA) lives in `src/design/v4/primitives/`
- Styled shell consumes only Tier 3 tokens
- Barrel export `src/design/v4/index.ts`
- `cn()` className utility in `src/design/v4/lib/cn.ts`
- Lint passes against `src/design/v4/**`

**Non-functional:**
- a11y: focus visible, keyboard navigable, ARIA roles where applicable
- Bundle: tree-shakeable named exports
- File size: each `.tsx` < 200 lines

## Architecture

```
src/design/v4/
├── components/
│   ├── button.tsx                  (variants: primary/secondary/danger/ghost; sizes: sm/md/lg)
│   ├── input.tsx                   (text/number/email; with label + error slot)
│   ├── badge.tsx                   (intent: neutral/success/warning/danger/info)
│   ├── surface-card.tsx            (replaces v3 glass-card; padding/elevation variants)
│   ├── modal.tsx                   (size: sm/md/lg/full; close on overlay click + ESC)
│   ├── dropdown-menu.tsx           (anchored, keyboard nav, click-outside)
│   ├── data-table.tsx              (sortable header, row actions, empty state)
│   └── page-header.tsx             (title + subtitle + action slot + breadcrumb slot)
├── primitives/
│   ├── use-focus-trap.ts
│   ├── use-click-outside.ts
│   ├── use-escape-key.ts
│   └── use-keyboard-list-nav.ts
├── lib/cn.ts                       (clsx-like, ~20 lines)
└── index.ts                        (barrel)
```

## Related Code Files

**Modify:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/index.ts` — new exports

**Create:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/lib/cn.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/primitives/use-focus-trap.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/primitives/use-click-outside.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/primitives/use-escape-key.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/primitives/use-keyboard-list-nav.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/components/button.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/components/input.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/components/badge.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/components/surface-card.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/components/modal.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/components/dropdown-menu.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/components/data-table.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/components/page-header.tsx`

**Delete:** none

## Implementation Steps

1. Build `lib/cn.ts` (clsx-style; ~20 lines). Export `cn(...classes)`.
2. Build hooks in `primitives/` (no UI, pure behavior). Each < 60 lines.
3. Build `button.tsx` first (smallest scope) — validate token consumption pattern.
4. Run lint — confirm green on `src/design/v4/**`.
5. Iterate: `input`, `badge`, `surface-card`. Each: types + variants + a11y + JSDoc.
6. `modal` + `dropdown-menu` use focus-trap + click-outside + escape hooks.
7. `data-table` minimal: column config, sortable header, row, empty state. Defer pagination + virtualization to Phase 03 if file > 200 lines.
8. `page-header`: composition slots, no logic.
9. Barrel export every component in `src/design/v4/index.ts`.
10. Build temporary `src/design/v4/__playground.tsx` route at `/design-playground` (guarded by `import.meta.env.DEV`) to manually eyeball each component. Delete at Phase 03.
11. Run lint full repo. Run `npm run build` to confirm TS compiles.
12. Phase gate: user reviews 8 components in playground. If review fails → iterate, do not start Phase 03.
13. Append entry to `docs/project-changelog.md`.

## Todo List

- [ ] `lib/cn.ts`
- [ ] 4 primitive hooks
- [ ] `button.tsx`
- [ ] `input.tsx`
- [ ] `badge.tsx`
- [ ] `surface-card.tsx`
- [ ] `modal.tsx`
- [ ] `dropdown-menu.tsx`
- [ ] `data-table.tsx`
- [ ] `page-header.tsx`
- [ ] `index.ts` barrel
- [ ] Playground route (dev-only)
- [ ] Lint green + TS compile green
- [ ] User review gate passed
- [ ] Append changelog entry

## Success Criteria

- All 8 components exported from `src/design/v4/index.ts`
- `npm run lint` green on `src/design/v4/**`
- `npm run build` green
- Manual a11y check: keyboard-only navigation works on modal + dropdown-menu + data-table
- File size: every component `.tsx` < 200 lines (or split)
- User approves visual + interaction quality in playground

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Batch 1 slips > 50% (per brainstorm §7) | High | High | Phase gate forces decision: continue self-built vs fallback shadcn for batch 2 |
| Component files exceed 200 lines | High | Medium | Pre-emptively split headless to `primitives/`, styled to `components/` |
| Token slots missing for new component variants | Medium | Medium | Pause, return to Phase 01 to add Tier 3 slot, do not hardcode |
| a11y regressions (focus loss in modal) | Medium | High | Phase gate checklist requires keyboard demo |
| Headless deps temptation (react-aria, radix) | High | Medium | Locked: no external deps in v4 components per brainstorm §2 |

## Security Considerations

- No backend coupling.
- `data-table` sortable by client-only; no SQL injection surface.
- `modal` overlay must trap focus to prevent clickjacking on background.

## Next Steps

- Unlocks Phase 03 (visual integration + batch 2).
- Handoff: playground URL + 8 component list with JSDoc to user for review.
