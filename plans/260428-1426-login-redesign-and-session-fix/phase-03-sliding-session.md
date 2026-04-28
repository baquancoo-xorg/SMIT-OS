# Phase 3 — Sliding Session Backend

## Context Links
- Parent plan: [plan.md](plan.md)
- Brainstorm: [`../reports/brainstorm-260428-1426-login-redesign-and-session-timeout.md`](../reports/brainstorm-260428-1426-login-redesign-and-session-timeout.md)
- Files: `server/middleware/auth.middleware.ts` (38 lines), `server/services/auth.service.ts` (60 lines), `server/routes/auth.routes.ts` (245 lines, COOKIE_OPTIONS reference only)

## Overview
- **Date:** 2026-04-28
- **Priority:** P2
- **Status:** completed
- **Effort:** 30 phút
- **Description:** Auto-refresh JWT token + cookie khi user active và token sắp hết hạn. Không hard cap.

## Key Insights
- Cấu trúc hiện tại: JWT 4h + cookie maxAge 4h, không refresh → user bị kick sau đúng 4h
- Sliding window strategy: nếu token còn < 1h khi user request bất kỳ endpoint protected → ký lại 4h mới + set cookie mới
- User idle (không request gì) > 4h → cookie hết hạn → 401 (đúng behavior security)
- COOKIE_OPTIONS hiện ở `auth.routes.ts:9-14` → cần dùng lại trong middleware → DRY: extract sang `server/lib/cookie-options.ts`
- `jwt.verify` đã trả về payload có `exp` field (Unix timestamp giây) — không cần decode riêng

## Requirements
**Functional:**
- Mọi request qua `createAuthMiddleware` (protected routes) → check expiry, auto-refresh nếu cần
- Token mới có cùng payload (userId, role, isAdmin)
- Cookie mới có cùng options (httpOnly, secure, sameSite, 4h maxAge)

**Non-functional:**
- Không tăng overhead đáng kể: chỉ resign khi `< 1h` còn lại (~1 lần / 3-4h, không phải mọi request)
- Backward compatible: client AuthContext không cần thay đổi (browser tự pick cookie mới)
- Không phá flow logout (clearCookie vẫn work)

## Architecture

### Current flow
```
Request → cookies.jwt → verifyToken → fetch user → req.user → next()
```

### New flow
```
Request → cookies.jwt → verifyToken (returns payload with exp)
       → fetch user
       → IF (exp - now < 3600) → sign new token + res.cookie('jwt', ...)
       → req.user → next()
```

### Decision: extract COOKIE_OPTIONS or duplicate?
- **Recommend extract** sang `server/lib/cookie-options.ts` (DRY, single source of truth)
- 1 file ~10 dòng, import từ cả `auth.routes.ts` và `auth.middleware.ts`

## Related Code Files

**Sửa:**
- `server/services/auth.service.ts` — thêm `getTokenRemaining(token)` helper
- `server/middleware/auth.middleware.ts` — thêm refresh logic

**Tạo mới:**
- `server/lib/cookie-options.ts` — shared COOKIE_OPTIONS + CLEAR_COOKIE_OPTIONS

**Sửa (cập nhật import):**
- `server/routes/auth.routes.ts` — import từ shared file thay vì define inline

## Implementation Steps

### Step 1 — Tạo `server/lib/cookie-options.ts`
```ts
export const JWT_COOKIE_NAME = 'jwt';

export const JWT_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 4 * 60 * 60 * 1000,
};

// clearCookie should NOT have maxAge
export const JWT_CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};
```

### Step 2 — Update `server/routes/auth.routes.ts`
Replace local `COOKIE_OPTIONS` / `CLEAR_COOKIE_OPTIONS` const với import:
```diff
+ import { JWT_COOKIE_NAME, JWT_COOKIE_OPTIONS, JWT_CLEAR_COOKIE_OPTIONS } from '../lib/cookie-options';
- const COOKIE_OPTIONS = { ... };
- const CLEAR_COOKIE_OPTIONS = { ... };
```
Update tất cả `res.cookie('jwt', token, COOKIE_OPTIONS)` → `res.cookie(JWT_COOKIE_NAME, token, JWT_COOKIE_OPTIONS)` (4 chỗ).
Update `res.clearCookie('jwt', CLEAR_COOKIE_OPTIONS)` → `res.clearCookie(JWT_COOKIE_NAME, JWT_CLEAR_COOKIE_OPTIONS)` (3 chỗ).

