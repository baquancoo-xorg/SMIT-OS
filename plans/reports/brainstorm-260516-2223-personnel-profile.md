---
type: brainstorm
date: 2026-05-16
slug: personnel-profile
status: approved
related_doc: docs/personnel-profile-feature.md
---

# Brainstorm — Personnel Profile System

## 1. Problem Statement

SMIT-OS chỉ đo output (Jira + daily report), thiếu capability/context cá nhân. Cần feature số hoá năng lực + tính cách + innate profile (numerology/bát tự) + live Jira/SMIT-OS data thành 360° profile cho Admin (Quân) quyết định phân công/coaching.

Spec đầy đủ: `docs/personnel-profile-feature.md` (591 lines).

## 2. Constraints xác nhận

- Team: 1-5 người (giữ full spec, build cho tương lai)
- Ship Phase 1 ~2 tuần (full spec, không cắt)
- Cả Big Five + DISC
- Live integration Jira/SMIT-OS có cache
- Risks chính: latency, jiraAccountId mapping, MCP scope
- Không cần email reminder
- DISC: chỉ Natural style (không Adapted vs Natural overlay)
- Bát tự: thuần tiếng Việt (Giáp Tý, không 甲子)
- Retention: soft-delete + cron 2y

## 3. Approaches Đã Đánh Giá

### 3.1 Cache layer
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| In-process LRU (`lru-cache`) | KISS, 0 infra, 5KB lib | Mất khi restart, không multi-instance | ✅ CHỌN |
| Postgres cache table | Persistent | SQL overhead, không cần | ❌ |
| Redis | Future-proof | Container mới, over cho 5 user | ❌ |

### 3.2 Skill score storage
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| JSON column như spec | Flexible | Trend query parse app-side, rename mất history | ❌ |
| Normalized Skill + SkillScore | Index, SQL aggregate, rename safe | +1 bảng | ✅ CHỌN |
| Hybrid JSON + denorm avg | Fast dashboard | Phức tạp gấp đôi | ❌ |

### 3.3 Jira mapping
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| `User.jiraAccountId` + MCP auto-resolve by email | Reusable cho KR/DailyReport future, 1 lần fill | Cần resolver script | ✅ CHỌN |
| `Personnel.jiraAccountId` | Isolated | Không reusable | ❌ |
| `integration_mapping` table | Generic | Over-engineered | ❌ |

### 3.4 MCP scope
- Reuse `daily_reports.read` + `kr.read` qua internal call. Không expose `personnel.read` ra ngoài (chưa cần).

### 3.5 Sync strategy
- Live proxy + LRU 5min TTL. Manual refresh button trong drawer Zone C/D (cache invalidate).

## 4. Final Architecture

### 4.1 Data Model (delta vs spec)

```prisma
// User: thêm 1 field
model User {
  ...
  jiraAccountId String? // Atlassian accountId, resolved via MCP lookup-by-email
}

model Personnel {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  position      PersonnelPosition
  startDate     DateTime
  birthDate     DateTime?
  birthTime     String?   // "HH:MM"
  birthPlace    String?
  numerologyData Json?    // cached compute
  baziData       Json?    // cached compute, VN-only labels
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  assessments   SkillAssessment[]
  personality   PersonalityResult[]
  pmNotes       PmNote[]
  @@index([userId])
  @@index([position])
}

model Skill {
  id        String   @id @default(cuid())
  group     SkillGroup // JOB | GENERAL | PERSONAL
  position  PersonnelPosition? // null for GENERAL/PERSONAL
  key       String   // stable identifier
  label     String   // VN display
  order     Int
  active    Boolean  @default(true)
  scores    SkillScore[]
  @@unique([group, position, key])
}

model SkillAssessment {
  id           String   @id @default(cuid())
  personnelId  String
  personnel    Personnel @relation(...)
  quarter      String   // "2026-Q1"
  assessorType AssessorType // SELF | MANAGER
  assessorId   String
  submittedAt  DateTime @default(now())
  deletedAt    DateTime?
  scores       SkillScore[]
  @@unique([personnelId, quarter, assessorType])
}

model SkillScore {
  assessmentId String
  assessment   SkillAssessment @relation(...)
  skillId      String
  skill        Skill @relation(...)
  score        Int   // 1-5
  @@id([assessmentId, skillId])
  @@index([skillId])
}

model PersonalityResult {
  id           String   @id @default(cuid())
  personnelId  String
  testType     PersonalityTestType // BIG_FIVE | DISC
  year         Int
  results      Json    // raw dimension scores
  summary      Json    // {primary, description}; DISC = Natural only
  completedAt  DateTime @default(now())
  deletedAt    DateTime?
  @@unique([personnelId, testType, year])
}

model PmNote {
  id          String   @id @default(cuid())
  personnelId String
  personnel   Personnel @relation(...)
  quarter     String
  authorId    String
  content     String   @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([personnelId, quarter])
}

enum SkillGroup { JOB GENERAL PERSONAL }
```

