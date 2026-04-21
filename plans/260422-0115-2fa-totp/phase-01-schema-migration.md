---
phase: 01
title: "Schema Migration"
status: completed
priority: critical
effort: 30min
---

# Phase 01 — Schema Migration

## Overview

Thêm 3 nullable fields vào Prisma `User` model. Zero data loss vì tất cả đều nullable/có default.

## Files to Modify

- `prisma/schema.prisma` — thêm fields vào User model

## Implementation Steps

### 1. Cập nhật Prisma schema

Thêm vào cuối `model User { ... }`, sau field `notifications`:

```prisma
model User {
  // ... all existing fields unchanged ...

  // 2FA fields (opt-in, nullable by default)
  totpSecret      String?   // AES-256-GCM encrypted TOTP secret
  totpEnabled     Boolean   @default(false)
  totpBackupCodes String[]  // bcrypt-hashed backup codes, empty array by default
}
```

### 2. Push schema lên DB

```bash
npm run db:push
```

Lệnh này thêm 3 cột mới vào bảng `User`:
- `totp_secret VARCHAR NULL`
- `totp_enabled BOOLEAN NOT NULL DEFAULT false`
- `totp_backup_codes TEXT[] NOT NULL DEFAULT '{}'`

### 3. Verify

```bash
# Kiểm tra schema đã push thành công
psql postgresql://postgres:password@localhost:5435/smitos_db -c "\d \"User\""
```

Expected: 3 cột mới xuất hiện, tất cả existing users có `totp_enabled = false`.

## Success Criteria

- [x] `db:push` chạy thành công, không có migration error
- [x] Column `totp_enabled` mặc định `false` cho tất cả existing users
- [x] Login flow hiện tại vẫn hoạt động bình thường
- [x] Prisma client được regenerate (`@prisma/client` types cập nhật)

## Risk

- **Thấp:** Chỉ thêm nullable columns, PostgreSQL không cần rebuild index hay rewrite table
- Rollback: `ALTER TABLE "User" DROP COLUMN IF EXISTS totp_secret, totp_enabled, totp_backup_codes`
