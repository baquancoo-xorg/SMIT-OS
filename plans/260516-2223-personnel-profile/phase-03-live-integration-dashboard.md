# Phase 3 — Live Integration + Dashboard

## Context

- Parent: [plan.md](plan.md)
- Predecessors: [phase-01-core-profile.md](phase-01-core-profile.md), [phase-02-personality-innate.md](phase-02-personality-innate.md)
- Spec: docs/personnel-profile-feature.md §6.3-§6.4, §7
- Brainstorm §4.7

## Overview

- **Date:** 2026-05-16
- **Priority:** P2
- **Effort:** 2w
- **Description:** LRU cache + MCP Jira resolver + Zone C/D live data + auto-flag rules + dashboard Personnel tab + PM notes + cleanup cron
- **Status:** pending
- **Review:** unreviewed

## Key Insights

- LRU cache singleton tránh global namespace pollution — module-level export
- MCP Jira call từ backend server qua MCP client (existing pattern, không expose ra FE)
- `User.jiraAccountId` đã add Phase 1 (single migration) — Phase 3 chỉ fill data qua resolver script
- 5 auto-flag rules cần data từ 3 nguồn: SkillAssessment (Phase 1), Jira (Phase 3), SMIT-OS internal (DailyReport+KR)
- Dashboard Personnel tab = mini-version của Profile page, focus team overview
- PM notes là free-text quarterly cho admin coaching record
- Cleanup cron weekly trivial — runs at 03:17 Sunday

## Requirements

### Functional
- Zone C: Jira task summary (total/done/in-progress/overdue) + recent 5 tasks + manual refresh
- Zone D: chuyên cần month heatmap + KPI trend (per position) + KR progress + PM flags
- Auto-flag computes on profile load + dashboard render
- Status badge real logic: 0 flag = On Track, 1-2 = Needs Attention, ≥3 = At Risk
- Dashboard `/dashboard?tab=personnel` (hoặc tab in existing dashboard) — team grid 5-10 mini cards
- Click drill-down → slide-in panel với timeline + skill delta + condensed Zone C/D + PM notes
- PM notes CRUD per personnel per quarter (admin only)
- Cleanup cron hard-delete record với `deletedAt < now-2y`

### Non-functional
- Cache hit profile load <200ms
- Cache miss <3s (Jira + MCP combined)
- Manual refresh invalidates cache cho personnel đó
- File <200 LOC

## Architecture

### Cache layer
```ts
// server/lib/external-cache.ts
import { LRUCache } from 'lru-cache';
export const externalCache = new LRUCache<string, unknown>({
  max: 500,
  ttl: 5 * 60 * 1000,    // 5 min
});
// keys: jira:userId, smitos:userId:period
```

### Jira resolver
```ts
// server/lib/jira-resolver.ts
// One-shot: foreach User without jiraAccountId, MCP lookup by email, update DB.
// Run-once script + admin button "Resolve Jira mappings".
```

### Auto-flag rules
```ts
// server/lib/personnel-flag-calculator.ts
// Returns: { flags: string[], status: 'on_track' | 'needs_attention' | 'at_risk' }
// Rules:
// 1. Any skill score Δ ≤ -1 vs prev quarter
// 2. Jira overdue count >= 3
// 3. Daily report submission < 80% current month
// 4. Any KR < 50% with <= 2 weeks left in quarter
// 5. Quarterly assessment overdue > 2 weeks into new quarter
// status: 0 flag → on_track, 1-2 → needs_attention, ≥3 → at_risk
```

### API Routes
```
GET    /api/personnel/:id/jira-tasks            cached, ?refresh=1 to bust
GET    /api/personnel/:id/smitos-metrics?period= cached
POST   /api/personnel/admin/resolve-jira         admin-only batch resolver
GET    /api/personnel/:id/flags                  computed live (no cache)
GET    /api/personnel/:id/pm-notes
POST   /api/personnel/:id/pm-notes
PUT    /api/personnel/pm-notes/:noteId
DELETE /api/personnel/pm-notes/:noteId
```

