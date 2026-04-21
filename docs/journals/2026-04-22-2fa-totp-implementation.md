# 2FA TOTP Implementation - Full Cycle

**Date**: 2026-04-22 01:42
**Severity**: High
**Component**: Auth - TOTP / 2FA
**Status**: Resolved

## What Happened

Implemented opt-in 2FA TOTP across 5 phases: Prisma schema migration, backend TOTP service, auth route changes, frontend login flow, and Settings security tab. The feature went from zero to fully working with a two-step login UX and a setup/enable/disable panel in Settings.

## The Brutal Truth

Code review caught two critical security holes that would have shipped to production. The first iteration trusted the TOTP secret from the client during the `/setup` call - meaning any client could supply an arbitrary secret and bind it to their account. The second hole was that `requireAuth` middleware did not reject `totp-pending` tokens, so a half-authenticated user could hit protected endpoints before completing TOTP verification. Neither was caught during implementation; only code review surfaced them. That is embarrassing and a reminder that security-critical flows need adversarial review baked in from the start, not bolted on afterward.

## Technical Details

**Schema additions** (`User` model):
- `totpSecret String?` - AES-256-GCM encrypted blob via `server/lib/crypto.ts`
- `totpEnabled Boolean @default(false)`
- `totpBackupCodes String[]` - bcrypt-hashed 8x 32-bit random hex codes

**Auth flow**: `POST /login` returns `{ tempToken, requiresTOTP: true }` when TOTP is enabled. Temp JWT carries `purpose: 'totp-pending'` with 5-minute TTL. `POST /login/totp` exchanges it for a full session token.

**New endpoints added to `auth.routes.ts`**:
- `POST /login/totp` - verify TOTP code
- `POST /2fa/setup` - generate and store encrypted secret
- `POST /2fa/enable` - activate after first successful verify
- `POST /2fa/disable` - tear down, clears secret
- `GET /2fa/backup-codes` - regenerate backup codes

**Security fixes applied post code review**:
- `/setup` now generates and stores secret server-side; client never supplies it
- `requireAuth` checks `purpose` field and rejects `totp-pending` tokens with 401
- Rate limiting added to `POST /login/totp`
- `decrypt()` wrapped in `try/catch` to prevent unhandled rejection on corrupt data
- `refreshCurrentUser()` called after enable/disable to sync React state immediately

## Root Cause Analysis

The client-trust bug was introduced because the setup endpoint was written before the security model was fully reasoned through. The middleware gap was an oversight - `requireAuth` was designed for regular JWTs and the `purpose` field was added late in the design without updating the middleware to enforce it. Both failures are classic incremental-design drift: you add something new, forget to audit the existing guards, and ship a hole.

## Lessons Learned

- For any auth endpoint that issues a token, immediately ask: what does every other protected endpoint do when it receives that token? Write the check before you write the issuance.
- Never trust the client for secrets. The setup endpoint should generate the secret, full stop. This is obvious in hindsight and should have been the first sentence of the design.
- Code review on auth flows is not optional polish. It caught two criticals here. Schedule it as a mandatory step, not an afterthought.
- Prisma nullable fields (`?`) and `@default(false)` made the zero-data-loss migration clean. That decision was correct and should be the template for all future additive schema changes.

## Next Steps

- [ ] Add integration tests covering the `totp-pending` token rejection path (owner: dev, before next release)
- [ ] Verify rate limiting thresholds on `/login/totp` under load (owner: dev)
- [ ] Consider adding a TOTP attempt audit log to the DB for suspicious activity detection (backlog)
