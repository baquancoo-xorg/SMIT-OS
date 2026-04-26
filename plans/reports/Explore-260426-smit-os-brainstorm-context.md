# SMIT-OS Codebase Exploration Report
**Date:** 2026-04-26  
**Context:** Gathering baseline info on Lead Logs, CRM DB connection, Dashboard KPI metrics, AE user model

---

## 1. LEAD LOGS PAGE (Leadtracker)

### Frontend Page & Components
- **Page:** `/Users/dominium/Documents/Project/SMIT-OS/src/pages/LeadTracker.tsx`
- **Main Tab Component:** `/Users/dominium/Documents/Project/SMIT-OS/src/components/lead-tracker/lead-logs-tab.tsx`
- **Supporting Components:**
  - `lead-detail-modal.tsx` – Detail view/modal for single lead
  - `lead-log-dialog.tsx` – Add/Edit dialog
  - `bulk-action-bar.tsx` – Bulk edit operations
  - `daily-stats-tab.tsx` – CRM Stats view (secondary tab)

### Fields/Columns Displayed in Lead Logs Table
From `lead-logs-tab.tsx` line 113-124 (COLS definition):
```
Customer | AE | Received | Resolved | Status | SLA | Lead Type | UQ Reason | Notes | Modified
```

**Detailed field mapping:**
- `customerName` – Customer name (string)
- `ae` – Account Executive name (string, from User.fullName where dept=Sale)
- `receivedDate` – Date lead received (DateTime)
- `resolvedDate` – Date lead resolved/closed (DateTime, nullable)
- `status` – Lead status (enum: "Mới", "Đang liên hệ", "Đang nuôi dưỡng", "Qualified", "Unqualified")
- `leadType` – Lead type (enum: "Việt Nam", "Quốc Tế", nullable)
- `unqualifiedType` – Reason if Unqualified (enum: "Unreachable", "Rejected", "Bad Fit", "Timing", nullable)
- `notes` – Free-text notes (string, nullable)
- `updatedAt` – Last modified timestamp (DateTime)

**SLA Calculation (computed, not stored):**
- If lead status is "Qualified" or "Unqualified" → "Closed"
- Else: deadline = receivedDate + 7 days
  - If days remaining >= 0 → "On-time (D-{daysLeft})"
  - If overdue → "Overdue (+{overdueDays})"

### Data Source & API Endpoints

**API Endpoints:**
- `GET /api/leads` – Fetch leads with filters (ae, status, dateFrom, dateTo, hasNote, noteDate)
- `POST /api/leads` – Create new lead (authenticated, Sale dept or Admin only)
- `PUT /api/leads/:id` – Update lead (creates audit log for tracked fields)
- `DELETE /api/leads/:id` – Delete lead (Admin/Leader Sales only)
- `GET /api/leads/ae-list` – Get all Sales AEs (for dropdown)
- `GET /api/leads/daily-stats` – Get daily stats for CRM Stats tab
- `POST /api/leads/:id/delete-request` – Request deletion (regular AE)
- `POST /api/leads/:id/delete-request/approve` – Approve deletion request (Admin/Leader)
- `GET /api/leads/:id/audit` – Get audit log for a lead

**Server Route Implementation:**  
`/Users/dominium/Documents/Project/SMIT-OS/server/routes/lead.routes.ts`

**Database Tables:**

1. **Lead** (Prisma schema lines 190-211)
   ```
   Columns: id, customerName, ae, receivedDate, resolvedDate, status, 
   leadType, unqualifiedType, notes, deleteRequestedBy, 
   deleteRequestedAt, deleteReason, createdAt, updatedAt
   
   Indexes:
   - [ae, receivedDate]
   - [ae, resolvedDate]
   - [status]
   - [receivedDate]
   ```

2. **LeadAuditLog** (Prisma schema lines 213-223)
   ```
   Columns: id, leadId, actorUserId, changes (JSON), createdAt
   
   Tracked fields: status, ae, leadType, unqualifiedType, 
   notes, resolvedDate, receivedDate
   ```

**Key Behaviors:**
- Bulk paste from Excel (TSV parsing, auto-converts date formats D/M/YYYY)
- Bulk edit selected leads (status, ae, leadType)
- Soft delete with reason (AE requests, Admin approves/rejects)
- Audit log on all field changes (tracked fields only)
- Daily stats computed: added, processed, remaining, conversion rates

---

## 2. CRM DATABASE CONNECTION

### Connection Configuration
- **Env Var:** `CRM_DATABASE_URL` (external read-only PostgreSQL)
- **Example:** `postgresql://reader:pass@100.114.94.34:12112/crm_replica`
- **Driver:** Prisma Client (dynamically generated from CRM schema)

### CRM Client Initialization
**File:** `/Users/dominium/Documents/Project/SMIT-OS/server/lib/crm-db.ts`

**Key Functions:**
```typescript
initCrmClient()              // Lazy init, loads from node_modules/.prisma/crm-client
isCrmDatabaseAvailable()     // Test connection to crmSubscriber table
safeCrmQuery<T>(fn, fallback) // Safely execute CRM query with error handling
getCrmClient()               // Get initialized client
```

