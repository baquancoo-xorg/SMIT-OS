# Phase 06 — CRM + Ads + Revenue + OKR tools (8 tools)

## Context Links

- Parent plan: [../plan.md](./plan.md)
- Brainstorm: `plans/reports/brainstorm-260512-0045-mcp-cowork-smitos-data-access.md` (section "Tools full list" — rows 4-12)
- Phase 04 (scaffold contract): [phase-04-mcp-server-scaffold-libs.md](./phase-04-mcp-server-scaffold-libs.md)
- Phase 05 (validated tool pattern): [phase-05-mcp-server-reports-dashboard-tools.md](./phase-05-mcp-server-reports-dashboard-tools.md)
- SMIT-OS endpoints consumed:
  - `GET /api/leads` → `server/routes/lead.routes.ts`
  - `GET /api/dashboard/lead-distribution` → `server/routes/dashboard-lead-distribution.routes.ts`
  - `GET /api/dashboard/lead-flow` → `server/routes/dashboard-lead-flow.routes.ts`
  - `GET /api/ads-tracker/campaigns` → returns `{success, data: {campaigns: […]}}` (verified)
  - `GET /api/dashboard/overview` (ads section) — already used by `overview_snapshot` in phase 05; reuse with view filter
  - `GET /api/dashboard/product/summary` → returns `{success, data, cached}` (verified)
  - `GET /api/objectives` → `server/routes/objective.routes.ts`
  - `GET /api/key-results` → `server/routes/key-result.routes.ts`
- **Depends on:** phase 04 (scaffold), phase 05 (pattern), phase 03 (endpoints accept ApiKey w/ correct scopes)
- **Blocks:** phase 07 (E2E)

## Overview

- Date: 2026-05-12
- Description: Implement remaining 8 MCP tools across 4 domains. Open items: verify exact response shapes during impl + per-tool zod input mapping.
- Priority: P2
- Implementation status: pending
- Review status: pending

## Key Insights

- `ads-tracker/campaigns` returns enriched `summary` array (id, name, spendTotal, ctr, etc.) — perfect for `formatTable` (no transformation needed).
- `dashboard/product` is the **PostHog** product analytics endpoint, NOT revenue. Revenue is actually in `dashboard/overview.summary`. **Re-mapping**: `revenue_summary` tool should call `/api/dashboard/overview` and extract summary block; do NOT use `dashboard/product`. Update brainstorm decision: `dashboard/product` is product-funnel data (PQL/activation), not revenue. Either:
  - (a) drop `revenue_summary` (already covered by `overview_snapshot`)
  - (b) keep `revenue_summary` as alias that calls overview + extracts only revenue fields (cleaner Cowork prompt UX).
  - **Choose (b)** — explicit tool name helps Cowork pick correctly. Tool extracts `data.summary.revenue.*` from overview response.
- Scope mapping for `revenue_summary`: needs `read:dashboard` (since it hits `/api/dashboard/overview`). Document in `.env.example`.
- `list_objectives` and `kr_progress`: response includes nested `keyResults[]`. `formatTable` may flatten poorly — use hybrid: outer `formatTable` for objective list, separate `formatJson(kr)` if user requests details.
- `lead_distribution` returns aggregated buckets (probably `{stage: count}` shape) — `formatTable(rows, ['stage','count'])` after coercing object→entries.

## Requirements

### Functional

#### CRM (3 tools)

##### 6. `list_leads`

- Description: "List CRM leads filtered by status, source, date range, owner"
- Input zod: `{ status?: string, source?: string, ownerId?: uuid, from?: dateStr, to?: dateStr, limit: 1-200 default 50 }`
- Handler: `api.get('/api/leads', { params })`. Apply client-side filters if backend ignores. `formatTable` with `[name, status, source, owner.fullName, createdAt]`.

##### 7. `lead_distribution`

- Description: "Lead distribution by stage/source/department for a date range"
- Input zod: `{ from?: dateStr, to?: dateStr, groupBy?: enum(['stage','source','department']) }`
- Handler: `api.get('/api/dashboard/lead-distribution', { params })`. `formatTable` of buckets.

##### 8. `lead_flow`

