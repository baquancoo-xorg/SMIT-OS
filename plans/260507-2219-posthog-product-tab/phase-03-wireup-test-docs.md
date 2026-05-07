# Phase 3 — Wire-up + Test + Docs

## Context Links
- Parent plan: [plan.md](./plan.md)
- Brainstorm: [../reports/brainstorm-260507-1609-posthog-product-tab-integration.md](../reports/brainstorm-260507-1609-posthog-product-tab-integration.md) §9, §10
- Phase 1 (backend) + Phase 2 (frontend) complete

## Overview
- **Date:** 2026-05-07
- **Priority:** P1
- **Effort:** 1-2 days
- **Status:** ⬜ Not started · blocked by Phase 2
- **Description:** Replace empty state Tab Product → `<ProductSection />`. Unit + integration test backend services. Manual e2e checklist. Update docs. Security gate verify.

## Key Insights
- Wire-up đơn giản: thay đổi 1 chỗ trong `DashboardOverview.tsx:122-123`
- E2E manual đủ cho Phase 1 ship — Playwright/Cypress là Phase 2+ effort
- Security gate là điểm chốt: build output tuyệt đối không có `POSTHOG_PERSONAL_API_KEY`
- Docs update: chỉ thêm section "PostHog Integration" vào `system-architecture.md`, không tạo file mới

## Requirements
- **Functional:** Tab Product hoạt động đầy đủ trên dev. Tests pass. Docs synced.
- **Non-functional:** Build production grep test pass · Lighthouse ≥ 80 · không regression các tab khác

## Architecture
Không có architecture mới — chỉ integration + verification.

## Related Code Files
**Modify:**
- `src/pages/DashboardOverview.tsx:122-123` — replace `DashboardEmptyState` bằng `<ProductSection />`
- `docs/system-architecture.md` — add section "Dashboard Product Tab — PostHog Integration"
- `docs/project-changelog.md` — entry mới

**New (tests):**
- `server/services/posthog/__tests__/product-summary.service.test.ts`
- `server/services/posthog/__tests__/product-funnel.service.test.ts`
- `server/services/posthog/__tests__/product-features.service.test.ts`
- `server/services/posthog/__tests__/posthog-cache.test.ts`
- `server/routes/__tests__/dashboard-product.routes.integration.test.ts`
- `plans/260507-2219-posthog-product-tab/reports/03-e2e-manual-checklist.md`

## Implementation Steps

### Step 1 — Wire-up trong `DashboardOverview.tsx`
```tsx
// Before (line 122-123):
{selectedTab === 'product' && (
  <DashboardEmptyState description="Dashboard cho Product đang được chuẩn bị." />
)}

// After:
{selectedTab === 'product' && (
  <ProductSection />
)}
```
Import từ `src/components/dashboard/product`.

### Step 2 — Unit tests cho 3 services (~150 lines / file)
- Mock `posthog-client.ts` axios với `jest.mock` / `vitest.mock`
- Fixture responses thật (capture từ PostHog UI)
- Test cases per service:
  - happy path → schema valid
  - PostHog 500 → throw with code
  - PostHog schema drift → Zod safeParse fail → throw `POSTHOG_SCHEMA_DRIFT`
  - Empty result → return zero/empty array

### Step 3 — Cache test (`posthog-cache.test.ts`)
- Set + get same key → returns value
- TTL expiry (manual time advance) → returns undefined
- LRU eviction → size > 100 evicts oldest
- `invalidateAll` clears

### Step 4 — Integration test routes (~120 lines)
- Spin Express test app với mocked services
- 3 GET endpoints: status 200, schema valid response
- Cache integration: gọi 2 lần cùng range → service mock chỉ called 1 lần
- PostHog down (mock throw) → 503 + `code: POSTHOG_UNAVAILABLE`
- Auth: gọi không có cookie → 401

### Step 5 — Manual E2E checklist
Tạo `reports/03-e2e-manual-checklist.md`:
- [ ] Login SMIT-OS → vào Dashboard → click tab Product
- [ ] 5 row render thấy data (KPI, Funnel, Top features, Retention iframe, Replay button)
- [ ] Date picker click "7 ngày" → 3 query refetch (network tab verify)
- [ ] Date picker custom range → fetch đúng `from`, `to`
- [ ] Refresh button click → 3 query refetch (cache invalidated)
- [ ] Top features table → click header sort
- [ ] Top features row click → mở tab mới với URL PostHog đúng
- [ ] Retention iframe load < 3s, không CORS error
- [ ] Replay button click → mở `app.posthog.com/replay/...` tab mới
- [ ] Refresh trang → React Query restore (no flicker)
- [ ] Empty state khi PostHog down (tắt API key tạm) → render gracefully
- [ ] Test 4 tab khác (overview, sale, marketing, media) — không regression

