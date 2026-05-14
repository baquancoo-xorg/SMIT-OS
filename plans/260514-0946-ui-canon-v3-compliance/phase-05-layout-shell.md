# Phase 5 — Layout Shell + Playground Routes

## Context Links
- Parent: [plan.md](plan.md)
- Prev: [phase-04-chart-wrappers.md](phase-04-chart-wrappers.md)
- Contract: `docs/ui-design-contract.md` §9-§12b (Shell/Header/Sidebar/MobileNav), §34 (Notification)
- Phase 3 primitives: avatar, banner, search-input, tooltip, pagination
- D11: restore `/v4/playground` + add `/v5/playground`

## Overview
- **Date:** 2026-05-14
- **Priority:** P1
- **Status:** pending
- **Description:** Refactor V5Shell + Header + Sidebar + MobileNavDrawer + NotificationCenter to canon; add `/v5/playground` route + restore `/v4/playground` route.

## Key Insights
- Shell is the visual frame for all 10 pages — must land before Phase 6 page refactor.
- `/v5/playground` becomes the dogfood + demo route for primitives (Phase 3) + charts (Phase 4).
- `/v4/playground` is the frozen canon reference — re-hosted for visual diff workflows.
- Dark + light parity per D4.

## Requirements

### Functional
- Refactor 5 layout files to canon (token-driven, primitive-consuming, dark+light).
- Add `/v5/playground` route — composite demo of all v5/ui primitives + chart wrappers.
- Restore `/v4/playground` route — serve `docs/ref-ui-playground/Playground .html` as iframe or static html route.
- NotificationCenter consumes new Banner primitive.

### Non-Functional
- Each layout file ≤200 lines (split if needed).
- All tokens via Phase 2 vars; no hex.
- Skip-link + landmark roles + aria-labels.
- Mobile nav drawer keyboard-trap correct.

## Architecture
```
src/components/v5/layout/
├── v5-shell.tsx              (refactor — §9)
├── header-v5.tsx             (refactor — §11)
├── sidebar-v5.tsx            (refactor — §10)
├── mobile-nav-drawer.tsx     (refactor — §12)
├── workspace-nav-items.ts    (unchanged unless data drift)
src/components/v5/ui/
└── notification-center.tsx   (refactor — §34, consume Banner primitive)
src/pages/v5/
├── Playground.tsx            (NEW — `/v5/playground`)
src/routes/                   (or App router file)
└── (extend — add /v4/playground + /v5/playground)
```

Route map:
```
/                  → /v5/dashboard (current redirect)
/v4/playground     → static playground HTML (iframe or asset)
/v5/playground     → Playground.tsx (composite primitive + chart demo)
```

## Related Code Files
**Modify:**
- `src/components/v5/layout/v5-shell.tsx`
- `src/components/v5/layout/header-v5.tsx`
- `src/components/v5/layout/sidebar-v5.tsx`
- `src/components/v5/layout/mobile-nav-drawer.tsx`
- `src/components/v5/ui/notification-center.tsx`
- Router config file (e.g. `src/App.tsx` or `src/routes.tsx` — check existing)

**Create:**
- `src/pages/v5/Playground.tsx`
- (optional) `public/ref-playground.html` symlink or copy for `/v4/playground` iframe serve

## Implementation Steps
1. Read current 5 layout files → diff vs §9-§12b + §34.
2. Refactor `v5-shell.tsx`:
   - Skip-link landmark.
   - Token-driven background + grid layout.
   - Dark + light variant.
3. Refactor `header-v5.tsx`:
   - Consume Avatar + SearchInput + Tooltip primitives (Phase 3).
   - Right-aligned actions cluster.
4. Refactor `sidebar-v5.tsx`:
   - Navigation list per §10 (collapsed + expanded states).
   - Light + dark contrast verify.
5. Refactor `mobile-nav-drawer.tsx`:
   - Radix Dialog or Portal + focus-trap.
   - Swipe-to-close consideration (out of scope or defer per YAGNI).
6. Refactor `notification-center.tsx`:
   - Consume Banner primitive (§51).
   - Notification toast stack pattern per §34.
7. Author `src/pages/v5/Playground.tsx`:
   - Section per primitive (mirror playground HTML structure).
   - Chart wrappers showcase per §47.
   - Light/dark toggle button at top.
8. Register routes:
   - `/v5/playground` → Playground.tsx
   - `/v4/playground` → static HTML (`<iframe src="/ref-playground.html">` or vite asset route)
9. Re-snapshot Playwright baseline (Phase 2 tool) — new `/v5/playground` reference set.
10. `npm run build` + `lint:ui-canon` clean.

## Todo List
- [ ] Refactor `v5-shell.tsx` (§9)
- [ ] Refactor `header-v5.tsx` (§11) — consume Avatar/SearchInput/Tooltip
- [ ] Refactor `sidebar-v5.tsx` (§10)
- [ ] Refactor `mobile-nav-drawer.tsx` (§12)
- [ ] Refactor `notification-center.tsx` (§34) — consume Banner
- [ ] Author `src/pages/v5/Playground.tsx` — primitive + chart showcase
- [ ] Wire `/v5/playground` route
- [ ] Wire `/v4/playground` route (iframe/static)
- [ ] Re-snapshot Playwright baseline for `/v5/playground`
- [ ] Dark + light manual smoke
- [ ] `npm run build` clean
- [ ] `lint:ui-canon` 0 violations on `v5/layout/**`

## Success Criteria
- 5 layout files refactored per §9-§12b + §34.
- `/v5/playground` route live + shows every primitive + chart wrapper.
- `/v4/playground` route accessible — serves frozen canon HTML.
- Dark + light visual parity verified.
- All layout files ≤200 lines.
- `lint:ui-canon` 0 violations in `v5/layout/**`.
- Playwright baseline captures `/v5/playground` snapshots.

## Risk Assessment
| Risk | Severity | Mitigation |
|---|---|---|
| Router refactor breaks existing redirects | Med | Test all existing routes manually; preserve `/` → `/v5/dashboard` |
| `/v4/playground` iframe sandbox issues | Low | Use `sandbox` attr or serve via plain static route; document |
| Shell refactor breaks page layout invariants | High | Compare before/after dashboard render; rollback per-file if regression |
| Mobile drawer focus-trap regression | Med | Smoke test keyboard navigation on each page |
| Playground.tsx grows > 200 lines | High | Split into section components: `playground-sections/{forms,feedback,charts,…}.tsx` |

## Security Considerations
- `/v4/playground` static HTML must not include external script tags (audit content before serving).
- Skip-link + landmark roles required for a11y (WCAG 2.1 AA).
- iframe sandboxing for v4 playground (no `allow-scripts allow-same-origin` combo).

## Next Steps
- Blocks Phase 6 (pages render inside shell).
- Enables visual diff workflow via `/v5/playground` for ai-multimodal verification.
