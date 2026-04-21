---
title: "2FA TOTP Authentication"
status: completed
createdAt: 2026-04-22
completedAt: 2026-04-22
blockedBy: []
blocks: []
---

# 2FA TOTP Authentication

> Thu00eam xu00e1c thu1ef1c 2 lu1edbp (TOTP) cho SMIT-OS. Opt-in, two-step login, zero data loss.

## Context

- Brainstorm report: [plans/reports/brainstorm-260422-0115-2fa-totp.md](../reports/brainstorm-260422-0115-2fa-totp.md)
- Stack: Express 5 + Prisma + JWT httpOnly cookie + React 19
- Thu01b0 viu1ec7n: `otpauth` (TOTP), `server/lib/crypto.ts` (AES-256 su1eb5n cu00f3)

## Phases

| Phase | Tu00ean | Status |
|-------|------|--------|
| 01 | [Schema Migration](phase-01-schema-migration.md) | completed |
| 02 | [Backend TOTP Service](phase-02-backend-totp-service.md) | completed |
| 03 | [Backend Auth Routes](phase-03-backend-auth-routes.md) | completed |
| 04 | [Frontend Login TOTP Step](phase-04-frontend-login-totp.md) | completed |
| 05 | [Frontend Settings 2FA Tab](phase-05-frontend-settings-2fa.md) | completed |

## Key Dependencies

- Phase 01 phu1ea3i hou00e0n thu00e0nh tru01b0u1edbc Phase 02
- Phase 02 + 03 cu00f3 thu1ec3 cu00f9ng lu00fac (backend)
- Phase 04 + 05 cu00f3 thu1ec3 cu00f9ng lu00fac (frontend), nhu01b0ng cu1ea7n Phase 03 xong tru01b0u1edbc

## Migration Safety

- Chu1ec9 thu00eam nullable fields vu00e0o User model
- Existing users: `totpEnabled = false` → login flow khu00f4ng u0111u1ed5i
- Khu00f4ng xu00f3a hay reset bu1ea5t ku1ef3 du1eef liu1ec7u nu00e0o
