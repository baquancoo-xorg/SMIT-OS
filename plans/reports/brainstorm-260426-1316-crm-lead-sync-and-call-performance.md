# Brainstorm Report — CRM Lead Auto-Sync & Call Performance Dashboard

**Date:** 2026-04-26 13:16 (Asia/Saigon)
**Project:** SMIT-OS
**Scope:** Tự động sync subscriber từ CRM DB → Lead Logs (Leadtracker), thêm Call Performance Dashboard cho AE

---

## 1. Problem Statement

**Hiện trạng:**
- Trang **Lead Logs** (`src/pages/LeadTracker.tsx`) hoàn toàn manual entry (paste Excel hoặc tạo từng lead).
- SMIT-OS đã có read-only connection tới CRM DB qua `server/lib/crm-db.ts` (Prisma client, env `CRM_DATABASE_URL`).
- **Dashboard KPI Table** đã có sẵn nhưng aggregate company-wide, không per-AE.
- Không có view nào về hiệu suất gọi của từng AE.

**Hai chức năng cần xây:**

**A. Auto-sync Lead** từ `crm_subscribers` → SMIT `Lead` table, định kỳ (CRM master, SMIT mirror).

**B. Call Performance Dashboard** dùng `crm_call_history` để hiển thị metric per-AE (calls, answer rate, peak hours, conversion, trend).

---

## 2. Discovery Summary (Findings)

### CRM Schema Relevant Tables

| Table | Purpose | Key fields |
|---|---|---|
| `crm_subscribers` | Lead source | `id, email, phone, full_name, source, status, mql_date, employee_id_modified, created_at, updated_at` |
| `crm_activities` | Action log | `subscriber_id, employee_user_id, action, data_from(json), data_to(json), created_at` |
| `crm_call_history` | Call log | `subscriber_id, employee_user_id, call_type, total_duration, answer_duration, call_result, voice_url, call_ai_summary, call_start_time, call_end_time` |
| `smit_employee` | CRM employee table | `user_id` (mapped to `employee_user_id` ở chỗ khác) |
| `smit_ae_name_mapping` | Mapping AE name (SMIT ↔ CRM) | **0 rows hiện tại — KHÔNG dùng** |

### Live Data Snapshot (since 2026-04-01)

- 391 subscribers (310 có AE assigned)
- 386 calls, 4 AEs active
- Status values khớp 1:1 với SMIT enum:
  - `new` ↔ "Mới"
  - `mql_contacting` ↔ "Đang liên hệ"
  - `mql_nurturing` ↔ "Đang nuôi dưỡng"
  - `mql_qualified` ↔ "Qualified"
  - `mql_unqualified` ↔ "Unqualified"
- 523 `change_status_subscriber` events nhưng `data_from`/`data_to` thường NULL → phải dùng heuristic
- `call_result` là free-text Vietnamese, không chuẩn hoá → dùng `total_duration > 10s` làm proxy Answered

### Gaps in CRM (vs Lead Logs schema)

| SMIT Lead field | CRM có? | Plan |
|---|---|---|
| `customerName` | ✅ `full_name` | Direct map |
| `ae` | ⚠️ Cần JOIN qua `employee_id_modified` → User mapping | Thêm cột `User.crmEmployeeId` |
| `receivedDate` | ✅ `created_at` | Direct map |
| `resolvedDate` | ❌ Không có | Derive từ `crm_activities` (latest status-change event khi sub đang final state) |
| `status` | ✅ `status` (text) | Map qua bảng config `LeadStatusMapping` |
| `leadType` (VN/Quốc Tế) | ❌ Không có | **SMIT-only field, AE tự nhập, không bao giờ overwrite** |
| `unqualifiedType` | ❌ Không có | **SMIT-only field, AE tự nhập** |
| `notes` | ⚠️ Có activities `add_note` nhưng khác semantic | **SMIT-only field, AE tự nhập** |

---

## 3. Decisions (đã chốt với user)

