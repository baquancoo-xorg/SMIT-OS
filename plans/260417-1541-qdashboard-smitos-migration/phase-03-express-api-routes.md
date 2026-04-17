# Phase 3 — Express API Routes + Zod Validation

**Priority:** P1  •  **Status:** pending  •  **Effort:** 2 days  •  **Days:** 8–9

## Context

- Plan: [../plan.md](./plan.md)
- Depends on: Phase 2 (services exported)
- Research: [research/researcher-01-express-prisma.md](./research/researcher-01-express-prisma.md) — Direct rewrite recommended over adapter pattern.

## Overview

Expose 4 endpoints qua Express. Mỗi endpoint validate query params bằng Zod, gọi service, trả `ApiResponse<T>`. Tách routes vào file riêng, mount tại `/api`.

## Key insights

- KHÔNG dùng adapter pattern (Next handler → Express). Rewrite trực tiếp — cleaner và less overhead.
- Zod validate query string trả error 400 với message rõ ràng → frontend handle dễ.
- `Date` query param: parse `YYYY-MM-DD` → set time 00:00:00 (from) và 23:59:59 (to) để inclusive cả ngày.
- FB sync route trả 202 Accepted ngay, sync chạy fire-and-forget background — tránh timeout HTTP.

## Requirements

**Functional**
- `GET /api/dashboard/overview/summary?from=YYYY-MM-DD&to=YYYY-MM-DD&previousFrom=...&previousTo=...` → SummaryMetrics
- `GET /api/dashboard/overview/kpi-metrics?from=YYYY-MM-DD&to=YYYY-MM-DD` → KpiMetricsResponse
- `GET /api/dashboard/overview?from=...&to=...&previousFrom=...&previousTo=...` → `{ summary, kpiMetrics }` combined
- `POST /api/sync/facebook-ads` body `{ accountId, dateStart, dateEnd }` → 202 Accepted, sync async

**Non-functional**
- Response wrap `{ success, data, error?, timestamp }`.
- CORS allow domain `qdashboard.smitbox.com`.
- Logging: morgan combined.
- Errors → JSON 4xx/5xx, never crash process.

## Architecture

```
src/
├── server.ts                            # Express app entry
├── middlewares/
│   ├── error-handler.ts
│   └── async-handler.ts                 # Wrap async route catch errors
├── routes/
│   ├── index.ts                         # Mount /api
│   └── api/
│       ├── dashboard/
│       │   └── overview.routes.ts
│       └── sync/
│           └── facebook-ads.routes.ts
├── controllers/
│   ├── dashboard/
│   │   └── overview.controller.ts
│   └── sync/
│       └── facebook-ads.controller.ts
└── lib/
    └── validators/
        └── overview.schema.ts           # Zod schemas
```

## Files

**Create**
- `src/server.ts`
- `src/middlewares/error-handler.ts`
- `src/middlewares/async-handler.ts`
- `src/lib/validators/overview.schema.ts`
- `src/controllers/dashboard/overview.controller.ts`
- `src/controllers/sync/facebook-ads.controller.ts`
- `src/routes/index.ts`
- `src/routes/api/dashboard/overview.routes.ts`
- `src/routes/api/sync/facebook-ads.routes.ts`

## Implementation steps

### 1. Install deps

```bash
pnpm add express cors morgan zod helmet compression
pnpm add -D @types/express @types/cors @types/morgan @types/compression tsx
```

### 2. `src/server.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { router } from './routes';
import { errorHandler } from './middlewares/error-handler';

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') ?? ['https://qdashboard.smitbox.com', 'http://localhost:3000'],
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

app.use('/api', router);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[smit-os] listening on :${PORT}`);
});
```

### 3. `src/middlewares/async-handler.ts`

```typescript
import type { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
```

### 4. `src/middlewares/error-handler.ts`

```typescript
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown, _req: Request, res: Response, _next: NextFunction,
) {
  const ts = new Date().toISOString();
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      data: null,
      error: err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
      timestamp: ts,
    });
  }
  console.error('[error-handler]', err);
  const msg = err instanceof Error ? err.message : 'Internal error';
  res.status(500).json({ success: false, data: null, error: msg, timestamp: ts });
}
```

