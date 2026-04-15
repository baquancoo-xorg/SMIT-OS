# Brainstorm: Cải thiện Daily Report Form cho 4 đội

**Date:** 2026-04-15
**Status:** Completed → Ready for Implementation Plan

---

## Problem Statement

Form báo cáo hàng ngày (Daily Sync) cần cá nhân hóa cho từng đội:
- **Tech & Product**
- **Marketing** 
- **Media**
- **Sale**

Mỗi đội có tính chất công việc khác nhau, cần metrics và workflow tracking khác nhau.

---

## Mục tiêu

1. **Thu thập dữ liệu chính xác hơn** — Bổ sung metrics còn thiếu
2. **Rút gọn thời gian nhập liệu** — Loại bỏ trường thừa, auto-fill
3. **Tăng visibility cho PM/Leader** — Dashboard aggregate

---

## Phân tích Form hiện tại

### Cấu trúc chung (3 phần)
1. Review công việc hôm qua (Đã xong / Đang làm)
2. Khó khăn & Rủi ro (Blockers)
3. Mục tiêu Focus hôm nay

### Đề xuất đã có trong Prototype

| Đội | Màu | Metrics đặc thù | Cờ ưu tiên |
|-----|-----|-----------------|------------|
| Tech | Indigo | PR/Branch, Test Status (Local/Staging/Prod), Task Type (Feature/Bug) | Bug P0/Hot Fix |
| Marketing | Cam | Spend, MQLs, CPA auto-calc, Ads Tested, Camp Status | Camp Trọng Điểm |
| Media | Hồng | Publications Count, Views, Engagement, Followers, Revision Count (v1/v2/v3+) | Ấn Phẩm Nóng (SLA Đỏ) |
| Sale | Xanh Ngọc | Lead Funnel (5 stage), Demos Booked, Pipeline Value, Tickets + Type | Deal Nóng |

---

## Đề xuất bổ sung

### Tech & Product
| Trường | Lý do |
|--------|-------|
| Blocked By (dropdown) | Biết rõ đang chờ: Design/QA/DevOps/External |
| Estimated vs Actual | Track effort accuracy |

### Marketing
| Trường | Lý do |
|--------|-------|
| Channel (FB/Google/TikTok) | Aggregate theo kênh |
| Winning Creative Link | Track mẫu đang win |

### Media
| Trường | Lý do |
|--------|-------|
| Content Type | Video dài/Short/Banner/Post |
| Handoff Status | Track SLA bàn giao |

### Sale
| Trường | Lý do |
|--------|-------|
| Deal Stage | Prospect → Demo → Proposal → Won/Lost |
| Lost Reason | Học từ failed deals |
| Next Action + Date | Accountability |

---

## Kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                    SMIT-OS Database                         │
├─────────────────────────────────────────────────────────────┤
│  daily_reports                                              │
│  ├── id, user_id, team_type, report_date                   │
│  ├── yesterday_tasks[] (FK → tasks)                        │
│  ├── blockers[]                                             │
│  ├── today_plans[]                                          │
│  └── team_specific_metrics (JSONB)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌────────┐    ┌────────────┐    ┌──────────┐
│ Task   │    │ PM Dash    │    │ Weekly   │
│ Sync   │    │ Aggregate  │    │ Reports  │
└────────┘    └────────────┘    └──────────┘
```

### Auto-detect Team
```typescript
const userTeam = user.teamId; // tech | marketing | media | sale
// Render form component tương ứng
```

---

## Decision Made

- **Triển khai:** Integrate vào SMIT-OS hiện tại
- **Data usage:** Dashboard tổng hợp cho PM/Leader
- **Team detection:** Auto-detect theo user login

---

## Implementation Priority

| Phase | Scope | Effort |
|-------|-------|--------|
| P1 | DB schema + Form submission API | 1-2 days |
| P2 | Auto-detect team + Task sync | 1 day |
| P3 | PM Dashboard aggregate | 2-3 days |

---

## Next Steps

→ Tạo Implementation Plan chi tiết với `/ck:plan`
