# Phase 02 - Backend API

## Overview
- **Priority:** High
- **Status:** pending
- **Depends on:** Phase 01

## Related Files
- Create: `server/schemas/lead.schema.ts`
- Create: `server/routes/lead.routes.ts`
- Modify: `server.ts`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/leads | List with filters (ae, dateFrom, dateTo, status) |
| POST | /api/leads | Create new lead |
| PUT | /api/leads/:id | Update lead |
| DELETE | /api/leads/:id | Delete lead |
| GET | /api/leads/daily-stats | Aggregated daily stats per AE |
| GET | /api/leads/ae-list | List AEs (User.departments has `Sale`) |

## Key Insights

**Daily Stats logic (replaces Excel COUNTIFS):**
- `added(d)` = COUNT where `receivedDate = d` AND `ae = X`
- `processed(d)` = COUNT where `resolvedDate = d` AND `ae = X` AND status IN ('Qualified','Unqualified')
- `remaining(d)` = remaining(d-1) + added(d) - processed(d)  --> computed in-app by iterating sorted days
- `dailyRate` = processed(d) / added(d)
- `totalRate` = processed(d) / (added(d) + remaining(d-1))

**CRITICAL - Route ordering:** `/ae-list` and `/daily-stats` MUST be registered BEFORE `/:id`

## Implementation Steps

### 1. Create `server/schemas/lead.schema.ts`

Pattern from `server/schemas/work-item.schema.ts` (Zod):

```typescript
import { z } from 'zod';

export const LEAD_STATUSES = [
  '\u0110ang li\u00ean h\u1ec7',
  '\u0110ang nu\u00f4i d\u01b0\u1ee1ng',
  'Qualified',
  'Unqualified'
] as const;

export const LEAD_TYPES = ['Vi\u1ec7t Nam', 'Qu\u1ed1c T\u1ebf'] as const;

export const createLeadSchema = z.object({
  customerName: z.string().min(1),
  ae: z.string().min(1),
  receivedDate: z.string(),
  resolvedDate: z.string().optional().nullable(),
  status: z.enum(LEAD_STATUSES),
  leadType: z.enum(LEAD_TYPES).optional().nullable(),
  unqualifiedType: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateLeadSchema = createLeadSchema.partial();
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
```

### 2. Create `server/routes/lead.routes.ts`

Factory pattern `createLeadRoutes(prisma)`, following `work-item.routes.ts`:

```typescript
export function createLeadRoutes(prisma: PrismaClient) {
  const router = Router();

  // Static routes BEFORE /:id
  router.get('/ae-list', handleAsync(async (_req, res) => {
    const users = await prisma.user.findMany({
      where: { departments: { has: 'Sale' } },
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    });
    res.json(users);
  }));

  router.get('/daily-stats', handleAsync(async (req, res) => {
    // query params: ae?, dateFrom, dateTo
    // 1. Fetch leads in date range
    // 2. Group by ae + date, compute added + processed counts
    // 3. Sort by date, iterate to carry-forward remaining
    // 4. Return rows sorted by date desc
  }));

  router.get('/', handleAsync(async (req, res) => { /* list with filters */ }));
  router.post('/', handleAsync(async (req, res) => { /* create, validate with createLeadSchema */ }));
  router.put('/:id', handleAsync(async (req, res) => { /* update, validate with updateLeadSchema */ }));
  router.delete('/:id', handleAsync(async (req, res) => { /* delete */ }));

  return router;
}
```

### 3. Register route in `server.ts`

Add after `createDailyReportRoutes` line:
```typescript
import { createLeadRoutes } from './server/routes/lead.routes';
// ...
app.use('/api/leads', createLeadRoutes(prisma));
```

## Todo

- [ ] Create `server/schemas/lead.schema.ts`
- [ ] Create `server/routes/lead.routes.ts` with 6 endpoints
- [ ] Register `/api/leads` in `server.ts`
- [ ] Verify hot-reload with no compile errors

## Success Criteria

- `GET /api/leads/ae-list` returns users with department Sale
- `POST /api/leads` creates and persists lead to DB
- `GET /api/leads/daily-stats` returns correct carry-forward data
- No TypeScript compile errors
