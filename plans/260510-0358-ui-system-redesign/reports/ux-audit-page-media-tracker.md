# UX Audit — Media Tracker

## Quick stats
- **Page LOC:** 221 (self-contained, single-tab pattern)
- **Components:** 5 (media-posts-table, media-post-dialog, platform-badge, kpi-card, tab-btn)
- **Tab count:** 3 (Owned / KOL/KOC / PR)
- **Key features:** Create/edit/delete posts, conditional column visibility (cost, sentiment), CSV export per tab

## Drift inventory

| Component | Issue | Fix |
|-----------|-------|-----|
| Tab pills | `text-[10px]` — compliant | ✓ Compliant |
| Tab toggle container | `bg-slate-100 rounded-full p-0.5 gap-0.5` | ✓ Compliant (pill style) |
| KPI cards (regular) | `bg-white/50 backdrop-blur-md rounded-3xl` with decorative blob | ✓ Fully compliant |
| KPI card (highlight) | `bg-primary rounded-3xl` with `bg-white/10` blob | ✓ Compliant (variant allowed) |
| Page header | Title split: "Media" + "Tracker" (italic, primary) | ✓ Compliant |
| Dialog title | Uses `text-primary italic` on "post" | ✓ Compliant |
| Buttons | Primary CTA: `h-10 bg-primary rounded-full shadow-lg shadow-primary/20` | ✓ Compliant |
| Button secondary | Export: `h-10 bg-surface-container-high text-slate-600 hover:bg-slate-200` | ✓ Compliant |

## Tab UX issues

1. **Tab state not URL-encoded**
   - `useState<Tab>('owned')` resets on page reload
   - No deep-linking support
   - User loses tab context on accidental refresh

2. **Tab controls affect table columns dynamically**
   - Owned tab: shows platform, type, title, date, reach, engagement (7 cols)
   - KOL/KOC tab: adds cost column (8 cols) — line 152: `showCost={activeTab === 'kol' || activeTab === 'pr'}`
   - PR tab: adds sentiment column (9 cols) — line 153: `showSentiment={activeTab === 'pr'}`
   - **Issue:** Table width shifts as columns appear/disappear
   - No smooth transition; columns appear/vanish instantly

3. **Default type auto-selection**
   - Line 166: `defaultType={editing ? undefined : TAB_DEFAULT_TYPE[activeTab]}`
   - Owned → ORGANIC, KOL → KOL, PR → PR
   - ✓ Good UX (form pre-filled on add-from-tab)
   - Risk: User on Owned tab clicks "Add post", sees type=ORGANIC forced, may expect to choose

4. **Tab visual feedback minimal**
   - Active tab: white background + primary text
   - Inactive: slate-400 text
   - Standard pill style but no other affordance (indicator bar, underline) — could be clearer

## Table UX issues

### MediaPostsTable (media-posts-table.tsx)

1. **Column headers not sortable**
   - No way to sort by reach, engagement, date, cost
   - User must manually scan many rows
   - Likely bottleneck for finding "top posts"

2. **Platform badge** (line 79)
   - Using PlatformBadge component (not audited)
   - Assume it shows icon + text (e.g., "Facebook", "Instagram")
   - ✓ Reasonable approach

3. **Type badge color scheme uses custom hardcodes** (lines 16-20)
   - `ORGANIC: tertiary` — matches style-guide color
   - `KOL: #E60076` — Media department color (hardcoded, matches style-guide)
   - `KOC: #F54A00` — Marketing department color (hardcoded)
   - `PR: #0059B6` — Tech department color (hardcoded)
   - ✓ Intentional department coding, compliant with style-guide line 178-186

4. **Sentiment badge** (lines 22-27)
   - `positive/neutral/negative: tertiary/slate-100/error`
   - Only shown on PR tab (line 118)
   - ✓ Compliant