**Setup Required:**
```bash
npm run prisma:pull:crm      # Pull CRM schema to prisma/schema-crm.prisma
npm run prisma:gen           # Generate CRM Prisma client
```

### CRM Database Tables Being Read
**From `/server/services/dashboard/overview-kpi.service.ts` lines 86-179:**

1. **crmSubscriber** – Customer accounts
   - Fields queried: `createdAt`, `adBudgetMonth`, `adAccountQty`, `mql_date`, `status`
   - Usage: Signups count, MQL metrics, SQL metrics

2. **crmBusiness** – Business accounts
   - Fields: `createdAt`, `isTrial`
   - Usage: Trial metrics

3. **crmOpportunity** – Sales opportunities
   - Fields: `createdAt`
   - Usage: Opportunity metrics

4. **businessTransaction** – Completed orders
   - Fields: `createdAt`, `isTrial`, `status`, `userPaid`
   - Usage: Order & revenue metrics

5. **crmBusinessPqlStatus** – Lead qualification tracking
   - Fields: `first_sync_at`, `has_first_sync`, `pql_achieved_at`, `is_pql`
   - Usage: Pre-PQL, PQL metrics

### CRM Data Flow → SMIT-OS Dashboard
**Service:** `/Users/dominium/Documents/Project/SMIT-OS/server/services/dashboard/overview-kpi.service.ts`

```
CRM Tables (via crmPrisma client)
  ↓
fetchCrmData() aggregates by createdAt/mql_date/first_sync_at
  ↓
Maps to KPI metrics: signups, trials, opportunities, orders, revenue, MQL tiers, PQL stages
  ↓
Combined with AdSpend (from Facebook API) + Sessions
  ↓
KpiMetricsRow (16+ computed metrics per date)
```

**Critical Note:** No direct user/AE mapping in CRM data – metrics are company-wide aggregates.

---

## 3. DASHBOARD WITH KPI METRIC TABLE

### Dashboard Page
**File:** `/Users/dominium/Documents/Project/SMIT-OS/src/pages/DashboardOverview.tsx`

### KPI Table Component
**File:** `/Users/dominium/Documents/Project/SMIT-OS/src/components/dashboard/overview/KpiTable.tsx`

### KPI Metric Structure
**Type Definition:** `/Users/dominium/Documents/Project/SMIT-OS/src/types/dashboard-overview.ts`

**KpiMetricsRow fields (48+ metrics):**
```
date, adSpend, sessions, costPerSession, signups, costPerSignup, 
trials, trialRate, costPerTrial, opportunities, opportunityRate, 
costPerOpportunity, orders, orderRate, costPerOrder, revenue, roas,
mql, mqlRate, mqlBronze, mqlBronzeRate, mqlSilver, mqlSilverRate,
mqlGold, mqlGoldRate, prePql, prePqlRate, pql, pqlRate, 
preSql, preSqlRate, sql, sqlRate
```

**Response Structure:**
```typescript
interface KpiMetricsResponse {
  data: KpiMetricsRow[];      // Per-day rows
  totals: KpiMetricsRow;      // Aggregated totals row
}
```

### API Endpoints
- `GET /api/dashboard/overview` – Full dashboard (summary + KPI metrics)
- `GET /api/dashboard/overview/summary` – Summary cards only
- `GET /api/dashboard/overview/kpi-metrics` – KPI table only

**Query Parameters:**
- `from`, `to` – Date range (YYYY-MM-DD)
- `viewMode` – 'realtime' (default) or 'cohort'

### Dashboard Components
1. **SummaryCards** – High-level metrics with trend comparison vs previous period
2. **KpiTable** – Scrollable table with sortable columns
3. **DashboardTab** – Lead Flow & Clearance (secondary section using daily stats)

### Data Flow
```
useOverviewAll() hook
  ↓
/api/dashboard/overview
  ↓
getSummaryMetrics() + getKpiMetrics()
  ↓
CRM client (crmSubscriber, etc.) + Facebook Ads data + session data
  ↓
KpiMetricsResponse
```

**Server Services:**
- `/server/services/dashboard/overview-summary.service.ts`
- `/server/services/dashboard/overview-kpi.service.ts`
- `/server/services/dashboard/overview-ad-spend.ts` (Facebook Ads API)

---

## 4. AE / SALES USER MODEL

### User Table Schema
**File:** `/Users/dominium/Documents/Project/SMIT-OS/prisma/schema.prisma` lines 13-35

```prisma
model User {
  id                String @id @default(uuid())
  fullName          String
  username          String @unique
  password          String
  departments       String[]       // Multiple depts allowed
  role              String         // "Admin", "Leader", "Member"
  scope             String?        // Position (e.g., "AE", "Team Lead")
  avatar            String
  isAdmin           Boolean @default(false)
  totpSecret        String?        // 2FA (encrypted)
  totpEnabled       Boolean @default(false)
  totpBackupCodes   String[]
  
  // Relations: objectives, workItems, reports, etc.
}
```

### AE Identification Logic
**A user is an AE if:**
1. `departments` array includes `'Sale'` (string array)
2. `role` typically in ['Admin', 'Leader', 'Member']
3. Often `scope` = "AE" or similar

