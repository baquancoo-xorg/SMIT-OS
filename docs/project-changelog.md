# Project Changelog

## [v2.1.15] - 2026-04-28

### Login Redesign + Sliding Session

- **Login UI**: replaced Shield icon with real PNG logo (`/logo-only.png`, 256×256, 59KB); gradient changed from royal blue to deep navy (#0F2A44 → #1E4167 → #2A6498); floating orbs updated to cyan tones
- **Sliding session**: JWT auto-refreshes when remaining time < 1h on any authenticated request — users active continuously never get logged out; idle > 4h = logout (security preserved)
- **DRY refactor**: extracted shared cookie config to `server/lib/cookie-options.ts`, used by both `auth.routes.ts` and `auth.middleware.ts`
- Added `getTokenRemaining()` helper in `auth.service.ts`
- Quality gate: TypeScript 0 errors, code review 8.5/10

## [v2.1.14] - 2026-04-28

### Security / Performance / Cleanup

- Introduced Prisma singleton at `server/lib/prisma.ts`; all server files now import from it. `server/lib/crm-db.ts` remains intentionally separate.
- Hardened `server.ts`: 2 MB JSON body limit, Helmet CSP report-only header, CORS blank-origin restricted to non-production, general API rate limiter (200 req/min), `requireAdmin` gate on `/api/admin/*`.
- Added 60 s in-memory TTL cache to `server/services/dashboard/overview-ad-spend.ts` for CRM aggregation queries.
- Fixed N+1 query pattern in `server/services/lead-sync/crm-lead-sync.service.ts`: replaced per-lead `findUnique` loop with batch `findMany` + `Map` lookup.
- Removed dead client-side hooks: `src/hooks/use-users.ts`, `src/hooks/use-objectives.ts`, `src/hooks/use-sprints.ts`.

## [v2.1.13] - 2026-04-27

### Updated: Unified Table UI Design System — Phase 03 dense rollout completed

- Completed dense contract rollout for call-performance analytics tables:
  - `src/components/dashboard/call-performance/call-performance-ae-table.tsx`
  - `src/components/dashboard/call-performance/call-performance-conversion.tsx`
- Both tables now use shared `TableShell` with `variant="dense"` and `getTableContract('dense')` tokens for header/row/cell consistency.
- Preserved existing data logic and metric formatting behavior while standardizing dense visual shell.
- Quality gate:
  - `npm run lint` passed (`tsc --noEmit`).
  - Subagent review/test checks passed.
  - Float precision follow-up resolved by using decimal formatting for `callsPerLead`, `avgDuration`, and `avgCallsBeforeClose`.

## [v2.1.12] - 2026-04-27

### Updated: Unified Table UI Design System — Phase 02 standard rollout completed

- Completed standard-table contract rollout across operational modules and modal embedded tables.
- Finalized modal migrations:
  - `src/components/modals/WeeklyCheckinModal.tsx` — replaced inline next-week plan table with `TableShell` + `getTableContract('standard')`, standardized action header/cell to `Actions` contract.
  - `src/components/modals/ReportDetailDialog.tsx` — migrated plans table to standard contract and switched deadline rendering to shared `formatTableDate` helper.
- Confirmed contract consistency in Phase 02 inventory (action header/cell and shared date formatting paths).
- Quality gate:
  - `npm run lint` passed (`tsc --noEmit`).
  - Test baseline passed (1/1).

## [v2.1.11] - 2026-04-27

### Updated: Unified Table UI Design System — Phase 01 foundation completed

- Added shared table primitives:
  - `src/components/ui/table-contract.ts`
  - `src/components/ui/table-shell.tsx`
  - `src/components/ui/table-date-format.ts`
- Updated `src/components/ui/table-row-actions.tsx` to support variant-aware behavior (`standard` / `dense`) and dense compact icon sizing.
- Migrated standard pilot table `src/components/board/TaskTableView.tsx` to shared table shell/contract, standardized action header (`Actions`), and unified table date formatting.
- Migrated dense pilot table `src/components/dashboard/overview/KpiTable.tsx` + `src/components/dashboard/overview/kpi-table-utils.ts` to shared dense contract styles and unified date helper while preserving existing sorting and scroll behavior.
- Removed unused KPI sort field `trials` from `SortField` to align with actual table columns and avoid dead sort path.

## [v2.1.10] - 2026-04-27

### Added: Shared `TableRowActions` component and standardised table action buttons

- Added `src/components/ui/table-row-actions.tsx` — reusable dropdown action component for table rows.
- Replaced inline action buttons with `TableRowActions` across ProductBacklog, TaskTableView, DailySync, ReportTableView, LeadLogs, UserManagement, and FbConfig.
- LeadLogs bulk delete: Delete button is now rendered only when the current user has `admin` or `leader_sale` role, eliminating runtime permission alerts.
- UserManagement: Delete button is hidden for the currently logged-in user to prevent self-deletion.

## [v2.1.9] - 2026-04-26

### Added: CRM lead sync + Call Performance dashboard

- Added backend route `GET /api/dashboard/call-performance` with authentication and validated query params (`from`, `to`, optional `aeId`).
- Added server-side call performance aggregation from `crm_call_history` with 4 sections: `perAe`, `heatmap`, `conversion`, `trend`.
- Added 5-minute in-memory cache for call performance payloads with max key cap to avoid unbounded growth.
- Added timezone-safe VN date bucketing for heatmap/trend and production-safe error response handling for dashboard call API.
- Added frontend Call Performance section under Overview Dashboard with:
  - per-AE performance table,
  - 7x24 heatmap,
  - conversion table,
  - trend chart (dual Y-axis for count vs avg duration).
- Integrated new React Query hook `useCallPerformance` and response types for call performance API.

### Updated: Lead Tracker phase-04 UX hardening

- Deprecated manual lead entry entry points in Lead Tracker logs UI and shifted control toward CRM sync flow.
- Added CRM sync controls and last-sync indicator in lead logs, plus source badge for CRM/manual provenance.
- Locked CRM-owned lead fields in edit modal to preserve CRM as source-of-truth.
- Restricted bulk edit to SMIT-only fields (`notes`, `leadType`, `unqualifiedType`).
