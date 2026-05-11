# Visual Reference Analysis — Phase 1 Brief

> Captured: 2026-05-12 02:30 (user-provided 4 reference images)
> Source images cached at: `~/.claude/image-cache/9e3f137b-2b3f-4d16-83d5-e3f71d5c4e20/{1..4}.png`

## Overall Direction

Dark-first warm aesthetic. Orange + dark brown + near-black foundation. Glassmorphic surfaces with subtle inner glow. Signature orange light/beam effect on focal interactions.

**Visual mood:** premium B2B operations dashboard with warm cinematic lighting (NOT Linear/Vercel cool minimal, NOT Apple Bento light luminous, NOT Notion warm light).

## Image 1 — Palette + Typography (canonical)

### Colors
| Hex | Role suggestion |
|---|---|
| `#FF6D29` | Primary accent / CTA / active state / brand glow |
| `#453027` | Secondary surface / warm container (popovers, callouts) |
| `#161316` | Base background (app shell) |
| `#BABABA` | Tertiary text / muted label |
| `#FFFFFF` | Primary text on dark |

Background in reference: warm orange-to-brown radial gradient (likely accent illumination, not solid).

### Typography
- **Family:** Neue Montreal
- **Weights:** Regular (400), Medium (500), Semibold (600)
- **License caution:** PP Neue Montreal is paid commercial (~$200+/team from Pangram Pangram). Free alternatives needed if license not purchased.

## Image 2 — Status Pill Taxonomy

10 status states (visual-only — semantics to confirm with user):

| State | Color hint |
|---|---|
| In progress | Cyan/teal |
| To-do | Violet |
| In Review | Amber/gold |
| Design Review | Purple |
| Rework | Red-orange |
| Done | Green |
| Not Started | Pink/rose |
| Blocked | Red |
| On Hold | Blue |
| Archived | Grey |

Visual treatment:
- Capsule (rounded-full) shape
- Glassmorphic semi-transparent fill matching state color
- Soft glow/halo effect around pill
- Icon + label horizontal layout
- On dark background

## Image 3 — Signature Effect (PROMOTED to Primary Button DNA)

Orange beam/lens flare emanating from a vertical divider inside a dark capsule button.

Technical interpretation:
- Radial gradient blur (CSS `filter: blur()` + `radial-gradient`)
- Pseudo-element `::after` with mask
- Position: ellipse at left center, brand-500 @ 55%, blur 20px

**Decision 2026-05-12 02:43:** Solid-orange primary was REJECTED by user as too loud. ALL primary buttons now share signature DNA:
- Background: `linear-gradient(90deg, bg-elevated, bg-overlay)`
- Border: `1px solid brand-500 @ 30%`
- Beam: `::after` radial blur from left, brand-500 @ 55%
- Icon: orange (`var(--color-accent)`)
- Label: white
- Hover: border brand-500 @ 60%, glow-accent-sm shadow, lift `-1px`

Variants:
| Variant | Use | Visual |
|---|---|---|
| primary | Main CTA (single label) | Signature DNA |
| primary + split | Compound CTA ("Create | Lead Tracker") | Signature DNA + vertical orange divider + secondary muted label |
| secondary | Auxiliary actions | Flat overlay surface + subtle border |
| ghost | Tertiary / dismiss | Transparent + hover overlay |
| destructive | Delete / dangerous | Solid red (`--rework`) — kept solid for urgency signaling |

KISS payoff: 1 primary visual pattern across the app. Eliminates the "is this signature special enough" decision tax.

## Image 4 — Dashboard Layout

Layout pattern:
- Left sidebar with grouped nav sections (MAIN, FEATURES, TOOLS) — collapsible groups
- Sidebar active item: subtle inner highlight + thin left accent line
- Top right: action button cluster (secondary outline + primary orange filled)
- KPI cards: dark surface, large numeric, small badge (`+8%`)
- Chart card: tabs row (Income/Expense/Saving) + bar chart
- Search bar: dark with icon, rounded-full
- Data table: checkbox column + payment ID + user with avatar
- Bottom-of-sidebar promotional card with rounded corners + accent icon

