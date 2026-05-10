# Báo cáo Brainstorm: Bổ sung Ads Tracker + Media Tracker — Đổi tên nhóm CRM thành Acquisition

**Ngày:** 2026-05-10 02:37 (Asia/Saigon)
**Người yêu cầu:** Quân Bá
**Trạng thái:** Brainstorm-only, chưa implement

---

## 1. Vấn đề & Yêu cầu

User muốn:
1. Thêm 2 items vào sidebar cùng nhóm với Lead Tracker: **Ads Tracker**, **Media Tracker**
2. Đổi tên nhóm "CRM" hiện tại vì không còn phù hợp
3. Cần tư vấn cấu trúc, tên nhóm, scope phase đầu

**Sidebar hiện tại** (`src/components/layout/Sidebar.tsx`):
```
ANALYTICS    → Dashboard
PLANNING     → OKRs
RITUALS      → Daily Sync, Weekly Checkin
CRM          → Lead Tracker
```

---

## 2. Câu trả lời ngắn

| Hạng mục | Quyết định |
|---|---|
| Tên nhóm mới | **`ACQUISITION`** (KISS, không subtitle) |
| Items & order | Overview → Media → Ads → Lead (funnel order) |
| Audience | Leadership (xem dashboard tổng) |
| Quan hệ 3 module | Funnel liên kết qua `utm_source` / `utm_campaign` |
| Data source | API tự động (Meta đã có sẵn, Google/TikTok cần apply) |
| Scope phase | **Approach C — Full vision**, decompose thành 6 sub-phases |

---

## 3. Phân tích lựa chọn tên nhóm

### Lý do "CRM" không còn đúng

CRM = Customer Relationship Management → bản chất **post-conversion** (account, support, retention). Trong khi Ads/Media Tracker thuộc **pre-conversion** (acquisition funnel). Để chung nhóm CRM = sai semantic, sau này khi có Customer Success / Retention sẽ chồng chéo.

### So sánh 4 candidate

| Tên | Pros | Cons |
|---|---|---|
| **Acquisition** ⭐ | Chính xác functional, phân biệt rõ với CRM/Retention sau này, executive-friendly | Hơi từ chuyên môn |
| Growth | Trendy, ngắn, startup-style | Mơ hồ — bao gồm cả retention/expansion |
| Marketing | Ai cũng hiểu | Lead Tracker là sale handover → gây nhầm với Sales team |
| Funnel | Mô tả đúng cấu trúc | Generic, không truyền tải khí chất |

→ User chọn **Acquisition** (đúng nhất về semantic).

---

## 4. Cấu trúc sidebar đề xuất

```
ANALYTICS
  • Dashboard

PLANNING
  • OKRs

RITUALS
  • Daily Sync
  • Weekly Checkin

ACQUISITION                     ← rename từ CRM
  • Overview         (mới)      ← KPI tổng leadership
  • Media Tracker    (mới)      ← earned + owned media
  • Ads Tracker      (mới)      ← paid + attribution
  • Lead Tracker     (giữ)      ← conversion
```

### Chi tiết 4 items

| Item | Icon (Material) | Route | Scope |
|---|---|---|---|
| Overview | `insights` | `/acquisition` | Aggregate dashboard: total spend, lead, CPL, ROAS, top channels |
| Media Tracker | `campaign` | `/media-tracker` | Owned (FB/IG/TikTok posts), Earned (KOL/KOC, PR, mentions) |
| Ads Tracker | `ads_click` | `/ads-tracker` | Paid campaigns: Meta, Google, TikTok. Spend, ROAS, CPL, attribution |
| Lead Tracker | `person_search` | `/lead-tracker` | Giữ nguyên |

### Order rationale: funnel top-down

```
Brand awareness ──▶ Paid acquisition ──▶ Conversion
   Media               Ads                  Lead
```

Leadership đọc top-down giống funnel chart → trực giác. Overview ở trên cùng vì là entry point cho leadership.

---

## 5. Hiện trạng codebase — Insight quan trọng

**SMIT-OS đã có sẵn integration Meta Graph API** (~390 LOC):

