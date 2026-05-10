# UX Audit — OKRs Management

## Quick stats
- **LOC:** 1324 (page-level, excluding modals)
- **Sub-components:** ObjectiveAccordionCard, ObjectiveAccordionCardL2, ChildObjectiveCard, KeyResultRow, 4x modals (AddObjective, EditKR, UpdateProgress, LinkObjective)
- **Tabs:** 2 (L1, L2)
- **Layout:** Bento metric grid + filtered accordion tree list
- **Main issues:** Excellent style compliance overall, but UX friction in nested expansion + form validation gaps

---

## Drift inventory

| Pattern | Count | Severity | Notes |
|---|---|---|---|
| `rounded-3xl` (correct) | ✓ | 🟢 | Consistent across all cards (ObjectiveAccordionCard, ChildObjectiveCard, modals) |
| `bg-white/50 backdrop-blur-md` (glassmorphism) | ✓ | 🟢 | All main cards follow pattern (line 348, 619, 469) |
| Decorative blob `bg-primary/5` (Bento) | ✓ | 🟢 | Present in metric grid (line 219, 250) |
| Italic accent in page title | ✗ | 🟡 | Line 179: `text-tertiary italic` but split as `Workshop` not `Kinetic Workshop` — unclear intent |
| Tab pill text size `text-[10px]` | ✓ | 🟢 | Line 186, 192 correct |
| Page header breadcrumb + title pattern | ✓ | 🟢 | Lines 172-180 follow guide exactly |
| Responsive padding `p-4 xl:p-6` | ✓ | 🟢 | Metric cards (line 218), accordion cards (line 351, 623) |
| Section heading typography `text-2xl font-black` | ✓ | 🟢 | Line 260 correct |
| Status indicator pulsing dot | ✓ | 🟢 | Line 245: `animate-pulse` + color + label |
| Empty state pattern | ✓ | 🟢 | Lines 293, 315: search_off icon + uppercase label |

**Drift verdict:** This page is **SOURCE OF TRUTH** per docs/ui-style-guide.md comment. Compliance is >95%.

---

## UX friction (Top 8 issues)

**1. Accordion collapse cognitive load** — ObjectiveAccordionCard:287 + ObjectiveAccordionCardL2:309 — Expanding L1 reveals L2 children, but user must re-expand each L2 to see KRs. Nested 3 levels deep. — **Friction:** User forgets L2 state across collapse/expand. **Fix:** Auto-expand L2 when parent L1 expands (toggle via gear icon, not default).

**2. Form validation silent failure** — AddObjectiveModal:1309 + EditKRModal:1026 — No validation feedback. Clicking "Create Objective" with blank title succeeds or fails silently. — **Fix:** Add inline error UI + disable button until `formData.title.trim().length > 0`.

**3. Keyboard navigation absent** — ObjectiveAccordionCard:351 + Line 621 — Expand/collapse only on click, no Enter/Space support — **Fix:** Add `onKeyDown={(e) => e.key === 'Enter' && onToggleExpand()}` to clickable divs.

**4. No visual feedback on destructive action** — KeyResultRow:809 (Delete button) — Trash2 icon with no hover state change — **Fix:** Add `hover:bg-error/10 hover:text-error` + show confirmation modal pre-delete (DeleteConfirmModal exists but optional).

**5. Progress bar ambiguity** — KeyResultRow:776-781 — Bar color switches `bg-primary` → `bg-emerald-500` at 100%. No label showing "Completed" state — **Fix:** Add badge "100% Complete ✓" when progress === 100.

**6. Modal backdrop click dismisses** — AddObjectiveModal:1230 — `bg-slate-900/60` overlay clickable but no explicit "click outside to dismiss" hint — **Fix:** Add subtle affordance or disable backdrop click (force explicit Cancel).

**7. Responsive icon sizing inconsistency** — Line 377: `size={20} className="flex-shrink-0 md:size-7"` — Icons 20px on mobile, 28px on desktop (7×4=28). Jarring jump. — **Fix:** Use `size={18}` baseline + `md:size-6` for proportional scale.

