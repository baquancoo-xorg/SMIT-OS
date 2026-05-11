# Brainstorm: SMIT-OS Codebase Cleanup (Medium)

**Date:** 2026-05-12 00:52 (Asia/Saigon)
**Type:** Cleanup / Tech debt reduction
**Owner:** dominium
**Status:** Approved — chuyển plan

---

## 1. Problem statement

SMIT-OS gốc build cho task management (OKRs, weekly check-in, kanban...). Hiện tại scope thu hẹp: **xem Dashboard từ CRM DB + ads data + lưu báo cáo hàng ngày**. Sắp thêm 1 sidebar item duy nhất: **Quản lý dòng tiền thu/chi/tồn** (nhập tay).

Codebase còn nhiều di sản từ thời task mgmt: deps không dùng, Storybook full-stack, Google Sheets export, model DB không query. Yêu cầu: dọn để **nhẹ hơn, mượt hơn, dễ maintain**.

## 2. Constraints (anh đã quyết)

- Giữ TẤT CẢ 7 sidebar items (Dashboard, OKRs, Daily Sync, Weekly Check-in, Lead Tracker, Media Tracker, Ads Tracker) + Settings + Profile
- Giữ daily report 4-field + admin approval flow
- Giữ auth full (multi-user + role + 2FA TOTP + Google OAuth Login + JWT 24h)
- Cleanup depth: **Medium** (drop feature + DB models không dùng + remove routes/services)
- BỎ Storybook hoàn toàn
- BỎ Google Sheets export hoàn toàn
- Cashflow: nhập tay (CRUD đơn giản), plan riêng sau
- KHÔNG ĐỘNG vào LeadAuditLog (giữ cho an toàn)

## 3. Approaches evaluated

| # | Approach | Pros | Cons | Verdict |
|---|---|---|---|---|
| A | Light: chỉ gỡ unused deps | Rủi ro thấp nhất, 1-2 ngày | Vẫn còn rác sheets export + storybook. Cảm giác "nhẹ hơn" không rõ | Reject — không đạt mục tiêu |
| B | **Medium: drop domain + orphan + deps** | Cắt sạch domain rõ ràng, low risk, đo lường được kết quả | 3-5 ngày, 1 migration | **Chọn** |
| C | Aggressive: tái cấu trúc (đọc thẳng CRM read-replica, bỏ separate DB) | Đơn giản hóa architecture | 1-2 tuần, rủi ro cao, không justified cho 1 user | Reject — over-engineering |

## 4. Final solution

### Tier 1 — SAFE drop (ngày 1)

**Storybook stack:**
- Xoá `.storybook/`, `storybook-static/`
- Xoá 18 file `*.stories.tsx` trong `src/components/ui/` và `src/components/layout/`
- Bỏ scripts: `storybook`, `build-storybook`
- Gỡ devDeps: `storybook`, `@storybook/react-vite`, `@chromatic-com/storybook`, `@storybook/addon-vitest`, `@storybook/addon-a11y`, `@storybook/addon-docs`, `@storybook/addon-onboarding`, `vitest`, `playwright`, `@vitest/browser-playwright`, `@vitest/coverage-v8` (11 devDeps)

**Unused runtime deps (verified 0 import):**
- `motion`
- `@xyflow/react`
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- `@headlessui/react`

### Tier 2 — Sheets export domain (ngày 2)

**Files xoá:**
- `server/routes/sheets-export.routes.ts`
- `server/routes/google-oauth.routes.ts` (chỉ phục vụ sheets, KHÔNG phải Google OAuth login — login dùng path khác cần verify)
- `server/services/sheets-export.service.ts` + thư mục `services/sheets-export/extractors/`
- `server/services/google-oauth.service.ts`
- `server/jobs/sheets-export-scheduler.ts`
- `src/components/settings/sheets-export-tab.tsx`

**Code edit:**
- `server.ts`: bỏ import + mount của sheets/google-oauth routes; bỏ `initSheetsExportScheduler`; bỏ `createGoogleOAuthService`
- `src/pages/Settings.tsx`: bỏ tab Sheets Export

**DB migration (drop tables):**
- `GoogleIntegration` → `google_integrations`
- `SheetsExportRun` → `sheets_export_runs`

**Deps gỡ:**
- `googleapis`
- `google-auth-library`

