# Personnel Profile System — Feature Specification

**File:** `docs/personnel-profile-feature.md`
**Version:** 1.0
**Ngày tạo:** 2026-05-16
**Tác giả:** CoworkOS-Dominium (Quân Nguyễn Bá)
**Trạng thái:** Draft — chờ development

---

## 1. Tổng quan & Bối cảnh

### 1.1 Vấn đề cần giải quyết

Hiện tại, SMIT OS theo dõi hiệu suất nhân sự thông qua Jira tasks và daily reports — nhưng 2 nguồn này chỉ phản ánh **output** (làm gì, hoàn thành chưa), không phản ánh **capability** và **context** cá nhân của từng nhân sự.

Mỗi nhân sự có năng lực khác nhau, tính cách khác nhau, vị trí khác nhau, SOW khác nhau, và mục tiêu cá nhân khác nhau. Một hệ thống đánh giá cào bằng dẫn đến:
- Không nhận ra ai đang phát triển thực sự vs ai đang "chạy đủ quota"
- Phân công task không phù hợp năng lực
- Feedback 1-on-1 thiếu căn cứ dữ liệu
- Không phát hiện được gap giữa tiềm năng và hiệu suất thực tế

### 1.2 Mục tiêu tính năng

- Số hóa năng lực và tính cách từng nhân sự thành dữ liệu có thể đo lường
- Theo dõi sự phát triển theo thời gian (quarterly trend)
- Kết hợp với Jira + SMIT-OS để có góc nhìn 360° về từng cá nhân
- Hỗ trợ Admin (Quân) đưa ra quyết định phân công, coaching, và phát triển nhân sự dựa trên data

### 1.3 Vị trí trong Navigation

Personnel nằm trong nhóm **Acquisition** của Sidebar, thứ tự:

```
Acquisition
├── Personnel    ← MỚI
├── Media
├── Ads
└── Lead
```

Sidebar cần update `sidebarSections` trong `src/components/layout/sidebar.tsx`:
```ts
{ label: 'Acquisition', items: ['Personnel', 'Media', 'Ads', 'Leads'] }
```

---

## 2. Access Control

| Role | Quyền |
|------|-------|
| **Admin** (Quân) | Xem tất cả profile, tất cả dữ liệu, chỉnh sửa bất kỳ |
| **Nhân sự** | Chỉ xem profile của chính mình, làm assessment của mình |
| Người khác | Không có quyền truy cập |

Dữ liệu nhạy cảm (Bát tự, Numerology, kết quả personality test) chỉ hiển thị cho chính nhân sự đó và Admin. Không có shared/public view.

---

## 3. Skill Taxonomy

### 3.1 Group 1 — Job Skills (8 skills, khác nhau theo vị trí)

Mỗi vị trí có bộ 8 Job Skills riêng. Score từ 1–5.

#### Marketing
| # | Skill | Mô tả |
|---|-------|-------|
| 1 | Digital Advertising | Thành thạo Meta Ads, Google Ads, TikTok Ads — setup, targeting, bid strategy |
| 2 | Content Strategy & Planning | Lên kế hoạch nội dung, content calendar, editorial direction |
| 3 | Analytics & Data Interpretation | Đọc và phân tích metrics: CTR, CPA, ROAS, funnel drop-off |
| 4 | SEO / SEM Knowledge | Keyword research, on-page SEO, SEM campaign structure |
| 5 | Campaign Management & Execution | Triển khai và vận hành campaign từ A–Z |
| 6 | Market Research & Audience Insight | Research đối thủ, phân tích tệp khách hàng, insight từ data |
| 7 | Conversion Optimization (CRO) | A/B testing, landing page optimization, funnel improvement |
| 8 | AI-Powered Marketing Execution | Dùng AI viết copy, tối ưu targeting, phân tích audience, A/B test tự động |

#### Media
| # | Skill | Mô tả |
|---|-------|-------|
| 1 | Graphic Design Proficiency | Thiết kế đồ họa (Figma, Photoshop, Illustrator) theo đúng brand |
| 2 | Video Production & Editing | Quay, dựng video — Premiere, CapCut, DaVinci Resolve |
| 3 | Visual Storytelling | Kể chuyện qua hình ảnh, tổ chức layout có narrative |
| 4 | Motion Graphics / Animation | After Effects, Lottie, motion design cơ bản |
| 5 | Photography & Image Retouching | Chụp ảnh sản phẩm/người, retouch bằng Lightroom/Photoshop |
| 6 | Brand Identity Application | Áp dụng đúng brand guideline vào mọi creative output |
| 7 | Creative Brief Execution Speed | Tốc độ và độ chính xác khi thực hiện brief — ít revision |
| 8 | AI Creative Tools Proficiency | Midjourney, Adobe Firefly, Runway, Sora — biết khi nào nên dùng AI vs làm tay |

