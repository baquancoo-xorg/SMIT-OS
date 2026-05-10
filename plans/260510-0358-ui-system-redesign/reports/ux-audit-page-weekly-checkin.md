# UX Audit — WeeklyCheckin Page & Modal

**Status:** HIGH friction on confidence slider + modal overflow, form state loss risk

## Quick Stats
- **LOC:** 240 (page) + 275 (modal) + 52 (components) = 567 total
- **Components:** 5 (page, ReportDetail modal, 3 sub-components: KrCheckinRow, ConfidenceSlider, Section)
- **Mobile-critical:** YES — checkin entry form is core workflow
- **Modals:** 1 submit + 1 detail view (ReportDetail from page inline)

---

## 1. Visual Drift Inventory

| Pattern | Found | Count | Expected | Severity |
|---------|-------|-------|----------|----------|
| `rounded-2xl` on input | Yes | 3 (L224, 240, 254) | `rounded-3xl` | HIGH |
| `rounded-2xl` on card | Yes | 1 (L12 KrCheckinRow) | `rounded-3xl` | HIGH |
| Glass card missing | Yes | Modal detail header | `bg-white/50 backdrop-blur-md` | MEDIUM |
| Decorative blob | Missing | Modal header | Should have blob | MEDIUM |
| Page header missing | Yes | L84-88 | Needs breadcrumb + title split | HIGH |
| Button sizing | Mixed | L176 (`text-xs` add button), L260 (submit) | Standardize to `h-10` | MEDIUM |
| Focus ring on textarea | Yes | L240, 254 | Should add `focus:ring-2` like modals | LOW |

**DRIFT COUNT:** 6 violations

---

## 2. Mobile UX Issues (CRITICAL)

### 2.1 Slider Touch Experience (MAJOR FRICTION)
**ConfidenceSlider.tsx (L13-31)**
- **`<input type="range">` on mobile:** Native HTML5 range input
  - **Good:** Uses native OS slider (iOS, Android)
  - **Bad:** Visual styling differs by OS; limited touch accuracy
  - **Issue on mobile:** Small incremental changes (0-10) require precise thumb placement
  - **Problem:** No visual feedback while dragging (slider knob visual feedback varies by browser)
  - **Missing:** Numeric input as alternative (some users prefer typing "7" vs. dragging)

- **Display badge:** `min-w-[3rem]` (L26) = 48px wide — OK for touch
- **But:** No touch haptic feedback or drag animation

### 2.2 Modal Height & Overflow (MAJOR)
**WeeklyCheckinModal.tsx (L129)**
- **Max-height:** `max-h-[90vh]` 
  - iPhone 12 mini: 667px viewport → 600px modal = 5 blocks squeezed
  - On landscape: modal becomes cramped (< 375px height)
  - **Issue:** All 5 blocks scroll inside modal; user can't see submit button without scrolling past all content
  - **Test:** Try landscape orientation — modal footer buttons likely off-screen

### 2.3 Sticky Submit Button (MISSING)
- **Modal footer (L259-270):** Fixed position relative to modal div, not viewport
- **Issue:** On mobile with scrollable modal, must scroll to bottom to see "Gửi check-in"
- **Mobile pattern missing:** Should use sticky footer inside scrollable area

### 2.4 Dynamic Form Rows (Add Priority)
**WeeklyCheckinModal.tsx (L175-178, addPriorityRow function)**
- **"+ Thêm" button:** `text-xs font-bold` (L176) = ~12px, 44px row height
- **Touch target:** Text is too small, button padding marginal
- **Should be:** `text-sm px-4 py-2.5` for better mobile hit area

- **Priority row delete button:** "Xoá" (L198) = `text-xs` text button, tiny hit area
  - Should be: Swipe-to-delete (Lucide X icon, larger) or long-press

### 2.5 Textarea Mobile (FRICTION)
**WeeklyCheckinModal.tsx (L236-254)**
- **Risks textarea:** `min-h-[100px]` — forces 100px scroll area on mobile
- **Issue:** On iPhone SE (375px width), keyboard takes 50% height, textarea gets cramped
- **No soft keyboard handling:** Content not pushed up when keyboard appears
- **Resize handle:** May be hard to grab on mobile

