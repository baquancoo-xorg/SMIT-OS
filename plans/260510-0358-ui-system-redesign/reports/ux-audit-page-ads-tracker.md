# UX Audit — Ads Tracker

## Quick stats
- **Page LOC:** 218 (self-contained, tab-switchable content)
- **Components:** 5 (campaigns-table, spend-chart, attribution-table, kpi-card, tab-btn)
- **Tab count:** 3 (Campaigns / Performance / Attribution)
- **Key features:** Campaign list with sorting, spend trend chart, attribution linking (Ads → Leads), unmatched source warning, CSV export, sync from Meta

## Drift inventory

| Component | Issue | Fix |
|-----------|-------|-----|
| Tab pills | `text-[10px]` (line 210) | ✓ Compliant |
| Tab toggle container | `bg-slate-100 rounded-full p-0.5` | ✓ Compliant |
| KPI cards (regular) | `bg-white/50 backdrop-blur-md rounded-3xl` with decorative blob | ✓ Compliant |
| KPI card (highlight) | `bg-primary rounded-3xl` with `bg-white/10` blob | ✓ Compliant |
| Page header | Title split: "Ads" + "Tracker" (italic, primary) | ✓ Compliant |
| Buttons | Primary (Sync Meta): `h-10 bg-primary shadow-lg shadow-primary/20` | ✓ Compliant |
| Button secondary (Export) | `h-10 bg-surface-container-high hover:bg-slate-200` | ✓ Compliant |
| Cards & tables | All use `rounded-3xl` | ✓ Compliant |

## Tab UX issues

1. **Tab state not URL-encoded**
   - `useState<Tab>('campaigns')` resets on reload
   - No deep-linking support
   - User loses tab context on refresh or accidental navigation

2. **Tab content renders conditionally**
   - Lines 141-157: `{activeTab === 'campaigns' && ...}`, `{activeTab === 'performance' && ...}`, etc.
   - Content unmounts on tab switch (state lost in child components)
   - CampaignsTable sort state resets if user switches to Performance and back
   - **Risk:** User sorts campaigns by spend, switches tabs, returns → sort lost

3. **Date filters global but content tab-specific**
   - Lines 27-28: `dateFrom` and `dateTo` shared across all tabs
   - Performance (SpendChart) and Attribution use these dates (line 149)
   - Campaigns tab doesn't use date filters — filtering is implicit (line 32: `useAdsCampaignsQuery(params)` uses params but campaigns endpoint may ignore dates)
   - **Confusion:** User changes date range on Campaigns tab, switches to Attribution, expects filtered view — behavior unclear

4. **Tab visual feedback minimal**
   - Active tab: white background + primary text
   - Inactive: slate-400 text
   - Same as LeadTracker/MediaTracker — consistent but could be bolder (e.g., underline indicator)

5. **Header controls split attention**
   - Date pickers + Export + Sync buttons all in top row (lines 98-121)
   - When multiple controls visible, visual hierarchy unclear
   - Sync button only shown for admin (line 111: `{isAdmin && ...}`) — non-admins don't see it, layout shifts

## Table UX issues

### CampaignsTable (campaigns-table.tsx)

1. **Sortable columns implemented correctly**
   - Lines 27-49: `sortKey` state (default 'spendTotal') + `sortDir` ('asc'/'desc')
   - User can click column header to sort
   - Lines 57-93: SortableTh component shows active column + direction arrow
   - ✓ Good UX (clickable headers with visual feedback)
   - Material symbol arrow: `arrow_upward` (asc) / `arrow_downward` (desc)

2. **Sort persistence issues**
   - Sort state is local component state (line 27)
   - Switching to Performance tab and back → sort reset (because CampaignsTable unmounts)
   - No URL encoding of sort state

3. **Column headers lack explicit "click to sort" affordance**
   - Active column shows arrow, but inactive columns don't suggest they're clickable
   - Cursor should be pointer, but not visible in code
   - Should have aria-label: "Click to sort by [column]"

4. **Empty state** (lines 98-102)
   - Text: "No campaigns yet — run sync from admin"
   - Contextual hint good, but text is tiny (`text-[10px]`)

