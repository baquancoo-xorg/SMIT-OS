# Phase 1 — Core Profile

## Context

- Parent: [plan.md](plan.md)
- Spec: docs/personnel-profile-feature.md §3-§6, §10 (Phase 1 list)
- Brainstorm: plans/reports/brainstorm-260516-2223-personnel-profile.md
- UI: docs/ui-design-contract.md
- Sidebar: `src/components/layout/sidebar.tsx:19` (Acquisition group)

## Overview

- **Date:** 2026-05-16
- **Priority:** P2
- **Effort:** 2w (10-12 dev days)
- **Description:** Schema + Personnel CRUD + skill assessment + Zone A (radar) + sidebar wiring + numerology/bát tự auto-compute. No personality test, no live integration.
- **Status:** pending
- **Review:** unreviewed

## Key Insights

- Schema phải normalize Skill ngay từ Phase 1 — đổi sau cực đau
- Numerology + Bát tự là cheap wins (compute 1 lần khi save birthDate), nên ship Phase 1
- Zone A radar self/manager toggle: chỉ render real `SELF` data Phase 1, slot `MANAGER` để Phase 2 fill
- Status badge stub (always "On Track") — real flag logic ở Phase 3
- Sidebar group `Acquisition` hiện có 3 items (Leads/Ads/Media) → thêm Personnel = 4 (capacity OK)

## Requirements

### Functional
- Admin tạo/edit/delete Personnel record cho bất kỳ User
- Nhân sự xem profile của mình (read-only ngoài assessment)
- Nhân sự submit quarterly skill assessment (24 skills Job + 8 General + 8 Personal = 40 Likert 1-5)
- Profile drawer hiển thị Zone A: radar 4 quý gần nhất, table chi tiết
- birthDate save → auto-compute numerology + bát tự, cache vào `Personnel.numerologyData/baziData`
- birthTime optional; nếu thiếu → hour pillar "Không xác định"

### Non-functional
- File <200 LOC
- Personnel list grid first-paint <1.5s (5 records)
- Assessment form submit <1s (40 INSERT trong 1 transaction)
- All UI text VN
- Bát tự 0 ký tự Hán

## Architecture

### Data Model
```prisma
// User: thêm field
jiraAccountId String?

model Personnel {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  position      PersonnelPosition
  startDate     DateTime
  birthDate     DateTime?
  birthTime     String?            // "HH:MM"
  birthPlace    String?
  numerologyData Json?             // {lifePath, expression, soulUrge, birthday}
  baziData       Json?             // VN-only labels
  assessments    SkillAssessment[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  @@index([userId])
  @@index([position])
}

enum PersonnelPosition { MARKETING MEDIA ACCOUNT }
enum SkillGroup { JOB GENERAL PERSONAL }
enum AssessorType { SELF MANAGER }

model Skill {
  id        String   @id @default(cuid())
  group     SkillGroup
  position  PersonnelPosition?    // null cho GENERAL/PERSONAL
  key       String
  label     String
  order     Int
  active    Boolean  @default(true)
  scores    SkillScore[]
  @@unique([group, position, key])
}

model SkillAssessment {
  id           String   @id @default(cuid())
  personnelId  String
  personnel    Personnel @relation(fields: [personnelId], references: [id], onDelete: Cascade)
  quarter      String                // "2026-Q1"
  assessorType AssessorType
  assessorId   String
  submittedAt  DateTime @default(now())
  deletedAt    DateTime?
  scores       SkillScore[]
  @@unique([personnelId, quarter, assessorType])
  @@index([personnelId, quarter])
}

model SkillScore {
  assessmentId String
  assessment   SkillAssessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  skillId      String
  skill        Skill @relation(fields: [skillId], references: [id])
  score        Int                   // 1-5
  @@id([assessmentId, skillId])
  @@index([skillId])
}
```