Components to extract for v4:
- `nav-section` (collapsible group)
- `nav-item` (active state with left accent)
- `kpi-card` (number + label + badge)
- `tab-pill` (chart tabs)
- `surface-card` (dark elevated)
- `chart-bar` (gradient bar)
- `promo-callout` (sidebar bottom)

## Implications for tokens.css v4

### Mode
Dark mode primary. No light fallback in Phase 1. (Open Question 1 from plan.md → flipped.)

### Color tokens (proposed 3-tier)

**Tier 1 — Primitive:**
- Orange scale: 50/100/.../900 derived from `#FF6D29` as 500
- Neutral scale: 50 (#fafafa) → 950 (#0a0a0a) anchored on `#161316` and `#BABABA`
- Warm-brown scale: anchored on `#453027`
- Status raw colors: cyan, violet, amber, purple, red-orange, green, pink, red, blue, grey

**Tier 2 — Semantic:**
- `bg-base` = neutral-950 (#161316)
- `bg-elevated` = neutral-900 (slight lift for cards)
- `bg-overlay` = neutral-800 (hover/active)
- `surface-warm` = warm-brown-700 (#453027)
- `accent` = orange-500 (#FF6D29)
- `accent-soft` = orange-500 @ 15% (background fills)
- `accent-glow` = orange-500 @ 40% with blur (signature effect)
- `text-primary` = white
- `text-secondary` = neutral-400 (#BABABA)
- `text-muted` = neutral-500 (darker grey)
- `border-default` = neutral-800 @ 60%
- Status semantic: 10 status colors mapped from raw

**Tier 3 — Component:**
- `button-primary-bg` = accent
- `button-primary-fg` = white
- `button-secondary-bg` = bg-overlay
- `card-bg` = bg-elevated
- `card-border` = border-default
- `sidebar-bg` = bg-base
- `sidebar-item-active-bg` = accent @ 8%
- `sidebar-item-active-border` = accent

### Radius scale
- `radius-pill` = 9999px (status, CTAs, search bar)
- `radius-card` = 20px (KPI/chart cards)
- `radius-input` = 12px (search, form inputs)
- `radius-callout` = 24px (sidebar promo)

### Typography scale (preserve numeric scale from v3, swap family)

### Shadow / glow scale
- `shadow-card`: subtle dark drop
- `shadow-elevated`: stronger drop for modal
- `glow-accent-sm`: orange 0 0 20px @ 30%
- `glow-accent-lg`: orange 0 0 60px @ 50% (signature)
- Status glows per color (10 variants)

## Decisions Required from User (Phase 1 gate)

### Q-A: Font licensing
Options:
1. **Buy PP Neue Montreal** ($200+/team) — exact match
2. **Inter Display** (free Google Fonts) — closest free, geometric
3. **General Sans** (free Indian Type Foundry) — very close to Neue Montreal aesthetic
4. **Plus Jakarta Sans** (free Google Fonts) — geometric, broad weights
5. **Manrope** (free Google Fonts) — already used in v2, friendly geometric

### Q-B: Dark mode confirmation
Brainstorm OQ1 had "defer dark mode" recommendation. References are all dark. Confirm flip: **dark-mode primary, no light fallback** in Phase 1.

### Q-C: Status taxonomy
Adopt all 10 states from Image 2, or subset?
- **All 10**: matches reference fully. Pages may not need all — but tokens defined.
- **Subset (core 6)**: in-progress, todo, done, blocked, on-hold, archived. Drop design-specific (design review, rework, in review, not started).
- **Match v3 + add 4**: success/warning/error/info kept, add in-progress/todo/blocked/done.

## Unresolved Questions

1. Background gradient on app shell (orange→brown radial as in Image 1) or solid `#161316`?
2. ~~Signature orange glow — global utility or scoped?~~ **resolved 2026-05-12: primary CTA + active focus + sparingly elsewhere. Promoted to primary button DNA.**
3. Glassmorphic intensity — backdrop-filter blur values?
4. Density: dashboard reference looks compact (Linear-density). Confirm or wider?
5. Charts: bar chart in Image 4 uses neutral grey bars with subtle accent. Confirm recharts theming over the v3 chromatic blue.