5. **Title cell can overflow** (line 92)
   - No max-width or truncation on title
   - Long titles force table wider or wrap
   - URL link appears below (lines 95-103)

6. **Cost column only on KOL/PR** (line 111-114)
   - Shows "—" if null
   - Uses currency (VND) but no symbol — just "1000000 VND"
   - No thousands separator in display (line 113: `toLocaleString('en-US')`)

7. **Empty state** (lines 62-69)
   - Text: "No posts yet — click Add post to start"
   - Minimal but clear
   - No icon (unlike LeadTracker)

8. **Action buttons density** (lines 129-150)
   - Edit icon (pencil) + Delete icon (trash)
   - Only shown if `canEdit` (admin or creator)
   - Icons only, no tooltip visible in code
   - Hover states: `hover:bg-slate-100` for edit, `hover:bg-error/10` for delete

9. **Table container styling**
   - `bg-white/50 backdrop-blur-md rounded-3xl shadow-sm`
   - ✓ Compliant glass card
   - Overflow scrollable on narrow viewports

## Modal/Dialog UX issues

### MediaPostDialog (media-post-dialog.tsx)

1. **No ESC key handler**
   - X button present (line 115: `onClick={onClose}`)
   - Click-outside inside form stops propagation (line 105: `onClick={(e) => e.stopPropagation()}`)
   - No keyboard escape support

2. **Focus trap missing**
   - Dialog opens with focus on form
   - Tab cycling within form — no return to trigger button on dismiss
   - Accessibility impact: screen reader users may get lost

3. **Form reset on tab/type change**
   - When user switches `type` from KOL → ORGANIC (line 122-131)
   - Cost + outlet name fields disappear (lines 206-240)
   - Conditional rendering means previous values lost if user toggles back
   - No warning on data loss

4. **Error state UI**
   - Error text appears at bottom (lines 243-244)
   - User may miss if scrolled to top of long form
   - No visual focus shift to error

5. **Loading state on submit**
   - `submitting` state sets button opacity to 0.5 (line 258: `disabled:opacity-50`)
   - Submit button text changes: "Saving…" vs "Add post"/"Update"
   - ✓ Good feedback but no spinner icon

6. **Form structure**
   - Grid layout: `grid-cols-1 md:grid-cols-2` (line 120)
   - Full-width fields: `Field label="Title" full` (line 148)
   - Layout shifts from mobile (1 col) to desktop (2 cols)
   - Risk on narrow tablets (768-1024px): 2 columns may be too cramped

7. **Input styling**
   - Inlined CSS (lines 264-280)
   - `height: 40px`, `border-radius: 12px`, `border: 1px solid rgb(226 232 240)`
   - Focus: `border-color: rgb(99 102 241)` + shadow
   - Not using Tailwind — maintenance burden if global input style changes

8. **Field component (custom)**
   - Line 285-293: simple wrapper with label
   - No validation error display per-field
   - Only form-level error (line 243)

9. **Data conversion on submit**
   - Lines 82-93: converts reach/engagement to numbers, cost to number (nullable)
   - Metadata handling (lines 76-81): builds meta object based on type
   - Risk: User enters "50k" as reach, number() returns 50 (not 50000)
   - Should validate or suggest format (e.g., "50000" or "50K")

## Filter & data freshness

### CSV Export
1. **Tab-aware export** (lines 95-100)
   - Owned → ORGANIC only
   - KOL → all (KOL + KOC) — undefined filter type (line 97)
   - PR → PR only
   - Logic: if tab is not 'kol', filter by tab name as type (line 97 ternary)

2. **Export state**
   - No visual feedback (no spinner, no count)
   - Button doesn't change state during export
   - User has no confirmation export succeeded

### Data freshness
1. **No sync indicator**
   - Unlike LeadTracker, no "Last sync" indicator
   - Table loads from useMediaPostsQuery
   - No refresh button on page
   - User can't tell if data is stale

