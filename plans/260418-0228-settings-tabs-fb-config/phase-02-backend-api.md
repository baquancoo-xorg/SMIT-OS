# Phase 2 — Backend API Routes (FB Config)

**Priority:** P1  •  **Status:** pending  •  **Effort:** 2h

## Context

- Plan: [../plan.md](./plan.md)
- Depends on: Phase 1 (Settings wrapper ready)
- Existing services: `server/lib/crypto.ts`, `server/services/facebook/fb-sync.service.ts`

## Overview

Tạo admin API routes cho FB Account CRUD và Exchange Rate management. Reuse existing encryption và sync services.

## Requirements

**Functional**
- `GET /api/admin/fb-accounts` — list all accounts
- `POST /api/admin/fb-accounts` — create account (encrypt token)
- `PUT /api/admin/fb-accounts/:id` — update account
- `DELETE /api/admin/fb-accounts/:id` — delete account
- `POST /api/admin/fb-accounts/:id/sync` — trigger manual sync
- `GET /api/admin/exchange-rates` — get default rate
- `PUT /api/admin/exchange-rates` — update rate

**Non-functional**
- Admin-only middleware
- Token never returned in GET responses
- Zod validation

## Architecture

```
server/
├── routes/
│   └── admin-fb-config.routes.ts    # NEW
├── schemas/
│   └── admin-fb-config.schema.ts    # NEW
└── middleware/
    └── admin-auth.middleware.ts     # Existing (verify)
```

## Files

**Create**
- `server/routes/admin-fb-config.routes.ts`
- `server/schemas/admin-fb-config.schema.ts`

**Modify**
- `server.ts` — mount new routes

## Implementation Steps

### 1. Create Zod schemas

`server/schemas/admin-fb-config.schema.ts`:

```typescript
import { z } from 'zod';

export const createFbAccountSchema = z.object({
  accountId: z.string().regex(/^act_\d+$/, 'Must be format act_XXXXX'),
  accountName: z.string().min(1).max(100).optional(),
  accessToken: z.string().min(10, 'Token required'),
  currency: z.enum(['USD', 'VND']).default('USD'),
});

export const updateFbAccountSchema = z.object({
  accountName: z.string().min(1).max(100).optional(),
  accessToken: z.string().min(10).optional(),
  currency: z.enum(['USD', 'VND']).optional(),
  isActive: z.boolean().optional(),
});

export const syncFbAccountSchema = z.object({
  dateStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const updateExchangeRateSchema = z.object({
  exchangeRate: z.number().min(1).max(100000),
});

export type CreateFbAccountInput = z.infer<typeof createFbAccountSchema>;
export type UpdateFbAccountInput = z.infer<typeof updateFbAccountSchema>;
```

### 2. Create routes file

`server/routes/admin-fb-config.routes.ts`:

```typescript
import { Router } from 'express';
import { prisma } from '../lib/db';
import { encrypt } from '../lib/crypto';
import { syncFbAdAccount } from '../services/facebook/fb-sync.service';
import { 
  createFbAccountSchema, 
  updateFbAccountSchema,
  syncFbAccountSchema,
  updateExchangeRateSchema 
} from '../schemas/admin-fb-config.schema';

const router = Router();

// GET /api/admin/fb-accounts
router.get('/fb-accounts', async (req, res) => {
  const accounts = await prisma.fbAdAccountConfig.findMany({
    select: {
      id: true,
      accountId: true,
      accountName: true,
      currency: true,
      isActive: true,
      lastSyncAt: true,
      lastSyncStatus: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: accounts });
});

// POST /api/admin/fb-accounts
router.post('/fb-accounts', async (req, res) => {
  const parsed = createFbAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.message });
  }
  
  const { accountId, accountName, accessToken, currency } = parsed.data;
  const encryptedToken = encrypt(accessToken);
  
  const account = await prisma.fbAdAccountConfig.create({
    data: {
      accountId,
      accountName,
      accessTokenEncrypted: encryptedToken,
      currency,
      isActive: true,
    },
    select: { id: true, accountId: true, accountName: true, currency: true },
  });
  
  res.status(201).json({ success: true, data: account });
});

// PUT /api/admin/fb-accounts/:id
router.put('/fb-accounts/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = updateFbAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.message });
  }
  
  const data: any = { ...parsed.data };
  if (data.accessToken) {
    data.accessTokenEncrypted = encrypt(data.accessToken);
    delete data.accessToken;
  }
  
  const account = await prisma.fbAdAccountConfig.update({
    where: { id },
    data,
    select: { id: true, accountId: true, accountName: true, currency: true, isActive: true },
  });
  
  res.json({ success: true, data: account });
});

// DELETE /api/admin/fb-accounts/:id
router.delete('/fb-accounts/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.fbAdAccountConfig.delete({ where: { id } });
  res.json({ success: true });
});

// POST /api/admin/fb-accounts/:id/sync
router.post('/fb-accounts/:id/sync', async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = syncFbAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.message });
  }
  
  const account = await prisma.fbAdAccountConfig.findUnique({ where: { id } });
  if (!account) {
    return res.status(404).json({ success: false, error: 'Account not found' });
  }
  
  // Fire and forget - respond immediately
  res.status(202).json({ success: true, message: 'Sync started' });
  
  // Run sync in background
  syncFbAdAccount(account.accountId, parsed.data.dateStart, parsed.data.dateEnd)
    .then(result => console.log(`[fb-sync] ${account.accountId}:`, result))
    .catch(err => console.error(`[fb-sync] ${account.accountId} error:`, err));
});

// GET /api/admin/exchange-rates
router.get('/exchange-rates', async (req, res) => {
  const rate = await prisma.exchangeRateSetting.findFirst({
    where: { isDefault: true, accountId: null },
  });
  res.json({ success: true, data: rate ?? { exchangeRate: 27000 } });
});

// PUT /api/admin/exchange-rates
router.put('/exchange-rates', async (req, res) => {
  const parsed = updateExchangeRateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error.message });
  }
  
  const rate = await prisma.exchangeRateSetting.upsert({
    where: { id: 1 },
    update: { exchangeRate: parsed.data.exchangeRate },
    create: {
      currencyFrom: 'USD',
      currencyTo: 'VND',
      exchangeRate: parsed.data.exchangeRate,
      isDefault: true,
    },
  });
  
  res.json({ success: true, data: rate });
});

export default router;
```

### 3. Mount routes in server.ts

```typescript
import adminFbConfigRoutes from './routes/admin-fb-config.routes';

// After other routes, before catch-all
app.use('/api/admin', adminAuthMiddleware, adminFbConfigRoutes);
```

### 4. Verify admin middleware exists

Check `server/middleware/admin-auth.middleware.ts` exists and works.

## Todo

- [ ] Create `server/schemas/admin-fb-config.schema.ts`
- [ ] Create `server/routes/admin-fb-config.routes.ts`
- [ ] Mount routes in `server.ts`
- [ ] Test all endpoints with curl/Postman
- [ ] Verify token encryption works

## Success Criteria

- All 7 endpoints return correct responses
- Token never exposed in GET responses
- Sync triggers background job
- Exchange rate updates persist
- Admin middleware blocks non-admin

## Security

- Token encrypted before storage
- Admin-only middleware on all routes
- Input validation via Zod
- No raw SQL (Prisma ORM)
