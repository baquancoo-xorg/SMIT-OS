# Code Review: Resolved Date Auto-Sync Feature

**Date:** 2026-05-01  
**Reviewer:** code-reviewer  
**Scope:** resolvedDate derivation from CRM activities

---

## Summary

| Metric | Value |
|--------|-------|
| Score | **8/10** |
| Files Reviewed | 6 |
| Critical Issues | 0 |
| High Priority | 1 |
| Medium Priority | 2 |
| Lint/Type Check | PASS |

---

## Overall Assessment

Solid implementation following existing codebase patterns. The batch-query approach avoids N+1. Proper CRM field locking on UI and API. One potential logic edge case worth addressing.

---

## Critical Issues

None.

---

## High Priority

### 1. resolvedDate Not Cleared When Lead Status Changes Away From Qualified/Unqualified

**File:** `server/services/lead-sync/crm-lead-sync.service.ts` lines 195-201

```typescript
const quSubIds = batch
  .filter((s) => {
    const st = statusBySubscriber.get(s.id);
    return st === 'Qualified' || st === 'Unqualified';
  })
  .map((s) => s.id);
const resolvedDateMap = await loadResolvedDateMap(quSubIds);
```

**Issue:** If a lead was previously `Qualified` (and received a `resolvedDate`), then CRM status changes back to a non-qualifying status, the code does NOT query for that subscriber, so `resolvedDateMap.get(sub.id)` returns `undefined`, which maps to `null` via `?? null`.

This is **actually correct behavior** (clearing the date when status reverts). However, verify business requirement: should resolved date persist even if status reverts? If yes, this needs adjustment.

**Recommendation:** Add unit test documenting expected behavior for status reversion.

---

## Medium Priority

### 2. CRM_LOCKED_FIELDS Inconsistency

**File:** `server/routes/lead.routes.ts` line 9

```typescript
const CRM_LOCKED_FIELDS = ['customerName', 'ae', 'receivedDate', 'status', 'notes'] as const;
```

**Issue:** `resolvedDate` is in `CRM_OWNED_FIELDS` (constants.ts) but NOT in `CRM_LOCKED_FIELDS` here. However, looking at the PUT handler (lines 279-284):

```typescript
...(existing.syncedFromCrm
  ? {}
  : {
      ...(receivedDate && { receivedDate: new Date(receivedDate) }),
      ...(resolvedDate !== undefined && { resolvedDate: resolvedDate ? new Date(resolvedDate) : null }),
    }),
```

The logic blocks `receivedDate` and `resolvedDate` for synced leads via the ternary, NOT via `stripCrmLockedFields`. This is inconsistent — some fields locked via array, some via ternary. Works correctly but maintenance hazard.

**Recommendation:** Unify approach — either add `resolvedDate` to `CRM_LOCKED_FIELDS` OR document why date fields need special handling (Date instantiation).

---

### 3. Filtering Only Latest Status Change Activity

**File:** `server/services/lead-sync/derive-resolved-date.ts` lines 17-18

```typescript
orderBy: [{ subscriber_id: 'asc' }, { created_at: 'desc' }],
```

Then lines 27-28:
```typescript
if (!result.has(key)) result.set(key, row.created_at);
```

**Observation:** Uses `desc` order + first-occurrence-wins to get latest `change_status_subscriber` activity. This is correct but relies on ordering behavior within the loop.

**Minor concern:** If the CRM has status changes A->Qualified->B->Qualified, this captures the **most recent** `change_status_subscriber`, which might be B->Qualified (correct) but could also be the transition OUT of Qualified. The activity `change_status_subscriber` presumably logs the transition, but we're using `created_at` of that log, not validating the target status.

**Recommendation:** Verify CRM activity schema — does `change_status_subscriber` action indicate the status being changed TO, or just that a change occurred? May need to filter by status field if available.

---

## Low Priority

### 4. BigInt/Number Conversion in Multiple Places

Files convert between `bigint` and `number` when interacting with Prisma queries that expect `number` (line 4 of derive-resolved-date.ts, line 15 of derive-notes.ts).

```typescript
const uniqueIds = Array.from(new Set(crmSubIds.map((id) => Number(id))));
```

This is fine for IDs within JS safe integer range, but worth noting if CRM subscriber IDs could exceed `Number.MAX_SAFE_INTEGER`.

---

## Positive Observations

1. **Batch query pattern:** Both `loadNotesMap` and `loadResolvedDateMap` fetch all needed data in single query, avoiding N+1
2. **Consistent null handling:** `?? null` fallback throughout
3. **UI properly disables DatePicker:** `disabled={isCrmLocked}` with visual feedback
4. **safeCrmQuery wrapper:** Graceful handling of CRM connection failures with fallback to empty results
5. **Audit logging:** Changes tracked via `collectChanges` and `leadAuditLog`
6. **Advisory lock:** Prevents concurrent sync runs

---

## Security Checklist

- [x] No SQL injection (uses Prisma parameterized queries)
- [x] No PII leakage in error messages
- [x] Auth/authz enforced via RBAC middleware
- [x] Input validation via Zod schemas
- [x] CRM fields properly locked at both API and UI layers

---

## Recommended Actions

1. **Add test:** Document expected behavior when status reverts from Qualified/Unqualified
2. **Unify locking approach:** Consider adding `resolvedDate` to `CRM_LOCKED_FIELDS` for consistency
3. **Verify CRM activity schema:** Confirm `change_status_subscriber` captures the correct timestamp for "became Qualified"

---

## Unresolved Questions

1. Business requirement: Should `resolvedDate` persist if lead status reverts to non-qualifying status?
2. Does `crm_activities.change_status_subscriber` have a field indicating target status, or just that a change occurred?

---

**Status:** DONE  
**Summary:** Implementation is production-ready with one edge case to verify against business requirements.
