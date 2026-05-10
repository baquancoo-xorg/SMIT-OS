# Batch 3 Prompts Spec — Dashboard + OKRs (large pages)

> Date: 2026-05-10 19:14
> Common: project=`12901910082487969102`, designSystem=`assets/17890220847963638969`.
> Reference: `audit-summary-dashboard-and-okrs.md`, `ux-audit-page-dashboard.md`, `ux-audit-page-okrs.md`.
> Note: OKRs hiện 95% style-guide compliant — keep pattern, redesign chỉ để đồng bộ Phase 2 tokens. Dashboard cần catch-up: 55 rounded-2xl violations + 32 solid white panels.

## Batch 3 plan (9 screens)

| # | Page | Device | State | Priority |
|---|---|---|---|---|
| B3-1 | Dashboard | Desktop | Overview tab (KPIs + 4 chart cards) | P1 |
| B3-2 | Dashboard | Desktop | Sale tab (lead funnel + AE leaderboard) | P1 |
| B3-3 | Dashboard | Mobile | Overview tab (responsive bento) | P1 |
| B3-4 | OKRs | Desktop | L1 view (objectives list + filters) | P1 |
| B3-5 | OKRs | Desktop | L2 view (KR detail accordion) | P1 |
| B3-6 | OKRs | Mobile | L1 view (card list) | P1 |
| B3-7 | OKRs | Modal | Add Objective form | P1 |
| B3-8 | Dashboard | Desktop | Marketing tab (campaign metrics) | P2 |
| B3-9 | Dashboard | Desktop | Media tab (KOL/PR analytics) | P2 |

---

## B3-1: Dashboard Overview Desktop

```
SMIT-OS Dashboard Overview Desktop 1280px.

App shell: Sidebar w-64 (Dashboard active), Header h-16 with breadcrumb "Dashboard".

Main p-xl surface bg #f7f5ff:

Page header: title "Dashboard" h2 36px Manrope (Dashboard italic primary). Right: cycle chip "Q2 2026" + date range picker + Export button outline.

Tabs row pill style URL-encoded: Overview (ACTIVE bg-primary text-on-primary) | Sale | Product | Marketing | Media.

KPI BENTO GRID 4 cols (2x2 mobile, 4x1 desktop) glass-cards rounded-3xl with decorative blob top-right primary/5:
1. "Quarterly OKR progress" 73% (Manrope display 60px tabular-nums) + delta +12% vs last week (success chip up arrow)
2. "Active leads" 247 (Manrope display) + delta +18 today (success)
3. "Campaign reach" 142.5K (Manrope) + delta -8% (warning chip down arrow)  
4. "Revenue closed" $48.2K (Manrope) + delta +24% (success)

Each card: label uppercase tracking-widest caption + big number h2/display Manrope tabular + delta chip status.

Below KPIs — 4 chart cards 2x2 grid glass-card rounded-3xl p-lg:

Card 1 "OKR completion trend" h5 (trend italic primary):
- Line chart 6 weeks, primary stroke, area fill primary/10
- Y-axis 0-100%, X-axis week numbers
- Hover tooltip glass

Card 2 "Department distribution" h5:
- Donut chart 5 segments dept colors (Tech blue, Marketing orange, Media pink, Sale green, BOD violet)
- Center label total OKRs + count
- Right side legend list

Card 3 "Lead funnel" h5:
- Horizontal bar chart 5 stages: New (247) → Contacted (132) → Qualified (78) → Won (32) → Lost (24)
- Each bar gradient primary
- Conversion % below each stage

Card 4 "Top performers" h5 (this week):
- List 5 rows: Avatar + Name + dept + score (Manrope tabular)
- Trophy icon next to #1
- "View all" link bottom

Glass cards pattern. Manrope numerals tabular-nums everywhere. Material Symbols. NO slate, NO rounded-2xl on cards.
```

## B3-2: Dashboard Sale tab Desktop

