# Phase 06 — Admin SocialChannel UI

## Context links

- API contract: `phase-04-backend-api-routes.md` (social-channels routes)
- UI contract: `docs/ui-design-contract.md`
- App router: `src/App.tsx` (route registration)
- Existing pattern: `src/pages/v5/Settings.tsx` (admin section ref)

## Parallelization Info

- parallel-with: [phase-05]
- must-wait-for: [phase-04] (API contract)
- blocks: [phase-07]

## Overview

- Date: 2026-05-14
- Description: New admin page `/v5/integrations` to list, add, edit, test, deactivate SocialChannel. Encrypted token field (write-only). Token expiry warning.
- Priority: P2
- Status: completed

## Key Insights

- Decided new route `/v5/integrations` over Settings tab — keeps Settings focused on user prefs + isolates secrets UX.
- Token field is write-only: form input on create/edit; never echoed back in list. Show "Token set ✓" if exists.
- Token expiry surfaced inline: badge "Expires in 5 days" red if <7 days.
- "Test connection" button calls `POST /api/social-channels/:id/test` → toast result with page name.
- Soft delete (deactivate toggle) per Phase 04 — no destructive UI.

## Requirements

Functional:
- Page header: "Integrations" + button "Add channel".
- List view: channel rows with platform icon, name, externalId, status badge, expiry badge, actions (Test, Edit, Deactivate).
- Add/Edit dialog form:
  - Platform select (FACEBOOK_PAGE only enabled; others disabled with "coming soon" tooltip).
  - Name input.
  - External ID input (FB Page ID).
  - Access token textarea (masked input, can paste).
  - Token expires at (optional date input).
  - Submit → POST/PATCH.
- Test button → toast `{ ok, pageName }` or error.
- Deactivate button → confirm dialog → PATCH `active=false`.

Non-functional:
- Admin-only route (redirect non-admin to `/v5/dashboard`).
- All files < 200 lines.
- No solid orange CTA.
- Token input uses `<input type="password">` with show/hide toggle.

## Architecture

```
IntegrationsManagement.tsx
 ├── <SocialChannelList channels onTest onEdit onDeactivate onAdd />
 │     ├── platform-icon
 │     ├── expiry-badge
 │     └── action buttons
 │
 ├── <SocialChannelForm open mode={create|edit} channel onSubmit />
 │     ├── Zod resolver matching backend schema
 │     └── react-hook-form
 │
 └── useSocialChannels() — TanStack Query
       ├── list query
       ├── createMutation
       ├── updateMutation
       ├── testMutation
       └── deactivateMutation
```

## Related code files

Create:
- `src/pages/v5/IntegrationsManagement.tsx`
- `src/hooks/use-social-channels.ts`
- `src/components/v5/integrations/social-channel-list.tsx`
- `src/components/v5/integrations/social-channel-form.tsx`
- `src/components/v5/integrations/social-channel-expiry-badge.tsx`

Modify (additive):
- `src/App.tsx` — add route `<Route path="/integrations" element={<IntegrationsManagement />} />` + lazy import. (Routes ở root, không prefix `/v5`.)
- `src/components/v5/layout/sidebar-v5.tsx` — add 'Integrations' nav item (Phase 06 exclusive owner of sidebar config).

Do NOT touch:
- `src/pages/v5/Settings.tsx` (out of scope)
- `src/pages/v5/MediaTracker.tsx` (Phase 05)

## File Ownership

Exclusive owner:
- `src/pages/v5/IntegrationsManagement.tsx`
- `src/hooks/use-social-channels.ts`
- `src/components/v5/integrations/*` (whole new directory)

Shared edit (additive):
- `src/App.tsx` — Phase 06 adds 1 route + 1 import. Only phase touching this file.
- `src/components/v5/layout/sidebar-v5.tsx` — Phase 06 adds 1 nav item. Only phase touching this file.

## Implementation Steps

1. Create `use-social-channels.ts`:
   - `useSocialChannelsList()` → GET.
   - `useSocialChannelCreate()` → POST.
   - `useSocialChannelUpdate()` → PATCH.
   - `useSocialChannelTest()` → POST test.
   - `useSocialChannelDeactivate()` → PATCH active=false.
   - Invalidate list on mutation success.
