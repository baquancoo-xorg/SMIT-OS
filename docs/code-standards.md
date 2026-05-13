# Code Standards

## Principles
- Prefer YAGNI, KISS, DRY.
- Keep files focused and small; split large UI into composed components.
- Preserve real data flows; do not add mocks or fake submit paths to pass tests.
- Validate external/user input at system boundaries.

## Naming
- Use kebab-case for new TypeScript/JavaScript files.
- Component exports may stay PascalCase.
- File names should describe purpose clearly for grep/search.

## V5 UI Rules
- Use `src/components/v5/ui/` primitives before adding custom UI.
- Follow `docs/ui-design-contract.md` for all UI surfaces: pages, charts, KPIs, tables, tabs, forms, overlays, sidebar/header, iconography, typography, spacing, states, motion, responsive, and accessibility.
- Use `cn()` for conditional className composition.
- Use token classes (`bg-surface`, `text-text-1`, `border-border`, etc.) instead of raw colors.
- Primary CTA uses dark gradient + orange beam/icon; avoid solid orange buttons for primary actions.
- Keep orange accent as decorative/icon text unless it is an approved data visualization or status-intensity fill.
- Do not use solid orange fill for CTA, tab, checkbox, sidebar/nav, or generic selection states.
- If a canonical primitive is missing, add/update the primitive under `src/components/v5/ui/` before styling page-local UI.

## Theme & Density
- Use `ThemeProvider` and `useTheme()` for dark/light/system controls.
- Use `DensityProvider` and `useDensity()` for comfortable/compact controls.
- Theme changes must update `document.documentElement.dataset.theme`.
- Density changes must update `document.documentElement.dataset.density`.

## Data Fetching
- Use TanStack Query hooks where existing hooks cover the data source.
- For direct `fetch` on authenticated APIs, include `credentials: 'include'`.
- Handle `401` by clearing current user and redirecting to login where page code owns the session path.
- Check `res.ok` before parsing success payloads into state.

## Accessibility
- Icon-only controls need accessible labels.
- Sticky table headers must use theme-aware opaque backgrounds, not `bg-white`.
- Modals should close via explicit controls and preserve readable focus states.
- Page sections should have semantic labels when content is dynamic or tabbed.

## Validation
Run before closing implementation phases:
- `npm run typecheck`
- `npm run lint`
- `npm run test` when tests were added or touched
- `npm run build`

For UI changes, also verify:
- Changed surfaces pass `docs/ui-design-contract.md` in dark and light mode.
- No solid orange fill is introduced for CTA, tab, checkbox, sidebar/nav, or generic selection states.
- Tables/charts/KPIs/forms use canonical v5 primitives or update the primitive contract first.
