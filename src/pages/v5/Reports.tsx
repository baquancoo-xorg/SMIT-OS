import { useMemo, useState } from 'react';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { DateRangePicker } from '../../components/ui/date-range-picker';
import { PageSectionStack } from '../../components/ui/page-section-stack';
import { PageToolbar } from '../../components/ui/page-toolbar';
import type { DateRange } from '../../components/ui/date-range-picker';
import { useOverviewAll } from '../../hooks/use-overview-data';
import {
  ReportsExecutionSection,
  ReportsGrowthSection,
  ReportsOverviewSection,
} from '../../components/workspace/intelligence';

function initialRange(): DateRange {
  const now = new Date();
  return {
    from: startOfMonth(now),
    to: endOfMonth(now),
  };
}

function toApiDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function previousRange(range: DateRange) {
  return {
    previousFrom: toApiDate(startOfMonth(subMonths(range.from, 1))),
    previousTo: toApiDate(endOfMonth(subMonths(range.to, 1))),
  };
}

export default function Reports() {
  const [dateValue, setDateValue] = useState<DateRange>(() => initialRange());
  const range = useMemo(
    () => ({
      from: toApiDate(dateValue.from),
      to: toApiDate(dateValue.to),
      ...previousRange(dateValue),
    }),
    [dateValue],
  );
  const query = useOverviewAll(range);

  return (
    // ui-canon-ok: print media uses white for printer output
    <PageSectionStack className="min-h-full gap-6 print:bg-white print:text-black">
      <PageToolbar
        className="print:hidden"
        right={
          <>
            <Button variant="primary" size="sm" className="h-8 text-[length:var(--text-body-sm)]" iconLeft={<Download />} onClick={() => window.print()}>Export Report</Button>
            <DateRangePicker value={dateValue} onChange={setDateValue} size="sm" />
          </>
        }
      />

      <ReportsOverviewSection data={query.data} isLoading={query.isLoading} error={query.error} />
      <ReportsGrowthSection data={query.data} />
      <ReportsExecutionSection />
    </PageSectionStack>
  );
}