### Step 6 — Security gate (build check)
```bash
npm run build
grep -r "POSTHOG_PERSONAL_API_KEY" dist/ && echo "❌ LEAK" || echo "✓ OK"
grep -r "POSTHOG_PROJECT_ID" dist/                # OK to leak (numeric ID không nhạy cảm)
```
Add vào `package.json` script `security:check:posthog` để CI run.

### Step 7 — Update `docs/system-architecture.md`
Thêm section sau "Authentication":
```markdown
## Dashboard Product Tab — PostHog Integration

Tab Product trong Dashboard tích hợp PostHog Cloud (US, app.posthog.com) để
hiển thị funnel hành trình + KPI + top features + retention.

**Architecture:** Hybrid
- Backend proxy: HogQL queries cho KPI cards, funnel, top features
- Embed iframe: Retention cohort (saved insight share URL)
- Link-out: Session replay (user click → tab mới)

**Data flow:** React Query (5min staleTime) → Express → LRU cache 5min →
PostHog Query API (Personal API Key, server-only)

**Endpoints:** `GET /api/dashboard/product/{summary,funnel,top-features}`
**Auth:** Mọi user đăng nhập (existing requireAuth middleware)
**Files:** `server/services/posthog/*`, `src/components/dashboard/product/*`
```

### Step 8 — Update `docs/project-changelog.md`
Entry mới (top):
```markdown
## [Unreleased] — 2026-05-XX
### Added
- Dashboard Product tab với PostHog integration (funnel, KPI, top features, retention, replay)
- 3 backend endpoints `/api/dashboard/product/*` với LRU cache 5min
- DateRangePicker component reusable

### Security
- Personal API Key chỉ tồn tại server-side, build output verified clean
```

### Step 9 — Compile + lint check
```bash
npm run dev      # verify dev server start clean
npx tsc --noEmit # type check
npm run lint     # nếu có lint script
```

## Todo List
- [ ] Wire `<ProductSection />` vào `DashboardOverview.tsx`
- [ ] Unit tests 3 services
- [ ] Unit test cache
- [ ] Integration test routes
- [ ] Manual E2E checklist hoàn thành
- [ ] Build security gate (grep POSTHOG_PERSONAL_API_KEY)
- [ ] Update `docs/system-architecture.md`
- [ ] Update `docs/project-changelog.md`
- [ ] `tsc --noEmit` pass
- [ ] Compile clean trên dev server

## Success Criteria
- [ ] All unit + integration tests pass
- [ ] Manual E2E checklist 100% checked
- [ ] Build output không leak Personal API Key (security gate)
- [ ] `npx tsc --noEmit` exit 0
- [ ] `npm run dev` start không error
- [ ] Lighthouse perf ≥ 80 trên tab Product
- [ ] No regression 4 tab khác
- [ ] Docs updated, changelog entry committed

## Risk Assessment
| Risk | Severity | Mitigation |
|---|---|---|
| Test fixtures stale (PostHog API đổi) | Med | Phase 0 capture fresh fixtures; Zod safeParse degrade gracefully |
| Iframe block bởi CSP | Med | Update helmet config trong `server.ts` để allow PostHog frame-src |
| Build leak (Vite include env var lạ) | High | Security gate check; review `.env.example` không VITE_*_KEY |
| Manual E2E miss edge case | Low | Phase 2+ chuyển sang Playwright auto |

## Security Considerations
- **Critical gate:** `grep POSTHOG_PERSONAL_API_KEY dist/` phải KHÔNG match
- CSP `frame-src 'self' https://app.posthog.com` (update helmet config nếu cần)
- Iframe `sandbox` attr enforce
- Logs production không echo PostHog response thô (có thể chứa user identifier)
- Rate limit endpoint `/api/dashboard/product/*` (nếu chưa có global limit)

## Next Steps (post-Phase 3)
- Monitor PostHog API usage 1 tuần đầu (rate limit, cache hit %)
- Phase 2+: Playwright e2e auto, multi-tenant filter, role-based access nếu cần
- Phase 2+: drill-down user replay, alerting Slack khi drop-off > threshold
- Archive plan: `/ck:plan:archive 260507-2219-posthog-product-tab`
