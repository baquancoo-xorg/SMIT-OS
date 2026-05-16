# Brainstorm — Tablet Collapsed Sidebar with Tap-to-Expand Overlay

**Date:** 2026-05-16 18:44 (Asia/Saigon)
**Branch:** main
**Status:** Approved → ready for `/ck:plan`
**Contract refs:** §9 App Shell, §10 Sidebar, §11 Header, §12 Mobile Drawer, §12b Nav Behavior, §36 Popover/Tooltip/Drawer, §42 Responsive, §43 A11y

---

## 1. Problem

Tablet viewport (md–xl, 768–1279px) hiện dùng burger menu giống mobile. Lãng phí horizontal space + tap-cost 2 lần (open drawer → tap item) khi tablet thừa real estate cho persistent rail. User muốn collapsed sidebar mặc định, tap item → expand overlay, tap lần 2 → navigate.

## 2. Requirements

**Functional:**
- Tablet (md ≤ viewport < xl): collapsed rail luôn visible, không burger
- Mobile (< md): giữ MobileNavDrawer + burger nguyên trạng
- Desktop (≥ xl): giữ persisted collapsed/expanded nguyên trạng
- Tap icon trong rail → expand overlay (logo + section labels + nav + footer)
- Tap item trong overlay (= pending) lần 2 → navigate + auto-collapse
- Tap item khác → update pending, giữ overlay open
- Tap backdrop / Esc / route change / resize-out → collapse + clear pending
- Expand state KHÔNG persist, reset mỗi page load

