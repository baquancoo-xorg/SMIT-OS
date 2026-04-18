---
title: Responsive Design System
status: complete
priority: high
created: 2026-04-19
estimated: 7-10 days
blockedBy: []
blocks: []
---

# Responsive Design System

## Overview

Tối ưu UI/UX cho SMIT OS trên multi-device với viewport-fit approach.

**Approach:** Design Tokens + Viewport Units (dvh/dvw + clamp)
**Pilot:** TechBoard (Kanban phức tạp nhất)
**Goal:** Viewport-fit (no vertical scroll), consistent sizing

## Target Devices

| Category | Devices | Resolution |
|----------|---------|------------|
| Mobile | iPhone 13-16 | 375-430px |
| Tablet | iPad Pro M1 | 768-1180px |
| Desktop | Laptop/Monitor | 1366-4K |

## Phases

| Phase | Name | Days | Status |
|-------|------|------|--------|
| 1 | [Foundation](phase-01-foundation.md) | 1-2 | complete |
| 2 | [TechBoard Pilot](phase-02-techboard-pilot.md) | 3-4 | complete |
| 3 | [Rollout](phase-03-rollout.md) | 5-6 | complete |
| 4 | [Polish](phase-04-polish.md) | 7+ | complete |

## Key Files

```
src/index.css                    # Design tokens
src/components/layout/*          # Layout structure (3 files)
src/components/ui/*              # Shared components (8 files)
src/pages/*                      # All pages (13 files)
```

## Success Criteria

- [x] Viewport-fit trên tất cả pages
- [x] Touch targets ≥ 44px
- [x] Consistent spacing scale
- [x] Smooth experience across all target devices

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Safari dvh quirks | Medium | Test early on real devices |
| Many Kanban cards | High | Internal scroll + virtualization |
| 4K scaling | Low | Test clamp() limits |

## References

- [Brainstorm Report](../reports/brainstorm-260419-0206-responsive-design-system.md)
- [Scout Report](../reports/scout-260419-0206-ui-ux-structure.md)
