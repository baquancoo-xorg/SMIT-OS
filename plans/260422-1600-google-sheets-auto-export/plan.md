---
status: completed
created: 2026-04-22
completedAt: 2026-04-22
priority: medium
effort: large
blockedBy: []
blocks: []
---

# Google Sheets Auto-Export

Export toàn bộ SMIT OS data ra Google Sheet tự động lúc 11:00 sáng hàng ngày.

## Overview

Tính năng cho phép:
- **Auto export** lúc 11:00 sáng hàng ngày via node-cron
- **Manual export** qua API endpoint + Settings UI
- **13 sheets** tương ứng các trang trong app
- **Retry + notification** khi export fail

## Context

- Brainstorm report: `plans/reports/brainstorm-260422-1600-google-sheets-auto-export.md`
- Existing pattern: `server/jobs/alert-scheduler.ts`

## Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | [Setup & Google API Client](./phase-01-setup-google-client.md) | completed |
| 2 | [Data Extractors](./phase-02-data-extractors.md) | completed |
| 3 | [Export Service](./phase-03-export-service.md) | completed |
| 4 | [Scheduler & Routes](./phase-04-scheduler-routes.md) | completed |
| 5 | [Settings UI](./phase-05-settings-ui.md) | completed |

## Dependencies

- `googleapis` NPM package
- Google Cloud Service Account credentials
- Environment variables: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_DRIVE_FOLDER_ID`

## Success Criteria

1. File Google Sheet được tạo tự động lúc 11:00 sáng
2. 13 sheets với đầy đủ data
3. Manual export hoạt động từ Settings page
4. Retry + notification khi export fail
5. Files được lưu đúng folder trên Drive

## Cook Command

```bash
/ck:cook /Users/dominium/Documents/Project/SMIT-OS/plans/260422-1600-google-sheets-auto-export
```
