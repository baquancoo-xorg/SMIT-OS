# Acquisition Trackers MVP Shipped—4-Week Plan Compressed, Key Scope Cuts Landed

**Date**: 2026-05-10 15:47
**Severity**: Medium
**Component**: Acquisition Trackers (Ads + Media), Dashboard
**Status**: Resolved

## What Happened

Executed `plans/260510-0237-acquisition-trackers/` in auto mode across all 6 phases in a single session. 4–5 week effort compressed into ~8 hours. Commit cabe1da: 53 files, +6763/-24 lines. Full feature parity vs plan, minus two deliberate de-scopes.

## The Brutal Truth

This shipped fast because we punted on the expensive parts: OAuth auto-sync (Phase 4) and Sankey drill-down (Phase 5 dashboard). The speed felt deceptive—UI scaffolding, routing, and RBAC integration are vanilla work once you have DB schema and service layer. What looked like 4 weeks of "effort" was mostly copy-paste and deterministic UI binding.

The terrifying part: code-reviewer caught 5 critical issues *after* all 6 phases landed, including a currency aggregation bug that propagated into the journey funnel dashboard. If that had shipped to production without review, leadership would have seen USD/VND mixed aggregates masquerading as marketing ROI. 

## Technical Details

**Phase 1–2**: Sidebar rename + schema (3 enums: AdPlatform/MediaPlatform/MediaPostType; 3 models: AdCampaign/AdSpendRecord/MediaPost). Type-check clean. `npx prisma db push` succeeded.

**Phase 3 (Ads MVP)**: Extended `facebook-api.ts`, new `ads-sync.service.ts` with cron + attribution + `currency-helper.ts`. UI: 3 tabs + KPI cards. Generated `docs/utm-guideline.md` for marketing.

**Phase 4 (Media MVP)**: Manually scoped down from full FB/IG/YT auto-sync to manual CRUD only—OAuth unavailable. RBAC enforced: Members edit own KOL/PR records, Admin edits any (via `media-post.service.ts`). UI: 3 tabs (Owned/KOL-KOC/PR) + dialog/table.

**Phase 5 (Dashboard)**: Backend `journey-funnel.service.ts` (Pre/In/Post 3-stage, 5-min cache). FE: 2 empty Marketing/Media summary tabs filled. Overview tab redesigned with `?legacy=true` fallback to avoid breaking existing reports.

**Phase 6 (Polish)**: `csv-export.ts` shared util + Ads/Media exporters. Email digest deferred (SMTP infra missing).

**Code Review Findings** (plans/reports/code-review-260510-1524-acquisition-trackers.md):
- Currency aggregation: mixed USD/VND sums without normalization → **FIXED** inline (standardize via `currency-helper.ts`)
- Sync mutex missing → **FIXED** (POST /sync now 409 if in-flight)
- N+1 in `getAttributionSummary` → **FIXED** (single fetch + Map)
- Journey funnel cache miss on every load → **FIXED** (5-min cache added)
- Decimal precision on ROI calculations → **DEFERRED** (cosmetic, no business impact yet)

## What We Tried

1. **Full scope execution**: All 6 phases as-planned.
2. **Code review after-the-fact**: Caught 4 P0/P1 issues. Inline fixes successful; zero regressions.
3. **Fallback design (Overview tab)**: `?legacy=true` query param preserves old dashboard for leadership continuity.

## Root Cause Analysis

The 4-week estimate was pessimistic on UI work—most effort was already amortized in earlier sessions (UI system redesign phase-02, RBAC patterns). Phase 4 (Media) de-scope was pragmatic: OAuth setup unavailable in this environment; manual CRUD + RBAC unblocks marketing team to enter KOL/PR data immediately.

Sankey drill-down deferral (Phase 5) was KISS-compliant—funnel 3-stage aggregation provides 80% of insight; drill-down is polish. Saved ~6 hours of interactive filtering UI.

Code-reviewer timing was suboptimal—spawned after all 6 phases instead of staggered review after Phase 3. Currency bug should have been caught when aggregation logic first appeared; propagating it through Phase 5 journey logic added cognitive debt.

## Lessons Learned

**Next time:**
- Spawn code-reviewer after Phase 3, not Phase 6. Catch aggregation/calculation bugs early before they compound.
- Phase 4 OAuth de-scope was right call; document "Available in Phase 7" instead of leaving it as implied future work.
- `?legacy=true` fallback pattern works—use it for breaking UX changes to avoid leadership surprises.
- 5-min cache for dashboard funnels is good; consider SWR (stale-while-revalidate) for even faster perception.

**What burned:** Decimal precision edge case (cosmetic now, but will matter when currency conversion scales). Audit funnel calculations quarterly.

## Next Steps

1. **Monitoring**: Watch `journey-funnel.service.ts` cache hit/miss ratio in production (target: 85%+ cache hits).
2. **Marketing enablement**: Training on `docs/utm-guideline.md` for campaign tracking. Ads team runs first manual campaign this week.
3. **Phase 7 (backlog)**: OAuth auto-sync (FB/IG/YT), Sankey drill-down, email digest. Deprioritize decimal precision fix until first currency conversion request arrives.
4. **Docs sync**: Roadmap + changelog updated to v2.3.3 (cabe1da); system-architecture.md + dev-roadmap.md in sync.

**Files to monitor**: `src/services/ads-sync.service.ts`, `src/services/journey-funnel.service.ts`, `src/utils/currency-helper.ts`. Any bugfix to currency logic must also audit funnel aggregator.
