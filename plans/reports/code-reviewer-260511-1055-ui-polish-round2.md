---
title: "Code Review — UI Polish Round 2"
date: 2026-05-11
reviewer: code-reviewer
plan: plans/260511-1018-ui-polish-round2/
status: DONE_WITH_CONCERNS
---

# Code Review — UI Polish Round 2

## Scope
- 16 modified files reviewed (Phase 01/02/03 deliverables only)
- TypeScript: clean (`tsc --noEmit` 0 errors)
- Vite build: clean (2.13s, all chunks generated)
- v1 `dashboard/overview/DateRangePicker.tsx` deletion: no orphan imports

## Overall Assessment
Round 2 goals were largely met. New primitives (`useSortableData`, `SortableTh`) are clean and well-typed. Table migrations preserve sort behavior. Header pattern consistent across 5 pages. URL state sync works on Dashboard + Ads + Lead Logs. KOL/KOC Spend fix correctly applied. One bug fix is incomplete (`marketing-tab` ROAS division), one Tailwind class has invalid syntax, and one anti-pattern (hidden GlassCard to balance imports) needs cleanup.

---

## Critical Issues
None blocking ship. KOL/KOC Spend bug is fixed correctly with `Number(p.cost ?? 0)` in MediaTracker:81 and media-tab:44.

---

## High Priority

### H1. Invalid Tailwind class `hover:bg-surface-variant/30/50` (3 sites)
**File:** `src/components/okr/okr-accordion-cards.tsx:37, 308, 431`

`/30/50` is malformed — Tailwind opacity modifier can only appear once. Class is silently dropped, so the hover effect doesn't render. This came in via copy-paste from a search/replace artifact.

```diff
- className="p-3 md:p-4 cursor-pointer hover:bg-surface-variant/30/50 transition-colors ..."
+ className="p-3 md:p-4 cursor-pointer hover:bg-surface-variant/30 transition-colors ..."
```

Apply to all 3 occurrences.

### H2. Dynamic Tailwind class `hover:${colors.text}` will not work
**File:** `src/components/okr/okr-accordion-cards.tsx:49, 332`

`hover:${colors.text}` builds an arbitrary string at runtime — Tailwind JIT cannot detect it, so the hover color is never generated. Pre-existing issue (not introduced this round) but visible to anyone touching this file.

Fix options: (a) emit pre-known utility classes in `getDeptColor` (e.g. `hover:text-tech`), or (b) inline color CSS variables. Defer if not blocking.

### H3. `marketing-tab.tsx` ROAS sort still mixes Decimal types
**File:** `src/components/dashboard/marketing/marketing-tab.tsx:48-55`

`a.spendTotal` and `a.leadCount` are Prisma Decimal/Int that arrive as string at runtime. JS `>`, `/` coerce strings to numbers, so this works today — but it's inconsistent with the surrounding `Number(...)` casts in the same file and the plan's stated "audit all reduce/division sites" goal. Recommend coalescing on read for consistency and to silence subtle NaN drift:

```diff
- .filter((a) => a.spendTotal > 0)
+ .filter((a) => Number(a.spendTotal) > 0)
  .sort((a, b) => {
-   const ra = a.leadCount / a.spendTotal;
-   const rb = b.leadCount / b.spendTotal;
+   const ra = Number(a.leadCount) / Number(a.spendTotal);
+   const rb = Number(b.leadCount) / Number(b.spendTotal);
    return rb - ra;
  })
```

### H4. `media-tab.tsx:110 fmtNumber(p.cost)` lacks Number cast
**File:** `src/components/dashboard/media/media-tab.tsx:108-112`

`p.cost` is `Decimal` at runtime (serialized as string). `fmtNumber` branches on `n >= 1_000_000` — works via JS coercion but is fragile if anyone later refactors `fmtNumber`. Consistent fix:

```diff
- {p.cost && (
-   <span className="...">{fmtNumber(p.cost)} VND</span>
+ {p.cost != null && (
+   <span className="...">{fmtNumber(Number(p.cost))} VND</span>
  )}
```

Also note `p.cost &&` truthiness skips `cost: 0` legitimately set to zero — `!= null` is safer.

---

## Medium Priority

### M1. Hidden `GlassCard` to "balance imports" — anti-pattern
**File:** `src/pages/OKRsManagement.tsx:318-321`

