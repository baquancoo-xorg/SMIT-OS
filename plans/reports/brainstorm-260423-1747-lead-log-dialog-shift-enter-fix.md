# Brainstorm: Fix Shift+Enter trong Lead Log Dialog

**Date:** 2026-04-23
**Status:** Complete - Ready for Implementation

## Problem Statement

Trong form sửa Lead (LeadLogDialog modal), người dùng không thể sử dụng Shift+Enter để xuống dòng trong textarea "Ghi chú". Thay vào đó:
- **Enter** → Submit form (save lead)
- **Shift+Enter** → Focus nhảy sang field khác

## Root Cause Analysis

### File liên quan
- `/src/components/lead-tracker/lead-log-dialog.tsx`

### Nguyên nhân
1. **Textarea không có `onKeyDown` handler** - Không chặn Enter key propagation
2. **Button không có `type="button"`** - Mặc định button có thể trigger submit behavior
3. **Keyboard event bubbling** - Enter event bubble lên parent và trigger save action

### Code problematic (line 247-255)
```tsx
<textarea
  rows={3}
  className={`${inputCls} resize-y min-h-[72px]`}
  value={form.notes}
  onChange={(e) => set('notes', e.target.value)}
  placeholder="Ghi chú thêm..."
/>
```

## Recommended Solution

### Approach: Thêm `onKeyDown` handler cho textarea

```tsx
<textarea
  rows={3}
  className={`${inputCls} resize-y min-h-[72px]`}
  value={form.notes}
  onChange={(e) => set('notes', e.target.value)}
  placeholder="Ghi chú thêm..."
  onKeyDown={(e) => {
    // Prevent Enter from bubbling up and triggering form submission
    if (e.key === 'Enter') {
      e.stopPropagation();
    }
  }}
/>
```

### Additional defensive measures
- Thêm `type="button"` cho button close (line 163-168)
- Thêm `type="button"` cho button "Hủy" (line 263-266)
- Button "Lưu" có thể giữ nguyên vì đã có `onClick` handler

## Success Criteria

- [ ] Shift+Enter trong textarea "Ghi chú" phải xuống dòng
- [ ] Enter trong textarea không được trigger save
- [ ] Enter trong các input fields khác có thể giữ hành vi mặc định
- [ ] Form vẫn hoạt động bình thường khi click button "Lưu"

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Break existing functionality | Low | Chỉ modify textarea behavior |
| Affect other forms | None | Change chỉ trong LeadLogDialog |

## Next Steps

Tạo implementation plan với `/ck:plan`
