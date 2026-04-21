# Phase 02 u2014 Frontend Quick Wins

## Context Links
- Brainstorm: `plans/reports/brainstorm-260421-1756-lead-logs-v2-inline-edit-audit-trail.md`
- Main file: `src/components/lead-tracker/lead-logs-tab.tsx` (534 lines hiu1ec7n tu1ea1i)
- Page: `src/pages/LeadTracker.tsx`
- CSV util: `src/components/lead-tracker/csv-export.ts`

## Overview
- **Priority:** High
- **Status:** Pending
- u0110u1ed9c lu1eadp vu1edbi Phase 01 u2014 cu00f3 thu1ec3 chu1ea1y song song
- 5 thay u0111u1ed5i frontend khu00f4ng cu1ea7n backend mu1edbi

## Requirements

### 1. Di chuyu1ec3n Export CSV button
- Xu00f3a button khu1ecfi filter bar trong `lead-logs-tab.tsx`
- Xu00f3a state `exporting` + `handleExportCsv` khu1ecfi `lead-logs-tab.tsx`
- Import `exportAllLeadsToCsv` trong `LeadTracker.tsx`
- Thu00eam button giu1eefa `[PASTE FROM EXCEL]` vu00e0 `[ADD ROW]`
- Chu1ec9 hiu1ec3n khi `isSale && activeTab === 'logs'`

### 2. AE inline edit (dropdown)
- `aeOptions` u0111u00e3 cu00f3 trong `lead-logs-tab.tsx` state
- Cu00f9ng pattern vu1edbi Status/Lead Type: select + `onChange` u2192 `saveInlineField`
- Field key: `'ae'`

### 3. Received Date inline edit
- Cu00f9ng pattern vu1edbi Resolved Date: `<input type="date">` + `onBlur` u2192 `saveInlineField`
- Field key: `'receivedDate'`
- **Lu01b0u u00fd:** `saveInlineField` gu1ecdi `api.updateLead(id, { receivedDate: value })` u2014 value lu00e0 YYYY-MM-DD string, route hiu1ec7n tu1ea1i xu1eed lu00fd u0111u00fang

### 4. Notes u2192 textarea + Shift+Enter
- u0110u1ed5i inline edit Notes tu1eeb `<input>` sang `<textarea rows={2}>`
- `onKeyDown`: nu1ebfu `Enter` vu00e0 **khu00f4ng** Shift u2192 `e.preventDefault()` + `(e.target as HTMLTextAreaElement).blur()`
- Shift+Enter: browser default (xuu1ed1ng du00f2ng tu1ef1 nhiu00ean)
- Escape: `setInlineEdit(null)` khu00f4ng save

### 5. Cu1ed9t Last Modified
- Thu00eam vu00e0o `COLS` array sau `notes`: `{ label: 'Modified', key: 'updatedAt' }`
- Render: `format(new Date(lead.updatedAt), 'dd/MM/yyyy - HH:mm')` (date-fns u0111u00e3 cu00f3 trong project)
- Import `format` tu1eeb `'date-fns'` trong `lead-logs-tab.tsx`
- Cell style: `text-slate-400 text-[11px] font-medium whitespace-nowrap`
- Khu00f4ng cu00f3 inline edit cho cu1ed9t nu00e0y (read-only)
- Cu1eadp nhu1eadt `colSpan` tu1eeb 9/10 u2192 10/11 trong empty state vu00e0 loading rows

## Cell Render Patterns

### AE cell (view row)
```tsx
<td className={editableCellCls(lead.id, 'ae')} onClick={() => setInlineEdit({ id: lead.id, field: 'ae' })}>
  {inlineEdit?.id === lead.id && inlineEdit.field === 'ae'
    ? <select autoFocus className={inlineCls} defaultValue={lead.ae}
        onChange={(e) => saveInlineField(lead.id, 'ae', e.target.value)}
        onBlur={() => setInlineEdit(null)}>
        {aeOptions.map((a) => <option key={a.id} value={a.fullName}>{a.fullName}</option>)}
      </select>
    : lead.ae
  }
</td>
```

### Received Date cell (view row)
```tsx
<td className={editableCellCls(lead.id, 'receivedDate')} onClick={() => setInlineEdit({ id: lead.id, field: 'receivedDate' })}>
  {inlineEdit?.id === lead.id && inlineEdit.field === 'receivedDate'
    ? <input type="date" autoFocus className={inlineCls} defaultValue={lead.receivedDate.slice(0, 10)}
        onBlur={(e) => saveInlineField(lead.id, 'receivedDate', e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Escape') setInlineEdit(null); }} />
    : lead.receivedDate.slice(0, 10)
  }
</td>
```

