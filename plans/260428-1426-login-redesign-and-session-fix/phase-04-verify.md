# Phase 4 — Verify & Manual Test

## Context Links
- Parent plan: [plan.md](plan.md)
- Depends on: Phase 1, 2, 3 hoàn tất

## Overview
- **Date:** 2026-04-28
- **Priority:** P2
- **Status:** completed
- **Effort:** 25 phút
- **Description:** Verify dev server chạy OK, login UI khớp brand, sliding session work đúng

## Key Insights
- Test session > 4h trong thời gian thực không thực tế → dùng kỹ thuật giảm threshold tạm thời để verify nhanh
- Có thể test bằng cách:
  - **Quick path:** giảm `JWT_EXPIRES_IN` xuống `5m` + `REFRESH_THRESHOLD_SECONDS` = 240 tạm thời, login → đợi 1-2 phút → check cookie expiry mới được set
  - **Full path:** Để 4h thật, làm việc bình thường, verify không bị logout

## Requirements
- Dev server start không lỗi
- TypeScript compile pass
- Visual UI match design brief
- Sliding session verifiable

## Architecture
N/A — testing only.

## Related Code Files
- Read-only inspection: tất cả files đã sửa ở Phase 1-3

## Implementation Steps

### Step 1 — Build & TypeScript check
```bash
npx tsc --noEmit
```
Expect: 0 error.

### Step 2 — Dev server smoke test
```bash
# Đảm bảo Docker postgres đang chạy
docker-compose ps  # check smit_os_db running

# Start dev (nếu chưa chạy)
npm run dev
```
Expect: server listen `localhost:3000`, không error trong stdout.

### Step 3 — Visual UI test
Mở `http://localhost:3000` (logout nếu đang đăng nhập).

**Checklist UI:**
- [ ] Panel trái: chỉ thấy text "SMIT OS" (không có Shield icon container)
- [ ] Panel trái: gradient deep navy (rõ ràng đậm hơn royal blue cũ, không còn tone tím-indigo)
- [ ] Floating orbs: thấy hint cyan/teal trên panel trái, animation vẫn mượt
- [ ] Form panel: logo PNG hiển thị giữa, kích thước ~96x96, không có khung gradient bao quanh
- [ ] Form panel: KHÔNG còn h1 "SMIT OS" hoặc tagline "The Kinetic Workspace"
- [ ] Login form (Welcome Back, USERNAME, PASSWORD, Sign In) hiển thị bình thường
- [ ] Console không có error / 404 (đặc biệt check `/logo-only.png` load 200)

**Mobile responsive check:** Resize browser < 1024px:
- [ ] Panel trái ẩn
- [ ] Form panel hiển thị logo + form đầy đủ

### Step 4 — Auth flow smoke test
- [ ] Login với `dominium` + password → vào dashboard OK
- [ ] DevTools → Application → Cookies → check `jwt` cookie tồn tại với expiry +4h
- [ ] Reload page → vẫn đăng nhập (session check OK)
- [ ] Logout button → cookie clear → về login page

### Step 5 — Sliding session verification (rút gọn)

**Phương án A — Quick verify (dev only, REVERT sau khi test):**
1. Tạm thời sửa `auth.service.ts`: `JWT_EXPIRES_IN = '2m'`
2. Tạm thời sửa `auth.middleware.ts`: `REFRESH_THRESHOLD_SECONDS = 60` (refresh khi còn < 1m)
3. Tạm thời sửa cookie maxAge: 2 phút
4. Login → đợi 1 phút → click sang trang khác → check DevTools cookie: expiry đã update +2m mới
5. **REVERT** tất cả về 4h
6. Verify revert thành công

**Phương án B — Inspect logic only:**
- Code review middleware: confirm logic đúng `if (remaining < REFRESH_THRESHOLD)`
- Đợi natural usage > 3h sẽ biết

→ **Recommend phương án A** cho confidence cao + nhanh.

### Step 6 — Cleanup
- [ ] Revert tất cả sửa tạm ở Step 5
- [ ] `git diff` confirm chỉ còn các change thuộc Phase 1-3
- [ ] `npm run dev` restart pass

## Todo List
- [x] TypeScript compile pass
- [x] Dev server start OK
- [x] Visual UI checklist hoàn tất
- [x] Auth flow smoke OK
- [x] Sliding session verify (Phương án A) pass
- [x] Revert temp changes
- [x] Final `git diff` review

## Success Criteria
- ✅ TypeScript: 0 error
- ✅ Dev server: chạy không error
- ✅ UI: khớp design brief Phase 2
- ✅ Auth: login/logout/session check pass
- ✅ Sliding session: cookie auto-refresh verified
- ✅ Code change clean (không còn temp test code)

## Risk Assessment
| Risk | Mitigation |
|------|------------|
| Quên revert temp test changes → prod bị 2m timeout | Bắt buộc Step 6, dùng `git diff` confirm |
| Browser cache logo cũ (Shield) | Hard reload Cmd+Shift+R |
| Cookie không update vì sameSite=strict block | Đảm bảo test trên cùng origin (localhost:3000) |

## Security Considerations
- Test trên dev environment với credentials test user `dominium`
- Không log raw JWT token ra console / file
- Sau khi test xong, đảm bảo không còn debug log trong code

## Next Steps
- Nếu pass: commit + push (out of scope plan này, do user trigger)
- Nếu fail: quay lại phase tương ứng để fix
- Update plan status `completed` khi xong

## Unresolved Questions
- Có cần thêm "absolute max session lifetime" (ví dụ 30 ngày) sau này không? — Hiện tại NO theo brainstorm
- Có cần track session activity trong DB cho admin revoke? — Out of scope, ghi nhận cho future
