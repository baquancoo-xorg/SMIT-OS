# Brainstorm: iPad UX Overhaul

**Date:** 2026-04-19
**Status:** Agreed

---

## Problem Statement

Desktop UI đạt 95%, nhưng iPad experience rất tệ:
1. **Không có burger menu** - Sidebar static trên iPad landscape
2. **Không scroll được** - viewport-fit lock height
3. **Element/text quá to** - Thiếu responsive sizing
4. **Content clipping** - Padding + overflow issues
5. **Table/Kanban khó dùng** - Chưa optimize cho tablet

---

## Agreed Solution

### 1. Breakpoint Update

**Current:** `xl: 1180px` → sidebar static
**New:** `xl: 1440px` → cover tất cả tablet

| Device | Width | New Behavior |
|--------|-------|--------------|
| iPad Pro 11" landscape | 1194px | Burger menu ✓ |
| iPad Pro 12.9" landscape | 1366px | Burger menu ✓ |
| MacBook Air 13" | 1440px+ | Sidebar static |

### 2. Scroll Behavior (Hybrid)

| Page Type | Behavior | Implementation |
|-----------|----------|----------------|
| Kanban boards | Internal scroll | Keep `.viewport-fit` |
| OKRs, Tables | Page scroll | Remove `.viewport-fit`, add `overflow-y-auto` |
| Dashboard | Internal scroll | Keep `.viewport-fit` |

**Implementation:**
- Add prop `scrollable?: boolean` to page wrapper
- Default: `viewport-fit` (internal scroll)
- `scrollable={true}`: page-level scroll

### 3. Responsive Sizing

**Typography scale:**
```css
--text-scale-tablet: 0.9;

/* Example */
.heading-lg {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
}
```

**Element sizing:**
```css
/* Cards, buttons scale down on tablet */
@media (max-width: 1439px) {
  .card { padding: 1rem; }
  .stat-card { min-height: 100px; }
}
```

### 4. Table/Kanban Optimization

**Tables:**
- Horizontal scroll wrapper
- Sticky first column
- Touch-friendly row height (48px min)

**Kanban:**
- Horizontal scroll for columns
- Collapse columns on tablet (show 2-3 max)
- Swipe navigation between columns

### 5. Global Search Responsive

| Breakpoint | Behavior |
|------------|----------|
| Desktop (≥1440px) | Full search bar |
| Tablet (768-1439px) | Shorter search bar (`max-w-xs`) |
| Mobile (<768px) | Search icon → click opens overlay |

**Implementation:**
- Tablet: `max-w-[200px]` hoặc `max-w-xs`
- Mobile: Hide input, show search icon button
- On click: Open full-screen search overlay

### 6. Content Padding (Tablet-specific)

```css
@media (min-width: 768px) and (max-width: 1439px) {
  .page-padding {
    padding-inline: 1.5rem;
    padding-block: 1.5rem 1rem;
  }
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Breakpoint `xl: 1440px`, tablet media queries |
| `src/components/layout/AppLayout.tsx` | Conditional viewport-fit |
| `src/components/layout/Header.tsx` | Burger menu + responsive search |
| `src/pages/*` | Add `scrollable` prop where needed |
| `src/components/ui/DataTable.tsx` | Horizontal scroll wrapper |
| Kanban components | Column collapse/scroll |

---

## Success Criteria

- [ ] Burger menu hiện trên tất cả iPad (portrait + landscape)
- [ ] OKRs, tables có thể scroll page-level
- [ ] Kanban boards vẫn viewport-fit với internal scroll
- [ ] Text/element sizing phù hợp trên tablet
- [ ] Không content clipping
- [ ] Touch targets ≥ 44px

---

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking desktop layout | Test 1440px+ after changes |
| Performance on scroll | Virtual scroll for long lists |
| Kanban UX change | Test with real data |

---

## Estimated Effort

| Phase | Est |
|-------|-----|
| Breakpoint + burger menu | 30m |
| Hybrid scroll system | 1h |
| Responsive sizing | 1.5h |
| Table/Kanban optimization | 2h |
| Testing + polish | 1h |
| **Total** | ~6h |
