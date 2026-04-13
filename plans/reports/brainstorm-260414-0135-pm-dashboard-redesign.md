# PM Dashboard Redesign - Brainstorm Report

**Date:** 2026-04-14
**Status:** Approved
**Target:** PM/Manager users

---

## Problem Statement

Current PMDashboard page has:
- Inconsistent card styling (yellow bg for Bottleneck)
- Pie chart with overlapping labels, hard to read
- Missing metrics: Sprint countdown, Weekly activity, Report status
- Department chart empty when no L2 data
- Layout not balanced (60/40 split)

---

## Requirements

1. **Target Users:** PM/Manager only
2. **Metrics Focus:** Balanced mix (OKRs + Sprint + Team)
3. **Style:** Match existing project design system
4. **Charts:** Replace Pie with Progress bars, Add Velocity line chart

---

## Approved Design

### Layout: 3-Tier Structure

```
Tier 1: 6 metric cards (3x2 grid)
Tier 2: 2 chart panels (50/50 split)
Tier 3: 2 action panels (50/50 split)
```

### Tier 1: Top Metrics (6 Cards)

| # | Card | Data Source | Display |
|---|------|-------------|---------|
| 1 | Company OKRs | L1 objectives avg % | Progress bar + percentage badge |
| 2 | Sprint Countdown | Current sprint endDate | Days left + progress bar |
| 3 | Flow Efficiency | Done/Total workItems | Percentage + green bar |
| 4 | Active Blockers | Urgent + Todo/InProgress count | Count badge (red if > 0) |
| 5 | This Week Activity | Tasks created/completed in 7 days | Two numbers (created/completed) |
| 6 | Report Status | Weekly reports submitted/total | Fraction display |

### Tier 2: Charts (50/50)

**Left Panel - Department & Status:**
- Horizontal bar chart: Department OKRs progress (Tech, Sale, Marketing, Media)
- Below: 4 stacked progress bars showing status breakdown (Todo/InProgress/Review/Done)

**Right Panel - Velocity:**
- Line chart: Tasks completed per week (last 4 weeks)
- Shows trend over time for PM velocity tracking

### Tier 3: Action Panels (50/50)

**Left - Needs PM Attention:**
- Keep existing design
- List urgent items with Ping button
- Max 5 items, scrollable

**Right - Critical Deadlines:**
- Sprint deadline countdown with progress
- OKRs at risk (progress < 30%) with color coding

---

## Style Guidelines

### Cards
- All use `rounded-[40px]`
- Background: `bg-white`
- Border: `border border-outline-variant/10`
- Shadow: `shadow-sm`
- **No colored backgrounds** (remove yellow bg from Bottleneck)

### Colors (Semantic)
- Primary (#0059b6): Progress, active states
- Tertiary (#006b1f): Done, success
- Error (#b31b25): Blockers, urgent
- Secondary (#a03a0f): Warnings

### Typography
- Labels: `text-[10px] font-black text-slate-400 uppercase tracking-widest`
- Values: `text-2xl font-black font-headline`
- Section titles: `text-lg font-black font-headline`

---

## Wireframe

```
┌─────────────────────────────────────────────────────────────────┐
│  Project Management Control Panel            Last updated: 1:30 │
├───────────┬───────────┬───────────┬───────────┬───────────┬─────┤
│ Company   │ Sprint    │ Flow      │ Active    │ This Week │Report│
│ OKRs 45%  │ 5 days    │ 24%       │ 1 Blocked │ +12 / ✓8  │ 3/5 │
│ ████░░░░░ │ ████████░ │ ██░░░░░░░ │ 🔴        │           │     │
├───────────┴───────────┴───────────┴───────────┴───────────┴─────┤
│  ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│  │ Department Progress      │  │ Weekly Velocity              │ │
│  │ Tech     ████████░░ 80%  │  │        Line chart            │ │
│  │ Sale     ██████░░░░ 60%  │  │   ┌────┐    ┌────┐           │ │
│  │ Marketing████░░░░░░ 40%  │  │───┴────┴────┴────┴────────── │ │
│  │ Media    ██░░░░░░░░ 20%  │  │  W1   W2   W3   W4   Now     │ │
│  │                          │  └──────────────────────────────┘ │
│  │ Status Breakdown         │                                   │
│  │ Todo:      ████ 13       │                                   │
│  │ In Prog:   ████████ 45%  │                                   │
│  │ Review:    ███ 23%       │                                   │
│  │ Done:      █████ 32%     │                                   │
│  └──────────────────────────┘                                   │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│  │ Needs PM Attention    4  │  │ Critical Deadlines           │ │
│  │ • Task 1         PING    │  │ Sprint ends in 5 days 40%    │ │
│  │ • Task 2         PING    │  │ OKRs at Risk:                │ │
│  │ • Task 3         PING    │  │ • Objective A (15%) 🔴       │ │
│  └──────────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Considerations

### Data Requirements
- Need Sprint model data (current sprint, dates)
- Need WeeklyReport model for report status
- Need WorkItem createdAt for activity metrics
- Need historical data for velocity chart (aggregate by week)

### API Changes
- May need new endpoint for weekly velocity aggregation
- Or compute client-side from existing work-items data

### Risks
- Velocity chart requires sufficient historical data
- Sprint countdown requires active sprint in DB

---

## Success Criteria

1. All 6 metric cards display correct data
2. Charts render with project color scheme
3. Consistent styling across all components
4. Responsive layout works on mobile/tablet
5. Performance: <100ms render time

---

## Files to Modify

- `src/pages/PMDashboard.tsx` - Main redesign

---

**Next Step:** Create implementation plan with `/ck:plan`
