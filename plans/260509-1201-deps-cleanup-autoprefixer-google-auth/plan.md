---
title: "Dependencies cleanup — autoprefixer + google-auth-library"
description: "Xoá autoprefixer thừa và khai báo explicit google-auth-library (phantom dep)"
status: completed
priority: P3
effort: 30m
completed: 2026-05-09
commit: b1cc6c5
branch: main
tags: [chore, deps, cleanup, hygiene]
created: 2026-05-09
---

# Dependencies Cleanup — autoprefixer + google-auth-library

**Trigger:** Brainstorm finding tại [`plans/reports/brainstorm-260509-1201-node-modules-cleanup.md`](../reports/brainstorm-260509-1201-node-modules-cleanup.md)

## Context

Sau khi chạy `npx depcheck` + verify thủ công, phát hiện 2 vấn đề trong `package.json`:

1. **`autoprefixer`** — devDep thừa. Tailwind v4 + `@tailwindcss/vite` đã dùng Lightning CSS có built-in autoprefixing. Project không có `postcss.config*` nào.
2. **`google-auth-library`** — phantom dep. Code import trực tiếp tại `server/lib/google-sheets-client.ts:2` nhưng package.json không khai báo, đang đi nhờ qua `googleapis`. Nguy cơ vỡ khi `googleapis` major bump.

Version đang resolve: `google-auth-library@10.6.2` (kéo qua `googleapis@171.4.0`). Cần install version cùng range để tránh duplicate.

## Phases

| # | Phase | Status | Effort |
|---|---|---|---|
| 01 | [Cleanup deps + verify build/dev](./phase-01-cleanup-deps.md) | completed | 30m |

## Out of Scope

- 18 outdated packages (`npm outdated`)
- Bundle production size analysis
- `npm dedupe` cho duplicate version sweep
- Tailwind/Vite/Prisma upgrade

## References

- Brainstorm report: `plans/reports/brainstorm-260509-1201-node-modules-cleanup.md`
- Pino logger usage (verify pino-pretty còn cần): `server/lib/logger.ts:32`
- Google auth import site: `server/lib/google-sheets-client.ts:2`
- Vite + Tailwind config: `vite.config.ts`
