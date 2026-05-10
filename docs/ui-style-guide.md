# UI Style Guide

> Last updated: 2026-05-10
> **Source of truth: `src/pages/OKRsManagement.tsx`** — trang đầu tiên được build, style chuẩn nhất của dự án.
>
> ⚠️ **Mọi UI mới hoặc sửa lại UI cũ MUST reference doc này** để đảm bảo consistency. Nếu pattern ở đây không cover được use case → discuss với team trước, sau đó update doc trước khi code.

## Layout Architecture

### Page wrapper

```tsx
<div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
  {/* Header */}
  {/* Bento metric cards */}
  {/* Filters + Content */}
</div>
```

CSS variables: `--space-sm`, `--space-md`, `--space-lg` (defined in `index.css`).

### Page header

```tsx
<div className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)] shrink-0">
  <div>
    {/* Breadcrumb */}
    <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
      <span className="hover:text-primary cursor-pointer transition-colors">Group</span>
      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
      <span className="text-on-surface">Page Name</span>
    </nav>

    {/* Title with italic accent */}
    <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
      Page <span className="text-primary italic">Name</span>
    </h2>
  </div>

  {/* Right action area: filters, buttons */}
  <div className="flex items-center gap-3">{/* ... */}</div>
</div>
```

**Rules:**
- Title luôn split 2 phần: prefix `text-on-surface` + suffix `text-primary italic`
- Breadcrumb dùng Material icon `chevron_right` size 14px
- Mobile responsive: stack vertical → row

---

## Components

### Glass card (default container)

```tsx
<div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm p-4 xl:p-6">
  {/* content */}
</div>
```

**Rules:**
- Always `rounded-3xl` (KHÔNG `rounded-2xl`)
- Background `white/50` + `backdrop-blur-md` = glassmorphism signature
- Padding `p-4 xl:p-6` responsive

### Bento metric card (signature element)

```tsx
<div className="bg-white/50 backdrop-blur-md border border-white/20 p-4 xl:p-6 rounded-3xl shadow-sm flex flex-col gap-2 relative overflow-hidden group">
  {/* Decorative blob */}
  <div className="absolute top-0 right-0 w-20 h-20 xl:w-32 xl:h-32 bg-primary/5 rounded-full -mr-10 -mt-10 xl:-mr-16 xl:-mt-16 group-hover:scale-150 transition-transform duration-700"></div>

  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Label</p>
  <div className="flex items-baseline gap-1 relative z-10">
    <h4 className="text-2xl xl:text-4xl font-black font-headline">42.5%</h4>
  </div>
  {/* Optional progress bar / trend / detail */}
</div>
```

**Variants:**
- Primary highlight: `bg-primary p-4 xl:p-6 rounded-3xl shadow-xl shadow-primary/20` + decorative blob `bg-white/10`, text trắng
- Status card: same wrapper + status indicator dot

**Grid:**
```tsx
<div className="grid grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
```

### Tab toggle (pill style)

```tsx
<div className="flex items-center bg-slate-100 rounded-full p-0.5 gap-0.5">
  <button className={`flex items-center gap-1.5 h-7 px-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
    active ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'
  }`}>
    <Icon size={10} />
    Tab Name
  </button>
</div>
```

**⚠️ Drift cảnh báo:** Lead Tracker đang dùng `text-[9px]` — sai. Phải là `text-[10px]`.

### Primary CTA button

```tsx
<button className="flex items-center justify-center gap-2 h-10 bg-primary text-white px-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-95 transition-all min-w-[130px] whitespace-nowrap">
  <span className="material-symbols-outlined text-[14px]">add</span>
  Action Name
</button>
```

### Secondary button

```tsx
<button className="flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-surface-container-high text-slate-600 hover:bg-slate-200 font-black text-[10px] uppercase tracking-widest transition-all">
  <Icon size={13} />
  Secondary
</button>
```

### Status indicator (pulsing dot)

```tsx
<div className="flex items-center gap-1">
  <div className={`w-2 h-2 rounded-full ${bgColor} animate-pulse`}></div>
  <span className={`text-[10px] font-bold ${color}`}>Status message</span>
</div>
```

### Empty state

```tsx
<div className="text-center py-12 md:py-20 bg-slate-50/50 border-2 border-dashed border-outline-variant/10 rounded-3xl">
  <span className="material-symbols-outlined text-3xl md:text-4xl text-slate-300 mb-4">search_off</span>
  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] md:text-xs">No items found.</p>
</div>
```

---

## Typography

| Use case | Pattern |
|---|---|
| Big metric number | `text-2xl xl:text-4xl font-black font-headline` |
| Page title | `text-4xl font-extrabold font-headline tracking-tight` |
| Section heading h3 | `text-2xl font-black font-headline` |
| Tiny label (uppercase caps) | `text-[10px] font-black uppercase tracking-widest text-slate-400` |
| Body text | `text-sm font-medium` |
| Mid metric | `text-xs font-bold` |
| Breadcrumb | `text-sm font-medium text-on-surface-variant` |
| Button label | `text-[10px] font-black uppercase tracking-widest` |

**Custom font:** `font-headline` (defined in Tailwind config) cho headings + big numbers.

---

## Color System

### Theme colors (Tailwind)

| Token | Use |
|---|---|
| `primary` | Brand color, Tech-related, BOD |
| `tertiary` | Success / positive trend |
| `error` | Off track / critical |
| `on-surface` | Main text |
| `on-surface-variant` | Secondary text |
| `surface-container-high` | Subtle background (cards, inputs) |
| `outline-variant` | Borders (subtle) |
| `slate-100/300/400/500/600` | Neutral grays |
| `amber-500` | At-risk warning |

