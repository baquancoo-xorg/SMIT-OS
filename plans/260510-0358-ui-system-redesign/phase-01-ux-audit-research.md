# Phase 01 — UX Audit & Research

## Context Links
- Parent plan: [`plan.md`](./plan.md)
- Dependencies: none

## Overview

| Field | Value |
|---|---|
| Date | 2026-05-10 |
| Priority | P2 |
| Effort | 1 tuần |
| Status | **completed (2026-05-10)** |
| Completed by | `/ck:cook` session 2026-05-10 16:44 (4 parallel researcher subagents + synthesis) |

UX audit toàn bộ 8 pages + layout components để identify pain points, drift, friction. Output: actionable insights document làm input cho Phase 2 design tokens và Phase 3 mockup.

## Key Insights

- KHÔNG được skip phase này — design without research = đoán mò
- PostHog đã có session replay → leverage để xem real user behavior
- 8 pages khác nhau về domain → mỗi page audit riêng + cross-page consistency audit
- Audit không chỉ visual mà cả: information architecture, navigation flow, mobile experience, accessibility, performance

## Requirements

### Functional

- Audit doc cho mỗi page: layout structure, visual issues, UX friction, mobile broken-spots, performance issues
- Heuristic evaluation theo 10 Nielsen heuristics (apply selective)
- Heatmap + session replay analysis từ PostHog (top 5 pages by traffic)
- Cross-page consistency report (drift inventory)
- Top 10 actionable insights (priority sorted)

### Optional (bonus)
- 3-5 user interviews (30 phút mỗi user) — leadership + member
- Mobile usability test (real device, 5 task scenarios)

## Implementation Steps

1. **Setup audit tooling**:
   - Activate `ui-ux-pro-max` skill cho design intelligence
   - Activate `chrome-devtools` skill cho automated screenshots + Lighthouse
   - PostHog session replay access

2. **Per-page audit** (1 page/0.5 day = 4 days):
   - Screenshot full page (desktop + mobile 375px)
   - List visual drift vs OKRs (font sizes, border radius, padding, colors)
   - List UX friction (extra clicks, form errors, missing feedback, loading states)
   - Lighthouse: Performance, Accessibility, Best Practices, SEO
   - PostHog session replay: 5-10 sessions per page → note frustration signals

3. **Cross-page consistency audit** (0.5 day):
   - Header pattern variants (currently 8 different headers)
   - Button styles (count variants)
   - Card patterns (glass vs raised vs flat)
   - Spacing rhythm
   - Color usage drift
   - Animation consistency

4. **Heuristic evaluation** (0.5 day):
   - Apply Nielsen 10 heuristics selectively (visibility of status, error prevention, recognition, flexibility, aesthetic, help)
   - Severity rating: Critical / Major / Minor

5. **Optional user interviews** (1-1.5 day):
   - 3-5 user (mix Admin + Member)
   - 30 phút mỗi: walk-through tasks, observe pain points, ask "what's confusing?"
   - Record (with consent) for review

6. **Synthesize findings** (1 day):
   - Top 10 actionable insights (prioritized by impact × frequency)
   - Per-page findings doc
   - Cross-page drift inventory
   - Mobile-specific issues
   - Decisions needed (e.g., "current breadcrumb pattern: keep or rethink?")

## Output Files

```
plans/260510-0358-ui-system-redesign/reports/
├── ux-audit-page-{name}.md       (8 files, 1 per page)
├── ux-audit-cross-page-drift.md
├── ux-audit-heuristic-eval.md
├── ux-audit-mobile.md
├── ux-research-interviews.md     (nếu có user interviews)
└── ux-audit-summary-top10.md     (input for Phase 2-3)
```

## Todo List

- [x] Setup audit tooling (skills inventory, codebase metrics baseline)
- [x] Audit page 1: Dashboard — `reports/ux-audit-page-dashboard.md`
- [x] Audit page 2: OKRs — `reports/ux-audit-page-okrs.md`
- [x] Audit page 3: DailySync — `reports/ux-audit-page-daily-sync.md`
- [x] Audit page 4: WeeklyCheckin — `reports/ux-audit-page-weekly-checkin.md`
- [x] Audit page 5: LeadTracker — `reports/ux-audit-page-lead-tracker.md`
- [x] Audit page 6: MediaTracker — `reports/ux-audit-page-media-tracker.md`
- [x] Audit page 7: AdsTracker — `reports/ux-audit-page-ads-tracker.md`
- [x] Audit page 8: Settings (incl 5 sub-tabs) — `reports/ux-audit-page-settings.md`
- [x] Audit page 9: Profile — `reports/ux-audit-page-profile.md`
- [x] Audit page 10: LoginPage — `reports/ux-audit-page-login.md`
- [x] Audit Layout (AppLayout/Header/Sidebar/NotificationCenter/OkrCycleCountdown) — `reports/ux-audit-layout.md`
- [x] Cross-page consistency audit — `reports/ux-audit-cross-page-drift.md`
- [x] Heuristic eval doc (Nielsen 10) — `reports/ux-audit-heuristic-eval.md`
- [ ] (Optional) User interviews — **DEFERRED** (per Resolved Decisions: KHÔNG phỏng vấn user)
- [x] Synthesize Top 10 insights doc — `reports/ux-audit-summary-top10.md`
- [ ] **User review + sign-off** — Pending (gate cho Phase 2)
- [ ] PostHog session replay deep-dive — **DEFERRED to Phase 2 kickoff** (cần admin session access)
- [ ] Lighthouse audit — **DEFERRED to Phase 2 kickoff** (cần dev server running)

## Success Criteria

- [ ] Mỗi page có audit doc riêng với screenshots + issue list
- [ ] Top 10 insights actionable (không generic, mỗi insight có "why" + "suggested fix")
- [ ] Cross-page drift inventory đếm số (không cảm tính)
- [ ] User sign-off audit summary trước khi start Phase 2

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Audit nhanh và shallow → miss pain points | 🟡 Medium | 0.5 day/page là tối thiểu, không rút ngắn |
| User không có thời gian interview | 🟢 Low | Skip optional, vẫn có heuristic eval + replay |
| PostHog session replay không đủ data | 🟢 Low | Fallback heuristic eval + manual walkthrough |
| Findings quá nhiều → overwhelm Phase 2 | 🟡 Medium | Top 10 prioritized, defer rest sang post-MVP |

## Security Considerations

- User interview recordings: store secure, delete sau plan ship
- PostHog replay: KHÔNG share session URL chứa PII ra ngoài team

## Next Steps

- Phase 2: Design System Foundation — dùng audit findings làm input
