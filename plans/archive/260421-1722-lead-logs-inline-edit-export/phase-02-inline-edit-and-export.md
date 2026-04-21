# Phase 02 u2014 Inline Edit + Export CSV

## Context Links
- Brainstorm: `plans/reports/brainstorm-260421-1722-lead-logs-inline-edit-export.md`
- Phase 01 output: `src/components/lead-tracker/lead-detail-modal.tsx`
- Main file: `src/components/lead-tracker/lead-logs-tab.tsx`

## Overview
- **Priority:** High
- **Status:** Completed
- Su1eeda `lead-logs-tab.tsx`: thu00eam per-cell inline edit vu00e0 wire `LeadDetailModal`
- Tu1ea1o `csv-export.ts`: logic export CSV tu00e1ch biu1ec7t u0111u1ec3 giu1eef file chu00ednh gu1ecdn

## Requirements

### Inline Edit (5 fields)
| Field | Control | Save trigger |
|-------|---------|-------------|
| Status | `<select>` | `onChange` |
| Resolved Date | `<input type="date">` | `onBlur` / Enter |
| Lead Type | `<select>` | `onChange` |
| UQ Reason | `<select>` | `onChange` (chu1ec9 khi status=Unqualified) |
| Notes | `<input>` | `onBlur` / Enter |

- Customer + AE giu1eef nguyu00ean row-level edit hiu1ec7n cu00f3
- Hover tru00ean cell editable: hiu1ec3n cursor pointer + subtle bg highlight
- u0110ang save: hiu1ec3n `opacity-50` tru00ean cell

### Detail Modal
- Click customer name u2192 mu1edf `LeadDetailModal`
- Customer name cell: `cursor-pointer hover:underline`

### Export CSV
- Button "Export CSV" trong filter toolbar
- Fetch `api.getLeads()` khu00f4ng filter u2192 tou00e0n bu1ed9 DB
- UTF-8 BOM u0111u1ec3 Excel u0111u1ecdc u0111u00fang tiu1ebfng Viu1ec7t
- Filename: `leads-export-YYYY-MM-DD.csv`

## New State in `lead-logs-tab.tsx`
```ts
const [inlineEdit, setInlineEdit] = useState<{ id: string; field: string } | null>(null);
const [inlineSaving, setInlineSaving] = useState<{ id: string; field: string } | null>(null);
const [detailLead, setDetailLead] = useState<Lead | null>(null);
```

## `saveInlineField` function
```ts
async function saveInlineField(id: string, field: string, value: string) {
  setInlineSaving({ id, field });
  try {
    await api.updateLead(id, { [field]: value || null });
    await fetchLeads();
  } finally {
    setInlineSaving(null);
    setInlineEdit(null);
  }
}
```

## Cell render pattern
```tsx
// Status cell example
<td onClick={() => setInlineEdit({ id: lead.id, field: 'status' })}>
  {inlineEdit?.id === lead.id && inlineEdit.field === 'status'
    ? <select autoFocus defaultValue={lead.status}
        onChange={(e) => saveInlineField(lead.id, 'status', e.target.value)}
        onBlur={() => setInlineEdit(null)}>
        {STATUSES.map(s => <option key={s}>{s}</option>)}
      </select>
    : <span className="cursor-pointer">{lead.status}</span>
  }
</td>
```

## Related Code Files
- **Modify:** `src/components/lead-tracker/lead-logs-tab.tsx`
- **Create:** `src/components/lead-tracker/csv-export.ts`
- **Import:** `src/components/lead-tracker/lead-detail-modal.tsx` (Phase 01)

## Implementation Steps

### Step 1: Tu1ea1o `csv-export.ts`
```ts
// Hu00e0m escape cell CSV (RFC 4180)
function escapeCsvCell(value: string): string

// Hu00e0m build CSV string tu1eeb mu1ea3ng leads
function buildLeadsCsv(leads: Lead[]): string

// Hu00e0m trigger download
function downloadCsv(content: string, filename: string): void

// Export main function
export async function exportAllLeadsToCsv(): Promise<void>
```
- UTF-8 BOM: `'﻿'` prepend
- Columns: Customer, AE, Received, Resolved, Status, Lead Type, UQ Reason, Notes

### Step 2: Cu1eadp nhu1eadt `lead-logs-tab.tsx`
1. Import `LeadDetailModal` tu1eeb Phase 01
2. Import `exportAllLeadsToCsv` tu1eeb `csv-export.ts`
3. Thu00eam 3 state mu1edbi: `inlineEdit`, `inlineSaving`, `detailLead`
4. Viu1ebft `saveInlineField()` function
5. Cu1eadp nhu1eadt render cu1ee7a 5 cells u2192 per-cell inline edit
6. Cu1eadp nhu1eadt Customer cell u2192 `onClick={() => setDetailLead(lead)}`
7. Thu00eam Export CSV button vu00e0o filter toolbar
8. Render `<LeadDetailModal lead={detailLead} onClose={() => setDetailLead(null)} />` cuu1ed1i JSX

## Todo
- [x] Tu1ea1o `src/components/lead-tracker/csv-export.ts`
- [x] Cu1eadp nhu1eadt `lead-logs-tab.tsx`: state mu1edbi + `saveInlineField`
- [x] Cu1eadp nhu1eadt 5 editable cells
- [x] Cu1eadp nhu1eadt Customer cell u2192 trigger detail modal
- [x] Thu00eam Export CSV button vu00e0o toolbar
- [x] Wire `LeadDetailModal` vu00e0o JSX
- [x] Kiu1ec3m tra TypeScript, build thu00e0nh cu00f4ng

## Success Criteria
- Click cell editable u2192 control xuu1ea5t hiu1ec7n ngay, focus auto
- Auto-save sau onChange (select) hou1eb7c onBlur/Enter (text/date)
- Row refresh u0111u00fang data sau save
- Click customer name u2192 modal mu1edf
- Export CSV: file download u0111u00fang, Excel mu1edf u0111u01b0u1ee3c, tiu1ebfng Viu1ec7t hiu1ec3n u0111u00fang
- Khu00f4ng cu00f3 TypeScript error
- `lead-logs-tab.tsx` vu1eabn du01b0u1edbi 500 lines

## Risk
- `lead-logs-tab.tsx` hiu1ec7n 438 lines u2192 tu00e1ch `csv-export.ts` giu1eef file gu1ecdn
- Nu1ebfu row u0111ang u1edf row-level edit mode (editId set) thu00ec khu00f4ng cho per-cell edit tru00ean cu00f9ng row
