# Phase 4: Integration + Auto-detect

## Overview

Integrate form components vào DailySync page với auto-detect team từ user login.

## Priority: Medium | Status: pending | Effort: 1.5h

## Key Insights

- User.departments[0] chứa department name
- Map department → teamType
- Refactor DailySync.tsx để render form động

## Requirements

### Functional
- [ ] Auto-detect team từ user.departments
- [ ] Render form tương ứng
- [ ] Fallback cho unknown department

### Non-functional
- [ ] No manual team selection (auto-detect)
- [ ] Smooth transition khi form load

## Architecture

### Department → Team Mapping

```typescript
const DEPARTMENT_TEAM_MAP: Record<string, TeamType> = {
  'Tech': 'tech',
  'Tech & Product': 'tech',
  'Product': 'tech',
  'Marketing': 'marketing',
  'MKT': 'marketing',
  'Media': 'media',
  'Content': 'media',
  'Sale': 'sale',
  'Sales': 'sale',
  'CS': 'sale', // Customer Success
};

function detectTeam(departments: string[]): TeamType {
  for (const dept of departments) {
    const mapped = DEPARTMENT_TEAM_MAP[dept];
    if (mapped) return mapped;
  }
  return 'tech'; // default fallback
}
```

### Integration Flow

```
DailySync.tsx
├── Detect team from currentUser
├── Render stats (unchanged)
├── Render reports table (unchanged)
└── Modal: TeamFormSelector
    ├── teamType === 'tech' → TechDailyForm
    ├── teamType === 'marketing' → MarketingDailyForm
    ├── teamType === 'media' → MediaDailyForm
    └── teamType === 'sale' → SaleDailyForm
```

## Related Code Files

### Modify
- `src/pages/DailySync.tsx` — Use TeamFormSelector

### Create
- `src/utils/team-detection.ts` — detectTeam utility

## Implementation Steps

1. **Create team-detection utility**
   - Department → team mapping
   - Export detectTeam function

2. **Refactor DailySync.tsx**
   - Import TeamFormSelector
   - Replace DailyReportModal with TeamFormSelector
   - Pass detected team to selector

3. **Update form submission**
   - Include teamType in API call
   - Include teamMetrics based on form state

4. **Test with different users**
   - Tech department → Tech form
   - Marketing → Marketing form
   - etc.

## Todo List

- [ ] Create src/utils/team-detection.ts
- [ ] Refactor DailySync.tsx to use TeamFormSelector
- [ ] Update API call to include team data
- [ ] Test with each department user

## Success Criteria

- [ ] Correct form renders for each team
- [ ] No manual selection needed
- [ ] Reports save with correct teamType
- [ ] Unknown departments get fallback

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Department names vary | Medium | Comprehensive mapping |
| Multi-department users | Low | Use first department |

## Next Steps

After Phase 4 → Phase 5 (PM Dashboard) to visualize aggregate data
