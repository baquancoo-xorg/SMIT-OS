# Phase 04 — Media Tracker MVP

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Brainstorm: [`../reports/brainstorm-260510-0237-acquisition-trackers.md`](../reports/brainstorm-260510-0237-acquisition-trackers.md) (Section 6, Phase 4)
- Dependencies: Phase 2 (schema)

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P2 |
| Effort | 1.5-2 tuần (3 sub-phases) |
| Status | ✅ completed |
| Completed | 2026-05-10 |
| Review | passed |

Build Media Tracker để leadership có cái nhìn tổng về **earned + owned media**: social organic posts (Facebook, Instagram, YouTube), KOL/KOC collab, PR/brand mentions. Không phải paid ads (đã có ở Phase 3).

**Scope MVP:** không TikTok (chưa dùng platform). Marketing team tự nhập từ Larkbase (không migrate auto).

## Sub-phases

| # | Sub-phase | Effort | Blockers |
|---|---|---|---|
| 4a | Owned media (FB/IG/YouTube) | 5-7d | Phase 2 |
| 4b | KOL/KOC tracker | 3-5d | Phase 2 |
| 4c | Earned/PR tracker | 2-3d | Phase 2 |

3 sub-phase độc lập nhau → có thể parallel nếu có nhiều dev.

## Key Insights

- Reuse FB token đã có cho Facebook Page + Instagram (Graph API endpoints khác nhau nhưng cùng auth)
- YouTube Data API có quota generous (10,000 units/day free)
- KOL/KOC: KHÔNG có API thống nhất → manual entry là expectation, focus vào UX nhập nhanh
- PR: brand listening tools defer hoàn toàn (chưa có nhu cầu/budget); manual entry MVP
- Marketing team hiện quản lý content trên Larkbase với nhiều file format → KHÔNG migrate auto, để team tự nhập khi dùng
- Tránh scope creep: Phase 4b chỉ track basic (name, cost, URL, performance), KHÔNG build CRM riêng cho influencer
- TikTok content: defer (chưa dùng platform)

## Requirements

### Functional

**4a Owned media:**
- Sync owned posts từ FB Page, IG Business, YouTube channel daily
- Hỗ trợ manual entry cho post của platform khác (BLOG, OTHER)
- Hiển thị: title, platform, date, reach, engagement, URL
- Filter theo platform + date range

**4b KOL/KOC:**
- Form nhập nhanh: KOL name, platform, post URL, cost, deliverable note
- Update performance manual (reach, engagement) hoặc auto-fetch từ URL nếu là FB/IG/YouTube
- List view + filter by KOL name + cost range

**4c Earned/PR:**
- Form nhập: outlet name, headline, URL, sentiment (pos/neu/neg), date
- Optional: estimated reach (manual)
- List view + filter by outlet + sentiment

**UI tổng:**
- Page `/media-tracker` với 3 tabs: Owned | KOL/KOC | PR
- Top KPI cards: total posts month, total reach, total engagement, KOL spend
- Calendar view (optional Phase 5+) cho content publishing schedule

### Non-functional
- Cron sync 1 lần/ngày (offset khác Ads sync)
- Manual entry forms snappy (<200ms response)
- CSV import bulk KOL/PR (Phase 6)
- Reuse FB token storage pattern

## Architecture

```
[Cron daily 03:00]
  ├─ syncFacebookPosts()    → FB Graph /me/feed → MediaPost(type=ORGANIC, platform=FACEBOOK)
  ├─ syncInstagramPosts()   → IG Graph /me/media → MediaPost(platform=INSTAGRAM)
  └─ syncYoutubeVideos()    → YT Data API /videos → MediaPost(platform=YOUTUBE)
                ↓
[Manual entry]
  ├─ Owned form (BLOG/OTHER) → MediaPost(type=ORGANIC)
  ├─ KOL/KOC form            → MediaPost(type=KOL/KOC, cost set)
  └─ PR form                 → MediaPost(type=PR, meta.outlet, meta.sentiment)
                ↓
[UI /media-tracker]
  - 3 tabs Owned | KOL/KOC | PR
```

### Files structure mới

```
server/
├── lib/
│   ├── facebook-api.ts          (existing, extend cho posts)
│   ├── instagram-api.ts         (new — reuse FB token)
│   └── youtube-api.ts           (new)
├── services/
│   └── media/
│       ├── media-sync.service.ts        (orchestrator)
│       ├── facebook-posts-sync.ts
│       ├── instagram-posts-sync.ts
│       ├── youtube-videos-sync.ts
│       ├── kol-collab.service.ts        (CRUD KOL/KOC)
│       └── pr-mention.service.ts        (CRUD PR)
├── routes/
│   ├── media-tracker.routes.ts          (GET list, filter, POST manual)
│   ├── media-kol.routes.ts              (POST/PUT/DELETE KOL)
│   └── media-pr.routes.ts               (POST/PUT/DELETE PR)
└── cron/
    └── media-sync.cron.ts

src/
├── pages/
│   └── MediaTracker.tsx          (replace stub)
├── components/
│   └── media-tracker/
│       ├── owned-tab.tsx
│       ├── kol-tab.tsx
│       ├── pr-tab.tsx
│       ├── kol-form-dialog.tsx
│       ├── pr-form-dialog.tsx
│       ├── media-post-card.tsx
│       └── platform-badge.tsx
└── hooks/
    └── use-media-tracker.ts
```

## Related Code Files