### API Routes
```
GET    /api/personnel                   list (admin: all, member: own only)
GET    /api/personnel/:id               profile detail
POST   /api/personnel                   create (admin)
PUT    /api/personnel/:id               update (admin)
DELETE /api/personnel/:id               soft-delete (admin)

GET    /api/skills?group=&position=     skill registry for form
GET    /api/personnel/:id/assessments   history
POST   /api/personnel/:id/assessments   submit (self or manager)
```

### Access Control
`personnel-access.ts`: `(req.user.isAdmin) OR (req.user.id === Personnel.userId)` → allow.

## Related Code Files

### Create
- `prisma/schema.prisma` (extend)
- `prisma/migrations/{ts}_personnel_phase_1/migration.sql`
- `server/data/skills-seed.ts` (40 skills const + seed fn)
- `server/data/numerology-meanings-vi.json` (1-9, 11, 22, 33)
- `server/lib/numerology-calc.ts` (numeroljs wrapper)
- `server/lib/bazi-calc.ts` (lunar-javascript wrapper, VN Can Chi)
- `server/routes/personnel/index.ts` (mount)
- `server/routes/personnel/personnel.routes.ts`
- `server/routes/personnel/assessments.routes.ts`
- `server/routes/skills.routes.ts`
- `server/middleware/personnel-access.ts`
- `server/types/personnel.types.ts` (shared FE/BE types)
- `src/pages/v6/personnel/personnel-page.tsx`
- `src/components/features/personnel/personnel-list-grid.tsx`
- `src/components/features/personnel/personnel-card.tsx`
- `src/components/features/personnel/personnel-profile-drawer.tsx`
- `src/components/features/personnel/status-badge.tsx` (stub)
- `src/components/features/personnel/zones/skill-radar-zone.tsx`
- `src/components/features/personnel/forms/skill-assessment-form.tsx`
- `src/hooks/use-personnel.ts`
- `src/hooks/use-skill-assessments.ts`
- `src/lib/personnel/radar-data-builder.ts`
- `src/lib/personnel/quarter-utils.ts` (current quarter calc, "2026-Q2")

### Modify
- `src/components/layout/sidebar.tsx:19` — `['Personnel', 'Leads', 'Ads', 'Media']`
- `src/App.tsx` — add `/personnel` route
- `server/index.ts` (or routes mount) — mount `/api/personnel`

## Implementation Steps

1. **Schema**: extend `prisma/schema.prisma` với 5 models + 3 enums + `User.jiraAccountId`
2. **Migration**: `npm run db:push` (dev), verify với `npm run db:studio`
3. **Seed skills**: viết `skills-seed.ts` từ spec §3.1-3.3, run script lần đầu
4. **Numerology lib**: `npm i numeroljs`, wrap thành `numerology-calc.ts` exposing `compute(birthDate, fullName)` returning `{lifePath, expression, soulUrge, birthday}` + map VN từ `numerology-meanings-vi.json`
5. **Bát tự lib**: `npm i lunar-javascript`, wrap thành `bazi-calc.ts` exposing `compute(birthDate, birthTime?)` returning `{yearPillar, monthPillar, dayPillar, hourPillar?, element, dayMaster, strength, favorableElements}` — VN labels only (table Can/Chi tiếng Việt internal)
6. **Backend routes**: CRUD Personnel + auto-call numerology/bazi compute trên POST/PUT khi có birthDate
7. **Assessments route**: POST validate 40 skills present, score 1-5, 1 transaction INSERT
8. **Access middleware**: `personnel-access.ts` cho `:id` routes
9. **Frontend types**: gen từ Prisma + handcraft cho DTO trong `personnel.types.ts`
10. **Hooks**: `use-personnel` (list+detail), `use-skill-assessments` (history+submit) qua TanStack Query
11. **List page**: grid 3/2/1 col responsive, card với avatar+name+position+tenure+status stub
12. **Card mini-radar**: 3 datasets overlay (Job/General/Personal latest quarter avg), recharts RadarChart small
13. **Drawer shell**: tabs slot Phase 1 chỉ Zone A active, các tab khác disabled
14. **Zone A — Skill Radar**: tabs `Job | General | Personal`, mỗi tab có:
    - Radar chart up to 4 quarters overlay (chartColors.series)
    - Legend Q1/Q2/Q3/Q4
    - Toggle `Self | Manager | Both` (Phase 1: Manager disabled với tooltip "Phase 2")
    - Detail table skill × quarter
