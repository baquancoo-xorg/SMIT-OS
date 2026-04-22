# 2026-04-22 u2014 LeadLogs Modal UX & Delete Permission

## Context

User reported UX pain points in LeadLogs table: inline note textarea khu00f4ng xuu1ed1ng du00f2ng u0111u01b0u1ee3c (Enter = save), thu00eam du00f2ng mu1edbi hiu1ec3n du01b0u1edbi cu00f9ng bu1ea3ng phu1ea3i scroll.

## Decisions

- **Xu00f3a hou00e0n tou00e0n inline edit + pending rows** u2192 thay bu1eb1ng `LeadLogDialog` modal (mode: add | edit)
- **Xu00f3a paste-from-clipboard feature** u2014 simplification
- **Delete permission**: 2 nullable fields tru00ean `Lead` model (`deleteRequestedBy`, `deleteRequestedAt`) u2014 khu00f4ng tu1ea1o model riu00eang (KISS)
- **Leader Sale** u0111u01b0u1ee3c xou00e1: `role === 'Leader' && departments.includes('Sale')`
- **Member flow**: gu1eedi yu00eau cu1ea7u u2192 Admin/Leader thu1ea5y dot u0111u1ecf + nu00fat Duyu1ec7t/Tu1eeb chu1ed1i

## Plan

`plans/260422-1103-leadlogs-modal-ux-delete-permission/` u2014 5 phases:
1. Schema migration (2 fields)
2. Backend: auth check DELETE + 4 endpoint mu1edbi
3. Frontend types + API client methods
4. `lead-log-dialog.tsx` component mu1edbi
5. Refactor `lead-logs-tab.tsx` (xu00f3a ~120 du00f2ng inline/pending code)

## Impact

- UX: Notes textrea tu1ef1 do xu00f3a cu1eb7t, xu00f3a lu01b0u trong modal r00f5 ru00e0ng
- Security: xu00f3a khu00f4ng cu00f2n ai gu1ecdi du01b0u1ee3c nu1ebfu khu00f4ng cu00f3 quyu1ec1n
- Code: file lead-logs-tab.tsx giam u2248120-150 du00f2ng
