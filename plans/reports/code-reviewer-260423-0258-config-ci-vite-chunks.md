## Code Review Summary

### Scope
- Files: `/Users/dominium/Documents/Project/SMIT-OS/package.json`, `/Users/dominium/Documents/Project/SMIT-OS/vite.config.ts`
- LOC: ~+19/-0 (config-focused)
- Focus: Recent config changes only (runtime/CI correctness)
- Scout findings:
  - `test` script currently returns success with 0 tests in repo.
  - `manualChunks` strategy creates very high vendor chunk count and emits empty chunks.

### Overall Assessment
Mục tiêu chuẩn hóa script và giảm warning bundle size đã đạt một phần, nhưng có rủi ro “CI xanh giả” ở test và rủi ro runtime từ over-splitting chunks.

### Critical Issues
- Không thấy lỗi bảo mật/blocker trực tiếp trong diff được review.

### High Priority
1. **Test có thể pass dù không chạy gì (CI false confidence).**
   - Evidence: `npm run test` -> `tests 0`, `suites 0`, exit success.
   - Impact: Pipeline có thể báo xanh dù thực tế không có test coverage.

2. **Pattern test quá hẹp, dễ bỏ sót test hợp lệ.**
   - Hiện chỉ match `**/*.test.ts` trong `src/server/scripts`.
   - Bỏ sót phổ biến: `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`.
   - Impact: Test tồn tại nhưng không được chạy => regression lọt production.

3. **`manualChunks` đang tạo quá nhiều chunks (chunk explosion).**
   - Evidence: build output có ~68 vendor chunks.
   - Impact runtime: tăng số file request + parse/metadata overhead, có thể làm chậm cold load và tăng độ phức tạp cache invalidation.

### Medium Priority
1. **Có empty chunks được emit bởi cấu hình split hiện tại.**
   - Evidence: `Generated an empty chunk: "vendor-motion"`, `vendor-swc-helpers`, `vendor-tanstack-virtual-core`, `vendor-tabbable`.
   - Impact: không crash nhưng tăng nhiễu build output và artifact noise.

2. **`lint` và `typecheck` đang trùng lặp hoàn toàn (`tsc --noEmit`).**
   - Impact: tăng thời gian CI/local mà không tăng tín hiệu chất lượng.

### Low Priority
1. **Naming chunk theo package-level có thể thiếu ổn định dài hạn** khi dependency graph thay đổi (nhiều chunk rất nhỏ).

### Edge Cases Found by Scout
- Repo hiện chưa có test file theo pattern mới => test pass 0-case.
- Khi team thêm test frontend `.tsx` hoặc dùng hậu tố `.spec`, CI vẫn có thể pass mà không chạy test đó.
- Với dependency tree lớn, package-per-chunk dễ tạo thêm chunk rỗng và chunk siêu nhỏ.

### Positive Observations
- Build hiện chạy thành công, không còn warning “chunk > 500kB” trong lần verify này.
- Không thấy breaking change với runtime server scripts.
- `typecheck` script rõ nghĩa cho local/CI.

### Recommended Actions
1. **(High)** Quy định rõ policy cho 0 tests trong CI (fail hoặc allow có điều kiện), tránh xanh giả.
2. **(High)** Mở rộng pattern test để không bỏ sót (`.test.tsx`, `.spec.ts`, `.spec.tsx`) hoặc dùng discovery strategy nhất quán.
3. **(High)** Điều chỉnh `manualChunks` theo nhóm thư viện lớn thay vì package-per-chunk để giảm số chunk nhỏ.
4. **(Medium)** Gộp/định nghĩa lại vai trò `lint` vs `typecheck` để tránh chạy duplicate.

### Metrics
- Type Coverage: N/A (không có công cụ coverage type riêng trong thay đổi này)
- Test Coverage: 0 suites executed (theo run hiện tại)
- Linting Issues: 0 (theo `tsc --noEmit`)
- Build Warnings: 4 empty chunks

### Unresolved Questions
1. CI mong muốn **fail** hay **allow** khi repo chưa có test?
2. Team chuẩn naming test chuẩn nào (`*.test.*` hay `*.spec.*`)?
3. Mục tiêu tối ưu bundle là giảm warning build hay tối ưu TTI/network thực tế (RUM)?
