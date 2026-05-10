# Current Tokens Inventory

> Date: 2026-05-10 | Phase 2 input doc
> Source: `src/index.css` (255 LOC) + Phase 1 audit findings

## Approach

Tailwind v4 — no `tailwind.config.js`. All tokens defined via `@theme` directive trong `src/index.css`. CSS variables auto-generate Tailwind utilities.

## 1. Color tokens (Material Design 3 set, complete)

| Token | Value | Status |
|---|---|---|
| `--color-primary` | `#0059b6` | ✅ Brand |
| `--color-on-primary` | `#eff2ff` | ✅ |
| `--color-primary-container` | `#68a0ff` | ✅ |
| `--color-on-primary-container` | `#00224d` | ✅ |
| `--color-secondary` | `#a03a0f` | ✅ |
| `--color-on-secondary` | `#ffefeb` | ✅ |
| `--color-tertiary` | `#006b1f` | ✅ |
| `--color-surface*` family (5) | various | ✅ |
| `--color-outline`, `--color-outline-variant` | various | ✅ |
| `--color-error*` family (3) | various | ✅ |

**Missing:**
- `--color-success`, `--color-warning`, `--color-info` (semantic status)
- `--color-on-tertiary-container` exists but tertiary lacks `on-` family parity
- Department colors (5: BOD/Tech/Marketing/Media/Sale) hardcoded in `OKRsManagement.tsx` line 21-27, NOT tokens

**Drift in code:** 80+ `text-slate-*` instances competing với M3 tokens (Phase 1 finding).

## 2. Typography tokens (sparse)

| Token | Value |
|---|---|
| `--font-sans` | Inter |
| `--font-headline` | Manrope |

**Missing:** Type scale (xs/sm/base/lg/xl/2xl/3xl/4xl), line-height, letter-spacing tokens.
Code uses raw Tailwind classes (`text-4xl font-extrabold`) — no semantic typography tokens.

## 3. Spacing tokens (well-defined, ill-adopted)

| Token | Value |
|---|---|
| `--space-xs` | `clamp(0.25rem, 0.5vw, 0.5rem)` |
| `--space-sm` | `clamp(0.5rem, 1vw, 0.75rem)` |
| `--space-md` | `clamp(0.75rem, 1.5vw, 1rem)` |
| `--space-lg` | `clamp(1rem, 2vw, 1.5rem)` |
| `--space-xl` | `clamp(1.5rem, 3vw, 2rem)` |
| `--space-2xl` | `clamp(2rem, 4vw, 3rem)` |

**Issue:** Tokens are excellent (responsive clamp) but adoption only 5.5% (17 token usages vs 292 raw `p-N`).
**Phase 8 task:** codemod raw `p-4`/`p-6`/etc → `p-[var(--space-md)]`/`p-[var(--space-lg)]`.

## 4. Radius tokens (CONFLICT with style guide)

| Token | Value | Tailwind class |
|---|---|---|
| `--radius-DEFAULT` | 8px | `rounded` |
| `--radius-lg` | 12px | `rounded-lg` |
| `--radius-xl` | 16px | `rounded-xl` |
| `--radius-2xl` | 20px | `rounded-2xl` |
| `--radius-3xl` | 24px | `rounded-3xl` |
| `--radius-action` | 16px (semantic) | n/a |
| `--radius-container` | 20px (semantic) | n/a |

**Conflict:**
- Style guide says: card = `rounded-3xl` (24px)
- Token says: `--radius-container` = 20px = `rounded-2xl`
- Result: 91 `rounded-2xl` violations across codebase

**Fix:** Phase 2 - redefine semantic radii: `--radius-card: 24px`, drop `--radius-container`.

## 5. Breakpoint tokens (BROKEN)

| Token | Value | Tailwind default | Issue |
|---|---|---|---|
| `--breakpoint-xs` | 375px | (n/a) | Custom |
| `--breakpoint-sm` | 390px | 640px | ❌ Way smaller than default |
| `--breakpoint-md` | 430px | 768px | ❌ Way smaller — `md:` triggers on phone |
| `--breakpoint-tablet` | 768px | (n/a) | Custom, never used (0 occurrences) |
| `--breakpoint-lg` | 1024px | 1024px | ✅ |
| `--breakpoint-xl` | 1440px | 1280px | ❌ |
| `--breakpoint-2xl` | 1366px | 1536px | ❌ Less than xl (REVERSED) |
| `--breakpoint-3xl` | 1920px | (n/a) | Custom |
| `--breakpoint-4xl` | 2560px | (n/a) | Custom |

