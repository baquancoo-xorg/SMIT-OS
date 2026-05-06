# Explore: Employee Mapper and CRM Employee Tables Usage

**Date**: May 4, 2026  
**Task**: Analyze employee mapper implementation and CRM employee tables usage in SMIT-OS

---

## 1. Current Employee Mapper Implementation

### Location
`/server/services/lead-sync/employee-mapper.ts`

### How It Works

The `loadEmployeeMap()` function loads employee data **directly from the CRM `smit_employee` table** (not from SMIT-OS database).

**Fallback chain for fullName**:
1. `lark_info.name` (Lark system name)
2. `lark_info.en_name` (Lark English name)
3. `zalo_pancake_info.name` (Zalo Pancake system name)
4. Fallback: `CRM-emp-{user_id}` (if all above are missing)

**Key characteristics**:
- Returns: `Map<number, EmployeeMapValue>` where number is `user_id` (employee_user_id in CRM)
- Filters out deleted records: `PEERDB_IS_DELETED: false`
- Selected fields: `user_id`, `lark_info`, `zalo_pancake_info`
- No connection to SMIT-OS User table (deprecated `id` field)

```typescript
export type EmployeeMapValue = {
  id?: string; // deprecated: không còn link SMIT-OS User
  fullName: string;
};
```

### Usage in Lead Sync

In `/server/services/lead-sync/crm-lead-sync.service.ts`:
- Loaded once per sync run: `const employeeMap = await loadEmployeeMap()`
- Maps `CrmSubscriber.employee_id_modified` → Employee fullName
- Falls back to `"Unmapped"` if no match found
- Stored in `Lead.ae` field (Account Executive name)

```typescript
const mappedEmployee = sub.employee_id_modified !== null 
  ? employeeMap.get(sub.employee_id_modified) 
  : undefined;

return {
  ae: mappedEmployee?.fullName ?? 'Unmapped',
  // ... other fields
};
```

---

## 2. Alternative Employee Mapping in Call Performance

Location: `/server/services/dashboard/call-performance.service.ts`

This service implements a **different approach** for getting employee names:

