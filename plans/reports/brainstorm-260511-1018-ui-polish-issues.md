# Brainstorm — UI Polish Issues (Round 2)

**Date:** 2026-05-11 10:18 ICT
**Context:** Sau Phase 8 namespace flatten, user feedback 8 issues từ visual review 5 pages (Dashboard, OKRs, MediaTracker, AdsTracker, LeadTracker).
**Mode:** Multi-page polish — design rồi mới implement.

---

## Problem Statement

Sau commit `d458645 refactor(ui): remove PageHeader hero from 9 pages + flatten ui utility namespace` (2026-05-10), 5 pages bị:

1. **Mất tiêu đề** — chỉ còn breadcrumb top-left, không có heading rõ ràng
2. **Top row layout sai chỗ** — TabPill + filters cluster TRÁI, action button RIGHT → mất hierarchy
3. **Controls size không đồng nhất** — TabPill default (~40px), Button default, DatePicker native size khác nhau → visual noise
4. **OKR objective cards quá to** — padding `p-5 md:p-6 lg:p-8`, icon `w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14`, title `text-base md:text-lg lg:text-xl` → vertical bloat
5. **Media Tracker KOL/KOC Spend bug** — display `015000005000000` (string concat artifact)
6. **Tables không đồng nhất** — Lead Logs dùng `TableShell + getTableContract` (raw, sticky col), Media/Ads dùng `DataTable v2` (sort/pagination built-in) → 2 different visuals
7. **DatePicker không đồng nhất** — Dashboard dùng v1 `DateRangePicker` (pill button + preset dropdown), Ads dùng native `<input type="date">` x2, Lead dùng v2 `DatePicker` x2
8. **Statbar Lead Logs wrap vertical** — chia sẻ row với 4 filters + search + 2 datepicker → overflow wrap khi viewport hẹp

---

## User Decisions (q&a 10:21 ICT)

| Issue | Decision |
|---|---|
| Title scope | Compact h2/h3 + giữ breadcrumb (no description, no italic accent hero) |
| Top row layout | **Title LEFT** — Tabs/Filters/DatePicker/Action **đều RIGHT** trên cùng row |
| Table direction | Media/Ads → **TableShell** (match Lead Logs baseline) |
| Statbar | Force horizontal, tách row riêng |

---

## Root Cause Analysis

### Bug 4 (KOL/KOC Spend display)

`MediaTracker.tsx:79-81`:
```ts
const kolSpend = allPosts
  .filter((p) => p.type === 'KOL' || p.type === 'KOC')
  .reduce((s, p) => s + (p.cost ?? 0), 0);
```

`prisma/schema.prisma:403`: `cost Decimal? @db.Decimal(12, 2)`

Prisma Decimal type serializes as **string** trong JSON response. JS `+` operator với string operand = string concat → `0 + "5000000" → "05000000" → "05000000" + "10000000" → "0500000010000000"`. Display `015000005000000` = leading-zero string concat artifact.

**Fix:** `s + Number(p.cost ?? 0)` — explicit cast. Audit khác Decimal field (totalReach, totalEngagement OK vì là Int).

---

## Evaluated Approaches

### Approach 1 — Big-bang refactor (rewrite 5 page layouts at once)

**Pros:** Đồng bộ instant, no in-between inconsistent state.
**Cons:** Diff to review lớn (~600-800 LOC), regression rủi ro, rollback khó.

### Approach 2 — Per-page incremental (touch 1 page mỗi commit)

**Pros:** Diff nhỏ, easy review/rollback.
**Cons:** Inconsistent intermediate state, total time longer (overhead context-switch).

### Approach 3 — Bucketed (Recommended)

3 buckets theo concern, mỗi bucket 1 commit:

**Bucket A — Layout primitives (cross-page)**
- Create reusable `<PageShell>` primitive: title-left + actions-right row, size='sm' default controls
- Affect 5 pages: Dashboard, OKRs, MediaTracker, AdsTracker, LeadTracker

**Bucket B — Tables & Stats**
- Migrate 3 tables (media-posts, campaigns, attribution) → TableShell pattern
- Lead Logs statbar: extract ra row riêng (always horizontal)

