# Phase 3: Action Panels

## Overview

Update Tier 3 panels:
- Left: Keep Needs PM Attention (minor style fixes)
- Right: Replace Critical OKR Path → Critical Deadlines

## Left Panel: Needs PM Attention

### Current State
- Works correctly
- Style is consistent

### Changes Required
- Minor: Ensure card styling matches other panels
- Keep existing functionality

```tsx
// Keep existing logic
const urgentItems = workItems
  .filter(item => item.priority === 'Urgent' && item.status !== 'Done')
  .slice(0, 5)
  .map(item => {
    const assignee = users.find(u => u.id === item.assigneeId);
    return {
      ...item,
      assigneeName: assignee?.fullName || 'Unassigned'
    };
  });
```

## Right Panel: Critical Deadlines (REPLACE)

### Current State
Shows Critical OKR Path (OKRs with progress < 30%)

### Target State
Combined view:
1. Sprint deadline countdown
2. OKRs at risk

### Implementation

```tsx
{/* Right - Critical Deadlines */}
<div className="bg-white rounded-2xl md:rounded-3xl lg:rounded-[40px] border border-outline-variant/10 shadow-sm p-5 md:p-6 lg:p-8">
  <h3 className="text-base md:text-lg font-black font-headline text-on-surface mb-6">
    Critical Deadlines
  </h3>
  
  <div className="space-y-6">
    {/* Sprint Deadline */}
    {currentSprint ? (
      <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Current Sprint
            </p>
            <h4 className="text-lg font-bold text-on-surface mt-1">
              {currentSprint.name}
            </h4>
          </div>
          <span className={`px-3 py-1 text-sm font-bold rounded-full ${
            daysLeft && daysLeft <= 3 
              ? 'bg-red-100 text-red-600' 
              : daysLeft && daysLeft <= 7 
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-primary/10 text-primary'
          }`}>
            {daysLeft} days left
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-1000"
            style={{ width: `${sprintProgress}%` }}
          />
        </div>
      </div>
    ) : (
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-400">
        No active sprint
      </div>
    )}
    
    {/* OKRs at Risk */}
    <div>
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
        OKRs at Risk
      </h4>
      
      {criticalObjectives.length > 0 ? (
        <div className="space-y-3 max-h-[200px] overflow-y-auto">
          {criticalObjectives.map(obj => (
            <div 
              key={obj.id}
              className={`p-3 rounded-xl border ${
                obj.progressPercentage < 15 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">
                    {obj.title}
                  </p>
                  <span className="text-xs text-slate-400">
                    {obj.department}
                  </span>
                </div>
                <span className={`ml-2 px-2 py-1 text-xs font-black rounded-full ${
                  obj.progressPercentage < 15 
                    ? 'bg-red-200 text-red-700' 
                    : 'bg-yellow-200 text-yellow-700'
                }`}>
                  {obj.progressPercentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <div className="text-center">
            <CheckCircle2 size={32} className="mx-auto mb-2 text-tertiary" />
            <p className="font-bold text-on-surface text-sm">All on track!</p>
          </div>
        </div>
      )}
    </div>
  </div>
</div>
```

### Data

```tsx
// Critical objectives (progress < 30%)
const criticalObjectives = objectives
  .filter(obj => obj.progressPercentage < 30)
  .sort((a, b) => a.progressPercentage - b.progressPercentage)
  .slice(0, 5);
```

## Tasks

- [ ] Add currentSprint and sprintProgress variables (reuse from Phase 1)
- [ ] Create Critical Deadlines panel
- [ ] Add sprint countdown with color coding
- [ ] Add OKRs at risk list
- [ ] Remove old Critical OKR Path component
- [ ] Test empty states
