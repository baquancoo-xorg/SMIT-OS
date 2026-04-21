# Brainstorm: Lead Logs v2 u2014 Inline Edit Expansion + Audit Trail

**Date:** 2026-04-21  
**Status:** Approved

## Requirements

1. Di chuyu1ec3n Export CSV button lu00ean header cu1ea1nh ADD ROW
2. Thu00eam inline edit cho cu1ed9t AE (dropdown Sale users) vu00e0 Received Date
3. Notes inline edit du00f9ng textarea, Shift+Enter xuu1ed1ng du00f2ng
4. Thu00eam cu1ed9t Last Modified (updatedAt, format DD/MM/YYYY - HH:MM)
5. Timeline lu1ecbch su1eed thay u0111u1ed5i trong Lead Detail Modal

## Decisions

- Timeline **khu00f4ng** track `changedBy` (user request, simplifies impl)
- Timeline chu1ec9 bu1eaft u0111u1ea7u tu1eeb khi deploy (khu00f4ng backfill)
- `updatedAt` u0111u00e3 cu00f3 trong DB/API u2192 khu00f4ng cu1ea7n migration riu00eang cho cu1ed9t Last Modified

## Architecture

### New Prisma Model
```prisma
model LeadAuditLog {
  id        String   @id @default(uuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  changes   Json     // { field: { from: any, to: any } }
  createdAt DateTime @default(now())

  @@index([leadId, createdAt])
}
```
Add `auditLogs LeadAuditLog[]` to `Lead` model.

### PUT /leads/:id update
Fields to track: `status`, `ae`, `leadType`, `unqualifiedType`, `notes`, `resolvedDate`, `receivedDate`  
Diff before/after update u2192 if changes u2260 empty u2192 `prisma.leadAuditLog.create()`

### New endpoint
`GET /leads/:id/audit` u2192 `LeadAuditLog[]` sorted `createdAt desc`

## File Impact

| File | Change |
|------|---------|
| `prisma/schema.prisma` | +`LeadAuditLog` model, +relation in `Lead` |
| `server/routes/lead.routes.ts` | PUT: add diff+log; +GET `/:id/audit` |
| `src/lib/api.ts` | +`getLeadAuditLogs(id)` |
| `src/types/index.ts` | +`LeadAuditLog` interface |
| `src/components/lead-tracker/lead-logs-tab.tsx` | +AE/Received inline edit, Notesu2192textarea, +updatedAt column, u2212Export CSV btn |
| `src/components/lead-tracker/lead-detail-modal.tsx` | +Timeline section |
| `src/pages/LeadTracker.tsx` | +Export CSV button, +import `exportAllLeadsToCsv` |

## UI Specs

### Header buttons order (isSale only)
```
[PASTE FROM EXCEL]  [u2193 Export CSV]  [+ ADD ROW]
```

### Timeline entry format
```
21/04/2026 - 17:30
  Status: Mu1edbi u2192 Qualified
  Notes: u2014 u2192 "u0110u00e3 liu00ean hu1ec7 lu1ea7n u0111u1ea7u"
```

## Risk
- `lead-logs-tab.tsx` currently 534 lines; adding 2 more inline edits + updatedAt column u2192 may exceed 550 lines u2014 acceptable or extract `inline-edit-cell.tsx` helper
- Audit log `changes` Json field: date fields need normalized format (ISO string) for readable diff
