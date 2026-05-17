# Phase 04 — Attention Inbox

**Priority:** High — actionable signals
**Status:** pending
**Depends on:** Phase 01

## Why
User: "kết hợp SMIT OS để xem nhân sự nào đang có bao nhiêu vấn đề, vấn đề nào cần chú ý". Inbox style feed thay vì grid scan.

## Requirements

### Functional
- F1. List rows of personnel needing attention, each row: avatar, name, position, **reason chips** (flag codes), severity (needs_attention/at_risk)
- F2. Sort selector: `[Latest | Most flags | Lowest score]`
- F3. Filter chip: `[All | Needs Attention | At Risk]`
- F4. Click row → open existing `<PersonnelProfileDrawer>` (reuse, no new drawer)
- F5. Empty state: "Toàn team on-track ✓" (no emoji per project — use checkmark icon `lucide-react/Check`)
- F6. Max 10 rows initial, "Show all (N)" expand

### v4 contract
- Row card: `rounded-2xl` dark `bg-surface-1` border subtle
- Severity tag: re-use existing `<PersonnelStatusBadge>` (already v4-compliant)
- Reason chips: dark pill `bg-surface-2 text-text-2` (NO solid orange)
- Click affordance: hover `bg-surface-2/60` shift

## Files

| Action | Path | LOC |
|---|---|---|
| CREATE | `src/components/features/dashboard/personnel/attention-inbox.tsx` | ~130 |
| CREATE | `src/components/features/dashboard/personnel/attention-row.tsx` | ~90 |

## Implementation
1. `attention-row.tsx` — single row presentation, click → onOpen(id)
2. `attention-inbox.tsx`:
   - Local state `sort`, `filter`, `expanded`
   - Memoized filtered+sorted list (useMemo)
   - Reuse `<PersonnelProfileDrawer>` from `src/components/features/personnel/`
3. Server side: `attentionItems` from Phase 01 endpoint already pre-computed with all needed fields

## Todo
- [ ] `attention-row.tsx` row component
- [ ] `attention-inbox.tsx` with sort/filter/expand
- [ ] Wire drawer open
- [ ] Empty state with Check icon
- [ ] Verify expand keeps scroll position

## Success criteria
- Sort/filter recompute đúng
- Click row mở drawer correct personnel
- Empty state khi 0 items
- Drawer close không reset filter state

## Risks
- **R1:** Drawer reuse có hook side-effect khi mount/unmount nhiều. Mitigation: dùng controlled `openId` state pattern y hệt existing `personnel-dashboard-tab.tsx`.
