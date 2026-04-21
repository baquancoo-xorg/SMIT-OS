---
phase: 03
title: "Backend Auth Routes"
status: completed
priority: critical
effort: 1h
dependsOn: phase-02
---

# Phase 03 u2014 Backend Auth Routes

## Overview

Cu1eadp nhu1eadt `server/routes/auth.routes.ts` u0111u1ec3 hu1ed7 tru1ee3 two-step login vu00e0 thu00eam 4 endpoints quu1ea3n lu00fd 2FA.

## Files to Modify

- `server/routes/auth.routes.ts` u2014 cu1eadp nhu1eadt POST /login, thu00eam 4 routes mu1edbi

## Endpoint Summary

| Method | Path | Auth | Mu00f4 tu1ea3 |
|--------|------|------|---------|
| `POST` | `/api/auth/login` | None | Step 1: verify password |
| `POST` | `/api/auth/login/totp` | None | Step 2: verify TOTP + issue JWT |
| `GET` | `/api/auth/2fa/setup` | JWT | Generate secret + QR URL |
| `POST` | `/api/auth/2fa/enable` | JWT | Activate 2FA vu1edbi code xu00e1c nhu1eadn |
| `POST` | `/api/auth/2fa/disable` | JWT | Tu1eaft 2FA sau khi verify password |
| `POST` | `/api/auth/2fa/admin-reset/:userId` | JWT + isAdmin | Admin reset 2FA cho user |

## Implementation Steps

### 1. Cu1eadp nhu1eadt `POST /login` (step 1)

```typescript
router.post('/login', validate(loginSchema), async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  // 2FA enabled u2192 two-step flow
  if (user.totpEnabled) {
    const tempToken = authService.signTempToken(user.id);
    return res.json({ requiresTOTP: true, tempToken });
  }

  // No 2FA u2192 issue full JWT (unchanged flow)
  const token = authService.signToken({
    userId: user.id,
    role: user.role,
    isAdmin: user.isAdmin,
  });
  res.cookie('jwt', token, COOKIE_OPTIONS);
  const { password: _, totpSecret: __, totpBackupCodes: ___, ...safeUser } = user;
  res.json(safeUser);
});
```

### 2. Thu00eam `POST /login/totp` (step 2)

```typescript
router.post('/login/totp', validate(totpVerifySchema), async (req, res) => {
  const { tempToken, code } = req.body;

  const temp = authService.verifyTempToken(tempToken);
  if (!temp) return res.status(401).json({ error: 'Invalid or expired session' });

  const user = await prisma.user.findUnique({ where: { id: temp.userId } });
  if (!user || !user.totpEnabled || !user.totpSecret)
    return res.status(401).json({ error: 'User not found or 2FA not configured' });

  const decryptedSecret = totpService.decryptSecret(user.totpSecret);

  // Try TOTP code first
  if (totpService.verifyCode(decryptedSecret, code)) {
    const token = authService.signToken({ userId: user.id, role: user.role, isAdmin: user.isAdmin });
    res.cookie('jwt', token, COOKIE_OPTIONS);
    const { password: _, totpSecret: __, totpBackupCodes: ___, ...safeUser } = user;
    return res.json(safeUser);
  }

  // Try backup code
  const { valid, remaining } = await totpService.verifyAndConsumeBackupCode(code, user.totpBackupCodes);
  if (valid) {
    await prisma.user.update({ where: { id: user.id }, data: { totpBackupCodes: remaining } });
    const token = authService.signToken({ userId: user.id, role: user.role, isAdmin: user.isAdmin });
    res.cookie('jwt', token, COOKIE_OPTIONS);
    const { password: _, totpSecret: __, totpBackupCodes: ___, ...safeUser } = user;
    return res.json({ ...safeUser, backupCodeUsed: true, remainingBackupCodes: remaining.length });
  }

  return res.status(401).json({ error: 'Invalid authentication code' });
});
```

### 3. Thu00eam `GET /2fa/setup` (authenticated)

```typescript
router.get('/2fa/setup', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { username: true, totpEnabled: true }
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.totpEnabled) return res.status(400).json({ error: '2FA already enabled' });

  const { secret, otpauthUrl } = totpService.generateSecret(user.username);
  // QR URL: frontend du00f9ng thu01b0 viu1ec7n `qrcode` hou1eb7c render bu1eb1ng <img src="https://api.qrserver.com/..."> 
  res.json({ secret, otpauthUrl });
});
```