### Data Model
```prisma
model PmNote {
  id          String   @id @default(cuid())
  personnelId String
  personnel   Personnel @relation(fields: [personnelId], references: [id], onDelete: Cascade)
  quarter     String
  authorId    String
  content     String   @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([personnelId, quarter])
}
```

(`PmNote` đã ở Phase 1 schema để giảm migration count. Phase 3 chỉ implement routes + UI.)

## Related Code Files

### Create
- `server/lib/external-cache.ts` (LRU singleton)
- `server/lib/jira-resolver.ts`
- `server/lib/jira-mcp-client.ts` (wrap MCP searchJiraIssuesUsingJql)
- `server/lib/smitos-metrics-aggregator.ts` (DailyReport+KR aggregate per position)
- `server/lib/personnel-flag-calculator.ts`
- `server/routes/personnel/jira-integration.routes.ts`
- `server/routes/personnel/smitos-integration.routes.ts`
- `server/routes/personnel/pm-notes.routes.ts`
- `server/routes/personnel/flags.routes.ts`
- `server/cron/personnel-cleanup.cron.ts`
- `src/components/features/personnel/zones/jira-zone.tsx`
- `src/components/features/personnel/zones/smitos-zone.tsx`
- `src/components/features/personnel/personnel-drilldown-panel.tsx`
- `src/components/features/personnel/pm-notes-editor.tsx`
- `src/pages/v6/personnel/personnel-dashboard-tab.tsx`
- `src/hooks/use-jira-tasks.ts`
- `src/hooks/use-smitos-metrics.ts`
- `src/hooks/use-personnel-flags.ts`
- `src/hooks/use-pm-notes.ts`
- `src/lib/personnel/kpi-config-by-position.ts` (Marketing/Account/Media KPI definitions)
- `src/lib/personnel/attendance-heatmap-builder.ts`

### Modify
- `package.json` — `npm i lru-cache`
- `server/index.ts` — mount new routes + register cron
- `src/components/features/personnel/status-badge.tsx` — replace stub với real flag data
- `src/components/features/personnel/personnel-profile-drawer.tsx` — enable Zone C/D tabs
- `src/components/features/personnel/personnel-card.tsx` — wire real flag data + jira open count
- `src/App.tsx` (or dashboard router) — add Personnel tab/route

## Implementation Steps

1. **Install** `npm i lru-cache`
2. **Cache singleton** in `external-cache.ts`, export `get/set/invalidate(prefix)` helpers
3. **MCP Jira client wrapper**: hide MCP tool details, expose `searchUserTasks(accountId, opts)`
4. **Jira resolver**: list users without `jiraAccountId`, foreach → MCP lookup by email → update; expose admin button
5. **Jira route**: `GET /:id/jira-tasks` — read User.jiraAccountId → cache check → MCP call if miss → store. Support `?refresh=1`
6. **SMIT-OS aggregator**: query DailyReport (count submitted vs business days month), KR (current quarter progress), revenue/calls/leads per position
7. **SMIT-OS route**: cache pattern same as Jira
8. **Flag calculator**: pure function, takes (personnel, skill history, jira data, smitos data) → return flags + status
9. **Flag route**: live compute, no cache (data already cached upstream)
10. **PM notes routes**: admin-only POST/PUT/DELETE; GET available to admin + self
11. **Frontend hooks**: TanStack Query with 5min staleTime để align với BE cache
12. **Zone C UI**: header summary (total/done/overdue) + completion bar + recent 5 list + Refresh button (invalidate query)
13. **Zone D UI**: attendance heatmap (calendar grid), KPI cards (3 per position), KR progress bars, PM flags list
14. **KPI per position config**: Marketing (leads, ad spend, campaigns), Account (revenue, deals, calls), Media (deliverables, revision rate, on-time rate)
15. **Drill-down panel**: timeline line chart (avg score Q×3 groups) + skill delta table + condensed Zone C/D + PM notes editor
16. **Dashboard tab**: mini grid replicating list view nhưng denser, click → drill-down panel
17. **Status badge real**: wire `use-personnel-flags`, color-code, show flag count tooltip
18. **PM notes editor**: textarea + save per quarter, show history list
19. **Cleanup cron**: register at server start, runs `0 17 3 * * 0` (Sunday 03:17), hard-delete `WHERE deletedAt < now - interval '2 years'` across SkillAssessment + PersonalityResult

