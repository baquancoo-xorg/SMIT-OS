# Cross-Page Consistency Audit (Drift Inventory)

> Date: 2026-05-10 | Phase 1 deliverable | Static code audit
> Scope: 10 pages + 5 layout components + 84 sub-components

## Methodology

Pure static code audit (no browser, no PostHog replay this round). Counts via `grep -rn` across `src/`. Each metric đối chiếu với `docs/ui-style-guide.md` (current source of truth = OKRs page pattern).

## Headline numbers

| Metric | Count | Verdict |
|---|---|---|
| `rounded-2xl` (WRONG) | **91** | 🔴 Drift dominant |
| `rounded-3xl` (CORRECT per style guide) | **69** | 🟡 |
| Glass card pattern (`white/50` + `backdrop-blur`) | **30** | 🔴 Should be ~80+ if consistent |
| Decorative blob (signature `bg-primary/5 rounded-full`) | **7** | 🔴 Only 7 instances across 10 pages |
| Italic page header (`text-primary italic`) | **11** | 🟡 ~match (10 pages × 1 header) but inconsistent placement |
| Raw spacing (`p-4`/`p-6` etc) | **292** | 🔴 Token system collapsed |
| `var(--space-*)` token usage | **17** | 🔴 Only 5.5% adoption |

## 1. Page header pattern (4 variants in production)

| Variant | Pages | Pattern | Compliance |
|---|---|---|---|
| **Canonical** (style guide) | LeadTracker, AdsTracker, MediaTracker, Settings, OKRs L1 | `text-4xl font-extrabold font-headline tracking-tight text-on-surface` + italic split | ✅ 5 pages |
| Profile variant | Profile.tsx | Same font but **no italic split** ("Edit Profile" plain) | 🟡 minor drift |
| **Mid-size variant** | DailySync, OKRs L2 detail, WeeklyCheckin | `text-2xl font-black text-slate-800` (color drift, no italic) | 🔴 |
| Login variant | LoginPage | `text-2xl font-bold text-slate-900` | 🔴 (acceptable for auth context) |

**Verdict:** 4 different page header rules in production. 50% pages off-spec.

**Fix:** Normalize 8 in-app pages to canonical. LoginPage có thể giữ riêng (auth context).

## 2. Card pattern (39 variants found)

```
grep "rounded-(2|3)xl shadow|rounded-xl bg-white" → 39 results
```

Variants exist:
- Glass card canonical: `bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-sm` (30 instances)
- Solid white card: `bg-white rounded-3xl shadow-sm` (~9)
- Wrong-radius card: `rounded-2xl shadow-sm` patterns (~91 instances of `rounded-2xl`, scattered in stat cards, modals, tables)
- Slate-50 card: `bg-slate-50 rounded-xl` (Profile, Sidebar user card)

**Verdict:** Container pattern nuked. Need ONE canonical Card primitive (variants: glass / solid / muted).

## 3. Spacing token adoption (5.5%)

| Style | Count | % |
|---|---|---|
| Raw Tailwind `p-4`/`p-6`/`px-4` etc | 292 | 94.5% |
| Token `var(--space-sm)`, `var(--space-md)`, `var(--space-lg)` | 17 | 5.5% |

**Verdict:** Token system tồn tại chỉ trên giấy. 94.5% code dùng raw values → impossible to globally tune spacing.

**Fix:** Phase 2 design system — define `--space-{xs,sm,md,lg,xl}` tokens và apply codemod.

## 4. Typography drift (`text-[9px]` vs `text-[10px]`)

```
text-[9px]:  scattered in LeadTracker tab pills (2), badges
text-[10px]: dominant in OKRs (32), stat labels
text-[11px]: appears in DatePicker (5), Input (3)
text-[12px]: scattered in user-management (10), source-badge (2)
```

**Verdict:** Style guide nói `text-[10px] font-black uppercase tracking-widest` cho stat label. Drift có 4 sizes (9-12px) cùng vai trò.

**Fix:** Define typography scale (Phase 2): `--label-xs (10px) / --label-sm (12px) / --body / --heading-{1,2,3}`.

## 5. Decorative blob signature element (only 7 instances)

```
grep "bg-primary/5 rounded-full" → 7 matches
```

Style guide nói: **mọi bento metric card phải có decorative blob** để tạo signature feel. Audit shows only 7 in entire codebase → ~5% adoption.

**Verdict:** Signature element ko apply systematic → app feels "generic" trên 8/10 pages.

**Fix:** Phase 4 component library — `<BentoMetricCard>` với blob built-in, replace ad-hoc cards.

## 6. Button variants

Style guide nói button radius `rounded-full` cho action button. Found:
- `rounded-full` action buttons: ~30
- `rounded-xl` action buttons: ~15 (Header menu, Profile save, Login submit)
- `rounded-2xl` action buttons: ~7