| File | LOC | Chức năng |
|---|---|---|
| `server/lib/facebook-api.ts` | 90 | Gọi `/act_<ID>/insights` lấy ad spend |
| `server/services/facebook/fb-sync.service.ts` | 200 | Sync job |
| `server/services/dashboard/overview-ad-spend.ts` | 100 | Aggregate cho dashboard |
| `prisma/schema.prisma` | — | Model `FbAdAccountConfig`, `RawAdsFacebook` |

→ **Risk "Meta App Review 1-3 tuần" KHÔNG áp dụng**. Token đã work, schema đã có. Ads Tracker (phần Meta) chỉ cần extend.

→ **Risk còn lại:** Google Ads Standard Access (1-2 tuần apply), TikTok Marketing API approval.

Chi tiết thêm: xem `plans/reports/brainstorm-260509-1243-meta-ads-mcp-vs-graph-api.md`.

---

## 6. Decompose Approach C thành 6 phases ship-incremental

> **Brutal honesty:** Ship Approach C "big bang" 1.5-2 tháng = rủi ro cực cao. Phải chia nhỏ ship liên tục để leadership có giá trị mỗi tuần. Mỗi phase dưới đây là 1 PR độc lập, có thể demo được.

### Phase 1 — Sidebar restructure (1 ngày) ⭐ ship ngay

- Rename `CRM` → `Acquisition` trong `Sidebar.tsx`
- Thêm 4 NavItem: Overview, Media Tracker, Ads Tracker, Lead Tracker
- Reorder: Media → Ads → Lead
- 3 stub pages "Coming Soon" cho Overview/Media/Ads
- Update breadcrumb trong `LeadTracker.tsx` (đang hardcode "CRM")
- Routes mới trong `App.tsx`

**Files cần đụng:**
- `src/components/layout/Sidebar.tsx`
- `src/App.tsx` (3 routes mới + 3 lazy imports)
- `src/pages/LeadTracker.tsx` (breadcrumb)
- `src/pages/AcquisitionOverview.tsx` (stub mới)
- `src/pages/MediaTracker.tsx` (stub mới)
- `src/pages/AdsTracker.tsx` (stub mới)

**Ship test:** Vào sidebar thấy 4 items mới, click không 404, breadcrumb "Acquisition > Lead Tracker".

### Phase 2 — Database schema cho Ads & Media (2-3 ngày)

Mở rộng schema để support attribution. Shared dimension là `utm_*` (Lead Tracker đã có sẵn cột source).

**Models mới cần thêm:**

```prisma
model AdCampaign {
  id            String   @id @default(uuid())
  platform      AdPlatform  // META | GOOGLE | TIKTOK
  externalId    String   // campaign_id từ platform
  name          String
  utmCampaign   String?  // matching key với Lead.source
  status        String
  startedAt     DateTime?
  endedAt       DateTime?
  spendRecords  AdSpendRecord[]
  @@unique([platform, externalId])
}

model AdSpendRecord {
  id          String   @id @default(uuid())
  campaignId  String
  date        DateTime @db.Date
  spend       Decimal  @db.Decimal(12, 2)
  impressions Int
  clicks      Int
  conversions Int      // tracked tại platform side
  campaign    AdCampaign @relation(...)
  @@unique([campaignId, date])
}

model MediaPost {
  id          String   @id @default(uuid())
  platform    MediaPlatform  // FB | IG | TIKTOK | YOUTUBE | BLOG
  externalId  String?  // post id từ platform
  url         String?
  publishedAt DateTime
  reach       Int      @default(0)
  engagement  Int      @default(0)
  utmCampaign String?
  type        String   // organic | kol | pr
  meta        Json?    // KOL name, PR outlet, etc.
}

enum AdPlatform { META GOOGLE TIKTOK }
enum MediaPlatform { FACEBOOK INSTAGRAM TIKTOK YOUTUBE BLOG OTHER }
```

**Lưu ý:**
- `RawAdsFacebook` (đang có) là raw layer → giữ. `AdSpendRecord` là normalized layer cho UI.
- ETL job: raw → normalized.
- Encrypt token cho Google/TikTok (đã có pattern `server/lib/crypto.ts`).

