# Brainstorm Report: Sidebar Menu Restructuring

**Date:** 2026-04-14
**Status:** Approved
**Type:** UX/Navigation Design

---

## Problem Statement

Sidebar menu hiện tại có cách phân nhóm và đặt tên chưa hợp lý:
- "SYSTEM" group chứa items không liên quan đến system (Backlog, Weekly Report, Daily Sync)
- "OPERATIONS" mix departments và functions
- "STRATEGIC" chỉ có 2 items

## Context

- **Target users:** Startup team 5-20 người
- **Navigation style:** Hybrid approach
- **Most used:** Department pages (Tech, Marketing, Media, Sales)
- **Backlog type:** Team Backlog (không phải Product Backlog)

## Current Structure

```
STRATEGIC
  └── Overview
  └── OKRs

OPERATIONS
  └── Tech&Product
  └── Marketing
  └── Media
  └── Sales

SYSTEM
  └── Backlog
  └── Weekly Report
  └── Daily Sync
```

## Approved Solution: Workspace-First

```
🏠 OVERVIEW              ← Standalone, quick access

WORKSPACES               ← Department pages (most-used, prominent position)
  └── Tech & Product
  └── Marketing
  └── Media
  └── Sales

PLANNING                 ← All planning/tracking activities
  └── OKRs
  └── Team Backlog

RITUALS                  ← Routine sync activities
  └── Daily Sync
  └── Weekly Report
```

## Rationale

| Change | Why |
|--------|-----|
| Overview standalone | Quick access, không cần group cho 1 item |
| WORKSPACES replaces OPERATIONS | Clearer - "workspace" implies working area, not "operating" |
| PLANNING new group | Groups strategic tools together (OKRs + Backlog) |
| RITUALS replaces SYSTEM | Descriptive - "rituals" = recurring team activities |
| Departments moved up | Most-used items should be prominent |

## Benefits

1. **Clarity:** Tên group phản ánh đúng nội dung
2. **Efficiency:** Most-used items (departments) ở vị trí cao
3. **Scalable:** Structure có thể mở rộng khi thêm features
4. **Startup-friendly:** Terminology phù hợp với startup culture

## Implementation Considerations

### Files to modify
- `src/components/Sidebar.tsx` or similar navigation component
- Navigation config/constants file

### Changes required
1. Update group labels: STRATEGIC→(remove), OPERATIONS→WORKSPACES, SYSTEM→RITUALS
2. Add new group: PLANNING
3. Move Overview to standalone position (no group header)
4. Reorder items within groups
5. Move Backlog from RITUALS to PLANNING

### Risk: Low
- Pure UI/naming change
- No backend changes needed
- No data migration

## Success Criteria

- [ ] Group names accurately describe contents
- [ ] Most-used items easily accessible
- [ ] New structure supports future growth
- [ ] Team feedback positive after 1 week

## Next Steps

1. Implement sidebar restructure
2. Update any related navigation tests
3. Gather team feedback after deployment
