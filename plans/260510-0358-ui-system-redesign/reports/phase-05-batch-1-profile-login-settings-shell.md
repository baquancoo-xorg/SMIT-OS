# Phase 05 — Batch 1: Profile + LoginPage + Settings shell

**Date:** 2026-05-10
**Session:** `/ck:cook` Phase 5 batch 1 (post Phase 4 commit/push)
**Effort actual:** ~1h (vs ~4-5h estimate)
**Status:** ✅ DONE — first v2 page migrations live behind `?v=2` toggle

---

## Deliverables

### `src/pages/v2/` — new namespace
| File | Replaces | Strategy |
|---|---|---|
| `Profile.tsx` | `src/pages/Profile.tsx` (72 LOC, local-state stub) | Token-driven rewrite. PageHeader + GlassCard + Input + Button v2 + toast on save |
| `LoginPage.tsx` | `src/pages/LoginPage.tsx` (488 LOC) | Preserves 2-step credentials → TOTP flow + `useAuth().login()` + `verifyTOTP()`. Replaces 4 floating orbs with **2 Bento blobs** (Phase 1 audit drift fix). Eye toggle + autoFocus + ESC keyboard. |
| `Settings.tsx` | `src/pages/Settings.tsx` (153 LOC) | **Shell only**: PageHeader + TabPill nav + ConfirmDialog. Sub-tab content **reuses v1** (`ProfileTab`, `UserManagementTab`, `OkrCyclesTab`, `FbConfigTab`, `SheetsExportTab`) — defers content migration to batch 2. |

### `src/App.tsx` — toggle wiring
- Added lazy imports for 3 v2 pages
- New `useIsV2()` hook reads `?v=2` from URL
- Wrapped `<AppContent>` with `<ToastProvider>` so v2 toast works app-wide
- LoginPage path: V2 when `?v=2`, V1 otherwise
- Routes: `/profile` and `/settings` swap between V1 / V2 based on flag

### Toggle usage
```
http://localhost:3000/login?v=2     → LoginPageV2
http://localhost:3000/profile?v=2   → ProfileV2
http://localhost:3000/settings?v=2  → SettingsV2 (shell only — sub-tab content still v1)
```

`react-router` preserves `search` on `<Link>` by default → param sticks while navigating once enabled. To exit v2 preview, remove `?v=2` from URL or close + reopen.

---

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ Clean (after 1 generic-cast fix on TabPill onChange) |
| `npx vite build` | ✅ Clean 2.13s |
| Existing v1 pages | ✅ Untouched, default route |
| ToastProvider wrapping | ✅ Always-on at App root, no leak to Login route (Login renders before AppLayout but inside AuthProvider/ToastProvider) |

### Bundle impact (incremental vs Phase 4 baseline)
- `index-FCyrw5Yq.js`: **63.34 kB** (+27 kB) — v2 page chunks lazy split out
- `vendor-headlessui-react`: **88.65 kB** (+30 kB) — Settings v2 brings Dialog + Modal + ConfirmDialog into eager chunk via App imports
- Net acceptable; v2 chunks (LoginPageV2, ProfileV2, SettingsV2) lazy-loaded only when route requested

---

## Behavior Parity Preserved

