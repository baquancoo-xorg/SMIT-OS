# Tablet UI Standards

Quy chuẩn UI/UX cho tablet, extracted từ Team Backlog page.

## 1. Page Layout Structure

```tsx
<div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
  {/* Header - always visible */}
  <div className="shrink-0">...</div>
  
  {/* Stats/Filters - always visible */}
  <div className="shrink-0">...</div>
  
  {/* Content - scrollable */}
  <div className="flex-1 overflow-y-auto pb-8">...</div>
</div>
```

**Key principles:**
- `h-full` + `flex flex-col` = fill available height
- `shrink-0` on header/filters = never shrink
- `flex-1 overflow-y-auto` on content = internal scroll
- `pb-8` on content = bottom padding for safe scroll

## 2. Typography Scale

| Element | Class | Use |
|---------|-------|-----|
| Page title | `text-4xl font-extrabold font-headline` | Main heading |
| Section title | `text-lg font-black font-headline` | Card headers |
| Stat number | `text-2xl font-black font-headline` | Dashboard stats |
| Label | `text-[10px] font-black uppercase tracking-widest` | All labels |
| Body | `text-sm font-bold` | Primary text |
| Secondary | `text-xs font-medium` | Descriptions |
| Meta | `text-[10px] text-slate-400 font-medium` | Timestamps, etc |

## 3. Spacing

Use CSS variables for consistency:
- Gap between sections: `gap-[var(--space-lg)]`
- Gap within sections: `gap-[var(--space-md)]`
- Card padding: `p-4` (compact) or `p-6` (spacious)
- Stats grid: `grid grid-cols-3 gap-4`

## 4. Components

### Cards
```tsx
className="bg-white rounded-3xl shadow-sm"
```

### Stats Card
```tsx
<div className="text-center">
  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Label</p>
  <p className="text-2xl font-black font-headline text-on-surface">123</p>
</div>
```

### Badges
```tsx
// Priority
className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"

// Type
className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
```

### Buttons
```tsx
// Primary
className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest"

// Tab toggle
className="flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest"
```

## 5. Responsive Patterns

```tsx
// Header: stack on mobile, row on tablet+
className="flex flex-col md:flex-row md:items-center justify-between gap-[var(--space-md)]"

// Stats + Filters: stack on mobile, row on desktop
className="flex flex-col lg:flex-row gap-4"

// Grid: responsive columns
className="grid grid-cols-2 tablet:grid-cols-3 xl:grid-cols-4 gap-4"
```

## 6. Filter/Search Bar

```tsx
<div className="flex-1 flex items-center gap-3 bg-white/50 backdrop-blur-md p-4 rounded-3xl shadow-sm">
  <div className="flex-1 relative">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
    <input className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm font-medium" />
  </div>
  {/* Filter dropdowns */}
</div>
```

## 7. Touch Targets

- Minimum: 44px × 44px
- Buttons: `py-2` minimum (32px) + padding
- Icon buttons: `p-2` (32px) minimum
- List items: `p-4` (comfortable touch area)

## 8. Colors (from design system)

```css
/* Primary */
--color-primary: #0059b6;
--color-primary/5, /10, /20 for backgrounds

/* States */
--color-error: #b31b25;
--color-tertiary: #006b1f;

/* Surfaces */
bg-white, bg-slate-50, bg-surface-container-low
```
