# React Dashboard Components - Best Practices Research

## 1. SummaryCards/MetricCards Patterns

### Component Structure
- **Tremor** hoặc **shadcn/ui** - copy-paste model, own source code
- Design philosophy: "show the data, hide the chrome" - no decorative gradients
- TypeScript + dark mode là table stakes 2026

### Loading States Best Practices
- **React Suspense** cho progressive loading - skeleton screens, shimmer placeholders
- Suspense boundary per card section - không freeze toàn bộ UI
- Target metrics: FCP <1.8s, LCP <2.5s, CLS <0.1, FID <100ms

### Trend Indicators
- Sử dụng icons (ArrowUp/ArrowDown) + color coding (green/red)
- Percentage change so với period trước
- Conditional styling based on positive/negative trend

## 2. Data Tables cho KPI Metrics

### TanStack Table (React Table v8+)
- **Headless UI** - full control over markup/styling
- Bundle size: 5-14KB - lightweight
- React 16.8+ support, including React 19

### Sorting Implementation
```tsx
// Core sorting setup
import { getSortedRowModel } from '@tanstack/react-table'

const table = useReactTable({
  data,
  columns,
  getSortedRowModel: getSortedRowModel(),
  // 6 built-in sorting functions: alphanumeric, datetime, etc.
})
```

### Responsive Patterns
- Column visibility toggle cho mobile
- Horizontal scroll với sticky first column
- react-window virtualization cho >1000 rows

### shadcn/ui + TanStack Integration
- [openstatus/data-table](https://data-table.openstatus.dev/) - open source reference
- Faceted filters, infinite scroll, SSR ready
- nuqs hoặc zustand cho state management

## 3. Date Range Picker Integration

### Recommended Libraries
| Library | Pros | Use Case |
|---------|------|----------|
| **MUI X DateRangePicker** | Responsive (Desktop/Mobile auto) | MUI ecosystem |
| **react-date-range** | Lightweight, flexible | Custom styling |
| **React Suite** | Full component suite | Enterprise apps |

### Integration Pattern
```tsx
// Date range with query params sync
const [dateRange, setDateRange] = useQueryState('range', {
  defaultValue: 'last_7_days',
  parse: (v) => v as DateRangePreset,
})
```

## 4. SWR vs React Query cho Express.js Backend

### Quick Comparison (2025)
| Aspect | SWR | TanStack Query |
|--------|-----|----------------|
| Bundle | **5.3KB** | 16.2KB |
| DevTools | Basic | Excellent |
| Community | Smaller | **Larger** |
| Best for | Vercel/Next.js | Complex apps |

### Express.js Integration Pattern
```tsx
// TanStack Query setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      gcTime: 10 * 60 * 1000,   // 10 min
    }
  }
})

// Custom hook
function useKPIMetrics(dateRange: DateRange) {
  return useQuery({
    queryKey: ['kpi-metrics', dateRange],
    queryFn: () => fetch(`/api/metrics?start=${dateRange.start}&end=${dateRange.end}`)
      .then(r => r.json()),
  })
}
```

### Cache Invalidation
- `queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] })`
- Optimistic updates cho real-time feel
- Background refetch với `refetchInterval`

## 5. Recommended Stack

| Component | Recommendation |
|-----------|----------------|
| UI Library | shadcn/ui + Tremor components |
| Data Table | TanStack Table v8 |
| Date Picker | MUI X hoặc react-date-range |
| Data Fetching | **TanStack Query** (better DevTools, larger community) |
| State | Zustand cho client state |

## Sources
- [TanStack Table Guide](https://www.contentful.com/blog/tanstack-table-react-table/)
- [React Query vs SWR 2025](https://dev.to/rigalpatel001/react-query-or-swr-which-is-best-in-2025-2oa3)
- [State of React 2025 Data Loading](https://2025.stateofreact.com/en-US/libraries/data-loading/)
- [TanStack Table Sorting](https://tanstack.com/table/latest/docs/guide/sorting)
- [OpenStatus Data Table](https://data-table.openstatus.dev/)
- [MUI X DateRangePicker](https://mui.com/x/react-date-pickers/date-range-picker/)

---
**Status:** DONE
**Summary:** Research completed on React dashboard patterns covering metric cards, TanStack Table, date pickers, and SWR/React Query comparison.
