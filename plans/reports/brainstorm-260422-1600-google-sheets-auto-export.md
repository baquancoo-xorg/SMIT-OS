# Brainstorm Report: Google Sheets Auto-Export

**Date:** 2026-04-22  
**Status:** Design Approved

---

## Problem Statement

SMIT OS cần tính năng tự động xuất báo cáo toàn bộ hệ thống ra Google Sheet hàng ngày để:
- Backup dữ liệu định kỳ
- Chia sẻ dữ liệu với stakeholders không có access vào app
- Phân tích offline trong spreadsheet

---

## Requirements

### Functional
- Export 11:00 sáng hàng ngày (tự động)
- Manual trigger qua API + UI button
- Mỗi ngày tạo 1 file Google Sheet mới
- 13 sheets tương ứng với các trang trong app
- Lưu vào folder cố định trên Google Drive

### Non-functional
- Retry 3 lần khi fail
- Tạo notification trong app khi export thất bại
- Service Account authentication (không cần user login)

---

## Architecture Decision

### Chosen: Hybrid Approach (node-cron + API endpoint)

```
┌─────────────────────────────────────────────────────────────────┐
│                        SMIT-OS Server                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌────────────────────────┐            │
│  │  node-cron       │───▶│  SheetsExportService   │            │
│  │  (11:00 daily)   │    └───────────┬────────────┘            │
│  └──────────────────┘                │                         │
│                                      ▼                         │
│  ┌──────────────────┐    ┌────────────────────────┐            │
│  │  POST /api/      │───▶│  GoogleSheetsClient    │            │
│  │  reports/export  │    │  (googleapis)          │            │
│  └──────────────────┘    └───────────┬────────────┘            │
│                                      │                         │
│  ┌──────────────────┐                │                         │
│  │  Settings Page   │ ───────────────┘                         │
│  │  Export Button   │                                          │
│  └──────────────────┘                                          │
└──────────────────────────────────────┼─────────────────────────┘
                                       ▼
                          ┌────────────────────────┐
                          │   Google Sheets API    │
                          │   Google Drive API     │
                          └───────────┬────────────┘
                                      ▼
                          ┌────────────────────────┐
                          │  SMIT-OS-Reports/      │
                          │  └─ Report-2026-04-22  │
                          └────────────────────────┘
```

### Why Hybrid?
- **Auto + Manual**: Scheduled job + API endpoint cho flexibility
- **Simple**: Không cần external infrastructure (Cloud Functions)
- **Debug-friendly**: Có endpoint để test/trigger thủ công
- **Existing pattern**: Đã có alert-scheduler.ts trong codebase

---

## Sheet Structure (13 sheets)

| # | Sheet Name | Source | Key Columns |
|---|------------|--------|-------------|
| 1 | Analytics-Overview-Realtime | KpiMetrics API (realtime) | Date, Ad Spend, Sessions, CPSe, Signups, CPSi, Opps, CPOpp, Order, CPOr, MQL (Gold/Silver/Bronze), Pre-PQL, PQL, Pre-SQL, SQL, Revenue, ROAS, ME/RE |
| 2 | Analytics-Overview-Cohort | KpiMetrics API (cohort) | Same as above |
| 3 | Analytics-Dashboard | PMDashboard data | Sprint Burndown, Overdue, Review Queue, WIP/Person, Daily Reports, Team Confidence, Dept Progress, Velocity, Status Breakdown |
| 4 | Workspace-Tech | WorkItem (Tech dept) | ID, Title, Description, Status, Priority, Type, Assignee, Sprint, Due Date, Story Points, Parent, KR Links |
| 5 | Workspace-Marketing | WorkItem (Marketing) | Same as above |
| 6 | Workspace-Media | WorkItem (Media) | Same as above |
| 7 | Workspace-Sales | WorkItem (Sale) | Same as above |
| 8 | Planning-OKRs | Objective + KeyResult | ID, Title, Department, Owner, Progress %, Parent, Child KRs |
| 9 | Planning-Backlog | WorkItem (no sprint) | Same as Workspace |
| 10 | Planning-Sprint | Sprint + WorkItems | Sprint info + linked items |
| 11 | Rituals-DailySync | DailyReport | Full detail: Tasks (completed/doing/today), Team metrics, Blockers, Ad-hoc |
| 12 | Rituals-WeeklyReport | WeeklyReport | Full detail: Progress, Plans, Blockers, KR Progress, Ad-hoc, Score, Confidence |
| 13 | CRM-LeadTracker | Lead | All columns |

