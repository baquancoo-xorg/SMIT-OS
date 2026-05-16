# Phase 01 — Tablet Collapsed Sidebar + Tap-to-Expand Overlay

## Context

- Parent: [plan.md](./plan.md)
- Source: `plans/reports/brainstorm-260516-1844-tablet-collapsed-sidebar.md`
- Docs cited: `docs/ui-design-contract.md` §9, §10, §11, §12, §12b, §36, §42, §43
- Top rules: NO hex hardcode (use `var(--brand-500)` OKLCH), NO solid orange CTA, light+dark parity required, card radius preserved.

## Overview

- **Date:** 2026-05-16
- **Priority:** P2
- **Effort:** ~3h
- **Status:** pending
- **Review:** n/a

Tablet viewport (md 768px → xl 1279px) bỏ burger menu. Render collapsed rail luôn visible. Tap icon → expand overlay (`position: fixed`, floats, no push). Pending item ring `var(--brand-500)`. Tap pending lần 2 → navigate + auto-collapse. Esc / backdrop / route change / resize-out → dismiss + clear pending. Ephemeral state (no localStorage).

## Key Insights

- Existing tokens đủ: `--sidebar-width`, `--sidebar-width-collapsed`, `--z-modal` (reuse cho overlay), `--brand-500`. Không cần token mới.
- Codebase đang dùng `xl:hidden` cho burger trigger (header.tsx:90) và `xl:block` cho desktop sidebar wrapper (shell.tsx:37). Chuyển boundary thành `md`.
- `useMediaQuery` hook chưa tồn tại trong codebase — sẽ tạo inline trong shell hoặc `src/hooks/use-media-query.ts` (kebab-case, <50 LOC).
- Overlay = drawer pattern (§36) nhưng tablet chưa có spec sẵn → áp dụng aria-modal=true + Esc + focus trap như Modal §35.
- Sidebar aside hiện có `rounded-[2rem]` — playground v4 forward target. Giữ nguyên.

## Requirements

### Functional
1. `< md` (mobile): drawer + burger (unchanged).
2. `md ≤ vw < xl` (tablet): rail luôn visible, không burger; tap icon → overlay; tap pending 2nd → navigate.
3. `≥ xl` (desktop): persisted collapsed/expanded (unchanged).
4. Pending item visual: ring `var(--brand-500)` + glow beam reuse.
5. Dismiss triggers: Esc keydown, backdrop click, route change, boundary cross (resize tablet↔mobile↔desktop).
6. State ephemeral: `tabletExpanded` + `pendingItem` không persist.

### Non-functional
- No layout shift khi expand (overlay floats).
- Touch target ≥ 44px (§43).
- Focus trap + return focus on dismiss.
- `prefers-reduced-motion: reduce` disable transition.
- Light + dark parity backdrop dùng token (`bg-bg/60` thay vì hex/black).
- INP < 200ms.

## Architecture

```
shell.tsx
  ├── useMediaQuery('(min-width: 768px) and (max-width: 1279px)') → isTablet
  ├── state: tabletExpanded, pendingItem, lastTriggerRef
  ├── effects:
  │     - route change → collapse + clear pending
  │     - Esc keydown (when tabletExpanded) → collapse
  │     - resize / mode change → reset state
  └── render:
        - < md: <MobileNavDrawer/> + Header(burger)
        - md–xl: <Sidebar mode='tablet' collapsed expanded={tabletExpanded} pending={pendingItem} onItemTap={...}/>
                + (tabletExpanded && <Backdrop/>)
                + Header(no burger)
        - ≥ xl: <Sidebar mode='desktop' .../> (current)

sidebar.tsx
  ├── props: mode, collapsed, expanded, pendingItem, onItemTap
  ├── Tablet rail (always collapsed): no chevron toggle button (toggle invalid in tablet mode)
  ├── Tablet overlay (when expanded=true): position fixed left-0 inset-y-0, z-modal, full sidebar content
  │     - logo + brand label
  │     - section labels + nav items
  │     - profile/settings/logout footer
  │     - role=dialog, aria-modal=true, aria-label="Primary navigation"
  └── SidebarNavItem:
        - tablet rail icon onClick → preventDefault + onItemTap(item) [no navigate]
        - tablet overlay non-pending onClick → preventDefault + onItemTap(item) [update pending]
        - tablet overlay pending onClick → NavLink default (navigate)
        - desktop: unchanged
        - pending visual: ring 1.5px var(--brand-500) + glow beam reuse

header.tsx
  └── line 90: className "xl:hidden" → "md:hidden"
```