#### Account
| # | Skill | Mô tả |
|---|-------|-------|
| 1 | Client Relationship Management | Xây dựng và duy trì mối quan hệ khách hàng lâu dài |
| 2 | Sales Prospecting & Pipeline Building | Tìm kiếm khách hàng tiềm năng, quản lý pipeline |
| 3 | Negotiation & Deal Closing | Đàm phán, xử lý objection, chốt deal |
| 4 | Customer Needs Analysis | Hỏi đúng câu, xác định pain point và nhu cầu thực sự |
| 5 | Upselling & Cross-selling | Tư vấn thêm dịch vụ phù hợp, tăng giá trị đơn hàng |
| 6 | Complaint Handling & Resolution | Xử lý khiếu nại chuyên nghiệp, giữ chân khách hàng |
| 7 | Revenue Target Achievement | Khả năng đạt và vượt target doanh thu đề ra |
| 8 | AI Sales Intelligence | Dùng AI research prospect, phân tích transcript gọi điện, viết proposal, lead scoring |

---

### 3.2 Group 2 — General Skills (8 skills, áp dụng tất cả vị trí)

| # | Skill | Mô tả |
|---|-------|-------|
| 1 | Communication | Giao tiếp rõ ràng — verbal, written, async |
| 2 | Time Management & Prioritization | Phân bổ thời gian, ưu tiên đúng việc đúng lúc |
| 3 | Problem Solving & Critical Thinking | Phân tích vấn đề, tìm giải pháp có căn cứ |
| 4 | Teamwork & Collaboration | Làm việc nhóm hiệu quả, hỗ trợ đồng đội |
| 5 | Adaptability & Flexibility | Xử lý tốt khi môi trường/yêu cầu thay đổi |
| 6 | Accountability & Ownership | Chịu trách nhiệm, không đổ lỗi, chủ động report |
| 7 | AI Tool Literacy | Ứng dụng AI vào công việc hàng ngày: prompting hiệu quả, automation workflow, đánh giá output chất lượng |
| 8 | AI-Assisted Decision Making | Dùng AI để research, tổng hợp thông tin, ra quyết định có căn cứ nhanh hơn |

---

### 3.3 Group 3 — Personal Skills (8 skills, ngoài công việc)

| # | Skill | Mô tả |
|---|-------|-------|
| 1 | Ngoại ngữ | Tiếng Anh hoặc ngôn ngữ khác: đọc, viết, giao tiếp |
| 2 | Quản lý tài chính cá nhân | Lập ngân sách, tiết kiệm, hiểu biết đầu tư cơ bản |
| 3 | Sức khỏe thể chất | Thói quen tập luyện, thể lực tổng thể, lối sống lành mạnh |
| 4 | Sức khỏe tinh thần | Khả năng phục hồi sau áp lực, điều tiết cảm xúc |
| 5 | Public Speaking | Thuyết trình trước đám đông — tự tin, rõ ràng, thuyết phục |
| 6 | Mạng lưới quan hệ cá nhân | Network bên ngoài công ty, chủ động kết nối cộng đồng |
| 7 | Tự quản lý mục tiêu cá nhân | Đặt goal cá nhân, tracking tiến độ, kỷ luật tự thân |
| 8 | AI Self-Development | Chủ động theo dõi xu hướng AI mới, tự build workflow AI cá nhân ngoài giờ làm, thử nghiệm tools mới |

---

## 4. Assessment System

### 4.1 Skill Assessment

**Cơ chế:** Dual-score model — Self Assessment + Manager Assessment

- **Phase 1:** Nhân sự tự đánh giá từng skill theo Likert scale 1–5
- **Phase 2:** Manager (Admin) đánh giá overlay trên cùng bộ skills
- **Visualization:** Radar chart hiển thị 2 đường — self vs manager — giúp thấy rõ perception gap

**Scale:**
| Score | Label | Mô tả |
|-------|-------|-------|
| 1 | Beginner | Biết cơ bản, cần hướng dẫn sát |
| 2 | Developing | Đang học, làm được với support |
| 3 | Proficient | Làm tốt, ít cần support |
| 4 | Advanced | Làm rất tốt, có thể mentor người khác |
| 5 | Expert | Chuẩn mực trong lĩnh vực này |

