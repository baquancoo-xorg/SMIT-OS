---
title: "Login Redesign + Sliding Session Fix"
description: "Redesign trang login khớp brand logo SMIT-OS và fix auto-logout sau 4h bằng sliding session"
status: completed
priority: P2
effort: 1h30m
branch: main
tags: [ui, auth, login, branding, session]
created: 2026-04-28
completed: 2026-04-28
---

# Login Redesign + Sliding Session Fix

## Context
- Brainstorm: [`../reports/brainstorm-260428-1426-login-redesign-and-session-timeout.md`](../reports/brainstorm-260428-1426-login-redesign-and-session-timeout.md)
- Logo asset: `docs/LogoOnly_SMIT-OS.png` (2.5MB, S-shape, navy + cyan)
- Vấn đề chính: (1) UI login dùng icon Shield giả lập + tone royal blue lệch brand, (2) JWT hard cap 4h kick user khỏi session khi đang active

## Goals
- Login UI dùng logo PNG thật, gradient navy-cyan khớp brand
- User active liên tục KHÔNG bị auto-logout
- User idle > 4h vẫn bị logout (security)
- KISS: không thêm DB table, không thêm endpoint, không refactor lớn

## Phases

| # | Phase | Status | Effort |
|---|-------|--------|--------|
| 1 | [Logo asset (resize + nén)](phase-01-logo-asset.md) | completed | 5m |
| 2 | [Login UI redesign](phase-02-login-ui.md) | completed | 30m |
| 3 | [Sliding session backend](phase-03-sliding-session.md) | completed | 30m |
| 4 | [Verify & manual test](phase-04-verify.md) | completed | 25m |

## Files

**Sửa:**
- `src/pages/LoginPage.tsx` — UI redesign, gradient, logo
- `server/middleware/auth.middleware.ts` — sliding session logic
- `server/services/auth.service.ts` — helper `getTokenRemaining`

**Tạo mới:**
- `public/logo-only.png` — resize từ docs/, 256x256, < 100KB
- `server/lib/cookie-options.ts` — DRY shared cookie config (optional)

**Không đổi:** `auth.routes.ts` (cookie options đúng), `AuthContext.tsx` (client transparent), DB schema.

## Success Criteria
- [ ] Login hiển thị logo PNG thật (không icon Shield giả lập)
- [ ] Background trái gradient navy-cyan (#0F2A44 → #1E4167 → #2A6498)
- [ ] User dùng app > 4h liên tục → KHÔNG logout
- [ ] User idle > 4h → logout
- [ ] `npm run dev` pass, không TypeScript error
- [ ] No console error / warning mới

## Dependencies
- imagemagick (`/opt/homebrew/bin/magick`) — đã có sẵn
- Không cần install dependencies mới

## Risks
- Logo PNG vẫn nặng nếu chỉ resize không strip metadata → mitigation: dùng `-strip` flag
- COOKIE_OPTIONS duplicate giữa middleware + routes nếu không refactor → mitigation: extract shared file ở Phase 3
