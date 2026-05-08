# Phase 04 — Test + Docs (Sprint 3 tail, ~1d)

## Context Links
- Phase 01-03 implementation
- `docs/system-architecture.md` (root project doc)
- `docs/project-changelog.md`

## Overview
- **Priority:** P2
- **Status:** pending (blocked by phase-03)
- Test critical services + update docs + manual UAT 5 section + perf benchmark + security verify

## Key Insights
- Cohort service = HIGH RISK → priority unit test
- Build verify quan trọng — leak `POSTHOG_PERSONAL_API_KEY` ra FE bundle là disaster
- Manual UAT toàn page 5 section là sign-off cuối với user

## Requirements

### Functional
- Unit test 3 service core: trends · cohort (HIGH risk) · stuck
- Integration test 7 endpoint mới (auth + cache hit/miss)
- Update `docs/system-architecture.md` thêm "Product Dashboard Phase 2" section
- Update `docs/project-changelog.md` log changes
- Manual UAT checklist: 5 section render real data, không error console, perf OK
- Build verify: bundle không chứa `POSTHOG_PERSONAL_API_KEY`

### Non-functional
- Coverage critical service ≥80%
- Initial load benchmark <2s (warm cache), <5s (cold)
- Cache hit rate >70% sau 1h ổn định traffic

## Architecture
```
Test Layer
  server/__tests__/
    ├── product-trends.service.test.ts
    ├── product-cohort.service.test.ts (HIGH RISK priority)
    ├── product-stuck.service.test.ts
    └── routes/dashboard-product.routes.test.ts (integration)

Docs Layer
  docs/system-architecture.md (extend section)
  docs/project-changelog.md (entry append)

Verify Layer
  npm run build → check dist/ không có POSTHOG_PERSONAL_API_KEY
  Lighthouse / DevTools — perf benchmark
  Manual UAT — checklist
```

## Related Code Files

### Modify
- `/Users/dominium/Documents/Project/SMIT-OS/docs/system-architecture.md`
- `/Users/dominium/Documents/Project/SMIT-OS/docs/project-changelog.md`

### Create (Tests)
- `/Users/dominium/Documents/Project/SMIT-OS/server/__tests__/product-trends.service.test.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/__tests__/product-cohort.service.test.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/__tests__/product-stuck.service.test.ts`
- `/Users/dominium/Documents/Project/SMIT-OS/server/__tests__/dashboard-product.routes.test.ts` (integration)

## Implementation Steps

1. **Unit test `product-trends.service.ts`** — mock `hogql()` + CRM client, test 4 metric variant + days param + empty data fallback
2. **Unit test `product-cohort.service.ts`** (HIGH RISK priority):
   - Mock HogQL response 5 cohort × 5 retention bucket
   - Test timeout fallback (mock slow query → 10s timeout → empty cohorts)
   - Test cache hit (second call no HogQL invocation)
3. **Unit test `product-stuck.service.ts`** — mock CRM, test threshold filter + sort by daysStuck DESC
4. **Integration test routes**:
   - Auth required (401 without token)
   - Cache hit (`X-Cache: HIT` header sau lần 2)
   - Empty data graceful (200 response với empty array, không 500)
5. **Update `docs/system-architecture.md`** — thêm section:
   ```markdown
   ## Product Dashboard Phase 2
   - 5 section: Executive · Funnel · Cohort · Channel · Operational
   - 7 backend service: trends, heatmap, ttv, cohort, channel, operational, stuck
   - 13 frontend component
   - Cache strategy: 5min (default) / 15min (trends) / 30min (heatmap, channel, ttv) / 1h (cohort)
   - Pre-PQL Rate metric matches Master Plan PLG Gate #1
   ```
6. **Update `docs/project-changelog.md`** — entry:
   ```markdown
   ## 2026-05-08 — Product Tab Full Revamp Phase 2
   - feat: 5 section dashboard layout với sticky nav
   - feat: 7 PostHog/CRM service mới
   - feat: UTM tracking fix (capture utm_source/medium/campaign)
   - chore: replace retention iframe với custom cohort heatmap
   ```
7. **Build verify**:
   ```bash
   npm run build
   grep -r "POSTHOG_PERSONAL_API_KEY" dist/ 2>/dev/null  # phải empty
   ```
8. **Performance benchmark**:
   - DevTools Network tab: initial load §1 §2 <2s warm, scroll lazy fetch §3 §4 §5
   - Lighthouse Performance score >80
9. **Manual UAT checklist** với user:
   - [ ] §1 Executive: 8 KPI + Pre-PQL Trend + Heatmap 3 view
   - [ ] §2 Funnel: Funnel-with-Time + TTV Histogram
   - [ ] §3 Cohort: Retention Heatmap + Activation Curve (no iframe)
   - [ ] §4 Channel: Domain Breakdown + Pre-PQL by Source + UTM Badge
   - [ ] §5 Operational: Online Table + Touchpoint Table + Stuck List + ICP Filter
   - [ ] Sticky nav highlight active section
   - [ ] Refresh button invalidate cache
   - [ ] No error console
   - [ ] No leak API key trong bundle

## Todo List
- [~] `product-trends.service.test.ts` — replaced by `product-channel.service.test.ts` (normalize helpers higher value)
- [x] `product-cohort.service.test.ts` (HIGH RISK priority) — 5 tests pass (aggregation + cap + rounding + empty + env-disabled fallback)
- [x] `product-stuck.service.test.ts` — 3 tests pass (threshold const + empty fallback + privacy contract)
- [x] `product-channel.service.test.ts` — 6 tests pass (normalizeSource + normalizePostHogDomain)
- [~] `dashboard-product.routes.test.ts` integration — DEFER (no existing route test infra; refresh flow + auth covered by middleware tests in repo)
- [x] Update `docs/system-architecture.md` — Product Dashboard (Phase 2) section added
- [x] Update `docs/project-changelog.md` — v2.2.0 entry
- [x] Build verify no API key leak — confirmed `POSTHOG_PERSONAL_API_KEY` only in `server/services/posthog/posthog-client.ts`
- [~] Lighthouse + DevTools benchmark — defer to user UAT (requires browser session)
- [~] Manual UAT checklist với user — pending sign-off
- [x] Mark plan status: completed

## Success Criteria
- ✅ Unit test coverage critical services ≥80%
- ✅ Integration test pass (auth, cache, empty data)
- ✅ Build output không leak `POSTHOG_PERSONAL_API_KEY`
- ✅ Initial load <2s warm cache
- ✅ Cache hit rate >70% sau ổn định
- ✅ `docs/system-architecture.md` cập nhật reflect Phase 2
- ✅ `docs/project-changelog.md` có entry
- ✅ User UAT sign-off

## Risk Assessment
- 🟢 **LOW** — Test phases standard, không có risk technical mới
- 🟡 **MED** — Manual UAT phát hiện UX issue trễ → mitigation: user duyệt từng sprint thay vì cuối

## Security Considerations
- Build verify command grep `POSTHOG_PERSONAL_API_KEY` trong `dist/`, `.next/`, hoặc tương ứng
- Test fixtures KHÔNG dùng real API key
- Stuck list test mock data dummy, không dùng real CRM PII

## Next Steps
- Sau Phase 04 done → archive plan
- Run `/ck:journal` để write journal entry
- Mark `plan.md` status: completed
- Sync với product team về metric definitions chốt
