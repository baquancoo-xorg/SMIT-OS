# Phase 04 — v5 Components (Form Dialog, Detail Modal, Comment Thread)

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [phase-03-client-lib-hooks.md](phase-03-client-lib-hooks.md) (hooks + lib)
- v5 primitives: `src/components/v5/ui/` (FormDialog, Modal, Button, Input, Card, EmptyState, Skeleton, PageHeader, TabPill, NotificationToast)
- UI contract: `docs/ui-design-contract.md` (cite §primary-cta, §input-radius, §card-radius, §accent-canonical, §suspense-data, §parity)
- Reference v5 pattern: `src/pages/v5/AdsTracker.tsx`

## Overview
- **Date:** 2026-05-14
- **Priority:** P1
- **Description:** Tạo 5 component v5 trong `src/components/v5/execution/` cho form dialog (+draft), detail modal, comment thread + item, draft restored banner.
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- Composition over inheritance: form-dialog, detail-modal, thread, item là 4 component độc lập, mỗi cái <200 LOC.
- Reuse 100% v5 primitives — KHÔNG tạo button/modal/input mới.
- UI compliance gắt: cite contract section cho từng component trong code comment header.
- Comment body render plain text + line breaks (`whitespace-pre-wrap`), KHÔNG markdown để tránh XSS surface.

## Requirements
- Functional:
  - Form dialog với 4 textarea + draft banner + Lưu nháp button + status indicator
  - Detail modal với report preview + ApprovalPanel (giữ nguyên approvalComment cũ) + CommentThread
  - CommentThread fetch list + composer + handle empty state
  - CommentItem render author + body + (đã sửa) badge + edit/delete inline (hover)
  - DraftRestoredBanner top of form khi có draft cũ
- Non-functional: Light + dark parity, accessible (aria-label cho icon buttons).

## Architecture

### File 1: `src/components/v5/execution/daily-report-form-dialog.tsx` (~180 LOC)

```tsx
type Props = {
  open: boolean;
  onClose: () => void;
  userId: string;
  reportDate: string; // YYYY-MM-DD
  onSubmitted?: (report: DailyReport) => void;
};
```

Cấu trúc:
- `FormDialog` (v5) với title "Báo cáo hằng ngày", size="lg"
- `useState` form: 4 fields
- `useDraftAutosave({form, userId, date: reportDate})` → `{savedAt, saving, available, flush, clear}`
- On mount: `loadDraft(userId, reportDate)` → nếu có, prefill + show `DraftRestoredBanner`
- Body: 4 textarea (per ui-design-contract §input-radius)
- Status indicator dưới form: "Đã lưu nháp lúc HH:mm" (nếu `available`)
- Footer 3 buttons:
  - `<Button variant="ghost" onClick={() => { flush(); toast.success('Đã lưu bản nháp tạm'); }}>Lưu nháp</Button>`
  - `<Button variant="ghost" onClick={onClose}>Hủy</Button>`
  - `<Button variant="primary" type="submit">Gửi báo cáo</Button>` (dark gradient + orange beam + orange icon per §primary-cta)
- onSubmit: POST `/api/daily-reports` → success → `clear()` → `onSubmitted(report)` → `onClose()`

### File 2: `src/components/v5/execution/draft-restored-banner.tsx` (~40 LOC)

```tsx
type Props = { savedAt: string; onClear: () => void };
```
- Card subtle với border-left `var(--brand-500)`
- Text: "Đã khôi phục bản nháp lúc {format(savedAt, 'HH:mm')}"
- Nút "Xóa nháp" `variant="ghost"` size="sm"
- KHÔNG solid orange

### File 3: `src/components/v5/execution/daily-report-detail-modal.tsx` (~150 LOC)

```tsx
type Props = {
  open: boolean;
  onClose: () => void;
  report: DailyReport | null;
};
```
- `Modal` (v5) size="lg"
- Sections:
  - Header: tên user + ngày + status badge (Review/Approved)
  - 4 readonly text blocks (completed/doing/blockers/plan)
  - `ApprovalDecisionPanel` (inline subcomponent ~30 LOC): hiển thị `approvalComment` cũ + người duyệt + thời gian (giữ nguyên, không touch backend)
  - Divider label "Trao đổi"
  - `<Suspense fallback={<Skeleton lines={3} />}>`
      `<CommentThread reportId={report.id} />`
    `</Suspense>` (per §suspense-data)

### File 4: `src/components/v5/execution/comment-thread.tsx` (~120 LOC)