```
SMIT-OS Dashboard Sale Tab Desktop 1280px.

Same app shell + tabs (Sale ACTIVE).

Main p-xl:

Header: "Dashboard" h2 (Dashboard italic primary). Right: Sale dept badge chip (green) + period filter Q2 2026 + AE filter dropdown + Export.

KPI bento 4 cards (decorative blob):
1. Pipeline value $324K Manrope display + +18% chip
2. Closed-won this Q $48.2K + 32 deals chip
3. Avg deal size $1.5K + delta
4. Conversion rate 32% + +4% chip

LEAD FUNNEL big card glass-card rounded-3xl p-lg full width:
- Title "Lead conversion funnel" h4 Manrope (funnel italic primary)
- 5 horizontal stages bento style: New 247 / Contacted 132 (53%) / Qualified 78 (59%) / Won 32 (41%) / Lost 24 (avg-cost chip)
- Each stage: count Manrope tabular + conversion % below + drop-off indicator chip

2-COL grid:

LEFT: AE leaderboard glass-card rounded-3xl:
- Title "AE Leaderboard" h5 + period dropdown
- Table-like list 8 rows:
  - Rank # | Avatar + Name | Dept badge | Deals closed | Pipeline value | Conversion % | Achievement bar
- #1 trophy icon, top 3 highlighted bg-success-container/10
- Hover row bg-surface-container-low

RIGHT: Recent deals timeline glass-card:
- Title "Recent activity" h5 + filter chips (All/Won/Lost/New)
- Timeline 8 entries:
  - Avatar + actor + action + amount + time
  - "Lê V.C closed deal $2.5K — 2h ago" with success icon
  - Vertical line connecting

Bottom: 2 mini cards:
- Sales velocity: 12 days avg (Manrope tabular)
- SLA compliance: 87% on-track (success chip)

Manrope numerals. Material Symbols. Glass cards.
```

## B3-3: Dashboard Overview Mobile

```
SMIT-OS Dashboard Mobile 375px Overview.

Sticky header h-14: hamburger, "Dashboard" Manrope center, search icon + bell badge.

Below header sticky: HORIZONTAL TAB STRIP per Q2: Overview (active pill bg-primary) | Sale | Product | Marketing | Media. Pills rounded-full px-4 py-2 mr-2, scroll-x.

Bottom nav: Dashboard active.

Main scroll px-md py-md pb-24 surface #f7f5ff:

Cycle chip + date small caption row.

KPI bento 2x2 grid (NOT 4 inline) glass-cards rounded-3xl with decorative blob:
- OKR progress 73% Manrope h2 36px
- Active leads 247
- Campaign reach 142.5K
- Revenue $48.2K
Each card has compact delta chip below value.

Stack 4 chart cards full-width vertical:

Card 1 "OKR trend" h5 — line chart full width compact 6 weeks
Card 2 "Dept distribution" — donut + legend horizontal scroll
Card 3 "Lead funnel" — vertical stages 5 rows (mobile-flipped from horizontal)
Card 4 "Top performers" — list 5 rows compact

FAB bottom-right primary "Add quick log" with edit icon.

Manrope numerals tabular. Material Symbols. Touch ≥ 44px. Glass cards rounded-3xl.
```

## B3-4: OKRs L1 view Desktop

```
SMIT-OS OKRs Management Desktop 1280px L1 view.

App shell: Sidebar (OKRs active), Header.

Main p-xl surface #f7f5ff:

Page header: title "OKRs Management" h2 36px Manrope (Management italic primary). Right: cycle chip Q2 2026 + "Add Objective" primary rounded-full + "Export" secondary.

Tabs row: L1 Company (ACTIVE bg-primary text-on-primary) | L2 Department. URL-encoded.

Filter bar glass-card p-md rounded-3xl:
- Search compact + dept filter pills (BOD all/Tech/Marketing/Media/Sale) + status filter (On-track/At-risk/Off-track) + owner dropdown + clear ghost

Bento mini-cards row 4 (decorative blob primary/5):
- Total objectives 12 Manrope tabular
- On-track 8 success chip
- At-risk 3 warning chip
- Off-track 1 error chip

Objectives LIST glass-card rounded-3xl p-lg (NO table):

Each objective row glass-card nested rounded-3xl p-md:
- Top row: Number badge "01" Manrope bold + Objective title h5 font-bold + Owner avatar + dept badge + Status chip (success/warning/error)
- Progress bar full width: 73% with primary fill rounded-full + numeric label right
- Confidence row: "Confidence: 7/10" + 10 dots colored primary based on level
- KRs list (3-5 KRs) collapsed by default with chevron, each KR row:
  - Mini progress bar 50% + "KR1: Ship Acquisition tracker MVP — 50%"
  - Owner avatar mini
- Action bar bottom row: Edit icon | Add KR | Add comment (3) badge | More menu

5 objectives visible. Hover row: shadow-md transition.

Empty state if no objectives: centered icon + CTA "Create your first objective".

Glass cards. Manrope numerals tabular. Material Symbols. Department colors apply to badges.
```

## B3-5: OKRs L2 KR detail Desktop

