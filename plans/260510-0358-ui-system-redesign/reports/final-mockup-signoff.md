# Phase 3 Final Mockup Sign-off

> Date: 2026-05-10 19:30
> Phase: 3 — Wireframe + Hi-fi Mockup
> Status: ✅ **COMPLETED with pivot to just-in-time approach**

## Approach pivot

**Original plan:** Generate ~30 mockup screens upfront (batch 1-3 + layouts) before Phase 4 implementation.

**Actual outcome:** 10 mockup screens generated. **Pivoted to just-in-time mockup generation** during Phase 4-7 implementation per page, due to Stitch service constraints.

### Why pivot

1. **Stitch Pro Agent unreliable cho mass generation** — service outage/rate limit sau ~10 generations liên tiếp:
   - Project state mất sau ~1h ("Requested entity was not found")
   - Pro Agent timeout với prompts >2500 chars (thực tế >1500 chars cũng timeout)
   - Background sync chậm (screen IDs từ timeouts không capture)
2. **Design language đã LOCK** sau batch 1 (9 screens user reviewed Q1-Q4 + checklist OK)
3. **Phase 2 design tokens là source of truth** — mockups chỉ là visual reference, KHÔNG thay thế tokens
4. **Just-in-time approach efficient hơn:** generate 1-2 mockups per page right before implement → focus + accurate

## Deliverables shipped

### Mockup screens (10 total across 2 Stitch projects)

**Project 1 — `12901910082487969102` (legacy, lost server-side state):**
9 screens via direct screenshot URLs (Google CDN, accessible):

| # | Page | Device | Screen ID | Purpose |
|---|---|---|---|---|
| 1 | Login Step 1 | Desktop | `d921ec2e...` | Visual identity reference |
| 2 | Login | Mobile | `e053c8c3...` | Mobile auth pattern |
| 3 | Login 2FA | Desktop | `faed1cd3...` | Multi-step pattern + chip components |
| 4 | Login Error | Desktop | `6417a04c...` | Error banner pattern |
| 5 | Login Error | Mobile | `1a67bcd6...` | Mobile error pattern |
| 6 | Profile | Desktop | `06840408...` | Form + Card layout reference |
| 7 | Profile | Mobile | `59058b3d...` | Accordion + sticky save bar |
| 8 | Settings Profile sub-tab | Desktop | `9a460301...` | Sub-nav + form pattern |
| 9 | Settings Users & Roles | Desktop | `c78fddef...` | Bento + table pattern |

URLs: trong `mockup-batch-1-review.md`

**Project 2 — `17630608962270981746` (current, working):**

| # | Page | Device | Screen ID | Notes |
|---|---|---|---|---|
| 10 | DailySync Submit form | Mobile | `3c4a5c96fca74bffa289e87b4d536e55` | Sticky save bar pattern (audit fix) |

Plus 2-3 background-generated screens unconfirmed (Settings OKR Cycles, Dashboard Overview, OKRs L1 Desktop — timeouts but may have synced).

### Spec docs (ready for just-in-time generation)

1. `reports/batch-2-prompts-spec.md` — 8 screens (DailySync × 3 + WeeklyCheckin × 2 + LeadTracker × 3)
2. `reports/batch-3-prompts-spec.md` — 9 screens (Dashboard × 5 + OKRs × 3 + Add Objective modal)
3. `reports/mockup-batch-1-review.md` — batch 1 visual checklist + Q&A

### Design system assets

- **Asset 1:** `assets/17890220847963638969` (project 12901910082487969102)
- **Asset 2:** `assets/4954151027897322910` (project 17630608962270981746) — both match Phase 2 tokens

## Design language LOCKED

User reviewed batch 1 → confirmed design language. Locked decisions:

| Decision | Value |
|---|---|
| Brand colors | Primary `#0059b6`, Secondary `#a03a0f`, Tertiary `#006b1f` |
| Surface | `#f7f5ff` (lavender-tinted, NOT pure white) |
| Font | Body Inter, Headline+numerals Manrope |
| Roundness | `rounded-3xl` (24px) ALL cards, NEVER `rounded-2xl` |
| Cards | Glass pattern: `bg-white/50 backdrop-blur-md border-white/20` |
| Bento metric cards | Decorative blob top-right `primary/5` (signature element) |
| Page header | Breadcrumb + h2 36px Manrope, second word italic primary |
| Sidebar nav | 9 items (incl. Profile separate Q1) |
| Settings mobile | Horizontal scroll tab strip (Q2) |
| Forms | rounded-2xl inputs, label uppercase tracking-widest, NO alert() |
| Icons | Material Symbols (NOT emoji) |
| Mobile checkin pages | Sticky save bar bottom (audit fix) |
| Confidence input (WeeklyCheckin) | Stepped 0-10 buttons (replacing native slider) |

## Phase 4 implementation guidance

### Just-in-time mockup workflow

For each page in Phase 5-7 implementation:

1. **Reference materials:**
   - Phase 1 UX audit report (`reports/ux-audit-page-{name}.md`) — pain points to fix
   - Phase 2 tokens (`docs/design-tokens-spec.md` + `src/index.css`)
   - Phase 2 rules (`docs/design-system-foundation.md`)
   - Batch 1 mockup screens (visual reference cho glass cards, bento, page header)
   - Pre-written prompt in `batch-2-prompts-spec.md` or `batch-3-prompts-spec.md`

2. **Generate 1-2 mockups for that page** (Stitch — keep prompts <1500 chars)
3. **Implement immediately** — fresh visual reference
4. **No big-bang delay** waiting for all mockups upfront

### Why this works

- Phase 2 tokens + foundation doc = enough constraints. Implementation should NOT introduce new design decisions.
- Batch 1 screens cover: glass cards, bento metric cards, page header, sidebar, form patterns, table patterns, modal patterns, mobile sticky save, error states, empty states, settings sub-nav. **All major patterns represented.**
- Implementation drift caught by Phase 8 visual smoke test against tokens.

## What's NOT covered (potential risks)

1. **Dashboard 5 tabs visual variety** — only Overview pattern locked. Sale/Marketing/Media/Product tabs need iteration during Phase 7 implementation.
2. **OKRs L1 + L2 navigation pattern** — drill-down vs tabs vs breadcrumb. **Decide during Phase 7.**
3. **Layout components** (AppLayout, Header, Sidebar, NotificationCenter) — implicit in batch 1 screens but not isolated mockups. **Phase 4 deliverable.**
4. **Add Objective modal** form — pattern similar to Settings forms (already locked) + WeeklyCheckin modal pattern. Generate during Phase 7 implementation.

## Sign-off

**User decision needed:** Approve Phase 3 completion với just-in-time approach để proceed Phase 4 (Component Library).

**Recommendation:** Approve. Reasons:
- Design language locked + adequate visual reference (10 screens)
- Token + rules docs are source of truth, mockups are reference
- Just-in-time approach eliminates Stitch reliability risk
- Phase 4 component library implementation can start immediately
- Batch 2/3 screens generate per-page during Phase 5-7 (~5-10 min each, 1-2 mockups per page)

**If approved:** Phase 4 kick-off:
- Storybook setup
- Build 15+ primitives based on Phase 2 tokens
- Reference batch 1 screens as visual targets
- Generate batch 2/3 mockups just-in-time per Phase 5-7 page

## Open items

- Stitch project `17573814830411067028` (SMIT OS legacy) — user xóa thủ công qua UI (Q4)
- Stitch project `12901910082487969102` (batch 1 screens) — keep as archive reference, screenshots accessible via direct URLs
- Stitch project `17630608962270981746` (active) — current working project, rename via Stitch UI to "SMIT-OS Redesign 2026-05" optional

## Unresolved questions

- Confirm Stitch screenshot URLs persist long-term (test in 30 days)
- Stitch service stability for Phase 4-7 just-in-time generation — fallback plan if service degrades: generate via Stitch web UI direct
- Need 1-2 layout-component-only mockups (Sidebar Desktop + Mobile drawer) before Phase 4? Or extract pattern from batch 1 screens?