---

## Daily Sync Detail Columns

| Column | Description |
|--------|-------------|
| Created Date | Timestamp |
| Submission Status | Early/On Time/Late |
| Reporter | User fullName |
| Team | tech/marketing/media/sale |
| Status | Review/Approved |
| Report Date | Date |
| Completed Yesterday | Task titles (comma-separated) |
| Completed Metrics | Team-specific metrics (JSON) |
| Still Doing | Task titles |
| Doing Metrics | Team-specific metrics |
| Today Plans | Plan descriptions |
| Priority Items | Flagged as priority |
| Blockers | Description + impact |
| Ad-hoc Tasks | Name, requester, impact, status, hours |

### Team-specific Metrics
- **Tech**: taskType, testStatus, prLink, blockedBy
- **Marketing**: spend, mqls, cpa, adsTested, channel, campStatus
- **Media**: link, version, publications, views, engagement, followers
- **Sale**: leadsReceived/Attempted/Qualified, demosBooked, oppValue, revenue

---

## Weekly Report Detail Columns

| Column | Description |
|--------|-------------|
| Reporter | User fullName |
| Week Ending | Date |
| Status | Review/Approved |
| Score | 0-10 |
| Confidence | 0-10 |
| Progress | Parsed from JSON - list of items |
| Plans | Parsed from JSON - list of items |
| Blockers | Parsed from JSON |
| KR Progress | krId, currentValue, progressPct |
| Ad-hoc Tasks | name, requester, impact, status, hoursSpent |
| Approved By | Approver name |
| Approved At | Timestamp |

---

## Technical Implementation

### New Files
```
server/
├── services/
│   └── sheets-export.service.ts    # Main export orchestrator
├── lib/
│   └── google-sheets-client.ts     # Google API wrapper
├── jobs/
│   └── sheets-export-scheduler.ts  # Cron job (11:00 daily)
├── routes/
│   └── sheets-export.routes.ts     # API endpoints
└── types/
    └── sheets-export.types.ts      # TypeScript types

src/
├── pages/
│   └── Settings.tsx                # Add export section
└── components/
    └── settings/
        └── GoogleSheetsExport.tsx  # Export UI component
```

### Dependencies
```json
{
  "googleapis": "^145.0.0"
}
```

### Environment Variables
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=smitos-export@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_DRIVE_FOLDER_ID=1abc123...
```

---

## Error Handling

```
Export Attempt
      │
      ▼
┌─────────────┐
│ Try Export  │
└──────┬──────┘
       │
   ┌───┴───┐
   │ Fail? │
   └───┬───┘
       │ Yes
       ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Retry 1    │───▶│   Retry 2    │───▶│   Retry 3    │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                               │ Fail
                                               ▼
                                    ┌──────────────────┐
                                    │ Create           │
                                    │ Notification     │
                                    │ + Log to DB      │
                                    └──────────────────┘
```

---

## Success Criteria

1. [ ] File Google Sheet được tạo tự động lúc 11:00 sáng
2. [ ] 13 sheets với đầy đủ data như design
3. [ ] Manual export hoạt động từ Settings page
4. [ ] Retry + notification khi export fail
5. [ ] Files được lưu đúng folder trên Drive

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Google API rate limit | Export fail | Implement exponential backoff |
| Large data volume | Slow export | Batch writes, progress tracking |
| Server restart lúc 11:00 | Miss export | Startup check for missed jobs |
| Service Account token expire | Auth fail | Refresh token handling |

---

## Next Steps

1. Setup Google Cloud Project + Service Account
2. Implement backend (service + scheduler + routes)
3. Implement frontend (Settings UI)
4. Testing + deployment
