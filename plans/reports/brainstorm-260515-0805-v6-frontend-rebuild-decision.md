# Brainstorm — SMIT OS v6 Frontend Rebuild Decision

**Date:** 2026-05-15 08:05 ICT
**Author:** Dominium + Claude (brainstorm session)
**Scope:** Decide approach + risk-frame trước khi execute `docs/v6/CLAUDE-CODE-BUILD-PROMPT.md`
**Status:** Decision finalized — awaiting plan dir creation + TASK 1 approval

---

## 1. Problem statement

User muốn rebuild UI layer SMIT OS từ v5 (custom UI lib 88 files, 125 import sites) sang v6 (shadcn/ui + motion v12 + token system OKLCH) theo build prompt + ADR-001 (43KB) viết lúc 04:04 sáng 2026-05-15.

Brainstorm bắt buộc vì:
- ADR + build prompt vừa viết trong đêm, chưa peer review
- v5 vẫn đang được polish active (6 commit cuối May 14-15 = polish v5 in-place)
- Memory entry "v4 SHIPPED" với `/v4/dashboard` route — **không tồn tại trong code**, là naming drift
- Solo dev + AI, 88 components rebuild = major commitment

## 2. Evaluated approaches

### Option A — In-place refactor v5 (Đề xuất ban đầu)
- Áp token system + 5 golden rules + motion vào v5 hiện tại qua 4-5 PR
- ~1 tuần, không churn, v5 ship liên tục
- **Pros:** Minimal risk, preserve 125 import sites, polish work không bị throw away
- **Cons:** v5 có "ui-canon-ok" annotations rải rác cho font-black, glass-morphism — clean-up nửa vời có thể không đạt "Linear/Vercel/Stripe feel" mà ADR hướng tới
- **Đánh giá:** Đúng cho user muốn tránh churn; nhưng compromise visual ambition

### Option B — Full v6 rebuild theo build prompt ✅ **CHỌN**
- Strangler fig: build `src/ui/` song song, migrate route từng cái, xóa v5
- ~2-4 tuần (user accept 4+)
- **Pros:** Clean slate, đạt full visual ambition, file <200 lines convention enforced từ đầu, type-safe component contracts
- **Cons:** v5 freeze polish; risk migration regression cho 125 import sites; solo dev capacity bottleneck

### Option C — Hybrid (Stage 0 → đánh giá)
- Foundation only (tokens + Button + LogoMark + KpiCard), sau đó pause
- **Pros:** Low commitment, easy off-ramp
- **Cons:** Có thể stuck giữa 2 hệ thống nếu user không quyết tiếp

## 3. Quyết định cuối

**Option B (Full v6 rebuild) — budget 4+ tuần, full pages migration + v5 cleanup**

Rationale:
- User accept opportunity cost (v5 polish freeze) để đạt visual quality ambition
- 4-tuần budget realistic cho solo dev + AI với scope 30+ components + 9 pages
- ADR đã chốt design philosophy, không cần re-debate token/motion choices

## 4. Risks identified + mitigation

| Risk | Severity | Mitigation |
|---|---|---|
| Churn pattern lặp lại (v3→v5→v6) | High | **Stage gate cứng:** Sau mỗi Stage, STOP + user explicit approve. Không auto-progress. |
| v5 production regression khi migrate | Medium | Strangler fig đúng pattern. Không xóa v5 đến Stage 3. Mỗi route migrate xong → smoke test trước khi gỡ v5 import. |
| Solo dev burnout 4 tuần | Medium | Stage gate = natural break points. Sau Stage 0 (~1 tuần) có thể pause → đánh giá. |
| Dependency bloat (10+ packages mới) | Low | Audit từng package, chỉ install khi component thực sự cần. cmdk/embla/lenis có thể defer. |
| 125 import sites migration | High | Codemod approach (cần plan riêng). Không hand-migrate từng file. |
| Memory entry stale → confusion | Low | Update memory: "v4 = naming drift, v5 = production, v6 = rebuild target" |
| `font-black` "ui-canon-ok" annotations | Low | v6 lint gate cấm 3 weight (black/extrabold/bold) — đã có trong build prompt rule 4 |
| Plan dir chưa tồn tại | Low | Tạo `plans/260515-0805-v6-frontend-rebuild/` theo naming convention |