### 4.2 Module layout (kebab-case, <200 LOC)

```
server/
├── routes/personnel/
│   ├── index.ts
│   ├── personnel.routes.ts
│   ├── assessments.routes.ts
│   ├── personality.routes.ts
│   ├── jira-integration.routes.ts
│   └── smitos-integration.routes.ts
├── lib/
│   ├── numerology-calc.ts
│   ├── bazi-calc.ts (lunar-javascript, VN labels only)
│   ├── disc-scoring.ts
│   ├── bigfive-scoring.ts
│   ├── external-cache.ts (lru-cache singleton, 5min TTL)
│   └── jira-resolver.ts (email→accountId one-shot)
├── data/
│   ├── skills-seed.ts (40 skills: 24 job + 8 general + 8 personal)
│   ├── bigfive-vi.json (50 IPIP items VN)
│   ├── disc-vi.json (24 items VN)
│   └── numerology-meanings-vi.json (1-9, 11, 22, 33)
└── middleware/
    └── personnel-access.ts (admin or self)

src/
├── pages/v6/personnel/
│   ├── personnel-page.tsx
│   └── personnel-dashboard-tab.tsx
├── components/features/personnel/
│   ├── personnel-list-grid.tsx
│   ├── personnel-card.tsx (mini-radar + status badge)
│   ├── personnel-profile-drawer.tsx
│   ├── status-badge.tsx
│   ├── zones/
│   │   ├── skill-radar-zone.tsx
│   │   ├── personality-zone.tsx
│   │   ├── jira-zone.tsx
│   │   └── smitos-zone.tsx
│   └── forms/
│       ├── skill-assessment-form.tsx
│       ├── bigfive-test-form.tsx
│       └── disc-test-form.tsx
├── hooks/
│   ├── use-personnel.ts
│   ├── use-skill-assessments.ts
│   └── use-personality-results.ts
└── lib/personnel/
    └── radar-data-builder.ts
```

### 4.3 Auto-flag rules (như spec)
- Skill score giảm ≥1 vs quý trước → flag
- Jira overdue ≥3 → flag
- Daily report < 80% tháng → flag
- KR < 50% khi còn ≤2 tuần → flag
- Quarterly assessment overdue >2 tuần → flag
- Status: 0 flag = On Track, 1-2 = Needs Attention, ≥3 = At Risk

### 4.4 Personality decisions
- Big Five: 50 IPIP-50 VN, output O/C/E/A/N scores 0-100
- DISC: 24-item Most/Least, output **Natural type only** (Primary + Secondary + 4 bar)
- Tần suất: 1 lần/năm (skip year nếu đã có)

### 4.5 Numerology
- Library: `numeroljs`
- Compute: Life Path, Expression, Soul Urge, Birthday
- Meanings: custom VN map cho 1-9, 11, 22, 33 (master numbers)

