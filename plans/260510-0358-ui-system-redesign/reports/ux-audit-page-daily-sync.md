# UX Audit — DailySync Page

**Status:** CRITICAL mobile-first violations + form friction

## Quick Stats
- **LOC:** 351
- **Components:** 3 (main + FormBlock + DetailBlock)
- **Mobile-critical:** YES — nhân sự checkin on mobile 80% of time
- **Modals:** 2 (submit form + detail view)

---

## 1. Visual Drift Inventory

| Pattern | Found | Expected | Severity |
|---------|-------|----------|----------|
| `rounded-2xl` on input | 2 (L222, 345) | `rounded-3xl` per style guide | **HIGH** |
| Glass card missing | 1 (detail block L345) | `bg-white/50 backdrop-blur-md rounded-3xl` | HIGH |
| Modal card: `rounded-3xl` ✓ | L204, 279 | — | OK |
| Decorative blob missing | Both modals | Should have blob in header | MEDIUM |
| Page header structure | Missing | Needs breadcrumb + title split | HIGH |
| Button height inconsistent | `py-2.5` (L261, 298) | `h-10` standard | MEDIUM |

**DRIFT COUNT:** 5 violations

---

## 2. Mobile UX Issues (CRITICAL)

### 2.1 Touch Target Sizes (FAIL)
- **Close button (X icon):** `p-2` (L210, 285) = 32px × 32px → **Below 44px minimum**
  - Risky on mobile for precision users
  - Should be `p-3` (44px) or `p-4` (52px)
  
- **Submit button:** `py-2.5` (L269) = 40px tall → **Below 44px ideal**
  - Should be `py-3` or `h-10` (40px min OK, but 44px preferred)
  
- **Cancel button:** `py-2.5` (L261) = 40px → Same issue

- **"Huỷ" text button (L304):** `py-2.5` + implicit tap zone = too small

### 2.2 Modal Viewport (MAJOR)
- **Max-height:** `max-h-[90vh]` (L204, 279)
  - On iPhone 12 mini (667px), 90vh = 600px
  - Form content + scrolling works BUT tight
  - **Issue:** Bottom action buttons become sticky/hard to reach on small phones (< 375px width)
  - **Test case:** Modal footer buttons unreachable without scrolling all the way down on landscape orientation

### 2.3 Textarea Input Mobile Usability (FRICTION)
- **Min-height:** `min-h-[120px]` (L336) — reasonable
- **Resize mode:** `resize-vertical` (L336) — OK for mobile
- **BUT:** Focus styling on textarea `focus:ring-2` may trigger iOS zoom when focused
  - Mitigation: Add `@supports (-webkit-touch-callout: none)` to disable zoom-on-focus (but not in code currently)

### 2.4 Date Input Mobile (MINOR FRICTION)
- **Input type:** `type="date"` (L218) — ✓ Good, native picker on mobile
- **Styling:** `rounded-2xl` (L222) should be `rounded-3xl`
- **No mobile-specific padding:** `px-4 py-3` works but could be `px-4 py-3.5` for better touch

### 2.5 No Sticky Save Button
- **Form footer (L260-272):** Uses fixed positioning indirectly via `flex-col` layout
- **ISSUE:** On mobile, user must scroll all the way to bottom to see "Gửi báo cáo" button
- **Mobile pattern missing:** Should sticky float bottom or sticky footer (like modern apps: Slack, Discord, Messenger)
  - Current: UX assumes desktop scrolling behavior

### 2.6 Typography Responsiveness
- **Modal header font:** `text-2xl` (L208, 282) — OK on mobile but could be `text-lg md:text-2xl`
- **Labels:** `text-xs` (L217) — too small on mobile (<12px), should be at least `text-sm md:text-xs`
- **Form block labels:** `text-xs font-bold` (L328, 346) — same issue

---

## 3. Form Friction Analysis

### 3.1 Validation & Error Feedback
- **No inline validation** — form allows empty fields to be submitted
- **No client-side required checks** on textarea fields
- **Error messaging:** Only `alert()` (L119, 126) — crude, blocks interaction
  - Should use toast or inline error banner (see LoginPage for better pattern)

### 3.2 Form State Management
- **No autosave** — lose data on back button
- **No form dirty state tracking** — can accidentally close form with data loss
- **No confirmation dialog** if closing with unsaved data

### 3.3 Submission Experience
- **Loading state:** `disabled={submitting}` ✓ Good
- **Loading text:** "Đang gửi..." ✓ Clear
- **But:** Button text hardcoded, no spinner visual — slower perceived performance
- **No optimistic UI** — form stays open until response, feels slow

### 3.4 Keyboard Navigation (Mobile)
- **No autofocus on form open** — user must tap username field manually
- **No tab order optimization** for mobile (though less critical than desktop)
- **Textarea resize handle:** May be hard to grab on mobile

