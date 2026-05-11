# Phase 06 — Polish + QA + Docs

## Context Links

- Parent plan: [plan.md](./plan.md)
- Phase 5 input: 10 pages on v3, feature flag removed
- Phase 1 inspiration refs (reference only, no gate): `reports/inspiration/`
- v2 bundle baseline: ~1618.4 kB (per brainstorm)
- Style guide to rewrite: [docs/ui-style-guide.md](../../docs/ui-style-guide.md)

## Overview

| Date | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|
| W6 | P1 (production gate) | 1 week | pending | Phase 5 done (10 pages migrated + flag removed) |

## Key Insights

- v2 root cause #4 (motion/micro-interactions absent) — Phase 6 owns this gap closure
- Bundle target: delta ≤ +20% vs v2 baseline ~1618.4 kB → ceiling ~1942 kB
- Final user sign-off = aesthetic gate (single validator, gut feel — no benchmark comparison per 2026-05-11 decision)
- `docs/ui-style-guide.md` rewrite mandatory — was deprecated in v2 plan, never replaced
- Mobile verification: 375px screenshots for all 10 pages (DailySync/WeeklyCheckin already gated in Phase 5)

## Requirements

### Functional

- Micro-interactions added: button press, hover, focus rings, page transitions
- Performance audit: bundle size, FCP measurement, lazy-load review
- Cross-browser test: Chrome, Safari, Firefox (last 2 stable each)
- Mobile responsive verification: 375px screenshots for all 10 pages
- Docs sync:
  - Rewrite `docs/ui-style-guide.md` (v3 source of truth)
  - Update `docs/development-roadmap.md` (v3 entry)
  - Update `docs/project-changelog.md` (v3 ship entry)
  - Update `docs/system-architecture.md` UI section if structural changes
- Final aesthetic review: user walks through 10 pages, signs off in `reports/phase-06-final-signoff.md`

### Non-functional

- Bundle delta ≤ +20% vs v2 baseline (~1942 kB ceiling)
- Lighthouse Performance ≥ 85 on Dashboard
- Lighthouse Accessibility ≥ 90 on all pages
- No console errors/warnings on any page (production build)

## Architecture

```
Polish layer (additive):
├── Motion: button/hover/focus interactions via v3 motion tokens
├── Page transitions: PageTransition component on route changes
└── Loading states: SkeletonV2 + ToastV2 used in heavy pages

QA matrix:
├── Browser: Chrome / Safari / Firefox
├── Viewport: 375 / 768 / 1280 / 1920
└── Pages: 10 routes × 4 viewports × 3 browsers = 120 checks (sampled, not exhaustive)

Docs:
├── docs/ui-style-guide.md → REWRITE
├── docs/development-roadmap.md → APPEND v3 entry
├── docs/project-changelog.md → APPEND ship entry
└── docs/system-architecture.md → UPDATE UI section
```

## Related Code Files

### Modify (polish)
- `src/components/ui/button.tsx` — press/hover/focus motion
- `src/components/ui/page-transition.tsx` — refine route motion
- Any page lacking motion polish identified during D1-D2 audit

### Modify (perf)
- Lazy-load review: `src/App.tsx` route imports → `React.lazy()` if not already
- Heavy components: lazy-load AuroraBackground, Dashboard tabs

### Modify (docs)
- `docs/ui-style-guide.md` — full rewrite (v3 source of truth)
- `docs/development-roadmap.md`
- `docs/project-changelog.md`
- `docs/system-architecture.md` — UI section only

### Create
- `reports/phase-06-bundle-audit.md`
- `reports/phase-06-lighthouse-scores.md`
- `reports/phase-06-mobile-screenshots/` (10 page screenshots @ 375px)
- `reports/phase-06-final-signoff.md` (user walkthrough notes + sign-off)

## Implementation Steps

1. **D1 — Motion polish audit**: walk all 10 pages, list missing micro-interactions → backlog
2. **D2 — Motion implementation**: apply motion tokens to Button hover/press, Card hover, Modal enter, focus rings; PageTransition on route change
3. **D3 — Performance**:
   - `npm run build` → bundle size report → compare vs v2 baseline
   - If delta >+20%: identify top 3 contributors, lazy-load or tree-shake
   - Lighthouse run on Dashboard, OKRsManagement, LeadTracker
