---
phase: 03
status: pending
priority: high
---

# Phase 03 - Frontend End Sprint UI

## Context
- File: `src/components/layout/SprintContextWidget.tsx`
- Thu00eam "Ku1ebft thu00fac Sprint" button vu00e0o dropdown + dialog xu00e1c nhu1eadn

## UI Flow

```
Click "Ku1ebft thu00fac Sprint"
  u2192 fetch GET /api/sprints/:id/incomplete
  u2192 Show dialog:
      - Nu1ebfu 0 items: "Khu00f4ng cu00f3 task chu01b0a hou00e0n thu00e0nh. Xu00e1c nhu1eadn ku1ebft thu00fac?"
      - Nu1ebfu cu00f3 items: Hiu1ec3n danh su00e1ch + "Su1ebd chuyu1ec3n sang [sprint name] / backlog chung"
  u2192 Click "Xu00e1c nhu1eadn" u2192 POST /api/sprints/:id/complete
  u2192 Close dialog + re-fetch /api/sprints/active
```

## State mu1edbi cu1ea7n thu00eam

```ts
const [showEndDialog, setShowEndDialog] = useState(false);
const [endDialogLoading, setEndDialogLoading] = useState(false);
const [completing, setCompleting] = useState(false);
const [incompleteData, setIncompleteData] = useState<{
  incompleteItems: Array<{ id: string; title: string; status: string; type: string; assignee?: { fullName: string } }>;
  nextSprint: { id: string; name: string } | null;
} | null>(null);
```

## Handler functions

```ts
const handleEndSprintClick = async () => {
  if (!data?.sprint) return;
  setEndDialogLoading(true);
  try {
    const res = await fetch(`/api/sprints/${data.sprint.id}/incomplete`);
    const result = await res.json();
    setIncompleteData(result);
    setShowEndDialog(true);
    setIsOpen(false); // u0110u00f3ng dropdown
  } catch (err) {
    console.error('Failed to fetch incomplete items:', err);
  } finally {
    setEndDialogLoading(false);
  }
};

const handleConfirmComplete = async () => {
  if (!data?.sprint) return;
  setCompleting(true);
  try {
    await fetch(`/api/sprints/${data.sprint.id}/complete`, { method: 'POST' });
    setShowEndDialog(false);
    // Re-fetch active sprint
    const res = await fetch('/api/sprints/active');
    const newData = await res.json();
    setData(newData);
  } catch (err) {
    console.error('Failed to complete sprint:', err);
  } finally {
    setCompleting(false);
  }
};
```

## UI: Button trong Dropdown

Thu00eam vu00e0o phu1ea7n "Action" cu1ee7a dropdown (sau "View Sprint Board" button):

```tsx
<div className="p-4 border-t border-slate-100 space-y-2">
  <button
    onClick={() => { setIsOpen(false); onViewBacklog?.(); }}
    className="w-full text-center text-sm font-medium text-primary hover:underline"
  >
    View Sprint Board u2192
  </button>
  <button
    onClick={handleEndSprintClick}
    disabled={endDialogLoading}
    className="w-full text-center text-sm font-medium text-error hover:underline disabled:opacity-50"
  >
    {endDialogLoading ? 'Loading...' : 'Ku1ebft thu00fac Sprint'}
  </button>
</div>
```

## UI: End Sprint Dialog

Dialog render bu00ean ngou00e0i `<div ref={ref}>`, du00f9ng AnimatePresence:

```tsx
<AnimatePresence>
  {showEndDialog && incompleteData && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={() => setShowEndDialog(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">Ku1ebft thu00fac Sprint</h3>
          <p className="text-sm text-slate-500 mt-1">{data?.sprint?.name}</p>
        </div>

        {/* Body */}
        <div className="p-5">
          {incompleteData.incompleteItems.length === 0 ? (
            <p className="text-sm text-slate-600">Tu1ea5t cu1ea3 task u0111u00e3 hou00e0n thu00e0nh. Xu00e1c nhu1eadn ku1ebft thu00fac sprint?</p>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-3">
                Cu00f3 <span className="font-bold text-error">{incompleteData.incompleteItems.length}</span> task chu01b0a hou00e0n thu00e0nh su1ebd u0111u01b0u1ee3c chuyu1ec3n sang{' '}
                <span className="font-bold">{incompleteData.nextSprint?.name ?? 'backlog chung'}</span>.
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1.5">
                {incompleteData.incompleteItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-sm">
                    <span className="w-16 text-xs font-medium text-slate-400 truncate">{item.status}</span>
                    <span className="flex-1 text-slate-700 truncate">{item.title}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex gap-3 justify-end">
          <button
            onClick={() => setShowEndDialog(false)}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            Hu1ee7y
          </button>
          <button
            onClick={handleConfirmComplete}
            disabled={completing}
            className="px-4 py-2 text-sm font-bold text-white bg-error rounded-xl hover:bg-error/90 disabled:opacity-50 transition-all"
          >
            {completing ? 'Đang xu1eed lu00fd...' : 'Xu00e1c nhu1eadn ku1ebft thu00fac'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

## Steps
- [ ] Thu00eam state mu1edbi vu00e0o SprintContextWidget
- [ ] Thu00eam `handleEndSprintClick` vu00e0 `handleConfirmComplete` functions
- [ ] Thu00eam button "Ku1ebft thu00fac Sprint" vu00e0o dropdown action section
- [ ] Thu00eam End Sprint Dialog component (render sau `</div>` closing ref)
- [ ] Test: click end sprint u2192 dialog hiu1ec3n u2192 confirm u2192 widget reset

## Success Criteria
- Dialog hiu1ec3n u0111u00fang danh su00e1ch task chu01b0a xong
- Sau confirm: sprint khu00f4ng cu00f2n hiu1ec3n lu00e0 active
- Task chu01b0a xong xuu1ea5t hiu1ec7n trong sprint mu1edbi hou1eb7c unassigned
- Widget tu1ef1 refresh sau khi ku1ebft thu00fac