## Todo

- [ ] `npm i lru-cache`
- [ ] Implement `server/lib/external-cache.ts`
- [ ] Implement `server/lib/jira-mcp-client.ts`
- [ ] Implement `server/lib/jira-resolver.ts`
- [ ] Implement `server/lib/smitos-metrics-aggregator.ts`
- [ ] Implement `server/lib/personnel-flag-calculator.ts`
- [ ] Implement `server/routes/personnel/jira-integration.routes.ts`
- [ ] Implement `server/routes/personnel/smitos-integration.routes.ts`
- [ ] Implement `server/routes/personnel/flags.routes.ts`
- [ ] Implement `server/routes/personnel/pm-notes.routes.ts`
- [ ] Mount new routes
- [ ] Implement `server/cron/personnel-cleanup.cron.ts` + register
- [ ] Implement `src/hooks/use-jira-tasks.ts`
- [ ] Implement `src/hooks/use-smitos-metrics.ts`
- [ ] Implement `src/hooks/use-personnel-flags.ts`
- [ ] Implement `src/hooks/use-pm-notes.ts`
- [ ] Implement `src/lib/personnel/kpi-config-by-position.ts`
- [ ] Implement `src/lib/personnel/attendance-heatmap-builder.ts`
- [ ] Implement `src/components/features/personnel/zones/jira-zone.tsx`
- [ ] Implement `src/components/features/personnel/zones/smitos-zone.tsx`
- [ ] Implement `src/components/features/personnel/pm-notes-editor.tsx`
- [ ] Implement `src/components/features/personnel/personnel-drilldown-panel.tsx`
- [ ] Implement `src/pages/v6/personnel/personnel-dashboard-tab.tsx`
- [ ] Update `status-badge.tsx` real data
- [ ] Update `personnel-card.tsx` wire flags + jira count
- [ ] Update `personnel-profile-drawer.tsx` enable Zone C/D
- [ ] Add dashboard tab routing
- [ ] Run Jira resolver once cho all existing User có email
- [ ] `typecheck && lint && build` clean
- [ ] Manual smoke: load profile (cache miss → hit), refresh button, dashboard drill-down, add PM note

## Success Criteria

- Profile load cache hit <200ms, miss <3s
- Refresh button bust cache đúng key
- 5 auto-flag rules trigger đúng status (test với fixture data)
- Dashboard tab render 5 personnel cards <1s
- PM notes save + reload đúng quarter
- Cleanup cron logged success weekly
- Jira resolver fill `jiraAccountId` cho users có email khớp Atlassian
- Zone D KPI hiển thị đúng metric theo `Personnel.position`
- Build bundle FE không chứa `lunar-javascript` (verify analyzer)

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| MCP Atlassian rate limit | Cache 5min đủ + manual refresh không tự ý fire |
| Jira email không khớp SMIT-OS email | Admin UI cho phép manual override `jiraAccountId` |
| MCP call hang | Timeout 10s, fallback Zone C "Không kết nối được Jira" |
| Cron không trigger | Log at startup + healthcheck endpoint |
| `lunar-javascript` leak vào FE bundle | Vite `build.rollupOptions.external` + analyzer check |
| Cache poisoning với key collision | Strict key format `service:userId:hash(params)` |

## Security Considerations

- Admin-only batch resolver endpoint
- PM notes write admin-only; read admin + self
- Cache key không bao gồm raw token/email — chỉ userId
- Cron job không chạy nếu DB không reachable
- Hard-delete cron log đầy đủ row count để audit

## Next Steps

→ Phase 4 (out of current scope): skill gap heatmap, cross-team comparison, AI focus recommendation, PDF export 1-on-1
