import { useMemo, useState } from 'react';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { Download } from 'lucide-react';
import { DateRangePicker, PageHeader, Button } from '../../components/v5/ui';
import type { DateRange } from '../../components/v5/ui';
import { useOverviewAll } from '../../hooks/use-overview-data';
import {
  ReportsExecutionSection,
  ReportsGrowthSection,
  ReportsOverviewSection,
} from '../../components/v5/intelligence';

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
    <div className="flex min-h-full flex-col gap-6 print:bg-white print:text-black">
      <PageHeader
        breadcrumb={[{ label: 'Intelligence' }, { label: 'Reports' }]}
        title="Executive "
        accent="Intelligence"
        description="Cross-workspace snapshot từ dashboard, growth và execution signals."
        actions={
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <DateRangePicker value={dateValue} onChange={setDateValue} size="sm" />
            <Button variant="primary" size="sm" iconLeft={<Download />} onClick={() => window.print()}>
              Export
            </Button>
          </div>
        }
      />

      <ReportsOverviewSection data={query.data} isLoading={query.isLoading} error={query.error} />
      <ReportsGrowthSection data={query.data} />
      <ReportsExecutionSection />
    </div>
  );
}