### Phase 3 — Ads Tracker MVP (1.5-2 tuần)

**Phase 3a — Meta extension (3-5 ngày):** leverage code có sẵn
- Extend `facebook-api.ts` lấy thêm field campaign-level (đang chỉ có account-level spend)
- ETL job: raw → `AdCampaign` + `AdSpendRecord`
- UI list campaigns, daily spend chart, ROAS

**Phase 3b — Attribution với Lead Tracker (2-3 ngày):**
- Join `Lead.source` (đã có) với `AdCampaign.utmCampaign`
- Tính CPL = spend / leads, ROAS = revenue / spend
- Bảng "Lead by campaign" để Sales drill down

**Phase 3c — Google Ads (5-7 ngày, parallel với 3a):**
- Apply Standard Access ngay đầu Phase 1 (vì 1-2 tuần wait)
- OAuth flow + MCC account setup
- ETL tương tự Meta

**Phase 3d — TikTok Ads (3-5 ngày, optional, defer nếu không cần):**
- App approval flow
- Implement nếu Meta + Google chưa đủ insight

**Risks Phase 3:**
- ⚠️ Google Ads developer token — apply ngay từ Phase 1 để không block
- ⚠️ Token expire mid-cron — implement refresh logic + alert
- ⚠️ Attribution gãy nếu marketing team không nhất quán đặt UTM — cần guideline + validation

### Phase 4 — Media Tracker MVP (2-3 tuần)

**Phase 4a — Owned media (1 tuần):**
- Reuse FB token: gọi `/me/feed` cho Facebook Page posts
- Instagram Graph API: `/me/media` (cùng FB Business token)
- TikTok Business API: `/business/posts` (cần app approval, defer nếu chưa)
- YouTube Data API (free quota generous)

**Phase 4b — KOL/KOC tracker (5-7 ngày):**
- Manual entry (không có API thống nhất)
- Form: KOL name, platform, deliverables, cost, post URL, performance manual update
- Schema: extend `MediaPost.type = 'kol'`, `meta.kolName`

**Phase 4c — Earned/PR (3-5 ngày):**
- MVP: manual entry (PR outlet, headline, URL, sentiment manual)
- Tích hợp brand listening tool (Mention, Brand24) → defer Phase 5+

**Risks Phase 4:**
- ⚠️ KOL data không có API → marketing team phải nhập tay → cần UX nhanh, mass-import CSV
- ⚠️ Engagement data IG/TikTok delay 24-48h — cron mỗi ngày là đủ

### Phase 5 — Acquisition Overview dashboard (1 tuần)

- Aggregate query: sum spend (Ads), sum leads (Lead), sum reach (Media) trong date range
- Charts: spend trend line, lead trend line, top 5 channels by ROAS
- Date range filter (default 30d)
- Drill-down link → từng tracker

**Lưu ý:** chỉ build sau khi Phase 3+4 đã có data thật. Nếu build trước = chart rỗng = vô nghĩa.

### Phase 6 — Polish & permissions (3-5 ngày)

- RBAC: định nghĩa role `Marketing` mới hoặc reuse `isAdmin`/Leader pattern
  - Marketing: CRUD media post, view ads (read-only)
  - Sales: view attribution lead → ads
  - Leadership: view all
- CSV export Ads + Media (giống Lead Tracker)
- Weekly digest email cho leadership (nếu Phase 5 đã ổn)

---

## 7. Sequencing & timeline ước tính

```
Tuần 1     [Phase 1: Sidebar] ─┬──▶ ship
                                │
                                └─▶ Apply Google Ads access (parallel, 1-2 tuần wait)

Tuần 1-2   [Phase 2: Schema] ──▶ ship migration

Tuần 2-4   [Phase 3a Meta] ─┬──▶ ship Ads Tracker v1 (Meta only)
                             │
Tuần 3-4   [Phase 3b Attr] ──┴──▶ ship attribution

Tuần 4-5   [Phase 3c Google] ─▶ ship Google Ads (sau khi token approved)

Tuần 5-7   [Phase 4a Owned]
           [Phase 4b KOL]    ─▶ ship Media Tracker v1
           [Phase 4c PR]

Tuần 7-8   [Phase 5: Overview] ─▶ ship dashboard

Tuần 8     [Phase 6: Polish]    ─▶ ship final
```

