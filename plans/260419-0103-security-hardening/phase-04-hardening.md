# Phase 4: Production Hardening

**Effort:** 0.5h | **Priority:** P1 | **Status:** completed

## Tasks

### 4.1 JWT Secret Fail-Hard (auth.service.ts:5)

**Current:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod';
```

**Fix:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET must be set in production');
  }
  console.warn('[auth] Using default JWT_SECRET - DO NOT USE IN PRODUCTION');
}

const EFFECTIVE_SECRET = JWT_SECRET || 'dev-secret-change-in-prod';
```

### 4.2 Crypto Fail-Hard (crypto.ts:6-8)

**Current:**
```typescript
if (SECRET.length < 32) {
  console.warn('[crypto] APP_SECRET/JWT_SECRET should be >= 32 chars');
}
```

**Fix:**
```typescript
if (SECRET.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: APP_SECRET/JWT_SECRET must be >= 32 chars in production');
  }
  console.warn('[crypto] APP_SECRET/JWT_SECRET should be >= 32 chars (DEV MODE)');
}
```

### 4.3 Add Helmet Security Headers (server.ts)

```bash
npm install helmet
```

```typescript
import helmet from 'helmet';

// After cors middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Vite dev
}));
```

### 4.4 Add Rate Limiting to Auth (server.ts)

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { error: 'Too many login attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to auth routes only
app.use('/api/auth/login', authLimiter);
```

### 4.5 Sanitize Error Messages (server.ts:61-64)

**Current:**
```typescript
res.status(500).json({ error: "Internal server error", message: err.message });
```

**Fix:**
```typescript
const isDev = process.env.NODE_ENV !== 'production';
res.status(500).json({ 
  error: "Internal server error",
  ...(isDev && { message: err.message, stack: err.stack })
});
```

## Checklist

- [x] JWT_SECRET missing in production = fatal error
- [x] Weak crypto key in production = fatal error
- [x] Helmet middleware added
- [x] Rate limiting on /api/auth/login
- [x] Error messages sanitized in production
- [x] Test: App fails to start without JWT_SECRET (NODE_ENV=production)
