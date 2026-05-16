# Brainstorm — `src/components/` Cleanup & Restructure

**Date:** 2026-05-16 12:29
**Owner:** Quân Bá
**Status:** ⚠️ PARTIAL EXECUTION — Phase 1 done, Phase 2-7 DEFERRED.
**Scope:** Refactor-only. Zero feature/visual change. Frontend hành vi giữ nguyên 100%.

---

## ⚠️ POST-EXECUTION NOTE (2026-05-16)

**Phase 1 executed & committed.** Audit ban đầu under-estimated: codebase thực sự là **2-layer wrapper architecture** (legacy `components/dashboard/*` chứa business logic, `v5/dashboard/*-v5.tsx` chỉ là Card+heading wrapper). Tương tự `pages/v5/{OKR,WeeklyCheckin}.tsx` là 1-liner shim re-export `pages/{X}.tsx` (legacy).

**Quyết định:** Stop sau Phase 1 để giữ stable. Phase 2-7 là cosmetic refactor có risk break wrapper chain, không xứng đáng với gain.

**Folder thực sự xoá (Phase 1 commit `<pending>`):**
- `src/components/board/` (1 file, 0 importer)
- `src/components/layout/` (5 files, replaced bởi `v5/layout`)
- `src/pages/DailySync.tsx` (legacy full impl, page route dùng `pages/v5/DailySync.tsx` full impl)
- `src/components/lead-tracker/{last-sync-indicator,lead-type-chart,source-badge,sync-from-crm-button,csv-export}` (5 files)
- `src/components/ads-tracker/csv-export.ts`
- `src/ui/` (empty dirs)

**Folder GIỮ LẠI (LIVE via shim chain):**
- `components/checkin` ← `modals/WeeklyCheckinModal` ← `pages/WeeklyCheckin.tsx` ← shim `pages/v5/WeeklyCheckin.tsx`
- `components/modals` (cùng chain)
- `components/okr` ← `pages/OKRsManagement.tsx` ← shim `pages/v5/OKRsManagement.tsx`
- `components/dashboard/*` ← wrapped bởi `v5/dashboard/*-v5.tsx`

§3-§9 dưới đây giữ **làm reference** cho future refactor nếu muốn loại bỏ 2-layer.

---

---

## 1. Problem Statement

Frontend v4 (đã ship 2026-05-12, log trong `MEMORY.md`) đang ổn định. User muốn:
1. Tìm và loại bỏ component **orphan** (không còn import nào).
2. Tái cấu trúc `src/components/` cho **chuyên nghiệp + dễ extend**.
3. Giữ nguyên hành vi runtime — đây là **dọn nhà**, không phải redesign.

**Gốc rễ vấn đề:** Codebase đã trải qua 5 lần migration (v1→v5). Mỗi lần migrate copy/migrate file mới sang `components/v5/*` nhưng **không xoá triệt để folder cũ**. Hiện co-exist 2 thế hệ folder. Namespace `v5/` cũng mất ý nghĩa vì v1-v4 đã hard-delete.

---

## 2. Audit Result

### 2.1 Orphan folders (0 importer ngoài chính nó) — DELETE

| Folder | Files | Verdict |
|---|---|---|
| `src/components/board/` | 1 (`ReportTableView.tsx`) | 💀 Orphan |
| `src/components/checkin/` | 2 (`ConfidenceSlider`, `KrCheckinRow`) | 💀 Orphan |
| `src/components/dashboard/` | ~30 files (acquisition-overview, call-performance, lead-distribution, marketing, media, overview, product, ui) | 💀 Orphan toàn bộ — replaced bởi `v5/dashboard/*` |
| `src/components/layout/` | 5 files | 💀 Orphan — replaced bởi `v5/layout/*` |
| `src/components/modals/` | 1 (`WeeklyCheckinModal`) | 💀 Orphan — chỉ legacy page dùng |
| `src/components/okr/` | 2 (`okr-accordion-cards`, `department-color-config`) | 💀 Orphan — chỉ legacy page dùng |