### 5. `src/lib/validators/overview.schema.ts`

```typescript
import { z } from 'zod';

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

export const overviewQuerySchema = z.object({
  from: isoDate,
  to: isoDate,
  previousFrom: isoDate.optional(),
  previousTo: isoDate.optional(),
});

export const kpiQuerySchema = z.object({
  from: isoDate,
  to: isoDate,
});

export const fbSyncBodySchema = z.object({
  accountId: z.string().min(1),
  dateStart: isoDate,
  dateEnd: isoDate,
});

export type OverviewQuery = z.infer<typeof overviewQuerySchema>;
export type KpiQuery = z.infer<typeof kpiQuerySchema>;
export type FbSyncBody = z.infer<typeof fbSyncBodySchema>;
```

### 6. `src/controllers/dashboard/overview.controller.ts`

```typescript
import type { Request, Response } from 'express';
import { overviewQuerySchema, kpiQuerySchema } from '@/lib/validators/overview.schema';
import { getSummaryMetrics } from '@/services/dashboard/overview-summary.service';
import { getKpiMetrics } from '@/services/dashboard/overview-kpi.service';
import { previousPeriod } from '@/lib/date-utils';

function parseFromTo(fromStr: string, toStr: string) {
  const from = new Date(`${fromStr}T00:00:00`);
  const to = new Date(`${toStr}T23:59:59.999`);
  return { from, to };
}

function resolvePrev(q: { from: string; to: string; previousFrom?: string; previousTo?: string }) {
  const { from, to } = parseFromTo(q.from, q.to);
  if (q.previousFrom && q.previousTo) {
    const { from: pf, to: pt } = parseFromTo(q.previousFrom, q.previousTo);
    return { from, to, previousFrom: pf, previousTo: pt };
  }
  const { previousFrom, previousTo } = previousPeriod(from, to);
  return { from, to, previousFrom, previousTo };
}

export async function getSummary(req: Request, res: Response) {
  const q = overviewQuerySchema.parse(req.query);
  const { from, to, previousFrom, previousTo } = resolvePrev(q);
  const data = await getSummaryMetrics(from, to, previousFrom, previousTo);
  res.json({ success: true, data, timestamp: new Date().toISOString() });
}

export async function getKpi(req: Request, res: Response) {
  const q = kpiQuerySchema.parse(req.query);
  const { from, to } = parseFromTo(q.from, q.to);
  const data = await getKpiMetrics(from, to);
  res.json({ success: true, data, timestamp: new Date().toISOString() });
}

export async function getOverviewAll(req: Request, res: Response) {
  const q = overviewQuerySchema.parse(req.query);
  const { from, to, previousFrom, previousTo } = resolvePrev(q);
  const [summary, kpiMetrics] = await Promise.all([
    getSummaryMetrics(from, to, previousFrom, previousTo),
    getKpiMetrics(from, to),
  ]);
  res.json({ success: true, data: { summary, kpiMetrics }, timestamp: new Date().toISOString() });
}
```

### 7. `src/controllers/sync/facebook-ads.controller.ts`

```typescript
import type { Request, Response } from 'express';
import { fbSyncBodySchema } from '@/lib/validators/overview.schema';
import { syncFbAdAccount } from '@/services/facebook/fb-sync.service';

export async function triggerFbSync(req: Request, res: Response) {
  const body = fbSyncBodySchema.parse(req.body);
  // Fire-and-forget
  syncFbAdAccount(body.accountId, body.dateStart, body.dateEnd)
    .then((r) => console.log('[fb-sync] result:', r))
    .catch((e) => console.error('[fb-sync] failed:', e));

  res.status(202).json({
    success: true,
    data: { accepted: true, accountId: body.accountId },
    timestamp: new Date().toISOString(),
  });
}
```

### 8. Routes

`src/routes/api/dashboard/overview.routes.ts`:

```typescript
import { Router } from 'express';
import { asyncHandler } from '@/middlewares/async-handler';
import { getOverviewAll, getSummary, getKpi } from '@/controllers/dashboard/overview.controller';

export const overviewRouter = Router();
overviewRouter.get('/', asyncHandler(getOverviewAll));
overviewRouter.get('/summary', asyncHandler(getSummary));
overviewRouter.get('/kpi-metrics', asyncHandler(getKpi));
```

