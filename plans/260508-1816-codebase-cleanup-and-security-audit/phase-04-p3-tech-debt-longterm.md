# Phase 4 — P3 Long-term Tech Debt

## Context Links

- Parent plan: [`plan.md`](./plan.md)
- Source: brainstorm § P3-3, P3-5 + P2-4, P2-9
- Prerequisite: Phase 3 hoàn thành (codebase đã consistent)

## Overview

- **Date:** 2026-05-08
- **Priority:** 🟢 P3 (ongoing, ~40h spread over weeks)
- **Effort:** ~40h tổng, làm progressive
- **Status:** pending
- **Description:** Maintainability improvements — refactor large pages, structured logger, smoke test auth, reduce `any`.

## Key Insights

- 3 pages > 500 LOC (1544/937/711) vi phạm dev-rule "≤ 200 LOC".
- 85 `console.log` server không có level/timestamp/requestId → khó debug production.
- 4 test files toàn project → security-critical paths (auth/TOTP) không có smoke test.
- 140 `any` usage chủ yếu ở router signatures (`req: any, res: any`) → mất type safety.

## Requirements

### Functional
- Pages > 500 LOC split thành sub-components/hooks.
- Server-side logging structured (JSON prod, pretty dev).
- Auth flow có integration smoke test chạy trong CI.
- `any` usage ≤ 30 (từ 140).

### Non-functional
- Mỗi sub-task incremental, không big-bang.
- Test runtime < 30s.
- Logger overhead < 5% throughput.

## Architecture

```
[before]
src/pages/OKRsManagement.tsx (1544 LOC)
   └── 1 monolith file

server/
   └── 85 console.log/error/warn calls

server/__tests__/
   └── (empty, security paths uncovered)

[after]
src/pages/OKRsManagement.tsx (~250 LOC)
   ├── src/components/okr/ObjectiveList.tsx
   ├── src/components/okr/ObjectiveEditor.tsx
   ├── src/hooks/use-objectives.ts
   └── src/hooks/use-key-results.ts

server/lib/logger.ts (Pino instance)
   └── used by: services + middleware

server/__tests__/auth.test.ts
   └── login + TOTP + sliding session
```

## Related Code Files

**Modify (large pages refactor):**
- `src/pages/OKRsManagement.tsx` (1544 → ~250)
- `src/pages/DailySync.tsx` (937 → ~250)
- `src/pages/ProductBacklog.tsx` (711 → ~250)

**Modify (logger):**
- All `server/**/*.ts` với `console.log/error/warn` (85 occurrences)
- `server.ts` — add request logger middleware

**Modify (any reduction):**
- All `server/routes/*.ts` — remove `req: any, res: any`
- Sample: `server/routes/lead.routes.ts`, `daily-report.routes.ts`

**Create:**
- `src/components/okr/*` (multiple)
- `src/components/daily-sync/*` (multiple)
- `src/components/product-backlog/*` (multiple)
- `src/hooks/use-*.ts` (multiple)
- `server/lib/logger.ts`
- `server/__tests__/auth.test.ts`
- `server/__tests__/helpers/test-db.ts` (test DB setup)

## Implementation Steps

### Sub-phase 4.1: Structured logger (Pino) — 6h

4.1a. **Install:**
```bash
npm install pino
npm install -D pino-pretty
```

4.1b. **Create `server/lib/logger.ts`:**
```ts
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'HH:MM:ss' },
    },
  }),
});

export const childLogger = (module: string) => logger.child({ module });
```

4.1c. **Add request logger middleware ở `server.ts`:**
```ts
import { logger } from './server/lib/logger';
import { randomUUID } from 'crypto';

app.use((req, _res, next) => {
  (req as any).requestId = randomUUID();
  logger.info({ requestId: (req as any).requestId, method: req.method, url: req.url });
  next();
});
```

