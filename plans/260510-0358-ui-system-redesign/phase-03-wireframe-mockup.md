# Phase 03 — Wireframe + Hi-fi Mockup

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Input: Phase 1 audit + Phase 2 design tokens
- Dependencies: Phase 2 done, design tokens locked-in

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P2 |
| Effort | 1.5-2 tuần |
| Status | pending |

Design wireframe (low-fi) → Hi-fi mockup (Figma) cho **8 pages + 4 layout components**. KHÔNG code phase này. Output: Figma file + style spec ready cho Phase 4 implementation.

## Key Insights

- Phase này CHIẾM rủi ro nhất plan: nếu mockup không pass user → quay lại từ đầu
- Ship mockup theo BATCH (5 pages/batch × 2 lần review) — không big bang
- Reuse `ui-ux-pro-max` skill (50+ styles, 161 palettes, 99 UX guidelines, 25 chart types)
- Bắt đầu với pages đơn giản (Profile/Settings) → validate design language trước → sau đó pages phức tạp (Dashboard/OKRs)

## Requirements

### Functional

**Wireframe (low-fi, ~3-4 ngày):**
- Cấu trúc layout từng page (no styling, chỉ box + label)
- Information architecture per page
- User flow critical (signup, daily report submit, OKR edit, lead log)
- Mobile + desktop layout
- Tool: Figma sketch board, Excalidraw, hoặc paper

**Hi-fi mockup (~1-1.5 tuần):**
- Apply design tokens Phase 2
- Pixel-perfect cho tất cả 8 pages (desktop + mobile)
- All states: default, hover, active, disabled, loading, empty, error
- All variants: card variants, button variants, table density
- Modal + dropdown + tooltip examples
- Animation prototyping (Figma smart animate hoặc spec text)

**Pages list:**
1. LoginPage
2. Dashboard (5 tabs)
3. OKRs Management (L1/L2 view)
4. Daily Sync
5. Weekly Checkin
6. Lead Tracker (tabs)
7. Settings (sub-pages)
8. Profile

**Layout components:**
- AppLayout
- Header (notification, user menu)
- Sidebar (nav)
- NotificationCenter (panel)

## Implementation Steps

### Step 1 — Wireframe (3-4d)
1. Sketch mỗi page low-fi (no styling)
2. Map information architecture
3. Critical user flows: 5 flows top
4. Mobile vs desktop split layout
5. **Mid-checkpoint user review** trước Hi-fi

### Step 2 — Hi-fi Mockup batch 1 — Small pages (3-4d)
- LoginPage, Profile, Settings
- Apply Phase 2 design tokens
- All states + variants
- **Batch review** với user

### Step 3 — Hi-fi Mockup batch 2 — Medium pages (3-4d)
- DailySync, WeeklyCheckin, LeadTracker
- **Batch review**

### Step 4 — Hi-fi Mockup batch 3 — Large pages (4-5d)
- Dashboard (5 tabs hardest), OKRs (L1/L2)
- **Batch review**

### Step 5 — Layout components mockup (1-2d)
- AppLayout, Header, Sidebar, NotificationCenter
- All breakpoints

### Step 6 — Final sign-off
- User review tổng thể
- Sign-off bằng văn bản (commit comment hoặc note)

## Output Files

```
plans/260510-0358-ui-system-redesign/reports/
├── wireframe-low-fi.pdf  (export Figma)
├── mockup-batch-1-review.md
├── mockup-batch-2-review.md
├── mockup-batch-3-review.md
└── final-mockup-signoff.md

Figma file: shared link → save trong reports
```

## Todo List

- [ ] Wireframe 8 pages + 4 layouts
- [ ] Mid-checkpoint user review wireframe
- [ ] Hi-fi mockup batch 1 (Login + Profile + Settings)
- [ ] Batch 1 review + iterate
- [ ] Hi-fi mockup batch 2 (DailySync + Checkin + LeadTracker)
- [ ] Batch 2 review + iterate
- [ ] Hi-fi mockup batch 3 (Dashboard + OKRs)
- [ ] Batch 3 review + iterate
- [ ] Layout components mockup
- [ ] Final sign-off

## Success Criteria

- [ ] Wireframe cover 8 pages + 4 layouts + 5 critical flows
- [ ] Hi-fi mockup có all states (default/hover/active/disabled/loading/empty/error)
- [ ] Mobile + desktop variant cho mỗi page
- [ ] User sign-off bằng văn bản trước Phase 4
- [ ] Animation spec (smart animate hoặc text doc)

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| User feedback loop dài → delay 1-2w | 🔴 High | Batch nhỏ (3-5 pages), 2 vòng review max/batch, hard deadline |
| Mockup không match brand | 🟡 Medium | Phase 2 lock brand sớm, Phase 3 ko lệch |
| Mobile mockup bị skip | 🟡 Medium | Mỗi page mockup: desktop + mobile (375px) bắt buộc |
| State + variant thiếu → Phase 4 stuck | 🟡 Medium | Checklist all states/variants trước batch review |
| OKRs/Dashboard quá phức tạp → mockup chậm | 🟡 Medium | Để batch 3 (cuối), team đã warm-up |

## Security Considerations

- Mockup KHÔNG hiển thị real user data (PII) → dùng dummy
- Figma file chia sẻ secure link, không public

## Next Steps

- Phase 4: Component Library Implementation dùng mockup làm reference
