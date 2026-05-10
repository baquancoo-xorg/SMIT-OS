---
title: "UI System Redesign — Full Rewrite 8 Pages from Scratch"
description: "Redesign toàn bộ 8 pages + design system mới. UX research → wireframe → mockup → implement. Replace OKRs as new source of truth."
status: in_progress
priority: P2
effort: 8-10w
branch: main
tags: [ui, ux, redesign, design-system, refactor, breaking-change]
created: 2026-05-10
---

# Plan: UI System Redesign

## Goal

**Redesign từ đầu toàn bộ 10 pages + ~84 components của SMIT-OS** (kể cả OKRs hiện tại) với UX research + design mockup trước khi code. Mục tiêu: tất cả pages đồng nhất design system mới + giải quyết UX pain points đã tích lũy. Sau plan này, design system mới sẽ là source of truth thay vì pattern OKRs cũ.

## Scope Inventory (audit 2026-05-10)

### 10 Pages

| # | Page | LOC | Tabs/Sub-pages | Note |
|---|---|---|---|---|
| 1 | LoginPage | 488 | 2-step 2FA | Auth flow |
| 2 | DashboardOverview | 132 | **5 tabs** (overview/sale/product/marketing/media) | Container, 38 sub-components |
| 3 | OKRsManagement | 1324 | L1/L2 tabs + Add Objective modal | Most complex |
| 4 | DailySync | 349 | List + form | Mobile critical (checkin) |
| 5 | WeeklyCheckin | 239 | Form + table | Mobile critical (checkin) |
| 6 | LeadTracker | 128 | **2 tabs** (Logs/Stats) + 2 modals | Sub-components |
| 7 | MediaTracker (NEW từ Acquisition) | ? | **3 tabs** (Owned/KOL/PR) + dialog | |
| 8 | AdsTracker (NEW từ Acquisition) | ? | **3 tabs** (Campaigns/Performance/Attribution) | |
| 9 | Settings | 153 | **5 sub-tabs** (xem dưới) | Complex permission |
| 10 | Profile | 72 | Simple | |

### Settings — 5 sub-tabs (THƯỜNG bị miss)

| Sub-tab | File | Access | Mục đích |
|---|---|---|---|
| Profile | `profile-tab.tsx` | All | Edit basic profile info, password, 2FA |
| Users | `user-management-tab.tsx` | Admin | CRUD users, role assign |
| OKR Cycles | `okr-cycles-tab.tsx` | Admin | Quarter setup, cycle config |
| FB Config | `fb-config-tab.tsx` | Admin | Meta Ads token config (CRITICAL cho Acquisition) |
| Sheets Export | `sheets-export-tab.tsx` | Admin | Google Sheets export config |

### 5 Layout Components

| File | Mục đích |
|---|---|
| AppLayout.tsx | Wrapper toàn app |
| Header.tsx | Top bar: logo, breadcrumb, notification, user menu |
| Sidebar.tsx | Navigation chính |
| NotificationCenter.tsx | Panel notification slide-in |
| **OkrCycleCountdown.tsx** | Countdown widget Q2/Q3 deadline (header element) |

### 5 Modals/Dialogs

1. `lead-tracker/lead-log-dialog.tsx` — Log activity cho lead
2. `lead-tracker/lead-detail-modal.tsx` — Lead detail view
3. `modals/WeeklyCheckinModal.tsx` — Weekly checkin form
4. `media-tracker/media-post-dialog.tsx` — KOL/PR/Owned post entry
5. AddObjectiveModal — inline trong OKRsManagement.tsx (cần extract Phase 4)

### Component Library Inventory (84 files trong src/components)

| Dir | Files | Mục đích |
|---|---|---|
| dashboard/ | 38 | 5 tab subs + acquisition-overview + marketing + media + product (8) + lead-distribution + call-performance + overview + ui |
| ui/ | 15 | Atom primitives (Button, Card, Input, ErrorBoundary, etc.) |
| lead-tracker/ | 10 | logs-tab, daily-stats-tab, log-dialog, detail-modal, csv-export, source-badge, sync-from-crm-button, etc. |
| settings/ | 6 | 5 sub-tabs + settings-tabs (nav) |
| layout/ | 5 | (xem trên) |
| media-tracker/ | 3 | post-dialog + sub-components |
| ads-tracker/ | 3 | sub-components |
| checkin/ | 2 | weekly-checkin sub-components |
| modals/ | 1 | WeeklyCheckinModal |
| board/ | 1 | ReportTableView (used by WeeklyCheckin) |

