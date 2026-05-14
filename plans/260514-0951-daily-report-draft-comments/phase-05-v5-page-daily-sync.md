# Phase 05 — v5 Page DailySync (replace re-export)

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [phase-04-v5-components.md](phase-04-v5-components.md)
- Reference pattern: `src/pages/v5/AdsTracker.tsx`, `src/pages/v5/LeadTracker.tsx`
- App.tsx route: line 59 `<Route path="/daily-sync" element={<DailySync />} />` (đã có, không đụng)

## Overview
- **Date:** 2026-05-14
- **Priority:** P1
- **Description:** Replace `src/pages/v5/DailySync.tsx` (1-line re-export) bằng page v5 đầy đủ, theo pattern AdsTracker.
- **Implementation status:** pending
- **Review status:** pending

## Key Insights
- App.tsx route đã trỏ `/daily-sync` → component import từ `src/pages/v5/DailySync.tsx`. Replace nội dung file → tự pick up.
- Pattern v5: `useAuth` → `currentUser.isAdmin`, `useSearchParams` cho tab state, `useMemo` cho params.
- Tab "Đội nhóm" chỉ visible cho admin.
- Reuse hooks query daily reports (đã có hoặc cần tạo nhỏ; check existing trước implement).

## Requirements
- Functional:
  - Tab "Hôm nay": preview report hôm nay nếu có, CTA "Báo cáo hôm nay" nếu chưa nộp
  - Tab "Đội nhóm" (admin only): table list reports hôm nay của all users
  - Tab "Lịch sử": table list reports past 30 days của bản thân (hoặc all nếu admin)
  - Click row → mở `DailyReportDetailModal`
  - CTA mở `DailyReportFormDialog`
- Non-functional: Tab state persist trong URL search params (`?tab=team`)

## Architecture

### File: `src/pages/v5/DailySync.tsx` (~180 LOC, REPLACE existing 1-line re-export)

```tsx
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarCheck, Users, History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, PageHeader, TabPill, EmptyState, Skeleton } from '../../components/v5/ui';
import type { TabPillItem } from '../../components/v5/ui';
import { DailyReportFormDialog } from '../../components/v5/execution/daily-report-form-dialog';
import { DailyReportDetailModal } from '../../components/v5/execution/daily-report-detail-modal';
// + hooks query daily reports (reuse existing or thin wrapper)

type Tab = 'today' | 'team' | 'history';

const buildTabs = (isAdmin: boolean): TabPillItem<Tab>[] => [
  { value: 'today', label: 'Hôm nay', icon: <CalendarCheck /> },
  ...(isAdmin ? [{ value: 'team' as const, label: 'Đội nhóm', icon: <Users /> }] : []),
  { value: 'history', label: 'Lịch sử', icon: <History /> },
];

export default function DailySyncV5() {
  const { currentUser } = useAuth();
  const isAdmin = !!currentUser?.isAdmin;
  const today = format(new Date(), 'yyyy-MM-dd');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) || 'today';
  const [formOpen, setFormOpen] = useState(false);
  const [detailReport, setDetailReport] = useState<DailyReport | null>(null);
  const tabs = useMemo(() => buildTabs(isAdmin), [isAdmin]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Sync"
        subtitle="Báo cáo & trao đổi tiến độ hằng ngày"
        action={
          <Button variant="primary" onClick={() => setFormOpen(true)}>
            Báo cáo hôm nay
          </Button>
        }
      />
      <TabPill items={tabs} value={activeTab} onChange={(v) => setSearchParams({ tab: v })} />

      {activeTab === 'today' && <TodayTab today={today} onOpenForm={() => setFormOpen(true)} onOpenDetail={setDetailReport} />}
      {activeTab === 'team' && isAdmin && <TeamTab today={today} onOpenDetail={setDetailReport} />}
      {activeTab === 'history' && <HistoryTab isAdmin={isAdmin} onOpenDetail={setDetailReport} />}

      <DailyReportFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        userId={currentUser?.id ?? ''}
        reportDate={today}
        onSubmitted={() => setFormOpen(false)}
      />
      <DailyReportDetailModal
        open={!!detailReport}
        onClose={() => setDetailReport(null)}
        report={detailReport}
      />
    </div>
  );
}
```

