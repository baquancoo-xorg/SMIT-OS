---
title: "Tablet Collapsed Sidebar with Tap-to-Expand Overlay"
description: "Tablet (md–xl) bỏ burger, dùng collapsed rail + tap icon → expand overlay + tap pending lần 2 → navigate."
status: pending
priority: P2
effort: 3h
branch: main
tags: [ui, layout, responsive, tablet, sidebar, a11y]
created: 2026-05-16
---

# Plan — Tablet Collapsed Sidebar

## Source
- Brainstorm: `plans/reports/brainstorm-260516-1844-tablet-collapsed-sidebar.md`

## Goal
Tablet viewport (768–1279px) bỏ burger menu. Hiển thị collapsed rail mặc định; tap icon → expand overlay floating (no push); tap pendingItem lần 2 → navigate + auto-collapse. Desktop (≥xl) và mobile (<md) giữ nguyên.

## Phases

| # | Phase | Status | Effort | File |
|---|-------|--------|--------|------|
| 01 | Tablet collapsed sidebar + overlay | pending | 3h | [phase-01](./phase-01-tablet-collapsed-sidebar.md) |

## Files Touched
- `src/components/layout/shell.tsx` — mode detection + state + listeners
- `src/components/layout/sidebar.tsx` — mode prop + overlay layer + pending visual
- `src/components/layout/header.tsx` — burger `xl:hidden` → `md:hidden`

## Tokens Status
- Existing: `--sidebar-width`, `--sidebar-width-collapsed`, `--z-sidebar`, `--z-modal` (reuse for overlay), `--brand-500`
- No new tokens required.

## Compliance Gates
§9, §10, §11, §12, §12b, §36, §42, §43 + top rules (no hex, no solid orange, light+dark parity, var(--brand-500) accent, card radius preserved).

## Validation
- `npx tsc --noEmit` pass
- `npm run build` pass
- Manual viewport sweep: 375 / 768 / 1024 / 1280 / 1440
- Light + dark parity check
- A11y: Esc dismiss, focus trap, aria-modal
