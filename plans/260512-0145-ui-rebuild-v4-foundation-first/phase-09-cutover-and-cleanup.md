# Phase 09 — Cutover + Cleanup

## Context Links

- Plan overview: [plan.md](./plan.md)
- Brainstorm: `/Users/dominium/Documents/Project/SMIT-OS/plans/reports/brainstorm-260512-0145-ui-rebuild-v4-foundation-first.md` §4.1 weeks 9-10, §5 steps 4-5, §6
- PostHog monitor: `/Users/dominium/Documents/Project/SMIT-OS/scripts/posthog-ui-regression-monitor.ts`
- v3 to delete:
  - `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/` (~30 files)
  - `/Users/dominium/Documents/Project/SMIT-OS/src/pages/` (10 files)
  - `/Users/dominium/Documents/Project/SMIT-OS/src/index.css` (~405 lines)
- Project changelog: `/Users/dominium/Documents/Project/SMIT-OS/docs/project-changelog.md`
- CLAUDE.md: `/Users/dominium/Documents/Project/SMIT-OS/CLAUDE.md`

## Overview

- Date: weeks 9-10 (terminal phase)
- Priority: P1
- Status: pending
- Goal: flip default for all users to v4, monitor 7 days, then delete v3. Two sub-stages: cutover (week 9) → cleanup (week 10).

## Key Insights

- Cutover is reversible until v3 deletion. PostHog regression monitor + "Back to v3" link give 7-day safety window.
- Deletion order matters: pages first (break imports cleanly), then components (no longer imported), then `index.css` (no longer referenced).
- Notification to team 1 week before cutover per Open Question Q4 recommendation.
- Backup branch `pre-v4-rebuild` retained 3 months per Q5.

## Requirements

**Functional, week 9 (cutover):**
- Change `User.uiVersion` default from `"v3"` to `"v4"` via Prisma + `prisma db push`
- Backfill: `UPDATE users SET ui_version = 'v4'` SQL script
- Add "Back to v3" link in v4 sidebar (visible 7 days)
- PostHog regression monitor scheduled nightly
- Send team notification (1 week prior to this phase start, so countdown begins in Phase 08)

**Functional, week 10 (cleanup):**
- After 7 consecutive zero-alert days: DELETE
  - `src/components/ui/*` (~30 files)
  - `src/pages/*.tsx` (10 files)
  - `src/index.css`
  - `/v3` style routes from router
- Drop `User.uiVersion` column via second `prisma db push` (or keep + ignore — decide; recommend drop for cleanliness)
- Remove "Back to v3" sidebar link
- Update `CLAUDE.md` (tech stack note, remove v3 reference)
- Update `README.md` if needed
- Append final v4 release entry to `docs/project-changelog.md`
- Git tag `ui-v4-release`
- Note in plan only: delete `pre-v4-rebuild` branch after 3 months

**Non-functional:**
- Zero unplanned downtime
- Bundle size delta from v3 baseline ≤ +10% (success criterion)
- Lint green on entire repo (no more v3 exemption)

## Architecture

```
Week 9 — Cutover

  prisma db push  ──►  User.uiVersion default = 'v4'
  backfill SQL    ──►  all existing rows set to 'v4'
  PostHog cron    ──►  nightly UI regression monitor 7 days
  sidebar         ──►  "Back to v3" link visible

Week 10 — Cleanup (after 7 zero-alert days)

  rm src/components/ui/
  rm src/pages/
  rm src/index.css
  prune router /v3 → already none, just verify
  prisma db push ──► drop User.uiVersion column (optional)
  edit CLAUDE.md
  edit README.md
  changelog append
  git tag ui-v4-release
```

## Related Code Files

**Modify:**
- `/Users/dominium/Documents/Project/SMIT-OS/prisma/schema.prisma` — change default, then drop column at week 10
- `/Users/dominium/Documents/Project/SMIT-OS/src/App.tsx` — verify only v4 routes remain at week 10; remove root redirect flag check (always v4)
- `/Users/dominium/Documents/Project/SMIT-OS/src/main.tsx` — drop v3 `index.css` import at week 10
- `/Users/dominium/Documents/Project/SMIT-OS/src/contexts/ui-version-context.tsx` — delete at week 10 (or leave as no-op)
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/layouts/app-shell.tsx` — remove "Back to v3" link at week 10
- `/Users/dominium/Documents/Project/SMIT-OS/eslint.config.js` — drop v3 path exemption at week 10
- `/Users/dominium/Documents/Project/SMIT-OS/CLAUDE.md`
- `/Users/dominium/Documents/Project/SMIT-OS/README.md`
- `/Users/dominium/Documents/Project/SMIT-OS/docs/project-changelog.md`

**Create:**
- `/Users/dominium/Documents/Project/SMIT-OS/scripts/backfill-ui-version-v4.sql` (one-shot)
- `/Users/dominium/Documents/Project/SMIT-OS/scripts/cutover-team-notice.md` (template for team comms)

**Delete (week 10 only):**
- `/Users/dominium/Documents/Project/SMIT-OS/src/components/ui/` (entire dir, ~30 files)
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/AdsTracker.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/DailySync.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/DashboardOverview.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/LeadTracker.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/LoginPage.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/MediaTracker.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/OKRsManagement.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/Profile.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/Settings.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages/WeeklyCheckin.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/index.css`