15. **Skill assessment form**: 3 tab Job/General/Personal, 8 skills/tab, Likert 1-5 buttons, validate all-filled, submit
16. **Status badge stub**: always render "On Track" với note `data-phase="1-stub"`
17. **Sidebar**: insert `'Personnel'` đầu tiên trong Acquisition items array
18. **Route**: `/personnel` in App.tsx, lazy load page

## Todo

- [ ] Extend `prisma/schema.prisma`
- [ ] Run migration `npm run db:push`
- [ ] Write `server/data/numerology-meanings-vi.json`
- [ ] Write `server/data/skills-seed.ts` + run seed
- [ ] Implement `server/lib/numerology-calc.ts`
- [ ] Implement `server/lib/bazi-calc.ts`
- [ ] Implement `server/middleware/personnel-access.ts`
- [ ] Implement `server/routes/personnel/personnel.routes.ts`
- [ ] Implement `server/routes/personnel/assessments.routes.ts`
- [ ] Implement `server/routes/skills.routes.ts`
- [ ] Mount routes in `server/index.ts`
- [ ] Write `server/types/personnel.types.ts`
- [ ] Implement `src/hooks/use-personnel.ts`
- [ ] Implement `src/hooks/use-skill-assessments.ts`
- [ ] Implement `src/lib/personnel/quarter-utils.ts`
- [ ] Implement `src/lib/personnel/radar-data-builder.ts`
- [ ] Implement `src/components/features/personnel/status-badge.tsx`
- [ ] Implement `src/components/features/personnel/personnel-card.tsx`
- [ ] Implement `src/components/features/personnel/personnel-list-grid.tsx`
- [ ] Implement `src/components/features/personnel/zones/skill-radar-zone.tsx`
- [ ] Implement `src/components/features/personnel/forms/skill-assessment-form.tsx`
- [ ] Implement `src/components/features/personnel/personnel-profile-drawer.tsx`
- [ ] Implement `src/pages/v6/personnel/personnel-page.tsx`
- [ ] Update `src/components/layout/sidebar.tsx` (add Personnel)
- [ ] Add `/personnel` route in `src/App.tsx`
- [ ] `npm run typecheck && npm run lint && npm run build` clean
- [ ] Manual smoke: create 1 personnel, submit 1 assessment, view radar

## Success Criteria

- 5 records hiển thị grid <1.5s
- Submit 40-skill assessment <1s
- Numerology + Bát tự auto-fill khi PUT birthDate
- Bát tự 0 ký tự Hán (grep test)
- Radar Zone A render đúng overlay khi có 2+ quarters
- Access control: member khác KHÔNG xem được profile người khác (403)
- Compile/lint/build pass

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| `numeroljs` deprecated/broken | Fallback custom impl 150 LOC (algorithm public) |
| `lunar-javascript` ship to FE bundle | Server-only import, verify Vite bundle analyzer |
| 40 skills seed drift vs spec rename | Stable `key` field, `label` mutable |
| Skill assessment form > 200 LOC | Split: form shell + tab-job + tab-general + tab-personal subcomponents |
| Radar overlay phức tạp >200 LOC | Split: chart + legend + toggle subcomponents |

## Security Considerations

- Access middleware enforced PRE handler (Admin override only via `isAdmin`)
- Soft-delete `deletedAt` excludes from default queries
- Birth data (birthDate/Time/Place) — admin + self only, never expose ra list endpoint
- No PII in audit logs
- Validate `quarter` format regex `^\d{4}-Q[1-4]$` để chặn injection JSON key

## Next Steps

→ Phase 2: Big Five + DISC + Zone B + manager overlay wiring trên Zone A
