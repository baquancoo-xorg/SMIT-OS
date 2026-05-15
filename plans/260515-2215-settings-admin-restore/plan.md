# Restore Settings Admin UI

## Status
- Status: completed
- Scope: restore missing admin Settings wiring only; no broad redesign

## Goal
Khôi phục các regression trong trang Settings admin:
- Thêm lại tab `User` cho admin.
- Thêm action button luôn hiển thị theo tab: `Add User`, `Create New Key`, `Add New Account`.
- Rà toàn Settings ở mức wiring/regression, không đổi kiến trúc API.

## Docs / constraints
- UI contract §40: Settings user management dùng DataTable + FormDialog + DropdownMenu.
- UI contract §13/§22/§48: Tab/CTA không solid orange; primary CTA dùng Button primitive.
- UI contract §45: ưu tiên direct import/no barrel khi chạm code mới.
- API key docs lines 115-123: Settings → API Keys → generate key modal, raw key shown once.
- Code standards lines 13-22: dùng v5 primitives, token colors, no solid orange CTA.

## Phase
1. [phase-01-restore-settings-admin-ui.md](phase-01-restore-settings-admin-ui.md) — Restore User tab + action buttons + validation.

## Key files
- `src/pages/v5/Settings.tsx`
- `src/components/settings/user-management-tab.tsx`
- `src/components/settings/api-keys-panel.tsx`
- `src/components/settings/fb-config-tab.tsx`
- `src/contexts/AuthContext.tsx`

## Validation
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- UI smoke: Settings tabs in dark + light; admin-only behavior; action buttons open expected dialogs.

## Risks
- Existing `UserManagementTabV2` requires delete confirm callback; Settings must wire real DELETE `/api/users/:id` flow or reuse existing pattern.
- `PageToolbar` action slot API must be verified before implementation.
- Some settings components still use local raw `useEffect`; avoid expanding scope unless compile/UI regression requires it.