5. **UTM column** (line 61)
   - Shows `utmCampaign` or "—" if missing
   - Font: mono (line 121: `font-mono`)
   - No truncation — could overflow on narrow viewport

6. **Status badge colors** (lines 11-15)
   - ACTIVE: tertiary (green) ✓
   - PAUSED: amber ✓
   - ARCHIVED: gray ✓
   - DELETED: error (red) ✓
   - Compliant with style-guide

7. **Metrics formatting**
   - Spend: `fmtMoney()` with currency (VND/USD)
   - Impressions/Clicks/Conversions: `fmtNumber()` with locale commas
   - CTR: hardcoded percentage (line 131: `(c.ctr * 100).toFixed(2)%`)
   - Consistent and readable

8. **Table interaction**
   - `onSelect` callback present (line 8) but never wired in parent (AdsTracker line 143)
   - Suggests future feature (campaign detail view) not yet implemented
   - Row hover: `hover:bg-white/40 transition-colors cursor-pointer`
   - Cursor suggests clickable but no click handler

### SpendChart (spend-chart.tsx)

**Not audited** (component file not provided in read request). Assuming visualization library (e.g., Recharts, Chart.js).

### AttributionTable (attribution-table.tsx)

1. **No sorting**
   - Table auto-sorts by spend descending (line 14-15)
   - No user-controlled sort
   - **Risk:** User wants to see "campaigns with lowest CPL" — can't reorder

2. **Unmatched sources warning section** (lines 65-89)
   - Separate card below main table
   - Shows sources without matching campaigns (warning icon + amber styling)
   - ✓ Good UX (highlights data quality issue)
   - Displays first 20, shows "+X more" if exceeds

3. **Missing CPL formatting**
   - Line 55: `r.cpl != null ? fmtMoney(r.cpl, r.currency) : '—'`
   - If CPL is null (no leads), shows "—"
   - ✓ Sensible fallback

4. **Column headers match style**
   - `text-[10px] font-black uppercase tracking-widest text-slate-400`
   - Compliant

5. **Unmatched section card styling**
   - Line 66: `bg-amber-50/70 backdrop-blur-md border border-amber-200/40 rounded-3xl`
   - Variant of glass card with amber tint
   - ✓ Compliant

6. **Empty state** (lines 34-38)
   - Text: "No attribution data — sync Meta + ensure Lead.source matches utm_campaign"
   - Contextual troubleshooting hint — excellent UX

## Modal/Dialog UX issues

**No modals on this page.** All interactions are in-place (tab switching, sort, date picker).

## Filter & data freshness

### Date Filters
1. **Applied globally** (lines 27-28, 30)
   - Used by all three tabs
   - Date pickers in header (lines 99-102)
   - Range format: "From" — "To" (friendly, not swapped)

2. **Default range**
   - startOfMonth to today (lines 27-28)
   - Reasonable default, but no user control shown
   - ✓ Sensible

3. **Date picker component** (from DatePicker import)
   - Not audited (assumed standard UI component)

### Data freshness
1. **Sync from Meta button** (lines 111-119)
   - Label: "Sync Meta"
   - Only shown for admin (line 111: `{isAdmin && ...}`)
   - Loading state: `syncMutation.isPending` (line 114)
   - Spinning icon: `className={syncMutation.isPending ? 'animate-spin' : ''}`
   - Button text: "Syncing…" or "Sync Meta"
   - ✓ Good feedback, matches LeadTracker pattern

2. **No "last sync" indicator**
   - Unlike LeadTracker (LastSyncIndicator component), no timestamp shown
   - User doesn't know when data was last updated
   - Data becomes stale after sync; no indication of staleness

3. **Sync trigger missing on table**
   - Only admin sees Sync button in header
   - Non-admins have no way to trigger refresh
   - Data could be hours old without visibility

### CSV Export
1. **Tab-aware export** (lines 59-68)
   - Campaigns tab → export campaigns
   - Attribution tab → export attribution
   - Export function imports: `exportAdsCampaignsToCsv`, `exportAdsAttributionToCsv` (line 15)
   - ✓ Good pattern (matches MediaTracker)

2. **Export state**
   - No visual feedback during export (no spinner, no count)
   - Button doesn't change state
   - User has no confirmation of success

