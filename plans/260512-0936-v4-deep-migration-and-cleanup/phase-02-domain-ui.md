# Phase 02 — Domain UI (OKRs board + Dashboard charts + Settings tabs + Profile activity)

## Context Links

- Plan: [plan.md](./plan.md)
- Predecessor Phase 04-08 partial-completed (shell only, sub-content placeholders)

## Overview

- Priority: P2
- Status: pending
- Goal: fill in the "coming soon" placeholders across 4 pages with real domain UI.

## Key Insights

- OKRs board likely the heaviest — CRUD on objectives + key-results + progress bars
- Dashboard sub-tabs (Sale/Marketing/Media) use recharts in v3 — replace with v4 KpiCard + DataTable where possible, keep recharts for time-series
- Settings sub-tabs (Security, API Keys, Appearance) each independent
- Profile activity timeline — read-only list

## Requirements

**Functional:**
- OKRs page: list/card view of objectives + key-results, inline edit, progress visualization
- Dashboard Sale tab: real call performance + lead flow + lead distribution
- Dashboard Marketing tab: real marketing acquisition data
- Dashboard Media tab: real media performance
- Settings → Security: 2FA enable/disable, backup codes, active sessions
- Settings → API Keys: list keys, create/revoke (mirror v3 functionality)
- Settings → Appearance: light/dark toggle (wires up Phase 03 light mode)
- Profile: activity log (last 30 days of user actions)

**Non-functional:**
- Reuse existing backend endpoints + hooks (use-overview-data, use-call-performance, use-lead-flow, use-lead-distribution, etc.)
- Chart components: re-skin existing recharts wrappers with v4 token colors

## Architecture

```
src/pages-v4/
├── okrs-management.tsx          REWRITE — full board (currently active-cycle card only)
├── dashboard-overview.tsx       EXTEND — Sale/Marketing/Media tab content
├── settings.tsx                 EXTEND — Security/API Keys/Appearance tab content
└── profile.tsx                  EXTEND — activity timeline

src/pages-v4/_widgets/           NEW (optional shared dashboard widgets)
├── chart-card.tsx               v4-styled chart wrapper (recharts inside SurfaceCard)
└── kpi-grid.tsx                 Reusable KPI grid
```

## Related Code Files

**Modify:**
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/okrs-management.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/dashboard-overview.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/settings.tsx`
- `/Users/dominium/Documents/Project/SMIT-OS/src/pages-v4/profile.tsx`

**Create:** as needed in `_widgets/`

## Implementation Steps

1. OKRs board — read v3 OKRsManagement.tsx, identify CRUD endpoints, build v4 board with SurfaceCard per objective + KeyResult progress bars.
2. Dashboard Sale tab — port from CallPerformanceSection + LeadDistributionSection + DashboardTab (v3 components in src/components/dashboard/). Wrap each section in v4 SurfaceCard.
3. Dashboard Marketing + Media — same pattern.
4. Settings Security — port 2FA settings UI from v3 Settings page.
5. Settings API Keys — port API key manager from v3.
6. Settings Appearance — toggle component (wires Phase 03).
7. Profile activity — fetch last 30 days actions, render as table or timeline list.
8. Extract `_widgets/` helpers if duplication justifies.
9. Lint + build green per page.

## Todo List

- [ ] OKRs board (objectives + key-results)
- [ ] Dashboard Sale tab content
- [ ] Dashboard Marketing tab content
- [ ] Dashboard Media tab content
- [ ] Settings Security tab
- [ ] Settings API Keys tab
- [ ] Settings Appearance tab (toggle hook)
- [ ] Profile activity timeline
- [ ] Lint green + build green

## Success Criteria

- All 4 pages render real data in every tab/section
- No "coming soon" placeholders remain on v4 routes
- Recharts uses v4 token colors (`--brand-500` not `#007aff`)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Recharts theming complexity | Medium | Medium | Build chart-card wrapper that injects v4 colors via props |
| OKRs CRUD endpoints poorly documented | Medium | High | Read existing v3 code carefully; preserve mutation hooks |
| Scope explosion (4 pages × multiple sections) | High | Medium | Phase gate per page; ship 1 page fully then move next |

## Security Considerations

- 2FA: encrypted TOTP secret never leaves backend; UI only triggers enable/disable mutations
- API Keys: keys shown ONCE on creation, then hashed (existing flow)

## Next Steps

- Unlocks Phase 03 (light mode) — needs Settings Appearance toggle
- Reduces v3 page references inside v4 (better cutover readiness)
