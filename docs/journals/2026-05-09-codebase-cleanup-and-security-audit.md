---
date: 2026-05-09
title: Codebase Cleanup & Security Audit Implementation
plan: plans/260508-1816-codebase-cleanup-and-security-audit/
tags: [security, cleanup, refactor, tech-debt, logging, testing]
---

# Codebase Cleanup & Security Audit — Execution Journal

Executed 4-phase cleanup plan từ brainstorm audit ngày 2026-05-08. Session focus: đóng security gaps, dọn rác build-time, cải thiện consistency, lay foundation cho long-term maintainability.

## Phase 1 — P0 Security Hotfix (partial)

- `chmod 600 .env` (was 644 — readable by any user trên máy)
- Removed orphan `com.smitos.server.plist` (referenced deleted `start-server.sh`)
- **Skipped per user:** CRM password rotation (cần CRM admin access — sẽ làm sau)

## Phase 2 — P1 Cleanup + CSP Enforce (complete)

- `npm audit fix`: 3 moderate CVE → 0 (express-rate-limit, ip-address, postcss)
- Removed 2 unused deps: `@google/genai`, `posthog-node` (zero imports)
- Cleaned 70 agent worktrees: 205MB → 3.2MB (active `zen-meitner` kept)
- Removed legacy logs (`launchagent*.log`, `startup.log`) + `prisma/dev.db` + `metadata.json`
- CSP enforce in production với explicit directives (Google Fonts, Material Symbols, picsum). reportOnly chỉ ở dev cho Vite HMR.

## Phase 3 — P2 Sprint Refactor (mostly complete)

- Archived 11 one-time scripts → `scripts/archive/` + README. Active scripts (9) còn ở root.
- Renamed 3 ui components to PascalCase: `date-picker` → `DatePicker`, `table-shell` → `TableShell`, `table-row-actions` → `TableRowActions`. Updated 19 imports.
- Setup `shared/types/` foundation với `@shared/*` path alias trong tsconfig.
- Consolidated 5 domain types: `dashboard-product`, `dashboard-overview`, `lead-flow`, `lead-distribution`, `call-performance`. `src/types/*.ts` re-export from shared cho backward compat.
- Validation pattern: extended `validate.middleware.ts` với `errorShape` option ('standard' | 'dashboard'). Refactored 13 endpoints (dashboard-product 10/11 + dashboard-overview 3) từ inline `safeParse()` sang `validateQuery()` middleware.
- **Kept inline:** `admin-fb-config.routes.ts` (response shape `{success, error}` không có `data` field).
- Dead exports: 170 → 167. Removed `isCrmDatabaseAvailable`, default export `crmPrisma`, deprecated `createGoogleOAuthRoutes` wrapper. Schema Input types (CreateUserInput etc.) kept — likely false positives từ ts-prune do barrel re-exports.

## Phase 4 — P3 Tech Debt (partial)

- **Pino logger foundation:** Created `server/lib/logger.ts` với redacted sensitive paths (password, authorization, cookie, jwt, token, accessToken). JSON prod, pretty dev. Migrated 3 cron jobs (`lead-sync`, `sheets-export`, `alert-scheduler`) — 8 console calls replaced.
- **Auth smoke tests:** 9 test cases cho `auth.service` + `totp.service` (token round-trip, tampering rejection, temp token purpose, TOTP verifyCode within window, backup code atomic consumption, normalization). All 25 tests pass (16 existing + 9 new). Updated `npm test` to load `.env` via `tsx --env-file` flag.

**Deferred (high effort, manual smoke test required):**
- Refactor 3 large pages: `OKRsManagement.tsx` (1544 LOC), `DailySync.tsx` (937), `ProductBacklog.tsx` (711). Strategy: extract custom hooks → split components. Plan ước tính 18h.
- Reduce 144 `any` occurrences. Foundation đã sẵn (`server/types/express.d.ts` typed `Request.user`). Migration progressive theo file.
- Migrate ~80 remaining `console.log` in services/routes to Pino. Pattern established.

## Difficulties

- **scripts/archive/ broke typecheck:** archived scripts có import paths `../server/...` nhưng giờ ở subfolder cần `../../server/...`. Fix: thêm `scripts/archive` vào `tsconfig.exclude` thay vì sửa imports (archived = không chạy lại).
- **Dashboard response shape custom:** `{success, data, error}` không match middleware default `{error, details}`. Solution: extend middleware với `errorShape: 'dashboard'` option thay vì duplicate function.
- **Tests fail vì JWT_SECRET chưa load:** tsx --test không tự load .env. Fix: add `--env-file=.env` flag vào test command.
- **TOTP otpauth URL URL-encoded:** `test@example.com` → `test%40example.com`. Test assertion phải match URL-encoded form.

## Verification

```
npm run typecheck  ✓
npm run build      ✓ (built in 2.41s)
npm test           ✓ 25/25 pass
npm audit          ✓ 0 vulnerabilities
git worktree list  ✓ chỉ còn main + 1 active worktree
```

## Files

- 12 commits trong session
- 6 phases of plan: 2 complete, 2 partial (per-design)
- Net LOC: -200 LOC archive scripts + -3 dead exports + +104 test LOC + +40 logger LOC
- Disk: -202MB (worktree cleanup)
