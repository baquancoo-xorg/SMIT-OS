# Phase 07 — Integration + cleanup

## Context links

- All prior phases (01–06)
- Docs to update: `docs/codebase-summary.md`, `docs/project-changelog.md`, `docs/development-roadmap.md`

## Parallelization Info

- parallel-with: []
- must-wait-for: [phase-01, phase-02, phase-03, phase-04, phase-05, phase-06]
- blocks: []

## Overview

- Date: 2026-05-14
- Description: End-to-end verification, delete legacy files, update docs, run full validation suite. Final commit closing feature.
- Priority: P2
- Status: pending

## Key Insights

- Legacy `src/components/media-tracker/` directory contains 4 files (csv-export, media-post-dialog, media-posts-table, platform-badge) — all unused after Phase 05. Safe to delete entire dir.
- Server `media-post.service.ts` legacy `create/update/delete` methods removed in Phase 04 — confirm no remaining caller.
- `MediaPostType` enum removed in Phase 01 — confirm zero references in TS code.
- Docs map (`CLAUDE.md` § Docs Map) does not need update — media-tracker not currently listed.

## Requirements

Functional:
- Delete `src/components/media-tracker/` directory entirely.
- Grep zero residual references to `MediaPostType`, `MediaPostDialog`, `media-post-dialog`, `useSortableData` (if not used elsewhere).
- End-to-end flow verified manually: add channel → sync → posts appear → filter + group-by works.
- Documentation updated:
  - `docs/codebase-summary.md` — add SocialChannel + media-sync entries.
  - `docs/project-changelog.md` — record feature.
  - `docs/development-roadmap.md` — mark Phase 1A done.

Non-functional:
- All validation commands pass: `npm run typecheck && npm run lint && npm run test && npm run build`.

## Architecture

End-to-end flow check:
```
Admin opens /v5/integrations
   → Add FB Page channel (token encrypted server-side)
   → Test connection (returns page name)
   ↓
Cron tick at 6h OR admin clicks Refresh on /v5/media
   → syncAllActive() → fetchPagePosts + fetchPostInsights → upsert MediaPost
   ↓
User opens /v5/media
   → GET /api/media-tracker → posts + kpi → render table + KPI cards
   → Filter Format=PHOTO → filtered list
   → Group-by Channel → collapsible groups with aggregate
```

## Related code files

Delete:
- `src/components/media-tracker/csv-export.ts`
- `src/components/media-tracker/media-post-dialog.tsx`
- `src/components/media-tracker/media-posts-table.tsx`
- `src/components/media-tracker/platform-badge.tsx`
- `src/components/media-tracker/` (directory itself)

Modify:
- `docs/codebase-summary.md`
- `docs/project-changelog.md`
- `docs/development-roadmap.md`

Do NOT modify:
- Any code file (only docs + deletion in this phase).

## File Ownership

Exclusive owner:
- Deletion of `src/components/media-tracker/*`
- `docs/codebase-summary.md`
- `docs/project-changelog.md`
- `docs/development-roadmap.md`

## Implementation Steps

1. Grep for legacy imports:
   - `grep -r "components/media-tracker" src/` → expect zero hits.
   - `grep -r "MediaPostDialog" src/` → expect zero.
   - `grep -r "MediaPostType" src/ server/` → expect zero.
   - If hits found, file ANOTHER bug task; do NOT bypass deletion gate.
2. `rm -r src/components/media-tracker/`.
3. Run validation:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run test`
   - `npm run build`
4. Manual e2e:
   - Start dev server.
   - Log in as admin.
   - Add FB Page channel with valid token.
   - Click Test → expect green toast.
   - Click Refresh on /v5/media → expect posts populated within 30s.
   - Apply filter Format=PHOTO + Date range last 30 days → expect filtered list.
   - Switch group-by to Channel → expect collapsible group with sum.
   - Verify KPI cards numbers match table sum.
5. Verify cron:
   - Tail server log → wait 6h tick OR set temporary `* * * * *` schedule for testing, then revert.
   - Confirm `MediaSyncRun` row created with `status='SUCCESS'`.
6. Update docs:
   - `codebase-summary.md`: add lines under server services section for `media-sync.service.ts`, `fb-graph-client.ts`, `social-channel.service.ts`. Add `/v5/integrations` page entry.
   - `project-changelog.md`: new entry `2026-05-14 — Media Tracker auto-pull: rewrote v5/MediaTracker to sync FB Fanpage posts via Graph API; dropped manual entry + KOL/PR tabs; added SocialChannel admin UI.`
   - `development-roadmap.md`: mark "Media Tracker auto-pull Phase 1A (FB Fanpage)" status = Complete.
7. Final commit: `feat(media): auto-pull from FB Fanpage Graph API + drop manual entry`.

## Todo list

- [ ] Grep verify no legacy references
- [ ] Delete `src/components/media-tracker/`
- [ ] `npm run typecheck` clean
- [ ] `npm run lint` clean
- [ ] `npm run test` all green
- [ ] `npm run build` succeeds
- [ ] Manual e2e: add → sync → filter → group-by
- [ ] Manual cron tick verified via log
- [ ] Update `codebase-summary.md`
- [ ] Update `project-changelog.md`
- [ ] Update `development-roadmap.md`

## Success Criteria

- `find src/components/media-tracker -type f` returns empty.
- `npm run build` exits 0.
- `MediaSyncRun` rows in DB show recurring SUCCESS entries.
- Admin can perform full add→sync→view loop without errors.
- Non-admin sees no Refresh / Integrations route.
- Docs reflect new feature.

## Conflict Prevention

This phase runs LAST and OWNS only file deletions + docs. No code edits. No overlap with any prior phase. If a prior phase missed a reference (e.g., `MediaPostType` import), this phase HALTS at step 1 grep and files a bug for the owning phase to fix — does NOT silently patch across boundaries.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Hidden import of deleted dialog | Medium | Step-1 grep gate before deletion |
| Cron not firing in prod | Medium | Verify via MediaSyncRun row presence; alert if no run in 12h (add monitoring backlog item) |
| Build fails on minified Vite output | Low | Run build locally before merge |
| Doc drift after merge | Low | Doc updates are part of THIS phase, not deferred |
| Token expires during e2e test | Low | Use long-lived token; document refresh procedure in changelog |

## Security Considerations

- Final grep confirms no legacy code path that allowed unauthenticated MediaPost write.
- Verify `accessToken` never appears in any HTTP response (manual inspect network tab on /v5/integrations).
- Verify cron does not log full token (search log for token prefix).

## Next steps

→ Feature shipped. Backlog items:
- Phase 1B (TikTok/IG/YT) — separate plan
- MediaSyncRun retention policy (delete >90d)
- Export CSV (open question from brainstorm)
- Thumbnail R2 cache (open question from brainstorm)
