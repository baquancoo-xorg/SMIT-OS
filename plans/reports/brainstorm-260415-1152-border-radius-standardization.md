# Brainstorm Report: Border-Radius Standardization

## Problem Statement
SMIT-OS project có **inconsistent border-radius** across 41+ files với các patterns:
- `rounded-full`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- Arbitrary values: `rounded-[32px]`, `rounded-[40px]`

Yêu cầu: Thống nhất bo góc theo quy tắc:
- **Action elements** (buttons, filters, badges): capsule
- **Container elements** (inputs, dropdowns, cards, modals): đồng bộ

---

## Final Design Decision

### CSS Tokens
```css
@theme {
  --radius-action: 9999px;    /* capsule - buttons, badges, chips, filters */
  --radius-container: 3rem;   /* 48px - inputs, dropdowns, cards, modals */
  --radius-sm: 0.75rem;       /* 12px - small decorative elements */
}
```

### Component Standards

| Component Category | Target | Tailwind Class |
|-------------------|--------|----------------|
| All Buttons | capsule | `rounded-full` |
| Inputs | 48px | `rounded-3xl` |
| Dropdowns | 48px | `rounded-3xl` |
| Cards | 48px | `rounded-3xl` |
| Modals | 48px | `rounded-3xl` |
| Badges/Chips | capsule | `rounded-full` |
| Filter buttons | capsule | `rounded-full` |

---

## Implementation Scope

### Files to Modify (~35 files)

**CSS Configuration:**
- `src/index.css`

**Core UI Components (`src/components/ui/`):**
- `Button.tsx` - all sizes → `rounded-full`
- `Input.tsx` - `rounded-2xl` → `rounded-3xl`
- `CustomSelect.tsx` - button + dropdown → `rounded-3xl`
- `CustomFilter.tsx` - dropdown → `rounded-3xl`
- `CustomDatePicker.tsx` - → `rounded-3xl`
- `Skeleton.tsx` - match new standards
- `Modal.tsx` - already `rounded-3xl` ✓

**Board Components (`src/components/board/`):**
- `TaskCard.tsx` - `rounded-[32px]` → `rounded-3xl`
- `TaskModal.tsx`
- `TaskDetailsModal.tsx`
- `TaskTableView.tsx`

**Layout Components (`src/components/layout/`):**
- `Sidebar.tsx`
- `Header.tsx`
- `DateCalendarWidget.tsx`
- `SprintContextWidget.tsx`

**Modal Components (`src/components/modals/`):**
- `WeeklyCheckinModal.tsx`
- `ReportDetailDialog.tsx` - `rounded-[40px]` → `rounded-3xl`

**Daily Report (`src/components/daily-report/`):**
- `DailyReportBase.tsx`
- `PMDashboard.tsx`
- `TechDailyForm.tsx`
- `SaleDailyForm.tsx`
- `MarketingDailyForm.tsx`
- `MediaDailyForm.tsx`
- `components/TaskStatusCard.tsx`
- `components/BlockerCard.tsx`
- `components/TodayPlanCard.tsx`

**Pages (`src/pages/`):**
- `PMDashboard.tsx`
- `TechBoard.tsx`
- `SaleBoard.tsx`
- `MediaBoard.tsx`
- `MarketingBoard.tsx`
- `ProductBacklog.tsx`
- `LoginPage.tsx`
- `Profile.tsx`

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing layouts | Medium | Test each page after changes |
| Calendar/DatePicker distortion | Low | Special handling for calendar cells |
| Button text overflow | Low | Test with long text labels |
| Mobile responsiveness | Medium | Check on mobile viewport |

---

## Success Criteria

- [ ] All buttons use `rounded-full`
- [ ] All inputs/dropdowns use `rounded-3xl`
- [ ] All cards use `rounded-3xl`
- [ ] All modals use `rounded-3xl`
- [ ] No arbitrary values (`rounded-[Xpx]`) remaining
- [ ] Visual consistency across all pages
- [ ] No layout breaking on mobile

---

## Next Steps

Create implementation plan with phases:
1. **Phase 1**: Update CSS tokens
2. **Phase 2**: Update core UI components
3. **Phase 3**: Update board components
4. **Phase 4**: Update layout & modal components
5. **Phase 5**: Update daily-report components
6. **Phase 6**: Update pages
7. **Phase 7**: Testing & polish
