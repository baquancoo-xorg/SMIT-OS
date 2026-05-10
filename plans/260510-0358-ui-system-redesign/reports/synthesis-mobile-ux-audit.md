# Mobile UX Audit — Synthesis Report

**Audited:** DailySync, WeeklyCheckin (+ modal components), LoginPage
**Focus:** Mobile-critical checkin flows vs. auth page baseline
**Date:** 2026-05-10

---

## Executive Summary

Three auth/checkin pages audited against style guide + WCAG + mobile UX standards.

**Verdict:** Checkin pages have critical mobile friction; LoginPage is baseline reference.

| Page | Mobile Readiness | Key Issues | Fixable |
|------|------------------|-----------|---------|
| **DailySync** | 3/10 | Sticky button, touch targets, form error handling | Yes (all critical) |
| **WeeklyCheckin** | 4/10 | Modal overflow, slider UX, form state loss | Yes (with refactor) |
| **LoginPage** | 8/10 | Minor accessibility, soft keyboard test needed | Yes (all minor) |

---

## Critical Cross-Page Findings

### 1. Visual Drift (Quick Wins — 5-10 min fixes)

**Count:** 12 violations across 3 pages

```
DailySync:
  - rounded-2xl on inputs (L222, 345) → rounded-3xl
  - Missing glass card detail modal
  - Missing decorative blob
  
WeeklyCheckin:
  - rounded-2xl on inputs (L224, 240, 254) → rounded-3xl  
  - rounded-2xl on KrCheckinRow card (L12) → rounded-3xl
  - Missing glass card modal detail header
  - Missing decorative blob
  
LoginPage:
  - py-4 buttons (non-standard but justified as CTA prominence)
  - ✓ Otherwise compliant
```

**Effort:** 2 hours (grep + replace, add blob components)

---

### 2. Mobile Touch Targets (HIGH PRIORITY)

**Problem:** Buttons/inputs below 44px recommendation

| Component | Current | Target | Pages |
|-----------|---------|--------|-------|
| Modal close (X) | `p-2` (32px) | `p-3` (44px) | DailySync, WeeklyCheckin |
| Form buttons | `py-2.5` (40px) | `h-10 py-3` (44px+) | DailySync, WeeklyCheckin |
| KrCheckinRow inputs | `py-2` (28px) | `py-3` (36px+) | WeeklyCheckin |
| Add priority button | `text-xs` | `text-sm py-2.5` | WeeklyCheckin |
| Delete row button | `text-xs` | Icon button `p-3` | WeeklyCheckin |
| Password toggle | `p-1.5` (32px) | Acceptable (secondary) | LoginPage ✓ |
| TOTP input | `py-4` | Good ✓ | LoginPage |

**Impact:** Prevents mis-taps on mobile users. Especially critical for nhân sự using on mobile.

**Effort:** 1-2 hours

---

### 3. Form State & Friction (MEDIUM PRIORITY)

| Issue | DailySync | WeeklyCheckin | LoginPage | Fix |
|-------|-----------|---------------|-----------|-----|
| Autosave | MISSING | MISSING | N/A | localStorage backup |
| Dirty state warning | MISSING | MISSING | N/A | Warn before close |
| Inline validation | None | None | N/A | Check required fields |
| Error handling | `alert()` | `alert()` | Banner ✓ | Use toast/banner |
| Optimistic UI | Missing | Missing | N/A | Reduce perceived lag |

**Pain:** User fills form → navigates back → ALL DATA LOST (DailySync, WeeklyCheckin)

**Effort:** 3-4 hours (localStorage + state tracking + toast component)

---

### 4. Modal Overflow & Sticky Buttons (CRITICAL)

**DailySync Modal (L203-272)**
- Max-height: 90vh → on iPhone 12 mini (667px) = 600px modal
- 2 form blocks + buttons don't fit without scrolling
- **Issue:** Submit button scrolls off-screen on mobile

**WeeklyCheckin Modal (L125-272)**  
- Max-height: 90vh same problem
- 5 content blocks squeeze into 600px viewport
- **Issue:** Cannot see "Gửi check-in" without scrolling to bottom
- Landscape 667px: Modal becomes cramped vertically

**LoginPage**
- No scrollable modal, single-step or 2-step form — **NO PROBLEM** ✓

**Solution:** Use sticky footer inside modal
```tsx
<div className="flex-1 overflow-y-auto">
  {/* content */}
</div>
<div className="sticky bottom-0 px-8 py-6 border-t bg-white/95 backdrop-blur">
  {/* buttons */}
</div>
```

