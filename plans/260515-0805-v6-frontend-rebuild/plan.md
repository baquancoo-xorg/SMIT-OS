# Plan — SMIT OS v6 Frontend Rebuild

**Created:** 2026-05-15 08:05 ICT
**Budget:** 4+ tuần (solo dev + AI)
**Pattern:** Strangler fig — build `src/ui/` parallel với `src/components/v5/`, migrate từng route, xóa v5
**Source of truth:** `docs/v6/ADR-001-design-system.md` + `docs/v6/CLAUDE-CODE-BUILD-PROMPT.md`
**Brainstorm:** `plans/reports/brainstorm-260515-0805-v6-frontend-rebuild-decision.md`
**Branch:** `feat/v6-frontend-rebuild` (chưa tạo)

## Phases

| Phase | Status | Description | Gate criteria |
|---|---|---|---|
| [Phase 00 — Stage 0: Foundation](phase-00-stage-0-foundation.md) | pending | Setup tokens + 3 components (Button **7 variants**, LogoMark, KpiCard) + `/v6-storybook` route | Visual khớp showcase HTML; tsc pass; user explicit "continue" |
| [Phase 01 — Stage 1: Component library](phase-01-stage-1-component-library.md) | blocked-by-00 | Build **~63 components** (44 từ ADR + 14 từ screenshot audit + 5 variants) — primitives, data, overlays, forms, layout, charts, feedback | Tất cả components có showcase entry matching 8 reference screenshots; <200 lines mỗi file; lint gate active |
| [Phase 02 — Stage 2: Page migration](phase-02-stage-2-page-migration.md) | blocked-by-01 | Migrate 8 routes 1-by-1 + build **7 page composites** (ObjectiveCard, KeyResultRow, FunnelStepCard, AEWorkloadRow, DailyReportRow, CheckinRow, LeadTableRow) inline | Mỗi route smoke test pass; performance không regress |
| [Phase 03 — Stage 3: v5 + legacy cleanup](phase-03-stage-3-v5-cleanup.md) | blocked-by-02 | Delete `src/components/v5/` **+ all dead legacy dirs (~50-75 extra files)** + stale top-level pages, rename `src/ui/` → `src/components/`, final polish | 0 v5 import; dead-code audit pass; bundle audit; ship |

## Key dependencies

**Giữ nguyên (không đụng):**
- `src/hooks/`, `src/contexts/`, `src/lib/api.ts`
- React Query setup, React Router 7 routes
- Recharts wrappers (chỉ restyling tokens)
- Server-side (`server.ts`, `prisma/`, `routes/`)

**Thay thế hoàn toàn:**
- `src/components/v5/ui/*` (88 files)
- Layout shell, sidebar, header
- Toast, Modal, Form components
- Page templates (giữ data flow, đổi UI)

**Migration surface:** 125 import sites trỏ vào `v5/` cần codemod tại Stage 2.

**Screenshot audit additions (2026-05-15):**
- 14 components mới: StatusBadge, Pagination, ScrollArea, Accordion, Collapsible, FilterPopover, Calendar, DateRangePicker, PieChart/DonutChart, HeatmapChart (custom SVG), FunnelChart (composite), BarChart-stacked variant, NotificationBell, ThemeToggle, UserMenu/SidebarFooter
- 1 Button variant: `success` (green) cho OKR check-in
- 7 page composites (Phase 02): ObjectiveCard, KeyResultRow, FunnelStepCard, AEWorkloadRow, DailyReportRow, CheckinRow, LeadTableRow
- Outline orange = secondary CTA pattern (confirmed); primary-sheen reserved cho hero only

**Dead code cleanup scope (Phase 03 expanded — audit 2026-05-15):**
- `src/components/dashboard/` — 41 files, 0 external imports → likely DEAD
- `src/components/layout/` — 5 files, orphan
- `src/components/board/` — 1 file, orphan
- `src/components/{lead-tracker,ads-tracker,settings,checkin,okr,modals}/` — 28 files, dies after Phase 02 page migration
- `src/pages/v5/` — replaced by `src/pages/v6/` Phase 02 outputs
- `src/pages/{LoginPage,DailySync,WeeklyCheckin,OKRsManagement}.tsx` — top-level duplicates suspect stale, verify required
- **Total dead code potential: ~50-75 files ngoài v5/ (88 files), grand total ~140-160 files cleanup**

## Stage gate doctrine (cứng — không bypass)

Sau mỗi Phase, **STOP** + user explicit approve mới sang Phase tiếp theo. Tránh sunk cost trap nếu giữa chừng visual không đạt.

## Risks (top 3)

1. **Churn pattern (v3→v5→v6)** — Mitigated bằng stage gate cứng
2. **125 import sites migration** — Stage 2 phải có codemod strategy
3. **Solo dev capacity 4 tuần** — Stage gates = natural pause points

## Naming reality

Memory entry `project_ui_rebuild_v4_plan.md` claim "v4 SHIPPED" là **stale**. Thực tế:
- v5 = current production
- v4 = naming drift trong memory (no `/v4` route trong code)
- v6 = rebuild target (this plan)

Memory cleanup defer sau khi v6 stable.
