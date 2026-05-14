# Brainstorm — Media Tracker Auto-Pull from Social APIs

**Date:** 2026-05-14 10:04 (Asia/Saigon)
**Owner:** Quân Bá
**Status:** Approved → ready for `/ck:plan`

## Problem Statement

Trang `v5/MediaTracker.tsx` hiện cho phép user nhập tay từng MediaPost qua dialog. Yêu cầu: xóa toàn bộ luồng nhập tay, chuyển sang **pull tự động từ social APIs** (FB Page, FB Group trước; TikTok/IG/Threads/YT sau). Trang trở thành bảng thống kê multi-platform với filter/search/group-by + KPI cards.

## Decisions Locked (qua brainstorm Q&A)

| Vấn đề | Quyết định |
|---|---|
| Data MediaPost hiện tại | **Wipe sạch**, start fresh |
| Tab KOL/KOC & PR | **Drop hẳn** (không sở hữu channel → không auto-pull được) |
| Sync strategy | **Cron 6-12h + nút Refresh manual** |
| FB App readiness | Đã có FB App + long-lived Page Token |
| FB Group scope | Multi-group SMIT làm admin |
| Metrics schema | **Core columns + JSON `metricsExtra`** |
| Phase 1 platforms | **FB Fanpage + FB Group** |
| Table features | Full filter (Channel/Format/Date/Search) + **Group-by Channel/Format/Month** |

## Final Approach

### Architecture
```
FB Graph API ──cron 6h──▶ MediaSyncService ──upsert──▶ MediaPost (PG)
                            ▲                              │
                            └── POST /api/media/sync       │
                                (Refresh button)           ▼
                                                    React UI v5
```

### Database (Prisma)
- New enum `MediaPlatform`: `FACEBOOK_PAGE`, `FACEBOOK_GROUP`, `INSTAGRAM`, `TIKTOK`, `YOUTUBE`, `THREADS`
- New enum `MediaFormat`: `STATUS|PHOTO|VIDEO|REEL|ALBUM|LINK|EVENT`
- New model `SocialChannel` (platform, externalId, name, encrypted accessToken, tokenExpiresAt, active)
- Rewritten `MediaPost`: channelId FK + canonical metrics (reach, impressions, views, engagement, likes, comments, shares, saves) + `metricsExtra` JSON + thumbnailUrl + lastSyncedAt. Unique `(channelId, externalId)`.
- New model `MediaSyncRun` (audit each sync run, status, errors)
- **Drop:** old fields `cost`, `utmCampaign`, `createdById`, `type` (MediaPostType enum)
- Encrypt `accessToken` AES-256-GCM (reuse TOTP encryption util)

### Backend
- `src/server/services/fb-graph-client.ts` — typed Graph API client (Page posts + Group feed + insights batch)
- `src/server/services/media-sync.service.ts` — `syncChannel()`, `syncAll()`, parallel limit 3, rate-limit aware
- `src/server/cron/media-sync.cron.ts` — node-cron job `0 */6 * * *`
- `src/server/routes/media.ts` — refactor GET với params `channel, format, dateFrom, dateTo, search, groupBy, sortBy, sortDir`; DELETE old POST/PATCH/DELETE handlers
- `src/server/routes/social-channels.ts` — admin CRUD channels + manual sync trigger
- `POST /api/media/sync` (admin) — trigger refresh, return `{ fetched, errors }`

### Frontend
- `src/pages/v5/MediaTracker.tsx` — rewrite: bỏ tabs, bỏ MediaPostDialog, thêm filter bar + refresh button
- `src/components/v5/growth/media/media-filter-bar.tsx` — new, chứa channel/format/date/search/group-by selects
- `src/components/v5/growth/media/media-group-table.tsx` — new, expandable group with sticky header sum
- `src/components/media-tracker/media-posts-table.tsx` — refactor columns: Title, Channel, Format, Published, Reach, Views, Engagement, Comments, Shares, Saves
- `src/components/media-tracker/media-post-dialog.tsx` — **DELETE**
- `src/hooks/use-media-tracker.ts` — update query params, remove create/update/delete mutations
- KPI cards: Total posts, Total reach, Total engagement, Avg engagement rate

### Phase Plan
- **1A — FB Fanpage** (3-4 ngày): schema migrate + sync + UI rewrite + cron + filter/group-by. Ship được ngay.
- **1B — FB Group** (2 ngày code, **4-8 tuần Meta App Review**): token rotation, `groups_access_member_info`. Code parallel với 1A; deploy khi review pass.
- **2 — IG Business + Threads** (3 ngày): reuse Meta Graph
- **3 — TikTok + YouTube** (5-7 ngày): OAuth mới

## Considered & Rejected Alternatives

| Alternative | Lý do reject |
|---|---|
| Wide table tất cả metrics có column | Schema cồng kềnh, nhiều NULL, khó mở rộng platform mới |
| EAV (MediaPostMetric) | Query phức tạp, performance kém ở 100k+ rows |
| Webhook real-time | Setup phức tạp, public endpoint, overkill cho dashboard |
| Pure on-demand pull | UX chậm khi mở trang lần đầu, tốn rate limit |
| Giữ KOL/PR tab + nhập tay | Conflict với mục tiêu "không nhập tay nữa". User confirm drop hẳn. |
| Backfill data manual cũ | User chọn wipe sạch — fresh start. |

## Risks & Mitigation

| Risk | Severity | Mitigation |
|---|---|---|
| Meta App Review reject `groups_access_member_info` | High | Phase 1A ship trước, Group bị block không ảnh hưởng MVP |
| Token expiry (Page LL token ≠ never-expire) | Medium | `tokenExpiresAt` check + notification admin <7 ngày |
| FB rate limit (200 calls/hour/user) | Low | <40 channels OK; nếu vượt → queue + backoff |
| Insights latency (post_impressions trễ ~24h) | Low | Re-sync posts <48h ở cron run kế |
| Group metrics nghèo → UI NULL nhiều cột | Medium | Render "—" thay vì 0; row có badge "limited metrics" |
| Loss of audit history khi wipe | Low (đã chấp nhận) | Optional: dump CSV trước khi wipe |

## Success Criteria

- [ ] User không thấy nút "Add post" / dialog nhập tay
- [ ] FB Fanpage post tự xuất hiện trong bảng trong vòng 6h sau khi đăng
- [ ] Nút Refresh fetch < 30s với ≤5 channels
- [ ] Filter Channel + Format + Date hoạt động đồng thời
- [ ] Group-by Channel/Format/Month render summary đúng
- [ ] Token expiry warning hiển thị trong admin settings
- [ ] Zero manual data entry path còn sót (route + UI)

## Open Questions for Plan Phase

1. Admin UI để add SocialChannel — đặt ở `/v5/Settings` hay trang riêng `/v5/IntegrationsManagement`?
2. Có cần Export CSV/Excel cho bảng Media không? (KPI report use case)
3. Bài đăng có scheduled post (chưa publish) — pull về với status hay skip?
4. Thumbnail FB CDN có cache local (R2) không, hay link trực tiếp (rủi ro link gãy sau 6 tháng)?
5. Permissions: ai được trigger Refresh? Admin-only hay tất cả Member?

## Next Step
→ Trigger `/ck:plan` với context: report này + plan dir `plans/260514-1004-media-tracker-auto-pull-social-apis/`.
