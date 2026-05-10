# UX Audit Summary: Dashboard + OKRs

**Date:** 2026-05-10  
**Auditor:** Researcher (static code review)  
**Pages audited:** DashboardOverview.tsx (146 LOC) + OKRsManagement.tsx (1324 LOC)  
**Style guide reference:** docs/ui-style-guide.md

---

## Executive summary

**Dashboard Overview:** 🔴 Significant visual drift, inconsistent component patterns, and critical accessibility gaps. Solid foundation but needs systematic remediation.

**OKRs Management:** 🟢 Excellent style guide compliance (95%+), serves as source of truth. Minor UX friction in nested state management and form validation.

**Overall:** Two pages diverging in maturity. OKRs page should guide future work; Dashboard needs catch-up sprint.

---

## Side-by-side comparison

| Dimension | Dashboard | OKRs | Winner |
|---|---|---|---|
| Style guide compliance | ~60% | ~95% | OKRs ✓ |
| Visual drift (rounded corners) | 55 violations | 0 | OKRs ✓ |
| Glassmorphism pattern adoption | 6 cards | All | OKRs ✓ |
| Decorative blob usage | 3 files | All metric cards | OKRs ✓ |
| Mobile responsiveness | Gaps in grids | Consistent md:/xl: | OKRs ✓ |
| Error handling | Present but inconsistent | Consistent try-catch | OKRs ✓ |
| Loading skeletons | Some missing | Complete | OKRs ✓ |
| Form validation | None | None | Tie ⚠️ |
| Accessibility (a11y) | Minimal | Minimal | Tie ⚠️ |
| Code organization | Scattered components | Collocated modals | OKRs ✓ |
| Type safety | Basic | Better | OKRs ✓ |
| Empty states | Inconsistent | Pattern-based | OKRs ✓ |

---

## Critical findings

### 🔴 BLOCKER: Visual drift accumulation (Dashboard)

**Problem:** 55 instances of `rounded-2xl` (incorrect) vs `rounded-3xl`. 32+ panels use solid `bg-white` instead of `bg-white/50 backdrop-blur-md`. This diverges from style guide and OKRs precedent.

**Impact:** Inconsistent visual language. Users perceive Dashboard as "old" vs OKRs as "new" even though same product.

**Effort:** Moderate. Single batch PR can fix ~80% via grep+replace + component extraction.

**Timeline:** Phase 2, week 1 (2-3 days).

---

### 🔴 BLOCKER: Accessibility (Both pages)

