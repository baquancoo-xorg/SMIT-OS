# Batch 2 Prompts Spec — DailySync + WeeklyCheckin + LeadTracker

> Date: 2026-05-10 19:14
> Purpose: Prompts ready để generate khi Stitch service recover. Mỗi prompt ~1500 chars (tránh timeout).
> Common: project=`12901910082487969102`, designSystem=`assets/17890220847963638969`.
> Reference: UX audit reports trong `reports/ux-audit-page-*.md` để fix pain points đã liệt kê.

## Batch 2 plan (8 screens)

| # | Page | Device | State | Priority |
|---|---|---|---|---|
| B2-1 | DailySync | Desktop | List + form panel split view | P1 |
| B2-2 | DailySync | Mobile | Form sticky save bar (fix #6 audit) | P1 |
| B2-3 | DailySync | Mobile | Empty state | P2 |
| B2-4 | WeeklyCheckin | Desktop | Modal form (5 KR blocks) | P1 |
| B2-5 | WeeklyCheckin | Mobile | Form full-screen + better confidence input | P1 |
| B2-6 | LeadTracker | Desktop | Logs tab (table + filters + bulk) | P1 |
| B2-7 | LeadTracker | Mobile | Card list (NO table) | P1 |
| B2-8 | LeadTracker | Desktop | Lead detail modal | P2 |

---

## B2-1: DailySync Desktop default

```
SMIT-OS DailySync Page Desktop 1280px.

App shell: Sidebar w-64 (Daily Sync active item), Header h-16 with breadcrumb "Reports / Daily Sync".

Main p-xl, surface bg #f7f5ff:

Page header: title "Daily Sync" h2 36px Manrope (Sync italic primary). Right: "New report" primary rounded-full + Date filter pill.

Layout 2-col grid gap-xl (60/40 split):

LEFT col — Today's reports list glass-card rounded-3xl p-lg:
- Section header: "Today" h5 + count chip "12 reports"
- Filter bar: dept pills (BOD, Tech, Marketing, Media, Sale), search compact
- Report list 5 items, each glass row p-md hover bg-surface-container-low:
  - Avatar + Name (Manrope semibold) + dept badge color + time submitted (caption)
  - Body preview 2 lines truncated body-sm
  - Bottom: 3 chips inline "Today completed: 4 tasks", "Tomorrow: 3 tasks", "Blockers: 1 (warning chip)"
  - Right: chevron_right icon + status dot
- Pagination: Showing 5 of 12

RIGHT col — Submit form panel glass-card rounded-3xl p-lg sticky:
- Title: "Submit your report" h5 (report italic primary)
- Date input rounded-2xl (today auto-filled)
- 3 section blocks vertical:
  - "Today completed" textarea h-24 with placeholder
  - "Tomorrow plan" textarea h-24
  - "Blockers" textarea h-20
- Help text body-sm: "Auto-saved every 30s. Last saved 12s ago." (autosave indicator)
- Buttons: Cancel ghost + Submit report primary rounded-full (disabled state if all blank)

Glass cards. Material Symbols. Manrope numerals. Field labels uppercase tracking-widest.
```

## B2-2: DailySync Mobile form (sticky save)

```
SMIT-OS DailySync Mobile 375px — Submit form.

Sticky header h-14 bg-white/70 blur: arrow_back, "Submit Daily Sync" Manrope center, more_vert.

Bottom nav fixed h-16: Dashboard, OKRs, Daily Sync (active), More, Profile.

Main scroll px-md py-md pb-32 (clear sticky save bar + nav) surface #f7f5ff:

Compact header: Date chip (today auto) + autosave status caption "Auto-saved 12s ago" with check icon

Form vertical full-width:

Card "Today completed" glass-card rounded-3xl p-md:
- Title h6 + counter 0/3 (suggest 3 items) caption
- Textarea full-width rounded-2xl bg-surface-container-low min-h-32 placeholder "What did you accomplish today?"
- Tip caption: "Be specific — 1 line per task"

Card "Tomorrow plan" glass-card:
- Textarea full-width min-h-32 placeholder "What will you focus on tomorrow?"

Card "Blockers" glass-card:
- Textarea min-h-24 placeholder "Anything blocking? (optional)"
- Toggle switch "I have no blockers today" ON state

STICKY SAVE BAR fixed bottom-16 (above nav) bg-white/70 backdrop-blur-xl border-t border-white/20 px-md py-3:
- Stack 2 buttons: "Submit report" primary full rounded-full min-h-12 + "Save draft" ghost text-primary

Touch targets ≥ 44px. Material Symbols. iOS-keyboard-aware (textarea focus does not zoom).
```

## B2-3: DailySync Mobile Empty state

```
SMIT-OS DailySync Mobile 375px — Empty state (no reports yet).

Sticky header h-14 + bottom nav (Daily Sync active).

Main centered px-md py-2xl surface #f7f5ff:

Page mini-header: "Daily Sync" h4 (Sync italic primary).

EmptyState centered card glass-card rounded-3xl p-xl gap-md:
- Material icon 64px text-primary "edit_note" centered
- Title: "No reports yet" h5 font-bold center
- Description: "Submit your first daily sync to keep your team in the loop. It only takes 2 minutes." body-sm on-surface-variant text-center max-w-xs
- Primary CTA "Submit your first report" rounded-full bg-primary py-3 px-6 with arrow_forward icon
- Secondary subtle: "Watch 30s tutorial" text-primary text-body-sm with play_circle icon

Below empty card: 3 mini-tips horizontal scroll:
- "Be specific" + lightbulb icon
- "Note blockers early" + flag icon
- "Auto-saved" + cloud_done icon

Bottom nav.
```

## B2-4: WeeklyCheckin Desktop modal form

```
SMIT-OS Weekly Checkin Modal Desktop overlay.

Background: app dimmed bg-on-surface/40 backdrop-blur-sm full screen.

Modal centered max-w-3xl glass-card rounded-3xl shadow-xl p-lg max-h-[85vh] flex flex-col:

Header sticky: 
- Title "Weekly Checkin" h3 (Checkin italic primary) Manrope + week chip "Week 19 — May 5-11"
- Close X icon button top-right text-on-surface-variant aria-label "Close"

Body scrollable:
- Hint: "Update progress on your 5 KRs for this week" body-sm on-surface-variant
- 5 KR blocks vertical gap-md, each glass-card rounded-3xl p-md:
  - Label "KR 1" caption tracking-widest + dept badge (Tech blue)
  - KR title h6 font-bold "Ship Acquisition tracker MVP"
  - Confidence section: 
    - Label "Confidence (0-10)" uppercase tracking-widest text-label
    - Stepped buttons row 0-10 (NOT slider per audit fix) — each btn rounded-full px-3 py-1.5 outline, selected = bg-primary text-on-primary. Current value highlighted.
    - Or input numeric + slider parallel
  - "What did you achieve this week?" textarea rounded-2xl min-h-20
  - "Blockers / risks" textarea rounded-2xl min-h-16
- Add priority section: glass-card outlined dashed
  - "+ Add weekly priority" ghost button with add icon
- Submitted summary if any (not first time)

Footer sticky bg-white/50 backdrop-blur-md:
- Left: autosave status "Auto-saved 30s ago"
- Right: "Cancel" ghost + "Submit checkin" primary rounded-full

Glass cards. Material Symbols. Manrope numerals. Replace native slider with stepped 0-10 buttons (audit fix).
```

## B2-5: WeeklyCheckin Mobile form

```
SMIT-OS WeeklyCheckin Mobile 375px form full-screen (NOT modal).

Sticky header h-14: arrow_back, "Weekly Checkin" Manrope center, save icon top-right.

Below header sticky: progress strip — "Week 19 of 26" + bar 73% width primary fill rounded-full + autosave caption.

Bottom nav: More active.

Main scroll px-md py-md pb-32 surface #f7f5ff:

Section "5 Key Results" h5 + subtitle.

5 KR cards stacked, each glass-card rounded-3xl p-md gap-sm:
- Top: KR badge + dept color border-l-4
- KR title h6 font-bold (truncate 2 lines)
- Confidence input row (FIX from audit — replace slider):
  - Label + current value chip "7" prominent Manrope tabular
  - Row of stepped buttons 0-10 horizontal scroll, each rounded-full px-3 py-2 (44px touch) outline, active=bg-primary
  - OR  text input numeric inline + +/- buttons
- "Achievements this week" textarea full-width rounded-2xl min-h-20
- "Blockers" textarea optional collapsed by default with chevron

Add priority button at bottom: ghost rounded-full text-primary "+ Add priority for this week"

STICKY FOOTER bottom (above nav): bg-white/70 backdrop-blur-xl border-t px-md py-3:
- Submit checkin primary full rounded-full min-h-12 + Save draft ghost

Touch ≥ 44px. Manrope numerals. Material Symbols.
```

## B2-6: LeadTracker Desktop Logs tab

```
SMIT-OS Lead Tracker Desktop 1280px — Logs tab active.

App shell: Sidebar (Lead Tracker active), Header.

Main p-xl surface #f7f5ff:

Page header: title "Lead Tracker" h2 36px Manrope (Tracker italic primary). Right: "Sync from CRM" secondary outline + "Add log" primary rounded-full + bulk action menu.

Tabs row pill style: Logs (ACTIVE bg-primary text-on-primary) + CRM Stats. URL-encoded ?tab=logs.

Filter bar glass-card p-md rounded-3xl:
- Search compact + date range picker + status dropdown (all/new/contacted/qualified/won/lost) + AE filter + source filter + clear ghost

Bento mini-cards row (decorative blob primary/5):
- Total leads 247 (Manrope tabular)
- New 24h 18 success chip
- Pending action 7 warning
- Conversion 32% with trend up arrow tertiary

Bulk action bar (visible when rows selected, sticky top of table): "3 selected" + Edit / Assign / Export / Delete buttons.

Data TABLE glass-card rounded-3xl with sticky header (NO divider lines, hover bg-surface-container-low):
Columns sortable (icon arrows): Checkbox | Customer name + email | Status chip | AE assigned | Source badge | Last action | SLA chip | Actions

Rows 8 sample:
1. checked Phạm V.A | phamva@... | Qualified (chip success-container) | Lê Văn C (Sale) | Facebook (badge) | 2h ago | On-track | edit + more_vert
2. Trần T.B | ... | New (chip primary-container) | unassigned warning | Webinar | 12h ago | Overdue +2h (chip error) | actions
3. ... etc through 8 rows
- Color coded SLA chips: success (on-track), warning (due soon), error (overdue)

Footer pagination "1 of 31 pages" + page size dropdown.

Empty state if no leads: centered card with people_outline icon + "No leads yet" + "Sync your CRM to get started" CTA.
```

## B2-7: LeadTracker Mobile (card list)

```
SMIT-OS Lead Tracker Mobile 375px Logs tab.

Sticky header h-14: arrow_back, "Leads" Manrope, search icon + filter icon right.

Below: HORIZONTAL TAB STRIP per Q2 pattern: Logs (active) | Stats. Pill rounded-full.

Bottom nav: More active.

Main scroll px-md py-md pb-24 surface #f7f5ff:

Filter chips row scroll-x: All status, New, Contacted, Qualified, Won (each pill, tap = filter).

Stats row 2x2 mini bento: Total 247, New 18 (success chip), Pending 7 (warning), Conv 32%. Each card with decorative blob.

Add lead FAB bottom-right primary rounded-full shadow-lg with add icon, position fixed above bottom nav.

Lead cards list (NO table — cards on mobile):
Each card glass-card rounded-3xl p-md:
- Top row: Avatar + Name h6 font-bold + status chip right
- Email caption truncate
- Bottom row: AE name with avatar mini + Source badge + Last action time caption
- SLA indicator: small bar at top-left of card (success/warning/error color)
- Tap card = expand to detail panel slide-up modal (or navigate to detail page)
- Long-press = bulk select mode

8 cards visible. Pull-to-refresh hint at top.

Empty state same pattern: people_outline + CTA.

Material Symbols. Manrope numerals. Touch ≥ 44px.
```

## B2-8: LeadTracker Lead Detail Modal

```
SMIT-OS Lead Detail Modal Desktop overlay.

Background bg-on-surface/40 backdrop-blur-sm full screen.

Modal slide-in right side panel max-w-2xl h-screen bg-white rounded-l-3xl shadow-xl p-lg flex flex-col:

Header sticky:
- Avatar 56px + Customer name h4 font-bold + email caption
- Status chip prominent + dept badge
- Close X icon top-right aria-label "Close"

Body scrollable:

Card "Contact info" glass-card p-md:
- Phone, Email, Company (with edit icons inline)
- Location + Source badge

Card "Lead journey" glass-card:
- Timeline vertical: events with date + actor + action
  - "Created 2 days ago by Sync from CRM"
  - "Contacted 1 day ago by Lê Văn C"
  - "Qualified 12h ago by Lê Văn C"
- Each event with icon + indent + date

Card "Activity log" expandable glass-card:
- Filter pills: Calls, Emails, Notes, All
- 5 entries with type icon + content + timestamp

Card "Quick actions" glass-card:
- Buttons grid 2x2: Log call (primary), Log email, Add note, Schedule follow-up

Footer sticky:
- Last sync indicator caption
- Buttons: Edit lead secondary + Convert to deal primary

Modal MUST: ESC handler, focus trap, click-outside dismiss, mobile=full-screen variant.
```

---

## Generation order khi Stitch recover

1. Start với **B2-2 DailySync Mobile** (mobile-critical fix, demonstrates sticky save pattern)
2. **B2-1 DailySync Desktop** (split layout pattern)
3. **B2-5 WeeklyCheckin Mobile** (stepped button slider replacement)
4. **B2-4 WeeklyCheckin Desktop modal**
5. **B2-6 LeadTracker Desktop Logs** (most complex table)
6. **B2-7 LeadTracker Mobile** (card list pattern Q2-style)
7. **B2-8 Lead Detail modal** (slide-in side panel pattern, reuse cho other modals)
8. **B2-3 DailySync Empty state** (last, low priority)

Total estimated: ~30-45 phút khi Stitch healthy.

## Unresolved questions

- Stitch service current status — wait for recovery
- B2-5: stepped button approach (0-10 buttons) vs improved native slider — quyết định lúc generate
- LeadTracker bulk action UX trên mobile — long-press pattern OK? Hoặc explicit "Select" button at top?
