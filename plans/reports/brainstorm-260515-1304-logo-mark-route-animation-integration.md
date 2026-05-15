# Brainstorm — LogoMark Route Animation Integration

**Date:** 2026-05-15 13:04 (Asia/Saigon)
**Branch:** `feat/v6-frontend-rebuild`
**Source:** `docs/v6/showcase/smit-os-v6-showcase-v5.html`
**Status:** Approved, ready for `/ck:plan`

---

## Problem Statement

Showcase v5 demo có signature animation: logo SMIT OS gồm 2x2 grid với 2 tile (white + orange) di chuyển theo từng route — mỗi route có cặp vị trí riêng, kèm pulse orange tile 2x khi navigate. App hiện tại dùng `<img src="/logo-icon.png">` static. Cần port signature animation vào sidebar + login page.

**Tin tốt:** Component `LogoMark` từng tồn tại trong HEAD (3 commits iteration). Đã bị xóa working tree → restore từ `git show HEAD:...`.

---

## Requirements

### Functional
- Sidebar header dùng `LogoMark` thay `<img>` static
- LogoMark animate transition giữa positions khi `route` prop đổi
- Pulse orange tile 2x (1400ms) mỗi khi route đổi
- Login page dùng cùng component, mode `loop` — auto-cycle qua positions để demo animation khi chưa auth
- Support 11 routes (8 từ showcase + 3 extra: reports, profile, playground)
- Mapping derive từ `useLocation().pathname` first segment

### Non-Functional
- Token canon: `var(--brand-500)` cho orange, `--surface-elevated` cho white — không hex hardcode
- Suspense-friendly, không break SSR/CSR boundary (currently CSR only)
- File size: component < 200 LOC, positions.ts < 100 LOC
- A11y: `aria-label="SMIT OS"`, `role="img"` implicit qua svg

### Out of Scope
- Favicon động (deferred — value thấp, browser hỗ trợ hạn chế)
- Logo trong Header.tsx (chỉ Sidebar + Login)
- Theme variants (dark/light tile color đã cover qua CSS vars)

---

## Approaches Evaluated

### A1 — Restore HEAD + Extend (CHỌN)
**Approach:** `git checkout HEAD -- src/ui/components/layout/logo-mark/` rồi extend `positions.ts` thêm 3 routes, thêm `mode` prop, thêm pulse trigger.

| Pros | Cons |
|---|---|
| 3 commits iteration đã debug (initial=false, springs, tile classes) | Cần extend mapping cho 3 routes mới |
| Code proven, không reinvent | `mode='loop'` cần state machine nhỏ |
| Reuse `springs.glacial`, `motion/react` đã có deps | |

**Effort:** 2-3 giờ. Risk: low.

### A2 — Rewrite from scratch theo showcase v5 HTML
**Approach:** Drop HEAD code, port CSS transforms từ HTML thuần, dùng Framer Motion từ đầu.

| Pros | Cons |
|---|---|
| Sạch, không vướng legacy decisions | Mất 3 vòng debug đã làm (animation glitch, initial state) |
| | Effort gấp 2 vs A1 |
| | Không học từ commits trước |

**Verdict:** Reject. YAGNI violation — không có lý do drop proven code.

### A3 — CSS-only (no Framer Motion)
**Approach:** Dùng CSS transitions thuần, `data-route` attribute trên SVG root.

| Pros | Cons |
|---|---|
| Smaller bundle (~5KB) | Không kiểm soát spring physics |
| Không cần `motion` dep | Pulse animation qua keyframes — khó configurable |
| | Login `mode='loop'` cần JS anyway |
| | Mất signature smoothness của springs.glacial |

**Verdict:** Reject. Login loop cần JS, deps đã có `motion`. Không tiết kiệm gì rõ rệt.

---

## Final Recommendation

**A1 — Restore HEAD + Extend.**

### Architecture

```
src/ui/components/layout/logo-mark/
├── logo-mark.tsx          (restored + add mode prop + pulse trigger)
├── positions.ts           (extend 8 → 11 routes)
└── index.ts               (named export)

src/ui/hooks/
└── use-route-key.ts       (NEW — derive RouteKey từ useLocation, ~20 LOC)

EDIT:
├── src/components/layout/Sidebar.tsx     (replace <img>)
├── src/pages/LoginPage.tsx               (replace AnimatedLoginLogo inline)
└── src/index.css                         (verify logo-* classes intact)
```

### Component API
```tsx
type RouteKey =
  | 'dashboard' | 'okrs' | 'leads' | 'ads' | 'media'
  | 'daily-sync' | 'checkin' | 'settings'
  | 'reports' | 'profile' | 'playground';  // new

interface LogoMarkProps {
  mode?: 'route' | 'loop';        // default 'route'
  route?: RouteKey;                // required when mode='route'
  size?: number;                   // default 28
  pulseOnChange?: boolean;         // default true
  loopInterval?: number;           // default 2500ms, used in mode='loop'
  className?: string;
}
```

