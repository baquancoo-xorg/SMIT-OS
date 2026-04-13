# Brainstorm Report: Page Header Style Fix

## Problem Statement
Các trang trong SMIT-OS có style Title và Sub-title không nhất quán:
- Style ĐÚNG: OKRs, Daily Sync, Weekly Report (text nhỏ, không border, title có italic)
- Style SAI: Workspace boards, Backlog, Dashboard (text lớn hơn, có icon trước title)

## Yêu cầu
1. Sửa style các trang sai giống style đúng
2. Sub-title theo format: `[Tên group trong sidebar] > [Tên trang]`
3. Riêng Overview chỉ có "Overview"
4. Áp dụng màu phòng ban cho từ in nghiêng trong title

## Solution

### Style chuẩn

```jsx
// Nav (Sub-title)
<nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
  <span className="hover:text-primary cursor-pointer">{groupName}</span>
  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
  <span className="text-on-surface">{pageName}</span>
</nav>

// H2 (Title) - KHÔNG có icon
<h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
  {staticText} <span className="text-{color} italic">{highlightedText}</span>
</h2>
```

### Màu sắc phòng ban

| Phòng ban | Màu CSS |
|-----------|---------|
| Tech & Product | `text-primary` |
| Marketing | `text-secondary` |
| Media | `text-tertiary` |
| Sales | `text-emerald-600` |

### Các file cần sửa

| File | Sub-title mới | Title Format |
|------|---------------|--------------|
| PMDashboard.tsx:162-167 | Overview | Project Management *Control Panel* (primary) |
| TechBoard.tsx:294-304 | Workspaces > Tech & Product | *Tech & Product* Workspace (primary) |
| MarketingBoard.tsx:294-304 | Workspaces > Marketing | *Marketing* Workspace (secondary) |
| MediaBoard.tsx:292-302 | Workspaces > Media | *Media* Workspace (tertiary) |
| SaleBoard.tsx:292-302 | Workspaces > Sales | *Sales* Workspace (emerald-600) |
| ProductBacklog.tsx:178-188 | Planning > Team Backlog | Team *Backlog* (primary) |
| OKRsManagement.tsx:154-159 | Planning > OKRs | giữ nguyên |
| DailySync.tsx:85-91 | Rituals > Daily Sync | giữ nguyên |
| SaturdaySync.tsx:87-92 | Rituals > Weekly Report | giữ nguyên |

### Implementation Notes

1. **Xóa icon** trong h2 của các workspace boards và backlog
2. **Thay đổi nav class**: `text-xs` → `text-sm`, `mb-1` → `mb-2`, chevron `text-[12px]` → `text-[14px]`
3. **Thay đổi h2 class**: `text-3xl` → `text-4xl`, `font-black` → `font-extrabold`, bỏ `flex items-center gap-3`
4. **Thêm span italic** với màu phòng ban tương ứng

### Success Criteria
- [ ] Tất cả 9 trang có style Title/Sub-title nhất quán
- [ ] Sub-title theo format sidebar: Group > Page
- [ ] Màu phòng ban được áp dụng đúng
- [ ] Không còn icon trong title

---
*Generated: 2026-04-14 01:29*
