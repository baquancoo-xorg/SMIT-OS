# Phase 05 — Reports + Dashboard tools (5 tools)

## Context Links

- Parent plan: [../plan.md](./plan.md)
- Brainstorm: `plans/reports/brainstorm-260512-0045-mcp-cowork-smitos-data-access.md` (section "Tools full list" — first 5 rows)
- Phase 04 (scaffold + libs): [phase-04-mcp-server-scaffold-libs.md](./phase-04-mcp-server-scaffold-libs.md)
- Phase 03 (whitelisted backend endpoints): [phase-03-smitos-whitelist-routes-integration-test.md](./phase-03-smitos-whitelist-routes-integration-test.md)
- SMIT-OS endpoints consumed:
  - `GET /api/daily-reports`, `GET /api/daily-reports/:id` → `server/routes/daily-report.routes.ts`
  - `GET /api/reports`, `GET /api/reports/:id` → `server/routes/report.routes.ts`
  - `GET /api/dashboard/overview` → `server/routes/dashboard-overview.routes.ts` (returns `{success, data: {summary, kpiMetrics}, timestamp}`)
  - `GET /api/dashboard/call-performance/*` → `server/routes/dashboard-call-performance.routes.ts`
- **Depends on:** phase 03 (endpoints accept ApiKey), phase 04 (scaffold ready)
- **Blocks:** phase 06 (validates tool contract), phase 07 (E2E)

## Overview

- Date: 2026-05-12
- Description: Implement 5 MCP tools in `smitos-mcp-server`: 3 report-related + 2 dashboard. Validates the tool authoring pattern end-to-end before tackling 8 more tools in phase 06.
- Priority: P2
- Implementation status: pending
- Review status: pending

## Key Insights

- Backend GET /api/daily-reports returns a Prisma array DIRECTLY (no `{success, data, …}` envelope) — see `daily-report.routes.ts:28`. But dashboard endpoints DO wrap in `{success, data, …}`. Format module must handle both: unwrap when `success` key present, pass-through otherwise.
- `dashboard/overview` query params are `from`, `to` (ISO date strings) — see `dashboard-overview.schema.ts`. zod schema in tool must match.
- Daily reports have status enum `'Review' | 'Approved'` — capture in zod for input filter.
- `/api/reports` is the WEEKLY reports endpoint (legacy name, not refactored). MCP tool name should be `list_weekly_reports` to avoid Cowork confusion.
- `get_report_by_id` needs `type` discriminator since daily and weekly have different routes. Single tool with `type: 'daily' | 'weekly'` keeps Cowork mental model simple (1 tool, not 2).
- Limit max 200 per tool — backend has no built-in limit but client-side cap protects Cowork token budget.

## Requirements

### Functional

Each tool follows contract from phase 04 (`ToolDefinition<TInput>`):

#### 1. `list_daily_reports`

- Description: "List daily reports filtered by date range, user, status"
- Input zod:
  ```ts
  z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    userId: z.string().uuid().optional(),
    status: z.enum(['Review', 'Approved']).optional(),
    limit: z.number().int().min(1).max(200).default(50),
  })
  ```
- Handler: `api.get('/api/daily-reports')`, then client-side filter (backend ignores query params currently — confirm in phase 03 audit; if backend support added, pass params instead). Apply limit. Return `formatTable` with columns `[reportDate, user.fullName, status, blockers, planToday]`.

#### 2. `list_weekly_reports`

- Description: "List weekly reports filtered by week range, user, status"
- Input zod: similar shape, `weekStart?`, `weekEnd?`, `userId?`, `status?`, `limit`.
- Handler: `api.get('/api/reports')`, client-side filter on `weekEnding` range. `formatTable`.

#### 3. `get_report_by_id`

- Description: "Get a single daily or weekly report by ID"
- Input zod:
  ```ts
  z.object({
    id: z.string().uuid(),
    type: z.enum(['daily', 'weekly']),
  })
  ```
- Handler: route to `/api/daily-reports/:id` or `/api/reports/:id`. Return `formatJson` (full row useful for Cowork analysis).

#### 4. `overview_snapshot`

- Description: "Dashboard overview KPIs for a date range (revenue, leads, calls, ads)"
- Input zod: `{ from: dateStr, to: dateStr, viewMode?: enum(['realtime','cohort']) }`
- Handler: `api.get('/api/dashboard/overview', { params })`. Unwrap `{success, data}`. Return `formatJson(data)` — too many nested KPIs for table.

#### 5. `call_performance`

- Description: "Call performance metrics per user for a date range"
- Input zod: `{ from: dateStr, to: dateStr, userId?: uuid }`
- Handler: `api.get('/api/dashboard/call-performance/...')` (exact sub-route confirmed in phase 03 audit). Return `formatTable` if list-shaped, else `formatJson`.

### Non-functional

- Each tool file < 80 LOC.
- Reuse `api` + `format` from `lib/`.
- No business logic — tools are thin adaptors.
- Smoke test all 5 with MCP inspector before phase 06 starts.

## Architecture

### Tool file template (DRY enforcement)

```ts
// src/tools/reports/list-daily-reports.ts
import { z } from 'zod';
import { api } from '../../lib/api-client.js';
import { formatTable, formatError } from '../../lib/format.js';
import type { ToolDefinition } from '../../lib/tool-types.js';

const inputSchema = z.object({ /* … */ });

const tool: ToolDefinition<z.infer<typeof inputSchema>> = {
  name: 'list_daily_reports',
  description: '…',
  inputSchema,
  handler: async (input) => {
    try {
      const { data } = await api.get('/api/daily-reports');
      const filtered = applyFilters(data, input);
      return formatTable(filtered, ['reportDate', 'user.fullName', 'status', 'blockers', 'planToday']);
    } catch (err) {
      return formatError(err);
    }
  },
};

export default tool;
```

