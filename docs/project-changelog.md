# Project Changelog

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
