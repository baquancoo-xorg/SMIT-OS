# Phase 0 — Pre-flight & Audit

## Context Links
- Parent plan: [plan.md](./plan.md)
- Brainstorm: [../reports/brainstorm-260507-1609-posthog-product-tab-integration.md](../reports/brainstorm-260507-1609-posthog-product-tab-integration.md) §7
- PostHog API docs: https://posthog.com/docs/api

## Overview
- **Date:** 2026-05-07
- **Priority:** P0 (blocker cho Phase 1)
- **Effort:** 1-2 days
- **Status:** ⬜ Not started
- **Description:** Lock dependencies external (PostHog credentials, event taxonomy, retention insight) trước khi code. Phase này chủ yếu là coordination + audit, ít code.

## Key Insights
- Event taxonomy là blocker lớn nhất — funnel logic phụ thuộc 6 events được MKT chốt
- Cross-domain stitching cần verify thực tế, không phải spec — 1 user thật click → signup → app
- PostHog Personal API Key có scope `read-only` (mới) hoặc full — ưu tiên read-only
- Saved insight phải được tạo trước, vì share URL sinh từ PostHog UI

## Requirements
- **Functional:** Có đủ env vars + key + event list để Phase 1 chạy. Retention share URL sẵn sàng cho Phase 2.
- **Non-functional:** Không commit secrets · `.env.example` template hoá · audit document lại nếu event taxonomy MKT chốt khác đề xuất.

## Architecture
```
[admin PostHog] → cấp POSTHOG_PROJECT_ID + Personal API Key
[MKT team]      → chốt 6 funnel events
[dev]           → tạo .env, audit hiện trạng, verify stitching
```

## Related Code Files
- `.env` (modify, không commit)
- `.env.example` (modify, commit)
- `package.json` (modify) — thêm `posthog-node`, `lru-cache`

## Implementation Steps

### Step 1 — Lấy credentials từ admin PostHog
1. Hỏi admin `POSTHOG_PROJECT_ID` (numeric, ở URL `/project/{id}/`)
2. Tạo Personal API Key tại `https://app.posthog.com/project/{id}/settings/personal-api-keys`
3. Scope ưu tiên: `read:insight`, `read:events`, `read:event_definition`. Nếu PostHog không hỗ trợ scope → full key, lưu cẩn thận

### Step 2 — Setup env
Thêm vào `.env`:
```
POSTHOG_HOST=https://app.posthog.com
POSTHOG_PROJECT_ID=<from-admin>
POSTHOG_PERSONAL_API_KEY=<from-step-1>
POSTHOG_RETENTION_INSIGHT_SHARE_URL=<from-step-6>
```
Mirror sang `.env.example` (giá trị rỗng/placeholder).

⚠️ **Tuyệt đối KHÔNG** prefix `VITE_` cho `POSTHOG_PERSONAL_API_KEY` — Vite expose mọi `VITE_*` ra bundle FE.

### Step 3 — Cài packages
```bash
npm i posthog-node lru-cache
```
Quyết định: `posthog-node` cho capture (nếu cần Phase 2+); HogQL/Insights API gọi qua axios trực tiếp (đã có trong dependencies).

### Step 4 — Audit event definitions hiện có
```bash
curl -H "Authorization: Bearer $POSTHOG_PERSONAL_API_KEY" \
  "https://app.posthog.com/api/projects/$POSTHOG_PROJECT_ID/event_definitions/"
```
Lưu output vào `plans/260507-2219-posthog-product-tab/reports/00-event-audit.md`. Đối chiếu với 6 events đề xuất.

### Step 5 — Lock event taxonomy với MKT
Confirm events (UPDATED based on audit 2026-05-07):
- `onboarding_started` (app) — signup flow start
- `business_created` (app) — agency/business created
- `Hoàn thành tất cả nhiệm vụ` (app) — onboarding completed
- `feature_activated` (app) — feature usage

**Deferred to Phase 2+:**
- `trial_button_clicked` — need tracking on website
- `signup_phone_verified` — need tracking in SMIT User

Nếu MKT đổi tên → update plan + brainstorm trước Phase 1.

### Step 6 — Tạo saved insight Retention Cohort
1. PostHog UI → Insights → New → Retention
2. Cohort by `signup_started` → returning by `feature_used`
3. Lưu insight, share → "Embed code" → copy iframe `src` URL
4. Paste vào `POSTHOG_RETENTION_INSIGHT_SHARE_URL`
5. Whitelist domain SMIT-OS trong PostHog settings (nếu PostHog yêu cầu)

### Step 7 — Verify cross-domain identity stitching
1. Mở incognito, click "Dùng thử" trên website
2. Signup SMIT User → verify OTP → tạo agency → vào app
3. PostHog UI → Persons → kiểm tra **1 person duy nhất** với 6 events
4. Nếu phân mảnh → fix bằng cookie domain `.smit.tld` HOẶC pass `distinct_id` qua URL khi redirect
5. Document kết quả vào `reports/00-stitching-verification.md`

## Todo List
- [ ] Lấy `POSTHOG_PROJECT_ID` từ admin
- [ ] Tạo Personal API Key (scope read-only nếu có)
- [ ] Update `.env` + `.env.example`
- [ ] `npm i posthog-node lru-cache`
- [ ] Audit event definitions → save report
- [ ] Lock 6 funnel events với MKT
- [ ] Tạo saved insight Retention + lấy share URL
- [ ] Verify cross-domain stitching e2e → save report

## Success Criteria
- [ ] `process.env.POSTHOG_*` 4 vars có giá trị thực
- [ ] `posthog-node` + `lru-cache` xuất hiện trong `package.json`
- [ ] Report `00-event-audit.md` tồn tại, đối chiếu 6 events
- [ ] MKT confirm event taxonomy bằng văn bản (Slack/email)
- [ ] Retention iframe URL load được khi paste vào browser
- [ ] Stitching report show distinct_id duy nhất cho test user

## Risk Assessment
| Risk | Severity | Mitigation |
|---|---|---|
| MKT delay chốt taxonomy | High | Bắt đầu coordinate sớm, parallel với Step 1-3 |
| Stitching phân mảnh | High | Có fallback: pass distinct_id qua URL param khi cross-domain redirect |
| Không có scope read-only | Med | Dùng full key nhưng khoá quyền PostHog UI cho dev account |

## Security Considerations
- Personal API Key chỉ ở `.env` server-side, không VITE_*
- `.env.example` không chứa giá trị thật
- Code review trước khi merge: grep `POSTHOG_PERSONAL_API_KEY` không xuất hiện trong `src/`

## Next Steps
→ [Phase 1 — Backend services](./phase-01-backend-posthog-services.md)
