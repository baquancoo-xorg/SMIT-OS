# Phase 04 — Drop PMDashboard + Setup Redirect

## Context Links
- **Parent plan:** [plan.md](./plan.md)
- **Brainstorm:** `plans/reports/brainstorm-260509-2355-smit-os-slim-down.md`
- **Depends on:** [Phase 03 — Frontend Pages](./phase-03-frontend-pages.md)

## Overview
- **Date:** 2026-05-09 | **Revised:** 2026-05-10 (was "PMDashboard Rebuild")
- **Priority:** P3
- **Status:** completed
- **Review status:** completed
- **Effort:** 0.5h
- **Description:** Verify PMDashboard đã drop trong P3. Verify route `/` redirect → `/ads-overview` work. Verify DashboardOverview là landing mặc định. **Phase này chủ yếu validate, không có code mới.**

## Key Insights
- Phase này nhỏ vì decision "drop PMDashboard, dùng DashboardOverview làm landing" đơn giản hơn rebuild 3-panel
- Nếu P3 đã handle redirect đầy đủ → P4 chỉ là smoke test pass-through
- Có thể merge phase này vào P3 trong execution thực tế (giữ riêng để track checkpoint)

## Requirements

### Functional
- `/` (root) redirect 302 (hoặc client-side `Navigate replace`) → `/ads-overview`
- Bookmark cũ `/` không hiển thị PMDashboard (404 hoặc redirect)
- Sidebar không có entry trỏ tới `/`
- DashboardOverview render đúng làm landing mặc định

### Non-functional
- Redirect không gây loop
- Initial load `/` → `/ads-overview` < 500ms

## Architecture

```
User truy cập SMIT-OS
       │
       ▼
   GET /  ──────► <Navigate to="/ads-overview" replace />
                          │
                          ▼
                  GET /ads-overview ──► DashboardOverview render
                                       (FB Ads + Product + Lead + Call Perf)
```

Implementation chuẩn React Router v6:

```tsx
// src/App.tsx
<Routes>
  <Route path="/" element={<Navigate to="/ads-overview" replace />} />
  <Route path="/ads-overview" element={<DashboardOverview />} />
  {/* ... other routes ... */}
  <Route path="*" element={<Navigate to="/ads-overview" replace />} />
</Routes>
```

## Related Code Files

### Modify
- `src/App.tsx` — verify redirect đã add trong P3 step 4
- `src/components/layout/Sidebar.tsx` — verify nav "Overview" entry đã drop trong P3 step 5

### Create
- (none)

### Delete
- (none — PMDashboard.tsx đã drop trong P3)

## Implementation Steps

1. **Verify `src/App.tsx`** — confirm 2 dòng:
   ```tsx
   <Route path="/" element={<Navigate to="/ads-overview" replace />} />
   <Route path="*" element={<Navigate to="/ads-overview" replace />} />
   ```
   Nếu thiếu → add.
2. **Verify Sidebar** — confirm không còn nav item label "Overview" hoặc `to="/"`. Nếu còn → remove.
3. **Verify PMDashboard.tsx đã xoá** — `ls src/pages/PMDashboard.tsx` phải trả về not found.
4. **Smoke test browser:**
   - Mở `http://localhost:3000/` → URL bar đổi sang `/ads-overview`
   - DashboardOverview render đúng
   - Click nav item từ sidebar → đúng path
   - Truy cập URL không tồn tại (e.g. `/foobar`) → redirect `/ads-overview`
5. **Build verify** — `npm run build` clean (no orphan import)

## Todo Checklist

- [x] Verify redirect `/` → `/ads-overview` trong App.tsx
- [x] Verify wildcard `*` redirect `/ads-overview` trong App.tsx
- [x] Verify Sidebar không có entry `/`
- [x] Verify PMDashboard.tsx file đã xoá
- [x] Smoke test browser: `/` → `/ads-overview`
- [x] Smoke test wildcard: `/foobar` → `/ads-overview`
- [x] `npm run build` clean
- [x] Verify no console error trên DashboardOverview

## Success Criteria

- ✅ `curl -I http://localhost:3000/` (hoặc browser) → final URL `/ads-overview`
- ✅ Sidebar 5 nav item active, không có "Overview"
- ✅ `src/pages/PMDashboard.tsx` không tồn tại
- ✅ Wildcard 404 redirect `/ads-overview`
- ✅ `npm run build` clean

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Redirect loop nếu typo | Low | React Router auto-detect, console error rõ |
| Wildcard nuốt route hợp lệ khác | Low | Đặt wildcard cuối cùng trong `<Routes>` |
| User bookmark cũ `/` confused | Low | Redirect 302 → trải nghiệm seamless |

## Security Considerations

- Redirect không expose info nhạy cảm
- Wildcard redirect không leak route protected (Auth middleware vẫn fire trên `/ads-overview`)

## Next Steps
→ [Phase 05 — Settings Cleanup](./phase-05-settings-cleanup.md)
