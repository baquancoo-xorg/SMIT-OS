# Phase 01 - Prisma Schema & Migration

## Overview
- **Priority:** Critical (blocks all phases)
- **Status:** pending
- **File:** `prisma/schema.prisma`

## Key Insights
- Department value in DB is `Sale` (not `Sales`) per `src/types/index.ts`
- AE name stored as `User.fullName` where `User.departments` contains `Sale`
- Status values from Excel: "Dang lien he", "Dang nuoi duong", "Qualified", "Unqualified"
- Lead types from Excel: "Viet Nam", "Quoc Te"
- Daily carry-forward: remaining(d) = remaining(d-1) + added(d) - processed(d)

## Related Files
- Modify: `prisma/schema.prisma`

## Implementation Steps

### 1. Add `Lead` model to `prisma/schema.prisma` (after `DailyReport` model)

```prisma
model Lead {
  id              String    @id @default(uuid())
  customerName    String
  ae              String    // User.fullName where department=Sale
  receivedDate    DateTime
  resolvedDate    DateTime?
  status          String    // "Dang lien he" | "Dang nuoi duong" | "Qualified" | "Unqualified"
  leadType        String?   // "Viet Nam" | "Quoc Te"
  unqualifiedType String?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([ae, receivedDate])
  @@index([ae, resolvedDate])
  @@index([status])
  @@index([receivedDate])
}
```

### 2. Run migration

```bash
npm run db:push
```

## Todo

- [ ] Add `Lead` model to `prisma/schema.prisma`
- [ ] Run `npm run db:push`
- [ ] Verify `Lead` table created in DB

## Success Criteria

- `Lead` table exists in PostgreSQL with all columns
- Prisma client regenerated successfully
- 4 indexes created on `ae+receivedDate`, `ae+resolvedDate`, `status`, `receivedDate`
