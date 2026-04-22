# Phase 04 u2014 LeadLogDialog Component

## Overview
- Priority: High
- Status: pending
- Depends on: phase-03
- File: `src/components/lead-tracker/lead-log-dialog.tsx` (mu1edbi)

## Mu00f4 tu1ea3

Modal duy nhu1ea5t du00f9ng cho cu1ea3 Add vu00e0 Edit lead. Khi mode=edit, form u0111u01b0u1ee3c prefill bu1eb1ng data cu1ee7a lead. Khi mode=add, form ru1ed7ng.

## Props Interface

```typescript
interface LeadLogDialogProps {
  mode: 'add' | 'edit';
  lead?: Lead;                        // required khi mode='edit'
  aeOptions: { id: string; fullName: string }[];
  onClose: () => void;
  onSaved: () => void;               // gu1ecdi sau khi save thu00e0nh cu00f4ng u2192 refetch
}
```

## State

```typescript
const [form, setForm] = useState<FormData>(initialForm);
const [saving, setSaving] = useState(false);
const [error, setError] = useState<string | null>(null);
```

`FormData` type:
```typescript
type FormData = {
  customerName: string;
  ae: string;
  receivedDate: string;
  resolvedDate: string;
  status: string;
  leadType: string;
  unqualifiedType: string;
  notes: string;
};
```

## Logic

```typescript
const initialForm: FormData = mode === 'edit' && lead ? {
  customerName: lead.customerName,
  ae: lead.ae,
  receivedDate: lead.receivedDate.slice(0, 10),
  resolvedDate: lead.resolvedDate?.slice(0, 10) ?? '',
  status: lead.status,
  leadType: lead.leadType ?? '',
  unqualifiedType: lead.unqualifiedType ?? '',
  notes: lead.notes ?? '',
} : {
  customerName: '', ae: '',
  receivedDate: new Date().toISOString().slice(0, 10),
  resolvedDate: '', status: 'u0110ang liu00ean hu1ec7',
  leadType: '', unqualifiedType: '', notes: '',
};

const handleSave = async () => {
  if (!form.customerName || !form.ae || !form.receivedDate || !form.status) {
    setError('Vui lu00f2ng u0111iu1ec1n u0111u1ee7 cu00e1c tru01b0u1eddng bu1eaft buu1ed9c');
    return;
  }
  setSaving(true);
  setError(null);
  try {
    const payload = {
      ...form,
      resolvedDate: form.resolvedDate || null,
      leadType: form.leadType || null,
      unqualifiedType: form.status === 'Unqualified' ? (form.unqualifiedType || null) : null,
      notes: form.notes || null,
    };
    if (mode === 'add') {
      await api.createLead(payload);
    } else {
      await api.updateLead(lead!.id, payload);
    }
    onSaved();
    onClose();
  } catch (err: any) {
    setError(err?.message ?? 'Lu1ed7i khi lu01b0u');
  } finally {
    setSaving(false);
  }
};
```

## Layout Modal

```
u250cu2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2510
u2502 [x]  Thu00eam lead mu1edbi / Chu1ec9nh su1eeda lead    u2502
u251cu2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2524
u2502 Customer Name *          [input      ] u2502
u2502 AE *                     [select     ] u2502
u2502 Received Date *          [date       ] u2502
u2502 Resolved Date            [date       ] u2502
u2502 Status *                 [select     ] u2502
u2502 Lead Type                [select     ] u2502
u2502 UQ Reason (if UQ)        [select     ] u2502
u2502 Notes                    [textarea   ] u2502
u2502                          (resize-y)    u2502
u251cu2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2524
u2502 [error msg]   [Hu1ee7y] [Lu01b0u]              u2502
u2514u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2500u2518
```

- Overlay: `fixed inset-0 bg-black/40 backdrop-blur-sm z-50`
- Panel: `bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 p-6`
- Du00f9ng `motion.div` (motion/react) cho animation fade+slide
- Notes: `textarea rows={4} className="resize-y"` u2014 Enter = newline tu1ef1 nhiu00ean
- u0110u00f3ng bu1eb1ng Escape key (useEffect + keydown listener)
- u0110u00f3ng khi click overlay

## File Size

Target: ~120-140 du00f2ng. Nu1ebfu vu01b0u1ee3t 150 du00f2ng, tu00e1ch form fields ra hook `use-lead-form.ts`.

## Todo

- [ ] Tu1ea1o `src/components/lead-tracker/lead-log-dialog.tsx`
- [ ] Implement props interface + state
- [ ] Implement `handleSave` (gu1ecdi API create/update)
- [ ] Render modal layout vu1edbi overlay + animation
- [ ] Notes field: `resize-y`, Enter = newline
- [ ] Escape key u0111u00f3ng modal
- [ ] Compile check: `npx tsc --noEmit`

## Success Criteria

- Mode add: form ru1ed7ng, lu01b0u u2192 POST API u2192 `onSaved()` u2192 u0111u00f3ng
- Mode edit: form prefill, lu01b0u u2192 PUT API u2192 `onSaved()` u2192 u0111u00f3ng
- Notes: cu00f3 thu1ec3 xuu1ed1ng nhiu1ec1u du00f2ng tu1ef1 nhiu00ean
- Validation: hiu1ec3n thu1ecb lu1ed7i nu1ebfu thiu1ebfu field bu1eaft buu1ed9c
- Animation mu01b0u1ee3t (fade + slide up)
