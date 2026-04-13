# Brainstorm: Responsive Mobile/Tablet Fixes

**Date:** 2026-04-14  
**Request:** UI/UX responsive audit và fix cho SMIT-OS

## Problem Statement

User báo cáo trang OKRs trên mobile có text bị cắt (truncation). Cần audit toàn bộ project và fix responsive issues cho mobile/tablet.

## Requirements

1. **Scope:** Full audit tất cả pages + components
2. **Priority:** Full polish - đạt UX tốt nhất
3. **Focus:** Mobile (< 640px) và Tablet (640-1024px)

## Approach Evaluated

### Option 1: Fix từng issue individually
- **Pros:** Đơn giản, dễ track
- **Cons:** Không có pattern consistency, có thể duplicate code

### Option 2: Create responsive utility components (Chosen)
- **Pros:** DRY, consistent patterns, maintainable
- **Cons:** More upfront work

### Option 3: CSS-only fixes
- **Pros:** No component changes
- **Cons:** Limited, can't handle complex layout changes

## Final Recommendation

**Chosen:** Option 2 - Phased approach với consistent patterns

### Key Patterns:
1. **Table scroll wrapper** - Apply to all tables
2. **Mobile card view** - Alternative for complex tables
3. **Modal base pattern** - Responsive padding, bottom sheet on mobile
4. **Touch target minimums** - 44-48px for all interactive elements
5. **Grid progression** - Consistent breakpoint strategy

## Implementation Plan

5 phases, 6-8h total:
1. OKRsManagement Critical (C1-C3) - 1h
2. Table Responsive (C4, C10) - 2h  
3. Modal Mobile (C6, C7) - 1.5h
4. Layout & Components (C5, C8, C9, C11, C12) - 1.5h
5. Medium Polish (M1-M18) - 1h

## Success Metrics

- No horizontal overflow at 375px
- All text readable without zooming
- Touch targets ≥ 44px
- Tables usable on mobile
- Modals functional on mobile

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking desktop | Medium | Test both viewports |
| Dark mode conflicts | Low | Coordinate with dark mode plan |
| Performance on older devices | Low | Avoid heavy animations |

## Unresolved Questions

1. Table mobile view: auto-switch vs toggle? → **Decided: auto-switch with optional toggle**
2. Modal pattern: bottom sheet on mobile? → **Decided: Yes, rounded-t-3xl**
3. Minimum viewport: 320px or 375px? → **Decided: 375px (iPhone SE)**

## Next Steps

→ Implementation plan created at:
`plans/260414-0259-responsive-mobile-tablet/plan.md`
