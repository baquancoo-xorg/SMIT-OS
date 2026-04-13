# Scout Report: Dark Mode and Styling Setup

## Toggle Button Location

**File:** `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/Header.tsx`

- Lines 147-153: Dark mode toggle button
- Uses `Moon` and `Sun` icons from `lucide-react`
- Local state: `const [isDarkMode, setIsDarkMode] = useState(false);` (line 18)
- Toggle: `onClick={() => setIsDarkMode(!isDarkMode)}` (line 148)
- **ISSUE:** State is local to Header component - not persisted, not affecting actual theme

## TailwindCSS Configuration

**No traditional tailwind.config.js/ts exists.**

Using **Tailwind v4** via `@tailwindcss/vite` plugin (see `vite.config.ts` line 9).

Tailwind v4 uses CSS-based configuration in `src/index.css` via `@theme` directive.

## Color Palette (src/index.css)

**Light Theme Only** - Currently defined:

```css
@theme {
  /* Primary - Blue */
  --color-primary: #0059b6;
  --color-on-primary: #eff2ff;
  --color-primary-container: #68a0ff;
  --color-on-primary-container: #00224d;
  
  /* Secondary - Coral/Orange */
  --color-secondary: #a03a0f;
  --color-on-secondary: #ffefeb;
  --color-secondary-container: #ffc4b1;
  --color-on-secondary-container: #832800;
  
  /* Tertiary - Green */
  --color-tertiary: #006b1f;
  --color-on-tertiary: #d0ffca;
  --color-tertiary-container: #8df48e;
  --color-on-tertiary-container: #005c19;
  
  /* Surface - Light purple/white tones */
  --color-surface: #f7f5ff;
  --color-on-surface: #222d51;
  --color-on-surface-variant: #505a81;
  
  /* Surface Containers (lightest to darkest) */
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #eff0ff;
  --color-surface-container: #e4e7ff;
  --color-surface-container-high: #dce1ff;
  --color-surface-container-highest: #d4dbff;
  
  /* Outline */
  --color-outline: #4a5580;
  --color-outline-variant: #a1abd7;
  
  /* Error - Red */
  --color-error: #b31b25;
  --color-error-container: #fb5151;
  --color-on-error-container: #570008;
}
```

## Theme State Management

**Current:** None. No global theme context/provider exists.

- `App.tsx`: Uses `AuthProvider` only, no theme provider
- `Header.tsx`: Local `isDarkMode` state - visual toggle exists but does nothing
- `AppLayout.tsx`: No theme handling

## Key Files for Implementation

| Purpose | File |
|---------|------|
| Toggle button | `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/Header.tsx` |
| CSS variables | `/Users/dominium/Documents/Project/SMIT-OS/src/index.css` |
| App root | `/Users/dominium/Documents/Project/SMIT-OS/src/App.tsx` |
| Layout wrapper | `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/AppLayout.tsx` |
| Vite config | `/Users/dominium/Documents/Project/SMIT-OS/vite.config.ts` |

## Implementation Requirements

1. **Create ThemeContext** - global state for dark/light mode with localStorage persistence
2. **Add dark theme variables** - define dark colors in `src/index.css`
3. **Toggle class on html/body** - Tailwind v4 uses `.dark` class selector or media query
4. **Update Header toggle** - connect to global context instead of local state

## Unresolved Questions

- Should dark mode use `prefers-color-scheme` media query for system preference?
- Should theme persist to user preferences in database (User model)?
