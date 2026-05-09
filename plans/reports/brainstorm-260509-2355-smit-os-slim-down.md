# Brainstorm — SMIT-OS Slim-down: Drop Task Management, Keep OKR Loop

**Date:** 2026-05-09 23:55 (Asia/Saigon) | **Branch:** main | **Status:** Design approved by user, ready for `/ck:plan`

## 1. Problem Statement

Vận hành thử task management trên SMIT-OS không đáp ứng nổi → thua Jira về độ chín, user không có thời gian tối ưu thêm. Cần lột bỏ phần task management, chỉ giữ lại 3 vòng lặp cốt lõi: **OKRs (định hướng quý)** + **Daily Sync (báo cáo công việc tự do)** + **Weekly Check-in (theo chuẩn OKR check-in)**, cộng với LeadTracker (CRM).

**Goal:** giảm surface area code, giảm complexity DB, giữ vòng lặp OKR vận hành đúng chuẩn ngành.

## 2. Decisions (đã chốt với user)

| # | Quyết định | Lý do |
|---|---|---|
| 1 | Drop hết data WorkItem/Sprint/DailyReport cũ/WeeklyReport cũ | Clean slate, tránh nợ migration |
| 2 | Confidence scale **0-10** (Christina Wodtke) | Chuẩn ngành, granular vừa đủ để detect dip |
| 3 | Xoá Sprint, dùng OkrCycle thay thế | Sprint duplicate với OkrCycle, OkrCycle đã có sẵn |
| 4 | Giữ Approval workflow Review→Approved cho **cả** Daily và Weekly | User muốn leader vẫn duyệt 2 loại |
| 5 | PMDashboard redesign **3-panel** (OKR + Compliance + Lead) | Landing có ý nghĩa ngay, không placeholder |
| 6 | Thêm `KeyResult.ownerId` (mới) | Linh hoạt hơn Objective.ownerId, share KR cho nhiều người |

## 3. Scope Cuối Cùng

### 3.1 Pages

**Giữ (8):** PMDashboard `/`, OKRsManagement, DailySync, **WeeklyCheckin** (rename từ SaturdaySync), LeadTracker, Settings, Profile, LoginPage.

**Xoá (9 pages + 2 dead files):** DashboardOverview (`/ads-overview`), TechBoard, ProductBacklog, MarketingBoard, MediaBoard, SaleBoard, SprintBoard, EpicBoard.tsx (orphan), EpicGraph.tsx (orphan).

### 3.2 Backend Routes

**Xoá (8):** `work-item`, `sprint`, `dashboard-overview`, `dashboard-product`, `dashboard-call-performance`, `dashboard-lead-distribution`, `dashboard-lead-flow`, `admin-fb-config`.

**Giữ + refactor:**
- `daily-report.routes` — refactor payload thành 4 text fields
- `report.routes` — rename khái niệm sang "checkin", refactor payload theo Wodtke 5-block
- `key-result.routes` — thêm `ownerId` filtering
- `dashboard-overview.routes` — **rebuild** thành endpoint mới cho PMDashboard 3-panel (hoặc tạo route mới `dashboard.routes` thay thế)

**Giữ nguyên:** `auth`, `okr-cycle`, `objective`, `lead`, `lead-sync`, `fb-sync`, `google-oauth`, `sheets-export`, `notification`, `user`.

### 3.3 DB Models

**Drop:** `WorkItem`, `WorkItemKrLink`, `WorkItemDependency`, `Sprint`, `RawAdsFacebook`, `FbAdAccountConfig`, `ExchangeRateSetting`, `EtlErrorLog`.

**Modify:**
- `KeyResult` — ADD `ownerId String?` + relation User; drop `workItemLinks`
- `DailyReport` — replace `tasksData/teamMetrics/teamType/impactLevel/adHocTasks` bằng 4 text fields: `completedYesterday`, `doingYesterday`, `blockers` (giữ), `planToday`
- `WeeklyReport` — drop `score`, `confidenceScore`, `adHocTasks`. Refactor `progress/plans/blockers/krProgress` ý nghĩa. Drop FK Sprint → derive ISO week từ `weekEnding`

