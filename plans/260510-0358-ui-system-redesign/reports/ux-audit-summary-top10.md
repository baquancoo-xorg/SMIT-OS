# UX Audit Summary — Top 10 Insights

> Date: 2026-05-10 | Phase 1 deliverable (FINAL)
> **This doc is input cho Phase 2 (Design Tokens) + Phase 3 (Mockup) + Phase 4 (Component Library).**
> Source: 13 page-level audit reports + cross-page drift inventory + Nielsen heuristic eval.

## Scoring rubric

Mỗi insight scored: **Impact (1-5) × Frequency (1-5) = Score (1-25)**.

- **Impact**: Mức độ ảnh hưởng UX/business value khi fix
- **Frequency**: Số pages/components affected

Sorted descending.

---

## #1 — Spacing token system collapsed (5.5% adoption) 🔴🔴🔴

**Score: 25 (Impact 5 × Freq 5)**

**Evidence:**
- 292 raw `p-4`/`p-6`/`gap-4` values vs 17 `var(--space-*)` token usage
- Style guide reference (`docs/ui-style-guide.md`) prescribes tokens but code ignores
- Result: globally tuning spacing impossible

**Why it hurts:**
- Mỗi page tự reinvent spacing → visual rhythm drift
- Tablet/mobile responsive hard to tune systematically
- Future redesign requires file-by-file edits (no central knob)

**Fix (Phase 2 — Design Token Foundation):**
1. Define minimal scale: `--space-xs (4px) / --space-sm (8px) / --space-md (16px) / --space-lg (24px) / --space-xl (32px) / --space-2xl (48px)`
2. Codemod `p-4` → `p-[var(--space-md)]` etc (deterministic mapping)
3. ESLint rule: forbid raw `p-N` in pages (allow in primitives only)

**Owner:** Phase 2 design system + Phase 8 lint enforcement

---

## #2 — Card primitive missing (39 variants in production) 🔴🔴🔴

**Score: 25 (Impact 5 × Freq 5)**

**Evidence:**
- 39 distinct card patterns: glass / solid / muted / wrong-radius
- 91 `rounded-2xl` (wrong) vs 69 `rounded-3xl` (correct)
- Only 30 instances dùng glass card pattern (white/50 + backdrop-blur)
- Decorative blob signature element chỉ 7 instances

**Why it hurts:**
- "Generic" feel trên 8/10 pages — signature element absent
- Hover/focus state inconsistent across cards
- Glass effect chỉ apply 50% → dashboard với cards mix glass + solid

**Fix (Phase 4 — Component Library):**
```tsx
<Card variant="glass" />        // default
<Card variant="solid" />        // for high-contrast contexts
<BentoMetricCard label value variant="default|primary|status" />
                                 // built-in decorative blob
```

Lock radius via tokens: `--radius-card: var(--radius-3xl)`.

**Owner:** Phase 4 primitive set

---

## #3 — Form abstraction missing (validation, autosave, error) 🔴🔴🔴

**Score: 24 (Impact 5 × Freq 4.8)**

**Evidence:**
- DailySync + WeeklyCheckin: form data lost on navigation, no autosave, `alert()` errors
- OKRs add objective/KR: blank inputs accepted silently, no inline error
- LoginPage: best-in-class (banner errors, spinner) — outlier
- Profile.tsx: hardcoded data, save handler missing — non-functional

**Why it hurts:**
- Mobile checkin flow: nhân sự fill form trên mobile, mất data → lose trust
- Form errors via `alert()` block UI, ko actionable
- Devs reinvent form logic mỗi page

**Fix (Phase 4):**
1. `useFormValidation()` hook — Zod schema + error map
2. `<FormField>` primitive — label, input, inline error, hint
3. `<Form>` wrapper — submit handler, loading state, autosave debounce
4. Replace `alert()` với `<Toast>` system

**Owner:** Phase 4 forms layer + Phase 6 (apply to checkin pages)

---

## #4 — Page header pattern fragmentation (4 variants) 🔴🔴

**Score: 20 (Impact 4 × Freq 5)**

**Evidence:**
- Canonical (`text-4xl font-extrabold ... + italic accent`): 5 pages
- Profile: same font, no italic split
- Mid-size (`text-2xl font-black slate-800`): DailySync, WeeklyCheckin, OKRs L2
- Login: `text-2xl font-bold slate-900` (acceptable for auth)

**Why it hurts:**
- 50% pages off-spec → cognitive overhead user phải re-orient mỗi page
- Brand recognition diluted
- Mobile/tablet header behavior chưa standardize