```
SMIT-OS OKRs Management Desktop 1280px L2 view (Department level).

Same app shell + tabs (L2 ACTIVE).

Main p-xl:

Page header: "OKRs Management" h2 + dept selector chip "Tech" (with badge) + "Add KR" primary + filter chips.

Dept context strip: 5 dept tabs with counts: BOD (3) | Tech (8 ACTIVE) | Marketing (6) | Media (4) | Sale (5). Active dept border-b-2 primary.

Selected objective context card (glass-card rounded-3xl p-lg):
- "Linked to Company Objective:" caption + Objective title h6 + progress 73%
- Mini info row: Cycle Q2 / Owner BOD / Status on-track

KR LIST GRID 2 cols (1 col mobile):
Each KR card glass-card rounded-3xl p-md gap-sm:
- Header: KR number "KR-1" badge + title h6 font-bold (truncate 2 lines) + dept badge
- Progress section:
  - Big number "62%" Manrope h3 tabular center + delta vs last week chip
  - Progress bar primary fill rounded-full
  - Sub stats: Target / Current / Initial (Manrope tabular)
- Mini line chart 6 weeks trend
- Confidence row: dots 7/10 primary
- Owner + linked tasks: "Lê V.C + 3 tasks" with avatar
- Last update caption "Updated 2h ago by Lê V.C"
- Footer buttons row: View tasks | Update progress | Comment(2)

8 KR cards visible. Hover: lift shadow-md transition.

Right side panel sticky (desktop only): "KR Activity" feed glass-card with timeline 5 events.

Manrope numerals tabular. Material Symbols. Dept colors throughout.
```

## B3-6: OKRs Mobile L1 list

```
SMIT-OS OKRs Mobile 375px L1 view.

Sticky header h-14: hamburger, "OKRs" Manrope center, filter icon + add icon right.

Below header: tab strip horizontal: L1 Company (active) | L2 Dept.

Bottom nav: OKRs active.

Main scroll px-md py-md pb-24 surface #f7f5ff:

Cycle chip Q2 + filter pills row scroll-x: All/On-track/At-risk/Off-track.

Bento 2x2 mini stats: Total 12 / On-track 8 / At-risk 3 / Off-track 1. Each glass with blob.

Objectives card list (NOT table — vertical cards):

Each objective glass-card rounded-3xl p-md:
- Top: # badge + Title h6 truncate 2 lines + Status chip right
- Owner + dept badge inline
- Progress bar full + percent right Manrope tabular
- Confidence: 5 dots primary (compact 5-dot version on mobile)
- Tap = expand to show KRs inline OR navigate to detail screen
- Bottom mini: 4 KRs chip + 2 comments chip + last update time

5 objectives visible. Pull-to-refresh.

FAB add primary fixed bottom-right above nav.

Manrope numerals. Material Symbols. Glass cards. Touch ≥ 44px.
```

## B3-7: OKRs Add Objective Modal

```
SMIT-OS OKRs Add Objective Modal Desktop overlay.

Background bg-on-surface/40 backdrop-blur-sm full screen.

Modal centered max-w-2xl glass-card rounded-3xl shadow-xl p-lg max-h-[85vh] flex flex-col:

Header sticky:
- Title "Add Objective" h3 (Objective italic primary) Manrope + cycle chip "Q2 2026"
- Subtitle: "Define a new company-level OKR for this cycle" body-sm on-surface-variant
- Close X icon top-right aria-label

Body scrollable form:

Section 1 "Objective" (required):
- Label "OBJECTIVE TITLE" uppercase tracking-widest text-label
- Input rounded-2xl bg-surface-container-low px-4 py-3.5 placeholder "Ship Acquisition tracker MVP by end of Q2"
- Helper caption: "Use action verb + measurable outcome + timeline"
- Inline error state hint (NOT alert) shown when empty + submit attempt

Section 2 "Owner & Department":
- Owner: Avatar + name dropdown (search) "Nguyễn Văn A"
- Department: chip selector grid 5 options (BOD violet / Tech blue / Marketing orange / Media pink / Sale green) — single select, active=filled

Section 3 "Confidence (initial)":
- Stepped 0-10 button row (NOT slider — audit fix)
- Each btn rounded-full px-3 py-1.5, selected=bg-primary text-on-primary
- Helper: "How confident are you that this will be achieved?"

Section 4 "Key Results" (collapsible, optional during creation):
- Toggle "Add KRs now (recommended 3-5)" or "Add later"
- If on: 3 KR input rows pre-shown:
  - KR title input
  - Target metric input + unit dropdown ($, %, count, days)
  - Start value + Target value Manrope tabular inputs
  - "+ Add another KR" ghost button

Section 5 "Visibility":
- Radio: Public to org (default) / Department only / Private
- Helper caption per option

Footer sticky bg-white/50 backdrop-blur:
- Left: Save as draft text-primary ghost
- Right: Cancel ghost + "Create Objective" primary rounded-full (disabled if title empty)

Modal MUST: ESC handler, focus trap on title input on open, click-outside dismiss with confirm if dirty, mobile=full-screen variant. Glass cards. Material Symbols.
```

