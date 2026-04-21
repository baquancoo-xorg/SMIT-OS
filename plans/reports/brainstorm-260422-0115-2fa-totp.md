# Brainstorm: 2FA TOTP cho SMIT-OS

**Date:** 2026-04-22 | **Status:** Approved

---

## Problem Statement

Thêm bảo mật 2 lớp (2FA) cho user trong SMIT-OS mà không gây mất dữ liệu hay gián đoạn user hiện tại.

**Constraints:**
- < 20 users, dùng hàng ngày
- Opt-in (user tự bật)
- Không được phép mất data hay reset session hiện tại
- Stack: Express 5 + Prisma + JWT httpOnly cookie

---

## Current Auth Flow

```
POST /api/auth/login
  → validate username + password (bcrypt)
  → sign JWT (7d)
  → set httpOnly cookie
```

Không có 2FA, không có temp state.

---

## Evaluated Approaches

### Hướng A: Two-step login + temp token ✅ CHOSEN

```
Step 1: POST /api/auth/login
  → verify password
  → if !totpEnabled → issue JWT (unchanged flow)
  → if totpEnabled → { requiresTOTP: true, tempToken: JWT(5min, purpose:'totp-pending') }

Step 2: POST /api/auth/login/totp
  → verify tempToken (5min TTL, purpose check)
  → verify TOTP code via otpauth
  → issue full JWT + set cookie
```

**Pros:** Clean separation, no password re-send, temp token tự expire
**Cons:** Frontend cần thêm TOTP screen state

### Hướng B: Single endpoint retry ❌ Not chosen

```
POST /api/auth/login { username, password, totpCode? }
  → if 2FA enabled & no totpCode → 403 { requiresTOTP: true }
  → frontend hỏi code, submit lại cùng password
```

Rejected: password gửi 2 lần, không cần thiết.

---

## Final Solution

### Library
- `otpauth` — TOTP generation/verification (modern, maintained)
- Đã có `server/lib/crypto.ts` → dùng lại AES-256 để encrypt TOTP secret

### Schema Changes (zero-impact migration)

```prisma
model User {
  // ... all existing fields unchanged
  totpSecret      String?          // AES-256 encrypted TOTP secret
  totpEnabled     Boolean @default(false)
  totpBackupCodes String[]         // bcrypt-hashed backup codes
}
```

Existing users: totpEnabled=false, secret=null → login flow giữ nguyên.

### New Endpoints

| Endpoint | Mô tả |
|----------|-------|
| `POST /api/auth/login` | Giữ nguyên, thêm check totpEnabled |
| `POST /api/auth/login/totp` | Verify temp token + TOTP code |
| `GET /api/auth/2fa/setup` | Generate secret + QR URL (authenticated) |
| `POST /api/auth/2fa/enable` | Verify first code → lưu secret + backup codes |
| `POST /api/auth/2fa/disable` | Verify password → xóa secret, tắt 2FA |

### Migration Safety Plan

1. `db:push` thêm nullable columns → không xóa gì
2. Existing users không bị prompt 2FA (opt-in)
3. User mất điện thoại → dùng backup codes (8 codes × 1-time use)
4. Admin có thể reset 2FA cho user nếu cần

---

## Implementation Phases

1. **Schema migration** — thêm fields vào Prisma schema, push DB
2. **Auth service** — thêm TOTP logic vào `auth.service.ts`
3. **Auth routes** — thêm endpoints mới vào `auth.routes.ts`
4. **Setup UI** — màn hình bật/tắt 2FA trong settings user
5. **Login UI** — thêm TOTP code input screen sau bước nhập password

---

## Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| User mất điện thoại | Backup codes 1-time use, admin reset |
| DB migration fail | Chỉ thêm nullable cols, rollback an toàn |
| Temp token bị sniff | httpOnly cookie, HTTPS, 5min TTL |
| User bị lock out | Opt-in → nếu chưa setup thì không bị ảnh hưởng |
