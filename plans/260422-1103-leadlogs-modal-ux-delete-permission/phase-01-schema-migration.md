# Phase 01 u2014 Schema Migration

## Overview
- Priority: Critical (block tu1ea5t cu1ea3 phase sau)
- Status: pending

## Changes

### `prisma/schema.prisma` u2014 thu00eam 2 field vu00e0o `Lead` model

```prisma
model Lead {
  // ... existing fields ...
  deleteRequestedBy   String?   // User.id ngu01b0u1eddi gu1eedi yu00eau cu1ea7u xou00e1
  deleteRequestedAt   DateTime? // thu1eddi u0111iu1ec3m gu1eedi yu00eau cu1ea7u
}
```

## Implementation Steps

1. Mu1edf `prisma/schema.prisma`
2. Trong `model Lead { }`, thu00eam sau field `notes`:
   ```prisma
   deleteRequestedBy   String?   // User.id
   deleteRequestedAt   DateTime?
   ```
3. Chu1ea1y migration:
   ```bash
   npx prisma migrate dev --name add-lead-delete-request
   ```
4. Xu00e1c nhu1eadn Prisma client u0111u01b0u1ee3c generate lu1ea1i:
   ```bash
   npx prisma generate
   ```

## Todo

- [ ] Thu00eam 2 field vu00e0o schema.prisma
- [ ] Chu1ea1y `prisma migrate dev`
- [ ] Xu00e1c nhu1eadn migration thu00e0nh cu00f4ng

## Success Criteria

- Migration chu1ea1y khu00f4ng lu1ed7i
- `prisma studio` hiu1ec3n thu1ecb 2 cu1ed9t mu1edbi tru00ean bu1ea3ng `Lead`
- Data cu0169 khu00f4ng bu1ecb u1ea3nh hu01b0u1edfng (nullable fields)
