# Phase 2 — Personality + Innate

## Context

- Parent: [plan.md](plan.md)
- Predecessor: [phase-01-core-profile.md](phase-01-core-profile.md) MUST complete
- Spec: docs/personnel-profile-feature.md §4.2-4.4
- Brainstorm: plans/reports/brainstorm-260516-2223-personnel-profile.md §4.4

## Overview

- **Date:** 2026-05-16
- **Priority:** P2
- **Effort:** 2w
- **Description:** Big Five 50q + DISC 24q (Natural only) + Zone B (4 cards 2×2) + wire manager assessment overlay vào Zone A radar
- **Status:** pending
- **Review:** unreviewed

## Key Insights

- Big Five scoring engine fork từ bigfive-web (MIT), output O/C/E/A/N scores 0-100
- DISC Natural only — không tính Adapted style, output: Primary type + Secondary + 4-bar D/I/S/C scores
- Personality test 1 lần/năm, skip nếu đã có record cùng year
- Zone B 4 cards 2×2: DISC | Big Five | Numerology | Bát tự — Numerology+Bát tự đã có data Phase 1, chỉ cần render
- Manager assessment dùng schema từ Phase 1 (`assessorType=MANAGER`), Phase 2 chỉ wire UI + permission

## Requirements

### Functional
- Nhân sự làm Big Five test 50 câu (Likert 1-5), submit → scoring → result
- Nhân sự làm DISC test 24 câu (Most Like / Least Like), submit → Natural type
- Skip test nếu đã có record cùng year (UI hiển thị "Đã hoàn thành 2026 — Làm lại 2027")
- Zone B render 4 cards với data có sẵn (DISC nullable, Big Five nullable, Numerology+Bát tự có Phase 1)
- Admin submit Manager assessment cho bất kỳ Personnel — render overlay trên Zone A radar
- Toggle Self | Manager | Both trên Zone A enabled

### Non-functional
- Big Five form không over 3 trang (chia 50q → 3 × 17)
- DISC form 1 trang scroll OK
- Test result render <500ms
- File <200 LOC

## Architecture

### Data Model (đã có Phase 1)
```prisma
model PersonalityResult {
  id           String   @id @default(cuid())
  personnelId  String
  testType     PersonalityTestType
  year         Int
  results      Json
  summary      Json
  completedAt  DateTime @default(now())
  deletedAt    DateTime?
  @@unique([personnelId, testType, year])
}
enum PersonalityTestType { BIG_FIVE DISC }
```

### Big Five output shape
```ts
{
  results: { O: 72, C: 68, E: 45, A: 80, N: 30 },   // 0-100
  summary: {
    highest: 'A',
    lowest: 'N',
    descriptionVn: 'Hợp tác cao, ít lo âu...'
  }
}
```

### DISC output shape
```ts
{
  results: { D: 45, I: 70, S: 35, C: 60 },   // 0-100
  summary: {
    primary: 'I',
    secondary: 'C',
    style: 'Influencer with analytical undertone',
    descriptionVn: '...'
  }
}
```

### API Routes
```
GET    /api/personnel/:id/personality                  list results
POST   /api/personnel/:id/personality/big-five         submit Big Five
POST   /api/personnel/:id/personality/disc             submit DISC
```

## Related Code Files

### Create
- `server/lib/bigfive-scoring.ts` (fork bigfive-web logic, ~100 LOC)
- `server/lib/disc-scoring.ts` (custom Natural-only algorithm, ~80 LOC)
- `server/data/bigfive-vi.json` (50 IPIP items VN, dimension + direction)
- `server/data/disc-vi.json` (24 items × 4 words VN, mapping word→DISC)
- `server/data/bigfive-descriptions-vi.json` (high/low dimension texts)
- `server/data/disc-descriptions-vi.json` (16 type combos)
- `server/routes/personnel/personality.routes.ts`
- `src/components/features/personnel/forms/bigfive-test-form.tsx` (split nếu >200 LOC: shell + question-page)
- `src/components/features/personnel/forms/disc-test-form.tsx`
- `src/components/features/personnel/zones/personality-zone.tsx` (shell 2×2)
- `src/components/features/personnel/zones/cards/disc-card.tsx`
- `src/components/features/personnel/zones/cards/bigfive-card.tsx`
- `src/components/features/personnel/zones/cards/numerology-card.tsx`
- `src/components/features/personnel/zones/cards/bazi-card.tsx`
- `src/hooks/use-personality-results.ts`
- `src/lib/personnel/personality-color-map.ts` (D/I/S/C colors từ chartColors)

### Modify
- `src/components/features/personnel/personnel-profile-drawer.tsx` — enable Zone B tab
- `src/components/features/personnel/zones/skill-radar-zone.tsx` — enable Manager toggle, wire `assessorType=MANAGER` data
- `server/routes/personnel/assessments.routes.ts` — allow `assessorType=MANAGER` khi `req.user.isAdmin`

## Implementation Steps

