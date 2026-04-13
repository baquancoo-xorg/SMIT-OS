---
name: dark-mode-implementation
status: completed
priority: high
created: 2026-04-14
estimated_effort: 3-4h
brainstorm: ../reports/brainstorm-260414-0246-dark-mode-implementation.md
---

# Dark Mode Implementation - SMIT-OS

## Overview

Implement dark mode với Tailwind `dark:` prefix approach. Manual toggle, localStorage persistence, Soft Dark style (#121212).

**Scope:** ~30 TSX files + CSS config

## Architecture

```
ThemeProvider (App.tsx)
├── State: theme ('light' | 'dark')
├── Effect: sync localStorage + <html> class
└── Consumers: Header toggle, All components
```

## Color Mapping

| Element | Light | Dark |
|---------|-------|------|
| Background | `bg-surface` (#f7f5ff) | `dark:bg-[#121212]` |
| Card/Panel | `bg-white` | `dark:bg-[#1e1e1e]` |
| Text primary | `text-on-surface` | `dark:text-gray-100` |
| Text secondary | `text-on-surface-variant` | `dark:text-gray-400` |
| Border | `border-outline-variant` | `dark:border-gray-700` |
| Hover bg | `hover:bg-slate-50` | `dark:hover:bg-gray-800` |

## Phases

| Phase | Description | Files | Effort | Status |
|-------|-------------|-------|--------|--------|
| [Phase 1](phase-01-core-infrastructure.md) | ThemeContext + CSS + App.tsx | 3 | 30m | pending |
| [Phase 2](phase-02-layout-components.md) | Header, Sidebar, AppLayout | 3 | 45m | pending |
| [Phase 3](phase-03-ui-components.md) | Button, Modal, Input, Skeleton, EmptyState | 5 | 45m | pending |
| [Phase 4](phase-04-pages-boards.md) | All pages + board components | ~19 | 1.5h | pending |
| [Phase 5](phase-05-testing-polish.md) | Visual testing + color fixes | - | 30m | pending |

## Dependencies

- None (standalone feature)

## Success Criteria

- [ ] Toggle button functional
- [ ] Theme persists after reload
- [ ] All components correct in dark mode
- [ ] No contrast issues (text readable)
- [ ] No flash of wrong theme on load

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Miss some components | Low | Phase 4 comprehensive sweep |
| Contrast issues | Medium | Phase 5 visual review |
| Flash on load | Low | Read localStorage before React hydrates |

## Related

- [Brainstorm Report](../reports/brainstorm-260414-0246-dark-mode-implementation.md)