4.1d. **Replace `console.log` từng module một:**
```ts
// before
console.log('[lead-sync-cron] started');

// after
import { childLogger } from '../lib/logger';
const log = childLogger('lead-sync-cron');
log.info('started');
```

Modules order (đơn giản → phức tạp):
1. `server/cron/lead-sync.cron.ts`
2. `server/jobs/*.ts`
3. `server/services/sheets-export.service.ts`
4. `server/services/facebook/*.ts`
5. `server/services/lead-sync/*.ts`
6. `server/services/google-oauth.service.ts`
7. Routes (smaller scope)

```bash
# Sau mỗi module
npm run typecheck
git commit -am "refactor(logging): migrate <module> to Pino logger"
```

### Sub-phase 4.2: Auth smoke test — 4h

4.2a. **Setup test infra:**
```bash
mkdir -p server/__tests__/helpers
```

`server/__tests__/helpers/test-db.ts`:
```ts
import { PrismaClient } from '@prisma/client';

export const testPrisma = new PrismaClient({ datasourceUrl: process.env.TEST_DATABASE_URL });

export async function cleanupTestUser(username: string) {
  await testPrisma.user.deleteMany({ where: { username } });
}
```

4.2b. **`server/__tests__/auth.test.ts`:**
```ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { authService } from '../services/auth.service';
import { totpService } from '../services/totp.service';

describe('Auth flow', () => {
  it('signs and verifies session token', () => {
    const t = authService.signToken({ userId: 'u1', role: 'Admin', isAdmin: true });
    const p = authService.verifyToken(t);
    assert.strictEqual(p?.userId, 'u1');
  });

  it('temp token only valid for totp-pending', () => {
    const t = authService.signTempToken('u1');
    assert.strictEqual(authService.verifyToken(t)?.purpose, 'totp-pending');
    assert.ok(authService.verifyTempToken(t));
  });

  it('expired token returns null', () => {
    // mock or use jest fake timers
  });

  it('TOTP verify code window ±1', () => {
    const { secret } = totpService.generateSecret('test@example.com');
    // Generate valid code via OTPAuth, verify
  });

  it('backup code consumed atomically', async () => {
    const codes = totpService.generateBackupCodes();
    const hashed = await totpService.hashBackupCodes(codes);
    const r1 = await totpService.verifyAndConsumeBackupCode(codes[0], hashed);
    assert.strictEqual(r1.valid, true);
    assert.strictEqual(r1.remaining.length, 7);
  });
});
```

4.2c. **Run + fix:**
```bash
npm test
```

4.2d. **CI integration:** Project hiện không có CI pipeline (per audit). Skip CI bổ sung, document trong README rằng `npm test` cần chạy trước commit.

### Sub-phase 4.3: Refactor large pages — 18h

Chiến lược: extract custom hooks trước, sau đó split components.

4.3a. **`src/pages/OKRsManagement.tsx` (1544 → ~250) — 8h:**
- Extract `useObjectives()` hook (CRUD + state)
- Extract `useKeyResults()` hook
- Split components:
  - `src/components/okr/ObjectiveList.tsx`
  - `src/components/okr/ObjectiveEditor.tsx`
  - `src/components/okr/KeyResultRow.tsx`
  - `src/components/okr/CycleSelector.tsx`

4.3b. **`src/pages/DailySync.tsx` (937 → ~250) — 5h:**
- Extract `useDailyReports()` hook
- Split: `DailyReportTable`, `DailyReportEditor`, `DailyReportFilters`

4.3c. **`src/pages/ProductBacklog.tsx` (711 → ~250) — 5h:**
- Extract `useProductBacklog()` hook
- Split: `BacklogColumn`, `BacklogItem`, `BacklogFilters`

```bash
# Sau mỗi page refactor
npm run typecheck
npm run dev   # smoke test
git commit -am "refactor(pages): split <page> into hooks + components"
```

### Sub-phase 4.4: Reduce `any` — 12h spread

