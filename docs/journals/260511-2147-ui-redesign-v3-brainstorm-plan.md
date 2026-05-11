# UI System Redesign v3 Brainstorm + Plan Kickoff

**Date**: 2026-05-11 21:47
**Type**: Brainstorm + Plan Creation (NO implementation yet)
**Session ID**: 260511-2147
**Severity**: High
**Component**: UI/UX, Design System
**Status**: Completed (planning phase locked, Phase 1 ready to start)

---

## What Happened

User called for v3 redesign after v2 shipped 2026-05-10 and landed with a "nửa vời" (half-baked) feel. Session generated full 6-phase plan (947 lines, 6 phase files) with Stitch-led discovery → brand rewrite → full component + page migration.

Initial ask: 2-3 weeks. **Pushed back hard** on timeline realism. Delivered: 4-6 week plan with explicit slip policy (accept overrun, no cuts to 10 pages).

**Outputs locked**:
- Plan directory: `/plans/260511-2147-ui-redesign-v3/` (plan.md + 6 phase files)
- Key decisions table (6 rows, all locked)
- Risk register (9 risks distributed per phase, highest in P1/P2/P5)
- Validator protocol (user + 1 SMIT teammate at P1/P2/P6 gates)

---

## The Brutal Truth

**Timing is brutal.** v2 shipped 36 hours before this session started. Full-rewrite kickoff = high redo risk. But user felt the aesthetic gap acutely enough to justify scope.

**Pushing back on timeline was necessary and uncomfortable.** User initially asked "2-3 weeks" for full rewrite + Stitch discovery + brand identity + 10-page migration. Responded: "Bạn không thể có cả 3: full rewrite + 10 pages + 2-3 tuần + chất lượng wow." Delivered 4-6w estimate instead. **User accepted it.**

This is a pattern worth documenting: user responds well to realistic pushback when framed honestly, not optimistic.

---

## Technical Details

**v2 root causes (why it felt half-baked)**:
1. Aesthetic didn't deliver "wow" — Glass too light, lacking premium polish
2. Implementation drift — pages didn't apply tokens consistently (`src/index.css` Material Design 3 tokens scattered)
3. Component library incomplete — too many inline custom styles, not centralized
4. UX polish absent — no motion, micro-interactions, or attention to detail

**v3 scope is massive but defined**:
- 10 pages: Login, Dashboard (5 tabs, 38 sub-components), OKRs, DailySync, WeeklyCheckin, 4 trackers, Settings (5 sub-tabs), Profile
- Layout shell: AppLayout, Header, Sidebar, NotificationCenter, OkrCycleCountdown
- ~20 primitives in `src/components/ui/` (15 rebuild + 5 new)
- Brand identity full rewrite (logo negotiable, "SMIT" letterform retained)
- **IA rewrite allowed** — sidebar grouping, page merge/split OK (major boundary)

**Phase effort breakdown**:
- P1 (Stitch Discovery): 3d — aesthetic direction gate
- P2 (Brand + IA): 4d — design kit + wireframes (hard IA freeze)
- P3 (Tokens v3): 1w — replace Material Design 3
- P4 (Components v3): 1.5w — rebuild primitives
- P5 (Page Migration): 1.5w — 10 pages + feature flag removable
- P6 (Polish + QA): 1w — benchmark validation + docs

**Critical single points of failure flagged**:
- Stitch output quality (P1 highest risk) — mitigated by 4-5 variants per page + benchmark guard rails (Linear, Vercel, Stripe)
- IA scope creep (P2) — mitigated by hard-freeze gate + peer review
- Migration regression (P5) — 10 pages touching core layout = high test burden
- Mobile critical (P5) — DailySync + WeeklyCheckin mobile-heavy

---

## What We Tried

**Timeline negotiation**: User asked 2-3w → I modeled realistic effort (research + design + impl + test per phase) → delivered 4-6w with explicit acceptance of slip past week 6 (quality > speed).

**Stitch integration**: Debated "Stitch as inspiration vs Stitch as source of truth." Decision: Stitch best variant wins direction in P1, but **dev rebuilds** React/Tailwind components (not Stitch exports). Protects against vendor lock-in + Stitch reliability (documented issues in v2).

**Benchmark guard rails**: Added 3 external benchmarks (Linear, Vercel, Stripe) to P1 direction gate + P6 final sign-off to avoid echo-chamber validation trap.

---

## Root Cause Analysis