- Description: "Lead flow Sankey-style data: source → stage transitions for a date range"
- Input zod: `{ from?: dateStr, to?: dateStr }`
- Handler: `api.get('/api/dashboard/lead-flow', { params })`. `formatJson` (graph data hard to tabulate cleanly).

#### Ads (2 tools)

##### 9. `list_ad_campaigns`

- Description: "List active and historical ad campaigns with spend, impressions, clicks, conversions"
- Input zod: `{ from?: dateStr, to?: dateStr, platform?: enum(['meta','google','tiktok']), status?: enum(['active','paused','ended']) }`
- Handler: `api.get('/api/ads-tracker/campaigns', { params: { from, to } })` → unwrap `data.campaigns`. Client-side filter platform/status. `formatTable` with `[platform, name, status, spendTotal, impressions, clicks, conversions, ctr]`.

##### 10. `ad_spend_summary`

- Description: "Aggregate ad spend across all campaigns for a date range, normalized to VND"
- Input zod: `{ from: dateStr, to: dateStr }`
- Handler: `api.get('/api/ads-tracker/campaigns', { params })`. Sum `spendTotal` across all returned campaigns. Return `formatJson({ totalSpendVnd, campaignCount, periodStart, periodEnd })`.

#### Revenue (1 tool)

##### 11. `revenue_summary`

- Description: "Revenue summary (gross, MRR, cohort) for a date range"
- Input zod: `{ from: dateStr, to: dateStr }`
- Handler: `api.get('/api/dashboard/overview', { params })`. Unwrap `data.summary`. Extract revenue-related fields (exact fields TBD in implementation — see open item). Return `formatJson({ revenue: {...} })`.
- Scope required: `read:dashboard` (decided 2026-05-12: no separate `read:revenue` scope; data lives under dashboard endpoints).

#### OKR (2 tools)

##### 12. `list_objectives`

- Description: "List OKRs filtered by cycle, owner, status"
- Input zod: `{ cycleId?: string, ownerId?: uuid, status?: string, limit: 1-200 default 50 }`
- Handler: `api.get('/api/objectives', { params })`. `formatTable` with `[title, owner.fullName, cycle.label, progress, status]`.

##### 13. `kr_progress`

- Description: "Key result progress filtered by objective or owner"
- Input zod: `{ objectiveId?: uuid, ownerId?: uuid, limit: 1-200 default 50 }`
- Handler: `api.get('/api/key-results', { params })`. `formatTable` with `[title, owner.fullName, currentValue, targetValue, progressPct, status]`.

### Non-functional

- Each tool file < 80 LOC.
- Reuse `filters.ts`, `response-unwrap.ts`, `format.ts`, `api-client.ts` from phase 04/05 (DRY).
- Smoke test all 8 with MCP inspector.
- Total tool count after this phase: 13 (5 from phase 05 + 8 here).

## Architecture

### Per-tool file pattern (same as phase 05)

```ts
// src/tools/crm/list-leads.ts
import { z } from 'zod';
import { api } from '../../lib/api-client.js';
import { formatTable, formatError } from '../../lib/format.js';
import { unwrap } from '../../lib/response-unwrap.js';
import { applyLimit, filterByDateRange } from '../../lib/filters.js';
import type { ToolDefinition } from '../../lib/tool-types.js';

const inputSchema = z.object({ /* … */ });

const tool: ToolDefinition<z.infer<typeof inputSchema>> = {
  name: 'list_leads',
  description: '…',
  inputSchema,
  handler: async (input) => {
    try {
      const res = await api.get('/api/leads', { params: input });
      const rows = unwrap(res);
      const filtered = applyLimit(filterByDateRange(rows, 'createdAt', input.from, input.to), input.limit);
      return formatTable(filtered, ['name', 'status', 'source', 'owner.fullName', 'createdAt']);
    } catch (err) {
      return formatError(err);
    }
  },
};

export default tool;
```

### Filter helper extension

If new shared filter needed (e.g. `filterByPlatform`), add to `src/lib/filters.ts`. Keep < 100 LOC total; split if exceeds.

## Related Code Files

### Create (all under `/Users/dominium/Documents/Project/smitos-mcp-server/`)