**Effort:** 1 hour per modal

---

### 5. Accessibility Gaps (WCAG COMPLIANCE)

| Issue | Severity | DailySync | WeeklyCheckin | LoginPage |
|-------|----------|-----------|---------------|-----------|
| Missing `role="dialog"` | High | ✗ | ✗ | N/A |
| Missing `aria-modal` | High | ✗ | ✗ | N/A |
| Labels without `htmlFor` | Medium | ✗ | ✗ | ✗ Partial |
| Escape key close | Medium | ✗ | ✗ | N/A |
| Focus management | Medium | ✗ | ✗ | N/A |
| Slider no keyboard alt | Medium | N/A | ✗ | N/A |
| Unicode section numbers | Low | ✗ | ✗ | N/A |

**Impact:** Screen reader users + keyboard-only users blocked from checkin workflows

**Effort:** 2-3 hours

---

### 6. Slider Mobile UX (MEDIUM PRIORITY — WeeklyCheckin Only)

**ConfidenceSlider.tsx (L1-31)**
- Native HTML5 range input: OK on desktop, problematic on mobile
  
**Issues:**
- No keyboard input alternative (can't type "7", must drag)
- Slider knob small on mobile (< 44px touch target)
- No haptic feedback during drag (iOS/Android)
- Desktop users also affected (can't type precision values)

**Solution:** Dual input pattern
```tsx
<div className="flex items-center gap-3">
  <input type="range" ... /> {/* Slider */}
  <input 
    type="number" 
    min={0} 
    max={10} 
    value={value}
    onChange={...}
    className="w-12 text-center"
  /> {/* Direct input */}
</div>
```

**Effort:** 1 hour

---

## Soft Keyboard Handling (UNTESTED)

**Android-specific issue:** When soft keyboard opens, form pushes off-screen

**Test needed on:**
- Android Chrome: DailySync portrait + landscape
- Android Chrome: WeeklyCheckin portrait + landscape
- iOS: Both (iOS handles better but verify)

**Mitigation:** Add `overflow-y-auto` to form container, test viewport-fit

**Effort:** 1 hour research + fixes

---

## Page-by-Page Severity Ranking

### 🔴 DailySync (CRITICAL)

**Top 5 blockers:**
1. Sticky submit button (can't submit without scrolling)
2. Modal close button too small (mis-taps)
3. Alert() error handling (crude UX)
4. No form autosave (data loss risk)
5. rounded-2xl → rounded-3xl drift

**Time to fix:** 4 hours

---

### 🟠 WeeklyCheckin (HIGH)

**Top 5 blockers:**
1. Modal overflow on mobile landscape
2. Sticky submit button
3. Confidence slider no keyboard alt (friction)
4. Touch sizes: inputs, checkboxes, delete button
5. Form state loss risk

**Time to fix:** 5-6 hours (includes slider refactor)

---

### 🟢 LoginPage (GOOD)

**Top 3 minor improvements:**
1. Soft keyboard test on Android landscape
2. ARIA labels on password toggle
3. Prefers-reduced-motion support for animations

**Time to fix:** 1 hour

---

## Drift Inventory Summary

**Total violations: 12**

| Category | Count | Pages |
|----------|-------|-------|
| `rounded-2xl` should be `rounded-3xl` | 6 | DailySync (2), WeeklyCheckin (4) |
| Missing glass card styling | 2 | DailySync, WeeklyCheckin |
| Missing decorative blob | 2 | DailySync, WeeklyCheckin |
| Page header missing | 2 | DailySync, WeeklyCheckin |

**All fixable in 2-3 hours with grep/replace + component additions.**

---

## Form Friction Comparison

| Metric | DailySync | WeeklyCheckin | LoginPage |
|--------|-----------|---------------|-----------|
| Required field validation | None | None | Server-side ✓ |
| Autosave | No | No | N/A |
| Dirty state warning | No | No | N/A |
| Error handling | alert() | alert() | Banner ✓ |
| Optimistic UI | No | No | N/A |
| Loading feedback | Text | Text | Spinner ✓ |
| Form cancellation | Close button | Close button | Back button ✓ |
| Data preservation | Lost on nav | Lost on nav | Single-step |

**Checkin pages rank LOWEST in friction metrics.**

---

## Mobile Readiness Scorecard

### DailySync (3/10)
- ✓ Modal styling (rounded-3xl)
- ✓ Form semantic HTML
- ✗ Touch targets too small
- ✗ Sticky submit button
- ✗ Form state loss
- ✗ Error handling (alert)
- ✗ No autosave
- ✗ Typography too small on mobile
- ✗ No soft keyboard handling

### WeeklyCheckin (4/10)
- ✓ Modal styling (mostly)
- ✓ Form semantic HTML
- ✓ TOTP numeric input (good pattern)
- ✗ Modal height on landscape
- ✗ Slider friction
- ✗ Touch targets too small
- ✗ Sticky submit button
- ✗ Form state loss
- ✗ No autosave

### LoginPage (8/10)
- ✓ Excellent 2FA UX
- ✓ Touch targets ≥ 44px
- ✓ Proper input types + autocomplete
- ✓ Error banner (not alert)
- ✓ Spinner animation
- ✓ Responsive layout
- ✗ No aria-labels on toggle button
- ✗ Soft keyboard test needed (Android)
- ✗ No prefers-reduced-motion

---

## Recommended Fix Priority

### Phase 1 (Today — 2-3 hours) — Visual Drift Cleanup
1. Replace all `rounded-2xl` with `rounded-3xl` (grep/replace)
2. Add glass card styling to modals
3. Add decorative blobs to modal headers
4. Fix page headers with breadcrumb + italic accent

**Impact:** Brings pages into style guide compliance, no logic changes

---

### Phase 2 (Tomorrow — 4 hours) — Mobile Touch + Sticky Buttons
1. Increase all button/input padding to ≥ 44px
2. Add sticky footer to both checkin modals
3. Expand close button touch target

**Impact:** Makes forms usable on mobile phones

---

### Phase 3 (Day 3 — 4 hours) — Form Friction & Error Handling
1. Replace `alert()` with toast notification component
2. Add localStorage autosave for checkin forms
3. Add dirty state tracking + close confirmation
4. Implement client-side validation (required fields)

**Impact:** Prevents data loss, improves error UX

---

### Phase 4 (Day 4 — 2 hours) — Accessibility
1. Add `role="dialog"`, `aria-modal="true"` to modals
2. Add `htmlFor` to all form labels
3. Add `aria-label` to icon buttons
4. Implement Escape key close for modals
5. Focus management (return focus on close)

**Impact:** Screen reader + keyboard-only users can now use checkins

---

### Phase 5 (Optional) — Polish
1. Confidence slider keyboard alternative (number input)
2. Soft keyboard testing + Android fixes
3. Prefers-reduced-motion for LoginPage animations
4. Loading skeletons for table views

---

## Unresolved Questions

1. **iOS soft keyboard:** Does it push DailySync/WeeklyCheckin forms off-screen? (Need device test)
2. **Landscape orientation:** Does WeeklyCheckin modal fit on 667px height (iPhone 12 mini landscape)?
3. **Form recovery:** Should checkin forms auto-save to localStorage as backup?
4. **Slider alternative:** Should confidence slider have +/- buttons or number input?
5. **Table on mobile:** Would table view (not modal) work better for mobile weekly checkin?
6. **Soft keyboard:** Does Android soft keyboard cover TOTP input on LoginPage? (Need test)
7. **Backup codes:** Are TOTP backup codes documented to users before setup?

---

## Reference: LoginPage as Baseline

LoginPage exemplifies **mobile-optimized auth UX** — use as template for checkin form improvements:

✓ Proper touch targets (py-3.5, py-4)
✓ Semantic form + input types
✓ Banner error messaging (not alert)
✓ Clear loading feedback (spinner + text)
✓ Auto-focus on TOTP step
✓ Responsive layout (hides hero on mobile, OK)
✓ Good password visibility toggle
✓ Smooth step transitions

**Checkin pages should adopt same patterns.**

---

## Effort Estimate Summary

| Phase | Hours | Impact |
|-------|-------|--------|
| Phase 1: Visual drift | 2-3 | High (style compliance) |
| Phase 2: Mobile touch + sticky | 4 | High (usability) |
| Phase 3: Form friction | 4 | High (data safety) |
| Phase 4: Accessibility | 2-3 | High (WCAG compliance) |
| Phase 5: Polish | 2-3 | Low (nice-to-have) |
| **Total** | **14-16** | **All critical, staged rollout** |

---

## Key Takeaway

**Checkin pages prioritize feature completeness over mobile UX.** Critical fixes (sticky buttons, touch sizes, form error handling) are straightforward but urgent given 80% mobile usage by nhân sự.

LoginPage demonstrates achievable mobile baseline — apply same rigor to checin workflows.
