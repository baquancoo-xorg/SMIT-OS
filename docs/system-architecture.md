# System Architecture

> Last updated: 2026-04-28

## Overview

SMIT-OS is a full-stack monorepo. The frontend (React SPA) and backend (Express API) share the same repo and are served from the same Node process in development.

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, TailwindCSS v4, Tanstack Query v5 |
| Backend | Express 5, TypeScript, Prisma ORM |
| Database | PostgreSQL 15 (Docker) |
| Auth | HTTP-only cookie JWT (4h expiry, sliding session) |
| Build | Vite, tsx watch (dev) |

## Directory Structure

```
smit-os/
├── server/
│   ├── routes/         # Express route handlers
│   ├── services/       # Business logic
│   ├── middleware/     # Auth, RBAC, validation
│   ├── schemas/        # Zod validation schemas
│   ├── lib/            # Shared utilities (crypto, db, date, etc.)
│   ├── jobs/           # Background jobs
│   ├── controllers/    # (thin controllers where used)
│   └── types/          # Shared TypeScript types
├── src/                # React frontend
├── prisma/
│   ├── schema.prisma   # Primary schema (smitos_db)
│   └── crm-schema.prisma
├── server.ts           # Express app entry point
└── package.json
```

## Authentication

### JWT Cookie Strategy

- Token stored as `jwt` HTTP-only cookie (`sameSite: strict`, `secure` in production)
- Standard session token expires in **4 hours**
- **Sliding session**: when remaining time < 1h on any authenticated request, token auto-refreshes to full 4h (user active continuously = never logout)
- User idle > 4h = cookie expires = logout (security)
- Token payload: `{ userId, role, isAdmin, purpose? }`
- On every authenticated request, `auth.middleware.ts` fetches fresh user data from DB (role changes take effect immediately)

### Two-Factor Authentication (TOTP)

Opt-in per user. Login uses a two-step flow when 2FA is enabled.

**Login flow:**

```
POST /api/auth/login
  ├─ 2FA disabled → issue full JWT (4h) → done
  └─ 2FA enabled  → issue totp-pending JWT (5 min)
                        ↓
               POST /api/auth/login/totp
                 ├─ valid TOTP code   → issue full JWT (4h)
                 └─ valid backup code → consume code, issue full JWT (4h)
```

The `totp-pending` JWT has `purpose: 'totp-pending'` in its payload. `requireAuth` middleware rejects these tokens; they are only accepted by `POST /api/auth/login/totp`.

**2FA management endpoints** (all require full session JWT):

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/2fa/setup` | Generate encrypted secret + `otpauthUrl` for QR scan |
| `POST` | `/api/auth/2fa/enable` | Verify TOTP code, activate 2FA, return 8 backup codes |
| `POST` | `/api/auth/2fa/disable` | Deactivate 2FA (requires password) |
| `POST` | `/api/auth/2fa/admin-reset/:userId` | Admin: reset 2FA for any user |

**Storage:**

- `totpSecret` — AES-256-GCM encrypted (via `server/lib/crypto.ts`)
- `totpBackupCodes` — 8 codes, bcrypt-hashed, consumed on use
- Library: `otpauth` (RFC 6238)

**Rate limiting** (`server.ts`):

- `POST /api/auth/login` and `POST /api/auth/login/totp` share the same limiter
- Configured via `express-rate-limit` v8

### Authorization

- `auth.middleware.ts` — validates JWT, attaches `req.user`
- `admin-auth.middleware.ts` — requires `isAdmin === true`
- `rbac.middleware.ts` — role-based access control
- `ownership.middleware.ts` — resource ownership checks

## Data Layer

- Prisma ORM with PostgreSQL 15
- Primary DB: `smitos_db` (port 5435)
- Secondary schema: `prisma/crm-schema.prisma` (CRM data via `server/lib/crm-db.ts`)
- No raw SQL in application code; all queries via Prisma client

### Prisma Client Singleton

All application code imports the shared singleton from `server/lib/prisma.ts`:

```ts
import { prisma } from '../lib/prisma';
```

`server/lib/crm-db.ts` is intentionally a separate client pointing at the CRM database — do not consolidate. Every other server file must use the singleton; creating additional `new PrismaClient()` instances is a bug.

## Server Security

Configured in `server.ts` (hardened 2026-04-28):

| Control | Configuration |
|---------|---------------|
| JSON body limit | `express.json({ limit: '2mb' })` — returns 413 on oversized payloads |
| CSP | Helmet `contentSecurityPolicy` in **report-only** mode — adds `Content-Security-Policy-Report-Only` header without blocking assets |
| CORS blank-origin | Allowed only when `NODE_ENV !== 'production'`; production requires origin to match `ALLOWED_ORIGINS` |
| General API rate limit | 200 requests/minute on `/api/` (on top of existing auth-route limiter) |
| Admin route auth | `/api/admin/*` is gated by `requireAdmin` middleware — returns 403 for non-admin requests |

## Backend Performance

### Dashboard Overview Cache

`server/services/dashboard/overview-ad-spend.ts` wraps expensive CRM aggregation queries with an in-process TTL cache (60 s). Cache key is the query signature; cache is a module-level `Map` — no Redis dependency. Second request within TTL resolves in <50 ms.

### Lead Sync Batch Query

`server/services/lead-sync/crm-lead-sync.service.ts` pre-fetches all existing leads for a sync batch with a single `prisma.lead.findMany({ where: { crmSubscriberId: { in: batchIds } } })` before the processing loop, then uses an in-memory `Map` for O(1) lookups. This replaces the previous O(n) per-lead `findUnique` pattern.

## API Conventions

- All routes prefixed `/api/`
- Request bodies validated with Zod schemas (`server/schemas/`)
- Error responses: `{ error: string }`
- Auth errors: HTTP 401; authorization errors: HTTP 403

## Frontend UI Architecture

### Shared Table UI Contract (added 2026-04-27)

A shared table design contract now centralizes table presentation tokens for two variants:

- `standard` — operational/business tables
- `dense` — analytics/high-column-density tables

Core primitives:

- `src/components/ui/table-contract.ts` — variant class contract map (shell, header, body, row, cell, actions, empty state)
- `src/components/ui/table-shell.tsx` — shell wrapper component applying contract classes per variant
- `src/components/ui/table-date-format.ts` — unified helpers for date-only and date-time rendering

Action controls:

- `src/components/ui/table-row-actions.tsx` supports variant-aware behavior (including dense compact treatment)

Rollout status (as of 2026-04-27):

- **Phase 01 — Foundation + pilots:** `src/components/board/TaskTableView.tsx` (standard), `src/components/dashboard/overview/KpiTable.tsx` (dense)
- **Phase 02 — Standard rollout:** operational module tables and modal-embedded tables fully migrated, including `src/components/modals/WeeklyCheckinModal.tsx` and `src/components/modals/ReportDetailDialog.tsx`; shared `formatTableDate` helper adopted across all standard tables
- **Phase 03 — Dense rollout:** call-performance analytics tables migrated — `src/components/dashboard/call-performance/call-performance-ae-table.tsx` and `src/components/dashboard/call-performance/call-performance-conversion.tsx` both use `variant="dense"` with `getTableContract('dense')` tokens

This architecture keeps table business logic in feature modules while consolidating visual shell behavior and formatting contracts in reusable UI primitives.
