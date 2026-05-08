---
title: "Phase 00 — Pre-flight Audit Report"
date: 2026-05-08
phase: 00
status: completed
---

# Phase 00 — Pre-flight Audit Report

## Summary

Audit 4 open question từ brainstorm. **MAJOR DISCOVERY:** CRM có sẵn UTM tracking clean qua `crm_subscribers_utm` → switch Channel data source khỏi PostHog → tiết kiệm 1d Sprint 2 (UTM tracking fix DEFER).

## Verdict Matrix

| # | Question | Verdict | Decision |
|---|---|---|---|
| 1 | CRM ICP column rental/running/hybrid? | ❌ **DEFER** | Không có column phân loại ICP. `business_industry` (5/4374 row), `business_subtype` (empty), `business_type` (binary 1/2). Sprint 3 skip ICP filter |
| 2 | Channel data source? | ✅ **GO BOTH** | Primary: CRM `crm_subscribers_utm` (8+ clean sources). Secondary: PostHog `$referring_domain` |
| 3 | PostHog person property `first_referring_domain`? | ⏭️ **N/A** | Không cần — CRM UTM data đủ tốt. UTM tracking fix Sprint 2 → DEFER |
| 4 | Stuck threshold? | ✅ **7d (tracking-only)** | Master Plan §1.4 default 7d. **KHÔNG trigger task cho Sale** — SMIT OS là phần mềm giám sát/theo dõi, stuck list chỉ display, không copy-to-clipboard cho Concierge |

## Detailed Findings

### 1. CRM ICP Column Audit

**Query:**
```sql
SELECT business_type, business_subtype, business_industry, count(*)
FROM crm_businesses
WHERE "_PEERDB_IS_DELETED" = false
GROUP BY business_type, business_subtype, business_industry
ORDER BY count DESC LIMIT 15;
```

**Result:**
```
business_type | business_subtype | business_industry     | count
2             |                  |                       | 3544
1             |                  |                       | 825
1             |                  | marketing-advertising | 5
```

**Verdict:** No column maps to rental/running/hybrid distinction. `business_type` is binary (1/2), `business_subtype` is 100% empty, `business_industry` has only 5 row populated.

**Decision:** **DEFER ICP filter** Sprint 3. Phase 03 update: skip `product-icp-filter.tsx`. Operational section header simplified.

### 2. Channel Data Source Audit

**CRM `crm_subscribers_utm` query:**
```sql
SELECT utm_source, count(*) FROM crm_subscribers_utm
WHERE "_PEERDB_IS_DELETED" = false
GROUP BY utm_source ORDER BY count DESC LIMIT 10;
```

**Result (top 10):**
```
utm_source     | count
Home           | 89,059
(empty)        | 41,988
Faceboookads   | 34,931
Link           | 33,305
fb             | 29,636
Adscheck       | 24,552
facebook       | 10,388
Homepage       | 6,938
Facebook       | 3,106
fb-TKQCde      | 2,273
```

**PostHog `$referring_domain` query (30 days):**
```
$direct           | 676,748 (74.1%)
agency.smit.vn    | 184,196 (20.2% — internal)
m.facebook.com    | 23,621
l.facebook.com    | 19,713
facebook.com      | 5,449
www.google.com    | 2,698
... (real external = 5.7%)
```

**Verdict:** PostHog data 94.3% noise (direct + internal). CRM UTM has 8+ identifiable sources tied to subscriber lead.

**Decision:** **GO BOTH** — primary CRM `crm_subscribers_utm` (Channel Breakdown widget · Pre-PQL by Source widget), secondary PostHog `$referring_domain` (separate widget for cross-validation). Need normalization (Home/Homepage, fb/Facebook/facebook → consolidate).

### 3. PostHog Person Property `first_referring_domain`

**Verdict:** **N/A** — không cần audit thêm. Vì Channel section dùng CRM data (verdict #2), không cần PostHog person property.

**Decision:** UTM tracking fix Sprint 2 → **DEFER**. Effort Sprint 2 giảm 5d → 4d (loại 1d UTM fix).

### 4. Stuck Threshold

**User confirm:** **7 ngày** (theo Master Plan §1.4) · **TRACKING-ONLY** mode.

**Critical clarification từ user:**
> "SMIT OS là phần mềm giám sát/theo dõi, KHÔNG cần trigger task cho Sale. Chỉ tracking là stuck."

**Decision:** Stuck list Sprint 3 simplified:
- ✅ Hiển thị business_id, name, days_stuck, signup_at
- ❌ KHÔNG copy email/phone to clipboard
- ❌ KHÔNG export Concierge action button
- Constant `STUCK_THRESHOLD_DAYS = 7`

## Plan Adjustments Required

### phase-02-sprint2-cohort-channel.md
- **Channel section** rewrite: CRM `crm_subscribers_utm` primary + PostHog secondary
- New BE service: `product-channel.service.ts` query CRM `crm_subscribers_utm` JOIN `crm_subscribers` + `crm_businesses`
- DEFER UTM tracking fix → remove implementation step #13-16
- Effort: 5d → **4d**

### phase-03-sprint3-operational-polish.md
- DEFER `product-icp-filter.tsx` component
- Simplify `product-stuck-list.tsx`: tracking-only, no copy/export action
- Effort: 5d → **4-4.5d**

### plan.md
- Total effort: 15d → **13-13.5d**
- Update Open Questions table với verdict resolved
- Update Top Risks: risk #2 (Pre-PQL by source person property) RESOLVED via CRM
- Update Top Risks: risk #4 (CRM ICP column) → DEFER decision

## Resolved Open Questions

All 4 open questions từ plan.md đều resolved trong audit này.

## Outstanding Questions

None.
