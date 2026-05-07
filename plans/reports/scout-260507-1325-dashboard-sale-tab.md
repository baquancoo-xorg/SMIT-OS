# Scout Report: Dashboard and Sale Tab Implementation

**Date:** 2026-05-07 13:25  
**Status:** DONE

## Summary

Located all files related to Dashboard and Sale tab implementation. The codebase has:
- Main Dashboard page with tabbed navigation (Overview, Sale, Product, Marketing, Media)
- Sale tab with Call Performance section and Lead Flow/Clearance analytics
- Chart implementations using Recharts library
- Lead data types and structures
- Multiple dashboard UI components and services

## Files Found

### Frontend - Dashboard & Pages

**Main Dashboard Page:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/DashboardOverview.tsx` (130 lines)
  - Tab navigation with 5 tabs: Overview, Sale, Product, Marketing, Media
  - Date range picker and view mode toggle
  - Renders different components based on selected tab

**Sale Board Page:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/SaleBoard.tsx` (474 lines)
  - Kanban board for Sales team tasks
  - Board/Table view toggle
  - Drag-and-drop functionality for task management
  - Sprint filtering and task status management

### Frontend - Dashboard Components

**UI Components (dashboard/ui):**
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/ui/dashboard-empty-state.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/ui/dashboard-page-header.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/ui/dashboard-panel.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/ui/dashboard-section-title.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/ui/segmented-tabs.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/ui/index.ts`

**Overview Components (dashboard/overview):**
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/overview/DateRangePicker.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/overview/KpiTable.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/overview/SummaryCards.tsx`

**Call Performance Components (dashboard/call-performance):**
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/call-performance/call-performance-section.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/call-performance/call-performance-ae-table.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/call-performance/call-performance-heatmap.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/call-performance/call-performance-conversion.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/call-performance/call-performance-trend.tsx`

**Lead Tracker - Dashboard Tab:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/lead-tracker/dashboard-tab.tsx` (245 lines)
  - KPI cards: Inflow, Cleared, Active Backlog, Clearance Rate
  - Weekly performance bar chart (Inflow vs Cleared vs Active Backlog)
  - Backlog trend line chart
  - Uses Recharts for visualization

### Frontend - Other Lead Tracker Components

- `/Users/dominium/Documents/Project/SMIT-OS/src/components/lead-tracker/lead-logs-tab.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/lead-tracker/daily-stats-tab.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/lead-tracker/lead-log-dialog.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/lead-tracker/lead-detail-modal.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/lead-tracker/source-badge.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/lead-tracker/last-sync-indicator.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/lead-tracker/sync-from-crm-button.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/lead-tracker/csv-export.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/lead-tracker/bulk-action-bar.tsx`

### Frontend - Types & Interfaces

**Dashboard Types:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/types/dashboard-overview.ts`
  - MetricWithTrend, SummaryMetrics, KpiMetricsRow, KpiMetricsResponse, OverviewData

**Lead Types:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/types/index.ts` (218 lines)
  - Lead interface with: id, customerName, ae, receivedDate, resolvedDate, status, leadType, unqualifiedType, notes, crmSubscriberId, syncedFromCrm, lastSyncedAt, deleteRequestedBy, deleteRequestedAt, deleteReason, createdAt, updatedAt
  - LeadAuditLog interface
  - LeadDailyStat interface

**Daily Report Types:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/types/index.ts` (contains DailyReport, DailyReportTasksData)

### Backend - Dashboard Routes & Services

**Routes:**
- `/Users/dominium/Documents/Project/SMIT-OS/server/routes/dashboard-overview.routes.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/routes/dashboard-call-performance.routes.ts`

**Services:**
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/dashboard/overview-summary.service.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/dashboard/overview-kpi.service.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/dashboard/overview-cohort.service.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/dashboard/overview-helpers.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/dashboard/overview-ad-spend.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/dashboard/call-performance.service.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/dashboard/call-performance-aggregators.ts`

**Schemas:**
- `/Users/dominium/Documents/Project/SMIT-OS/server/schemas/dashboard-overview.schema.ts`

**Types:**
- `/Users/dominium/Documents/Project/SMIT-OS/server/types/dashboard-overview.types.ts`

### Backend - Lead Related

**Routes:**
- `/Users/dominium/Documents/Project/SMIT-OS/server/routes/lead.routes.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/routes/lead-sync.routes.ts`

**Schemas:**
- `/Users/dominium/Documents/Project/SMIT-OS/server/schemas/lead.schema.ts`

**Services:**
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/lead-sync/crm-lead-sync.service.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/lead-sync/derive-lead-type.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/lead-sync/derive-resolved-date.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/lead-sync/derive-notes.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/lead-sync/status-mapper.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/lead-sync/employee-mapper.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/lead-sync/state.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/lead-sync/advisory-lock.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/lead-sync/constants.ts`

**Cron:**
- `/Users/dominium/Documents/Project/SMIT-OS/server/cron/lead-sync.cron.ts`

### Other Related

**Daily Report:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/SaleDailyForm.tsx`

**Scripts:**
- `/Users/dominium/Documents/Project/SMIT-OS/scripts/backfill-lead-type.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/scripts/backfill-crm-leads.ts`

## Architecture Overview

### Dashboard Structure

1. **DashboardOverview.tsx** - Main container with 5 tabs
   - Uses URL search params for tab navigation
   - Loads data via `useOverviewAll` hook
   - Conditional rendering based on selected tab

2. **Sale Tab Contents:**
   - CallPerformanceSection (Shows AE performance, heatmaps, conversion, trends)
   - DashboardTab (Lead Flow & Clearance with charts)

3. **Chart Library:** Recharts
   - BarChart: Weekly performance (Inflow vs Cleared vs Active Backlog)
   - LineChart: Backlog trend over time

### Lead Type Structure

The Lead interface includes:
- Basic info: id, customerName, ae, receivedDate, resolvedDate
- Status: status, leadType, unqualifiedType
- Metadata: notes, crmSubscriberId, syncedFromCrm, lastSyncedAt
- Deletion tracking: deleteRequestedBy, deleteRequestedAt, deleteReason
- Timestamps: createdAt, updatedAt

### Key Metrics

**Sale Tab Dashboard:**
- Inflow: Count of leads received
- Cleared: Count of leads with status "Qualified" or "Unqualified"
- Active Backlog: Leads not yet cleared
- Clearance Rate: (Cleared / Inflow) × 100%

## Related Hooks & Utilities

- `useOverviewAll()` - Fetches overview data for all tabs
- `useCallPerformance()` - Fetches call performance metrics
- `api.getLeads()` - Fetches lead data with filters

## Key Observations

1. **Recharts Integration:** Charts are already implemented using Recharts library with:
   - Custom styling matching design system
   - Responsive containers
   - Legend and tooltip configurations

2. **Date Filtering:** Dashboard supports date range selection via DateRangePicker

3. **View Modes:** Overview tab supports "realtime" and "cohort" view modes

4. **Empty States:** Product, Marketing, and Media tabs show placeholder empty states indicating future implementation

5. **Lead Sync:** Comprehensive lead sync from CRM with status mapping, date derivation, and employee mapping