- `src/tools/crm/list-leads.ts`
- `src/tools/crm/lead-distribution.ts`
- `src/tools/crm/lead-flow.ts`
- `src/tools/ads/list-ad-campaigns.ts`
- `src/tools/ads/ad-spend-summary.ts`
- `src/tools/revenue/revenue-summary.ts`
- `src/tools/okr/list-objectives.ts`
- `src/tools/okr/kr-progress.ts`

### Modify

- `src/lib/filters.ts` — extend if shared filters needed (platform, status enum)
- `README.md` — start populating "Tools" section listing all 13 (with descriptions, scope requirements)

### Delete

- None

## Implementation Steps

1. CRM tools first (lowest risk — endpoint shapes well-known):
   - Create `list-leads.ts`, `lead-distribution.ts`, `lead-flow.ts`.
   - Smoke each in inspector.
2. OKR tools (also stable):
   - Create `list-objectives.ts`, `kr-progress.ts`.
   - Smoke each.
3. Ads tools (verify shape):
   - Read live response from `curl -H "X-API-Key: smk_..." https://qdashboard.smitbox.com/api/ads-tracker/campaigns?from=2026-05-01&to=2026-05-12 | jq '.data.campaigns[0]'` to confirm column keys.
   - Create `list-ad-campaigns.ts`, `ad-spend-summary.ts`.
   - Smoke each.
4. Revenue tool (decision point):
   - `curl` `/api/dashboard/overview?from=...&to=...` → inspect `data.summary` keys → identify revenue fields.
   - Create `revenue-summary.ts` extracting only those fields.
   - Smoke.
5. Update README.md "Tools" table — 13 rows: tool name · description · required scope · example query.
6. Run full inspector pass: `tools/list` returns 13; call each tool with realistic input.
7. `npm run typecheck` + `npm run build` clean.
8. Commit `feat: add crm, ads, revenue, okr tools (8) — 13 total`.

## Todo List

- [ ] Create `src/tools/crm/list-leads.ts`
- [ ] Create `src/tools/crm/lead-distribution.ts`
- [ ] Create `src/tools/crm/lead-flow.ts`
- [ ] Create `src/tools/okr/list-objectives.ts`
- [ ] Create `src/tools/okr/kr-progress.ts`
- [ ] Verify ads-tracker response shape via curl
- [ ] Create `src/tools/ads/list-ad-campaigns.ts`
- [ ] Create `src/tools/ads/ad-spend-summary.ts`
- [ ] Verify dashboard/overview revenue field shape via curl
- [ ] Create `src/tools/revenue/revenue-summary.ts`
- [ ] Update README.md tools table
- [ ] MCP inspector lists 13 tools
- [ ] Smoke each tool with realistic input
- [ ] `npm run typecheck` + `build` clean
- [ ] Commit

## Success Criteria

- 13 tools registered, all callable via inspector.
- Each tool < 80 LOC; libs unchanged or minimally extended.
- README.md tools table complete with scope mapping.
- All tool responses come from live SMIT-OS data (no mocks).

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `dashboard/overview` revenue fields different from expectation | High | Medium | Verify via curl in step 4 BEFORE coding tool; adapt extraction logic |
| `lead_flow` response too large/nested for Cowork token budget | Medium | Medium | Inspect size; add `summarize: bool` input flag if needed (default true → return aggregates only) |
| Backend `lead-distribution` query params not honored | Medium | Low | Client-side regroup if necessary; document in tool description |
| OKR endpoints require authenticated user context (`req.user.userId`) for filtering "my objectives" | Low | Medium | Backend GET returns ALL objectives (read-shared per phase 03); api-key user sees full set |
| Ads tool platform filter not supported by backend | Low | Low | Client-side filter via `filters.ts` |
| Adding 8 tools at once → harder to debug failures | Medium | Medium | Smoke each tool immediately after creation, not at end |

## Security Considerations

- Same as phase 05: no logging of input/output, TLS via CF Tunnel, ApiKey only.
- `revenue_summary` exposes financial data — ensure key holding `read:dashboard` is granted only to trusted Cowork host (admin policy, not technical).
- Lead data includes PII (names, phone numbers if present in response). Document in `docs/api-key-authentication.md` (phase 07): keys with `read:crm` access PII; treat as confidential.

## Next Steps

- Phase 07: integration with Claude Desktop, E2E test, docs.