**Total: ~6-8 tuần** (vs 1.5-2 tháng nếu big-bang).

**Critical path:** Phase 1 (1 ngày) cần ship NGAY để có sidebar shell + Apply Google Ads access song song. Mất ngày nào ở Phase 1 = block toàn bộ chuỗi.

---

## 8. Risk register & mitigation

| Risk | Severity | Mitigation |
|---|---|---|
| Google Ads Standard Access reject | 🔴 High | Apply Phase 1, prepare test account + code review materials sớm. Backup plan: dùng Google Ads API Test Account cho dev, prod chậm 1-2 tuần |
| TikTok app approval reject | 🟡 Medium | Defer TikTok đến Phase 3d, không block Phase 5 Overview |
| Marketing team không đặt UTM nhất quán | 🟡 Medium | Phase 3b: tạo guideline + validation rule. Cảnh báo nếu lead.source không match campaign |
| Meta token expire / rotate | 🟡 Medium | Reuse logic encryption từ TOTP secret, alert khi token gần hết hạn |
| KOL/PR scope creep (full CRM cho influencer) | 🟡 Medium | Phase 4b chỉ track basic: name, cost, URL, performance. Không build CRM riêng cho KOL |
| Overview rỗng vì chưa có data | 🟢 Low | Đã rule: Phase 5 chỉ build sau Phase 3+4 |
| Encrypted token storage | 🟢 Low | Đã có pattern `server/lib/crypto.ts` |
| Cron retry / error handling | 🟢 Low | Đã có pattern `EtlErrorLog` |

---

## 9. Quyết định cần user xác nhận khi tạo plan

1. **Google Ads developer token** — apply ngay từ Phase 1 hay đợi Phase 3 (NẾU đợi → block 1-2 tuần)
2. **TikTok Ads** — include trong scope hay defer
3. **KOL/PR** — full tracker hay chỉ list view manual entry
4. **Brand listening tool** — defer hay budget cho Phase 5+ ($30-100/tháng cho Mention/Brand24)
5. **Permission model** — tạo role `Marketing` mới hay reuse Admin/Leader hiện tại

---

## 10. Success metrics

**Phase 1 (Sidebar):** ship trong 1 ngày, không 404, breadcrumb đúng.
**Phase 3 (Ads):** leadership thấy được total spend + ROAS theo campaign + CPL trong 1 view.
**Phase 4 (Media):** content calendar có data ≥ 80% post thực tế trong tháng.
**Phase 5 (Overview):** leadership 1 click → KPI tổng. Time-to-insight < 30s.
**Tổng:** marketing team không còn dùng Excel/Google Sheets để track ads/media sau Phase 6.

---

## 11. Files & references

**Sẽ đụng:**
- `src/components/layout/Sidebar.tsx`
- `src/App.tsx`
- `src/pages/LeadTracker.tsx`
- `src/pages/AcquisitionOverview.tsx` (mới)
- `src/pages/MediaTracker.tsx` (mới)
- `src/pages/AdsTracker.tsx` (mới)
- `prisma/schema.prisma` (Phase 2)
- `server/lib/facebook-api.ts` (extend Phase 3a)
- `server/services/facebook/fb-sync.service.ts` (extend Phase 3a)
- Các file mới cho Google Ads, TikTok, Media platforms

**References:**
- `plans/reports/brainstorm-260509-1243-meta-ads-mcp-vs-graph-api.md` — phân tích Meta Graph API hiện tại
- `docs/system-architecture.md` — kiến trúc tổng

---

## 12. Unresolved questions

1. Google Ads MCC account đã có chưa? Nếu chưa → apply ngay (extra 1 tuần)
2. Marketing team hiện đang dùng tool gì (Excel, Notion, Hootsuite) để có thể migrate data?
3. Có muốn import historical ads/media data hay chỉ track từ ngày go-live?
4. Budget cho brand listening tool (Phase 4c+) đã được approve chưa?
5. Permission: founder/CEO có cần role riêng "Executive" để view-only không, hay reuse `isAdmin`?
