# Project Changelog

## [v2.1.8] - 2026-04-22

### Added: Two-Factor Authentication (TOTP)

- **Two-step login flow**: Users with 2FA enabled receive a short-lived `totp-pending` JWT (5 min) after password verification, then must submit a TOTP code to obtain a full session JWT. Users without 2FA are unaffected.
- **New endpoints**:
  - `POST /api/auth/login/totp` — verify TOTP code or backup code to complete login
  - `GET /api/auth/2fa/setup` — generate encrypted TOTP secret + `otpauthUrl` for QR display
  - `POST /api/auth/2fa/enable` — confirm TOTP code and activate 2FA; returns 8 single-use backup codes
  - `POST /api/auth/2fa/disable` — deactivate 2FA (requires password confirmation)
  - `POST /api/auth/2fa/admin-reset/:userId` — admin-only reset of 2FA for a user
- **User model fields added** (nullable, zero impact on existing users):
  - `totpSecret String?` — AES-256-GCM encrypted TOTP secret
  - `totpEnabled Boolean @default(false)`
  - `totpBackupCodes String[]` — bcrypt-hashed, consumed on use
- **`GET /api/auth/me`** now includes `totpEnabled` in the response
- **Rate limiting** applied to both `POST /api/auth/login` and `POST /api/auth/login/totp`
- **New service**: `server/services/totp.service.ts` — TOTP generation/verification via `otpauth` (RFC 6238), secret encryption, backup code hashing
</content>}}
]