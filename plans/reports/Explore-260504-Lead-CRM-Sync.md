# Lead Model & CRM Sync Logic Exploration Report

## 1. Lead Model Structure (Prisma Schema)

**Location:** `/Users/dominium/Documents/Project/SMIT-OS/prisma/schema.prisma` (lines 191-215)

### Key Fields:

| Field | Type | Purpose | Notes |
|-------|------|---------|-------|
| `id` | String (UUID) | Primary key | Auto-generated |
| `customerName` | String | Lead/customer name | CRM-owned (synced from crm_subscriber.fullName) |
| `ae` | String | Account Executive/Sales person | CRM-owned; mapped from employee name, not a FK to User |
| `receivedDate` | DateTime | When lead was created | CRM-owned; normalized to UTC noon |
| `resolvedDate` | DateTime? | When lead reached final status | CRM-owned; nullable; derived from crm_activities |
| `status` | String | Lead status | CRM-owned; enum: Mới, Đang liên hệ, Đang nuôi dưỡng, Qualified, Unqualified |
| `leadType` | String? | Vietnam vs International | Not CRM-owned; editable by users |
| `unqualifiedType` | String? | Reason for disqualification | Not CRM-owned; editable by users |
| `notes` | String? | Lead notes/details | CRM-owned; derived from crm_activities |
| `crmSubscriberId` | BigInt? (UNIQUE) | Link to CRM subscriber | **Critical field linking to CRM** |
| `syncedFromCrm` | Boolean | Was this lead created/synced from CRM? | Default: false |
| `lastSyncedAt` | DateTime? | Timestamp of last sync | Tracks sync operation |
| `deleteRequestedBy` | String? | User ID requesting deletion | For soft-delete workflow |
| `deleteRequestedAt` | DateTime? | When deletion was requested | For soft-delete workflow |
| `deleteReason` | String? | Why lead is being deleted | For soft-delete workflow |
| `createdAt` | DateTime | Record creation timestamp | System-managed |
| `updatedAt` | DateTime | Record update timestamp | System-managed |

**Indexes:**
- `(ae, receivedDate)`
- `(ae, resolvedDate)`
- `status`
- `receivedDate`

### Important Observation:
**The `ae` field is NOT a foreign key to the User model.** It's a denormalized string field storing the employee's full name, not user ID.

---

## 2. AE Field Population Logic

### During CRM Sync (Primary Path)

**File:** `/Users/dominium/Documents/Project/SMIT-OS/server/services/lead-sync/crm-lead-sync.service.ts`

The AE field is populated in the `mapLeadPayload()` function (lines 56-88):

```typescript
const mappedEmployee = sub.employee_id_modified !== null 
  ? employeeMap.get(sub.employee_id_modified) 
  : undefined;

ae: mappedEmployee?.fullName ?? 'Unmapped',
```

**Flow:**
1. CRM subscriber has `employee_id_modified` (integer, references CRM employee ID)
2. `loadEmployeeMap()` loads a map: `Map<CRM_employee_id, {fullName: string}>`
3. Look up employee in map using `employee_id_modified`
4. If found, use employee's `fullName`
5. If not found or employee_id is null, use fallback: **'Unmapped'**

### Employee Name Resolution (Fallback Chain)

**File:** `/Users/dominium/Documents/Project/SMIT-OS/server/services/lead-sync/employee-mapper.ts` (lines 12-37)

The `loadEmployeeMap()` function queries CRM's `smit_employee` table and uses this fallback chain:

```
1. lark_info.name (preferred)
2. lark_info.en_name
3. zalo_pancake_info.name
4. CRM-emp-{id} (fallback format)
```

### Manual Lead Creation (Non-CRM Path)

**File:** `/Users/dominium/Documents/Project/SMIT-OS/server/routes/lead.routes.ts` (lines 249-262)

