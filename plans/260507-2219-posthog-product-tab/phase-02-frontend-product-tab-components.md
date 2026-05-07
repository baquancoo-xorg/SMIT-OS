# Phase 2 — Frontend (5 components + hook + types + DateRangePicker)

## Context Links
- Parent plan: [plan.md](./plan.md)
- Brainstorm: [../reports/brainstorm-260507-1609-posthog-product-tab-integration.md](../reports/brainstorm-260507-1609-posthog-product-tab-integration.md) §5.1, §5.3
- Phase 1: [phase-01-backend-posthog-services.md](./phase-01-backend-posthog-services.md) (depends on backend endpoints + types)
- Existing pattern: `src/components/dashboard/lead-distribution/`

## Overview
- **Date:** 2026-05-07
- **Priority:** P1
- **Effort:** 3-4 days
- **Status:** ⬜ Not started · blocked by Phase 1
- **Description:** Build 5 row layout cho tab Product. Tái dùng `dashboard/ui/*` primitives. React Query staleTime 5min + manual refresh button. Date picker preset 7/30/90/custom.

## Key Insights
- Tái dùng pattern `LeadDistributionSection` đã ship — entry component owns dateRange state, children nhận props
- Recharts `BarChart` với `LabelList` đủ thể hiện funnel; không cần custom SVG
- Iframe sandbox: `allow-scripts allow-same-origin` — đủ cho PostHog embed, chặn form submission
- DateRangePicker — codebase chưa có component này, cần build mới (component reusable cho các tab khác)

## Requirements
- **Functional:** 5 row render đúng, date picker đổi range refetch 3 query, refresh button invalidate cache, table sortable, click row mở PostHog tab mới
- **Non-functional:** First render < 2s với cache · Lighthouse perf ≥ 80 · responsive ≥ md breakpoint · empty/loading/error states

## Architecture
```
ProductSection (state: dateRange)
├── header: <DateRangePicker> + button "↻ Refresh"
├── ProductKpiCards          (Row 1, useProductSummary)
├── ProductFunnelChart       (Row 2, useProductFunnel)
├── ProductTopFeaturesTable  (Row 3, useProductTopFeatures)
├── ProductRetentionEmbed    (Row 4, iframe, no API call)
└── ProductReplayLink        (Row 5, link button)
```

## Related Code Files
**New:**
- `src/types/dashboard-product.ts` — types khớp Zod backend
- `src/hooks/use-product-dashboard.ts` — 3 React Query hooks + `invalidateAll` helper
- `src/components/dashboard/product/product-section.tsx` — entry, layout
- `src/components/dashboard/product/product-kpi-cards.tsx` — 4 cards
- `src/components/dashboard/product/product-funnel-chart.tsx` — Recharts BarChart
- `src/components/dashboard/product/product-top-features-table.tsx` — sortable table
- `src/components/dashboard/product/product-retention-embed.tsx` — iframe wrapper
- `src/components/dashboard/product/product-replay-link.tsx` — link button
- `src/components/dashboard/product/index.ts` — barrel export
- `src/components/dashboard/ui/date-range-picker.tsx` — reusable picker
- `src/lib/date-range-presets.ts` — 7d/30d/90d preset helpers

## Implementation Steps

### Step 1 — `dashboard-product.ts` types (~50 lines)
Mirror Zod inferred types từ backend (manual sync hoặc generate từ `server/schemas`):
```ts
export type ProductSummary = { totalSignups, activationPct, dau, mau, timeToValueMinutes };
export type FunnelStep = { name, count, dropOffPct };
export type ProductFunnel = { steps: FunnelStep[] };
export type TopFeature = { feature, users, totalUses, avgSessionMinutes, lastUsed };
export type TopFeatures = { items: TopFeature[] };
export type DateRange = { from: string; to: string };
```

### Step 2 — `date-range-presets.ts` (~40 lines)
```ts
export const presets = [
  { key: '7d',  label: '7 ngày',  days: 7 },
  { key: '30d', label: '30 ngày', days: 30 },
  { key: '90d', label: '90 ngày', days: 90 },
];
export function getPresetRange(key: '7d'|'30d'|'90d'): DateRange { ... }
export function defaultRange(): DateRange { return getPresetRange('30d'); }
```

### Step 3 — `date-range-picker.tsx` (~150 lines)
- Props: `value: DateRange`, `onChange: (r) => void`, `presets?: boolean`
- 4 button preset (7d/30d/90d/custom) + 2 input date khi chọn custom
- Tái dùng button styles từ `dashboard/ui`

### Step 4 — `use-product-dashboard.ts` (~120 lines)
```ts
export function useProductSummary(range: DateRange) {
  return useQuery({
    queryKey: ['product-summary', range],
    queryFn: () => fetch(`/api/dashboard/product/summary?from=${range.from}&to=${range.to}`).then(r => r.json()),
    staleTime: 5 * 60_000,
  });
}
export function useProductFunnel(range: DateRange) { ... }
export function useProductTopFeatures(range: DateRange) { ... }
export function useInvalidateProductDashboard() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['product-summary'] }) // và các query còn lại
}
```

