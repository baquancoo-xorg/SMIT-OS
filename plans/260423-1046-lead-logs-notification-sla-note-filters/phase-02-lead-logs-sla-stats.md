# Phase 02 — Lead Logs SLA Column + Stats Labels

## Overview
- Priority: High
- Goal: add SLA visibility for AE handling and adjust stat labels

## File
- `src/components/lead-tracker/lead-logs-tab.tsx`

## SLA Rule (Approved)
- Status `Qualified` or `Unqualified` => `Closed`
- Otherwise compare `today` vs `receivedDate + 7 days`:
  - `On-time (D-x)` when days left >= 0
  - `Overdue (+x)` when overdue > 0

## Implementation

1. **Add SLA column in table**
   - Extend `COLS` with `SLA`
   - Render badge/text in each row using helper function

2. **Add SLA helper (pure function)**
   - Input: `lead.status`, `lead.receivedDate`
   - Output: `{ label, tone }` where label is `Closed` / `On-time (D-x)` / `Overdue (+x)`

3. **Update stat bar**
   - Rename `Approaching` => `Attempted`
   - Add counters:
     - `On-time`: open leads still within SLA
     - `Overdue`: open leads vượt SLA

## Risks
- Date boundary drift by timezone; use date-only normalization for stable counting
- Ensure `Closed` leads are excluded from On-time/Overdue counts

## Done Checklist
- [ ] SLA column visible and values correct for sample cases
- [ ] `Approaching` removed, replaced by `Attempted`
- [ ] Stat bar includes `On-time` and `Overdue` with correct counts
