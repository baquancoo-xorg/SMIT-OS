# Phase 05 u2014 Refactor LeadLogsTab

## Overview
- Priority: High
- Status: pending
- Depends on: phase-04
- File: `src/components/lead-tracker/lead-logs-tab.tsx` (refactor)

## Mu1ee5c tiu00eau

Xu00f3a inline edit + pending rows, thu00eam Actions column vu1edbi nu00fat Edit/Delete phu00e2n quyu1ec1n, tich hu1ee3p `LeadLogDialog`.

---

## A. Xu00f3a bu1ecf

### State cu1ea7n xu00f3a
```typescript
// Xu00f3a hou00e0n tou00e0n:
const [pending, setPending] = useState<PendingRow[]>([]);
const [editId, setEditId] = useState<string | null>(null);
const [draft, setDraft] = useState<Partial<Lead>>({});
const [inlineEdit, setInlineEdit] = useState<...>(null);
const [inlineSaving, setInlineSaving] = useState<...>(null);
```

### Functions cu1ea7n xu00f3a
- `emptyPending()`, `parseTsv()`, `parseTsvRfc4180()`, `parseExcelDate()` u2014 GIu1eee lu1ea1i nu1ebfu muu1ed1n giu1eef paste feature
- `savePending()`, `saveEdit()`, `saveInlineField()`, `setPR()`
- `addRow()` u2014 thay bu1eb1ng open dialog
- `del()` u2014 thay bu1eb1ng logic phu00e2n quyu1ec1n mu1edbi

> **Giu1eef lu1ea1i paste:** Nu1ebfu muu1ed1n giu1eef tu00ednh nu0103ng paste tu1eeb clipboard (TSV), giu1eef `pending` state vu00e0 cu00e1c hu00e0m parse. Chu1ec9 xu00f3a inline edit tru00ean tu1eebng cell. Quyu1ebft u0111u1ecbnh cuu1ed1i cu00f9ng: **Xu00f3a hou00e0n tou00e0n pending rows** (bao gu1ed3m paste), vu00ec user u0111u00e3 chu1ecdn thu00eam tu1eebng du00f2ng qua dialog.

### Types cu1ea7n xu00f3a
```typescript
type PendingRow = { ... }; // xu00f3a
```

### JSX cu1ea7n xu00f3a
- Tou00e0n bu1ed9 khu1ed1i `{editId === lead.id ? <tr>...</tr> : ...}` u2192 chu1ec9 giu1eef display row
- Cu00e1c cell vu1edbi `onClick={() => setInlineEdit(...)}`
- `<AnimatePresence>{pending.map(...)}</AnimatePresence>`
- `<AnimatePresence>{pending.length > 0 && <motion.div>...Pending bar...</motion.div>}</AnimatePresence>`
- `editableCellCls`, `inlineCls` class helpers
- Icon imports: `Edit2` (thay bu1eb1ng nu00fat mu1edbi), `X` (cu00f3 thu1ec3 giu1eef)
- `onReady` prop + `LeadLogsTabProps` (nu1ebfu addRow khu00f4ng cu00f2n du00f9ng)

---

## B. Thu00eam mu1edbi

### State mu1edbi
```typescript
const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
const [dialogLead, setDialogLead] = useState<Lead | null>(null);
```

### Permission helper
```typescript
const isAdminOrLeaderSale = (
  currentUser?.isAdmin ||
  currentUser?.role === 'Admin' ||
  (currentUser?.role === 'Leader' && currentUser?.departments?.includes('Sale'))
);
```

### Hu00e0m xu1eed lu00fd delete theo role
```typescript
const handleDelete = async (lead: Lead) => {
  if (isAdminOrLeaderSale) {
    if (!confirm(`Xu00f3a lead "${lead.customerName}"?`)) return;
    await api.deleteLead(lead.id);
    fetchLeads();
  } else {
    // Member: gu1eedi yu00eau cu1ea7u
    if (!confirm(`Gu1eedi yu00eau cu1ea7u xu00f3a lead "${lead.customerName}"?`)) return;
    await api.requestLeadDelete(lead.id);
    fetchLeads();
  }
};

const handleCancelDeleteRequest = async (lead: Lead) => {
  await api.cancelLeadDeleteRequest(lead.id);
  fetchLeads();
};

const handleApproveDelete = async (lead: Lead) => {
  if (!confirm(`Duyu1ec7t xu00f3a lead "${lead.customerName}"?`)) return;
  await api.approveLeadDeleteRequest(lead.id);
  fetchLeads();
};

const handleRejectDelete = async (lead: Lead) => {
  await api.rejectLeadDeleteRequest(lead.id);
  fetchLeads();
};
```

