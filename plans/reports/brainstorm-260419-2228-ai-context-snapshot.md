# Brainstorm Report: AI Context Snapshot File

**Date**: 2026-04-19  
**Purpose**: Thiết kế file markdown tổng hợp dữ liệu SMIT OS cho AI PM assistant

---

## Problem Statement

Cần tổng hợp tất cả dữ liệu SMIT OS (OKRs, tasks, weekly reports) thành 1 file markdown để AI có thể:
- Nắm bắt context dự án nhanh chóng
- Track tiến độ và phát hiện rủi ro
- Đề xuất quyết định cho PM

## Data Analysis

### Existing Data Sources

**Database Tables:**
- `Objective`: 14 records (BOD: 4, Marketing: 3, Media: 2, Sale: 2, Tech: 3)
- `KeyResult`: 39 records với targets và progress
- `WorkItem`: 28+ records (Epics, Deals, Tasks)
- `Sprint`: 7 sprints planned (current: Sprint 2)
- `OkrCycle`: Q2/2026 (01/04 - 30/06)

**Weekly Reports (docs/):**
- Weekly_Reports_Tuần_1_Sprint_1.md
- Weekly_Reports_Tuần_2_Sprint_1.md
- Weekly_Reports_Tuần_1_Sprint_2.md

### Key Metrics From Data

| Team | Confidence | Key Blocker |
|------|------------|-------------|
| Tech | 8/10 | AI Code Review delay |
| Marketing | 3/10 | Website delay → Tracking stuck |
| Media | 7/10 | Waiting UGC Brief from Mkt |
| Sale | 9/10 | Deal Nelly chờ tính năng Quản lý Page |

**Revenue Progress:**
- Target: 4.5B VND
- Deal Nelly: 500B potential (pending)
- First deal: 45.12M (Trust Mind Agency)

## Agreed Design

### File Location
`docs/ai-context-snapshot.md`

### Data Sources
- Weekly Reports (qualitative insights, blockers)
- Database (real-time OKRs, KRs, tasks)

### File Structure

```markdown
# SMIT OS Project Context Snapshot
> Generated: {date} | OKR Cycle: Q2/2026 | Sprint: {current}

## Executive Summary
- Overall health, revenue progress, critical alerts

## 1. OKRs Overview (Company Level)
- 4 BOD Objectives + 13 KRs
- Targets and current progress

## 2. Team Status

### Tech&Product
- Leader: Nguyễn Thái Phong
- Confidence: X/10
- Objectives (3), KRs (9)
- Active tasks, blockers

### Marketing
- Leader: Hà Canh
- Confidence: X/10
- Objectives (3), KRs (6)
- Campaigns, MQL metrics

### Media
- Leader: Đoàn Thanh Long
- Confidence: X/10
- Objectives (2), KRs (5)
- Production status

### Sale
- Leader: Nguyễn Quân (PM)
- Confidence: X/10
- Objectives (2), KRs (6)
- Pipeline, deals

## 3. Weekly Reports History
### Sprint 1 - Tuần 1 (23-29/03)
### Sprint 1 - Tuần 2 (30/03-05/04)
### Sprint 2 - Tuần 1 (06-12/04)

## 4. Active Tasks
- By status: To Do, In Progress, Review, Done
- By team

## 5. Risks & Dependencies
- Critical path items
- Cross-team blockers
- Deal dependencies

## 6. Key Metrics
- Revenue: X/4.5B
- MQLs: X/2000
- Pipeline value: X
```

### Detail Level
Full detail (>5000 words) - all OKRs, KRs, tasks, reports, blockers

### Update Strategy
Static snapshot - manual regeneration when needed

## Success Criteria

1. File chứa đầy đủ OKRs, KRs với progress
2. Tasks được nhóm theo team và status
3. Weekly reports được tóm tắt highlights
4. Blockers và dependencies rõ ràng
5. Metrics quan trọng dễ scan
6. AI PM có thể detect risks từ data

## Implementation Notes

- Query database cho real-time OKRs/Tasks
- Parse weekly report files cho insights
- Format markdown clean cho AI readability
- Estimate: 5000-8000 words

---

**Status:** DESIGN APPROVED  
**Next:** Implementation via /ck:plan
