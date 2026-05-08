# Brainstorm Report — Code Cleanup & Security Audit

- **Date:** 2026-05-08 18:04
- **Scope:** Full code audit (orphan files, dead code, kiến trúc) + Full OWASP Top 10
- **Threat context:** Internal team only qua Cloudflare Tunnel, có auth
- **Output:** Findings + recommendations (no implementation)

---

## ⚠️ CẢNH BÁO TRƯỚC TIÊN — Credential Exposure

File `.env` chứa **CRM production password raw** đã được hiển thị trong terminal session khi tôi `cat` để audit:
```
postgresql://quan_coo_crm:JGGudf8745jhjhs98034hdjhfdf34@100.114.94.34:12222/scrm_quan
```

**Hành động khẩn cấp:**
1. **Rotate ngay** password CRM `quan_coo_crm` trên server CRM. Credential này đã bị render trong agent context — coi như leaked.
2. `chmod 600 .env` — hiện đang `644` (world-readable).
3. Cân nhắc move credentials sang macOS Keychain hoặc 1Password CLI thay vì plaintext `.env`.

---

## 1. Tổng quan codebase

| Metric | Value |
|---|---|
| TS/TSX files | 259 |
| Total LOC (top 10 files) | 32.595 |
| Server routes | 21 |
| Frontend pages | 17 |
| Components | 94 |
| Test files | 4 (chỉ posthog services + 1 formatter) |
| `any` usage | 140 occurrences |
| `console.log` server-side | 85 |
| Dead exports (ts-prune) | 219 |
| npm CVE moderate | 3 |
| Git worktrees rác | 71 (205MB) |

**Kết luận sơ bộ:** Codebase có nền tảng security khá vững (JWT/TOTP/encryption/rate-limiting đúng), nhưng **rác filesystem nhiều**, **type safety yếu** (140 `any`), và **một số CSP/permissions/credentials handling cần siết**.

---

## 2. Findings — Severity P0 (Critical)

### P0-1. CRM credential exposure trong `.env`
- File `.env` permissions `-rw-r--r--` → mọi user trên máy đều đọc được.
- Raw password CRM database (production) lưu plaintext.
- **Fix:** `chmod 600 .env` + rotate password + dùng env loader an toàn hơn (dotenv-vault / Doppler / 1Password CLI).

### P0-2. `com.smitos.server.plist` orphan
- Plist references `~/Library/Application Support/SMIT-OS/start-server.sh` đã bị xoá khỏi git ở commit `6f8019b`.
- Nếu ai load plist này, launchd retry liên tục → log noise + có thể restart ảo.
- **Fix:** Xoá `com.smitos.server.plist` khỏi repo (nó cũng không được dùng trong scripts/CI).

---

## 3. Findings — Severity P1 (High)

### P1-1. 71 git worktrees rác = 205 MB
- Trong `.claude/worktrees/` có 71 directories `agent-*` đều ở trạng thái `locked` (di sản từ các session Claude trước).
- Mỗi worktree có copy đầy đủ source → ngốn disk + có thể chứa code outdated/private branches.
- **Fix:** `git worktree list` → unlock + remove từng cái, hoặc bulk:
  ```bash
  git worktree list | grep "agent-" | awk '{print $1}' | xargs -I{} git worktree remove --force {}
  rm -rf .claude/worktrees/agent-*
  ```
- Đã có trong `.gitignore` (`.claude/worktrees/`) nên không leak vào git, nhưng vẫn nặng disk.

### P1-2. NPM CVE moderate (3 vulns)
- `ip-address` ≤ 10.1.0 — XSS qua Address6 HTML
- `express-rate-limit` 8.0.1–8.5.0 — depends on `ip-address` vuln
- `postcss` < 8.5.10 — XSS via unescaped `</style>`
- **Fix:** `npm audit fix` (hoặc bump `express-rate-limit` → 8.5.1, `postcss` → 8.5.10+).