**Tần suất:** Mỗi quý 1 lần (Q1/Q2/Q3/Q4). Bộ câu hỏi không đổi để đảm bảo tính so sánh theo thời gian.

**Deadline:** Nhân sự hoàn thành trong tuần đầu của quý mới. Admin complete review trong 2 tuần đầu.

---

### 4.2 Personality Assessments

#### Big Five (OCEAN) — Ưu tiên #1
- **Framework:** International Personality Item Pool (IPIP) — open source, validated, không bản quyền
- **Số câu:** 50 câu (rút gọn từ IPIP-300, đủ độ tin cậy cho internal use)
- **Library:** `bigfive-web` (GitHub: maccyber/bigfive-web) — MIT license, có scoring engine sẵn
- **Dimensions:** Openness · Conscientiousness · Extraversion · Agreeableness · Neuroticism
- **Tần suất:** 1 lần/năm (ổn định hơn skill, ít thay đổi theo quý)

#### DISC — Ưu tiên #2
- **Framework:** William Marston's DISC model (public domain)
- **Số câu:** 24 câu, dạng Most Like / Least Like
- **Implementation:** Custom — không có npm package chính thức nhưng algorithm public domain
- **Types:** Dominance (D) · Influence (I) · Steadiness (S) · Conscientiousness (C)
- **Output:** Primary type + secondary type + behavioral description
- **Tần suất:** 1 lần/năm

---

### 4.3 Numerology (Thân số học)

**Calculation:** Tự động từ ngày sinh của nhân sự, không cần nhân sự làm gì.

**Library đề xuất:** `numeroljs` (`npm i numeroljs`) — tính Life Path, Expression, Soul Urge

**Các số cần hiển thị:**
| Số | Tên | Cách tính |
|----|-----|-----------|
| Life Path Number | Số Đường Đời | Cộng và rút gọn toàn bộ ngày sinh |
| Expression Number | Số Biểu Đạt | Convert tên → số theo bảng Pythagorean |
| Soul Urge Number | Số Linh Hồn | Chỉ dùng nguyên âm trong tên |
| Birthday Number | Số Ngày Sinh | Ngày sinh rút gọn |

**Nội dung giải thích (ý nghĩa):** Cần viết custom text tiếng Việt cho từng con số 1–9 (và master numbers 11, 22, 33). Không dùng text mặc định tiếng Anh từ library.

---

### 4.4 Bát tự (四柱 / Tứ Trụ)

**Calculation:** Tự động từ ngày giờ sinh, không cần nhân sự làm gì (ngoài cung cấp giờ sinh nếu có).

**Library đề xuất:** `lunar-javascript` (GitHub: 6tail/lunar-javascript) — well-maintained, comprehensive, hỗ trợ âm lịch + can chi + bát tự + ngũ hành

**Dữ liệu hiển thị (summary mode, không full chart):**
| Field | Ví dụ |
|-------|-------|
| Tứ Trụ | Giáp Tý · Bính Dần · Mậu Thìn · Canh Ngọ |
| Ngũ Hành chủ | Thổ (Earth) |
| Nhật Chủ (Day Master) | Mậu Thổ |
| Vượng/Nhược | Vượng |
| Hỉ Dụng Thần | Hỏa · Thổ |

> **Note:** Hiển thị dạng summary card — không cần vẽ full Bát Tự chart phức tạp. Mục đích là cung cấp context nhanh cho Admin để hiểu tính cách nền tảng, không phải để xem tử vi chi tiết.

---

## 5. Data Model

### 5.1 Prisma Schema