### Filter helper extraction (DRY)

If `applyFilters` repeats across `list_daily_reports` + `list_weekly_reports`, extract to `src/lib/filters.ts`:
- `filterByDateRange(rows, dateField, start?, end?)`
- `filterByUserId(rows, userIdField, userId?)`
- `filterByStatus(rows, statusField, status?)`
- `applyLimit(rows, limit)`

Keep `filters.ts` < 80 LOC.

## Related Code Files

### Create (all under `/Users/dominium/Documents/Project/smitos-mcp-server/`)

- `src/tools/reports/list-daily-reports.ts` (~60 LOC)
- `src/tools/reports/list-weekly-reports.ts` (~60 LOC)
- `src/tools/reports/get-report-by-id.ts` (~40 LOC)
- `src/tools/dashboard/overview-snapshot.ts` (~50 LOC)
- `src/tools/dashboard/call-performance.ts` (~50 LOC)
- `src/lib/filters.ts` (~70 LOC) — shared filter helpers
- `src/lib/response-unwrap.ts` (~20 LOC) — `unwrap(res)` returns `res.data.data` if envelope present, else `res.data`

### Modify

- `src/lib/format.ts` — add path access helper `pick(obj, 'user.fullName')` for table columns containing dots (if not already there from phase 04)

### Delete

- None

## Implementation Steps

1. Create `src/lib/response-unwrap.ts`:
   ```ts
   export function unwrap<T = unknown>(res: { data: any }): T {
     return res.data?.success !== undefined ? res.data.data : res.data;
   }
   ```
2. Create `src/lib/filters.ts` with `filterByDateRange`, `filterByUserId`, `filterByStatus`, `applyLimit`. Pure functions, no side effects.
3. Create `src/tools/reports/list-daily-reports.ts` per template above. Use `unwrap` + `filters`.
4. Create `src/tools/reports/list-weekly-reports.ts` (analogous).
5. Create `src/tools/reports/get-report-by-id.ts`:
   - Route by `type` to `/api/{daily-reports|reports}/:id`.
   - Return `formatJson(report)`.
6. Create `src/tools/dashboard/overview-snapshot.ts`:
   - Pass `params: { from, to, viewMode }` to axios.
   - `formatJson(unwrap(res))`.
7. Create `src/tools/dashboard/call-performance.ts` — confirm sub-route in phase 03 audit; pass `from`, `to`, optional `userId` as query params.
8. Update `src/index.ts` (no code change needed if `loadTools()` globs `src/tools/**/*.ts` — but verify glob includes nested dirs).
9. `npm run build`.
10. Smoke test with MCP inspector:
    - `npx @modelcontextprotocol/inspector node dist/index.js`
    - Verify all 5 tools listed.
    - Call `list_daily_reports` with no input → table with default 50 rows.
    - Call `list_daily_reports` with `{ status: 'Approved' }` → filtered.
    - Call `get_report_by_id` with valid id → JSON.
    - Call `overview_snapshot` with last 7 days → JSON with KPIs.
    - Call `call_performance` with last 7 days → result.
11. If any tool errors: capture in `dist/error.log`, debug api-client retry logic.
12. Commit `feat: add reports + dashboard tools (5)`.

## Todo List

- [ ] Create `src/lib/response-unwrap.ts`
- [ ] Create `src/lib/filters.ts`
- [ ] Create `src/tools/reports/list-daily-reports.ts`
- [ ] Create `src/tools/reports/list-weekly-reports.ts`
- [ ] Create `src/tools/reports/get-report-by-id.ts`
- [ ] Create `src/tools/dashboard/overview-snapshot.ts`
- [ ] Create `src/tools/dashboard/call-performance.ts`
- [ ] `npm run typecheck` clean
- [ ] `npm run build` clean
- [ ] MCP inspector lists all 5 tools
- [ ] Each tool returns valid data against live SMIT-OS
- [ ] Commit

## Success Criteria

- All 5 tools registered + callable via MCP inspector.
- Each handler returns either `content: [{type:'text', text:...}]` or `isError: true` content on failure.
- No tool file exceeds 80 LOC.
- `npm run typecheck` clean with `strict: true`.
- Live data round-trip: tool → CF Tunnel → SMIT-OS → PG → response visible in inspector.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Backend returns Prisma include shape (`user.fullName`) but Cowork can't read nested via current formatTable | High | Medium | Add `pick(obj, 'a.b.c')` path helper in `format.ts` (or `filters.ts`); validate in smoke test |
| `dashboard/overview` response too large for one MCP message | Medium | Medium | Inspect size in smoke; if > 25KB, add summary-only mode (omit nested arrays) in handler |
| `call-performance` sub-route differs from naming | Medium | Low | Verify in phase 03 audit; adjust here. Open item flagged in plan.md |
| Filter date params don't match backend's `Date` typed field | Medium | Medium | Use ISO `YYYY-MM-DD` strings only; convert in handler before compare |
| MCP inspector caches stale tool list after rebuild | Low | Low | Restart inspector between builds |

## Security Considerations

- Tools never log raw input/output (input may contain employee names; output may contain blockers w/ sensitive text). Logging only error categories.
- All HTTP traffic via TLS (CF Tunnel). ApiKey header set once in axios instance.
- No file writes; no eval; no exec.

## Next Steps

- Phase 06: implement remaining 8 tools (CRM, Ads, Revenue, OKR). Reuses contract validated here.
