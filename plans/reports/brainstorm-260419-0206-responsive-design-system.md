# Brainstorm Report: Responsive Design System

## Problem Statement
SMIT OS cần tối ưu UI/UX cho multi-device (Desktop, Tablet, Mobile) với các vấn đề:
- Elements quá to, buttons inconsistent sizes
- Page heights khác nhau gây trải nghiệm khó chịu
- Cần viewport-fit (no vertical scroll)
- Devices: iPad Pro M1, iPhone 13-16, Desktop 1366px-4K

## Evaluated Approaches

### Approach 1: Container Queries (Rejected)
- Modern, component-level responsive
- Cons: Cần refactor nhiều, learning curve

### Approach 2: Design Tokens + Viewport Units ✓ (Selected)
- Pragmatic, viewport-fit dễ đạt
- Dùng `dvh`/`dvw` + `clamp()` cho responsive
- Ít refactor, dễ maintain

### Approach 3: Adaptive Layouts (Rejected)
- Control tối đa nhưng maintain 3 layouts
- Tốn thời gian, potential inconsistency

## Final Solution

### Design Tokens System

**Breakpoints:**
| Token | Value | Devices |
|-------|-------|---------|
| xs | 375px | iPhone mini |
| sm | 390px | iPhone 13-15 |
| md | 430px | iPhone Pro Max |
| tablet | 768px | iPad mini |
| lg | 1024px | iPad Pro 11" |
| xl | 1180px | iPad Pro 12.9" landscape |
| 2xl | 1366px | Laptop |
| 3xl | 1920px | FullHD |
| 4xl | 2560px | 2K/4K |

**Spacing Scale (Dynamic):**
```css
--space-xs: clamp(0.25rem, 0.5vw, 0.5rem);
--space-sm: clamp(0.5rem, 1vw, 0.75rem);
--space-md: clamp(0.75rem, 1.5vw, 1rem);
--space-lg: clamp(1rem, 2vw, 1.5rem);
--space-xl: clamp(1.5rem, 3vw, 2rem);
--space-2xl: clamp(2rem, 4vw, 3rem);
```

**Touch Targets:**
- Minimum: 44px (Apple HIG)
- Comfortable: 48px

**Layout Structure:**
- Header: fixed h-16
- Content: h-[calc(100dvh-4rem)]
- Internal scroll within sections, not page-level

## Implementation Plan

**Phase 1 (Day 1-2):** Foundation - tokens, utilities, AppLayout fix
**Phase 2 (Day 3-4):** TechBoard pilot - refactor + test devices
**Phase 3 (Day 5-6):** Rollout remaining 12 pages
**Phase 4 (Day 7+):** Polish, edge cases, documentation

## Key Files to Modify
- `/src/index.css` - design tokens
- `/src/components/layout/*` - layout structure
- `/src/pages/*` - all 13 pages
- `/src/components/ui/*` - shared components

## Success Criteria
- [ ] Viewport-fit trên tất cả pages (no vertical scroll)
- [ ] Consistent spacing/sizing across devices
- [ ] Touch targets ≥ 44px
- [ ] Smooth experience iPad Pro + iPhone 13-16 + Desktop

## Risks
- Safari dvh quirks → test early on real devices
- Kanban with many cards → internal scroll + virtualization nếu cần
- 4K scaling → test clamp() limits

## Next Steps
Proceed với `/ck:plan` để tạo implementation plan chi tiết.
