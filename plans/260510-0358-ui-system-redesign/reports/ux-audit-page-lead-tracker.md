# UX Audit — Lead Tracker

## Quick stats
- **Page LOC:** 129 (well-contained)
- **Components:** 8 (lead-logs-tab, daily-stats-tab, lead-detail-modal, last-sync-indicator, lead-log-dialog, bulk-action-bar, csv-export, sync-from-crm-button)
- **Tab count:** 2 (Logs / CRM Stats)
- **Key features:** Bulk selection + edit, SLA tracking, sync status, soft delete approval workflow

## Drift inventory

| Component | Issue | Fix |
|-----------|-------|-----|
| Tab pill text | `text-[9px]` on lines 50, 59 | Change to `text-[10px]` (style-guide explicit drift warning) |
| Tab pills | Using standard pill toggle correctly: `bg-slate-100 rounded-full p-0.5` | ✓ Compliant |
| Cards | Glass card container: `bg-white/50 backdrop-blur-md rounded-3xl` | ✓ Compliant |
| Stat box cards | `rounded-2xl` on line 270 | Change to `rounded-3xl` to match standard |
| Filter buttons | CustomFilter using `!h-9 !px-3 !text-[11px]` (line 222) | Style guide doesn't specify compact filter size — override considered intentional for density |
| Status badges | Using hardcoded color scheme (purple, blue, amber, emerald, rose) | ✓ Compliant (custom domain palette for lead statuses, not style-guide) |
| Page header | Title split: "Lead" + "Tracker" (italic, primary) | ✓ Fully compliant |
| Breadcrumb | Correct: chevron_right 14px, text-on-surface-variant | ✓ Compliant |

## Tab UX issues

1. **Logs tab hides controls conditionally** (line 83-105)
   - `isSale && activeTab === 'logs' && canManageLeads` → export/sync buttons only visible on logs
   - Stats tab has its own date pickers (lines 115-117) but no export controls — may cause user confusion (export button on logs tab but not stats tab)
   - **Risk:** User switches to stats, expects export, doesn't see button

2. **Tab state not URL-encoded** 
   - No deep linking: `useState<ActiveTab>` reset on page reload
   - Closing dev tools or accidentally refreshing loses tab selection

3. **Stats tab filter is tab-internal only**
   - Date pickers (statsDateFrom, statsDateTo) separate from logs filters
   - No visual hierarchy showing which filters apply to which tab
   - User may not realize stats date range is independent from logs date range

4. **Tab toggle position inconsistent**
   - Logs: `extraControls` injected into filter bar (line 110)
   - Stats: tab toggle in separate flex row (line 119)
   - Visual balance feels slightly off — toggle should be consistent in position

## Table UX issues

### LeadLogsTab table (lead-logs-tab.tsx)
1. **Sticky header works** but thead uses `sticky top-0 z-20` (line 300) — correct z-index layering

2. **Bulk selection incomplete** (lines 302-318)
   - Checkbox column shown only for `isSale && isLeadAdmin` (line 302-312)
   - Non-admin users see 13 cols, admin sees 14 → layout shift
   - No `aria-label` on checkboxes (lines 308, 353)

3. **Sortable columns missing**
   - No way to sort by customer name, status, AE, dates
   - User must manually scan 50+ rows for specific data

4. **Badge truncation risks**
   - Status badge (line 365) uses `rounded-full` but no max-width
   - SLA label can overflow on mobile (line 370-371): "Overdue (+23)" on narrow viewport

5. **Action menu UX**
   - TableRowActions component (line 384-390) — no documentation on behavior
   - Delete request approval UI (lines 393-401) is dense: rose-50 box with approve/reject buttons
   - Visual weight competing with main row content

6. **Empty state** (lines 408-416)
   - Search icon + "No leads found" — standard but minimal
   - No contextual help (e.g., "Change filters or add new lead")

### DailyStatsTab table (daily-stats-tab.tsx)
1. **Multi-level header sticky** (lines 45-61)
   - Double-row header: AE name (colSpan 5) + sub-headers (New, Done, Remaining, Daily%, Total%)
   - Both rows marked `sticky top-0 z-30` but second row at `sticky top-[46px]` — fragile px-based positioning
   - On zoom or font-size change, second row misalignment risk

2. **No sorting**
   - User can't reorder by date or AE name
   - Must scroll horizontally for many AEs

3. **Color coding heuristic**
   - `isHighRemaining = (s?.remaining ?? 0) > 10` (line 76)
   - Red text for "remaining > 10" but no legend explaining threshold
   - User may not understand red means "more than 10 pending"

4. **Overflow table**
   - `max-h-[70vh] overflow-y-auto` (line 43) — not full-height
   - On very short viewports, table cuts off

## Modal/Dialog UX issues

### LeadDetailModal (lead-detail-modal.tsx)
1. **No ESC key handling**
   - Click-outside closes (line 63: `onClick={onClose}`)
   - No keyboard escape support
   - Missing focus trap

2. **Audit log async state unclear**
   - Loading spinner on line 104 but no skeleton
   - User sees "Loading..." text, no visual indication of progress

3. **Change history timeline spacing**
   - Relative positioning with `border-l-2` (line 110)
   - No connecting dots or visual continuity between entries
   - On first entry, timeline starts mid-line