### Step 5 — `product-section.tsx` (~150 lines)
```tsx
const [range, setRange] = useState<DateRange>(defaultRange());
const refresh = useInvalidateProductDashboard();
return (
  <section className="space-y-3">
    <header className="flex items-center justify-between">
      <DashboardSectionTitle>Product Analytics</DashboardSectionTitle>
      <div className="flex gap-2">
        <DateRangePicker value={range} onChange={setRange} />
        <button onClick={refresh}>↻ Refresh</button>
      </div>
    </header>
    <ProductKpiCards range={range} />
    <ProductFunnelChart range={range} />
    <ProductTopFeaturesTable range={range} />
    <ProductRetentionEmbed />
    <ProductReplayLink />
  </section>
);
```

### Step 6 — `product-kpi-cards.tsx` (~120 lines)
4 cards trong DashboardPanel grid: Signups, Activation %, DAU/MAU ratio, TTV (minutes). Loading skeleton + error state (`DashboardEmptyState`).

### Step 7 — `product-funnel-chart.tsx` (~180 lines)
Recharts `BarChart` horizontal:
- X = step count
- Y = step name
- Tooltip show drop-off %
- Color gradient (decreasing intensity)
- Empty state nếu `steps.length === 0`

Nếu > 200 lines → split helper `funnel-chart-tooltip.tsx`.

### Step 8 — `product-top-features-table.tsx` (~180 lines)
- Cột: Feature, Users, Uses, Avg session, Last used
- Sort by click header (default: Uses DESC)
- Row click → `window.open('https://app.posthog.com/events?event=feature_used&filters[feature_name]=' + ...)`
- Pagination simple (top 20 đã limit ở backend)

### Step 9 — `product-retention-embed.tsx` (~60 lines)
```tsx
const url = import.meta.env.VITE_POSTHOG_RETENTION_INSIGHT_URL;
return (
  <DashboardPanel>
    <DashboardSectionTitle>Retention Cohort</DashboardSectionTitle>
    {url ? (
      <iframe src={url} sandbox="allow-scripts allow-same-origin"
              className="w-full h-[480px] rounded border" loading="lazy" />
    ) : <DashboardEmptyState description="Retention insight chưa cấu hình." />}
  </DashboardPanel>
);
```
⚠️ **Lưu ý:** `VITE_POSTHOG_RETENTION_INSIGHT_URL` là **share URL công khai** (không phải API key). An toàn để expose ra FE. Nếu dùng signed URL → đẩy qua backend endpoint `/api/dashboard/product/retention-url`.

### Step 10 — `product-replay-link.tsx` (~50 lines)
Button "Xem session replay mới nhất" → mở `https://app.posthog.com/replay/recent` tab mới với `target="_blank" rel="noopener"`.

### Step 11 — `index.ts` barrel
```ts
export { ProductSection } from './product-section';
```

## Todo List
- [ ] `dashboard-product.ts` types
- [ ] `date-range-presets.ts`
- [ ] `date-range-picker.tsx` (reusable)
- [ ] `use-product-dashboard.ts` 3 hooks + invalidate
- [ ] `product-section.tsx` entry
- [ ] `product-kpi-cards.tsx`
- [ ] `product-funnel-chart.tsx`
- [ ] `product-top-features-table.tsx`
- [ ] `product-retention-embed.tsx`
- [ ] `product-replay-link.tsx`
- [ ] `index.ts` barrel
- [ ] `.env.example` thêm `VITE_POSTHOG_RETENTION_INSIGHT_URL`

## Success Criteria
- [ ] Tab Product hiển thị đủ 5 row với data thật từ Phase 1 endpoints
- [ ] Date picker đổi preset → 3 query refetch ngay
- [ ] Refresh button → cache invalidate, query refetch
- [ ] Table click row → mở PostHog tab mới đúng filter
- [ ] Retention iframe load < 3s, không CORS error
- [ ] Replay link mở đúng project PostHog
- [ ] Mỗi component < 200 lines
- [ ] Loading skeletons + error states + empty states đủ
- [ ] Lighthouse perf score ≥ 80 trên tab Product

## Risk Assessment
| Risk | Severity | Mitigation |
|---|---|---|
| Iframe X-Frame-Options block | Med | PostHog cho phép embed nếu domain whitelisted; verify Phase 0 Step 6 |
| Recharts bundle size | Low | Đã có trong codebase (lead-distribution dùng) |
| DateRangePicker UX phức tạp | Med | Phase 1 ship preset only, custom range Phase 2 nếu cần |
| Type drift FE/BE | Med | Sync manual; Phase 3 thêm script `tsx scripts/gen-types.ts` |

## Security Considerations
- Iframe `sandbox` attr bắt buộc
- `rel="noopener"` cho mọi external link
- Không expose `POSTHOG_PERSONAL_API_KEY` ra FE (chỉ retention share URL công khai)
- React Query không cache nhạy cảm (chỉ aggregate count)

## Next Steps
→ [Phase 3 — Wire-up + Test + Docs](./phase-03-wireup-test-docs.md)