2. Build `social-channel-expiry-badge.tsx` (<30 lines): green if >30d, amber 7–30d, red <7d, gray if null.
3. Build `social-channel-list.tsx`: table rows with action buttons.
4. Build `social-channel-form.tsx`:
   - react-hook-form + zodResolver.
   - Token field with show/hide eye toggle.
   - On edit mode: token input optional ("leave blank to keep current").
5. Build `IntegrationsManagement.tsx`:
   - Admin guard at top: import `useAuth` từ `src/contexts/AuthContext`. Check `currentUser?.isAdmin === true` → otherwise `<Navigate to="/dashboard" replace />`.
   - **Note:** `useCurrentUser()` hook KHÔNG tồn tại. Dùng `useAuth()` đã có. Field tên `isAdmin` (boolean), không phải `role`.
   - Layout: header + list + form dialog.
6. Register route in `App.tsx` (lazy import). Note: existing routes ở namespace `/v5` nhưng v5 pages mount tại root paths (`/dashboard`, `/media`, etc.). Dùng `/integrations` (không prefix `/v5`).
7. Add nav link in `src/components/v5/layout/sidebar-v5.tsx`:
   - File này định nghĩa nav inline (line 16: `{ label: 'Acquisition', items: ['Leads', 'Ads', 'Media'] }`).
   - Add new group `{ label: 'Admin', items: ['Settings', 'Integrations'] }` HOẶC append 'Integrations' vào group hiện có. Phase 06 OWN edit file này.
8. `npm run typecheck && npm run lint`.
9. Smoke test: add FB Page channel → test connection → expect page name in toast.

## Todo list

- [x] `use-social-channels.ts` with 5 hooks
- [x] `social-channel-expiry-badge.tsx`
- [x] `social-channel-list.tsx`
- [x] `social-channel-form.tsx` with masked token input
- [x] `IntegrationsManagement.tsx` with admin guard
- [x] Register route in `App.tsx`
- [x] Manual smoke add+test+deactivate cycle

## Success Criteria

- Non-admin user → redirected from `/v5/integrations`.
- Admin can add FB Page channel + test → toast page name.
- List shows expiry badge with correct color.
- Deactivate hides channel from sync runs (verified via Phase 03 service log).
- Token never appears in any GET response or React DevTools state.
- All files < 200 lines.

## Conflict Prevention

This phase OWNS all files under `src/pages/v5/IntegrationsManagement.tsx` and `src/components/v5/integrations/*` (new dir). Phase 05 owns `src/components/v5/growth/media/*` — distinct directories. `src/App.tsx` is touched only by Phase 06 in this plan. Sidebar nav config (if exists separately, e.g. `src/components/v5/layout/sidebar-config.ts`): if Phase 05 needs to add a "Media" nav item update, that update goes through Phase 05's owned files only — sidebar config goes to Phase 06.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Admin guard bypass via direct fetch | Low | Backend enforces admin too (Phase 04) — defense in depth |
| Token paste leaks into clipboard history | Low | UX note: "token will be encrypted on save"; cannot fully prevent OS clipboard |
| Expiry badge wrong timezone | Low | Compute on client with `new Date()` — UTC-aware |
| Form submit double-fires | Low | RHF default disables submit during isSubmitting |
| Sidebar nav file conflict | Medium | If `sidebar-config.ts` shared with Phase 05, escalate to Phase 07 integration commit |

## Security Considerations

- Token submitted via HTTPS only; backend encrypts (Phase 04).
- Token field uses `autoComplete="new-password"` to prevent browser caching.
- Form clears token field on close/cancel.
- Admin role enforced both client + server.

## Implementation Result

**DONE** — See `reports/phase-06-report.md`.

- 5 files created: hook (104 lines), badge (53 lines), list (119 lines), form (147 lines), page (86 lines). All <200 lines.
- Route `/integrations` registered (root level, no /v5 prefix).
- Sidebar nav updated: new "Admin" group with Settings, Profile, Integrations.
- Admin guard: `useAuth().currentUser?.isAdmin` check active.
- Token never stored/displayed in state; form clears on close.
- 0 new TS errors.

## Next steps

→ Phase 07 verifies end-to-end add→sync→display flow. Updates docs to mention new admin route.
