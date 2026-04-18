# Phase 1: Critical Fixes

**Effort:** 1h | **Priority:** P0 | **Status:** completed

## Tasks

### 1.1 Fix CORS Wildcard (server.ts:31)

**Current:**
```typescript
app.use(cors({ credentials: true, origin: true }));
```

**Fix:**
```typescript
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({ 
  credentials: true, 
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  }
}));
```

**Add to .env.example:**
```
ALLOWED_ORIGINS=http://localhost:3000,https://smitos.example.com
```

### 1.2 Remove Hardcoded Password (scripts/setup-db.ts:18)

**Current:**
```typescript
const hashedPassword = await bcrypt.hash('@Dominic23693', 10);
```

**Fix:**
```typescript
const ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error('Error: ADMIN_INITIAL_PASSWORD env var required');
  process.exit(1);
}
const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
```

**Update .env.example:**
```
ADMIN_INITIAL_PASSWORD=your-secure-password-here
```

### 1.3 Fix Vulnerable Dependencies

```bash
# Fix protobufjs (critical)
npm audit fix

# Check xlsx usage
grep -r "xlsx" --include="*.ts" src/ server/
```

If xlsx is used, evaluate replacement with `exceljs` or check if `xlsx@0.19.3+` available.

## Checklist

- [x] CORS uses explicit origin whitelist
- [x] Setup script requires env var for password
- [x] .env.example updated with new vars
- [x] `npm audit` shows 0 critical vulnerabilities (xlsx removed, protobufjs fixed)
- [x] Test login flow after changes