**Giữ nguyên:** User, Notification, Objective, OkrCycle, Lead, LeadAuditLog, GoogleIntegration, SheetsExportRun, LeadSyncRun, LeadStatusMapping.

### 3.4 Settings Tabs

**Xoá:** `sprints`, `fb-config`. **Giữ:** `profile`, `users`, `okrs`, `export`. Update `SettingsTabId` type trong `settings-tabs.tsx`.

### 3.5 Components

**Xoá thư mục/components liên quan:** Bất kỳ component dưới `src/components/board/`, `src/components/sprint/`, `src/components/work-item/`, `src/components/daily-report/TeamFormSelector` (chỉ còn form text), `src/components/daily-report/DailySyncStatsBar` (rebuild đơn giản nếu cần). Cần audit trong implementation.

## 4. Weekly Check-in Specification

**Standard:** Christina Wodtke "Radical Focus" + Google practice.

### 4.1 Form Layout

```
[Block 1] OKR Check-in (loop qua KR.ownerId = currentUser)
  └─ Per KR row:
     ├─ KR title (read-only)
     ├─ Current value (number input, unit hiển thị bên cạnh)
     ├─ Confidence 0-10 (slider hoặc segmented)
     └─ Optional note (1 dòng)

[Block 2] Last Week's Top Priorities
  └─ Textarea: list 1-3 priority + đánh dấu done/not done

[Block 3] Next Week's Top Priorities (max 3)
  └─ 3 textarea slots

[Block 4] Risks & Blockers
  └─ Textarea

[Block 5] Help Needed
  └─ Textarea
```

### 4.2 Schema Mapping (reuse WeeklyReport)

```prisma
model WeeklyReport {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  weekEnding      DateTime
  // krProgress: [{krId, currentValue, confidence0to10, note}]
  krProgress      String    // JSON
  // lastWeekPriorities: text or [{text, done}]
  progress        String    // JSON: rename concept "lastWeekPriorities"
  // nextWeekPriorities: top 3 array
  plans           String    // JSON
  // risks/blockers + help: 2 fields
  blockers        String    // JSON: {risks, helpNeeded}
  status          String    @default("Review")
  approvedBy      String?
  approver        User?     @relation("ApprovedReports", fields: [approvedBy], references: [id])
  approvedAt      DateTime?
  rawData         Json?
  createdAt       DateTime  @default(now())
  // DROP: score, confidenceScore (giờ per-KR), adHocTasks
}
```

### 4.3 Behavior

- **KR list** trong form = `KeyResult.findMany({ ownerId: currentUser.id, objective.cycleId: currentCycle.id })`
- **Submission window** = T7 hằng tuần 15:00 (giữ logic cũ trong SaturdaySync)
- **Approval** = Leader thấy danh sách Review, click duyệt → status Approved + Notification gửi user

## 5. Daily Report Specification

### 5.1 Form Layout

```
[Field 1] Báo cáo công việc đã hoàn thành hôm qua (textarea)
[Field 2] Báo cáo công việc đang thực hiện hôm qua (textarea)
[Field 3] Khó khăn / Vấn đề ảnh hưởng Deadline/Mục tiêu + đề xuất giải pháp (textarea)
[Field 4] Báo cáo công việc sẽ thực hiện hôm nay (textarea)
```

Tất cả text thuần, không dropdown task, không team metrics, không ad-hoc.

### 5.2 Schema Update

```prisma
model DailyReport {
  id                 String    @id @default(uuid())
  userId             String
  user               User      @relation(fields: [userId], references: [id])
  reportDate         DateTime
  status             String    @default("Review")
  completedYesterday String    // text
  doingYesterday     String    // text
  blockers           String?   // text (giữ tên field cũ, ý nghĩa = blockers + suggestion)
  planToday          String    // text
  approvedBy         String?
  approver           User?     @relation("ApprovedDailyReports", fields: [approvedBy], references: [id])
  approvedAt         DateTime?
  rawData            Json?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  @@unique([userId, reportDate], name: "user_date_unique")
  // DROP: tasksData, impactLevel, teamType, teamMetrics, adHocTasks
}
```