## B3-8: Dashboard Marketing tab Desktop

```
SMIT-OS Dashboard Marketing Tab Desktop 1280px.

Same app shell + tabs (Marketing ACTIVE).

Main p-xl:

Header: "Dashboard" + Marketing dept badge orange + period filter + campaign filter dropdown + Export.

KPI bento 4 cards (decorative blob):
- Total reach 142.5K Manrope display + delta
- Active campaigns 8 + 3 launching this week
- Cost per lead $4.20 Manrope + -12% (success)
- Engagement rate 18.7% + +2.3%

Card "Campaign performance" glass-card rounded-3xl p-lg:
- Title h4 (performance italic primary)
- Tabs internal: All | Facebook | Google | LinkedIn | TikTok
- Table glass NO divider lines:
  Columns: Campaign name | Platform badge | Spend | Impressions | CTR | Leads | CPL | Status chip
  8 rows with status colored dot
- Hover bg-surface-container-low

2-col grid:

LEFT card "Channel breakdown" h5:
- Bar chart horizontal: 5 channels with spend + ROI
- Each bar gradient orange (Marketing dept color)

RIGHT card "Top creative" h5:
- 3 thumbnails grid: image + title + CTR + engagement
- "View all creatives" link

Bottom strip: SEO/Content metrics row 4 mini cards:
- Blog views 8.2K
- Avg time 3:42
- Bounce 42%
- New backlinks 18

Manrope numerals tabular. Material Symbols.
```

## B3-9: Dashboard Media tab Desktop

```
SMIT-OS Dashboard Media Tab Desktop 1280px.

Same app shell + tabs (Media ACTIVE pink).

Main p-xl:

Header: + Media dept badge pink + period + KOL/PR/Owned filter + Export.

KPI bento 4 (with blob):
- Total impressions 2.4M Manrope display
- KOL collaborations 12 active
- PR mentions 47
- Earned media value $32K

3-col grid:

Card "KOL performance" h5:
- List 6 KOLs: Avatar + Name + Platform icons + Reach + Engagement % + Cost
- Sort by ROI

Card "Owned content" h5:
- Mini calendar this month with content dots
- Below: 4 mini posts thumbnails (image + caption truncate)

Card "PR mentions" h5:
- Timeline 6 entries: Outlet logo + Headline + Date + Sentiment chip (positive/neutral/negative)

Bottom card full width "Sentiment trend" line chart 12 weeks 3 lines (positive/neutral/negative).

Glass cards rounded-3xl. Manrope numerals. Material Symbols.
```

---

## Generation order khi Stitch recover

Priority P1 first (7 screens):
1. **B3-4 OKRs L1 Desktop** (most established pattern, validate OKRs visual works with new tokens)
2. **B3-7 Add Objective modal** (form pattern reference for other modals)
3. **B3-1 Dashboard Overview Desktop** (KPI bento + chart cards — sets dashboard tone)
4. **B3-3 Dashboard Mobile Overview** (responsive bento pattern)
5. **B3-5 OKRs L2 KR detail Desktop** (complex grid + chart per KR)
6. **B3-6 OKRs Mobile L1** (card list mobile pattern)
7. **B3-2 Dashboard Sale tab** (funnel + leaderboard pattern)

Then P2 (2 screens):
8. **B3-8 Marketing tab**
9. **B3-9 Media tab**

Total: ~45-60 phút khi Stitch healthy.

## Open questions

- Charts: Stitch generate inline SVG or image placeholder? Need to test → if SVG ok, may need recharts spec in Phase 4 implementation.
- OKRs L1 ↔ L2 navigation pattern: tab? breadcrumb? Drill-down? Confirm với user before generate.
- Dashboard Product tab — chưa có spec nhưng plan list 5 tabs. Defer until user confirms scope.
- KR confidence: stepped 10-button row (per audit fix) hay native slider? Decide khi generate.
