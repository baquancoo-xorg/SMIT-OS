# Scout Report: Layout-Related Files

**Date:** 2026-04-19 13:17
**Status:** DONE

## Key Layout Files

### Core Layout Components
| File | Purpose |
|------|---------|
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/AppLayout.tsx` | Main app shell, sidebar + header + content |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/Header.tsx` | Fixed topbar, search, widgets |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/Sidebar.tsx` | Navigation sidebar |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/DateCalendarWidget.tsx` | Header date/calendar dropdown |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/layout/SprintContextWidget.tsx` | Header sprint progress dropdown |
| `/Users/dominium/Documents/Project/SMIT-OS/src/index.css` | Tailwind v4 theme, breakpoints, spacing |

---

## Current Spacing/Padding Values

### AppLayout.tsx (lines 41-49)
```tsx
<main className="flex-1 overflow-hidden pt-16">
  <div className="viewport-fit page-padding w-full">
    {children}
  </div>
</main>
```
- `pt-16` = 4rem = 64px (header offset)
- `.viewport-fit` = height: var(--content-h) = calc(100dvh - 4rem)
- `.page-padding` = padding: var(--space-lg) = clamp(1rem, 2vw, 1.5rem)

### Header.tsx (line 64-65)
```tsx
<header className="fixed top-0 left-0 right-0 h-16 z-40 ...">
  <div className="w-full h-full px-4 md:px-8 xl:pl-72 xl:pr-10 ...">
```
- Header height: `h-16` = 4rem = 64px
- Mobile padding: `px-4` = 1rem
- Tablet padding: `md:px-8` = 2rem
- Desktop padding: `xl:pl-72` = 18rem (sidebar width offset), `xl:pr-10` = 2.5rem

### Sidebar.tsx (line 17)
```tsx
<aside className="... p-4 md:p-6 xl:p-6 ... w-64 xl:w-72 ...">
```
- Mobile width: `w-64` = 16rem = 256px
- Desktop width: `xl:w-72` = 18rem = 288px
- Mobile padding: `p-4` = 1rem
- Tablet/Desktop padding: `md:p-6` = 1.5rem

---

## Responsive Breakpoints (index.css lines 48-57)

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 375px | iPhone SE |
| `sm` | 390px | iPhone 14 |
| `md` | 430px | iPhone 14 Pro Max |
| `tablet` | 768px | iPad portrait |
| `lg` | 1024px | iPad landscape |
| `xl` | 1180px | **Sidebar toggle point** |
| `2xl` | 1366px | Laptop |
| `3xl` | 1920px | Desktop |
| `4xl` | 2560px | 4K |

**Key breakpoint:** `xl:` (1180px) - sidebar becomes static, header padding shifts

---

## Dynamic Spacing System (index.css lines 59-65)

| Token | Value | Computed Range |
|-------|-------|----------------|
| `--space-xs` | clamp(0.25rem, 0.5vw, 0.5rem) | 4px - 8px |
| `--space-sm` | clamp(0.5rem, 1vw, 0.75rem) | 8px - 12px |
| `--space-md` | clamp(0.75rem, 1.5vw, 1rem) | 12px - 16px |
| `--space-lg` | clamp(1rem, 2vw, 1.5rem) | 16px - 24px |
| `--space-xl` | clamp(1.5rem, 3vw, 2rem) | 24px - 32px |
| `--space-2xl` | clamp(2rem, 4vw, 3rem) | 32px - 48px |

---

## Layout Sizing Constants (index.css lines 67-77)

| Token | Value | Purpose |
|-------|-------|---------|
| `--touch-min` | 44px | Min touch target |
| `--touch-comfort` | 48px | Comfortable touch |
| `--card-min` | 280px | Min card width |
| `--card-max` | 360px | Max card width |
| `--header-h` | 4rem | Header height |
| `--content-h` | calc(100dvh - 4rem) | Content viewport |

---

## Utility Classes (index.css lines 90-121)

- `.viewport-fit` - Full height minus header, overflow hidden
- `.page-padding` - var(--space-lg) padding
- `.touch-target` - 44px min height/width
- `.internal-scroll` - Overflow-y auto, flex:1, min-h-0
- `.scrollbar-hide` - Hide scrollbars
- `.transition-layout` - all 0.2s ease-out

---

## Summary

Layout uses:
1. **Fixed header** (64px) with sidebar-aware left padding at xl
2. **Collapsible sidebar** (256px mobile, 288px desktop) - slides out on mobile
3. **Content area** with `viewport-fit` (100dvh - 64px) and clamp-based padding
4. **Breakpoint-driven** behavior at xl (1180px) for sidebar toggle
5. **Fluid spacing** via CSS clamp functions for responsive padding

