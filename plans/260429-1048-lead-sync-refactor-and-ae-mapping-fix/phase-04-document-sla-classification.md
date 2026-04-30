# Phase 04 — Document SLA Classification

## Context Links
- Brainstorm § 3.3: [brainstorm-260429-1048-lead-sync-refactor-and-ae-fix.md](../reports/brainstorm-260429-1048-lead-sync-refactor-and-ae-fix.md)
- File: `src/components/lead-tracker/lead-logs-tab.tsx:42-63`

## Overview
- **Priority:** P3
- **Status:** pending
- **Effort:** ~10m
- Document SLA là cột Auto-derived (UI-only, không lưu DB). Logic công thức hiện tại đã đúng nghiệp vụ — chỉ cần comment xác nhận classification.

## Key Insights
- Công thức user xác nhận (đã trùng logic hiện tại):
  - status ∈ {Qualified, Unqualified} → Closed
  - end = `resolvedDate ?? today`
  - (end - received) ≤ 7 days → On-time(D-N)
  - (end - received) > 7 days → Overdue(+N)
- Hiện tại function `getLeadSla()` dùng `today` thuần (không check resolvedDate). Cần update nhỏ để dùng `resolvedDate ?? today` cho lead Closed (tránh "ghost overdue" khi đã Closed nhưng resolved sau receivedDate quá 7 ngày — tuy nhiên Closed đã short-circuit, nên không phát sinh issue thực tế).
- Nếu giữ logic như hiện tại (ngắn gọn): Closed return 'Closed' luôn → không tính ngày → fine. **Quyết định: không thay đổi logic, chỉ thêm comment.**

## Requirements
- Code comment giải thích classification (Auto, UI-only)
- Không thay đổi behavior
- Không thay đổi UI rendering

## Architecture
SLA = derived state, không persist:
```
Input: lead.status, lead.receivedDate, lead.resolvedDate (current data)
Output: { label, className } (badge UI props)
Persistence: NONE
```

## Related Code Files
**Modify:**
- `src/components/lead-tracker/lead-logs-tab.tsx` (function `getLeadSla` — thêm comment)

## Implementation Steps
1. Đọc function `getLeadSla` (line 42-63)
2. Thêm JSDoc comment phía trên function:
   ```ts
   /**
    * SLA badge — derived UI-only, không persist xuống DB.
    * Source: lead.status, lead.receivedDate.
    * Logic:
    *   - Closed: status ∈ {Qualified, Unqualified}
    *   - else: deadline = receivedDate + 7 days
    *     - daysLeft >= 0 → On-time (D-N)
    *     - daysLeft < 0  → Overdue (+N)
    */
   function getLeadSla(lead: Lead, now: Date) { ... }
   ```
3. Save file, hot-reload verify

## Todo List
- [ ] Đọc `getLeadSla` hiện tại
- [ ] Thêm JSDoc comment phân loại Auto/UI-only
- [ ] Save và verify không break UI

## Success Criteria
- Comment hiện trong source code
- Behavior không đổi (badge render giống cũ)

## Risk Assessment
| Risk | Mitigation |
|---|---|
| Comment lệch logic thực tế nếu code đổi sau | Chấp nhận — comment chỉ là document |

## Security Considerations
- N/A (chỉ document)

## Next Steps
- Phase 05 backfill verify SLA badge hiển thị đúng sau khi data update