## Related Code Files

**Modify:**
- `src/components/layout/shell.tsx`
- `src/components/layout/sidebar.tsx`
- `src/components/layout/header.tsx`

**Create (optional, if extract):**
- `src/hooks/use-media-query.ts` (kebab-case, ~30 LOC)

**Read for context:**
- `src/components/layout/mobile-nav-drawer.tsx`
- `src/components/layout/workspace-nav-items.ts`
- `src/index.css` (tokens)
- `docs/ui-design-contract.md` §9–§12b, §36, §42, §43

## Implementation Steps

1. **Hook `use-media-query`** — Create `src/hooks/use-media-query.ts` với `window.matchMedia` listener, SSR-safe initial (`typeof window === 'undefined' ? false`). Returns boolean.

2. **`shell.tsx` mode detection:**
   - Import hook. Compute `isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1279px)')`.
   - Compute `isMobile = useMediaQuery('(max-width: 767px)')` (for clarity, or derive).
   - State: `const [tabletExpanded, setTabletExpanded] = useState(false)`, `const [pendingItem, setPendingItem] = useState<WorkspaceNavItem | null>(null)`, `const lastTriggerRef = useRef<HTMLElement | null>(null)`.
   - `useLocation()` from react-router → effect on `pathname` change: if `tabletExpanded` set false + clear pending.
   - Effect on `isTablet` toggle: reset state.
   - Effect on Esc keydown (when `tabletExpanded`): collapse + return focus to `lastTriggerRef.current`.