### Step 3 — Thêm helper trong `server/services/auth.service.ts`
```ts
getTokenRemaining(token: string): number | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload & { exp?: number };
    if (!payload.exp) return null;
    const nowSec = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - nowSec);
  } catch {
    return null;
  }
}
```

### Step 4 — Update `server/middleware/auth.middleware.ts`
```ts
import { JWT_COOKIE_NAME, JWT_COOKIE_OPTIONS } from '../lib/cookie-options';

const REFRESH_THRESHOLD_SECONDS = 60 * 60; // 1 hour

// Inside middleware, after fetch user OK:
const remaining = authService.getTokenRemaining(token);
if (remaining !== null && remaining < REFRESH_THRESHOLD_SECONDS) {
  const newToken = authService.signToken({
    userId: user.id,
    role: user.role,
    isAdmin: user.isAdmin,
  });
  res.cookie(JWT_COOKIE_NAME, newToken, JWT_COOKIE_OPTIONS);
}
```

### Step 5 — Verify
- TypeScript compile: `npx tsc --noEmit`
- Server restart (tsx watch): tự reload
- Smoke test: đăng nhập → check cookie expiry trong devtools

## Todo List
- [x] Tạo `server/lib/cookie-options.ts`
- [x] Update `auth.routes.ts` imports + replace constants
- [x] Thêm `getTokenRemaining` trong `auth.service.ts`
- [x] Update `auth.middleware.ts` với refresh logic
- [x] `npx tsc --noEmit` pass
- [x] Manual smoke test login + cookie refresh

## Success Criteria
- Cookie auto-refresh khi token còn < 1h và user active
- User idle > 4h → cookie expire → 401 đúng behavior
- Tất cả 4 chỗ login + 3 chỗ logout/clearCookie dùng shared options
- Không TypeScript error
- Tests hiện tại (nếu có) không break

## Risk Assessment
| Risk | Mitigation |
|------|------------|
| TOTP-pending temp token (5m) cũng đi qua middleware? | KHÔNG — temp token không dùng `/auth/me` hay protected routes; chỉ dùng cho `/login/totp` endpoint nội bộ. Verify: middleware chỉ apply cho protected routes (check `server.ts`) |
| Race condition: 2 requests đồng thời cùng refresh → 2 token, 1 thắng | OK — cookie cuối cùng wins, cả 2 token đều valid 4h sau, không security issue |
| Race condition khi token expire giữa request và resign | jwt.verify đã reject expired token → middleware return 401 trước khi tới refresh logic |
| Logout không clear được cookie nếu sameSite mismatch | Dùng cùng JWT_CLEAR_COOKIE_OPTIONS → không có vấn đề |
| Token-pending (purpose='totp-pending') được resign thành full session | Filter: chỉ refresh khi `payload.purpose !== 'totp-pending'`. Hiện middleware không kiểm purpose → cần thêm guard |

### Action: Thêm purpose guard
Trong middleware:
```ts
if (payload.purpose === 'totp-pending') {
  return res.status(401).json({ error: 'Complete 2FA login first' });
}
```
(Hoặc đảm bảo middleware này không apply cho TOTP routes — check route mounting)

## Security Considerations
- JWT_SECRET không thay đổi
- Cookie httpOnly + sameSite=strict giữ nguyên → không leak XSS/CSRF
- Sliding session = XSS attack có thể giữ session vô hạn nếu không phát hiện. Risk acceptable cho app nội bộ
- Không persist refresh token trong DB → ít attack surface hơn refresh token pattern chuẩn
- Future improvement (out of scope): có thể track session activity trong DB để revoke từ admin panel

## Next Steps
→ Phase 4: verify end-to-end, manual test session > 4h
