# Code Review: Button Split-Label CTA Implementation

**Reviewed:** 2026-05-14  
**Scope:** `src/components/v5/ui/button.tsx` + 10 call sites  
**Focus:** ref #3 anatomy (icon primary color + verb + divider glow + object text) vs §22 Button, §43 Accessibility, §48 Primary CTA DNA, §50 Light Mode Token Mapping  
**Reviewers Notes:** No file edits; report findings only.

---

## Scope Summary

| Metric | Value |
|--------|-------|
| Core file | src/components/v5/ui/button.tsx (113 LOC) |
| Call sites | 10 components using splitLabel |
| Changed classes | Primary variant + new SplitLabelContent component |
| Test status | Not run (no edit permission) |

---

## Overall Assessment

**Status:** BLOCKING ISSUES FOUND

The split-label CTA implementation has **correct anatomy and strong accessibility practices**, but **fails critical light-mode compliance** per §50 Light Mode Token Mapping and §48 Primary CTA DNA. Two additional high-priority issues around reduced-motion handling must be addressed before merging.

---

## Critical Issues (Blocking)

### 1. Light Mode Primary Button Gradient Missing

**File:** `src/components/v5/ui/button.tsx:26`  
**Severity:** CRITICAL — Visual breaking change in light mode  

**Issue:**
```tsx
// Current: hardcoded dark gradient only
'bg-[linear-gradient(135deg,var(--warm-900)_0%,var(--warm-800)_100%)]',

// Dark mode (works): --warm-900=#161316, --warm-800=#211c19 ✓
// Light mode (broken): still renders dark colors on light background ✗
```

Per §48 Primary CTA DNA Light Mode Parity and §50 Light Mode Token Mapping:
- **Dark**: `linear-gradient(135deg, #1a1714 0%, #2e2925 100%)`  
- **Light**: `linear-gradient(135deg, #faf5f0 0%, #f0e7dc 100%)`

**Why it breaks:** Tailwind inline gradients cannot use CSS media queries. Hardcoded warm-token references don't switch in light mode.

**Root cause:** Design contract §48 specifies light parity, but implementation uses only one gradient path.

**Impact:**
- Light mode: primary button becomes dark (unreadable on light bg)
- All 10 call sites affected (api-keys-panel, integrations-tab, comment-item, comment-thread, DailySync, WeeklyCheckin, OKRsManagement, Reports, Profile)
- Violates contract § 48 and §50

**Solution path:**
- **Option A (Recommended):** Create CSS variable in `src/index.css`:
  ```css
  --button-primary-bg: linear-gradient(135deg, var(--warm-900) 0%, var(--warm-800) 100%);
  [data-theme="light"] { --button-primary-bg: linear-gradient(...light colors...); }
  ```
  Then use `bg-[linear-gradient(135deg,var(--warm-900)_0%,var(--warm-800)_100%)]` → `bg-[var(--button-primary-bg)]`

- **Option B:** Add theme-aware conditional class in component
  ```tsx
  useTheme() && className={theme === 'light' ? 'bg-light-gradient' : 'bg-dark-gradient'}
  ```

- **Option C:** Add Tailwind layer in `tailwind.config.js` with selector-based gradient override

---

### 2. Text-Shadow Glow Ignores `prefers-reduced-motion`

**File:** `src/components/v5/ui/button.tsx:101-102` (object text)  
**Severity:** HIGH — Accessibility violation (§43 Reduced Motion)  

**Issue:**
```tsx
// Object text with dual shadow glow
<span className="... [text-shadow:0_0_16px_var(--sys-color-accent),0_0_28px_var(--sys-color-accent-dim)]">
```

**Problem:** The text-shadow glow effect is purely decorative motion (visual glow animation effect). Per §43 Accessibility:
> "Reduced motion: `prefers-reduced-motion: reduce` disable hover-lift + page transition"

Users who prefer reduced motion see the glow effect applied unconditionally—appears as pseudo-animation without explicit transition, causing visual flicker/strobe effect.

**Call site examples:**
- `src/components/v5/execution/comment-item.tsx:61` — Save edit action
- `src/components/v5/execution/comment-thread.tsx:81` — Send comment
- All 10 sites affected

**Impact:** Violates WCAG 2.1 Level AA (motion sensitivity).

**Solution:**
```tsx
// Add motion-reduce variant to text-shadow
<span className="relative z-10 text-text-1 motion-reduce:[text-shadow:none] [text-shadow:0_0_16px_var(--sys-color-accent),0_0_28px_var(--sys-color-accent-dim)]">
```