### LoginPage
- 2-step flow: credentials → TOTP (auto-skips if backend doesn't require)
- `tempToken` carried between steps via state
- Username + password autoComplete attributes
- TOTP regex strips non-alphanumeric, max 8 chars (supports backup codes)
- Error display via animated alert region
- Loading state on submit button

### Profile
- Local-state stub (no API yet — same as v1)
- 3 fields: name, role, email
- Avatar placeholder (picsum) — v1 used identical pattern
- Save action shows toast (NEW vs v1 which had no feedback)

### Settings
- Admin redirect: non-admin trying admin tab → `/profile`
- Default tab: Admin = `users`, Member = `profile` (matches v1)
- Per-tab header action: Add User / New Cycle / Add Account / Export Now
- Delete confirm flow: ConfirmDialog v2 instead of inline backdrop
- After delete: `window.location.reload()` (v1 behavior preserved — TODO migrate to per-tab refetch in batch 2)

---

## Decisions Locked

- **D24**: Settings sub-tab CONTENT keeps v1 components (`ProfileTab`, `UserManagementTab`, etc.). Reason: each sub-tab is 100-300 LOC with custom forms and CRUD; migrating all 5 in 1 session = high risk + low value. Shell migration validates the pattern first. Sub-tab content batch 2 = next session.
- **D25**: `?v=2` flag is **app-global**, not per-route. Reason: simpler reasoning, predictable preview, can A/B by share-link.
- **D26**: ToastProvider wrapped at App root (not per-page). Reason: useToast() can be called from any v2 page without extra setup; v1 pages don't import useToast so no leakage.
- **D27**: LoginPage v2 reduces decoration vs v1 (2 blobs vs 4 floating orbs + grid pattern + shine effect). Phase 1 audit found "drift heavy" on Login. v2 is calmer + token-driven.
- **D28**: TabPill `onChange` cast `(v) => setActiveTab(v as SettingsTabId)` due to generic erasure when component is exported as cast non-generic. Acceptable — typed at the call site, no runtime risk.

---

## Pitfalls Recorded

1. **TabPill generic erasure**: forwarded ref + cast to non-generic type. Story files use `Meta` (not `Meta<typeof TabPill>`) to avoid generic-Meta pain. Page-level callers must cast onChange. Document this in the v2 component library doc (Phase 8).
2. **ToastProvider must wrap before LoginPage**: I initially placed it inside `AppContent` after auth gate, but useToast inside LoginPageV2 would error before login. Fixed by wrapping at App root (outer to AuthProvider's children). LoginPage v2 doesn't currently use toast but available for future error feedback.
3. **Settings v2 ConfirmDialog default state**: `deleteConfirm` is `null | DeleteConfirmState`. Passing `!!deleteConfirm` to `open` works; `title` template literal handles null via `?? 'item'` fallback so the dialog doesn't crash during transition.

---

## Open Questions / Follow-ups

- ProfileV2 still shows hardcoded avatar URL (picsum). v1 had same. Wire to real avatar field when backend ready.
- Settings v2 delete flow uses `window.location.reload()` — works but ugly UX. Migrate to per-tab refetch in batch 2 (after sub-tabs migrate to v2 with React Query).
- LoginPage v2: should social login slots (Google/Microsoft SSO) be added? Not in Phase 1 audit scope. Defer.
- Should the `?v=2` toggle bar be visible to user (e.g., banner: "Preview mode — click to exit")? Improves discoverability + prevents stuck-in-v2 state. Defer to UX call.
- Per-page Lighthouse score not yet measured. Run after batch 2 (full Settings sub-tabs migrated).

---

## Next Steps

**Batch 2 (Settings sub-tabs content migration):**
1. ProfileTab v2 — basic info form + 2FA management section
2. UserManagementTab v2 — DataTable + invite dialog (FormDialog) + role dropdown
3. OkrCyclesTab v2 — table with add/edit/delete
4. FbConfigTab v2 — token form + ad account list (CRITICAL for Acquisition)
5. SheetsExportTab v2 — config + last run KpiCard

Estimate: ~4-6h. Heavy because UserManagementTab + FbConfigTab have complex forms.

After Batch 2: user review → sign-off → unblock Phase 6 (Pages Medium).

---

## Files Changed (Batch 1)

```
A  src/pages/v2/Profile.tsx
A  src/pages/v2/LoginPage.tsx
A  src/pages/v2/Settings.tsx
M  src/App.tsx                                            (added v2 lazy imports + useIsV2 hook + ToastProvider)
M  plans/260510-0358-ui-system-redesign/plan.md           (Phase 5 status: in_progress)
M  plans/260510-0358-ui-system-redesign/phase-05-pages-small.md
A  plans/260510-0358-ui-system-redesign/reports/phase-05-batch-1-profile-login-settings-shell.md  (this file)
```
