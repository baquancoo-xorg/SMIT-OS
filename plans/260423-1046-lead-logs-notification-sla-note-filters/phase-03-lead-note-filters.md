# Phase 03 — Lead Note Filters (API + UI)

## Overview
- Priority: High
- Goal: filter by note presence and quick note-change date

## Files
- `server/routes/lead.routes.ts`
- `src/lib/api.ts`
- `src/components/lead-tracker/lead-logs-tab.tsx`

## Query Contract
- `hasNote`: `yes | no` (optional)
- `noteDate`: `YYYY-MM-DD` (optional, quick mode via `updatedAt`)

## Backend Changes (`/api/leads`)

1. Parse query params `hasNote`, `noteDate`
2. Extend Prisma `where`:
   - `hasNote=yes` => `notes` not null and not empty string
   - `hasNote=no` => `notes` null or empty string
   - `noteDate` => `updatedAt` in day range `[00:00:00, 23:59:59.999]`

## Frontend Changes

1. Extend filter state with:
   - `hasNote` (default empty = All)
   - `noteDate` (default empty)
2. Add UI controls in filter bar:
   - `CustomFilter` for hasNote: All / With note / Without note
   - `DatePicker` for noteDate
3. Include params when calling `api.getLeads`

## Risks
- `noteDate` is approximate (any update on that day matches), already accepted by user
- Keep query optional; no filter should preserve current behavior

## Done Checklist
- [ ] Has note filter works with all 3 states
- [ ] Note date filter returns records updated on selected date
- [ ] Combined filters (AE + Status + HasNote + NoteDate + Date range) work correctly