| # | Quyết định | Rationale |
|---|---|---|
| 1 | **CRM master, SMIT mirror (read-mostly)** | Đơn giản, ít conflict |
| 2 | Resolved Date = timestamp của `change_status_subscriber` activity gần nhất khi sub đang `mql_qualified`/`mql_unqualified` | Bypass null `data_from`/`data_to` |
| 3 | Polling cron mỗi 5-15 phút | Đáng tin, không phụ thuộc CRM team |
| 4 | Sync **tất cả** subscribers (no filter) | Volume nhỏ, ~16 leads/day |
| 5 | **SMIT-only fields KHÔNG bao giờ bị sync ghi đè:** `notes`, `leadType`, `unqualifiedType` | Bảo vệ AE work |
| 6 | Backfill từ **2026-04-01** trở đi (cutoff cố định) | User chỉ định |
| 7 | Match Lead ↔ Subscriber qua **`crmSubscriberId`** (cột mới, FK soft) | Robust nhất |
| 8 | **`LeadStatusMapping` table** (admin edit qua UI tương lai) | Linh hoạt khi CRM thêm status |
| 9 | **Audit log mọi sync attempt** (mọi update tạo entry với `actorUserId='system-sync'`) | Trace nguồn thay đổi |
| 10 | **Disable manual create Lead** (deprecated bulk paste, "Add Lead" button) | Lead Logs 100% CRM-driven |
| 11 | AE mapping qua **`User.crmEmployeeId` (Int? @unique)** trên schema SMIT | SMIT tự chủ, không phụ thuộc smit_ae_name_mapping rỗng |
| 12 | Call answered = `total_duration > 10s` (heuristic) | Bỏ qua free-text noise |
| 13 | Call Performance: 1 section mới trong `DashboardOverview`, gồm 4 widgets (per-AE table, heatmap, conversion, trend line) | Co-located với KPI hiện hữu |

---

## 4. Final Design

### 4.1 Database Changes (SMIT primary DB)

**File:** `prisma/schema.prisma`

```prisma
model Lead {
  // ... existing fields ...
  crmSubscriberId   BigInt?   @unique          // NEW: link to CRM
  syncedFromCrm     Boolean   @default(false)  // NEW: flag
  lastSyncedAt      DateTime?                  // NEW: latest sync timestamp
  // resolvedDate, status, ae, etc. unchanged
}

model User {
  // ... existing fields ...
  crmEmployeeId     Int?      @unique          // NEW: maps to crm.employee_user_id
}

// NEW table: configurable status mapping
model LeadStatusMapping {
  id          Int      @id @default(autoincrement())
  crmStatus   String   @unique                  // e.g., "mql_qualified"
  smitStatus  String                            // e.g., "Qualified"
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// NEW table: track sync runs
model LeadSyncRun {
  id              Int      @id @default(autoincrement())
  startedAt       DateTime @default(now())
  finishedAt      DateTime?
  status          String                           // "running" | "success" | "failed"
  subscribersScanned Int   @default(0)
  leadsCreated    Int      @default(0)
  leadsUpdated    Int      @default(0)
  errors          Json?
  triggerType     String                           // "cron" | "manual" | "backfill"
}
```

**Migrations:**
- Add columns/tables (non-breaking)
- Seed `LeadStatusMapping` with 5 known mappings
- Seed `User.crmEmployeeId` for known AEs (manual one-time, có thể qua admin UI sau)

### 4.2 Sync Engine

**File:** `server/services/lead-sync/crm-lead-sync.service.ts`