Sub-components `TodayTab`, `TeamTab`, `HistoryTab` định nghĩa inline ngắn (~30-40 LOC mỗi cái) hoặc extract ra file riêng nếu vượt 200 LOC tổng.

## Related code files
- **Replace:** `src/pages/v5/DailySync.tsx` (1 LOC → ~180 LOC)
- **No touch:** `src/App.tsx` (route đã có)
- **Reuse:** v5 primitives, Phase 4 components, Phase 3 hooks
- **Check existing:** hook query daily reports (e.g. `use-daily-reports.ts`?) — nếu chưa có, viết thin wrapper trong file này hoặc tạo `src/hooks/use-daily-reports.ts` (~50 LOC)

## Implementation Steps
1. Grep `useDailyReport` / `use-daily-report` để check hook query đã tồn tại chưa. Nếu có, reuse; nếu không, tạo mới `src/hooks/use-daily-reports.ts` (`useTodayReportQuery`, `useTeamTodayReportsQuery`, `useMyReportsHistoryQuery`).
2. Replace `src/pages/v5/DailySync.tsx` với code skeleton ở trên.
3. Implement `TodayTab`:
   - Query report của user cho `today`.
   - Nếu chưa có → `<EmptyState>Bạn chưa báo cáo hôm nay.</EmptyState>` + CTA gọi `onOpenForm`.
   - Nếu có → `<Card>` preview ngắn + nút "Xem chi tiết" gọi `onOpenDetail`.
4. Implement `TeamTab` (admin only):
   - Reuse `DataTable` v5 (`src/components/v5/ui/data-table.tsx`).
   - Columns: User | Status | Submitted At | Actions.
   - Row click → `onOpenDetail`.
5. Implement `HistoryTab`:
   - Date range default 30 ngày qua.
   - DataTable similar to TeamTab nhưng filter theo user (admin có toggle "All users").
6. URL state: tab name trong `?tab=` param.
7. Test manual: navigate `/daily-sync` → 3 tab work, form mở/đóng OK, detail modal mở/đóng OK.
8. Lint + typecheck.

## Todo list
- [ ] Check/create `src/hooks/use-daily-reports.ts` (3 query hooks nếu cần)
- [ ] Replace `src/pages/v5/DailySync.tsx` với page mới
- [ ] Implement `TodayTab` sub-component
- [ ] Implement `TeamTab` sub-component (admin only)
- [ ] Implement `HistoryTab` sub-component
- [ ] URL search param tab state
- [ ] Wire form dialog + detail modal
- [ ] Mỗi file <200 LOC (extract nếu cần)
- [ ] Manual test 3 tabs + form + detail
- [ ] `npx tsc --noEmit` pass

## Success Criteria
- `/daily-sync` load page v5 mới, không còn dùng `src/pages/DailySync.tsx` v1.
- 3 tabs hoạt động + URL persist khi reload.
- Admin thấy tab "Đội nhóm"; non-admin không thấy.
- Click "Báo cáo hôm nay" → form dialog mở.
- Click row → detail modal mở.
- File DailySync.tsx <200 LOC (extract sub-tab files nếu cần).

## Risk Assessment
| Risk | Mức | Mitigation |
|---|---|---|
| Hook query DailyReport đã tồn tại + xung đột | Trung bình | Grep trước implement, reuse nếu có |
| Page >200 LOC | Cao | Extract `today-tab.tsx`, `team-tab.tsx`, `history-tab.tsx` thành file riêng |
| Performance khi list nhiều reports | Thấp | Phân trang (limit 30) hoặc virtualize sau nếu cần |

## Security Considerations
- Tab "Đội nhóm" chỉ render khi `isAdmin = true`; server cũng filter (defense in depth — Phase 2 endpoint đã check).
- URL `?tab=team` nếu non-admin → fallback về tab default `today`.

## Next steps
- → Phase 6: Integration testing + UI compliance audit
