# Phase 05 — Settings Cleanup

## Context Links
- **Parent plan:** [plan.md](./plan.md)
- **Brainstorm:** `plans/reports/brainstorm-260509-2355-smit-os-slim-down.md` mục 3.4
- **Depends on:** [Phase 03 — Frontend Pages](./phase-03-frontend-pages.md)

## Overview
- **Date:** 2026-05-09 | **Revised:** 2026-05-10
- **Priority:** P3
- **Status:** completed
- **Review status:** completed
- **Effort:** 0.5h
- **Description:** Drop **1** settings tab (`sprints`). **Giữ `fb-config`** vì DashboardOverview vẫn cần config FB account. Verify còn 5 tabs (profile/users/okrs/fb-config/export).

## Key Insights
- Settings hiện có 6 tab: `users`, `sprints`, `okrs`, `fb-config`, `profile`, `export`
- **1 tab drop:** `sprints` (Sprint model đã DROP P1)
- **5 tab giữ:** `profile`, `users`, `okrs`, `fb-config` (FB Ads stack giữ → cần config), `export`
- Logic isAdmin gating cho từng tab giữ nguyên
- Trivial phase, low risk

## Requirements

### Functional
- Settings page render đúng 4 tab
- Tab navigation `setActiveTab` không reference id obsolete
- Default tab vẫn là `users` (admin) hoặc `profile` (non-admin)
- Không có dead import nào

### Non-functional
- `npm run build` pass clean
- No console error trên Settings page

## Architecture

### Tab List Final

| Tab ID | Label | Visibility |
|---|---|---|
| `profile` | Profile | All users |
| `users` | User Management | Admin only |
| `okrs` | OKR Cycles | Admin only |
| `fb-config` | FB Config | Admin only |
| `export` | Sheets Export | Admin only |
| ~~`sprints`~~ | DROP | — |

### Type Definition

```ts
// Before
export type SettingsTabId = 'users' | 'sprints' | 'okrs' | 'fb-config' | 'profile' | 'export';

// After
export type SettingsTabId = 'users' | 'okrs' | 'fb-config' | 'profile' | 'export';
```

## Related Code Files

### Modify
- `src/components/settings/settings-tabs.tsx` — drop 1 entry (`sprints`) + update type
- `src/pages/Settings.tsx` — drop 1 import (`SprintCyclesTab`) + 1 render branch

### Create
- (none)

### Delete
- `src/components/settings/sprint-cycles-tab.tsx`
- (KEEP `fb-config-tab.tsx`)

## Implementation Steps

1. **Edit `src/components/settings/settings-tabs.tsx`:**
   - Update `SettingsTabId` type (drop `'sprints'`)
   - Remove tabs array entry `{id: 'sprints', ...}`
   - GIỮ entry `{id: 'fb-config', ...}` + import `Facebook` icon
2. **Edit `src/pages/Settings.tsx`:**
   - Remove import `SprintCyclesTab`
   - GIỮ import `FbConfigTab`
   - Remove conditional render: `if (activeTab === 'sprints') ...`
   - Remove render branch: `{activeTab === 'sprints' && ...}`
   - GIỮ render branch fb-config
   - Verify default tab logic: admin → `users`, non-admin → `profile`
3. **Delete 1 file:**
   - `rm src/components/settings/sprint-cycles-tab.tsx`
4. **Build verify** — `npm run build` clean
5. **Smoke test** — visit `/settings`:
   - admin: 5 tabs (users, okrs, fb-config, export, profile)
   - non-admin: 1 tab (profile)

## Todo Checklist

- [x] Update `SettingsTabId` type trong `settings-tabs.tsx` (drop `'sprints'`)
- [x] Remove 1 tab entry `sprints` trong tabs array
- [x] Update `Settings.tsx` (remove SprintCyclesTab import + render branch)
- [x] Delete `sprint-cycles-tab.tsx`
- [x] `npm run build` pass clean
- [x] Smoke test admin Settings (5 tabs)
- [x] Smoke test non-admin Settings (chỉ profile)
- [x] Verify nav default tab đúng
- [x] Verify tab fb-config vẫn render đúng (FB account list, sync controls)

## Success Criteria

- ✅ Settings page admin render đúng 5 tab
- ✅ Settings page non-admin render đúng 1 tab (profile)
- ✅ Click qua mỗi tab work, không error
- ✅ Build clean
- ✅ No dead import
- ✅ `SettingsTabId` type chỉ còn 5 string literal
- ✅ FB Config tab list account FB như cũ

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Type narrowing TS error nơi khác dùng `SettingsTabId` | Low | Grep `SettingsTabId` trước, sửa downstream |
| Default tab fallback fail nếu user state lưu `'sprints'` localStorage | Low | Check Settings.tsx initial state, reset về `users`/`profile` nếu invalid |
| Icon import `Facebook` còn dùng nơi khác | Low | Grep `from 'lucide-react'` import `Facebook` xem |

## Security Considerations

- Admin gating giữ nguyên: `{activeTab === 'users' && isAdmin && ...}`
- Drop `fb-config` không expose secret nào (token đã ở DB drop trong P1)
- `SheetsExportTab` admin-only giữ nguyên

## Next Steps
- Verify toàn bộ 5 phase done
- Run end-to-end smoke test:
  - Daily report submit
  - Weekly check-in submit
  - Approval flow
  - Lead Tracker ops
  - PMDashboard 3 panel render
- Update `docs/system-architecture.md`, `docs/project-changelog.md` (delegate to docs-manager nếu cần)
- Commit + push + tạo PR (delegate to git-manager)
- Run `/ck:journal` để ghi nhận sprint