```prisma
model Personnel {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  // Profile info
  position    PersonnelPosition  // MARKETING | MEDIA | ACCOUNT
  startDate   DateTime
  birthDate   DateTime?
  birthTime   String?            // "HH:MM" — for Bát tự hour pillar
  birthPlace  String?            // timezone reference
  
  // Auto-calculated (stored for performance)
  numerologyData Json?   // { lifePath, expression, soulUrge, birthday }
  baziData       Json?   // { yearPillar, monthPillar, dayPillar, hourPillar, dayMaster, element }
  
  // Assessment results
  skillAssessments     SkillAssessment[]
  personalityResults   PersonalityResult[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
  @@index([position])
}

enum PersonnelPosition {
  MARKETING
  MEDIA
  ACCOUNT
}

model SkillAssessment {
  id           String   @id @default(cuid())
  personnelId  String
  personnel    Personnel @relation(fields: [personnelId], references: [id])
  
  quarter      String   // "2026-Q1", "2026-Q2", etc.
  assessorType AssessorType  // SELF | MANAGER
  assessorId   String        // userId of who submitted
  
  // Scores stored as JSON — flexible per position
  jobSkills     Json  // { "Digital Advertising": 4, "Content Strategy": 3, ... }
  generalSkills Json  // { "Communication": 4, "Time Management": 3, ... }
  personalSkills Json // { "Ngoại ngữ": 3, "Sức khỏe thể chất": 4, ... }
  
  submittedAt  DateTime @default(now())
  
  @@unique([personnelId, quarter, assessorType])
  @@index([personnelId])
  @@index([quarter])
}

enum AssessorType {
  SELF
  MANAGER
}

model PersonalityResult {
  id           String    @id @default(cuid())
  personnelId  String
  personnel    Personnel @relation(fields: [personnelId], references: [id])
  
  testType     PersonalityTestType  // BIG_FIVE | DISC
  year         Int                  // 2026, 2027, ...
  results      Json                 // raw scores per dimension
  summary      Json                 // { primaryType, secondaryType, description }
  
  completedAt  DateTime @default(now())
  
  @@unique([personnelId, testType, year])
  @@index([personnelId])
}

enum PersonalityTestType {
  BIG_FIVE
  DISC
}
```

### 5.2 API Routes

```
GET    /api/personnel                    — list (admin: all, user: own only)
GET    /api/personnel/:id                — profile detail
POST   /api/personnel                    — create profile (admin)
PUT    /api/personnel/:id                — update profile (admin)

GET    /api/personnel/:id/assessments    — assessment history
POST   /api/personnel/:id/assessments    — submit assessment (self or manager)

GET    /api/personnel/:id/personality    — personality test history
POST   /api/personnel/:id/personality/:testType  — submit personality result

GET    /api/personnel/:id/jira-tasks     — proxy to Jira KKDS (live)
GET    /api/personnel/:id/smitos-metrics — aggregated from DailyReport + reports
```

---

## 6. UI Structure

### 6.1 Personnel List Page (`/personnel`)

**Layout:** Grid view — 3 columns desktop, 2 columns tablet, 1 column mobile

**Personnel Card:**
```
┌─────────────────────────────────┐
│ [Avatar]  Nguyễn Văn A          │
│           Marketing · 1y 3m     │
│                                 │
│  [Mini Radar Chart — 3 overlaid]│
│                                 │
│  ● On Track  │ 3 tasks open     │
│  Last assessment: Q1 2026       │
│                                 │
│  [View Profile]                 │
└─────────────────────────────────┘
```

**Status badges:**
- 🟢 `On Track` — tất cả metrics bình thường
- 🟡 `Needs Attention` — 1–2 flags
- 🔴 `At Risk` — ≥ 3 flags hoặc có flag nghiêm trọng

**Auto-flag logic:**
- Skill score giảm ≥ 1 điểm so với quý trước (bất kỳ skill nào)
- Jira overdue tasks ≥ 3
- Daily report submission rate < 80% trong tháng hiện tại
- KR progress < 50% khi còn ≤ 2 tuần trong quý
- Chưa hoàn thành quarterly assessment sau 2 tuần vào quý mới

---

### 6.2 Individual Profile — Dialog/Drawer

Click vào card mở Profile Panel (full-page drawer hoặc large dialog). Gồm 4 zones:

#### Zone A — Skill Development

3 tab nhỏ: **Job Skills** · **General Skills** · **Personal Skills**

Mỗi tab:
- Radar chart chính — hiển thị tối đa 4 quý gần nhất (mỗi quý một màu từ `chartColors.series`)
- Legend: Q1/Q2/Q3/Q4 + Self vs Manager toggle
- Bên dưới: table điểm số chi tiết từng skill theo quý

```
Radar: Q1 (dim) → Q2 (dim) → Q3 (bright) = trend visible
Toggle: [Self] [Manager] [Both]
```

#### Zone B — Personality & Innate Profile

4 cards nhỏ xếp 2×2:

**DISC Card:**
- Primary type badge (D/I/S/C) với màu riêng
- Bar chart 4 dimension (D, I, S, C)
- 2-line description phong cách làm việc

**Big Five Card:**
- Horizontal bar chart 5 dimension (O, C, E, A, N)
- Highlight dimension cao nhất và thấp nhất

