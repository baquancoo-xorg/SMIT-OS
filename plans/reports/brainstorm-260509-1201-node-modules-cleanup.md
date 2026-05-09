# Brainstorm Report — node_modules Cleanup

**Ngày:** 2026-05-09
**Trigger:** User hỏi "có folder nào thừa trong node_modules?"
**Phương pháp:** depcheck + verify thủ công (grep import sites, đọc config)

## 1. Problem Statement

User quan sát node_modules có rất nhiều folder, nghi ngờ có dư thừa. Cần xác định:
- Vì sao nhiều thế?
- Có package nào khai báo nhưng không dùng?
- Có dependency nào dùng nhưng không khai báo?

## 2. Findings

### 2.1 Số liệu cơ bản

| Metric | Value |
|---|---|
| Direct dependencies (package.json) | 46 |
| Total folders trong node_modules | 349 |
| Tỷ lệ phình | 1 direct → ~7 transitive |
| Lockfile | có |

**Kết luận:** Số 349 là **bình thường** với npm flat install. 46 direct deps gồm full-stack React 19 + Express 5 + Prisma + Vite + Tailwind v4 + googleapis + recharts (D3 ecosystem) + motion + …. Tất cả đều phục vụ feature thật.

### 2.2 depcheck output

**Unused declared:**
- `autoprefixer` (devDep)
- `pino-pretty` (devDep)
- `tailwindcss` (devDep)

**Missing (used but undeclared):**
- `@shared/types`
- `google-auth-library`

### 2.3 Verify thủ công

| Package | Verdict | Bằng chứng |
|---|---|---|
| `autoprefixer` | **THỪA THẬT** | Tailwind v4 + `@tailwindcss/vite` dùng Lightning CSS, có built-in autoprefixing. Project không có `postcss.config*` |
| `pino-pretty` | False positive | `server/lib/logger.ts:32` — `target: 'pino-pretty'` (Pino nạp dynamic) |
| `tailwindcss` | False positive | Peer dep của `@tailwindcss/vite`; cần khai báo explicit |
| `@shared/types` | False positive | Path alias trong `tsconfig.json` (`@shared/*` → `./shared/*`) |
| `google-auth-library` | **PHANTOM DEP** | Import tại `server/lib/google-sheets-client.ts:2`, kéo qua `googleapis`; chưa khai báo |

## 3. Approaches Evaluated

### Approach A — Không làm gì
- **Pros:** Zero risk
- **Cons:** Phantom dep tiềm ẩn break khi `googleapis` major bump; `autoprefixer` gây hiểu lầm next dev tưởng có postcss pipeline

### Approach B — Chỉ xoá `autoprefixer`
- **Pros:** Sạch hơn 1 chút
- **Cons:** Bỏ qua phantom dep — vấn đề lớn hơn

### Approach C (CHỌN) — Xoá `autoprefixer` + thêm explicit `google-auth-library`
- **Pros:** Giải quyết cả 2 finding; package.json honest; đề kháng future regression
- **Cons:** Cần test build + dev server sau khi đổi để xác nhận không vỡ

## 4. Recommended Solution

1. `npm uninstall autoprefixer`
2. `npm install google-auth-library` (kiểm tra version đang được resolved qua `googleapis` trước, để tránh duplicate)
3. Chạy `npm run build` + `npm run dev` để verify
4. Commit duy nhất: `chore(deps): remove unused autoprefixer, add explicit google-auth-library`

## 5. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Xoá `autoprefixer` làm vỡ Tailwind output | Test `npm run build` + visual check trên trang chính |
| `google-auth-library` version mới khác với version `googleapis` đang dùng | `npm ls google-auth-library` trước install, chọn cùng major |
| `pino-pretty` bị xoá nhầm trong tương lai do tin depcheck | Để comment trong package.json hoặc thêm vào depcheck ignore list |

## 6. Success Criteria

- [ ] `npm run build` thành công
- [ ] `npm run dev` chạy, log có format pretty (xác nhận pino-pretty còn work)
- [ ] Trang dashboard render đầy đủ CSS (xác nhận Tailwind autoprefixing không cần autoprefixer)
- [ ] `google-auth-library` xuất hiện trong `dependencies` của package.json
- [ ] `npx depcheck` không còn báo "missing google-auth-library"

## 7. Out of Scope

- 18 outdated packages (`npm outdated`) — vấn đề bảo trì khác, brainstorm riêng
- Bundle production size — chưa đo, có thể follow-up sau
- Duplicate version analysis (`npm dedupe`) — chưa cần, không có finding cụ thể
- Migrate Tailwind v4 → v5 hoặc upgrade Vite/Prisma — out of scope

## 8. Next Steps

→ Chuyển sang `/ck:plan` để tạo phase file thực thi.
