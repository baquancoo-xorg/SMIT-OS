# Phase 5 — Testing, Polish, Deploy

**Priority:** P1  •  **Status:** pending  •  **Effort:** 2 days  •  **Days:** 13–14

## Context

- Plan: [../plan.md](./plan.md)
- Depends on: Phase 1–4 complete
- Deploy target: port 3000, domain `qdashboard.smitbox.com`

## Overview

End-to-end validation: unit tests cho pure helpers, integration tests cho 1 endpoint, manual QA với CRM live data, deploy + smoke.

## Key insights

- KHÔNG mock CRM trong integration test — dùng staging CRM hoặc fixture replay.
- FB sync chỉ smoke test bằng 1 account 1 ngày, tránh quota burn.
- Production deploy: pm2 hoặc systemd, không nên dùng `tsx` runtime. Build `tsc` rồi `node dist/server.js`.
- Express serve React static — mount sau khi `/api` để frontend route fallback.

## Requirements

**Functional**
- Unit tests pass cho `calculateTrend`, `safeDivide`, `toNumber`, `extractLandingPageViews`, `splitDateRange`, `previousPeriod`, `sortData`, `calculateRates`.
- Integration test: `GET /api/dashboard/overview/summary` trả 200 + valid schema.
- Manual QA checklist pass.
- Production build < 2 min, image < 500MB.

**Non-functional**
- 0 critical lint errors.
- 0 TypeScript errors.
- Page LCP < 2.5s on 3G throttled.

## Architecture (deploy)

```
Production server (port 3000)
├── Node.js process (pm2)
│   ├── Express app
│   │   ├── /api/* → JSON
│   │   ├── /health → liveness
│   │   └── /* → serve dist/ static (React SPA)
│   └── Background: FB sync workers
└── PostgreSQL (main DB)
    
External
└── CRM PostgreSQL (read-only)
```

## Files

**Create**
- `vitest.config.ts`
- `src/services/dashboard/__tests__/overview-helpers.test.ts`
- `src/services/facebook/__tests__/fb-sync.test.ts` (split-range only)
- `src/components/dashboard/overview/__tests__/kpi-table-utils.test.ts`
- `tests/integration/overview.test.ts`
- `Dockerfile`
- `ecosystem.config.cjs` (pm2)
- `docs/deployment.md`

**Modify**
- `src/server.ts` (add static serving)
- `package.json` (add test/lint scripts)

## Implementation steps

### 1. Install test deps

```bash
pnpm add -D vitest supertest @types/supertest @vitest/ui
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### 2. `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

### 3. Unit tests cho helpers

`src/services/dashboard/__tests__/overview-helpers.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateTrend, safeDivide, toNumber, extractLandingPageViews }
  from '../overview-helpers';

describe('calculateTrend', () => {
  it('positive trend', () => {
    const r = calculateTrend(120, 100);
    expect(r.trend).toBe(20);
    expect(r.trendDirection).toBe('up');
  });
  it('zero previous → 0 trend', () => {
    expect(calculateTrend(50, 0).trend).toBe(0);
  });
  it('negative trend', () => {
    expect(calculateTrend(80, 100).trendDirection).toBe('down');
  });
});

describe('safeDivide', () => {
  it('divide by zero', () => expect(safeDivide(5, 0)).toBe(0));
  it('rounds to 2 dp', () => expect(safeDivide(1, 3)).toBe(0.33));
});

describe('toNumber', () => {
  it('handles null', () => expect(toNumber(null)).toBe(0));
  it('handles bigint', () => expect(toNumber(BigInt(42))).toBe(42));
  it('handles Decimal-like', () => {
    expect(toNumber({ toNumber: () => 3.14 })).toBe(3.14);
  });
});

describe('extractLandingPageViews', () => {
  it('extracts value', () => {
    const v = extractLandingPageViews([{ action_type: 'landing_page_view', value: '7' }]);
    expect(v).toBe(7);
  });
  it('returns 0 if missing', () => {
    expect(extractLandingPageViews([])).toBe(0);
    expect(extractLandingPageViews(null)).toBe(0);
  });
});
```