### 4.6 Bát tự
- Library: `lunar-javascript`, server-only import (~400KB)
- Output: Tứ Trụ (Can Chi VN: Giáp Tý), Ngũ Hành chủ, Nhật Chủ, Vượng/Nhược, Hỉ Dụng Thần
- Birth time optional → hour pillar fallback "Không xác định"

### 4.7 Live integrations
- **Jira**: `mcp__a1019570__searchJiraIssuesUsingJql` proxy via `/api/personnel/:id/jira-tasks`, cache 5min, manual refresh button
- **SMIT-OS**: internal call DailyReport + KR table (no MCP needed cho internal), cache 5min cho aggregate

## 5. Phasing

### Phase 1 (Week 1-2): Core Profile
- Schema + migration + skills-seed
- Personnel CRUD + access middleware (admin or own)
- Sidebar Acquisition → Personnel
- List grid + card (mini-radar)
- Drawer shell + Zone A (skill radar self/manager toggle)
- Skill assessment form (quarterly Likert 1-5)
- Numerology + Bát tự auto-compute on save birthDate

### Phase 2 (Week 3-4): Personality + Innate
- Big Five 50q form + scoring + result card
- DISC 24q form + Natural scoring + result card
- Zone B: 4 cards 2×2 (DISC, Big Five, Numerology, Bát tự)
- Manager assessment overlay on radar

### Phase 3 (Week 5-6): Live Integration + Dashboard Tab
- LRU cache infra
- Jira resolver script (User.jiraAccountId fill via MCP email lookup)
- Zone C: Jira task widget + refresh button
- Zone D: SMIT-OS performance snapshot
- Auto-flag logic + status badge wiring
- Dashboard Personnel tab (team grid + drill-down)
- PM notes per quarter

### Phase 4 (later): Advanced
- Skill gap heatmap, cross-team comparison
- PDF export 1-on-1
- AI focus area recommendation
- Cron soft-delete >2y

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 98 câu/quý/người gây ngại | Adoption fail | Stagger: Skill quarterly, Big Five+DISC yearly |
| MCP Atlassian rate limit | Zone C lỗi | LRU 5min + manual refresh + graceful fallback |
| `lunar-javascript` 400KB | Bundle bloat | Server-only import, không ship FE |
| `numeroljs` default EN text | Wrong language | Override 100% bằng VN map |
| Birth time thiếu | Bát tự incomplete | Optional field + UI warning "Không xác định" |
| Skill rename phá history | Data loss | Normalized table với stable `key` field |
| Multi-instance cache divergence | Stale data | Doc rõ in-process limit, migrate Postgres cache khi scale |

## 7. Success Criteria

- Admin tạo profile cho 5 nhân sự < 5 phút mỗi profile (sau khi có birthDate)
- Nhân sự hoàn thành quarterly skill assessment trong < 10 phút
- Profile drawer first-paint < 1.5s (data từ cache), cold load < 4s
- Radar 4-quarter trend hiển thị đúng sau khi có 2+ quarter data
- Status badge auto-update theo flag rules, không cần manual trigger
- Bát tự hiển thị 100% VN labels, 0 ký tự Hán

## 8. Next Steps

1. Tạo implementation plan chi tiết qua `/ck:plan`
2. User confirm Phase 1 file ownership (single dev → 1 worktree)
3. Start Phase 1: schema + seed

## 9. Unresolved Questions

- `numeroljs` có còn maintained? Nếu deprecated → tự implement (~150 LOC, đơn giản)
- DISC questions VN — dùng existing translation hay tự viết lại 24 item × 4 word?
- Personnel card mini-radar có lazy-load (chỉ render khi card visible) hay render hết grid? (5 user thì không quan trọng, nhưng nếu grow >50 cần virtualization)
- Sidebar group "Acquisition" có capacity cho thêm item không, hay cần resize?
