---
title: iPad UX Overhaul
status: in_progress
priority: high
created: 2026-04-19
estimated: 6 hours
blockedBy: []
blocks: []
---

# iPad UX Overhaul

## Overview

Desktop đạt 95%, iPad experience cần overhaul toàn diện.

**Problems:**
1. Không có burger menu trên iPad landscape
2. Không scroll được (viewport-fit lock)
3. Element/text quá to
4. Content clipping
5. Table/Kanban khó dùng
6. Global Search quá dài/sát icon

**Reference:** [Brainstorm Report](../reports/brainstorm-260419-1340-ipad-ux-overhaul.md)

## Phases

| Phase | Name | Est | Status |
|-------|------|-----|--------|
| 1 | [Breakpoint & Burger Menu](phase-01-breakpoint.md) | 30m | pending |
| 2 | [Responsive Search](phase-02-responsive-search.md) | 45m | pending |
| 3 | [Hybrid Scroll](phase-03-hybrid-scroll.md) | 1h | pending |
| 4 | [Responsive Sizing](phase-04-responsive-sizing.md) | 1.5h | pending |
| 5 | [Table/Kanban](phase-05-table-kanban.md) | 2h | pending |
| 6 | [Testing](phase-06-testing.md) | 1h | pending |

## Key Files

```
src/index.css                           # Breakpoint, sizing
src/components/layout/Header.tsx        # Search, burger menu
src/components/layout/AppLayout.tsx     # Scroll behavior
src/components/ui/DataTable.tsx         # Table responsive
src/pages/*                             # Page-specific scroll
```

## Success Criteria

- [ ] Burger menu trên tất cả iPad (portrait + landscape)
- [ ] Global Search: shorter trên tablet, icon trên mobile
- [ ] OKRs/tables có thể page-scroll
- [ ] Kanban vẫn viewport-fit
- [ ] Text/element sizing phù hợp
- [ ] Touch targets ≥ 44px