**Numerology Card:**
- Life Path Number (lớn, nổi bật)
- Expression · Soul Urge · Birthday (nhỏ hơn)
- Mô tả ngắn Life Path Number bằng tiếng Việt

**Bát tự Card:**
- Ngũ hành chủ + icon element
- Nhật Chủ
- Hỉ Dụng Thần (màu sắc hợp)
- 4 pillars dạng text (Thiên Can · Địa Chi)

#### Zone C — Jira Task Overview (Live)

Kết nối Jira KKDS cloudId: `ba86c0eb-afcd-40b5-bf8c-541e25dbb45a`

```
┌── Jira Overview ──────────────────────────────┐
│  Total: 12   Done: 7   In Progress: 3         │
│  To Do: 1    Blocked: 1   Overdue: 2 ⚠️        │
│                                               │
│  Completion Rate (30d): 78%                   │
│  [progress bar]                               │
│                                               │
│  Recent Tasks:                                │
│  ● KKDS-142  Setup landing page  In Progress  │
│  ● KKDS-138  Client call report  Done ✓       │
│  ● KKDS-135  Weekly report Q1    Overdue ⚠️   │
│  [See all in Jira →]                          │
└───────────────────────────────────────────────┘
```

Query mặc định: `project = KKDS AND assignee = {jiraAccountId} ORDER BY updated DESC`

#### Zone D — SMIT-OS Performance (Live)

Kết nối SMIT-OS MCP: `mcp__smitos__list_daily_reports`, `mcp__smitos__kr_progress`

```
┌── SMIT-OS Snapshot ───────────────────────────┐
│  Chuyên cần tháng này: 18/22 ngày (82%) ✅    │
│  [Calendar heatmap — green/red per day]       │
│                                               │
│  KPI Trending (vị trí: Account):             │
│  Doanh thu: ↑ 45M (target: 50M — 90%)        │
│  Deals closed: 8 (target: 10)                 │
│  Số cuộc gọi: 47 (avg: 40) ↑                 │
│                                               │
│  KR Progress Q2 2026:                         │
│  KR-1 Doanh thu cá nhân: ████░ 72%           │
│  KR-2 Số khách hàng mới: ███░░ 60%           │
│                                               │
│  ⚠️ Flags từ PM: "Cần cải thiện follow-up"   │
└───────────────────────────────────────────────┘
```

KPI hiển thị theo vị trí:
- **Marketing:** Leads generated, ad spend efficiency, campaigns launched
- **Account:** Doanh thu, deals closed, số cuộc gọi, tỉ lệ chốt
- **Media:** Số deliverables, revision rate, on-time delivery rate

---

## 7. Dashboard Personnel Tab

Tab "Personnel" trong `/dashboard` — cho Admin xem team overview nhanh.

### 7.1 Team Grid

Mini card cho từng nhân sự:
- Avatar + tên + vị trí
- Status badge (On Track / Needs Attention / At Risk)
- Tiny radar snapshot
- Số Jira tasks open + overdue count

### 7.2 Individual Drill-down (Hướng B — Individual Progress)

Click vào nhân sự → slide-in panel với:

**Timeline View:**
- Line chart — điểm tổng trung bình 3 nhóm skill theo quý
- Highlight quý có improvement lớn nhất (↑) và regression (↓)
- Annotation: "Q2: Tăng 0.8 điểm Job Skills sau training campaign"

**Skill Delta Table:**
| Skill | Q1 | Q2 | Q3 | Δ vs Q1 |
|-------|----|----|----|---------| 
| Digital Advertising | 3 | 3.5 | 4 | +1 ↑ |
| AI-Powered Marketing | 2 | 2.5 | 3.5 | +1.5 ↑ |
| CRO | 4 | 3.5 | 3 | -1 ↓⚠️ |

**Jira + SMIT-OS summary** (condensed version của Zone C + D trong Profile)

**PM Notes:** Text area cho Admin note coaching points cho nhân sự này theo quý. Lưu vào DB, hiển thị lại ở quý tiếp theo làm reference.

---

## 8. Libraries & Tech Stack

| Thư viện | Mục đích | Install |
|----------|----------|---------|
| `lunar-javascript` | Bát tự / tứ trụ calculation | `npm i lunar-javascript` |
| `numeroljs` | Numerology (Life Path, Expression, Soul Urge) | `npm i numeroljs` |
| `recharts` | Radar chart, bar chart, line chart — đã có sẵn | ✅ already installed |