### P1-3. Unused dependencies trong `package.json`
- `@google/genai` (1.49.0) — không có `import` nào trong codebase.
- `posthog-node` (5.33.3) — project dùng axios + REST API trực tiếp, không dùng SDK.
- **Impact:** Bloat node_modules + supply chain surface area.
- **Fix:** `npm uninstall @google/genai posthog-node`.

### P1-4. CSP `reportOnly: true` ở production
- `server.ts:78`:
  ```ts
  app.use(helmet({
    contentSecurityPolicy: { useDefaults: true, reportOnly: true },
  }));
  ```
- CSP chỉ report violations, không block. XSS payload vẫn execute.
- **Fix:** Chuyển sang enforce mode khi `NODE_ENV === 'production'`. Audit trước để bảo đảm fonts.googleapis.com + bất kỳ inline-script nào được allow trong directives.

### P1-5. Logs di sản từ launchd cũ
- `logs/launchagent.log` (0 bytes), `logs/launchagent-error.log`, `logs/startup.log` (169 KB) — di sản từ launchd setup đã xoá ở commit `6f8019b`.
- Không gây harm nhưng confusing khi debug.
- **Fix:** Xoá logs này. `logs/dev-server.log` giữ.

---

## 4. Findings — Severity P2 (Medium)

### P2-1. Type duplication client/server
- `src/types/dashboard-product.ts` (28 interfaces) duplicate `server/types/dashboard-product.types.ts`.
- Tương tự cho `lead-flow`, `lead-distribution`, `dashboard-overview`, `call-performance`.
- Mọi sửa schema phải sync 2 nơi → drift risk.
- **Fix:** Tạo `shared/types/` package hoặc generate types từ Zod schemas (single source).

### P2-2. Naming inconsistency `src/components/ui/`
- Cùng folder có 2 conventions:
  - PascalCase: `Card.tsx`, `Button.tsx`, `Badge.tsx`, `Input.tsx`, `Skeleton.tsx`, `ErrorBoundary.tsx`, `PrimaryActionButton.tsx`, `SectionHeader.tsx`, `ViewToggle.tsx`, `CustomDatePicker.tsx`, `CustomFilter.tsx`, `CustomSelect.tsx`
  - kebab-case: `date-picker.tsx`, `table-shell.tsx`, `table-row-actions.tsx`
- **Fix:** Chốt 1 convention cho components (PascalCase phổ biến trong React) hoặc kebab-case (theo dev-rules global). Áp dụng đồng nhất.

### P2-3. Service folder structure inconsistent
- `server/services/sheets-export.service.ts` (file) tồn tại song song `server/services/sheets-export/extractors/` (folder).
- `server/services/dashboard/`: mix `*.service.ts`, `*-aggregators.ts`, `*-helpers.ts`, `*-ad-spend.ts`.
- **Fix:** Quyết định pattern: `<name>/index.ts` cho service multi-file, `<name>.service.ts` cho service single-file. Đặt helpers vào `<service>/lib/` hoặc `<service>/helpers.ts`.

### P2-4. `any` type lan tràn (140 occurrences)
- Routes thường dùng `req: any, res: any` để tránh type errors khi extend Request.
- `req.user as any`, `data: Record<string, unknown>` etc.
- **Fix:** Dùng đầy đủ Express type augmentation đã setup ở `server/types/express.d.ts`. Loại bỏ `any` ở router signatures.

### P2-5. Dead exports (219 từ ts-prune)
- Nhiều schema input types không được import: `OverviewQuery`, `KpiQuery`, `FbSyncBody`, `CreateUserInput`, `UpdateUserInput`, etc.
- `validateQuery` middleware không được dùng đâu cả.
- `getExchangeRate` ở `currency-converter.ts` unused.
- **Fix:** Chạy `npx ts-prune` định kỳ trong CI; xoá các export thực sự không dùng. Lưu ý ts-prune false positive với re-export → kiểm tra trước.

### P2-6. Validation pattern không nhất quán
- 14/15 routes mutating mix giữa `validate(schema)` middleware và inline `.safeParse()`:
  - `auth.routes.ts` dùng `validate()` (4/6).
  - `dashboard-product.routes.ts` dùng inline `.safeParse()` 100%.
  - `admin-fb-config.routes.ts` không có `validate()` middleware nhưng có inline check.
