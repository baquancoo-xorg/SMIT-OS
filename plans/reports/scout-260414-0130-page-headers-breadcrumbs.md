# Scout Report: Page Headers & Breadcrumbs

## Summary

Found **9 page components** with Title/Sub-title (breadcrumb-style) headers. **No shared PageHeader component exists** - each page implements headers inline with consistent patterns.

---

## Pages with Breadcrumb + Title Headers

### Pattern A: Large Headers (text-4xl) + Breadcrumb (text-sm)
Used for dashboard/management pages.

| Page | File Path | Breadcrumb Line | Title Line |
|------|-----------|-----------------|------------|
| PMDashboard | `src/pages/PMDashboard.tsx` | L162-165 | L167 |
| OKRsManagement | `src/pages/OKRsManagement.tsx` | L154-157 | L159 |
| DailySync | `src/pages/DailySync.tsx` | L85-88 | L90-91 |
| SaturdaySync | `src/pages/SaturdaySync.tsx` | L87-90 | L92 |
| Settings | `src/pages/Settings.tsx` | None | L190 |
| Profile | `src/pages/Profile.tsx` | None | L11 |

### Pattern B: Medium Headers (text-3xl) + Breadcrumb (text-xs) + Icon
Used for workspace/board pages.

| Page | File Path | Breadcrumb Line | Title Line |
|------|-----------|-----------------|------------|
| TechBoard | `src/pages/TechBoard.tsx` | L294-297 | L299-304 |
| MarketingBoard | `src/pages/MarketingBoard.tsx` | L294-297 | L299-304 |
| MediaBoard | `src/pages/MediaBoard.tsx` | L292-295 | L297-302 |
| SaleBoard | `src/pages/SaleBoard.tsx` | L292-295 | L297-302 |
| ProductBacklog | `src/pages/ProductBacklog.tsx` | L178-181 | L183-188 |

---

## Styling Patterns

### Breadcrumb Nav Pattern
```tsx
<nav className="flex items-center gap-2 mb-1|mb-2 text-on-surface-variant font-medium text-xs|text-sm">
  <span className="hover:text-primary cursor-pointer">{Category}</span>
  <span className="material-symbols-outlined text-[12px]|text-[14px]">chevron_right</span>
  <span className="text-on-surface">{SubPage}</span>
</nav>
```

### Title Variants

**Pattern A (Dashboard style):**
```tsx
<h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
  {Title} <span className="text-primary|text-tertiary italic">{Accent}</span>
</h2>
```

**Pattern B (Workspace style with icon):**
```tsx
<h2 className="text-3xl font-black font-headline tracking-tight text-on-surface flex items-center gap-3">
  <span className="w-10 h-10 rounded-xl bg-{color}/10 flex items-center justify-center text-{color}">
    <Icon size={20} />
  </span>
  {Title}
</h2>
```

---

## Key Files

1. `/Users/dominium/Documents/Project/SMIT-OS/src/pages/PMDashboard.tsx` - L160-168
2. `/Users/dominium/Documents/Project/SMIT-OS/src/pages/TechBoard.tsx` - L291-305
3. `/Users/dominium/Documents/Project/SMIT-OS/src/pages/MarketingBoard.tsx` - L292-305
4. `/Users/dominium/Documents/Project/SMIT-OS/src/pages/MediaBoard.tsx` - L290-303
5. `/Users/dominium/Documents/Project/SMIT-OS/src/pages/SaleBoard.tsx` - L290-303
6. `/Users/dominium/Documents/Project/SMIT-OS/src/pages/ProductBacklog.tsx` - L175-189
7. `/Users/dominium/Documents/Project/SMIT-OS/src/pages/OKRsManagement.tsx` - L150-160
8. `/Users/dominium/Documents/Project/SMIT-OS/src/pages/DailySync.tsx` - L82-92
9. `/Users/dominium/Documents/Project/SMIT-OS/src/pages/SaturdaySync.tsx` - L84-93
10. `/Users/dominium/Documents/Project/SMIT-OS/src/pages/Profile.tsx` - L10-12 (no breadcrumb)
11. `/Users/dominium/Documents/Project/SMIT-OS/src/pages/Settings.tsx` - L188-191 (no breadcrumb)

---

## No Shared Component

- `src/components/layout/Header.tsx` - Global app header with search, NOT a page header component
- No `PageHeader`, `Breadcrumb`, or similar shared component exists
- Each page implements header inline

---

## Breadcrumb Content Map

| Page | Breadcrumb Path |
|------|-----------------|
| PMDashboard | Overview > Dashboard |
| TechBoard | Tech&Product > Agile Board |
| MarketingBoard | Marketing > Campaigns |
| MediaBoard | Media > Production |
| SaleBoard | Sales > Kanban |
| ProductBacklog | Tech&Product > Backlog |
| OKRsManagement | Strategy > OKRs Management |
| DailySync | Sync > Daily Report |
| SaturdaySync | Sync > Weekly Report |

---

**Status:** DONE
**Summary:** Identified 9 pages with breadcrumb+title patterns, 2 variants (dashboard vs workspace), no shared component exists.
