# UX Audit — Dashboard Overview

## Quick stats
- **LOC:** 146 (page) + ~38 sub-components
- **Sub-components:** SummaryCards, KpiTable, CallPerformanceSection, LeadDistributionSection, ProductSection, MarketingTab, MediaTab, AcquisitionOverviewTab
- **Tabs:** 5 (Overview, Sale, Product, Marketing, Media)
- **Layout:** Tab-based domain switching + conditional content rendering
- **Main issues:** Visual drift severe, mobile responsiveness critical gap, accessibility minimal

---

## Drift inventory

| Pattern | Count | Severity | Files |
|---|---|---|---|
| `rounded-2xl` (should be `rounded-3xl`) | 55 | 🔴 | lead-distribution, call-performance, product | 
| Missing glassmorphism `bg-white/50 backdrop-blur-md` | 32+ | 🔴 | Most dashboard panels use solid `bg-white` instead |
| Missing decorative blob signature `bg-primary/5 rounded-full` | 35+ | 🟡 | Bento metric cards lack animated hover blobs |
| Missing italic accent in section headings | 8+ | 🟡 | KpiTable header uses `KPI Metrics` not `KPI italic-Metrics` |
| Tab pill text size `text-[10px]` (correct) | ✓ | 🟢 | DashboardPageHeader follows pattern |
| Missing responsive padding `p-4 xl:p-6` | High | 🔴 | lead-distribution hard-codes `p-5`, call-performance `p-3 md:p-4` |
| Hardcoded colors vs theme tokens | 12+ | 🟡 | `bg-slate-50`, `border-slate-100` instead of `bg-surface-container-low`, `border-outline-variant` |

---

## UX friction (Top 7 issues)

**1. Missing empty state handling** — lead-distribution-section.tsx:17-28 — Shows spinner only, no empty state message when zero data — **Fix:** Render empty state component per style guide (search_off icon + uppercase label)

**2. Inaccessible tab navigation** — DashboardOverview.tsx:78 — ViewToggle has no `aria-selected`, `aria-label`, `role="tablist"` — **Fix:** Add semantic a11y attributes to tab buttons

**3. Error states lack visual hierarchy** — SummaryCards.tsx:82 + KpiTable error — Generic red text "Lỗi: ..." in plain panel — **Fix:** Use error status indicator + Material icon `warning` + panel styling per guide

**4. No keyboard navigation** — DashboardOverview.tsx:58 — Tab toggle onClick only, no keyboard handler — **Fix:** Add onKeyDown for Enter/Space to toggle tabs

**5. Mobile collapse missing** — DashboardOverview.tsx:76 — Controls row uses `flex-wrap items-center justify-end gap-3 md:gap-4` but no stack on mobile <375px — **Fix:** Add `flex-col sm:flex-row` pattern + `md:gap-4` for mobile-first

**6. Loading skeleton misses card styling** — KpiTable.tsx:220-227 — Skeleton uses basic `bg-slate-100 rounded` instead of glass card wrapper — **Fix:** Wrap in `DashboardPanel` with glass styling

**7. Form input styling inconsistent** — CustomSelect.tsx:42 — Uses `bg-white border border-slate-200` but pages expect `bg-white/50 backdrop-blur-md` — **Fix:** Unify input styling across CustomSelect + CustomFilter

---

## Mobile issues

**Tablet/mobile breaks:**
- **DateRangePicker (line 80):** No width constraint; may overflow on <768px
- **ViewToggle (line 78):** `max-w-full` but no flex-col fallback if controls stack
- **LeadDistribution grid (line 17):** Hard-codes `grid-cols-3` → 3-column on mobile = crushed layout
  - **Fix:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **KPI header spacing (line 10-18):** Responsive `gap-[var(--space-md)]` ✓ but breadcrumb missing on mobile (Header.tsx handles it, but no fallback in DashboardOverview)

**Landscape mode:** No `landscape:` media queries; tabs may stack awkwardly on iPad in portrait

---

## Information architecture

**Current structure:**
- Page header (title + breadcrumb) — DashboardPageHeader (line 72)
- Filter + controls row (ViewToggle + DateRangePicker) (line 75-81)
- Tab-driven content switch (line 86-141)
  - Overview → SummaryCards + KpiTable
  - Sale → CallPerformance + LeadFlow + LeadDistribution
  - Product → ProductSection
  - Marketing → MarketingTab
  - Media → MediaTab

**Issues:**
1. **Breadcrumb ownership blur:** DashboardPageHeader doesn't render breadcrumb; relies on Header.tsx. No fallback if header missing.
   - **Fix:** Move breadcrumb into DashboardPageHeader per style guide pattern
2. **Deep nesting in tabs:** Each tab content is a separate section; no visual indication of "you are in Tab X"
   - **Fix:** Highlight active tab with stronger visual (underline + background, not just text color)
3. **No back/up navigation:** Sale → LeadDistribution has no "back to tabs" affordance
   - **Fix:** Add subtle breadcrumb trail within tab content

---

## Top 5 actionable insights for Phase 2-3

1. **Systematic glass card migration (🔴 CRITICAL)** — 55 `rounded-2xl` + 32 solid panels need batch conversion to `bg-white/50 backdrop-blur-md rounded-3xl`. Audit 15-20 files (lead-dist, call-perf, product) in single PR.

2. **Decorative blob pattern standardization** — Only 3 files have blob; 35+ Bento metric cards missing them. Create reusable `BentoCard` component wrapping DashboardPanel + blob + optional progress bar.

3. **Mobile-first grid breakpoints** — LeadDistributionSection + ProductSection hardcode multi-column grids. Replace with responsive `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` pattern.

4. **Empty state + error state design tokens** — Inconsistent red text errors. Implement reusable EmptyStatePanel + ErrorStatePanel components using Material icons + style guide typography.

5. **Tab semantic a11y + keyboard nav** — ViewToggle (and all tab toggles) missing `aria-selected`, `aria-label`, `role="tablist"`. Add keyboard handlers (ArrowLeft/Right to switch tabs). Test with screen reader.

---

## Code quality observations

**Positives:**
- ✓ Error handling present in most fetches (try-catch, error prop passed)
- ✓ Loading skeleton UI exists (SummaryCards, KpiTable)
- ✓ Date range filtering implemented
- ✓ Responsive typography (`text-2xl xl:text-4xl`)

**Gaps:**
- ✗ No Skeleton component import in lead-distribution (raw spinner div)
- ✗ No `.alt` text on chart images or data visualizations
- ✗ No form validation feedback (CustomSelect + CustomFilter pass silently)
- ✗ No loading cancel if fetch takes >30s (no AbortController)

---

## Unresolved questions

1. Should breadcrumb live in Header.tsx or DashboardPageHeader? (Currently split)
2. Is DateRangePicker responsive <375px, or does it scroll horizontally?
3. Do all 5 tabs (Sale, Product, Marketing, Media) have the same error/loading/empty handling pattern?
4. Should LeadDistribution charts be modal-driven on mobile (<md), or stack vertical?