### 3.5 Data Preservation
- **"Quay lại" (L304):** Back button closes detail modal but doesn't prevent data loss
- **Soft keyboard:** No consideration for keyboard cover (Android keyboard pushes content)

---

## 4. Loading / Error / Empty States

### 4.1 Loading State (Page Level)
- **Skeleton:** None — shows "Đang tải..." (L162)
- **Issue:** Text-only loading is dull + doesn't indicate what's loading
- **Missing:** Skeleton table with 3-5 placeholder rows for context

### 4.2 Empty State (Page Level)
- **Current:** "Chưa có báo cáo nào." (L164)
- **Missing:** 
  - Icon (per style guide, should use Material symbol)
  - CTA button ("Tạo báo cáo mới" should redirect to form)
  - Proper padding + styling per guide (L135-140 in style-guide.md)

### 4.3 Form Error Handling
- **Current:** `alert()` (L119, 126)
- **Issues:**
  - Blocks interaction (modal takes focus)
  - Doesn't preserve error context
  - No recovery guidance
  - "Lỗi: {err.error || 'Submit thất bại'}" is technical, not user-friendly

### 4.4 Modal Error State
- **No error boundary** inside modal
- **No retry mechanism** — user must close + reopen form
- **No network detection** — same error for offline vs. server error

---

## 5. Accessibility Gaps

### 5.1 ARIA Labels (MISSING)
- **Modal dialog:** No `role="dialog"` or `aria-modal="true"` (L203, 278)
- **Close button:** No `aria-label="Close"` (L210, 285)
- **Form labels:** No explicit association via `htmlFor` (L216, 327)
- **Textarea:** Missing `aria-label` for context (L332)

### 5.2 Focus Management (MISSING)
- **Modal open:** Focus not moved to first input field
- **Modal close:** Focus not returned to trigger button
- **Form blocks:** No logical tab order (browser default, may not be semantic)

### 5.3 Semantic HTML (PARTIAL)
- **Form:** Uses semantic `<form>` ✓ (L323)
- **Labels:** Uses `<label>` ✓ (L216, 327, 340)
- **But:** Labels not associated via `htmlFor` ✗ (should point to input ID)

### 5.4 Keyboard Support
- **Escape key:** Not captured to close modal (must click X or Cancel)
- **Enter key:** Form submit works but no clear CTA focus styling

### 5.5 Color Contrast (NEEDS CHECK)
- **Error message red:** `text-red-600` on `bg-red-50` — likely fails WCAG AA (need exact ratio)
- **Placeholder text:** `placeholder:text-slate-400` on `bg-slate-50` — marginal contrast

---

## 6. Mobile-Specific Checklist Failures

| Check | Status | Impact |
|-------|--------|--------|
| Touch targets ≥ 44px | FAIL | Small buttons on mobile |
| No zoom-on-focus | PARTIAL | CSS OK but no viewport meta |
| Sticky save button | FAIL | Must scroll to submit |
| Responsive typography | FAIL | Too small on mobile |
| No modal overflow | FAIL | 90vh modal can overflow on landscape |
| Portrait/landscape support | UNTESTED | Likely breaks on landscape 667px |
| One-handed reach | FAIL | Close button top-right, far reach |
| Soft keyboard consideration | FAIL | No bottom padding for Android |

---

## 7. Top 5 Actionable Fixes (Priority Order)

1. **Sticky footer save button** — Change modal footer to `sticky bottom-0` + z-index handling
   - Impact: Makes form submittable without scrolling on all phone sizes
   
2. **Touch target sizes** — Increase close + action buttons to `p-3` (44px), buttons to `h-10` + proper vertical padding
   - Impact: Prevents mis-clicks on mobile users
   
3. **Visual drift fixes:**
   - `rounded-2xl` → `rounded-3xl` on inputs + detail blocks
   - Add glass card styling to detail modal
   - Impact: 2-min changes, aligns with design system
   
4. **Form validation + error feedback** — Replace `alert()` with toast/inline banner; add required field validation
   - Impact: Better error recovery, reduced confusion
   
5. **ARIA + focus management** — Add `role="dialog"`, `aria-modal`, labels + `htmlFor`, Escape key handler
   - Impact: Accessible to screen reader users, keyboard navigation

---

## 8. Unresolved Questions

- Is 90vh modal height tested on iPhone 12 mini (667px viewport)?
- Does soft keyboard on Android push modal off-screen? (Need device test)
- What's the intended one-handed reach UX? (Close button should be reachable with thumb)
- Should form have autosave to localStorage as backup?
- Is table view (not modal) better for mobile weekly checkin?

---

**Status:** CRITICAL ISSUES IDENTIFIED
**Mobile readiness:** 3/10 — Many friction points, not mobile-optimized despite critical mobile use case