### 2.2 Orphan files trong folder used — DELETE

`src/components/lead-tracker/` (giữ 4, xoá 8):
- ❌ `bulk-action-bar.tsx`, `csv-export.ts`, `last-sync-indicator.tsx`, `lead-detail-modal.tsx`, `lead-log-dialog.tsx`, `lead-type-chart.tsx`, `source-badge.tsx`, `sync-from-crm-button.tsx`
- ✅ Giữ: `daily-stats-tab.tsx`, `dashboard-tab.tsx`, `lead-filters-popover.tsx`, `lead-logs-tab.tsx`

`src/components/ads-tracker/` (giữ 3, xoá 1):
- ❌ `csv-export.ts`
- ✅ Giữ: `attribution-table.tsx`, `campaigns-table.tsx`, `spend-chart.tsx`

### 2.3 Legacy pages — DELETE

| File | Status |
|---|---|
| `src/pages/OKRsManagement.tsx` | 💀 Không routed (App.tsx chỉ dùng `pages/v5/*`) |
| `src/pages/WeeklyCheckin.tsx` | 💀 Không routed |
| `src/pages/DailySync.tsx` | 💀 Không routed |
| `src/pages/LoginPage.tsx` | ✅ USED (routed when `!currentUser`) |
| `src/ui/` (toàn bộ — `components/primitives/` + `pages/`) | 💀 Empty dirs, 0 importer |

### 2.5 `src/design/v5/` — USED nhưng cần flatten + drop V5_ prefix

| File | Importer |
|---|---|
| `src/design/v5/tokens.ts` | `contexts/theme-context.tsx`, `contexts/density-context.tsx`, `components/v5/ui/charts/chart-palette.ts` |
| `src/design/v5/index.ts` | barrel re-export |
| `src/design/v5/tokens.test.ts` | test |

**Exports cần rename:** `V5_THEME_STORAGE_KEY` → `THEME_STORAGE_KEY`, `V5_DENSITY_STORAGE_KEY` → `DENSITY_STORAGE_KEY`, `v5BrandTokens` → `brandTokens`, `v5ThemeTokens` → `themeTokens`.

⚠️ **Storage key VALUES (`'smit-theme'`, `'smit-density'`) giữ nguyên** — đổi sẽ wipe user setting.

### 2.4 Tổng số file dự kiến xoá: **~55-60 files** + 8 empty dirs.

---

## 3. Proposed Architecture

### 3.1 Sau cleanup, trước restructure

```
src/components/
├── ads-tracker/       (3 files — used internally by v5/growth/ads)
├── lead-tracker/      (4 files — used by pages/v5/LeadTracker + v5/dashboard)
├── settings/          (6 files — used by pages/v5/Settings)
└── v5/
    ├── admin/         (5 files)
    ├── dashboard/     (10 files — feature: dashboard tabs)
    ├── execution/     (5 files — feature: daily report)
    ├── growth/        (8 files — feature: ads + media)
    ├── integrations/  (3 files)
    ├── intelligence/  (4 files — feature: reports)
    ├── layout/        (5 files — shell + sidebar + header)
    └── ui/            (32 files — design system primitives)
```

### 3.2 Flatten — drop `v5/` namespace, theo feature

