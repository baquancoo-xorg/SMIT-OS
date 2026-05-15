# Phase 02 — Stage 2: Page Migration

## Context Links

- ADR: `docs/v6/ADR-001-design-system.md` section 9 (Migration Strategy — Strangler Fig)
- Phase 01 outputs: full `src/ui/components/` library (~63 components incl. screenshot-audit additions)
- Screenshot audit 2026-05-15: 8 reference screenshots specify page composite requirements
- v5 reality: 125 import sites pointing vào `src/components/v5/`

## Overview

- **Priority:** P0 (blocked by Phase 01)
- **Status:** blocked-by-01
- **Description:** Migrate 8 routes lần lượt từ v5 sang v6. Mỗi route: tạo page mới trong `src/pages/v6/<route>/`, swap import từ `v5/` sang `ui/`, smoke test, drop v5 import cho route đó.

## Key Insights

- **Strangler fig** = không big-bang switch. Route-by-route, mỗi route có rollback safety qua git revert.
- 125 import sites = surface area lớn. Codemod approach (jscodeshift hoặc AI batch) thay vì hand-migrate.
- Business logic (hooks, contexts, lib/api) **không thay đổi** — chỉ swap UI imports. Page component giữ tên + data flow, đổi internal layout.
- Smoke test required cho mỗi route trước khi drop v5 import (regression risk cao nhất ở đây).
- Performance baseline trước migration để compare sau (Lighthouse, bundle size).

## Requirements

### Functional — 8 routes ưu tiên

