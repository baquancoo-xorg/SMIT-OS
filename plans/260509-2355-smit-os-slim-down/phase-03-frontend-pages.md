# Phase 03 — Frontend Pages & Forms

## Context Links
- **Parent plan:** [plan.md](./plan.md)
- **Brainstorm:** `plans/reports/brainstorm-260509-2355-smit-os-slim-down.md`
- **Depends on:** [Phase 02 — Backend Routes](./phase-02-backend-routes.md)

## Overview
- **Date:** 2026-05-09 | **Revised:** 2026-05-10
- **Priority:** P1
- **Status:** completed
- **Review status:** completed
- **Effort:** 5h
- **Description:** Drop 8 pages task management + PMDashboard. **Giữ DashboardOverview nguyên**. Refactor DailySync (4 textarea) + WeeklyCheckin (5-block Wodtke, rename URL `/sync` → `/checkin`). Update Sidebar nav.

## Key Insights
- **Drop list:** PMDashboard.tsx (`/`), TechBoard, ProductBacklog, MarketingBoard, MediaBoard, SaleBoard, SprintBoard + 2 orphan (EpicBoard, EpicGraph) = **9 pages**
- **Keep DashboardOverview** (`/ads-overview`) nguyên không touch trừ khi `types/index.ts` update gây cascade
- **DashboardOverview deps:** `dashboard/overview/*`, `dashboard/call-performance/*`, `dashboard/lead-distribution/*`, `dashboard/product/*`, `lead-tracker/dashboard-tab`, `hooks/use-overview-data` → **GIỮ tất cả**
- **DailySync** simplify thành 4 textarea + table view
- **SaturdaySync.tsx → WeeklyCheckin.tsx** (file rename + URL `/sync` → `/checkin`)
- **`types/index.ts`** drop WorkItem/Sprint exports → cascade error → driver dọn

## Requirements

### Functional
- 9 pages drop, route 404 (trừ `/` redirect → `/ads-overview`)
- DashboardOverview render đúng (FB Ads + Product + Lead + Call Performance)
- Sidebar nav final:
  - **Analytics > Dashboard** → `/ads-overview` (drop "Overview" item)
  - **Planning > OKRs** → `/okrs`
  - **Rituals > Daily Sync** → `/daily-sync`
  - **Rituals > Weekly Checkin** → `/checkin` (rename label + URL)
  - **CRM > Lead Tracker** → `/lead-tracker`
- DailySync form: 4 textarea label tiếng Việt
- WeeklyCheckin form: 5 block (KR list confidence + last week + next week + risks + help)
- Submission window logic giữ
- Approval flow giữ

### Non-functional
- `npm run build` (vite) pass clean
- Bundle size không tăng
- Initial render `/ads-overview` < 2s

## Architecture

### Page List Final

| Path | Component | Status |
|---|---|---|
| `/` | (redirect) | Redirect → `/ads-overview` |
| `/ads-overview` | `DashboardOverview.tsx` | KEEP unchanged (chỉ touch nếu types break) |
| `/okrs` | `OKRsManagement.tsx` | KEEP unchanged |
| `/daily-sync` | `DailySync.tsx` | REFACTOR (4 textarea) |
| `/checkin` | `WeeklyCheckin.tsx` (renamed from SaturdaySync) | REFACTOR (5-block) |
| `/lead-tracker` | `LeadTracker.tsx` | KEEP unchanged |
| `/settings` | `Settings.tsx` | TOUCH P5 |
| `/profile` | `Profile.tsx` | KEEP |

### DailySync Form Layout

```
┌────────────────────────────────────────┐
│  Báo cáo hằng ngày — {date}            │
├────────────────────────────────────────┤
│  ① Hoàn thành hôm qua                  │
│  [textarea, multiline 4 rows]          │
│  ② Đang thực hiện hôm qua              │
│  [textarea]                            │
│  ③ Khó khăn / Vấn đề (kèm đề xuất)     │
│  [textarea]                            │
│  ④ Sẽ thực hiện hôm nay                │
│  [textarea]                            │
│  [Submit]                              │
└────────────────────────────────────────┘
```

### WeeklyCheckin Form Layout

```
┌────────────────────────────────────────┐
│  Weekly Check-in — Tuần {ISO week}     │
├────────────────────────────────────────┤
│  ① OKR Check-in (loop KR own)          │
│  ┌──────────────────────────────────┐ │
│  │ KR: {title}                      │ │
│  │ Current: [number]   Unit: {unit} │ │
│  │ Confidence: [────●────] 7/10     │ │
│  │ Note: [single line]              │ │
│  └──────────────────────────────────┘ │
│  ② Ưu tiên tuần trước (kết quả)        │
│  [textarea]                            │
│  ③ Top 3 ưu tiên tuần tới              │
│  [3 textarea slots]                    │
│  ④ Rủi ro & Blockers                   │
│  [textarea]                            │
│  ⑤ Cần hỗ trợ                          │
│  [textarea]                            │
│  [Submit]                              │
└────────────────────────────────────────┘
```

