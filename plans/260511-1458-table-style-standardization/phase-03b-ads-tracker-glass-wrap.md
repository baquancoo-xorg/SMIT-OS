# Phase 3b — Ads Tracker: GlassCard Wrap

## Context Links
- Brainstorm: `plans/reports/brainstorm-260511-1458-table-style-standardization.md`
- Spec: STANDARD contract `src/components/ui/table-contract.ts`
- Reference: `src/components/lead-tracker/lead-logs-tab.tsx`
- File owned: `src/pages/AdsTracker.tsx`

## Parallelization Info
Runs in parallel with 1a, 1b, 2a, 2b, 3a. Zero file overlap.

## Overview
- Priority: P2
- Status: complete
- Date: 2026-05-11
- Effort: LOW

`CampaignsTable` already uses `TableShell variant="standard"` (migrated round 2). Wrap in `GlassCard variant="surface" padding="none"` and flatten inner TableShell to prevent double-shell artifact.

## Key Insights
- Symmetric pattern to phase 3a (Media). Same approach, different file.
- `campaigns-table.tsx` is read-only context for this phase.

## Requirements
- Wrap `<CampaignsTable />` render in `GlassCard variant="surface" padding="none"`.
- Apply flatten override (`className="bg-transparent border-0 shadow-none rounded-none"`) on TableShell if `CampaignsTable` forwards it. Else fallback raw glass div.

## Architecture

### Wrap pattern (preferred)
```jsx
<GlassCard variant="surface" padding="none">
  <CampaignsTable {...existingProps} className="bg-transparent border-0 shadow-none rounded-none" />
</GlassCard>
```

### Fallback (if no className prop)
```jsx
<div className="rounded-card bg-white/70 backdrop-blur-md border border-white/30 shadow-sm overflow-hidden">
  <CampaignsTable {...existingProps} />
</div>
```

Defer to fallback if `CampaignsTable` does not accept className forwarding. Record decision.

## Related Code Files
- Modify: `src/pages/AdsTracker.tsx` (sole owner)
- Read-only refs: glass-card.tsx, campaigns-table.tsx, table-shell.tsx

## File Ownership
Phase 3b OWNS ONLY `src/pages/AdsTracker.tsx`. `campaigns-table.tsx` is read-only.

## Implementation Steps
1. Read `src/pages/AdsTracker.tsx` to locate `<CampaignsTable />` render site.
2. Read `src/components/ads-tracker/campaigns-table.tsx` to check whether `className` is forwarded to TableShell.
3. If yes: wrap in `<GlassCard variant="surface" padding="none">` + pass flatten className to inner table.
4. If no: use fallback raw glass div.
5. Confirm `GlassCard` import path.
6. `npx tsc --noEmit`.
7. `npm run dev` and verify Ads Tracker page — single elevation.

## Todo List
- [x] Locate `<CampaignsTable />` render site
- [x] Confirm className forwarding capability
- [x] Wrap with `GlassCard variant="surface" padding="none"`
- [x] Apply flatten override or fallback wrapper
- [x] Verify imports
- [x] `tsc --noEmit` clean
- [x] Smoke test single elevation

## Success Criteria
- Ads Tracker table sits inside glass surface card.
- No double shadow / nested rounded corners.
- All existing functionality intact.
- TypeScript compile clean.

## Conflict Prevention
Phase 3b owns ONLY `src/pages/AdsTracker.tsx`. `campaigns-table.tsx` is read-only context. Safe parallel.

## Risk Assessment
- Risk: `CampaignsTable` no className forwarding → fallback (B) needed. Mitigation: documented fallback produces equivalent visual.
- Risk: Padding clipping. Mitigation: `padding="none"`.

## Security Considerations
N/A — UI-only wrap.

## Next Steps
If fallback used, flag in final report for future cleanup phase adding `tableShellClassName` prop to `CampaignsTable`.