**Fix (Phase 4):**
```tsx
<PageHeader
  breadcrumb={[{label:'Group'}, {label:'Page'}]}
  title="Page"
  accent="Name"      // wrapped in italic primary
  actions={<Filters/>}
/>
```

Strict typography per breakpoint built-in.

**Owner:** Phase 4 layout primitives

---

## #5 — Modal/Dialog UX gaps (no ESC, no focus trap, inconsistent close) 🔴🔴

**Score: 20 (Impact 5 × Freq 4)**

**Evidence:**
- LeadDetailModal, MediaPostDialog, WeeklyCheckinModal: no ESC handler
- No focus trap → keyboard user lost on backdrop
- Click-outside behavior inconsistent
- Loading state on submit ko consistent

**Why it hurts:**
- Accessibility WCAG fail (keyboard nav)
- Power users ko escape quickly → friction
- Mobile: no swipe-down to dismiss

**Fix (Phase 4):**
- Adopt Radix Dialog OR build minimal `<Modal>` với:
  - ESC + click-outside + focus trap built-in
  - Loading/error state slots
  - Mobile: full-screen variant
- Migrate 5 modals to primitive

**Owner:** Phase 4 overlay layer

---

## #6 — Mobile UX critical gap on checkin pages (DailySync + WeeklyCheckin) 🔴🔴

**Score: 18 (Impact 5 × Freq 3.6 — only 2 pages but mobile-critical)**

**Evidence:**
- Sticky submit button absent → user scroll lên xuống tìm
- Touch targets <44px (checkbox, delete buttons)
- Confidence slider (Weekly) friction trên mobile
- Form data lost on navigation
- Keyboard zoom on focus (input type quirks)

**Why it hurts:**
- Nhân sự dùng mobile checkin daily → friction = adoption blocker
- Lost data = lost trust → fewer checkins → less data for leadership

**Fix (Phase 6):**
- Sticky save bar bottom on mobile
- Min touch target 44px enforced via primitive
- Form autosave với debounce 500ms
- Confidence slider mobile-friendly: native `<input type="range">` or stepped buttons
- Test trên real device (≥ 375px screen)

**Owner:** Phase 6 (medium pages)

---

## #7 — Tab state ko URL-encoded (lose context on reload) 🟡🟡

**Score: 16 (Impact 4 × Freq 4)**

**Evidence:**
- LeadTracker, MediaTracker, AdsTracker, Settings: tab state in `useState` only
- Reload → reset to default tab
- No deep-linking khi share URL
- Sort state on AdsTracker Campaigns lost on tab switch (component unmounts)

**Why it hurts:**
- Share URL ko bring user to specific tab → support friction
- Power users frustrated khi reload mất state

**Fix (Phase 4):**
- `useTabState` hook backed by `useSearchParams`
- Pattern: `?tab=campaigns&sort=spend&dir=desc`
- Apply to all multi-tab pages

**Owner:** Phase 4 hook layer

---

## #8 — Loading/Empty/Error state inconsistency 🟡🟡

**Score: 16 (Impact 4 × Freq 4)**

**Evidence:**
- Skeleton component exists (`ui/Skeleton.tsx`) but used in <5 places
- Empty states often "No data" generic — no CTA
- Error states: `alert()` (worst), generic "Something went wrong" (medium), proper banner (rare — only LoginPage)

**Why it hurts:**
- User ko biết app loading vs broken vs empty
- Empty state mất chance educate user (e.g. "Add first lead")

**Fix (Phase 4):**
- `<PageSkeleton />`, `<TableSkeleton rows={5} />`, `<CardSkeleton />`
- `<EmptyState icon title description action />` — required CTA
- `<ErrorState code retry />` — categorized by error code (network/auth/validation/server)
- `<Toast>` system replacing `alert()` calls

**Owner:** Phase 4

---

## #9 — Accessibility baseline missing (aria, keyboard, contrast) 🟡🟡

**Score: 15 (Impact 5 × Freq 3 — but multipliers across pages)**

**Evidence:**
- 0 `aria-label` on icon-only buttons (NotificationCenter, Sidebar collapse, Header menu)
- Tab containers missing `role="tablist"` + `aria-selected`
- Modals no focus trap
- Emoji icons (🆕 ⏰ 📅) ko aria — screen reader skip
- Sidebar active item indicator chỉ visual (no aria-current)

