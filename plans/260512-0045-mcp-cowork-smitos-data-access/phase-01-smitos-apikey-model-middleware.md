# Phase 01 — SMIT-OS ApiKey model + middleware

## Context Links

- Parent plan: [../plan.md](./plan.md)
- Brainstorm: `plans/reports/brainstorm-260512-0045-mcp-cowork-smitos-data-access.md` (sections "SMIT-OS changes", "Risks & Mitigations")
- Existing JWT middleware (pattern reference): `server/middleware/auth.middleware.ts`
- Test pattern reference: `server/__tests__/auth.test.ts`
- Schema location: `prisma/schema.prisma`
- **Depends on:** none (entry phase)
- **Blocks:** phase 02, 03

## Overview

- Date: 2026-05-12
- Description: Add `ApiKey` Prisma model + `apiKeyAuth` middleware reading `X-API-Key` header, hash-compares against `keyHash`, enforces scopes. Add unified `requireAuth(['scope'])` helper accepting either JWT (cookie) or ApiKey (header).
- Priority: P2 (foundation — no consumer yet but blocks all downstream)
- Implementation status: pending
- Review status: pending

## Key Insights

- Existing JWT middleware is mounted globally on `/api` (server.ts:130). Cannot replace — must compose. Strategy: keep global JWT middleware, but add `apiKeyAuth` BEFORE it on whitelisted routes; if ApiKey valid → `req.user` set + `next()` skips JWT path via early return. If header missing → falls through to JWT.
- bcrypt already in deps (`bcryptjs ^3.0.3`) — reuse, don't add new lib.
- `req.user` shape from JWT middleware: `{ userId, role, isAdmin, departments, fullName }`. ApiKey path must populate compatible shape: `{ type: 'api-key', apiKeyId, scopes, isAdmin: false }` — downstream RBAC must check `type` before assuming `userId`. Document this contract.
- `node:test` is the test runner (per `package.json` test script). No jest/vitest setup — match `auth.test.ts` style exactly.
- Prisma uses `db push` for dev (`npm run db:push`) but `db:migrate` exists. Use `npm run db:migrate` to create proper migration file (audit trail).

## Requirements

### Functional

- New Prisma model `ApiKey` with: `id`, `name`, `keyHash` (bcrypt), `prefix` (4 visible chars after `smk_`), `scopes` (string[]), `createdBy` (FK→User.id), `createdAt`, `lastUsedAt?`, `revokedAt?`.
- Middleware `apiKeyAuth` reads `X-API-Key` header. If absent → call `next()` (let JWT path handle). If present:
  - Extract prefix (first 8 chars `smk_xxxx`) → query `ApiKey` by prefix (indexed) — narrows candidates.
  - bcrypt compare full key against matching `keyHash`.
  - Reject (401) if no match, revoked, or scope mismatch.
  - On success: update `lastUsedAt` (fire-and-forget, no `await`), set `req.user = { type: 'api-key', apiKeyId, scopes, isAdmin: false }`, call `next()`.
- Helper `requireAuth(requiredScopes: string[])` returns Express middleware that:
  - If `req.user.type === 'api-key'` → check `requiredScopes.every(s => req.user.scopes.includes(s))`. Reject 403 on mismatch.
  - If `req.user` from JWT → allow (admin/member RBAC handled separately by route).

### Non-functional

- Middleware response time < 50ms p95 (single bcrypt compare).
- Each new file < 200 LOC.
- Zero impact on existing JWT-only routes.

## Architecture

### Component Diagram

```
Request with X-API-Key
  → apiKeyAuth middleware (new)
    → bcrypt.compare → set req.user (api-key shape)
    → next()
  → requireAuth(['read:reports']) (new helper)
    → check scopes → next() OR 403

Request with cookie jwt
  → apiKeyAuth (no header → next() pass-through)
  → createAuthMiddleware (existing JWT)
    → set req.user (jwt shape)
  → requireAuth(['…']) → JWT users always allowed (scope is api-key concept)
```

### Data Flow — Generate vs Verify

- **Generate (phase 02)**: random 32-byte → base64url → prefix `smk_` + 4 visible chars stored as `prefix` → bcrypt hash full key → store hash. Return raw key ONCE.
- **Verify (phase 01)**: header `smk_abcd_<rest>` → extract prefix `smk_abcd` → lookup row → bcrypt compare full key.

### Interfaces

```ts
// server/middleware/api-key-auth.ts
export function createApiKeyAuthMiddleware(prisma: PrismaClient): RequestHandler;

// server/middleware/require-auth.ts
export function requireAuth(requiredScopes?: string[]): RequestHandler;

// server/types/express.d.ts (augment)
declare global {
  namespace Express {
    interface Request {
      user?:
        | { type?: 'jwt'; userId: string; role: string; isAdmin: boolean; departments: string[]; fullName: string }
        | { type: 'api-key'; apiKeyId: string; scopes: string[]; isAdmin: false };
    }
  }
}
```

## Related Code Files

### Create

- `prisma/schema.prisma` — add `ApiKey` model (edit, not create) + `User.apiKeys ApiKey[]` back-relation
- `server/middleware/api-key-auth.ts` (~80 LOC)
- `server/middleware/require-auth.ts` (~40 LOC)
- `server/__tests__/api-key-auth.test.ts` (~120 LOC)
- `server/lib/api-key-helpers.ts` (~50 LOC) — `generateRawKey()`, `extractPrefix()`, `hashKey()`, `compareKey()`. Shared by middleware (verify) + admin endpoint phase 02 (generate). DRY.

