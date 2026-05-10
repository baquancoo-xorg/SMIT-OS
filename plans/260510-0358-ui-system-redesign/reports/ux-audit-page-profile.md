# UX Audit — Profile Page

## Quick Stats
- **File:** Profile.tsx (72 LOC)
- **Current state:** View-only edit form (name, role, email editable inputs)
- **Avatar:** Static image + "Change Avatar" button (no implementation)
- **Max-width:** 2xl, glass card
- **Accessibility:** Basic form structure

---

## Drift Inventory

| Component | Pattern | Expected | Drift | Severity |
|-----------|---------|----------|-------|----------|
| Page title | "Edit Profile" (no breadcrumb, no italic accent) | Style guide: breadcrumb + "Page **Name**" (italic) | MISSING | High |
| Avatar button | `rounded-xl`, `bg-primary`, `text-sm` | `h-10` per guide, `rounded-full` | DRIFT | Med |
| Form labels | `text-xs font-bold ... uppercase` | `text-[10px] font-black` | DRIFT | Med |
| Input containers | `rounded-xl`, `bg-slate-50` | `rounded-3xl`, `bg-white/50 backdrop-blur-md` | DRIFT | High |
| Input focus state | `focus:ring-2 focus:ring-primary/20` | Should match guide style | OK | - |
| Save button | `rounded-xl`, `px-8 py-3` | `h-10 rounded-full text-[10px]` | DRIFT | Med |
| Button spacing | Right-aligned, `flex justify-end` | Center or left? Not specified | AMBIGUOUS | Low |

---

## Section Analysis

### Page Header
- **Current:** `<h2>` "Edit Profile" with subtitle "Update your personal information."
- **Expected:** Breadcrumb (User › Profile) + Title with italic accent ("Edit **Profile**")
- **Missing:** Breadcrumb navigation per style guide (line 25-43 of ui-style-guide.md)
- **Issue:** Not following standard page header pattern; looks standalone, not part of system

### Avatar Section
- **Image:** Hardcoded picsum.photos placeholder (`referrerPolicy="no-referrer"`)
- **Avatar styling:** `rounded-3xl` ✓, `ring-4 ring-slate-50 shadow-xl` ✓
- **Button:**
  - Text: "Change Avatar"
  - Styling: `bg-primary text-white text-sm font-bold rounded-xl shadow-lg`
  - **Drift:** Should be `h-10 rounded-full text-[10px]` (CTA button style from guide)
  - **Issue:** `text-sm` is too large; `rounded-xl` inconsistent with guide `rounded-full`
  - **Missing:** No file upload input or modal trigger visible
  - **UX gap:** Button does nothing (no `onClick` handler)

### Form Fields
**Name, Role, Email inputs:**
- **Current state:** Editable (value + onChange handlers)
- **Label style:** `text-xs font-bold ... uppercase tracking-widest` — violates guide (`text-[10px] font-black`)
- **Input container:** `bg-slate-50 border border-slate-200 rounded-xl`
  - **Expected:** `bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl`
  - **Current:** Flat design, no glassmorphism
  - **Issue:** Color system uses neutral `slate-*`, not theme `primary/surface-*`
- **Input padding:** `px-4 py-3` ✓
- **Focus state:** `focus:ring-2 focus:ring-primary/20 focus:border-primary` ✓ (acceptable)

**Spacing:**
- `space-y-6` between fields ✓
- `pt-4 flex justify-end` for button (reasonable, right-align for "Save" is standard)

### Save Button
- **Current:** `px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl`
- **Expected:** Primary CTA from guide: `h-10 rounded-full text-[10px] font-black uppercase tracking-widest`
- **Issues:**
  - `rounded-xl` should be `rounded-full`
  - `text-sm` should be `text-[10px]`
  - Missing `uppercase tracking-widest`
  - `px-8 py-3` should use `h-10` (fixed height)
  - Missing `min-w-[130px]` and icon support

### Data Binding Oddities
```tsx
const [name, setName] = useState('Hoàng Nguyễn');  // Hardcoded!
const [role, setRole] = useState('Agency PM');     // Hardcoded!
const [email, setEmail] = useState('hoang.nguyen@example.com');  // Hardcoded!
```
- **Issue:** No `currentUser` binding (Settings ProfileTab uses `useAuth()`, this doesn't)
- **Missing:** No API call to fetch/update user data
- **UX:** Edits are client-side only; refresh clears changes
- **Recommendation:** Remove this page or implement real data binding + save handler

---

## Comparison: Profile.tsx vs Settings ProfileTab

| Feature | /profile | Settings > Profile |
|---------|----------|-------------------|
| Name editing | ✓ (editable, unsaved) | ✗ (read-only display) |
| Role editing | ✓ (editable, unsaved) | ✗ (read-only display) |
| Email editing | ✓ (editable, unsaved) | ✗ (read-only display) |
| Avatar upload | Button only (non-functional) | N/A |
| 2FA setup | ✗ | ✓ (full flow) |
| Password change | ✗ | ✗ (in 2FA disable) |
| Data persistence | ✗ (client-side only) | ✓ (API calls) |
| Accessible to | All users | All users (via Settings tab) |
| Route | `/profile` | Settings page tab |

**Overlap verdict:** CRITICAL REDUNDANCY
- Both pages claim to be "profile edit"
- ProfileTab is read-only (defeats purpose)
- Profile.tsx is unsaved (defeats purpose)
- User has no working profile edit UX

---

## Accessibility Issues

| Issue | Severity | Note |
|-------|----------|------|
| No breadcrumb for context | Med | User doesn't know they're in Settings-like page |
| Hardcoded data in state | Med | Screen reader can't distinguish real data from placeholder |
| Avatar button non-functional | High | Button implies action but does nothing |
| No form validation feedback | High | User can't know if email is valid before save |
| No success/error messages | High | Save clicks produce no feedback |
| Label color low contrast | Med | `text-slate-500` on white might fail WCAG AA |
| No form title `<legend>` | Med | Screen reader won't group form |
| Missing ARIA labels | Low | Input fields could have `aria-label` or `aria-describedby` |

---

## Top 5 Actionable Insights

### 1. **Decide: Merge or Remove Profile.tsx**
- **Issue:** Two pages claim profile edit; neither works fully
- **Options:**
  - **A)** Remove Profile.tsx; move avatar + name/role/email edit to ProfileTab (makes Settings comprehensive)
  - **B)** Remove ProfileTab; move 2FA + profile edit to Profile.tsx (dedicated page)
  - **C)** Profile.tsx = public profile view, Settings ProfileTab = edit (clearer separation)
