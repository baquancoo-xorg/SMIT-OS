---
title: UI Spacing & Responsive Fix
status: in_progress
priority: high
created: 2026-04-19
estimated: 1-2 hours
blockedBy: []
blocks: []
---

# UI Spacing & Responsive Fix

## Overview

Fix 3 vấn đề UI/UX sau khi review:
1. **Padding không khớp** - Content vượt ra ngoài alignment của Header
2. **Top spacing thiếu** - Tiêu đề quá sát Topbar (cần 32px)
3. **iPad responsive** - Mất burger menu, content bị cắt

**Approach:** CSS Variables + Tablet breakpoint
**Reference:** [Brainstorm Report](../reports/brainstorm-260419-1317-ui-spacing-responsive-fix.md)

## Phases

| Phase | Name | Est | Status |
|-------|------|-----|--------|
| 1 | [CSS Variables](phase-01-css-variables.md) | 15m | pending |
| 2 | [Header Alignment](phase-02-header-alignment.md) | 15m | pending |
| 3 | [iPad Fixes](phase-03-ipad-fixes.md) | 30m | pending |
| 4 | [Testing](phase-04-testing.md) | 30m | pending |

## Key Files

```
src/index.css                           # CSS variables + .page-padding
src/components/layout/Header.tsx        # Header padding
src/components/layout/AppLayout.tsx     # Content wrapper
src/components/layout/Sidebar.tsx       # Burger menu check
```

## Success Criteria

- [ ] Content căn sát 100% với Header (Global Search trái, buttons phải)
- [ ] Top spacing = 32px từ Topbar
- [ ] iPad Pro portrait: Burger menu hiện, không bị cắt
- [ ] iPad Pro landscape: Layout tối ưu
- [ ] Desktop: Không regression

## Risks

| Risk | Mitigation |
|------|------------|
| Breaking layouts | Test all pages before commit |
| Safari quirks | Test on real iPad |
