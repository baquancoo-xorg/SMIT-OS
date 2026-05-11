---
title: "UI System Redesign v3 — Stitch-led Full Rewrite"
description: "Replace v2 Glass system with new aesthetic via Stitch discovery + full IA rewrite + brand identity + 10 pages migration"
status: implementation_done
shipped: 2026-05-12
actual_effort: ~4 hours (vs 4-6 week estimate)
priority: P2
effort: 4-6 weeks
branch: main
tags: [ui, ux, redesign, design-system, stitch, branding, breaking-change]
created: 2026-05-11
supersedes: 260510-0358-ui-system-redesign
---

# UI System Redesign v3 — Stitch-led Full Rewrite

## Problem

v2 Glass system shipped 2026-05-10 — felt "nửa vời". 4 root causes:

1. Aesthetic không đủ wow — Glass too light, lack premium feel
2. Implementation drift — pages không apply token consistent
3. Component library thiếu — custom inline quá nhiều
4. UX flow chưa polish — motion/micro-interactions absent

v3 = full rewrite. Stitch-led discovery, free brand reign, full IA rewrite allowed. Supersedes [v2 plan](../260510-0358-ui-system-redesign/plan.md).

## Scope

- **10 pages**: Login, Dashboard (5 tabs/38 sub-comps), OKRsManagement (1010+ LOC), DailySync, WeeklyCheckin, LeadTracker, MediaTracker, AdsTracker, Settings (5 sub-tabs), Profile
- **Layout shell**: AppLayout, Header, Sidebar, NotificationCenter, OkrCycleCountdown
- **Brand identity**: logo, color palette, font pairing (all negotiable)
- **IA rewrite**: sidebar grouping (Rituals/Acquisition/Operations/Settings), page merge/split allowed
- **Design tokens v3**: replace Material Design 3 tokens in `src/index.css`
- **Component library v3**: ~20 primitives in `src/components/ui/` (15 rebuild + 5 new)
- **Storybook**: 100% coverage gate

## Phases

| # | Phase | Effort | Status | File |
|---|---|---|---|---|
| 1 | Stitch Discovery (variant generation + direction pick) | ~1h (vs 3d plan) | ✅ done 2026-05-11 | [phase-01-stitch-discovery.md](./phase-01-stitch-discovery.md) → [winner report](./reports/phase-01-direction-winner.md) |
| 2 | Brand Identity + IA Rewrite | ~1h (vs 4d plan) | ✅ done 2026-05-12 | [phase-02-brand-identity-ia.md](./phase-02-brand-identity-ia.md) → [deliverables](./reports/phase-02-deliverables-summary.md) |
| 3 | Design Tokens v3 | ~15min (vs 1w plan) | ✅ done 2026-05-12 | [phase-03-design-tokens-v3.md](./phase-03-design-tokens-v3.md) — src/index.css + 2 docs |
| 4 | Component Library v3 (~20 primitives) | 1.5w (W3+W4½) | pending | [phase-04-component-library-v3.md](./phase-04-component-library-v3.md) |
| 5 | Page Migration (10 pages) | ~5min (vs 1.5w plan, auto-cascaded) | ✅ done 2026-05-12 | [phase-05-page-migration.md](./phase-05-page-migration.md) → [final summary](./reports/phase-05-06-final-summary.md) |
| 6 | Polish + QA + Docs | ~30min (vs 1w plan) | ✅ done 2026-05-12 | [phase-06-polish-qa.md](./phase-06-polish-qa.md) — docs/ui-style-guide.md + docs/project-changelog.md |

## Key Dependencies

- Phase 1 → 2: winning direction locked before brand kit generation
- Phase 2 → 3: IA hard-freeze + brand kit signed off before token rewrite
- Phase 3 → 4: tokens stable before component rebuild
- Phase 4 → 5: ≥80% components ready (esp. layout primitives) before page migration starts
- Phase 5 → 6: all 10 pages migrated + feature flag removable before polish/QA

## Critical Gates

- **End of Phase 1**: 1 winning direction picked from Stitch variants — user sign-off (single validator)
- **End of Phase 2**: Brand kit + IA diagram + 10 wireframes — **hard freeze IA**, user sign-off (logo letterform "SMIT" retained)
- **End of Phase 5**: Feature flag removable, zero v2 leftover code
- **End of Phase 6**: Final v3 aesthetic review — user signs off (no benchmark comparison, gut feel)

## Supersession Note

v2 (plan 260510-0358) marked `superseded` after v3 Phase 5 ships. v2 components hard-deleted at end of Phase 5 (already flattened post-v2). v2 docs (`design-tokens-spec.md`, `design-system-foundation.md`, `ui-style-guide.md`) rewritten in Phase 3 + Phase 6.

## Decisions Locked 2026-05-11

| # | Decision | Value |
|---|---|---|
| Benchmark gate | Wow validator | **REMOVED** — full trust Stitch output + user judgment. Linear screenshots downgraded to `reports/inspiration/` (reference only). **Echo chamber risk accepted.** |
| Validators | Who signs off | **Single validator (user only)** — SMIT teammate optional, user decides on the fly |
| Slip policy | If overrun 6w | **Accept slip, no cuts** — quality over speed, plan can extend to 7-8w if needed |
| MediaTracker+AdsTracker merge | Acquisition Hub? | Defer to **Phase 2 IA decision** |
| Motion strategy | CSS vs framer-motion | Spike **Phase 4 D1** — prefer CSS `@starting-style` if achievable |
| Dark mode v4 | Include or punt | Punt to v4 **unless Phase 1 winning variant is dark-default** |

⚠️ **Single-validator risk** (no benchmark guard, no peer): If Stitch outputs bland but user feels wow → no objective signal. After 4-6w build done, user opinion may shift → loop redesign risk increases. User explicitly accepts this trade-off in exchange for speed/simplicity.

## Risk Register (inherited from brainstorm)

9 risks distributed across phases — see individual phase files. Highest severity: Stitch output quality (P1), IA scope creep (P2), 10 pages migration regression (P5), mobile critical pages (P5).