### 5.3 Behavior

- 1 report / user / day (unique constraint giữ)
- Submission window 8:30-10:00 (giữ logic late/ontime/early hiện tại)
- Approval Leader duyệt giống cũ

## 6. PMDashboard 3-Panel Redesign

| Panel | Data source | Visualization |
|---|---|---|
| **OKR Snapshot** | OkrCycle hiện hành + WeeklyReport.krProgress mới | Avg confidence theo tuần (line chart) + R/Y/G heatmap mỗi KR |
| **Submission Compliance** | DailyReport + WeeklyReport rows | Bar chart % staff submit ontime / late / missing trong tuần |
| **Lead Snapshot** | Lead model (sẵn) | Funnel theo status (Đang liên hệ → Qualified) + count Việt Nam vs Quốc tế |

Drop hết queries `work-items`, `sprints` trong PMDashboard.tsx. Dùng React Query với 3 endpoint mới hoặc gom vào `dashboard-overview.routes` được rebuild.

## 7. Execution Phases (cho `/ck:plan`)

| Phase | Nội dung | Risk | Files |
|---|---|---|---|
| **P1 — DB Migration** | Truncate WorkItem/Sprint/DailyReport/WeeklyReport. ADD `KeyResult.ownerId`. ALTER `DailyReport` (4 fields). ALTER `WeeklyReport` (drop score/confidenceScore). DROP unused models. | FK cascade. **Phải truncate ĐÚNG thứ tự**: WorkItemKrLink → WorkItemDependency → WorkItem → Sprint → DailyReport → WeeklyReport. | `prisma/schema.prisma`, migration files |
| **P2 — Backend Routes** | Xoá 8 routes. Refactor `daily-report.routes` payload. Refactor `report.routes` payload. Rebuild `dashboard-overview.routes` (3-panel data). | Notification logic ràng buộc với approval — kiểm tra giữ nguyên trong daily/report routes. | `server/routes/*` |
| **P3 — Frontend Pages** | Xoá 9 pages + 2 dead files. Update `App.tsx` lazy imports + routes. Sửa nav menu. Sửa `DailySync.tsx` thành 4 textarea. Rename `SaturdaySync.tsx` → `WeeklyCheckin.tsx` + rebuild form theo Wodtke. Rename route `/sync` → `/checkin` (hoặc giữ `/sync`). | UI breakage trong khoảng giữa P2 và P3 deploy → deploy đồng bộ. | `src/pages/*`, `src/App.tsx`, `src/components/layout/AppLayout.tsx` |
| **P4 — PMDashboard Rebuild** | Drop workItems/sprints queries. Build 3-panel mới (OKR/Compliance/Lead). | Recharts components reuse được, ít rủi ro. | `src/pages/PMDashboard.tsx`, `src/components/dashboard/*` |
| **P5 — Settings Cleanup** | Drop 2 tabs (`sprints`, `fb-config`). Update `SettingsTabId` type. Xoá `fb-config-tab.tsx`, `sprint-cycles-tab.tsx`. | Trivial. | `src/pages/Settings.tsx`, `src/components/settings/*` |

**Order rationale:** P1 trước để schema clean → P2 backend match schema → P3 frontend match backend → P4 dashboard cuối (depends mọi thứ) → P5 cosmetic cleanup.

## 8. Risks & Mitigations

