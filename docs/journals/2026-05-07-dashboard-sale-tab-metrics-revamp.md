# Dashboard Sale Tab Metrics Revamp

**Date:** 2026-05-07  
**Commit:** b5c351e  
**Effort:** ~5h (9 phases)

## Summary

Revamped the Sale tab dashboard with server-side computation, CRM-first AE identity, and new distribution charts.

## Key Changes

1. **Lead.source field** — Synced from `crm_subscribers.source`, added to CRM_OWNED_FIELDS
2. **CRM-first AE identity** — Call-performance now prioritizes CRM `lark_info.name` over SMIT user name
3. **Per-AE metrics** — Only counts calls with `subscriberId` (CRM-linked), eliminating noise from internal calls
4. **New endpoints:**
   - `/api/dashboard/lead-flow` — summary + daily series for inflow/cleared/backlog
   - `/api/dashboard/lead-distribution` — bySource (top 8 + Others) and byAe (active vs cleared)
5. **Frontend refactor** — dashboard-tab.tsx now uses `useLeadFlow` hook instead of fetching all leads client-side

## Key Insights

- **Client → Server computation** reduces payload from ~6000 lead objects to a few KB of aggregated data. Eliminates FE re-computation on every render.
- **Clearance Rate formula** changed from `cleared / inflow` to `cleared / (cleared + activeBacklog)`. Previous formula could exceed 100% when clearing backlog from previous periods. New formula measures "how much of clearable work is cleared."
- **Daily backlog accumulation** uses opening backlog + daily deltas, avoiding N queries per day.

## Files Created

- `scripts/backfill-lead-source.ts`
- `server/services/dashboard/lead-flow.service.ts`
- `server/services/dashboard/lead-distribution.service.ts`
- `server/routes/dashboard-lead-flow.routes.ts`
- `server/routes/dashboard-lead-distribution.routes.ts`
- `src/hooks/use-lead-flow.ts`, `use-lead-distribution.ts`
- `src/components/dashboard/lead-distribution/*`

## Next Steps

- Run `npm run backfill:lead-source` to populate source for existing leads
- Monitor endpoint latency (target p95 < 500ms for 30-day range)
