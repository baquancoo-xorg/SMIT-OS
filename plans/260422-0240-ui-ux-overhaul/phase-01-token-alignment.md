# Phase 01 u2014 Token Alignment + Shared Components

## Overview

- **Priority:** Critical (foundation for all other phases)
- **Status:** completed
- **Effort:** ~2h

Chuu1ea9n hu00f3a viu1ec7c su1eed du1ee5ng design tokens trong shared UI components vu00e0 thu00eam 2 component mu1edbi thiu1ebfu.

## Key Insights

- `index.css` u0111u00e3 cu00f3 `--radius-action: 1rem` (16px) vu00e0 `--radius-container: 1.25rem` (20px) nhu01b0ng khu00f4ng ai du00f9ng
- `Card` du00f9ng `rounded-3xl` (24px) u2014 quu00e1 lu1edbn, viu1ec1n bo cu1eaft vu00e0o nu1ed9i dung
- `Button` du00f9ng 3 radius khu00e1c nhau theo size u2014 khu00f4ng nhu1ea5t quu00e1n
- Pattern `icon box + title + subtitle` lu1eb7p lu1ea1i 6+ lu1ea7n, chu01b0a cu00f3 shared component
- Status badge/chip hardcode `emerald/blue/red` thu1ea3 ru1ed9ng trong nhiu1ec1u file

## Requirements

### Card.tsx
- `glass` variant: `rounded-3xl` u2192 `rounded-2xl`
- `panel` variant: `rounded-3xl` u2192 `rounded-2xl`
- `flat` variant: giu1eef `rounded-2xl` (OK ru1ed3i)

### Button.tsx
- `sm`: `rounded-lg` (8px) u2192 `rounded-xl` (12px)
- `md`: giu1eef `rounded-xl` (OK)
- `lg`: `rounded-2xl` (16px) u2192 `rounded-xl` (12px)
- Ku1ebft quu1ea3: tu1ea5t cu1ea3 sizes du00f9ng `rounded-xl` nhu1ea5t quu00e1n

### Badge.tsx (mu1edbi)
Status chip du00f9ng design system colors. Thay thu1ebf hardcode `emerald/blue/amber/red` tru1ea3i khu1eafp cu00e1c file.

```tsx
interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}
```

Color mapping du00f9ng design tokens:
- `success` u2192 `bg-tertiary/10 text-tertiary` (green)
- `warning` u2192 `bg-secondary-container/50 text-secondary` (amber/orange)
- `error` u2192 `bg-error/10 text-error` (red)
- `info` u2192 `bg-primary/10 text-primary` (blue)
- `neutral` u2192 `bg-surface-container text-on-surface-variant` (gray)

### SectionHeader.tsx (mu1edbi)
Pattern lu1eb7p 6+ lu1ea7n: icon box + title + subtitle.

```tsx
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  iconColor?: string;  // default: 'text-primary'
  iconBg?: string;     // default: 'bg-primary/10'
  action?: React.ReactNode;  // optional button/slot
}
```

### ui/index.ts
Export 2 components mu1edbi: `Badge`, `SectionHeader`.

## Files to Modify

- `src/components/ui/Card.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/index.ts`

## Files to Create

- `src/components/ui/Badge.tsx`
- `src/components/ui/SectionHeader.tsx`

## Implementation Steps

1. **Su1eeda `Card.tsx`**: u0110u1ed5i `rounded-3xl` u2192 `rounded-2xl` trong cu1ea3 2 variant glass vu00e0 panel
2. **Su1eeda `Button.tsx`**: u0110u1ed5i `sm` size `rounded-lg` u2192 `rounded-xl`, `lg` size `rounded-2xl` u2192 `rounded-xl`
3. **Tu1ea1o `Badge.tsx`**: 5 variants, 2 sizes, du00f9ng design tokens
4. **Tu1ea1o `SectionHeader.tsx`**: Accept icon, title, subtitle, optional action slot
5. **Cu1eadp nhu1eadt `index.ts`**: Export `Badge`, `SectionHeader`
6. **Kiu1ec3m tra compile**: `npm run build` hou1eb7c TypeScript check

## Todo

- [x] Su1eeda `Card.tsx` u2014 giu1ea3m radius glass/panel variants
- [x] Su1eeda `Button.tsx` u2014 chuu1ea9n hu00f3a radius tu1ea5t cu1ea3 sizes
- [x] Tu1ea1o `Badge.tsx` u2014 5 variants, du00f9ng design tokens
- [x] Tu1ea1o `SectionHeader.tsx` u2014 reusable icon+title+subtitle pattern
- [x] Cu1eadp nhu1eadt `ui/index.ts` u2014 export cu1ea3 2 components mu1edbi
- [x] Compile check u2014 khu00f4ng cu00f3 TypeScript errors

## Success Criteria

- `Card` corners khu00f4ng cu1eaft vu00e0o nu1ed9i dung
- Tu1ea5t cu1ea3 Button sizes cu00f3 cu00f9ng radius
- `Badge` vu00e0 `SectionHeader` export u0111u01b0u1ee3c tu1eeb `ui/`
- Zero TypeScript errors

## Risk

- `Card` radius change u1ea3nh hu01b0u1edfng visual tou00e0n bu1ed9 app u2014 cu1ea7n kiu1ec3m tra visual sau khi deploy
- `rounded-2xl` vu1eabn u0111u1ee7 lu1edbn u0111u1ec3 giu1eef thiu1ebft ku1ebf hiu1ec7n u0111u1ea1i, nhu01b0ng khu00f4ng cu1eaft vu00e0o text