| Rủi ro | Mức | Mitigation |
|---|---|---|
| FK cascade lỗi khi drop Sprint/WorkItem | High | Truncate đúng thứ tự **trước** drop migration. Test trên staging DB clone. |
| `fb-sync.routes` có ngầm dùng `FbAdAccountConfig` | Med | **TODO trước P1**: grep `fb-sync.routes` + service files xem dùng model nào. Nếu fb-sync chỉ liên quan Lead form (qua webhook FB Lead Ads, không cần ad account), drop an toàn. |
| `Notification` gắn với deleted route logic | Med | Giữ Notification model 100%. Audit trong P2 — chỉ remove NOTIFICATION emit từ work-item/sprint, giữ daily-report/report emit. |
| User lỡ submit data quan trọng trước khi truncate | Low | User đã chốt drop hết. Ghi cảnh báo trong release note. |
| Approval flow Leader role check | Low | Hiện đã có `currentUser.role.includes('Leader')` — không phụ thuộc Sprint/WorkItem, an toàn. |
| Hot-reload daemon đang chạy lúc migrate | Low | `npm run daemon:stop` trước migrate, `npm run daemon:restart` sau. |

## 9. Success Metrics

- ✅ Toàn bộ 9 pages task management xoá khỏi `App.tsx`, không còn route dead
- ✅ `npm run build` pass không lỗi TypeScript
- ✅ `npx prisma validate` pass + migration chạy clean trên DB rỗng
- ✅ Daily Sync form có đúng 4 textarea, không dropdown task
- ✅ Weekly Checkin form list KR thuộc user (qua `ownerId`), per-KR confidence 0-10
- ✅ PMDashboard load ≤ 2s, không error fetch `/api/work-items` hoặc `/api/sprints`
- ✅ Settings còn đúng 4 tab (`profile`, `users`, `okrs`, `export`)
- ✅ Lead Tracker hoạt động không suy giảm
- ✅ Approval workflow Daily + Weekly vẫn dùng được (Leader duyệt → Notification fire)

## 10. Validation Pre-Implementation

Trước khi vào `/ck:plan` Phase 1, cần verify 3 điểm sau bằng grep nhanh:

1. **`fb-sync.routes.ts` dùng FbAdAccountConfig hay GoogleIntegration?** → quyết định FB models có drop được không.
2. **`Notification.create` gọi từ những route nào?** → audit để giữ đúng các emit cho daily-report/report, drop emit cho work-item/sprint.
3. **`Sprint.id` reference từ những model nào?** → ngoài WorkItem + WeeklyReport (hiện thấy), check thêm.

## 11. Unresolved Questions

1. **Route path** `/sync` (Saturday Sync) có rename thành `/checkin` không, hay giữ URL cũ để bookmark không vỡ?
2. **`adHocTasks`** trong Daily/Weekly có thật sự đang dùng không (hiện schema có nhưng user không nhắc)? Nếu không dùng — drop luôn (đã include trong design). Nếu có team đang dùng — cần warn.
3. **Notification UX** sau khi Leader duyệt: chỉ in-app notif hay cần email? Giữ nguyên hiện tại?
4. **Sheets Export** chỉ export Lead data, hay cũng từng export DailyReport/WeeklyReport? Cần check `sheets-export.routes`.

## 12. Sources

- [Christina Wodtke — An OKR Worksheet (Eleganthack)](https://eleganthack.com/an-okr-worksheet/)
- [Lenny's Newsletter — The ultimate guide to OKRs by Christina Wodtke (Stanford)](https://www.lennysnewsletter.com/p/the-ultimate-guide-to-okrs-christina)
- [Mooncamp — OKR Check-in Guide & Template](https://mooncamp.com/blog/okr-check-in)
- [Synergita — Weekly OKR Check-Ins Best Practices](https://www.synergita.com/blog/okr-weekly-check-in-best-practices/)
- [Tability — Weekly ritual to track OKRs](https://www.tability.io/okrs/a-simple-weekly-ritual-to-track-okrs)
- [Profit.co — What are weekly check-ins in OKR](https://www.profit.co/blog/okr-university/what-are-weekly-check-ins-in-okr/)
- [Northly — Ultimate OKR Check-in Guide](https://northlyapp.com/en/blog/okr-check-in-guide/)
- [David Tuite — Radical Focus summary (5-element check-in template)](https://www.davidtuite.com/radical-focus-okrs-notes/)

## 13. Next Step

Chạy `/ck:plan` với context report này để generate detailed implementation plan với 5 phases ở mục 7. Plan dir: `plans/260509-2355-smit-os-slim-down/`.