```
syncLeadsFromCrm(opts: { from?: Date, to?: Date, mode: 'incremental' | 'backfill' })
├─ getStatusMap()                   // Cached LeadStatusMapping
├─ getEmployeeMap()                  // Cached User.crmEmployeeId → User.fullName
├─ fetchCrmSubscribers(since)       // Where created_at >= cutoff & updated_at >= since
├─ For each subscriber:
│   ├─ Resolve status via map
│   ├─ Resolve ae via employee map (null if no mapping)
│   ├─ Resolve resolvedDate via deriveResolvedDate(subId, status)
│   ├─ Find existing Lead by crmSubscriberId
│   │   ├─ EXISTS: update only CRM-owned fields
│   │   │   (customerName, ae, receivedDate, resolvedDate, status, lastSyncedAt)
│   │   │   PROTECT: notes, leadType, unqualifiedType, deleteRequested*
│   │   └─ NOT EXISTS: create with syncedFromCrm=true
│   └─ Write LeadAuditLog with actorUserId='system-sync'
├─ Record LeadSyncRun
```

**`deriveResolvedDate(subscriberId, currentStatus)`:**
```typescript
if (currentStatus !== 'Qualified' && currentStatus !== 'Unqualified') return null;
const last = await crmPrisma.crm_activities.findFirst({
  where: { subscriber_id: subscriberId, action: 'change_status_subscriber' },
  orderBy: { created_at: 'desc' },
});
return last?.created_at ?? null;
```

**Cron registration:** `server/cron/lead-sync.cron.ts` — every 10 minutes, calls service with `mode='incremental'`.

**Backfill script:** `scripts/backfill-crm-leads.ts` — one-time, `mode='backfill'`, `from=2026-04-01`.

**API endpoints:**
- `POST /api/leads/sync-now` (Admin only) — trigger manual sync
- `GET /api/leads/sync-status` — last sync run info
- `GET /api/admin/lead-status-mapping` & `PUT /api/admin/lead-status-mapping/:id` — manage mapping (future)

### 4.3 UI Changes

**Lead Logs page (`src/pages/LeadTracker.tsx`):**
- **Remove:** "Add Lead" button, bulk paste Excel modal
- **Add:** "Sync from CRM" button (Admin only) + last sync status indicator
- **Add badge** column: source = "CRM" (auto) icon
- Edit modal: disable customerName/receivedDate/status fields (CRM-owned, read-only); enable notes/leadType/unqualifiedType only
- Resolved Date column: auto-display, no manual edit

### 4.4 Call Performance Dashboard

**New section in `src/pages/DashboardOverview.tsx`** (below existing KPI Table)

**Component tree:**
```
src/components/dashboard/call-performance/
├─ CallPerformanceSection.tsx          (container, date filter)
├─ CallPerformanceAeTable.tsx          (per-AE summary)
├─ CallPerformanceHeatmap.tsx          (7×24 heatmap)
├─ CallPerformanceConversion.tsx       (calls→qualified ratio per AE)
└─ CallPerformanceTrend.tsx            (line chart over time)
```

**API:** `GET /api/dashboard/call-performance?from=&to=&aeId=`

Returns:
```typescript
{
  perAe: Array<{
    aeUserId: string,
    aeName: string,
    totalCalls: number,
    answeredCalls: number,        // total_duration > 10
    answerRate: number,            // %
    avgDuration: number,           // seconds
    totalLeadsCalled: number,      // distinct subscriber_id
    callsPerLead: number,
  }>,
  heatmap: Array<{ dayOfWeek: 0-6, hour: 0-23, callCount: number }>,
  conversion: Array<{
    aeUserId: string,
    aeName: string,
    callsToQualified: number,      // calls for sub → mql_qualified
    callsToUnqualified: number,
    avgCallsBeforeClose: number,
  }>,
  trend: Array<{ date: string, calls: number, answered: number, avgDuration: number }>,
}
```

**Service:** `server/services/dashboard/call-performance.service.ts`
- Query `crm_call_history` with `created_at` between from/to
- JOIN with `User` via `User.crmEmployeeId = crm_call_history.employee_user_id`
- Aggregate by AE, by hour, by date
- For conversion: cross-reference với current `crm_subscribers.status`

**Volume:** ~15 calls/day × 30 days = 450 rows query → cheap

### 4.5 Workflow & Edge Cases

**Edge cases handled:**

