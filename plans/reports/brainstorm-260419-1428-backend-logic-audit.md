# Backend Logic Audit Report

**Date:** 2026-04-19
**Scope:** Sprint management, OKRs sync, Notification system

---

## Executive Summary

| Area | Status | Severity |
|------|--------|----------|
| Sprint Display | 🔴 BUG | Critical |
| Sprint Auto-Transition | ✅ Works | - |
| OKRs Progress Sync | ✅ Works | - |
| Notification System | ⚠️ NOT IMPLEMENTED | High |

---

## 1. Sprint Display Bug (CRITICAL)

### Root Cause
```typescript
// server/routes/sprint.routes.ts:13-20
const today = new Date(); // e.g., 2026-04-19 14:30:00

const sprint = await prisma.sprint.findFirst({
  where: {
    startDate: { lte: today },  // ✅ OK
    endDate: { gte: today }     // ❌ BUG: 00:00:00 >= 14:30:00 = FALSE
  },
});
```

### Database State
```
Sprint 2: 2026-04-06 00:00:00 → 2026-04-19 00:00:00
Sprint 3: 2026-04-20 00:00:00 → 2026-05-03 00:00:00
```

### Problem
- Sprint 2 endDate = `2026-04-19 00:00:00`
- Current datetime = `2026-04-19 14:30:04`
- Query fails: `00:00:00 >= 14:30:04` = FALSE
- **Result:** "No active sprint" displayed

### Fix Required
Compare DATE only, not full timestamp:
```typescript
// Option A: Set time to start/end of day
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

// Option B: Use DATE comparison in Prisma
// startDate <= today AND endDate >= today (date only)
```

---

## 2. Sprint Auto-Transition

### Current Logic
- **Passive system** - no cron job or scheduler
- Active sprint determined by query: `startDate <= today <= endDate`
- Frontend calls `/api/sprints/active` on component mount

### Analysis
| Scenario | Expected | Actual |
|----------|----------|--------|
| April 19 (Sprint 2 last day) | Sprint 2 | ❌ "No active sprint" (bug above) |
| April 20 (Sprint 3 first day) | Sprint 3 | ✅ Will work (if bug fixed) |

**Why it works for Sprint 3:**
- Sprint 3 starts at `2026-04-20 00:00:00`
- On April 20 at 08:00, query: `00:00:00 <= 08:00:00` = TRUE ✅

**Conclusion:** Auto-transition logic is correct. The bug only affects the LAST day of each sprint.

---

## 3. OKRs Progress Sync

### Implementation Status: ✅ COMPLETE

### Flow
```
1. User submits WeeklyReport with krProgress data
2. Leader/Admin approves via POST /api/reports/:id/approve
3. report.routes.ts:114-116 triggers sync:
   if (updated.krProgress) {
     await okrService.syncOKRProgress(updated);
   }
4. okrService.syncOKRProgress() updates KeyResult values
5. okrService.recalculateObjectiveProgress() updates Objective %
```

### Key Files
- [report.routes.ts:83-119](server/routes/report.routes.ts#L83-L119) - Approval endpoint
- [okr.service.ts:62-97](server/services/okr.service.ts#L62-L97) - syncOKRProgress
- [okr.service.ts:99-136](server/services/okr.service.ts#L99-L136) - recalculateObjectiveProgress

### Verified Logic
- Updates `currentValue` and `progressPercentage` for KeyResults
- Recalculates parent Objective progress from children
- Uses transaction for data integrity

---

## 4. Notification/Alert System

### Implementation Status: ⚠️ NOT IMPLEMENTED

### Current State
- **No backend routes** for notifications
- **No notification service** or model
- **No push/email** integration
- Only **visual indicators** exist:
  - Critical Path Health widget (frontend only)
  - Status badges on tasks/OKRs

### Missing Features
1. In-app notification center
2. Deadline warnings
3. Sprint completion alerts
4. OKR risk escalation
5. Report approval notifications
6. Team mentions/assignments

---

## Recommendations

### Immediate (Bug Fix)
1. **Fix Sprint Date Comparison** - Priority: CRITICAL
   - Normalize dates to start/end of day
   - Or use DATE-only comparison

### Short-term
2. **Add Notification System** - Priority: HIGH
   - Notification model in Prisma
   - Real-time via WebSocket or polling
   - Email integration (optional)

### Medium-term
3. **Add Cron Jobs for Automated Tasks**
   - Sprint transition notifications
   - Deadline reminders
   - OKR risk alerts

---

## Next Steps

- [ ] Fix sprint date comparison bug
- [ ] Test sprint transition on April 20
- [ ] Design notification system architecture
- [ ] Implement notification MVP