### 4. Thu00eam `POST /2fa/enable` (authenticated)

```typescript
router.post('/2fa/enable', requireAuth, validate(totpEnableSchema), async (req, res) => {
  const { secret, code } = req.body;

  // Verify code tru01b0u1edbc khi lu01b0u
  if (!totpService.verifyCode(secret, code))
    return res.status(400).json({ error: 'Invalid verification code' });

  const encryptedSecret = totpService.encryptSecret(secret);
  const plainBackupCodes = totpService.generateBackupCodes();
  const hashedBackupCodes = await totpService.hashBackupCodes(plainBackupCodes);

  await prisma.user.update({
    where: { id: req.user!.userId },
    data: {
      totpSecret: encryptedSecret,
      totpEnabled: true,
      totpBackupCodes: hashedBackupCodes,
    }
  });

  // Tru1ea3 vu1ec1 plaintext backup codes CHI Mu1ed8T Lu1ea6N u2014 sau nu00e0y khu00f4ng thu1ec3 xem lu1ea1i
  res.json({ success: true, backupCodes: plainBackupCodes });
});
```

### 5. Thu00eam `POST /2fa/disable` (authenticated)

```typescript
router.post('/2fa/disable', requireAuth, validate(totpDisableSchema), async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { password: true }
  });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const valid = await bcrypt.compare(req.body.password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });

  await prisma.user.update({
    where: { id: req.user!.userId },
    data: { totpEnabled: false, totpSecret: null, totpBackupCodes: [] }
  });

  res.json({ success: true });
});
```

### 6. Thu00eam `POST /2fa/admin-reset/:userId` (admin only)

```typescript
router.post('/2fa/admin-reset/:userId', requireAuth, requireAdmin, async (req, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  await prisma.user.update({
    where: { id: userId },
    data: { totpEnabled: false, totpSecret: null, totpBackupCodes: [] }
  });

  res.json({ success: true });
});
```

### 7. Middleware helpers cu1ea7n thu00eam

`requireAuth` vu00e0 `requireAdmin` lu00e0 middleware inline hou1eb7c import tu1eeb `auth.middleware.ts`:

```typescript
// requireAuth: kiu1ec3m tra JWT cookie hu1ee3p lu1ec7, set req.user
// requireAdmin: kiu1ec3m tra req.user.isAdmin === true
// u2014 Hou1eb7c du00f9ng createAuthMiddleware(prisma) hiu1ec7n cu00f3 vu00e0 thu00eam inline admin check
```

## Success Criteria

- [x] `POST /login` tru1ea3 vu1ec1 `{ requiresTOTP: true, tempToken }` nu1ebfu user cu00f3 2FA
- [x] `POST /login` vu1eabn hou1ea1t u0111u1ed9ng bu00ecnh thu01b0u1eddng nu1ebfu user khu00f4ng cu00f3 2FA
- [x] `POST /login/totp` chu1ea5p nhu1eadn cu1ea3 TOTP code vu00e0 backup code
- [x] `GET /2fa/setup` tru1ea3 vu1ec1 secret + otpauthUrl hu1ee3p lu1ec7
- [x] `POST /2fa/enable` lu01b0u encrypted secret + hashed backup codes
- [x] `POST /2fa/disable` xu00f3a tou00e0n bu1ed9 2FA data sau khi verify password
- [x] Admin reset endpoint chu1ec9 accessible vu1edbi `isAdmin = true`
- [x] Password/secret khu00f4ng bao giu1edd u0111u01b0u1ee3c tru1ea3 vu1ec1 trong response

## Security Notes

- Temp token khu00f4ng chu1ee9a `role`/`isAdmin` u2192 khu00f4ng thu1ec3 du00f9ng truy cu1eadp API khu00e1c
- Backup codes hiu1ec3n thu1ecb **1 lu1ea7n duy nhu1ea5t** tu1ea1i thu1eddi u0111iu1ec3m enable
- Admin reset ghi log audit (optional, cu00f3 thu1ec3 bu1ed5 sung sau)
- Rate limiting cho `/login` vu00e0 `/login/totp` nu00ean u0111u01b0u1ee3c xu00e9m xu00e9t (out of scope cu1ee7a plan nu00e0y)