```tsx
{/* Hidden GlassCard import balance — used implicitly when adding wrapper sections later */}
<span className="sr-only" aria-hidden="true">
  <GlassCard variant="ghost" padding="none">.</GlassCard>
</span>
```

This violates YAGNI and KISS. If `GlassCard` isn't used, drop the import; re-add when actually wrapping a section. The hidden node still renders to DOM (sr-only just hides visually) — has React reconciliation cost and screen reader noise from the lone `.`.

```diff
- import { Button, TabPill, KpiCard, EmptyState, GlassCard, FilterChip } from '../components/ui';
+ import { Button, TabPill, KpiCard, EmptyState, FilterChip } from '../components/ui';

- {/* Hidden GlassCard import balance ... */}
- <span className="sr-only" aria-hidden="true">
-   <GlassCard variant="ghost" padding="none">.</GlassCard>
- </span>
```

### M2. `lead-logs-tab.tsx` duplicates client-side `q` filter logic
**File:** `src/components/lead-tracker/lead-logs-tab.tsx:262-271, 343-352`

The same search filter is computed twice — once for the statbar counts, once for the rendered rows. Pre-existing, but worth refactoring into a single `filteredLeads` memo to (a) avoid double traversal, (b) prevent drift if one is ever updated. Also note `q` is not part of `leadsQueryParams` so it's purely client-side over the page-loaded set.

```diff
+ const filteredLeads = useMemo(() => {
+   if (!filters.q) return leads;
+   const q = filters.q.toLowerCase();
+   return leads.filter((l) =>
+     l.customerName.toLowerCase().includes(q) ||
+     l.ae.toLowerCase().includes(q) ||
+     (l.notes?.toLowerCase() ?? '').includes(q)
+   );
+ }, [leads, filters.q]);
```

### M3. `DashboardOverview.tsx` `useMemo` deps include freshly-built strings
**File:** `src/pages/DashboardOverview.tsx:66-71`

`defaultFrom` and `defaultTo` are rebuilt every render via `new Date()`. While memoization still produces stable identity when the formatted strings don't change, the `[defaultFrom, defaultTo]` deps are misleading — they imply external inputs. Cleaner:

```diff
- const defaultFrom = format(startOfMonth(new Date()), 'yyyy-MM-dd');
- const defaultTo = format(new Date(), 'yyyy-MM-dd');
- const range = useMemo(
-   () => ({ from: urlFrom ?? defaultFrom, to: urlTo ?? defaultTo }),
-   [urlFrom, urlTo, defaultFrom, defaultTo],
- );
+ const range = useMemo(() => {
+   const from = urlFrom ?? format(startOfMonth(new Date()), 'yyyy-MM-dd');
+   const to = urlTo ?? format(new Date(), 'yyyy-MM-dd');
+   return { from, to };
+ }, [urlFrom, urlTo]);
```

Same pattern in `AdsTracker.tsx:61-64` — defaults recomputed every render. Less critical there since not memoized.

### M4. `new Date('yyyy-MM-dd')` parses as UTC midnight
**Files:** `DashboardOverview.tsx:73`, `AdsTracker.tsx:67`, `lead-logs-tab.tsx:112`

`new Date("2025-05-01")` is parsed as `2025-05-01T00:00:00Z`. In UTC+7 (Vietnam) this renders as `May 1 07:00`, so display is fine — but the picker's preset comparison `value.from.toDateString() === value.to.toDateString()` may flip near midnight UTC. Low risk for VN users; flag for future i18n.

---

## Low Priority

### L1. Dead variable in `LeadTracker.tsx:46-54`
`isSyncing` is computed and `syncActions` is rendered, but `LeadLogsTab` does not receive any sync controls (no `extraControls` prop wiring). Sync button only shows when `activeTab` matches anything (always). This is intentional but the legacy `extraControls?: ReactNode` API on `LeadLogsTab` is now unused — consider removing the prop.

### L2. `attribution-table.tsx` accessor for `cpl` returns `Number(null)`
**File:** `src/components/ads-tracker/attribution-table.tsx:42-45`

```ts
case 'cpl':
  return row.cpl != null ? Number(row.cpl) : null;
```
Good — null sentinel preserved. `useSortableData` correctly pushes null to end. No issue.

### L3. `useSortableData` accessor passed inline causes memo invalidation
**File:** `src/components/ui/use-sortable-data.ts:32-37`

