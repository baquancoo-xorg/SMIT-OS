# Phase 4: Responsive Sizing

## Overview
- **Priority:** Medium
- **Status:** pending
- **Estimated:** 1.5 hours

Element/text quá to trên tablet. Cần scale down.

## Current Issues

- OKRs page: text/cards quá to
- Stats cards: chiếm quá nhiều space
- General typography không scale

## Implementation

### Step 1: Add tablet-specific typography scale

**File:** `src/index.css`

```css
/* Tablet typography adjustments */
@media (min-width: 768px) and (max-width: 1439px) {
  h1 { font-size: clamp(1.5rem, 4vw, 2rem); }
  h2 { font-size: clamp(1.25rem, 3vw, 1.5rem); }
  h3 { font-size: clamp(1rem, 2.5vw, 1.25rem); }
  
  .stat-value {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
  }
}
```

### Step 2: Update card sizing for tablet

```css
@media (min-width: 768px) and (max-width: 1439px) {
  .stat-card {
    padding: 1rem;
    min-height: 100px;
  }
  
  .card {
    padding: 1rem;
  }
}
```

### Step 3: OKRs page specific fixes

**File:** `src/pages/OKRsPage.tsx`

Review và add responsive classes:
- Grid columns: `grid-cols-1 tablet:grid-cols-2 xl:grid-cols-3`
- Card padding: reduce on tablet
- Progress bars: maintain readability

### Step 4: Dashboard stats responsive

**File:** `src/pages/DashboardPage.tsx` (hoặc component tương ứng)

```tsx
// Stats grid
<div className="grid grid-cols-2 tablet:grid-cols-2 xl:grid-cols-4 gap-4">
```

### Step 5: Touch targets verification

Ensure all interactive elements:
- Min height: 44px
- Min touch area: 44x44px
- Adequate spacing between targets

```css
.touch-target {
  min-height: var(--touch-min); /* 44px */
  min-width: var(--touch-min);
}
```

## Todo

- [ ] Add tablet typography media queries
- [ ] Update card/stat sizing for tablet
- [ ] Review OKRs page layout
- [ ] Review Dashboard stats grid
- [ ] Verify touch targets ≥ 44px
- [ ] Test on iPad portrait/landscape

## Success Criteria

- Text readable but not oversized on tablet
- Cards utilize space efficiently
- All buttons/links have 44px touch targets
- No cramped or overflow elements