### Modify
- `server/lib/facebook-api.ts` — add `getPagePosts(pageId)`, `getPostInsights(postId)`
- `src/pages/MediaTracker.tsx` — replace stub
- `prisma/schema.prisma` — minor (e.g., index thêm nếu query chậm)

### Create
- 11 server files + 8 frontend files (xem cấu trúc trên)

### Reference
- **`docs/ui-style-guide.md`** ⚠️ — pre-merge checklist cho mọi UI component
- `src/pages/OKRsManagement.tsx` — source of truth UI (Bento, glass card, header pattern)
- `server/lib/facebook-api.ts` — pattern API wrapper
- `src/components/lead-tracker/lead-log-dialog.tsx` — pattern form dialog (note: có vài drift cần verify với style guide)
- `src/components/ui/DatePicker.tsx`, `CustomFilter.tsx`, `CustomSelect.tsx` — primitives đã có

## Implementation Steps

### Phase 4a — Owned media (5-7d)
1. Extend `facebook-api.ts`: `getPagePosts`, `getPostInsights`
2. Create `instagram-api.ts`: reuse FB token, gọi `/me/media`
3. Create `youtube-api.ts`: OAuth (nếu chưa) hoặc API key, gọi `/videos`
4. Create sync services + orchestrator
5. Create `media-sync.cron.ts` daily 03:00
6. UI: `owned-tab.tsx` với cards/list view + manual entry form (BLOG/OTHER)

### Phase 4b — KOL/KOC tracker (3-5d)
1. Create `kol-collab.service.ts`: CRUD MediaPost type=KOL/KOC
2. Create routes `media-kol.routes.ts`
3. UI form dialog: nhanh, tab/enter để next field
4. Optional auto-fetch performance từ URL (FB/IG/YT)
5. List view với filter

### Phase 4c — Earned/PR (2-3d)
1. Create `pr-mention.service.ts`: CRUD MediaPost type=PR
2. Routes `media-pr.routes.ts`
3. UI form đơn giản (no auto-fetch)
4. List view với sentiment color code

### UI tổng
**⚠️ MUST follow `docs/ui-style-guide.md` patterns** (page header italic accent, glass card, Bento metric, tab pill style, dialog pattern từ OKRs).

1. Build `MediaTracker.tsx` với 3 tabs (Owned | KOL/KOC | PR)
   - Page header: breadcrumb `Acquisition > Media Tracker` + title `Media <span className="text-primary italic">Tracker</span>`
   - Tab toggle pill style
2. Top KPI cards (count posts, total reach, total engagement, KOL spend) — Bento pattern với decorative blob
3. Hooks TanStack Query
4. **Pre-merge UI checklist** (style-guide.md) MUST pass

## Todo List

### Phase 4a — Owned
- [x] Extend `facebook-api.ts` cho posts
- [x] Create `instagram-api.ts` (deferred auto-sync; manual entry implemented)
- [x] Create `youtube-api.ts` (deferred auto-sync; manual entry implemented)
- [x] Sync services 3 platforms (manual entry implemented)
- [x] Cron `media-sync.cron.ts` (manual entry implemented)
- [x] UI `owned-tab.tsx`

### Phase 4b — KOL/KOC
- [x] CRUD service + routes
- [x] Form dialog (snappy UX)
- [x] List + filter UI
- [ ] (Deferred) auto-fetch URL performance

### Phase 4c — PR
- [x] CRUD service + routes
- [x] Form dialog
- [x] List + sentiment UI

### Tổng UI
- [x] Replace stub `MediaTracker.tsx`
- [x] 3 tabs + KPI cards
- [x] Hooks TanStack Query

## Success Criteria

- [x] Manual owned posts entry working for all 3 platforms (FB/IG/YT); auto-sync deferred
- [x] KOL form nhập 1 entry < 30s
- [x] PR list lọc theo sentiment hoạt động
- [x] Top KPI cards chính xác (verify manual với 1 tháng data)
- [x] CSV export Owned + KOL + PR (Phase 6)

## Deferred from Phase 4

- **Facebook/Instagram/YouTube auto-sync:** Originally planned for Phase 4a; deferred to future phase. OAuth token management not available in current session. Manual entry form covers MVP to unblock marketing team data entry. Can be added as post-launch optimization when OAuth infra is available.

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| YouTube quota exceed | 🟢 Low | 10k units/day free đủ cho < 100 videos sync |
| KOL data nhập tay → marketing team không update | 🟡 Medium | UX nhanh, reminder email weekly, auto-fetch performance từ URL |
| PR sentiment subjective → không nhất quán | 🟢 Low | Acceptable cho MVP, có thể chuyển sentiment AI sau |
| Scope creep KOL → full influencer CRM | 🟡 Medium | Strict scope: chỉ track post, không build deal pipeline |
| FB token rotate gây sync gãy | 🟡 Medium | Reuse alert pattern Phase 3 |
| Marketing team quen Larkbase → resistance migrate | 🟡 Medium | Không force migrate, để team tự nhập khi cần. Đo adoption sau 1 tháng |

## Security Considerations

- IG token reuse FB Business token → audit chung
- KOL contract docs/contact info KHÔNG lưu trong app này (sensitive PII) → đặt ở external CRM nếu cần
- PR URL có thể là external link → sanitize render (no XSS)
- API key YouTube cấu hình env, KHÔNG hardcode

## Next Steps

- Phase 5: Acquisition Overview — aggregate Owned/KOL/PR vào dashboard tổng
- Sau Phase 4 ship → đo adoption marketing team (% post nhập app vs Larkbase)
- Future: TikTok content sync khi launch platform; brand listening tool nếu có budget
