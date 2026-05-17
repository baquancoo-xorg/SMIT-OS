# Phase 01 — Quarter config + Dashboard API foundation

**Priority:** Blocker (others depend on resolver + endpoint)
**Status:** pending

## Why

- Hiện `currentQuarter()` trong `personnel-flag-calculator.ts` hard-code calendar (Jan = Q1)
- User yêu cầu quarter cutoff "tuỳ chỉnh" → cần resolver layer
- 3 phase sau cần aggregate endpoint, không gọi 7 lần `/personnel/:id/flags`

## Requirements

### Functional
- F1. `quarter-config.ts` exports `resolveQuarter(date, config)`, `previousQuarter(label, config)`, `quartersBack(label, n, config)` (last 3 quarters cho radar overlay)
- F2. Setting model `AppSetting` (singleton) chứa `fiscalYearStartMonth: 1-12`, `fiscalYearStartDay: 1-31` — default `{1, 1}` (calendar)
- F3. Endpoint `GET /api/personnel/dashboard?quarter=YYYY-Qn` trả về:
  ```ts
  {
    quarter: string,
    pulse: { avgJob, avgPersonal, avgGeneral, evaluatedCount, totalCount, attentionCount, atRiskCount, prevAvg: {...}, deltaJob, deltaPersonal, deltaGeneral },
    skillMovement: { quarters: [Q-2, Q-1, current], skillRadar: [{skillKey, label, group, scores: [s1,s2,s3]}], topMovers: [{skillKey, label, delta, direction}] },
    attentionItems: [{personnelId, fullName, avatar, position, reason: 'flag' | 'low_score' | 'missing_eval' | 'check_in_red', detail, score?, flagCount?}]
  }
  ```
- F4. Cache 5min per quarter param (re-use `cached(cacheKey, TTL, fn)` pattern)

### Non-functional
- Một query trip < 500ms với 50 personnel (current 7)
- Re-use Prisma `SkillAssessment` includes thay vì N+1

## Architecture

```
server/
├─ lib/
│  ├─ quarter-config.ts                    NEW — resolver + helpers
│  └─ personnel-dashboard-aggregator.ts    NEW — pulse + movement + attention compose
└─ routes/personnel/
   └─ dashboard.routes.ts                  NEW
prisma/schema.prisma                        MODIFIED — add AppSetting model
```

## Files to create / modify

| Action | Path | LOC |
|---|---|---|
| CREATE | `server/lib/quarter-config.ts` | ~80 |
| CREATE | `server/lib/personnel-dashboard-aggregator.ts` | ~180 |
| CREATE | `server/routes/personnel/dashboard.routes.ts` | ~40 |
| MODIFY | `server/routes/personnel/index.ts` | +2 |
| MODIFY | `server/lib/personnel-flag-calculator.ts` | swap to resolver, +threshold guards (move to P5) |
| MODIFY | `prisma/schema.prisma` | +AppSetting model |

## Implementation steps

1. Add Prisma model:
   ```prisma
   model AppSetting {
     id                   String   @id @default("singleton")
     fiscalYearStartMonth Int      @default(1)
     fiscalYearStartDay   Int      @default(1)
     updatedAt            DateTime @updatedAt
   }
   ```
   Run `npm run db:push`.

2. `quarter-config.ts`:
   - `getQuarterConfig(prisma)` — fetch or upsert singleton, return `{ startMonth, startDay }`
   - `resolveQuarter(date, config)` — return `"YYYY-Qn"` label based on shifted fiscal year
   - `quarterBounds(label, config)` — `{ start: Date, end: Date }`
   - `previousQuarter(label, config)`, `quartersBack(label, n, config)` (returns `string[]`, length n)
   - `weeksLeftInQuarter(label, config)`, `weeksIntoQuarter(label, config)`

3. `personnel-dashboard-aggregator.ts` — single function `buildDashboard(prisma, quarter)`:
   - Load all personnel with user + latest 3 quarters of `SkillAssessment` (`assessorType: 'SELF'`)
   - Compute pulse averages (Job/Personal/General group avg across team)
   - Compute skillMovement (per-skill avg score across 3 quarters)
   - Compute attentionItems by joining personnel + flag calculator results (call existing `calculateFlags` in parallel)

4. `dashboard.routes.ts`:
   - `router.get('/dashboard', adminOnly, handleAsync(...))`
   - Cache 5min via `cached(cacheKey('personnel-dashboard', quarter), TTL_MS, ...)`

5. Wire into `server/routes/personnel/index.ts`:
   ```ts
   router.use('/dashboard', createDashboardRoutes(prisma));
   ```
   (Mount BEFORE `:id` param routes to avoid collision.)

6. Run compile: `npx tsc --noEmit` + dev server hot-reload, hit endpoint `curl localhost:3000/api/personnel/dashboard`

## Todo
- [ ] Add `AppSetting` model + push schema
- [ ] Implement `quarter-config.ts` with 5 helpers
- [ ] Implement `personnel-dashboard-aggregator.ts`
- [ ] Create `dashboard.routes.ts` + mount
- [ ] Smoke test endpoint returns shape matching F3
- [ ] Verify cache hit on 2nd call (log inspection)

## Success criteria
- `GET /api/personnel/dashboard` returns 200 with full shape
- Default config = calendar Q1 (no behavior change)
- Setting `fiscalYearStartMonth = 7` → "2026-Q1" maps to Jul-Sep 2026

## Risks
- **R1:** Adding `AppSetting` collides with existing settings — verify schema first. Mitigation: grep `AppSetting` to confirm absent.
- **R2:** Quarter resolver edge case (fiscal start on day 31, month with 30 days). Mitigation: clamp to last day of start month.

## Next phase
Phase 2 — Team Pulse strip consumes `pulse` from this endpoint.