`src/components/dashboard/overview/__tests__/kpi-table-utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { sortData, calculateRates } from '../kpi-table-utils';

const fixture = [
  { date: '2026-04-01', signups: 10, trials: 5, opportunities: 2, orders: 1, revenue: 100 },
  { date: '2026-04-02', signups: 20, trials: 8, opportunities: 4, orders: 2, revenue: 200 },
] as any;

describe('sortData', () => {
  it('sorts asc', () => {
    const r = sortData(fixture, { field: 'signups', direction: 'asc' });
    expect(r[0].signups).toBe(10);
  });
  it('sorts desc', () => {
    const r = sortData(fixture, { field: 'signups', direction: 'desc' });
    expect(r[0].signups).toBe(20);
  });
});

describe('calculateRates top mode', () => {
  it('trial rate = trials/signups', () => {
    const r = calculateRates('top', { signups: 10, trials: 5, opportunities: 0, orders: 0,
      mql: 0, mqlBronze: 0, mqlSilver: 0, mqlGold: 0, prePql: 0, pql: 0, sql: 0 } as any);
    expect(r.trialRate).toBe(50);
  });
});
```

### 4. FB sync helper test

`src/services/facebook/__tests__/fb-sync.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
// re-export splitDateRange to test
import { splitDateRange } from '../fb-sync.service';

describe('splitDateRange', () => {
  it('single chunk if <30 days', () => {
    const c = splitDateRange('2026-04-01', '2026-04-15');
    expect(c).toHaveLength(1);
    expect(c[0]).toEqual({ start: '2026-04-01', end: '2026-04-15' });
  });
  it('splits into multiple chunks', () => {
    const c = splitDateRange('2026-01-01', '2026-04-01');
    expect(c.length).toBeGreaterThan(1);
    expect(c.at(-1)?.end).toBe('2026-04-01');
  });
});
```

> Note: cần export `splitDateRange` từ `fb-sync.service.ts`.

### 5. Integration test

`tests/integration/overview.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '@/app'; // refactor server.ts to export app

describe('GET /api/dashboard/overview/summary', () => {
  it('200 with valid params', async () => {
    const res = await request(app)
      .get('/api/dashboard/overview/summary')
      .query({ from: '2026-04-01', to: '2026-04-15' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('revenue');
    expect(res.body.data.revenue).toHaveProperty('value');
    expect(res.body.data.revenue).toHaveProperty('trend');
  });

  it('400 with invalid date', async () => {
    const res = await request(app)
      .get('/api/dashboard/overview/summary')
      .query({ from: 'invalid', to: '2026-04-15' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
```

> Refactor `server.ts`: tách `export const app` ra file `app.ts`, `server.ts` chỉ `app.listen`.

### 6. Update `src/server.ts` — serve React static

```typescript
import express from 'express';
import path from 'node:path';
import { app } from './app';

const PORT = Number(process.env.PORT ?? 3000);

const distDir = path.resolve(process.cwd(), 'dist');
app.use(express.static(distDir));
app.get('*', (_, res) => res.sendFile(path.join(distDir, 'index.html')));

app.listen(PORT, () => {
  console.log(`[smit-os] :${PORT}`);
});
```

> Build pipeline: `vite build` → `dist/`, `tsc` → `dist-server/`. Adjust paths.

Better structure:
```
dist/             # Vite output (frontend)
dist-server/      # tsc output (backend)
```

### 7. `package.json` scripts

```json
{
  "scripts": {
    "dev:api": "tsx watch src/server.ts",
    "dev:web": "vite",
    "dev": "concurrently \"pnpm dev:api\" \"pnpm dev:web\"",
    "build:web": "vite build",
    "build:api": "tsc -p tsconfig.server.json",
    "build": "pnpm build:web && pnpm build:api",
    "start": "node dist-server/server.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  }
}
```