### Misc states cần redesign

- **ErrorBoundary** (`ui/ErrorBoundary.tsx`) — generic error fallback
- **404 page** (currently redirect /dashboard) — DECISION: tạo dedicated 404 hay giữ redirect?
- **Loading skeletons** — pattern cho mọi page
- **Empty states** — pattern reusable

## Why

- **Drift cực nặng**: chỉ 1/8 pages có Bento decorative blob (signature element); 89 chỗ `rounded-2xl` (sai) > 17 chỗ glass card pattern (đúng); 6/8 pages thiếu page header italic accent
- **OKRs hiện tại là source of truth tạm thời** nhưng cũng có UX issue chưa được audit
- **Style guide** hiện tại (`docs/ui-style-guide.md`) chỉ extract pattern OKRs — chưa pass UX validation
- Build pages mới (Acquisition Media/Ads) trên codebase đang drift = càng tăng technical debt

## Context

- UI Style Guide hiện tại: [`docs/ui-style-guide.md`](../../docs/ui-style-guide.md) (deprecate sau plan này)
- System architecture: [`docs/system-architecture.md`](../../docs/system-architecture.md)
- 10 pages cần redesign: Dashboard, OKRs, DailySync, WeeklyCheckin, LeadTracker, MediaTracker, AdsTracker, Settings, Profile, LoginPage
- 5 Layout components: AppLayout, Header, Sidebar, NotificationCenter, OkrCycleCountdown
- 5 Modals + 5 Settings sub-tabs (xem Scope Inventory trên)
- 84 component files trong src/components/

## Dependencies & Parallel work

| Plan | Relationship |
|---|---|
| [`260510-0318-role-simplification`](../260510-0318-role-simplification/plan.md) | **Parallel** — không block lẫn nhau. UI redesign sẽ touch lại RBAC gates đã refactor (small merge conflict) |
| [`260510-0237-acquisition-trackers`](../260510-0237-acquisition-trackers/plan.md) | **Parallel** — Acquisition pages mới (Media/Ads) reference style guide hiện tại trong khi UI redesign chạy. Sau khi UI redesign ship → Acquisition pages refactor theo design system mới (small follow-up) |

## Phase 1 Outcomes

**Completed 2026-05-10 by `/ck:cook` (4 parallel researchers + synthesis).**

14 audit reports generated:
- 10 page-specific audits (Dashboard, OKRs, DailySync, WeeklyCheckin, LeadTracker, MediaTracker, AdsTracker, Settings, Profile, LoginPage)
- Layout + cross-page drift + heuristic eval + final Top 10 insights
- **Input for Phase 2:** `reports/ux-audit-summary-top10.md`

**Key metrics:**
- **91 `rounded-2xl` violations** (wrong) vs 69 `rounded-3xl` (correct) — spacing token adoption only 5.5% (17/309)
- **30 glass cards** out of expected 80+ → 62.5% gap
- **4 page header variants** in production (should be 1)
- **39 card pattern variants** → drift sprawl
- **13 critical Nielsen heuristic violations** — visibility, error prevention, recovery
- **7 decorative blob instances** across 10 pages (signature underutilized)

See [`reports/ux-audit-summary-top10.md`](./reports/ux-audit-summary-top10.md) for actionable breakdown + Phase 2 priorities.

## Phase 2 Outcomes

**Completed 2026-05-10 by `/ck:cook` session 17:19.**

Full design system foundation shipped: tokens + color + typography + semantic spacing + motion + accessibility rules.

**Deliverables:**
1. `src/index.css` — full rewrite, 70+ design tokens (color/typography/spacing/radius/shadow/motion/z-index)
2. `docs/design-tokens-spec.md` — comprehensive token reference (source of truth)
3. `docs/design-system-foundation.md` — usage rules, a11y, motion, implementation checklist
4. `reports/current-tokens-inventory.md` — Phase 2 audit baseline

