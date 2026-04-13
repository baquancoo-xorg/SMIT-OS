# Phase 1: Core Infrastructure

**Priority:** Critical | **Effort:** 30m | **Status:** pending

## Overview

Setup dark mode foundation: ThemeContext, CSS config, App wrapper.

## Files

| Action | File |
|--------|------|
| CREATE | `src/contexts/ThemeContext.tsx` |
| MODIFY | `src/index.css` |
| MODIFY | `src/App.tsx` |

## Implementation

### 1. Create ThemeContext.tsx

```typescript
// src/contexts/ThemeContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'smitos-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Read from localStorage on init (prevents flash)
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(STORAGE_KEY) as Theme) || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    // Sync to localStorage and <html> class
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### 2. Update index.css

Add dark mode variant at end of file:

```css
/* Dark mode variant */
@variant dark (&:where(.dark, .dark *));

/* Dark theme overrides - Soft Dark */
.dark {
  --color-surface: #121212;
  --color-on-surface: #e5e5e5;
  --color-on-surface-variant: #a3a3a3;
  --color-surface-container-lowest: #0a0a0a;
  --color-surface-container-low: #1a1a1a;
  --color-surface-container: #1e1e1e;
  --color-surface-container-high: #252525;
  --color-surface-container-highest: #2f2f2f;
  --color-outline: #525252;
  --color-outline-variant: #404040;
}
```

### 3. Update App.tsx

Wrap with ThemeProvider:

```tsx
import { ThemeProvider } from './contexts/ThemeContext';

// In App component render:
return (
  <ThemeProvider>
    <AuthProvider>
      {/* existing content */}
    </AuthProvider>
  </ThemeProvider>
);
```

### 4. Prevent Flash Script (index.html)

Add before `</head>`:

```html
<script>
  (function() {
    const theme = localStorage.getItem('smitos-theme');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  })();
</script>
```

## Todo

- [ ] Create ThemeContext.tsx
- [ ] Add dark variant to index.css
- [ ] Add dark CSS variables
- [ ] Wrap App with ThemeProvider
- [ ] Add flash prevention script

## Verification

1. Toggle in React DevTools → `dark` class toggles on `<html>`
2. Reload page → theme persists
3. No flash of wrong theme on load
