# Development Roadmap

## Current Milestone — SMIT OS v5 Command Center
Status: shipped in working tree, pending final commit/tag.

### Completed
- Phase 00: archaeology and audit.
- Phase 01: IA contracts and routing spec.
- Phase 02: token foundation, ThemeProvider, DensityProvider.
- Phase 03: V5Shell, navigation, route skeleton.
- Phase 04: v5 design primitives.
- Phase 05: flagship Command Center dashboard.
- Phase 06: Growth workspace routes for Leads, Ads, Media.
- Phase 07: Execution workspace routes for OKRs, Daily Sync, Weekly Check-in.
- Phase 08: Intelligence Reports and Admin Settings/Profile.
- Phase 09: validation, docs, tests, and safe cutover posture.

## Validation Gates
Before production commit/tag:
- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run test` passes.
- `npm run build` passes.
- Dark and light routes smoke-tested.
- API key masking and auth guards preserved.

## Media Tracker — Phase 1A: FB Fanpage auto-pull
Status: Complete (2026-05-14).
- SocialChannel model + encrypted token storage.
- FB Graph client library (page posts + post insights).
- MediaSyncRun audit table.
- Cron sync every 6h; manual Refresh on /media.
- v5/MediaTracker rebuilt: filter by format/channel/date, group-by channel.
- /integrations admin UI for SocialChannel CRUD.
- Legacy manual-entry UI and KOL/PR tabs removed.

Next: Phase 1B (TikTok / Instagram / YouTube) — separate plan.

## Deferred Backlog
- Reports custom builder and saved views.
- Dedicated OKR completion analytics for Intelligence.
- Password/security settings backed by real endpoint.
- Avatar upload with file validation and storage.
- Mobile/tablet responsive deep-dive.
- Ultra-compact density mode.
- Component catalog if team size grows.
- PostHog UI regression monitor verification for v5 routes.

## Maintenance Rules
- Keep route additions in `src/App.tsx` and v5 pages under `src/pages/v5/`.
- Keep new shared UI under `src/components/v5/ui/`.
- Treat `docs/ui-design-contract.md` as the canonical Playground compliance gate for every new or changed UI surface.
- Smoke-test changed UI in dark and light mode before marking work done.
- Use real DB-backed APIs for operational workflows.
- Update `docs/project-changelog.md` for major shipped phases.
