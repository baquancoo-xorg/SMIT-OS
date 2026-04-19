# Scout Report: SMIT-OS Backend Logic

**Generated:** 2026-04-19 14:28
**Focus:** Sprint management, OKRs progress update, Weekly report approval, Notification/Alert system

---

## 1. Sprint Management Logic

### Files
| File | Description |
|------|-------------|
| `/Users/dominium/Documents/Project/SMIT-OS/server/routes/sprint.routes.ts` | API routes for sprint CRUD + active sprint detection |
| `/Users/dominium/Documents/Project/SMIT-OS/server/schemas/sprint.schema.ts` | Zod validation schemas |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/settings/sprint-cycles-tab.tsx` | Admin UI for managing sprint cycles |
| `/Users/dominium/Documents/Project/SMIT-OS/prisma/schema.prisma` | Sprint model (lines 31-37) |

### Logic Summary
- **Active Sprint Detection**: `GET /api/sprints/active` queries for sprint where `startDate <= today <= endDate`
- **Sprint Stats Calculation**: Computed from work items: done/inProgress/todo/blocked counts
- **Progress Calculation**: `(done items / total items) * 100`
- **Days Left**: `Math.ceil((endDate - today) / (1000*60*60*24))`
- **No Auto-Transition**: Sprints are manually managed; active sprint determined by date range comparison only

### Key Endpoints
- `GET /api/sprints/active` - Returns current sprint + stats + daysLeft
- `GET /api/sprints` - List all sprints
- `POST/PUT/DELETE /api/sprints/:id` - Admin-only CRUD

---

## 2. OKRs Progress Update Logic

### Files
| File | Description |
|------|-------------|
| `/Users/dominium/Documents/Project/SMIT-OS/server/services/okr.service.ts` | Core OKR service with syncOKRProgress + recalculateObjectiveProgress |
| `/Users/dominium/Documents/Project/SMIT-OS/server/routes/objective.routes.ts` | Objective CRUD + recalculate endpoint |
| `/Users/dominium/Documents/Project/SMIT-OS/server/routes/key-result.routes.ts` | KR CRUD (triggers recalculation) |
| `/Users/dominium/Documents/Project/SMIT-OS/server/routes/okr-cycle.routes.ts` | OKR cycle management (quarterly periods) |
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/OKRsManagement.tsx` | Frontend OKR tree view |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/settings/okr-cycles-tab.tsx` | Admin cycle management UI |

### Logic Summary

**syncOKRProgress(report)** (okr.service.ts:62-97):
1. Parse `krProgress` JSON from weekly report
2. Fetch all KeyResults by IDs
3. For each KR: update `currentValue` and `progressPercentage`
4. Run as single transaction
5. Then call `recalculateObjectiveProgress()`

**recalculateObjectiveProgress()** (okr.service.ts:99-136):
1. Fetch all objectives with KRs and children
2. For L2 objectives (with parentId): avg of KR progress
3. For L1 objectives (no parentId): avg of children's KR averages
4. Batch update all objectives in transaction

**Key Flow**: Weekly report approval -> syncOKRProgress -> recalculateObjectiveProgress

---

## 3. Weekly Report Approval Workflow

### Files
| File | Description |
|------|-------------|
| `/Users/dominium/Documents/Project/SMIT-OS/server/routes/report.routes.ts` | Weekly report routes + approval logic |
| `/Users/dominium/Documents/Project/SMIT-OS/server/schemas/report.schema.ts` | Report validation schemas |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/modals/WeeklyCheckinModal.tsx` | Weekly check-in form with KR progress input |
| `/Users/dominium/Documents/Project/SMIT-OS/src/types/index.ts` | WeeklyReport type definition |

### Approval Logic (report.routes.ts:83-119)

```
POST /api/reports/:id/approve
```

1. **Auth**: `RBAC.leaderOrAdmin` middleware
2. **Validation**: Check report exists
3. **Department Check** (for Leaders only):
   - Leader must share at least one department with report user
   - Report user must be "Member" role
4. **Update Report**: Set `status='Approved'`, `approvedBy`, `approvedAt`
5. **Sync OKRs**: If `krProgress` exists, call `okrService.syncOKRProgress(report)`

### Weekly Check-in Data Flow (WeeklyCheckinModal.tsx)
1. User selects team (if admin/leader)
2. Fetches objectives for selected team
3. User inputs progress changes per KR (`progress_added`)
4. Submits: builds `krProgress` array with `{krId, progressPct, currentValue}`
5. Server stores report with status='Review'
6. Leader/Admin approves -> triggers OKR sync

---

## 4. Notification/Alert System

### Files Found
| File | Description |
|------|-------------|
| `/Users/dominium/Documents/Project/SMIT-OS/src/pages/OKRsManagement.tsx` | Critical Path Health indicator |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/daily-report/components/BlockerCard.tsx` | Blocker display component |
| `/Users/dominium/Documents/Project/SMIT-OS/src/components/modals/WeeklyCheckinModal.tsx` | AlertCircle icon for blockers section |

### Current State
**No dedicated notification/alert system exists.** Current "alerts" are:

1. **Critical Path Health** (OKRsManagement.tsx:73-92):
   - Computed client-side based on objective progress
   - `Critical`: >30% objectives off track
   - `At Risk`: >10% off track OR >50% at risk
   - `Stable/Excellent`: based on on-track count
   - Display only, no push notifications

2. **Blocker Indicators**:
   - Impact levels (none/low/high) in daily reports
   - Visual indicators on task cards
   - No automated escalation

---

## Summary

| Feature | Implementation Status |
|---------|----------------------|
| Sprint calculation | Simple date range query, stats computed from work items |
| Sprint auto-transition | None - manual management only |
| OKR progress sync | Triggered on weekly report approval via `syncOKRProgress()` |
| Objective rollup | Recursive calculation: L2 KRs -> L1 objective avg |
| Weekly report approval | Leader/Admin with department matching |
| Notification system | **Not implemented** - only visual indicators |

---

## Unresolved Questions

1. No cron/scheduler for sprint auto-transition - is this intentional?
2. No push notification infrastructure - planned feature?
3. OKR cycles exist but objectives not linked to cycles - relationship needed?
4. Daily report approval doesn't sync OKRs - only weekly - by design?
