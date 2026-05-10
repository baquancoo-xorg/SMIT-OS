# Phase 02 — Design System Foundation

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Input: Phase 1 audit findings (Top 10 insights + cross-page drift inventory)
- Dependencies: Phase 1 done

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P2 |
| Effort | 1-1.5 tuần |
| Status | **completed (2026-05-10)** |
| Completed by | `/ck:cook` session 2026-05-10 17:19 |

Build foundation của design system mới: tokens (color, typography, spacing), grid, motion, accessibility rules. Output là một **design tokens spec** + Tailwind config update — input cho Phase 3 mockup và Phase 4 component library.

## Key Insights

- Phase này KHÔNG vẽ component — chỉ define rules
- Reuse `design-system` skill (3-layer tokens: primitive → semantic → component)
- Reuse `design` skill cho color palette generation
- Brand identity: nếu user muốn refresh brand → thêm 0.5w. Mặc định giữ brand colors hiện tại
- Output không phải Figma file — output là JSON tokens + Tailwind config + spec doc

## Requirements

### Functional

**Design Tokens (3 layers):**
1. **Primitive tokens** — raw values: color hex, spacing px, font sizes
2. **Semantic tokens** — meaning: `--color-text-primary`, `--space-page-gutter`, `--radius-card`
3. **Component tokens** — usage: `--button-primary-bg`, `--card-padding`

**Specifications:**
- Color palette (primary + secondary + neutrals + status: success/warning/error/info)
- Department colors (Tech/Marketing/Media/Sale/BOD) — refresh hoặc giữ
- Typography scale (8 sizes from caption to display, line-height + weight matrix)
- Spacing scale (4px base, 8 stops)
- Border radius scale (4 stops: button, input, card, modal)
- Shadow scale (4 stops: subtle/medium/strong/dramatic)
- Motion tokens (duration: instant/fast/medium/slow; easing: standard/decelerate/accelerate)
- Breakpoints (mobile/tablet/desktop/wide)
- Z-index layers (sidebar/modal/toast/tooltip)

**Accessibility rules:**
- Color contrast minimums (WCAG AA: 4.5:1 normal, 3:1 large)
- Focus state spec (ring color, offset, width)
- Touch target minimum (44px mobile)
- Motion-reduce media query handling

## Implementation Steps

1. **Audit current tokens** (0.5d):
   - Đọc `tailwind.config.{js,ts}`, `src/index.css`
   - List all current colors/spacing/fonts đang dùng
   - Output: `reports/current-tokens-inventory.md`

2. **Color system design** (1-1.5d):
   - Activate `design` skill → generate palette
   - Decision: brand refresh hay giữ primary color hiện tại?
   - Output: 60-90 tokens (primitive + semantic)
   - Verify contrast ratios

3. **Typography scale** (0.5d):
   - 8 sizes: caption-xs, caption, body-sm, body, h6, h5, h4, h3, h2, h1, display
   - Line-height + weight matrix
   - Font family decision (giữ font-headline custom hay đổi)

4. **Spacing + Radius + Shadow + Motion** (1d):
   - Define scales per category
   - Document use cases

5. **Component-level tokens** (1d):
   - Per main component (button, card, input, modal): define tokens
   - Map sang Tailwind utilities

6. **Tailwind config update** (0.5d):
   - Update `tailwind.config.{js,ts}` extend section
   - Update `src/index.css` CSS variables
   - Test compile

7. **Specs documentation** (1d):
   - `docs/design-tokens-spec.md` — primitive + semantic + component tokens
   - `docs/design-system-foundation.md` — overview + accessibility + motion rules
   - Pre-deprecate `docs/ui-style-guide.md` (sẽ rewrite Phase 8)

8. **User review + sign-off** trước Phase 3

## Output Files

```
docs/
├── design-tokens-spec.md
└── design-system-foundation.md

plans/260510-0358-ui-system-redesign/reports/
└── current-tokens-inventory.md

src/index.css                    (CSS vars updated)
tailwind.config.{js,ts}          (extend updated)
```

## Todo List

- [x] Audit current tokens — `reports/current-tokens-inventory.md`
- [x] Color system design — M3 brand kept, status semantic added (success/warning/info), dept colors promoted to tokens (BOD refreshed to violet)
- [x] Typography scale spec — 12 tokens (caption→display), leading + tracking
- [x] Spacing + Radius + Shadow + Motion scales — clamp-spacing kept, radius semantic-first, shadow 7-stop, motion 5 durations + 4 easings
- [x] Z-index layers added (NEW)
- [x] Tailwind config update (NA — Tailwind v4, all via `@theme` in CSS)
- [x] CSS vars update `index.css` — full rewrite, breakpoints fixed (Tailwind defaults), focus-visible global, prefers-reduced-motion handler
- [x] Compile + smoke test — `npx vite build` ✓ passes (2.18s)
- [x] Specs doc x2 — `docs/design-tokens-spec.md` + `docs/design-system-foundation.md`
- [ ] **User sign-off** — pending (gate cho Phase 3)
- [ ] Visual smoke test on dev server (Phase 8 will catch breakpoint changes; check key pages now optional)

## Success Criteria

- [ ] All tokens documented (primitive + semantic + component)
- [ ] Contrast ratios pass WCAG AA
- [ ] Tailwind config compile clean
- [ ] CSS vars accessible globally
- [ ] User sign-off design tokens trước Phase 3

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Brand refresh creep (đổi color/logo) | 🔴 High | Decision sớm Phase 2 đầu, lock-in |
| Token sai semantic → khó đổi sau | 🟡 Medium | 3-layer architecture, semantic layer là interface |
| Contrast fail → accessibility regression | 🟡 Medium | Verify contrast cho every color combo trước commit |
| Tailwind v4 breaking change | 🟢 Low | Project đang Tailwind v4, follow doc chính thức |

## Security Considerations

Không có (chỉ design tokens).

## Next Steps

- Phase 3: Wireframe + Hi-fi Mockup dùng tokens này