1. **Primary**: Uses `loadEmployeeMap()` (same as lead-sync)
2. **Secondary**: Loads additional employees via `loadCrmEmployeeNameMap()`:
   - Filters by `is_active: true` (lead-sync doesn't filter this way)
   - Extracts `lark_info.name` OR `lark_info.enterprise_email` OR `lark_info.email`
   - Assigns `id: crm:{user_id}` format

This dual approach merges both sources to ensure coverage.

---

## 3. CRM Employee Tables Structure

### `smit_employee` (Primary source)
Located in CRM database:
```
user_id (INT, PK)
lark_info (JSON) - Contains: name, en_name, enterprise_email, email, etc.
zalo_pancake_info (JSON) - Contains: name
zalo_pancake_id (STRING)
lark_open_id (STRING)
permissions (JSON)
is_active (BOOLEAN)
is_change (BOOLEAN)
created_at (TIMESTAMP)
last_assigned_at (TIMESTAMP)
shift_expires_at (TIMESTAMP)
current_conversation_count (INT)
PEERDB_IS_DELETED (BOOLEAN)
PEERDB_SYNCED_AT (TIMESTAMP)
```

### `crm_employee_supervisor` (UNUSED)
Located in CRM database:
```
id (BIGINT, PK)
employee_user_id (INT) - Foreign key to smit_employee.user_id
asset_id (INT)
asset_type (STRING)
platform (STRING)
created_at (TIMESTAMP)
PEERDB_IS_DELETED (BOOLEAN)
PEERDB_SYNCED_AT (TIMESTAMP)
```

**Status**: **NOT QUERIED ANYWHERE** in the codebase
- No references to `crm_employee_supervisor` in any `.ts` file
- This table appears to track supervisor relationships but is completely unused
- Purpose suggests it's meant to map employees to their supervisors but implementation is missing

---

## 4. Usage of `employee_user_id` in CRM

The field `employee_user_id` (which equals `smit_employee.user_id`) is used in:

1. **`crm_activities`** - Employee who performed the action
2. **`crm_call_history`** - Employee/AE who made the call
3. **`crm_subs_appointment`** - Employee who scheduled appointment
4. **`crm_requested`** - Employee who made the request
5. **Subscribers (`employee_id_modified`)** - Assigned AE for the subscriber

### Currently Queried

- ✅ `call-performance.service.ts` - Queries `crm_call_history.employee_user_id`
- ✅ `crm-lead-sync.service.ts` - Uses `crmSubscriber.employee_id_modified`

### Table in SMIT-OS

`User` model has:
```
crmEmployeeId (INT?, @unique)
```

This field **SHOULD** link to `smit_employee.user_id` but is optional and not enforced.

---

## 5. How to Get AE Name from `employee_user_id`

### Current Approach
Use `loadEmployeeMap()`:
```typescript
const employeeMap = await loadEmployeeMap();
const employee = employeeMap.get(employee_user_id); // Returns EmployeeMapValue
const aeName = employee?.fullName ?? 'Unmapped';
```

### Direct Query Alternative
```typescript
const employee = await crm.smit_employee.findUnique({
  where: { user_id: employee_user_id },
  select: { lark_info: true, zalo_pancake_info: true }
});
// Then apply fallback logic from loadEmployeeMap()
```

### Issues with Current Implementation
1. **No caching between calls** - `loadEmployeeMap()` loads ALL employees on every sync run
2. **No filtering by `is_active`** - Could include inactive employees
3. **No supervisor mapping** - `crm_employee_supervisor` is never used
4. **Dual implementations** - Lead-sync and call-performance use different filtering logic

---

## 6. Gap Analysis

### Gaps Identified

1. **`crm_employee_supervisor` is unused**
   - Table exists but no queries reference it
   - Supervisor hierarchy information is inaccessible
   - No way to get manager/leader of an employee

2. **No filtering by `is_active`**
   - Lead-sync includes all employees (including inactive)
   - Call-performance filters by `is_active: true`
   - Inconsistency could lead to stale employee names

3. **No name normalization**
   - Different employees might have similar names in different systems
   - No `smit_ae_name_mapping` table usage for AE name mapping
   - `smit_ae_name_mapping` table exists but is completely unused

4. **Employee-User linkage is fragile**
   - SMIT-OS `User.crmEmployeeId` is optional and not enforced
   - Script `seed-user-crm-employee-id.ts` must be run manually
   - No automatic sync between SMIT-OS users and CRM employees

5. **Fallback approach produces poor UX**
   - `"CRM-emp-{id}"` fallback is not user-friendly
   - `"Unmapped"` for missing employee_id_modified is unhelpful
   - No alerting mechanism for unmapped leads

6. **Performance concern**
   - `loadEmployeeMap()` loads full table into memory every sync
   - Could be optimized with selective loading or caching

---

## 7. Recommendations (Future Work)

1. **Implement supervisor hierarchy** - Query `crm_employee_supervisor` to build org chart
2. **Standardize employee filtering** - Add `is_active: true` filter to all queries
3. **Use `smit_ae_name_mapping`** - Normalize AE names using existing mapping table
4. **Enforce User-CRM linkage** - Make `User.crmEmployeeId` required and synchronized
5. **Add caching layer** - Cache employee map with TTL (5-10 min) like call-performance does
6. **Monitor unmapped leads** - Alert on `"Unmapped"` AE values
7. **Bulk fetch employees** - Load only employees with activity in sync period

---

## Files Analyzed

- `/server/services/lead-sync/employee-mapper.ts` - Primary employee mapper
- `/server/services/lead-sync/crm-lead-sync.service.ts` - Lead sync using mapper
- `/server/services/dashboard/call-performance.service.ts` - Alternative employee loading
- `/server/lib/crm-db.ts` - CRM database connection layer
- `/prisma/crm-schema.prisma` - CRM table definitions
- `/prisma/schema.prisma` - SMIT-OS table definitions
- `/scripts/seed-user-crm-employee-id.ts` - Manual user-to-employee mapping

---

## Summary

The employee mapper is a functional but basic implementation that:
- ✅ Works for lead sync AE assignment
- ✅ Has reasonable fallback chain (Lark → Zalo Pancake → ID)
- ❌ Doesn't use `crm_employee_supervisor` for hierarchy
- ❌ Inconsistent `is_active` filtering between services
- ❌ Unused `smit_ae_name_mapping` table
- ❌ No caching or performance optimization
- ❌ Poor fallback messaging for missing data

The `crm_employee_supervisor` table exists but is completely unused - indicates incomplete implementation of supervisor tracking features.