### Department colors (HARDCODED, KHÔNG dùng Tailwind palette)

```tsx
const deptColors: Record<string, { bg: string; text: string; border: string; icon: string; badge: string }> = {
  BOD:       { bg: 'bg-primary/5',         text: 'text-primary',       border: 'border-primary/10',     icon: 'bg-primary',       badge: 'bg-primary-fixed text-on-primary-fixed border-primary/10' },
  Sale:      { bg: 'bg-[#009966]/10',      text: 'text-[#009966]',     border: 'border-[#009966]/20',   icon: 'bg-[#009966]',     badge: 'bg-[#009966]/10 text-[#009966] border-[#009966]/20' },
  Tech:      { bg: 'bg-[#0059B6]/10',      text: 'text-[#0059B6]',     border: 'border-[#0059B6]/20',   icon: 'bg-[#0059B6]',     badge: 'bg-[#0059B6]/10 text-[#0059B6] border-[#0059B6]/20' },
  Marketing: { bg: 'bg-[#F54A00]/10',      text: 'text-[#F54A00]',     border: 'border-[#F54A00]/20',   icon: 'bg-[#F54A00]',     badge: 'bg-[#F54A00]/10 text-[#F54A00] border-[#F54A00]/20' },
  Media:     { bg: 'bg-[#E60076]/10',      text: 'text-[#E60076]',     border: 'border-[#E60076]/20',   icon: 'bg-[#E60076]',     badge: 'bg-[#E60076]/10 text-[#E60076] border-[#E60076]/20' },
};
```

**Rule:** Pattern `bg-{color}/10`, `text-{color}`, `border-{color}/20` — luôn đi cùng nhau.

### Status colors

| Status | Color |
|---|---|
| On Track / Success | `text-tertiary`, `bg-tertiary` |
| At Risk | `text-amber-500`, `bg-amber-500` |
| Off Track / Critical | `text-error`, `bg-error` |
| No Data | `text-slate-400`, `bg-slate-400` |

---

## Iconography

**2 sources mix có chủ đích:**

1. **Material Symbols Outlined** (cho UI element, breadcrumb, navigation)
   ```tsx
   <span className="material-symbols-outlined text-[14px]">chevron_right</span>
   <span className="material-symbols-outlined text-[20px]">monitoring</span>
   ```
   `fontVariationSettings` cho fill state khi active:
   ```tsx
   style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
   ```

2. **Lucide React** (cho component-level icons)
   ```tsx
   import { Filter, Trash2, AlertTriangle, X } from 'lucide-react';
   <Filter size={14} />
   ```

**Rule:**
- Sidebar nav items → Material Symbols (filled state)
- Inline với text → Lucide
- Tab chips → Lucide nhỏ (size 10-13)

---

## Animation

**Library:** `motion/react` (Framer Motion v11+).

```tsx
import { motion, AnimatePresence } from 'motion/react';
```

**Common patterns:**
- Hover scale: `hover:scale-95` cho button, `group-hover:scale-150` cho decorative blob
- Transition: `transition-all duration-200 ease-in-out` (UI), `transition-transform duration-700` (decorative)
- Pulse dot: `animate-pulse`
- Progress bar: `transition-all duration-1000` (slow reveal)

---

## Responsive Strategy

**Mobile-first.** Breakpoints:
- Default: mobile
- `md:` ≥ 768px (tablet)
- `xl:` ≥ 1280px (desktop)

**Common patterns:**
- Header stack: `flex flex-col md:flex-row`
- Padding scale: `p-4 xl:p-6`
- Font scale: `text-2xl xl:text-4xl`
- Grid: `grid-cols-2 xl:grid-cols-4`
- Spacing: `py-12 md:py-20`
- Icon size: `text-3xl md:text-4xl`

---

## Common Drifts to Fix

| Drift | Where | Fix |
|---|---|---|
| Tab text size `text-[9px]` | Lead Tracker | → `text-[10px]` |
| `rounded-2xl` instead of `rounded-3xl` | Some cards | → `rounded-3xl` |
| Missing decorative blob | Some Bento cards | → Add absolute blob |
| Inconsistent button height | Dashboard buttons | → `h-10` standard |
| Hardcoded colors instead of theme tokens | Various | → Use `primary`, `error`, `tertiary` tokens |

---

## Pre-merge UI checklist

Trước khi merge UI PR:
- [ ] Reference doc này, không deviate pattern
- [ ] Page header có breadcrumb + title italic accent
- [ ] Cards dùng glassmorphism `bg-white/50 backdrop-blur-md rounded-3xl`
- [ ] Bento metric cards có decorative blob + hover animation
- [ ] Labels dùng `text-[10px] font-black uppercase tracking-widest`
- [ ] Big numbers dùng `font-headline`
- [ ] Buttons dùng `h-10 rounded-full text-[10px] uppercase tracking-widest`
- [ ] Status indicators có pulsing dot
- [ ] Mobile responsive (test ≥ 375px)
- [ ] Department colors dùng pattern `{color}/10|/20`
- [ ] Empty states có Material icon + uppercase label

---

## When to update this doc

- Khi pattern hiện tại không cover được use case mới → propose addition
- Khi phát hiện drift → document drift + add to "Common Drifts to Fix"
- Khi codebase migration đổi style guide chính thức → rewrite doc

**Owner:** Quân Bá. **Reviewer:** Code reviewer agent.
