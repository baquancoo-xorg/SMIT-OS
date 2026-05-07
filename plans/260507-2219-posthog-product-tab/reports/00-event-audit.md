# PostHog Event Audit Report

**Date:** 2026-05-07
**Project ID:** 382193
**Host:** us.posthog.com

## Event Taxonomy Comparison

| Required Event (Plan) | Existing Event (PostHog) | Status |
|----------------------|--------------------------|--------|
| `trial_button_clicked` | — | **MISSING** |
| `signup_started` | `onboarding_started` | **RENAME NEEDED** |
| `signup_phone_verified` | — | **MISSING** |
| `agency_created` | `business_created` | **RENAME NEEDED** |
| `onboarding_completed` | `Hoàn thành tất cả nhiệm vụ` | **RENAME NEEDED** |
| `feature_used` | `feature_activated` | **RENAME NEEDED** |

## Existing Custom Events

| Event Name | Type |
|------------|------|
| `business_created` | Custom |
| `onboarding_started` | Custom |
| `feature_activated` | Custom |
| `create_form_started` | Custom |
| `create_form_filled` | Custom |
| `create_form_back` | Custom |
| `intro_page_viewed` | Custom |
| `milestone_clicked` | Custom |
| `survey_viewed` | Custom |
| `survey_submitted` | Custom |
| `survey_identity_selected` | Custom |
| `option_selected` | Custom |
| `asset_sync_completed` | Custom |
| `Hoàn thành tất cả nhiệm vụ` | Custom (Vietnamese) |
| `Tạo doanh nghiệp thành công` | Custom (Vietnamese) |
| `Bắt đầu trang onboarding` | Custom (Vietnamese) |
| `Bắt đầu đồng bộ` | Custom (Vietnamese) |
| `Đồng bộ thành công` | Custom (Vietnamese) |
| `Đồng bộ thất bại` | Custom (Vietnamese) |
| `Đồng bộ lại lần 2` | Custom (Vietnamese) |
| `Vào trang tạo doanh nghiệp` | Custom (Vietnamese) |

## Recent Activity

- Most recent event: `$pageleave` at 2026-05-07T15:46:50Z
- Primary traffic: Autocapture events (`$pageview`, `$pageleave`, `$autocapture`, `$web_vitals`)
- Custom events: 0 recent activity (last 30 days query usage = 0)

## Recommendations

### Option A: Update Plan to Match Existing Events

Use existing events, update plan taxonomy:
```
trial_button_clicked  → (need to implement tracking on website)
signup_started        → onboarding_started
signup_phone_verified → (need to implement tracking)
agency_created        → business_created
onboarding_completed  → Hoàn thành tất cả nhiệm vụ
feature_used          → feature_activated
```

### Option B: Standardize Event Names

Rename existing events to English snake_case for consistency:
- `business_created` → keep
- `onboarding_started` → keep  
- `feature_activated` → rename to `feature_used`
- `Hoàn thành tất cả nhiệm vụ` → rename to `onboarding_completed`

### Blockers

1. **`trial_button_clicked`** — Not tracked. Need to add tracking on website "Dùng thử" button.
2. **`signup_phone_verified`** — Not tracked. Need to add tracking in SMIT User verification flow.

## Next Steps

- [ ] MKT/Dev confirm which naming convention to use (A or B)
- [ ] Implement missing events tracking (trial_button, phone_verified)
- [ ] Update plan Phase 1 `event-taxonomy.config.ts` with final names
