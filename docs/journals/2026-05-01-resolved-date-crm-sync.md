# Resolved Date Auto-Sync from CRM Activities

**Date**: 2026-05-01 01:11
**Severity**: Medium
**Component**: Lead Sync / CRM Integration
**Status**: Resolved

## What Happened

Reversed Phase 03 decision to make `resolvedDate` local-only. Implemented automatic sync from CRM activity logs to capture actual status change timestamps.

## Technical Details

- Created `server/services/lead-sync/derive-resolved-date.ts` with batch loader (`loadResolvedDateMap`)
- Added `resolvedDate` to `CRM_OWNED_FIELDS` array
- Synced leads (Q/UQ) pull timestamp from `crm_activities.change_status_subscriber` records
- UI locked down: DatePicker disabled, API strips field on PATCH
- Commit: `d5b842a` — `feat(lead-sync): auto-fill resolvedDate from CRM activities`

## Why This Matters

Manual date entry was unreliable. CRM activity log provides auditable source of truth. Sales teams no longer maintain two states.

## Unresolved

Phase 03 backfill still pending—requires manual API call to populate existing leads. No migration scheduled yet.
