# Brainstorm: Dashboard URL + Noti overhaul + Topbar enrich

**Date:** 2026-05-10 | **Effort:** ~3-4h

## Problem
Sau slim-down, 3 vấn đề UX còn sót:

1. URL `/ads-overview` không trực quan → đổi `/dashboard?tab=...`
2. Notification table còn 154 row legacy + chưa có noti rituals → cần cleanup + 3 noti mới
3. Topbar trống (chỉ Menu + 🔔) → bổ sung breadcrumb + OKR countdown

## Approaches & Trade-offs

### A. Dashboard URL rename `/ads-overview` → `/dashboard`

**Tab system đã có sẵn** (`useSearchParams` trong DashboardOverview.tsx, 5 tabs: overview/sale/product/marketing/media). Chỉ rename path container.

| Aspect | Decision |
|---|---|
| Route | `<Route path="/dashboard" element={<DashboardOverview />} />` |
| Default redirect | `/` → `/dashboard` (was `/ads-overview`) |
| Wildcard | `*` → `/dashboard` |
| Sidebar | NavItem `to="/dashboard"` |
| AppLayout | SCROLLABLE_PATHS thay `/ads-overview` → `/dashboard` |
| Legacy redirect | **Hard cut** (user chọn) — wildcard catch nên không 404 thực sự |
| URL khi tab=overview | `/dashboard` (param empty, đã handle) |
| URL khi tab khác | `/dashboard?tab=sale` |

**Files touch:** App.tsx, Sidebar.tsx, AppLayout.tsx (3 files, ~10 min).

### B. Notification overhaul

**Step 1 — Cleanup:**
- `TRUNCATE "Notification";` — wipe 154 row legacy (124 deadline_warning, 15 sprint_ending, 14 export_failed, 1 test).
- Drop `notifyFailure()` trong `sheets-export.service.ts` (bỏ emit `export_failed` — user chọn drop).
- Drop existing `checkOKRRisks()` cron trong alert-scheduler — user nói "không có thông báo nào khác" ngoài 3 loại.

**Step 2 — Three noti types:**

| Type | Trigger | Recipients | Window |
|---|---|---|---|
| `daily_new` | Member POST `/api/daily-reports` thành công | Leader same dept + Admin | Real-time |
| `daily_late` | Cron `30 10 * * 1-5` Asia/Ho_Chi_Minh | User(self) + Leader same dept + Admin | Mon-Fri 10:30 |
| `weekly_late` | Cron `0 9 * * 1` (Monday 09:00) | User(self) + Leader same dept + Admin | Sau Sunday 23:59 |

**Logic chi tiết:**

`daily_new`:
```ts
// trong daily-report.routes.ts POST handler, sau khi prisma.dailyReport.create
const userDepts = req.user.departments;
const recipients = await prisma.user.findMany({
  where: {
    OR: [
      { isAdmin: true },
      { role: { contains: 'Leader' }, departments: { hasSome: userDepts } },
    ],
    NOT: { id: userId },
  },
  select: { id: true },
});
// emit notification cho mỗi recipient
```

`daily_late` (cron Mon-Fri 10:30):
```ts
const today = startOfDay(new Date(), 'Asia/Ho_Chi_Minh');
const submitted = await prisma.dailyReport.findMany({
  where: { reportDate: today },
  select: { userId: true },
});
const submittedIds = new Set(submitted.map(r => r.userId));
const allUsers = await prisma.user.findMany({ where: { role: 'Member' /* hoặc bao gồm Leader */ } });
const lateUsers = allUsers.filter(u => !submittedIds.has(u.id));
// emit cho mỗi lateUser + Leader same dept + Admin
// Dedup: check existing daily_late noti với entityId=userId+date trước khi insert
```

`weekly_late` (cron Monday 09:00):
- Tính `weekEnding` của tuần trước (Friday previous ISO week).
- Find users không có `WeeklyReport` với weekEnding đó → late.
- Emit tương tự daily_late.

**Dedup strategy:**
- `daily_late`: `entityId = ${userId}:${YYYY-MM-DD}`. Check tồn tại trước insert.
- `weekly_late`: `entityId = ${userId}:${YYYY-MM-DD weekEnding}`.
- `daily_new`: `entityId = dailyReport.id`. Mỗi report = 1 emit, không cần dedup.

**Frontend NotificationCenter:**
- Update icon map:
  - `daily_new`: ✓
  - `daily_late`: ⏰
  - `weekly_late`: 📅
- Tự động navigate khi click:
  - `daily_new` → `/daily-sync` (hoặc detail nếu entityId là reportId)
  - `daily_late` → `/daily-sync`
  - `weekly_late` → `/checkin`

**Files touch:**
- `server/routes/daily-report.routes.ts` (emit `daily_new`)
- `server/services/notification.service.ts` (add `notifyDailyNew`, `notifyDailyLate`, `notifyWeeklyLate`; drop `notifyDailyReportApproved` nếu user không cần — actually user không nói đến report_approved, có thể drop)
- `server/jobs/alert-scheduler.ts` (drop OKR risk; add 2 cron mới)
- `server/services/sheets-export.service.ts` (drop notifyFailure)
- `src/components/layout/NotificationCenter.tsx` (icon map mới)
- DB: `TRUNCATE "Notification";` 1 lần