| Case | Behavior |
|---|---|
| CRM sub has `employee_id_modified=NULL` | Create Lead with `ae=null`, log warning |
| CRM AE not in `User.crmEmployeeId` | Skip AE assignment, log warning, retry next sync |
| CRM status not in `LeadStatusMapping` | Default to "Mới", log warning |
| Lead manually deleted in SMIT (soft-delete) | Sync re-creates? **NO — skip sync nếu Lead đã soft-deleted** |
| CRM subscriber updated multiple times between syncs | Use `updated_at >= last_sync_at` filter |
| Sync conflict (concurrent runs) | Use advisory lock (`SELECT pg_try_advisory_lock`) |
| AE đã edit notes trong SMIT, sync chạy lại | notes/leadType/unqualifiedType KHÔNG ghi đè (idempotent partial update) |
| `data_from`/`data_to` NULL trong activity | Resolved Date = activity timestamp (current state) |
| Heatmap timezone | Convert `call_start_time` to Asia/Saigon trước khi group by hour |

---

## 5. Implementation Risks

| Risk | Mitigation |
|---|---|
| Sync overwrites AE work nếu logic sai | Unit test field protection thoroughly; LeadAuditLog mọi sync |
| `deriveResolvedDate` không chính xác (data_from/to NULL) | Edge case: nếu sub revert từ qualified → contacting → qualified lại, resolvedDate sẽ là lần mới nhất (acceptable) |
| `User.crmEmployeeId` mapping thiếu → leads không có AE | Initial seed manually; admin UI sau; báo cáo "unmapped CRM employees" trong sync run |
| Backfill 391 records trong 1 transaction quá dài | Chunked: 50 records/batch |
| `crm_call_history.employee_user_id` reference user không tồn tại trong SMIT | Show as "Unmapped (CRM ID: 63988)" trong dashboard |
| Disable manual create làm AE mất quyền edit lead lịch sử | Migration script set `syncedFromCrm=false` cho lead cũ → vẫn edit được |
| CRM thay đổi schema (thêm status mới) | LeadStatusMapping configurable + log unknown status |

---

## 6. Success Metrics

| Metric | Target |
|---|---|
| Sync latency (CRM update → Lead Logs visible) | < 15 min |
| Sync success rate | > 99% per run |
| AE work preservation | 0 cases of overwritten notes/leadType/unqualifiedType |
| Backfill completion | < 5 min for 391 records |
| Call Performance dashboard load time | < 2s for 30-day window |
| Unmapped CRM employees | Báo cáo hiển thị, ratio < 5% sau 1 tuần |

---

## 7. Open / Deferred Questions

1. **Admin UI cho `LeadStatusMapping` & `User.crmEmployeeId` mapping** — cần thiết kế trang riêng (Setting/Admin section). Phase 2.
2. **Permission cho "Sync from CRM" button** — Admin only, hay Leader Sales cũng được?
3. **Voice URL & AI summary** — có hiển thị trong drill-down lead detail không? (đã có data trong CRM)
4. **Recovery khi cron fail liên tục** — alert kênh nào? (Slack? Email? On-screen banner?)
5. **`syncedFromCrm=false` legacy leads** — có sync ngược không nếu match được crmSubscriberId? Có cần "Reconcile legacy" script không?
6. **Cohort view cho Call Performance** — hiện chỉ realtime theo date range, có cần cohort như KPI Table không?

---

## 8. Next Steps

1. User review report
2. User chọn: tạo implementation plan chi tiết qua `/ck:plan`, hay implement trực tiếp tay
3. Phase ưu tiên đề xuất:
   - **Phase 1:** Schema migration (Lead, User, LeadStatusMapping, LeadSyncRun) + seed
   - **Phase 2:** Sync service + cron + manual API
   - **Phase 3:** Backfill script (run 1 lần)
   - **Phase 4:** Lead Logs UI updates (disable manual, sync button, badges)
   - **Phase 5:** Call Performance API + Dashboard widgets
   - **Phase 6:** Admin UI cho mapping (deferred)
