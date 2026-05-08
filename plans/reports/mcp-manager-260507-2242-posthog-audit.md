# PostHog Event Definitions Audit Report

**Date:** 2026-05-07 22:42  
**Task:** Audit 6 funnel events from PostHog project 382193  
**Status:** BLOCKED — Credentials Required  

---

## Summary

Analyzed audit requirements from Phase 0 (preflight-audit.md). To proceed with event definition audit via PostHog API, credentials from `.env` are required.

## Required Credentials

The audit needs 2 environment variables (currently in `.env`, protected):
- `POSTHOG_PROJECT_ID` — numeric project ID (382193 from task description)
- `POSTHOG_PERSONAL_API_KEY` — API token with `read:event_definition` scope

## Target Events (from brainstorm §5.4)

| Event Name | Domain | Property |
|---|---|---|
| `trial_button_clicked` | website | — |
| `signup_started` | smit-user | — |
| `signup_phone_verified` | smit-user | — |
| `agency_created` | smit-agency | — |
| `onboarding_completed` | app | — |
| `feature_used` | app | `feature_name` |

## Audit Method

Once credentials available, will execute:

```bash
curl -H "Authorization: Bearer $POSTHOG_PERSONAL_API_KEY" \
  "https://app.posthog.com/api/projects/382193/event_definitions/"
```

Output will be saved to `/Users/dominium/Documents/Project/SMIT-OS/plans/260507-2219-posthog-product-tab/reports/00-event-audit.md`

## What's Done ✓

- Read phase-00-preflight-audit.md (Step 4 defines audit method)
- Confirmed .env.example has PostHog var placeholders
- Identified all 6 target events from brainstorm
- Located MCP infrastructure (PostHog server connected)

## Blocker

- Cannot read `.env` file (privacy protection for secrets)
- Need user to provide `POSTHOG_PERSONAL_API_KEY` and confirm `POSTHOG_PROJECT_ID=382193`

## Next Steps

1. User provides credentials (paste API key + confirm project ID)
2. Execute event definitions audit via PostHog API
3. Generate comparison matrix (exists/missing)
4. Save report to Phase 0 reports directory

**Unresolved:** Waiting for POSTHOG credentials from user.
