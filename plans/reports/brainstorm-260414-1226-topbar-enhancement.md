# Brainstorm: Topbar Enhancement

## Problem Statement
Topbar góc phải đang trống, cần thêm widgets hữu ích cho PM Dashboard.

## Evaluated Approaches

| Approach | Components | Verdict |
|----------|------------|---------|
| Essential | Notifications + Settings + User | Quá basic |
| Productivity | Date + Quick Add + Notifications + User | Good balance |
| Command Center | Sprint + Timer + Chat + Notifications + User | Overkill |

## Final Solution

**Layout:**
```
[Search...                    ] [📅 Mon, Apr 14] [📊 Sprint 5 ████░░ 68%]
```

### Components

#### 1. Today's Date/Calendar Widget
- Compact: `📅 Mon, Apr 14`
- Click → dropdown với mini calendar
- Hiển thị deadlines hôm nay
- Hiển thị upcoming deadlines (3 ngày tới)
- Data: Task due dates + Sprint deadlines

#### 2. Sprint Context Widget  
- Compact: `📊 Sprint 5 ████░░ 68%`
- Progress bar mini inline
- Click → dropdown với sprint details
- Stats: Done/In Progress/Todo/Blocked
- Link đến Sprint Board
- Data: `/api/sprints/active` endpoint

## Implementation Notes

- User menu không cần (đã có ở sidebar)
- Notification bell không cần (keep minimal)
- Cần tạo `/api/sprints/active` endpoint nếu chưa có
- Sử dụng date-fns cho date formatting

## Success Criteria
- [ ] Date widget hiển thị đúng ngày hôm nay
- [ ] Calendar dropdown hoạt động
- [ ] Sprint widget hiển thị current sprint + progress
- [ ] Sprint dropdown hiển thị stats
- [ ] Responsive trên mobile

## Next Steps
→ Create implementation plan với `/ck:plan`