- **Recommendation:** **Option A** — consolidate in Settings so one source of truth
- **Impact:** Reduces cognitive load; fixes redundancy

### 2. **Implement Data Binding + Save Handler**
- **Issue:** Hardcoded initial state; no API calls; edits don't persist
- **Fix:**
  - Fetch `currentUser` from `useAuth()` context
  - Add save handler: `PATCH /api/users/{id}` with form data
  - Add loading + error states
  - Show success toast on save
- **Scope:** ~30 LOC

### 3. **Implement Avatar Upload**
- **Issue:** Button exists but does nothing; no file picker
- **Fix:**
  - Add hidden `<input type="file" accept="image/*" />` triggered by button
  - Upload to `/api/users/{id}/avatar` (multipart form-data)
  - Show preview while uploading (spinner)
  - Display error if upload fails
- **Scope:** ~50 LOC + backend endpoint

### 4. **Align All Form Styling to Guide**
- **Issue:** Labels, inputs, buttons all use wrong size/radius
- **Fix:**
  - Labels: `text-xs` → `text-[10px] font-black uppercase tracking-widest`
  - Inputs: `rounded-xl bg-slate-50` → `rounded-3xl bg-white/50 backdrop-blur-md`
  - Button: `rounded-xl text-sm` → `rounded-full h-10 text-[10px] uppercase`
  - Border: `border-slate-200` → `border-white/20`
- **Scope:** ~5 lines CSS class updates

### 5. **Add Form Validation + Feedback**
- **Issue:** No validation; user doesn't know if email is valid before submit
- **Fix:**
  - Email: Check format before save (regex or HTML5 validation)
  - Name: Min length check (e.g., 2 chars)
  - Add error summary at top of form
  - Disable save button if validation fails
  - Show success banner on save
- **Scope:** ~40 LOC

---

## Cross-cutting Issues

### Hardcoded Testdata
- Avatar image: `picsum.photos/seed/pm/100/100` (always same seed)
- User data: Vietnamese names baked in, not fetched from server
- **Recommendation:** Remove all hardcoding; fetch from `useAuth()` or API

### Missing Page Structure
- No breadcrumb (breaks style guide pattern)
- No page header icon or metadata
- Layout is box-in-box (card inside div), no system integration

### No Form Validation
- Email input: `type="email"` provides browser validation, but code doesn't check response
- No UX feedback loop

### Button Behavior Undefined
- "Change Avatar" button exists but onClick is missing
- "Save Changes" onClick is missing (presumably intended)
- User clicks, nothing happens → frustration

---

## Recommendations Summary

**PRIORITY 1 (Blocking):**
1. Implement save handler + API binding
2. Add avatar upload or remove button
3. Fix button/label styling to match guide

**PRIORITY 2 (Soon):**
4. Consolidate with ProfileTab (remove redundancy)
5. Add form validation + error feedback

**PRIORITY 3 (Polish):**
6. Add breadcrumb + page header per guide
7. Add success toast + loading states
8. Add ARIA labels for accessibility

---

## Code Smell Flags

- **Hardcoded state:** Lines 4-6 use placeholder names instead of `useAuth()`
- **Orphaned button:** "Change Avatar" button (line 27) has no handler
- **Missing handler:** Save button (line 63) has no onClick
- **No error boundary:** Form submission has no try/catch visible
- **Untested:** Likely this page was never wired up; dead code?

---

## Unresolved Questions

1. Is Profile.tsx actually used, or is it legacy code?
2. Should avatar be editable at all, or should it auto-pull from social profile?
3. Should name/role be editable, or read-from-system-only?
4. What's the reason for separating profile edit from Settings page?
5. Does the email field need real-time validation, or only on blur?

---

**Status:** DONE
**Summary:** Profile.tsx is a non-functional edit form with hardcoded data, missing save handler, and styling drift. Redundant with Settings ProfileTab, which itself is read-only. Recommend consolidate into ProfileTab and implement real data binding + avatar upload.
**Concerns:** This page appears to be incomplete/abandoned; needs clarification on intent before implementation.