```tsx
type Props = { reportId: string };
```
- `useDailyReportCommentsQuery(reportId)` (Suspense)
- Loop render `<CommentItem>` (sorted createdAt ASC)
- Empty state: `<EmptyState>Chưa có trao đổi nào.</EmptyState>`
- Composer dưới cùng:
  - textarea + nút Gửi
  - Cmd/Ctrl+Enter submit shortcut
  - `useCreateCommentMutation(reportId)` → onSuccess clear textarea + toast

### File 5: `src/components/v5/execution/comment-item.tsx` (~90 LOC)

```tsx
type Props = { comment: CommentItem; currentUserId: string; isAdmin: boolean };
```
- Layout: avatar + tên + thời gian tương đối (`formatDistanceToNow` from date-fns)
- Body: `<p className="whitespace-pre-wrap">{comment.body}</p>` (escape default React)
- Soft-deleted: `<p className="text-muted">[Bình luận đã bị xóa]</p>` (không show edit/delete)
- Badge "(đã sửa)" inline nếu `editedAt != null`
- Hover (nếu author hoặc admin): nút Edit + Delete inline (icon buttons, ghost)
- Edit mode inline: textarea + Save/Cancel (state local, không phá layout list)

## Related code files
- **New:** `src/components/v5/execution/daily-report-form-dialog.tsx` (~180)
- **New:** `src/components/v5/execution/draft-restored-banner.tsx` (~40)
- **New:** `src/components/v5/execution/daily-report-detail-modal.tsx` (~150)
- **New:** `src/components/v5/execution/comment-thread.tsx` (~120)
- **New:** `src/components/v5/execution/comment-item.tsx` (~90)

## Implementation Steps
1. Tạo folder `src/components/v5/execution/`.
2. Build `draft-restored-banner.tsx` (smallest, no deps) → verify visual.
3. Build `comment-item.tsx` standalone (mock comment data) → verify edit/delete UI.
4. Build `comment-thread.tsx` wrap query + composer + map items.
5. Build `daily-report-form-dialog.tsx` integrate draft hook + banner + submit.
6. Build `daily-report-detail-modal.tsx` compose report preview + ApprovalPanel + Suspense + Thread.
7. Verify từng component trong isolation (storybook-less manual test thông qua page mới ở Phase 5).
8. Check lint + typecheck.

## Todo list
- [ ] `draft-restored-banner.tsx` build + visual check
- [ ] `comment-item.tsx` render + edit/delete inline + edited badge + deleted placeholder
- [ ] `comment-thread.tsx` query + empty state + composer + Cmd+Enter
- [ ] `daily-report-form-dialog.tsx` form + draft autosave + Lưu nháp + restore banner mount
- [ ] `daily-report-detail-modal.tsx` preview + ApprovalPanel + Suspense+Thread
- [ ] Mỗi file <200 LOC
- [ ] Light mode + dark mode visual parity
- [ ] No solid orange CTA (audit visual)
- [ ] `npx tsc --noEmit` pass

## Success Criteria
- Form dialog: gõ → status "Đã lưu nháp lúc..."; click outside → reopen → draft prefill + banner; submit → draft xóa.
- Detail modal: render đúng report; thread load qua Suspense; empty state hiển thị khi chưa comment.
- Comment item: edit/delete hiện khi hover (cho author + admin); "(đã sửa)" badge đúng; soft-delete → placeholder.
- Thread composer: gõ + nút Gửi hoặc Cmd+Enter → comment xuất hiện optimistic.
- UI compliance audit: primary CTA dark gradient + orange beam, radius canon, accent OKLCH, parity OK.

## Risk Assessment
| Risk | Mức | Mitigation |
|---|---|---|
| Component >200 LOC do composition phức tạp | Trung bình | Extract sub-components (ApprovalDecisionPanel, CommentComposer) |
| Solid orange lọt qua review | Cao | Manual visual audit + grep `bg-orange` `bg-brand-500` trong CTA |
| Suspense fallback flash | Thấp | Skeleton match height của thread để tránh layout shift |
| XSS qua comment body | Cao | React tự escape, không dùng `dangerouslySetInnerHTML` |
| Edit comment lúc đang reply (race) | Thấp | invalidate sau mutation đảm bảo cache fresh |

## Security Considerations
- Comment body render qua `{comment.body}` (React escape) hoặc `whitespace-pre-wrap` cho line breaks. KHÔNG `dangerouslySetInnerHTML`.
- Edit/Delete UI gate bằng `isAuthor || isAdmin` ở client, server cũng enforce (defense in depth).

## Next steps
- → Phase 5: v5 Page DailySync
