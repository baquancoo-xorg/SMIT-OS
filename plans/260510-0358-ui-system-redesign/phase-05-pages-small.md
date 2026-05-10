# Phase 05 — Pages Redesign: Small (Auth + Profile + Settings)

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Mockup: Phase 3 batch 1
- Component library: Phase 4 v2 components
- Dependencies: Phase 4 done

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P2 |
| Effort | 1.5 tuần (expanded) |
| Status | pending |

Redesign 3 small pages trước (Login, Profile, Settings) để **validate design system + component library** trên scope nhỏ trước khi vào pages phức tạp hơn. Nếu phát hiện component thiếu/sai → fix Phase 4 trước khi tiến tiếp.

## Pages

| Page | LOC current | Complexity |
|---|---|---|
| LoginPage.tsx | 488 | Medium (multi-step 2FA flow + password reset?) |
| Profile.tsx | 72 | Low |
| Settings.tsx | 153 | **High** (5 sub-tabs, Admin/Member gates) |

### ⚠️ Settings có 5 sub-tabs cần redesign riêng

| Sub-tab | Component | Access | Use case chính |
|---|---|---|---|
| Profile | `profile-tab.tsx` | All | Edit basic info, password, 2FA management |
| Users | `user-management-tab.tsx` | Admin | CRUD users, role assign (Admin/Member sau role-simp) |
| OKR Cycles | `okr-cycles-tab.tsx` | Admin | Quarterly cycle config |
| FB Config | `fb-config-tab.tsx` | Admin | **Meta Ads token + ad account config** (critical cho Acquisition Phase 3) |
| Sheets Export | `sheets-export-tab.tsx` | Admin | Google Sheets export config |
| (Tabs nav) | `settings-tabs.tsx` | — | Tab navigation component |

## Implementation Steps

### LoginPage redesign (2-3d)
1. Replace với mockup batch 1
2. Reuse v2 `<FormDialog />`, `<Input />`, `<Button />`
3. 2FA flow: 2-step UI (password → TOTP)
4. Error states: invalid credentials, TOTP wrong, account locked
5. Loading state during auth API call
6. Mobile responsive

### Profile redesign (1d)
1. Replace với mockup
2. Reuse v2 `<PageHeader />`, `<GlassCard />`, `<Input />`
3. Edit mode toggle
4. Avatar upload (nếu có)

### Settings redesign (3-4d, expanded scope)

5 sub-tabs riêng biệt, mỗi sub-tab redesign như 1 page nhỏ. Permission gate: hide tabs theo Admin/Member (sau role-simp ship).

1. **Profile sub-tab** (0.5d): edit basic info, password change, 2FA setup/disable, backup codes
2. **Users sub-tab** (Admin, 1d): list users + DataTable, role dropdown (Admin/Member only), invite user, deactivate
3. **OKR Cycles sub-tab** (Admin, 0.5d): Q1/Q2/Q3/Q4 setup, dates, current cycle indicator
4. **FB Config sub-tab** (Admin, 1d): **CRITICAL** — Meta Ads token config UI, ad account list, sync status, last error display
5. **Sheets Export sub-tab** (Admin, 0.5d): Google Sheets URL config, export schedule, last run status
6. **Settings tabs nav** (`settings-tabs.tsx`): pill-style nav theo style guide v2

Reuse v2 `<TabPill />`, `<DataTable />`, `<FormDialog />`, `<EmptyState />`, `<KpiCard />` (cho status indicator).

### Per-page checklist
- [ ] Mockup → code match ≥ 95% pixel
- [ ] All states (default/hover/loading/error/empty) implemented
- [ ] Mobile responsive (≥ 375px)
- [ ] Lighthouse Performance ≥ 85, Accessibility ≥ 90
- [ ] 4 persona test (Admin/Member × Desktop/Mobile)
- [ ] Ownership gates work (Profile chỉ edit own, Settings User mgmt Admin only)
- [ ] No console error/warning

## Output Files

```
src/pages/v2/
├── LoginPage.tsx
├── Profile.tsx
└── Settings.tsx

src/components/settings/v2/    (sub-components mới nếu cần)

src/App.tsx                    (route swap khi user OK)
```

**Migration strategy:**
- Build trong `src/pages/v2/` namespace
- Routes giữ existing (`/login`, `/profile`, `/settings`) nhưng có thể toggle qua env var hoặc query param `?v=2` cho preview
- Sau khi user OK → swap import trong `App.tsx`
- Delete `src/pages/{Page}.tsx` cũ ở Phase 8

## Todo List

- [ ] Build LoginPage v2 (2-3d)
- [ ] Build Profile v2 (1d)
- [ ] Build Settings shell + tabs nav (0.5d)
- [ ] Build Settings/Profile sub-tab (0.5d)
- [ ] Build Settings/Users sub-tab (1d)
- [ ] Build Settings/OKR Cycles sub-tab (0.5d)
- [ ] Build Settings/FB Config sub-tab (1d)
- [ ] Build Settings/Sheets Export sub-tab (0.5d)
- [ ] Per-page checklist pass
- [ ] User review 3 pages + 5 Settings sub-tabs
- [ ] Component fix-back (nếu phát hiện thiếu)

## Success Criteria

- [ ] 3 pages match mockup ≥ 95%
- [ ] All states implemented
- [ ] Mobile + desktop OK
- [ ] Lighthouse ≥ 85/90
- [ ] User sign-off → unblock Phase 6

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Component v2 thiếu → block | 🔴 High | Audit Phase 4 đầy đủ. Nếu thiếu → quay lại Phase 4 fix trước |
| LoginPage 2FA flow break | 🔴 High | Test kỹ với real account 2FA enabled |
| Settings User mgmt UI complex | 🟡 Medium | DataTable component support sort/filter/pagination từ Phase 4 |
| Migration break existing route | 🟡 Medium | Toggle qua query param trước khi swap import |

## Security Considerations

- Login form: rate limit hiện có giữ nguyên backend
- 2FA: TOTP entry không log, không cache UI
- Settings: permission gate ở backend (Phase 6 role-simp đã handle)

## Next Steps

- Phase 6: Pages Medium (DailySync + Checkin + LeadTracker)