### Route Position Map (11 entries)
8 cặp giữ nguyên từ showcase v5. 3 cặp mới (chấp nhận visually close vài cặp — không cố force differentiation):
- `reports`: white(BR), orange(TL) — diagonal đảo dashboard
- `profile`: white(TR), orange(BL) — diagonal khác với leads
- `playground`: white(BL), orange(TR) — gương của leads

**Note:** 16 combos khả dĩ (4 pos × 4 pos − 4 same-pos), 11 routes vừa khít. Một số cặp visually gần nhau là chấp nhận được vì 3 route phụ ít visit hơn primary 8.

### Pulse Trigger
```tsx
const prevRoute = useRef(route);
useEffect(() => {
  if (mode === 'route' && pulseOnChange && prevRoute.current !== route) {
    setPulseKey(k => k + 1);  // re-mount class trigger
    prevRoute.current = route;
  }
}, [route, mode, pulseOnChange]);
// className={`logo-tile-orange ${pulseKey ? 'pulse' : ''}`}
```

CSS keyframe `pulseTwice` (1400ms) đã có sẵn trong showcase v5 — port vào `index.css` nếu chưa có.

### Loop Mode (Login)
```tsx
const [loopIdx, setLoopIdx] = useState(0);
const loopRoutes: RouteKey[] = ['dashboard', 'okrs', 'leads', 'ads', 'media', 'checkin'];
useEffect(() => {
  if (mode !== 'loop') return;
  const id = setInterval(() => setLoopIdx(i => (i + 1) % loopRoutes.length), loopInterval);
  return () => clearInterval(id);
}, [mode, loopInterval]);
// effective route = mode === 'loop' ? loopRoutes[loopIdx] : route
```

### Sidebar Integration
```tsx
// Sidebar.tsx:18 — replace
import { LogoMark } from '@/ui/components/layout/logo-mark';
import { useRouteKey } from '@/ui/hooks/use-route-key';
// ...
const routeKey = useRouteKey();
// <img src="/logo-icon.png" ... /> → <LogoMark route={routeKey} size={32} />
```

### useRouteKey Hook
```tsx
export function useRouteKey(): RouteKey {
  const { pathname } = useLocation();
  const seg = pathname.split('/')[1] || 'dashboard';
  // map redirect aliases: lead-tracker → leads, etc.
  const aliases: Record<string, RouteKey> = {
    'lead-tracker': 'leads', 'ads-tracker': 'ads', 'media-tracker': 'media',
    'integrations': 'settings',
  };
  return (aliases[seg] ?? seg) as RouteKey;
}
```

---

## Implementation Considerations

### Risks
| Risk | Mitigation |
|---|---|
| Restore `cn.ts` + `motion.ts` từ HEAD missing | Verify content trước khi restore, check imports |
| Pulse animation re-trigger khi same route navigate (e.g. clicking dashboard again) | Compare `prevRoute.current !== route` strict — skip if same |
| 11 routes map có cặp trùng vị trí | Lint check trong test/dev — Object.values uniqueness assert |
| Sidebar collapse state ảnh hưởng logo size | Pass size via prop, default 32 (collapsed) / 36 (expanded) — sau |
| Login auto-loop chạy ngầm khi user login xong → Sidebar mount → double animation | LogoMark unmount khi navigate, no shared state. OK |

### UI Contract Compliance (per `docs/ui-design-contract.md`)
- Token canon: orange tile dùng `var(--brand-500)`, white tile dùng theme-aware class — **không hex**
- No solid orange CTA — logo tile orange là data viz / signature, KHÔNG phải CTA → OK
- Radius: tile `rx="1.5"` (SVG units) → vẫn match canon (small element, không phải card)

### Performance
- LogoMark mount 1x per layout (Sidebar persistent qua route change)
- `motion.rect animate={x,y}` driven bởi Framer Motion's layoutEffect — không gây re-render parent
- Loop mode setInterval — cleanup trong useEffect

---

## Success Metrics

- [ ] Sidebar logo animate smooth khi click giữa 11 routes (visual check, no jank)
- [ ] Pulse orange tile 2x khi navigate (check trong DevTools animations panel)
- [ ] Login page logo auto-loop qua ≥6 positions
- [ ] Bundle delta < 2KB (LogoMark + hook + positions)
- [ ] `npm run build` pass, no TS errors
- [ ] `scripts/ui-canon-grep.cjs` pass — no hex orange leaked
- [ ] A11y: `aria-label="SMIT OS"` present, contrast OK trên dark sidebar

---

## Next Steps

1. Run `/ck:plan` để break thành phases:
   - **Phase 1:** Restore HEAD files + verify import paths
   - **Phase 2:** Extend positions.ts (11 routes) + add mode/pulse to component
   - **Phase 3:** Wire Sidebar + LoginPage + useRouteKey hook
   - **Phase 4:** Visual QA + ui-canon grep + build verify

2. Branch hiện tại `feat/v6-frontend-rebuild` đang clean enough để add — không cần worktree

3. Estimated total: 2-3 giờ (1 session)

---

## Open Questions

None — all clarified during brainstorm.
