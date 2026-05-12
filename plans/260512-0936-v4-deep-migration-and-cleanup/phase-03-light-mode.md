# Phase 03 — Light Mode Tokens

## Context Links

- Plan: [plan.md](./plan.md)
- Original decision: predecessor Phase 1 OQ1 — light mode deferred under `[data-theme="light"]` selector
- Tokens file: `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/tokens.css`

## Overview

- Priority: P3
- Status: pending
- Goal: ship light variant of v4 design system without touching components.

## Key Insights

- Token-only work — components consume semantic tokens (`bg-surface`, `text-fg`, etc.) which auto-flip when CSS vars change under selector scope
- 4 risk areas: shadow values (dark shadows on light look harsh), glow effects (orange glow loses contrast on light), border-subtle (low-alpha black/white differ), images/icons (currently white assume dark)
- System preference detection via `prefers-color-scheme: light` media query + manual override via Settings → Appearance toggle (Phase 02 wires)

## Requirements

**Functional:**
- Light palette: invert surface family (white → near-black for fg), keep accent orange `#FF6D29`, keep status raw colors
- Light shadows: lighter rgba(0,0,0,0.05-0.1) instead of dark rgba(0,0,0,0.4-0.7)
- Light glow: brand-500 @ 25% (vs 35-50% in dark)
- All 30 components render correctly without changes

**Non-functional:**
- Toggle persists in localStorage
- System preference respected on first load
- Transition smooth (200ms color)

## Architecture

```css
/* tokens.css additions */
[data-theme="light"] {
  --color-surface: #fafafa;
  --color-surface-elevated: #ffffff;
  --color-fg: #1d1a1c;
  /* ... */
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    /* same overrides */
  }
}
```

Hook: `useTheme()` reads localStorage + system preference, sets `data-theme` on `<html>`.

## Related Code Files

**Modify:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/tokens.css` (add `[data-theme="light"]` block)
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/v4-shell.tsx` (theme attribute on html)
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/settings.tsx` (Appearance tab toggle)

**Create:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/primitives/use-theme.ts` (hook)

## Implementation Steps

1. Define light palette values via design tool / pick from references (or invert dark systematically).
2. Add `[data-theme="light"]` selector to tokens.css with all overrides.
3. Build `use-theme` hook: read localStorage, fallback to system, expose toggle.
4. Settings → Appearance: 3-option select (System / Dark / Light).
5. Manual visual check: every component family in playground under light + dark.
6. Lint + build green.

## Todo List

- [ ] Light palette values
- [ ] `[data-theme="light"]` CSS block
- [ ] use-theme hook
- [ ] Settings Appearance toggle
- [ ] Visual smoke test playground in light mode
- [ ] Lint green + build green

## Success Criteria

- All 30 components render correctly in light mode (no contrast issues)
- Toggle persists across reloads
- System preference detected on first visit

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Hard-coded dark assumptions in components | Medium | High | Audit all components for `bg-black/N`, `text-white`, etc. — replace with semantic tokens |
| Glow + shadow values clash with light | High | Medium | Define separate shadow scale under `[data-theme="light"]` block |
| Charts (recharts) hardcoded colors | Medium | Medium | Ensure Phase 02 chart-card wrapper accepts theme prop |

## Security Considerations

- None — pure visual

## Next Steps

- After ship, monitor PostHog for light-mode-specific UI regressions
- Optional: brand variant themes (per-tenant if multi-tenant in future)
