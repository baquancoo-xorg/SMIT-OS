---
status: pending
created: 2026-04-15
scope: Border-radius standardization across all UI components
blockedBy: []
blocks: []
---

# Border-Radius Standardization

## Overview

Chuẩn hóa border-radius toàn bộ dự án SMIT-OS:
- **Action elements** (buttons, filters, badges): `rounded-full` (capsule)
- **Container elements** (inputs, dropdowns, cards, modals): `rounded-3xl` (48px)

**Reference:** [Brainstorm Report](../reports/brainstorm-260415-1152-border-radius-standardization.md)

## Design Standards

| Element Type | Tailwind Class | Value |
|--------------|----------------|-------|
| Buttons (all sizes) | `rounded-full` | 9999px |
| Filter buttons | `rounded-full` | 9999px |
| Badges/Chips | `rounded-full` | 9999px |
| Inputs | `rounded-3xl` | 48px |
| Dropdowns | `rounded-3xl` | 48px |
| Cards | `rounded-3xl` | 48px |
| Modals | `rounded-3xl` | 48px |

## Phases

| # | Phase | Status | Effort | Files |
|---|-------|--------|--------|-------|
| 1 | [CSS + Core UI](phase-01-css-core-ui.md) | pending | 1h | 7 |
| 2 | [Board + Layout + Modals](phase-02-board-layout-modals.md) | pending | 1.5h | 10 |
| 3 | [Daily Report Components](phase-03-daily-report.md) | pending | 1h | 9 |
| 4 | [Pages + Testing](phase-04-pages-testing.md) | pending | 1.5h | 8 |

**Total Effort:** ~5h

## Notes

- Plan `260415-1039-daily-report-team-forms` (pending) sẽ tạo components mới → follow new border-radius standards
- Modal.tsx đã có `rounded-3xl` ✓

## Success Criteria

- [ ] All buttons use `rounded-full`
- [ ] All inputs/dropdowns use `rounded-3xl`
- [ ] All cards use `rounded-3xl`
- [ ] All modals use `rounded-3xl`
- [ ] No arbitrary values (`rounded-[Xpx]`) remaining
- [ ] Visual consistency across all pages

## Cook Command

```bash
/ck:cook /Users/dominium/Documents/Project/SMIT-OS/plans/260415-1152-border-radius-standardization
```