### Cu1ed9t Actions (render)

**Admin/Leader thu1ea5y:**
- Nu1ebfu lead cu00f3 `deleteRequestedBy`: hiu1ec3n `u25cf` (dot u0111u1ecf) + `[u2705 Duyu1ec7t]` `[u274c Tu1eeb chu1ed1i]`
- Khu00e1c: `[u270fufe0f Edit]` `[ud83duddd1ufe0f Xu00f3a]`

**Member thu1ea5y:**
- Nu1ebfu lead cu00f3 `deleteRequestedBy === currentUser.id`: `[u23f3 u0110ang chu1edd]` (click = hu1ee7y request)
- Nu1ebfu lead cu00f3 `deleteRequestedBy` khu00e1c: hiu1ec3n `[u23f3]` disabled (khu00f4ng cu00f3 nu00fat hu1ee7y)
- Khu00e1c: `[u270fufe0f Edit]` `[Yu00eau cu1ea7u xu00f3a]`

```tsx
// Trong render row:
<td className={cellCls}>
  <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
    {/* Edit - mu1ecdi role */}
    <button
      onClick={() => { setDialogMode('edit'); setDialogLead(lead); }}
      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
    ><Edit2 size={16} /></button>

    {/* Delete / Request */}
    {lead.deleteRequestedBy ? (
      isAdminOrLeaderSale ? (
        // Admin/Leader: dot + approve/reject
        <>
          <span className="size-2 rounded-full bg-rose-500 inline-block" />
          <button onClick={() => handleApproveDelete(lead)}
            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
          ><Check size={16} /></button>
          <button onClick={() => handleRejectDelete(lead)}
            className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"
          ><X size={16} /></button>
        </>
      ) : lead.deleteRequestedBy === currentUser?.id ? (
        // Member: cu00f3 thu1ec3 hu1ee7y request cu1ee7a mu00ecnh
        <button onClick={() => handleCancelDeleteRequest(lead)}
          className="flex items-center gap-1 px-2 py-1 text-amber-600 bg-amber-50 rounded-xl text-[10px] font-black"
          title="Hu1ee7y yu00eau cu1ea7u xu00f3a"
        >u23f3 u0110ang chu1edd</button>
      ) : (
        // Member khu00e1c: chu1ec9 thu1ea5y tru1ea1ng thu00e1i
        <span className="px-2 py-1 text-slate-400 text-[10px] font-black">u23f3</span>
      )
    ) : (
      <button onClick={() => handleDelete(lead)}
        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
        title={isAdminOrLeaderSale ? 'Xu00f3a' : 'Yu00eau cu1ea7u xu00f3a'}
      ><Trash2 size={16} /></button>
    )}
  </div>
</td>
```

### Highlight row cu00f3 delete request (Admin/Leader)
```tsx
className={`hover:bg-slate-50/80 transition-colors group
  ${isSelected ? 'bg-primary/[0.04]' : ''}
  ${lead.deleteRequestedBy && isAdminOrLeaderSale ? 'border-l-2 border-rose-400' : ''}
`}
```

### Tich hu1ee3p LeadLogDialog
```tsx
{/* Cuu1ed1i JSX, tru01b0u1edbc LeadDetailModal */}
{dialogMode && (
  <LeadLogDialog
    mode={dialogMode}
    lead={dialogLead ?? undefined}
    aeOptions={aeOptions}
    onClose={() => { setDialogMode(null); setDialogLead(null); }}
    onSaved={fetchLeads}
  />
)}
```

### Nu00fat "+ Thu00eam du00f2ng" (trong LeadTracker.tsx hou1eb7c extraControls)

