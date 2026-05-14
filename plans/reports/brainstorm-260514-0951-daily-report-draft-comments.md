---
type: brainstorm
date: 2026-05-14
slug: daily-report-draft-comments
status: approved
target: v5 Daily Sync
---

# Brainstorm — Daily Report v1.1 (Draft + Comments)

## Problem statement

Form báo cáo hàng ngày (`/daily-sync`) thiếu 2 capability:
1. Mất dữ liệu khi click outside dialog hoặc reload tab.
2. Approval chỉ là 1 comment string từ admin; nhân viên không phản hồi được, không có thread.

Target: v5 (page `src/pages/v5/DailySync.tsx` hiện chỉ là re-export → build mới).

## Decisions chốt (qua AskUserQuestion)

| Aspect | Quyết định |
|---|---|
| Draft storage | localStorage client (per userId+date) |
| Autosave trigger | onChange + debounce 500ms |
| Manual button | "Lưu nháp" — `variant="ghost"`, không solid orange |
| Draft cleanup | Submit thành công → xóa |
| Comment model | Thread flat trên report, admin + owner reply nhau |
| Comment perms | Owner OR admin; author + admin có quyền edit/delete |
| Edit/delete | Cho phép edit + soft delete, badge "(đã sửa)" |
| Approval flow | GIỮ NGUYÊN — `approvalComment` cũ tách rời, comments là kênh song song |
| Notification | Reuse `use-notifications.ts` + `server/lib/notifications.ts` |
| Scope | CHỈ Daily; Weekly không trong scope v1.1 |

## Approaches đã đánh giá

| Approach | Verdict | Lý do |
|---|---|---|
| DB `status='Draft'` thay localStorage | Reject | Cross-device không phải requirement, dev cost cao, migration risk. |
| Polymorphic `ReportComment` + enum `ReportType` | Reject | YAGNI — chỉ Daily, không cần forward-compat Weekly. |
| Nested comment (parentId) | Reject | Overkill cho thread 2 người. |
| Update v1 `src/pages/DailySync.tsx` trực tiếp | Reject | Không nhất quán với v5 rebuild đã ship. |
| **Build v5 page mới + localStorage + flat `DailyReportComment`** | **Chốt** | KISS, backward compat, đúng spirit v5. |

## Final solution

### Schema
```prisma
model DailyReportComment {
  id         String      @id @default(cuid())
  reportId   String
  authorId   String
  body       String      @db.Text
  editedAt   DateTime?
  deletedAt  DateTime?
  createdAt  DateTime    @default(now())
  report     DailyReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  author     User        @relation(fields: [authorId], references: [id])
  @@index([reportId, createdAt])
}
```
+ relation ngược trong `DailyReport`: `comments DailyReportComment[]`.

### API mới
- `GET /api/daily-reports/:id/comments` — owner OR admin
- `POST /api/daily-reports/:id/comments` — owner OR admin, body 1..2000
- `PATCH /api/daily-reports/:id/comments/:commentId` — author OR admin
- `DELETE /api/daily-reports/:id/comments/:commentId` — soft delete

### File inventory (12 mới, 5 sửa, ~1220 LOC, mọi file <200 LOC)

**New page:** `src/pages/v5/DailySync.tsx` (180) — replace re-export, pattern bám `AdsTracker.tsx`, có TabPill `[Hôm nay] [Đội nhóm] [Lịch sử]`.

**New components** (`src/components/v5/execution/`):
- `daily-report-form-dialog.tsx` (180) — form + draft restore banner + nút Lưu nháp + status indicator
- `daily-report-detail-modal.tsx` (150) — preview + ApprovalPanel + CommentThread bọc Suspense
- `comment-thread.tsx` (120) — fetch + list + composer
- `comment-item.tsx` (90) — single comment, edit/delete inline
- `draft-restored-banner.tsx` (40)

**New lib/hooks:**
- `src/lib/draft-storage.ts` (60) — safe localStorage wrapper, try/catch SecurityError
- `src/hooks/use-draft-autosave.ts` (50) — debounce 500ms, return `{savedAt, saving, hasDraft}`
- `src/hooks/use-daily-report-comments.ts` (120) — React Query: list + create + update + delete với optimistic update

