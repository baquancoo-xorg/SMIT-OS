# Permission-Sensitive Action UI — Risk Analysis
Date: 2026-04-27 | Branch: main

---

## 1. Permission/Flow Rules That Must Be Preserved

### LeadLogs (`lead-logs-tab.tsx`)

Two derived booleans gate all action rendering:

```ts
const isSale = currentUser?.departments?.includes('Sale');
const isAdminOrLeaderSale = (
  currentUser?.isAdmin ||
  currentUser?.role === 'Admin' ||
  (currentUser?.role === 'Leader' && currentUser?.departments?.includes('Sale'))
);
```

**Delete flow — four mutually exclusive branches, conditional on role + lead state:**

| Condition | UI shown | Action |
|---|---|---|
| No pending delete | Trash icon | `isAdminOrLeaderSale` → hard delete; else → `requestLeadDelete(reason)` |
| `hasPendingDelete` + `isAdminOrLeaderSale` | Approve (✓) + Reject (✗) inline widget | `approveLeadDeleteRequest` / `rejectLeadDeleteRequest` |
| `hasPendingDelete` + requester === current user | "Đang chờ" amber button | `cancelLeadDeleteRequest` |
| `hasPendingDelete` + different user, non-admin | Clock icon only (read-only) | none |

**Checkbox / bulk selection:** shown only for `isSale`. Bulk delete gated behind `isAdminOrLeaderSale` (alerts and returns early — this is a UX inconsistency: the button is visible to Sale members but blocked at runtime).

**Edit button:** always visible to all authenticated users — no permission gate on the edit action itself.

**Row highlight:** `hasPendingDelete && isAdminOrLeaderSale` adds a left rose border — purely visual, safe to keep in-component.

---

### UserManagement (`user-management-tab.tsx`)

No explicit permission check inside the component. Delete and Edit buttons are rendered for all users unconditionally. The only guard:
- Delete button: `disabled={user.id === currentUser?.id}` — self-delete prevention only.
- Permission enforcement is deferred to the server (`/api/users/:id` DELETE).
- The Settings page (`Settings.tsx`) is assumed to be admin-gated at route level (not verified in this read).

**Risk:** If the Settings route is ever accessible to non-admins, UserManagement tab renders destructive buttons for everyone.

---

### FbConfig (`fb-config-tab.tsx`)

Zero client-side permission checks. All actions (add, edit, delete, sync, exchange rate) call `/api/admin/*` endpoints. The component assumes the page is already admin-restricted.

**Risk:** Same as UserManagement — no defense-in-depth on the UI layer. Acceptable only if route guard is rock-solid.

---

## 2. What Action UI Can Safely Be Standardized

### Safe to extract into a shared component

| Pattern | Files | Notes |
|---|---|---|
| Row hover action container (`opacity-0 group-hover:opacity-100`) | All three | Pure layout, no logic |
| Icon button style (`p-2 text-slate-400 hover:text-X hover:bg-X/5 rounded-xl`) | All three | Pure style |
| Edit button (pencil icon → opens modal/form) | All three | No permission gate |
| Inline confirm pattern (window.confirm / window.prompt) | LeadLogs, FbConfig | Can be abstracted into a hook |

### Must NOT be extracted into shared component

| Pattern | Reason |
|---|---|
| LeadLog delete branch logic | Four-way conditional is domain-specific and permission-coupled |
| `isAdminOrLeaderSale` derivation | Must stay in LeadLogsTab — shared component cannot own auth context reads |
| Pending delete inline widget (approve/reject/cancel) | State depends on `lead.deleteRequestedBy` + current user identity |
| Bulk delete guard (`!isAdminOrLeaderSale` alert) | Should be refactored to hide the button rather than alert, but change must stay in LeadLogsTab |

---

## 3. File Ownership / Parallel Split Safety

### Safe parallel ownership splits

| File | Owner | Notes |
|---|---|---|
| `lead-logs-tab.tsx` | Dev A | All lead permission logic lives here; no shared state with Settings |
| `user-management-tab.tsx` | Dev B | Isolated; no cross-dependency with LeadLogs or FbConfig |
| `fb-config-tab.tsx` | Dev B or C | No overlap with other tabs |
| `Settings.tsx` | Dev B (or lead) | Passes callbacks (`onDeleteConfirm`, `isAddingUser`, `setIsAddingUser`, `isAddingFb`, `setIsAddingFb`) into tabs — coordinate if adding new props |
| Shared UI component (new) | Dev C | Read-only consumption by other owners; must not import AuthContext |

**Conflict zone:** `Settings.tsx` is the only shared parent. If Dev A and Dev B both need to add props to child tab components that flow through Settings, coordinate on the Settings.tsx prop signature before splitting.

### Risks to flag before splitting

1. **Bulk delete UX bug** — Sale members see the bulk delete button but get an alert on click. Rule says "unauthorized actions should be hidden, not disabled." This must be fixed in LeadLogsTab (hide button when `!isAdminOrLeaderSale`), not in a shared component.

2. **UserManagement / FbConfig lack UI-layer permission guards** — acceptable only if Settings route is admin-gated. Verify `Settings.tsx` or router config enforces this before marking standardization complete.

3. **Edit button in LeadLogs has no permission gate** — any authenticated user can open the edit dialog. Unknown if this is intentional. Clarify before standardizing edit action UI.

4. **`isAdminOrLeaderSale` logic is inline, not a hook** — if standardizing, extract to a `useLeadPermissions()` hook inside the lead-tracker domain only. Do not promote to a global auth utility without broader audit.

---

## Unresolved Questions

- Is the Settings route admin-gated at the router level? (Determines whether FbConfig and UserManagement need UI permission guards.)
- Is the LeadLogs edit button intentionally ungated for all users?
- Is showing bulk delete to Sale members and blocking at runtime intentional behavior or a known bug to fix?
