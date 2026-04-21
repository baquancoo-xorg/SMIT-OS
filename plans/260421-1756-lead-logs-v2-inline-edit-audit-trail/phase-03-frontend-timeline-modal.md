# Phase 03 u2014 Frontend Timeline Modal

## Context Links
- Brainstorm: `plans/reports/brainstorm-260421-1756-lead-logs-v2-inline-edit-audit-trail.md`
- Depends on: `phase-01-backend-audit-trail.md` (endpoint phu1ea3i cu00f3 tru01b0u1edbc)
- Modal: `src/components/lead-tracker/lead-detail-modal.tsx` (73 lines hiu1ec7n tu1ea1i)
- API: `src/lib/api.ts`
- Types: `src/types/index.ts`

## Overview
- **Priority:** High
- **Status:** Pending (blocked by Phase 01)
- Thu00eam `LeadAuditLog` interface, `api.getLeadAuditLogs()`, vu00e0 Timeline section vu00e0o `LeadDetailModal`.

## Requirements
- Modal fetch audit logs khi `lead` thay u0111u1ed5i (khu00f4ng null)
- Hiu1ec3n thu1ecb timeline: mu1ed7i entry = 1 timestamp + list fields thay u0111u1ed5i
- Field label human-readable (khu00f4ng hiu1ec3n raw key)
- Date values format `DD/MM/YYYY` trong diff
- Empty state: "Chu01b0a cu00f3 lu1ecbch su1eed thay u0111u1ed5i"
- Loading state khi u0111ang fetch
- Timeline nu1eb1m bu00ean du01b0u1edbi phu1ea7n Notes, cu00f3 divider

## Architecture

### Type mu1edbi trong `src/types/index.ts`

```typescript
export interface LeadAuditLog {
  id: string;
  leadId: string;
  changes: Record<string, { from: string | null; to: string | null }>;
  createdAt: string;
}
```

### API method trong `src/lib/api.ts`

```typescript
getLeadAuditLogs(id: string) {
  return this.get<import('../types').LeadAuditLog[]>(`/leads/${id}/audit`);
}
```

### Modal state + fetch

```tsx
const [auditLogs, setAuditLogs] = useState<LeadAuditLog[]>([]);
const [auditLoading, setAuditLoading] = useState(false);

useEffect(() => {
  if (!lead) return;
  setAuditLoading(true);
  api.getLeadAuditLogs(lead.id)
    .then(setAuditLogs)
    .catch(() => setAuditLogs([]))
    .finally(() => setAuditLoading(false));
}, [lead?.id]);
```

### Field labels map

```typescript
const FIELD_LABEL: Record<string, string> = {
  status: 'Tru1ea1ng thu00e1i',
  ae: 'AE',
  leadType: 'Lou1ea1i Lead',
  unqualifiedType: 'Lu00fd do UQ',
  notes: 'Ghi chu00fa',
  resolvedDate: 'Ngu00e0y xu1eed lu00fd',
  receivedDate: 'Ngu00e0y nhu1eadn',
};
```

### Format date value trong diff

```typescript
// Nu1ebfu value giu1ed1ng u0111u1ecbnh du1ea1ng YYYY-MM-DD u2192 format sang DD/MM/YYYY
function fmtDiffVal(val: string | null): string {
  if (!val) return 'u2014';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-');
    return `${d}/${m}/${y}`;
  }
  return val;
}
```

### Timeline entry UI

```tsx
// Mu1ed7i LeadAuditLog entry:
<div key={log.id} className="relative pl-4 border-l-2 border-slate-100">
  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
    {format(new Date(log.createdAt), 'dd/MM/yyyy - HH:mm')}
  </p>
  {Object.entries(log.changes).map(([field, { from, to }]) => (
    <p key={field} className="text-xs text-slate-600 mb-0.5">
      <span className="font-bold">{FIELD_LABEL[field] ?? field}:</span>{' '}
      <span className="text-slate-400">{fmtDiffVal(from)}</span>
      {' u2192 '}
      <span className="font-semibold">{fmtDiffVal(to)}</span>
    </p>
  ))}
</div>
```

### Modal card size

Modal hiu1ec7n tu1ea1i `max-w-lg`. Khi cu00f3 timeline du00e0i u2192 u0111u1ed5i card thu00e0nh `flex flex-col max-h-[80vh]` vu00e0 timeline section cu00f3 `overflow-y-auto`.

## Related Code Files

- **Modify:** `src/types/index.ts` u2014 +`LeadAuditLog` interface
- **Modify:** `src/lib/api.ts` u2014 +`getLeadAuditLogs(id)`
- **Modify:** `src/components/lead-tracker/lead-detail-modal.tsx` u2014 +state, +fetch, +Timeline section

## Implementation Steps

1. **`src/types/index.ts`**: Thu00eam `LeadAuditLog` interface sau `Lead` interface.
2. **`src/lib/api.ts`**: Thu00eam `getLeadAuditLogs(id: string)` method sau `getLeadAeList`.
3. **`lead-detail-modal.tsx`**:
   a. Thu00eam imports: `useState`, `useEffect` tu1eeb react; `api` tu1eeb `../../lib/api`; `LeadAuditLog` tu1eeb types; `format` tu1eeb `date-fns`.
   b. u0110u1ecbnh nghu0129a `FIELD_LABEL` vu00e0 `fmtDiffVal` nu1eb1m ngou00e0i component.
   c. Thu00eam `auditLogs` + `auditLoading` state.
   d. Thu00eam `useEffect` fetch khi `lead?.id` thay u0111u1ed5i.
   e. u0110u1ed5i card `div` thu00e0nh `flex flex-col max-h-[80vh]` u0111u1ec3 hu1ed7 tru1ee3 scroll.
   f. Thu00eam Timeline section bu00ean du01b0u1edbi Notes block (cu00f3 `overflow-y-auto` riu00eang).
4. Verify `tsc --noEmit` khu00f4ng lu1ed7i.

## Todo

- [ ] `src/types/index.ts`: +`LeadAuditLog` interface
- [ ] `src/lib/api.ts`: +`getLeadAuditLogs(id)`
- [ ] `lead-detail-modal.tsx`: thu00eam imports + helpers
- [ ] `lead-detail-modal.tsx`: thu00eam state + useEffect fetch
- [ ] `lead-detail-modal.tsx`: thu00eam Timeline section UI
- [ ] `lead-detail-modal.tsx`: u0111u1ed5i card sang flex + max-h scroll
- [ ] TypeScript check pass

## Success Criteria

- Click customer name u2192 modal mu1edf + fetch audit logs
- Nu1ebfu cu00f3 changes: hiu1ec3n thu1ecb timeline entries u0111u00fang format
- Nu1ebfu chu01b0a cu00f3 changes: hiu1ec3n "Chu01b0a cu00f3 lu1ecbch su1eed thay u0111u1ed5i"
- Date values trong diff hiu1ec3n `DD/MM/YYYY` (khu00f4ng ISO)
- Modal scroll u0111u01b0u1ee3c khi timeline du00e0i
- Khu00f4ng cu00f3 TypeScript error

## Risk

- `lead-detail-modal.tsx` su1ebd tu0103ng tu1eeb 73 u2192 ~140 lines u2014 vu1eabn acceptable
- Nu1ebfu Phase 01 chu01b0a deploy u2192 endpoint `/leads/:id/audit` su1ebd 404 u2014 `catch(() => setAuditLogs([]))` xu1eed lu00fd gracefully