```
src/
├── components/
│   ├── ui/                  ← design system (was v5/ui)
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── ... (32 files)
│   │   └── index.ts
│   ├── layout/              ← app shell (was v5/layout, OLD layout/ đã xoá)
│   │   ├── v5-shell.tsx → shell.tsx
│   │   ├── header-v5.tsx → header.tsx
│   │   ├── sidebar-v5.tsx → sidebar.tsx
│   │   ├── mobile-nav-drawer.tsx
│   │   └── workspace-nav-items.ts
│   └── features/            ← feature components (grouped)
│       ├── dashboard/       ← was v5/dashboard
│       │   ├── acquisition/
│       │   ├── call-performance/
│       │   ├── lead-distribution/
│       │   ├── marketing/
│       │   ├── media/
│       │   ├── overview/
│       │   ├── product/
│       │   └── index.ts
│       ├── growth/          ← was v5/growth + ads-tracker + (parts of) lead-tracker
│       │   ├── ads/
│       │   │   ├── ads-kpi-cards.tsx
│       │   │   ├── ads-spend-chart.tsx
│       │   │   ├── attribution-table.tsx   ← moved from ads-tracker/
│       │   │   ├── campaigns-table.tsx     ← moved
│       │   │   └── spend-chart.tsx         ← moved
│       │   ├── media/ (5 files)
│       │   ├── leads/                       ← was components/lead-tracker
│       │   │   ├── daily-stats-tab.tsx
│       │   │   ├── dashboard-tab.tsx
│       │   │   ├── lead-filters-popover.tsx
│       │   │   └── lead-logs-tab.tsx
│       │   └── date-range-utils.ts
│       ├── intelligence/    ← was v5/intelligence (Reports)
│       ├── execution/       ← was v5/execution (Daily Sync)
│       ├── integrations/    ← was v5/integrations
│       └── admin/           ← was v5/admin (Settings extras)
│           ├── integrations-tab.tsx
│           ├── settings-appearance-tab.tsx
│           ├── settings-security-tab.tsx
│           ├── two-factor-card.tsx
│           ├── use-two-factor.ts
│           ├── api-keys-panel.tsx     ← moved from settings/
│           ├── api-keys-table.tsx     ← moved
│           ├── fb-config-tab.tsx      ← moved
│           ├── generate-api-key-modal.tsx ← moved
│           ├── okr-cycles-tab.tsx     ← moved
│           └── user-management-tab.tsx ← moved
├── pages/                   ← flat, no v5/ subfolder
│   ├── LoginPage.tsx
│   ├── DashboardOverview.tsx
│   ├── LeadTracker.tsx
│   ├── AdsTracker.tsx
│   ├── MediaTracker.tsx
│   ├── Reports.tsx
│   ├── OKRsManagement.tsx
│   ├── WeeklyCheckin.tsx
│   ├── DailySync.tsx
│   ├── Settings.tsx
│   ├── Profile.tsx
│   └── Playground.tsx
└── ... (api/, contexts/, design/, hooks/, lib/, types/, utils/) giữ nguyên
```

### 3.3 Quyết định kiến trúc

| Quyết định | Lý do |
|---|---|
| **`components/ui/`** riêng (không nhét vào features) | Design system primitives. Tách biệt rõ — feature components composition trên primitives, không ngược lại. Match v4 design contract (`docs/ui-design-contract.md`). |
| **`components/features/<domain>/`** | Domain-driven: `dashboard`, `growth`, `intelligence`, `execution`, `admin`. Khi cần thêm tab/section vào Dashboard, chỉ động `features/dashboard/`. Khi xây Reports mới, isolated trong `features/intelligence/`. |
| **Merge `components/lead-tracker` → `features/growth/leads`** | Cùng domain Growth (ads + media + leads). Page `LeadTracker.tsx` là "growth/leads tab", không phải standalone module. |
| **Merge `components/settings` → `features/admin`** | `v5/admin/` đã có settings tabs (appearance, security, 2FA). Hợp nhất tránh 2 nơi cùng phục vụ Settings page. |
| **Rename `*-v5.tsx` → `*.tsx`** | Suffix `v5` mất ý nghĩa khi không còn v4. Path `features/dashboard/overview/kpi-table.tsx` đủ rõ. |
| **Flatten `pages/v5/` → `pages/`** | Chỉ 1 thế hệ pages, không cần namespace. Match URL routes (`/dashboard` ↔ `pages/DashboardOverview.tsx`). |
| **Giữ direct import, không barrel root** | Theo `feedback_*` & development-rules: no barrel root. Cho phép barrel **trong từng folder con** (`components/ui/index.ts`, `features/admin/index.ts`) — đã có sẵn pattern. |

