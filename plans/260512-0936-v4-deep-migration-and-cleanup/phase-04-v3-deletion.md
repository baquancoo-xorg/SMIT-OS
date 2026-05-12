# Phase 04 — v3 Deletion + Cleanup

## Context Links

- Plan: [plan.md](./plan.md)
- Predecessor Phase 09 marked partial-completed pending this terminal phase
- Pre-cleanup branch: `pre-v4-rebuild` (optional safety branch — create before delete)

## Overview

- Priority: P1 (terminal — high-stakes)
- Status: pending
- Goal: delete v3 codebase entirely after 7-day zero-regression evaluation window. Reclaim bundle size + reduce maintenance surface.

## Key Insights

- Cannot start until Phase 01-03 complete (Login/forms/sub-tabs all v4)
- 7-day clean window: PostHog UI regression monitor reports zero new alerts on v4 paths
- After delete, root remains `/v4/dashboard` but `/v4/*` prefix can be dropped for cleaner URLs (optional rename)
- Bundle reduction estimate: 30-40% (v3 components + index.css + unused v3 sub-deps)

## Requirements

**Functional:**
- Delete `src/components/ui/*` (30 v3 primitives)
- Delete `src/pages/*.tsx` (10 v3 pages: Dashboard, OKRs, DailySync, WeeklyCheckin, Settings, Profile, LeadTracker, MediaTracker, AdsTracker, LoginPage)
- Delete `src/components/dashboard/*` (v3 sub-components only used by v3 pages)
- Delete `src/components/layout/AppLayout.tsx` (v3 shell)
- Delete `src/index.css` v3 tokens (keep base reset + tailwind import, move to v4 location)
- Remove App.tsx v3 routes
- Remove unused v3-only deps (audit + drop)

**Non-functional:**
- Build green throughout (delete in batches, build after each)
- No v3 references remain in source
- v4 paths preserved
- Optionally rename `/v4/*` → `/*` (clean URLs post-cutover)

## Architecture

```
DELETE:
  src/components/ui/                  (30 files)
  src/components/dashboard/           (recharts wrappers used only by v3 DashboardOverview)
  src/components/layout/AppLayout.tsx
  src/components/layout/Sidebar.tsx   (v3)
  src/components/layout/Header.tsx    (v3)
  src/components/board/               (if unused)
  src/components/lead-tracker/        (if not reused by v4)
  src/components/ads-tracker/         (if not reused)
  src/components/media-tracker/       (if not reused)
  src/components/okr/                 (if not reused)
  src/components/checkin/             (if not reused)
  src/components/modals/              (audit)
  src/components/settings/            (audit, v3-specific)
  src/pages/                          (10 files)
  src/index.css                       (v3 tokens, replace with v4)

KEEP:
  src/design/v4/                      (everything)
  src/pages-v4/                       (everything)
  src/contexts/                       (AuthContext etc.)
  src/hooks/                          (data hooks, reused by v4)
  src/lib/                            (api-client, query-client, etc.)
  src/types/                          (shared types)
```

## Related Code Files

**Modify:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/App.tsx` (drop v3 routes, optional rename /v4/* → /*)
- `/Users/dominium/Documents/Project/SMIT-OS/src/main.tsx` (replace index.css import with v4 tokens.css)
- `/Users/dominium/Documents/Project/SMIT-OS/package.json` (drop unused deps after audit)
- `/Users/dominium/Documents/Project/SMIT-OS/CLAUDE.md` (drop v3 references)
- `/Users/dominium/Documents/Project/SMIT-OS/docs/project-changelog.md` (final cutover entry)

**Delete:** see Architecture section

**Create:**
- `pre-v4-rebuild` git branch (safety pointer to commit before this phase) — keep for 3 months

## Implementation Steps

1. **Pre-flight check:**
   - Confirm 7 days zero PostHog UI regression alerts on v4 paths
   - User signoff explicit (don't auto-execute this phase)
   - Create `pre-v4-rebuild` branch as safety pointer
2. **Delete v3 pages** — `src/pages/*.tsx`. Build green check.
3. **Delete v3 layout** — `src/components/layout/{AppLayout,Sidebar,Header}.tsx`. Build green check.
4. **Delete v3 ui primitives** — `src/components/ui/*`. Build green check.
5. **Audit + delete v3 sub-component folders** — board, lead-tracker, ads-tracker, etc. Build green check per folder.
6. **Delete `src/index.css`** — move tokens.css to entry, update main.tsx import.
7. **Update App.tsx** — drop v3 routes. Optional: rename `/v4/{name}` → `/{name}` (mass replace).
8. **Dep audit** — `npm-check` or manual grep, drop unused v3-only deps from package.json.
9. **CLAUDE.md + changelog** — final v4 cutover entry, drop "v3 retained" notes.
10. **Git tag** — `ui-v4-release` annotated tag.

## Todo List

- [ ] Pre-flight: 7-day clean window + user signoff
- [ ] Create `pre-v4-rebuild` safety branch
- [ ] Delete src/pages/*
- [ ] Delete src/components/layout/{AppLayout,Sidebar,Header}.tsx
- [ ] Delete src/components/ui/*
- [ ] Audit + delete src/components/ sub-folders
- [ ] Migrate src/index.css → drop v3 tokens
- [ ] Update App.tsx routing (optional /v4/* → /*)
- [ ] Drop unused deps from package.json
- [ ] Update CLAUDE.md + changelog
- [ ] Git tag `ui-v4-release`
- [ ] Final build + lint green
- [ ] PostHog monitor 24h post-delete

## Success Criteria

- Zero `src/pages/` and `src/components/ui/` files remaining
- `npm run lint` exit 0
- `npm run build` exit 0
- Bundle size reduced by ≥30% (gzip)
- `pre-v4-rebuild` branch exists for 3-month recovery window
- Git tag `ui-v4-release` created

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Hidden v3 dependency in v4 code | Medium | High | Build incrementally per delete batch; revert if break |
| Component removed but still imported somewhere | Medium | Medium | grep + tsc catch; pre-commit check |
| Production users on bookmarked v3 URLs | Low | Medium | Pre-delete, add 301 redirects /<v3-path> → /v4/<path> for known routes |
| Dep removal breaks something subtle | Low | Medium | Run full smoke test after each dep removal |

## Security Considerations

- Auth flow validated end-to-end in v4 (LoginPage v4 from Phase 01)
- No backend changes — security posture unchanged
- Audit log: ensure v4 actions logged identically to v3

## Next Steps

- Plan officially closes after this phase
- Optional follow-up: "v5" iteration in 12-18 months when design language refresh needed
- Long-term: keep tokens.css + components stable as the design system source of truth; iterate components individually
