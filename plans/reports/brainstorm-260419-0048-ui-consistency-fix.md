# Brainstorm: UI Consistency Fix

**Date:** 2026-04-19
**Status:** Ready for implementation

---

## Problem Statement

Các trang trong SMIT-OS có vấn đề UI consistency:

1. **Căn lề phải không đồng nhất** - Các thành phần không align với Sprint widget trên header
2. **Kích thước nút khác nhau** - `py-2` vs `py-2.5`, thiếu `min-w-[130px]`
3. **Spacing không đồng nhất** - `space-y-6` vs `space-y-8` vs `space-y-10`

## Decision

- **Căn lề:** Align với cạnh phải của Sprint widget
- **Spacing:** 32px (`space-y-8`) cho tất cả các trang
- **Approach:** Tạo shared components

---

## Solution Architecture

### New Components to Create

#### 1. `PageLayout.tsx`
```
src/components/layout/PageLayout.tsx
```

**Purpose:** Wrapper component chuẩn hóa layout cho tất cả pages

**Props:**
- `breadcrumb: { parent: string; current: string }` - Breadcrumb navigation
- `title: ReactNode` - Page title (có thể include styled text)
- `actions?: ReactNode` - Buttons, toggles, filters (right-aligned)
- `children: ReactNode` - Page content

**Key styling:**
```tsx
<div className="h-full flex flex-col py-6 lg:py-10 space-y-8 w-full">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <nav>...</nav>
      <h2>{title}</h2>
    </div>
    <div className="flex items-center gap-3">{actions}</div>
  </div>
  {children}
</div>
```

#### 2. `PrimaryActionButton.tsx`
```
src/components/ui/PrimaryActionButton.tsx
```

**Purpose:** Shared button cho "+ New Task", "New Report", "New Objective", etc.

**Props:**
- `onClick: () => void`
- `icon?: ReactNode` - Default: "add" material icon
- `children: ReactNode` - Button text

**Key styling:**
```tsx
className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-95 transition-all min-w-[130px] whitespace-nowrap"
```

#### 3. `ViewToggle.tsx`
```
src/components/ui/ViewToggle.tsx
```

**Purpose:** Board/Table toggle buttons

**Props:**
- `value: 'board' | 'table'`
- `onChange: (value) => void`
- `boardLabel?: string` - Default: "Board"
- `tableLabel?: string` - Default: "Table"

---

## Files to Modify

### High Priority (Layout inconsistency)

| File | Changes |
|------|---------|
| `TechBoard.tsx` | Use `PageLayout`, `PrimaryActionButton`, `ViewToggle` |
| `MarketingBoard.tsx` | Same pattern |
| `MediaBoard.tsx` | Same pattern |
| `SaleBoard.tsx` | Same pattern |
| `ProductBacklog.tsx` | `py-2` → `py-2.5`, add `min-w-[130px]` |
| `OKRsManagement.tsx` | `space-y-10` → `space-y-8` |
| `DashboardOverview.tsx` | `space-y-6` → `space-y-8` |
| `DailySync.tsx` | Already `space-y-8`, align button styling |

### Medium Priority (Consistency enforcement)

| File | Changes |
|------|---------|
| `SaturdaySync.tsx` | Check spacing consistency |
| `Profile.tsx` | Check alignment |
| `Settings.tsx` | Check alignment |

---

## Implementation Steps

### Phase 1: Create Shared Components
1. Create `src/components/ui/PrimaryActionButton.tsx`
2. Create `src/components/ui/ViewToggle.tsx`
3. Create `src/components/layout/PageLayout.tsx`
4. Compile & test components individually

### Phase 2: Refactor Board Pages
1. Refactor `TechBoard.tsx`
2. Refactor `MarketingBoard.tsx`
3. Refactor `MediaBoard.tsx`
4. Refactor `SaleBoard.tsx`
5. Test all boards

### Phase 3: Refactor Other Pages
1. Update `ProductBacklog.tsx`
2. Update `OKRsManagement.tsx`
3. Update `DashboardOverview.tsx`
4. Update `DailySync.tsx`
5. Check remaining pages

### Phase 4: Visual QA
1. Start dev server
2. Test all pages in browser
3. Verify alignment với Sprint widget
4. Verify spacing consistency

---

## Success Criteria

- [ ] Tất cả page dùng `space-y-8`
- [ ] Tất cả primary action buttons có cùng kích thước
- [ ] Actions section align với Sprint widget trên header
- [ ] Breadcrumb + Title styling đồng nhất
- [ ] No visual regression

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | Test mỗi page sau khi refactor |
| CSS specificity conflicts | Use Tailwind classes consistently |
| Missing edge cases | Visual QA on all pages |

---

## Next Steps

Run `/ck:plan` để tạo implementation plan chi tiết.