## Related Code Files

### Modify
- `src/App.tsx` — drop 9 lazy imports + Routes; thêm redirect `/` → `/ads-overview`; rename `/sync` → `/checkin`
- `src/components/layout/Sidebar.tsx` — drop nav item "Overview" (which → `/`); rename "Saturday Sync" → "Weekly Checkin" với path `/checkin`; drop Workspace/Planning task items
- `src/components/layout/AppLayout.tsx` — update SCROLLABLE_PATHS (drop `/`, rename `/sync` → `/checkin`)
- `src/pages/DailySync.tsx` — refactor (loại bỏ team tabs, dropdown, ad-hoc)
- `src/pages/SaturdaySync.tsx` → `src/pages/WeeklyCheckin.tsx` (git mv + refactor 5-block)
- `src/components/modals/WeeklyCheckinModal.tsx` — rebuild theo schema mới
- `src/components/board/ReportTableView.tsx` — KEEP nhưng update column display (audit)
- `src/types/index.ts` (hoặc `src/types/*`) — drop export WorkItem/Sprint/WorkItemKrLink/WorkItemDependency types
- `src/utils/export-daily-report.ts` — adapt cho 4 text fields
- `src/utils/export-weekly-report.ts` — adapt cho payload Wodtke

### Create
- `src/components/checkin/ConfidenceSlider.tsx` — slider 0-10 với màu R/Y/G
- `src/components/checkin/KrCheckinRow.tsx` — 1 row per KR