## Accessibility gaps

1. **Tab pills missing aria-selected**
   - Using button + active state only
   - Should have `role="tab"` + `aria-selected="true/false"`
   - Tab container should have `role="tablist"`

2. **Sortable column headers lack aria-label**
   - CampaignsTable.tsx line 159: `onClick={() => toggleSort(key)}`
   - Sighted users see arrow indicator, but screen readers won't know "click to sort"
   - Should have aria-label: "Sort by [column name] (currently [asc/desc])"

3. **Empty state text minimal**
   - No icon, no semantic structure
   - Text is tiny (`text-[10px]`)
   - Should have aria-label on parent: "No data available"

4. **Unmatched sources card**
   - Warning icon shown (line 68: `<span className="material-symbols-outlined text-amber-500">warning</span>`)
   - Title: "Lead sources without matching campaign"
   - Accessible but could be clearer with aria-label: "Data quality warning: [X] leads have UTM campaigns not matching any ad campaign"

5. **Date range inputs**
   - Assume DatePicker has proper accessibility, but not verified
   - If it doesn't, entire date filter is inaccessible

6. **Metric abbreviations**
   - Impr. = Impressions, Conv. = Conversions, CTR = Click-Through Rate
   - Not documented
   - Should have title attributes: `title="Impressions"`

7. **SPend currency not explicitly labeled**
   - Column header is "Spend", unit inferred from value (e.g., "1,000,000 VND")
   - Should be: "Spend (VND)" or currency shown in header
   - Screen reader announces "Spend 1,000,000 VND" correctly, but could be clearer

## Information density

### CampaignsTable
- **Width:** 8 columns (Campaign, Status, UTM, Spend, Impr., Clicks, Conv., CTR)
- **Decision:** Table justified (campaign management is list-heavy, sorting essential)
- **Usability:** Good — columns are scannable, sortable, metrics aligned right
- **Recommendation:** Sticky "Campaign" column on scroll for context; UTM column sometimes empty — consider abbreviating or conditional display

### AttributionTable
- **Width:** 6 columns (Campaign, UTM, Spend, Leads, Qualified, CPL)
- **Decision:** Table justified (attribution is fundamentally tabular)
- **Usability:** Good — tells story (spend → leads → qualified → CPL)
- **Recommendation:** Add sparkline or trend mini-chart for CPL (e.g., "↓ 15%" over last 30d)

### KPI Cards
- **4 cards in bento grid** (lines 124-136)
- Total Spend (highlighted), Active Campaigns (with total count subtitle), Leads Attributed, Avg CPL
- ✓ Good hierarchy and balance
- Highlight card uses primary color correctly

### SpendChart
- Assume reasonable information density (not audited)

## Top 5 actionable insights

1. **Add URL-encoded tab + sort state:** Use `?tab=campaigns&sort=spend&dir=desc` to preserve user choices across navigations. Enables deep-linking ("sort by spend" → share link).

2. **Implement sort on AttributionTable:** Add sortable columns for CPL, Spend, Leads. Users likely want "highest CPL first" or "lowest CPL first" to optimize spend. Current auto-sort by spend misses this use case.

3. **Persist sort state across tab switches:** Keep CampaignsTable mounted (display: none) when tab changes, or restore sort via URL/URL searchParams. Currently unmounts → loses sort.

4. **Add "last sync" timestamp:** Show "Data last synced: 5 minutes ago" near Sync button. Non-admins especially need visibility into data staleness (no sync permission).

5. **Add metric abbreviation legends:** Hover tooltips or help icon explaining "Impr." = Impressions, "Conv." = Conversions, "CTR" = Click-Through Rate. Improves scannability.

---

**Status:** DONE
**Summary:** AdsTracker page has strong foundational UX with sortable campaigns table and good data-quality warnings (unmatched sources). Main gaps are missing URL encoding of tab/sort state (loses context on reload), no sorting on attribution table (limits analysis), and missing accessibility labels on sortable headers. Non-admin users lack visibility into data freshness (no last-sync indicator).
**Concerns:** SpendChart component not audited (content rendering unknown); tab state unmounts child components (sort lost on tab switch); admin-only sync button creates layout shift for non-admins.