**Verdict:** 3 radius variants cho buttons. No primitive enforcement.

**Fix:** Phase 4 — `<Button variant="primary|secondary|ghost" size="sm|md|lg">` với radius locked.

## 7. Color tokens vs hardcoded slate

Material Design 3 tokens (`primary`, `on-surface`, `outline-variant` etc) defined in `index.css`. Drift count:
- `text-slate-{400,500,600,800}`: 80+ instances
- `bg-slate-{50,100,200}`: 60+ instances
- Theme tokens (`text-on-surface*`, `bg-surface*`): 40+ instances

**Verdict:** Slate ladder competes with M3 token ladder. Mixed usage.

**Fix:** Phase 2 — pick ONE color system. Recommend keeping M3 tokens, codemod slate → tokens.

## 8. Border radius scale chaos

`index.css` defines:
```css
--radius-DEFAULT: 0.5rem;   /* 8px */
--radius-lg: 0.75rem;     /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-2xl: 1.25rem;    /* 20px */
--radius-3xl: 1.5rem;     /* 24px */
--radius-action: 1rem;      /* 16px */
--radius-container: 1.25rem; /* 20px */
```

Mâu thuẫn:
- `--radius-container = 1.25rem (20px)` = `rounded-2xl`
- Style guide nói card phải `rounded-3xl` (24px)
- Token nói container = 20px nhưng style guide nói container = 24px

**Verdict:** Token system vs style guide CONFLICT. Token underdefined, no `card`/`modal`/`bento` semantic radii.

**Fix:** Phase 2 — define semantic radii: `--radius-bento (24px)`, `--radius-modal (24px)`, `--radius-button (full)`, `--radius-input (16px)`. Single source.

## 9. Breakpoint config bug

`index.css`:
```
--breakpoint-xl: 1440px;
--breakpoint-2xl: 1366px;   /* ← XL > 2XL is REVERSED */
```

**Verdict:** XL > 2XL breakpoint values reversed. Causes Tailwind responsive classes to behave unexpectedly. Likely undetected because `xl:` prefix used more than `2xl:`.

**Fix:** Phase 2 — fix to canonical: `xl: 1280px, 2xl: 1536px, 3xl: 1920px, 4xl: 2560px` OR audit usage and re-decide.

## 10. Mobile/Tablet/Desktop coverage

Sample `md:` (≥768) and `xl:` (current 1440) usage:
- `md:` count: ~140
- `xl:` count: ~80
- `tablet:` count: 0 (defined `--breakpoint-tablet: 768px` but unused)

**Verdict:** Tablet breakpoint defined but never used. `md:` covers tablet by default — fine, but inconsistent semantic naming.

**Fix:** Phase 2 — drop unused custom `tablet` breakpoint OR commit to using it. KISS: use Tailwind defaults.

## Summary table

| Layer | Drift severity | Fix priority |
|---|---|---|
| Spacing tokens (5.5% adoption) | 🔴🔴🔴 Critical | P0 — Phase 2 |
| Card pattern (39 variants) | 🔴🔴 High | P0 — Phase 4 primitive |
| Page header (4 variants) | 🔴🔴 High | P0 — Phase 4 layout |
| Border radius scale conflict | 🔴 High | P0 — Phase 2 token redefine |
| Decorative blob signature absent | 🔴 High | P1 — Phase 4 BentoCard |
| Typography drift (4 sizes for label) | 🟡 Medium | P1 — Phase 2 |
| Color token vs slate mix | 🟡 Medium | P1 — Phase 2 |
| Button radius drift | 🟡 Medium | P1 — Phase 4 |
| Breakpoint xl/2xl reversed | 🟢 Low (latent bug) | P2 — Phase 2 |
| Tablet breakpoint unused | 🟢 Low | P2 — Phase 2 cleanup |

## Unresolved questions

1. Token vs Tailwind utility — keep both? Tokens for spacing/color/radius, utilities cho layout?
2. M3 color tokens vs slate ladder — full migrate hay co-exist?
3. Custom breakpoints vs Tailwind defaults — KISS hay flexibility?
4. Page header italic split required everywhere hay opt-in (LoginPage skip OK?)
5. Shall we deprecate `--radius-{xl,2xl,3xl}` and only keep semantic (`--radius-bento`, `--radius-button`)?

## Conclusion

**Drift is systemic, not cosmetic.** Token adoption ở 5.5% → mỗi page tự reinvent. Phase 2 (Design Token Foundation) là ROI cao nhất: define tokens → codemod existing → enforce via lint.

OKRs page tồn tại pattern đúng nhưng KHÔNG có cơ chế enforce → các pages khác build sau drift đơn vị. Cần component primitives (Phase 4) + lint rules (Phase 8) để prevent future drift.
