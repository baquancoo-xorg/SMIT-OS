# Phase 04 — Validation Checklist

## Build & Static Validation
- [ ] `npm run build` passes
- [ ] No TypeScript errors in edited files

## Manual Validation

### Notification
- [ ] Dismiss one deadline notification, F5, item stays dismissed
- [ ] Badge looks clean at `1`, `9`, `9+`
- [ ] Mark-all-read for system notifications still works

### Lead Logs SLA
- [ ] Open lead received today => `On-time (D-7)` or equivalent remaining
- [ ] Open lead received 8+ days ago => `Overdue (+1...)`
- [ ] Qualified/Unqualified => `Closed`

### Stats
- [ ] Label shows `Attempted` (not `Approaching`)
- [ ] On-time and Overdue counters match row-level SLA

### Filters
- [ ] `With note` excludes blank/null notes
- [ ] `Without note` only blank/null notes
- [ ] `Note changed date` filters by `updatedAt` selected day
- [ ] Combined filters produce stable result (no crash, no empty-query errors)

## Rollback Safety
- Keep changes isolated to 5 files listed in plan
- No schema migration required
