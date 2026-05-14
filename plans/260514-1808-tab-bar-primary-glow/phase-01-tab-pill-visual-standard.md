---
title: "Phase 1 — TabPill Visual Standard"
status: completed
priority: P2
effort: 1.5h
---

# Phase 1 — TabPill Visual Standard

## Context Links

- Contract: `docs/ui-design-contract.md` §13 (Tab Bar / TabPill), §14 (Segmented Controls), §7 (Shadow/Glow), §43 (Accessibility), §50 (Light Mode Token Mapping)
- Primitive: `src/components/v5/ui/tab-pill.tsx`

## Overview

Extend `TabPill` with:
1. A new `page` size variant targeting ~36px outer height.
2. Primary glow active state — neutral lifted surface + accent ring/shadow — replacing the plain `shadow-sm` active style.
3. No regressions to `sm` (dialog use) or `md` (legacy, will be retired after Phase 2).

## Key Insights

- Current `sm`: item `h-7` (28px) + container `p-0.5` (2px each side) = **32px outer**.
- Current `md`: item `h-10` (40px) + container `p-1` (4px each side) = **48px outer**.
- Target 36px outer: item `h-8` (32px) + container `p-0.5` (2px each side) = **36px outer**. Achievable as new `page` size.
- §13 specifies active tab = neutral lifted; §7 allows a subtle primary glow ring for interactive surfaces. Active glow must NOT be solid `brand-500` fill (§ no-solid-orange rule, feedback memory).
- §50 light mode: surface tokens remap — ensure `bg-surface-container` remains correct in both themes.
- §43 a11y: `role="tab"`, `aria-selected`, keyboard ArrowLeft/Right/Home/End — already implemented; glow must not reduce contrast below 3:1 for active label.

## Requirements

**Functional**
- Add `page` to `sizeStyles` and `containerPadding` maps.
- Active button class for `page` size: `bg-surface-container text-on-surface` + primary glow ring (`ring-1 ring-brand-500/30 shadow-[0_0_8px_0_oklch(var(--brand-500)/0.25)]`).
- `sm` and `md` sizes unchanged (backward compat).
- Default prop `size` remains `'md'` to avoid breaking call sites not yet migrated.

**Non-Functional**
- File stays under 200 lines.
- No new dependencies.
- Glow uses `var(--brand-500)` OKLCH token — no hex hardcode (§ accent canonical rule).

## Architecture / Data Flow

```
TabPill props
  └─ size: 'sm' | 'md' | 'page'
       └─ sizeStyles[size]        → item h/px/text/gap classes
       └─ containerPadding[size]  → wrapper padding
       └─ activeGlowStyles[size]  → active button ring+shadow (new)
```

`activeGlowStyles` map:
- `sm`: `''` (no glow — compact dialog use)
- `md`: `''` (legacy, no glow)
- `page`: `'ring-1 ring-brand-500/30 shadow-[0_0_8px_0_oklch(var(--brand-500)/0.25)]'`

The active button className merges: base lifted classes + `activeGlowStyles[size]`.

## Related Code Files

- **Modify:** `src/components/v5/ui/tab-pill.tsx`
- **Read for token names:** `src/index.css` (verify `--brand-500` OKLCH var exists)

## Implementation Steps

1. Open `src/components/v5/ui/tab-pill.tsx`.
2. Add `'page'` to `TabPillProps` size union: `size?: 'sm' | 'md' | 'page'`.
3. Extend `sizeStyles`:
   ```ts
   page: 'h-8 px-3 text-[length:var(--text-body-sm)] gap-1.5',
   ```
4. Extend `containerPadding`:
   ```ts
   page: 'p-0.5',
   ```
5. Add `activeGlowStyles` map:
   ```ts
   const activeGlowStyles: Record<'sm' | 'md' | 'page', string> = {
     sm: '',
     md: '',
     page: 'ring-1 ring-brand-500/30 shadow-[0_0_8px_0_oklch(var(--brand-500)/0.25)]',
   };
   ```
6. In the active button className, append `activeGlowStyles[size]` when `isActive`.
7. Update JSDoc comment to document `page` size.
8. Verify file line count stays ≤ 200.
9. Run `npx tsc --noEmit` to confirm no type errors.

## Todo List

- [x] Add `'page'` to size union type
- [x] Add `page` entry to `sizeStyles`
- [x] Add `page` entry to `containerPadding`
- [x] Add `activeGlowStyles` map
- [x] Merge `activeGlowStyles[size]` into active button className
- [x] Update JSDoc
- [x] Verify file ≤ 200 lines
- [x] `npx tsc --noEmit` — zero errors

## Success Criteria

- `<TabPill size="page" ...>` renders at 36px outer height (verifiable in DevTools computed style).
- Active tab shows `ring-1 ring-brand-500/30` + `shadow` glow — no solid orange background.
- `size="sm"` and `size="md"` behavior pixel-identical to before.
- TypeScript compiles clean.
- Active label contrast ≥ 3:1 against container background (manual spot-check or axe).

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `--brand-500` var not available as Tailwind arbitrary value | Low | Medium | Check `src/index.css`; if needed use `[--brand-500:...]` or `brand-500` utility class if defined in tailwind config |
| Glow too strong in light mode | Medium | Low | Use `/0.25` opacity; test in light theme; reduce to `/0.15` if needed |
| `shadow-[...]` arbitrary value purged by Tailwind | Low | Low | Add `safelist` entry or use a CSS class in `index.css` if JIT doesn't pick it up |

## Accessibility Considerations (§43)

- Ring glow is additive to the neutral lifted state — does not replace `aria-selected` signal.
- Ensure `focus-visible` outline is not masked by the ring; use `focus-visible:ring-offset-1` if needed.
- Color alone never the sole active indicator — text weight + bg remain.

## Security Considerations

None — pure CSS/className change, no data or auth paths touched.

## Next Steps

Phase 2 (page usage migration) is blocked on this phase completing so all pages can adopt `size="page"`.
