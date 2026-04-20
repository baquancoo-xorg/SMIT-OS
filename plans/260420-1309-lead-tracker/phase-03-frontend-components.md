# Phase 03 - Frontend Components

## Overview
- **Priority:** High
- **Status:** pending
- **Depends on:** Phase 02

## Related Files
- Create: `src/components/lead-tracker/lead-form-modal.tsx`
- Create: `src/components/lead-tracker/lead-logs-tab.tsx`
- Create: `src/components/lead-tracker/daily-stats-tab.tsx`
- Create: `src/components/lead-tracker/dashboard-tab.tsx`
- Modify: `src/types/index.ts`
- Modify: `src/lib/api.ts`

## Key Insights

- Use `api` from `src/lib/api.ts` (already has auth + error handling)
- Use `useAuth()` to check if user is a Sales AE: `user.departments.includes('Sale')`
- TailwindCSS pattern: `bg-white rounded-2xl shadow-sm` for card containers
- Reuse UI components: `src/components/ui/CustomSelect.tsx`, `src/components/ui/CustomFilter.tsx`
- Check `package.json` for recharts before using it; if not found check `src/components/dashboard/overview/` for charting pattern
- Modal pattern: follow `src/components/board/TaskModal.tsx`

## Implementation Steps

### 1. Add types to `src/types/index.ts`

```typescript
export interface Lead {
  id: string;
  customerName: string;
  ae: string;
  receivedDate: string;
  resolvedDate?: string | null;
  status: string; // 'Dang lien he' | 'Dang nuoi duong' | 'Qualified' | 'Unqualified'
  leadType?: string | null; // 'Viet Nam' | 'Quoc Te'
  unqualifiedType?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadDailyStat {
  date: string;        // YYYY-MM-DD
  ae: string;
  added: number;       // Them moi
  processed: number;   // Xu ly
  remaining: number;   // Ton cuoi ngay
  dailyRate: number | null;  // processed / added
  totalRate: number | null;  // processed / (added + prev_remaining)
}
```

### 2. Add lead API methods to `src/lib/api.ts`

DO NOT create a new file. Add to existing `ApiClient` class:

```typescript
getLeads(params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  return this.get<Lead[]>(`/leads${qs}`);
}
createLead(data: unknown) { return this.post<Lead>('/leads', data); }
updateLead(id: string, data: unknown) { return this.put<Lead>(`/leads/${id}`, data); }
deleteLead(id: string) { return this.delete(`/leads/${id}`); }
getLeadDailyStats(params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  return this.get<LeadDailyStat[]>(`/leads/daily-stats${qs}`);
}
getLeadAeList() { return this.get<{ id: string; fullName: string }[]>('/leads/ae-list'); }
```

### 3. Create `src/components/lead-tracker/lead-form-modal.tsx`

Modal for add/edit lead:
- Fields: customerName, ae (select from ae-list), receivedDate, resolvedDate (optional),
  status (select), leadType (select), unqualifiedType (show only when status=Unqualified), notes
- Required: customerName, ae, receivedDate, status
- On submit: call `api.createLead()` or `api.updateLead(id)`, then call `onSave()` callback

### 4. Create `src/components/lead-tracker/lead-logs-tab.tsx`

- Table of leads from `GET /api/leads`
- Filters: by AE, by status, by date range
- Each row: Edit button (opens modal) + Delete button (confirm before delete)
- Add Lead button (only visible if `user.departments.includes('Sale')`)
- Status badge colors:
  - Qualified = green (`bg-emerald-50 text-emerald-600`)
  - Unqualified = red (`bg-red-50 text-red-600`)
  - Dang lien he = blue (`bg-blue-50 text-blue-600`)
  - Dang nuoi duong = yellow (`bg-amber-50 text-amber-600`)

### 5. Create `src/components/lead-tracker/daily-stats-tab.tsx`

Table replicating Excel "Daily" sheet layout:
- Header row 1: Date | [AE1] (colspan 5) | [AE2] (colspan 5) | ...
- Header row 2: Per AE: Them | Xu ly | Ton cuoi ngay | Ty le trong ngay | Ty le tren tong
- Date range filter (default: current month)
- Data from `GET /api/leads/daily-stats`
- Format rates as percentage (e.g., `75%`), show `-` when denominator is 0

### 6. Create `src/components/lead-tracker/dashboard-tab.tsx`

- KPI summary cards: total Qualified, total Unqualified, total pending (remaining)
- Bar chart: added vs processed by week, grouped by AE
- Line chart: remaining (ton cuoi ngay) trend over time
- Check `package.json` for recharts first; if missing, check existing chart pattern

## Todo

- [ ] Add `Lead` and `LeadDailyStat` interfaces to `src/types/index.ts`
- [ ] Add lead API methods to `src/lib/api.ts`
- [ ] Create `src/components/lead-tracker/lead-form-modal.tsx`
- [ ] Create `src/components/lead-tracker/lead-logs-tab.tsx`
- [ ] Create `src/components/lead-tracker/daily-stats-tab.tsx`
- [ ] Create `src/components/lead-tracker/dashboard-tab.tsx`
- [ ] Verify recharts is in `package.json` before using

## Success Criteria

- Lead form add/edit works correctly
- Lead Logs table displays data from DB
- Daily Stats table matches Excel carry-forward logic
- Charts render correctly
- No TypeScript compile errors