**Key changes:**
- **Color system:** M3 brand colors kept (primary #0059b6, secondary #a03a0f, tertiary #006b1f), NEW status semantic colors (success/warning/error/info with `-container` + `on-` variants, 4 sets = 16 tokens), department colors promoted to CSS vars (BOD refreshed violet #6e47ff)
- **Typography:** 12-token scale (caption → display) with leading + tracking defined
- **Semantic spacing:** clamp-based responsive scale (sm/base/md/lg/xl/2xl/3xl)
- **Radius tokens:** button/chip/input/card/modal semantic names (vs generic rounded-2xl)
- **Breakpoints:** Tailwind defaults restored (fixed reversed xl/2xl) — **BREAKING CHANGE**: md=768/lg=1024/xl=1280/2xl=1536
- **Shadows:** 7-stop scale (subtle → dramatic)
- **Motion:** 5 durations (instant/fast/base/slow/slower), 4 easings (standard/decel/accel/sharp)
- **A11y:** Global focus-visible ring spec, prefers-reduced-motion handler
- **Z-index:** 8 semantic layers (dropdown/sticky/fixed/backdrop/modal/tooltip/notification/max)

**Metrics:**
- **70+ tokens** designed + documented
- **2 breaking changes:** breakpoint values, dept colors now semantic
- **3 files updated:** src/index.css (full rewrite), 2 docs new
- **Compile:** `npx vite build` ✓ clean (2.18s)

See [`reports/current-tokens-inventory.md`](./reports/current-tokens-inventory.md) for baseline audit.

## Phases

| # | Phase | Effort | Status | File |
|---|---|---|---|---|
| 1 | UX Audit & Research | 1w | **completed** (2026-05-10) | [phase-01-ux-audit-research.md](./phase-01-ux-audit-research.md) |
| 2 | Design System Foundation (tokens + color + typography) | 1-1.5w | **completed** (2026-05-10) | [phase-02-design-system-foundation.md](./phase-02-design-system-foundation.md) |
| 3 | Wireframe + Hi-fi Mockup (Figma) | 1.5-2w | pending | [phase-03-wireframe-mockup.md](./phase-03-wireframe-mockup.md) |
| 4 | Component Library Implementation | 1-1.5w | pending | [phase-04-component-library.md](./phase-04-component-library.md) |
| 5 | Pages Redesign — Auth/Profile/Settings (5 sub-tabs) | 1.5w | pending | [phase-05-pages-small.md](./phase-05-pages-small.md) |
| 6 | Pages Redesign — DailySync/WeeklyCheckin/LeadTracker/MediaTracker/AdsTracker | 2.5-3w | pending | [phase-06-pages-medium.md](./phase-06-pages-medium.md) |
| 7 | Pages Redesign — Dashboard/OKRs (hardest, most LOC) | 1.5-2w | pending | [phase-07-pages-large.md](./phase-07-pages-large.md) |
| 8 | Polish + Migration + Documentation | 5-7d | pending | [phase-08-polish-migration.md](./phase-08-polish-migration.md) |

**Total: 8-10 tuần** (mở rộng từ 7-9 tuần do scope thực tế lớn hơn audit ban đầu: +2 pages Acquisition, +5 Settings sub-tabs, +OkrCycleCountdown, +error states).

## Critical Path

```
Tuần 1     [Phase 1: UX Audit & Research]
Tuần 2     [Phase 2: Design System Foundation]
Tuần 3-4   [Phase 3: Wireframe + Hi-fi Mockup]
Tuần 5     [Phase 4: Component Library]
Tuần 6     [Phase 5: Small pages (Auth + Profile + Settings)]
Tuần 7-8   [Phase 6: Medium pages (DailySync + Checkin + LeadTracker)]
Tuần 8-9   [Phase 7: Large pages (Dashboard + OKRs)]
Tuần 9     [Phase 8: Polish + Migration + Doc]
```

⚠️ **Phase 1-3 là design phase** (KHÔNG code) — phải có sign-off mockup từ user trước Phase 4. Đây là rủi ro lớn nhất: nếu mockup không pass → quay lại Phase 3.

## Key Decisions (chốt từ user)

1. ✅ **Scope**: Redesign từ đầu tất cả 8 pages (kể cả OKRs)
2. ✅ **Plan structure**: Tách riêng (KHÔNG ghép role-simp)
3. ✅ **Parallel với Acquisition**: Acquisition tiếp tục build, sau ship sẽ refactor theo design mới
4. ✅ **Source of truth**: Sau plan ship → design system mới deprecate `docs/ui-style-guide.md` (rewrite)

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Mockup không pass user → quay lại Phase 3 | 🔴 High | Phase 1 UX research kỹ. Phase 3 ship mockup theo batch (5 pages × 2 lần review). User sign-off bằng văn bản trước Phase 4 |
| Component library thiết kế thiếu → page redesign block | 🔴 High | Phase 4 audit lại tất cả mockup, list mọi component cần, build trước khi vào Phase 5+ |
| Regression rộng (8 pages × all sub-components) | 🔴 High | Page-by-page ship, không big bang. Test theo persona Admin/Member sau mỗi page |
| Conflict với role-simp plan parallel | 🟡 Medium | Phase 1 audit current code → coordinate với role-simp owner trước khi code |
| Acquisition pages mới (Media/Ads) drift sau khi UI redesign ship | 🟡 Medium | Sau Phase 8, follow-up issue: refactor Media/Ads pages theo design mới |
| Effort blow-up vượt 9w | 🟡 Medium | Cap mỗi phase + checkpoint cuối phase. Nếu vượt 20% → re-scope với user |
| User feedback thay đổi mockup giữa chừng | 🟡 Medium | Phase 3 ship mockup theo batch, lock-in từng batch trước khi vào next |
| Existing test suite (nếu có) break | 🟡 Medium | Phase 8 update test snapshots, manual smoke test |
| Mobile responsive bị bỏ quên | 🟢 Low | Mobile-first trong design phase, test ≥ 375px sau mỗi page |

## Tooling needed

- **Figma** (hoặc tương đương) — Phase 3 mockup
- **`ui-ux-pro-max` skill** — design intelligence support (50+ styles, 161 palettes, 99 UX guidelines)
- **`design` skill** — design tokens, brand identity refresh
- **`web-testing` skill** — visual regression Phase 8
- **Browser DevTools** — UX research recording, heuristic eval
- **PostHog session replay** (đã có) — observe real user behavior

## Success Metrics

- [ ] **Phase 1**: UX audit doc với ≥ 10 actionable pain points + heatmap recordings
- [ ] **Phase 3**: Mockup 8 pages sign-off bởi user (văn bản)
- [ ] **Phase 4**: Component library ≥ 15 reusable components, Storybook hoặc demo page
- [ ] **Phase 5-7**: Mỗi page redesigned pass:
  - Visual khớp mockup (≥ 95% pixel match)
  - Pre-merge UI checklist mới (sẽ document trong Phase 2)
  - 4 persona test (Admin + Member, Desktop + Mobile)
  - Lighthouse Performance ≥ 85, Accessibility ≥ 90
- [ ] **Phase 8**: Old `ui-style-guide.md` deprecated, mới ship cùng plan
- [ ] **Cuối plan**: 0 drift, 100% pages dùng component library mới

## Resolved Decisions (từ user 2026-05-10)

1. ✅ **Design tool**: **Google Stitch (AI Design)** — KHÔNG dùng Figma/Penpot. Skill `stitch` đã có sẵn trong toolkit
2. ✅ **UX research**: KHÔNG phỏng vấn user. Chỉ heuristic eval + PostHog session replay
3. ✅ **Responsive priority**: **Desktop-first** nhưng MUST optimize cả Tablet + Mobile
   - **Mobile** = nhân sự checkin (DailySync, WeeklyCheckin) → mobile UX critical cho 2 page này
   - **Tablet** = Admin thường dùng → tablet UX critical cho Dashboard, Settings, OKRs
   - **Desktop** = primary
4. ✅ **Animation**: Giữ `motion/react` v11
5. ✅ **Brand refresh**: KHÔNG đổi brand colors / logo
6. ✅ **Test suite**: KHÔNG có visual regression hiện tại → Phase 8 manual smoke test only (defer Playwright snapshots)
7. ✅ **Phase 4 demo**: **Storybook setup mới**
8. ✅ **OKRs feature parity**: 100% giữ (KR drag-drop, dept color, accordion, all features)

## Implication của decisions

- **Phase 3 mockup** dùng Google Stitch → AI generates HTML/CSS/Tailwind output thay vì Figma file. Workflow: prompt-driven, lưu output vào reports
- **Tablet breakpoint** cần emphasize trong Phase 2 design tokens (`md:` breakpoint ≥ 768px) — KHÔNG được skip
- **Mobile checkin pages** (Phase 6 DailySync + WeeklyCheckin) cần extra mobile UX attention
- **Storybook setup** thêm ~0.5d Phase 4 (vs simple demo page)

## Updated Open Questions

(Không còn unresolved — tất cả 8 đã answer)
