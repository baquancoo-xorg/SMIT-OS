# Phase 1: DB Schema + Types

## Overview

Mở rộng `DailyReport` model để hỗ trợ team-specific metrics và task details.

## Priority: High | Status: pending | Effort: 2h

## Key Insights

- Hiện tại `tasksData` là JSON string đơn giản
- Cần JSONB column cho team-specific metrics (flexible schema)
- User.departments[0] sẽ map sang teamType

## Requirements

### Functional
- [ ] Extend DailyReport với `teamType` và `teamMetrics`
- [ ] Tạo TypeScript types cho mỗi team's metrics
- [ ] Migration không breaking existing data

### Non-functional
- [ ] JSONB cho query flexibility
- [ ] Backward compatible với reports cũ

## Architecture

### Team Type Enum
```typescript
type TeamType = 'tech' | 'marketing' | 'media' | 'sale';
```

### Team Metrics Structure
```typescript
// Tech
interface TechMetrics {
  prLink?: string;
  testStatus?: 'local' | 'staging' | 'prod';
  taskType?: 'feature' | 'bug';
  blockedBy?: 'design' | 'qa' | 'devops' | 'external';
}

// Marketing
interface MarketingMetrics {
  spend?: number;
  mqls?: number;
  cpa?: number;
  adsTested?: number;
  channel?: 'fb' | 'google' | 'tiktok';
  campStatus?: 'normal' | 'testing' | 'waiting_media' | 'expensive' | 'banned';
  isKeyCamp?: boolean;
}

// Media
interface MediaMetrics {
  link?: string;
  version?: 'demo' | 'final' | 'published';
  publicationsCount?: number;
  views?: string;
  engagement?: string;
  followers?: number;
  revisionCount?: 'v1' | 'v2' | 'v3+';
  prodStatus?: 'editing' | 'rendering' | 'feedback';
  isHotSLA?: boolean;
}

// Sale
interface SaleMetrics {
  leadsReceived?: number;
  leadsAttempted?: number;
  leadsQualified?: number;
  demosBooked?: number;
  leadsUnqualified?: number;
  oppValue?: number;
  revenue?: number;
  ticketsResolved?: number;
  ticketType?: 'bug' | 'guide' | 'feature';
  followupStatus?: 'following' | 'waiting_customer' | 'waiting_internal';
  isHotDeal?: boolean;
}
```

## Related Code Files

### Modify
- `prisma/schema.prisma` — Add teamType, teamMetrics columns
- `src/types/index.ts` — Add TeamMetrics types

### Create
- `src/types/daily-report-metrics.ts` — Team-specific metric interfaces

## Implementation Steps

1. **Update Prisma Schema**
   ```prisma
   model DailyReport {
     // ... existing fields
     teamType    String?   // tech | marketing | media | sale
     teamMetrics Json?     // JSONB for team-specific data
   }
   ```

2. **Create TypeScript Types**
   - Define interfaces for each team's metrics
   - Union type `TeamMetrics = TechMetrics | MarketingMetrics | ...`

3. **Run Migration**
   ```bash
   npx prisma migrate dev --name add_team_metrics
   ```

4. **Update DailyReport Type**
   - Add teamType and teamMetrics to existing type

## Todo List

- [ ] Update prisma/schema.prisma
- [ ] Create src/types/daily-report-metrics.ts
- [ ] Update src/types/index.ts
- [ ] Run prisma migrate
- [ ] Test with existing data (backward compat)

## Success Criteria

- [ ] Migration runs without errors
- [ ] Existing reports still queryable
- [ ] New fields accept team-specific data
- [ ] TypeScript types provide autocomplete

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration fails | High | Backup DB before migrate |
| Type conflicts | Low | Use optional fields |

## Security Considerations

- teamMetrics is user-submitted → validate structure server-side
- Don't expose raw JSONB in API responses without sanitization