**Critical bugs:**
1. `md: 430px` < Tailwind default 768. Codebase has 140+ `md:` usages assuming tablet but firing on phone.
2. `xl 1440 > 2xl 1366` — `2xl:` would NEVER trigger because `xl:` already activated.
3. `tablet` defined but never used → dead token.

**Decision (user):** Drop custom, use Tailwind defaults: sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536. **Breaking change** — code with `md:` now gates at 768 instead of 430. Phase 8 visual smoke test will catch.

## 6. Layout tokens (good)

| Token | Value | Use |
|---|---|---|
| `--touch-min` | 44px | A11y touch target |
| `--touch-comfort` | 48px | Comfortable touch |
| `--card-min` / `--card-max` | 280-360px | Card width constraints |
| `--header-h` | 4rem (64px) | Header height |
| `--content-h` | `calc(100dvh - var(--header-h))` | Page height |
| `--content-px-{mobile,tablet,desktop}` | 1/2/2.5rem | Responsive padding |
| `--page-pt`, `--page-pb` | 2rem, 1.5rem | Page block spacing |

✅ Good. Keep mostly as-is.

## 7. Missing token categories

- ❌ **Shadow scale** — no `--shadow-*` tokens. Code uses Tailwind `shadow-sm`/`shadow-md`/`shadow-lg` raw.
- ❌ **Motion tokens** — no `--duration-*`, `--ease-*`. Code uses raw `transition-all duration-300`.
- ❌ **Z-index layers** — no semantic z tokens. Risk: modal vs toast vs tooltip stacking conflicts.
- ❌ **Status semantic colors** — no success/warning/info. Only error.
- ❌ **Department colors as tokens** — hardcoded hex in `OKRsManagement.tsx`.

## 8. Component-class shortcuts (defined in @layer components)

`src/index.css` defines:
- `.material-symbols-outlined` — Material icon font config
- `.glass-panel` — `bg-white/70 backdrop-blur-xl border border-white/20 shadow-sm`
- `.glass-card` — `bg-white/40 backdrop-blur-md border border-white/20 shadow-sm transition-all duration-300`
- `.glass-card:hover` — `bg-white/60 shadow-md`
- `.soft-gradient`, `.coral-gradient` — brand gradients

**Issue:** Glass styles in two places — `@layer components` AND inline class strings in pages (Phase 1 found 30 inline glass patterns). Codebase doesn't reference `.glass-card` shortcut consistently.

**Phase 2 decision:** Keep `.glass-panel`, `.glass-card` as canonical OR drop and rely on Tailwind utility composition? Recommend: keep + enforce usage via component primitive (Phase 4).

## 9. Department colors (extract from code)

| Dept | Current hex | Issue |
|---|---|---|
| BOD | `bg-primary/5` (#0059B6) | **Same as Tech** — visually indistinguishable |
| Tech | `#0059B6` | Brand primary |
| Marketing | `#F54A00` | Distinct |
| Media | `#E60076` | Distinct |
| Sale | `#009966` | Distinct |

**Phase 2 fix per user:** Refresh BOD to distinct color. Promote 5 dept colors to tokens.

## Summary table for Phase 2 work

| Layer | Status | Action |
|---|---|---|
| Brand colors (primary/secondary/tertiary) | ✅ | Keep |
| M3 surface family | ✅ | Keep |
| Status semantic (success/warning/info) | ❌ Missing | **ADD** |
| Department colors as tokens | ❌ Hardcoded | **ADD** + refresh BOD |
| Typography scale | ❌ Missing | **ADD** 8-step scale |
| Spacing | ✅ Defined, ❌ adopted | Keep tokens, adopt in Phase 8 codemod |
| Radius (semantic) | ⚠️ Conflict | **REDEFINE** semantic (`--radius-card: 24px`) |
| Breakpoints | 🔴 BROKEN | **REPLACE** with Tailwind defaults |
| Shadow scale | ❌ Missing | **ADD** 4-stop |
| Motion tokens | ❌ Missing | **ADD** duration + easing |
| Z-index | ❌ Missing | **ADD** 5-layer |
| Touch targets | ✅ | Keep |
| Layout helpers | ✅ | Keep |

## Unresolved questions (resolved by user 2026-05-10)

1. ✅ Color: M3 only (codemod slate → M3 in Phase 8)
2. ✅ Brand: Keep primary #0059b6 + secondary + tertiary
3. ✅ Breakpoints: Tailwind defaults (drop xs/tablet/3xl/4xl, fix xl/2xl reversed)
4. ✅ Department colors: Refresh + add status semantic
