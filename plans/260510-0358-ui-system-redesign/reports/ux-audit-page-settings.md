# UX Audit — Settings Page (5 Sub-tabs)

## Quick Stats
- **Total LOC:** Settings.tsx (153) + 6 sub-tabs (~800 LOC combined)
- **Tab count:** 5 (Profile, Users, OKRs, FB Config, Export)
- **Permission gating:** Admin-only for 4 tabs; Profile visible to all
- **Major patterns:** Inline add forms, modal edit dialogs, table + card responsive, CRUD state management scattered

---

## Drift Inventory

| Component | Drift | Severity | Issue |
|-----------|-------|----------|-------|
| Tab buttons | `text-[10px]` ✓ | OK | Correct per style guide |
| Add form card | `rounded-3xl` ✓ | OK | Correct; uses glass + animate-in |
| Edit modal | Modal dialog (fixed overlay) | DRIFT | Style guide doesn't specify modal pattern — using card inside fixed overlay |
| Department toggle | `rounded-xl` (button) | DRIFT | Department buttons use `rounded-xl`, not `rounded-3xl` (inconsistent) |
| Department badge | `text-[9px]` | DRIFT | Line 233, 282 user-management: `text-[9px]` should be `text-[10px]` |
| Empty state | `text-[10px]` label ✓ | OK | Correct per guide |
| Button height | `h-10` standard ✓ | OK | Consistent across tabs |
| OKR Status badge | `text-[10px]` ✓ | OK | Active status badge (line 147 okr-cycles-tab) |
| FB Config form | Glass card `rounded-3xl` ✓ | OK | Correct |
| 2FA QR input | `rounded-xl` | DRIFT | Line 179 profile-tab: numeric input uses `rounded-xl`, not `rounded-3xl` |
| 2FA success state | `rounded-2xl` | DRIFT | Line 121 backup code alert uses `rounded-2xl`, not `rounded-3xl` |
| Export status card | `rounded-2xl` | DRIFT | Line 348 sheets-export uses `rounded-2xl` (should be `rounded-3xl`) |

---

## Tab Navigation Issues

