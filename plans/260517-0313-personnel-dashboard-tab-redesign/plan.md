# Personnel Dashboard Tab Redesign

**Goal:** Biến tab Personnel trong Executive Dashboard từ duplicate của trang Personnel thành **Team Pulse view** trả lời câu hỏi điều hành — không phải tra cứu cá nhân.

**Status:** Draft — chờ user approve

**Branch:** main → feat/personnel-dashboard-pulse (worktree khuyến nghị)

---

## Why

- Hiện tab render `PersonnelGrid` y hệt `/personnel` → zero giá trị Executive
- User cần answer: team đang khoẻ/yếu chỗ nào, ai cần attention NGAY, skill tiến/lùi quý
- Jira đã removed (commit f82a1a0) → bỏ task integration; dùng SMIT-OS internal data only
- Quarter cutoff: tuỳ chỉnh (user-configurable, không hard-code calendar)

---

## Phases

| Phase | Focus | File ownership | Status |
|---|---|---|---|
| **01** | [Quarter config + API foundation](phase-01-quarter-config-api.md) | `server/lib/quarter-config.ts`, `server/routes/personnel/dashboard.routes.ts`, schema | pending |
| **02** | [Team Pulse strip](phase-02-team-pulse-strip.md) — KPI cards + QoQ delta | `src/components/features/dashboard/personnel/team-pulse-strip.tsx` | pending |
| **03** | [Skill Movement section](phase-03-skill-movement.md) — radar overlay 3 quý + top movers | `src/components/features/dashboard/personnel/skill-movement.tsx` | pending |
| **04** | [Attention Inbox](phase-04-attention-inbox.md) — feed sự kiện cần action | `src/components/features/dashboard/personnel/attention-inbox.tsx` | pending |
| **05** | [Tab composition + threshold recalibration](phase-05-tab-compose.md) — rewrite `personnel-dashboard-tab.tsx`, fix needs_attention 7/7 false positive | tab file + `personnel-flag-calculator.ts` | pending |

---

## Critical decisions

1. **Data source:** SMIT-OS internal only. Bỏ mọi Jira/Atlassian. (Jira removed in f82a1a0.)
2. **Quarter cutoff:** User-configurable. Admin set custom start month/day → derive Q1-Q4 từ đó. Default = calendar (Q1 Jan).
3. **Threshold recalibration:** 7/7 nhân sự trigger `needs_attention` vì rule `assessment_overdue` fire mọi người mới onboard. Fix:
   - Skip rule `assessment_overdue` nếu personnel onboard < 4 tuần
   - Skip rule `low_attendance` nếu `businessDays < 5` trong month
   - "Mới onboard" status mới: `onboarding` (gray) thay cho needs_attention
4. **v4 contract:** Tất cả section dark gradient card `rounded-3xl`, accent `var(--brand-500)` OKLCH, Suspense skeleton, no solid orange (cite docs/ui-design-contract.md §3, §5)

---

## Architecture

```
Tab Personnel (executive/dashboard)
├─ <TeamPulseStrip />           ← Phase 2 — 4 KPI: avg score, evaluated %, attention count, QoQ delta
├─ <SkillMovement />            ← Phase 3 — radar overlay Q-2/Q-1/current + top 3 movers list
└─ <AttentionInbox />           ← Phase 4 — sortable feed: latest flag / lowest score / missing eval
```

**Backend:** 1 aggregate endpoint `GET /api/personnel/dashboard?quarter=2026-Q2` trả về `{ pulse, skillMovement, attentionItems }` để FE chỉ fetch 1 lần. Cache 5min (giống flag calculator).

**Quarter resolver:** New `server/lib/quarter-config.ts` đọc setting (default calendar). Tất cả hiện hữu `currentQuarter()` trong flag-calculator chuyển sang dùng resolver này.

---

## Out of scope (intentionally)

- ❌ Jira/Atlassian integration (removed)
- ❌ Real-time workload từ external task system — defer
- ❌ Per-personnel drilldown trong tab (đã có `/personnel/:id` page)
- ❌ Export/print view — không request

---

## Open questions

1. Settings UI cho quarter config — Phase 1 chỉ DB seed default, UI hold đến khi cần (YAGNI). OK?
2. Top movers: rank theo absolute Δ score hay relative %? Đề xuất absolute (1-5 scale, Δ ≥ 1 có nghĩa).
3. Attention Inbox có cần "dismiss"/snooze không? Đề xuất KHÔNG ở v1 — derived view, không persist state.