1. **Translate IPIP-50** sang `bigfive-vi.json`: dimension (O/C/E/A/N) + direction (+/-) per item
2. **Translate DISC 24** sang `disc-vi.json`: 24 items × 4 words, mỗi word map 1 letter D/I/S/C
3. **Big Five scoring**: sum direction-adjusted Likert → normalize 0-100 per dimension → pick highest/lowest → VN description từ map
4. **DISC scoring**: count Most − Least per letter, normalize → Primary/Secondary
5. **API**: POST endpoints validate test items count, score range, year uniqueness; GET history
6. **Big Five form**: 50q chia 3 pages (~17 mỗi page), progress bar, Likert button row
7. **DISC form**: 24 items, mỗi item 4 word + 2 radio (Most/Least), validate đúng 1 Most + 1 Least per item
8. **DISC card**: badge Primary với màu (`chartColors.series[0..3]`), bar chart 4 dim, 2-line VN desc
9. **Big Five card**: horizontal bar 5 dim, highlight high+low
10. **Numerology card**: Life Path lớn + 3 số nhỏ + VN meaning (đọc từ Phase 1 `Personnel.numerologyData`)
11. **Bát tự card**: ngũ hành icon + Nhật Chủ + Hỉ Dụng Thần + 4 pillars text (VN)
12. **Personality zone shell**: 2×2 grid, empty state nếu chưa làm test (CTA "Làm Big Five" / "Làm DISC")
13. **Manager overlay**: extend `radar-data-builder.ts` để merge SELF + MANAGER datasets, color separate
14. **Enable toggle**: Self | Manager | Both — Both = render cả 2 lines per quarter
15. **Admin form**: re-use `skill-assessment-form.tsx` nhưng pass `assessorType=MANAGER` khi admin mở từ profile khác

## Todo

- [ ] Write `server/data/bigfive-vi.json` (50 items VN)
- [ ] Write `server/data/disc-vi.json` (24 × 4 words VN)
- [ ] Write `server/data/bigfive-descriptions-vi.json`
- [ ] Write `server/data/disc-descriptions-vi.json`
- [ ] Implement `server/lib/bigfive-scoring.ts`
- [ ] Implement `server/lib/disc-scoring.ts`
- [ ] Implement `server/routes/personnel/personality.routes.ts`
- [ ] Mount in personnel routes index
- [ ] Implement `src/hooks/use-personality-results.ts`
- [ ] Implement `src/lib/personnel/personality-color-map.ts`
- [ ] Implement `src/components/features/personnel/forms/bigfive-test-form.tsx`
- [ ] Implement `src/components/features/personnel/forms/disc-test-form.tsx`
- [ ] Implement `src/components/features/personnel/zones/cards/disc-card.tsx`
- [ ] Implement `src/components/features/personnel/zones/cards/bigfive-card.tsx`
- [ ] Implement `src/components/features/personnel/zones/cards/numerology-card.tsx`
- [ ] Implement `src/components/features/personnel/zones/cards/bazi-card.tsx`
- [ ] Implement `src/components/features/personnel/zones/personality-zone.tsx`
- [ ] Update `personnel-profile-drawer.tsx` enable Zone B
- [ ] Update `skill-radar-zone.tsx` enable Manager toggle + merged dataset
- [ ] Update `assessments.routes.ts` allow MANAGER for admin
- [ ] Update `radar-data-builder.ts` merge self+manager
- [ ] `typecheck && lint && build` clean
- [ ] Smoke: 1 user làm Big Five + DISC, admin submit manager assessment, verify radar overlay

## Success Criteria

- Big Five 50q complete <10 phút end-to-end
- DISC 24q complete <5 phút
- Zone B render 4 cards đầy đủ kể cả khi 1-2 card chưa có data (empty state có CTA)
- Manager toggle hiển thị 2 lines khi có cả SELF + MANAGER cùng quarter
- DISC summary `primary` luôn ∈ {D,I,S,C}
- Big Five scores tổng từng dim 0-100, không NaN
- Re-test cùng year bị reject 409

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Translate IPIP-50 sai nghĩa lâm sàng | Reference original IPIP wording + cross-check 2 sources |
| DISC 24 items VN không sẵn | Tự viết, accept ngôn ngữ marketing-friendly hơn là academic |
| Form 50q > 200 LOC | Split: shell + page + question-row + likert-button |
| Manager assessment confusion (admin self vs manager?) | UX: admin xem profile người khác → button "Đánh giá manager" rõ ràng |
| Big Five score lệch standard | Test với golden answers từ bigfive-web fixtures |

## Security Considerations

- POST personality kiểm `req.user.id === Personnel.userId` (không cho người khác làm thay)
- Admin KHÔNG submit personality cho người khác (chỉ self)
- Personality data sensitive — không leak ra list endpoint
- Year uniqueness enforced DB-level

## Next Steps

→ Phase 3: Live Jira + SMIT-OS + auto-flags + dashboard Personnel tab + PM notes + cleanup cron
