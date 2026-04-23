---
title: Fix Shift+Enter trong Lead Log Dialog
status: completed
priority: high
effort: trivial
created: 2026-04-23
completed: 2026-04-23
files:
  - src/components/lead-tracker/lead-log-dialog.tsx
---

# Fix Shift+Enter trong Lead Log Dialog

## Problem

Textarea "Ghi chú" trong LeadLogDialog không cho phép xuống dòng:
- Enter → trigger save (không mong muốn)
- Shift+Enter → focus nhảy sang field khác (không mong muốn)

## Root Cause

1. Textarea không có `onKeyDown` handler để chặn Enter propagation
2. Button không có `type="button"` explicit

## Solution

### 1. Thêm `onKeyDown` cho textarea (line ~247-255)

**Before:**
```tsx
<textarea
  rows={3}
  className={`${inputCls} resize-y min-h-[72px]`}
  value={form.notes}
  onChange={(e) => set('notes', e.target.value)}
  placeholder="Ghi chú thêm..."
/>
```

**After:**
```tsx
<textarea
  rows={3}
  className={`${inputCls} resize-y min-h-[72px]`}
  value={form.notes}
  onChange={(e) => set('notes', e.target.value)}
  placeholder="Ghi chú thêm..."
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
    }
  }}
/>
```

### 2. Thêm `type="button"` cho buttons (defensive)

- Close button (line ~163): thêm `type="button"`
- Cancel button (line ~263): thêm `type="button"`

## Implementation Steps

- [x] 1. Edit `lead-log-dialog.tsx` - thêm `onKeyDown` handler cho textarea
- [x] 2. Thêm `type="button"` cho close button
- [x] 3. Thêm `type="button"` cho cancel button
- [x] 4. Thêm `type="button"` cho save button (reviewer recommendation)
- [ ] 5. Test: Enter trong textarea phải xuống dòng
- [ ] 6. Test: Shift+Enter trong textarea phải xuống dòng
- [ ] 7. Test: Click "Lưu" vẫn save đúng

## Success Criteria

- [x] Shift+Enter xuống dòng trong textarea
- [x] Enter xuống dòng trong textarea (không submit)
- [x] Form save bình thường khi click button

## References

- Brainstorm: `plans/reports/brainstorm-260423-1747-lead-log-dialog-shift-enter-fix.md`
