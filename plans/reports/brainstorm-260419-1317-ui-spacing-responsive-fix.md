# Brainstorm: UI Spacing & Responsive Fix

**Date:** 2026-04-19
**Status:** Agreed

---

## Problem Statement

3 vấn đề UI/UX:
1. **Padding không khớp**: Content vượt ra ngoài alignment của Header (Global Search trái, buttons phải)
2. **Top spacing thiếu**: Tiêu đề trang quá sát Topbar, cần 32px
3. **iPad responsive**: Mất burger menu, content bị cắt trên iPad Pro M2 (cả portrait & landscape)

---

## Root Cause Analysis

| Issue | Current Value | Expected |
|-------|---------------|----------|
| Header padding-right | `xl:pr-10` (40px) | - |
| Content padding | `--space-lg` (16-24px) | = Header |
| Content padding-top | ~24px | 32px |
| Sidebar breakpoint | 1180px | Cần thêm 1024px |

---

## Agreed Solution

### Approach 1: CSS Variables (Selected)

Tạo CSS variables để đồng bộ padding giữa Header và Content.

**Files cần sửa:**
- `src/index.css` - thêm CSS variables
- `src/components/layout/AppLayout.tsx` - cập nhật .page-padding
- `src/components/layout/Header.tsx` - dùng CSS variables

### Approach 2: Tablet Landscape Breakpoint (Selected)

Thêm breakpoint `lg: 1024px` cho iPad Pro handling.

**Changes:**
- Breakpoint 1024px: content tối ưu cho tablet
- Sidebar vẫn ẩn ở <1180px (burger menu hiện)
- Fix overflow/clipping issues

---

## Implementation Plan

### Phase 1: CSS Variables Setup (index.css)

```css
/* Content Padding Variables */
--content-px-mobile: 1rem;      /* 16px */
--content-px-tablet: 2rem;      /* 32px */
--content-px-desktop: 2.5rem;   /* 40px = xl:pr-10 */

/* Top Spacing */
--page-pt: 2rem;    /* 32px from topbar */
--page-pb: 1.5rem;  /* 24px bottom */
```

### Phase 2: Update .page-padding (index.css)

```css
.page-padding {
  padding-inline: var(--content-px-mobile);
  padding-block: var(--page-pt) var(--page-pb);
}

@media (min-width: 430px) {  /* md */
  .page-padding {
    padding-inline: var(--content-px-tablet);
  }
}

@media (min-width: 1024px) {  /* lg - tablet landscape */
  .page-padding {
    padding-inline: var(--content-px-tablet);
  }
}

@media (min-width: 1180px) {  /* xl - desktop */
  .page-padding {
    padding-inline: var(--content-px-desktop);
  }
}
```

### Phase 3: Update Header.tsx

```tsx
// Line 65 - thay hardcoded values
className="w-full h-full 
  px-[var(--content-px-mobile)] 
  md:px-[var(--content-px-tablet)] 
  xl:pl-72 xl:pr-[var(--content-px-desktop)] 
  flex items-center justify-between"
```

### Phase 4: iPad Fixes

1. **Ensure burger menu visible**: Kiểm tra z-index và overflow
2. **Content clipping**: Thêm `overflow-x: hidden` hoặc responsive width
3. **Test breakpoints**: Verify 768px, 1024px, 1180px

---

## Success Criteria

- [ ] Content căn sát 100% với Header alignment (Global Search trái, buttons phải)
- [ ] Top spacing = 32px từ Topbar
- [ ] iPad Pro portrait: Burger menu hiện, content không bị cắt
- [ ] iPad Pro landscape: Layout tối ưu, no clipping
- [ ] Desktop: Không regression

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| CSS variable browser support | Fallback values, IE không hỗ trợ nhưng target modern browsers |
| Breaking existing layouts | Test trên tất cả pages trước khi commit |
| iPad Safari quirks | Test trên thiết bị thật |

---

## Next Steps

1. Implement CSS variables trong index.css
2. Update .page-padding với responsive rules
3. Update Header.tsx dùng CSS variables
4. Test trên iPad Pro M2 (cả 2 modes)
5. Test regression trên desktop
