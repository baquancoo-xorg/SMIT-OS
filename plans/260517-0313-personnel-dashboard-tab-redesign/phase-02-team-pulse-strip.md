# Phase 02 — Team Pulse Strip

**Priority:** High — first visible value in tab
**Status:** pending
**Depends on:** Phase 01 (dashboard endpoint)

## Why
Đầu tab cần trả lời ngay 1 câu: "team đang khoẻ hay yếu, có chuyển động không". KPI strip + QoQ delta.

## Requirements

### Functional
- F1. 4 KPI cards: **Job avg**, **Personal avg**, **General avg**, **Attention**
- F2. Mỗi KPI hiển thị: nhãn, value (1 decimal), delta vs Q-1 (↑/↓/—), evaluated/total count phụ
- F3. Attention card: count needs_attention + count at_risk separated, click navigate Attention Inbox section (anchor scroll)
- F4. Loading skeleton (Suspense fallback)
- F5. Empty state: "Chưa có dữ liệu quý này" khi không personnel nào có assessment

### v4 UI contract (docs/ui-design-contract.md §3, §5, §7)
- Dark card: `rounded-3xl` border `white/10` gradient `from-neutral-900 to-neutral-950`
- Light: `rounded-xl bg-surface-1`
- Accent text color `var(--brand-500)` (KHÔNG hex)
- Delta arrow: ↑ emerald-500 / ↓ rose-500 / — text-muted (NO solid orange)
- KPI value `font-headline text-3xl font-black`
- Section bọc `<Suspense fallback={Skeleton} />`

## Files

| Action | Path | LOC |
|---|---|---|
| CREATE | `src/components/features/dashboard/personnel/team-pulse-strip.tsx` | ~120 |
| CREATE | `src/hooks/use-personnel-dashboard.ts` | ~25 |

## Implementation
1. `use-personnel-dashboard.ts`:
   ```ts
   export function usePersonnelDashboardQuery(quarter?: string) {
     return useQuery({
       queryKey: ['personnel-dashboard', quarter ?? 'current'],
       queryFn: () => api.get<PersonnelDashboard>(`/personnel/dashboard${quarter ? `?quarter=${quarter}` : ''}`),
       staleTime: 60_000,
     });
   }
   ```
2. `team-pulse-strip.tsx`:
   - Props: `data: PulseData | undefined`, `loading: boolean`
   - Grid `grid-cols-2 lg:grid-cols-4 gap-3`
   - 4 `<KpiCard>` sub-components in same file (DRY ok with composition)
   - Delta computation: `data.deltaJob` already from server, just render
3. Compile check `npx tsc --noEmit`

## Todo
- [ ] Hook `use-personnel-dashboard.ts`
- [ ] `team-pulse-strip.tsx` with 4 KPI sub-cards
- [ ] Skeleton fallback matches layout
- [ ] Verify Suspense wrap

## Success criteria
- Render 4 KPI cards với data thực
- Delta sign correct (↑ when current > previous)
- Empty state hiển thị khi không assessment

## Risks
- **R1:** Delta sign confusion (lower attention = good). Mitigation: invert color for attention KPI (↓ emerald, ↑ rose).
