# Phase 08 — Settings + Profile + LoginPage

## Context Links

- Plan overview: [plan.md](./plan.md)
- Brainstorm: `/Users/dominium/Documents/Project/SMIT-OS/plans/reports/brainstorm-260512-0145-ui-rebuild-v4-foundation-first.md` §4.1 week 8
- v3 sources:
  - `/Users/dominium/Documents/Project/SMIT-OS/src/pages/Settings.tsx` (already modified in Phase 04 for UI Version toggle)
  - `/Users/dominium/Documents/Project/SMIT-OS/src/pages/Profile.tsx`
  - `/Users/dominium/Documents/Project/SMIT-OS/src/pages/LoginPage.tsx`
- v4 components: `/Users/dominium/Documents/Project/SMIT-OS/src/design/v4/index.ts`

## Overview

- Date: week 8
- Priority: P2 (low-complexity, used as schedule buffer)
- Status: pending
- Goal: rebuild remaining three lighter pages. Settings + Profile follow CRUD pattern. LoginPage is the only public route — must NOT depend on `useUIVersion()` (no user yet).

## Key Insights

- LoginPage runs pre-auth → no `User.uiVersion` available. Must use a different rule: detect by URL prefix (`/v4/login` vs `/login`) and persist preference via localStorage as a temporary signal until login completes.
- Or simpler: LoginPage v4 only ships at `/v4/login`. Default `/login` is still v3 until cutover. Phase 09 redirects `/login` → `/v4/login` at cutover.
- Settings was partly modified in Phase 04 (UI Version toggle) — Phase 08 rebuilds the rest. Be careful not to regress the toggle.
- Profile is mostly read-only with edit modes — exercises `form-dialog` + `input`.

## Requirements

**Functional:**
- `src/pages-v4/settings.tsx` — match v3 Settings feature set including the Phase-04 UI Version toggle
- `src/pages-v4/profile.tsx` — match v3 Profile (view + edit)
- `src/pages-v4/login.tsx` — match v3 Login (form + error states)
- Routes: `/v4/settings`, `/v4/profile`, `/v4/login`
- 3 git tags

**Non-functional:**
- LoginPage no user context dependency
- a11y: form labels associated, submit button keyboard-accessible
- Lint green; files < 200 lines

## Architecture

```
src/pages-v4/
├── settings.tsx
├── settings/
│   ├── settings-account.tsx
│   ├── settings-notifications.tsx
│   └── settings-ui-version.tsx     (preserve Phase 04 toggle; just restyle)
├── profile.tsx
├── profile/
│   ├── profile-view.tsx
│   └── profile-edit-form.tsx
└── login.tsx                        (single file, < 200 lines; no submodule needed)
```

LoginPage uses standalone layout (no `app-shell`) — full-screen centered card.

## Related Code Files

**Modify:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/App.tsx` — add 3 routes; ensure `/v4/login` allowed pre-auth
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/layouts/nav-items.ts` — add Settings + Profile (Login excluded from nav)

**Create:** 6 files under `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/`
- `settings.tsx` + 3 in `settings/`
- `profile.tsx` + 2 in `profile/`
- `login.tsx`

**Delete:** none

## Implementation Steps

1. Audit v3 Settings (including Phase 04 toggle). List every section: account, notifications, integrations, etc.
2. Build `settings.tsx` + 3 subfiles. Migrate the UI Version toggle from v3 to v4 component — ensure PATCH endpoint still works.
3. Mount `/v4/settings`. Smoke: toggle v3↔v4, account edit, notifications toggle.
4. Tag `ui-v4-page-settings`.
5. Audit v3 Profile. Build `profile.tsx` + 2 subfiles.
6. Mount `/v4/profile`. Smoke: view, edit, save.
7. Tag `ui-v4-page-profile`.
8. Audit v3 LoginPage. Build standalone `login.tsx` (no `app-shell`).
9. Mount `/v4/login` as public route in router (auth bypass list).
10. Smoke: invalid creds error, valid creds → redirect respects `uiVersion` from server response.
11. Tag `ui-v4-page-login`.
12. Append entries to `docs/project-changelog.md`.

## Todo List

- [ ] `settings.tsx` + 3 subfiles (preserve UI Version toggle)
- [ ] Route mount + smoke
- [ ] Tag `ui-v4-page-settings`
- [ ] `profile.tsx` + 2 subfiles
- [ ] Route mount + smoke
- [ ] Tag `ui-v4-page-profile`
- [ ] `login.tsx` standalone
- [ ] Route mount (public) + smoke
- [ ] Tag `ui-v4-page-login`
- [ ] Append changelog entries

## Success Criteria

- All 10 pages now have v4 versions
- 3 final tags pushed
- UI Version toggle continues to function in v4 Settings
- LoginPage works without user context
- Lint green, all files < 200 lines

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Phase 04 UI Version toggle breaks during Settings rebuild | High | High | Carry over the exact PATCH logic; smoke test toggle round-trip first |
| LoginPage tries to read `useUIVersion()` | High | Medium | Route file omits `<UIVersionProvider>` requirement; standalone layout |
| Auth redirect logic forgets new `/v4/login` | Medium | Medium | Add `/v4/login` to auth bypass allowlist in middleware |
| Profile picture upload widget tied to v3 | Medium | Low | Reuse v3 upload util; only wrap in v4 styling |
| Login styling overlaps with existing `/login` route | Low | Low | Distinct paths until Phase 09 cutover |

## Security Considerations

- LoginPage form submits credentials over HTTPS only (deployment concern, unchanged from v3).
- No password autocomplete leak — preserve `autocomplete="current-password"` attribute.
- Settings UI Version toggle re-validated server-side (already done in Phase 04).
- Profile edit must not expose other users' fields.

## Next Steps

- All 10 pages v4-ready. Unlocks Phase 09 cutover.
- Handoff: 3 tags + tester feedback summary; broader rollout invitation to entire internal team.