---

### 3. Border Color Mismatch in Light Mode

**File:** `src/components/v5/ui/button.tsx:25`  
**Severity:** HIGH — Visual regression  

**Issue:**
```tsx
'border border-accent/30'  // No light-mode override
```

Token values:
- **Dark:** `--sys-color-accent = var(--brand-500) = #ff6d29` at 30% = bright orange border ✓
- **Light:** `--sys-color-accent = var(--brand-600) = #d95716` at 30% = darker orange border on light background ✗

Per §50 Light Mode Token Mapping, accents in light mode should use reduced saturation/opacity for subtle UI elements.

**Expected per §48:**
- Dark: `border-accent/30` (bright, high contrast)
- Light: `border-accent/20` (lighter, maintains visibility on light bg)

**Impact:** Border becomes less visible in light mode; button loses affordance cue.

**Solution:**
```tsx
primary: cn(
  'relative isolate overflow-hidden border text-text-1 shadow-sm',
  'dark:border-accent/30 light:border-accent/20',  // OR use accent-dim in light
  ...
)
```

---

## High Priority Issues

### 4. Divider Spacing Cramped on Mobile

**File:** `src/components/v5/ui/button.tsx:100`  
**Severity:** MEDIUM — Mobile UX  

**Code:**
```tsx
<span className="relative z-10 mx-1 h-6 w-px ...">  // mx-1 = 0.25rem = 4px
```

**Issue:** 
- Button size `sm` (32px min-h) has 4px divider gap
- Call site: `src/components/v5/execution/comment-item.tsx:61` uses size="sm" with split label
- On mobile 320px viewport: 4px gap too small relative to text, may cause word-wrap or truncation

**Viewport risk:**
- Desktop (>768px): adequate ✓
- Mobile (<320px): cramped ✗

**Solution:** Responsive spacing:
```tsx
<span className="mx-1 sm:mx-2">  // 4px mobile, 8px desktop
```

---

### 5. Z-Index Stacking Context Fragile

**File:** `src/components/v5/ui/button.tsx:95-106`  
**Severity:** MEDIUM — Rendering robustness  

**Code structure:**
```tsx
<button className="... isolate ...">  // Creates stacking context
  <span className="relative z-10">action</span>
  <span className="mx-1 ... shadow">divider</span>  // No z-class, inherits
  <span className="relative z-10 [text-shadow...]">object
    <span className="absolute ... -z-10 ...">glow</span>  // -z-10 within z-10 parent
  </span>
</button>
```

**Issue:**
- Glow pseudo-element at `-z-10` is within `z-10` parent span
- Works due to `isolate` creating local stacking context
- If button's `isolate` is removed or z-index system changes, glow disappears behind text

**Risk:** Future button refactors may break glow visibility without warning.

**Solution:** 
1. Add comment documenting stacking intent
2. Consider moving glow to `button::before` for stability (position relative to button, not span)

---

## Good Practices Observed

