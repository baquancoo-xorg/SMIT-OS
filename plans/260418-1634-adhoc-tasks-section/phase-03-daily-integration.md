# Phase 3: Daily Report Integration

**Status:** pending | **Effort:** 1h | **Priority:** high

## Overview

Tích hợp `AdHocTasksSection` vào Daily Report forms (4 team variants).

## Context

**Files to modify:**
- `src/components/daily-report/DailyReportBase.tsx` - add new section prop
- `src/components/daily-report/TechDailyForm.tsx`
- `src/components/daily-report/MarketingDailyForm.tsx`
- `src/components/daily-report/MediaDailyForm.tsx`
- `src/components/daily-report/SaleDailyForm.tsx`

## Requirements

- Section hiển thị cuối Section 1 (sau review hôm qua)
- Include ad-hoc tasks trong submit payload
- Team color phù hợp với từng form

## Implementation Steps

### 3.1 Update DailyReportBase Props

**File:** `src/components/daily-report/DailyReportBase.tsx`

```typescript
interface DailyReportBaseProps {
  // ... existing props
  adHocSection?: React.ReactNode; // NEW
}
```

### 3.2 Add Section to Layout

```tsx
{/* Section 1: Yesterday */}
<div>
  <h2>1. Review công việc hôm qua</h2>
  {yesterdaySection}
  
  {/* Ad-hoc tasks - cuối section 1 */}
  {adHocSection && (
    <div className="mt-6">
      {adHocSection}
    </div>
  )}
</div>
```

### 3.3 Update Team Forms

**Pattern cho mỗi form:**

```typescript
// Add state
const [adHocTasks, setAdHocTasks] = useState<AdHocTask[]>([]);

// Add to handleSubmit payload
body: JSON.stringify({
  // ... existing fields
  adHocTasks: adHocTasks.length > 0 ? JSON.stringify(adHocTasks) : null,
  teamMetrics: {
    // ... existing
    adHocTasks, // include in teamMetrics too
  },
}),

// Render section
const renderAdHocSection = () => (
  <AdHocTasksSection
    tasks={adHocTasks}
    onTasksChange={setAdHocTasks}
    teamColor="indigo" // tech=indigo, marketing=rose, media=amber, sale=emerald
  />
);

// Pass to base
<DailyReportBase
  // ... existing props
  adHocSection={renderAdHocSection()}
/>
```

### 3.4 Team Colors

| Team | Color |
|------|-------|
| Tech | indigo |
| Marketing | rose |
| Media | amber |
| Sale | emerald |

## Todo

- [ ] Update DailyReportBase to accept adHocSection
- [ ] Add state + render in TechDailyForm
- [ ] Add state + render in MarketingDailyForm
- [ ] Add state + render in MediaDailyForm
- [ ] Add state + render in SaleDailyForm
- [ ] Include in submit payload

## Success Criteria

- [ ] Section hiển thị đúng vị trí
- [ ] Data submit cùng report
- [ ] Team colors match
