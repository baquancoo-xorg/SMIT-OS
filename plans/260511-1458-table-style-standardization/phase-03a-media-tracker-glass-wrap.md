# Phase 3a — Media Tracker: GlassCard Wrap

## Context Links
- Brainstorm: `plans/reports/brainstorm-260511-1458-table-style-standardization.md`
- Spec: STANDARD contract `src/components/ui/table-contract.ts`
- Reference: `src/components/lead-tracker/lead-logs-tab.tsx`
- File owned: `src/pages/MediaTracker.tsx`

## Parallelization Info
Runs in parallel with 1a, 1b, 2a, 2b, 3b. Zero file overlap.

## Overview
- Priority: P2
- Status: complete
- Date: 2026-05-11
- Effort: LOW

`MediaPostsTable` already uses `TableShell variant="standard"` (migrated round 2). Add glass wrap at page level and flatten the inner TableShell to avoid double-shell artifact.

## Key Insights
- Inner table is owned by `media-posts-table.tsx` — DO NOT modify that component file directly. The flatten override must be applied through the wrapping page since TableShell accepts `className` prop.
- If `MediaPostsTable` does not expose a `className` pass-through, alternative: wrap with bare div using glass utility classes matching `surface` variant.

## Requirements
- Wrap render of `<MediaPostsTable />` in `GlassCard variant="surface" padding="none"`.
- Flatten inner TableShell visual chrome: pass `className="bg-transparent border-0 shadow-none rounded-none"` if the component forwards it; else apply via parent CSS or accept that table-shell.tsx flatten requires a component prop addition.

## Architecture

### Wrap pattern (preferred)
```jsx
<GlassCard variant="surface" padding="none">
  <MediaPostsTable {...existingProps} className="bg-transparent border-0 shadow-none rounded-none" />
</GlassCard>
```

### Fallback (if no className prop)
If `MediaPostsTable` does not forward `className` to its internal `TableShell`, log this as a finding. Two options:
- (A) Add `tableShellClassName` prop to `MediaPostsTable` (out of scope — would touch a non-owned file).
- (B) Wrap with raw glass div matching surface utility classes:
```jsx
<div className="rounded-card bg-white/70 backdrop-blur-md border border-white/30 shadow-sm overflow-hidden">
  <MediaPostsTable {...existingProps} />
</div>
```

Defer to (B) if (A) requires editing `media-posts-table.tsx`. Record decision in final report.

## Related Code Files
- Modify: `src/pages/MediaTracker.tsx` (sole owner)
- Read-only refs: glass-card.tsx, media-posts-table.tsx, table-shell.tsx

## File Ownership
Phase 3a OWNS ONLY `src/pages/MediaTracker.tsx`. The component `media-posts-table.tsx` is read-only context for this phase.

## Implementation Steps
1. Read `src/pages/MediaTracker.tsx` to locate `<MediaPostsTable />` render site.
2. Read `src/components/media-tracker/media-posts-table.tsx` to confirm whether it accepts a `className` prop that forwards to its TableShell.
3. If yes: wrap with `<GlassCard variant="surface" padding="none">` and pass `className="bg-transparent border-0 shadow-none rounded-none"` to `<MediaPostsTable />`.
4. If no: use fallback raw glass `<div>` wrapper (see Architecture fallback).
5. Confirm GlassCard import path (`from '@/components/ui'` or relative based on file location).
6. `npx tsc --noEmit` and fix errors.
7. `npm run dev` and visually verify Media Tracker page — single elevation (no double shadow / nested borders).

## Todo List
- [x] Locate `<MediaPostsTable />` render site
- [x] Confirm whether `MediaPostsTable` forwards `className` to TableShell
- [x] Wrap with `GlassCard variant="surface" padding="none"`
- [x] Apply flatten override (or fallback wrapper if no prop)
- [x] Verify imports (`GlassCard`)
- [x] `tsc --noEmit` clean
- [x] Smoke test — single elevation visual

## Success Criteria
- Media Tracker table sits inside glass surface card.
- No double shadow or nested rounded corners.
- Table sort/filter/all existing functionality intact (untouched).
- TypeScript compile clean.

## Conflict Prevention
Phase 3a owns ONLY `src/pages/MediaTracker.tsx`. The `media-posts-table.tsx` component is read-only here. Safe parallel.

## Risk Assessment
- Risk: `MediaPostsTable` does not forward className → double-shell artifact remains. Mitigation: fallback raw glass div bypasses TableShell visual entirely.
- Risk: Wrapper adds padding clipping table edges. Mitigation: `padding="none"` chosen specifically.

## Security Considerations
N/A — UI-only wrap.

## Next Steps
If fallback (B) chosen, flag in final report so a future cleanup phase can add `tableShellClassName` prop to `MediaPostsTable` for token consistency.
