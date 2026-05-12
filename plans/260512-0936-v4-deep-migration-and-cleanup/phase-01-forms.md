# Phase 01 — Forms (Login + DailySync + WeeklyCheckin)

## Context Links

- Plan: [plan.md](./plan.md)
- Predecessor: `plans/260512-0145-ui-rebuild-v4-foundation-first/` Phase 07-08
- v3 references: `src/pages/LoginPage.tsx`, `src/pages/DailySync.tsx`, `src/pages/WeeklyCheckin.tsx`

## Overview

- Priority: P2
- Status: pending
- Goal: replace 3 v4 placeholder/v3-fallback pages with full v4 implementations using v4 form components (Input, Select, FormDialog, TabPill, etc.).

## Key Insights

- LoginPage isolated — no AppShell, simpler scope. Start here to validate auth flow under v4 visuals.
- DailySync + WeeklyCheckin share form patterns (multi-section, status select, attachments). Build a shared `<ReportFormShell>` helper if duplication > 40%.
- Existing backend endpoints + Zod validators reusable; only UI changes.

## Requirements

**Functional:**
- LoginPage v4: username + password + TOTP step + remember-me + error banner
- DailySync v4: form sections (today's work / blockers / tomorrow plan / hours), submit + edit, list of past 7 days
- WeeklyCheckin v4: section list (achievements / challenges / next week plan / mood), submit + edit, history view

**Non-functional:**
- a11y: keyboard nav, focus management on form sections, ARIA labels
- TOTP flow: same as v3 (server returns `requiresTOTP` + `tempToken`)
- No backend changes

## Architecture

```
src/pages-v4/
├── login.tsx                NEW (replaces v3 redirect)
├── daily-sync.tsx           REWRITE (currently placeholder)
└── weekly-checkin.tsx       REWRITE (currently placeholder)

src/pages-v4/_helpers/       NEW (optional shared form helpers)
└── report-form-shell.tsx    Multi-section form layout shared by DailySync + WeeklyCheckin
```

App.tsx: route `/v4/login` (new, public — bypass auth), update `/v4/daily-sync` + `/v4/checkin` to v4 (currently same path).

## Related Code Files

**Modify:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/App.tsx` (add /v4/login route, public)
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/daily-sync.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/weekly-checkin.tsx`

**Create:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/login.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/_helpers/report-form-shell.tsx` (if duplication justifies)

**Delete:** none yet (Phase 04 handles v3 delete)

## Implementation Steps

1. Build `login.tsx` — port v3 auth logic, replace UI with v4 SurfaceCard + Input + Button + Badge. TOTP flow as second step. Public route (no V4Shell wrap, full-screen centered card).
2. Update App.tsx `/v4/login` route — public, redirect to `/v4/dashboard` if already authenticated.
3. Inspect v3 DailySync.tsx — identify form sections + state shape + mutation hook.
4. Build `daily-sync.tsx` v4 with same backend hook; layout = SurfaceCard sections + Input + Select + Button.
5. Same for `weekly-checkin.tsx`.
6. Extract `ReportFormShell` if duplicate sections > 40% LOC.
7. Lint + build green.
8. Manual smoke: login flow, submit daily report, submit weekly report.

## Todo List

- [ ] LoginPage v4 (port + visual rebuild)
- [ ] /v4/login public route in App.tsx
- [ ] DailySync v4 form (replace placeholder)
- [ ] WeeklyCheckin v4 form (replace placeholder)
- [ ] ReportFormShell helper (if needed)
- [ ] Lint green + build green
- [ ] Manual flow test

## Success Criteria

- Three pages render real forms (no v3 redirects)
- Form submissions persist via existing API endpoints
- TOTP flow works end-to-end
- `npm run lint` exit 0

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Form complexity underestimated | High | Medium | Time-box per form (1d each), ship simpler then iterate |
| TOTP redirect bugs | Medium | High | Mirror v3 flow exactly, only swap visuals |
| Hooks shape changed since v3 | Low | Medium | Read existing hooks before refactor; cast `as any` if needed |

## Security Considerations

- Login: rate-limit on backend (already exists)
- TOTP: server-side validation unchanged
- No new attack surface

## Next Steps

- Unlocks Phase 02 (domain UI) and removes 3 v3 page dependencies.
- v3 routes `/daily-sync`, `/checkin`, `/login` can be deleted in Phase 04.