### Keyboard/Deep-link
- **MISSING:** No keyboard navigation between tabs (Tab key doesn't cycle tabs)
- **MISSING:** No deep-linking support (`/settings?tab=users` not parsed)
- **No indicator:** Tab switching is instant; no visual feedback on active state (only button color, no underline/border)
- **Mobile:** Tab bar wraps in header with button action; good responsive fit

### Admin vs Member
- **Admin:** 5 tabs (Profile, Users, OKRs, FB Config, Export) ✓
- **Member:** 1 tab (Profile only), redirected from `/settings` to `/profile` ✓
- **UX gap:** Member sees page header "User Settings" with a single tab, then only Profile tab visible. Feels like incomplete UI. Could simplify to direct `/profile` navigation.

---

## CRUD UX Across Tabs

### User Management Tab
**Create:**
- Inline animated form (`.animate-in fade-in slide-in-from-top-4`) ✓
- Clear labels, grid layout (1 col mobile, 2 col desktop) ✓
- Department toggles: `rounded-xl` buttons (visual state: `bg-primary` when selected) ✓
- Issues:
  - No validation feedback until submit
  - Password field doesn't indicate "required" visually
  - No duplicate-user check before submit

**Edit:**
- Modal dialog (fixed overlay `z-50`), not inline ✓
- Same form structure as create ✓
- Password field says "New Password (optional)" via helper text, not label ✓
- Issues:
  - Modal backdrop click closes (good), but no confirm before data loss
  - Edit state doesn't prevent AccountID change (`disabled={!!editingId}` line 205) — good, but UX could show "read-only"

**Delete:**
- Shared modal in Settings.tsx (`deleteConfirm` state), not per-tab ✓
- Clear warning: "This action cannot be undone" ✓
- Two-button confirm (Cancel, Delete) ✓
- Issue: `variant="danger"` button but no red styling evident in code — check Button component

**Bulk:** None. One-by-one only. MISSING bulk delete/edit.

### OKR Cycles Tab
**Create:**
- Inline form, animated ✓
- DatePicker components for start/end ✓
- Issues:
  - DatePicker labels: `text-xs` (should be `text-[10px]` per guide)
  - No visual feedback for invalid date ranges (end < start)

**Edit:**
- Inline form, same as create ✓
- Close button (`<X>`) in top right ✓
- Issues:
  - Date value parsing: `startDate.split('T')[0]` (line 117) — brittle, assumes ISO string

**Delete:**
- Shared with user delete via Settings.tsx modal ✓

**Set Active:**
- Button in table (line 149): `handleSetActiveCycle()` ✓
- Visual feedback: "Set Active" → "Active" badge ✓
- No confirm modal (might be ok for non-destructive action)

### FB Config Tab
**Create:**
- Card form, glass style ✓
- Helper text on sensitive fields ("Dùng dấu _ không phải =") ✓
- Issues:
  - AccountID field has `disabled={!!editingId}` but no visual indication (no opacity/color change)
  - Access Token: `type="password"` but no show/hide toggle
  - Currency select: custom `<select>` inside glass container — works but inconsistent with Input components elsewhere

**Edit:**
- Same card form, inline update ✓
- Helper text: "Để trống nếu không muốn đổi" (vietnamese only, accessibility issue)
- Issues:
  - Clear feedback on save (success toast implied but not explicit in code)
  - No error recovery UX for sync failures

**Delete:**
- Inline `confirm()` dialog (browser native, line 114) — ok but poor UX
- No undo/snackbar

**Sync:**
- RefreshCw button with `animate-spin` while syncing ✓
- Disabled state during sync ✓
- 2s delay before refetch (line 135) — might show stale data briefly

### Sheets Export Tab
**Connect Google:**
- OAuth flow (redirect to authUrl) ✓
- Status badges (Connected/Not connected) ✓
- Issues:
  - No callback error handling (line 104: checks `!res.ok` but only alerts, doesn't parse structured error)
  - Folder dropdown: search input (line 267) shows `selectedFolder` when closed, `folderSearch` when open — confusing state

**Export:**
- Trigger via parent Settings page button ✓
- Polling for status (3s interval, line 194) ✓
- Result card: animated, color-coded (green=success, red=fail, blue=pending) ✓
- Issues:
  - No explicit "no destination folder" warning before export
  - Spreadsheet link opens in new tab (good), but no copy-to-clipboard for URL

---

## Form Pattern Consistency

| Aspect | User Mgmt | OKR | FB Config | Sheets Export | Profile Tab |
|--------|-----------|-----|-----------|---------------|-------------|
| Add form location | Inline | Inline | Inline | N/A | N/A |
| Edit location | Modal | Inline | Inline | N/A | View-only |
| Label style | `text-[10px] ... uppercase` | `text-xs` (DRIFT) | `text-[10px]` ✓ | N/A | `text-xs` |
| Input type | `Input` component | `Input` + `DatePicker` | `Input` + custom select | `Input` + search | `Input` |
| Button style | Primary + Ghost | Primary + Ghost | Primary + Ghost | Primary + Ghost | Primary |
| Error display | None shown | None shown | Inline alert card | Inline alert div | Inline text (2FA) |
| Success feedback | Refresh list | Refresh table | Toast implied | Status card | Password: none |

**Key inconsistency:** Date picker labels use `text-xs`, not `text-[10px]`. Profile form labels use `text-xs`. Inconsistent with `text-[10px]` standard across other tabs.

---

## Token/Credential UX

### FB Config Access Token
- `type="password"` hides input ✓
- **MISSING:** Show/hide toggle (eye icon) — user can't verify pasted token
- **MISSING:** Copy button to clipboard
- Helper text in Vietnamese only (accessibility)

### Profile Tab 2FA
- QR code display ✓
- Manual secret fallback: `` `code` `` element inside (line 166), but no copy button
- Backup codes post-setup:
  - Dark background, fixed-width font (good) ✓
  - Copy button with feedback ("Copied!" state) ✓
  - Auto-hide after 2s on Done ✓

### Sheets Export Google Token
- OAuth flow (no token input field) ✓
- Email display after connect ✓
- No revoke UI (only "Disconnect" which is destructive)

---

## Profile Sub-tab vs Standalone Profile Page

**Profile Sub-tab (ProfileTab.tsx):**
- Read-only display: Display Name, Username, Role (all `disabled` inputs) ✓
- 2FA setup/manage (primary UX here)
- Max-width 5xl, glass card

**Standalone Profile Page (Profile.tsx):**
- Edit mode: Full Name, Role, Email (editable inputs) ✓
- Avatar upload button
- Save Changes button
- Max-width 2xl, glass card

**Overlap issue:**
- Name/Role appear in BOTH places (read-only in ProfileTab, editable in Profile.tsx)
- No clear mental model: should user edit in Settings > Profile or /profile?
- **Recommendation:** Move name/role edit to ProfileTab, remove Profile.tsx page OR clarify that Profile.tsx is legacy

---

## Accessibility Gaps

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Missing ARIA labels | Tab buttons | Med | Add `aria-label="Switch to {tab} tab"` |
| No keyboard tab navigation | All tabs | High | Implement Tab/Shift+Tab cycling |
| Helper text in Vietnamese only | FB Config, OKR | High | Translate to English or add tooltips |
| Color-only status indication | OKR "Active" badge | Med | Add text (already done ✓) |
| Missing alt text | Avatar img (Profile.tsx) | Med | Add descriptive alt |
| Password strength indicator | User create/edit | High | MISSING — no feedback on pwd complexity |
| No error summary | Form submissions | Med | Consolidate errors at top of form |
| Blinking/spinning feedback | Sync button, 2FA loading | Low | Already has `animate-spin`, ok |
| Date format ambiguity | OKR cycles (MM/DD or DD/MM?) | Med | Display format hint (e.g., "MM/DD/YYYY") |

---

## Top 5 Actionable Insights

### 1. **Fix Typography Drift on Date Labels**
- **Issue:** Date picker labels use `text-xs` instead of `text-[10px]` (OKR cycles, Sheets export)
- **Impact:** Violates style guide consistency; appears smaller than intended
- **Fix:** Change `text-xs font-bold` → `text-[10px] font-black uppercase tracking-widest` on DatePicker labels

### 2. **Unify Edit Form Pattern (Inline vs Modal)**
- **Issue:** User edit = modal; OKR/FB edit = inline. No clear UX logic
- **Impact:** Users expect consistent behavior, gets surprised by modal appearing
- **Fix:** Commit to one pattern:
  - **Option A:** All edit = inline (current OKR/FB pattern, more space but clearer)
  - **Option B:** All edit = modal (current User pattern, focused UX but takes screen space)
  - Recommend **Option A** (inline) for admin-heavy Settings page

### 3. **Add Token Visibility Toggle + Copy Buttons**
- **Issue:** FB Config access token hides but no show/hide toggle; no copy UX
- **Impact:** Users paste tokens, can't verify; admin can't quickly test token without downloading
- **Fix:** Add eye icon toggle to password field + copy button. Reuse from 2FA backup code copy pattern (CheckCheck icon + "Copied!" state)

### 4. **Clarify Profile Edit UX**
- **Issue:** Name/Role editable in /profile page but read-only in Settings > Profile tab. Unclear where to make changes
- **Impact:** User friction; potential data inconsistency if both are updated separately
- **Fix:** Decide:
  - Move all profile edits to ProfileTab (remove Profile.tsx)
  - OR hide /profile from non-admins, keep ProfileTab 2FA-only
  - Document in CLAUDE.md which is authoritative

### 5. **Add Keyboard Deep-linking for Tabs**
- **Issue:** No `/settings?tab=users` support; no Tab key navigation between tabs
- **Impact:** Users can't share deep links or use keyboard-only navigation
- **Fix:**
  - Parse `new URLSearchParams(location.search)` for `tab` param on mount
  - Add keyboard handler (left/right arrows, Tab key) to cycle tabs
  - Update URL on tab change via `window.history.pushState()`

---

## Cross-cutting Issues

### State Management Scattered
- Each tab manages its own state (isAddingUser, editingUser, etc.)
- Delete confirm centralized in Settings.tsx
- **Recommendation:** Consider Context API or Zustand for shared CRUD state if tabs grow

### No Loading Skeleton
- User list, OKR cycles, FB accounts all show loading spinner or text
- **Better:** Add skeleton cards or placeholder rows during fetch

### Mobile Responsiveness
- Table → card layout (good) ✓
- Add form animations work on mobile ✓
- Modal dialogs take full screen on mobile (ok)
- **Issue:** Header action button (Add User, New Cycle) may not reflow well on <375px

### Unresolved Questions

1. Does `/settings?tab=users` work or is deep-linking lost on refresh? (Untested)
2. Is the "delete confirm" modal z-index layered correctly above modals? (Needs visual test)
3. Does MB Config Currency select accessibility work for screen readers? (Custom select, needs ARIA)
4. What's the data model conflict between Profile.tsx name/role and ProfileTab read-only fields?

---

**Status:** DONE
**Summary:** Settings page has solid tab structure and CRUD flows but drifts on typography (date labels), modal pattern inconsistency (user edit vs OKR/FB edit), and missing token UX (show/hide, copy). Profile overlap needs clarification.
**Concerns:** Typography drift is easily fixable; modal/inline pattern requires architecture decision; profile redundancy blocks user clarity.