### 2.6 KrCheckinRow Mobile Layout (FRICTION)
**KrCheckinRow.tsx (L20-37)**
- **Grid layout:** `grid-cols-1 md:grid-cols-2` (L20)
  - Mobile: Stack current value + confidence vertically — OK
  - But input fields are narrow (no padding around), hard to tap accurately
  
- **Current value input:** `type="number"` ✓ Good — shows numeric keyboard on mobile
- **Input height:** `py-2` (L27) = 28px default — below 44px recommendation
- **Should be:** `py-3` or `py-3.5` for mobile touch comfort

### 2.7 Checkbox Accessibility on Mobile
**WeeklyCheckinModal.tsx (L182-187 priority row checkbox)**
- **Native input:** `<input type="checkbox">` — OK but small visual tap area
- **Size:** ~16px default — below 44px ideal
- **Should be:** Wrap in larger touchable label (entire row should be selectable)

### 2.8 Top 3 Priority Input Mobile
**WeeklyCheckinModal.tsx (L213-226)**
- **Numbered inputs:** 3 fields in sequence
- **No visual separation:** All look identical, easy to mix up which is #1 vs #2
- **Should add:** Numbered badge or colored background per input

### 2.9 Portrait/Landscape Responsiveness (UNTESTED)
- **Modal max-width:** `max-w-4xl` (L129) — OK for landscape
- **But:** On landscape 667px (iPhone 12 mini), modal becomes very cramped vertically
- **Test case needed:** Rotate to landscape, try entering all 5 blocks

---

## 3. Form Friction Analysis

### 3.1 State Loss Risk (HIGH RISK)
- **No autosave to localStorage** — lose all form data if:
  - Browser tab crashes
  - User navigates away
  - Network interruption during submit
- **Current:** Form open → user types → navigates back → ALL DATA LOST
- **No dirty state tracking** to warn user

### 3.2 Validation & Confirmation
- **No form validation** — empty fields allowed to submit
  - KR checkins can have blank notes (OK)
  - Top 3 priorities can be empty (should require ≥1)
  - No minimum content checks
  
- **No confirmation dialog** before submit
  - User can accidentally submit incomplete form

### 3.3 KR Checkin UX (MODERATE FRICTION)
- **Confidence slider:** No keyboard input alternative (desktop users too)
  - Should allow typing "7" + Enter
  
- **Current value field:** Generic `type="number"`, no unit display
  - KR has `kr.unit` but not shown in input
  - User guesses if target is "100 customers" or "100 %"

### 3.4 Keyboard Navigation (MISSING)
- **Tab order:** Browser default (likely logical but unverified)
- **No autofocus:** Modal opens but first field not focused
- **No Enter key handling:** Shift+Enter in textarea might not submit (depends on form setup)

### 3.5 Priority Row UX (FRICTION)
- **Checkbox-first layout:** Checkbox then text input is non-standard
  - Better: Text input with checkbox on right (or use checkboxes only with labels)
  
- **Delete button inline:** "Xoá" text is small, inline with input
  - Should: Use icon button (Lucide X) with hover/focus styling

### 3.6 Loading & Submission
- **Loading state:** `disabled={loading}` ✓ Good
- **But:** No spinner visual, no feedback animation
- **Error handling:** `alert()` (L109) — crude, blocks interaction
- **No retry:** User must close + reopen form to retry

---

## 4. Loading / Error / Empty States

### 4.1 Page-Level Loading
- **Current:** "Đang tải..." text (L97)
- **Missing:** Skeleton table with placeholder rows
- **No placeholder for modal:** When form loads KRs, no skeleton shown

### 4.2 Empty States
**Page empty (L99):** "Chưa có check-in nào."
- **Missing:** Icon, proper styling per guide (should have Material symbol + gray)
- **Missing:** CTA button to create first check-in

**KR checkin empty (L153-154):** "Bạn chưa được gán Key Result nào."
- **Missing:** Styling per guide, contact info clear

### 4.3 Error Handling
- **Modal error:** `alert()` (L109) — blocks interaction
- **Page error:** fetch error silently swallows to empty (L57)
- **Missing:** Toast notification, retry button, error boundary

### 4.4 Success Feedback
- **Current:** Modal closes, page refetch silent
- **Missing:** Toast "Check-in saved!" or progress indicator

---

## 5. Accessibility Gaps

