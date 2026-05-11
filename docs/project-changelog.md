---
title: "SMIT-OS Project Changelog"
description: "Significant changes, releases, and design system migrations"
date_format: ISO 8601 (YYYY-MM-DD)
---

# SMIT-OS Changelog

## 2026-05-12 — v3 UI System Release (Apple Bento)

### 🎨 BREAKING (UI, non-functional)

Full visual redesign from v2 Material Design 3 → **v3 Apple Bento Premium** ("Luminous B2B Operations" direction).

**Effort**: ~4 hours actual (vs plan estimate 4-6 weeks).

### Why

v2 Glass system shipped 2026-05-10 felt "nửa vời" (half-baked):
1. Aesthetic insufficient — Glass too light, lacked premium feel
2. Implementation drift — pages bypassed token consistency
3. Component library gaps — too much inline custom
4. Motion/micro-interactions absent

### What changed

**Design tokens** (`src/index.css`):
- Fonts: Manrope → **Hanken Grotesk** (headline + body)
- Primary blue: `#0059b6` slate → `#007aff` **Apple blue**
- Secondary: `#a03a0f` coral → `#bf5af2` **Apple purple**
- Tertiary: `#006b1f` forest → `#34c759` **Apple green**
- Surface: blue-tinted → lavender-tinted `#faf9fe`
- Shadows: slate-tinted → **chromatic blue-tinted** (signature Apple Bento depth)
- New utilities: `.bento-tile`, `.apple-gradient`
- Existing `.glass-card`/`.glass-panel` aliased to Bento internals

**UI primitives** (6 files): glass-card, kpi-card, empty-state, dropdown-menu, date-range-picker, page-header — swap glass+blur → solid white + chromatic shadow.

**Pages** (8 files): bulk swap italic title accents (`<em italic>` → `<span font-semibold>`).

**Component drift fix** (5 files): LoginPage card, spend-chart, lead-logs-tab, lead-filters-popover, Sidebar — glass → Bento.

**New docs**:
- `docs/design-tokens-spec.md` — v3 token reference
- `docs/design-system-foundation.md` — usage rules + accessibility
- `docs/ui-style-guide.md` — canonical visual implementation guide (replaces v2 deprecated)

### Migration impact

- ✅ Token NAMES preserved → ~84 existing components inherit new aesthetic automatically
- ✅ Zero functional regression
- ✅ Bundle: 64.10 kB index.js (-50 bytes vs pre-v3, from drift removal)
- ✅ Build: vite clean 2.14s
- ⚠️ Pages render new aesthetic on first reload — no rollback flag

### Direction discovery

5 directions generated via **Google Stitch MCP** (`mcp__stitch__*` tools):
1. Glass Aurora (dark Command Center)
2. **Bento 3D Apple Premium** ← WINNER
3. Linear Editorial Minimalist
4. Dark Cyberpunk Neon
5. Stripe Premium SaaS

Decision validator: single user gut feel (benchmark guard removed per 2026-05-11 user decision — Linear screenshots kept as inspiration reference only).

### Plan reference

- Brainstorm: `plans/reports/brainstorm-260511-2147-ui-system-redesign-v3-stitch-full-rewrite.md`
- Plan + 6 phase files: `plans/260511-2147-ui-redesign-v3/`
- Phase deliverables: `plans/260511-2147-ui-redesign-v3/reports/`
- Stitch generated assets (logos, wireframes, mockups): `plans/260511-2147-ui-redesign-v3/reports/stitch-variants/` + `reports/wireframes/`

### Supersedes

Plan 260510-0358-ui-system-redesign (v2 Glass Material Design 3, shipped 2026-05-10, deemed insufficient).

---

## 2026-05-11 — Reports admin approval comment + Daily sync UX

- Reports: require admin approval comment workflow
- Daily sync UX fixes (commit `1ba0a23`)

---

## 2026-05-11 — JWT session extension

- Extended JWT session to 24h with 8h sliding refresh (commit `68d94d5`)

---

## 2026-05-11 — UI v2 namespace flattening

- Dashboard, lead-tracker, OKR, settings pages aligned with flattened v2 imports (commit `803730d`)
- All `/v2/` directory paths removed
- 132 files changed in namespace flatten cascade
- Bundle -8.2 kB total (-11.4%) vs pre-cascade

---

## 2026-05-10 — v2 UI System Foundation (Glass Material Design 3)

### Initial v2 shipped

8-phase plan completed in 1 day via JIT pivot + pragmatic shell-first strategy:
- Phase 1: 14 UX audit reports
- Phase 2: 70+ design tokens (`src/index.css` + 2 docs)
- Phase 3: 10 mockup screens (Stitch AI)
- Phase 4: 25 v2 components (atoms + molecules + organisms + layout) + Storybook
- Phase 5-7: 10 pages migrated (LoginPage / Profile / Settings / DailySync / WeeklyCheckin / LeadTracker / MediaTracker / AdsTracker / Dashboard / OKRs)
- Phase 8: default flip + docs

Cumulative LOC shipped: ~3000+ LOC v2 (page shells + components + helpers + docs).

**Deemed insufficient** within 24 hours — see 2026-05-12 v3 entry.

---

## 2026-05-09 — Codebase cleanup + security audit

- Various security audit fixes
- Dev daemon setup (LaunchAgent `com.smitos.dev` auto-start on login)
- Cloudflare tunnel setup (qdashboard.smitbox.com → localhost:3000)

---

## Historical baseline (before changelog start)

Prior to 2026-05-09, project changes tracked via git log only. Migration to changelog format started Phase 2 of v2 plan.
