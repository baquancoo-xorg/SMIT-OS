# Phase 01 — Cleanup deps + verify

## Context Links

- Parent: [plan.md](./plan.md)
- Brainstorm: [`plans/reports/brainstorm-260509-1201-node-modules-cleanup.md`](../reports/brainstorm-260509-1201-node-modules-cleanup.md)
- Dependencies: none (single phase)

## Overview

- **Date:** 2026-05-09
- **Description:** Xoá `autoprefixer`, thêm explicit `google-auth-library@^10.6.2`, verify build + dev, commit.
- **Priority:** P3 (hygiene, không blocking feature)
- **Implementation status:** pending
- **Review status:** awaiting user approval

## Key Insights

- `google-auth-library@10.6.2` đã resolved qua `googleapis@171.4.0` — install với range `^10.6.2` để npm dedupe tự động (cùng major + minor → share folder)
- `autoprefixer` không có user thực sự trong dự án. Tailwind v4 dùng Lightning CSS, không cần PostCSS pipeline riêng
- `pino-pretty` & `tailwindcss` LÀ depcheck false positive — KHÔNG động tới (đã verify trong brainstorm)
- Hot reload `tsx watch` sẽ auto-restart sau khi `package.json` thay đổi và `node_modules` re-sync

## Requirements

### Functional
- `package.json` không còn `autoprefixer`
- `package.json` có `google-auth-library` trong `dependencies` với version range `^10.6.2`
- `npm ls google-auth-library` chỉ show 1 version (không duplicate)

### Non-functional
- Build production thành công
- Dev server chạy bình thường, log có format pretty (xác nhận `pino-pretty` còn work)
- Trang dashboard render đầy đủ CSS sau build (xác nhận Tailwind autoprefixing không cần `autoprefixer`)

## Architecture

Không thay đổi architecture. Chỉ là metadata cleanup trong `package.json` + `package-lock.json`.

## Related Code Files

**Modify:**
- `package.json` — remove `autoprefixer`, add `google-auth-library`
- `package-lock.json` — auto-update by npm

**Read for verification:**
- `server/lib/google-sheets-client.ts` — confirm import path không đổi
- `server/lib/logger.ts:32` — confirm `pino-pretty` còn được reference
- `vite.config.ts` — confirm Tailwind plugin config không phụ thuộc autoprefixer

## Implementation Steps

1. **Verify pre-state:**
   ```bash
   npm ls google-auth-library  # expect 10.6.2 via googleapis
   grep autoprefixer vite.config.ts postcss.config.* 2>/dev/null  # expect empty
   ```

2. **Remove autoprefixer:**
   ```bash
   npm uninstall autoprefixer
   ```

3. **Add google-auth-library explicit:**
   ```bash
   npm install google-auth-library@^10.6.2
   ```

4. **Verify dedupe:**
   ```bash
   npm ls google-auth-library
   # Phải show duy nhất 1 version, hoặc multiple "deduped"
   ```

5. **Test build:**
   ```bash
   npm run build
   ```

6. **Test dev:**
   ```bash
   npm run dev
   # Mở browser → kiểm tra log có color/pretty + Tailwind CSS render đúng
   # Kill khi xong
   ```

7. **Verify depcheck:**
   ```bash
   npx depcheck --json | python3 -c "import json,sys;d=json.load(sys.stdin);print('unused:',d['dependencies'],d['devDependencies']);print('missing:',list(d['missing'].keys()))"
   # Expect: autoprefixer KHÔNG còn trong unused, google-auth-library KHÔNG còn trong missing
   ```

8. **Commit:**
   ```bash
   git add package.json package-lock.json
   git commit -m "chore(deps): remove unused autoprefixer, add explicit google-auth-library"
   ```

## Todo List

- [ ] Step 1 — Verify pre-state
- [ ] Step 2 — `npm uninstall autoprefixer`
- [ ] Step 3 — `npm install google-auth-library@^10.6.2`
- [ ] Step 4 — Verify no duplicate version
- [ ] Step 5 — `npm run build` passes
- [ ] Step 6 — `npm run dev` runs, log pretty + CSS render
- [ ] Step 7 — depcheck clean cho 2 finding
- [ ] Step 8 — Commit

## Success Criteria

Mapping từ brainstorm report section 6:

- [ ] `npm run build` thành công
- [ ] `npm run dev` chạy, log có format pretty
- [ ] Trang dashboard render đầy đủ CSS
- [ ] `google-auth-library` xuất hiện trong `dependencies` của `package.json`
- [ ] `npx depcheck` không còn báo "missing google-auth-library"
- [ ] Git commit duy nhất, message conventional format

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Tailwind v4 + Lightning CSS thực ra vẫn cần autoprefixer cho old browsers | Low | Medium | Test build + visual check trang chính. Nếu vỡ → revert + thêm postcss config |
| `google-auth-library@^10.6.2` conflict với version internal mà `googleapis` cần | Very low | Low | `npm ls` sau install. Nếu duplicate → pin exact version |
| `npm uninstall` xoá nhầm transitive deps đang dùng | Very low | Medium | Lockfile + `npm run build` sẽ catch ngay |
| Hot reload (`tsx watch`) không pick up package.json change | Low | Low | Restart manually nếu cần |

## Security Considerations

- Giảm 1 package = giảm 1 surface attack
- Khai báo explicit `google-auth-library` → có thể audit độc lập, không bị "hidden upgrade" khi `googleapis` thay internal dep
- Không có credential / secret thay đổi

## Next Steps

- Sau commit thành công → có thể follow-up brainstorm cho 18 outdated packages (out of scope của plan này)
- Cân nhắc thêm CI step chạy `npx depcheck` để catch phantom dep tự động trong tương lai (separate plan)

## Unresolved Questions

Không có. Plan rõ ràng, đã verify mọi assumption ở brainstorm phase.