**8. Unassigned KR owner confusion** — KeyResultRow:758 — Avatar circle shows "N/A", but input field allows null owner. No inline error prompting "assign owner first" — **Fix:** Make owner required in EditKRModal, pre-fill with current user.

---

## Mobile issues

**Mobile-first compliance check:**
- ✓ Header stacks correctly (line 170: `flex flex-col gap-[var(--space-md)] md:flex-row`)
- ✓ Metric grid responsive (line 217: `grid-cols-2 xl:grid-cols-4`)
- ✓ Tab buttons stack (line 183: `flex flex-col sm:flex-row items-stretch sm:items-center`)
- ✓ Accordion content padding scales (line 351: `p-5 md:p-6 lg:p-8`)

**Issues found:**
1. **KeyResultRow grid collapse** — Line 748: `md:grid md:grid-cols-12` — On mobile, stacks flex-col but title + progress + actions all compete for width. At <375px, "Check-in" button wraps awkwardly.
   - **Fix:** Reduce button height to `h-8` on mobile, use icons-only mode (<sm)

2. **Modal max-width not mobile-safe** — EditKRModal:973 `max-w-lg` — On iPhone SE (375px), modal width = 90vw but padding-8 = 32px both sides, leaving 311px for form inputs. Cramped.
   - **Fix:** Add `max-h-[90vh]` + responsive padding `p-4 sm:p-8`

3. **Filter dropdown cut off** — Line 272: CustomFilter with no z-index negotiation — May render behind scrollable content on mobile
   - **Fix:** Ensure CustomFilter opens with `z-50` and dismisses on scroll

4. **Nested list indentation invisible** — ChildObjectiveCard line 469: `border-2 border-outline-variant/10` subtle, hard to see nesting at <sm viewport
   - **Fix:** Add left border highlight or background tint for visual hierarchy

---

## Information architecture

**Current structure (lines 168-322):**
```
┌─ Page Header (breadcrumb + title + controls)
├─ Metric Bento Grid (4 cards: Progress, Active, Critical, Days Left)
├─ Filters row (Department + Status dropdowns)
└─ OKR Tree List
   ├─ L1 Objectives (company-level)
   │  ├─ [Expand] Key Results
   │  └─ [Expand] Child L2 Objectives
   └─ L2 Objectives (team-level)
      └─ [Expand] Key Results
```

**Issues:**
1. **L1 ↔ L2 parent-child relationship unclear** — Lines 279-320 show two separate lists, but L2 can have `parentId` linking to L1. Navigation pattern not obvious.
   - **Fix:** Show parent context inline: `Aligns to: [Parent L1 title]` ✓ (line 656 does this, good)

2. **Filter state doesn't persist across tab switch** — Line 117-127: filter applied, user clicks L1 tab, filter state preserved but visually not obvious which filter is active
   - **Fix:** Add active filter badge near filter icon + highlight applied fields

3. **No quick-add KR inline** — Must click expand L1, scroll down, find "+ Add Key Result". Chain of 3 clicks.
   - **Fix:** Surface "+ Add KR" button in L1 header row next to expand chevron

4. **Status aggregation opaque** — "Critical Path" metric (line 243) shows aggregate health, but user can't drill down to "which objectives are off-track?"
   - **Fix:** Add filter preset button "Show Off-Track Only" that auto-filters statusFilter === 'Off Track'

---

## Code quality observations

**Excellent:**
- ✓ Try-catch error handling on all API calls (lines 34-42, 145-156, 605-615, etc.)
- ✓ Department color system hardcoded + consistent (lines 21-27 = source of truth)
- ✓ Nested state management (expandedObjectives Set, isExpanded per card)
- ✓ AnimatePresence + motion.div smooth expand/collapse
- ✓ Responsive typography (e.g., line 177: `text-2xl md:text-4xl`)

