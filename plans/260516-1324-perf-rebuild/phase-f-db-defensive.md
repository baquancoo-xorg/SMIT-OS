# Phase F — DB Defensive

**Priority:** P2 | **Status:** pending | **Effort:** 1-2h

## Overview
Cheap insurance indexes + OKR recalc refactor. Tất cả tables Phase F target hiện 0 rows → zero impact NOW, future-proof khi data grow.

## Changes

### F1 — WeeklyReport composite index
`prisma/schema.prisma` model `WeeklyReport`:
```prisma
model WeeklyReport {
  // existing fields
  @@index([userId, weekEnding])
  @@index([status])  // for admin "review queue" filter
}
```

### F2 — Skip Notification composite
- Đã có `[userId, isRead]`, `[userId, createdAt]`, `[type, entityType, entityId]`
- Composite `[userId, isRead, createdAt]` ROI quá thấp ở 219 rows
- **Decision:** SKIP

### F3 — Objective index
`Objective` table: add `@@index([parentId])` cho `recalculateObjectiveProgress` query L1/L2

### F4 — OKR recalc refactor (optional)
`server/services/okr.service.ts:99-152` hiện 3 round-trips:
1. `findMany` all objectives + keyResults
2. `$transaction` L2 updates
3. `findMany` L2 progress + `$transaction` L1 updates

**Refactor:** compute L1 in-memory từ L2 data đã có (line 108-120), bỏ round-trip thứ 3:
```ts
const l2ProgressMap = new Map(l2Updates.map((u, i) => [...]));
// L1 computation dùng l2ProgressMap thay vì re-fetch
```

**Skip nếu:** thiếu test coverage (hiện không có test cho recalc). Code change risky không đáng với 0 rows.

## Files
- Modify: `prisma/schema.prisma`
- Modify (optional): `server/services/okr.service.ts`
- Run: `npm run db:push`

## Todo
- [ ] Add `@@index([userId, weekEnding])` + `@@index([status])` to WeeklyReport
- [ ] Add `@@index([parentId])` to Objective
- [ ] `npm run db:push` success
- [ ] Verify `\d "WeeklyReport"` trong psql shows index
- [ ] (Optional) OKR recalc refactor IF unit test exists, otherwise defer

## Success
- Migration applied
- `EXPLAIN ANALYZE` shows Index Scan khi simulate ≥1000 rows (synthetic test optional)

## Risks
- `db:push` không cần migration file → ok cho dev, nhưng production cần `prisma migrate dev` nếu mở rộng
- OKR refactor nếu skip test → defer hẳn, đừng cố
