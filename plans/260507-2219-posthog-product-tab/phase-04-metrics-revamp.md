# Phase 4: Metrics Revamp (Business-centric)

**Status:** ✅ Done  
**Date:** 2026-05-08

## Overview

Revamp all Product tab metrics to follow business-centric definitions instead of user-centric.

## Changes Made

### 1. New Service: `product-metrics.service.ts`
Hybrid service combining PostHog + CRM data sources.

### 2. Metric Definitions

| Metric | Source | Implementation |
|--------|--------|----------------|
| Total Signup | PostHog | `Tạo doanh nghiệp thành công` event count |
| FirstSync | CRM | `crm_business_pql_status.has_first_sync = true` |
| PQL | CRM | `crm_business_pql_status.is_pql = true` |
| Activation | PostHog | Businesses with ≥20 tracked events |
| DAU | PostHog | Distinct business_id in last 24h |
| MAU | PostHog | Distinct business_id in last 30d |

### 3. Files Modified

- `server/services/posthog/product-metrics.service.ts` - NEW
- `server/schemas/dashboard-product.schema.ts` - Updated schema
- `server/routes/dashboard-product.routes.ts` - Use new service
- `src/types/dashboard-product.ts` - Updated types
- `src/components/dashboard/product/product-kpi-cards.tsx` - Display 6 KPIs

### 4. Files Removed

- `server/services/posthog/product-summary.service.ts` - Replaced
- `server/services/posthog/product-funnel.service.ts` - Replaced

### 5. Funnel Steps (Business Journey)

1. Business Created → 2. First Sync → 3. Feature Activated → 4. PQL Achieved

## Sample Output

```json
{
  "totalSignups": 259,
  "firstSyncCount": 152,
  "pqlCount": 10,
  "activationCount": 17,
  "activationRate": 7,
  "dau": 26,
  "mau": 380,
  "dauMauRatio": 7
}
```

## Notes

- Activation threshold (20 events) is a proxy since `business_id` is only set on custom events
- User can adjust threshold via code if needed
- CRM database provides authoritative PQL status