## 5. Stage gates (cứng, không bypass)

| Stage | Deliverable | Gate criteria |
|---|---|---|
| **Stage 0** (Task 1-6) | Foundation + 3 components + `/v6-storybook` route | Visual khớp showcase HTML; theme toggle work; logo animation 8 routes; pnpm tsc pass; user explicit "continue" |
| **Stage 1** | Full component library (30+ primitives + composites) | Tất cả components có showcase entry; type-safe; <200 lines mỗi file; lint gate active |
| **Stage 2** | Page migration (8 routes 1-by-1) | Mỗi route migrate xong = smoke test pass; v5 import dropped cho route đó |
| **Stage 3** | v5 cleanup + final polish | 0 v5 import; bundle size check; performance audit; ship |

**Gate cứng:** Sau Stage 0, nếu user thấy visual không đạt → có thể abort, không phải sunk cost trap.

## 6. Items giữ nguyên (không đụng — đã confirm trong ADR)

- `src/hooks/` (business logic)
- `src/contexts/` (Auth, Theme, Density)
- `src/lib/api.ts`, types
- React Query setup, React Router 7 routes
- Recharts wrappers (chỉ restyling tokens, không rewrite)
- Server-side code (`server.ts`, `prisma/`, `routes/`)

## 7. Naming correction (memory cleanup)

Memory entry `project_ui_rebuild_v4_plan.md` nói "v4 SHIPPED 2026-05-12 → `/v4/dashboard`" là **stale/incorrect**:
- `main.tsx` chỉ render `<App />`, không có `/v4` route
- Codebase chỉ có `src/components/v5/`, không có `v4/`
- "v4" trong memory thực ra là v5 rebuild plan (renamed during execution)

Action: Update memory để `v5 = current production`, `v6 = rebuild target`.

## 8. Acceptance criteria (Stage 0 session)

Per build prompt SUCCESS CRITERIA:
- [ ] Branch `feat/v6-frontend-rebuild` created
- [ ] Plan dir `plans/260515-0805-v6-frontend-rebuild/` created với phase files
- [ ] Stage 0 deps installed
- [ ] `components.json` configured
- [ ] `src/ui/` structure exists
- [ ] `src/ui/lib/{cn,motion,match-route}.ts` exist
- [ ] `src/index.css` updated, old version backed up
- [ ] Button (6 variants) + LogoMark (8 routes) + KpiCard (standard + featured) work at `/v6-storybook`
- [ ] Dev server runs without error
- [ ] `pnpm tsc --noEmit` passes
- [ ] User explicit approval để continue Stage 1

## 9. Next steps (dependencies)

1. **Approval:** User confirm "go" → tôi proceed TASK 1 (validate prereqs)
2. **Plan dir creation:** Tạo `plans/260515-0805-v6-frontend-rebuild/` với phase files (1 file per stage)
3. **Memory update:** Correct `project_ui_rebuild_v4_plan.md` → reflect v5-as-production reality
4. **Branch creation:** `git checkout -b feat/v6-frontend-rebuild` sau khi handle 2 untracked items (`.claude/chrome-devtools/screenshots/ads-page.png`, `docs/v6/`)
5. **Execute Stage 0** theo build prompt TASK 1→6

## 10. Unresolved questions

- Package manager confirm: build prompt assume pnpm/npm/yarn — repo có `package-lock.json` hay `pnpm-lock.yaml`? (TASK 1 sẽ verify)
- v5 components nào high-risk khi migrate (data tables, complex forms)? — Stage 1 plan sẽ xác định priority order
- Codemod strategy cho 125 import sites: jscodeshift vs manual sed vs claude AI batch? — quyết tại Stage 2 entry
- Showcase HTML v3/v4/v5 hiện tại visual quality như nào (chưa mở browser xem)? — sẽ check trước khi build Button component
