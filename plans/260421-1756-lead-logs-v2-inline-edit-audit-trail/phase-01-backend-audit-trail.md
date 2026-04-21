# Phase 01 u2014 Backend Audit Trail

## Context Links
- Brainstorm: `plans/reports/brainstorm-260421-1756-lead-logs-v2-inline-edit-audit-trail.md`
- Schema: `prisma/schema.prisma`
- Route: `server/routes/lead.routes.ts`

## Overview
- **Priority:** High
- **Status:** Pending
- Tu1ea1o `LeadAuditLog` Prisma model, chu1ea1y migration, cu1eadp nhu1eadt PUT endpoint u0111u1ec3 diff + ghi log, thu00eam GET `/leads/:id/audit` endpoint.

## Requirements
- Mu1ecdi lu1ea7n PUT `/leads/:id` cu00f3 changes u2192 ghi 1 bu1ea3n ghi `LeadAuditLog`
- Track 7 fields: `status`, `ae`, `leadType`, `unqualifiedType`, `notes`, `resolvedDate`, `receivedDate`
- Khu00f4ng track `changedBy` (quyu1ebft u0111u1ecbnh tu1eeb brainstorm)
- `changes` lu01b0u JSON: `{ fieldName: { from: oldVal, to: newVal } }`
- Date fields cu1ea7n normalize sang ISO string u0111u1ec3 readable diff
- `onDelete: Cascade` u2014 xu00f3a lead thu00ec xu00f3a audit logs theo

## Architecture

### Prisma Schema Changes

```prisma
// Thu00eam vu00e0o model Lead:
auditLogs LeadAuditLog[]

// Model mu1edbi:
model LeadAuditLog {
  id        String   @id @default(uuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  changes   Json     // { field: { from: any, to: any } }
  createdAt DateTime @default(now())

  @@index([leadId, createdAt])
}
```

### PUT /leads/:id u2014 Diff Logic

```typescript
const TRACKED_FIELDS = ['status', 'ae', 'leadType', 'unqualifiedType', 'notes', 'resolvedDate', 'receivedDate'] as const;

// Normalize dates to ISO date string for comparison
function normalizeVal(field: string, val: any): string | null {
  if (val === null || val === undefined) return null;
  if (field === 'resolvedDate' || field === 'receivedDate') {
    return val instanceof Date ? val.toISOString().slice(0, 10) : String(val).slice(0, 10);
  }
  return String(val);
}

// Fetch existing before update
const existing = await prisma.lead.findUnique({ where: { id } });
// ... perform update ...
const updated = await prisma.lead.update(...);

// Diff
const changes: Record<string, { from: string | null; to: string | null }> = {};
for (const field of TRACKED_FIELDS) {
  const from = normalizeVal(field, (existing as any)[field]);
  const to = normalizeVal(field, (updated as any)[field]);
  if (from !== to) changes[field] = { from, to };
}

if (Object.keys(changes).length > 0) {
  await prisma.leadAuditLog.create({ data: { leadId: id, changes } });
}
```

### GET /leads/:id/audit

```typescript
router.get('/:id/audit', handleAsync(async (req, res) => {
  const logs = await prisma.leadAuditLog.findMany({
    where: { leadId: req.params.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(logs);
}));
```

**Vu1ecb tru00ed:** Thu00eam tru01b0u1edbc `router.put('/:id', ...)` u2014 static routes tru01b0u1edbc dynamic.

## Related Code Files

- **Modify:** `prisma/schema.prisma` u2014 thu00eam model + relation
- **Modify:** `server/routes/lead.routes.ts` u2014 PUT diff logic + GET audit endpoint

## Implementation Steps

1. **`prisma/schema.prisma`**: Thu00eam `auditLogs LeadAuditLog[]` vu00e0o `Lead` model. Thu00eam `LeadAuditLog` model.
2. **Chu1ea1y migration**: `npm run db:push` (dev) hou1eb7c `npm run db:migrate` nu1ebfu cu1ea7n migration file.
3. **`lead.routes.ts`**: 
   - Thu00eam `normalizeVal` helper function u1edf u0111u1ea7u file.
   - Cu1eadp nhu1eadt PUT `/:id`: giu1eef `existing` fetch u0111u00e3 cu00f3, sau update thu00eam diff + `leadAuditLog.create`.
   - Thu00eam `GET /:id/audit` route (tru01b0u1edbc PUT).
4. **Kiu1ec3m tra**: Test PUT update cu00f3 log `LeadAuditLog`, test khu00f4ng cu00f3 changes thu00ec khu00f4ng tu1ea1o log.

## Todo

- [ ] Thu00eam `LeadAuditLog` model vu00e0 relation vu00e0o `prisma/schema.prisma`
- [ ] Chu1ea1y `npm run db:push`
- [ ] Thu00eam `normalizeVal` vu00e0 diff logic vu00e0o PUT `/:id`
- [ ] Thu00eam `GET /:id/audit` endpoint
- [ ] Vu1edrify server start khu00f4ng cu00f3 lu1ed7i

## Success Criteria

- `LeadAuditLog` table tu1ed3n tu1ea1i trong DB
- PUT `/leads/:id` vu1edbi changed fields u2192 tu1ea1o 1 `LeadAuditLog` row
- PUT khu00f4ng cu00f3 changes (same values) u2192 khu00f4ng tu1ea1o log
- GET `/leads/:id/audit` tru1ea3 vu1ec1 array sorted `createdAt desc`
- Xu00f3a lead u2192 audit logs tu1ef1 cascade delete

## Risk

- `db:push` cu00f3 thu1ec3 reset data trong dev u2014 du00f9ng `--accept-data-loss` cu1ea9n thu1eadn nu1ebfu cu1ea7n, hou1eb7c du00f9ng `db:migrate` thay thu1ebf
- Date comparison: `existing.receivedDate` lu00e0 `Date` object, body request lu00e0 string u2014 normalize tru01b0u1edbc khi compare

## Next Steps

- Phase 03 phu1ee5 thuu1ed9c Phase 01 hou00e0n thu00e0nh
- Phase 02 cu00f3 thu1ec3 chu1ea1y song song