**Problem:** Zero `aria-label`, `aria-selected`, `role="tablist"` attributes. Clickable divs instead of `<button>`. No keyboard navigation (Space/Enter don't expand accordions or toggle tabs).

**Impact:** Screen reader users get no semantic guidance. Keyboard-only users can't navigate tabs/accordions.

**Effort:** High across codebase. Requires refactoring semantic HTML + adding focus traps in modals.

**Timeline:** Phase 3, full sprint (design review + implementation + testing).

---

### 🟡 CRITICAL: Form validation missing (Both pages)

**Problem:** AddObjectiveModal, EditKRModal, AddKRButton all accept blank inputs silently. No `required` validation, no inline error states, no disable-on-invalid logic.

**Impact:** Users create objectives with empty titles, edit KRs to "". Backend may reject but UI doesn't warn first.

**Effort:** Low. Add validation hook + error UI component.

**Timeline:** Phase 2, week 2 (1-2 days).

---

### 🟡 UX friction: Nested state + expansion (OKRs)

**Problem:** L1 expands to show L2 children, but user must re-expand each L2 to see KRs. Cognitive load: 3-level nesting. State not persistent across collapse/expand.

**Impact:** Users forget where they were. Higher bounce rate on deep trees.

**Effort:** Low. Auto-expand L2 when L1 expands (option toggle available).

**Timeline:** Phase 2, week 3 (design spec + 1 day implementation).

---

### 🟡 UX friction: Mobile grid collapse (Dashboard)

**Problem:** LeadDistributionSection hard-codes `grid-cols-3`. ProductSection similarly multi-column. At <768px, content crushes.

**Impact:** Mobile users see horizontally-scrolling grid or word-wrapped text. High friction on iPad/tablet.

**Effort:** Low. Change `grid-cols-3` → `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` pattern.

**Timeline:** Phase 2, week 1 (1 day).

---

## Drift inventory consolidated

### Visual patterns

| Pattern | Guide says | Dashboard | OKRs | Fix priority |
|---|---|---|---|---|
| Border radius (cards) | `rounded-3xl` | `rounded-2xl` (55×) | ✓ | 🔴 P0 |
| Card background | `bg-white/50 backdrop-blur-md` | `bg-white` (32×) | ✓ | 🔴 P0 |
| Decorative blob | `bg-primary/5 rounded-full absolute` | 3 files | All metric cards | 🟡 P1 |
| Tab text size | `text-[10px]` | ✓ | ✓ | 🟢 OK |
| Title italic accent | `text-primary italic` | Missing in KpiTable | ✓ | 🟡 P2 |
| Responsive padding | `p-4 xl:p-6` | Inconsistent (`p-5`, `p-3 md:p-4`) | ✓ | 🟡 P1 |
| Status indicator | `w-2 h-2 rounded-full animate-pulse` | Partial | ✓ | 🟡 P1 |

### Functional patterns

| Feature | Dashboard | OKRs | Gap |
|---|---|---|---|
| Error handling | Inline red text | Try-catch + styled panel | Dashboard lacks visual hierarchy |
| Loading skeletons | Partial (SummaryCards yes, lead-dist no) | Complete (all sections) | Dashboard inconsistent |
| Empty states | Missing in some (lead-dist) | Standard pattern (search_off icon) | Dashboard ad-hoc |
| Form validation | None | None | Both need work |
| Keyboard nav | None | None | Both need work |
| Focus management | None in modals | None in modals | Both need work |

---

## Phase-by-phase remediation plan

### Phase 2 (Weeks 1-3): Visual consistency + mobile fixes

**Week 1 — Visual drift batch fix**
- [ ] Grep/replace all `rounded-2xl` → `rounded-3xl` in dashboard components
- [ ] Convert solid `bg-white` panels to `bg-white/50 backdrop-blur-md` (16 files)
- [ ] Verify no color regressions
- [ ] Test on mobile/tablet

**Week 2 — Form validation**
- [ ] Add FormError component (inline error UI)
- [ ] Add validation hook (useFormValidation)
- [ ] Update AddObjectiveModal, EditKRModal, AddKRButton with validation
- [ ] Test: empty inputs blocked, error message shown

**Week 3 — Mobile responsive grids**
- [ ] Fix LeadDistributionSection: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- [ ] Fix ProductSection similar pattern
- [ ] Verify grid collapse on <768px
- [ ] Test responsiveness on iPhone SE (375px) + iPad (768px)

---

### Phase 3 (Weeks 4-6): UX friction + accessibility

**Week 4 — OKRs nested state UX**
- [ ] Design: auto-expand vs manual (spec in Figma/doc)
- [ ] Implement: Toggle L2 auto-expand on L1 expand
- [ ] Add gear icon to L1 header for preference toggle
- [ ] Test expand/collapse state across refresh

**Week 5 — Accessibility refactor (Part 1)**
- [ ] Refactor accordion clickable divs → semantic `<button>` or `<details>`
- [ ] Add aria-expanded, aria-controls, aria-label to all tabs + buttons
- [ ] Add keyboard handlers: Space/Enter for expand, ArrowLeft/Right for tab switch
- [ ] Test with keyboard-only navigation

**Week 6 — Accessibility refactor (Part 2)**
- [ ] Modal focus traps (FocusScope or headlessui Listbox)
- [ ] Form input a11y (associated labels, error ARIA attributes)
- [ ] Screen reader testing (NVDA/JAWS on Windows, VoiceOver on Mac)
- [ ] Fix any remaining violations

---

## Unresolved questions

1. **Dashboard breadcrumb ownership:** Should DashboardPageHeader render breadcrumb (currently done in Header.tsx)? Risk if Header.tsx removed or overridden.

2. **LeadDistribution on mobile:** Should 3-column card grid become modal carousel on <md, or vertical stack? UX decision needed.

3. **OKRs L1↔L2 interaction:** Should clicking L2 in L1 tree auto-navigate to L2 tab, or keep tabs separate? Current UX unclear.

4. **Form validation scope:** Should validation errors prevent form submission (disable button), or show error + submit anyway for server-side validation? Current: silent failure.

5. **Keyboard navigation priority:** Which pages/components are highest priority for keyboard a11y? (Recommendation: tabs + accordions first, then modals.)

6. **Accessibility testing tool:** Should we use axe-core (automated) + manual screen reader testing, or both? Timeline impact?

---

## Recommendations for future code review

**Pre-merge checklist for Dashboard-like features:**
- [ ] All cards use `bg-white/50 backdrop-blur-md rounded-3xl` (not solid bg, not rounded-2xl)
- [ ] Metric cards include `bg-primary/5 rounded-full absolute` decorative blob
- [ ] Mobile grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` pattern
- [ ] Error + loading states styled per guide (error icon, status colors)
- [ ] Empty states use Material icon (search_off, inbox_customize, etc.) + uppercase label
- [ ] Form inputs have validation + inline error UI
- [ ] Accessibility: buttons labeled, tabs have aria-selected, accordions keyboard-navigable
- [ ] Tested mobile <768px, tablet 768-1280px, desktop >1280px

**Pre-merge checklist for OKRs-like features:**
- [ ] All of above +
- [ ] Nested components properly typed (avoid `any`)
- [ ] Try-catch on all async operations
- [ ] Loading + error + empty states complete
- [ ] Modal focus management (FocusScope or similar)
- [ ] Responsive typography (`text-xl md:text-2xl` pattern)

---

## Files to create/refactor (Phase 2-3)

**New components to extract:**
1. `src/components/ui/FormError.tsx` — Inline error display component
2. `src/hooks/useFormValidation.ts` — Validation hook with error state
3. `src/components/dashboard/BentoCard.tsx` — Wrapper combining DashboardPanel + blob + metric layout
4. `src/components/ui/AccessibleAccordion.tsx` — Keyboard-navigable accordion component
5. `src/components/ui/AccessibleTabs.tsx` — ARIA-compliant tab group component

**Files to refactor (Phase 2):**
- `src/components/dashboard/lead-distribution/lead-distribution-section.tsx` — Fix grid + add empty state
- `src/components/dashboard/product/product-section.tsx` — Fix grid + add empty state
- `src/components/dashboard/overview/*.tsx` — Batch visual drift fixes
- `src/pages/OKRsManagement.tsx` — Add form validation to all modals

**Files to refactor (Phase 3):**
- All pages with modals — Add FocusScope
- All pages with tabs — Convert to AccessibleTabs component
- All pages with accordions — Convert to AccessibleAccordion component

---

## Estimated effort

| Phase | Component | Effort | Risk | Owner |
|---|---|---|---|---|
| 2.1 | Visual drift batch fix | 2-3 days | Low | Engineer |
| 2.2 | Form validation | 1-2 days | Low | Engineer |
| 2.3 | Mobile grid responsive | 1 day | Low | Engineer |
| 3.1 | OKRs nested UX | 2-3 days | Medium | Designer + Engineer |
| 3.2-3.3 | Accessibility refactor | 5-7 days | High | Engineer + QA |
| Review | Code review + testing | 3-4 days | Medium | Team |

**Total Phase 2:** ~5 days  
**Total Phase 3:** ~12 days  
**Contingency (15%):** ~2.5 days  

**Timeline: 3 weeks (assuming full-time engineer + designer for 1 week)**

---

## Key takeaway

**Dashboard needs systematic visual alignment to OKRs standard.** This isn't a new design, but a compliance catch-up. OKRs page serves as reference implementation — copy its patterns (visual, structural, error handling, a11y) across all other pages.

**Accessibility is foundational.** Both pages lack keyboard navigation + ARIA attributes. Recommend treating this as hard requirement, not nice-to-have. Impacts legal/compliance + user base.

**Form validation is blocker.** Silent failures on blank inputs create data quality issues. Fix before Phase 3 launch.