- **Fix:** Chốt 1 pattern. Khuyên dùng `validate()`/`validateQuery()` middleware để đồng nhất + tự động return 400.

### P2-7. One-time scripts không xoá sau khi chạy
Các scripts trong `scripts/` không còn referenced trong `package.json`:
- `assign-okr-owners.ts`
- `backfill-ae.ts`, `backfill-lead-type.ts` (đã có successor `backfill-crm-leads.ts`, `backfill-lead-source.ts`)
- `fix-sprints-scopes.ts`
- `seed-sprints.ts`, `seed-user-crm-employee-id.ts`, `seed-users.ts`
- `seed-weekly-reports.ts` (**860 LOC!**)
- `seed-workitems.ts`, `sync-fb-historical.ts`, `verify-tasks.ts`

Tổng ~3.000 LOC scripts một lần.
- **Fix:** Move sang `scripts/archive/` hoặc xoá hẳn (git history vẫn giữ). Decision: nếu đã chạy production xong và không còn cần re-run → xoá.

### P2-8. `prisma/dev.db` legacy SQLite (52 KB)
- File SQLite từ thời prototype, project hiện dùng Postgres Docker.
- Đã trong `.gitignore` nhưng vẫn tồn tại trên disk.
- **Fix:** `rm prisma/dev.db`.

### P2-9. Test coverage thấp
- Chỉ 4 test files: 3 cho posthog services + 1 cho `formatters`.
- Không có integration test cho routes, không có test cho auth flow, không có e2e.
- **Fix:** Chấp nhận debt cho internal tool, nhưng nên có **smoke test cho auth flow** (login + TOTP + sliding session) vì đây là security-critical.

---

## 5. Findings — Severity P3 (Low)

### P3-1. `metadata.json` không rõ purpose
```json
{ "name": "SMIT OS", "description": "...", "requestFramePermissions": [] }
```
- Có vẻ là di sản từ Codespaces/devcontainer template. Không thấy ai đọc file này trong code.
- **Fix:** Xoá nếu không có tooling cần.

### P3-2. `.DS_Store` ở `plans/` và `plans/reports/`
- Có trong `.gitignore` nên không vào git, nhưng làm lộn `ls`.
- **Fix:** `find . -name ".DS_Store" -delete`.

### P3-3. `console.log` không có structured logger (85 lần ở server/)
- Mỗi `console.log` đi vào stdout không có level, timestamp, requestId.
- Production khó filter/aggregate.
- **Fix:** Dài hạn dùng Pino/Winston. Ngắn hạn ít nhất prefix `[module-name]` (đã làm 1 phần).

### P3-4. Error handler trả `stack` ở dev mode
```ts
res.status(500).json({
  error: "Internal server error",
  ...(isDev && { message: err.message, stack: err.stack })
});
```
- OK ở dev. Production check bằng `NODE_ENV !== 'production'` → đúng.
- **Note:** Đảm bảo `NODE_ENV=production` được set khi deploy. Hiện chưa thấy file launch script (vừa xoá).

### P3-5. Top file size lớn
- `src/pages/OKRsManagement.tsx` — 1.544 LOC
- `src/pages/DailySync.tsx` — 937 LOC
- `src/pages/ProductBacklog.tsx` — 711 LOC
- Vượt rule "200 LOC" trong `development-rules.md`.
- **Fix:** Refactor thành sub-components + custom hooks. Không khẩn cấp nhưng technical debt cao.

### P3-6. Cookie `secure: false` ở dev
- `server/lib/cookie-options.ts:5`: `secure: process.env.NODE_ENV === 'production'`
- OK pattern. Chỉ cần đảm bảo production deploy đúng `NODE_ENV`.

### P3-7. CRM_DATABASE_URL example dùng `reader:pass`
- `.env.example:18`: `CRM_DATABASE_URL="postgresql://reader:pass@100.114.94.34:12112/crm_replica"`
- IP nội bộ (Tailscale `100.x.x.x`) lộ ở example. Không nguy hiểm cho external nhưng có thể mask.
- **Fix:** Đổi example IP thành `<crm-host>` placeholder.

