# Phase 04 - Epic/Story Badge on Team Boards

## Context
- Plan: [plan.md](plan.md)
- Team board pages: `src/pages/TechBoard.tsx`, `src/pages/SaleBoard.tsx`, `src/pages/MarketingBoard.tsx`, `src/pages/MediaBoard.tsx`
- Sprint board: `src/pages/SprintBoard.tsx`
- Task card components: cu1ea7n scout xem mu1ed7i board du00f9ng component nu00e0o
- API: WorkItem `parent` field u0111u00e3 cu00f3 `{ id, title, type }` trong response

## Overview

**Priority:** Medium u2014 UX enhancement, khu00f4ng blocking
**Status:** pending

Thu00eam small badge/chip vu00e0o task cards trong cu00e1c team boards u0111u1ec3 hiu1ec3n thu1ecb Epic/Story mu00e0 task u0111u00f3 thuu1ed9c vu1ec1. Ngu01b0u1eddi du00f9ng cu00f3 thu1ec3 biu1ebft context khi nhu00ecn thu1ea5y task trong workspace.

**Scope giu1edbi hu1ea1n (YAGNI):**
- Chu1ec9 hiu1ec3n thu1ecb badge, khu00f4ng cu1ea7n click-through nu00e0o trong phase nu00e0y
- Badge = parent title (truncated) + type icon
- Nu1ebfu task cu00f3 `parent.type === 'UserStory'` u2192 hiu1ec3n thu1ecb tu00ean Story + Story icon
- Nu1ebfu task cu00f3 `parent.type === 'Epic'` u2192 hiu1ec3n thu1ecb tu00ean Epic + Epic icon
- Nu1ebfu khu00f4ng cu00f3 parent u2192 khu00f4ng hiu1ec3n thu1ecb gu00ec (khu00f4ng render)

## Architecture

**Shared badge component:**
```
src/components/board/parent-context-badge.tsx
```

```tsx
interface ParentContextBadgeProps {
  parent?: { id: string; title: string; type: string };
  className?: string;
}

export function ParentContextBadge({ parent, className }: ParentContextBadgeProps) {
  if (!parent) return null;
  const isEpic = parent.type === 'Epic';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold truncate max-w-[120px] ${
      isEpic ? 'bg-purple-100 text-purple-700' : 'bg-primary/10 text-primary'
    } ${className}`}>
      <span className="material-symbols-outlined text-[10px]">
        {isEpic ? 'flag' : 'book'}
      </span>
      {parent.title}
    </span>
  );
}
```

## Related Code Files

**Tu1ea1o mu1edbi:**
- `src/components/board/parent-context-badge.tsx`

**Cu1ea7n scout vu00e0 su1eeda (task card render):**
- `src/components/board/TaskCard.tsx` (nu1ebfu tu1ed3n tu1ea1i)
- Hou1eb7c inline card components trong mu1ed7i board page
- `src/pages/SprintBoard.tsx` u2014 sprint task cards

## Implementation Steps

1. **Scout task card structure** u2014 chu1ea1y Grep tu00ecm cu00e1c component render task card:
   ```
   grep -rn 'item.title\|task.title\|workItem.title' src/pages/ src/components/board/
   ```

2. **Tu1ea1o `src/components/board/parent-context-badge.tsx`** u2014 component nhu01b0 tru00ean

3. **Tu00edch hu1ee3p vu00e0o task cards** u2014 vu1edbi mu1ed7i board:
   - Import `ParentContextBadge`
   - Thu00eam `<ParentContextBadge parent={item.parent} />` bu00ean du01b0u1edbi title hou1eb7c meta row
   - Vu1ecb tru00ed: du01b0u1edbi title, tru01b0u1edbc assignee/due date meta

4. **u0110u1ea3m bu1ea3o API include `parent`** u2014 kiu1ec3m tra `GET /api/work-items` u0111u00e3 include
   `parent: { select: { id, title, type } }` trong Prisma query (trang 40 u0111u00e3 cu00f3)

## Todo

- [ ] Scout task card components trong team boards
- [ ] Tu1ea1o `src/components/board/parent-context-badge.tsx`
- [ ] Tu00edch hu1ee3p vu00e0o TechBoard task cards
- [ ] Tu00edch hu1ee3p vu00e0o SaleBoard task cards
- [ ] Tu00edch hu1ee3p vu00e0o MarketingBoard task cards
- [ ] Tu00edch hu1ee3p vu00e0o MediaBoard task cards
- [ ] Tu00edch hu1ee3p vu00e0o SprintBoard task cards

## Success Criteria

- Task thuu1ed9c Story hiu1ec3n thu1ecb badge Story name (mu00e0u primary)
- Task thuu1ed9c Epic tru1ef1c tiu1ebfp hiu1ec3n thu1ecb badge Epic name (mu00e0u purple)
- Task khu00f4ng cu00f3 parent u2192 khu00f4ng cu00f3 badge (khu00f4ng xu00e2m phu1ea1m layout)
- Badge truncate u0111u00fang khi title du00e0i
- Khu00f4ng phu00e1 vu1ee1 layout hiu1ec7n tu1ea1i cu1ee7a bu1ea5t ku1ef3 board nu00e0o

## Risk

- Mu1ed7i board cu00f3 thu1ec3 cu00f3 cu1ea5u tru00fac task card khu00e1c nhau u2014 cu1ea7n scout tru01b0u1edbc
- Nu1ebfu task card lu00e0 inline JSX trong page (khu00f4ng phu1ea3i component riu00eang), viu1ec7c thu00eam badge su1ebd lu00e0m page file du00e0i hu01a1n u2014 chu1ea5p nhu1eadn nu1ebfu < 200 lines sau khi thu00eam