| Order | Route | Complexity | v5 import count (estimate) | Why this order |
|---|---|---|---|---|
| 1 | `/dashboard` | High | ~25 | Main entry — 4 tabs (Overview, Acquisition, Call, Distribution) per screenshot audit. Validate KpiCard + chart system + HeatmapChart + FunnelChart |
| 2 | `/okrs` | Medium | ~15 | 3-level OKR cards (L1 Company → L2 Team → L3 Member) accordion. Validate ObjectiveCard + KeyResultRow composites |
| 3 | `/leads` | High | ~20 | DataTable stress test (multi-select, sort, filter, search, pagination). Lead-flow hook critical. LeadTableRow composite |
| 4 | `/ads` | High | ~18 | Reuse same table pattern as Leads (Image #6 implies Ads = same DataTable structure cho campaigns) |
| 5 | `/media` | Medium | ~12 | Reuse table pattern. Recent auto-pull rewrite (commit ceed892) — keep stable |
| 6 | `/daily-sync` | Medium | ~15 | Stat cards + DataTable (member, date, status, submission). DailyReportRow composite. Form-heavy create dialog |
| 7 | `/checkin` | Low | ~10 | Stat cards + DataTable + EmptyState (Image #8). CheckinRow composite |
| 8 | `/settings` | Medium | ~10 | Last — needs full overlay + form stack ready |

### Non-functional
- Mỗi route migration: 0 visual regression vs v5 (or improvement per ADR design philosophy)
- Performance: page load time không tăng > 10% so v5 baseline
- Bundle size: net change tối đa +50KB sau full migration
- Accessibility: axe-core baseline không giảm
- Hot-reload still work sau swap

## Architecture

### Strangler fig flow per route

```
1. Snapshot baseline:
   - Lighthouse score
   - Screenshots (axe diff)
   - Bundle size
2. Build v6 page parallel:
   src/pages/v6/<route>.tsx  ← new
   src/pages/<route>.tsx     ← v5 (keep until migration done)
3. Router switch behind feature flag OR direct swap
4. Smoke test (manual + automated)
5. Drop v5 page file + downstream v5 imports
6. Verify v5 component có còn được dùng đâu nữa không
   - Nếu không → mark for Stage 3 cleanup
   - Nếu có → các route khác vẫn dùng, skip
```

### Codemod strategy options

| Strategy | Pros | Cons | Recommendation |
|---|---|---|---|
| jscodeshift | Programmatic, repeatable | Steep learning curve | Build once, reuse |
| sed + regex | Quick | Brittle, miss edge cases | Avoid |
| Manual edit + grep | Safe, controlled | Slow for 125 sites | Backup option |
| AI batch (Claude per file) | Fast, smart | Token cost, risk drift | **Primary** — Claude per file với strict diff review |
| Codemod + AI validate | Best of both | Complex pipeline | If jscodeshift available |

**Default:** AI batch per file với reviewer pass after each batch of 10 files.

## Page Composites (NEW — screenshot audit additions)

Page-level composites NOT belong trong `src/ui/components/` library — they live trong page-specific dirs (`src/pages/v6/<route>/components/`). 7 composites required:

| Composite | Page | Description | Primitives used |
|---|---|---|---|
| **ObjectiveCard** | `/okrs` | L1 OKR accordion (badge L1-BOD, icon, title, child count, progress %, expand) | Accordion + Badge + ProgressBar + IconButton |
| **KeyResultRow** | `/okrs` | KR row (KR badge, title, reporter avatar, progress bar, check-in/edit/delete actions) | Badge + Avatar + ProgressBar + Button (success/outline/destructive) |
| **FunnelStepCard** | `/dashboard` (Acquisition tab) | 3-section breakdown (PRE/IN/POST-PRODUCT) với stages + conversion % per step | Card + ProgressBar + colored dots |
| **AEWorkloadRow** | `/dashboard` (Distribution tab) | Horizontal stacked bar per AE (Active vs Cleared) | BarChart stacked variant + Badge |
| **DailyReportRow** | `/daily-sync` | Member + date + report status badge + submission timing badge + submitted at | StatusBadge + Avatar |
| **CheckinRow** | `/checkin` | Reporter + week + status + created | StatusBadge + Avatar |
| **LeadTableRow** | `/leads`, `/ads`, `/media` | Customer + AE + Received + Status + SLA + Lead Type + UQ Reason + Notes + Modified + Actions | StatusBadge + Avatar + Tooltip + IconButton |

**Decision:** Composites build INLINE trong page migration của route đó, không build trước. Lý do: structure phụ thuộc data shape từ hook — biết được lúc migrate.

## Related Code Files

### Create per route
- `src/pages/v6/<route>/index.tsx` (or `<route>.tsx`)
- `src/pages/v6/<route>/components/*.tsx` — page composites (e.g., `objective-card.tsx`, `key-result-row.tsx` for `/okrs`)
- Sub-components nếu page >200 lines

### Modify
- `src/App.tsx` (or router setup) — swap route element from v5 page → v6 page
- Hooks, contexts, lib/api: **KHÔNG thay đổi** (verify only)

### Delete per route (after smoke test)
- `src/pages/<route>.tsx` (v5 version)
- v5 page sub-components nếu chỉ route đó dùng

### DO NOT touch
- `src/hooks/**`, `src/contexts/**`, `src/lib/**`, `src/types/**`
- Server code, Prisma, database schemas

## Implementation Steps

**Per route loop:**

1. **Baseline capture**
   - `npm run build` → save bundle stats
   - Lighthouse audit save screenshots
   - axe-core report
   - Manual screenshot golden path
2. **Create v6 page file**
   - Mirror v5 page structure but use v6 components
   - Keep hook usage identical
   - Co-located CSS if any custom layout needed
3. **Router swap**
   - Direct swap import (no feature flag — git revert as rollback)
4. **Smoke test**
   - Manual: navigate route, test all interactions
   - Automated: existing tests still pass
5. **Performance compare**
   - Lighthouse re-run, compare vs baseline
   - If regression > 10% → investigate before continue
6. **Cleanup v5 page**
   - Delete v5 page file
   - Check if v5 sub-components còn được dùng (grep imports)
7. **Commit per route**
   - `feat(v6): migrate /<route> to v6 component library`
8. **Wait Dominium approve** trước route tiếp theo (early routes); sau route 3-4 có thể batch nhỏ

## Todo List

- [ ] Codemod strategy decision (jscodeshift vs AI batch)
- [ ] Baseline metrics capture script
- [ ] Route 1: `/dashboard` migrate + verify + commit
- [ ] Route 2: `/okrs` migrate + verify + commit
- [ ] Route 3: `/leads` migrate + verify + commit
- [ ] Route 4: `/ads` migrate + verify + commit
- [ ] Route 5: `/media` migrate + verify + commit
- [ ] Route 6: `/daily-sync` migrate + verify + commit
- [ ] Route 7: `/checkin` migrate + verify + commit
- [ ] Route 8: `/settings` migrate + verify + commit
- [ ] Final bundle audit + Lighthouse compare full app
- [ ] Catalog v5 components còn unused → mark cho Phase 03 cleanup
- [ ] **STOP + wait for Dominium approve trước khi sang Phase 03**

## Success Criteria

1. Tất cả 8 routes serve từ `src/pages/v6/`, không còn v5 page
2. 0 visual regression (or improvement) trong manual smoke test
3. Performance: Lighthouse score không giảm > 5 points trung bình
4. Bundle size: net change trong giới hạn +50KB
5. Existing tests pass (kể cả integration tests cho hooks)
6. axe-core report không có regression
7. Catalog danh sách v5 component files chuẩn bị xóa Phase 03

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Hook signature mismatch sau migrate | Low | High | Hooks không sửa, chỉ verify; nếu page cần data shape mới → adapter component |
| Recharts wrapper visual khác v5 | High | Medium | Stage 1 chart wrappers test sẵn các use case từ v5 |
| DataTable migration miss column config | Medium | High | Migrate column config object as-is, chỉ swap table component |
| `/leads` hook lead-flow break | Medium | High | Lead-flow hook complex nhất, test full flow trước khi drop v5 page |
| `/media` auto-pull recent rewrite regression | Medium | High | Recent ceed892 commit — test media auto-pull end-to-end |
| `/daily-sync` autosave + comment thread (v1.1) regression | Medium | High | Recent feature — full draft/save/comment cycle test |
| Browser cache giữ v5 chunks | Low | Low | Hard refresh after deploy, bust cache |
| Storybook v6 deviate vs production behavior | Medium | Medium | Storybook chỉ dùng cho component review, production = actual pages |

## Security Considerations

- Auth context không đổi → permissions hoạt động identical
- API key auth middleware (per `docs/api-key-authentication.md`) không bị ảnh hưởng (server-side)
- Lead PII trong DataTable: ensure same masking/redaction rules
- Form CSRF tokens preserved (server-side)
- File upload (nếu có trong checkin/media): retain validation

## Next Steps

- **Blocked by:** Phase 01 completion + Dominium approve
- **Unblocks:** Phase 03 (v5 cleanup)
- **Follow-up:**
  - Migration log per route → `plans/reports/migration-route-<name>-<date>.md`
  - Performance baselines saved
  - Memory update: v5 deprecation timeline