**Big Five assessment engine:** Fork scoring logic từ [bigfive-web](https://github.com/maccyber/bigfive-web) (MIT license). Lấy câu hỏi IPIP-50 (rút gọn từ IPIP-300), tự host trong `server/data/bigfive-questions.json`. Translate sang tiếng Việt.

**DISC assessment:** Custom implementation. Câu hỏi (24 items × 4 words) và scoring algorithm viết tay dựa trên William Marston's model (public domain). Lưu trong `server/data/disc-questions.json`.

**Jira Integration:** Dùng `mcp__a1019570__searchJiraIssuesUsingJql` trực tiếp từ backend hoặc MCP proxy. cloudId: `ba86c0eb-afcd-40b5-bf8c-541e25dbb45a`, project: KKDS.

**SMIT-OS Integration:** Dùng internal API calls đến SMIT-OS MCP endpoints: `list_daily_reports`, `kr_progress`, `revenue_summary`, `call_performance`.

---

## 9. File Structure Dự kiến

```
src/
├── pages/v5/
│   └── personnel/
│       ├── personnel-page.tsx          ← list view
│       ├── personnel-profile-panel.tsx ← individual drawer
│       └── personnel-dashboard-tab.tsx ← dashboard widget
│
├── components/features/personnel/
│   ├── personnel-card.tsx              ← grid card
│   ├── skill-radar-panel.tsx           ← zone A
│   ├── personality-profile-panel.tsx   ← zone B
│   ├── jira-task-widget.tsx            ← zone C
│   ├── smitos-performance-widget.tsx   ← zone D
│   ├── skill-assessment-form.tsx       ← quarterly input form
│   ├── personality-test-modal.tsx      ← Big Five / DISC test UI
│   └── status-badge.tsx                ← On Track / Needs Attention / At Risk
│
├── hooks/
│   ├── use-personnel.ts                ← list + profile queries
│   ├── use-skill-assessments.ts        ← assessment history
│   └── use-personality-results.ts      ← personality data
│
└── lib/
    ├── numerology.ts                   ← wrapper cho numeroljs
    ├── bazi.ts                         ← wrapper cho lunar-javascript
    ├── disc-scoring.ts                 ← DISC algorithm
    └── bigfive-scoring.ts              ← Big Five scoring engine

server/
├── routes/
│   └── personnel.ts                   ← all /api/personnel routes
├── data/
│   ├── bigfive-questions.json          ← IPIP-50 questions (Vietnamese)
│   └── disc-questions.json            ← 24 DISC items (Vietnamese)
└── lib/
    └── numerology-bazi.ts             ← server-side calculation
```

---

## 10. Phân Phase Triển Khai

### Phase 1 — Core Profile (Priority: P1)
- [ ] Prisma schema + migration
- [ ] `Personnel` CRUD API
- [ ] Personnel list page với grid layout
- [ ] Profile drawer — Zone A (Skill Radar, self-assessment only)
- [ ] Skill Assessment form (quarterly, Likert 1–5)
- [ ] Sidebar: thêm Personnel vào Acquisition group
- [ ] Access control middleware

### Phase 2 — Dual Assessment + Personality (Priority: P2)
- [ ] Manager assessment overlay trên Radar chart
- [ ] Quarterly assessment flow + reminders (notification)
- [ ] Big Five test UI + scoring engine
- [ ] DISC test UI + custom scoring
- [ ] Zone B: Personality profile cards
- [ ] Numerology + Bát tự auto-calculation và display

### Phase 3 — Live Integration + Dashboard (Priority: P2)
- [ ] Zone C: Jira task widget (live query)
- [ ] Zone D: SMIT-OS performance snapshot (live)
- [ ] Auto-flag logic (On Track / Needs Attention / At Risk)
- [ ] Dashboard Personnel Tab với team grid + drill-down
- [ ] PM Notes per quarter per person
- [ ] Skill delta table + trend line

### Phase 4 — Advanced Analytics (Priority: P3)
- [ ] Team skill gap heatmap (vs position benchmark)
- [ ] Cross-team comparison (anonymous)
- [ ] Development recommendation engine (AI-suggested focus areas)
- [ ] PDF export cho performance review 1-on-1

---

## 11. Non-Goals (Không làm trong scope này)

- Public-facing employee directory
- Integration với HR payroll system
- Automated salary adjustment based on scores
- 360° peer review (chỉ self + manager, không peer)
- Real-time collaboration trên assessment
- Mobile-native app (responsive web là đủ)

---

*Generated by CoworkOS-Dominium | 2026-05-16 | CONFIDENTIAL*
