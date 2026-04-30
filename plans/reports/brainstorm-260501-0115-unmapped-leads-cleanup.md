# Brainstorm: Unmapped Leads Cleanup

**Date:** 2026-05-01
**Status:** Approved → Implementing

## Problem
- 116 leads showing "Unmapped" AE in SMIT-OS
- User reports CRM UI shows correct AE assignment
- 210 manual leads cluttering data

## Analysis

### Root Cause Discovery
| Finding | Count | Cause |
|---------|-------|-------|
| Unmapped with CRM employee_id | 9 | Synced before mapping fix |
| Unmapped with null employee_id | 107 | CRM not assigned (correct) |
| Manual leads | 210 | Non-CRM data |

### CRM Data Check
- 445 subscribers since 2026-04-01
- 339 have `employee_id_modified` (all 4 employee IDs valid)
- 106 have null `employee_id_modified`

### Employee Mapping
| user_id | Name |
|---------|------|
| 174920 | Duy Linh |
| 63988 | Phương Linh |
| 159922 | Kim Huệ |
| 24954 | Hồng Nhung |

## Solution
1. Delete 210 manual leads (`syncedFromCrm = false/null`)
2. Re-sync backfill to fix 9 incorrectly unmapped leads

## Expected Results
- Total leads: 657 → 447
- Unmapped: 116 → 107 (correct nulls only)
- Manual: 210 → 0

## Risks
- LeadAuditLog cascade delete (accepted)
- Manual data permanently lost (user accepted)
