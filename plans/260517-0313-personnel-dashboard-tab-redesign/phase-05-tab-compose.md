# Phase 05 — Tab composition + threshold recalibration

**Priority:** Critical — integration + UX fix
**Status:** pending
**Depends on:** Phase 02, 03, 04

## Why
- Rewrite `personnel-dashboard-tab.tsx` từ grid duplicate sang 3-section pulse view
- Fix bug 7/7 needs_attention false positive — onboarding personnel trigger `assessment_overdue` + `low_attendance` even khi mới gia nhập
- Add "Onboarding" status mới (gray) cho personnel < 4 tuần

## Requirements

### Functional
- F1. Tab render `<TeamPulseStrip />` → `<SkillMovement />` → `<AttentionInbox />` in order
- F2. Header với quarter selector dropdown (current Q + 4 quý lùi)
- F3. Loading: single hook gọi 1 endpoint, propagate `isLoading` xuống 3 sections
- F4. **Threshold recalibration trong `personnel-flag-calculator.ts`:**
   - Skip `assessment_overdue` nếu `tenureWeeks < 4`
   - Skip `low_attendance` nếu `businessDays < 5` trong window
   - Add status `onboarding` cho `tenureWeeks < 4`
- F5. Update `PersonnelStatus` type + `STATUS_STYLE` map trong `status-badge.tsx`

### v4 contract
- Tab container: `space-y-6` (more breathing room than current `space-y-4`)
- Quarter selector: existing `Select` component (do not invent)
- Onboarding badge: `bg-neutral-500/15 text-neutral-400 ring-neutral-500/30`

## Files

| Action | Path | LOC |
|---|---|---|
| REWRITE | `src/components/features/dashboard/personnel/personnel-dashboard-tab.tsx` | ~80 (down from 83) |
| MODIFY | `server/lib/personnel-flag-calculator.ts` | +30 |
| MODIFY | `src/lib/personnel/personnel-types.ts` | +1 status |
| MODIFY | `src/components/features/personnel/status-badge.tsx` | +1 entry STATUS_STYLE |
| MODIFY | `src/hooks/use-personnel-flags.ts` | +1 status union |

## Implementation
1. Tenure calc trong flag calculator:
   ```ts
   const tenureWeeks = Math.floor((Date.now() - personnel.startDate.getTime()) / (7 * 86400_000));
   if (tenureWeeks < 4) {
     // Skip overdue + attendance rules
     // Return early with status 'onboarding' if 0 flags
   }
   ```
2. Status priority: `at_risk > needs_attention > onboarding > on_track`
3. Update `PersonnelStatus` type union — make sure no consumer breaks (grep usages first)
4. Tab rewrite:
   ```tsx
   const [quarter, setQuarter] = useState<string | undefined>();
   const { data, isLoading, error } = usePersonnelDashboardQuery(quarter);
   return (
     <div className="space-y-6">
       <DashboardHeader quarter={quarter} onChange={setQuarter} />
       <Suspense fallback={<PulseSkeleton />}>
         <TeamPulseStrip data={data?.pulse} loading={isLoading} />
       </Suspense>
       <Suspense fallback={<SectionSkeleton />}>
         <SkillMovement data={data?.skillMovement} />
       </Suspense>
       <Suspense fallback={<SectionSkeleton />}>
         <AttentionInbox items={data?.attentionItems ?? []} />
       </Suspense>
     </div>
   );
   ```
5. Remove unused imports (`PersonnelCard`, `usePersonnelListQuery`, `useQueries`, `Users` icon if not in header)

## Todo
- [ ] Recalibrate flag calculator (tenure guard)
- [ ] Add `onboarding` to PersonnelStatus union
- [ ] Update STATUS_STYLE map
- [ ] Rewrite tab composition
- [ ] DashboardHeader with quarter selector
- [ ] Compile check + visual smoke test in browser
- [ ] Verify Personnel page badges still correct (status-badge shared)

## Success criteria
- Tab no longer duplicates `/personnel` page
- Personnel < 4 tuần → onboarding badge (gray), không needs_attention
- Quarter selector chuyển data load correctly
- 3 sections cùng Suspense bound
- Build pass: `npx tsc --noEmit` + `npm run build`

## Risks
- **R1:** Status union expansion breaks consumers. Mitigation: grep `PersonnelStatus` usages, exhaustive check trong switch nếu có.
- **R2:** Personnel page badge regression. Mitigation: visual check `/personnel` sau khi modify status-badge.
- **R3:** Quarter selector data race khi switch nhanh. Mitigation: react-query `keepPreviousData: true` để smooth transition.

## Compliance report (end-of-task)
- [ ] Cite docs/ui-design-contract.md §§ tuân thủ
- [ ] No solid orange CTA
- [ ] Card radius 1.5rem dark / 0.75rem light
- [ ] Accent canonical var(--brand-500) OKLCH
- [ ] Light + dark parity verified
- [ ] Data sections Suspense wrapped