3. **`shell.tsx` render branching:**
   - Desktop wrapper: change `hidden xl:block` → conditional `mode === 'desktop' ? 'hidden xl:block' : 'hidden md:block xl:block'` (always show ≥ md).
   - Tablet rail container: `md:block xl:hidden` (rail only when mode=tablet).
   - Pass `mode` prop. For tablet, `collapsed={true}` always, `expanded={tabletExpanded}`.
   - Overlay backdrop: `{tabletExpanded && <div className="fixed inset-0 z-modal bg-bg/60 backdrop-blur-sm" onClick={() => { setTabletExpanded(false); setPendingItem(null); }} aria-hidden="true" />}`.
   - `handleItemTap(item, e)`: if `pendingItem?.href === item.href` → allow navigate (don't preventDefault, close overlay onClick after navigate via route effect). Else → setPending(item) + setTabletExpanded(true) + store trigger ref.

4. **`sidebar.tsx` props extension:**
   - Add to `SidebarProps`: `mode?: 'tablet' | 'desktop'` (default 'desktop'), `expanded?: boolean`, `pendingItem?: WorkspaceNavItem | null`, `onItemTap?: (item: WorkspaceNavItem) => void`.
   - Compute `isTabletMode = mode === 'tablet'`, `showOverlay = isTabletMode && expanded`.

5. **`sidebar.tsx` render structure:**
   - When `isTabletMode && !showOverlay`: render rail aside (collapsed=true), hide chevron toggle button.
   - When `showOverlay`: render rail aside (collapsed) + overlay aside `position: fixed inset-y-0 left-0 z-modal w-[var(--sidebar-width)]` with role=dialog, aria-modal=true.
   - Desktop unchanged.
   - Extract sidebar content (logo/nav/footer) to internal `SidebarBody` component to avoid duplication (still <200 LOC file constraint).

6. **`SidebarNavItem` tap logic:**
   - Add prop `isPending?: boolean`, `mode?: 'tablet' | 'desktop'`, `onItemTap?`.
   - Click handler:
     - desktop: NavLink default.
     - tablet rail / tablet overlay non-pending: `e.preventDefault(); onItemTap?.(item);`
     - tablet overlay pending: NavLink default (navigate).
   - Visual `isPending`: add ring `ring-2 ring-[color:var(--brand-500)]` + reuse beam glow (always visible khi pending). NO solid fill (compliance §10).

7. **`header.tsx` burger gate:**
   - Line 90: `"size-11 shrink-0 border border-border bg-surface-2/80 px-0 shadow-sm xl:hidden"` → `"...md:hidden"`.

8. **Focus management:**
   - Khi overlay open: focus đầu tiên = pending item button (`useEffect` after render).
   - Khi overlay close: `lastTriggerRef.current?.focus()`.
   - Focus trap: simple — Tab cycle giữa first/last focusable trong overlay (manual hoặc skip nếu scope nhỏ; chấp nhận browser default + Esc).

9. **Reduced motion:**
   - Tailwind utility `motion-reduce:transition-none` cho aside transitions.

10. **Compile + lint:**
    - `npx tsc --noEmit`
    - `npm run build`
    - `npm run dev` → manual sweep.

## Todo List

- [ ] Create `src/hooks/use-media-query.ts`
- [ ] `shell.tsx`: thêm mode detection, state, route/Esc/boundary effects
- [ ] `shell.tsx`: render branching mobile/tablet/desktop + backdrop
- [ ] `sidebar.tsx`: extend props (mode, expanded, pendingItem, onItemTap)
- [ ] `sidebar.tsx`: extract `SidebarBody` để reuse rail + overlay
- [ ] `sidebar.tsx`: overlay aside với role=dialog + aria-modal
- [ ] `sidebar.tsx`: ẩn chevron toggle khi mode=tablet
- [ ] `SidebarNavItem`: tap logic theo mode + pending state
- [ ] `SidebarNavItem`: pending visual ring `var(--brand-500)` + glow reuse
- [ ] `header.tsx`: burger `xl:hidden` → `md:hidden`
- [ ] Focus management: trap + return focus
- [ ] `motion-reduce` cho transitions
- [ ] Compile pass (`npx tsc --noEmit`)
- [ ] Build pass (`npm run build`)
- [ ] Manual viewport sweep 375 / 768 / 1024 / 1280 / 1440
- [ ] Light + dark parity check
- [ ] A11y check: Esc dismiss, backdrop click, focus return, screen reader announce
- [ ] No console warning / hydration mismatch

## Success Criteria

- [ ] Tablet portrait (iPad 768×1024) + landscape (1024×768) + small laptop (1180px) render rail + tap-expand overlay.
- [ ] Mobile (375, 414) drawer + burger nguyên trạng.
- [ ] Desktop (1280+) persisted collapse/expand nguyên trạng.
- [ ] Tap rail icon → overlay mở < 200ms (INP).
- [ ] Tap pending 2nd → navigate + auto-collapse.
- [ ] Esc / backdrop / route change / resize cross-boundary → dismiss + clear pending.
- [ ] No layout shift (CLS = 0).
- [ ] Light + dark parity backdrop + ring.
- [ ] Pending ring dùng `var(--brand-500)`, KHÔNG solid orange.
- [ ] `prefers-reduced-motion` disable transitions.
- [ ] `npx tsc --noEmit` pass.
- [ ] `npm run build` pass.
- [ ] No console warning / hydration mismatch.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| 2-tap navigate cảm giác chậm | Pending ring rõ + first-time tooltip (optional polish) |
| Resize từ tablet → desktop khi expanded | Effect on isTablet → reset state |
| z-conflict với NotificationCenter | Overlay dùng `--z-modal` (50); NotificationCenter panel verify ≤ 40 hoặc nâng overlay lên `--z-toast` (60) nếu xung đột |
| `useMediaQuery` SSR mismatch | Initial fallback `false` + post-mount sync |
| Focus trap phức tạp | Scope: chấp nhận browser default tab + Esc dismiss; full trap deferred nếu cần |
| File `sidebar.tsx` vượt 200 LOC sau changes | Extract `SidebarBody` + `SidebarFooter` ra cùng file (hoặc split nếu vượt cap) |
| Light mode backdrop low contrast | Dùng `bg-bg/60 backdrop-blur-sm` — verify visually trong cả 2 theme |

## Security Considerations

- N/A — UI-only, không touch auth/data/network.

## Next Steps

1. Implement phase-01.
2. Manual a11y audit qua axe DevTools / Lighthouse.
3. Update `docs/ui-design-contract.md` §10 + §36 nếu cần ghi tablet overlay pattern thành spec chính thức.
4. Journal entry sau khi merge.

## Open Questions

- Tooltip "Tap again to open" có cần ship lần đầu không, hay defer sau? (Default: defer, chỉ ring visual đủ.)
- Focus trap full implementation hay browser default + Esc? (Default: browser default + Esc; revisit nếu a11y audit flag.)