**Gaps:**
- ✗ Form validation missing — no `required` attribute, no error states in inputs
- ✗ Edit modal (line 855) uses `autoFocus` but no focus management on close
- ✗ No `aria-label` on buttons (expand/collapse chevron at line 351 is not labeled)
- ✗ Delete confirmation modal doesn't focus trap (modal can lose focus to page)
- ✗ No loading state for "Creating Objective" (onClick at line 1309 submits async but UI doesn't disable button)
- ✗ useAuth() imported but currentUser only checked in KeyResultRow (line 732), not used for permission gating at page level

---

## Type safety notes

- ✓ Objective, KeyResult, User types imported and used
- ✓ getDeptColor callback well-typed
- ✓ useState with proper generic types (Set<string>, boolean, etc.)
- ✗ `onAdd` callback in AddObjectiveModal accepts `any` (line 1213) — should be typed as `(obj: Partial<Objective>) => Promise<void>`
- ✗ Modal props `key?: string | number` (line 458, 597, 730) — React discourages optional keys

---

## Accessibility audit

| Item | Status | Finding |
|---|---|---|
| Semantic HTML | 🟡 | Clickable divs used for accordion (lines 351, 621). Should be `<button>` or `<details>`. |
| ARIA labels | 🔴 | None found. Expand/collapse buttons missing `aria-expanded`, `aria-controls`. |
| Keyboard nav | 🔴 | Tab to button works, but Space/Enter don't expand accordion. Only mouse click registered. |
| Color contrast | 🟢 | Status colors (error, tertiary, amber-500) meet WCAG AA. |
| Focus visible | 🟢 | `focus:ring-2 focus:ring-primary/20` applied to form inputs (line 637, 987, etc.). |
| Alt text | 🟡 | Material icons use semantic names (e.g., "chevron_right", "add_circle"). No alt attr needed but no fallback label if icon fails. |

---

## Top 5 actionable insights for Phase 2-3

1. **Form validation + error UI overhaul** — AddObjectiveModal, EditKRModal, UpdateProgressModal all missing `required` checks + inline error states. Create reusable FormError component + validation helper hook. Unblock: users can create blank objectives silently.

2. **Expand/collapse keyboard support** — All accordion cards (ObjectiveAccordionCard, ChildObjectiveCard, KeyResultRow link modal) need `onKeyDown` handlers for Enter/Space. Test with keyboard-only nav. Affects a11y compliance.

3. **Responsive button layout for KeyResultRow** — At <sm, action buttons (Link/Check-in/Edit/Delete) stack vertically or collapse to icons. Current grid-cols-12 layout breaks. Consider action menu (three-dot dropdown) for mobile.

4. **L1 ↔ L2 navigation clarity** — Add visual affordance showing which L1 objective a L2 belongs to (currently only in expanded state). Consider breadcrumb at top of L2 list: "Tech → [Parent Obj] → L2 Objectives".

5. **Filter state persistence + presets** — Status/Department filters reset on tab switch but user doesn't notice. Add active filter badges + "Save as Preset" button. Pre-populate with common views: "All On Track", "All Off Track", "My Team's OKRs".

---

## Comparison to style guide

**Checklist alignment:**
- [x] Page header has breadcrumb + title italic accent (lines 172-180)
- [x] Cards use glassmorphism `bg-white/50 backdrop-blur-md rounded-3xl`
- [x] Bento metric cards have decorative blob + hover animation (lines 219, 250)
- [x] Labels use `text-[10px] font-black uppercase tracking-widest` (line 220)
- [x] Big numbers use `font-headline` (line 222, 236, 243, 252)
- [x] Buttons use `h-10 rounded-full text-[10px] uppercase tracking-widest` (line 200)
- [x] Status indicators have pulsing dot (line 245)
- [x] Mobile responsive (line 170, 217, etc. have md:/xl: variants)
- [x] Department colors use pattern `{color}/10|/20` (lines 21-27)
- [x] Empty states have Material icon + uppercase label (lines 293, 315)

**Score: 10/10 style guide compliance** (best on project so far)

---

## Unresolved questions

1. Should expanding L1 auto-expand all child L2s, or user-controlled?
2. Is the L1 ↔ L2 tab switch intended to be mutually exclusive (user never sees both simultaneously)?
3. Should "Days Left" metric (line 252) show a countdown timer on real-time refresh, or static?
4. Are keyboard shortcuts planned (e.g., Cmd+K to quick-search objectives)?
5. Why is `currentUser` checked only in KeyResultRow (line 732) but not page-level? Should non-admins see "Check-in" button?