2. **Manual CRUD only**
   - Create/edit/delete are explicit user actions
   - No background sync from external source
   - Data is application-managed (not synced from Meta, Twitter, etc.)

## Accessibility gaps

1. **Tab pills missing aria-selected**
   - Using button + active state only
   - Should have `role="tab"` + `aria-selected="true/false"`
   - Tab container should have `role="tablist"`

2. **Icon-only action buttons** (lines 131-148)
   - Edit (pencil) + Delete (trash) icons only
   - Should have aria-label: "Edit post", "Delete post"
   - Hover tooltip not present in code

3. **Empty state text lacks icon**
   - Unlike LeadTracker, no Material icon for empty state
   - Just text: "No posts yet — click Add post to start"
   - Screen readers should still read it fine

4. **Modal lacks semantic structure**
   - Dialog uses `<form>` but no `<fieldset>` for grouped fields
   - No `<legend>` for Field groups

5. **Sentiment badge accessible only on PR posts**
   - Logic in table (line 118): if type is PR, show sentiment
   - Screen reader may not announce absence of sentiment for other types

6. **Type/Platform select dropdowns not labeled**
   - Field label ("Type", "Platform") is separate from input
   - Should use `<label htmlFor="...">`

7. **Date input no pattern/validation**
   - Input type="date" (line 170) — browser-native date picker
   - Should have aria-describedby if custom validation rules exist

## Information density

### Table
- **Width:** 8-9 columns (expandable)
- **Columns on Owned:** Platform | Type | Title | Date | Reach | Engagement | Actions
- **Columns on KOL/PR:** + Cost | (+ Sentiment on PR)
- **Decision:** Table justified (social media posts are list-like, many rows expected)
- **Usability:** Title can overflow; cost/sentiment conditional columns may confuse
- **Recommendation:** Lock first 4 cols (Platform, Type, Title, Date), allow horizontal scroll for metrics

### KPI cards
- **4 cards in bento grid** (lines 120-125)
- Total Posts (highlighted), Total Reach, Total Engagement, KOL/KOC Spend
- ✓ Good hierarchy and information balance

### Dialog form
- **Complexity:** Medium
- **Fields visible on load:** 2 (Type, Platform) + 6 (Title, URL, Date, utm_campaign, Reach, Engagement)
- **Conditional fields:** 2-3 (outlet/cost appear for KOL/KOC, sentiment for PR)
- **Recommendation:** Consider wizard layout for KOL/PR posts (2-step form reduces cognitive load)

## Top 5 actionable insights

1. **Add sortable columns to table:** Implement sort state (like CampaignsTable in AdsTracker) for reach, engagement, date, cost. Reaches/engagement likely top user need for identifying viral posts.

2. **URL-encode tab state:** Use `?tab=kol` in URL. Enables deep-linking ("check out KOL posts" → share link). Current page reset on reload loses context.

3. **Add ESC key + focus trap to modal:** Both MediaPostDialog needs keyboard escape and focus management. Use focus-lock library or Radix Dialog.

4. **Validate/format numeric inputs:** Reach/engagement accept "50k" but parse as 50. Add input validation hint ("Enter numbers only, e.g., 50000") or auto-format (50k → 50000).

5. **Add data-freshness indicator:** Show "Data last updated: X minutes ago" somewhere on page (e.g., in KPI card footer or table header). Unlike lead sync, this is app-managed data, but users should know staleness.

---

**Status:** DONE
**Summary:** MediaTracker page is visually clean and follows style-guide closely. Main UX gaps are missing keyboard accessibility (ESC, focus trap), no column sorting (likely pain point for finding top posts), and missing tab deep-linking. Modal form complexity grows with type selection; conditional fields could benefit from UI refinement.
**Concerns:** Form input styling inlined (not shared); numeric input parsing doesn't handle K/M suffixes; modal form resets conditional fields if user toggles type back-and-forth (data loss UX).