### 3.4 Quy ước file naming sau refactor

- **kebab-case** cho tất cả file mới (đã là quy ước). Rename PascalCase legacy còn sót: `KpiTable.tsx → kpi-table.tsx`, `SummaryCards.tsx → summary-cards.tsx`, etc. (chỉ trong các file giữ lại).
- **Trong feature folder:** prefix bằng domain — `ads-kpi-cards.tsx`, `media-filter-bar.tsx` → tăng grep-ability.
- **Index.ts** chỉ tại ranh giới folder muốn expose ra ngoài (e.g. `components/ui/index.ts`, `features/admin/index.ts`). Không tạo root barrel.

---

## 4. Approaches Considered

| # | Approach | Pros | Cons | Verdict |
|---|---|---|---|---|
| **A** | **Cleanup + flatten (chosen)** | Codebase chuyên nghiệp, ngắn gọn, dễ extend. Drop tech debt namespace `v5`. | One-shot churn lớn (~120 file đổi import path). | ✅ Chosen |
| B | Cleanup-only, giữ `v5/` namespace | Ít churn import. Nhanh. | `v5` không có nghĩa → khó hiểu cho người mới. Vẫn lộn xộn ads-tracker/lead-tracker đứng riêng. | ❌ Half-measure |
| C | Refactor full + tách `src/ui/` ngoài `src/components/` | Tách rất rõ design system khỏi feature. | Lệch convention hiện tại (đã có `components/v5/ui`). Tạo thêm thay đổi không cần thiết. | ❌ Over-engineered |
| D | Monorepo split (packages/ui, packages/features) | Reuse cross-app. | YAGNI — single app, không có plan multi-app. | ❌ Vi phạm YAGNI |

---

## 5. Execution Plan (high-level — chi tiết sẽ trong `/ck:plan`)

**Phase 1 — DELETE orphans (zero risk)**
1. Verify orphan bằng grep 3-pattern (literal/barrel/relative-deep) theo `feedback_orphan_verification`.
2. `git rm` các folder/file orphan trong §2.1-§2.3.
3. Build verify: `npm run build` + `npm run dev` smoke test (load `/dashboard`, `/leads`, `/ads`, `/reports`).
4. Commit: `chore(components): remove orphan v1 legacy folders and files`

**Phase 2 — Rename `*-v5.tsx` & PascalCase legacy** (within `v5/` location, không move dir)
- `git mv` đơn lẻ, fix import nội bộ.
- Build verify sau mỗi sub-step.
- Commit: `refactor(components): rename v5 suffix files to canonical names`

**Phase 2.5 — Flatten `src/design/v5` → `src/design` + drop V5_ prefix**
- `git mv src/design/v5/*` → `src/design/`, `rmdir src/design/v5`.
- Rename exports: `V5_*` → bỏ prefix, `v5*` → bỏ prefix.
- Update 3 importer (`theme-context`, `density-context`, `chart-palette`).
- Storage key VALUES giữ nguyên.
- Build verify.
- Commit: `refactor(design): flatten design tokens out of v5 namespace`

**Phase 3 — Move `v5/ui` → `components/ui`
- `git mv src/components/v5/ui src/components/ui`
- Sed-replace import path `components/v5/ui` → `components/ui` (~90+ usages, well-defined).
- Build verify.
- Commit: `refactor(components): promote ui primitives out of v5 namespace`

**Phase 4 — Move `v5/layout` → `components/layout`**
- Đã xoá `components/layout/` orphan ở Phase 1, slot trống.
- `git mv`, sed-replace.
- Commit: `refactor(components): promote layout shell out of v5 namespace`