Cuu1ed1i trang lu1ea5y `onReady?.({ addRow })` u2014 thay addRow gu1ecdi:
```typescript
onReady?.({ paste: pasteFromClipboard, addRow: () => setDialogMode('add') });
```

Hou1eb7c nu1ebfu xu00f3a `onReady`, expose qua props mu1edbi. Kiu1ec3m tra `LeadTracker.tsx` cu00f3 gu1ecdi `addRow` tu1eeb `onReady` khu00f4ng u2014 cu1eadp nhu1eadt cho phu00f9 hu1ee3p.

---

## C. Cells hiu1ec3n thu1ecb (read-only, xu00f3a inline edit)

Tu1ea5t cu1ea3 cells cu1ee7a mu1ed7i row chuyu1ec3n vu1ec1 display-only. Xu00f3a `onClick={() => setInlineEdit(...)}` tru00ean mu1ecdi cell tru1eeb Customer (mu1edf detail modal).

---

## D. Bulk delete cu1eadp nhu1eadt

```typescript
const bulkDelete = async () => {
  if (!isAdminOrLeaderSale) {
    alert('Chu1ec9 Admin hou1eb7c Leader Sale mu1edbi cu00f3 thu1ec3 xu00f3a hu00e0ng lou1ea1t');
    return;
  }
  // ... giu1eef nguyu00ean logic hiu1ec7n tu1ea1i ...
};
```

Bu1ea5t ku1ef3 role nu00e0o vu1eabn cu00f3 thu1ec3 select rows (checkbox giu1eef nguyu00ean), nhu01b0ng nu00fat Delete trong BulkActionBar chu1ec9 hiu1ec3n khi `isAdminOrLeaderSale`.

---

## Todo

- [ ] Xu00f3a `PendingRow` type + `emptyPending/parseTsv/parseTsvRfc4180/parseExcelDate`
- [ ] Xu00f3a state: `pending, editId, draft, inlineEdit, inlineSaving`
- [ ] Xu00f3a functions: `savePending, saveEdit, saveInlineField, setPR, addRow, del`
- [ ] Xu00f3a JSX: edit rows, pending rows, pending bar, inline cell handlers
- [ ] Xu00f3a class helpers: `editableCellCls`, `inlineCls`
- [ ] Thu00eam state: `dialogMode, dialogLead`
- [ ] Thu00eam `isAdminOrLeaderSale` computed
- [ ] Thu00eam 4 hu00e0m: `handleDelete, handleCancelDeleteRequest, handleApproveDelete, handleRejectDelete`
- [ ] Cu1eadp nhu1eadt render row: display-only cells + Actions column mu1edbi
- [ ] Thu00eam highlight border cho rows cu00f3 pending delete request
- [ ] Tich hu1ee3p `<LeadLogDialog>` u1edf cuu1ed1i JSX
- [ ] Cu1eadp nhu1eadt `onReady.addRow` u2192 mu1edf dialog
- [ ] Cu1eadp nhu1eadt `bulkDelete` vu1edbi permission check
- [ ] Kiu1ec3m tra `LeadTracker.tsx` nu1ebfu cu1ea7n cu1eadp nhu1eadt `onReady` usage
- [ ] Compile check: `npx tsc --noEmit`
- [ ] Kiu1ec3m tra file <= 250 du00f2ng, nu1ebfu quu00e1 thu00ec tu00e1ch helper ra

## Success Criteria

- Admin/Leader: cu00f3 nu00fat Xu00f3a, xu00f3a ngay
- Member: nu00fat "Yu00eau cu1ea7u xu00f3a" u2192 lead hiu1ec3n badge u23f3 + `border-l-2 border-rose-400`
- Admin/Leader thu1ea5y dot u0111u1ecf + nu00fat Duyu1ec7t/Tu1eeb chu1ed1i tru00ean rows cu00f3 request
- Click Edit u2192 `LeadLogDialog mode=edit` mu1edf vu1edbi data u0111u00fang
- Click "+ Thu00eam du00f2ng" u2192 `LeadLogDialog mode=add` mu1edf
- Notes trong dialog: cu00f3 thu1ec3 xuu1ed1ng du00f2ng tu1ef1 nhiu00ean
- Khu00f4ng cu00f2n pending rows / Save All bar