**Câu hỏi ngầm:** `report_approved` (Leader duyệt → user nhận noti) — đã có sẵn. User nói "chỉ 3 loại" → có nên drop luôn?
- **Recommendation:** **Drop** để strict với requirement. User submit, Leader duyệt là internal flow, không cần notification. Nếu sau này cần lại thì add.

### C. Topbar enrich

User chọn 2 items: **Breadcrumb** + **OKR cycle countdown**.

**Layout final:**
```
┌─────────────────────────────────────────────────────────────────────┐
│ [☰]  Analytics › Dashboard            Q2/2026 · 35d left  [🔔]      │
└─────────────────────────────────────────────────────────────────────┘
```

**Breadcrumb implementation:**
- Map static trong Header.tsx (KISS, 7 routes, không cần context):
```ts
const ROUTE_BREADCRUMBS: Record<string, [string, string]> = {
  '/dashboard':    ['Analytics', 'Dashboard'],
  '/okrs':         ['Planning',  'OKRs'],
  '/daily-sync':   ['Rituals',   'Daily Sync'],
  '/checkin':      ['Rituals',   'Weekly Check-in'],
  '/lead-tracker': ['CRM',       'Lead Tracker'],
  '/settings':     ['System',    'Settings'],
  '/profile':      ['User',      'Profile'],
};
```
- `useLocation()` lấy pathname → resolve.

**Trade-off:** Page H1 hiện tại (vd "Overview Dashboard" trong DashboardOverview) có duplicate với breadcrumb không?
- **Recommendation:** Giữ H1 — H1 là tiêu đề page (lớn, bold), breadcrumb là route hint (nhỏ, muted). Không duplicate, hai mục đích khác nhau.

**OKR countdown:**
- Hook `useActiveOkrCycle()`: fetch `/api/okr-cycles` filter `isActive=true` (cache 1h).
- Pill UI: `Q2/2026 · 35d left`
- Color logic: `>30d` green, `7-30d` amber, `<7d` red.
- Click → navigate `/okrs`.
- Edge case: không có active cycle → ẩn pill (đừng show "0d left").

**Files touch:**
- `src/components/layout/Header.tsx` (breadcrumb + countdown widget)
- `src/components/layout/OkrCycleCountdown.tsx` (new, ~40 lines)
- `src/hooks/use-active-okr-cycle.ts` (new, ~15 lines)

## Recommendation

**Một plan, 3 phases độc lập:**

| # | Phase | Effort | Risk |
|---|---|---|---|
| 1 | URL rename `/dashboard` | 10 min | Trivial |
| 2 | Noti overhaul (cleanup + 3 types + cron) | 2-3h | Med (cron timing, dedup edge cases) |
| 3 | Topbar (breadcrumb + cycle pill) | 45 min | Low |

**Order:** Phase 1 độc lập, làm trước (5 phút). Phase 2 + 3 song song được.

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Cron timezone sai (UTC vs Asia/Ho_Chi_Minh) | Med | Confirm `timezone: 'Asia/Ho_Chi_Minh'` trong cron.schedule (đã có pattern trong alert-scheduler) |
| Daily_late spam mỗi giờ nếu cron mis-config | High | Dedup theo entityId+day; cron chỉ chạy 1 lần/ngày |
| Truncate Notification mất noti chưa đọc cũ | Low | User accept (cleanup intentional) |
| Breadcrumb map miss new routes | Low | Fallback `Workspace > {capitalize pathname}` cho route không có map |
| OKR cycle API fail → topbar render lỗi | Low | Error boundary + fallback ẩn pill |

## Success Metrics

- [ ] URL bar hiển thị `/dashboard` thay `/ads-overview`
- [ ] Notification table có 0 row legacy sau truncate
- [ ] User submit Daily lúc 9:00 → Leader+Admin thấy noti `daily_new` ngay
- [ ] User chưa submit Daily lúc 10:30 → user + Leader + Admin nhận `daily_late`
- [ ] User chưa submit Weekly tuần này, Monday 09:01 → nhận `weekly_late`
- [ ] Topbar hiển thị breadcrumb đúng cho tất cả 7 routes
- [ ] Topbar pill "Q2/2026 · 35d left" navigate `/okrs` khi click
- [ ] `npm run typecheck` + `npm run build` clean

## Unresolved Questions

1. **`report_approved` notification giữ hay drop?** Recommend drop để strict 3 loại. Confirm?
2. **Cron retention:** sau 30 ngày auto-clean noti cũ không? Hoặc giữ vô hạn? (Currently không có job).
3. **Daily late targeting:** include Leader/Admin có dept không có Member nào không (vd Leader BOD)? Có thể skip để giảm noise.