### Notes cell (textarea)
```tsx
<td className={`${editableCellCls(lead.id, 'notes')} italic max-w-[150px]`} onClick={() => setInlineEdit({ id: lead.id, field: 'notes' })}>
  {inlineEdit?.id === lead.id && inlineEdit.field === 'notes'
    ? <textarea
        autoFocus
        rows={2}
        className={`${inlineCls} resize-none`}
        defaultValue={lead.notes ?? ''}
        onBlur={(e) => saveInlineField(lead.id, 'notes', e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            (e.target as HTMLTextAreaElement).blur();
          }
          if (e.key === 'Escape') setInlineEdit(null);
        }}
      />
    : <span className="text-slate-400 truncate block">{lead.notes || 'u2014'}</span>
  }
</td>
```

### Last Modified cell
```tsx
<td className={`${cellCls} text-slate-400 text-[11px] font-medium whitespace-nowrap`}>
  {format(new Date(lead.updatedAt), 'dd/MM/yyyy - HH:mm')}
</td>
```

### Export CSV button in LeadTracker.tsx
```tsx
import { exportAllLeadsToCsv } from '../components/lead-tracker/csv-export';
// ...
const [exporting, setExporting] = useState(false);
const handleExportCsv = async () => {
  setExporting(true);
  try { await exportAllLeadsToCsv(); } finally { setExporting(false); }
};
// In JSX (between PASTE FROM EXCEL and ADD ROW):
<button onClick={handleExportCsv} disabled={exporting}
  className="flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-surface-container-high text-slate-600 hover:bg-slate-200 font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50">
  <Download size={13} />
  {exporting ? 'Exporting...' : 'Export CSV'}
</button>
```

## Related Code Files

- **Modify:** `src/components/lead-tracker/lead-logs-tab.tsx`
- **Modify:** `src/pages/LeadTracker.tsx`

## Implementation Steps

1. **`lead-logs-tab.tsx`**:
   a. Add `import { format } from 'date-fns';`
   b. Xu00f3a `exporting` state + `handleExportCsv` + Export CSV button khu1ecfi filter bar
   c. Thu00eam AE cell inline edit (view row) u2014 sau customer cell, tru01b0u1edbc Received
   d. Thu00eam Received Date cell inline edit (view row) u2014 thay thu1ebf cell hiu1ec7n tu1ea1i
   e. u0110u1ed5i Notes cell tu1eeb `<input>` sang `<textarea>` vu1edbi Shift+Enter logic
   f. Thu00eam `{ label: 'Modified', key: 'updatedAt' }` vu00e0o `COLS`
   g. Thu00eam Last Modified cell vu00e0o view row
   h. Cu1eadp nhu1eadt `colSpan` trong loading + empty rows

2. **`LeadTracker.tsx`**:
   a. Import `Download` tu1eeb `lucide-react`
   b. Import `exportAllLeadsToCsv` tu1eeb `../components/lead-tracker/csv-export`
   c. Thu00eam `exporting` state + `handleExportCsv`
   d. Thu00eam Export CSV button giu1eefa PASTE FROM EXCEL vu00e0 ADD ROW

3. Kiu1ec3m tra `tsc --noEmit` khu00f4ng lu1ed7i trong cu00e1c file u0111u00e3 su1eeda

## Todo

- [ ] `lead-logs-tab.tsx`: xu00f3a Export CSV button + exporting state
- [ ] `lead-logs-tab.tsx`: thu00eam AE inline edit cell
- [ ] `lead-logs-tab.tsx`: thu00eam Received Date inline edit cell
- [ ] `lead-logs-tab.tsx`: u0111u1ed5i Notes sang textarea + Shift+Enter
- [ ] `lead-logs-tab.tsx`: thu00eam cu1ed9t Modified + COLS entry + render cell
- [ ] `LeadTracker.tsx`: thu00eam Export CSV button
- [ ] TypeScript check pass

## Success Criteria

- Click AE cell u2192 dropdown hiu1ec3n thu1ecb u0111u1ed3ng nhu1ea5t danh su00e1ch AE
- Click Received cell u2192 date picker xuu1ea5t hiu1ec7n, save khi blur
- Click Notes cell u2192 textarea, Enter save, Shift+Enter xuu1ed1ng du00f2ng, Escape cancel
- Cu1ed9t Modified hiu1ec3n thu1ecb format `DD/MM/YYYY - HH:MM` u0111u00fang
- Export CSV button xuu1ea5t hiu1ec7n giu1eefa PASTE FROM EXCEL vu00e0 ADD ROW
- `lead-logs-tab.tsx` vu1eabn < 560 lines

## Risk

- `lead-logs-tab.tsx` hiu1ec7n 534 lines; thu00eam 2 inline edit cells + Modified column u2192 ~555-560 lines
- AE dropdown: `aeOptions` load tu1eeb `/leads/ae-list` u2014 u0111u00e3 cu00f3 su1eb5n trong state, khu00f4ng cu1ea7n fetch thu00eam
