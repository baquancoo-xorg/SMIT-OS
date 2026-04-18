# 2026-04-18: Ad-hoc Tasks Section Planning

## Summary

Brainstorm + planning session để thêm section "Công việc phát sinh ngoài OKRs" vào Daily Report và Weekly Check-in forms.

## Problem

Team members xử lý nhiều công việc ngoài OKRs (support, meetings, hotfixes) nhưng không có chỗ track → PM/Leader thiếu visibility về workload thực tế.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage | JSON field `adHocTasks` | Đơn giản, không breaking change, flexible |
| Position (Daily) | Cuối Section 1 | Sau review OKRs tasks |
| Position (Weekly) | Trước "Cam kết tuần tới" | Giữa KR Progress và Plans |
| Fields | name, requester, impact, status, hoursSpent | Track đủ info cho PM review |

## Artifacts

- Brainstorm: `plans/reports/brainstorm-260418-1634-adhoc-tasks-section.md`
- Plan: `plans/260418-1634-adhoc-tasks-section/`
- 5 phases, ~4.5h estimated effort

## Next Steps

Run `/ck:cook` to implement the plan.
