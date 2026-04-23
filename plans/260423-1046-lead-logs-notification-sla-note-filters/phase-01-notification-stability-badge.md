# Phase 01 — Notification Stability + Badge UI

## Overview
- Priority: High
- Goal: fix dismiss persistence + improve bell badge placement/size

## Files
- `src/hooks/use-notifications.ts`
- `src/components/layout/NotificationCenter.tsx`

## Implementation

1. **User-scoped localStorage key**
   - Current key: `dismissed_deadline_ids`
   - Change to per-user key: `dismissed_deadline_ids:${userId}`
   - Source of `userId`: from auth context (pass into hook/component)

2. **Prevent early cleanup wipe**
   - Existing cleanup removes dismissed IDs not in `workItems`
   - Guard cleanup until `workItems` fetch is ready/non-empty signal to avoid wiping at initial render

3. **Badge UI polish**
   - Move badge slightly outside top-right (`-top-1 -right-1` or equivalent)
   - Reduce footprint (`h-4 min-w-4 px-1 text-[10px]`)
   - Keep readability for `9+`

4. **No server sync**
   - Keep all dismiss state local-only as approved

## Risks
- If userId missing during first render, key fallback must be stable and non-destructive
- Ensure no regression for system notifications unread flow

## Done Checklist
- [ ] Dismissed deadline does not reappear after F5 (same user/browser)
- [ ] Switching user does not leak dismissed list between users
- [ ] Badge does not overlap bell icon in normal and `9+` cases