**Bucket C — Component fixes**
- OKR card shrink (padding/typography)
- MediaTracker spend bug fix (Number cast)
- DateRangePicker primitive unify (Dashboard, Ads, Lead dùng cùng 1 component)

**Pros:** Mỗi bucket có concern rõ + commit message descriptive + rollback granular.
**Cons:** 3 commits thay vì 1. Overhead nhỏ.

---

## Recommended Solution: Approach 3 (Bucketed)

### Bucket A — Layout primitives & sizing

**1. PageShell pattern** (no new component — convention only)

```tsx
// Top of every page render
<div className="flex flex-col gap-4 md:gap-6">
  {/* Row 1: Title left, controls right */}
  <header className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <Breadcrumb segments={[{ label: 'Acquisition' }, { label: 'Media Tracker' }]} />
      <h2 className="text-h2 font-bold text-on-surface">Media Tracker</h2>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <TabPill size="sm" ... />
      <FilterChip size="sm" ... />
      <DateRangePicker size="sm" ... />
      <Button size="sm" variant="primary" ... />
    </div>
  </header>

  {/* Row 2: KPIs */}
  <div className="grid ...">...</div>

  {/* Row 3+: Content */}
</div>
```

**2. Controls uniform sizing**

Verify v2 primitives đều có `size` prop:
- `Button` size: 'sm' | 'md' | 'lg' — confirmed exists
- `TabPill` size: cần check — nếu không có → thêm size variant
- `FilterChip` size: 'sm' — confirmed (already used in Lead Logs)
- `DateRangePicker` size: cần thêm — refactor existing v2 primitive

Target height: **32px** (size='sm' tokens).

### Bucket B — Tables & Statbar

**1. Migrate 3 tables to TableShell pattern**

Reference: `lead-tracker/lead-logs-tab.tsx:290+` (table structure)
- `media-tracker/media-posts-table.tsx` — replace DataTable v2 → TableShell
- `ads-tracker/campaigns-table.tsx` — replace DataTable v2 → TableShell
- `ads-tracker/attribution-table.tsx` — replace DataTable v2 → TableShell

Loss: built-in sort/pagination → manual reimplement (sort state hook + click handlers, pagination buttons). Pattern reusable từ Lead Logs.

**2. Lead Logs statbar → separate row**

Current: `<GlassCard>` chứa filters + datepicker + search + stat blocks (line 211-288).
New: split thành 2 GlassCard rows:
- Row filter: tabs + filters + datepicker + search + button (size='sm', justify-end)
- Row stat: 10 stat chips dàn hàng ngang (always horizontal via `overflow-x-auto`)

### Bucket C — Component fixes

**1. OKR card shrink** (`okr-accordion-cards.tsx`)

Patches:
- L1 card: `p-5 md:p-6 lg:p-8` → `p-3 md:p-4`
- L1 icon: `w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14` → `w-8 h-8 md:w-10 md:h-10`
- L1 title: `text-base md:text-lg lg:text-xl` → `text-base md:text-lg`
- L2 card: `p-4 md:p-6` → `p-3 md:p-4`
- Progress bar height giảm
- Gaps `gap-4 md:gap-6` → `gap-2 md:gap-3`

**2. MediaTracker spend bug**

`MediaTracker.tsx:81`: `s + (p.cost ?? 0)` → `s + Number(p.cost ?? 0)`

Audit khác Decimal: `prisma/schema.prisma` Decimal fields — scan all components reduce/sum chúng.

**3. DateRangePicker primitive unify**

Hiện trạng:
- v2 `components/ui/date-range-picker.tsx` exists (used elsewhere?)
- v1 `components/dashboard/overview/DateRangePicker.tsx` (pill style w/ presets)
- v2 `components/ui/date-picker.tsx` (single date input)

Plan: dùng v2 primitive `DateRangePicker` cho all 3 pages (Dashboard + Ads + Lead).

Steps:
- Audit v2 `DateRangePicker` feature parity với v1 (preset Hôm nay/7d/14d/30d/Tháng này)
- Nếu thiếu preset → add to v2 primitive
- Migrate Dashboard: `V1DateRangePicker` → `DateRangePicker` v2
- Migrate Ads Tracker: 2 native input → DateRangePicker v2
- Migrate Lead Logs: 2 DatePicker + dash → DateRangePicker v2