### 5.1 ARIA Missing (CRITICAL)
- **Modal dialog:** No `role="dialog"`, `aria-modal="true"` (L125)
- **Modal close button:** No `aria-label="Close"` (L141)
- **Form labels:** No `htmlFor` association (L163, 173, 188-189)
- **Slider (range input):** No `aria-label` (ConfidenceSlider L23)
- **Sections:** No `aria-label` on sections (WeeklyCheckinModal L148)

### 5.2 Focus Management (MISSING)
- **Modal open:** Focus not moved to first input
- **Modal close:** Focus not returned to trigger button
- **Slider drag:** No focus visible state

### 5.3 Keyboard Navigation
- **Escape key:** Not captured to close modal
- **Tab order:** Browser default (likely OK but unverified)
- **Slider:** Can't increment with arrow keys (native range input limitation)

### 5.4 Screen Reader Issues
- **Numbered sections (①②③④⑤):** Using Unicode characters instead of text
  - Screen reader reads "①" as "CIRCLED DIGIT ONE" instead of "Section 1"
  - Should be: `<span aria-label="Section 1">①</span>`
  
- **Confidence badge:** `{value}/10` displayed, but no aria-label for context

### 5.5 Color Contrast
- **Placeholder text:** `placeholder:text-slate-400` on `bg-slate-50` — marginal
- **Section headers:** `text-slate-500` on white background — OK
- **Disabled state:** `disabled:opacity-50` not enough contrast change

---

## 6. Component-Specific Issues

### 6.1 ConfidenceSlider.tsx (L1-31)
- **Problem:** Generic `accent-primary` styling won't work on all browsers
- **Missing:** Custom thumb styling for better mobile UX
- **Missing:** Keyboard support (arrow keys don't work on iOS)
- **Suggestion:** Add number input alternative or spinner buttons

### 6.2 KrCheckinRow.tsx (L1-52)
- **`rounded-3xl` on card (L12):** ✓ Correct
- **Input sizes:** `py-2` (L27) = too small for mobile
- **Should be:** `py-3` or use `h-10` standard
- **Accessibility:** No aria-label on slider (ConfidenceSlider)

### 6.3 ReportTableView (Referenced but not audited)
- Likely has mobile table truncation issues
- May need review for overflow handling on mobile

---

## 7. Top 5 Actionable Fixes (Priority Order)

1. **Sticky submit button in modal** — Move footer outside scrollable area or use `sticky` positioning
   - Impact: Makes form submittable without scrolling to bottom

2. **Input field touch sizes** — Increase to `py-3` or `h-10` standard, fix `rounded-2xl` → `rounded-3xl`
   - Impact: Prevents mis-taps, improves visual consistency

3. **Form state preservation** — Add localStorage autosave + dirty state tracking
   - Impact: Prevents data loss on navigation, network failure

4. **Confidence slider alternative** — Add numeric input adjacent to slider (or replace with spinner buttons)
   - Impact: Better UX for desktop + mobile, more precise input

5. **ARIA + focus management** — Add `role="dialog"`, labels with `htmlFor`, Escape key handler
   - Impact: Accessible to all users, keyboard navigation support

---

## 8. Mobile Responsiveness Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Touch targets ≥ 44px | FAIL | Input `py-2`, checkboxes small |
| Sticky save button | FAIL | Must scroll on mobile |
| Modal height on landscape | UNTESTED | 90vh likely too tall |
| Soft keyboard handling | FAIL | No padding adjustment |
| Slider mobile UX | PARTIAL | Native but no alt input |
| Typography responsive | FAIL | `text-xs` labels too small |
| Landscape orientation | UNTESTED | 667px width cramped |
| One-handed reach | UNTESTED | Form center but modal close top-right |

---

## 9. Unresolved Questions

- Does `max-h-[90vh]` modal overflow on landscape 667px?
- Should top 3 priorities be numbered visually (1, 2, 3 badge)?
- Is slider keyboard arrow-key support needed (iOS limitation)?
- Should form auto-submit after 30s idle + valid data (auto-save pattern)?
- Does "Quay lại" button focus return correctly after modal close?
- What happens if user is offline while filling form? (Should ask before submitting)

---

**Status:** HIGH FRICTION IDENTIFIED
**Mobile readiness:** 4/10 — Slider + modal height + input sizes problematic, form state loss risk critical