`accessor` is a stable module-level const in the 3 consumers (media-posts-table, campaigns-table, attribution-table), so no issue. But if a caller passes an inline lambda the `useMemo([..., accessor])` will recompute every render. Document this in the JSDoc, or wrap `accessor` in `useCallback` internally. Optional.

### L4. `lead-logs-tab.tsx` `setDateRange` writes both filter state and URL params
The dual write ensures the existing query depends on `filters.dateFrom/dateTo`. Works, but the URL params are now the source of truth — consider deriving filters directly from URL to eliminate the synchronization step. Defer; current logic is correct.

---

## Edge Cases (Scout)

| Case | Status | Notes |
|---|---|---|
| Empty `posts` array → divide-by-zero in marketing-tab ROAS | OK | `.filter(a => a.spendTotal > 0)` excludes zero-spend rows |
| `range.from > range.to` from manual URL edit | Not handled | `setRange` validates inside picker `applyCustom`, but URL-injected reversed range will pass through to API |
| `Decimal("0.00")` vs `0` in filter | OK | `Number("0.00") > 0 === false` |
| Picker default presets when URL params absent | OK | falls through to `defaultFrom/defaultTo` |
| `filters.dateFrom` value of `""` from old URL | Edge case | `new Date("")` → Invalid Date → picker `formatRange` would output "Invalid Date" |
| Sort by `cost` when all rows have null cost | OK | hook pushes all null to end, stable order |
| Bulk delete with 50+ selected leads | Existing | `Promise.all` fires all requests in parallel — no rate limiting. Pre-existing |

---

## API Contract Checks

- `DateRangePicker.size='sm'` (32px) — applied consistently across 4 sites (Dashboard, Ads, Lead Logs, OKR if used)
- `FilterChip.size='sm'` (h-8) — uses correct height, matches Button/TabPill `sm`
- `useSortableData<T, K>` accessor signature `(row, key) => SortableValue` — generic, type-safe, no defaults
- `TableShell` consumers (media-posts, campaigns, attribution) follow same pattern: contract + sticky thead + EmptyState
- v2 `DateRangePicker` preset shape: `key/label/range()` — Vietnamese labels in default, opt-out via `presets` prop

---

## Positive Observations

1. `useSortableData` hook is clean, generic, type-safe, and well-documented with JSDoc example.
2. `SortableTh` correctly emits ARIA `aria-sort` attribute — accessible.
3. `accessor` functions are module-level consts (stable refs) in all 3 consumers — no unnecessary re-renders.
4. URL state pattern is consistent across Dashboard/Ads/Lead — same query params, same yyyy-MM-dd format.
5. `pickerValue` correctly memoized from URL params via `useMemo` (prevents picker re-mount on unrelated state changes).
6. v1 DateRangePicker file deleted; verified no orphan imports remain.
7. KpiCard `decorative` prop used selectively (not default-on) — performance-conscious.

---

## Recommended Actions (priority order)

1. **Fix invalid Tailwind class** `hover:bg-surface-variant/30/50` → `/30` in 3 sites (okr-accordion-cards.tsx:37, 308, 431).
2. **Drop hidden `GlassCard`** from `OKRsManagement.tsx:318-321` + remove unused import.
3. **Add `Number()` cast** to marketing-tab ROAS division (lines 48-54) and media-tab `fmtNumber(p.cost)` (line 110) for consistency with the rest of the codebase.
4. (Optional) Consolidate duplicate `q` filter in `lead-logs-tab.tsx` into a single memo.
5. (Optional, future) Address dynamic Tailwind classes (`hover:${colors.text}`) in OKR accordion — outside this round's scope.

---

## Metrics

- Files reviewed: 16
- TypeScript errors: 0
- Build status: ✓ clean (2.13s)
- New primitives added: 2 (`useSortableData`, `SortableTh`)
- DataTable → TableShell migrations: 3 (media-posts, campaigns, attribution)
- URL-state-synced datepicker pages: 3 (Dashboard, Ads, Lead Logs)

## Unresolved Questions

1. Should `LeadLogsTab.extraControls` prop be kept? It's now unused after `LeadTracker.tsx` moved sync button to its own header.
2. Plan mentioned "pagination skipped (Media/Ads < 50 rows)" — is there a row-count alert if those tables exceed 50 in the future?
3. Are the OKR card hover effects (`hover:bg-surface-variant/30/50`) visually verified post-fix? They never rendered, so the card may need re-design once hover state actually works.