4. **D4 morning — Cross-browser**: smoke test 10 pages on Chrome / Safari / Firefox
5. **D4 afternoon — Mobile screenshots**: capture all 10 pages at 375px → `reports/phase-06-mobile-screenshots/`
6. **D5 — Docs rewrite**:
   - `docs/ui-style-guide.md` full rewrite (component usage, token usage, do/don't examples)
   - Append `development-roadmap.md` v3 entry
   - Append `project-changelog.md` ship entry
   - Update `system-architecture.md` UI section
7. **D6 — Final aesthetic review**:
   - User walks through 10 pages live (or via screenshots)
   - User sign-off in `reports/phase-06-final-signoff.md` (single validator, gut feel)
8. **D7 — Closeout**:
   - Verify all success criteria
   - Tag `v3-shipped`
   - Mark v2 plan `superseded`
   - Update v3 `plan.md` status → `completed`

## Todo List

- [ ] Motion polish audit + backlog
- [ ] Apply motion to Button/Card/Modal/focus rings
- [ ] PageTransition on route change
- [ ] Bundle size audit
- [ ] Lazy-load review (lazy-load offenders)
- [ ] Lighthouse runs (Dashboard, OKRs, LeadTracker)
- [ ] Cross-browser smoke (Chrome/Safari/Firefox)
- [ ] Mobile screenshots all 10 pages @ 375px
- [ ] Rewrite `docs/ui-style-guide.md`
- [ ] Update `docs/development-roadmap.md`
- [ ] Update `docs/project-changelog.md`
- [ ] Update `docs/system-architecture.md`
- [ ] Final aesthetic review (user walkthrough)
- [ ] User sign-off in `reports/phase-06-final-signoff.md`
- [ ] Tag v3-shipped + mark v2 superseded

## Success Criteria

- All 10 pages have button press / hover / focus motion + page transitions
- Bundle delta ≤ +20% vs v2 baseline
- Lighthouse: Performance ≥ 85 on Dashboard; Accessibility ≥ 90 all pages
- 0 console errors on production build per page
- Cross-browser parity (no broken layout on Chrome/Safari/Firefox)
- All 10 pages render correctly @ 375px (screenshots in report)
- `docs/ui-style-guide.md` rewritten — accurate to v3 code
- User signs off final v3 aesthetic walkthrough
- v2 plan marked `superseded`; v3 plan marked `completed`

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Bundle blows past +20% delta | MEDIUM | Top-3 contributor analysis; lazy-load AuroraBackground/heavy charts; tree-shake unused exports |
| Final user rejects aesthetic (single-validator opinion shift) | HIGH | Inherent single-validator risk (no benchmark guard). Mitigated upstream by Phase 1 + 2 commitment. If reject = scope-bound rework, not full re-plan; budget 2-3 days buffer; if catastrophic → escalate to brainstorm re-do |
| Lighthouse Performance < 85 on Dashboard (heaviest) | MEDIUM | Lazy-load 5 tabs; defer non-visible chart rendering; image optimization audit |
| Cross-browser breakage on Safari (motion CSS `@starting-style`) | MEDIUM | If CSS-only motion chosen Phase 4 → verify Safari support; fallback `framer-motion` if needed |
| Docs drift (rewrite doesn't match code) | LOW | Write docs by reading code, not memory; spot-check 5 examples per doc |
| Mobile breakage on untested pages | MEDIUM | Mandatory 375px screenshot for all 10 pages = gating artifact |

## Security Considerations

- N/A (polish phase, no auth/data changes)
- Verify production build does not expose feature flag code (Phase 5 cleanup re-check)

## Next Steps

- v3 ship complete → SMIT-OS UI on v3 source of truth
- Possible v4 candidates (out of scope): dark mode (deferred per brainstorm Q6), visual regression suite (Playwright snapshots)