**Why v2 felt half-baked**:
- User's aesthetic bar raised by shipping competitors (Linear, Vercel, Stripe dashboards) — v2's Glass system looked thin by comparison
- No reuse strategy for components — pages went inline instead of using token system → inconsistency compounded
- Motion/micro-interactions absent from v2 scope — felt static by modern standards

**Why brainstorm happened 36h post-v2 ship**:
- User's appetite for "wow" was higher than initial v2 spec allowed
- v2 shipped feature-complete but not design-complete
- Rewrite risk accepted because aesthetic gap felt worse than redo risk

**Why 4-6w is realistic, not 2-3w**:
- Stitch discovery alone = 3d (not 2d) due to 4-5 variants per page × 4 page types = 20 variant sets
- Brand kit generation takes time (not a 1-day sketch)
- 10 pages × unknown component count × regression testing = 1.5w minimum
- Polish gate (benchmark comparison) = non-trivial QA burden

---

## Lessons Learned

1. **User accepts brutal honesty when backed by effort modeling.** Pushed back on 2-3w timeline with specifics ("3d for Stitch discovery alone"), user said "OK, 4-6w makes sense."

2. **Single points of failure need explicit guard rails.** Stitch reliability was a P1 issue in v2. P1 design now includes "4-5 variants per prompt" + benchmark validation to absorb Stitch variance.

3. **IA rewrite scope must be explicit in plan, not implicit.** Sidebar grouping, page merge/split capability locked as negotiable decision upfront to avoid "scope creep claims" later.

4. **Validators need early assignment.** Added "user + 1 SMIT teammate" peer check gate to P1/P2/P6 to prevent echo-chamber validation and enforce external review.

5. **Slip policy matters more than timeline.** Instead of committing 6w with hard deadline, committed "4-6w target, accept overrun if needed" — user preferred certainty over false deadline.

6. **Benchmarking is not optional for "wow" gates.** P1 and P6 both include 3-way benchmark comparison (Linear/Vercel/Stripe) scored on visual match + premium feel + motion potential. Prevents subjective aesthetic judgment.

---

## Next Steps

**Immediate (before Phase 1 starts)**:
- [ ] Lock user sign-off on plan.md (already reviewed, waiting explicit approval to start P1)
- [ ] Assign SMIT teammate peer reviewer for P1 (user: "someone from team will check")
- [ ] Create GitHub issue template for phase gates (P1 end report, P2 end report, etc.)

**Phase 1 execution (W1, D1-3)**:
- Start Stitch discovery (4-5 variants × 4 page types = 20 mockups)
- Capture 3 benchmark screenshots (Linear, Vercel, Stripe)
- Cross-page coherence matrix (which direction ranks top-2 on ≥3 of 4 pages)
- Deliver direction-winner report + user + peer sign-off by EOD 2026-05-16

**Risks to monitor**:
- Stitch reliability — have manual fallback if service unstable >24h
- All variants weak vs benchmarks — have re-prompt strategy ready
- User indecisive between 2 finalists — time-box decision to 4h
- Mobile pages (DailySync, WeeklyCheckin) — add device-specific variant checks in P5

---

## Status Reporting

**Status:** DONE

**Summary:** 
Completed 3.5h brainstorm + plan session. Generated 6-phase UI redesign v3 plan (4-6 weeks) replacing v2 Glass system via Stitch discovery → brand rewrite → full component + 10-page migration. User accepted realistic timeline (rejected initial 2-3w ask). 6 decisions locked, 9 risks documented, validator protocol defined (user + 1 SMIT peer at P1/P2/P6 gates). Phase 1 ready to start 2026-05-13.

**Concerns:** 
Redo risk present (v2 shipped 36h ago), mitigated by benchmark guard rails + peer review gates + explicit slip policy (accept overrun past 6w). No concerns about plan quality or scope clarity.

---

## Memory Candidates

**Feedback memory** (`~/.claude/projects/.../memory/`):
- User accepts brutal-honest timeline pushback when backed by effort modeling — pattern for future UI work: model assumptions, justify effort, present realistic range instead of optimistic point estimate

**Project memory**:
- v3 UI redesign in flight 2026-05-11, supersedes v2 (shipped 2026-05-10), 6-phase plan, benchmarks = Linear/Vercel/Stripe, validator = user + 1 peer, slip policy = accept overrun past 6w

---

**Plan location**: `/Users/dominium/Documents/Project/SMIT-OS/plans/260511-2147-ui-redesign-v3/`
**Phase 1 ready**: Yes, execution can start W1 D1 (2026-05-13)
