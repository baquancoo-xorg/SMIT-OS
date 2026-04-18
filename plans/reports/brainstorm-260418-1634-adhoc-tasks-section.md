# Brainstorm Report: Công việc phát sinh ngoài OKRs

**Date:** 2026-04-18
**Status:** Approved → Ready for Plan

---

## Problem Statement

Team members thường xử lý công việc phát sinh (ad-hoc tasks) không nằm trong OKRs nhưng không có chỗ để track trong daily/weekly reports. Điều này gây:
- Thiếu visibility về workload thực tế
- PM/Leader không thấy được effort ngoài OKRs
- Khó đánh giá performance toàn diện

## Requirements

### Functional
- Thêm section "Công việc phát sinh" vào Daily Report (cuối Section 1)
- Thêm section tương tự vào Weekly Check-in (trước "Cam kết tuần tới")
- Track: tên task, người yêu cầu, impact, status, thời gian (giờ)
- Auto-sum tổng giờ phát sinh
- Lưu DB để PM/Leader xem

### Non-functional
- Không breaking changes với data hiện tại
- UI consistent với design hiện tại
- Responsive (mobile-friendly)

## Chosen Solution: JSON Field Mới

### Schema Changes
```prisma
model DailyReport {
  ...
  adHocTasks  String?  // JSON: [{name, requester, impact, status, hoursSpent}]
}

model WeeklyReport {
  ...
  adHocTasks  String?  // JSON: same structure
}
```

### JSON Structure
```typescript
interface AdHocTask {
  id: number;         // timestamp
  name: string;       // tên công việc
  requester: string;  // người yêu cầu
  impact: 'low' | 'medium' | 'high';
  status: 'done' | 'in-progress';
  hoursSpent: number; // giờ tiêu tốn
}
```

### UI Changes

**Daily Report:**
- Thêm expandable section sau "Review công việc hôm qua"
- Table với columns: Task | Requester | Impact | Status | Hours
- Footer: Tổng: X giờ

**Weekly Check-in:**
- Section mới giữa KR Progress và Next Week Plans
- Same table structure
- Summary badge hiển thị tổng giờ

## Implementation Phases

1. **Schema migration** - Thêm adHocTasks field
2. **Type definitions** - AdHocTask interface
3. **Daily Report UI** - Section + table component
4. **Weekly Check-in UI** - Section + table component
5. **API updates** - Handle adHocTasks in create/update
6. **PM Dashboard** - Display ad-hoc summary (optional)

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Breaking existing reports | Field optional, null-safe |
| Performance với large JSON | Limit 20 tasks/report |
| UI clutter | Collapsible section, clean design |

## Success Criteria

- [ ] Có thể thêm/xóa ad-hoc tasks trong daily/weekly forms
- [ ] Auto-sum hiển thị đúng
- [ ] Data persist sau submit
- [ ] PM/Leader có thể xem trong dashboard

## Next Steps

→ Create detailed implementation plan with /ck:plan
