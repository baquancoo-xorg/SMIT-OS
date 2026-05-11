---
type: brainstorm
date: 2026-05-12 01:45 Asia/Saigon
project: SMIT-OS
slug: ui-rebuild-v4-foundation-first
status: approved
related:
  - docs/project-changelog.md (2026-05-12 cleanup-medium)
  - src/index.css (v3 Bento Apple tokens, 405 lines)
  - src/components/ui/*.tsx (30 primitives v3)
---

# UI Rebuild v4 — Foundation-First Parallel Migration

## 1. Problem Statement

User pain: "sửa đi sửa lại UI mỗi lần không đồng nhất, cái có cái không". Quyết định ban đầu: đập đi xây lại toàn bộ UI.

**Root cause sau scout (không phải UI cũ xấu):**
- Token system v3 đã tồn tại (`src/index.css` 405 dòng, Bento Apple Foundation) nhưng **code không enforce dùng**.
- Mixed usage trong cùng codebase: `bg-blue-600` (raw Tailwind) song song `bg-error-container` (semantic token); `rounded-lg/md/xl` song song `rounded-card/button/modal`; opacity zoo `/5 /20 /30 /40 /50 /60 /80 /90 /95`.
- Tìm thấy class invalid `bg-error-container/30/50` (typo — Tailwind silently fail).
- Không có lint gate chặn raw colors/spacing.
- 152 file, 10 pages, 30 UI primitives, 9 domain folders.

**Diagnosis:** Vấn đề là **process gap**, không phải design system gap. Rewrite không có gate = lệch lại sau 2-3 tháng.

## 2. User Constraints (validated)

| Dimension | Decision |
|---|---|
| Pain | Style lệch giữa các trang |
| Prod usage | Team nội bộ, không down lâu |
| Time budget | 1-2 tháng full rebuild |
| Goal | Cả 3: đẹp + dễ sửa + maintain dài hạn |
| Strategy | A. Foundation-first rebuild |
| Visual | Đổi sang style mới hoàn toàn (reference user cung cấp sau) |
| Component lib | Tự build hoàn toàn (no shadcn) |
| Scope | All 10 pages |

## 3. Approaches Evaluated

### A. Foundation-First Parallel Migration ✅ CHỌN

Build tokens v4 + components v4 trong `src/design/v4/`, lint gate enforce ngay từ tuần 0, rebuild từng page lên foundation đó, parallel route `/v4/*` để team nội bộ dùng v3 tiếp.

**Pros:** Zero downtime; lint gate ngăn lệch ngay từ đầu; coexist cho phép rollback; visual reference có thể đến muộn không block foundation; success criteria đo được (`zero raw class`).

**Cons:** 8-10 tuần; cần feature flag infra per-user; phải maintain v3+v4 cùng lúc 5-6 tuần.

### B. Big-bang Full Rewrite (REJECTED)

Tạo app v4 từ scratch ở repo riêng, rewrite mọi page parallel, switch 1 lần.

**Pros:** Clean break, không gánh v3 legacy.
**Cons:** Industry data — big-bang rewrite trượt 2-3× estimate; team nội bộ phải chờ; risk cao vì không rollback được; conflict với constraint "không down lâu".

### C. Enforce-only (REJECTED)

Giữ v3, viết lint rule, migrate code cũ sang token đã có. 1-2 tuần.

**Pros:** Rẻ, nhanh, không break.
**Cons:** Không đạt goal "UI đẹp hơn" + "đổi style mới hoàn toàn" mà user đã chốt.

## 4. Recommended Solution (A — Foundation-First)

### 4.1 Timeline (8-10 tuần)

```
Tuần 0  | Audit + Lint gate setup (block raw Tailwind tokens)
Tuần 1  | Design tokens v4 — 3-tier CSS variables (primitive → semantic → component)
Tuần 2  | Component primitives v4 batch 1: button, input, badge, card, modal, dropdown, table, tabs (8 components)
Tuần 3  | Visual integration sau khi user gửi reference + duyệt 5 screen mockup
        | Component primitives v4 batch 2: 22 components còn lại
Tuần 4  | Dashboard rebuild on v4 (page phức tạp nhất → test foundation)
Tuần 5  | AdsTracker + LeadTracker
Tuần 6  | MediaTracker + OKRsManagement + DashboardOverview
Tuần 7  | DailySync + WeeklyCheckin
Tuần 8  | Settings + Profile + LoginPage (low-complexity, đệm thời gian)
Tuần 9  | Cutover: switch default route v3 → v4, delete v3 code + tokens
Tuần 10 | QA buffer + visual regression bằng posthog-ui-regression-monitor.ts
```

### 4.2 Architecture

```
src/
├── design/v4/                       ← NEW, locked source of truth
│   ├── tokens.css                   ← 3-tier: primitive/semantic/component
│   ├── components/                  ← 30 primitives mới, self-built
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── data-table.tsx
│   │   └── ... (30 total)
│   ├── primitives/                  ← Headless behavior (focus trap, dialog logic)
│   └── lib/cn.ts
├── components/                      ← v3 LEGACY, kept until cutover
├── pages-v4/                        ← NEW pages on v4 foundation
└── pages/                           ← v3 pages, deleted at cutover
```

**Routing:** `/v4/*` prefix parallel route. Feature flag `useUIV4: boolean` per user trong UserSettings table → mặc định false, admin bật cho tester. Tuần 9 flip default → true cho all.

### 4.3 Key Decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | 3-tier token system (primitive `color-blue-500` → semantic `color-action-primary` → component `button-bg-default`) | Industry pattern; cho phép rebrand bằng đổi semantic layer mà không động components |
| 2 | Self-built components, no shadcn | User chọn — full control, accept +2-3 tuần effort |
| 3 | Custom ESLint rule `no-raw-design-tokens` chặn `bg-{color}-{shade}`, `rounded-{size}`, `p-{n}`, `m-{n}` ngoài whitelist | **MANDATORY**, ngăn root cause lặp lại |
| 4 | Parallel route + feature flag, không nhánh git riêng | Tránh long-lived branch hell; cho team nội bộ test thật |
| 5 | Giữ react-router-dom v7, TanStack Query, Express backend | Out-of-scope; tránh scope creep |
| 6 | Visual reference từ user **bắt buộc tuần 1-2** | Block tuần 3 nếu không có |
| 7 | Mỗi page rebuild xong = git tag `ui-v4-page-{name}` | Rollback granularity |
| 8 | PostHog UI regression monitor chạy nightly trên `/v4/*` | Đã có script `scripts/posthog-ui-regression-monitor.ts` |

### 4.4 Component Inventory (30 primitives v4)

Layout: `app-shell`, `sidebar`, `header`, `page-header`, `glass-card` → `surface-card`
Form: `button`, `input`, `select`, `date-picker`, `date-range-picker`, `custom-select`
Data: `data-table`, `sortable-th`, `table-row-actions`, `kpi-card`, `filter-chip`
Feedback: `badge`, `status-dot`, `spinner`, `skeleton`, `empty-state`, `error-boundary`
Overlay: `modal`, `form-dialog`, `confirm-dialog`, `dropdown-menu`, `notification-center`, `notification-toast`
Misc: `tab-pill`, `not-found-page`, `okr-cycle-countdown`

## 5. Migration Strategy (Zero Downtime)

```
Step 1 | Tuần 4 — Dashboard ship trên /v4/dashboard, admin bật flag cho 1-2 tester
Step 2 | Mỗi page ship → feedback loop 2-3 ngày → fix
Step 3 | Tuần 7-8 — Bật flag cho cả team nội bộ
Step 4 | Tuần 9 — Đổi default flag true. Sidebar có link "Back to v3" 1 tuần
Step 5 | Tuần 10 — Delete v3 code, tokens, routes. Cleanup git.
```

## 6. Success Criteria

- **Quantitative:**
  - `zero` raw Tailwind color/radius/spacing classes trong `src/pages-v4/` + `src/design/v4/` (lint pass)
  - `100%` 10 pages dùng cùng 30 components v4
  - `0` visual regression alert từ PostHog monitor 7 ngày liên tiếp sau cutover
  - Bundle size không tăng quá `+10%` so với v3
- **Qualitative:**
  - Team nội bộ approve UI v4 trước khi delete v3
  - Style consistency: spot-check 10 pages, không có "style lệch giữa các trang"
  - Dev experience: sửa 1 token = thay đổi toàn app (DRY validation)

## 7. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Visual reference đến muộn → block tuần 3 | Medium | High | Tuần 1-2 user gửi mood board + 1 page reference. Nếu chậm, dùng "Notion-style warm minimal" placeholder rồi tune sau |
| Tự build 30 components vượt 50% estimate | High | High | Phase-gate: tuần 2 review batch 1 (8 components) — nếu chậm, fallback sang shadcn cho batch 2 |
| Feature flag complexity | Low | Medium | Đơn giản: 1 column `uiVersion` trong User table, không cần PostHog feature flags |
| Team nội bộ confused giữa v3/v4 | Medium | Low | Sidebar v4 có badge "BETA", v3 có badge "LEGACY" |
| Lint gate gây false positive | Medium | Low | Whitelist allowlist trong `.eslintrc`, iterate tuần 0 |
| Backend coupling phát hiện ra | Low | Medium | Out-of-scope, ghi log, tạo follow-up plan |
| 152 file rewrite scope creep | High | High | Mỗi tuần 1 phase, không skip; user duyệt cuối mỗi tuần |

## 8. Implementation Considerations

**Bắt buộc trước khi bắt đầu Phase 1:**
1. User gửi visual reference (Figma / screenshot / link) — chậm nhất cuối tuần 1
2. Quyết định dark mode: v3 không có, v4 có cần không? (mặc định: KHÔNG, để scope creep)
3. Quyết định mobile responsive: v3 desktop-only, v4 có cần không? (mặc định: desktop-only như cũ)
4. Backup branch `pre-v4-rebuild` từ commit hiện tại

**Out-of-scope (explicit):**
- Đổi router (react-router-dom v7 giữ nguyên)
- Đổi state/data fetching (TanStack Query giữ nguyên)
- Backend changes
- Test framework setup (đã drop vitest tại cleanup-medium)
- Storybook (đã drop tại cleanup-medium)

## 9. Next Steps

1. ✅ User approve brainstorm (DONE)
2. ⏭ Run `/ck:plan` để tạo detailed implementation plan tại `plans/260512-0145-ui-rebuild-v4-foundation-first/`
3. ⏭ User gửi visual reference trong tuần 1
4. ⏭ Setup lint gate `no-raw-design-tokens` (Phase 0)
5. ⏭ Build tokens v4 (Phase 1)

## 10. Unresolved Questions (cho plan phase)

1. Dark mode v4: bao gồm hay defer? (recommendation: defer, giảm scope 1-2 tuần)
2. Mobile responsive v4: bao gồm hay defer? (recommendation: defer, desktop-first như cũ)
3. Feature flag implementation: column `User.uiVersion` hay localStorage? (recommendation: column DB để admin control)
4. Cutover communication: notify team nội bộ trước bao lâu? (recommendation: 1 tuần trước)
5. Backup retention: giữ `pre-v4-rebuild` branch bao lâu sau cutover? (recommendation: 3 tháng)
6. Token naming convention: kế thừa v3 (`--color-primary`) hay đổi format mới (`--color-action-primary`)? — Quyết tại Phase 1 design review.
