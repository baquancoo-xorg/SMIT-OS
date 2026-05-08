# Phase 00 — Pre-flight Audit (1d, BLOCKER for Sprint 1)

## Context Links
- Brainstorm §Open Questions: `plans/reports/brainstorm-260508-0044-product-tab-full-revamp.md`
- Master Plan §1.4 Concierge: `docs/SMIT-Master-Plan-2026-05-05.md`
- Phase 1 audit pattern: `plans/260507-2219-posthog-product-tab/phase-00-preflight-audit.md`

## Overview
- **Priority:** P0 (blocker — không pass audit thì Sprint 1 risk vỡ thiết kế)
- **Status:** pending
- Resolve 4 open question từ brainstorm trước khi code: ICP column · `$referring_domain` coverage · person property · stuck threshold

## Key Insights
- 4 widget downstream phụ thuộc audit verdict: ICP filter (§5), Channel breakdown (§4), Pre-PQL by source (§4), Stuck list threshold (§5)
- Verdict ảnh hưởng decision "build vs defer vs simplified" — phải chốt trước khi viết code Sprint 1/2/3
- Audit là READ-ONLY — không modify schema/event taxonomy

## Requirements

### Functional
- Trả lời 4 verdict cụ thể trong audit report
- Mỗi verdict đi kèm sample query/data + evidence
- Decision matrix: GO / SIMPLIFIED / DEFER cho từng feature phụ thuộc

### Non-functional
- Audit trong 1 working day
- Không gây load lớn lên CRM (LIMIT 100 query)
- Không gây load lớn lên PostHog (`HogQL LIMIT` + cache)

## Architecture
```
Audit Workflow
├── CRM schema query (psql) ──→ ICP column verdict
├── PostHog HogQL sample ─────→ $referring_domain coverage verdict
├── PostHog person query ─────→ first_referring_domain verdict
└── Stakeholder confirm ──────→ stuck threshold verdict
```

## Related Code Files

### Read-only
- `/Users/dominium/Documents/Project/SMIT-OS/server/lib/crm-db.ts` — CRM client config
- `/Users/dominium/Documents/Project/SMIT-OS/prisma/schema.prisma` — local schema
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/dashboard/overview-kpi.service.ts` — CRM PQL pattern hiện có
- `/Users/dominium/Documents/Project/SMIT-OS/server/services/posthog/posthog-client.ts` — HogQL helper

### Create
- `/Users/dominium/Documents/Project/SMIT-OS/plans/260508-0044-product-tab-full-revamp/reports/phase-00-audit.md`

## Implementation Steps

1. **CRM ICP audit**
   - Query CRM trực tiếp: list columns of `crm_business_pql_status` + `crm_business` (hoặc tương đương) qua `psql`
   - Tìm column tag/category/icp_type/segment có giá trị thuộc {rental, running, hybrid, agency_only, ...}
   - Sample 20 row business để xem distribution
   - **Verdict format:** `column: <name|null> · distinct_values: [...] · coverage: X%`
   - **Decision:** column tồn tại + coverage >50% → GO ICP filter Sprint 3 · không có → DEFER (không block plan)

2. **`$referring_domain` coverage**
   - HogQL: `SELECT properties.$referring_domain as ref, count() FROM events WHERE timestamp > now() - INTERVAL 30 DAY GROUP BY ref ORDER BY count() DESC LIMIT 20`
   - Tính: % event có giá trị non-NULL/non-empty/non-`$direct`
   - **Decision:** >30% identifiable → GO Channel breakdown · 10-30% → SIMPLIFIED (chỉ top 5 + "Other") · <10% → DEFER + UTM Status Badge "no data"

3. **Person property `first_referring_domain`**
   - HogQL: `SELECT properties.first_referring_domain, count() FROM persons WHERE properties.first_referring_domain IS NOT NULL`
   - Hoặc qua `/api/projects/{id}/persons/properties` REST endpoint
   - **Decision:** đã có → GO Pre-PQL by source · chưa có → plan add `posthog.identify(distinctId, { $set_once: { first_referring_domain } })` trong FE init code (Sprint 2 parallel)

4. **Stuck threshold confirm**
   - User chốt `7d` (theo Master Plan §1.4 — Sale gọi user stuck >7d) hay khác
   - Single AskUserQuestion nếu chưa rõ — default 7d
   - **Decision:** confirm `STUCK_THRESHOLD_DAYS = 7` constant

5. **Write audit report**
   - File: `plans/260508-0044-product-tab-full-revamp/reports/phase-00-audit.md`
   - Format: 4 section, mỗi section có: query/evidence · raw result · verdict · decision
   - Cuối: GO/SIMPLIFIED/DEFER matrix cho 4 feature
   - Update parent `plan.md` Open Questions table với verdict mới

## Todo List
- [ ] CRM schema query — list columns `crm_business_pql_status` + `crm_business`
- [ ] CRM sample query — distribution ICP-like column
- [ ] PostHog `$referring_domain` coverage HogQL
- [ ] PostHog person property `first_referring_domain` audit
- [ ] Confirm stuck threshold với user (default 7d)
- [ ] Write `reports/phase-00-audit.md` với 4 verdict + decision matrix
- [ ] Update parent `plan.md` Open Questions với verdict resolved

## Success Criteria
- ✅ 4 verdict cụ thể trong audit report
- ✅ Decision matrix GO/SIMPLIFIED/DEFER chốt cho ICP filter · Channel breakdown · Pre-PQL by source · Stuck threshold
- ✅ Phase 1/2/3 dependencies cập nhật theo verdict (không phải redesign khi triển khai)
- ✅ Không có schema/event taxonomy thay đổi trong phase này (read-only)

## Risk Assessment
- 🟢 **LOW** — Audit không touch code production
- 🟡 **MED** — Nếu cả 4 verdict đều xấu (ICP thiếu + UTM 0% + person property thiếu + stuck threshold conflict) → trigger redesign Sprint 2/3
- Mitigation: dù xấu, plan vẫn proceed — Channel/ICP/Pre-PQL by source là nice-to-have, không block 3 section còn lại

## Security Considerations
- Audit query qua existing service-role CRM client (đã secure)
- PostHog HogQL via server-side `POSTHOG_PERSONAL_API_KEY` — không expose
- Audit report KHÔNG commit raw business data — chỉ aggregate counts/percentages

## Next Steps
- Verdict GO/SIMPLIFIED/DEFER → input cho Phase 1 spec adjustment
- Phase 0 done → unblock Phase 1 (Sprint 1 Executive + Funnel)