4.4a. **Survey worst offenders:**
```bash
grep -rEn ": any\b|<any>|as any" server/ src/ --include="*.ts" --include="*.tsx" \
  | sort | uniq -c | sort -rn | head -30
```

4.4b. **Tackle router signatures:**
```ts
// before
router.get('/', handleAsync(async (req: any, res: any) => {

// after
import type { Request, Response } from 'express';
router.get('/', handleAsync(async (req: Request, res: Response) => {
  // req.user typed via server/types/express.d.ts
```

4.4c. **Tackle response handlers:**
- Generic `JSON` types thay vì `any`
- Use `z.infer<typeof schema>` cho parsed body

4.4d. **Track progress:**
```bash
# Run weekly
grep -rE ": any\b|<any>|as any" server/ src/ --include="*.ts" --include="*.tsx" | wc -l
# Goal: 140 → < 30 over 4 weeks
```

```bash
git commit -am "chore(types): reduce any usage in <module>"
```

### Sub-phase 4.5: Final verify (1h)

```bash
npm run typecheck
npm test
npm run build
npm run dev   # full smoke test all pages
```

## Todo List

- [ ] **4.1** Install Pino + pino-pretty
- [ ] **4.1** Create `server/lib/logger.ts`
- [ ] **4.1** Add request logger middleware
- [ ] **4.1** Migrate cron + jobs to Pino
- [ ] **4.1** Migrate services to Pino
- [ ] **4.1** Migrate routes to Pino
- [ ] **4.2** Setup test infra `server/__tests__/helpers/`
- [ ] **4.2** Write `auth.test.ts` (5 test cases)
- [ ] **4.2** Document `npm test` workflow in README
- [ ] **4.3** Refactor `OKRsManagement.tsx`
- [ ] **4.3** Refactor `DailySync.tsx`
- [ ] **4.3** Refactor `ProductBacklog.tsx`
- [ ] **4.4** Survey + reduce `any` in routes
- [ ] **4.4** Survey + reduce `any` in services
- [ ] **4.4** Survey + reduce `any` in components
- [ ] **4.5** Final verify

## Success Criteria

- ✅ Pino logger handles 100% server-side logging (zero `console.log` in `server/**/*.ts`)
- ✅ Production logs JSON format
- ✅ Each request có `requestId` traceable
- ✅ `npm test` passes ≥ 5 auth tests
- ✅ `OKRsManagement.tsx`, `DailySync.tsx`, `ProductBacklog.tsx` all < 300 LOC
- ✅ `any` usage ≤ 30 (từ 140)
- ✅ Build + typecheck pass

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Pino migration đổi log format → ops dashboard break | Low | Medium | Project chưa có log aggregation; safe |
| Page refactor break UI behavior | Medium | High | Smoke test mỗi page sau split + screenshot before/after |
| Auth test cần test DB → setup phức tạp | Medium | Medium | Test pure functions trước (token signing, TOTP), DB-bound test sau |
| `any` reduction cascade type errors | High | Low | Fix incremental, mỗi file 1 commit |

## Security Considerations

- Pino logger có thể log sensitive data nếu không cẩn thận → use redact paths:
  ```ts
  pino({ redact: ['password', '*.password', 'authorization', 'cookie', 'jwt', 'token'] })
  ```
- Auth tests phải dùng test DB riêng, không chạm production.
- `requestId` có thể correlate user activity → đảm bảo không log PII trong message.

## Rollback Strategy

- Logger: revert commit per-module, fallback `console.log` còn lại.
- Test: pure additive, không có rollback impact.
- Page refactor: revert commit per-page.
- `any` reduction: revert per-file.

## Next Steps

→ Plan completion. Tổng kết:
- Run `/ck:journal` để document toàn bộ cleanup
- Update `docs/system-architecture.md` reflect new structure (nếu có thay đổi đáng kể)
- Schedule recurring `npm audit` weekly