4. **Modal max-width 32rem** (line 66: `max-w-lg`)
   - On desktop, takes only ~33% of screen width
   - Plenty of wasted space, form could be wider

### MediaPostDialog (media-post-dialog.tsx)
1. **No ESC key handler**
   - Close button exists (line 115) but no keyboard escape
   - Focus management not visible

2. **Error state appears inline** (line 243-244)
   - Pink/red error text at bottom
   - User may not notice if scrolled up

3. **Conditional field visibility based on type**
   - Outlet/Cost/Sentiment fields appear dynamically (lines 206-240)
   - Form layout shifts as user selects type — can disorient
   - No animated transition for field appearance

4. **Custom input-field style** (lines 264-280)
   - Inlined CSS in JSX (style tag at bottom)
   - Works but prevents style reuse; hardcoded colors (rgb values)

## Filter & data freshness

### Filters (LeadLogsTab)
1. **Filter state not URL-encoded** (line 99-107)
   - User can't share filtered view
   - Reload loses all filters

2. **Filter controls dense**
   - 5 filter buttons in a row + search (lines 218-243)
   - On tablet, wraps unpredictably
   - No "Clear all" button — user must reset each individually

3. **Stat pulse indicators present** (lines 277-292)
   - Colored dot + label pattern: `Total: N`, `NEW: N`, etc.
   - Quick visual summary but text is tiny (`text-[10px]`)
   - Abbreviations (OT, OVD, VN, QT) not intuitive without legend

### Data freshness
1. **LastSyncIndicator component** (last-sync-indicator.tsx)
   - Shows relative time: "Last sync: 3 minutes ago"
   - Status colors: green (success), amber (running), red (failed)
   - ✓ Compliant with data-freshness best practice

2. **CRM sync button shows loading state** (line 91)
   - `isSyncing` prop drives UI
   - Spinning RefreshCw icon (line 117 in AdsTracker, similar in LeadTracker)

3. **Manual refresh missing on stats tab**
   - Only logs tab has sync button
   - Stats tab uses date pickers but no "refresh now" option

## Accessibility gaps

1. **Checkbox group missing aria-label** (lines 308, 353)
   - Screen readers won't describe "select all" intent
   - Should be: `aria-label="Select all leads"`

2. **Stat box abbreviations**
   - OT = On-time, OVD = Overdue, VN = Vietnam, QT = Quốc tế
   - No title attribute or aria-label explaining abbreviations
   - Culturally local (Vietnamese) with English abbreviations = confusion

3. **Delete request approval buttons** (lines 398-399)
   - Check/X icons only, no visible text labels
   - Blind users won't know intent
   - Should have aria-labels: "Approve deletion", "Reject deletion"

4. **Tab pills don't have aria-selected**
   - Using button + CSS active state only
   - Tab navigation not announced properly

5. **SLA badge calculation non-obvious**
   - Logic in getLeadSla() (lines 50-71) not documented
   - "D-7" and "Overdue +3" format not self-documenting

6. **Table sortability absence**
   - No visual cue that columns can't be sorted
   - Users will try clicking headers expecting sort

## Information density

### Logs table
- **High density:** 11 columns (Customer, AE, Received, Resolved, Status, SLA, Lead Type, UQ Reason, Notes, Modified, Actions)
- **Decision:** Table vs. card is correct (list-like data, many rows expected)
- **Usability:** Justified but near saturation; SLA + Status columns both show status-like info (redundant visual coding)
- **Recommendation:** Consider collapsing SLA into Status badge as detail-on-demand (hover shows SLA math)

### Stats table
- **High density:** 1 + (N_AE × 5) columns
- **Decision:** Pivot table design (dates × AEs) justified for SLA tracking
- **Usability:** Difficult to scan on mobile; many columns invisible unless scrolling
- **Recommendation:** Mobile view should switch to card layout (date row → AE cards below)

### KPI cards
- **4 cards in bento grid** — compliant, good information hierarchy
- **Highlight card uses primary color** — draws focus correctly

## Top 5 actionable insights

1. **Fix tab pill text size:** Change `text-[9px]` → `text-[10px]` on LeadTracker (2 instances). This is documented drift in style-guide line 266.

2. **Add stat legend:** Create a small tooltip/popover showing stat abbreviations (OT, OVD, VN, QT) when user hovers over stat box. Accessibility + clarity win.

3. **URL-encode tab state + filters:** Use URL search params (`?tab=stats&ae=John&from=2026-05-01`) for deep linking. Enables bookmark/share, improves accessibility.

4. **Add ESC key + focus trap to modals:** Both LeadDetailModal and MediaPostDialog need `useEffect` listening for Escape, plus focus management. Use a11y-focused library (e.g., `react-focus-lock`).

5. **Implement column sorting on main logs table:** Add `sortKey` state to LeadLogsTab, make column headers clickable (similar to CampaignsTable). Improves discoverability.

---

**Status:** DONE
**Summary:** LeadTracker page has solid foundational UX but suffers from tab state loss on reload, missing keyboard accessibility (ESC, focus trap), and one documented style drift (`text-[9px]` tabs). Table information density is justified but needs accessible sort headers. Filter controls need clear-all button and URL encoding.
**Concerns:** Dense stat abbreviations (OT, OVD, VN, QT) not documented — localization risk if team expands. Sticky header math on stats tab uses fragile px-based positioning.