`src/routes/api/sync/facebook-ads.routes.ts`:

```typescript
import { Router } from 'express';
import { asyncHandler } from '@/middlewares/async-handler';
import { triggerFbSync } from '@/controllers/sync/facebook-ads.controller';

export const facebookSyncRouter = Router();
facebookSyncRouter.post('/', asyncHandler(triggerFbSync));
```

`src/routes/index.ts`:

```typescript
import { Router } from 'express';
import { overviewRouter } from './api/dashboard/overview.routes';
import { facebookSyncRouter } from './api/sync/facebook-ads.routes';

export const router = Router();
router.use('/dashboard/overview', overviewRouter);
router.use('/sync/facebook-ads', facebookSyncRouter);
```

### 9. `package.json` scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js"
  }
}
```

### 10. `tsconfig.json` (path alias)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "prisma/seed.ts"]
}
```

> Note: TypeScript path alias không tự rewrite ở runtime với `tsx`/`node`. Dùng `tsconfig-paths` runtime hoặc đổi sang relative paths cho production. Đơn giản nhất:
> ```bash
> pnpm add -D tsconfig-paths
> ```
> Run với: `tsx --tsconfig tsconfig.json -r tsconfig-paths/register src/server.ts`

### 11. Admin Auth Middleware (Validated)

`src/middlewares/admin-auth.ts`:

```typescript
import type { Request, Response, NextFunction } from 'express';

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  // TODO: Implement actual auth check với SMIT OS auth system
  // Tạm thời check API key từ env
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey || token !== adminKey) {
    return res.status(401).json({
      success: false,
      data: null,
      error: 'Unauthorized: admin access required',
      timestamp: new Date().toISOString(),
    });
  }
  next();
}
```

Cập nhật `facebook-ads.routes.ts`:

```typescript
import { Router } from 'express';
import { asyncHandler } from '@/middlewares/async-handler';
import { adminAuth } from '@/middlewares/admin-auth';
import { triggerFbSync } from '@/controllers/sync/facebook-ads.controller';

export const facebookSyncRouter = Router();
facebookSyncRouter.post('/', adminAuth, asyncHandler(triggerFbSync));
```

## Todo

- [ ] Install Express + Zod deps
- [ ] Implement server.ts với CORS + helmet
- [ ] Implement middlewares (async-handler, error-handler, admin-auth)
- [ ] Implement Zod schemas
- [ ] Implement controllers (overview + fb-sync)
- [ ] Wire routers, mount /api + apply adminAuth to sync route
- [ ] Smoke: `curl http://localhost:3000/health`
- [ ] Smoke: `curl 'http://localhost:3000/api/dashboard/overview/summary?from=2026-04-01&to=2026-04-17'`
- [ ] Smoke: `curl -X POST http://localhost:3000/api/sync/facebook-ads -H 'content-type: application/json' -d '{"accountId":"act_xxx","dateStart":"2026-04-15","dateEnd":"2026-04-16"}'`

## Success criteria

- 4 endpoints respond 200/202 với valid params, 400 với invalid (ZodError → message).
- Lỗi service không crash process — error-handler return 500 JSON.
- Response time `/summary` < 2s (CRM bottleneck), `/kpi-metrics` < 5s.
- POST `/sync/facebook-ads` trả 202 trong < 100ms (background sync).

## Risks

| Risk | Mitigation |
|---|---|
| Long FB sync request timeout | Fire-and-forget, status check via separate endpoint sau (out of scope phase này) |
| CORS misconfig → frontend blocked | `CORS_ORIGIN` env, log + test pre-deploy |
| BigInt serialization fail (`raw_ads_facebook` impressions) | Service layer convert BigInt → Number trước khi return JSON |
| Date string TZ shift | Always parse `YYYY-MM-DD` + explicit time, never `new Date(str)` mặc định |

## Security

- Helmet headers default.
- CORS strict whitelist, no `*`.
- Body limit 1mb (FB sync body nhỏ).
- **POST `/api/sync/facebook-ads` cần admin auth middleware (Validated).** Thêm middleware check admin session/token trước khi cho phép trigger sync.

## Next steps

- → Phase 4: React UI consume các endpoints này.
