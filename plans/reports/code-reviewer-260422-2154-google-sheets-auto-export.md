# Code Review: Google Sheets Auto-Export Feature

**Date:** 2026-04-22  
**Scope:** server/types, server/lib, server/services, server/jobs, server/routes, frontend component  
**LOC:** ~450 lines across 12 files

---

## Overall Assessment

**PASS with minor concerns.** Well-structured implementation with proper separation (client, service, extractors). Security model is sound. A few edge cases need attention.

---

## Critical Issues

**None.**

---

## High Priority

### 1. Race Condition: Concurrent Export Jobs

**File:** `server/services/sheets-export.service.ts:17-24`

```typescript
async export(): Promise<ExportResult> {
  const jobId = crypto.randomUUID();
  this.currentJob = { ... }; // Overwrites any existing job state
```

**Problem:** The route checks `status === 'running'` before triggering, but there is a TOCTOU race. Two near-simultaneous requests can both pass the check and overwrite `currentJob`.

**Impact:** Lost status tracking, duplicate spreadsheets created.

**Fix:** Use mutex or check-and-set atomic operation:
```typescript
if (this.currentJob?.status === 'running') {
  throw new Error('Export already running');
}
this.currentJob = { ... };
```

### 2. Unbounded Query in Extractors

**Files:** `analytics-overview.extractor.ts`, `planning.extractor.ts`, `crm.extractor.ts`

Several extractors fetch all records without pagination:
- `planningBacklog` - all work items with `sprintId: null`
- `crmLeadTracker` - all leads
- `workspaceExtractor` - all items by department

**Impact:** Memory exhaustion on large datasets, slow exports.

**Recommendation:** Add `take: 5000` limits or pagination. Log warning if limit reached.

---

## Medium Priority

### 3. Error Handling: Non-Null Assertions

**File:** `server/lib/google-sheets-client.ts:30-31`

```typescript
const spreadsheetId = response.data.spreadsheetId!;
const url = response.data.spreadsheetUrl!;
```

**Problem:** If API returns malformed response, this throws unhandled error.

**Fix:** Validate response before using:
```typescript
if (!response.data.spreadsheetId || !response.data.spreadsheetUrl) {
  throw new Error('Invalid Google API response');
}
```

### 4. Missing Credentials Validation at Startup

**File:** `server/lib/google-sheets-client.ts:8-22`

Constructor uses env vars directly without validation. If `GOOGLE_SERVICE_ACCOUNT_EMAIL` or `GOOGLE_PRIVATE_KEY` are missing, the first API call will fail cryptically.

**Fix:** Add startup validation:
```typescript
if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
  console.warn('[GoogleSheetsClient] Missing credentials - export disabled');
}
```

### 5. Frontend Polling Cleanup

**File:** `src/components/settings/sheets-export-tab.tsx:51-59`

Polling interval is not cleaned up on component unmount.

**Fix:** Use `useEffect` with cleanup:
```typescript
useEffect(() => {
  let intervalId: number;
  if (polling) {
    intervalId = setInterval(...);
  }
  return () => clearInterval(intervalId);
}, [polling]);
```

### 6. JSON Parse Without Try-Catch

**File:** `server/services/sheets-export/extractors/rituals.extractor.ts:21-23`

```typescript
const tasks = JSON.parse(r.tasksData || '{}');
const adHoc = r.adHocTasks ? JSON.parse(r.adHocTasks) : [];
```

**Problem:** Malformed JSON in DB crashes entire export.

**Fix:** Wrap in try-catch or use safe parser.

---

## Low Priority

### 7. Unused `DEPARTMENTS` Constant

**File:** `server/services/sheets-export/extractors/workspace.extractor.ts:4`

`DEPARTMENTS` array defined but unused.

### 8. Hardcoded Sheet Count

**File:** `src/components/settings/sheets-export-tab.tsx:86`

```tsx
<span className="text-2xl font-bold text-primary">13</span>
```

Hardcoded. Should reflect actual extractor count.

---

## Security Review

| Area | Status | Notes |
|------|--------|-------|
| Admin-only access | OK | Route middleware checks `req.user?.isAdmin` |
| Auth middleware applied | OK | `createAuthMiddleware` at `/api` covers sheets-export |
| Credentials in env | OK | Not hardcoded, uses env vars |
| No PII leak | OK | Export is admin-only, no external exposure |
| Input validation | OK | No user input to validate (trigger only) |

---

## Positive Observations

- Clean separation: client / service / extractors pattern
- Retry logic with exponential backoff
- Admin notification on failure
- Proper timezone for scheduled job
- Concurrent request detection (though imperfect)

---

## Recommended Actions

1. **[HIGH]** Add mutex/lock for concurrent export protection
2. **[HIGH]** Add query limits to extractors (5000 records max)
3. **[MEDIUM]** Add startup validation for Google credentials
4. **[MEDIUM]** Fix polling cleanup in React component
5. **[MEDIUM]** Add try-catch around JSON.parse in extractors
6. **[LOW]** Remove unused DEPARTMENTS constant

---

## Unresolved Questions

1. Should export history be persisted to DB for audit trail?
2. Is 5-second retry delay appropriate, or should it back off more aggressively?
3. Should failed exports be retried on next scheduled run?

---

**Status:** DONE_WITH_CONCERNS  
**Summary:** Feature is production-ready with minor race condition and unbounded query risks. Recommend addressing HIGH items before heavy usage.  
**Concerns:** Race condition in concurrent trigger, potential memory issues with large datasets.