---

## 6. Positives — đã làm tốt

- ✅ JWT_SECRET length validation enforced (min 32 chars in production)
- ✅ TOTP encryption AES-256-GCM với auth tag
- ✅ Bcrypt password hashing (cost 10)
- ✅ Rate limiting auth routes (10/15min) + general API (200/min)
- ✅ Cookies `httpOnly` + `sameSite: 'strict'` + `secure` (prod)
- ✅ Sliding session refresh < 1h remaining
- ✅ Atomic optimistic lock cho backup code consumption (BUG-004 fix)
- ✅ Không có raw SQL — toàn bộ qua Prisma typed queries
- ✅ Không có file upload endpoints (giảm attack surface)
- ✅ Không có `dangerouslySetInnerHTML` ở client
- ✅ Không có `eval()`/`new Function()`
- ✅ Helmet enabled (XSS-Protection, X-Content-Type-Options, etc.)
- ✅ CORS whitelist origins
- ✅ TOTP temp token (`purpose: 'totp-pending'`) chỉ valid 5 min
- ✅ `.env` không từng bị commit (verified qua `git log`)
- ✅ `.gitignore` đầy đủ (`.env*`, `CREDENTIALS.md`, `repomix-output.xml`, `dist/`, `logs/`, `prisma/dev.db`)

---

## 7. Recommendations — thứ tự ưu tiên

### Bước 1 — Khẩn cấp (làm ngay hôm nay)
1. **Rotate CRM password** `quan_coo_crm` (P0-1).
2. `chmod 600 .env` (P0-1).
3. Xoá `com.smitos.server.plist` (P0-2).

### Bước 2 — Trong tuần (high impact, low risk)
4. `npm audit fix` (P1-2).
5. Remove `@google/genai`, `posthog-node` deps (P1-3).
6. Cleanup 71 worktrees `.claude/worktrees/` (P1-1).
7. Xoá `logs/launchagent*.log`, `logs/startup.log`, `prisma/dev.db`, `metadata.json` (P1-5, P2-8, P3-1).
8. Switch CSP từ `reportOnly` → enforce ở production (P1-4) — **cần test cẩn thận**.

### Bước 3 — Sprint refactor (1-2 tuần)
9. Move/xoá one-time scripts trong `scripts/` (P2-7).
10. Chốt naming convention components, refactor `src/components/ui/` (P2-2).
11. Consolidate type duplication client/server (P2-1).
12. Đồng nhất validation pattern routes (P2-6).
13. Cleanup dead exports với ts-prune (P2-5).

### Bước 4 — Technical debt dài hạn
14. Refactor pages > 500 LOC (P3-5).
15. Structured logger (Pino) thay console.log (P3-3).
16. Smoke test cho auth flow (P2-9).
17. Reduce `any` usage từ 140 → mục tiêu < 30 (P2-4).

---

## 8. Câu hỏi chưa giải quyết

1. **CSP enforce production**: Có đủ confidence các inline styles/scripts từ Vite + Material Symbols + Google Fonts đều compliant CSP strict? Cần manual test trước khi flip.
2. **One-time scripts**: User muốn keep `scripts/seed-weekly-reports.ts` (860 LOC) làm reference không, hay xoá hẳn? Git history giữ được nhưng dễ quên.
3. **Worktrees lock state**: Có worktree nào đang chứa work-in-progress chưa merge không? Trước khi force remove cần `git worktree list` + check nếu có branch chưa merge.
4. **`prisma/seeds/lead-status-mapping.seed.ts` + `seed-w2s2-reports.ts`** trong `prisma/seeds/`: chỉ `lead-status-mapping` được reference trong `package.json`. `seed-w2s2-reports.ts` orphan?
5. **`logs/dev-server.log`** có cần keep history không, hay rotate định kỳ?
6. **Cloudflare Tunnel**: Tunnel exposes `qdashboard.smitbox.com` → `localhost:3000`. Cloudflare Access policy đã set chưa (chỉ cho team email)? Nếu chưa, anyone biết domain đều reach được login page.
