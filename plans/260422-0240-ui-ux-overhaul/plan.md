---
title: "UI/UX Overhaul — Responsive, Token Alignment & Settings Redesign"
status: completed
createdAt: 2026-04-22
blockedBy: []
blocks: []
---

# UI/UX Overhaul

> Cải thiện UI/UX toàn diện: chuẩn hóa design tokens, shared components, Settings page redesign, Daily Report forms, và responsive cho tablet/laptop nhỏ.

## Context

- Brainstorm report: [plans/reports/brainstorm-260422-0240-ui-ux-overhaul.md](../reports/brainstorm-260422-0240-ui-ux-overhaul.md)
- Stack: React 19 + TypeScript + TailwindCSS v4 + `@theme` tokens
- Design system: `src/index.css` (đã có tokens nhưng chưa được dùng nhất quán)

## Phases

| Phase | Tên | Status |
|-------|-----|--------|
| 01 | [Token Alignment + Shared Components](phase-01-token-alignment.md) | completed |
| 02 | [Settings Page Overhaul](phase-02-settings-overhaul.md) | completed |
| 03 | [Daily Report Forms Fix](phase-03-daily-report-forms.md) | completed |
| 04 | [Responsive Audit](phase-04-responsive-audit.md) | completed |

## Key Dependencies

- Phase 01 **phải xong trước** Phase 02, 03, 04 (tạo nền tảng shared components)
- Phase 02, 03 có thể chạy song song sau Phase 01
- Phase 04 chạy cuối cùng (audit toàn bộ sau khi components đã chuẩn hóa)

## Root Causes

1. CSS tokens (`--radius-action`, `--radius-container`) tồn tại trong `index.css` nhưng bị bỏ qua
2. Components hardcode Tailwind classes thay vì dùng tokens → inconsistent
3. Responsive breakpoint `md` = 430px (custom override) gây hiểu lầm khi viết tablet styles
4. Settings tabs & content sử dụng raw slate colors, không khớp glass aesthetic
