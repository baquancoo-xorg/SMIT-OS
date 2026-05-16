---
title: "Personnel Profile System"
description: "360° profile system: skills + personality + numerology + bát tự + live Jira/SMIT-OS"
status: pending
priority: P2
effort: 6w
branch: main
tags: [feature, personnel, profile, skills, personality, jira, smitos]
created: 2026-05-16
---

# Personnel Profile System — Implementation Plan

## Context

- **Spec:** [docs/personnel-profile-feature.md](../../docs/personnel-profile-feature.md)
- **Brainstorm:** [reports/brainstorm-260516-2223-personnel-profile.md](../reports/brainstorm-260516-2223-personnel-profile.md)
- **UI contract:** [docs/ui-design-contract.md](../../docs/ui-design-contract.md)

## Goal

Số hoá capability + tính cách + innate profile + live performance data cho 1-5 nhân sự, build sẵn cho scale 50+.

## Locked Decisions

- Cache: in-process LRU 5min
- Skill storage: NORMALIZED (Skill + SkillAssessment + SkillScore)
- Jira mapping: `User.jiraAccountId` + MCP email resolver
- Retention: soft-delete + cron 2y
- Personality: Big Five + DISC (Natural only)
- Bát tự: VN labels only (Giáp Tý)
- No email reminders
- File <200 LOC, kebab-case

## Phases

| # | Phase | Status | Effort | File |
|---|-------|--------|--------|------|
| 1 | Core Profile (schema + CRUD + Zone A + skill assessment) | pending | 2w | [phase-01-core-profile.md](phase-01-core-profile.md) |
| 2 | Personality + Innate (Big Five + DISC + Zone B + manager overlay) | pending | 2w | [phase-02-personality-innate.md](phase-02-personality-innate.md) |
| 3 | Live Integration + Dashboard (Jira + SMIT-OS + flags + dashboard tab) | pending | 2w | [phase-03-live-integration-dashboard.md](phase-03-live-integration-dashboard.md) |

## Cross-cutting

- Access control middleware on all `/api/personnel/*` routes (admin or own)
- Shared types: `server/types/personnel.types.ts`
- Suspense + Skeleton per Zone (UI contract requirement)
- Real DB, no mocks (CLAUDE.md)
- Compile check after each file
- Chart tokens: `chartColors.series`, no hex hardcode
- CTA pattern: dark gradient + orange beam (UI contract rule, no solid orange)

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- Manual smoke per phase: golden path + 1 edge case per Zone

## Open Questions

- `numeroljs` maintained status (fallback: custom impl ~150 LOC)
- DISC VN translation source (custom write 24 × 4 words)
- Mini-radar virtualization needed? (5 users = no; >50 = yes — defer)
- Sidebar Acquisition group capacity với thêm Personnel
