# SMIT OS Design System

## Breakpoints

| Token | Value | Usage |
|-------|-------|-------|
| `--breakpoint-xs` | 375px | iPhone mini |
| `--breakpoint-sm` | 390px | iPhone standard |
| `--breakpoint-md` | 430px | iPhone Pro Max |
| `--breakpoint-tablet` | 768px | iPad portrait |
| `--breakpoint-lg` | 1024px | iPad landscape / Desktop |
| `--breakpoint-xl` | 1180px | Desktop |
| `--breakpoint-2xl` | 1366px | Laptop HD |
| `--breakpoint-3xl` | 1920px | Full HD |
| `--breakpoint-4xl` | 2560px | QHD/4K |

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | clamp(0.25rem, 0.5vw, 0.5rem) | Tight spacing, icons |
| `--space-sm` | clamp(0.5rem, 1vw, 0.75rem) | Compact elements |
| `--space-md` | clamp(0.75rem, 1.5vw, 1rem) | Standard padding |
| `--space-lg` | clamp(1rem, 2vw, 1.5rem) | Section gaps |
| `--space-xl` | clamp(1.5rem, 3vw, 2rem) | Large sections |
| `--space-2xl` | clamp(2rem, 4vw, 3rem) | Hero/feature spacing |

## Touch Targets

| Token | Value | Usage |
|-------|-------|-------|
| `--touch-min` | 44px | Minimum for any interactive |
| `--touch-comfort` | 48px | Recommended size |

## Layout

| Token | Value | Usage |
|-------|-------|-------|
| `--header-h` | 4rem (64px) | Fixed header height |
| `--content-h` | calc(100dvh - 4rem) | Available content area |
| `--card-min` | 280px | Minimum Kanban column width |
| `--card-max` | 360px | Maximum Kanban column width |

## Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-action` | 9999px | Buttons, badges, chips (capsule) |
| `--radius-container` | 3rem (48px) | Cards, modals, inputs |

## Layout Patterns

### Viewport-fit Page

Full-height page that uses available viewport without scrolling the entire page.

```tsx
<div className="viewport-fit page-padding">
  <header className="shrink-0">...</header>
  <main className="internal-scroll">...</main>
</div>
```

### Dashboard Grid

Stats cards with responsive grid.

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--space-md)]">
  <StatCard />
  <StatCard />
</div>
```

### Kanban Board

Horizontal scroll with fixed-width columns.

```tsx
<div className="flex gap-[var(--space-lg)] overflow-x-auto internal-scroll">
  <div className="min-w-[var(--card-min)] shrink-0 flex flex-col">
    <header className="shrink-0">...</header>
    <div className="internal-scroll">
      <TaskCard />
    </div>
  </div>
</div>
```

## Utility Classes

| Class | Description |
|-------|-------------|
| `.viewport-fit` | `height: var(--content-h); overflow: hidden;` |
| `.page-padding` | `padding: var(--space-lg);` |
| `.touch-target` | `min-height/width: var(--touch-min);` |
| `.internal-scroll` | `overflow-y: auto; flex: 1; min-height: 0;` |
| `.transition-layout` | Smooth 0.2s transitions |

## Component Sizes

### Buttons

| Size | Height | Class |
|------|--------|-------|
| Small | 36px (h-9) | `h-9 px-3 text-sm` |
| Medium | 44px (h-11) | `h-11 px-4 text-base` |
| Large | 48px (h-12) | `h-12 px-6 text-lg` |

### Cards

- Border radius: `rounded-3xl` (--radius-container)
- Padding: `p-[var(--space-md)]` or `p-[var(--space-lg)]`
- Shadow: `shadow-sm` for subtle elevation

## Browser Support

- Safari iOS: Fallback for `dvh` using `env(safe-area-inset-bottom)`
- All modern browsers support `clamp()` and CSS custom properties
