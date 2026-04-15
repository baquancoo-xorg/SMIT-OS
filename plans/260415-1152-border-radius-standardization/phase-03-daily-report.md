# Phase 3: Daily Report Components

## Overview
- **Priority:** Medium
- **Status:** pending
- **Effort:** 1h

Update daily report components. Note: Plan `260415-1039-daily-report-team-forms` sẽ tạo thêm components mới → follow standards này.

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/daily-report/DailyReportBase.tsx` | Container + buttons |
| `src/components/daily-report/PMDashboard.tsx` | Cards + buttons |
| `src/components/daily-report/TechDailyForm.tsx` | Inputs + buttons |
| `src/components/daily-report/SaleDailyForm.tsx` | Inputs + buttons |
| `src/components/daily-report/MarketingDailyForm.tsx` | Inputs + buttons |
| `src/components/daily-report/MediaDailyForm.tsx` | Inputs + buttons |
| `src/components/daily-report/components/TaskStatusCard.tsx` | Card container |
| `src/components/daily-report/components/BlockerCard.tsx` | Card container |
| `src/components/daily-report/components/TodayPlanCard.tsx` | Card container |

## Implementation Steps

### 3.1 DailyReportBase.tsx

- Main container → `rounded-3xl`
- Section cards → `rounded-3xl`
- Submit button → `rounded-full`
- Status badges → `rounded-full`

### 3.2 Form Components (Tech/Sale/Marketing/Media)

Each form:
- Form container → `rounded-3xl`
- Input fields → `rounded-3xl` (uses Input.tsx)
- Dropdowns → `rounded-3xl` (uses CustomSelect.tsx)
- Action buttons → `rounded-full`

### 3.3 Card Components

**TaskStatusCard.tsx:**
- Card → `rounded-3xl`
- Status pills → `rounded-full`

**BlockerCard.tsx:**
- Card → `rounded-3xl`
- Priority badges → `rounded-full`

**TodayPlanCard.tsx:**
- Card → `rounded-3xl`
- Checkboxes → keep default
- Tags → `rounded-full`

## Todo

- [ ] Update DailyReportBase.tsx
- [ ] Update PMDashboard.tsx
- [ ] Update TechDailyForm.tsx
- [ ] Update SaleDailyForm.tsx
- [ ] Update MarketingDailyForm.tsx
- [ ] Update MediaDailyForm.tsx
- [ ] Update TaskStatusCard.tsx
- [ ] Update BlockerCard.tsx
- [ ] Update TodayPlanCard.tsx

## Success Criteria

- All daily report components follow standards
- Forms use consistent input styling
- Cards have uniform appearance
