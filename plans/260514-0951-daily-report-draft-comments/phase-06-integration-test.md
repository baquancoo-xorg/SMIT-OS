# Phase 06 — Integration Testing + UI Compliance Audit

## Context links
- Parent: [plan.md](plan.md)
- Depends on: All prior phases
- UI contract: `docs/ui-design-contract.md`
- Code standards: `docs/code-standards.md`

## Overview
- **Date:** 2026-05-14
- **Priority:** P1
- **Description:** End-to-end manual test toàn bộ flow + UI compliance audit + cleanup trước khi merge.
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- Test trên cả light + dark mode bắt buộc.
- Test incognito để verify localStorage SecurityError fallback.
- Verify SQL: `SELECT * FROM "DailyReportComment"` để confirm soft delete giữ record.
- Notification record check: `SELECT * FROM "Notification" WHERE type LIKE 'DAILY_REPORT_COMMENT%'`.

## Requirements
- 10 success criteria từ brainstorm phải pass.
- File size + UI compliance + lint pass.

## Test scenarios

### A. Draft autosave (E2E manual)
1. Mở `/daily-sync` → click "Báo cáo hôm nay" → form dialog mở.
2. Gõ vào 4 textarea → đợi 1s → status indicator hiển thị "Đã lưu nháp lúc HH:mm".
3. Click outside dialog → dialog đóng.
4. Click "Báo cáo hôm nay" lại → banner "Đã khôi phục bản nháp lúc HH:mm" + 4 textarea prefill đúng.
5. Click "Lưu nháp" → toast "Đã lưu bản nháp tạm".
6. Reload tab → mở lại form → vẫn còn draft.
7. Click "Xóa nháp" trên banner → form reset, banner biến mất, localStorage key biến mất (verify DevTools).
8. Gõ lại → submit → 201 → mở form ngày mai → form sạch.
9. **Incognito test**: mở incognito → `/daily-sync` → form vẫn mở, KHÔNG có draft indicator, gõ + submit OK.

### B. Comment thread (E2E manual với 2 user)
1. **User A (employee)** submit report.
2. **User B (admin)** mở detail modal của report A → tab "Trao đổi" → composer.
3. B comment "Cần làm rõ blocker X" → optimistic xuất hiện ngay → server response replace.
4. A nhận notification (check notification bell).
5. A mở detail modal → thấy comment B → reply "OK đã làm rõ".
6. B nhận notification reply.
7. A hover comment của A → nút Edit + Delete xuất hiện.
8. A click Edit → textarea inline → sửa → Save → comment update + badge "(đã sửa)".
9. A click Delete → confirm → comment → text xám "[Bình luận đã bị xóa]".
10. **DB verify**: `SELECT id, body, "editedAt", "deletedAt" FROM "DailyReportComment" WHERE "reportId" = '...' ORDER BY "createdAt"` → record A vẫn còn, `deletedAt` set.

### C. Permission edge cases
- User C (employee khác, không phải owner) thử mở detail modal của report A qua URL trực tiếp → API GET comments trả 403.
- User C thử POST comment → 403.
- User A thử PATCH comment của B → 403.
- B (admin) PATCH/DELETE comment của A → success.

### D. UI compliance audit (cite contract sections)
- §primary-cta: Grep `bg-orange` `bg-amber` `bg-brand-500` trong code mới — confirm CHỈ xuất hiện ở `Button variant="primary"` template (dark gradient + orange beam + icon), KHÔNG fill solid.
- §card-radius: Inspect DevTools dialog + cards → `border-radius: 1.5rem` (dark) / `0.75rem` (light).
- §input-radius: Inspect textarea → `border-radius: 1rem` (dark) / `0.75rem` (light).
- §accent-canonical: Grep `#` (hex) trong code mới — confirm chỉ ở comment hoặc gradient stop, accent dùng `var(--brand-500)`.
- §suspense-data: CommentThread + report list bọc `<Suspense>`. Confirm Skeleton fallback render khi throttled network.
- §parity: Toggle dark mode → tất cả component render đúng, không bị invisible text / wrong contrast.

### E. File size + lint
- `find src/pages/v5/DailySync.tsx src/components/v5/execution server/routes/daily-report-comment.routes.ts server/schemas/comment.schema.ts src/lib/draft-storage.ts src/hooks/use-draft-autosave.ts src/hooks/use-daily-report-comments.ts -name "*.ts*" | xargs wc -l` → mọi file <200 LOC.
- `npm run lint` pass (no new errors).
- `npx tsc --noEmit` pass.

## Related code files
- All files từ Phase 1–5 (no new code in this phase, ONLY testing + audit + small fixes if found)

## Implementation Steps
1. Spin up dev: verify `npm run daemon:status` running hoặc `npm run dev`.
2. Run scenario A (single user, light mode) → ghi note bug nếu có.
3. Run scenario A (single user, dark mode).
4. Run scenario A (incognito).
5. Run scenario B (cần 2 browser session: regular + incognito để giả 2 user).
6. Run scenario C (permission edges) qua curl/Postman.
7. UI audit D — checklist từng item, screenshot nếu cần.
8. Run E checks (file size, lint, typecheck).
9. Nếu có bug → fix → re-test phase đó.
10. Update `docs/codebase-summary.md` với feature mới (1-2 dòng dưới Daily Sync section).
11. Update `docs/development-roadmap.md` + `docs/project-changelog.md` (theo documentation-management rule).

## Todo list
- [ ] Scenario A pass (light)
- [ ] Scenario A pass (dark)
- [ ] Scenario A pass (incognito)
- [ ] Scenario B pass (2 users + notifications)
- [ ] Scenario C pass (permission 403)
- [ ] Scenario D UI compliance audit pass (cite §sections)
- [ ] Scenario E file size <200 LOC + lint + typecheck pass
- [ ] Bugs found logged + fixed + re-tested
- [ ] `docs/codebase-summary.md` updated
- [ ] `docs/development-roadmap.md` + `docs/project-changelog.md` updated
- [ ] Commit message conventional + no AI ref

## Success Criteria
- 10 brainstorm success criteria pass.
- Zero lint error mới, zero type error.
- UI compliance audit ✅ cho 6 section.
- Soft delete record giữ trong DB, audit trail nguyên vẹn.
- Notification fire đúng + dedupe đúng.

## Risk Assessment
| Risk | Mức | Mitigation |
|---|---|---|
| Bug late-found buộc rework phase trước | Trung bình | Test sớm sau mỗi phase, không dồn cuối |
| Solid orange lọt qua | Cao | Grep `bg-orange|bg-amber|bg-brand-500` trên CTA paths |
| File phình lớn >200 LOC sau edit | Trung bình | `wc -l` mỗi file, extract sub-component nếu vượt |
| Notification dedupe sai | Trung bình | SQL verify count notification record cho 1 reply |

## Security Considerations
- Confirm 403 cho non-owner-non-admin trên cả GET + POST + PATCH + DELETE.
- Confirm `dangerouslySetInnerHTML` KHÔNG xuất hiện trong code mới: `grep -r 'dangerouslySetInnerHTML' src/components/v5/execution/`.
- Confirm Zod validate body length ở server (không trust client).

## Next steps
- Merge vào main + deploy.
- Optional follow-up:
  - Weekly Report cùng pattern (out of scope v1.1)
  - DB-synced draft (cross-device) nếu user feedback cần
  - Comment edit history tracking nếu audit yêu cầu
