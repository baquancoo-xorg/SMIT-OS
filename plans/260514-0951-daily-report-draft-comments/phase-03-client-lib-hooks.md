# Phase 03 — Client Lib + React Query Hooks

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [phase-02-server-comment-api.md](phase-02-server-comment-api.md) (API contract)
- Reference: `src/hooks/use-ads-tracker.ts` (pattern React Query + mutation + invalidate)
- Reference: `src/hooks/use-notifications.ts` (notification types extension)

## Overview
- **Date:** 2026-05-14
- **Priority:** P1
- **Description:** Tạo localStorage wrapper, debounced autosave hook, và React Query hooks cho comment CRUD với optimistic update.
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- `draft-storage.ts` try/catch SecurityError (incognito) → trả `null` hoặc `false` thay vì throw → UI ẩn draft indicator.
- Debounce 500ms trong `use-draft-autosave` dùng `useEffect + setTimeout` (KISS, không thêm dep).
- React Query optimistic: insert temp comment với `id = 'temp-' + uuid()` vào cache; rollback nếu server error.
- Invalidate sau mutation đảm bảo cache nhất quán; optimistic chỉ giảm latency hiển thị.

## Requirements
- Functional:
  - Load/save/clear draft per `userId+date`
  - Auto-save khi form state thay đổi (debounce 500ms)
  - Force save khi user click "Lưu nháp" hoặc khi dialog close
  - CRUD comments với optimistic + invalidate
- Non-functional:
  - Safe khi localStorage unavailable (incognito)
  - Hook unmount → cleanup timer (tránh leak)

## Architecture

### File 1: `src/lib/draft-storage.ts` (~60 LOC)
```ts
type DraftPayload = {
  completedYesterday: string;
  doingYesterday: string;
  blockers: string;
  planToday: string;
  savedAt: string; // ISO
};

const KEY_PREFIX = 'smitos.dailyReport.draft';
const keyFor = (userId: string, date: string) => `${KEY_PREFIX}.${userId}.${date}`;

export function isStorageAvailable(): boolean { /* try/catch test write */ }
export function loadDraft(userId: string, date: string): DraftPayload | null
export function saveDraft(userId: string, date: string, payload: Omit<DraftPayload, 'savedAt'>): DraftPayload | null
export function clearDraft(userId: string, date: string): void
```

### File 2: `src/hooks/use-draft-autosave.ts` (~50 LOC)
```ts
export function useDraftAutosave<T>(opts: {
  form: T;
  userId: string | undefined;
  date: string;
  enabled?: boolean; // disable khi submitting
  delayMs?: number; // default 500
}): {
  savedAt: string | null;
  saving: boolean;
  available: boolean;
  flush: () => void; // manual save
  clear: () => void;
}
```
- `useEffect` watch `form` → setTimeout `delayMs` → call `saveDraft`.
- Cleanup timer on unmount.
- `flush()` cancel timer + save ngay (cho nút manual).

### File 3: `src/hooks/use-daily-report-comments.ts` (~120 LOC)
```ts
export type CommentItem = {
  id: string;
  reportId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  body: string;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
};

export function useDailyReportCommentsQuery(reportId: string | null): UseQueryResult<CommentItem[]>
export function useCreateCommentMutation(reportId: string): UseMutationResult<...>
export function useUpdateCommentMutation(reportId: string): UseMutationResult<...>
export function useDeleteCommentMutation(reportId: string): UseMutationResult<...>
```
- queryKey: `['daily-report-comments', reportId]`
- `useSuspenseQuery` cho component Suspense (per UI contract §suspense-data).
- Optimistic: `onMutate` snapshot cache, insert/update/mark deleted; `onError` rollback; `onSettled` invalidate.

### File 4 (edit): `src/hooks/use-notifications.ts`
Thêm 2 type entry vào enum/union notification types:
- `DAILY_REPORT_COMMENT`
- `DAILY_REPORT_COMMENT_REPLY`

## Related code files
- **New:** `src/lib/draft-storage.ts` (~60 LOC)
- **New:** `src/hooks/use-draft-autosave.ts` (~50 LOC)
- **New:** `src/hooks/use-daily-report-comments.ts` (~120 LOC)
- **Edit:** `src/hooks/use-notifications.ts` (+~10 LOC type extension)

## Implementation Steps
1. Tạo `src/lib/draft-storage.ts` với 4 export + safe wrapper.
2. Tạo `src/hooks/use-draft-autosave.ts`:
   - useState `savedAt`, `saving`.
   - useEffect watch form → setTimeout → saveDraft → setSavedAt.
   - Return `flush` (clearTimeout + immediate save) + `clear`.
3. Tạo `src/hooks/use-daily-report-comments.ts`:
   - 1 query hook (Suspense) + 3 mutation hooks.
   - Reuse `apiFetch` helper (nếu có) hoặc fetch raw với `credentials: 'include'`.
4. Edit `src/hooks/use-notifications.ts` thêm 2 notification types (nếu strongly typed).
5. Unit-friendly: pure functions trong `draft-storage.ts` test được standalone (Phase 6 sẽ test).

## Todo list
- [ ] `draft-storage.ts` với 4 export + `isStorageAvailable` test
- [ ] `use-draft-autosave.ts` với debounce 500ms + flush + clear
- [ ] `use-daily-report-comments.ts` với 1 query + 3 mutation
- [ ] Optimistic update cho create/update/delete
- [ ] Cleanup timer on unmount
- [ ] Extend notification types
- [ ] `npx tsc --noEmit` pass
- [ ] Manual test trong devtool: `localStorage.getItem('smitos.dailyReport.draft...')` thấy data

## Success Criteria
- `draft-storage` hoạt động đúng cả khi localStorage available và unavailable.
- `use-draft-autosave` debounce đúng 500ms, không save thừa khi typing nhanh.
- React Query cache update đúng: optimistic xuất hiện ngay, server response replace temp.
- Rollback đúng khi server trả 4xx.
- Mỗi file <200 LOC.

## Risk Assessment
| Risk | Mức | Mitigation |
|---|---|---|
| Timer leak khi unmount nhanh | Trung bình | Cleanup `clearTimeout` trong return của useEffect |
| Optimistic gây flicker khi rollback | Thấp | Toast error để user biết, refetch invalidate |
| localStorage quota exceeded | Thấp | try/catch silent, hook trả `available: false` |
| Stale closure trong debounce | Trung bình | Dùng `useRef` cho latest `form` value |

## Security Considerations
- localStorage chứa draft text plain → nếu PC chia sẻ, người khác có thể đọc. Document risk trong note nhưng KHÔNG block (UX > paranoia cho daily report nội bộ).
- Body comment escape ở UI render layer (Phase 4), không sanitize ở client API call.

## Next steps
- → Phase 4: v5 Components (form dialog, detail modal, comment thread)