**⚠️ Verify trước khi drop `google-oauth.service.ts`:** Auth flow Google OAuth Login (nếu có) có thể dùng service này. Nếu có, tách logic login khỏi sheets logic.

### Tier 3 — Orphan model verified (ngày 3, migration cẩn thận)

| Model | Action |
|---|---|
| `EtlErrorLog` (0 query) | Drop table + remove model |
| `LeadAuditLog` | **GIỮ NGUYÊN** (anh quyết bỏ qua) |

### Tier 4 — Housekeeping (ngày 3)

- `logs/`, `dist/`, `storybook-static/` → đảm bảo trong `.gitignore`, `rm -rf` local
- `DATABASE.md` (1.2KB ở root) → move vào `docs/`
- `plans/` folder: archive plans cũ >30 ngày (hoặc rút gọn)
- `scripts/`: review 11 backfill/seed một lần đã chạy → archive vào `scripts/archive/` nếu chưa có
- Remove `package.json` scripts không dùng (`db:seed-exchange`, `db:seed-okrs` nếu seed một lần đã xong)

### Tier 5 — KHÔNG ĐỘNG (scout từng claim sai)

Các model sau **ĐỀU CÓ query trong code**, KHÔNG drop:
- `FbAdAccountConfig`, `RawAdsFacebook` — dashboard ad-spend + fb-sync
- `AdCampaign`, `AdSpendRecord` — ads-tracker
- `MediaPost` — media-tracker
- `Notification` — alert-scheduler + approve flow
- `LeadSyncRun`, `LeadStatusMapping` — CRM lead sync
- `ExchangeRateSetting` — currency-converter
- `OkrCycle` — okr-cycle.routes + nhiều chỗ

## 5. Implementation considerations & risks

### Risks

| Risk | Mitigation |
|---|---|
| Drop file/model còn reference → app down | Mỗi tier 1 commit + chạy `npm run typecheck` sau từng commit |
| Migration drop table không thể rollback dữ liệu | Backup DB trước migration: `pg_dump` |
| `google-oauth.service.ts` bị Login OAuth dùng | Verify by grep import trước khi xoá; tách logic nếu cần |
| Production tunnel `qdashboard.smitbox.com` đang chạy | Test trên local trước khi push; rollback ready |
| Hot-reload daemon (`com.smitos.dev`) chạy liên tục | OK — hot-reload sẽ catch lỗi import sớm |

### Quy trình thi hành (mandatory)

1. Branch `chore/cleanup-medium` từ `main`
2. **Backup DB**: `docker exec smit_os_db pg_dump -U postgres smitos_db > backup-260512.sql`
3. Tier 1 → commit "chore: drop storybook + unused frontend deps"
4. `npm run typecheck` PASS
5. `npm run dev` + smoke test 7 sidebar pages
6. Tier 2 → commit "chore: drop sheets export domain"
7. `npm run typecheck` PASS + smoke test Settings
8. Tier 3 → migration `npx prisma migrate dev --name cleanup-orphan-models`
9. Verify DB studio, smoke test 1 lần nữa
10. Tier 4 → commit "chore: housekeeping"
11. PR review (self) → merge `main`

## 6. Success metrics

| Metric | Before | Target |
|---|---|---|
| `package.json` deps + devDeps count | 23 + 24 = 47 | ~38 (giảm ~20%) |
| `node_modules` size | ? GB | giảm ≥200MB |
| Frontend bundle gzipped | ? | giảm ≥150KB (motion + dnd-kit + xyflow + headlessui) |
| Prisma models | 20 | 17 (drop 3) |
| Server route files | 22 | 20 |
| Server service files | ~30 | ~25 |
| Production smoke test | 7 pages OK | 7 pages OK (zero regression) |

## 7. Next steps

1. **`/ck:plan`** — chuyển sang plan chi tiết với phases parallel-executable (mỗi tier 1 phase)
2. **Plan riêng sau cleanup**: cashflow feature (sidebar + 2 model + 1 route + 1 page) — KHÔNG trộn vào cleanup này
3. Update `docs/system-architecture.md` sau khi merge

## 8. Open questions

- `google-oauth.service.ts` có dùng cho login Google không? → verify khi vào plan/implement
- Có cần giữ `node-cron` không nếu drop sheets-export-scheduler? → fb-sync và lead-sync vẫn dùng cron → **giữ**
- Cashflow nên là 1 sidebar item riêng hay tab trong Settings? → quyết khi plan cashflow
