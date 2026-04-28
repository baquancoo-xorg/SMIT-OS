# Phase 2 — Login UI Redesign

## Context Links
- Parent plan: [plan.md](plan.md)
- Brainstorm: [`../reports/brainstorm-260428-1426-login-redesign-and-session-timeout.md`](../reports/brainstorm-260428-1426-login-redesign-and-session-timeout.md)
- Depends on: Phase 1 (logo asset)
- File target: `src/pages/LoginPage.tsx` (515 lines)

## Overview
- **Date:** 2026-04-28
- **Priority:** P2
- **Status:** completed
- **Effort:** 30 phút
- **Description:** Redesign login UI dùng logo PNG thật + gradient navy-cyan khớp brand SMIT-OS

## Key Insights
- 2 chỗ "logo giả lập" trong file: panel trái (line ~198-201) + form panel (line ~289-317)
- Panel trái: GIỮ wordmark text "SMIT OS", chỉ xoá Shield icon container
- Form panel: xoá toàn bộ branding block (gradient container + Shield icon + h1 + tagline), thay bằng `<img>` plain
- Background gradient lệch brand: hiện royal blue (`from-primary via-blue-600 to-indigo-700`) → đổi sang deep navy (`#0F2A44 → #1E4167 → #2A6498`)
- 4 FloatingOrb hiện màu indigo/sky → đổi sang cyan-tone matching logo highlight

## Requirements
**Functional:**
- Hiển thị `/logo-only.png` ở form panel, kích thước 96x96, drop-shadow nhẹ
- Wordmark "SMIT OS" text giữ nguyên ở panel trái (không có icon kèm)
- Background trái dùng deep navy gradient
- Form panel không bị break layout sau khi remove logo block

**Non-functional:**
- Không thay đổi animation timing/variants khác
- Responsive vẫn pass (mobile xoá logo h1+tagline → cần fallback?)
- Không introduce console warning

## Architecture
N/A — chỉ là CSS class + JSX restructure.

## Related Code Files
- **Sửa:** `src/pages/LoginPage.tsx`
  - GridPattern component (line 44-57)
  - Left panel motion.div outer gradient (line 161)
  - Left panel logo block (line 192-203)
  - 4 FloatingOrb instances (line 168-171)
  - Form panel logo block (line 283-317)

## Implementation Steps

### Step 1 — Đổi gradient panel trái (line 161)
```diff
- className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-12 flex-col justify-between overflow-hidden"
+ className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-gradient-to-br from-[#0F2A44] via-[#1E4167] to-[#2A6498] p-12 flex-col justify-between overflow-hidden"
```

### Step 2 — Đổi 4 FloatingOrb colors (line 168-171)
```diff
- <FloatingOrb size={400} color="rgba(99, 102, 241, 0.6)" initialX={-10} initialY={20} duration={20} />
- <FloatingOrb size={300} color="rgba(59, 130, 246, 0.5)" initialX={60} initialY={60} duration={25} />
- <FloatingOrb size={200} color="rgba(147, 197, 253, 0.4)" initialX={80} initialY={10} duration={18} />
- <FloatingOrb size={150} color="rgba(199, 210, 254, 0.3)" initialX={30} initialY={80} duration={22} />
+ <FloatingOrb size={400} color="rgba(75, 178, 204, 0.5)" initialX={-10} initialY={20} duration={20} />
+ <FloatingOrb size={300} color="rgba(42, 100, 152, 0.5)" initialX={60} initialY={60} duration={25} />
+ <FloatingOrb size={200} color="rgba(30, 65, 103, 0.4)" initialX={80} initialY={10} duration={18} />
+ <FloatingOrb size={150} color="rgba(75, 178, 204, 0.3)" initialX={30} initialY={80} duration={22} />
```

### Step 3 — Đổi GridPattern color (line 50-53)
```diff
- linear-gradient(to right, #2563EB 1px, transparent 1px),
- linear-gradient(to bottom, #2563EB 1px, transparent 1px)
+ linear-gradient(to right, #4BB2CC 1px, transparent 1px),
+ linear-gradient(to bottom, #4BB2CC 1px, transparent 1px)
```

### Step 4 — Xoá Shield icon container ở panel trái (line 198-201)
**Trước:**
```tsx
<div className="flex items-center gap-3">
  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
    <Shield className="w-6 h-6 text-white" />
  </div>
  <span className="text-white font-bold text-xl tracking-tight">SMIT OS</span>
</div>
```

**Sau:**
```tsx
<div className="flex items-center gap-3">
  <span className="text-white font-bold text-xl tracking-tight">SMIT OS</span>
</div>
```

### Step 5 — Xoá form panel branding block (line 283-317)
**Trước:** motion.div container với gradient Shield + h1 "SMIT OS" + p tagline mobile

**Sau:**
```tsx
<motion.div
  className="text-center mb-8"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.2 }}
>
  <img
    src="/logo-only.png"
    alt="SMIT OS"
    className="w-24 h-24 mx-auto drop-shadow-lg"
  />
</motion.div>
```

### Step 6 — Xoá import `Shield` không dùng nữa
- Check `lucide-react` import (line 3): nếu Shield chỉ dùng ở 2 chỗ vừa xoá + step 'totp' (line 452), GIỮ vì TOTP step vẫn dùng
- Verify bằng grep `Shield` trong file sau khi sửa

## Todo List
- [x] Step 1: Đổi gradient panel trái
- [x] Step 2: Đổi 4 FloatingOrb colors
- [x] Step 3: Đổi GridPattern color
- [x] Step 4: Xoá Shield container panel trái
- [x] Step 5: Thay form panel branding bằng `<img>` logo
- [x] Step 6: Verify import `Shield` còn dùng ở step TOTP
- [x] `npm run dev` không lỗi compile
- [x] Visual check trên browser: gradient navy + logo hiển thị OK

## Success Criteria
- Login page hiển thị logo PNG thật ở form panel
- Panel trái: chỉ có text "SMIT OS" (không icon)
- Background gradient deep navy (visually thấy rõ tone xanh đậm hơn, có hint cyan)
- Floating orbs có cyan accent rõ rệt
- Không TypeScript error
- Không React warning trong console
- Layout responsive vẫn OK (mobile screen)

## Risk Assessment
| Risk | Mitigation |
|------|------------|
| Xoá motion.div wrapper sai → animation broken | Giữ outer motion.div, chỉ thay children |
| Logo `<img>` không có alt → a11y issue | Set `alt="SMIT OS"` |
| Mobile responsive: tagline "The Kinetic Workspace" `lg:hidden` xoá → mobile mất context | Có thể thêm caption nhỏ dưới logo nếu user yêu cầu sau |
| Color contrast text trắng trên `#2A6498` | Test với contrast checker — `#2A6498` ratio với white = ~6.8:1 (AA pass) |

## Security Considerations
- `<img src>` từ same origin `/logo-only.png` → không có XSS risk
- Không xử lý user input mới

## Next Steps
→ Phase 3: implement sliding session backend
