# Cleanup: Xóa 4 plan folders + 6 brainstorm reports

**Date**: 2026-05-17 02:38
**Severity**: Low
**Component**: Project documentation (plans/)
**Status**: Resolved

## What Happened

Xóa 4 plan folders từ `plans/` và 6 brainstorm reports từ `plans/reports/`:

**Plan folders deleted:**
- `plans/260516-1324-perf-rebuild/` — shipped commit 1f56466
- `plans/260516-1519-animated-logo-system/` — shipped commit 495e3eb
- `plans/260516-1844-tablet-collapsed-sidebar/` — shipped commit 4212053
- `plans/260516-2223-personnel-profile/` — shipped commits cfd3145 + 40c1778 + f82a1a0

**Reports deleted:**
- brainstorm-260516-1229-components-architecture-cleanup.md (orphan)
- brainstorm-260516-1324-perf-rebuild.md
- brainstorm-260516-1519-animated-logo-system.md
- brainstorm-260516-1844-tablet-collapsed-sidebar.md
- brainstorm-260516-2131-dashboard-ui-uniformity.md (orphan)
- brainstorm-260516-2223-personnel-profile.md

Kết quả: `plans/` chỉ còn folder trống `plans/reports/`.

## The Brutal Truth

Phát hiện plan metadata đã lỗi thời 48 tiếng. Frontmatter ghi `status=pending` nhưng feature đã ship 4-5 ngày trước. Markdown là snapshot tĩnh — git log mới là source of truth.

## Root Cause Analysis

**Drifting Documentation:** Plan frontmatter không được sync khi commit ship. Không có trigger tự động đánh dấu plan done → status decay → rác tích tụ.

**Duplication:** Git commit messages + diffs đã chứa đầy đủ context. Plan folder chỉ tái lặp lại, không thêm giá trị lâu dài.

## Lessons Learned

1. **Plan lifecycle:** Cần rõ ràng khi plan hoàn thành — buộc đóng status trong commit message hoặc auto-archive
2. **Markdown vs Git:** Dừng viết "living docs" cho shipped features — git log đủ rồi
3. **Frontmatter hygiene:** Status field cần validation hoặc auto-sync (khó) → không đáng

## Next Steps

- Monitor plan folder — không để rác tích tụ quá 1 tuần
- Khi feature ship: đóng plan ngay trong commit message (`Closes plan: 260516-perf-rebuild`)
- Không cần archive — xóa hoàn toàn khi shipped + commit logged
