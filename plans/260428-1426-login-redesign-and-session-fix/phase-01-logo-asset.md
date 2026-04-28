# Phase 1 — Logo Asset (Resize + Optimize)

## Context Links
- Parent plan: [plan.md](plan.md)
- Brainstorm: [`../reports/brainstorm-260428-1426-login-redesign-and-session-timeout.md`](../reports/brainstorm-260428-1426-login-redesign-and-session-timeout.md)
- Source asset: `docs/LogoOnly_SMIT-OS.png` (2.5MB)

## Overview
- **Date:** 2026-04-28
- **Priority:** P2 (blocker cho Phase 2)
- **Status:** completed
- **Effort:** 5 phút
- **Description:** Resize + nén logo PNG để serve qua Vite public/

## Key Insights
- Logo gốc 2.5MB quá nặng cho web (slow first paint)
- Hiển thị size trên login: 96x96 (`w-24 h-24`), retina cần 192x192. Lấy 256x256 dư an toàn cho tương lai
- imagemagick có sẵn ở `/opt/homebrew/bin/magick`

## Requirements
- File output: `public/logo-only.png`, 256x256 px, < 100KB
- Strip metadata (EXIF, ICC profile dư thừa)
- Giữ alpha channel (logo nền đen có thể cần transparent edges nếu sau này đổi)

## Architecture
N/A — chỉ là build asset step.

## Related Code Files
- **Tạo mới:** `public/logo-only.png`
- **Đọc:** `docs/LogoOnly_SMIT-OS.png`

## Implementation Steps
1. Chạy command:
   ```bash
   magick docs/LogoOnly_SMIT-OS.png -resize 256x256 -strip -quality 90 public/logo-only.png
   ```
2. Verify file size:
   ```bash
   ls -lh public/logo-only.png
   ```
3. Verify dimensions:
   ```bash
   magick identify public/logo-only.png
   ```

## Todo List
- [x] Run magick resize + strip command
- [x] Verify file size < 100KB
- [x] Verify 256x256 dimensions
- [x] Quick visual check: `open public/logo-only.png`

## Success Criteria
- File `public/logo-only.png` tồn tại
- Size 256x256
- File size < 100KB (target ~30-50KB)
- Logo trông rõ nét, không bị artifact

## Risk Assessment
- **Risk:** Quality 90 có thể vẫn nặng nếu logo có nhiều màu gradient → **Mitigation:** Nếu > 100KB, giảm quality xuống 80 hoặc dùng `-define png:compression-level=9`

## Security Considerations
- N/A — chỉ là static asset

## Next Steps
→ Phase 2: dùng `/logo-only.png` trong LoginPage.tsx
