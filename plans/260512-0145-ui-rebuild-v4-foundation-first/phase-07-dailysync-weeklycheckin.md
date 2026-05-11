# Phase 07 — DailySync + WeeklyCheckin

## Context Links

- Plan overview: [plan.md](./plan.md)
- Brainstorm: `/Users/dominium/Documents/Project/SMIT-OS/plans/reports/brainstorm-260512-0145-ui-rebuild-v4-foundation-first.md` §4.1 week 7
- v3 sources: `/Users/dominium/Documents/Project/SMIT-OS/src/pages/DailySync.tsx`, `/Users/dominium/Documents/Project/SMIT-OS/src/pages/WeeklyCheckin.tsx`
- v4 components: `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/index.ts`

## Overview

- Date: week 7
- Priority: P1
- Status: pending
- Goal: rebuild the two cadence pages. These are form-heavy (people submit updates) and stress `form-dialog` + `input` + `date-picker` + textarea.

## Key Insights

- Cadence pages are read regularly by team → highest exposure for visual feedback. Phase 07 is also the natural moment to widen the tester pool from 1-2 to 4-5.
- DailySync repeats daily → must load fast; consider initial-data hint via SSR or prefetch (out-of-scope detail; if v3 doesn't, v4 won't either).
- WeeklyCheckin includes aggregate views per team member → exercises summary KPI cards + list patterns.
- Textarea is not in batch 1+2 explicit list. Check if v4 `input` covers `as="textarea"` via prop. If not, add `textarea.tsx` component (return to Phase 03 extension).

## Requirements

**Functional:**
- `src/pages-v4/daily-sync.tsx` — match v3 feature set
- `src/pages-v4/weekly-checkin.tsx` — match v3 feature set
- Routes `/v4/daily-sync`, `/v4/weekly-checkin`
- Form submission reuses v3 endpoints + zod schemas unchanged
- 2 git tags

**Non-functional:**
- a11y: form errors announced to screen reader (aria-live)
- Mobile not required (out-of-scope) but layout must not crash on narrow viewport
- Lint green; files < 200 lines

## Architecture

```
src/pages-v4/
├── daily-sync.tsx
├── daily-sync/
│   ├── daily-sync-form.tsx
│   ├── daily-sync-history.tsx       (past entries list)
│   └── daily-sync-summary.tsx       (today vs yesterday KPI strip)
├── weekly-checkin.tsx
└── weekly-checkin/
    ├── weekly-checkin-form.tsx
    ├── weekly-checkin-team-view.tsx (aggregate by member)
    └── weekly-checkin-history.tsx
```

If textarea missing from v4: add `src/design/v4/components/textarea.tsx` (logged as Phase 03 extension).

## Related Code Files

**Modify:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/App.tsx` — add 2 routes
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/layouts/nav-items.ts` — add 2 entries
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/index.ts` (if textarea added) — export

**Create:** 8 files under `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/`
- `daily-sync.tsx` + 3 in `daily-sync/`
- `weekly-checkin.tsx` + 3 in `weekly-checkin/`
- `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/components/textarea.tsx` (if needed)

**Delete:** none

## Implementation Steps

1. Audit v3 DailySync. Check for textarea usage.
2. If textarea needed in v4: build `textarea.tsx` (< 200 lines), add Tier 3 tokens to `tokens.css`, export from barrel. This is a Phase 03 extension — note in commit.
3. Build `daily-sync.tsx` shell + 3 subfiles.
4. Mount route `/v4/daily-sync`. Smoke checklist.
5. Tag `ui-v4-page-daily-sync`.
6. Audit v3 WeeklyCheckin.
7. Build `weekly-checkin.tsx` + 3 subfiles.
8. Mount route `/v4/weekly-checkin`. Smoke checklist.
9. Tag `ui-v4-page-weekly-checkin`.
10. Broaden tester pool to 4-5 internal users. Collect feedback.
11. Append entries to `docs/project-changelog.md`.

## Todo List

- [ ] Check textarea need; build if missing
- [ ] `daily-sync.tsx` + 3 subfiles
- [ ] Route mount + smoke
- [ ] Tag `ui-v4-page-daily-sync`
- [ ] `weekly-checkin.tsx` + 3 subfiles
- [ ] Route mount + smoke
- [ ] Tag `ui-v4-page-weekly-checkin`
- [ ] Broaden tester pool to 4-5 users
- [ ] Append changelog entries

## Success Criteria

- 2 pages render with full v3 fidelity
- Form submission round-trip works on both pages
- 2 tags pushed
- All files < 200 lines, lint green
- 4-5 testers report no blocking issues

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Textarea missing → scope creep into Phase 03 | High | Low | Pre-built in Phase 03 if anticipated; if not, build inline as documented extension |
| Form error announcements not a11y-compliant | Medium | Medium | Use `aria-live="polite"` on error region; verify with VoiceOver |
| WeeklyCheckin team aggregate slow | Medium | Low | Reuse v3 query (presumed indexed); if slow in v3, document but don't fix |
| Cadence interruption: team uses page daily | High | Medium | Flag still defaults v3; testers opt-in; production unaffected |
| Auto-save behavior diverges v3 ↔ v4 | Medium | Low | Reuse same hook; if v3 has none, v4 has none |

## Security Considerations

- DailySync entries are personal — UI must respect ownership (server enforced; verify v3 GET filters by user).
- WeeklyCheckin team view may show others' updates — must respect existing auth scope; do not expand v4-side.
- Textarea HTML escaping handled by React JSX — no `dangerouslySetInnerHTML`.

## Next Steps

- 8 pages rebuilt. Remaining: Settings, Profile, Login (Phase 08).
- Handoff: 2 tags + broadened tester feedback summary.
