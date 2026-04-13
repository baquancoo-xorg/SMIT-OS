# Dark Mode Implementation - Brainstorm Report

**Date:** 2026-04-14
**Status:** Approved

## Problem Statement

SMIT-OS hiện chỉ có light mode. Cần implement dark mode với:
- Toggle button đã có sẵn ở Header (chưa functional)
- Manual toggle only (không theo system preference)
- Lưu preference vào localStorage
- Soft Dark style (#121212 background)

## Approach Comparison

### Approach 1: CSS Variables Swap (Not chosen)
- Centralized, không cần sửa components
- Works với Tailwind v4 `@theme`

### Approach 2: Tailwind dark: prefix (CHOSEN)
- User preference
- Fine-grained control per component
- Cần sửa ~30 files

## Final Design

### Architecture
```
ThemeProvider (App.tsx)
    ├── State: theme ('light' | 'dark')
    ├── Effect: sync localStorage + <html> class
    └── Consumers: Header toggle, All components (dark: classes)
```

### Files To Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| CREATE | src/contexts/ThemeContext.tsx | Global theme state + localStorage |
| MODIFY | src/App.tsx | Wrap với ThemeProvider |
| MODIFY | src/index.css | Add dark variant config |
| MODIFY | src/components/layout/Header.tsx | Connect toggle → useTheme |
| MODIFY | ~26 other components | Add dark: prefix classes |

### Color Mapping (Soft Dark)

| Light | Dark |
|-------|------|
| bg-surface (#f7f5ff) | dark:bg-[#121212] |
| bg-white | dark:bg-[#1e1e1e] |
| text-on-surface (#222d51) | dark:text-gray-100 |
| border-outline-variant | dark:border-gray-700 |

### ThemeContext API

```typescript
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

### Implementation Priority

1. 🔴 HIGH: ThemeContext, App.tsx, index.css, Header.tsx
2. 🟡 MEDIUM: Layout components, UI components
3. 🟢 LOW: Pages, board components, modals

## Risks

- Scope lớn (~30 files) - có thể miss một số components
- Cần test kỹ từng component sau khi thêm dark: classes
- Potential color contrast issues cần review

## Success Criteria

- [ ] Toggle button switch theme thực sự
- [ ] Theme persist sau reload (localStorage)
- [ ] Tất cả components render đúng trong dark mode
- [ ] Không có text/background contrast issues
- [ ] No flash of wrong theme on page load

## Next Steps

Tạo implementation plan với /ck:plan