Lead Logs additional: also has `noteDate` single picker (filter changed at date) — giữ nguyên DatePicker single cho field này.

---

## Implementation Considerations

### Cross-cutting

| Concern | Mitigation |
|---|---|
| `<h2 className="text-h2">` token | Verify token exists in `src/index.css`. Fallback: `text-2xl font-bold`. |
| Breadcrumb component | Check `components/ui/page-header.tsx` exports `Breadcrumb` standalone. Nếu không → extract. |
| TabPill `size` prop | If missing, add 'sm' variant (h-8 px-3 text-sm). Affect ~10 page usages. |
| DateRangePicker size variant | Add 'sm' to v2 primitive. ~10 LOC. |

### Bucket B specific

| Concern | Mitigation |
|---|---|
| TableShell mất built-in sort | Reuse Lead Logs sort hook pattern. Define `sortKey` + `sortDir` state, click handlers, slice array. |
| Pagination loss | Media/Ads tables nhỏ (<50 rows hiện tại) → tạm skip pagination. Future: extract `usePagination` hook. |
| Sticky column behavior | Lead Logs có sticky checkbox col + customer name col. Media/Ads chưa cần sticky → skip. |

### Bucket C specific

| Concern | Mitigation |
|---|---|
| OKR card change affects L1 + L2 + Childcard | Test all 3 levels visually after shrink. |
| Decimal bug có thể tồn tại nơi khác | Grep `\.reduce.*+.*\.cost\|\.price\|\.amount\|\.revenue\|\.spend` — fix all sites with Number() cast. |
| DateRangePicker URL state persistence | Dashboard dùng `?date_from=&date_to=` URL params. Maintain compat when migrating. |

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| 5 pages refactor cùng commit → regression | 🟡 Medium | 3 buckets = 3 commits, test mỗi commit |
| TableShell migration breaks sort/pagination | 🟡 Medium | Reuse Lead Logs pattern verbatim. Pattern proven. |
| Decimal bug fix có side effect nơi khác | 🟢 Low | Number() cast là safe op trên null/string/number. |
| User không thích layout right-cluster | 🟡 Medium | Đã confirm trong Q&A — proceed. |
| Bundle size tăng (DateRangePicker primitive added size) | 🟢 Low | Net delta gần 0 (replace v1 with v2). |

---

## Success Criteria

- [ ] 5 pages (Dashboard, OKRs, MediaTracker, AdsTracker, LeadTracker) đều có h2 title + breadcrumb LEFT
- [ ] Top row right-cluster: TabPill+FilterChip+DateRangePicker+Button cùng height (~32px)
- [ ] OKR L1 card height giảm ≥ 25% (từ ~140px → ~100px)
- [ ] KOL/KOC Spend hiển thị đúng (e.g., "15,000,000 VND")
- [ ] 3 tables Media/Ads dùng TableShell pattern (visual match Lead Logs)
- [ ] DateRangePicker giống nhau ở 3 pages (Dashboard/Ads/Lead)
- [ ] Lead Logs statbar luôn horizontal, không wrap
- [ ] vite build clean, 0 TypeScript errors

---

## Effort Estimate

| Bucket | Effort | Files touched |
|---|---|---|
| A — Layout & sizing | 2-3h | 5 pages + 1-2 primitive |
| B — Tables & statbar | 3-4h | 3 tables + lead-logs-tab |
| C — Components | 1-2h | okr-accordion-cards + MediaTracker + 3 datepicker migrations |
| **Total** | **6-9h** | ~12 files |

---

## Next Steps

1. **User approve approach** → tôi sẽ invoke `/ck:plan` để tạo implementation plan chi tiết, hoặc proceed direct nếu user chọn fast path
2. After implementation: vite build verify + manual smoke test 5 pages
3. Update `phase-08` doc với polish round 2 outcomes

---

## Unresolved Questions

1. **TabPill size variant**: nếu chưa có 'sm' trong v2 primitive, có ưu tiên thêm vào primitive (touch storybook + types) hay inline override className?
2. **DateRangePicker URL state**: Dashboard hiện dùng `?date_from=&date_to=` — Ads + Lead có cần URL state sync không? Hay local state đủ?
3. **OKR card L1 vs L2 padding**: shrink đều cả 2 levels (L1 và L2) hay giữ L2 nhỏ hơn?