**Non-functional:**
- No layout shift khi expand (overlay floats, không push content)
- Touch target ≥ 44px (§43)
- Focus management: Esc dismiss overlay, focus về trigger
- `prefers-reduced-motion`: disable transition expand/collapse
- Light + dark parity (top rule #4)
- Compliance §10 active state: accent bar, không solid orange

## 3. Approaches Evaluated

| # | Approach | Pros | Cons | Verdict |
|---|---|---|---|---|
| A | Tap icon = expand overlay → tap lần 2 navigate | Confirm intent, hạn chế mis-tap, hiện labels rõ | 2-tap navigate (chậm hơn desktop) | **Chosen** |
| B | Tap icon navigate luôn, có handle riêng expand labels | 1-tap navigate giống desktop | Không match user request, handle thêm clutter rail | Rejected |
| C | Tap = expand inline push content | Familiar pattern | Layout shift jank, content reflow tốn perf | Rejected |

## 4. Chosen Solution

### 4.1 Modes (shell-level)

```
viewport < md           → mode = 'mobile'    (drawer + burger, unchanged)
md ≤ viewport < xl      → mode = 'tablet'    (rail + overlay, ephemeral)
viewport ≥ xl           → mode = 'desktop'   (rail + persisted expand)
```

Breakpoint detector: `useMediaQuery('(min-width: 768px) and (max-width: 1279px)')` trong `shell.tsx`. On boundary cross → reset tablet state.

### 4.2 Interaction Spec

```
[Tablet default]
┌──────┬───────────────────────────┐
│ rail │   page content            │   rail = collapsed (icons only)
│ ⚡   │                           │   width: var(--sidebar-width-collapsed)
│ 📊   │                           │
│ 👥   │                           │
└──────┴───────────────────────────┘

[Tap rail icon — first tap]
┌────────────────────┐──────────────┐
│ ⚡ SMIT OS         │              │   overlay = position fixed
│ ── Executive       │  backdrop    │   width: var(--sidebar-width)
│ ⚡ Dashboard       │  bg-black/40 │   z-overlay (between header & modal)
│ 📊 OKRs  [pending] │  blur-sm    │   pending item: ring accent + glow
│ ── Acquisition     │              │
│ 👥 Leads           │              │
│ 📺 Ads             │              │
│ ── footer          │              │
│ profile + logout   │              │
└────────────────────┴──────────────┘

[Tap pending item again] → navigate + collapse
[Tap different item]      → update pending, keep open
[Tap backdrop / Esc]      → collapse, no navigate
[Route change]            → collapse, clear pending
```

### 4.3 Component Changes

**`shell.tsx`:**
- State mới: `tabletExpanded: boolean`, `pendingItem: WorkspaceNavItem | null`
- `useMediaQuery` → `mode: 'mobile' | 'tablet' | 'desktop'`
- Conditional render:
  - `< md`: MobileNavDrawer (unchanged) + burger header
  - `md–xl`: Sidebar mode='tablet' + overlay layer + backdrop, NO burger
  - `≥ xl`: Sidebar mode='desktop' (current behavior)
- Hooks: route change useEffect → collapse tablet; Esc keydown listener khi `tabletExpanded`
- Boundary cross effect: reset `tabletExpanded` + `pendingItem`

**`sidebar.tsx`:**
- Props mới: `mode: 'tablet' | 'desktop'`, `expanded: boolean`, `pendingItem`, `onItemTap`
- Tablet rail: render collapsed như desktop collapsed nhưng bỏ chevron toggle (không expandable persistent, chỉ qua tap item)
- Overlay layer (tablet expanded): clone full sidebar (logo + sections labels + nav + profile/settings/logout footer như desktop) qua `position: fixed` + `inset-y-0 left-0` + shadow-elevated
- Backdrop: `<div className="fixed inset-0 z-[var(--z-overlay-backdrop)] bg-bg/60 backdrop-blur-sm" />` — light/dark parity dùng `bg-bg/60` thay vì `bg-black/40`
- `SidebarNavItem` thêm `isPending`, `mode`:
  - desktop / tablet expanded non-pending: NavLink default
  - tablet collapsed (rail icon): `onClick={(e) => { e.preventDefault(); onItemTap(item); }}`
  - tablet expanded pending: `onClick` allow NavLink navigate (chính là tap lần 2)
  - Visual pending: ring `var(--brand-500)` 1.5px + subtle glow (reuse beam style nhưng full ring)

**`header.tsx`:**
- Burger: đổi `xl:hidden` → `md:hidden` (line 90)
- Breadcrumb không đổi

### 4.4 Tokens / CSS

Không cần token mới. Reuse:
- `--sidebar-width-collapsed`, `--sidebar-width` (existing)
- `--brand-500` cho pending ring (canonical accent, no hex hardcode)
- `--z-overlay-backdrop` / `--z-overlay-panel` — nếu chưa có thì add vào token (verify trong `src/styles/`)
- Card radius giữ `rounded-[2rem]` (rail) — đã match §6 forward target dark `1.5rem`+? CHECK: aside hiện dùng `rounded-[2rem]`, có thể cần align với playground v4 — flag for plan phase

### 4.5 Accessibility (§43)

| Concern | Solution |
|---|---|
| Rail icon-only | `aria-label` + `title` (already implemented) |
| Overlay = drawer pattern | `role="dialog"`, `aria-modal="true"`, `aria-label="Primary navigation"` |
| Focus trap | Trap focus trong overlay khi expanded; Esc dismiss + return focus về last-tapped rail icon |
| Pending indication | Ring color + `aria-current="false"` + visually-hidden text "Press again to navigate" (or tooltip-like helper) |
| Reduced motion | `prefers-reduced-motion: reduce` → bỏ transition transform/opacity overlay |
| Backdrop click | `aria-hidden="true"` backdrop, click handler dismiss |
| Skip link | Giữ skip-to-main hiện có, không ảnh hưởng |

### 4.6 Risks

| Risk | Mitigation |
|---|---|
| 2-tap navigate feels slow vs muscle memory | Pending ring rõ + first-time inline tooltip "Tap again to open" (dismiss after 1 lần dùng); document trong onboarding nếu cần |
| Resize từ tablet → desktop khi expanded | Boundary effect reset state; desktop mode load persisted collapsed |
| iPad landscape 1024px → rail 56px chiếm ~5.5% width (acceptable per user OK) | Confirmed. Data tables vẫn có ≥ 968px content width |
| z-index conflict với NotificationCenter panel | Overlay drawer dùng z-layer < modal. Notification panel hiện z thấp hơn modal → cần verify thứ tự |
| `useMediaQuery` SSR mismatch | Initial render fallback theo `window.matchMedia` if defined, else 'desktop' default (hydration-safe) |
| Light mode backdrop visibility | Dùng `bg-bg/60` token (parity) thay vì `bg-black/40` — backdrop có blur để separate layer |
| State leak across route change to non-tablet | Route effect + boundary effect double-guard |

## 5. Success Criteria

- [ ] Tablet portrait (iPad 768×1024) + landscape (iPad 1024×768) + small laptop (1180px) đều render rail + tap-expand overlay
- [ ] Mobile (375, 414) giữ drawer + burger nguyên trạng
- [ ] Desktop (1280+) giữ persisted collapsed/expand nguyên trạng
- [ ] Tap icon rail → overlay open trong < 200ms (INP §44)
- [ ] Tap pending item 2nd → navigate + auto-collapse
- [ ] Esc + backdrop click + route change đều dismiss overlay
- [ ] Resize từ tablet ↔ desktop ↔ mobile không stuck state
- [ ] Light + dark parity OK (§4 top rule)
- [ ] `prefers-reduced-motion` disable transitions
- [ ] No console warning / hydration mismatch
- [ ] No layout shift (CLS = 0 cho expand action)
- [ ] Compliance §10 active state: accent bar (existing) + new pending ring dùng `var(--brand-500)`, không solid orange

## 6. Open Questions (resolved)

1. iPad landscape 1024px collapsed rail width → **OK**
2. Overlay header (logo + breadcrumb) → **có**
3. Profile/Settings/Logout footer collapsed tablet → **giống desktop collapsed (icons-only)**

## 7. Out of Scope

- Animation refinement (slide-in từ left vs fade-scale): default slide-in, polish sau
- Tooltip hint "Tap again to open": optional, evaluate trong implementation
- Gesture swipe-from-left edge để expand: không scope lần này
- Persisted tablet expand preference: explicitly rejected per Q3

## 8. Next Steps

→ Run `/ck:plan` với context: tablet-collapsed-sidebar redesign, scope = `shell.tsx` + `sidebar.tsx` + `header.tsx` + optional token additions, 1 phase đủ (no DB / backend).

---

**Compliance:**
- §9 App Shell: V5Shell mode-aware, error boundary preserved
- §10 Sidebar: collapsed icon-only with aria-label, active = accent bar (not solid orange), expanded overlay full content
- §11 Header: burger move xl→md, aria-label preserved
- §12 Mobile Drawer: unchanged for < md
- §12b Navigation: route change focus management retained
- §36 Drawer: tablet overlay = drawer pattern, mới — cần update contract nếu spec cần frozen
- §42 Responsive: tablet readable, no horizontal overflow
- §43 A11y: aria-modal, focus trap, Esc, reduced-motion, icon-only aria-label
- Top rules: no hex (use `var(--brand-500)`), light+dark parity backdrop token-based, no solid orange CTA