**New server:**
- `server/routes/daily-report-comment.routes.ts` (140)
- `server/schemas/comment.schema.ts` (20)

**Edit:**
- `prisma/schema.prisma` (+model, +relation)
- `server/lib/notifications.ts` (+`notifyDailyReportComment`, +`notifyDailyReportCommentReply`)
- `server/index.ts` (+mount router)
- `src/hooks/use-notifications.ts` (+2 notification types)
- App.tsx route đã có sẵn — không đụng.

### Draft flow
1. Mở dialog → `loadDraft(userId, todayDate)` → nếu có, prefill form + show banner "Đã khôi phục lúc HH:mm" + nút "Xóa nháp".
2. User gõ → hook debounce 500ms → `saveDraft(...)` → cập nhật `savedAt`.
3. Click outside / reload → state mất nhưng localStorage còn → mở lại restore.
4. Click "Lưu nháp" → force flush + toast "Đã lưu bản nháp tạm".
5. Submit POST 201 → `clearDraft()` trong `onSuccess`.
6. localStorage unavailable (incognito SecurityError) → hook trả `unavailable: true` → ẩn UI draft indicator.

### Comment flow
1. Owner OR admin mở detail modal → GET comments trong Suspense.
2. Composer: textarea + nút Gửi (Cmd/Ctrl+Enter submit).
3. POST → optimistic insert → invalidate query.
4. Notify: admin comment → owner; owner reply → mọi admin đã từng comment (dedupe).
5. Hover comment → nút Edit/Delete nếu là author/admin.
6. Edit: PATCH → response trả `editedAt` → badge "(đã sửa)".
7. Delete: PATCH `deletedAt` (soft) → render "[Bình luận đã bị xóa]" text xám.

## UI compliance (cite docs/ui-design-contract.md)

- §primary-cta: "Gửi báo cáo" = dark gradient + orange beam + orange icon. KHÔNG solid orange.
- §input-radius: textarea + input `1rem` dark / `0.75rem` light.
- §card-radius: dialog + cards `1.5rem` dark / `0.75rem` light.
- §accent-canonical: `var(--brand-500)` OKLCH, không hex hardcode.
- §suspense-data: list comments + reports bọc `<Suspense fallback={Skeleton}>`.
- §parity: light + dark đủ cho mọi component mới.

## Success criteria

1. Click outside dialog → mở lại thấy nguyên data.
2. Reload page → mở dialog → banner "Khôi phục lúc HH:mm" + form đã prefill.
3. Submit thành công → mở lại ngày mai → form sạch.
4. Nút "Lưu nháp" → toast confirmation, status indicator update.
5. Admin comment → owner nhận notification + thread item hiển thị realtime (sau invalidate).
6. Owner reply → mọi admin trong thread nhận notification.
7. Author/admin sửa comment → "(đã sửa)" hiển thị.
8. Soft delete → render "[đã xóa]", record vẫn trong DB.
9. Incognito mode → form vẫn hoạt động, ẩn draft UI.
10. Lint + typecheck pass; mọi file <200 LOC.

## Risk

| Risk | Mức | Mitigation |
|---|---|---|
| localStorage SecurityError (incognito) | Thấp | try/catch silent, ẩn UI |
| Admin sửa comment sau khi owner reply | Trung bình | `editedAt` badge luôn show, có thể thêm `editHistory` JSON sau |
| Notification spam thread dài | Trung bình | Dedupe theo userId, edit/delete không notify |
| Migration prod | Thấp | Chỉ ADD TABLE, zero data alter |

## Next steps

→ Invoke `/ck:plan` để tạo phase plan chi tiết tại `plans/260514-0951-daily-report-draft-comments/`.

Phase order đề xuất:
1. Schema + migration
2. Server: comment routes + schemas + notification helpers
3. Client lib: draft-storage + use-draft-autosave + use-daily-report-comments hooks
4. v5 components: form-dialog, detail-modal, comment-thread, comment-item, draft-restored-banner
5. v5 page: DailySync.tsx (replace re-export) + TabPill
6. Integration testing + UI compliance audit

## Unresolved

Không. Mọi scope đã chốt qua 2 round AskUserQuestion.
