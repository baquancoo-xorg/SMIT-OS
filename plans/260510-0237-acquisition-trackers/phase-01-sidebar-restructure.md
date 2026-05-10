# Phase 01 — Sidebar Restructure

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Brainstorm: [`../reports/brainstorm-260510-0237-acquisition-trackers.md`](../reports/brainstorm-260510-0237-acquisition-trackers.md) (Section 4, 6)
- Dependencies: none (entry phase)

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P2 |
| Effort | 1 ngày |
| Status | ✅ completed |
| Completed | 2026-05-10 |
| Review | passed |

Rename nhóm sidebar `CRM` → `Acquisition` + thêm **2 NavItem** mới (Media Tracker, Ads Tracker) với route đến stub pages "Coming Soon". Reorder Media → Ads → Lead theo funnel order. Update breadcrumb trong LeadTracker (đang hardcode "CRM").

⚠️ **KHÔNG thêm "Overview" item** trong sidebar Acquisition — Overview tổng hợp dùng Dashboard hiện tại (xem Phase 5).

## Key Insights

- Phase này KHÔNG đụng database, KHÔNG đụng API integration → ship nhanh, low risk
- Stub pages tránh 404 + cho leadership thấy roadmap visible
- Lead Tracker hiện hardcode breadcrumb "CRM" trong `src/pages/LeadTracker.tsx` line ~71 → phải update theo
- Scope MVP: Meta-only ads, không Google/TikTok → Phase 1 không có external blocker

## Requirements

### Functional
- Sidebar hiển thị nhóm `ACQUISITION` thay cho `CRM`
- 3 NavItem theo order: Media Tracker → Ads Tracker → Lead Tracker
- Click vào Media/Ads → render trang stub "Coming Soon" với heading + breadcrumb đúng
- Lead Tracker breadcrumb hiển thị `Acquisition > Lead Tracker`
- Active state highlight đúng item đang active

### Non-functional
- Không thay đổi behavior Lead Tracker hiện tại (chỉ đổi text breadcrumb)
- Stub pages **MUST tham chiếu** [`docs/ui-style-guide.md`](../../docs/ui-style-guide.md) — pattern OKRs (page header với breadcrumb + title italic + glass card)
- Lazy load 2 pages mới (giống pattern hiện tại)

## Architecture

```
Sidebar.tsx
  └─ <nav>
       ├─ ANALYTICS / Dashboard               ← entry point cho Overview tổng (Phase 5)
       ├─ PLANNING / OKRs
       ├─ RITUALS / Daily Sync, Weekly Checkin
       └─ ACQUISITION                       ← rename
            ├─ Media Tracker   → /media-tracker       (stub)
            ├─ Ads Tracker     → /ads-tracker         (stub)
            └─ Lead Tracker    → /lead-tracker        (existing)

App.tsx
  └─ Routes (thêm 2 mới)
       ├─ /media-tracker    → MediaTracker (lazy stub)
       └─ /ads-tracker      → AdsTracker (lazy stub)
```

## Related Code Files

### Modify
- `src/components/layout/Sidebar.tsx` — rename label, add 2 NavItem, change icon if needed
- `src/App.tsx` — add 2 lazy imports + 2 Route entries
- `src/pages/LeadTracker.tsx` — update breadcrumb từ "CRM" → "Acquisition" (~line 71)

### Create
- `src/pages/MediaTracker.tsx` — stub page (theo style guide)
- `src/pages/AdsTracker.tsx` — stub page (theo style guide)

### Reference (read-only)
- **`docs/ui-style-guide.md`** — Page header pattern, glass card, breadcrumb
- `src/pages/OKRsManagement.tsx` — source of truth UI

## Implementation Steps

1. **Tạo 2 stub pages** (`MediaTracker.tsx`, `AdsTracker.tsx`) theo style guide:
   - Page wrapper `flex flex-col gap-[var(--space-lg)]`
   - Page header: breadcrumb `Acquisition > {tên}` + title italic accent (`Media <span className="text-primary italic">Tracker</span>`)
   - Body: glass card `bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm` với placeholder "Coming Soon — Phase 3/4"
   - Empty state pattern: Material icon + uppercase label

2. **Update `Sidebar.tsx`** (line 41-44 hiện tại)
   - Đổi label `CRM` → `ACQUISITION`
   - Thêm 2 `<NavItem>` mới phía trên Lead Tracker theo order:
     - `icon="campaign"` label="Media Tracker" to="/media-tracker"
     - `icon="ads_click"` label="Ads Tracker" to="/ads-tracker"
   - Giữ Lead Tracker cuối cùng (`icon="person_search"`)

3. **Update `App.tsx`**
   - Thêm 2 lazy imports sau dòng `const LeadTracker = lazy(...)`:
     ```tsx
     const MediaTracker = lazy(() => import('./pages/MediaTracker'));
     const AdsTracker = lazy(() => import('./pages/AdsTracker'));
     ```
   - Thêm 2 routes trong `<Routes>`:
     ```tsx
     <Route path="/media-tracker" element={<MediaTracker />} />
     <Route path="/ads-tracker" element={<AdsTracker />} />
     ```

4. **Update `LeadTracker.tsx` breadcrumb**
   - Line ~71: đổi text `CRM` → `Acquisition`
   - Verify visual khi click vào /lead-tracker

5. **Test**
   - Chạy `npm run dev`, verify sidebar hiển thị đúng 4 items
   - Click từng item → no 404, breadcrumb đúng
   - Active state highlight chính xác
   - Mobile responsive vẫn ổn

6. **Commit & PR**
   - Conventional commit: `feat(sidebar): rename CRM group to Acquisition + add Media/Ads/Overview stubs`
   - PR description link tới plan này

## Todo List

- [x] Create stub `MediaTracker.tsx` (theo style guide)
- [x] Create stub `AdsTracker.tsx` (theo style guide)
- [x] Update `Sidebar.tsx` (rename + 2 NavItem mới)
- [x] Update `App.tsx` (2 lazy imports + 2 routes)
- [x] Update `LeadTracker.tsx` breadcrumb
- [x] Manual test 4 routes
- [x] Commit & push

## Success Criteria

- [x] Sidebar hiển thị nhóm `ACQUISITION` với 3 items đúng order (Media → Ads → Lead)
- [x] Click 3 items không 404
- [x] Breadcrumb hiển thị `Acquisition > {tên item}` cho cả 3 trang
- [x] Active state highlight đúng
- [x] Build production không lỗi (`npm run build`)
- [x] Stub pages pass UI Style Guide checklist (header pattern, glass card, breadcrumb)
- [x] Lighthouse mobile vẫn xanh

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Quên update breadcrumb Lead Tracker | 🟢 Low | Có trong checklist + visual test |
| Lazy import sai path | 🟢 Low | Pattern đã có sẵn từ pages khác |
| Material icon không tồn tại | 🟢 Low | Dùng icon đã verify: `insights`, `campaign`, `ads_click` (đều có trong Material Symbols) |

## Security Considerations

Không có. Phase này thuần frontend stub, không đụng auth/data.

## Next Steps

- Phase 2: Database schema (sau khi Phase 1 ship)