When creating a lead manually:
- The `ae` field is **required** in the schema validation
- User must explicitly provide the AE name
- No automatic mapping occurs
- Accepts any string value (typically a Sales team member's name)

### Manual Lead Updates

**File:** `/Users/dominium/Documents/Project/SMIT-OS/server/routes/lead.routes.ts` (lines 264-302)

When updating leads:
- If `syncedFromCrm: true`, the `ae` field is **locked** (protected from manual edits)
- If `syncedFromCrm: false`, the `ae` field **can be edited** by Sales users
- Updates are tracked in `LeadAuditLog` with field changes

---

## 3. CRM Subscriber Link & Sync Logic

### CRM Subscriber Table Structure

CRM side has `crmSubscriber` model with:
- `id` (BigInt) - CRM subscriber ID
- `fullName` - Customer name
- `employee_id_modified` (Int) - Links to CRM employee ID
- `status` - CRM status (mapped to SMIT statuses)
- `createdAt`, `updatedAt` - Timestamps
- `PEERDB_IS_DELETED` - Deletion flag

### Lead Sync Process

**File:** `/Users/dominium/Documents/Project/SMIT-OS/server/services/lead-sync/crm-lead-sync.service.ts` (lines 138-340)

**Entry Point:** `syncLeadsFromCrm(options: SyncOptions)`

**Key Steps:**
1. **Batch Fetch** (lines 108-136): Fetch CRM subscribers modified in time window
   - Only syncs subscribers modified after `CUTOFF_2026_04_01`
   - Batches of 50 records
   
2. **Load Maps:**
   - Status mapping: `LeadStatusMapping` table (CRM status → SMIT status)
   - Employee mapping: Direct CRM query for employee names
   - Notes: Last 90 days of CRM activities (add_note action)
   - Resolved date: Latest status change date

3. **Create/Update Logic:**
   - **New Lead:** If no existing `crmSubscriberId` match, create new Lead record
   - **Existing Lead:** If exists, check for changes and update only if needed
   - **Soft-deleted leads:** Skip updating leads marked for deletion (`deleteRequestedAt` not null)

4. **AE Assignment During Sync:**
   - Calls `mapLeadPayload()` which resolves `ae` via employee map
   - If employee not found: `ae: 'Unmapped'`
   - This value is synced to the Lead record

### CRM-Locked Fields

**File:** `/Users/dominium/Documents/Project/SMIT-OS/server/routes/lead.routes.ts` (lines 9)

These fields are protected from manual edits on CRM-synced leads:
```typescript
const CRM_LOCKED_FIELDS = ['customerName', 'ae', 'receivedDate', 'resolvedDate', 'status', 'notes']
```

This ensures CRM-synced data integrity.

---

## 4. Sync Execution & Scheduling

### Cron Trigger

**File:** `/Users/dominium/Documents/Project/SMIT-OS/server/cron/lead-sync.cron.ts`

- Runs every **10 minutes** (Asia/Ho_Chi_Minh timezone)
- Uses advisory lock to prevent concurrent syncs: `LEAD_SYNC_LOCK_KEY = 3735928559n`
- Only processes changes since last successful sync

### Manual/Backfill Sync

**File:** `/Users/dominium/Documents/Project/SMIT-OS/server/routes/lead-sync.routes.ts`

Exposes API endpoints for:
- Manual sync trigger
- Backfill sync with custom date range
- Query sync run history

---

## 5. Audit & Tracking

### LeadAuditLog Model

Tracks all changes to leads:
- `leadId` - Lead being modified
- `actorUserId` - User making change (or 'system-sync')
- `changes` - JSON: `{field: {from: string, to: string}}`
- `createdAt` - When change occurred

**Tracked Fields:**
```typescript
const TRACKED_FIELDS = [
  'status', 'ae', 'leadType', 'unqualifiedType', 
  'notes', 'resolvedDate', 'receivedDate'
]
```

---

## 6. Code Paths Summary

### Creating Lead with AE:

**Manual Creation Path:**
1. POST `/leads` with `ae` in body
2. Validation: `ae` field is required (zod schema)
3. Insert directly to DB
4. No audit log for creation (implicit)

**CRM Sync Path:**
1. Cron triggers every 10 minutes
2. Fetch CRM subscribers with `employee_id_modified`
3. Load `employeeMap` from CRM
4. Resolve `employee_id_modified` → employee fullName
5. Create/Update Lead with resolved `ae`
6. Create `LeadAuditLog` with source: 'crm-sync-create' or changes

### Updating AE Field:

**Manual Update (Non-CRM Leads):**
1. PUT `/leads/:id` with `ae` in body
2. Check `syncedFromCrm`: if true, reject update (CRM-locked)
3. Otherwise, update Lead record
4. Create audit log tracking change

**CRM Sync Update:**
1. During sync, `ae` value is recalculated
2. Old value vs new value compared
3. If different, Lead updated and audit log created
4. Can "overwrite" manually-set `ae` if employee mapping changes

### Getting AE List:

**File:** `/Users/dominium/Documents/Project/SMIT-OS/server/routes/lead.routes.ts` (lines 56-63)

GET `/leads/ae-list` returns all users in Sales department:
```sql
SELECT id, fullName FROM User WHERE departments contains 'Sale'
```

This is a reference list for UI dropdowns.

---

## 7. Key Constraints & Behaviors

| Constraint | Details |
|-----------|---------|
| **Unique crmSubscriberId** | Prevents duplicate CRM syncs |
| **AE string storage** | Not a FK; allows unmapped values |
| **CRM-locked on sync** | Fields `ae`, `customerName`, `status`, etc. cannot be manually edited once synced |
| **Soft-delete workflow** | Synced leads cannot be hard-deleted; must request deletion first |
| **Employee unmapped fallback** | If CRM employee mapping fails, defaults to `'Unmapped'` |
| **No asset_id in model** | No explicit asset/account ID field; only `crmSubscriberId` links to CRM |
| **Async audit tracking** | Audit logs created asynchronously; may lag slightly |

---

## 8. Unresolved Questions & Notes

1. **Subscriber to AE mapping:** Currently purely via `employee_id_modified` on CRM side. Is there a need to link subscribers to assets or accounts?

2. **Unmapped employees:** If `'Unmapped'` becomes a common value, there's no way to distinguish between "no employee assigned" vs "employee exists but not in mapping". Consider explicit NULL handling.

3. **Name as FK:** Using employee fullName as primary reference (not ID) creates fragility if names change. Consider adding `crmEmployeeId` field to Lead model for structural integrity.

4. **User.crmEmployeeId:** User model has `crmEmployeeId` field (lines 30 in schema), but it's not used in lead sync mapping. Opportunity for consistency.

5. **Sales team reference:** `/ae-list` returns Users with 'Sale' department, but sync uses CRM employees. Verify these are in sync or clarify the mapping.
