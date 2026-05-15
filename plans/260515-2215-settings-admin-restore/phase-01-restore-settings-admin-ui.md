# Phase 01 — Restore Settings Admin UI

## Context links
- Plan: `plans/260515-2215-settings-admin-restore/plan.md`
- Docs: `docs/ui-design-contract.md` §13, §22, §40, §45, §48
- Docs: `docs/api-key-authentication.md` lines 115-123
- Docs: `docs/code-standards.md` lines 13-22, 41-50

## Overview
- Priority: High — admin regressions block user/API/FB management.
- Status: pending approval
- Scope: one Settings route plus minimal supporting wiring.

## Requirements
1. Admin sees a `User` tab in Settings.
2. `User` tab renders existing `UserManagementTabV2` and can add/edit/delete users through real APIs.
3. `User` tab toolbar button label is `Add User`.
4. `API Keys` tab toolbar button label is `Create New Key` and opens `GenerateApiKeyModal`.
5. `FB Config` tab toolbar button label is `Add New Account` and opens add-account dialog.
6. Non-admin users only see allowed tabs; no admin-only action button leaks.
7. UI follows v5 primary button contract; no solid orange CTA.

## Related code files
### Modify
- `src/pages/v5/Settings.tsx`

### Read / verify
- `src/components/settings/user-management-tab.tsx`
- `src/components/settings/api-keys-panel.tsx`
- `src/components/settings/fb-config-tab.tsx`
- `src/components/settings/index.ts`
- `src/components/v5/ui/page-toolbar*` or equivalent export source
- `src/contexts/AuthContext.tsx`
- Server user routes mounted from `server.ts` / `server/routes/*` if DELETE behavior is unclear

## Implementation steps
1. Inspect `PageToolbar` props to confirm action slot name.
2. Update `SettingsTab` union and `ALL_TABS` to include admin-only `users` tab with a user icon.
3. Add `users` to `ADMIN_ONLY`.
4. Add `isAddingUser` state in `Settings`.
5. Import `UserManagementTabV2` from `../../components/settings`.
6. Render `UserManagementTabV2` when `activeTab === 'users' && isAdmin`.
7. Implement Settings-level action rendering:
   - users → primary `Add User`, opens `setIsAddingUser(true)`.
   - api-keys → primary `Create New Key`, opens `setIsGeneratingKey(true)`.
   - fb-config → primary `Add New Account`, opens `setIsAddingFb(true)`.
   - other tabs → no extra action.
8. Wire user delete confirm safely:
   - Prefer existing confirm primitive if available in v5 UI.
   - DELETE `/api/users/:id` with `credentials: 'include'`, then `refreshUsers()`.
   - Prevent deleting current user remains handled in tab action visibility; keep server as final guard.
9. Adjust EmptyState labels only if needed for consistency (`Create New Key`, `Add New Account`, `Add User`) without changing behavior.
10. Run validation commands and UI smoke.

## Todo list
- [ ] Inspect PageToolbar/action slot API.
- [ ] Restore User tab wiring.
- [ ] Restore action buttons by active tab.
- [ ] Wire user delete confirmation/API path.
- [ ] Align visible labels.
- [ ] Run typecheck/lint/build.
- [ ] Smoke test Settings UI in browser if dev server is reachable.
- [ ] Run code-reviewer after implementation.

## Success criteria
- `/settings?tab=users` works for admin and shows user table/form.
- `/settings?tab=api-keys` shows `Create New Key` even when keys exist.
- `/settings?tab=fb-config` shows `Add New Account` even when accounts exist.
- Non-admin cannot access admin-only tab content through query param.
- No new solid orange CTA/tab/nav state.
- Typecheck/build pass.

## Risks / mitigations
- `UserManagementTabV2` still uses native checkbox/select styles; do not redesign unless validation catches broken UI.
- Existing data hooks use raw `useEffect`; note as follow-up, don't expand scope.
- DELETE user endpoint may return structured errors; surface with toast if v5 toast is available.

## Security considerations
- User management remains admin-only via UI gating and server auth.
- API key modal must continue showing raw key once only.
- FB access token remains password input and should not be logged.

## Next steps
- Get user approval.
- Implement phase 01.
- Delegate testing and code review per workflow.
