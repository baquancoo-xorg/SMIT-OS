# Phase 2: Layout Components

**Priority:** High | **Effort:** 45m | **Status:** pending

## Overview

Add dark mode classes to core layout: Header, Sidebar, AppLayout.

## Files

| File | Key Changes |
|------|-------------|
| `src/components/layout/Header.tsx` | Connect toggle, dark backgrounds |
| `src/components/layout/Sidebar.tsx` | Dark nav, hover states |
| `src/components/layout/AppLayout.tsx` | Dark overlay, backgrounds |

## Implementation

### 1. Header.tsx

**Connect toggle to ThemeContext:**

```tsx
import { useTheme } from '../../contexts/ThemeContext';

// Replace useState:
const { theme, toggleTheme } = useTheme();
const isDarkMode = theme === 'dark';

// Update toggle button onClick:
onClick={toggleTheme}
```

**Add dark classes:**

| Element | Add |
|---------|-----|
| Header bg | `dark:bg-[#1e1e1e] dark:border-gray-800` |
| Text | `dark:text-gray-300` |
| Hover states | `dark:hover:bg-gray-800` |
| Search input | `dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500` |

### 2. Sidebar.tsx

**Key dark classes:**

| Element | Add |
|---------|-----|
| Sidebar bg | `dark:bg-[#1e1e1e]` |
| Logo text | `dark:text-white` |
| Nav items | `dark:text-gray-300 dark:hover:bg-gray-800` |
| Active item | `dark:bg-gray-800 dark:text-white` |
| Dividers | `dark:border-gray-700` |
| Logout btn | `dark:text-gray-400 dark:hover:bg-gray-800` |

### 3. AppLayout.tsx

**Key dark classes:**

| Element | Current | Add |
|---------|---------|-----|
| Main container | `bg-surface` | `dark:bg-[#121212]` |
| Overlay | `bg-black/20` | (keep - works both) |
| Text | `text-on-surface` | (CSS var handles) |

## Todo

- [ ] Header: connect useTheme, add dark classes
- [ ] Sidebar: add dark classes to all elements
- [ ] AppLayout: add dark background

## Verification

1. Toggle → Header/Sidebar switch colors
2. All text readable in dark mode
3. Hover states visible
4. Mobile overlay still works