### Lead-User Relationship
**In Lead table:**
```
ae: String    // Stores User.fullName (not a foreign key)
```

**Why string storage (not FK):**
- Allows AE name changes without breaking lead history
- Decouples leads from user records (deleted users can still have leads)
- Supports imports from external sources (Excel, CRM)

### AE List Query
**API Endpoint:** `GET /api/leads/ae-list`  
**Implementation:** `/server/routes/lead.routes.ts` lines 37-44

```typescript
const users = await prisma.user.findMany({
  where: { departments: { has: 'Sale' } },
  select: { id: true, fullName: true },
  orderBy: { fullName: 'asc' },
});
```

### Permissions by Role/Dept

| Action | Allowed | Notes |
|--------|---------|-------|
| View Leads | All authenticated | Non-Sale users see all leads (read-only) |
| Create Lead | `isAdmin \|\| departments.includes('Sale')` | Via manual entry or paste |
| Update Lead | `isAdmin \|\| departments.includes('Sale')` | Tracked in audit log |
| Delete Lead (instant) | `isAdmin \|\| (role === 'Leader' && departments.includes('Sale'))` | Admin/Leader Sales only |
| Delete Request (AE) | `departments.includes('Sale')` | Regular AE requests; Leader approves |
| Bulk Edit | `isAdmin \|\| (role === 'Leader' && departments.includes('Sale'))` | Same as create |

---

## UNRESOLVED QUESTIONS & DESIGN GAPS

1. **CRM Subscriber ↔ SMIT-OS AE Mapping?**  
   - CRM schema is external (not in this repo)
   - Are CRM subscribers/leads tied to sales reps in CRM? If so, how?
   - Current KPI metrics aggregated company-wide, not per-AE
   - **Impact:** Dashboard can't show "AE John closed 5 opportunities" – only totals

2. **Lead Reconciliation with CRM?**  
   - Lead table is standalone (Sales manually enters/pastes)
   - Is there ETL/sync from CRM? Or manual-only?
   - What's source-of-truth: SMIT-OS Lead or CRM subscriber record?
   - **Impact:** Risk of duplicate/conflicting data

3. **User ↔ CRM Sales Rep ID Mapping?**  
   - SMIT-OS User.fullName ("John Doe") vs CRM sales_rep_id?
   - Not currently mapped anywhere
   - **Impact:** Can't attribute CRM metrics (opportunities, revenue) to SMIT-OS users

4. **Cost Allocation per AE?**  
   - Ad Spend is aggregate (from Facebook API per day)
   - Revenue is aggregate (from CRM Orders per day)
   - How to calculate "cost per AE" or "revenue per AE"?
   - Requires: (a) AE → opportunity mapping, (b) ad spend allocation method

5. **Lead Status Updates Frequency?**  
   - How often do AEs update status in SMIT-OS vs CRM?
   - Daily? Weekly? Manual only?
   - **Impact:** Lead metrics (resolved time, conversion) reliability

6. **Dashboard per-AE Breakdown?**  
   - KPI metrics are company-wide totals
   - Should dashboard support "Show KPIs for AE = Jane Smith"?
   - Requires: CRM data attributed to AEs + data model change

---

## KEY FILE REFERENCE

| Purpose | Path |
|---------|------|
| Lead Logs page | `src/pages/LeadTracker.tsx` |
| Lead logs table component | `src/components/lead-tracker/lead-logs-tab.tsx` |
| Lead API routes | `server/routes/lead.routes.ts` |
| Lead schema/validation | `server/schemas/lead.schema.ts` |
| Database schema | `prisma/schema.prisma` |
| CRM DB connection | `server/lib/crm-db.ts` |
| Dashboard overview page | `src/pages/DashboardOverview.tsx` |
| KPI table component | `src/components/dashboard/overview/KpiTable.tsx` |
| Dashboard types | `src/types/dashboard-overview.ts` |
| KPI metrics service | `server/services/dashboard/overview-kpi.service.ts` |
| Dashboard API routes | `server/routes/dashboard-overview.routes.ts` |
| CRM extractor (export) | `server/services/sheets-export/extractors/crm.extractor.ts` |
| User/type definitions | `src/types/index.ts` |
| Env config (example) | `.env.example` |

---

## SUMMARY FOR BRAINSTORMING

**Lead Logs exists:** ✓ Fully functional manual entry + bulk paste system  
**CRM connected:** ✓ Read-only via crmPrisma client (PostgreSQL replica)  
**Dashboard KPI built:** ✓ Real-time metrics from CRM + Facebook Ads  
**AE user model:** ✓ Users with Sale department

**Missing piece:** No CRM data attributed to AE at query time. Metrics are company aggregates. To enable "per-AE dashboard," need:
1. CRM schema inspection (find subscriber ↔ sales_rep relation)
2. Add AE filter to KPI queries (pass `ae` param, filter crmSubscriber by sales_rep)
3. Map SMIT-OS User.fullName → CRM sales_rep_id (migration/mapping table)
4. Extend KpiMetricsRow to include `ae` field
5. Update API & frontend to accept AE filter