### Delete
- `src/pages/PMDashboard.tsx`
- `src/pages/TechBoard.tsx`
- `src/pages/ProductBacklog.tsx`
- `src/pages/MarketingBoard.tsx`
- `src/pages/MediaBoard.tsx`
- `src/pages/SaleBoard.tsx`
- `src/pages/SprintBoard.tsx`
- `src/pages/EpicBoard.tsx` (orphan)
- `src/pages/EpicGraph.tsx` (orphan)
- `src/components/daily-report/TeamFormSelector.tsx`
- `src/components/daily-report/DailySyncStatsBar.tsx` (rebuild đơn giản hoặc xoá)
- `src/components/board/` (audit, drop component chỉ phục vụ task management; KEEP `ReportTableView`)
- `src/components/sprint/` (toàn folder)
- `src/components/work-item/` (toàn folder)
- `src/components/dashboard/*` chỉ những folder dành riêng cho task pages — **GIỮ overview/, call-performance/, lead-distribution/, product/, ui/** vì DashboardOverview cần
- `src/components/layout/SprintContextWidget.tsx`

## Implementation Steps

1. **Update types** — `src/types/index.ts` (hoặc files trong `src/types/`):
   - Drop `WorkItem`, `Sprint`, `WorkItemKrLink`, `WorkItemDependency` interfaces
   - Update `KeyResult` interface thêm `ownerId?: string`
   - Update `DailyReport` interface: 4 text fields, drop `tasksData/teamMetrics/teamType/impactLevel/adHocTasks`
   - Update `WeeklyReport` interface: drop `score/confidenceScore/adHocTasks`, redefine `krProgress`
   - **GIỮ `FbAdAccountConfig`, `RawAdsFacebook` types** (DashboardOverview cần)
2. **Delete pages** — 9 page files (PMDashboard + 8 task pages)
3. **Delete components dead** — folders sprint/, work-item/, components/board/ (trừ ReportTableView), TeamFormSelector, SprintContextWidget
4. **Update `App.tsx`:**
   - Drop 9 lazy imports
   - Add: `<Route path="/" element={<Navigate to="/ads-overview" replace />} />`
   - Drop 8 Routes (`/tech`, `/backlog`, `/mkt`, `/media`, `/sale`, `/sprint`, `/`)
   - Rename `<Route path="/sync" ...>` → `<Route path="/checkin" ...>`
   - GIỮ Routes: `/ads-overview`, `/okrs`, `/daily-sync`, `/checkin`, `/lead-tracker`, `/settings`, `/profile`
   - Wildcard `*` redirect `/ads-overview` (thay vì `/`)
5. **Update `Sidebar.tsx`:**
   - Drop nav item Overview (path `/`)
   - GIỮ Dashboard (path `/ads-overview`) làm landing entry
   - Drop Workspace section (5 items)
   - Drop Planning > Teambacklog, Sprintboard
   - GIỮ Planning > OKRs
   - Update Rituals > "Saturday Sync" → "Weekly Checkin", path `/sync` → `/checkin`
   - GIỮ CRM > Lead Tracker
6. **Update `AppLayout.tsx` SCROLLABLE_PATHS** — set new: `['/okrs', '/settings', '/profile', '/checkin', '/daily-sync', '/ads-overview', '/lead-tracker']`
7. **Refactor `DailySync.tsx`:**
   - Strip imports `TeamFormSelector`, `DailySyncStatsBar`, `WorkItem`, ad-hoc components
   - Form modal: 4 textarea (controlled) + submit
   - POST `/api/daily-reports` với payload mới
   - Table view giữ list reports + filter date
8. **`git mv src/pages/SaturdaySync.tsx src/pages/WeeklyCheckin.tsx`** — giữ git history
9. **Refactor `WeeklyCheckin.tsx`:**
   - Fetch KRs: `GET /api/key-results?ownerId=${currentUser.id}&cycleId=${currentCycle.id}`
   - Form modal: KR list + 4 textarea
   - POST `/api/reports` với payload Wodtke
10. **Tạo `ConfidenceSlider.tsx`:**
    - Props: `value: number (0-10)`, `onChange`
    - UI: native `<input type="range" min=0 max=10 step=1>` + label số + màu (Green ≥7, Yellow 4-6, Red <4)
11. **Tạo `KrCheckinRow.tsx`:**
    - Props: `kr: KeyResult`, `value: {currentValue, confidence0to10, note}`, `onChange`
12. **Rebuild `WeeklyCheckinModal.tsx`** — wrapper modal cho form
13. **Update `utils/export-daily-report.ts`** — markdown template 4 text fields
14. **Update `utils/export-weekly-report.ts`** — markdown template Wodtke
15. **Build verify** — `npm run build` pass clean
16. **Smoke test:**
    - `/` redirect đúng `/ads-overview`
    - DashboardOverview render đầy đủ panels
    - DailySync form 4 textarea hoạt động
    - WeeklyCheckin URL `/checkin`, form 5-block hoạt động
    - LeadTracker, OKRs render đúng
    - Sidebar 5 nav item

## Todo Checklist

- [x] Update `src/types/index.ts` (drop task types, update KR/DailyReport/WeeklyReport, GIỮ FB types)
- [x] Delete 9 pages (PMDashboard + 8 task)
- [x] Delete `components/sprint/`, `components/work-item/`, SprintContextWidget
- [x] Delete `TeamFormSelector.tsx`, `DailySyncStatsBar.tsx`
- [x] Audit `components/board/` (giữ ReportTableView)
- [x] Audit `components/dashboard/` (GIỮ overview/, product/, call-performance/, lead-distribution/)
- [x] Update `App.tsx` (drop imports, redirect `/`, rename `/sync` → `/checkin`)
- [x] Update `Sidebar.tsx` nav items
- [x] Update `AppLayout.tsx` SCROLLABLE_PATHS
- [x] Refactor `DailySync.tsx` 4 textarea
- [x] `git mv SaturdaySync.tsx WeeklyCheckin.tsx`
- [x] Refactor `WeeklyCheckin.tsx` 5-block
- [x] Create `ConfidenceSlider.tsx`
- [x] Create `KrCheckinRow.tsx`
- [x] Rebuild `WeeklyCheckinModal.tsx`
- [x] Update `export-daily-report.ts`
- [x] Update `export-weekly-report.ts`
- [x] `npm run build` pass clean
- [x] Smoke test 6 trang chính + redirect

## Success Criteria

- ✅ Build TypeScript + Vite clean
- ✅ Routes 404 cho 8 paths drop (`/tech`, `/backlog`, `/mkt`, `/media`, `/sale`, `/sprint`)
- ✅ `/` redirect 302 → `/ads-overview`
- ✅ `/checkin` route render WeeklyCheckin
- ✅ `/sync` 404 (deprecated)
- ✅ Daily Sync form đúng 4 textarea
- ✅ Weekly Checkin form list KR đúng owner, slider 0-10 work
- ✅ DashboardOverview render đầy đủ panels (FB Ads + Product + Lead + Call Performance)
- ✅ Submit daily/weekly success → row mới
- ✅ Approval flow Leader thấy Review → click duyệt → Notification fire
- ✅ Sidebar đúng 5 nav item

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| `types/index.ts` thay đổi → cascade TS error trong DashboardOverview | Med | Verify DashboardOverview chỉ dùng types FB (không dùng WorkItem/Sprint), nếu có thì lazy untype |
| Audit `components/board/` xoá nhầm component DashboardOverview cần | Med | Grep usage trước khi xoá |
| Audit `components/dashboard/` xoá nhầm subfolder cần cho `/ads-overview` | High | **Whitelist explicit:** giữ overview/, product/, call-performance/, lead-distribution/, ui/. Drop các subfolder còn lại theo audit |
| Submit window logic ngấm trong code | Low | Giữ helper `getSubmissionStatus` |
| Hot-reload không catch up file rename | Low | `npm run daemon:restart` sau git mv |
| Bookmark cũ `/sync` 404 | Low | User confirm chấp nhận; có thể add wildcard redirect nếu cần sau |

## Security Considerations

- `?ownerId=${currentUser.id}` — fetch KR chỉ của chính user
- Submit daily/weekly — `userId` lấy từ auth context
- Drop nav item không đủ — phải drop route trong `App.tsx`
- `git mv` SaturdaySync → giữ git blame history

## Next Steps
→ [Phase 04 — Drop PMDashboard + Setup Redirect](./phase-04-pmdashboard-rebuild.md)