## Implementation Steps

**Week 9 — Cutover:**

1. Send team notification (Phase 08 prerequisite check; if not sent, send now and delay by 1 week).
2. Edit `prisma/schema.prisma`: `uiVersion String @default("v4")`. Run `prisma db push`.
3. Run backfill SQL: `UPDATE users SET ui_version = 'v4';` via `psql`.
4. Add "Back to v3" link to v4 sidebar with a clear label and date "Available until [week 10 date]".
5. Schedule PostHog monitor nightly via existing `scripts/posthog-ui-regression-monitor.ts`. Confirm cron entry or launchd job.
6. Smoke: log in as fresh user → land on v4. Log in as existing user → land on v4 (backfilled). Toggle "Back to v3" → land on v3 still functional.
7. Monitor for 7 consecutive days. Track alerts daily in `plans/260512-0145-ui-rebuild-v4-foundation-first/reports/09-cutover-monitor-log.md`.

**Week 10 — Cleanup (only after 7-day zero-alert window):**

8. Final go/no-go check with user.
9. Delete `src/components/ui/` directory.
10. Delete all 10 files in `src/pages/`.
11. Delete `src/index.css`. Remove import from `src/main.tsx`.
12. Verify no orphan imports: `grep -r "from '@/components/ui" src/` → expect zero. `grep -r "from '@/pages/" src/` → expect zero.
13. Remove "Back to v3" link from `app-shell.tsx`.
14. Drop `User.uiVersion` column: edit schema, `prisma db push`. Or keep as future hedge — decide with user.
15. Delete `src/contexts/ui-version-context.tsx` (or convert to no-op).
16. Drop v3 path exemption from `eslint.config.js`. Run `npm run lint` on entire repo — expect green.
17. Update `CLAUDE.md` tech stack section (remove v3 reference).
18. Update `README.md` features/tech-stack if needed.
19. Append v4 release entry to `docs/project-changelog.md`.
20. Run `npm run build`. Verify bundle size delta vs v3 baseline ≤ +10%.
21. Git tag `ui-v4-release`. Push.
22. Note in plan only (do NOT execute yet): delete `pre-v4-rebuild` branch after 3 months.

## Todo List

**Week 9:**
- [ ] Team notification sent (1 week prior)
- [ ] Schema default → `"v4"` + db push
- [ ] Backfill SQL run
- [ ] "Back to v3" sidebar link
- [ ] PostHog monitor scheduled nightly
- [ ] Cutover smoke test
- [ ] 7-day zero-alert window achieved (or remediation cycle)

**Week 10:**
- [ ] Final go/no-go approval
- [ ] Delete `src/components/ui/`
- [ ] Delete `src/pages/*.tsx`
- [ ] Delete `src/index.css` + remove import
- [ ] Verify zero orphan imports
- [ ] Remove "Back to v3" link
- [ ] Drop `User.uiVersion` column (or document reason to keep)
- [ ] Delete `ui-version-context.tsx` (or stub)
- [ ] Drop ESLint v3 exemption, lint full repo green
- [ ] Update CLAUDE.md
- [ ] Update README.md
- [ ] Append changelog entry
- [ ] Bundle size check ≤ +10%
- [ ] Git tag `ui-v4-release`
- [ ] Record 3-month branch deletion reminder in plan

## Success Criteria

- 7 consecutive days zero PostHog regression alerts post-cutover
- Lint green on entire repo with no path exemptions
- `grep -r "from '@/components/ui'" src/` → 0 matches
- Bundle size ≤ +10% vs pre-Phase-00 baseline
- All 10 v4 pages serve as primary routes
- CLAUDE.md + README.md reflect v4-only stack
- Team-internal approval recorded before any deletion

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| PostHog alert during 7-day window | Medium | High | Pause cleanup; fix alert source; reset 7-day counter |
| User finds bug after v3 deleted | Medium | Critical | "Back to v3" link forces rollback hesitation; cleanup only after 7 zero-alert days; backup branch `pre-v4-rebuild` retained 3 months for re-cherry-pick |
| Orphan v3 import survives deletion → build fail | Medium | High | Pre-deletion grep + TS build run; fix any remaining imports |
| Drop column migration locks DB briefly | Low | Low | Run during low-traffic window |
| CLAUDE.md / README.md update missed | High | Low | Explicit checklist items above; user reviews diff |
| Bundle size > +10% | Medium | Medium | Pre-deletion bundle audit; defer optimization to follow-up plan if marginal |
| Backup branch deleted too early | Low | High | Documented as 3-month minimum; record reminder, do not execute in Phase 09 |

## Security Considerations

- Backfill SQL must run inside transaction; rollback on error.
- Dropping `User.uiVersion` column irreversible — backup snapshot before.
- Removing v3 routes must not accidentally drop auth middleware.
- Team notification template stored in plans dir, not committed credentials.

## Next Steps

- v4 is the entire UI. Plan closes.
- Handoff to ongoing maintenance: lint gate stays; any new component must follow Tier 3 token rule documented in `src/design/v4/README.md`.
- Open follow-up (not part of this plan): dark mode, mobile responsive — track separately if user requests.
