# Brainstorm — Login Redesign + Session Timeout Fix

**Date:** 2026-04-28 14:26 (Asia/Saigon)
**Scope:** UI rework login page, replace logo, recolor gradient, fix 4h hard logout.

---

## 1. Vấn đề

### 1.1 UI login không khớp brand
- Trang login hiện dùng `Shield` icon (lucide) + text wordmark, không dùng logo thật.
- Background trái dùng `from-primary via-blue-600 to-indigo-700` (royal blue/indigo) — lệch tone với logo SMIT OS thật (deep navy + cyan).
- Có 2 vị trí "logo giả" trùng lặp (top-left panel + center form).

### 1.2 Auto-logout sau 4h
- `JWT_EXPIRES_IN = '4h'` (`server/services/auth.service.ts:9`).
- Cookie `maxAge = 4*60*60*1000` (`server/routes/auth.routes.ts:13`).
- Không có refresh token, không sliding expiration.
- → User active liên tục vẫn bị kick về login đúng 4h sau lần signin. Đây là design choice, comment ghi "Reduced from 7d for security".

---

## 2. Phân tích màu logo

`docs/LogoOnly_SMIT-OS.png` (S-shape, nền đen):

| Hex | Tên | Vai trò |
|-----|-----|---------|
| `#0F2A44` | Deep navy | Bóng tối logo, base gradient |
| `#1E4167` | Mid navy | Body chính |
| `#2A6498` | Steel blue | Mid-tone |
| `#4BB2CC` | Cyan teal | Highlight (rim light) |
| `#FF6B5C` (xấp xỉ) | Coral accent | Pop màu trên S |

→ Tone logo = **deep ocean navy → cyan teal**, KHÔNG phải royal blue/indigo.

---

## 3. Quyết định thiết kế (đã chốt với user)

### 3.1 UI Login

**Panel trái:**
- Xoá icon Shield container (`<div class="w-12 h-12 rounded-2xl bg-white/10...">`)
- **Giữ** text wordmark `"SMIT OS"` (chỉ standalone text, không icon kèm)
- Giữ nguyên: heading "The Kinetic Workspace", description, feature list, copyright

**Panel phải (form):**
- Xoá toàn bộ block gradient container + Shield icon (LoginPage.tsx:289-312)
- Xoá h1 `"SMIT OS"` (line 313-315)
- Xoá tagline `"The Kinetic Workspace"` mobile-only (line 316)
- Thay bằng: `<img src="/logo-only.png">` plain — kích thước ~96x96 px, drop-shadow nhẹ, căn giữa, không khung bao quanh
- Copy `docs/LogoOnly_SMIT-OS.png` → `public/logo-only.png`

### 3.2 Background gradient (A1 — đã chọn)

**Cũ:** `from-primary via-blue-600 to-indigo-700`
**Mới:** `from-[#0F2A44] via-[#1E4167] to-[#2A6498]`

**Floating orbs** (đổi từ blue/indigo → cyan-tone):
- `rgba(75, 178, 204, 0.5)` — cyan teal (logo highlight)
- `rgba(42, 100, 152, 0.5)` — mid navy
- `rgba(30, 65, 103, 0.4)` — deep navy
- `rgba(75, 178, 204, 0.3)` — cyan accent nhỏ

Grid pattern color đổi từ `#2563EB` → `#4BB2CC` (subtle cyan).

### 3.3 Session — Sliding Session (B2)

**Strategy:** Tự động gia hạn cookie+JWT khi token sắp hết hạn.

**Implementation:** Sửa `auth.middleware.ts`:
- Sau khi verify token thành công, check thời gian còn lại của token
- Nếu `exp - now < 1h` (còn dưới 1 giờ) → ký lại token mới với expiresIn 4h, set lại cookie
- Nếu user idle > 4h → token hết hạn thật sự → 401

**Code change scope:**
- `server/middleware/auth.middleware.ts` — thêm logic refresh near-expiry
- `server/services/auth.service.ts` — có thể thêm helper `getTokenRemaining(token)`
- Không cần thay đổi `auth.routes.ts` (cookie options vẫn 4h)
- Không cần thêm endpoint mới
- Không cần đổi client (`AuthContext.tsx` không thay đổi)

**Behavior:**
- User active trong app → mỗi request kéo dài session thêm 4h từ thời điểm hiện tại
- User idle (đóng tab, nghỉ trưa) → session vẫn hết sau 4h từ lần request cuối
- Security: cookie `httpOnly + sameSite=strict` giữ nguyên, JWT_SECRET không đổi

---

## 4. Files sẽ thay đổi

| File | Thay đổi |
|------|----------|
| `src/pages/LoginPage.tsx` | Xoá Shield container ở 2 chỗ; thay form-panel logo bằng `<img>`; đổi gradient tailwind classes; đổi orb colors |
| `public/logo-only.png` | **Mới** — copy từ `docs/LogoOnly_SMIT-OS.png` |
| `server/middleware/auth.middleware.ts` | Thêm logic auto-refresh token khi còn < 1h |
| `server/services/auth.service.ts` | (Optional) thêm helper extract token expiry |

**Không đổi:**
- `server/routes/auth.routes.ts` (cookie options đã đúng)
- `src/contexts/AuthContext.tsx` (client tự động nhận cookie mới)
- DB schema (không cần refresh_tokens table)

---

## 5. Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Sliding session = token gia hạn vô hạn nếu user always-on | OK với app nội bộ; có thể thêm "absolute max 24h" sau nếu cần |
| Cookie set lại mỗi request gây overhead nhẹ | Chỉ set khi `< 1h` còn lại → vài lần/ngày, không đáng kể |
| Logo PNG 2.5MB hiện ở `docs/` | Optimize trước khi serve: dùng PNG đã nén hoặc convert WebP. Hoặc resize về 256x256 |
| `bg-clip-text` text "SMIT OS" hiện dùng `from-primary via-blue-600 to-indigo-600` (chỉ ở mobile) sau khi xoá vẫn có thể còn ở chỗ khác | Search & verify khi implement |

---

## 6. Success Criteria

- [ ] Trang login không còn icon Shield giả lập
- [ ] Form panel hiển thị logo PNG thật từ `LogoOnly_SMIT-OS.png`
- [ ] Background trái có gradient navy-cyan khớp logo (không còn royal blue / indigo)
- [ ] User đăng nhập, dùng app liên tục > 4h KHÔNG bị logout
- [ ] User đóng tab + idle > 4h → bị logout (đúng behavior security)
- [ ] Mọi request sau khi token gia hạn vẫn pass auth bình thường

---

## 7. Câu hỏi mở

1. Logo PNG hiện 2.5MB — có cần optimize trước khi serve hay copy nguyên file?
2. Sliding session có nên có hard cap (ví dụ tối đa 24h dù active liên tục)?
