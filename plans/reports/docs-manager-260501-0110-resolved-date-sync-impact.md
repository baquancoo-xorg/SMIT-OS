# Documentation Impact Evaluation: Resolved Date Auto-Sync Feature

**Scope:** Lead Logs > resolvedDate field auto-sync from CRM  
**Date:** 2026-05-01  
**Evaluated:** project-changelog.md, system-architecture.md, codebase review

## Feature Summary

- `resolvedDate` synced automatically from CRM `crm_activities` for Qualified/Unqualified leads
- Source: `crm_activities.change_status_subscriber` action (most recent per subscriber)
- UI: DatePicker disabled (read-only background) for CRM-sourced leads; enabled for manual/local leads
- API: PATCH lead routes reject resolvedDate updates for CRM-locked leads (returns 403)
- Field classification: Added to `CRM_OWNED_FIELDS` list (`constants.ts`)

## Documentation Assessment

### What's Documented
- **project-changelog.md (v2.1.9):** "Locked CRM-owned lead fields in edit modal to preserve CRM as source-of-truth"
- **system-architecture.md:** Lead Sync Batch Query section mentions service but not field sync details
- **system-architecture.md:** Data Layer briefly mentions CRM secondary schema

### Gap Analysis

| Aspect | Documented? | Priority |
|--------|-------------|----------|
| CRM field lock mechanism (which fields, why) | Partially—only general statement in changelog | Low |
| resolvedDate sync behavior specifically | No | Low |
| Source mapping (crm_activities → lead.resolvedDate) | No | Low |
| DatePicker disabled state for CRM leads | No | Low |
| API rejection behavior (403 on locked updates) | No | Low |

### Why Documentation Impact is MINOR

1. **User-Facing Change is Transparent**  
   - resolvedDate was already visible in Lead Logs UI (added v2.1.9)
   - Change: now auto-populated from CRM, field becomes read-only for synced leads
   - Users don't need new instructions—field behavior is intuitive (disabled = locked)

2. **Already Established Pattern**  
   - v2.1.9 already documented CRM field locking for `customerName`, `ae`, `receivedDate`, `status`
   - resolvedDate follows identical pattern—no new concept to explain

3. **Internal Technical Details**  
   - Sync mechanism (crm_activities query) is implementation detail
   - Not referenced in user guides or API docs (none exist for lead fields)
   - Developer docs minimal; existing pattern sufficient

4. **No Breaking Changes**  
   - Manual/local leads still editable (feature allows mixed sync state)
   - Backwards compatible—leads without CRM sync are unaffected
   - API already validated locked fields (no new surface area)

## Recommendation

**Docs impact: MINOR**

Rationale: Add single line to changelog entry summarizing the addition; no other updates needed.

Suggested changelog addition to v2.1.15+ entry:
```
- resolvedDate now auto-synced from CRM crm_activities for Qualified/Unqualified leads; 
  field read-only in UI and locked via API for CRM-sourced leads
```

Justification: Maintains parallel with v2.1.9 changelog entry and provides complete CRM-locked-fields picture without requiring architectural or user guide updates.
