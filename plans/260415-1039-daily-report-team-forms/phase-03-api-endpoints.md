# Phase 3: API Endpoints

## Overview

Mở rộng API để handle team-specific daily report submission và retrieval.

## Priority: High | Status: pending | Effort: 2h

## Key Insights

- Existing route: `/api/daily-reports`
- Need to save teamType and teamMetrics
- Add endpoint for PM dashboard aggregation

## Requirements

### Functional
- [ ] POST accepts teamType + teamMetrics
- [ ] GET returns full report with parsed metrics
- [ ] Aggregate endpoint for dashboard stats

### Non-functional
- [ ] Validate teamMetrics structure server-side
- [ ] Efficient queries for dashboard

## Architecture

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/daily-reports` | Create with team data |
| GET | `/api/daily-reports` | List (existing + enhanced) |
| GET | `/api/daily-reports/:id` | Single report detail |
| GET | `/api/daily-reports/stats` | Dashboard aggregate |

### Request/Response

**POST /api/daily-reports**
```typescript
// Request
{
  userId: string;
  reportDate: string;
  teamType: 'tech' | 'marketing' | 'media' | 'sale';
  tasksData: {
    yesterdayTasks: TaskEntry[];
    blockers: BlockerEntry[];
    todayPlans: PlanEntry[];
  };
  teamMetrics: TechMetrics | MarketingMetrics | MediaMetrics | SaleMetrics;
}

// Response
{ id: string; status: 'created' }
```

**GET /api/daily-reports/stats**
```typescript
// Query params: ?startDate=&endDate=&teamType=
// Response
{
  byTeam: {
    tech: { total: number; approved: number; blockers: number; },
    marketing: { total: number; leads: number; spend: number; },
    media: { total: number; publications: number; },
    sale: { total: number; revenue: number; demosBooked: number; }
  },
  overall: {
    totalReports: number;
    approvalRate: number;
    avgBlockers: number;
  }
}
```

## Related Code Files

### Modify
- `src/server/routes/daily-reports.ts` — Extend existing routes

### Create
- `src/server/validators/daily-report-metrics.ts` — Validation schemas

## Implementation Steps

1. **Update POST endpoint**
   - Accept teamType in body
   - Accept teamMetrics JSONB
   - Validate metrics structure based on teamType

2. **Update GET endpoint**
   - Include teamType and teamMetrics in response
   - Filter by teamType param optional

3. **Create Stats endpoint**
   - Aggregate by team
   - Date range filtering
   - Sum/count relevant metrics

4. **Add Validation**
   - Zod schemas for each team's metrics
   - Server-side validation before DB save

## Todo List

- [ ] Update POST /api/daily-reports
- [ ] Update GET /api/daily-reports
- [ ] Create GET /api/daily-reports/stats
- [ ] Create validation schemas
- [ ] Test with Postman/curl

## Success Criteria

- [ ] Team reports save correctly
- [ ] Metrics queryable in stats endpoint
- [ ] Invalid metrics rejected with 400
- [ ] Backward compat with old reports

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Invalid JSON in teamMetrics | Medium | Zod validation |
| Stats query slow | Low | Index on teamType, reportDate |

## Security Considerations

- Validate teamType against allowed values
- Sanitize teamMetrics before storing
- Check user permission for stats endpoint (PM/Admin only)