**Phase 5 — Move `v5/{dashboard,growth,intelligence,execution,integrations,admin}` → `components/features/*`**
- Tạo `components/features/`.
- Move từng folder + merge ads-tracker → features/growth/ads, lead-tracker → features/growth/leads, settings → features/admin.
- Sed-replace import paths.
- Build verify sau mỗi domain.
- Commit per domain: `refactor(components): move <domain> to features namespace`

**Phase 6 — Flatten `pages/v5/*` → `pages/*`**
- Đã xoá legacy pages ở Phase 1.
- `git mv`, update `App.tsx` lazy import paths.
- Build verify.
- Commit: `refactor(pages): flatten v5 namespace`

**Phase 7 — Final cleanup**
- Xoá empty `src/ui/`, `src/components/v5/` (sau khi rỗng).
- Update `docs/codebase-summary.md` reflect cấu trúc mới.
- `npm run dev` full smoke test mọi route.
- Commit: `chore: finalize components restructure + sync docs`

---

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Xoá nhầm file đang dùng (false-orphan) | Grep 3-pattern + `npm run build` verify trước mỗi commit. Đã làm sample audit ở §2. |
| Import path đổi quá nhiều → conflict với branch khác | User đang ở branch `main` sạch, không có WIP branch. Khuyến nghị chạy trong 1 phiên dài, không pause. |
| Sed-replace sai pattern → break import | Dùng pattern cụ thể (`from ['\"].*components/v5/ui`) thay vì naive replace. Build verify mỗi bước. |
| `pages/v5/Playground.tsx` chứa UI demo không phải route prod | Vẫn flatten + giữ nguyên — routed tại `/playground`. |
| `docs/` chứa path cũ | Phase 7 update `docs/codebase-summary.md`. Các doc khác nhắc path → search & update. |
| Git history bị mờ do rename hàng loạt | `git mv` preserve history. Dùng `git log --follow` khi cần truy vết. |

---

## 7. Success Criteria

- [ ] `npm run build` pass sau mỗi phase.
- [ ] `npm run dev` load không lỗi tất cả route: `/dashboard /leads /ads /media /reports /okrs /daily-sync /checkin /settings /profile /playground`.
- [ ] Manual smoke: mỗi page render, tabs switch, không console error.
- [ ] `src/components/v5/` không còn tồn tại.
- [ ] `src/pages/v5/` không còn tồn tại.
- [ ] `src/components/{board,checkin,layout(legacy),modals,okr}` không còn.
- [ ] Không có file `*-v5.tsx` còn lại trừ khi cần thiết.
- [ ] `docs/codebase-summary.md` reflect cấu trúc mới.

---

## 8. Out of Scope

- ❌ Visual / behavior change (theo `docs/ui-design-contract.md` — không động style/component logic).
- ❌ Thêm component mới, refactor implementation.
- ❌ Animation / theme tweaks.
- ❌ Database / API change.
- ❌ Test coverage tăng (chỉ giữ existing).

---

## 9. Next Steps

1. User approve design doc.
2. Chạy `/ck:plan --parallel` (phase 2-7 có thể parallel nếu file ownership tách rõ) để tạo plan chi tiết.
3. Execute phase 1 (delete) đầu tiên — risk-free, gain ngay.
4. Quyết định execute liền 1 mạch hay nghỉ giữa các phase.

## 10. Unresolved Questions

- Q1: `pages/v5/Playground.tsx` có nên giữ trong prod build, hay move sang dev-only? *Hiện tại trả lời: giữ, vì đã routed `/playground` và là tham chiếu UI canon.*
- Q2: Sau khi merge `settings/` → `features/admin/`, có nên rename `features/admin/` → `features/settings/` cho match URL? *Đề xuất: giữ `admin` vì semantic rộng hơn (settings + user mgmt + integrations + security).*
- Q3: Có muốn thêm `components/_internal/` namespace cho helper hooks/utils đi kèm component? *Hiện đặt cùng folder (e.g. `use-two-factor.ts` trong `admin/`) — đề xuất giữ vậy, KISS.*
