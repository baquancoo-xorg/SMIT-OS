# Phase 05: Validation, Browser QA, Docs, Review

## Context Links
- Overview plan: [plan.md](plan.md)
- Project docs:
  - `docs/system-architecture.md`
  - `docs/project-changelog.md`
  - `docs/development-roadmap.md`
  - `docs/code-standards.md`

## Overview
Priority: P1  
Status: pending  
Validate final code, test UI in browser, update docs if needed, and run code review.

## Requirements
- Run compile/build command after code changes.
- Start dev server if not already running.
- Browser-test key dashboard flows.
- Use tester agent after implementation.
- Use code-reviewer agent after tests pass.
- Update docs/changelog if implementation materially changes dashboard UI architecture.

## Validation Checklist
### Commands
- [ ] `npm run build` or project compile script.
- [ ] Relevant lint command if available and practical.
- [ ] Any focused tests if present.

### Browser QA
- [ ] Open `/ads-overview` and confirm default Overview tab.
- [ ] Open `/ads-overview?tab=sale` and confirm Sale tab.
- [ ] Switch across all five tabs.
- [ ] Product/Marketing/Media show Coming soon.
- [ ] Date picker still changes Summary/KPI/Sale data.
- [ ] KPI table Realtime/Cohort and Top/Step toggles still work.
- [ ] KPI horizontal scroll works.
- [ ] Call Performance AE filter still works.
- [ ] PMDashboard still renders and charts are readable.
- [ ] Check responsive header at desktop and narrow viewport.

### Docs
Update only if useful:
- `docs/project-changelog.md`: dashboard tab/UI refactor entry.
- `docs/code-standards.md`: dashboard UI primitives usage, if this becomes a standard.
- `docs/system-architecture.md`: only if dashboard component structure should be documented.

## Success Criteria
- Build/compile passes.
- Browser QA passes for dashboard flows.
- Tester reports pass or issues are fixed.
- Code-reviewer reports no blocking issues.
- Docs impact explicitly stated.

## Risk Assessment
- Risk: UI-only changes pass compile but fail actual layout. Mitigation: browser QA required.
- Risk: docs churn. Mitigation: update only relevant docs.

## Security Considerations
- Validate tab query strictly against allowed values.
- No sensitive data exposure in URL query; tab value only.

## Todo List
- [ ] Run compile/build.
- [ ] Run UI browser QA.
- [ ] Delegate tester validation.
- [ ] Delegate code review.
- [ ] Update docs/changelog if needed.
