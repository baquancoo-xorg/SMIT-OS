# Phase 04 — Daily Stats Layout

## Status
pending

## File
`src/components/lead-tracker/daily-stats-tab.tsx`

## Changes

### 1. Date filter inputs — đồng bộ style với dashboard-tab
```tsx
// Before
<input type="date" className="border border-slate-200 rounded-xl px-3 py-2 text-sm"

// After
<input type="date" className="border border-slate-200 rounded-full px-3 py-2 text-sm bg-slate-50 hover:bg-slate-100 outline-none focus:border-primary"
```

### 2. Table container — thêm card wrapper nhất quán
```tsx
// Before
<div className="overflow-x-auto">

// After
<div className="bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm overflow-hidden">
  <div className="overflow-x-auto">
    {/* table */}
  </div>
</div>
```

### 3. Table header style — đồng bộ
```tsx
// Before
<tr className="bg-slate-50">
  <th className="border border-slate-200 px-3 py-2 ...">

// After — giữ nguyên border style cho complex merged header
// Chỉ cập nhật bg-slate-50/70 để nhất quán với backdrop
<tr className="bg-slate-50/70">
```

## Note
- Không thay đổi logic hay cấu trúc bảng complex (multi-row header)
- Chỉ cập nhật container + input style

## Todo
- [ ] Cập nhật style date inputs (2 inputs)
- [ ] Wrap table trong card container
- [ ] Cập nhật thead row bg
