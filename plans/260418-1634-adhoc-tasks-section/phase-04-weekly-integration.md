# Phase 4: Weekly Check-in Integration

**Status:** pending | **Effort:** 1h | **Priority:** high

## Overview

Thêm section công việc phát sinh vào Weekly Check-in modal, đặt giữa KR Progress và "Cam kết tuần tới".

## Context

**File:** `src/components/modals/WeeklyCheckinModal.tsx`

**Current sections order:**
1. Confidence Score
2. KR Progress (Section 1)
3. Next Week Plans (Section 2)
4. Blockers (Section 3)

**Target order:**
1. Confidence Score
2. KR Progress (Section 1)
3. **Ad-hoc Tasks (NEW)**
4. Next Week Plans (Section 2)
5. Blockers (Section 3)

## Requirements

- Reuse AdHocTasksSection component
- Primary color (không team-specific)
- Include trong submit payload
- Tổng giờ hiển thị trong header badge

## Implementation Steps

### 4.1 Add State

```typescript
const [adHocTasks, setAdHocTasks] = useState<AdHocTask[]>([]);
```

### 4.2 Add Section JSX

**After KR Progress section, before Next Week Plan:**

```tsx
{/* Section: Ad-hoc Tasks */}
<section className="space-y-4">
  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
    <Briefcase className="text-primary" size={20} />
    <h3 className="text-lg font-black font-headline text-slate-800 uppercase tracking-tight">
      Công việc phát sinh
    </h3>
    {adHocTasks.length > 0 && (
      <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
        {adHocTasks.reduce((sum, t) => sum + t.hoursSpent, 0)}h
      </span>
    )}
  </div>
  
  <AdHocTasksSection
    tasks={adHocTasks}
    onTasksChange={setAdHocTasks}
    teamColor="primary"
  />
</section>
```

### 4.3 Update Submit Payload

```typescript
const payload = {
  // ... existing fields
  adHocTasks: adHocTasks.length > 0 ? JSON.stringify(adHocTasks) : null,
};
```

### 4.4 Import Component

```typescript
import AdHocTasksSection from '../daily-report/components/AdHocTasksSection';
import { AdHocTask } from '../../types/daily-report-metrics';
```

## Todo

- [ ] Import AdHocTasksSection component
- [ ] Add adHocTasks state
- [ ] Add section JSX between KR Progress và Next Week Plans
- [ ] Include trong handleSubmit payload

## Success Criteria

- [ ] Section hiển thị đúng vị trí
- [ ] Badge tổng giờ hiển thị
- [ ] Data submit cùng weekly report