### 8. `Dockerfile`

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable
RUN pnpm prisma:gen
RUN pnpm build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
COPY --from=build /app/prisma ./prisma
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist-server/server.js"]
```

### 9. `ecosystem.config.cjs` (pm2 alternative)

```javascript
module.exports = {
  apps: [{
    name: 'smit-os',
    script: 'dist-server/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: { NODE_ENV: 'production', PORT: 3000 },
    max_memory_restart: '500M',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
  }],
};
```

### 10. Manual QA checklist

`docs/qa-checklist.md`:

- [ ] Open `https://qdashboard.smitbox.com/` → page loads, no console errors
- [ ] Default date range = last 7 days, data shows
- [ ] Click Compare → trend % shows on cards
- [ ] Change date range to "Last 30 days" → all data refetches
- [ ] Sort each column ASC/DESC → data reorders
- [ ] Toggle Top/Step → rates change
- [ ] Hover MQL cell → tier breakdown tooltip
- [ ] TOTAL row shows aggregated values
- [ ] Cards show: Revenue (VND), Ad Spend (VND), Signups (count), ROAS (x)
- [ ] FB sync: POST `/api/sync/facebook-ads` with valid account → 202, after ~30s `raw_ads_facebook` has new rows
- [ ] CRM unavailable scenario: page still loads, shows 0/empty (not crash)
- [ ] Mobile: horizontal scroll works, sticky date column works
- [ ] Lighthouse score > 80 (Performance)

### 11. Deploy steps

```bash
# On server
git clone <smit-os-repo>
cd smit-os
cp .env.example .env  # fill DATABASE_URL, CRM_DATABASE_URL, APP_SECRET
pnpm install --frozen-lockfile
pnpm prisma:gen
pnpm prisma migrate deploy
pnpm db:seed
pnpm build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Nginx reverse proxy:

```nginx
server {
  listen 443 ssl;
  server_name qdashboard.smitbox.com;
  # ssl certs
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

### 12. Cleanup qdashboard

After verification (24h soak):

```bash
# Backup repo first
git clone https://github.com/<org>/qdashboard.git qdashboard-archive-2026-04
tar czf qdashboard-archive-2026-04.tar.gz qdashboard-archive-2026-04
# Move to long-term storage

# Then remove old deployment
pm2 stop qdashboard && pm2 delete qdashboard
# Drop old DB if separate
# Archive Github repo
gh repo archive <org>/qdashboard
```

## Todo

- [ ] Install vitest + supertest
- [ ] Write unit tests cho helpers (8+ tests)
- [ ] Write integration test cho summary endpoint
- [ ] Refactor server.ts → split app.ts
- [ ] Add static serve cho React
- [ ] Add npm scripts (test, lint, typecheck, build)
- [ ] Build Dockerfile, test local image
- [ ] Run full QA checklist
- [ ] Deploy to staging port 3000
- [ ] Smoke test live with CRM data
- [ ] Configure pm2 + nginx
- [ ] DNS cutover qdashboard.smitbox.com → SMIT OS
- [ ] 24h soak monitoring
- [ ] Archive qdashboard repo

## Success criteria

- `pnpm test` exit 0, coverage > 60% cho helpers/utils.
- `pnpm typecheck` exit 0.
- `pnpm lint` exit 0 (or only warnings).
- Production build success, image runs locally.
- All QA checklist items pass.
- Lighthouse Performance > 80.
- Memory stable (<400MB RSS) sau 1h chạy.
- 0 unhandled exceptions trong logs.

## Risks

| Risk | Mitigation |
|---|---|
| CRM staging không có data | Seed fixture nếu cần, hoặc test với prod read-only |
| pm2 cluster + Prisma connection bùng → DB pool exhausted | Set `connection_limit=5` per process trong DATABASE_URL |
| Static serve overlap với /api → routing conflict | Mount /api FIRST, then static fallback |
| Memory leak do `getConversionRates` cache không bound | Cache có TTL 60s + bounded keys (~10 accounts) → an toàn |
| FB sync block process | Fire-and-forget pattern (Phase 3) |

## Security

- HTTPS required, redirect 80 → 443.
- pm2 cluster: file permission `chmod 600` cho `.env`.
- Disable Express `x-powered-by`.
- Rate limit `/api/sync/facebook-ads` (admin endpoint) — express-rate-limit, 10 req/min.
- `APP_SECRET` rotate quarterly.
- Audit `etl_error_log` weekly.

## Next steps

- Decommission qdashboard sau 1 tuần soak.
- Document migration learnings cho team.
- Phase tiếp theo (out of scope this plan): port Cohort/Charts nếu cần.
