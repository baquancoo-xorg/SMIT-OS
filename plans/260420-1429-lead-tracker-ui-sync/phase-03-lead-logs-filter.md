# Phase 03 u2014 Lead Logs Filter Bar

## Status
pending

## File
`src/components/lead-tracker/lead-logs-tab.tsx`

## Context
- Pattern: `src/components/ui/CustomFilter.tsx` (filter dropdown, pill style)
- Pattern: `src/components/ui/PrimaryActionButton.tsx` (primary action button)

## Changes

### 1. Import thu00eam
```tsx
import CustomFilter from '../ui/CustomFilter';
import PrimaryActionButton from '../ui/PrimaryActionButton';
import { ClipboardPaste, Plus } from 'lucide-react';
```

### 2. Thay `<select>` status bu1eb1ng `CustomFilter`
```tsx
// Before
<select className="border border-slate-200 rounded-xl px-2 py-1.5 text-xs"
  value={filters.status} onChange={(e) => sf('status', e.target.value)}>
  <option value="">Tu1ea5t cu1ea3 tru1ea1ng thu00e1i</option>
  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
</select>

// After
<CustomFilter
  value={filters.status}
  onChange={(v) => sf('status', v)}
  options={[
    { value: '', label: 'Tu1ea5t cu1ea3' },
    ...STATUSES.map((s) => ({ value: s, label: s }))
  ]}
/>
```

### 3. AE input u2014 giu1eef raw input, cu1ea3i style
```tsx
// Before
<input placeholder="AE..." className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs w-28"

// After
<input
  placeholder="AE..."
  className="border border-slate-200 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest bg-slate-50 hover:bg-slate-100 w-28 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
  value={filters.ae} onChange={(e) => sf('ae', e.target.value)}
/>
```

### 4. Date inputs u2014 cu1ea3i style nhu1ea5t quu00e1n
```tsx
// Before
<input type="date" className="border border-slate-200 rounded-xl px-2 py-1.5 text-xs"

// After
<input type="date" className="border border-slate-200 rounded-full px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100 outline-none focus:border-primary"
```

### 5. Action buttons u2014 du00f9ng `PrimaryActionButton` vu00e0 secondary style
```tsx
// Before
<button onClick={pasteFromClipboard} className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 flex items-center gap-1">
  <span className="material-symbols-outlined text-sm">content_paste</span>Du00e1n tu1eeb Excel
</button>
<button onClick={addRow} className="px-3 py-1.5 text-xs rounded-xl bg-primary text-white hover:bg-primary/90">+ Thu00eam du00f2ng</button>

// After
<button onClick={pasteFromClipboard} className="flex items-center gap-2 h-9 px-4 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 font-black text-[10px] uppercase tracking-widest transition-all">
  <ClipboardPaste size={14} />Du00e1n tu1eeb Excel
</button>
<PrimaryActionButton onClick={addRow} icon={<Plus size={14} />}>Thu00eam du00f2ng</PrimaryActionButton>
```

## Todo
- [ ] Thu00eam imports (CustomFilter, PrimaryActionButton, icons)
- [ ] Thay `<select>` status u2192 CustomFilter
- [ ] Cu1ea3i style AE input
- [ ] Cu1ea3i style date inputs
- [ ] Thay action buttons