### Modify

- `prisma/schema.prisma` — add model + back-relation on `User`
- `server/types/express.d.ts` — augment `Request.user` union (if file exists; create if not)

### Delete

- None

## Implementation Steps

1. Edit `prisma/schema.prisma`: add `ApiKey` model with fields above + `@@index([prefix])` for fast lookup, `@@index([revokedAt])`. Add `apiKeys ApiKey[]` to `User`.
2. Run `npm run db:migrate -- --name add-api-key-model` to create migration + apply.
3. Run `npm run prisma:gen` to regenerate client.
4. Create `server/lib/api-key-helpers.ts`:
   - `generateRawKey()` → returns `{ raw: string, prefix: string }` using `crypto.randomBytes(24).toString('base64url')` + `smk_${first4}_${rest}`.
   - `extractPrefix(raw)` → returns first 8 chars `smk_xxxx`.
   - `hashKey(raw)` → bcrypt.hash with cost 10.
   - `compareKey(raw, hash)` → bcrypt.compare.
5. Create `server/middleware/api-key-auth.ts`:
   - Export factory `createApiKeyAuthMiddleware(prisma)`.
   - Read `req.headers['x-api-key']`. If missing → `next()`.
   - Extract prefix. If invalid format (not `smk_xxxx`) → `next()` (let JWT decide).
   - Query `prisma.apiKey.findMany({ where: { prefix, revokedAt: null } })` — small set.
   - Loop bcrypt.compare; on first match → set `req.user`, fire-and-forget `lastUsedAt` update, `next()`.
   - On no match → return 401 (header was present but invalid — don't fall through, that would mask bad keys).
6. Create `server/middleware/require-auth.ts`:
   - Export `requireAuth(scopes?: string[])`.
   - Check `req.user` exists (else 401 — should be unreachable if middlewares ordered).
   - If `req.user.type === 'api-key'` and `scopes`: enforce `every(s => user.scopes.includes(s))`. Else 403.
   - JWT users: pass through (scope concept is api-key only).
7. Create/update `server/types/express.d.ts` with discriminated union (do not modify `req.user` shape used elsewhere — JWT path keeps current keys, just add optional `type: 'jwt'`).
8. Create `server/__tests__/api-key-auth.test.ts` — pure-function tests for `api-key-helpers.ts` (no DB) + DB-backed tests for middleware using a real test row (insert in `before`, delete in `after`).
9. Run `npm test` — verify new tests pass + existing `auth.test.ts` still passes.
10. `npm run typecheck` — verify no type errors across server.

## Todo List

- [ ] Add `ApiKey` model to `prisma/schema.prisma` + indexes + User back-relation
- [ ] Run `npm run db:migrate -- --name add-api-key-model`
- [ ] Run `npm run prisma:gen`
- [ ] Create `server/lib/api-key-helpers.ts`
- [ ] Create `server/middleware/api-key-auth.ts`
- [ ] Create `server/middleware/require-auth.ts`
- [ ] Augment `server/types/express.d.ts` with `req.user` union
- [ ] Create `server/__tests__/api-key-auth.test.ts`
- [ ] `npm test` passes (new + existing)
- [ ] `npm run typecheck` clean

## Success Criteria

- New tests green; existing tests unaffected.
- `npx prisma studio` shows `ApiKey` table empty + correct schema.
- TypeScript compiles with no `any` leaks in new files.
- Middleware files each < 200 LOC.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| bcrypt compare in loop slow if prefix collision | Low | Low | 4-char prefix from base64url ⇒ ~16M combinations; collision rate negligible; cap query `take: 5` |
| Type augmentation breaks existing routes that destructure `req.user.userId` | Medium | High | Make `type` optional with default `'jwt'`; existing keys (`userId`, `role`, etc.) remain on JWT branch. Run full `tsc --noEmit` before merge |
| Migration breaks if PG container down | Low | Medium | Document `docker-compose up -d` in pre-step; CI uses ephemeral DB |
| Fire-and-forget `lastUsedAt` update lost on crash | Low | Low | Acceptable — `lastUsedAt` is observability, not security boundary |
| Header `X-API-Key` collides with future cf-tunnel header | Low | Low | Cloudflare Tunnel does not strip/inject this header (verified in CF docs); document in api-key-authentication.md |

## Security Considerations

- Raw key never logged. `console.log(req.headers)` in dev mode shows headers — confirm logging middleware (`server.ts:93`) uses only `req.method` + `req.url`, not headers. Audit.
- `keyHash` field never selected in admin list endpoint (phase 02). Use Prisma `select` whitelist.
- bcrypt cost 10 (matches existing user password hashing — keep parity).
- Reject 401 explicitly when `X-API-Key` present but invalid — don't fall through to JWT (would mask brute-force attempts).
- No timing-safe compare needed beyond bcrypt's built-in (bcrypt.compare is constant-time per its design).

## Next Steps

- Phase 02: build admin endpoints (generate/list/revoke) + audit log + Settings UI panel using helpers from this phase.
