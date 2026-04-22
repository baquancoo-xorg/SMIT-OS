# Phase 03 u2014 Frontend Types & API Client

## Overview
- Priority: High
- Status: pending
- Depends on: phase-02

## Changes

### 1. `src/types/index.ts` u2014 cu1eadp nhu1eadt `Lead` interface

Thu00eam 2 field mu1edbi:

```typescript
export interface Lead {
  id: string;
  customerName: string;
  ae: string;
  receivedDate: string;
  resolvedDate?: string | null;
  status: string;
  leadType?: string | null;
  unqualifiedType?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  // Delete request fields
  deleteRequestedBy?: string | null;  // User.id
  deleteRequestedAt?: string | null;  // ISO datetime
}
```

### 2. `src/lib/api.ts` u2014 thu00eam 4 method mu1edbi

Thu00eam sau `deleteLead`:

```typescript
requestLeadDelete(id: string) {
  return this.post<Lead>(`/leads/${id}/delete-request`, {});
}

cancelLeadDeleteRequest(id: string) {
  return this.delete(`/leads/${id}/delete-request`);
}

approveLeadDeleteRequest(id: string) {
  return this.post<void>(`/leads/${id}/delete-request/approve`, {});
}

rejectLeadDeleteRequest(id: string) {
  return this.post<Lead>(`/leads/${id}/delete-request/reject`, {});
}
```

> Lu01b0u u00fd: kiu1ec3m tra `this.post`/`this.delete` trong api.ts hiu1ec7n tu1ea1i cu00f3 nhu1eadn empty body khu00f4ng. Nu1ebfu `post` require body, truyu1ec1n `{}`.

## Todo

- [ ] Cu1eadp nhu1eadt `Lead` interface trong `src/types/index.ts`
- [ ] Thu00eam 4 method vu00e0o `src/lib/api.ts`
- [ ] Compile check: `npx tsc --noEmit`

## Success Criteria

- TypeScript khu00f4ng cu00f3 lu1ed7i sau khi cu1eadp nhu1eadt
- `lead.deleteRequestedBy` u0111u01b0u1ee3c type-safe trong tou00e0n bu1ed9 frontend