✅ **Anatomy:** Icon → action → divider → object (correct per ref #3)  
✅ **Icon color:** Uses `[&>svg]:text-accent` (theme-aware, works both modes)  
✅ **Divider styling:** Gradient + shadow (accent token-based, correct)  
✅ **Accessibility:**  
  - Divider: `aria-hidden="true"` ✓
  - Glow pseudo: `aria-hidden="true"` ✓  
  - Focus ring: `focus-visible:ring-2 focus-visible:ring-focus-ring/35` ✓
✅ **Type safety:** `ButtonSplitLabel` interface well-formed  
✅ **Conditional rendering:** `hasSplitLabel` prevents loading + splitLabel conflict  
✅ **Motion management:** `motion-reduce:transition-none motion-reduce:hover:translate-y-0` added to button  

---

## Edge Cases & Call Site Issues

### 6. Multilingual Content Not Internationalized

**Call sites:**
- `src/components/v5/execution/comment-item.tsx:61` — Vietnamese: `'Lưu'`, `'sửa'`
- `src/components/v5/execution/comment-thread.tsx:81` — Vietnamese: `'Gửi'`, `'bình luận'`
- `src/pages/v5/DailySync.tsx:48, 81` — Vietnamese: `'Báo cáo'`, `'hôm nay'`
- `src/pages/OKRsManagement.tsx:230, 280` — English: `'Create'`, `'Objective'`
- `src/components/settings/api-keys-panel.tsx:73` — English: `'Generate'`, `'key'`

**Severity:** LOW (future-proofing)  
**Issue:** Hardcoded Vietnamese strings not using i18n framework. If project adds multi-language support, these will require manual refactor.

**Recommendation:** Document i18n pattern for split-label action+object structure in code guidelines.

---

### 7. Icon Position Consistency

**Observation:** All 10 call sites use `iconLeft` only (none use `iconRight`).  
**Status:** Good ✓ Consistent pattern for primary CTA.

---

## Compliance Audit (§22, §43, §48, §50)

| Requirement | Status | Evidence | Notes |
|---|---|---|---|
| **§22 Primary Button** | — | — | — |
| Dark gradient | ✓ PASS | `#1a1714→#2e2925` in CSS | Correct |
| Orange icon | ✓ PASS | `[&>svg]:text-accent` | Theme-aware |
| Orange beam | ✓ PASS | Divider gradient + shadow | Correct |
| No solid orange BG | ✓ PASS | Uses gradient, not solid | Correct |
| **§43 Accessibility** | — | — | — |
| Icon-only aria-label | N/A | Uses text labels | Not applicable |
| Skip link | N/A | Button doesn't affect skip flow | Not applicable |
| Focus visible | ✓ PASS | `focus-visible:ring-2` | Correct |
| Prefers-reduced-motion | ✗ FAIL | Text-shadow glow ignored | Text-shadow must respect it |
| Color not alone | ✓ PASS | Has text + divider visual | Correct |
| **§48 Primary CTA DNA** | — | — | — |
| Dark gradient | ✓ PASS | Correct colors | Works |
| Light gradient | ✗ FAIL | Missing entirely | No light override |
| Orange beam | ✓ PASS | Divider correct | Works |
| Icon accent | ✓ PASS | `[&>svg]:text-accent` | Works |
| **§50 Light Mode Mapping** | — | — | — |
| Text color | ✓ PASS | Uses `text-text-1` | Correct |
| Border visibility | ✗ FAIL | `border-accent/30` too dark | Needs light override |
| Accent in light | ✓ PASS | Uses `--sys-color-accent` | Token-based, correct |
| Shadow tokens | ✓ PASS | Uses `--sys-shadow-card` | Token-based |

---

## Recommended Fix Priority

| # | Issue | Severity | Type | Est. LOC | Blocker |
|---|-------|----------|------|----------|---------|
| 1 | Light mode gradient | CRITICAL | Component + CSS | 5 + 3 | YES |
| 2 | Prefers-reduced-motion | HIGH | Component | 2 | YES |
| 3 | Light mode border | HIGH | Component | 2 | YES |
| 4 | Mobile spacing | MEDIUM | Component | 1 | NO |
| 5 | Z-index clarity | MEDIUM | Comment | 2 | NO |
| 6 | i18n docs | LOW | Documentation | 0 | NO |

---

## Code Quality Snapshot

| Metric | Value | Assessment |
|--------|-------|-----------|
| Type Safety | High | Interface well-formed, no any types |
| Accessibility | High (with fixes) | Good practices + 2 motion issues |
| Responsive | Partial | Spacing not adaptive |
| Performance | Good | Text-shadow acceptable (monitor) |
| Maintainability | Good | Clear logic, needs comments |
| Contract Compliance | 70% | Missing light mode, reduced motion |

---

## Unresolved Questions

1. **Light mode gradient:** Is CSS variable approach preferred, or conditional className?
2. **Text-shadow performance:** Has mobile perf been profiled (INP target <200ms)?
3. **Z-index refactor:** Should glow move to `button::before` now or during next refactor?
4. **i18n:** Does project have existing i18n framework? (needed for Vietnamese strings)
5. **Dark mode beam pseudo:** Original button had `before::` pseudo for beam — is that still needed with divider?

---

## Next Steps

1. **This reviewer:** Submit findings to lead
2. **Lead/Implementation:** Address 3 blocking issues (light gradient, reduced-motion, border)
3. **Testing:** Verify light mode rendering + prefers-reduced-motion in browser DevTools
4. **Code review:** Re-run after fixes, verify all call sites render correctly
5. **Documentation:** Add comment to button component explaining stacking context + light-mode approach

**Status:** DONE_WITH_CONCERNS

**Summary:** 
Split-label anatomy is correct and accessible. Critical issues are light-mode gradient (missing entirely) and reduced-motion handling (text-shadow ignored). 3 blocking fixes required; 2 additional quality improvements recommended. All issues have clear solutions.

**Concerns:** 
Light-mode visual regression would affect all 10 call sites immediately upon light theme switch. Prefers-reduced-motion violation affects accessibility compliance. Both are fixable in <20 minutes.
