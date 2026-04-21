# 2026-04-22 u2014 2FA TOTP Planning

## Summary

Brainstorm vu00e0 lu1eadp plan triu1ec3n khai 2FA TOTP cho SMIT-OS. Tu00ednh nu0103ng opt-in, khu00f4ng u1ea3nh hu01b0u1edfng user hiu1ec7n tu1ea1i.

## Key Decisions

- **Mu00f4 hu00ecnh:** Opt-in (user tu1ef1 bu1eadt) + two-step login (temp JWT 5 phu00fat u2192 TOTP verify u2192 full JWT)
- **Library:** `otpauth` cho TOTP generation/verification (RFC 6238)
- **Bu1ea3o mu1eadt lu01b0u tru1eef:** AES-256-GCM encrypt TOTP secret (tu00e1i su1eed du1ee5ng `server/lib/crypto.ts`), bcrypt hash 8 backup codes
- **Zero data loss:** Chu1ec9 thu00eam nullable Prisma fields (`totpSecret?`, `totpEnabled @default(false)`, `totpBackupCodes[]`)

## Plan

**`plans/260422-0115-2fa-totp/`** u2014 5 phases:
1. Schema migration
2. Backend `totp.service.ts`
3. Backend auth routes (cu1eadp nhu1eadt `/login` + 4 endpoints mu1edbi)
4. Frontend login TOTP step (state machine trong `LoginPage`)
5. Frontend settings 2FA tab (`TwoFactorAuthTab`)

## Impact

Existing users khu00f4ng bu1ecb u1ea3nh hu01b0u1edfng. Login flow giu1eef nguyu00ean cho user chu01b0a bu1eadt 2FA.