**Why it hurts:**
- WCAG AA fail — compliance risk
- Power users ko keyboard navigate
- Inclusive UX requirement (leadership can't justify "later")

**Fix (Phase 4-8):**
- Each primitive built-in aria (Tabs, Modal, Button, FormField)
- Icon-only buttons require `aria-label` prop (TS enforce)
- Replace emoji với Material Symbols + aria-label
- Lighthouse Accessibility ≥ 90 success metric (in plan)

**Owner:** Phase 4 (built-in via primitives) + Phase 8 (audit + fix gap)

---

## #10 — Profile.tsx redundant + non-functional 🟡

**Score: 12 (Impact 3 × Freq 4 — small page but blocking edit UX)**

**Evidence:**
- `pages/Profile.tsx`: hardcoded `useState` data, save handler missing, refresh clears edits
- `components/settings/profile-tab.tsx`: read-only display of same fields
- Two profile entry points → user confused where to edit

**Why it hurts:**
- Avatar/name/email edit non-functional → real bug, not UX nit
- Routing to `/profile` vs `/settings#profile` ko clear

**Fix (Phase 5):**
- **Decision needed:** delete `Profile.tsx` OR consolidate into Settings ProfileTab
- Recommendation: keep `pages/Profile.tsx`, make it functional + reuse Settings ProfileTab logic
- Implement real `PATCH /api/users/{id}` binding
- Avatar upload working

**Owner:** Phase 5 (small pages)

---

## Cross-cutting themes (input cho Phase 2-3)

### A. Design tokens (Phase 2 deliverables)
- Spacing scale 5-step + applied via codemod
- Typography scale 6-step (heading/body/label/caption)
- Color: pick M3 OR slate (recommend M3 with slate fallback for utility)
- Radius: semantic (`--radius-button`, `--radius-card`, `--radius-modal`) NOT generic 2xl/3xl
- Fix breakpoint xl/2xl reversed bug

### B. Component primitives (Phase 4 deliverables — minimum 15)
1. `<Button variant size loading icon>`
2. `<Card variant>`
3. `<BentoMetricCard>` (with blob)
4. `<PageHeader>` (with breadcrumb + italic accent)
5. `<Tabs>` (URL state, keyboard, aria)
6. `<Modal>` (ESC, focus trap, mobile full-screen)
7. `<Toast>` system
8. `<FormField>` (label, input, error, hint)
9. `<Form>` (validation, autosave, submit)
10. `<DataTable>` (sort, empty, skeleton, sticky header)
11. `<EmptyState>` (icon, title, CTA)
12. `<PageSkeleton>` / `<TableSkeleton>` / `<CardSkeleton>`
13. `<Sidebar>` (mobile drawer, tablet static, desktop full)
14. `<ConfirmDialog>`
15. `<Badge variant>` / `<Chip dismissible count>`

### C. Mockup priorities (Phase 3 deliverables)
- 10 pages × desktop + tablet + mobile = 30 mockups (Google Stitch AI)
- Empty/loading/error states cho 5 critical pages
- Modal mockups cho 5 dialogs
- Cross-page navigation flow diagram

### D. Out-of-scope (defer or decide)
- Keyboard shortcuts layer (Linear/Cmd-K)
- Real-time updates (websocket)
- Internationalization (Vietnamese-only acceptable?)
- Onboarding/tour
- PostHog session replay deep dive (need browser session — schedule for Phase 2 kickoff)
- Lighthouse runs (need running dev server — schedule for Phase 2 kickoff)

---

## Sign-off checklist

- [x] All 10 pages audited (13 reports)
- [x] Layout components audited
- [x] Cross-page drift inventory với numbers
- [x] Heuristic eval với severity ratings
- [x] Top 10 insights actionable, prioritized
- [ ] **User sign-off** — request review của doc này trước khi vào Phase 2

## Unresolved questions for user (Phase 2 kickoff)

1. **Color system:** Migrate fully to M3 tokens OR keep slate ladder cho utility? (Affects ~140 instances)
2. **Profile.tsx:** Keep as standalone (consolidate logic) hay deprecate (route `/profile` → Settings)?
3. **Internationalization:** Vietnamese-only OK indefinitely, hay scaffold i18n now?
4. **Keyboard shortcuts:** Out of scope for redesign hay Phase 4 add minimal layer?
5. **Toast system:** Build custom (~1 day) OR adopt library (sonner / radix-toast)?
6. **PostHog/Lighthouse:** When to run — Phase 2 kickoff? Need dev server up + admin access.
7. **OKRs page:** 1324 LOC giữ single-file OR split sub-routes (Phase 7)?
8. **Accessibility target:** WCAG AA full hay opportunistic? Lighthouse Accessibility ≥ 90 hard requirement?

---

## Status

**Phase 1 ready để hand off Phase 2.** Recommend kickoff Phase 2 sau khi user review + answer 8 questions trên.
